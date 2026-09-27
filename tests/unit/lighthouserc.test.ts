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
});
