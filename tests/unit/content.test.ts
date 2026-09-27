import { describe, it, expect, vi, beforeEach } from "vitest";
import { FotoSchema, PaginaSchema, FaqSchema } from "../../src/content/schema";
import {
  caricaFoto,
  caricaPagine,
  altPer,
  seoPer,
} from "../../src/content/load";
import type { Foto } from "../../src/content/schema";

describe("schema Foto", () => {
  const valida = {
    file: "https://storage.example/f001.jpg",
    ordine: 0,
    alt_it: "sposa sulla scalinata",
    alt_en: "bride on the steps",
    in_home: true,
  };

  it("accetta una foto completa", () => {
    expect(FotoSchema.parse(valida)).toMatchObject({ ordine: 0 });
  });

  it("rifiuta un testo alternativo italiano vuoto", () => {
    expect(() => FotoSchema.parse({ ...valida, alt_it: "" })).toThrow();
  });

  it("rifiuta un testo alternativo inglese mancante", () => {
    const { alt_en, ...senzaEn } = valida;
    expect(() => FotoSchema.parse(senzaEn)).toThrow();
  });

  it("rifiuta un file che non è un URL remoto", () => {
    expect(() =>
      FotoSchema.parse({ ...valida, file: "./locale.jpg" }),
    ).toThrow();
  });

  it("in_home vale false se assente", () => {
    const { in_home, ...senzaHome } = valida;
    expect(FotoSchema.parse(senzaHome).in_home).toBe(false);
  });
});

describe("US-8 testo solo in italiano", () => {
  it("una FAQ con solo i campi italiani viene accettata, senza ripiego sull'italiano", () => {
    const faq = FaqSchema.parse({
      ordine: 0,
      domanda_it: "Quanto dura il servizio?",
      risposta_it: "Copro l'intera giornata, dal preparativi al ricevimento.",
    });
    expect(faq.domanda_en).toBe("");
    expect(faq.risposta_en).toBe("");
  });

  it("una Pagina con testi italiani e SEO inglese viene accettata, senza ripiego sull'italiano per titolo_en e corpo_en", () => {
    const pagina = PaginaSchema.parse({
      slug: "faq",
      titolo_it: "Domande frequenti",
      seo_title_it: "FAQ",
      seo_title_en: "FAQ",
      seo_description_it: "Le risposte alle domande più comuni.",
      seo_description_en: "Answers to the most common questions.",
    });
    expect(pagina.titolo_en).toBe("");
    expect(pagina.corpo_en).toBe("");
  });

  it("rifiuta seo_title_en mancante", () => {
    expect(() =>
      PaginaSchema.parse({
        slug: "faq",
        titolo_it: "Domande frequenti",
        seo_title_it: "FAQ",
        seo_description_it: "Le risposte alle domande più comuni.",
        seo_description_en: "Answers to the most common questions.",
      }),
    ).toThrow();
  });

  it("rifiuta seo_title_en esplicitamente vuoto", () => {
    // Un CMS che svuota un campo scrive "", non lo omette: senza questo
    // caso il test sopra non copre la cancellazione da pannello (US-7/8).
    expect(() =>
      PaginaSchema.parse({
        slug: "faq",
        titolo_it: "Domande frequenti",
        seo_title_it: "FAQ",
        seo_title_en: "",
        seo_description_it: "Le risposte alle domande più comuni.",
        seo_description_en: "Answers to the most common questions.",
      }),
    ).toThrow();
  });

  it("rifiuta seo_description_en mancante", () => {
    expect(() =>
      PaginaSchema.parse({
        slug: "faq",
        titolo_it: "Domande frequenti",
        seo_title_it: "FAQ",
        seo_title_en: "FAQ",
        seo_description_it: "Le risposte alle domande più comuni.",
      }),
    ).toThrow();
  });

  it("rifiuta seo_description_en esplicitamente vuoto", () => {
    expect(() =>
      PaginaSchema.parse({
        slug: "faq",
        titolo_it: "Domande frequenti",
        seo_title_it: "FAQ",
        seo_title_en: "FAQ",
        seo_description_it: "Le risposte alle domande più comuni.",
        seo_description_en: "",
      }),
    ).toThrow();
  });
});

describe("seoPer", () => {
  // Come altPer sotto: si legge il valore atteso da pagine.json invece di
  // fissare il segnaposto, così il test non si rompe quando 05-content
  // sostituisce i testi definitivi.
  const pagina = caricaPagine().find((p) => p.slug === "portfolio");
  if (!pagina) throw new Error('pagine.json: manca la pagina "portfolio"');

  it("legge i campi italiani per locale 'it'", () => {
    expect(seoPer("portfolio", "it")).toEqual({
      title: pagina.seo_title_it,
      description: pagina.seo_description_it,
    });
  });

  it("legge i campi inglesi per locale 'en'", () => {
    expect(seoPer("portfolio", "en")).toEqual({
      title: pagina.seo_title_en,
      description: pagina.seo_description_en,
    });
  });

  it("lancia per uno slug assente", () => {
    expect(() => seoPer("inesistente", "it")).toThrow(/inesistente/);
  });
});

describe("caricamento", () => {
  it("altPer sceglie la lingua giusta", () => {
    const foto = caricaFoto()[0];
    expect(altPer(foto, "it")).toBe(foto.alt_it);
    expect(altPer(foto, "en")).toBe(foto.alt_en);
  });
});

// foto.json è già ordinato e senza duplicati: chiamare caricaFoto() su quel
// fixture non esercita né il sort né il controllo dei duplicati in load.ts,
// e i test restano verdi anche se load.ts li perde. Si inietta un fixture
// fuori ordine o con un duplicato al posto del JSON reale, per lo scopo di
// un solo test: vi.doMock non è hoisted come vi.mock, quindi vale solo per
// l'import() dinamico che segue, dopo vi.resetModules().
function fotoFixture(overrides: Partial<Foto>): Foto {
  return {
    file: "https://storage.example/f.jpg",
    ordine: 0,
    alt_it: "a",
    alt_en: "a",
    in_home: false,
    ...overrides,
  };
}

describe("caricaFoto su dati fuori ordine e duplicati", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("restituisce le foto ordinate per ordine crescente anche se il JSON non lo è", async () => {
    vi.doMock("../../src/content/foto.json", () => ({
      default: [
        fotoFixture({ ordine: 2 }),
        fotoFixture({ ordine: 0 }),
        fotoFixture({ ordine: 1 }),
      ],
    }));
    const { caricaFoto: caricaFotoMockato } =
      await import("../../src/content/load");
    const ordini = caricaFotoMockato().map((f) => f.ordine);
    expect(ordini).toEqual([0, 1, 2]);
  });

  it("rifiuta due foto con lo stesso ordine", async () => {
    vi.doMock("../../src/content/foto.json", () => ({
      default: [fotoFixture({ ordine: 0 }), fotoFixture({ ordine: 0 })],
    }));
    const { caricaFoto: caricaFotoMockato } =
      await import("../../src/content/load");
    expect(() => caricaFotoMockato()).toThrow(/stesso ordine/);
  });
});
