"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useHoneyState } from "@/lib/storage";
import type { ScreenId } from "@/lib/types";
import { BrandMarkIcon } from "./icons";
import { StreakPill } from "./streak-pill";
import { BottomNav } from "./bottom-nav";
import { OnboardingScreen } from "./screens/onboarding-screen";
import { RecipeScreen } from "./screens/recipe-screen";
import { HomeScreen } from "./screens/home-screen";
import { SoonScreen } from "./screens/soon-screen";

export function HoneyApp({ userEmail }: { userEmail?: string | null }) {
  const { state, completeRitual, toggleHabit, completeOnboarding } = useHoneyState();
  // null = no manual navigation yet; derive the screen from persisted state instead.
  // Once hydration reveals a returning user, this switches straight to "home"
  // without needing an effect.
  const [manualScreen, setManualScreen] = useState<ScreenId | null>(null);
  const screen: ScreenId = manualScreen ?? (state.hasOnboarded ? "home" : "onboarding");

  function goTo(next: ScreenId) {
    if (next !== "onboarding" && !state.hasOnboarded) completeOnboarding();
    setManualScreen(next);
  }

  const displayName = userEmail ? userEmail.split("@")[0] : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-gradient-to-b from-honey-bg-alt to-honey-bg sm:my-4 sm:min-h-0 sm:rounded-[34px] sm:border sm:border-white/[0.08] sm:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
      <header className="flex items-center justify-between px-5.5 pb-2 pt-5.5">
        <div className="flex items-center gap-2.5">
          <BrandMarkIcon className="h-[26px] w-[26px]" />
          <span className="font-display text-base italic text-honey-gold-light">Truque do Mel</span>
        </div>
        <StreakPill streak={state.streak} />
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
              <OnboardingScreen onSeeRecipe={() => goTo("recipe")} onSkipToHome={() => goTo("home")} />
            ) : null}
            {screen === "recipe" ? <RecipeScreen /> : null}
            {screen === "home" ? (
              <HomeScreen
                habits={state.habits}
                onCompleteRitual={completeRitual}
                onToggleHabit={toggleHabit}
                displayName={displayName}
              />
            ) : null}
            {screen === "soon" ? <SoonScreen onBackToHome={() => goTo("home")} /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {screen !== "onboarding" ? <BottomNav active={screen} onNavigate={goTo} /> : null}
    </div>
  );
}
