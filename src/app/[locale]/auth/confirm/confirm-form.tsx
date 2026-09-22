"use client";

import { useEffect, useRef, useTransition } from "react";
import { confirmLogin } from "./actions";

/**
 * Auto-submits the token once on mount and offers a button in case the
 * automatic submit is blocked (e.g. JS disabled until user interaction).
 */
export function ConfirmForm({
  token,
  locale,
  loadingLabel,
  buttonLabel,
}: {
  token: string;
  locale: string;
  loadingLabel: string;
  buttonLabel: string;
}) {
  const [pending, start] = useTransition();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    start(() => confirmLogin({ token, locale }));
  }, [token, locale]);

  return (
    <form
      action={() => start(() => confirmLogin({ token, locale }))}
      className="flex flex-col items-center gap-4"
    >
      <p className="text-[14px] text-honey-text-dim" aria-live="polite">
        {pending ? loadingLabel : ""}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-3.5 text-[14px] font-extrabold text-[#2a1a08] disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
