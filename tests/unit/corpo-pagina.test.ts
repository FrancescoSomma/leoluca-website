import { describe, it, expect, vi, beforeEach } from "vitest";
import { corpoPer } from "../../src/content/load";

describe("corpoPer", () => {
  it("restituisce il corpo italiano della pagina", () => {
    expect(corpoPer("contact", "it")).toMatch(/^\[SEGNAPOSTO\]/);
  });

  it("restituisce il corpo inglese della pagina", () => {
    expect(corpoPer("contact", "en")).toMatch(/^\[PLACEHOLDER\]/);
  });

  it("lancia un errore se lo slug non esiste in pagine.json", () => {
    expect(() => corpoPer("inesistente", "it")).toThrow(/manca la pagina/);
  });
});

describe("corpoPer con corpo_en mancante (US-8, nessun ripiego sull'italiano)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("restituisce stringa vuota se la traduzione inglese manca", async () => {
    // pagine.json reale ha sempre corpo_en valorizzato: si inietta un
    // fixture senza la versione inglese per esercitare il caso US-8, come
    // content.test.ts fa per foto.json.
    vi.doMock("../../src/content/pagine.json", () => ({
      default: [
        {
          slug: "contact",
          titolo_it: "Contatti",
          seo_title_it: "Contatti",
          // seo_title_en e seo_description_en valorizzati: dopo la fusione
          // con il Task 7 lo schema li rende obbligatori (min(1)), e una
          // fixture che li ometta farebbe fallire il parse per un motivo
          // estraneo al caso che questo test vuole esercitare, che è solo
          // corpo_en assente.
          seo_title_en: "Contact",
          seo_description_it: "Descrizione dei contatti.",
          seo_description_en: "Contact description.",
          corpo_it: "Corpo italiano.",
        },
      ],
    }));
    const { corpoPer: corpoPerMockato } =
      await import("../../src/content/load");
    expect(corpoPerMockato("contact", "en")).toBe("");
    expect(corpoPerMockato("contact", "it")).toBe("Corpo italiano.");
  });
});
