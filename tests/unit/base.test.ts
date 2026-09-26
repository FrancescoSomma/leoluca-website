import { describe, it, expect, beforeEach } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Base from "../../src/layouts/Base.astro";

let container: Awaited<ReturnType<typeof AstroContainer.create>>;

beforeEach(async () => {
  container = await AstroContainer.create({
    astroConfig: { site: "https://leolucaiacoviello.it" },
  });
});

describe("layout Base", () => {
  it("dichiara lang, canonical e hreflang assoluti per la pagina italiana", async () => {
    const html = await container.renderToString(Base, {
      props: {
        locale: "it",
        pageKey: "about",
        title: "Chi sono — Leo Luca Iacoviello",
        description: "Descrizione di prova.",
      },
      slots: { default: "<p>Contenuto</p>" },
    });

    expect(html).toMatch(/<html lang="it"[^>]*>/);
    expect(html).toContain(
      '<link rel="canonical" href="https://leolucaiacoviello.it/it/chi-sono/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="it" href="https://leolucaiacoviello.it/it/chi-sono/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="en" href="https://leolucaiacoviello.it/en/about/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://leolucaiacoviello.it/it/chi-sono/">',
    );
  });

  it("cambia lang, canonical e hreflang per la pagina inglese corrispondente", async () => {
    const html = await container.renderToString(Base, {
      props: {
        locale: "en",
        pageKey: "about",
        title: "About — Leo Luca Iacoviello",
        description: "Test description.",
      },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toMatch(/<html lang="en"[^>]*>/);
    expect(html).toContain(
      '<link rel="canonical" href="https://leolucaiacoviello.it/en/about/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://leolucaiacoviello.it/it/chi-sono/">',
    );
  });

  it("espone lo skip link verso #contenuto e il main che contiene lo slot", async () => {
    const html = await container.renderToString(Base, {
      props: {
        locale: "it",
        pageKey: "home",
        title: "Leo Luca Iacoviello",
        description: "Descrizione di prova.",
      },
      slots: { default: "<h1>Segnaposto</h1>" },
    });

    expect(html).toContain('href="#contenuto"');
    expect(html).toMatch(
      /<main id="contenuto"[^>]*>[\s\S]*<h1>Segnaposto<\/h1>[\s\S]*<\/main>/,
    );
  });

  it("non attacca i collegamenti del nav fra loro (compressHTML)", async () => {
    const html = await container.renderToString(Base, {
      props: {
        locale: "it",
        pageKey: "home",
        title: "Leo Luca Iacoviello",
        description: "Descrizione di prova.",
      },
      slots: { default: "<h1>Segnaposto</h1>" },
      request: new Request("http://localhost/it/"),
    });

    const nav = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
    if (nav === null) throw new Error("<nav> mancante nell'HTML reso");

    // compressHTML toglie gli spazi fra i tag: senza {' '} espliciti in
    // Base.astro i collegamenti si toccherebbero, non distinguibili a vista
    // né come target separati (US-6, WCAG 2.2 AA 2.5.8).
    expect(nav[1]).not.toContain("</a><a");
  });
});
