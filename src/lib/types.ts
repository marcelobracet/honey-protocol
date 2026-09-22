export type ScreenId = "onboarding" | "recipe" | "home" | "soon";

export type HabitKey = "water" | "honey" | "screenOff";

export interface HabitState {
  water: boolean;
  honey: boolean;
  screenOff: boolean;
}

/** One calendar day of the ritual, keyed by the user's local date (YYYY-MM-DD). */
export interface RitualDay extends HabitState {
  day: string;
}

export interface Profile {
  displayName: string | null;
  locale: string;
  timezone: string | null;
  onboardedAt: string | null;
  reminderOptIn: boolean;
}

export type EntitlementStatus = "active" | "revoked";

export interface Entitlement {
  email: string;
  status: EntitlementStatus;
  source: string;
  transaction: string | null;
}
