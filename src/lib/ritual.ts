import { dateKey } from "./date";
import type { HabitKey, HabitState, RitualDay } from "./types";

export function emptyHabits(): HabitState {
  return { water: false, honey: false, screenOff: false };
}

export function habitsForDay(days: RitualDay[], day: string): HabitState {
  const found = days.find((d) => d.day === day);
  return found ? { water: found.water, honey: found.honey, screenOff: found.screenOff } : emptyHabits();
}

/**
 * Consecutive days (ending today or yesterday) on which the honey ritual was
 * completed. Computed on the client from local dates so it follows the user's
 * timezone rather than the server's.
 */
export function computeStreak(days: RitualDay[], today: Date = new Date()): number {
  const done = new Set(days.filter((d) => d.honey).map((d) => d.day));
  const cursor = new Date(today);
  if (!done.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!done.has(dateKey(cursor))) return 0;
  }
  let streak = 0;
  while (done.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function applyHabit(days: RitualDay[], day: string, key: HabitKey, value: boolean): RitualDay[] {
  const existing = days.find((d) => d.day === day);
  if (existing) {
    return days.map((d) => (d.day === day ? { ...d, [key]: value } : d));
  }
  return [...days, { day, ...emptyHabits(), [key]: value }];
}
