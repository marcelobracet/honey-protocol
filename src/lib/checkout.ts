import type { Locale } from "@/i18n/config";
import { getCheckoutBaseUrl } from "@/lib/env";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;
export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export const UTM_STORAGE_KEY = "hp_utm";

/**
 * Builds the Hotmart checkout URL for a locale, forwarding attribution:
 * - `xcod` carries the locale so the webhook can pick the buyer's language
 * - `src` / `sck` carry campaign data (visible in Hotmart's sales report)
 * - `utm_*` are forwarded as-is
 */
export function buildCheckoutUrl(locale: Locale, utm: UtmParams = {}, base?: string): string {
  const raw = base ?? getCheckoutBaseUrl(locale);
  if (!raw) return "#";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  url.searchParams.set("xcod", locale);
  if (utm.utm_source && !url.searchParams.has("src")) url.searchParams.set("src", utm.utm_source);
  if (utm.utm_campaign && !url.searchParams.has("sck")) url.searchParams.set("sck", utm.utm_campaign);
  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
