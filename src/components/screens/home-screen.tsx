"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HoneyJar } from "../honey-jar";
import { HabitRow } from "../habit-row";
import type { HabitState } from "@/lib/types";

export function HomeScreen({
  habits,
  onCompleteRitual,
  onToggleHabit,
  displayName,
}: {
  habits: HabitState;
  onCompleteRitual: () => void;
  onToggleHabit: (key: "water" | "screenOff") => void;
  displayName?: string | null;
}) {
  const [justCompleted, setJustCompleted] = useState(false);
  const ritualDone = habits.honey;

  function handleTap() {
    if (ritualDone) return;
    setJustCompleted(true);
    onCompleteRitual();
    window.setTimeout(() => setJustCompleted(false), 700);
  }

  return (
    <div className="px-5 pb-6 pt-2">
      <div className="mt-1.5 font-display text-[22px] italic text-honey-gold-light">Bom dia ☀️</div>
      <div className="mb-5.5 mb-6 text-[13px] text-honey-text-dim">
        {displayName ? `${displayName}, seu` : "Seu"} ritual de hoje está te esperando
      </div>

      <div className="relative mb-4.5 overflow-hidden rounded-[22px] border border-honey-gold/20 bg-[radial-gradient(120%_140%_at_20%_0%,rgba(227,166,62,0.20),transparent_60%)] p-5.5 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-honey-surface to-honey-surface-2" />
        <motion.button
          type="button"
          onClick={handleTap}
          disabled={ritualDone}
          whileTap={!ritualDone ? { scale: 0.95 } : undefined}
          className="relative mx-auto mb-4 h-[126px] w-[110px] cursor-pointer disabled:cursor-default"
          aria-label={ritualDone ? "Ritual de hoje concluído" : "Marcar ritual de hoje como feito"}
        >
          <HoneyJar fill={ritualDone ? 0.75 : 0.08} showDrip={justCompleted} />
        </motion.button>
        <motion.div
          key={ritualDone ? "done" : "pending"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-1 text-[15px] font-extrabold text-honey-text">
            {ritualDone ? "Feito com o mel 🍯" : "Marcar ritual de hoje"}
          </div>
          <div className="text-[12.5px] text-honey-text-faint">
            {ritualDone ? "Seu ritual de hoje está completo" : "Toque na jarra quando terminar"}
          </div>
        </motion.div>
      </div>

      <div className="mb-2.5 mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">
        Sua rotina
      </div>
      <div className="flex flex-col gap-2.5">
        <HabitRow
          title="Água ao acordar"
          subtitle={habits.water ? "Feito" : "Ainda não feito"}
          done={habits.water}
          onToggle={() => onToggleHabit("water")}
        />
        <HabitRow
          title="Truque do Mel"
          subtitle={ritualDone ? "Feito" : "Ainda não feito"}
          done={ritualDone}
        />
        <HabitRow
          title="5 min sem tela antes de dormir"
          subtitle={habits.screenOff ? "Feito" : "À noite"}
          done={habits.screenOff}
          onToggle={() => onToggleHabit("screenOff")}
        />
      </div>
    </div>
  );
}
