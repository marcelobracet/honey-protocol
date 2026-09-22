"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { MEMBER_HINT_COOKIE, SESSION_COOKIE } from "@/lib/auth/session";
import { getUser } from "@/lib/dal";
import { sql } from "@/lib/db";

export async function signOut(formData: FormData): Promise<void> {
  const raw = formData.get("locale");
  const locale = typeof raw === "string" && isLocale(raw) ? raw : "pt";
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(MEMBER_HINT_COOKIE);
  redirect(localePath(locale, "/"));
}

export async function setReminderOptIn(optIn: boolean, locale: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user) return { ok: false };
  const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await sql().begin(async (tx) => {
    await tx`update users set reminder_opt_in = ${optIn} where id = ${user.id}`;
    await tx`
      insert into consents (user_id, email, kind, version, granted, locale, user_agent)
      values (${user.id}, ${user.email}, 'reminders', '1', ${optIn}, ${locale}, ${ua})
    `;
  });
  return { ok: true };
}

export async function setUserLocale(locale: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user || !isLocale(locale)) return { ok: false };
  await sql()`update users set locale = ${locale} where id = ${user.id}`;
  return { ok: true };
}

/**
 * LGPD right to erasure. Deletes the user row (cascades to ritual days) and
 * anonymises consent logs. The purchase record in `entitlements` is kept for
 * the legal retention period, as stated in the privacy policy, and still
 * allows the person to sign in again while the purchase is active.
 */
export async function deleteAccount(confirmation: string, expectedWord: string, locale: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user) return { ok: false };
  if (confirmation.trim().toUpperCase() !== expectedWord.toUpperCase()) return { ok: false };

  await sql().begin(async (tx) => {
    await tx`update consents set email = null where user_id = ${user.id}`;
    await tx`delete from login_tokens where email = ${user.email}`;
    await tx`delete from users where id = ${user.id}`;
  });

  (await cookies()).delete(SESSION_COOKIE);
  redirect(`${localePath(isLocale(locale) ? locale : "pt", "/")}?deleted=1`);
}
