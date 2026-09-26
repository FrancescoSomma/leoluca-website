import { describe, it, expect, beforeEach } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import SelettoreLingua from "../../src/components/SelettoreLingua.astro";

let container: Awaited<ReturnType<typeof AstroContainer.create>>;

beforeEach(async () => {
  container = await AstroContainer.create();
});

describe("componente SelettoreLingua", () => {
  it("da /it/chi-sono/ con locale it, collega a /en/about/ (US-6)", async () => {
    const html = await container.renderToString(SelettoreLingua, {
      props: { locale: "it" },
      request: new Request("http://localhost/it/chi-sono/"),
    });

    expect(html).toContain('href="/en/about/"');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('lang="en"');
    expect(html).toContain("English");
  });

  it("da /en/thank-you/ con locale en, collega a /it/grazie/", async () => {
    const html = await container.renderToString(SelettoreLingua, {
      props: { locale: "en" },
      request: new Request("http://localhost/en/thank-you/"),
    });

    expect(html).toContain('href="/it/grazie/"');
    expect(html).toContain('hreflang="it"');
    expect(html).toContain('lang="it"');
    expect(html).toContain("Italiano");
  });

  it("da un percorso sconosciuto, ritorna alla home dell'altra lingua", async () => {
    const html = await container.renderToString(SelettoreLingua, {
      props: { locale: "it" },
      request: new Request("http://localhost/it/sconosciuto/"),
    });

    expect(html).toContain('href="/en/"');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain("English");
  });

  it("imposta lang e hreflang corretti da pagina a pagina", async () => {
    const html1 = await container.renderToString(SelettoreLingua, {
      props: { locale: "it" },
      request: new Request("http://localhost/it/portfolio/"),
    });
    expect(html1).toContain('lang="en"');

    const html2 = await container.renderToString(SelettoreLingua, {
      props: { locale: "en" },
      request: new Request("http://localhost/en/portfolio/"),
    });
    expect(html2).toContain('lang="it"');
  });
});
