import { describe, it, expect } from "vitest";
import lighthouserc from "../../lighthouserc.json";
import { PAGE_KEYS, LOCALES, pathFor } from "../../src/i18n/routes";

// routes.ts non conosce le 404: non sono una Pagina di contenuto (spec §
// Sitemap), e tests/e2e/a11y.spec.ts le elenca allo stesso modo, a mano.
const URL_404 = [
  "http://localhost/it/404/index.html",
  "http://localhost/en/404/index.html",
];

describe("lighthouserc.json", () => {
  it("misura ogni pagina pubblica della sitemap, comprese le 404 per lingua", () => {
    const attesi = PAGE_KEYS.flatMap((key) =>
      LOCALES.map(
        (locale) => `http://localhost${pathFor(key, locale)}index.html`,
      ),
    ).concat(URL_404);

    expect(new Set(lighthouserc.ci.collect.url)).toEqual(new Set(attesi));
    expect(lighthouserc.ci.collect.url).toHaveLength(attesi.length);
  });

  it("i pattern di assertMatrix colgono solo le pagine del proprio gruppo", () => {
    const attesiPer = {
      home: LOCALES.map(
        (locale) => `http://localhost${pathFor("home", locale)}index.html`,
      ),
      portfolio: LOCALES.map(
        (locale) => `http://localhost${pathFor("portfolio", locale)}index.html`,
      ),
    } as const;

    for (const chiave of ["home", "portfolio"] as const) {
      const attesi = attesiPer[chiave];
      const gruppo = lighthouserc.ci.assert.assertMatrix.find(
        (g) =>
          g.matchingUrlPattern !== ".*" &&
          attesi.every((url) => new RegExp(g.matchingUrlPattern).test(url)),
      );
      if (!gruppo) throw new Error(`nessun gruppo copre ${chiave}`);

      const pattern = new RegExp(gruppo.matchingUrlPattern);
      const colti = lighthouserc.ci.collect.url.filter((url) =>
        pattern.test(url),
      );
      expect(new Set(colti)).toEqual(new Set(attesi));
    }
  });
});
