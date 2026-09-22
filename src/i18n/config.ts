export const locales = ["pt", "en", "es", "fr", "it", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

/** BCP-47 tags used for <html lang>, hreflang and Intl formatting. */
export const localeTags: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
  fr: "fr",
  it: "it",
  de: "de",
};

export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  de: "Deutsch",
};

export const LOCALE_COOKIE = "hp_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value) && (locales as readonly string[]).includes(value as string);
}

/** Maps a country ISO code (e.g. from Hotmart) to the closest supported locale. */
export function localeFromCountry(iso: string | null | undefined): Locale | null {
  if (!iso) return null;
  const code = iso.toUpperCase();
  if (["BR", "PT", "AO", "MZ"].includes(code)) return "pt";
  if (["ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU", "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY"].includes(code)) return "es";
  if (["FR", "BE", "MC", "LU"].includes(code)) return "fr";
  if (["IT", "SM", "VA"].includes(code)) return "it";
  if (["DE", "AT", "CH", "LI"].includes(code)) return "de";
  if (["US", "GB", "CA", "AU", "NZ", "IE"].includes(code)) return "en";
  return null;
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of candidates) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
