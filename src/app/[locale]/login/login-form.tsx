"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { Dictionary } from "@/i18n/types";
import { requestLoginLink, type LoginResult } from "./actions";

export function LoginForm({ locale, next, text }: { locale: string; next?: string; text: Dictionary["login"] }) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      setResult(await requestLoginLink({ email, locale, next }));
    });
  }

  if (result?.status === "sent") {
    return (
      <div className="text-center" aria-live="polite">
        <div className="mb-3 text-[34px]">📬</div>
        <div className="mb-2 text-[17px] font-extrabold text-honey-text">{text.sentTitle}</div>
        <p className="mb-2 text-[14px] leading-relaxed text-honey-text-dim">{text.sentBody}</p>
        <p className="mb-5 text-[12.5px] leading-relaxed text-honey-text-faint">{text.sentHint}</p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-[13px] font-bold text-honey-gold-light underline underline-offset-2"
        >
          {text.resend}
        </button>
      </div>
    );
  }

  const errorMessage =
    result?.status === "error"
      ? { invalid: text.invalidEmail, tooSoon: text.tooSoon, generic: text.genericError }[result.code]
      : null;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-honey-sage">
        {text.emailLabel}
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={text.emailPlaceholder}
          className="rounded-xl border border-honey-line bg-[#1c1006] px-4 py-3.5 font-body text-[15px] font-medium normal-case tracking-normal text-honey-text outline-none placeholder:text-honey-text-faint focus:border-honey-gold/60"
        />
      </label>
      {errorMessage ? (
        <p className="text-[12.5px] font-semibold text-honey-rust" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <motion.button
        type="submit"
        disabled={pending}
        whileTap={{ scale: 0.97 }}
        className="mt-1 w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-4 text-[15px] font-extrabold text-[#2a1a08] shadow-[0_12px_24px_-8px_rgba(227,166,62,0.45)] disabled:opacity-60"
      >
        {pending ? text.submitting : text.submit}
      </motion.button>
    </form>
  );
}
