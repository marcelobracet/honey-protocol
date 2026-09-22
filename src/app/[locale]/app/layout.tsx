import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getOwnEntitlement, getUser } from "@/lib/dal";
import { BrandMarkIcon } from "@/components/icons";
import { signOut } from "@/app/[locale]/account/actions";

/**
 * Gate for everything under /app: needs a session AND an active entitlement.
 * A refunded buyer keeps a valid cookie but sees the "blocked" screen.
 */
export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getUser();
  if (!user) redirect(`${localePath(locale, "/login")}?next=/app`);

  const entitlement = await getOwnEntitlement();
  if (!entitlement || entitlement.status !== "active") {
    const dict = await getDictionary(locale);
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px] rounded-[26px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-7 text-center">
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <BrandMarkIcon className="h-7 w-7" />
            <span className="font-display text-lg italic text-honey-gold-light">{dict.common.brand}</span>
          </div>
          <h1 className="mb-2 font-display text-[24px] font-medium text-honey-text">{dict.blocked.title}</h1>
          <p className="mb-6 text-[14px] leading-relaxed text-honey-text-dim">{dict.blocked.body}</p>
          <Link
            href={`/${locale}/support`}
            className="block w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-4 py-3.5 text-[14px] font-extrabold text-[#2a1a08]"
          >
            {dict.blocked.cta}
          </Link>
          <form action={signOut} className="mt-3">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="text-[13px] font-semibold text-honey-text-dim underline underline-offset-2">
              {dict.common.logout}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
