import type { MetadataRoute } from "next";
import { localeTags, locales } from "@/i18n/config";
import { publicEnv } from "@/lib/env";

const PUBLIC_PATHS = ["", "/quiz", "/legal/terms", "/legal/privacy", "/legal/refund", "/support"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${publicEnv.siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.4,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [localeTags[l], `${publicEnv.siteUrl}/${l}${path}`])),
      },
    })),
  );
}
