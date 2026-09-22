"use client";

import { useState, useTransition } from "react";
import type { Dictionary } from "@/i18n/types";
import { LOCALE_COOKIE, localeNames, locales, type Locale } from "@/i18n/config";
import { useRouter } from "next/navigation";
import { deleteAccount, setReminderOptIn, setUserLocale } from "./actions";

export function AccountForm({
  locale,
  email,
  reminderOptIn,
  text,
  languageLabel,
}: {
  locale: Locale;
  email: string;
  reminderOptIn: boolean;
  text: Dictionary["account"];
  languageLabel: string;
}) {
  const router = useRouter();
  const [reminders, setReminders] = useState(reminderOptIn);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, start] = useTransition();

  function flashSaved() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function toggleReminders() {
    const next = !reminders;
    setReminders(next);
    start(async () => {
      const r = await setReminderOptIn(next, locale);
      if (r.ok) flashSaved();
      else setReminders(!next);
    });
  }

  function changeLocale(next: string) {
    start(async () => {
      const r = await setUserLocale(next);
      if (r.ok) {
        document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        router.push(`/${next}/account`);
      }
    });
  }

  function remove() {
    start(async () => {
      await deleteAccount(confirmation, text.deleteConfirmWord, locale);
    });
  }

  const card = "rounded-[20px] border border-honey-line bg-honey-surface p-4.5";
  const label = "mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage";

  return (
    <div className="flex flex-col gap-4">
      <section className={card}>
        <div className={label}>{text.emailLabel}</div>
        <div className="text-[14px] font-bold text-honey-text">{email}</div>
      </section>

      <section className={card}>
        <label className="block">
          <div className={label}>{text.languageLabel}</div>
          <select
            value={locale}
            onChange={(e) => changeLocale(e.target.value)}
            aria-label={languageLabel}
            className="w-full rounded-xl border border-honey-line bg-[#1c1006] px-3 py-2.5 text-[14px] font-semibold text-honey-text outline-none"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {localeNames[l]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className={card}>
        <div className={label}>{text.remindersTitle}</div>
        <p className="mb-3 text-[12.5px] leading-relaxed text-honey-text-dim">{text.remindersBody}</p>
        <button
          type="button"
          role="switch"
          aria-checked={reminders}
          onClick={toggleReminders}
          disabled={pending}
          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-[13.5px] font-bold ${
            reminders ? "border-honey-sage/50 bg-honey-sage/10 text-honey-text" : "border-honey-line text-honey-text-dim"
          }`}
        >
          {reminders ? text.remindersOn : text.remindersOff}
          <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${reminders ? "bg-honey-sage" : "bg-honey-text-faint/50"}`}>
            <span className={`block h-4 w-4 rounded-full bg-honey-bg transition-transform ${reminders ? "translate-x-4" : ""}`} />
          </span>
        </button>
        {saved ? <div className="mt-2 text-[12px] font-semibold text-honey-sage">✓ {text.saved}</div> : null}
      </section>

      <section className={card}>
        <div className={label}>{text.dataTitle}</div>
        <p className="mb-3 text-[12.5px] leading-relaxed text-honey-text-dim">{text.dataBody}</p>
        <a
          href="/api/account/export"
          download
          className="block w-full rounded-xl border border-honey-gold/40 bg-honey-gold/10 py-3 text-center text-[13.5px] font-bold text-honey-gold-light"
        >
          {text.exportCta}
        </a>
      </section>

      <section className={`${card} border-honey-rust/30`}>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-rust">{text.deleteTitle}</div>
        <p className="mb-3 text-[12.5px] leading-relaxed text-honey-text-dim">{text.deleteBody}</p>
        {!confirmOpen ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="w-full rounded-xl border border-honey-rust/50 py-3 text-[13.5px] font-bold text-honey-rust"
          >
            {text.deleteCta}
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            <p className="text-[12.5px] font-semibold text-honey-text">{text.deleteConfirm}</p>
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              aria-label={text.deleteInputLabel}
              placeholder={text.deleteConfirmWord}
              className="rounded-xl border border-honey-line bg-[#1c1006] px-3 py-2.5 text-[14px] font-bold uppercase text-honey-text outline-none"
            />
            <button
              type="button"
              onClick={remove}
              disabled={pending || confirmation.trim().toUpperCase() !== text.deleteConfirmWord.toUpperCase()}
              className="w-full rounded-xl bg-honey-rust py-3 text-[13.5px] font-extrabold text-honey-text disabled:opacity-40"
            >
              {text.deleteCta}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
