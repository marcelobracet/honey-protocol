import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUser } from "@/lib/dal";
import { publicEnv } from "@/lib/env";
import { BrandMarkIcon } from "@/components/icons";
import { HoneyJar } from "@/components/app/honey-jar";
import { PurchaseEvent } from "@/components/purchase-event";
import { ResendForm } from "./resend-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.thanks.title, robots: { index: false, follow: false } };
}

/**
 * Post-purchase page. Three states:
 * - signed in already (came back through /api/checkout/return): straight into the app
 * - payment still settling: explain and stop
 * - otherwise: the e-mail instructions, with a way to request the link again
 */
export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email.trim().toLowerCase().slice(0, 254) : "";
  const transaction = typeof sp.transaction === "string" ? sp.transaction.slice(0, 64) : "";
  const pending = sp.pending === "1";

  const [dict, user] = await Promise.all([getDictionary(locale), getUser()]);
  const t = dict.thanks;

  const shell = (children: React.ReactNode) => (
    <main className="mx-auto w-full max-w-[560px] flex-1 px-5 py-10">
      <PurchaseEvent transaction={transaction} />
      <div className="mb-6 flex items-center justify-center gap-2.5">
        <BrandMarkIcon className="h-7 w-7" />
        <span className="font-display text-lg italic text-honey-gold-light">{dict.common.brand}</span>
      </div>
      {children}
    </main>
  );

  if (user) {
    return shell(
      <>
        <div className="rounded-[26px] border border-honey-gold/35 bg-[radial-gradient(120%_140%_at_20%_0%,rgba(227,166,62,0.22),transparent_60%)] p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 h-[120px] w-[106px]">
            <HoneyJar fill={0.75} />
          </div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-honey-sage">{t.readyEyebrow}</div>
          <h1 className="mb-2 font-display text-[28px] font-medium leading-tight text-honey-text sm:text-[34px]">{t.readyTitle}</h1>
          <p className="mb-6 text-[15px] leading-relaxed text-honey-text-dim">{t.readyBody}</p>
          <Link
            href={`/${locale}/app`}
            className="block w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-5 py-4 text-[15px] font-extrabold uppercase tracking-[0.04em] text-[#2a1a08] shadow-[0_16px_32px_-10px_rgba(227,166,62,0.55)]"
          >
            {t.readyCta}
          </Link>
        </div>
        <p className="mt-5 text-center text-[12.5px] leading-relaxed text-honey-text-faint">{t.readyKeepAccess}</p>
        {publicEnv.supportEmail ? (
          <p className="mt-4 text-center text-[12.5px]">
            <a href={`mailto:${publicEnv.supportEmail}`} className="text-honey-text-faint underline underline-offset-2">
              {dict.common.support}
            </a>
          </p>
        ) : null}
      </>,
    );
  }

  if (pending) {
    return shell(
      <>
        <div className="rounded-[26px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-6 text-center sm:p-8">
          <div className="mb-4 text-[38px]">⏳</div>
          <h1 className="mb-2 font-display text-[26px] font-medium leading-tight text-honey-text">{t.pendingTitle}</h1>
          <p className="text-[15px] leading-relaxed text-honey-text-dim">{t.pendingBody}</p>
        </div>
        <p className="mt-6 text-center text-[13px]">
          <Link href={`/${locale}/login`} className="font-bold text-honey-gold-light underline underline-offset-2">
            {t.openApp}
          </Link>
        </p>
      </>,
    );
  }

  return shell(
    <>
      <div className="rounded-[26px] border border-honey-gold/35 bg-[radial-gradient(120%_140%_at_20%_0%,rgba(227,166,62,0.22),transparent_60%)] p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 h-[120px] w-[106px]">
          <HoneyJar fill={0.75} />
        </div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-honey-sage">{t.eyebrow}</div>
        <h1 className="mb-2 font-display text-[28px] font-medium leading-tight text-honey-text sm:text-[34px]">{t.title}</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-honey-text-dim">{t.subtitle}</p>

        <ol className="mb-5 flex flex-col gap-3 text-left">
          {t.steps.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-honey-line bg-honey-surface/70 p-3.5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-honey-gold/40 bg-honey-gold/10 font-display text-[13px] italic text-honey-gold-light">
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed text-honey-text">{step}</span>
            </li>
          ))}
        </ol>

        {email ? <p className="mb-2 text-[13.5px] font-bold text-honey-gold-light">{t.emailHint.replace("{email}", email)}</p> : null}
        <p className="text-[12px] text-honey-text-faint">{t.spamHint}</p>
      </div>

      <div className="mt-5 rounded-[22px] border border-honey-line bg-honey-surface p-5">
        <div className="mb-1 text-[15px] font-extrabold text-honey-text">{t.resendTitle}</div>
        <p className="mb-4 text-[13px] leading-relaxed text-honey-text-dim">{t.resendBody}</p>
        <ResendForm
          locale={locale}
          initialEmail={email}
          text={{
            cta: t.resendCta,
            sent: t.resendSent,
            placeholder: dict.login.emailPlaceholder,
            invalid: dict.login.invalidEmail,
            tooSoon: dict.login.tooSoon,
            generic: dict.login.genericError,
          }}
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-[13px]">
        <Link href={`/${locale}/login`} className="font-bold text-honey-gold-light underline underline-offset-2">
          {t.openApp}
        </Link>
        {publicEnv.supportEmail ? (
          <a href={`mailto:${publicEnv.supportEmail}`} className="text-honey-text-faint underline underline-offset-2">
            {dict.common.support}
          </a>
        ) : null}
      </div>
    </>,
  );
}
