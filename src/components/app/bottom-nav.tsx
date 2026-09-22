"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/types";
import type { ScreenId } from "@/lib/types";
import { AccountNavIcon, HomeNavIcon, RecipeNavIcon, SoonNavIcon } from "../icons";

export function BottomNav({
  active,
  onNavigate,
  text,
  accountHref,
}: {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  text: Dictionary["app"]["nav"];
  accountHref: string;
}) {
  const tabs: { id: ScreenId; label: string; Icon: typeof HomeNavIcon }[] = [
    { id: "home", label: text.home, Icon: HomeNavIcon },
    { id: "recipe", label: text.recipe, Icon: RecipeNavIcon },
    { id: "soon", label: text.soon, Icon: SoonNavIcon },
  ];
  const base = "flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10.5px] font-bold transition-colors";

  return (
    <nav
      className="flex items-center justify-around border-t border-honey-line bg-[rgba(24,13,4,0.55)] px-3.5 pt-2.5 backdrop-blur-md"
      style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom))" }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? "text-honey-gold-light" : "text-honey-text-faint"}`}
          >
            <Icon className="h-[21px] w-[21px]" />
            {label}
          </button>
        );
      })}
      <Link href={accountHref} className={`${base} text-honey-text-faint`}>
        <AccountNavIcon className="h-[21px] w-[21px]" />
        {text.account}
      </Link>
    </nav>
  );
}
