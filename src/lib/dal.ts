import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { isDatabaseConfigured, serverEnv } from "@/lib/env";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import type { Entitlement, Profile, RitualDay } from "@/lib/types";

export interface CurrentUser extends Profile {
  id: string;
  email: string;
}

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  locale: string;
  timezone: string | null;
  onboarded_at: Date | null;
  reminder_opt_in: boolean;
}

function toUser(row: UserRow): CurrentUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    locale: row.locale,
    timezone: row.timezone,
    onboardedAt: row.onboarded_at ? row.onboarded_at.toISOString() : null,
    reminderOptIn: row.reminder_opt_in,
  };
}

/** Signed-in user for the current request (session cookie + DB row), or null. */
export const getUser = cache(async (): Promise<CurrentUser | null> => {
  // Read the cookie before any config check so these routes are always
  // rendered per request, even in a build environment without DATABASE_URL.
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!isDatabaseConfigured()) return null;
  const session = await verifySession(raw, serverEnv.sessionSecret);
  if (!session) return null;
  const rows = await sql()<UserRow[]>`
    select id, email, display_name, locale, timezone, onboarded_at, reminder_opt_in
      from users where id = ${session.sub} limit 1
  `;
  return rows[0] ? toUser(rows[0]) : null;
});

/** Entitlement for the signed-in user's e-mail, or null. */
export const getOwnEntitlement = cache(async (): Promise<Entitlement | null> => {
  const user = await getUser();
  if (!user) return null;
  const rows = await sql()<Entitlement[]>`
    select email, status, source, transaction from entitlements where email = ${user.email} limit 1
  `;
  return rows[0] ?? null;
});

export async function getRitualDays(userId: string): Promise<RitualDay[]> {
  const rows = await sql()<{ day: string; water: boolean; honey: boolean; screen_off: boolean }[]>`
    select to_char(day, 'YYYY-MM-DD') as day, water, honey, screen_off
      from ritual_days
     where user_id = ${userId} and day >= current_date - 400
     order by day
  `;
  return rows.map((r) => ({ day: r.day, water: r.water, honey: r.honey, screenOff: r.screen_off }));
}

/** Finds or creates the user row for an e-mail (called after a magic link is verified). */
export async function findOrCreateUser(email: string, defaults: { name?: string | null; locale: string }): Promise<CurrentUser> {
  const rows = await sql()<UserRow[]>`
    insert into users (email, display_name, locale, last_login_at)
    values (${email}, ${defaults.name ?? null}, ${defaults.locale}, now())
    on conflict (email) do update set last_login_at = now()
    returning id, email, display_name, locale, timezone, onboarded_at, reminder_opt_in
  `;
  return toUser(rows[0]);
}
