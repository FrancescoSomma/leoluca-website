import { test, expect } from "@playwright/test";
import { LOCALES, pathFor } from "../../src/i18n/routes";
import { t } from "../../src/i18n/ui";

// US-1: "da 10 a 15 foto di richiamo".
test("la home mostra fra dieci e quindici foto di richiamo", async ({
  page,
}) => {
  await page.goto(pathFor("home", "it"));
  const conteggio = await page.locator(".richiamo img").count();
  expect(conteggio).toBeGreaterThanOrEqual(10);
  expect(conteggio).toBeLessThanOrEqual(15);
});

// Controllo grezzo sul poster: resta anche con i test più severi sotto,
// perché isola l'attributo dell'elemento invece del calcolo del browser.
test("il primo elemento del contenuto principale è una fotografia eager, non del testo", async ({
  page,
}) => {
  await page.goto(pathFor("home", "it"));
  const primo = page.locator("main img").first();
  await expect(primo).toHaveAttribute("loading", "eager");
});

// Si misura l'LCP vero (PerformanceObserver, bufferizzato, dopo
// networkidle), non solo l'attributo loading (Ruling R44): quello sopra
// prova che il poster è marcato eager, questo prova che il browser lo
// sceglie davvero come elemento più grande.
const VIEWPORT_TELEFONO = { width: 390, height: 844 };
const VIEWPORT_DESKTOP = { width: 1440, height: 900 };

async function misuraLcp(page: import("@playwright/test").Page) {
  return page.evaluate(
    () =>
      new Promise<{
        tag: string | null;
        dentroHero: boolean;
        currentSrc: string | null;
      } | null>((resolve) => {
        let ultima: PerformanceEntry | undefined;
        const osservatore = new PerformanceObserver((lista) => {
          const voci = lista.getEntries();
          if (voci.length > 0) ultima = voci[voci.length - 1];
        });
        osservatore.observe({
          type: "largest-contentful-paint",
          buffered: true,
        });
        // I candidati bufferizzati arrivano in una singola invocazione
        // subito dopo observe(): l'attesa serve solo a lasciarla avvenire
        // prima di leggere `ultima`.
        setTimeout(() => {
          osservatore.disconnect();
          // Niente `as`: si narrowa con `instanceof` (docs/07), sia sul
          // tipo dell'entry sia su quello dell'elemento.
          if (!(ultima instanceof LargestContentfulPaint) || !ultima.element) {
            return resolve(null);
          }
          const elemento = ultima.element;
          resolve({
            tag: elemento.tagName,
            dentroHero: elemento.closest(".hero") != null,
            currentSrc:
              elemento instanceof HTMLImageElement ? elemento.currentSrc : null,
          });
        }, 250);
      }),
  );
}

for (const locale of LOCALES) {
  for (const viewport of [VIEWPORT_TELEFONO, VIEWPORT_DESKTOP]) {
    // US-1: "l'elemento LCP della home è una fotografia, non del testo".
    // Vincolante a ogni larghezza, a differenza del test sotto: non basta
    // che l'LCP sia "fallito come previsto" per il motivo sbagliato (per
    // esempio perché è diventato il testo del motto).
    test(`a ${viewport.width}px l'LCP della home è una fotografia, non del testo (${locale})`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(pathFor("home", locale), { waitUntil: "networkidle" });
      const lcp = await misuraLcp(page);
      if (lcp === null)
        throw new Error("nessuna voce largest-contentful-paint osservata");
      expect(lcp.tag).toBe("IMG");
      expect(lcp.currentSrc).toMatch(/\.avif(\?|$)/);
    });

    // Spec § Hero, punto 1: "l'elemento LCP è un poster". Solo questo
    // secondo criterio, più specifico, è rimandato sotto i 768px.
    test(`a ${viewport.width}px l'LCP della home è il poster dell'hero (${locale})`, async ({
      page,
    }) => {
      // Deciso da Francesco durante il Task 9 (vedi il piano, Task 9,
      // Modifica 2026-09-27): sotto i 768px, senza CSS oltre alla regola di
      // reflow, l'LCP è la prima foto di richiamo e non il poster (spec §
      // Hero punto 1). Non è un difetto di questo componente da correggere
      // qui: è rimandato al piano di stile. L'asserzione sotto resta
      // invariata, così quando il piano di stile sistema l'hero Playwright
      // segnala "expected to fail, but passed" e il rimando si nota.
      test.fail(
        viewport.width < 768,
        "sotto i 768px l'LCP è la prima foto di richiamo, non il poster: rimandato al piano di stile (decisione di Francesco, Task 9)",
      );

      await page.setViewportSize(viewport);
      await page.goto(pathFor("home", locale), { waitUntil: "networkidle" });
      const lcp = await misuraLcp(page);
      if (lcp === null)
        throw new Error("nessuna voce largest-contentful-paint osservata");
      expect(lcp.dentroHero).toBe(true);
    });
  }
}

