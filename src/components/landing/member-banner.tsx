"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { MEMBER_HINT_COOKIE } from "@/lib/auth/session";
import type { Locale } from "@/i18n/config";

function subscribe() {
  return () => {};
}

function hasMemberHint(): boolean {
  try {
    return document.cookie.split("; ").some((c) => c.startsWith(`${MEMBER_HINT_COOKIE}=`));
  } catch {
    return false;
  }
}

/**
 * Greets a buyer who comes back to the sales page. The flag is a readable
 * cookie with no secret in it, so the page itself stays prerendered for the
 * cold traffic that makes up almost all of its visitors.
 *
 * The server snapshot is `false`, so nothing renders until hydration and a
 * new visitor never sees this flash.
 */
export function MemberBanner({ locale, text, cta }: { locale: Locale; text: string; cta: string }) {
  const isMember = useSyncExternalStore(subscribe, hasMemberHint, () => false);
  if (!isMember) return null;

  return (
    <div className="border-b border-honey-sage/30 bg-honey-sage/10 px-5 py-2.5">
      <div className="mx-auto flex w-full max-w-[960px] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
        <span className="text-[13px] font-semibold text-honey-text">{text}</span>
        <Link
          href={`/${locale}/app`}
          className="rounded-xl border border-honey-sage/50 bg-honey-sage/15 px-3.5 py-1.5 text-[12.5px] font-extrabold text-honey-text"
        >
          {cta} →
        </Link>
      </div>
    </div>
  );
}
