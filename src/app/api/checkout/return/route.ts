import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, localePath, type Locale } from "@/i18n/config";
import { grantAccess } from "@/lib/access";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { findOrCreateUser } from "@/lib/dal";
import { sql } from "@/lib/db";
import { isDatabaseConfigured, serverEnv } from "@/lib/env";
import { LEGAL_VERSION } from "@/lib/legal";
import {
  emailFromSession,
  isStripeConfigured,
  localeFromSession,
  stripe,
  transactionFromSession,
} from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Where checkout sends the buyer back to. Point the Stripe Checkout
 * `success_url` (or KashPay's thank-you page) at:
 *
 *   https://<domain>/api/checkout/return?session_id={CHECKOUT_SESSION_ID}
 *
 * Stripe recommends fulfilling here as well as in the webhook, so the buyer
 * gets what they paid for while they are still present. We go one step
 * further and sign them in, which takes e-mail off the critical path: the
 * purchase leads straight into the app, no link to wait for.
 *
 * Safe because the session id is only meaningful once it has been read back
 * from Stripe and confirmed paid. A guessed or replayed id retrieves nothing.
 * The webhook remains the source of truth for buyers who close the tab.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sessionId = searchParams.get("session_id");
  const hinted = searchParams.get("lang");
  let locale: Locale = isLocale(hinted) ? hinted : defaultLocale;

  const back = (params = "") => NextResponse.redirect(new URL(`${localePath(locale, "/thank-you")}${params}`, request.url));

  if (!sessionId || !isStripeConfigured() || !isDatabaseConfigured()) {
    return back();
  }

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    locale = localeFromSession(session);

    // Delayed methods (boleto, bank transfer) land here before the money does.
    if (session.payment_status === "unpaid") {
      return back("?pending=1");
    }

    const email = emailFromSession(session);
    if (!email) return back();

    // Idempotent: the webhook may already have granted this exact purchase.
    const result = await grantAccess({
      email,
      name: session.customer_details?.name ?? null,
      locale,
      country: session.customer_details?.address?.country ?? null,
      transaction: transactionFromSession(session),
      productId: session.metadata?.product_id ?? null,
      source: "stripe",
    });

    const user = await findOrCreateUser(email, { name: session.customer_details?.name ?? null, locale: result.locale });
    const token = await signSession({ sub: user.id, email: user.email }, serverEnv.sessionSecret);

    const ua = request.headers.get("user-agent")?.slice(0, 300) ?? null;
    await sql()`
      insert into consents (user_id, email, kind, version, granted, locale, user_agent)
      select ${user.id}, ${user.email}, 'terms', ${LEGAL_VERSION}, true, ${result.locale}, ${ua}
      where not exists (
        select 1 from consents where user_id = ${user.id} and kind = 'terms' and version = ${LEGAL_VERSION}
      )
    `;

    locale = result.locale;
    const response = back("?ready=1");
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (err) {
    console.error("[checkout/return]", err);
    // Never strand a paying customer: fall through to the page that explains
    // how to get in, where they can request a link.
    return back();
  }
}

// Some checkout front-ends POST to the return URL instead of redirecting.
export async function POST(request: NextRequest) {
  return GET(request);
}
