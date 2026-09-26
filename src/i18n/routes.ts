export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const PAGE_KEYS = [
  "home",
  "portfolio",
  "about",
  "faq",
  "contact",
  "thanks",
] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

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
  return PAGE_KEYS.find((key) =>
    LOCALES.some((locale) => ROUTES[key][locale] === normalised),
  );
}
