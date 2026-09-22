"use client";

import type { ScreenId } from "@/lib/types";
import { HomeNavIcon, RecipeNavIcon, SoonNavIcon } from "./icons";

const TABS: { id: ScreenId; label: string; Icon: typeof HomeNavIcon }[] = [
  { id: "home", label: "Início", Icon: HomeNavIcon },
  { id: "recipe", label: "Receita", Icon: RecipeNavIcon },
  { id: "soon", label: "Em breve", Icon: SoonNavIcon },
];

export function BottomNav({
  active,
  onNavigate,
}: {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}) {
  return (
    <nav
      className="flex items-center justify-around border-t border-honey-line bg-[rgba(24,13,4,0.55)] px-3.5 pt-2.5 backdrop-blur-md"
      style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom))" }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10.5px] font-bold transition-colors ${
              isActive ? "text-honey-gold-light" : "text-honey-text-faint"
            }`}
          >
            <Icon className="h-[21px] w-[21px]" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
