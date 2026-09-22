import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUser } from "@/lib/dal";
import { publicEnv } from "@/lib/env";
import { BrandMarkIcon } from "@/components/icons";
import { Interpolate } from "@/components/rich-text";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { next, error } = await searchParams;

  if (await getUser()) redirect(localePath(locale, "/app"));

  const dict = await getDictionary(locale);
  const t = dict.login;

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-[420px]">
        <Link href={`/${locale}`} className="mb-6 flex items-center justify-center gap-2.5">
          <BrandMarkIcon className="h-7 w-7" />
          <span className="font-display text-lg italic text-honey-gold-light">{dict.common.brand}</span>
        </Link>

        <div className="rounded-[26px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-6 sm:p-7">
          {error === "expired" ? (
            <div className="mb-5 rounded-2xl border border-honey-rust/40 bg-honey-rust/10 px-4 py-3 text-[13px] leading-relaxed text-honey-text">
              <div className="mb-0.5 font-extrabold">{t.expiredTitle}</div>
              {t.expiredBody}
            </div>
          ) : null}
          {error === "generic" ? (
            <div className="mb-5 rounded-2xl border border-honey-rust/40 bg-honey-rust/10 px-4 py-3 text-[13px] leading-relaxed text-honey-text">
              {t.genericError}
            </div>
          ) : null}
          {error === "blocked" ? (
            <div className="mb-5 rounded-2xl border border-honey-rust/40 bg-honey-rust/10 px-4 py-3 text-[13px] leading-relaxed text-honey-text">
              <div className="mb-0.5 font-extrabold">{dict.blocked.title}</div>
              {dict.blocked.body}{" "}
              <Link href={`/${locale}/support`} className="font-bold underline underline-offset-2">
                {dict.blocked.cta}
              </Link>
            </div>
          ) : null}

          <h1 className="mb-2 font-display text-[26px] font-medium leading-tight text-honey-text">{t.title}</h1>
          <p className="mb-6 text-[14px] leading-relaxed text-honey-text-dim">{t.subtitle}</p>

          <LoginForm locale={locale} next={next} text={t} />

          <p className="mt-5 text-[11.5px] leading-relaxed text-honey-text-faint">
            <Interpolate
              template={t.termsNotice}
              values={{
                terms: (
                  <Link href={`/${locale}/legal/terms`} className="underline underline-offset-2">
                    {dict.landing.footer.terms}
                  </Link>
                ),
                privacy: (
                  <Link href={`/${locale}/legal/privacy`} className="underline underline-offset-2">
                    {dict.landing.footer.privacy}
                  </Link>
                ),
              }}
            />
          </p>
        </div>

        <p className="mt-6 text-center text-[13px] text-honey-text-dim">
          {t.noPurchase}{" "}
          <Link href={`/${locale}`} className="font-bold text-honey-gold-light underline underline-offset-2">
            {t.buyInstead}
          </Link>
        </p>
        {publicEnv.supportEmail ? (
          <p className="mt-2 text-center text-[12px] text-honey-text-faint">
            <a href={`mailto:${publicEnv.supportEmail}`} className="underline underline-offset-2">
              {dict.common.support}
            </a>
          </p>
        ) : null}
      </div>
    </main>
  );
}
