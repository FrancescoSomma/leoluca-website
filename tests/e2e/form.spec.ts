import { test, expect } from "@playwright/test";
import { LOCALES, pathFor } from "../../src/i18n/routes";
import { t } from "../../src/i18n/ui";

const OBBLIGATORI = [
  "nome",
  "email",
  "data_evento",
  "location",
  "fascia_budget",
];
const FACOLTATIVI = [
  "telefono",
  "tipo_cerimonia",
  "momento",
  "wedding_planner",
  "wedding_planner_nome",
  "messaggio",
];
const TUTTI = [...OBBLIGATORI, ...FACOLTATIVI];

// Tab su un <input type="date"> in Chromium può fermarsi più volte fra i
// segmenti (giorno/mese/anno) prima di lasciare il campo: si preme Tab finché
// il nome del campo attivo non cambia, con un tetto per non girare a vuoto.
async function tabViaCampo(
  page: import("@playwright/test").Page,
  nomeAttuale: string,
) {
  let tentativi = 0;
  do {
    await page.keyboard.press("Tab");
    tentativi += 1;
  } while (
    (await page.evaluate(
      () => document.activeElement?.getAttribute("name") ?? null,
    )) === nomeAttuale &&
    tentativi < 5
  );
}

for (const locale of LOCALES) {
  const percorso = pathFor("contact", locale);
  const azione = pathFor("thanks", locale);

  test(`${percorso} espone tutti i campi previsti dallo spec`, async ({
    page,
  }) => {
    await page.goto(percorso);
    for (const nome of TUTTI) {
      await expect(page.locator(`[name="${nome}"]`)).toHaveCount(1);
    }
  });

  test(`${percorso} ogni campo ha una label associata, nessun placeholder`, async ({
    page,
  }) => {
    await page.goto(percorso);
    await page.locator('[name="wedding_planner"]').check();
    for (const nome of TUTTI) {
      const campo = page.locator(`[name="${nome}"]`);
      const id = await campo.getAttribute("id");
      expect(id).toBeTruthy();
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
      expect(await campo.getAttribute("placeholder")).toBeNull();
    }
  });

  test(`${percorso} il nome della wedding planner compare solo se c'è una wedding planner`, async ({
    page,
  }) => {
    await page.goto(percorso);
    await expect(page.locator('[name="wedding_planner_nome"]')).toBeHidden();
    await page.locator('[name="wedding_planner"]').check();
    await expect(page.locator('[name="wedding_planner_nome"]')).toBeVisible();
    await page.locator('[name="wedding_planner"]').uncheck();
    await expect(page.locator('[name="wedding_planner_nome"]')).toBeHidden();
  });

  test(`${percorso} un campo obbligatorio vuoto è annunciato e sposta il focus`, async ({
    page,
  }) => {
    await page.goto(percorso);
    await page.getByRole("button", { name: t(locale, "form.send") }).click();
    const nome = page.locator('[name="nome"]');
    await expect(nome).toBeFocused();
    await expect(nome).toHaveAttribute("aria-invalid", "true");
    const descritto = await nome.getAttribute("aria-describedby");
    if (descritto === null) throw new Error("aria-describedby mancante");
    await expect(page.locator(`#${descritto}`)).toHaveText(
      t(locale, "form.error.required"),
    );
  });

  test(`${percorso} un'email malformata mostra il messaggio dedicato`, async ({
    page,
  }) => {
    await page.goto(percorso);
    await page.fill('[name="nome"]', "Maria Rossi");
    await page.fill('[name="email"]', "non-una-email");
    await page.fill('[name="data_evento"]', "2030-06-15");
    await page.fill('[name="location"]', "Villa dei Fiori");
    await page.selectOption('[name="fascia_budget"]', { index: 1 });
    await page.getByRole("button", { name: t(locale, "form.send") }).click();

    const email = page.locator('[name="email"]');
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    const descritto = await email.getAttribute("aria-describedby");
    if (descritto === null) throw new Error("aria-describedby mancante");
    await expect(page.locator(`#${descritto}`)).toHaveText(
      t(locale, "form.error.email"),
    );
  });

  test(`${percorso} l'ordine da tastiera segue l'ordine dei controlli nel DOM`, async ({
    page,
  }) => {
    await page.goto(percorso);

    const attesi = await page.evaluate(() => {
      const form = document.querySelector(
        'form[name="contatto"]',
      ) as HTMLFormElement;
      return Array.from(
        form.querySelectorAll<HTMLElement>("input, select, textarea, button"),
      )
        .filter(
          (el) =>
            !el.hidden &&
            !el.closest("[hidden]") &&
            el.getAttribute("type") !== "hidden" &&
            el.getAttribute("name") !== "bot-field",
        )
        .map((el) => el.getAttribute("name") ?? el.tagName.toLowerCase());
    });

    await page.locator('[name="nome"]').focus();
    const visitati: string[] = ["nome"];
    const tetto = 25;
    for (
      let i = 0;
      i < tetto && visitati[visitati.length - 1] !== "button";
      i += 1
    ) {
      await page.keyboard.press("Tab");
      const attivo = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute("name") ?? el?.tagName.toLowerCase() ?? null;
      });
      if (attivo && attivo !== visitati[visitati.length - 1]) {
        visitati.push(attivo);
      }
    }

    expect(visitati).toEqual(attesi);
  });

  test(`${percorso} il percorso è completabile con la sola tastiera`, async ({
    page,
  }) => {
    let richiesta: { metodo: string; corpo: string } | null = null;
    await page.route(`**${azione}`, async (route) => {
      richiesta = {
        metodo: route.request().method(),
        corpo: route.request().postData() ?? "",
      };
      await route.fulfill({ status: 303, headers: { location: azione } });
    });

    await page.goto(percorso);

    await page.locator('[name="nome"]').focus();
    await page.keyboard.type("Maria Rossi");
    await tabViaCampo(page, "nome");
    await page.keyboard.type("maria@example.com");
    await tabViaCampo(page, "email");
    await tabViaCampo(page, "telefono");
    await page.keyboard.type("06152030");
    await tabViaCampo(page, "data_evento");
    await tabViaCampo(page, "tipo_cerimonia");
    await tabViaCampo(page, "momento");
    await page.keyboard.type("Villa dei Fiori, Roma");
    await tabViaCampo(page, "location");
    await page.keyboard.press("Space");
    await tabViaCampo(page, "wedding_planner");
    await page.keyboard.type("Studio Nozze");
    await tabViaCampo(page, "wedding_planner_nome");
    await page.keyboard.press("ArrowDown");
    await tabViaCampo(page, "fascia_budget");
    await tabViaCampo(page, "messaggio");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(new RegExp(`${azione}$`));
    await expect(page.locator("h1")).toHaveText(t(locale, "thanks.title"));

    if (!richiesta)
      throw new Error("la richiesta POST non è stata intercettata");
    const inviato: { metodo: string; corpo: string } = richiesta;
    expect(inviato.metodo).toBe("POST");
    expect(inviato.corpo).toContain("nome=Maria");
    expect(inviato.corpo).toContain("email=maria%40example.com");
    expect(inviato.corpo).toMatch(/data_evento=\d{4}-\d{2}-\d{2}/);
    expect(inviato.corpo).toContain("wedding_planner_nome=Studio");
    expect(inviato.corpo).toMatch(/fascia_budget=.+/);
  });

  test(`${percorso} è configurato per il recapito Netlify senza CAPTCHA visibile`, async ({
    page,
  }) => {
    await page.goto(percorso);
    const form = page.locator('form[data-netlify="true"]');
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("action", azione);
    await expect(page.locator('input[name="bot-field"]')).toBeHidden();
    await expect(
      page.locator('.g-recaptcha, iframe[src*="recaptcha"]'),
    ).toHaveCount(0);
  });
}
