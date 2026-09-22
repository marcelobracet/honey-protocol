import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getRitualDays, getUser } from "@/lib/dal";
import { HoneyApp } from "@/components/app/honey-app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.meta.appTitle, robots: { index: false, follow: false } };
}

export default async function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await getUser();
  if (!user) redirect(`${localePath(locale, "/login")}?next=/app`);

  const [dict, days] = await Promise.all([getDictionary(locale), getRitualDays(user.id)]);

  return (
    <HoneyApp
      locale={locale}
      text={dict.app}
      brand={dict.common.brand}
      initialDays={days}
      displayName={user.displayName ?? user.email.split("@")[0]}
      hasOnboarded={Boolean(user.onboardedAt)}
      timezone={user.timezone}
    />
  );
}
