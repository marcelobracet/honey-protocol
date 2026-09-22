import { notFound, redirect } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { BrandMarkIcon } from "@/components/icons";
import { ConfirmForm } from "./confirm-form";

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { token } = await searchParams;
  if (!token) redirect(`${localePath(locale, "/login")}?error=expired`);
  const dict = await getDictionary(locale);

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px] rounded-[26px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-7 text-center">
        <div className="mb-5 flex items-center justify-center gap-2.5">
          <BrandMarkIcon className="h-7 w-7" />
          <span className="font-display text-lg italic text-honey-gold-light">{dict.common.brand}</span>
        </div>
        <ConfirmForm token={token} locale={locale} loadingLabel={dict.common.loading} buttonLabel={dict.email.login.cta} />
      </div>
    </main>
  );
}
