import type { Locale } from "@/i18n/config";

/** Public, non-secret configuration. Safe to read on the server or client. */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "",
  companyId: process.env.NEXT_PUBLIC_COMPANY_ID ?? "",
  companyAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "",
  guaranteeDays: Number(process.env.NEXT_PUBLIC_GUARANTEE_DAYS ?? "7"),
  // Query parameter the checkout expects the locale under. Read on the client
  // too, so it has to be NEXT_PUBLIC_. Use "xcod" when selling through Hotmart.
  checkoutLocaleParam: process.env.NEXT_PUBLIC_CHECKOUT_LOCALE_PARAM || "lang",
  // What the buyer will see on their card statement. Showing it before they
  // pay is the cheapest defence against "I don't recognise this charge".
  statementDescriptor: process.env.NEXT_PUBLIC_STATEMENT_DESCRIPTOR ?? "",
};

/** Server-only secrets. Never import this from a client component. */
export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
  hotmartHottok: process.env.HOTMART_HOTTOK ?? "",
  hotmartProductIds: (process.env.HOTMART_PRODUCT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  metaCapiToken: process.env.META_CAPI_TOKEN ?? "",
};

export function isDatabaseConfigured(): boolean {
  return Boolean(serverEnv.databaseUrl);
}

/**
 * Checkout URL per locale. `CHECKOUT_URL` is the default; `CHECKOUT_URL_EN`,
 * `CHECKOUT_URL_ES`, ... override it for a specific market (different Hotmart
 * offer, currency or checkout language).
 */
export function getCheckoutBaseUrl(locale: Locale): string {
  const specific = process.env[`CHECKOUT_URL_${locale.toUpperCase()}`];
  return specific || process.env.CHECKOUT_URL || "";
}

/** Display price per locale, e.g. PRICE_PT="R$ 27,90", PRICE_EN="$9.99". */
export function getDisplayPrice(locale: Locale): string | null {
  return process.env[`PRICE_${locale.toUpperCase()}`] || process.env.PRICE || null;
}

/** VSL video: an embed URL (YouTube/Vimeo/Vturb iframe) or a direct .mp4/.webm URL. */
export function getVslVideoUrl(locale: Locale): string {
  return process.env[`VSL_VIDEO_URL_${locale.toUpperCase()}`] || process.env.VSL_VIDEO_URL || "";
}

/** Seconds into the VSL before the checkout button appears (0 = immediately). */
export function getVslCtaDelay(): number {
  const n = Number(process.env.VSL_CTA_DELAY_SECONDS ?? "0");
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Where the Back button sends visitors on the sales page. Empty = disabled. */
export function getBackRedirectUrl(locale: Locale): string {
  return process.env[`BACK_REDIRECT_URL_${locale.toUpperCase()}`] || process.env.BACK_REDIRECT_URL || "";
}

export function getAnchorPrice(locale: Locale): string | null {
  return process.env[`ANCHOR_PRICE_${locale.toUpperCase()}`] || process.env.ANCHOR_PRICE || null;
}
