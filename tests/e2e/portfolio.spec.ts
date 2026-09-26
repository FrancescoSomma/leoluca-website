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

// Scoperta dei prototipi: il lazy loading nativo di Chrome anticipa di circa
// 1250px, e a 390px con immagini basse ne richiede 6 anche se solo 3 hanno
// loading="eager". Contare l'attributo non prova quante immagini vengono
// davvero richieste prima di ogni scorrimento: va contato il traffico di
// rete. Se questo test fallisce non si allenta: è una decisione da portare a
// un umano (vedi task-7-brief.md).
for (const width of [390, 1440]) {
  test(`al massimo 3 immagini del flusso richieste al primo render (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const richiesteImmagini: string[] = [];
    page.on("request", (request) => {
      if (
        request.resourceType() === "image" &&
        new URL(request.url()).pathname.startsWith("/_astro/")
      ) {
        richiesteImmagini.push(request.url());
      }
    });
    await page.goto("/it/portfolio/", { waitUntil: "networkidle" });
    expect(richiesteImmagini.length).toBeLessThanOrEqual(3);
  });
}
