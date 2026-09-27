import { describe, it, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Hero from "../../src/components/Hero.astro";

// Stesso poster di impostazioni.json: orizzontale 5472×3648, lato lungo
// massimo 2400 px → derivato 2400×1600 (Ruling R42/R49).
const poster = "https://images.unsplash.com/photo-1524650448000-02d0a2aeb6cb";
const motto = "Segnaposto: motto di prova";

let container: Awaited<ReturnType<typeof AstroContainer.create>>;
let html: string;
let htmlConClip: string;

beforeAll(async () => {
  container = await AstroContainer.create();
  html = await container.renderToString(Hero, {
    props: { poster, motto },
  });
  htmlConClip = await container.renderToString(Hero, {
    props: { poster, motto, clip: "https://storage.example/clip.mp4" },
  });
});

describe("componente Hero", () => {
  it("emette sorgenti AVIF e WebP per il poster", () => {
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
  });

  it("il poster ha alt vuoto: il motto adiacente porta già il significato", () => {
    // Astro serializza un alt="" come attributo booleano senza valore
    // ("alt", non 'alt=""'): stessa semantica HTML, forma diversa.
    expect(html).toMatch(/<img[^>]*\salt(\s|>)/);
    expect(html).not.toMatch(/<img[^>]*\salt="[^"]/);
  });

  it("il poster è eager, ad alta priorità e decodifica asincrona (spec § Hero, punto 1)", () => {
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchpriority="high"');
    expect(html).toContain('decoding="async"');
  });

  it("il poster non supera i 2400 px di lato lungo (US-2)", () => {
    expect(html).toMatch(/width="2400"/);
    expect(html).toMatch(/height="1600"/);
  });

  it("l'originale non compare nel markup", () => {
    expect(html).not.toContain(poster);
  });

  it("il motto è nell'h1", () => {
    expect(html).toMatch(new RegExp(`<h1[^>]*>${motto}</h1>`));
  });

  it("senza clip non c'è nessun <video>", () => {
    expect(html).not.toContain("<video");
  });

  it("con clip il video non ha src nel markup, è muto, in loop, inline e non parte da solo (spec § Hero, punto 2)", () => {
    expect(htmlConClip).toContain("<video");
    expect(htmlConClip).toMatch(
      /<video[^>]*\sdata-src="https:\/\/storage\.example\/clip\.mp4"/,
    );
    expect(htmlConClip).not.toMatch(/<video[^>]*\ssrc=/);
    expect(htmlConClip).toMatch(/<video[^>]*\smuted/);
    expect(htmlConClip).toMatch(/<video[^>]*\sloop/);
    expect(htmlConClip).toMatch(/<video[^>]*\splaysinline/);
    expect(htmlConClip).toMatch(/<video[^>]*\spreload="none"/);
  });

  it("con clip il video parte nascosto, sostituito al poster solo quando pronto (Ruling R43)", () => {
    expect(htmlConClip).toMatch(/<video[^>]*\shidden/);
  });

  it("con clip il video dichiara la stessa larghezza e altezza del poster (CLS)", () => {
    expect(htmlConClip).toMatch(/<video[^>]*\swidth="2400"/);
    expect(htmlConClip).toMatch(/<video[^>]*\sheight="1600"/);
  });
});
