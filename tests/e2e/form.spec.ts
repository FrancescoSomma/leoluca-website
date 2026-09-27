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

  test(`${percorso} una data incompleta mostra il messaggio dedicato, non quello dell'email`, async ({
    page,
  }) => {
    await page.goto(percorso);
    await page.fill('[name="nome"]', "Maria Rossi");
    await page.fill('[name="email"]', "maria@example.com");
    // Digitare solo il giorno (un input[type=date] è diviso in segmenti
    // giorno/mese/anno) lascia il campo con un valore non analizzabile:
    // validity.badInput, non valueMissing né typeMismatch.
    await page.locator('[name="data_evento"]').focus();
    await page.keyboard.type("01");
    await page.fill('[name="location"]', "Villa dei Fiori");
    await page.selectOption('[name="fascia_budget"]', { index: 1 });
    await page.getByRole("button", { name: t(locale, "form.send") }).click();

    const dataEvento = page.locator('[name="data_evento"]');
    await expect(dataEvento).toBeFocused();
    await expect(dataEvento).toHaveAttribute("aria-invalid", "true");
    const descritto = await dataEvento.getAttribute("aria-describedby");
    if (descritto === null) throw new Error("aria-describedby mancante");
    await expect(page.locator(`#${descritto}`)).toHaveText(
      t(locale, "form.error.date"),
    );
  });

  test(`${percorso} l'ordine da tastiera segue l'ordine dei controlli nel DOM`, async ({
    page,
  }) => {
    await page.goto(percorso);

    const attesi = await page.evaluate((nomeForm) => {
      const form = document.querySelector(
        `form[name="${nomeForm}"]`,
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
    }, `contatto-${locale}`);

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

    // Il percorso "da tastiera" deve partire dal caricamento, non da un
    // focus sintetico: skip link, nav e selettore lingua vengono prima del
    // form nel DOM, quindi servono più Tab per arrivare al primo campo.
    const tetto = 15;
    let trovatoCampoNome = false;
    for (let i = 0; i < tetto; i += 1) {
      await page.keyboard.press("Tab");
      const attivo = await page.evaluate(
        () => document.activeElement?.getAttribute("name") ?? null,
      );
      if (attivo === "nome") {
        trovatoCampoNome = true;
        break;
      }
    }
    if (!trovatoCampoNome) {
      throw new Error(
        `non ha raggiunto il campo "nome" entro ${tetto} pressioni di Tab`,
      );
    }
    await page.keyboard.type("Maria Rossi");
    await tabViaCampo(page, "nome");
    await page.keyboard.type("maria@example.com");
    await tabViaCampo(page, "email");
    await tabViaCampo(page, "telefono");
    // "01" è un giorno e un mese validi in entrambi gli ordini (mm/dd o
    // dd/mm): il valore finale è 2030-01-01 indipendentemente dal formato
    // della lingua di sistema, a differenza di una data come "06/15" che
    // in ordine giorno/mese non esiste.
    await page.keyboard.type("01012030");
    await tabViaCampo(page, "data_evento");
    await tabViaCampo(page, "tipo_cerimonia");
    await tabViaCampo(page, "momento");
    await page.keyboard.type("Villa dei Fiori, Roma");
    await tabViaCampo(page, "location");
    await page.keyboard.press("Space");
    await tabViaCampo(page, "wedding_planner");
    await page.keyboard.type("Studio Nozze");
    await tabViaCampo(page, "wedding_planner_nome");
    // ArrowDown su una select chiusa apre il menu invece di cambiare
    // opzione su macOS: la ricerca per carattere (typeahead) cambia valore
    // senza aprire nulla, su qualunque piattaforma. Si digita l'etichetta
    // intera invece del solo primo carattere perché le fasce vere di Leo
    // potrebbero condividere l'iniziale fra loro.
    // L'etichetta contiene "€", non digitabile come singolo tasto: Chromium
    // lo inserisce con execCommand("insertText"), che scrive nella
    // selezione di testo del documento invece che nel campo a fuoco. Il
    // focus è già sulla select, ma la selezione testuale è rimasta ferma
    // sull'ultimo campo di testo (wedding_planner_nome): senza svuotarla,
    // l'ultimo carattere dell'etichetta finirebbe lì invece che nella select.
    await page.evaluate(() => window.getSelection()?.removeAllRanges());
    await page.keyboard.type(t(locale, "form.fascia.0"));
    await tabViaCampo(page, "fascia_budget");
    await tabViaCampo(page, "messaggio");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(new RegExp(`${azione}$`));
    await expect(page.locator("h1")).toHaveText(t(locale, "thanks.title"));

    if (!richiesta)
      throw new Error("la richiesta POST non è stata intercettata");
    const inviato: { metodo: string; corpo: string } = richiesta;
    const dati = new URLSearchParams(inviato.corpo);
    expect(inviato.metodo).toBe("POST");
    expect(dati.get("form-name")).toBe(`contatto-${locale}`);
    expect(dati.get("nome")).toBe("Maria Rossi");
    expect(dati.get("email")).toBe("maria@example.com");
    expect(dati.get("data_evento")).toBe("2030-01-01");
    expect(dati.get("location")).toBe("Villa dei Fiori, Roma");
    expect(dati.get("wedding_planner_nome")).toBe("Studio Nozze");
    // Valore in italiano, uguale nelle due lingue: Leo legge l'email in
    // italiano indipendentemente dalla lingua della pagina.
    expect(dati.get("fascia_budget")).toBe("fino a 1.500 €");
  });

  test(`${percorso} il nome della wedding planner non si invia se la spunta viene tolta`, async ({
    page,
  }) => {
    // hidden non esclude un controllo dall'invio: chi spunta, scrive un
    // nome e poi toglie la spunta manderebbe a Leo wedding_planner_nome
    // senza wedding_planner, un dato incoerente.
    let corpoInviato = "";
    await page.route(`**${azione}`, async (route) => {
      corpoInviato = route.request().postData() ?? "";
      await route.fulfill({ status: 303, headers: { location: azione } });
    });

    await page.goto(percorso);
    await page.fill('[name="nome"]', "Maria Rossi");
    await page.fill('[name="email"]', "maria@example.com");
    await page.fill('[name="data_evento"]', "2030-01-01");
    await page.fill('[name="location"]', "Villa dei Fiori");
    await page.selectOption('[name="fascia_budget"]', { index: 1 });
    await page.locator('[name="wedding_planner"]').check();
    await page.fill('[name="wedding_planner_nome"]', "Studio Nozze");
    await page.locator('[name="wedding_planner"]').uncheck();
    await page.getByRole("button", { name: t(locale, "form.send") }).click();

    await expect(page).toHaveURL(new RegExp(`${azione}$`));
    const dati = new URLSearchParams(corpoInviato);
    expect(dati.has("wedding_planner_nome")).toBe(false);
    expect(dati.has("wedding_planner")).toBe(false);
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
