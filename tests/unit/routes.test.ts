import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import {
  ROUTES,
  pathFor,
  otherLocale,
  keyForPath,
  LOCALES,
} from "../../src/i18n/routes";

describe("mappa delle rotte", () => {
  it("copre entrambe le lingue per ogni pagina", () => {
    for (const [key, byLocale] of Object.entries(ROUTES)) {
      for (const locale of LOCALES) {
        expect(byLocale[locale], `${key}.${locale}`).toMatch(/^\/(it|en)\//);
      }
    }
  });

  it("ogni percorso inizia con il prefisso della propria lingua", () => {
    for (const byLocale of Object.values(ROUTES)) {
      for (const locale of LOCALES) {
        expect(byLocale[locale].startsWith(`/${locale}/`)).toBe(true);
      }
    }
  });

  it("gli slug italiani e inglesi sono diversi dove lo spec lo richiede", () => {
    expect(pathFor("about", "it")).toBe("/it/chi-sono/");
    expect(pathFor("about", "en")).toBe("/en/about/");
    expect(pathFor("thanks", "it")).toBe("/it/grazie/");
    expect(pathFor("thanks", "en")).toBe("/en/thank-you/");
  });

  it("otherLocale inverte la lingua", () => {
    expect(otherLocale("it")).toBe("en");
    expect(otherLocale("en")).toBe("it");
  });

  it("keyForPath ritrova la pagina da un percorso", () => {
    expect(keyForPath("/en/about/")).toBe("about");
    expect(keyForPath("/it/sconosciuto/")).toBeUndefined();
  });

  it("per ogni rotta esiste un file di pagina", () => {
    for (const byLocale of Object.values(ROUTES)) {
      for (const locale of LOCALES) {
        const slug = byLocale[locale].split("/").filter(Boolean)[1];
        const file = slug
          ? `src/pages/${locale}/${slug}.astro`
          : `src/pages/${locale}/index.astro`;
        expect(existsSync(file), `manca ${file}`).toBe(true);
      }
    }
  });
});
