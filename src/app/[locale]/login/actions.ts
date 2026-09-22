"use server";

import { isLocale, type Locale } from "@/i18n/config";
import { getEntitlementByEmail, sendMagicLink } from "@/lib/access";
import { isDatabaseConfigured } from "@/lib/env";

export type LoginResult = { status: "sent" } | { status: "error"; code: "invalid" | "tooSoon" | "generic" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_MS = 60_000;

/**
 * Sends a login link if the e-mail has an active purchase. The response is
 * the same whether or not a purchase exists, so the form can't be used to
 * check who is a customer.
 */
export async function requestLoginLink(input: { email: string; locale: string; next?: string }): Promise<LoginResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return { status: "error", code: "invalid" };
  const locale: Locale = isLocale(input.locale) ? input.locale : "pt";
  if (!isDatabaseConfigured()) return { status: "error", code: "generic" };

  try {
    const entitlement = await getEntitlementByEmail(email);
    if (!entitlement || entitlement.status !== "active") {
      // Deliberately indistinguishable from success.
      return { status: "sent" };
    }
    if (entitlement.last_link_sent_at && Date.now() - entitlement.last_link_sent_at.getTime() < RESEND_COOLDOWN_MS) {
      return { status: "error", code: "tooSoon" };
    }
    const next = input.next && input.next.startsWith("/") && !input.next.startsWith("//") ? input.next : "/app";
    await sendMagicLink({ email, locale, kind: "login", next });
    return { status: "sent" };
  } catch (err) {
    console.error("[login] failed to send link", err);
    return { status: "error", code: "generic" };
  }
}
