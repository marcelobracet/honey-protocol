"use client";

import { Accordion } from "../accordion";
import { CinnamonIcon, GingerIcon, HoneyDropIcon, TeaLeafIcon } from "../icons";

const INGREDIENTS = [
  { Icon: HoneyDropIcon, name: "1 colher de mel", role: "Energia de rápida disponibilidade" },
  { Icon: TeaLeafIcon, name: "Chá verde, 1 xícara", role: "Cafeína natural + L-teanina" },
  { Icon: CinnamonIcon, name: "Canela, uma pitada", role: "Composto antioxidante" },
  { Icon: GingerIcon, name: "Gengibre ralado, um toque", role: "Composto antioxidante" },
];

const ACCORDION_ITEMS = [
  {
    id: "preparo",
    title: "Modo de preparo",
    body: "Prepare o chá verde quente, deixe amornar um pouco, misture o mel e finalize com a canela e o gengibre. Beba devagar, como parte do início do seu dia.",
  },
  {
    id: "porque",
    title: "Por que essa combinação",
    body: "Dentro de uma rotina equilibrada, essa mistura pode apoiar energia mental, concentração e disposição para atividades que pedem atenção e aprendizado.",
  },
];

export function RecipeScreen() {
  return (
    <div className="px-5 pb-6 pt-2">
      <div className="mb-1.5 mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">
        Receita principal
      </div>
      <h2 className="mb-4 font-display text-2xl font-medium text-honey-text">O Truque do Mel</h2>

      <div className="mb-3.5 rounded-[20px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-4.5">
        <ul className="flex flex-col gap-3">
          {INGREDIENTS.map(({ Icon, name, role }) => (
            <li key={name} className="flex items-center gap-3 text-sm">
              <Icon className="h-7 w-7 flex-shrink-0" />
              <div>
                <span className="block font-bold text-honey-text">{name}</span>
                <span className="block text-xs font-medium text-honey-text-faint">{role}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3.5 rounded-[20px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 pt-1.5">
        <div className="px-4.5">
          <Accordion items={ACCORDION_ITEMS} defaultOpenId="preparo" />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-honey-sage/25 bg-honey-sage/10 px-3.5 py-3 text-xs font-semibold leading-relaxed text-honey-sage">
        <span aria-hidden>🌿</span>
        <span>Isso é um hábito de apoio à rotina — não substitui orientação profissional de saúde.</span>
      </div>
    </div>
  );
}
