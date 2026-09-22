import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/** Localized PWA manifest: the home-screen name follows the buyer's language. */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new NextResponse(null, { status: 404 });
  const dict = await getDictionary(locale);

  const manifest: MetadataRoute.Manifest = {
    name: dict.meta.appTitle,
    short_name: dict.meta.appTitle,
    description: dict.meta.description,
    id: `/${locale}/app`,
    start_url: `/${locale}/app`,
    scope: `/${locale}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#241609",
    theme_color: "#241609",
    lang: locale,
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=3600" },
  });
}
