"use client";

import { motion } from "framer-motion";

interface HoneyJarProps {
  /** 0 = empty, 1 = full. Animates smoothly between values. */
  fill?: number;
  showDrip?: boolean;
  className?: string;
}

/**
 * SVG honey jar. The honey fill level is a clipped rect that slides up as
 * `fill` increases, and an optional drip plays once when the jar fills.
 */
export function HoneyJar({ fill = 0, showDrip = false, className }: HoneyJarProps) {
  const clipId = "honey-jar-clip";
  const gradId = "honey-jar-gradient";
  // Honey body spans from y=78 (neck) to y=134 (base) inside the jar clip.
  const emptyY = 150;
  const fullY = 78;
  const targetY = emptyY - (emptyY - fullY) * Math.min(Math.max(fill, 0), 1);

  return (
    <div className={className}>
      <svg viewBox="0 0 132 150" width="100%" height="100%">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6cf7c" />
            <stop offset="100%" stopColor="#c9791f" />
          </linearGradient>
          <clipPath id={clipId}>
            <path d="M22 40 h88 a6 6 0 016 6 v90 a10 10 0 01-10 10 H26 a10 10 0 01-10-10 V46 a6 6 0 016-6 z" />
          </clipPath>
        </defs>

        <rect x="30" y="18" width="72" height="14" rx="4" fill="#8a5a24" />
        <path
          d="M22 40 h88 a6 6 0 016 6 v90 a10 10 0 01-10 10 H26 a10 10 0 01-10-10 V46 a6 6 0 016-6 z"
          fill="#2f1d0f"
          stroke="rgba(246,234,210,0.18)"
        />

        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x="10"
            width="112"
            height="80"
            fill={`url(#${gradId})`}
            initial={false}
            animate={{ y: targetY }}
            transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
          />
        </g>

        {showDrip ? (
          <motion.path
            d="M62 -6c4 6 4 10 0 14-4-4-4-8 0-14z"
            fill="#e3a63e"
            initial={{ y: -6, opacity: 1 }}
            animate={{ y: 66, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.55, 0, 0.85, 0.35] }}
          />
        ) : null}
      </svg>
    </div>
  );
}
