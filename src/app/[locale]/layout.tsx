import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, localeTags, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { publicEnv } from "@/lib/env";
import { ConsentBanner } from "@/components/consent-banner";
import { MetaPixel } from "@/components/meta-pixel";
import { GoogleAnalytics } from "@/components/google-analytics";
import { UtmCapture } from "@/components/utm-capture";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type Params = Promise<{ locale: string }>;

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  const languages = Object.fromEntries(locales.map((l) => [localeTags[l], `${publicEnv.siteUrl}/${l}`]));
  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: dict.meta.title, template: `%s · ${dict.common.brand}` },
    description: dict.meta.description,
    applicationName: dict.meta.appTitle,
    alternates: { canonical: `/${locale}`, languages: { ...languages, "x-default": `${publicEnv.siteUrl}/en` } },
    openGraph: {
      type: "website",
      locale: localeTags[locale].replace("-", "_"),
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: dict.common.brand,
      url: `/${locale}`,
    },
    manifest: `/${locale}/manifest.webmanifest`,
    icons: { apple: "/icons/180" },
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: dict.meta.appTitle },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#241609",
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <html lang={localeTags[locale]} className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <UtmCapture />
        <MetaPixel pixelId={publicEnv.metaPixelId} />
        <GoogleAnalytics measurementId={publicEnv.ga4Id} />
        <ConsentBanner locale={locale} text={dict.consent} />
      </body>
    </html>
  );
}
