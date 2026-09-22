"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CONSENT_EVENT, readConsentFromDocument, writeConsentToDocument } from "@/lib/consent";
import type { Dictionary } from "@/i18n/types";

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

/**
 * LGPD/GDPR cookie banner. Nothing non-essential runs until the visitor
 * chooses; "reject" is as easy as "accept". The choice is a cookie so the
 * server can read it too.
 */
export function ConsentBanner({ locale, text }: { locale: string; text: Dictionary["consent"] }) {
  // undefined during SSR/hydration → banner hidden until we know the real state.
  const decided = useSyncExternalStore(
    subscribe,
    () => readConsentFromDocument() !== null,
    () => true,
  );

  return (
    <AnimatePresence>
      {!decided ? (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={text.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-[560px] rounded-2xl border border-honey-line bg-[#1c1006]/95 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <div className="mb-1 text-[13px] font-extrabold text-honey-text">{text.title}</div>
            <p className="mb-3 text-[12.5px] leading-relaxed text-honey-text-dim">
              {text.body}{" "}
              <Link href={`/${locale}/legal/privacy`} className="underline decoration-honey-gold/50 underline-offset-2">
                {text.learnMore}
              </Link>
            </p>
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => writeConsentToDocument(true)}
                className="flex-1 rounded-xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-2.5 text-[13px] font-extrabold text-[#2a1a08]"
              >
                {text.accept}
              </button>
              <button
                type="button"
                onClick={() => writeConsentToDocument(false)}
                className="flex-1 rounded-xl border border-honey-line px-4 py-2.5 text-[13px] font-bold text-honey-text-dim"
              >
                {text.reject}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
