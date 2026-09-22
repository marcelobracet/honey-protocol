import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { purgeOldTokens } from "@/lib/auth/tokens";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { sendDueSequenceEmails } from "@/lib/email/sequence";
import { renderReminderEmail } from "@/lib/email/templates";
import { isDatabaseConfigured, serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Local-time window in which a reminder may go out, as "startHour-endHour"
 * (inclusive). The default is wide because Hobby plans only allow one cron
 * run per day, so a single run has to reach users across many timezones
 * while still avoiding the middle of the night. On an hourly cron (Pro),
 * set REMINDER_LOCAL_HOURS=7-8 to deliver at breakfast time everywhere.
 */
function reminderWindow(): [number, number] {
  const [start, end] = (process.env.REMINDER_LOCAL_HOURS ?? "5-21").split("-").map(Number);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 23 || start > end) return [5, 21];
  return [start, end];
}

function authorized(request: NextRequest): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${serverEnv.cronSecret}`;
  if (!serverEnv.cronSecret || header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

function localParts(timezone: string, now: Date): { hour: number; day: string } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const hour = Number(get("hour")) % 24;
    return { hour, day: `${get("year")}-${get("month")}-${get("day")}` };
  } catch {
    return null;
  }
}

/**
 * Runs hourly (see vercel.json). For every user who opted in, whose local
 * time is in the morning window and who hasn't marked today's ritual yet,
 * sends one reminder per day in the user's language.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "no database" }, { status: 500 });

  const now = new Date();
  const [windowStart, windowEnd] = reminderWindow();
  const users = await sql()<{ id: string; email: string; locale: string; timezone: string; last_reminder_day: string | null }[]>`
    select u.id, u.email, u.locale, u.timezone, to_char(u.last_reminder_day, 'YYYY-MM-DD') as last_reminder_day
      from users u
      join entitlements e on e.email = u.email and e.status = 'active'
     where u.reminder_opt_in and u.timezone is not null
  `;

  let sent = 0;
  const dictCache = new Map<Locale, Awaited<ReturnType<typeof getDictionary>>>();

  for (const user of users) {
    const local = localParts(user.timezone, now);
    if (!local || local.hour < windowStart || local.hour > windowEnd || user.last_reminder_day === local.day) continue;

    const done = await sql()<{ honey: boolean }[]>`
      select honey from ritual_days where user_id = ${user.id} and day = ${local.day} limit 1
    `;
    if (done[0]?.honey) continue;

    const locale: Locale = isLocale(user.locale) ? user.locale : "en";
    const dict = dictCache.get(locale) ?? (await getDictionary(locale));
    dictCache.set(locale, dict);

    try {
      await sendEmail({ to: user.email, ...renderReminderEmail(dict, locale) });
      await sql()`update users set last_reminder_day = ${local.day} where id = ${user.id}`;
      sent += 1;
    } catch (err) {
      console.error("[reminders] failed for", user.id, err);
    }
  }

  const sequence = await sendDueSequenceEmails();
  await purgeOldTokens();
  return NextResponse.json({ ok: true, reminders: { checked: users.length, sent }, sequence });
}
