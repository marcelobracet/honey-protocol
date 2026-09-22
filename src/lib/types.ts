export type ScreenId = "onboarding" | "recipe" | "home" | "soon";

export type HabitKey = "water" | "honey" | "screenOff";

export interface HabitState {
  water: boolean;
  honey: boolean;
  screenOff: boolean;
}

export interface HoneyState {
  date: string;
  habits: HabitState;
  streak: number;
  lastRitualDate: string | null;
  hasOnboarded: boolean;
}
