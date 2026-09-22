"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/i18n/types";
import { HoneyJar } from "../honey-jar";
import { CinnamonIcon, GingerIcon, HoneyDropIcon, TeaLeafIcon } from "../../icons";

const ICONS = [HoneyDropIcon, TeaLeafIcon, CinnamonIcon, GingerIcon];

export function OnboardingScreen({
  text,
  onSeeRecipe,
  onSkipToHome,
}: {
  text: Dictionary["app"]["onboarding"];
  onSeeRecipe: () => void;
  onSkipToHome: () => void;
}) {
  return (
    <div className="px-5 pb-6 pt-2">
      <div className="flex flex-col items-center px-1.5 pb-2.5 pt-7 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 h-[150px] w-[132px]"
        >
          <HoneyJar fill={0.68} />
        </motion.div>

        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">{text.eyebrow}</div>
        <h1 className="mb-3 font-display text-[30px] font-medium leading-[1.15] text-honey-text">
          {text.titleStart}
          <br />
          <em className="font-display italic text-honey-gold-light">{text.titleEm}</em> {text.titleEnd}
        </h1>
        <p className="mx-auto mb-7 max-w-[300px] text-[14.5px] leading-relaxed text-honey-text-dim">{text.body}</p>

        <div className="mb-8 flex justify-center gap-3.5">
          {text.ingredients.map((label, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}
                className="flex flex-col items-center gap-1.5 text-[10.5px] font-semibold text-honey-text-faint"
              >
                <Icon className="h-[34px] w-[34px]" />
                {label}
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onSeeRecipe}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-4 font-body text-[15px] font-extrabold text-[#2a1a08] shadow-[0_12px_24px_-8px_rgba(227,166,62,0.45)]"
      >
        {text.seeRecipe}
      </motion.button>
      <button type="button" onClick={onSkipToHome} className="mt-2.5 w-full rounded-xl py-2.5 text-[13px] font-semibold text-honey-text-dim">
        {text.skip}
      </button>
    </div>
  );
}
