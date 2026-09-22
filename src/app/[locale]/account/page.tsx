import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUser } from "@/lib/dal";
import { BrandMarkIcon } from "@/components/icons";
import { AccountForm } from "./account-form";
import { signOut } from "./actions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.account.title, robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await getUser();
  if (!user) redirect(`${localePath(locale, "/login")}?next=/account`);
  const dict = await getDictionary(locale);
  const t = dict.account;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-5 pb-10 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <Link href={`/${locale}/app`} className="flex items-center gap-2.5">
          <BrandMarkIcon className="h-[26px] w-[26px]" />
          <span className="font-display text-base italic text-honey-gold-light">{dict.common.brand}</span>
        </Link>
        <Link href={`/${locale}/app`} className="text-[12.5px] font-bold text-honey-text-dim">
          ← {dict.common.openApp}
        </Link>
      </header>

      <h1 className="mb-1 font-display text-[26px] font-medium text-honey-text">{t.title}</h1>
      <p className="mb-6 text-[13.5px] text-honey-text-dim">{t.subtitle}</p>

      <AccountForm locale={locale} email={user.email} reminderOptIn={user.reminderOptIn} text={t} languageLabel={dict.common.language} />

      <section className="mt-6 rounded-[20px] border border-honey-line bg-honey-surface p-4.5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">{t.legalTitle}</div>
        <ul className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-honey-text">
          <li>
            <Link href={`/${locale}/legal/terms`} className="underline underline-offset-2">{dict.landing.footer.terms}</Link>
          </li>
          <li>
            <Link href={`/${locale}/legal/privacy`} className="underline underline-offset-2">{dict.landing.footer.privacy}</Link>
          </li>
          <li>
            <Link href={`/${locale}/legal/refund`} className="underline underline-offset-2">{dict.landing.footer.refund}</Link>
          </li>
          <li>
            <Link href={`/${locale}/support`} className="underline underline-offset-2">{dict.common.support}</Link>
          </li>
        </ul>
      </section>

      <form action={signOut} className="mt-6">
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="w-full rounded-2xl border border-honey-line py-3 text-[13.5px] font-bold text-honey-text-dim">
          {t.logout}
        </button>
      </form>
    </main>
  );
}
