import "server-only";

import { sql } from "@/lib/db";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { publicEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { renderLoginEmail, renderWelcomeEmail } from "@/lib/email/templates";
import { createLoginToken, type TokenKind } from "@/lib/auth/tokens";
import { normalizeEmail } from "@/lib/hotmart";

export interface GrantInput {
  email: string;
  name?: string | null;
  locale?: string | null;
  country?: string | null;
  transaction?: string | null;
  productId?: string | null;
  source?: string;
}

export interface EntitlementRow {
  id: string;
  email: string;
  status: "active" | "revoked";
  locale: string | null;
  buyer_name: string | null;
  last_link_sent_at: Date | null;
}

/** Grants (or re-activates) access for a buyer. Idempotent. */
export async function grantAccess(input: GrantInput): Promise<{ email: string; locale: Locale; isNew: boolean }> {
  const email = normalizeEmail(input.email);
  const locale: Locale = isLocale(input.locale) ? input.locale : defaultLocale;

  const rows = await sql()<{ is_new: boolean }[]>`
    insert into entitlements (email, status, source, product_id, transaction, locale, country, buyer_name, granted_at)
    values (${email}, 'active', ${input.source ?? "hotmart"}, ${input.productId ?? null}, ${input.transaction ?? null},
            ${locale}, ${input.country ?? null}, ${input.name ?? null}, now())
    on conflict (email) do update set
      status = 'active',
      product_id = coalesce(excluded.product_id, entitlements.product_id),
      transaction = coalesce(excluded.transaction, entitlements.transaction),
      locale = coalesce(excluded.locale, entitlements.locale),
      country = coalesce(excluded.country, entitlements.country),
      buyer_name = coalesce(excluded.buyer_name, entitlements.buyer_name),
      granted_at = now(),
      revoked_at = null,
      revoke_reason = null
    returning (xmax = 0) as is_new
  `;
  return { email, locale, isNew: rows[0]?.is_new ?? false };
}

export async function revokeAccess(email: string, reason: string): Promise<void> {
  await sql()`
    update entitlements
       set status = 'revoked', revoked_at = now(), revoke_reason = ${reason}
     where email = ${normalizeEmail(email)}
  `;
}

/**
 * Revokes by payment id. Stripe refund and dispute events don't reliably carry
 * the buyer's e-mail, but they do carry the PaymentIntent we stored on purchase.
 * Returns the affected e-mail, or null when no row matched.
 */
export async function revokeAccessByTransaction(transaction: string, reason: string): Promise<string | null> {
  const rows = await sql()<{ email: string }[]>`
    update entitlements
       set status = 'revoked', revoked_at = now(), revoke_reason = ${reason}
     where transaction = ${transaction}
    returning email
  `;
  return rows[0]?.email ?? null;
}

export async function getEntitlementByEmail(email: string): Promise<EntitlementRow | null> {
  const rows = await sql()<EntitlementRow[]>`
    select id, email, status, locale, buyer_name, last_link_sent_at
      from entitlements where email = ${normalizeEmail(email)} limit 1
  `;
  return rows[0] ?? null;
}

function buildConfirmUrl(token: string, locale: Locale): string {
  const url = new URL(`/${locale}/auth/confirm`, publicEnv.siteUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

/** Creates a single-use token and e-mails the localized magic link. */
export async function sendMagicLink(input: { email: string; locale: Locale; kind: TokenKind; next?: string }): Promise<void> {
  const email = normalizeEmail(input.email);
  const token = await createLoginToken(email, input.kind, input.next ?? "/app");
  const link = buildConfirmUrl(token, input.locale);
  const dict = await getDictionary(input.locale);
  const rendered = input.kind === "welcome" ? renderWelcomeEmail(dict, link) : renderLoginEmail(dict, link);
  await sendEmail({ to: email, ...rendered, senderName: dict.common.brand });
  await sql()`update entitlements set last_link_sent_at = now() where email = ${email}`;
}
