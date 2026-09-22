import "server-only";

import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/types";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { renderSequenceEmail } from "@/lib/email/templates";

/**
 * Sends the onboarding sequence to buyers with an active purchase: step N
 * goes out once the purchase is at least N days old and hasn't been sent.
 * Buyers who turned reminders off in the app are skipped. Each step is sent
 * at most once per e-mail (email_log unique constraint).
 */
export async function sendDueSequenceEmails(): Promise<{ checked: number; sent: number }> {
  const rows = await sql()<{ email: string; locale: string | null; age_days: number; sent: string[] }[]>`
    select e.email,
           coalesce(u.locale, e.locale) as locale,
           floor(extract(epoch from (now() - e.granted_at)) / 86400)::int as age_days,
           coalesce(array_agg(l.template) filter (where l.template is not null), '{}') as sent
      from entitlements e
      left join users u on u.email = e.email
      left join email_log l on l.email = e.email and l.template like 'sequence:%'
     where e.status = 'active'
       and e.granted_at > now() - interval '10 days'
       and coalesce(u.reminder_opt_in, true)
     group by e.email, u.locale, e.locale, e.granted_at
  `;

  const dictCache = new Map<Locale, Dictionary>();
  let sent = 0;

  for (const row of rows) {
    const locale: Locale = isLocale(row.locale) ? row.locale : "en";
    const dict = dictCache.get(locale) ?? (await getDictionary(locale));
    dictCache.set(locale, dict);

    // Only the most recent due step, so a late cron doesn't dump several e-mails at once.
    const due = dict.email.sequence.filter((s) => s.day <= row.age_days && !row.sent.includes(`sequence:${s.day}`));
    const step = due.length ? due[due.length - 1] : null;
    if (!step) continue;

    try {
      const claimed = await sql()<{ id: number }[]>`
        insert into email_log (email, template) values (${row.email}, ${`sequence:${step.day}`})
        on conflict do nothing returning id
      `;
      if (claimed.length === 0) continue;
      await sendEmail({ to: row.email, ...renderSequenceEmail(dict, locale, step) });
      // Mark earlier skipped steps as done so they never go out late.
      for (const s of dict.email.sequence) {
        if (s.day < step.day) {
          await sql()`insert into email_log (email, template) values (${row.email}, ${`sequence:${s.day}`}) on conflict do nothing`;
        }
      }
      sent += 1;
    } catch (err) {
      console.error("[sequence] failed for", row.email, err);
    }
  }
  return { checked: rows.length, sent };
}
