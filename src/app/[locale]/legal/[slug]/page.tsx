import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localeTags, locales } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/get-dictionary";
import { publicEnv } from "@/lib/env";
import { BrandMarkIcon } from "@/components/icons";
import { LEGAL_VERSION } from "@/lib/legal";

const SLUGS = ["terms", "privacy", "refund"] as const;
type Slug = (typeof SLUGS)[number];

function isSlug(value: string): value is Slug {
  return (SLUGS as readonly string[]).includes(value);
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.legal[slug].title };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) notFound();
  const dict = await getDictionary(locale);
  const doc = dict.legal[slug];

  const values = {
    company: publicEnv.companyName || dict.common.brand,
    email: publicEnv.supportEmail || "—",
    days: publicEnv.guaranteeDays,
    date: new Intl.DateTimeFormat(localeTags[locale], { dateStyle: "long" }).format(new Date(LEGAL_VERSION)),
  };

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-10">
      <Link href={`/${locale}`} className="mb-8 flex items-center gap-2.5">
        <BrandMarkIcon className="h-7 w-7" />
        <span className="font-display text-lg italic text-honey-gold-light">{dict.common.brand}</span>
      </Link>

      <h1 className="mb-2 font-display text-[30px] font-medium leading-tight text-honey-text sm:text-[36px]">{doc.title}</h1>
      <p className="mb-8 text-[13px] text-honey-text-faint">{fill(dict.legal.updatedAt, values)}</p>

      {publicEnv.companyAddress ? (
        <p className="mb-8 text-[13px] text-honey-text-dim">
          {values.company}
          {publicEnv.companyId ? ` · ${publicEnv.companyId}` : ""} · {publicEnv.companyAddress}
        </p>
      ) : null}

      <div className="flex flex-col gap-7">
        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-[17px] font-extrabold text-honey-text">{fill(section.title, values)}</h2>
            <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-honey-text-dim">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{fill(p, values)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-honey-line pt-6 text-[12.5px] font-bold uppercase tracking-[0.08em] text-honey-text-dim">
        {SLUGS.filter((s) => s !== slug).map((s) => (
          <Link key={s} href={`/${locale}/legal/${s}`} className="hover:text-honey-text">
            {dict.legal[s].title}
          </Link>
        ))}
        <Link href={`/${locale}/support`} className="hover:text-honey-text">
          {dict.common.support}
        </Link>
      </nav>
    </main>
  );
}
