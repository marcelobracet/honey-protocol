"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/i18n/types";
import { LockIcon } from "../../icons";

export function SoonScreen({ text, onBackToHome }: { text: Dictionary["app"]["soon"]; onBackToHome: () => void }) {
  return (
    <div className="px-5 pb-6 pt-2">
      <div className="mb-1.5 mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">{text.eyebrow}</div>
      <h2 className="mb-4 font-display text-2xl font-medium text-honey-text">{text.title}</h2>

      <div className="grid grid-cols-2 gap-3">
        {text.items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative flex min-h-[120px] flex-col justify-end gap-1.5 overflow-hidden rounded-2xl border border-honey-line bg-honey-surface p-3.5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[rgba(36,22,9,0.55)]" />
            <LockIcon className="absolute right-3 top-3 z-10 h-3.5 w-3.5 text-honey-text-faint" />
            <div className="relative z-10 text-[26px]">{item.glyph}</div>
            <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.06em] text-honey-gold-light">{item.tag}</div>
            <div className="relative z-10 text-[12.5px] font-bold text-honey-text">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-honey-gold/40 p-4.5 text-center">
        <p className="mb-3 text-[12.5px] leading-relaxed text-honey-text-dim">{text.body}</p>
        <motion.button
          type="button"
          onClick={onBackToHome}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-3 text-[13px] font-extrabold text-[#2a1a08] shadow-[0_12px_24px_-8px_rgba(227,166,62,0.45)]"
        >
          {text.back}
        </motion.button>
      </div>
    </div>
  );
}
