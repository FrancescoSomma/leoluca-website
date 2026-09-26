import { describe, it, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Foto from "../../src/components/Foto.astro";

// Ritratto 4480×6720 (US-2, R25): con `inferSize` + `widths` fino a 2400,
// Astro genera un derivato "2400w" alto 3600 px. Serve un fixture con questa
// forma per far fallire il test sul lato lungo contro il componente sbagliato.
const foto = {
  file: "https://images.unsplash.com/photo-1532454781337-fc3edff34f91",
  ordine: 0,
  alt_it: "sposa sulla scalinata",
  alt_en: "bride on the steps",
  in_home: true,
};

let container: Awaited<ReturnType<typeof AstroContainer.create>>;
let html: string;
let htmlPrioritaria: string;

beforeAll(async () => {
  container = await AstroContainer.create();
  html = await container.renderToString(Foto, {
    props: { foto, locale: "it", priorita: false, sizes: "100vw" },
  });
  htmlPrioritaria = await container.renderToString(Foto, {
    props: { foto, locale: "it", priorita: true, sizes: "100vw" },
  });
});

describe("componente Foto", () => {
  it("emette sorgenti AVIF e WebP", () => {
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
  });

  it("non serve mai JPEG", () => {
    expect(html).not.toMatch(/\.jpe?g["\s]|f=jpe?g|image\/jpeg/);
  });

  it("dichiara width e height per tenere il CLS", () => {
    expect(html).toMatch(/width="\d+"/);
    expect(html).toMatch(/height="\d+"/);
  });

  it("usa il testo alternativo della lingua richiesta", () => {
    expect(html).toContain('alt="sposa sulla scalinata"');
  });

  it("è lazy quando non è prioritaria", () => {
    expect(html).toContain('loading="lazy"');
  });

  it("è eager quando è prioritaria", () => {
    expect(htmlPrioritaria).toContain('loading="eager"');
    expect(htmlPrioritaria).not.toContain('loading="lazy"');
  });

  it("decodifica in modo asincrono", () => {
    expect(html).toContain('decoding="async"');
  });

  it("non supera i 2400 px di lato lungo", () => {
    // US-2: il vincolo è sul lato lungo del derivato, non sulla larghezza
    // dichiarata nello srcset. Su questo fixture (ritratto) il lato lungo è
    // l'altezza: si ricalcola da ogni descrittore "Nw" con il rapporto
    // dell'immagine, letto dagli attributi width/height dell'<img>.
    const imgWidth = Number(html.match(/width="(\d+)"/)?.[1]);
    const imgHeight = Number(html.match(/height="(\d+)"/)?.[1]);
    expect(Math.max(imgWidth, imgHeight)).toBeLessThanOrEqual(2400);

    const larghezze = [...html.matchAll(/(\d+)w/g)].map((m) => Number(m[1]));
    expect(larghezze.length).toBeGreaterThan(0);
    for (const larghezza of larghezze) {
      const latoLungo = Math.max(
        larghezza,
        Math.round((larghezza * imgHeight) / imgWidth),
      );
      expect(latoLungo).toBeLessThanOrEqual(2400);
    }
  });

  it("l'originale non compare nel markup", () => {
    expect(html).not.toContain(foto.file);
  });

  it("una foto fuori da remotePatterns fa fallire il render", async () => {
    const fotoNonConsentita = {
      ...foto,
      file: foto.file.replace("https://", "http://"),
    };
    await expect(
      container.renderToString(Foto, {
        props: {
          foto: fotoNonConsentita,
          locale: "it",
          priorita: false,
          sizes: "100vw",
        },
      }),
    ).rejects.toThrow();
  });
});