// WCAG 2.2 AA 1.4.10, come in portfolio.spec.ts: axe non lo rileva (spec §
// Dispositivi e larghezze), si verifica lo scroll a 320px.
for (const locale of LOCALES) {
  test(`a 320px ${pathFor("home", locale)} non scorre in orizzontale`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(pathFor("home", locale), { waitUntil: "networkidle" });
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });
}

test("la home ha un collegamento esplicito al portfolio", async ({ page }) => {
  await page.goto(pathFor("home", "it"));
  await expect(
    page
      .locator("main")
      .getByRole("link", { name: t("it", "home.toPortfolio") }),
  ).toHaveCount(1);
});

// Stesso vincolo di tests/e2e/portfolio.spec.ts ("ogni src e ogni
// candidato di srcset viene dai derivati /_astro/ in avif o webp"): lì si
// verifica solo /it/portfolio/, qui si ripete per la home (poster e foto
// di richiamo), nelle due lingue. Il commento esteso sul perché il solo
// prefisso /_astro/ non basta (passerebbe un originale ricopiato lì sotto,
// o un ripiego .png) vive in portfolio.spec.ts, vicino a questa stessa
// costante.
const DERIVATO = /^\/_astro\/[^?#]+\.(avif|webp)$/;

for (const locale of LOCALES) {
  test(`${pathFor("home", locale)} ogni src e ogni candidato di srcset viene dai derivati /_astro/ in avif o webp`, async ({
    page,
  }) => {
    await page.goto(pathFor("home", locale));
    const elementi = await page.locator("img, source").evaluateAll((els) =>
      els.map((el) => ({
        src: el.getAttribute("src"),
        srcset: el.getAttribute("srcset"),
      })),
    );
    expect(elementi.length).toBeGreaterThan(0);
    for (const { src, srcset } of elementi) {
      if (src) expect(src).toMatch(DERIVATO);
      if (srcset) {
        const candidati = srcset
          .split(",")
          .map((c) => c.trim().split(/\s+/)[0]);
        expect(candidati.length).toBeGreaterThan(0);
        for (const candidato of candidati) {
          expect(candidato).toMatch(DERIVATO);
        }
      }
    }
  });
}

// Ruling R43: il contenuto reale non ha ancora una clip (hero_clip è
// facoltativo e impostazioni.json non lo valorizza). Si inietta il markup
// del video via page.route sulla pagina già costruita, per esercitare lo
// script di Hero.astro senza dover mettere in pagine.json una clip finta.
test.describe("clip dell'hero (markup iniettato: il contenuto non ha ancora una clip)", () => {
  const SORGENTE_FINTA = "/finto-clip.webm";
  const MARKUP_CLIP = `<video class="clip" muted loop playsinline preload="none" hidden width="2400" height="1600" data-src="${SORGENTE_FINTA}"></video>`;

  async function iniettaMarkupClip(
    page: import("@playwright/test").Page,
    percorso: string,
  ) {
    await page.route(`**${percorso}`, async (route) => {
      const risposta = await route.fetch();
      const html = await risposta.text();
      if (!html.includes("</picture>")) {
        throw new Error("</picture> non trovata: il markup di Hero è cambiato");
      }
      await route.fulfill({
        response: risposta,
        body: html.replace("</picture>", `</picture>${MARKUP_CLIP}`),
      });
    });
  }

  async function contaRichiesteClip(page: import("@playwright/test").Page) {
    const stato = { conteggio: 0 };
    await page.route(`**${SORGENTE_FINTA}`, async (route) => {
      stato.conteggio += 1;
      await route.fulfill({
        status: 200,
        contentType: "video/webm",
        body: Buffer.alloc(0),
      });
    });
    return stato;
  }

  test("a 390px non scarica la clip", async ({ page }) => {
    const stato = await contaRichiesteClip(page);
    await iniettaMarkupClip(page, pathFor("home", "it"));
    await page.setViewportSize(VIEWPORT_TELEFONO);
    await page.goto(pathFor("home", "it"), { waitUntil: "load" });
    // Attesa breve: il ramo mobile non deve mai chiamare load()/src.
    await page.waitForTimeout(300);
    expect(stato.conteggio).toBe(0);
  });

  test("a 1440px con prefers-reduced-motion non scarica la clip", async ({
    page,
  }) => {
    const stato = await contaRichiesteClip(page);
    await iniettaMarkupClip(page, pathFor("home", "it"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.goto(pathFor("home", "it"), { waitUntil: "load" });
    await page.waitForTimeout(300);
    expect(stato.conteggio).toBe(0);
  });

  test("a 1440px senza reduced motion scarica la clip dopo il load e la scambia col poster a dati pronti", async ({
    page,
  }) => {
    const stato = await contaRichiesteClip(page);
    await iniettaMarkupClip(page, pathFor("home", "it"));
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.goto(pathFor("home", "it"), { waitUntil: "load" });

    await expect.poll(() => stato.conteggio).toBeGreaterThan(0);

    // "Dopo il load": non basta che la richiesta avvenga, deve avvenire
    // dopo l'evento load della finestra. Si confronta lo startTime della
    // voce di resource timing della clip con loadEventStart della voce di
    // navigazione: un valore prima violerebbe spec § Hero punto 2 ("la
    // clip parte dopo l'LCP").
    const tempi = await page.evaluate((sorgente) => {
      // Niente `as`: si narrowa con `instanceof` (docs/07), come per
      // LargestContentfulPaint in misuraLcp.
      const nav = performance.getEntriesByType("navigation")[0];
      if (!(nav instanceof PerformanceNavigationTiming)) {
        throw new Error("voce di navigazione mancante o del tipo sbagliato");
      }
      const risorsa = performance
        .getEntriesByType("resource")
        .find((voce) => voce.name.endsWith(sorgente));
      return {
        loadEventStart: nav.loadEventStart,
        clipStartTime: risorsa?.startTime ?? null,
      };
    }, SORGENTE_FINTA);
    if (tempi.clipStartTime === null)
      throw new Error("nessuna voce di resource timing per la clip finta");
    expect(tempi.clipStartTime).toBeGreaterThanOrEqual(tempi.loadEventStart);

    // Il file finto (fulfill vuoto) non raggiungerà mai da solo
    // readyState HAVE_CURRENT_DATA: si dispatcha loadeddata a mano per
    // verificare lo scambio poster/video (Ruling R43).
    const scambiato = await page.evaluate(() => {
      const video = document.querySelector<HTMLVideoElement>(".hero .clip");
      const picture = document.querySelector<HTMLElement>(".hero picture");
      if (!video || !picture) return null;
      video.dispatchEvent(new Event("loadeddata"));
      return { pictureHidden: picture.hidden, videoHidden: video.hidden };
    });
    expect(scambiato).toEqual({ pictureHidden: true, videoHidden: false });
  });
});
