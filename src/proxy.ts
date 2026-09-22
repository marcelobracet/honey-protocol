import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale, localePath, negotiateLocale, type Locale } from "@/i18n/config";
import { SESSION_COOKIE, sessionCookieOptions, shouldRenew, signSession, verifySession } from "@/lib/auth/session";

export const config = {
  // Everything except Next internals, static files and API route handlers.
  matcher: ["/((?!_next/|api/|icons/|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)"],
};

/** Paths (relative to the locale prefix) that require a signed-in user. */
const PROTECTED = ["/app", "/account"];

function splitLocale(pathname: string): { locale: Locale | null; rest: string } {
  const [, first = "", ...others] = pathname.split("/");
  if (isLocale(first)) {
    const rest = "/" + others.join("/");
    return { locale: first, rest: rest === "/" ? "/" : rest.replace(/\/$/, "") };
  }
  return { locale: null, rest: pathname };
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { locale, rest } = splitLocale(pathname);

  // 1. No locale prefix → redirect to the visitor's preferred locale.
  if (!locale) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    const preferred = isLocale(cookieLocale) ? cookieLocale : negotiateLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = localePath(preferred, pathname);
    url.search = search;
    return NextResponse.redirect(url);
  }

  // 2. Optimistic auth gate: verify the session JWT locally (no DB call).
  //    Pages re-check against the database and the entitlement status.
  const isProtected = PROTECTED.some((p) => rest === p || rest.startsWith(`${p}/`));
  let response: NextResponse;
  if (isProtected) {
    const secret = process.env.SESSION_SECRET ?? "";
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = localePath(locale, "/login");
      url.search = `?next=${encodeURIComponent(rest)}`;
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
      // Sliding expiry: someone who keeps using the app is never logged out,
      // which matters most for buyers who have no e-mail link to fall back on.
      if (shouldRenew(session)) {
        try {
          const renewed = await signSession({ sub: session.sub, email: session.email }, secret);
          response.cookies.set(SESSION_COOKIE, renewed, sessionCookieOptions);
        } catch {
          // Keep serving the request on the existing, still-valid token.
        }
      }
    }
  } else {
    response = NextResponse.next();
  }

  // 3. Remember the locale the visitor is browsing in.
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}
