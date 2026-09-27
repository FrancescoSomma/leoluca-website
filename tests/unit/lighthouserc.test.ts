import { describe, it, expect } from "vitest";
import lighthouserc from "../../lighthouserc.json";
import { PAGE_KEYS, LOCALES, pathFor } from "../../src/i18n/routes";

// routes.ts non conosce le 404: non sono una Pagina di contenuto (spec §
// Sitemap), e tests/e2e/a11y.spec.ts le elenca allo stesso modo, a mano.
const URL_404 = [
  "http://localhost/it/404/index.html",
  "http://localhost/en/404/index.html",
];

// lhci confronta i pattern con lhr.finalUrl, che contiene la porta del server
// statico: un pattern ancorato a "localhost/" passerebbe senza porta e non
// coglierebbe nulla.
const comeLhci = (url: string) => url.replace("localhost", "localhost:4173");

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
          attesi.every((url) =>
            new RegExp(g.matchingUrlPattern).test(comeLhci(url)),
          ),
      );
      if (!gruppo) throw new Error(`nessun gruppo copre ${chiave}`);

      const pattern = new RegExp(gruppo.matchingUrlPattern);
      const colti = lighthouserc.ci.collect.url.filter((url) =>
        pattern.test(comeLhci(url)),
      );
      expect(new Set(colti)).toEqual(new Set(attesi));
    }
  });

  // Senza questo gruppo lhci passa con [], come se tutto fosse in regola.
  it("il gruppo .* asserta CLS, accessibilità e script su ogni pagina", () => {
    const tutte = lighthouserc.ci.assert.assertMatrix.find(
      (g) => g.matchingUrlPattern === ".*",
    );

    expect(tutte?.assertions).toEqual({
      "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      "categories:accessibility": ["error", { minScore: 1 }],
      "resource-summary:script:size": ["error", { maxNumericValue: 51200 }],
    });
  });
});
