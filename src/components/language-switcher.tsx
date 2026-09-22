"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, isLocale, localeNames, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale, label, className = "" }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function change(next: string) {
    if (!isLocale(next) || next === locale) return;
    const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.push(`/${next}${rest || ""}`);
  }

  return (
    <label className={`inline-flex items-center gap-1.5 text-[12px] font-semibold text-honey-text-faint ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden>🌐</span>
      <select
        value={locale}
        onChange={(e) => change(e.target.value)}
        aria-label={label}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-[12px] font-bold text-honey-text-dim outline-none"
      >
        {locales.map((l) => (
          <option key={l} value={l} className="bg-honey-bg text-honey-text">
            {localeNames[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
