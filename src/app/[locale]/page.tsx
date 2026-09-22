import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/get-dictionary";
import { StickyCta } from "@/components/landing/sticky-cta";
import { ExitIntent } from "@/components/landing/exit-intent";
import { getAnchorPrice, getBackRedirectUrl, getCheckoutBaseUrl, getDisplayPrice, publicEnv } from "@/lib/env";
import { BackRedirect } from "@/components/landing/back-redirect";
import { MemberBanner } from "@/components/landing/member-banner";
import {
  Close,
  EvenIf,
  Experience,
  Faq,
  Fit,
  Footer,
  Header,
  Hero,
  Included,
  Pricing,
  Secret,
  Steps,
  Story,
  Testimonials,
  Why,
  type LandingContext,
} from "@/components/landing/sections";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const ctx: LandingContext = {
    locale,
    dict,
    checkoutUrl: getCheckoutBaseUrl(locale),
    price: getDisplayPrice(locale),
    anchorPrice: getAnchorPrice(locale),
    guaranteeDays: publicEnv.guaranteeDays,
    companyName: publicEnv.companyName,
    companyId: publicEnv.companyId,
    supportEmail: publicEnv.supportEmail,
    statementDescriptor: publicEnv.statementDescriptor,
  };

  return (
    <>
      <MemberBanner locale={locale} text={dict.common.alreadyMember} cta={dict.common.openApp} />
      <Header ctx={ctx} />
      <main className="flex-1">
        <Hero ctx={ctx} />
        <EvenIf ctx={ctx} />
        <Story ctx={ctx} />
        <Secret ctx={ctx} />
        <Fit ctx={ctx} />
        <Why ctx={ctx} />
        <Steps ctx={ctx} />
        <Experience ctx={ctx} />
        <Testimonials ctx={ctx} />
        <Included ctx={ctx} />
        <Pricing ctx={ctx} />
        <Faq ctx={ctx} />
        <Close ctx={ctx} />
      </main>
      <Footer ctx={ctx} />
      <StickyCta
        locale={locale}
        checkoutUrl={ctx.checkoutUrl}
        label={fill(dict.sticky.label, { days: ctx.guaranteeDays })}
        cta={dict.sticky.cta}
      />
      <ExitIntent
        locale={locale}
        checkoutUrl={ctx.checkoutUrl}
        text={{ ...dict.exit, body: fill(dict.exit.body, { days: ctx.guaranteeDays }) }}
      />
      <BackRedirect url={getBackRedirectUrl(locale)} />
    </>
  );
}
