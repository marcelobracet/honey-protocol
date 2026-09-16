"use client";

import { motion } from "framer-motion";

export function HabitRow({
  title,
  subtitle,
  done,
  onToggle,
}: {
  title: string;
  subtitle: string;
  done: boolean;
  onToggle?: () => void;
}) {
  const interactive = Boolean(onToggle);

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-2xl border border-honey-line bg-honey-surface p-3.5 ${
        interactive ? "cursor-pointer active:scale-[0.99]" : ""
      }`}
      whileTap={interactive ? { scale: 0.98 } : undefined}
    >
      <motion.div
        animate={{
          backgroundColor: done ? "#8fa084" : "rgba(143,160,132,0)",
          borderColor: done ? "#8fa084" : "#8a745a",
        }}
        transition={{ duration: 0.25 }}
        className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2"
      >
        {done ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[11px] font-bold text-honey-bg"
          >
            ✓
          </motion.span>
        ) : null}
      </motion.div>
      <div>
        <div
          className={`text-[13.5px] font-bold transition-colors ${
            done ? "text-honey-text-faint line-through decoration-honey-text-faint" : "text-honey-text"
          }`}
        >
          {title}
        </div>
        <div className="text-[11px] text-honey-text-faint">{subtitle}</div>
      </div>
    </motion.div>
  );
}
