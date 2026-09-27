import { test, expect } from "@playwright/test";
import { LOCALES, pathFor } from "../../src/i18n/routes";
import { t } from "../../src/i18n/ui";

// Percorso critico (spec § Percorso critico): arrivo → portfolio →
// richiesta di preventivo → conferma. Un fallimento qui blocca il rilascio.
// Il completamento con la sola tastiera, dal caricamento fino alla
// conferma, lo copre già tests/e2e/form.spec.ts (Task 8): qui si verifica
// la sequenza di pagine, nelle due lingue, con i testi da t() e le rotte da
// pathFor() (ADR-0005, Modifica 2026-09-27).
for (const locale of LOCALES) {
  test(`arrivo, portfolio, richiesta, conferma (${locale})`, async ({
    page,
  }) => {
    await page.goto(pathFor("home", locale));
    await expect(page.locator("main img").first()).toBeVisible();

    // Il collegamento esplicito al portfolio è il primo passo del percorso
    // critico dall'arrivo in home (US-1): vive nel contenuto principale, non
    // nel nav (che ha un proprio link "Portfolio", con un nome diverso). Si
    // cerca dentro main per prendere quello specifico, non per un'ambiguità
    // di nome: "Portfolio" non è una sottostringa di "Guarda il
    // portfolio"/"See the portfolio", quindi getByRole non li confonderebbe
    // comunque.
    await page
      .locator("main")
      .getByRole("link", { name: t(locale, "home.toPortfolio") })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`${pathFor("portfolio", locale)}$`),
    );

    await page.getByRole("link", { name: t(locale, "nav.contact") }).click();
    await expect(page).toHaveURL(new RegExp(`${pathFor("contact", locale)}$`));

    await page.locator('[name="nome"]').fill("Anna Rossi");
    await page.locator('[name="email"]').fill("anna@example.com");
    await page.locator('[name="data_evento"]').fill("2027-06-12");
    await page.locator('[name="location"]').fill("Villa Reale, Monza");
    // La prima opzione di fascia_budget è vuota (segnaposto "Seleziona"):
    // l'indice 2 sceglie la seconda fascia vera (Modifica 2026-09-27).
    await page.locator('[name="fascia_budget"]').selectOption({ index: 2 });

    // In locale Netlify non intercetta la POST: si verifica che il form sia
    // valido e diretto alla conferma. Il recapito reale è nel Task 10.
    const form = page.locator(`form[name="contatto-${locale}"]`);
    await expect(form).toHaveAttribute("action", pathFor("thanks", locale));
    expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(
      true,
    );

    await page.goto(pathFor("thanks", locale));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
