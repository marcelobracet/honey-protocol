import { NextRequest, NextResponse } from "next/server";
import { isAccessConfigured, verifyAccessJwt } from "@/lib/cloudflare-access";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

/**
 * Gates every request behind Cloudflare Access.
 *
 * In production, Cloudflare Access already blocks unauthenticated requests
 * before they reach Vercel — this proxy is defense-in-depth: it verifies
 * the JWT signature itself and forwards the verified identity to the app
 * via the `x-user-email` header.
 *
 * When CF_ACCESS_TEAM_DOMAIN / CF_ACCESS_AUD aren't set (e.g. local dev,
 * before Access is configured in the Cloudflare dashboard), the check is
 * skipped so `npm run dev` keeps working without extra setup.
 */
export async function proxy(request: NextRequest) {
  if (!isAccessConfigured()) {
    return NextResponse.next();
  }

  const token =
    request.headers.get("cf-access-jwt-assertion") ??
    request.cookies.get("CF_Authorization")?.value;

  if (!token) {
    return new NextResponse("Acesso não autorizado.", { status: 401 });
  }

  const identity = await verifyAccessJwt(token);
  if (!identity) {
    return new NextResponse("Sessão inválida ou expirada.", { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.set("x-user-email", identity.email);
  return NextResponse.next({ request: { headers } });
}
