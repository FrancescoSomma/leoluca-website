import { describe, it, expect } from "vitest";
import { FotoSchema, PaginaSchema, FaqSchema } from "../../src/content/schema";
import { caricaFoto, altPer } from "../../src/content/load";

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

  it("una Pagina con solo i campi italiani viene accettata, senza ripiego sull'italiano", () => {
    const pagina = PaginaSchema.parse({
      slug: "faq",
      titolo_it: "Domande frequenti",
      seo_title_it: "FAQ",
      seo_description_it: "Le risposte alle domande più comuni.",
    });
    expect(pagina.titolo_en).toBe("");
    expect(pagina.seo_title_en).toBe("");
    expect(pagina.seo_description_en).toBe("");
  });
});

describe("caricamento", () => {
  it("restituisce le foto ordinate per ordine crescente", () => {
    const foto = caricaFoto();
    const ordini = foto.map((f) => f.ordine);
    expect(ordini).toEqual([...ordini].sort((a, b) => a - b));
  });

  it("non ammette due foto con lo stesso ordine", () => {
    const ordini = caricaFoto().map((f) => f.ordine);
    expect(new Set(ordini).size).toBe(ordini.length);
  });

  it("altPer sceglie la lingua giusta", () => {
    const foto = caricaFoto()[0];
    expect(altPer(foto, "it")).toBe(foto.alt_it);
    expect(altPer(foto, "en")).toBe(foto.alt_en);
  });
});
