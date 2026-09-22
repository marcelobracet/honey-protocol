import { HoneyJar } from "@/components/app/honey-jar";
import { BrandMarkIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/types";

/** Static preview of the app's home screen, used on the sales page. */
export function PhoneMock({ dict }: { dict: Dictionary }) {
  const t = dict.app;
  const rows = [
    { label: t.home.water, done: true },
    { label: t.home.honey, done: true },
    { label: t.home.screenOff, done: false },
  ];
  return (
    <div className="mx-auto w-[280px] rounded-[38px] border border-white/[0.1] bg-gradient-to-b from-honey-bg-alt to-honey-bg p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
      <div className="rounded-[28px] border border-white/[0.06] bg-[#1f1308] px-4 pb-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BrandMarkIcon className="h-5 w-5" />
            <span className="font-display text-[13px] italic text-honey-gold-light">{dict.common.brand}</span>
          </div>
          <div className="rounded-full border border-honey-gold/25 bg-honey-gold/10 px-2 py-1 text-[10px] font-semibold text-honey-gold-light">
            🍯 {t.streakDay.replace("{n}", "7")}
          </div>
        </div>
        <div className="font-display text-[17px] italic text-honey-gold-light">{t.greeting}</div>
        <div className="mb-3 text-[10.5px] text-honey-text-dim">{t.subtitleNoName}</div>
        <div className="mb-3 rounded-2xl border border-honey-gold/20 bg-gradient-to-b from-honey-surface to-honey-surface-2 p-3 text-center">
          <div className="mx-auto mb-2 h-[84px] w-[74px]">
            <HoneyJar fill={0.75} />
          </div>
          <div className="text-[11.5px] font-extrabold text-honey-text">{t.home.done}</div>
          <div className="text-[9.5px] text-honey-text-faint">{t.home.doneHint}</div>
        </div>
        <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-honey-sage">{t.home.routineTitle}</div>
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-2 rounded-xl border border-honey-line bg-honey-surface px-2.5 py-2">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 text-[8px] font-bold ${
                  row.done ? "border-honey-sage bg-honey-sage text-honey-bg" : "border-honey-text-faint"
                }`}
              >
                {row.done ? "✓" : ""}
              </span>
              <span className={`text-[10.5px] font-bold ${row.done ? "text-honey-text-faint line-through" : "text-honey-text"}`}>
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
