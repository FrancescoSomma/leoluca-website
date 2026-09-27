import { describe, it, expect, vi, beforeEach } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { escapeHTML } from "astro/runtime/server/index.js";
import { t, type UiKey } from "../../src/i18n/ui";
import type { Locale } from "../../src/i18n/routes";

// Astro escapa gli attributi in modo diverso dal testo: solo "&" e '"'
// (render/util.js, toAttributeString), non l'apostrofo. escapeHTML, usato
// per title/h1/corpo che sono testo, escaperebbe anche l'apostrofo e
// darebbe un falso negativo su un attributo come content="...".
function escapeAttributo(valore: string): string {
  return valore.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// Fixture con l'italiano e l'inglese: contiene un apostrofo e una "&" per
// verificare il testo DOPO l'escape di Astro (title, meta description e
// corpo sono tutti interpolati con {espressione}, quindi tutti escapati).
// corpo_en di "contact" è vuoto apposta: US-8 lo consente, e la pagina non
// deve rendere un <p> quando manca. seo_title_en e seo_description_en sono
// valorizzati su ogni voce: dopo la fusione col Task 7 lo schema li rende
// obbligatori, e una fixture che li ometta va rossa per un motivo estraneo
// ai casi che questi test vogliono esercitare.
const PAGINE_JSON_FIXTURE = [
  {
    slug: "contact",
    titolo_it: "Contatti",
    titolo_en: "Contact",
    seo_title_it: "Contatti & preventivi",
    seo_title_en: "Contact & quotes",
    seo_description_it: "Scrivici: Leo risponde entro 48 ore, anche per l'evento più piccolo.",
    seo_description_en: "Get in touch: Leo replies within 48 hours, even for the smallest event.",
    corpo_it: "Raccontaci il matrimonio: data, luogo & due parole su di voi. L'attesa media è due giorni.",
    corpo_en: "",
  },
  {
    slug: "thanks",
    titolo_it: "Grazie",
    titolo_en: "Thank you",
    seo_title_it: "Richiesta inviata",
    seo_title_en: "Request sent",
    seo_description_it: "La richiesta è stata inviata: Leo risponde entro 48 ore.",
    seo_description_en: "Your request has been sent: Leo replies within 48 hours.",
    corpo_it: "Grazie! Leo ti risponderà entro 48 ore & confermerà i dettagli.",
    corpo_en: "Thanks! Leo will reply within 48 hours & confirm every detail.",
  },
];

// Cerca il primo <p>...</p> incollato subito dopo l'h1: se il corpo è vuoto
// il markup non ha questo <p> e il costrutto che segue (il form o il link di
// ritorno) arriva subito dopo l'h1.
function corpoPrimaDiForm(html: string): string | null {
  const m = html.match(/<h1>[^<]*<\/h1>\s*<p>([\s\S]*?)<\/p>\s*<form/);
  return m ? m[1] : null;
}
function corpoPrimaDelBacklink(html: string): string | null {
  const m = html.match(/<h1>[^<]*<\/h1>\s*<p>([\s\S]*?)<\/p>\s*<p><a /);
  return m ? m[1] : null;
}

describe("title, meta description, h1 e corpo delle pagine di contatto e conferma", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("../../src/content/pagine.json", () => ({
      default: PAGINE_JSON_FIXTURE,
    }));
  });

  async function rendi(
    carica: () => Promise<{ default: AstroComponentFactory }>,
  ): Promise<string> {
    const { default: Componente } = await carica();
    const container = await AstroContainer.create({
      astroConfig: { site: "https://leolucaiacoviello.it" },
    });
    return container.renderToString(Componente, {});
  }

  const CASI: Array<{
    nome: string;
    // Percorso letterale: la dichiarazione dei moduli .astro
    // (src/astro-moduli.d.ts) tipizza già il risultato, senza bisogno di
    // un `as`. L'import resta dinamico perché la funzione viene chiamata
    // dentro rendi(), dopo che vi.doMock ha sostituito pagine.json.
    carica: () => Promise<{ default: AstroComponentFactory }>;
    locale: Locale;
    slug: "contact" | "thanks";
    h1Chiave: UiKey;
    corpoAtteso: string; // "" per il caso US-8 senza traduzione
    estraiCorpo: (html: string) => string | null;
  }> = [
    {
      nome: "/it/contatti/",
      carica: () => import("../../src/pages/it/contatti.astro"),
      locale: "it",
      slug: "contact",
      h1Chiave: "contact.title",
      corpoAtteso: PAGINE_JSON_FIXTURE[0].corpo_it,
      estraiCorpo: corpoPrimaDiForm,
    },
    {
      nome: "/en/contact/ (corpo_en vuoto, US-8)",
      carica: () => import("../../src/pages/en/contact.astro"),
      locale: "en",
      slug: "contact",
      h1Chiave: "contact.title",
      corpoAtteso: "",
      estraiCorpo: corpoPrimaDiForm,
    },
    {
      nome: "/it/grazie/",
      carica: () => import("../../src/pages/it/grazie.astro"),
      locale: "it",
      slug: "thanks",
      h1Chiave: "thanks.title",
      corpoAtteso: PAGINE_JSON_FIXTURE[1].corpo_it,
      estraiCorpo: corpoPrimaDelBacklink,
    },
    {
      nome: "/en/thank-you/",
      carica: () => import("../../src/pages/en/thank-you.astro"),
      locale: "en",
      slug: "thanks",
      h1Chiave: "thanks.title",
      corpoAtteso: PAGINE_JSON_FIXTURE[1].corpo_en,
      estraiCorpo: corpoPrimaDelBacklink,
    },
  ];

  for (const caso of CASI) {
    it(`${caso.nome}: title, meta description e h1 corrispondono al modello contenuti, escape incluso`, async () => {
      const html = await rendi(caso.carica);
      const pagina = PAGINE_JSON_FIXTURE.find((p) => p.slug === caso.slug);
      if (!pagina) throw new Error(`fixture priva dello slug "${caso.slug}"`);

      const title = caso.locale === "it" ? pagina.seo_title_it : pagina.seo_title_en;
      const description =
        caso.locale === "it"
          ? pagina.seo_description_it
          : pagina.seo_description_en;

      expect(html).toContain(`<title>${escapeHTML(title)}</title>`);
      expect(html).toContain(`content="${escapeAttributo(description)}"`);
      expect(html).toContain(`<h1>${t(caso.locale, caso.h1Chiave)}</h1>`);
    });

    it(`${caso.nome}: il corpo, se presente, è quello di corpoPer dopo l'escape; se vuoto non c'è paragrafo`, async () => {
      const html = await rendi(caso.carica);
      const catturato = caso.estraiCorpo(html);

      if (caso.corpoAtteso === "") {
        expect(catturato).toBeNull();
      } else {
        expect(catturato).toBe(escapeHTML(caso.corpoAtteso));
      }
    });
  }
});
