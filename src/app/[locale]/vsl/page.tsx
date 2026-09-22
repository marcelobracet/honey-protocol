import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/get-dictionary";
import { getBackRedirectUrl, getCheckoutBaseUrl, getVslCtaDelay, getVslVideoUrl, publicEnv } from "@/lib/env";
import { BrandMarkIcon } from "@/components/icons";
import { BackRedirect } from "@/components/landing/back-redirect";
import { Footer, type LandingContext } from "@/components/landing/sections";
import { VslPlayer } from "./vsl-player";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.vsl.title, description: dict.meta.description, robots: { index: false, follow: false } };
}

/** Video sales letter: headline, video, delayed checkout button, footer with legal links. */
export default async function VslPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.vsl;

  const ctx: LandingContext = {
    locale,
    dict,
    checkoutUrl: getCheckoutBaseUrl(locale),
    price: null,
    anchorPrice: null,
    guaranteeDays: publicEnv.guaranteeDays,
    companyName: publicEnv.companyName,
    companyId: publicEnv.companyId,
    supportEmail: publicEnv.supportEmail,
    statementDescriptor: publicEnv.statementDescriptor,
  };

  return (
    <>
      <main className="flex-1 px-4 pb-16 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[860px] text-center">
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <BrandMarkIcon className="h-6 w-6" />
            <span className="font-display text-base italic text-honey-gold-light">{dict.common.brand}</span>
          </div>
          <div className="mb-3 inline-block rounded-full border border-honey-rust/40 bg-honey-rust/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-gold-light">
            {t.eyebrow}
          </div>
          <h1 className="mx-auto mb-3 max-w-[760px] font-display text-[26px] font-medium leading-[1.15] text-honey-text sm:text-[38px]">{t.title}</h1>
          <p className="mx-auto mb-6 max-w-[600px] text-[14.5px] text-honey-text-dim sm:text-[16px]">{t.subtitle}</p>

          <VslPlayer
            locale={locale}
            videoUrl={getVslVideoUrl(locale)}
            delaySeconds={getVslCtaDelay()}
            checkoutUrl={ctx.checkoutUrl}
            ctaLabel={dict.landing.pricing.cta}
            ctaHint={fill(t.ctaHint, { days: ctx.guaranteeDays })}
            unmuteLabel={t.unmute}
          />

          <p className="mt-8 text-[13px] text-honey-text-faint">
            <Link href={`/${locale}`} className="underline underline-offset-2 hover:text-honey-text">
              {t.fullPage}
            </Link>
          </p>
        </div>
      </main>
      <Footer ctx={ctx} />
      <BackRedirect url={getBackRedirectUrl(locale)} />
    </>
  );
}
