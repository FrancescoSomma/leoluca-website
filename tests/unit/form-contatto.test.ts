import { describe, it, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import FormContatto from "../../src/components/FormContatto.astro";
import { pathFor, LOCALES, type Locale } from "../../src/i18n/routes";

const OBBLIGATORI = [
  "nome",
  "email",
  "data_evento",
  "location",
  "fascia_budget",
];
const TUTTI = [
  "nome",
  "email",
  "telefono",
  "data_evento",
  "tipo_cerimonia",
  "momento",
  "location",
  "wedding_planner",
  "wedding_planner_nome",
  "fascia_budget",
  "messaggio",
];

const html: Record<Locale, string> = { it: "", en: "" };

beforeAll(async () => {
  const container = await AstroContainer.create();
  for (const locale of LOCALES) {
    html[locale] = await container.renderToString(FormContatto, {
      props: { locale },
    });
  }
});

describe.each(LOCALES)("FormContatto (%s)", (locale) => {
  it("dichiara i nomi dei campi previsti dallo spec, ciascuno con id", () => {
    for (const nome of TUTTI) {
      const match = html[locale].match(
        new RegExp(
          `name="${nome}"[^>]*id="([^"]+)"|id="([^"]+)"[^>]*name="${nome}"`,
        ),
      );
      expect(match, `campo ${nome} senza id`).not.toBeNull();
    }
  });

  it("ogni campo ha una label associata tramite for/id", () => {
    for (const nome of TUTTI) {
      const idMatch = html[locale].match(
        new RegExp(
          `(?:name="${nome}"[^>]*id="([^"]+)"|id="([^"]+)"[^>]*name="${nome}")`,
        ),
      );
      const id = idMatch?.[1] ?? idMatch?.[2];
      expect(id, `id mancante per ${nome}`).toBeTruthy();
      expect(html[locale]).toContain(`for="${id}"`);
    }
  });

  it("i cinque campi obbligatori hanno aria-describedby verso uno span di errore presente nel markup", () => {
    for (const nome of OBBLIGATORI) {
      const describedByMatch = html[locale].match(
        new RegExp(`name="${nome}"[^>]*aria-describedby="([^"]+)"`),
      );
      expect(
        describedByMatch,
        `aria-describedby mancante per ${nome}`,
      ).not.toBeNull();
      const id = describedByMatch?.[1];
      expect(html[locale]).toContain(`id="${id}"`);
    }
  });

  it("i campi facoltativi non hanno aria-describedby: non possono mai fallire la validazione, lo span sarebbe markup morto", () => {
    for (const nome of TUTTI.filter((n) => !OBBLIGATORI.includes(n))) {
      const campoMatch = html[locale].match(
        new RegExp(`<(?:input|select|textarea)[^>]*name="${nome}"[^>]*>`),
      );
      expect(campoMatch, `campo ${nome} non trovato`).not.toBeNull();
      expect(campoMatch?.[0]).not.toMatch(/aria-describedby/);
      expect(html[locale]).not.toContain(`id="errore-${nome}"`);
    }
  });

  it("il controllo e lo span d'errore non sono attaccati (compressHTML)", () => {
    // compressHTML toglie gli spazi fra i tag: senza {' '} espliciti il
    // controllo e il messaggio d'errore si toccherebbero, illeggibili a
    // schermo (come il nav di Base.astro nel Task 6).
    for (const nome of OBBLIGATORI) {
      const attaccato = new RegExp(`(?:/>|</select>)<span id="errore-${nome}"`);
      expect(html[locale]).not.toMatch(attaccato);
    }
  });

  it("required è presente solo sui cinque campi obbligatori dello spec", () => {
    for (const nome of TUTTI) {
      const campoMatch = html[locale].match(
        new RegExp(`<(?:input|select|textarea)[^>]*name="${nome}"[^>]*>`),
      );
      expect(campoMatch, `campo ${nome} non trovato`).not.toBeNull();
      const haRequired = /\brequired\b/.test(campoMatch?.[0] ?? "");
      expect(haRequired).toBe(OBBLIGATORI.includes(nome));
    }
  });

  it("nessun campo usa placeholder", () => {
    expect(html[locale]).not.toContain("placeholder=");
  });

  it("nessun novalidate nel markup (senza JS resta la validazione nativa)", () => {
    expect(html[locale]).not.toMatch(/\bnovalidate\b/);
  });

  it("l'azione punta alla pagina di conferma nella lingua corrente", () => {
    expect(html[locale]).toContain(`action="${pathFor("thanks", locale)}"`);
  });

  it("dichiara gli attributi Netlify e l'honeypot nascosto", () => {
    expect(html[locale]).toContain('data-netlify="true"');
    expect(html[locale]).toContain('netlify-honeypot="bot-field"');
    expect(html[locale]).toContain('name="form-name"');
    expect(html[locale]).toContain('value="contatto"');
    const honeypotBlock = html[locale].match(
      /<p hidden>[\s\S]*?name="bot-field"[\s\S]*?<\/p>/,
    );
    expect(honeypotBlock, "honeypot non è dentro un <p hidden>").not.toBeNull();
  });

  it("il contenitore del nome della wedding planner è hidden nel markup", () => {
    const contenitore = html[locale].match(
      /<p([^>]*)>[\s\S]*?name="wedding_planner_nome"[\s\S]*?<\/p>/,
    );
    expect(contenitore).not.toBeNull();
    expect(contenitore?.[1]).toMatch(/\bhidden\b/);
  });

  it("i primi tre campi dichiarano autocomplete", () => {
    expect(html[locale]).toMatch(/name="nome"[^>]*autocomplete="name"/);
    expect(html[locale]).toMatch(/name="email"[^>]*autocomplete="email"/);
    expect(html[locale]).toMatch(/name="telefono"[^>]*autocomplete="tel"/);
  });

  it('la checkbox della wedding planner ha value="sì"', () => {
    expect(html[locale]).toMatch(/name="wedding_planner"[^>]*value="sì"/);
  });
});

it("i value delle opzioni sono uguali nelle due lingue", () => {
  const estraiValori = (sorgente: string, nomeCampo: string) => {
    const selectMatch = sorgente.match(
      new RegExp(`<select[^>]*name="${nomeCampo}"[^>]*>([\\s\\S]*?)</select>`),
    );
    if (!selectMatch) throw new Error(`select ${nomeCampo} non trovata`);
    return [...selectMatch[1].matchAll(/<option value="([^"]*)"/g)].map(
      (m) => m[1],
    );
  };

  for (const campo of ["tipo_cerimonia", "momento", "fascia_budget"]) {
    expect(estraiValori(html.it, campo)).toEqual(estraiValori(html.en, campo));
  }
});
