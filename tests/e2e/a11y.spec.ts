import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  PAGE_KEYS,
  LOCALES,
  pathFor,
  otherLocale,
} from "../../src/i18n/routes";
import { t } from "../../src/i18n/ui";

const TAG_WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const key of PAGE_KEYS) {
  for (const locale of LOCALES) {
    const percorso = pathFor(key, locale);

    test(`${percorso} non ha violazioni axe`, async ({ page }) => {
      await page.goto(percorso);
      const esito = await new AxeBuilder({ page }).withTags(TAG_WCAG).analyze();
      expect(esito.violations).toEqual([]);
    });

    test(`${percorso} dichiara lang e hreflang verso la controparte`, async ({
      page,
    }) => {
      await page.goto(percorso);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);

      const pathnameAtteso = {
        it: pathFor(key, "it"),
        en: pathFor(key, "en"),
        "x-default": pathFor(key, "it"),
      } as const;

      for (const hreflang of ["it", "en", "x-default"] as const) {
        const link = page.locator(
          `link[rel="alternate"][hreflang="${hreflang}"]`,
        );
        await expect(link).toHaveCount(1);
        const href = await link.getAttribute("href");
        if (href === null)
          throw new Error(`href mancante per hreflang="${hreflang}"`);
        expect(new URL(href).pathname).toBe(pathnameAtteso[hreflang]);
      }

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const canonicalHref = await canonical.getAttribute("href");
      if (canonicalHref === null)
        throw new Error("href mancante per link[rel=canonical]");
      expect(new URL(canonicalHref).pathname).toBe(pathFor(key, locale));
    });

    test(`${percorso} il nav porta alla home`, async ({ page }) => {
      await page.goto(percorso);
      const homeLink = page
        .getByRole("navigation")
        .getByRole("link", { name: "Leo Luca Iacoviello" });
      await expect(homeLink).toHaveAttribute("href", pathFor("home", locale));
    });

    test(`${percorso} il selettore lingua punta alla controparte`, async ({
      page,
    }) => {
      await page.goto(percorso);
      const selettore = page.locator("nav a[hreflang]");
      await expect(selettore).toHaveCount(1);
      await expect(selettore).toHaveAttribute(
        "href",
        pathFor(key, otherLocale(locale)),
      );
    });
  }
}

const PAGINE_404 = [
  { percorso: "/it/404/", locale: "it" },
  { percorso: "/en/404/", locale: "en" },
] as const;

for (const { percorso, locale } of PAGINE_404) {
  test(`${percorso} non ha violazioni axe`, async ({ page }) => {
    await page.goto(percorso);
    const esito = await new AxeBuilder({ page }).withTags(TAG_WCAG).analyze();
    expect(esito.violations).toEqual([]);
  });

  test(`${percorso} dichiara lang="${locale}"`, async ({ page }) => {
    await page.goto(percorso);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
  });

  test(`${percorso} il nav porta alla home`, async ({ page }) => {
    await page.goto(percorso);
    const homeLink = page
      .getByRole("navigation")
      .getByRole("link", { name: "Leo Luca Iacoviello" });
    await expect(homeLink).toHaveAttribute("href", pathFor("home", locale));
  });

  test(`${percorso} il selettore lingua punta alla home dell'altra lingua`, async ({
    page,
  }) => {
    await page.goto(percorso);
    const selettore = page.locator("nav a[hreflang]");
    await expect(selettore).toHaveCount(1);
    await expect(selettore).toHaveAttribute(
      "href",
      pathFor("home", otherLocale(locale)),
    );
  });
}

test("il cambio lingua resta sulla stessa pagina", async ({ page }) => {
  await page.goto("/it/chi-sono/");
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/about\/$/);
});

for (const locale of LOCALES) {
  const percorso = pathFor("home", locale);

  test(`${percorso} i collegamenti del nav non si toccano`, async ({
    page,
  }) => {
    await page.goto(percorso);

    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      const link = page.getByRole("navigation").getByRole("link");
      const count = await link.count();
      expect(count).toBeGreaterThan(1);

      const riquadri = [];
      for (let i = 0; i < count; i++) {
        const riquadro = await link.nth(i).boundingBox();
        if (riquadro === null)
          throw new Error(`riquadro mancante per il link ${i}`);
        riquadri.push(riquadro);
      }

      for (let i = 0; i < riquadri.length - 1; i++) {
        const attuale = riquadri[i];
        const successivo = riquadri[i + 1];
        const stessaRiga = Math.abs(attuale.y - successivo.y) <= 1;
        if (stessaRiga) {
          expect(successivo.x).toBeGreaterThan(attuale.x + attuale.width);
        }
      }
    }
  });
}

for (const locale of LOCALES) {
  const percorso = pathFor("home", locale);

  test(`${percorso} lo skip link porta al contenuto da tastiera`, async ({
    page,
  }) => {
    await page.goto(percorso);
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", {
      name: t(locale, "skip.content"),
    });
    await expect(skipLink).toBeFocused();

    const skipBox = await skipLink.boundingBox();
    if (skipBox === null) throw new Error("riquadro mancante per lo skip link");
    const navLinks = page.getByRole("navigation").getByRole("link");
    const numeroLinkNav = await navLinks.count();
    for (let i = 0; i < numeroLinkNav; i++) {
      const navBox = await navLinks.nth(i).boundingBox();
      if (navBox === null)
        throw new Error(`riquadro mancante per il link nav ${i}`);
      const siSovrappongono =
        skipBox.x < navBox.x + navBox.width &&
        skipBox.x + skipBox.width > navBox.x &&
        skipBox.y < navBox.y + navBox.height &&
        skipBox.y + skipBox.height > navBox.y;
      expect(siSovrappongono).toBe(false);
    }

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenuto$/);
    await expect(page.locator("main:target")).toHaveCount(1);
  });
}
