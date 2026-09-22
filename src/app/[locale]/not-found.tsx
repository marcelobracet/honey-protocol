"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

// Kept inline (and not in the dictionaries) so this page needs no request-time
// APIs and the locale routes stay statically prerenderable.
const TEXT: Record<Locale, { title: string; body: string; cta: string }> = {
  pt: { title: "Página não encontrada", body: "O endereço pode estar errado ou a página foi movida.", cta: "Ir para o início" },
  en: { title: "Page not found", body: "The address may be wrong or the page has moved.", cta: "Go to the home page" },
  es: { title: "Página no encontrada", body: "La dirección puede estar mal o la página se movió.", cta: "Ir al inicio" },
  fr: { title: "Page introuvable", body: "L'adresse est peut-être erronée ou la page a été déplacée.", cta: "Retour à l'accueil" },
  it: { title: "Pagina non trovata", body: "L'indirizzo potrebbe essere sbagliato o la pagina è stata spostata.", cta: "Vai alla home" },
  de: { title: "Seite nicht gefunden", body: "Die Adresse ist vielleicht falsch oder die Seite wurde verschoben.", cta: "Zur Startseite" },
};

export default function NotFound() {
  const pathname = usePathname();
  const first = pathname.split("/")[1];
  const locale: Locale = isLocale(first) ? first : defaultLocale;
  const t = TEXT[locale];

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16 text-center">
      <div>
        <div className="mb-4 text-[40px]">🍯</div>
        <h1 className="mb-2 font-display text-[28px] font-medium text-honey-text">{t.title}</h1>
        <p className="mb-6 text-[14.5px] text-honey-text-dim">{t.body}</p>
        <Link
          href={`/${locale}`}
          className="inline-block rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-6 py-3.5 text-[14px] font-extrabold text-[#2a1a08]"
        >
          {t.cta}
        </Link>
      </div>
    </main>
  );
}
