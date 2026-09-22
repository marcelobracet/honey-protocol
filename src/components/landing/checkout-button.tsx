"use client";

import { useMemo, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { buildCheckoutUrl, UTM_STORAGE_KEY, type UtmParams } from "@/lib/checkout";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/i18n/config";

function subscribe() {
  return () => {};
}

function readRawUtm(): string {
  try {
    return sessionStorage.getItem(UTM_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function CheckoutButton({
  locale,
  baseUrl,
  label,
  size = "lg",
  className = "",
}: {
  locale: Locale;
  baseUrl: string;
  label: string;
  size?: "md" | "lg";
  className?: string;
}) {
  // Server renders the plain link; the client swaps in the UTM-tagged one after hydration.
  const rawUtm = useSyncExternalStore(subscribe, readRawUtm, () => "");
  const href = useMemo(() => {
    let utm: UtmParams = {};
    try {
      utm = rawUtm ? (JSON.parse(rawUtm) as UtmParams) : {};
    } catch {
      utm = {};
    }
    return buildCheckoutUrl(locale, utm, baseUrl);
  }, [rawUtm, locale, baseUrl]);

  const padding = size === "lg" ? "px-6 py-4.5 text-[15px] sm:text-base" : "px-5 py-3.5 text-[14px]";

  return (
    <motion.a
      href={href}
      onClick={() => trackEvent("InitiateCheckout")}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold font-body font-extrabold uppercase tracking-[0.04em] text-[#2a1a08] shadow-[0_16px_32px_-10px_rgba(227,166,62,0.55)] transition-shadow hover:shadow-[0_20px_40px_-10px_rgba(227,166,62,0.7)] ${padding} ${className}`}
    >
      {label}
    </motion.a>
  );
}
