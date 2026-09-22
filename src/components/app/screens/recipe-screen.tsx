"use client";

import type { Dictionary } from "@/i18n/types";
import { Accordion } from "../../accordion";
import { CinnamonIcon, GingerIcon, HoneyDropIcon, TeaLeafIcon } from "../../icons";

const ICONS = [HoneyDropIcon, TeaLeafIcon, CinnamonIcon, GingerIcon];

export function RecipeScreen({ text }: { text: Dictionary["app"]["recipe"] }) {
  const items = [
    { id: "preparo", title: text.prepTitle, body: text.prepBody },
    { id: "porque", title: text.whyTitle, body: text.whyBody },
  ];

  return (
    <div className="px-5 pb-6 pt-2">
      <div className="mb-1.5 mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">{text.eyebrow}</div>
      <h2 className="mb-4 font-display text-2xl font-medium text-honey-text">{text.title}</h2>

      <div className="mb-3.5 rounded-[20px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-4.5">
        <ul className="flex flex-col gap-3">
          {text.ingredients.map(({ name, role }, i) => {
            const Icon = ICONS[i] ?? HoneyDropIcon;
            return (
              <li key={name} className="flex items-center gap-3 text-sm">
                <Icon className="h-7 w-7 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-honey-text">{name}</span>
                  <span className="block text-xs font-medium text-honey-text-faint">{role}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mb-3.5 rounded-[20px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 pt-1.5">
        <div className="px-4.5">
          <Accordion items={items} defaultOpenId="preparo" />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-honey-sage/25 bg-honey-sage/10 px-3.5 py-3 text-xs font-semibold leading-relaxed text-honey-sage">
        <span aria-hidden>🌿</span>
        <span>{text.disclaimer}</span>
      </div>
    </div>
  );
}
