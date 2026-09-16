"use client";

import { useCallback, useSyncExternalStore } from "react";
import { dateKey, isYesterday } from "./date";
import type { HabitKey, HoneyState } from "./types";

const STORAGE_KEY = "honey-protocol:v1";

function emptyHabits() {
  return { water: false, honey: false, screenOff: false };
}

function defaultState(): HoneyState {
  return {
    date: dateKey(),
    habits: emptyHabits(),
    streak: 0,
    lastRitualDate: null,
    hasOnboarded: false,
  };
}

function readFromLocalStorage(): HoneyState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as HoneyState;
    if (parsed.date !== dateKey()) {
      return { ...parsed, date: dateKey(), habits: emptyHabits() };
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function writeToLocalStorage(state: HoneyState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded / private-mode — state just won't persist across reloads
  }
}

/**
 * Module-level store synced to localStorage, exposed to React via
 * useSyncExternalStore. This reads/writes an external system (the browser's
 * localStorage) without ever calling setState inside an effect: the server
 * snapshot is a static default, and React itself swaps in the real
 * client snapshot right after hydration.
 */
let cached: HoneyState | null = null;
const listeners = new Set<() => void>();

// A stable reference: useSyncExternalStore requires getServerSnapshot to
// return the same value across calls, or it never settles on the real
// client snapshot after hydration.
const SERVER_SNAPSHOT = defaultState();

function getSnapshot(): HoneyState {
  if (cached === null) {
    cached = readFromLocalStorage();
  }
  return cached;
}

function getServerSnapshot(): HoneyState {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(updater: (prev: HoneyState) => HoneyState) {
  const prev = getSnapshot();
  const next = updater(prev);
  if (next === prev) return;
  cached = next;
  writeToLocalStorage(next);
  listeners.forEach((listener) => listener());
}

export function useHoneyState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const completeRitual = useCallback(() => {
    update((prev) => {
      if (prev.habits.honey) return prev;
      const streak = isYesterday(prev.lastRitualDate) ? prev.streak + 1 : 1;
      return {
        ...prev,
        habits: { ...prev.habits, honey: true },
        streak,
        lastRitualDate: dateKey(),
      };
    });
  }, []);

  const toggleHabit = useCallback((key: Exclude<HabitKey, "honey">) => {
    update((prev) => ({
      ...prev,
      habits: { ...prev.habits, [key]: !prev.habits[key] },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    update((prev) => (prev.hasOnboarded ? prev : { ...prev, hasOnboarded: true }));
  }, []);

  return { state, completeRitual, toggleHabit, completeOnboarding };
}
