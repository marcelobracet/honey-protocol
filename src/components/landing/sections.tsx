import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { fill } from "@/i18n/get-dictionary";
import { BrandMarkIcon, CinnamonIcon, GingerIcon, HoneyDropIcon, TeaLeafIcon } from "@/components/icons";
import { HoneyJar } from "@/components/app/honey-jar";
import { Accordion } from "@/components/accordion";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CheckoutButton } from "./checkout-button";
import { PhoneMock } from "./phone-mock";

export interface LandingContext {
  locale: Locale;
  dict: Dictionary;
  checkoutUrl: string;
  price: string | null;
  anchorPrice: string | null;
  guaranteeDays: number;
  companyName: string;
  companyId: string;
  supportEmail: string;
  statementDescriptor: string;
}

/* ---------- layout primitives ---------- */

function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`px-5 py-14 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-[720px]">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-honey-sage">{children}</div>;
}

function H2({ children, center = true }: { children: ReactNode; center?: boolean }) {
  return (
    <h2 className={`mb-6 font-display text-[28px] font-medium leading-[1.15] text-honey-text sm:text-[36px] ${center ? "text-center" : ""}`}>
      {children}
    </h2>
  );
}

function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 text-[16px] leading-relaxed text-honey-text-dim sm:text-[17px] ${className}`}>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-5 ${className}`}>
      {children}
    </div>
  );
}

function CheckList({ items, tone = "sage" }: { items: string[]; tone?: "sage" | "rust" }) {
  const mark = tone === "sage" ? "✓" : "✕";
  const color = tone === "sage" ? "border-honey-sage bg-honey-sage/15 text-honey-sage" : "border-honey-rust bg-honey-rust/15 text-honey-rust";
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-honey-text">
          <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${color}`}>
            {mark}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- sections ---------- */

