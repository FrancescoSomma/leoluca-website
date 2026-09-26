import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Lettura diretta del fixture, non import di load.ts: importare load.ts
// trascina astro/zod dentro Playwright (nodo separato dal build), rischio
// evitabile qui perché serve solo il campo alt_it/alt_en/ordine del JSON.
// `import ... with { type: "json" }` funzionerebbe su Node 24, ma lega il
// test alla versione di Node invece che restare portabile.
const percorsoFoto = fileURLToPath(
  new URL("../../src/content/foto.json", import.meta.url),
);
interface FotoFixture {
  ordine: number;
  alt_it: string;
  alt_en: string;
}
// JSON.parse restituisce `any`: l'annotazione sulla dichiarazione tipizza la
// lettura senza ricorrere a un cast `as` (docs/07-convenzioni-codice.md).
const fotoJson: FotoFixture[] = JSON.parse(readFileSync(percorsoFoto, "utf-8"));
const FOTO_ORDINATE = [...fotoJson].sort((a, b) => a.ordine - b.ordine);

test("il portfolio è una sequenza unica senza filtri", async ({ page }) => {
  await page.goto("/it/portfolio/");
  await expect(page.getByRole("img")).not.toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /filtr|categor/i }),
  ).toHaveCount(0);
});

test("solo le prime tre immagini sono eager", async ({ page }) => {
  await page.goto("/it/portfolio/");
  const eager = page.locator('img[loading="eager"]');
  await expect(eager).toHaveCount(3);
});

test("ogni immagine ha un testo alternativo non vuoto", async ({ page }) => {
  await page.goto("/it/portfolio/");
  for (const alt of await page
    .locator("img")
    .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")))) {
    expect(alt?.trim()).toBeTruthy();
  }
});

test("l'ordine è stabile tra due caricamenti", async ({ page }) => {
  const leggi = async () => {
    await page.goto("/it/portfolio/");
    return page
      .locator("img")
      .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
  };
  expect(await leggi()).toEqual(await leggi());
});

test("l'ordine del flusso italiano segue il campo ordine", async ({ page }) => {
  await page.goto("/it/portfolio/");
  const alts = await page
    .locator("img")
    .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
  expect(alts).toEqual(FOTO_ORDINATE.map((f) => f.alt_it));
});

test("l'ordine del flusso inglese segue il campo ordine", async ({ page }) => {
  await page.goto("/en/portfolio/");
  const alts = await page
    .locator("img")
    .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
  expect(alts).toEqual(FOTO_ORDINATE.map((f) => f.alt_en));
});

// US-2: nessun originale raggiungibile dal markup, nessun JPEG servito. In
// sviluppo gli URL sarebbero /_image?href=… con l'originale codificato; sulla
// pagina costruita (npm run build, poi preview) devono essere derivati sotto
// /_astro/. Il test del container di Foto.astro non basta: verifica il
// contratto del componente, non l'output reale dopo la build.
test("ogni src e ogni candidato di srcset viene dai derivati /_astro/", async ({
  page,
}) => {
  await page.goto("/it/portfolio/");
  const elementi = await page.locator("img, source").evaluateAll((els) =>
    els.map((el) => ({
      src: el.getAttribute("src"),
      srcset: el.getAttribute("srcset"),
    })),
  );
  expect(elementi.length).toBeGreaterThan(0);
  for (const { src, srcset } of elementi) {
    if (src) expect(src.startsWith("/_astro/")).toBe(true);
    if (srcset) {
      const candidati = srcset.split(",").map((c) => c.trim().split(/\s+/)[0]);
      expect(candidati.length).toBeGreaterThan(0);
      for (const candidato of candidati) {
        expect(candidato.startsWith("/_astro/")).toBe(true);
      }
    }
  }
});

// WCAG 2.2 AA 1.4.10 (spec § Dispositivi e larghezze): senza la regola di
// reflow di Foto.astro, l'<img> si dichiara alla larghezza dei propri
// attributi (1600 o 2400 px CSS) e a 320 px la pagina scorre in
// orizzontale. È il pavimento, non uno screenshot: si verifica qui perché
// axe non lo rileva (spec § Dispositivi e larghezze).
for (const percorso of ["/it/portfolio/", "/en/portfolio/"]) {
  test(`a 320px ${percorso} non scorre in orizzontale`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(percorso, { waitUntil: "networkidle" });
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });
}
