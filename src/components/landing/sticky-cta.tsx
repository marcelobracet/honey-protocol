"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { CheckoutButton } from "./checkout-button";

/**
 * Mobile sticky bar with the checkout button. Appears after the visitor
 * scrolls past the hero and hides while the pricing block is on screen
 * (so it never covers the main CTA).
 */
export function StickyCta({ locale, checkoutUrl, label, cta }: { locale: Locale; checkoutUrl: string; label: string; cta: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const pricing = document.getElementById("pricing");
    let pricingVisible = false;
    let scrolledPastHero = false;
    const update = () => setShow(scrolledPastHero && !pricingVisible);

    const onScroll = () => {
      scrolledPastHero = window.scrollY > window.innerHeight * 0.9;
      update();
    };
    const observer = pricing
      ? new IntersectionObserver(
          (entries) => {
            pricingVisible = entries.some((e) => e.isIntersecting);
            update();
          },
          { rootMargin: "0px 0px -20% 0px" },
        )
      : null;
    if (pricing && observer) observer.observe(pricing);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-honey-gold/25 bg-[#1c1006]/95 px-4 pt-3 backdrop-blur-md sm:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mb-1.5 text-center text-[11px] font-semibold text-honey-text-faint">{label}</div>
          <CheckoutButton locale={locale} baseUrl={checkoutUrl} label={cta} size="md" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
