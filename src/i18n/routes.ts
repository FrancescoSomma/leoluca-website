export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export type PageKey =
  "home" | "portfolio" | "about" | "faq" | "contact" | "thanks";

export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home: { it: "/it/", en: "/en/" },
  portfolio: { it: "/it/portfolio/", en: "/en/portfolio/" },
  about: { it: "/it/chi-sono/", en: "/en/about/" },
  faq: { it: "/it/faq/", en: "/en/faq/" },
  contact: { it: "/it/contatti/", en: "/en/contact/" },
  thanks: { it: "/it/grazie/", en: "/en/thank-you/" },
};

export function pathFor(key: PageKey, locale: Locale): string {
  return ROUTES[key][locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === "it" ? "en" : "it";
}

export function keyForPath(path: string): PageKey | undefined {
  const normalised = path.endsWith("/") ? path : `${path}/`;
  return (Object.keys(ROUTES) as PageKey[]).find((key) =>
    LOCALES.some((locale) => ROUTES[key][locale] === normalised),
  );
}
