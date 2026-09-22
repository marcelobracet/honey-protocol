import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { publicEnv } from "@/lib/env";
import { Accordion } from "@/components/accordion";
import { BrandMarkIcon } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.support.title };
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.support;
  const items = t.items.map((item, i) => ({ id: `s-${i}`, title: item.q, body: item.a }));

  return (
    <main className="mx-auto w-full max-w-[560px] flex-1 px-5 py-10">
      <Link href={`/${locale}`} className="mb-8 flex items-center gap-2.5">
        <BrandMarkIcon className="h-7 w-7" />
        <span className="font-display text-lg italic text-honey-gold-light">{dict.common.brand}</span>
      </Link>

      <h1 className="mb-2 font-display text-[30px] font-medium leading-tight text-honey-text">{t.title}</h1>
      <p className="mb-6 text-[15px] leading-relaxed text-honey-text-dim">{t.body}</p>

      <div className="mb-8 rounded-[22px] border border-honey-gold/30 bg-gradient-to-b from-honey-surface to-honey-surface-2 p-5 text-center">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">{t.emailLabel}</div>
        {publicEnv.supportEmail ? (
          <a href={`mailto:${publicEnv.supportEmail}`} className="text-[18px] font-extrabold text-honey-gold-light underline underline-offset-4">
            {publicEnv.supportEmail}
          </a>
        ) : (
          <span className="text-[14px] text-honey-text-faint">NEXT_PUBLIC_SUPPORT_EMAIL</span>
        )}
      </div>

      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-honey-sage">{t.faqTitle}</h2>
      <div className="rounded-[20px] border border-honey-line bg-honey-surface px-4.5 pt-1">
        <Accordion items={items} />
      </div>

      <p className="mt-8 text-center text-[13px] text-honey-text-dim">
        <Link href={`/${locale}/login`} className="font-bold text-honey-gold-light underline underline-offset-2">
          {dict.common.login}
        </Link>
      </p>
    </main>
  );
}