export function Header({ ctx }: { ctx: LandingContext }) {
  return (
    <header className="sticky top-0 z-40 border-b border-honey-line bg-[#1c1006]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <BrandMarkIcon className="h-[26px] w-[26px]" />
          <span className="font-display text-base italic text-honey-gold-light">{ctx.dict.common.brand}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher locale={ctx.locale} label={ctx.dict.common.language} />
          <Link href={`/${ctx.locale}/login`} className="hidden text-[13px] font-bold text-honey-text-dim hover:text-honey-text sm:block">
            {ctx.dict.common.login}
          </Link>
          <a
            href="#pricing"
            className="rounded-xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-3.5 py-2 text-[12px] font-extrabold uppercase tracking-[0.04em] text-[#2a1a08]"
          >
            {ctx.dict.landing.pricing.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

export function Hero({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.hero;
  return (
    <Section className="pt-10 sm:pt-16">
      <div className="text-center">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mx-auto mb-5 max-w-[680px] font-display text-[32px] font-medium leading-[1.12] text-honey-text sm:text-[46px]">
          {t.titleStart} <em className="italic text-honey-gold-light">{t.titleEm}</em> {t.titleEnd}
        </h1>
        <p className="mx-auto mb-6 max-w-[560px] text-[17px] leading-relaxed text-honey-text sm:text-[19px]">{t.subtitle}</p>
      </div>

      <div className="mx-auto mb-8 h-[170px] w-[150px] animate-rise">
        <HoneyJar fill={0.68} />
      </div>

      <div className="mx-auto mb-7 flex max-w-[420px] justify-center gap-5">
        {[
          { label: ctx.dict.app.onboarding.ingredients[0], Icon: HoneyDropIcon },
          { label: ctx.dict.app.onboarding.ingredients[1], Icon: TeaLeafIcon },
          { label: ctx.dict.app.onboarding.ingredients[2], Icon: CinnamonIcon },
          { label: ctx.dict.app.onboarding.ingredients[3], Icon: GingerIcon },
        ].map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-[11px] font-semibold text-honey-text-faint">
            <Icon className="h-9 w-9" />
            {label}
          </div>
        ))}
      </div>

      <Paragraphs items={[t.body]} className="mx-auto mb-8 max-w-[600px] text-center" />

      <div className="mx-auto max-w-[480px]">
        <CheckoutButton locale={ctx.locale} baseUrl={ctx.checkoutUrl} label={t.cta} />
        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[12px] font-semibold text-honey-text-faint">
          {t.microcopy.map((m) => (
            <li key={m}>✓ {fill(m, { days: ctx.guaranteeDays })}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function EvenIf({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.evenIf;
  return (
    <Section className="bg-[#1c1006]/50">
      <H2>{t.title}</H2>
      <Card>
        <CheckList items={t.items} />
      </Card>
    </Section>
  );
}

export function Story({ ctx }: { ctx: LandingContext }) {
  const { story, mistake } = ctx.dict.landing;
  return (
    <Section>
      <H2>{story.title}</H2>
      <Paragraphs items={story.paragraphs} className="mb-12" />
      <H2>{mistake.title}</H2>
      <Paragraphs items={mistake.paragraphs} />
    </Section>
  );
}

export function Secret({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.secret;
  const icons = [HoneyDropIcon, TeaLeafIcon, CinnamonIcon, GingerIcon];
  return (
    <Section className="bg-[#1c1006]/50">
      <div className="text-center">
        <Eyebrow>{t.eyebrow}</Eyebrow>
      </div>
      <H2>{t.title}</H2>
      <p className="mb-7 text-center text-[16px] leading-relaxed text-honey-text-dim">{t.intro}</p>
      <div className="mb-7 grid gap-3 sm:grid-cols-2">
        {t.bullets.map((b, i) => {
          const Icon = icons[i] ?? HoneyDropIcon;
          return (
            <Card key={b.title} className="flex gap-3.5">
              <Icon className="h-9 w-9 flex-shrink-0" />
              <div>
                <div className="mb-1 text-[15px] font-extrabold text-honey-text">{b.title}</div>
                <p className="text-[13.5px] leading-relaxed text-honey-text-dim">{b.body}</p>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-center text-[16px] leading-relaxed text-honey-text">{t.outro}</p>
    </Section>
  );
}

export function Fit({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.fit;
  return (
    <Section>
      <H2>{t.title}</H2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="border-honey-sage/30">
          <div className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.12em] text-honey-sage">{t.yesTitle}</div>
          <CheckList items={t.yes} />
        </Card>
        <Card className="border-honey-rust/30">
          <div className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.12em] text-honey-rust">{t.noTitle}</div>
          <CheckList items={t.no} tone="rust" />
        </Card>
      </div>
      <p className="text-center text-[16px] leading-relaxed text-honey-text">{t.closing}</p>
    </Section>
  );
}

export function Why({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.why;
  return (
    <Section className="bg-[#1c1006]/50">
      <div className="grid items-center gap-10 sm:grid-cols-[1fr_280px]">
        <div>
          <H2 center={false}>{t.title}</H2>
          <Paragraphs items={t.paragraphs} />
        </div>
        <PhoneMock dict={ctx.dict} />
      </div>
    </Section>
  );
}

export function Steps({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.steps;
  return (
    <Section>
      <H2>{t.title}</H2>
      <p className="mb-8 text-center text-[16px] text-honey-text-dim">{t.intro}</p>
      <ol className="mb-8 flex flex-col gap-4">
        {t.items.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-honey-gold/40 bg-honey-gold/10 font-display text-[15px] italic text-honey-gold-light">
              {i + 1}
            </span>
            <div>
              <div className="mb-1 text-[15.5px] font-extrabold text-honey-text">{s.title}</div>
              <p className="text-[14.5px] leading-relaxed text-honey-text-dim">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-center text-[16px] leading-relaxed text-honey-text">{t.outro}</p>
    </Section>
  );
}

export function Experience({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.experience;
  const glyphs = ["☀️", "🎯", "☕", "🔁"];
  return (
    <Section className="bg-[#1c1006]/50">
      <H2>{t.title}</H2>
      <div className="mb-7 grid gap-3 sm:grid-cols-2">
        {t.items.map((item, i) => (
          <Card key={item.title}>
            <div className="mb-2 text-[24px]">{glyphs[i] ?? "✨"}</div>
            <div className="mb-1 text-[15px] font-extrabold text-honey-text">{item.title}</div>
            <p className="text-[13.5px] leading-relaxed text-honey-text-dim">{item.body}</p>
          </Card>
        ))}
      </div>
      <p className="text-center text-[14px] leading-relaxed text-honey-text-faint">{t.closing}</p>
    </Section>
  );
}

export function Testimonials({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.testimonials;
  if (t.items.length === 0) return null;
  return (
    <Section>
      <H2>{t.title}</H2>
      <div className="grid gap-3 sm:grid-cols-2">
        {t.items.map((item) => (
          <Card key={item.name}>
            <p className="mb-3 text-[14.5px] leading-relaxed text-honey-text">“{item.text}”</p>
            <div className="text-[12px] font-bold text-honey-gold-light">{item.name}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function Included({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.included;
  return (
    <Section>
      <H2>{t.title}</H2>
      <p className="mb-7 text-center text-[15px] text-honey-text-dim">{t.subtitle}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {t.items.map((item) => (
          <Card key={item.title} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-honey-gold/40 bg-honey-gold/10 text-[11px] font-bold text-honey-gold-light">
              ✓
            </span>
            <div>
              <div className="mb-1 text-[14.5px] font-extrabold text-honey-text">{item.title}</div>
              <p className="text-[13px] leading-relaxed text-honey-text-dim">{item.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function Pricing({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.pricing;
  const g = ctx.dict.landing.guarantee;
  return (
    <Section id="pricing" className="bg-[#1c1006]/50">
      <div className="mx-auto max-w-[520px]">
        <div className="relative overflow-hidden rounded-[28px] border border-honey-gold/35 bg-[radial-gradient(120%_140%_at_20%_0%,rgba(227,166,62,0.22),transparent_60%)] p-6 text-center sm:p-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-honey-surface to-honey-surface-2" />
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="mb-5 font-display text-[26px] font-medium leading-tight text-honey-text sm:text-[30px]">{t.title}</h2>
          {ctx.anchorPrice ? (
            <div className="mb-1 text-[15px] text-honey-text-faint line-through">{ctx.anchorPrice}</div>
          ) : null}
          <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-honey-text-dim">{t.todayLabel}</div>
          <div className="mb-6 font-display text-[48px] font-semibold leading-none text-honey-gold-light sm:text-[60px]">
            {ctx.price ?? <span className="text-[22px] sm:text-[26px]">{t.priceFallback}</span>}
          </div>
          <CheckoutButton locale={ctx.locale} baseUrl={ctx.checkoutUrl} label={t.cta} />
          <ul className="mt-5 flex flex-col gap-1.5 text-[13px] font-semibold text-honey-text-dim">
            {t.bullets.map((b) => (
              <li key={b}>✓ {fill(b, { days: ctx.guaranteeDays })}</li>
            ))}
          </ul>
          <div className="mt-5 text-[12px] text-honey-text-faint">🔒 {t.secure}</div>
          {ctx.statementDescriptor ? (
            <div className="mt-1.5 text-[12px] text-honey-text-faint">
              {fill(t.statement, { descriptor: ctx.statementDescriptor })}
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[22px] border border-dashed border-honey-gold/40 p-5 text-center sm:p-6">
          <div className="mb-2 text-[26px]">🛡️</div>
          <h3 className="mb-3 font-display text-[22px] font-medium text-honey-text">{fill(g.title, { days: ctx.guaranteeDays })}</h3>
          <p className="mb-5 text-[14.5px] leading-relaxed text-honey-text-dim">{fill(g.body, { days: ctx.guaranteeDays })}</p>
          <CheckoutButton locale={ctx.locale} baseUrl={ctx.checkoutUrl} label={g.cta} size="md" />
        </div>
      </div>
    </Section>
  );
}

export function Faq({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.faq;
  const items = t.items.map((item, i) => ({ id: `faq-${i}`, title: item.q, body: fill(item.a, { days: ctx.guaranteeDays }) }));
  return (
    <Section>
      <H2>{t.title}</H2>
      <Card className="pt-1">
        <Accordion items={items} defaultOpenId="faq-0" />
      </Card>
    </Section>
  );
}

export function Close({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.close;
  return (
    <Section className="bg-[#1c1006]/50">
      <H2>{t.title}</H2>
      <Paragraphs items={t.paragraphs} className="mb-8 text-center" />
      <div className="mx-auto max-w-[480px]">
        <CheckoutButton locale={ctx.locale} baseUrl={ctx.checkoutUrl} label={t.cta} />
      </div>
    </Section>
  );
}

export function Footer({ ctx }: { ctx: LandingContext }) {
  const t = ctx.dict.landing.footer;
  const year = new Date().getFullYear();
  const links = [
    { href: `/${ctx.locale}/legal/terms`, label: t.terms },
    { href: `/${ctx.locale}/legal/privacy`, label: t.privacy },
    { href: `/${ctx.locale}/legal/refund`, label: t.refund },
    { href: `/${ctx.locale}/support`, label: t.support },
  ];
  return (
    <footer className="border-t border-honey-line px-5 py-10">
      <div className="mx-auto w-full max-w-[720px] text-center">
        <nav className="mb-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12.5px] font-bold uppercase tracking-[0.08em] text-honey-text-dim">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-honey-text">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mb-4 text-[12.5px] text-honey-text-dim">
          {t.alreadyBought}{" "}
          <Link href={`/${ctx.locale}/login`} className="font-bold text-honey-gold-light underline underline-offset-2">
            {ctx.dict.common.login}
          </Link>
        </p>
        <p className="mb-2 text-[11.5px] font-semibold text-honey-text-faint">
          {ctx.dict.common.brand} — {t.rights} © {year}
          {ctx.companyName ? ` · ${ctx.companyName}` : ""}
          {ctx.companyId ? ` · ${ctx.companyId}` : ""}
        </p>
        <p className="mb-3 text-[11px] leading-relaxed text-honey-text-faint">{t.fbDisclaimer}</p>
        <p className="text-[11px] leading-relaxed text-honey-text-faint">{t.healthDisclaimer}</p>
      </div>
    </footer>
  );
}
