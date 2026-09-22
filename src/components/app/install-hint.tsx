"use client";

import { useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/types";

const KEY = "hp_install_hint_dismissed";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function shouldShow(): boolean {
  try {
    if (localStorage.getItem(KEY)) return false;
  } catch {
    return false;
  }
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  const mobile = /iphone|ipad|android/i.test(navigator.userAgent);
  return mobile && !standalone;
}

/** One-time nudge to add the web app to the home screen (mobile only). */
export function InstallHint({ text }: { text: Dictionary["app"]["install"] }) {
  const show = useSyncExternalStore(subscribe, shouldShow, () => false);
  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    listeners.forEach((l) => l());
  }

  return (
    <div className="mx-5 mb-2.5 flex items-start gap-3 rounded-2xl border border-honey-gold/25 bg-honey-gold/10 px-3.5 py-3">
      <span aria-hidden className="text-[18px]">
        📲
      </span>
      <div className="flex-1">
        <div className="text-[12.5px] font-extrabold text-honey-text">{text.title}</div>
        <div className="text-[11.5px] leading-relaxed text-honey-text-dim">{text.body}</div>
      </div>
      <button type="button" onClick={dismiss} className="text-[11.5px] font-bold text-honey-gold-light">
        {text.dismiss}
      </button>
    </div>
  );
}
