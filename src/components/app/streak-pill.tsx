"use client";

import { motion, AnimatePresence } from "framer-motion";

export function StreakPill({ streak, startLabel, dayLabel }: { streak: number; startLabel: string; dayLabel: string }) {
  const label = streak > 0 ? dayLabel.replace("{n}", String(streak)) : startLabel;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-honey-gold/25 bg-honey-gold/10 px-3 py-1.5 text-xs font-semibold text-honey-gold-light">
      <span aria-hidden>🍯</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
