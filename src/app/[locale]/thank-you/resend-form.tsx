"use client";

import { useState, useTransition } from "react";
import { requestLoginLink, type LoginResult } from "@/app/[locale]/login/actions";

export function ResendForm({
  locale,
  initialEmail,
  text,
}: {
  locale: string;
  initialEmail: string;
  text: { cta: string; sent: string; placeholder: string; invalid: string; tooSoon: string; generic: string };
}) {
  const [email, setEmail] = useState(initialEmail);
  const [result, setResult] = useState<LoginResult | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => setResult(await requestLoginLink({ email, locale })));
  }

  if (result?.status === "sent") {
    return <p className="text-[13.5px] font-semibold text-honey-sage" aria-live="polite">✓ {text.sent}</p>;
  }

  const error = result?.status === "error" ? { invalid: text.invalid, tooSoon: text.tooSoon, generic: text.generic }[result.code] : null;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={text.placeholder}
        autoComplete="email"
        className="flex-1 rounded-xl border border-honey-line bg-[#1c1006] px-4 py-3 text-[14px] font-medium text-honey-text outline-none placeholder:text-honey-text-faint focus:border-honey-gold/60"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-3 text-[13.5px] font-extrabold text-[#2a1a08] disabled:opacity-60"
      >
        {text.cta}
      </button>
      {error ? <p className="text-[12.5px] font-semibold text-honey-rust sm:basis-full">{error}</p> : null}
    </form>
  );
}
