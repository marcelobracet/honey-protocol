"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { CheckoutButton } from "./checkout-button";

const KEY = "hp_exit_shown";

/**
 * Desktop exit-intent: when the cursor leaves through the top of the window
 * (toward the tab bar / back button), show a one-time guarantee reminder.
 * Touch devices are skipped; the sticky bar covers them.
 */
export function ExitIntent({
  locale,
  checkoutUrl,
  text,
}: {
  locale: Locale;
  checkoutUrl: string;
  text: { title: string; body: string; cta: string; dismiss: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(KEY) === "1";
    } catch {
      // ignore
    }
    if (shown) return;
    const armAt = Date.now() + 8000; // ignore the first seconds on the page
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0 || Date.now() < armAt || shown) return;
      shown = true;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        // ignore
      }
      setOpen(true);
    };
    document.addEventListener("mouseout", onLeave);
    return () => document.removeEventListener("mouseout", onLeave);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-[26px] border border-honey-gold/35 bg-gradient-to-b from-honey-surface to-honey-surface-2 p-7 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="mb-3 text-[34px]">🛡️</div>
            <h2 id="exit-title" className="mb-2 font-display text-[26px] font-medium leading-tight text-honey-text">
              {text.title}
            </h2>
            <p className="mb-6 text-[14.5px] leading-relaxed text-honey-text-dim">{text.body}</p>
            <CheckoutButton locale={locale} baseUrl={checkoutUrl} label={text.cta} size="md" />
            <button type="button" onClick={() => setOpen(false)} className="mt-3 text-[12.5px] font-semibold text-honey-text-faint underline underline-offset-2">
              {text.dismiss}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
