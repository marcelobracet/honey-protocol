"use server";

import { getUser } from "@/lib/dal";
import { sql } from "@/lib/db";
import { isValidDateKey } from "@/lib/date";
import type { HabitKey } from "@/lib/types";

const COLUMNS: Record<HabitKey, "water" | "honey" | "screen_off"> = {
  water: "water",
  honey: "honey",
  screenOff: "screen_off",
};

export async function saveHabit(input: { day: string; key: HabitKey; value: boolean }): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user) return { ok: false };
  if (!isValidDateKey(input.day) || !(input.key in COLUMNS) || typeof input.value !== "boolean") return { ok: false };

  const db = sql();
  const column = COLUMNS[input.key];
  const honeyAt = input.key === "honey" && input.value ? new Date() : null;
  try {
    await db`
      insert into ritual_days (user_id, day, ${db(column)}, honey_at)
      values (${user.id}, ${input.day}, ${input.value}, ${honeyAt})
      on conflict (user_id, day) do update set
        ${db(column)} = ${input.value},
        honey_at = coalesce(ritual_days.honey_at, excluded.honey_at)
    `;
    return { ok: true };
  } catch (err) {
    console.error("[saveHabit]", err);
    return { ok: false };
  }
}

export async function completeOnboarding(): Promise<void> {
  const user = await getUser();
  if (!user) return;
  await sql()`update users set onboarded_at = coalesce(onboarded_at, now()) where id = ${user.id}`;
}

/** Stores the device timezone so reminder e-mails go out at the right local hour. */
export async function saveTimezone(timezone: string): Promise<void> {
  const user = await getUser();
  if (!user || typeof timezone !== "string" || timezone.length > 64 || !/^[A-Za-z_]+\/[A-Za-z_\-+0-9]+(\/[A-Za-z_\-+0-9]+)?$|^UTC$/.test(timezone)) return;
  if (user.timezone === timezone) return;
  await sql()`update users set timezone = ${timezone} where id = ${user.id}`;
}
