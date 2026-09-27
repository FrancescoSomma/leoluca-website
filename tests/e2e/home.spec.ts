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

// Controllo grezzo sul poster: resta anche con il test più severo sotto,
// perché isola l'attributo dell'elemento invece del calcolo del browser.
test("il primo elemento del contenuto principale è una fotografia eager, non del testo", async ({
  page,
}) => {
  await page.goto(pathFor("home", "it"));
  const primo = page.locator("main img").first();
  await expect(primo).toHaveAttribute("loading", "eager");
});

// US-1: "l'elemento LCP della home è una fotografia, non del testo". Si
// misura l'LCP vero (PerformanceObserver, bufferizzato, dopo networkidle),
// non solo l'attributo loading (Ruling R44): quello sopra prova che il
// poster è marcato eager, questo prova che il browser lo sceglie davvero
// come elemento più grande.
const VIEWPORT_TELEFONO = { width: 390, height: 844 };
const VIEWPORT_DESKTOP = { width: 1440, height: 900 };

for (const locale of LOCALES) {
  for (const viewport of [VIEWPORT_TELEFONO, VIEWPORT_DESKTOP]) {
    test(`a ${viewport.width}px l'LCP di ${pathFor("home", locale)} è il poster dell'hero`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(pathFor("home", locale), { waitUntil: "networkidle" });

      const lcp = await page.evaluate(
        () =>
          new Promise<{
            tag: string | null;
            dentroHero: boolean;
            currentSrc: string | null;
            larghezzaResa: number | null;
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
            // subito dopo observe(): l'attesa serve solo a lasciarla
            // avvenire prima di leggere `ultima`.
            setTimeout(() => {
              osservatore.disconnect();
              const elemento = (
                ultima as unknown as { element?: Element } | undefined
              )?.element;
              if (!elemento) return resolve(null);
              resolve({
                tag: elemento.tagName,
                dentroHero: elemento.closest(".hero") != null,
                currentSrc:
                  "currentSrc" in elemento
                    ? (elemento as HTMLImageElement).currentSrc
                    : null,
                larghezzaResa: elemento.getBoundingClientRect().width,
              });
            }, 250);
          }),
      );

      if (lcp === null)
        throw new Error("nessuna voce largest-contentful-paint osservata");
      expect(lcp.tag).toBe("IMG");
      expect(lcp.dentroHero).toBe(true);
      expect(lcp.currentSrc).toMatch(/\.avif(\?|$)/);
      // eslint-disable-next-line no-console
      console.log(
        `LCP ${locale} @${viewport.width}px: tag=${lcp.tag} dentroHero=${lcp.dentroHero} larghezzaResa=${lcp.larghezzaResa} viewport=${viewport.width} currentSrc=${lcp.currentSrc}`,
      );
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

  function contaRichiesteClip(page: import("@playwright/test").Page) {
    const stato = { conteggio: 0 };
    page.route(`**${SORGENTE_FINTA}`, async (route) => {
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
    const stato = contaRichiesteClip(page);
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
    const stato = contaRichiesteClip(page);
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
    const stato = contaRichiesteClip(page);
    await iniettaMarkupClip(page, pathFor("home", "it"));
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.goto(pathFor("home", "it"), { waitUntil: "load" });

    await expect.poll(() => stato.conteggio).toBeGreaterThan(0);

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
