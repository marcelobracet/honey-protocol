"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";
import { dateKey } from "@/lib/date";
import { applyHabit, computeStreak, habitsForDay } from "@/lib/ritual";
import type { HabitKey, RitualDay, ScreenId } from "@/lib/types";
import { completeOnboarding, saveHabit, saveTimezone } from "@/app/[locale]/app/actions";
import { BrandMarkIcon } from "../icons";
import { StreakPill } from "./streak-pill";
import { BottomNav } from "./bottom-nav";
import { InstallHint } from "./install-hint";
import { OnboardingScreen } from "./screens/onboarding-screen";
import { RecipeScreen } from "./screens/recipe-screen";
import { HomeScreen } from "./screens/home-screen";
import { SoonScreen } from "./screens/soon-screen";

export function HoneyApp({
  locale,
  text,
  brand,
  initialDays,
  displayName,
  hasOnboarded,
  timezone,
}: {
  locale: Locale;
  text: Dictionary["app"];
  brand: string;
  initialDays: RitualDay[];
  displayName: string | null;
  hasOnboarded: boolean;
  timezone: string | null;
}) {
  const [days, setDays] = useState<RitualDay[]>(initialDays);
  const [onboarded, setOnboarded] = useState(hasOnboarded);
  const [manualScreen, setManualScreen] = useState<ScreenId | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [, startTransition] = useTransition();

  const screen: ScreenId = manualScreen ?? (onboarded ? "home" : "onboarding");
  const today = dateKey();
  const habits = useMemo(() => habitsForDay(days, today), [days, today]);
  const streak = useMemo(() => computeStreak(days), [days]);

  // Persist the device timezone once so reminder e-mails follow local time.
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== timezone) startTransition(() => saveTimezone(tz));
  }, [timezone]);

  const setHabit = useCallback(
    (key: HabitKey, value: boolean) => {
      const day = dateKey();
      setDays((d) => applyHabit(d, day, key, value));
      startTransition(async () => {
        const result = await saveHabit({ day, key, value });
        if (!result.ok) {
          // Revert the optimistic update.
          setDays((d) => applyHabit(d, day, key, !value));
          setSyncError(true);
          window.setTimeout(() => setSyncError(false), 3500);
        }
      });
    },
    [],
  );

  function goTo(next: ScreenId) {
    if (next !== "onboarding" && !onboarded) {
      setOnboarded(true);
      startTransition(() => completeOnboarding());
    }
    setManualScreen(next);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-gradient-to-b from-honey-bg-alt to-honey-bg sm:my-4 sm:min-h-0 sm:rounded-[34px] sm:border sm:border-white/[0.08] sm:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
      <header className="flex items-center justify-between px-5.5 pb-2 pt-5.5">
        <div className="flex items-center gap-2.5">
          <BrandMarkIcon className="h-[26px] w-[26px]" />
          <span className="font-display text-base italic text-honey-gold-light">{brand}</span>
        </div>
        <StreakPill streak={streak} startLabel={text.streakStart} dayLabel={text.streakDay} />
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
          >
            {screen === "onboarding" ? (
              <OnboardingScreen text={text.onboarding} onSeeRecipe={() => goTo("recipe")} onSkipToHome={() => goTo("home")} />
            ) : null}
            {screen === "recipe" ? <RecipeScreen text={text.recipe} /> : null}
            {screen === "home" ? (
              <HomeScreen
                text={text}
                habits={habits}
                onCompleteRitual={() => setHabit("honey", true)}
                onToggleHabit={(key) => setHabit(key, !habits[key])}
                displayName={displayName}
              />
            ) : null}
            {screen === "soon" ? <SoonScreen text={text.soon} onBackToHome={() => goTo("home")} /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {syncError ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="mx-5 mb-2 rounded-xl border border-honey-rust/40 bg-honey-rust/15 px-3.5 py-2.5 text-center text-[12.5px] font-semibold text-honey-text"
          >
            {text.syncError}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {screen !== "onboarding" ? <InstallHint text={text.install} /> : null}
      {screen !== "onboarding" ? <BottomNav active={screen} onNavigate={goTo} text={text.nav} accountHref={`/${locale}/account`} /> : null}
    </div>
  );
}
