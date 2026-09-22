import type { Locale } from "@/i18n/config";
import { getCheckoutBaseUrl, publicEnv } from "@/lib/env";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;
export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export const UTM_STORAGE_KEY = "hp_utm";

/**
 * Builds the checkout URL for a locale, carrying attribution through:
 * - the locale, under the parameter name the checkout expects, so the webhook
 *   knows which language to write and e-mail in. KashPay and other Stripe
 *   front-ends usually pass unknown query parameters into the Checkout
 *   Session metadata, which `localeFromSession` reads.
 * - `utm_*` and `fbclid`, forwarded as-is.
 *
 * Hotmart names that parameter `xcod` and shows campaign data from `src` and
 * `sck` in its sales report, so those are added in that mode.
 */
export function buildCheckoutUrl(locale: Locale, utm: UtmParams = {}, base?: string, segment?: string | null): string {
  const raw = base ?? getCheckoutBaseUrl(locale);
  if (!raw) return "#";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  const localeParam = publicEnv.checkoutLocaleParam;
  url.searchParams.set(localeParam, locale);

  if (localeParam === "xcod") {
    if (utm.utm_source && !url.searchParams.has("src")) url.searchParams.set("src", utm.utm_source);
    if (utm.utm_campaign && !url.searchParams.has("sck")) url.searchParams.set("sck", utm.utm_campaign);
  }

  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) url.searchParams.set(key, value);
  }
  if (segment) url.searchParams.set("seg", segment);
  return url.toString();
}
