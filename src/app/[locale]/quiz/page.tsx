import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getBackRedirectUrl } from "@/lib/env";
import { BrandMarkIcon } from "@/components/icons";
import { BackRedirect } from "@/components/landing/back-redirect";
import { QuizFlow } from "./quiz-flow";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.quiz.meta.title,
    description: dict.quiz.meta.description,
    alternates: { canonical: `/${locale}/quiz` },
  };
}

/**
 * Quiz entry point for cold traffic: five questions, an optional e-mail, then
 * a diagnosis that leads into the VSL. Prerendered — every step runs in the
 * browser, and only the lead is written on the server.
 */
export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <main className="flex-1 px-5 py-10 sm:py-14">
        <Link href={`/${locale}`} className="mb-8 flex items-center justify-center gap-2.5">
          <BrandMarkIcon className="h-6 w-6" />
          <span className="font-display text-base italic text-honey-gold-light">{dict.common.brand}</span>
        </Link>
        <QuizFlow locale={locale} text={dict.quiz} vslPath={`/${locale}/vsl`} />
        <nav className="mx-auto mt-10 flex w-full max-w-[560px] flex-wrap justify-center gap-x-5 gap-y-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-honey-text-faint">
          <Link href={`/${locale}/legal/privacy`} className="hover:text-honey-text-dim">
            {dict.landing.footer.privacy}
          </Link>
          <Link href={`/${locale}/legal/terms`} className="hover:text-honey-text-dim">
            {dict.landing.footer.terms}
          </Link>
          <Link href={`/${locale}/support`} className="hover:text-honey-text-dim">
            {dict.common.support}
          </Link>
        </nav>
      </main>
      <BackRedirect url={getBackRedirectUrl(locale)} />
    </>
  );
}
