import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import ContattiIt from "../../src/pages/it/contatti.astro";
import ContactEn from "../../src/pages/en/contact.astro";
import GrazieIt from "../../src/pages/it/grazie.astro";
import ThankYouEn from "../../src/pages/en/thank-you.astro";
import { seoPer, corpoPer } from "../../src/content/load";
import { t, type UiKey } from "../../src/i18n/ui";
import type { Locale } from "../../src/i18n/routes";

// title, meta description, h1 e corpo vengono dal modello contenuti
// (seoPer/corpoPer) e da ui.ts, non scritti nella pagina (§ SEO, US-8): si
// verifica che i quattro valori coincidano con quelli attesi, nelle due
// lingue, invece di fidarsi della sola presenza del markup.
const PAGINE: Array<{
  nome: string;
  locale: Locale;
  slug: "contact" | "thanks";
  Componente: AstroComponentFactory;
  h1Chiave: UiKey;
}> = [
  {
    nome: "/it/contatti/",
    locale: "it",
    slug: "contact",
    Componente: ContattiIt,
    h1Chiave: "contact.title",
  },
  {
    nome: "/en/contact/",
    locale: "en",
    slug: "contact",
    Componente: ContactEn,
    h1Chiave: "contact.title",
  },
  {
    nome: "/it/grazie/",
    locale: "it",
    slug: "thanks",
    Componente: GrazieIt,
    h1Chiave: "thanks.title",
  },
  {
    nome: "/en/thank-you/",
    locale: "en",
    slug: "thanks",
    Componente: ThankYouEn,
    h1Chiave: "thanks.title",
  },
];

describe.each(PAGINE)("$nome", ({ locale, slug, Componente, h1Chiave }) => {
  it("title, meta description, h1 e corpo vengono dal modello contenuti", async () => {
    const container = await AstroContainer.create({
      astroConfig: { site: "https://leolucaiacoviello.it" },
    });
    const html = await container.renderToString(Componente, {});

    const { title, description } = seoPer(slug, locale);
    const corpo = corpoPer(slug, locale);

    expect(html).toContain(`<title>${title}</title>`);
    expect(html).toContain(`content="${description}"`);
    expect(html).toContain(`<h1>${t(locale, h1Chiave)}</h1>`);
    // pagine.json ha sempre corpo_it/corpo_en valorizzati per contact e
    // thanks: se un giorno mancasse la traduzione inglese, corpoPer
    // restituirebbe "" e la pagina non renderebbe alcun <p> (US-8), quindi
    // qui si verifica solo il caso corrente, non vuoto.
    expect(corpo).not.toBe("");
    expect(html).toContain(`<p>${corpo}</p>`);
  });
});
