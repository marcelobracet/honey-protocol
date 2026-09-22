"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { consumeLoginToken } from "@/lib/auth/tokens";
import { MEMBER_HINT_COOKIE, SESSION_COOKIE, memberHintCookieOptions, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { getEntitlementByEmail } from "@/lib/access";
import { findOrCreateUser } from "@/lib/dal";
import { sql } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { LEGAL_VERSION } from "@/lib/legal";

type Outcome = { kind: "ok"; next: string } | { kind: "expired" } | { kind: "blocked" } | { kind: "error" };

/**
 * Exchanges a magic-link token for a session cookie. Called by the confirm
 * page via POST (auto-submitted), so e-mail link scanners that only GET the
 * URL don't burn the single-use token.
 */
export async function confirmLogin(input: { token: string; locale: string }): Promise<void> {
  const locale: Locale = isLocale(input.locale) ? input.locale : "pt";
  const outcome = await exchange(input.token, locale);

  // redirect() throws, so it must stay outside the try/catch above.
  switch (outcome.kind) {
    case "ok":
      redirect(localePath(locale, outcome.next));
    case "blocked":
      redirect(`${localePath(locale, "/login")}?error=blocked`);
    case "error":
      redirect(`${localePath(locale, "/login")}?error=generic`);
    default:
      redirect(`${localePath(locale, "/login")}?error=expired`);
  }
}

async function exchange(token: string, locale: Locale): Promise<Outcome> {
  try {
    const consumed = await consumeLoginToken(token);
    if (!consumed) return { kind: "expired" };

    const entitlement = await getEntitlementByEmail(consumed.email);
    if (!entitlement || entitlement.status !== "active") return { kind: "blocked" };

    const user = await findOrCreateUser(consumed.email, { name: entitlement.buyer_name, locale });
    const jwt = await signSession({ sub: user.id, email: user.email }, serverEnv.sessionSecret);
    const jar = await cookies();
    jar.set(SESSION_COOKIE, jwt, sessionCookieOptions);
    jar.set(MEMBER_HINT_COOKIE, "1", memberHintCookieOptions);

    // LGPD: log acceptance of terms/privacy at first sign-in (once per version).
    const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
    await sql()`
      insert into consents (user_id, email, kind, version, granted, locale, user_agent)
      select ${user.id}, ${user.email}, 'terms', ${LEGAL_VERSION}, true, ${locale}, ${ua}
      where not exists (
        select 1 from consents where user_id = ${user.id} and kind = 'terms' and version = ${LEGAL_VERSION}
      )
    `;

    const next = consumed.nextPath.startsWith("/") && !consumed.nextPath.startsWith("//") ? consumed.nextPath : "/app";
    return { kind: "ok", next };
  } catch (err) {
    console.error("[auth/confirm]", err);
    return { kind: "error" };
  }
}
