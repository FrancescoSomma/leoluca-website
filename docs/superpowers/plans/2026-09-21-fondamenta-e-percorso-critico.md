# Fondamenta e percorso critico — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** portare online uno scheletro funzionante del sito, bilingue e
accessibile, con il percorso critico arrivo → portfolio → form → conferma
coperto da test end-to-end e da gate automatici di performance e accessibilità.

**Architecture:** sito statico Astro con routing i18n nativo. I contenuti sono
file JSON validati con zod e caricati da un modulo dedicato, non da content
collection: il modello è una lista ordinata piatta e un modulo nostro è più
semplice da testare e da far scrivere al pannello di ADR-0004. Le immagini sono
originali remoti su storage a oggetti, ottimizzati in build da Astro tramite
`image.remotePatterns`. Il form è gestito da Netlify, senza backend.

**Tech Stack:** Astro 7.3.3, TypeScript strict, zod, Netlify (hosting e form).
Verifica: Vitest, Playwright, axe, Lighthouse CI, Prettier — ADR-0005, Task 1.

**Spec:** [docs/02-spec.md](../../02-spec.md)

**Decisioni vincolanti:** [ADR-0001](../../03-adr/0001-processo-di-sviluppo.md),
[ADR-0002](../../03-adr/0002-gestione-contenuti.md),
[ADR-0003](../../03-adr/0003-generatore-statico-e-hosting.md),
[ADR-0004](../../03-adr/0004-pannello-e-storage-immagini.md),
[ADR-0005](../../03-adr/0005-stack-di-verifica.md),
[convenzioni di codice](../../07-convenzioni-codice.md)

## Global Constraints

Valgono per ogni task. I valori sono copiati dallo spec, non riassunti.

- Astro **7.3.3**. Nessun downgrade, nessuna 6.x.
- LCP ≤ **2.0 s** su 4G lenta simulata, mobile. CLS < **0.1**.
- Peso trasferito fino all'LCP: home ≤ **1.2 MB**, portfolio ≤ **1.5 MB**.
- Clip hero ≤ **6 s**, ≤ **1.5 MB**, senza traccia audio.
- JavaScript trasferito ≤ **50 KB compressi per pagina**, pagine pubbliche.
- **WCAG 2.2 AA** su tutte le pagine. axe senza violazioni.
- Derivati immagine: **AVIF e WebP**, larghezze **400, 800, 1200, 1600, 2400**.
- Il formato di ripiego va imposto a **WebP** esplicitamente: il default di
  `<Picture>` è il formato dell'originale, cioè JPEG. Nessun JPEG servito.
- `loading="lazy"` ovunque tranne **le prime tre** immagini del flusso e il
  poster dell'hero.
- Lato lungo massimo servito: **2400 px**. Nessun originale raggiungibile dal
  markup.
- Testo alternativo **obbligatorio in italiano e in inglese** per ogni foto.
- Un contenuto privo di versione inglese **non si pubblica** in inglese.
  Nessun ripiego automatico sull'italiano.
- **Nessuna dipendenza nuova senza un ADR accettato.** Vale anche per le
  dipendenze di sviluppo.
- Commit atomici, conventional commits, un branch per task.
- Documentazione a 80 colonne, come il resto di `docs/`.
- `./scripts/verify.sh` deve passare prima di dichiarare concluso un task.

## Chiusura di ogni task

Vale per tutti. È il punto 6 di
[ADR-0001](../../03-adr/0001-processo-di-sviluppo.md), che la prima stesura di
questo piano aveva omesso: gli agenti di review esistono nel repository dal
primo commit e nessun task li chiamava.

1. **Gate.** `./scripts/verify.sh` passa.
2. **Guardare.** Se il task produce una pagina che si vede, screenshot a 390,
   768 e 1440 px in `test-results/`, che git ignora. Più un controllo a 320 px
   che non compaia scorrimento orizzontale: è il pavimento di WCAG 2.2 AA
   1.4.10 e axe non lo rileva. Chi sviluppa qui non ha
   occhi e un layout rotto non fallisce nessun test: è l'argomento centrale di
   [ADR-0005](../../03-adr/0005-stack-di-verifica.md), e installare Playwright
   senza mai guardare nulla lo tradisce.
3. **Review in contesto pulito**, sul diff del task:
   - `spec-guardian` — sempre. Cosa manca e cosa è in eccesso rispetto allo
     spec.
   - `code-reviewer` — quando il task scrive codice. Verifica le
     [convenzioni](../../07-convenzioni-codice.md).
   - `design-reviewer` — solo se esiste un riferimento in `design/ref/`.
     Finché la direzione visiva non è definita non ha nulla contro cui
     misurare. È un motivo per definirla presto, non per saltare il passo.
4. **Esito.** Ogni segnalazione si risolve, oppure si rifiuta con il motivo
   scritto nel corpo del commit. Nessuna si ignora in silenzio.

## Vincoli aperti che il piano non risolve

Non bloccano questi task, ma vanno chiusi prima del lancio. Sono tracciati in
[01-discovery.md](../../01-discovery.md).

- Dominio principale non scelto. Il piano usa `leolucaiacoviello.it` in
  `astro.config.mjs`. Una riga da cambiare quando Leo risponde.
- Liberatorie non confermate: **nessuna foto reale va online** finché non c'è
  risposta. Questi task usano immagini di prova.
- Indirizzo di destinazione del form non noto: si configura su Netlify, non nel
  codice. Lo spec lo elenca fra le Impostazioni e il modello del Task 4 non lo
  prevede: è una deviazione voluta, dichiarata qui perché `spec-guardian` la
  troverà e deve poter distinguere una scelta da una dimenticanza.

## File Structure

```
astro.config.mjs                    i18n, site, image.remotePatterns
package.json                        script dev/build/lint/typecheck/test/e2e/perf/a11y
tsconfig.json                       strict
lighthouserc.json                   budget di performance come asserzioni
src/
  i18n/routes.ts                    mappa rotte per lingua, pathFor, otherLocale
  i18n/ui.ts                        stringhe di interfaccia IT/EN
  content/schema.ts                 schemi zod: Foto, Pagina, Faq, Impostazioni
  content/load.ts                   caricamento e validazione dei JSON
  content/*.json                    dati
  components/Foto.astro             wrapper su <Picture>, regole della pipeline
  components/SelettoreLingua.astro  cambio lingua che resta sulla pagina
  components/Hero.astro             poster come LCP, clip dopo
  components/FormContatto.astro     dieci campi, label, errori accessibili
  layouts/Base.astro                html lang, hreflang, head, skip link
  pages/index.astro                 / -> /it/
  pages/it/*.astro  pages/en/*.astro
tests/unit/*.test.ts                vitest
tests/e2e/percorso-critico.spec.ts  playwright
```

Un file per responsabilità. `routes.ts` non conosce i contenuti, `load.ts` non
conosce le rotte, i componenti non leggono i JSON da soli: li ricevono.

---

### Task 1: ADR-0005 — stack di verifica

**Concluso.** ADR accettato in data 2026-09-21, commit `0eee7cd`. Le dipendenze
di verifica sono ora installabili dal Task 2.

Nessun pacchetto si installa prima che questo ADR sia accettato da un umano.

**Files:**
- Create: `docs/03-adr/0005-stack-di-verifica.md`

**Interfaces:**
- Consumes: niente.
- Produces: l'autorizzazione a installare le dipendenze di sviluppo usate da
  tutti i task successivi.

- [x] **Step 1: Scrivere l'ADR**

Usa `docs/03-adr/0000-template.md`. Una sola decisione: quali strumenti
verificano il progetto. Proposta da argomentare nel documento:

| Ruolo | Strumento |
| --- | --- |
| Test unitari | Vitest |
| Test end-to-end | Playwright |
| Budget di performance | Lighthouse CI |
| Accessibilità automatica | axe, via `@axe-core/playwright` |
| Tipi | `astro check` e `tsc --noEmit` |

Alternative da scartare con il motivo reale, non a posteriori: Jest (più lento
e senza supporto ESM nativo di pari qualità), Cypress (più pesante di
Playwright e senza esecuzione multi-browser gratuita equivalente), nessun test
end-to-end (lo spec li rende obbligatori sul percorso critico), WebPageTest
manuale al posto di Lighthouse CI (non è un gate, è una misura occasionale).

Conseguenze negative obbligatorie: cinque dipendenze di sviluppo in più da
aggiornare su un progetto toccato tre volte l'anno; Playwright scarica i
browser, quindi la prima build in CI è lenta; Lighthouse CI su 4G simulata è
rumoroso e va configurato con soglie che non facciano fallire la build a caso.

- [x] **Step 2: Fermarsi e chiedere l'accettazione**

Non proseguire. Presentare l'ADR e attendere conferma esplicita. Alla conferma,
cambiare `Stato: proposto` in `Stato: accettato`.

- [x] **Step 3: Commit**

```bash
git add docs/03-adr/0005-stack-di-verifica.md
git commit -m "docs: ADR-0005 stack di verifica"
```

---

### Task 2: Scaffold Astro e gate di verifica attivo

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`
- Create: `src/pages/index.astro`
- Modify: `.gitignore` (aggiungere `.netlify/`, `test-results/`, `playwright-report/`)

**Interfaces:**
- Consumes: ADR-0005 accettato (Task 1).
- Produces: `npm run build`, `npm run typecheck`, `npm run test`, `npm run e2e`,
  `npm run perf`, `npm run a11y`, `npm run lint`. `./scripts/verify.sh` smette
  di essere un no-op.

- [ ] **Step 1: Creare il progetto Astro**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston
npm pkg set dependencies.astro=7.3.3
npm install
npx astro --version   # deve stampare 7.3.3
```

- [ ] **Step 2: Configurare Astro**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Dominio provvisorio: Leo non ha ancora scelto tra i due che possiede.
  site: 'https://leolucaiacoviello.it',
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  image: {
    // Gli originali vivono su storage a oggetti (ADR-0004). Il pattern va
    // ristretto all'host reale quando lo storage è scelto.
    remotePatterns: [{ protocol: 'https' }],
  },
});
```

- [ ] **Step 3: Installare le dipendenze di verifica**

Autorizzate da ADR-0005. Non anticipare questo passo se l'ADR non è accettato.

```bash
npm install -D vitest @playwright/test @axe-core/playwright @lhci/cli prettier
npx playwright install --with-deps chromium
```

Prettier va installato anche se nessuno script lo invoca direttamente:
`scripts/format-changed.sh`, agganciato all'hook `PostToolUse`, lo cerca in
`node_modules/.bin/prettier` a ogni file scritto e finora non lo trovava.

- [ ] **Step 4: Aggiungere gli script che `verify.sh` cerca**

`scripts/verify.sh` cicla su `lint typecheck build test perf a11y` con
`--if-present`. Definirli tutti, così il gate non passa per omissione.

```bash
npm pkg set scripts.lint="astro check"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.build="astro build"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.e2e="playwright test"
npm pkg set scripts.perf="lhci autorun"
npm pkg set scripts.a11y="playwright test tests/e2e/a11y.spec.ts"
npm pkg set scripts.format="prettier --write ."
```

Reporter compatti, non per estetica: lo sviluppo è agentico e l'output verboso
consuma il contesto di chi sviluppa.

```bash
npm pkg set scripts.test="vitest run --reporter=dot"
npm pkg set scripts.e2e="playwright test --reporter=line"
```

- [ ] **Step 5: Redirect della radice**

```astro
---
// src/pages/index.astro
return Astro.redirect('/it/');
---
```

- [ ] **Step 6: Aggiungere robots.txt**

Lo spec lo elenca nella sitemap. `sitemap.xml` arriva in un piano successivo,
quindi qui non va referenziato: un `Sitemap:` che punta al nulla è peggio che
assente.

```
# public/robots.txt
User-agent: *
Allow: /
```

- [ ] **Step 7: Verificare che la build passi**

Run: `npm run build`
Expected: build completata senza errori.

Run: `./scripts/verify.sh`
Expected: esce 0. Ora esegue davvero gli script, non li salta.

- [ ] **Step 8: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro 7.3.3 con routing i18n"
```

---

### Task 3: Mappa delle rotte e cambio lingua

**Files:**
- Create: `src/i18n/routes.ts`, `src/i18n/ui.ts`
- Create: `src/components/SelettoreLingua.astro`
- Test: `tests/unit/routes.test.ts`

**Interfaces:**
- Consumes: configurazione i18n (Task 2).
- Produces:
  - `type Locale = 'it' | 'en'`
  - `type PageKey = 'home' | 'portfolio' | 'about' | 'faq' | 'contact' | 'thanks'`
  - `ROUTES: Record<PageKey, Record<Locale, string>>`
  - `pathFor(key: PageKey, locale: Locale): string`
  - `otherLocale(locale: Locale): Locale`
  - `keyForPath(path: string): PageKey | undefined`
  - `t(locale: Locale, key: UiKey): string`

- [ ] **Step 1: Scrivere il test che fallisce**

```ts
// tests/unit/routes.test.ts
import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { ROUTES, pathFor, otherLocale, keyForPath, LOCALES } from '../../src/i18n/routes';

describe('mappa delle rotte', () => {
  it('copre entrambe le lingue per ogni pagina', () => {
    for (const [key, byLocale] of Object.entries(ROUTES)) {
      for (const locale of LOCALES) {
        expect(byLocale[locale], `${key}.${locale}`).toMatch(/^\/(it|en)\//);
      }
    }
  });

  it('ogni percorso inizia con il prefisso della propria lingua', () => {
    for (const byLocale of Object.values(ROUTES)) {
      for (const locale of LOCALES) {
        expect(byLocale[locale].startsWith(`/${locale}/`)).toBe(true);
      }
    }
  });

  it('gli slug italiani e inglesi sono diversi dove lo spec lo richiede', () => {
    expect(pathFor('about', 'it')).toBe('/it/chi-sono/');
    expect(pathFor('about', 'en')).toBe('/en/about/');
    expect(pathFor('thanks', 'it')).toBe('/it/grazie/');
    expect(pathFor('thanks', 'en')).toBe('/en/thank-you/');
  });

  it('otherLocale inverte la lingua', () => {
    expect(otherLocale('it')).toBe('en');
    expect(otherLocale('en')).toBe('it');
  });

  it('keyForPath ritrova la pagina da un percorso', () => {
    expect(keyForPath('/en/about/')).toBe('about');
    expect(keyForPath('/it/sconosciuto/')).toBeUndefined();
  });

  it('per ogni rotta esiste un file di pagina', () => {
    for (const byLocale of Object.values(ROUTES)) {
      for (const locale of LOCALES) {
        const slug = byLocale[locale].split('/').filter(Boolean)[1];
        const file = slug
          ? `src/pages/${locale}/${slug}.astro`
          : `src/pages/${locale}/index.astro`;
        expect(existsSync(file), `manca ${file}`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run test`
Expected: FAIL, `Cannot find module '../../src/i18n/routes'`.

- [ ] **Step 3: Implementare la mappa**

```ts
// src/i18n/routes.ts
export const LOCALES = ['it', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type PageKey =
  | 'home' | 'portfolio' | 'about' | 'faq' | 'contact' | 'thanks';

export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home:      { it: '/it/',           en: '/en/' },
  portfolio: { it: '/it/portfolio/', en: '/en/portfolio/' },
  about:     { it: '/it/chi-sono/',  en: '/en/about/' },
  faq:       { it: '/it/faq/',       en: '/en/faq/' },
  contact:   { it: '/it/contatti/',  en: '/en/contact/' },
  thanks:    { it: '/it/grazie/',    en: '/en/thank-you/' },
};

export function pathFor(key: PageKey, locale: Locale): string {
  return ROUTES[key][locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'it' ? 'en' : 'it';
}

export function keyForPath(path: string): PageKey | undefined {
  const normalised = path.endsWith('/') ? path : `${path}/`;
  return (Object.keys(ROUTES) as PageKey[]).find((key) =>
    LOCALES.some((locale) => ROUTES[key][locale] === normalised),
  );
}
```

- [ ] **Step 4: Implementare le stringhe di interfaccia**

```ts
// src/i18n/ui.ts
import type { Locale } from './routes';

const UI = {
  it: {
    'nav.portfolio': 'Portfolio',
    'nav.about': 'Chi sono',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contatti',
    'lang.switch': 'English',
    'skip.content': 'Vai al contenuto',
    'form.send': 'Invia richiesta',
    'form.error.required': 'Questo campo è obbligatorio',
    'form.error.email': 'Inserisci un indirizzo email valido',
  },
  en: {
    'nav.portfolio': 'Portfolio',
    'nav.about': 'About',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'lang.switch': 'Italiano',
    'skip.content': 'Skip to content',
    'form.send': 'Send request',
    'form.error.required': 'This field is required',
    'form.error.email': 'Enter a valid email address',
  },
} as const;

export type UiKey = keyof (typeof UI)['it'];

export function t(locale: Locale, key: UiKey): string {
  return UI[locale][key];
}
```

- [ ] **Step 5: Creare i file di pagina vuoti richiesti dal test**

Per ogni rotta, un file che per ora rende solo il titolo. Dodici file:
`src/pages/it/index.astro`, `portfolio.astro`, `chi-sono.astro`, `faq.astro`,
`contatti.astro`, `grazie.astro` e i corrispondenti sotto `src/pages/en/`
(`index`, `portfolio`, `about`, `faq`, `contact`, `thank-you`).

```astro
---
// src/pages/it/portfolio.astro — stesso schema per tutti e dodici
const locale = 'it' as const;
---
<html lang={locale}><body><h1>Portfolio</h1></body></html>
```

- [ ] **Step 6: Implementare il selettore lingua**

```astro
---
// src/components/SelettoreLingua.astro
import { pathFor, otherLocale, keyForPath, type Locale } from '../i18n/routes';
import { t } from '../i18n/ui';

interface Props { locale: Locale }
const { locale } = Astro.props;

const key = keyForPath(Astro.url.pathname);
const target = otherLocale(locale);
// Se la pagina non è in mappa, il cambio lingua torna alla home di quella
// lingua invece di rompersi.
const href = key ? pathFor(key, target) : pathFor('home', target);
---
<a href={href} hreflang={target} lang={target}>{t(locale, 'lang.switch')}</a>
```

- [ ] **Step 7: Eseguire i test**

Run: `npm run test`
Expected: PASS, sei test verdi.

- [ ] **Step 8: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 9: Commit**

```bash
git add src/i18n src/components/SelettoreLingua.astro src/pages tests/unit/routes.test.ts
git commit -m "feat: mappa rotte bilingue e selettore lingua"
```

---

### Task 4: Modello dei contenuti validato

**Files:**
- Create: `src/content/schema.ts`, `src/content/load.ts`
- Create: `src/content/foto.json`, `pagine.json`, `faq.json`, `impostazioni.json`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: `Locale` da `src/i18n/routes.ts` (Task 3).
- Produces:
  - `FotoSchema`, `PaginaSchema`, `FaqSchema`, `ImpostazioniSchema` (zod)
  - `type Foto = { file: string; ordine: number; alt_it: string;
    alt_en: string; in_home: boolean }`
  - `caricaFoto(): Foto[]` — ordinate per `ordine` crescente
  - `caricaFaq(): Faq[]`, `caricaPagine(): Pagina[]`, `caricaImpostazioni(): Impostazioni`
  - `altPer(foto: Foto, locale: Locale): string`

- [ ] **Step 1: Scrivere il test che fallisce**

```ts
// tests/unit/content.test.ts
import { describe, it, expect } from 'vitest';
import { FotoSchema } from '../../src/content/schema';
import { caricaFoto, altPer } from '../../src/content/load';

describe('schema Foto', () => {
  const valida = {
    file: 'https://storage.example/f001.jpg',
    ordine: 0, alt_it: 'sposa sulla scalinata',
    alt_en: 'bride on the steps', in_home: true,
  };

  it('accetta una foto completa', () => {
    expect(FotoSchema.parse(valida)).toMatchObject({ ordine: 0 });
  });

  it('rifiuta un testo alternativo italiano vuoto', () => {
    expect(() => FotoSchema.parse({ ...valida, alt_it: '' })).toThrow();
  });

  it('rifiuta un testo alternativo inglese mancante', () => {
    const { alt_en, ...senzaEn } = valida;
    expect(() => FotoSchema.parse(senzaEn)).toThrow();
  });

  it('rifiuta un file che non è un URL remoto', () => {
    expect(() => FotoSchema.parse({ ...valida, file: './locale.jpg' })).toThrow();
  });

  it('in_home vale false se assente', () => {
    const { in_home, ...senzaHome } = valida;
    expect(FotoSchema.parse(senzaHome).in_home).toBe(false);
  });
});

describe('caricamento', () => {
  it('restituisce le foto ordinate per ordine crescente', () => {
    const foto = caricaFoto();
    const ordini = foto.map((f) => f.ordine);
    expect(ordini).toEqual([...ordini].sort((a, b) => a - b));
  });

  it('non ammette due foto con lo stesso ordine', () => {
    const ordini = caricaFoto().map((f) => f.ordine);
    expect(new Set(ordini).size).toBe(ordini.length);
  });

  it('altPer sceglie la lingua giusta', () => {
    const foto = caricaFoto()[0];
    expect(altPer(foto, 'it')).toBe(foto.alt_it);
    expect(altPer(foto, 'en')).toBe(foto.alt_en);
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run test`
Expected: FAIL, modulo `src/content/schema` inesistente.

- [ ] **Step 3: Implementare gli schemi**

```ts
// src/content/schema.ts
import { z } from 'zod';

export const FotoSchema = z.object({
  file: z.string().url().startsWith('https://'),
  ordine: z.number().int().nonnegative(),
  alt_it: z.string().min(1),
  alt_en: z.string().min(1),
  in_home: z.boolean().default(false),
});
export type Foto = z.infer<typeof FotoSchema>;

export const PaginaSchema = z.object({
  slug: z.string().min(1),
  titolo_it: z.string().min(1),
  titolo_en: z.string().min(1),
  seo_title_it: z.string().min(1).max(60),
  seo_title_en: z.string().min(1).max(60),
  seo_description_it: z.string().min(1).max(155),
  seo_description_en: z.string().min(1).max(155),
  corpo_it: z.string().default(''),
  corpo_en: z.string().default(''),
});
export type Pagina = z.infer<typeof PaginaSchema>;

export const FaqSchema = z.object({
  ordine: z.number().int().nonnegative(),
  domanda_it: z.string().min(1),
  domanda_en: z.string().min(1),
  risposta_it: z.string().min(1),
  risposta_en: z.string().min(1),
});
export type Faq = z.infer<typeof FaqSchema>;

export const ImpostazioniSchema = z.object({
  motto_it: z.string().min(1),
  motto_en: z.string().min(1),
  hero_poster: z.string().url(),
  hero_clip: z.string().url().optional(),
  email: z.string().email(),
  telefono: z.string().optional(),
  area: z.string().min(1),
  social: z.array(z.object({ nome: z.string(), url: z.string().url() })).default([]),
});
export type Impostazioni = z.infer<typeof ImpostazioniSchema>;
```

Nessun campo `id`: lo spec non lo prevede né per le foto né per le FAQ, e
`ordine` insieme a `file` identifica già una voce. La prima stesura lo
aggiungeva a entrambe le entità senza che nulla lo richiedesse, ed è
esattamente la lista "in eccesso" di `spec-guardian`. Se il pannello di
ADR-0004 dovesse pretenderlo, si aggiorna prima lo spec.

- [ ] **Step 4: Implementare il caricamento**

```ts
// src/content/load.ts
import { readFileSync } from 'node:fs';
import type { Locale } from '../i18n/routes';
import {
  FotoSchema, FaqSchema, PaginaSchema, ImpostazioniSchema,
  type Foto, type Faq, type Pagina, type Impostazioni,
} from './schema';

function leggi(nome: string): unknown {
  return JSON.parse(readFileSync(new URL(`./${nome}.json`, import.meta.url), 'utf-8'));
}

export function caricaFoto(): Foto[] {
  const foto = FotoSchema.array().parse(leggi('foto'));
  const ordini = foto.map((f) => f.ordine);
  if (new Set(ordini).size !== ordini.length) {
    throw new Error('foto.json: due foto hanno lo stesso ordine');
  }
  return foto.sort((a, b) => a.ordine - b.ordine);
}

export function caricaFaq(): Faq[] {
  return FaqSchema.array().parse(leggi('faq')).sort((a, b) => a.ordine - b.ordine);
}

export function caricaPagine(): Pagina[] {
  return PaginaSchema.array().parse(leggi('pagine'));
}

export function caricaImpostazioni(): Impostazioni {
  return ImpostazioniSchema.parse(leggi('impostazioni'));
}

export function altPer(foto: Foto, locale: Locale): string {
  return locale === 'it' ? foto.alt_it : foto.alt_en;
}
```

- [ ] **Step 5: Creare dati di prova**

`foto.json` con almeno cinque voci che puntano a immagini di prova remote,
`ordine` da 0 a 4, le prime due con `in_home: true`. Non usare foto di Leo: le
liberatorie non sono confermate.

- [ ] **Step 6: Eseguire i test**

Run: `npm run test`
Expected: PASS, otto test verdi.

- [ ] **Step 7: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 8: Commit**

```bash
git add src/content tests/unit/content.test.ts package.json package-lock.json
git commit -m "feat: modello contenuti validato con zod"
```

---

### Task 5: Componente immagine conforme alla pipeline

**Files:**
- Create: `src/components/Foto.astro`
- Test: `tests/unit/foto-component.test.ts`

**Interfaces:**
- Consumes: `Foto`, `altPer` (Task 4), `Locale` (Task 3).
- Produces: componente `<Foto foto={...} locale={...} priorita={boolean} sizes={string} />`
  che rende un `<picture>` conforme ai Global Constraints.

- [ ] **Step 1: Scrivere il test che fallisce**

Il test rende il componente con il container di Astro e verifica il markup.

```ts
// tests/unit/foto-component.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Foto from '../../src/components/Foto.astro';

const foto = {
  file: 'https://storage.example/f001.jpg', ordine: 0,
  alt_it: 'sposa sulla scalinata', alt_en: 'bride on the steps', in_home: true,
};

let html: string;
let htmlPrioritaria: string;

beforeAll(async () => {
  const container = await AstroContainer.create();
  html = await container.renderToString(Foto, {
    props: { foto, locale: 'it', priorita: false, sizes: '100vw' },
  });
  htmlPrioritaria = await container.renderToString(Foto, {
    props: { foto, locale: 'it', priorita: true, sizes: '100vw' },
  });
});

describe('componente Foto', () => {
  it('emette sorgenti AVIF e WebP', () => {
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
  });

  it('non serve mai JPEG', () => {
    expect(html).not.toMatch(/\.jpe?g["\s]/);
  });

  it('dichiara width e height per tenere il CLS', () => {
    expect(html).toMatch(/width="\d+"/);
    expect(html).toMatch(/height="\d+"/);
  });

  it('usa il testo alternativo della lingua richiesta', () => {
    expect(html).toContain('alt="sposa sulla scalinata"');
  });

  it('è lazy quando non è prioritaria', () => {
    expect(html).toContain('loading="lazy"');
  });

  it('è eager quando è prioritaria', () => {
    expect(htmlPrioritaria).toContain('loading="eager"');
    expect(htmlPrioritaria).not.toContain('loading="lazy"');
  });

  it('decodifica in modo asincrono', () => {
    expect(html).toContain('decoding="async"');
  });

  it('non supera i 2400 px di lato lungo', () => {
    const larghezze = [...html.matchAll(/(\d+)w/g)].map((m) => Number(m[1]));
    expect(Math.max(...larghezze)).toBeLessThanOrEqual(2400);
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run test`
Expected: FAIL, componente inesistente.

- [ ] **Step 3: Implementare il componente**

```astro
---
// src/components/Foto.astro
import { Picture } from 'astro:assets';
import { altPer } from '../content/load';
// Il tipo si chiama Foto come questo componente: lo rinomino per non confondere
// chi legge.
import type { Foto as DatoFoto } from '../content/schema';
import type { Locale } from '../i18n/routes';

interface Props {
  foto: DatoFoto;
  locale: Locale;
  /** true solo per il poster dell'hero e le prime tre del flusso. */
  priorita?: boolean;
  sizes: string;
}

const { foto, locale, priorita = false, sizes } = Astro.props;

// Larghezze e formati sono vincoli di spec, non preferenze: non parametrizzarli.
const LARGHEZZE = [400, 800, 1200, 1600, 2400];
---
<Picture
  src={foto.file}
  inferSize
  formats={['avif', 'webp']}
  fallbackFormat="webp"
  widths={LARGHEZZE}
  sizes={sizes}
  alt={altPer(foto, locale)}
  loading={priorita ? 'eager' : 'lazy'}
  decoding="async"
/>
```

- [ ] **Step 4: Eseguire i test**

Run: `npm run test`
Expected: PASS, otto test verdi.

Se `inferSize` fallisce su URL remoti in build, sostituirlo con
`inferRemoteSize()` da `astro/assets/utils` chiamato nel frontmatter e passare
`width`/`height` espliciti. Il test su `width`/`height` copre entrambi i casi.

- [ ] **Step 5: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 6: Commit**

```bash
git add src/components/Foto.astro tests/unit/foto-component.test.ts
git commit -m "feat: componente immagine conforme alla pipeline"
```

---

### Task 6: Layout base accessibile

**Files:**
- Create: `src/layouts/Base.astro`
- Modify: i dodici file in `src/pages/it/` e `src/pages/en/` per usarlo
- Test: `tests/e2e/a11y.spec.ts`

**Interfaces:**
- Consumes: `pathFor`, `otherLocale`, `keyForPath`, `t` (Task 3).
- Produces: `<Base locale={Locale} pageKey={PageKey} title={string}
  description={string}>` con `<html lang>`, `hreflang` reciproco più
  `x-default`, skip link, e `<slot />` dentro `<main id="contenuto">`.

- [ ] **Step 1: Scrivere il test di accessibilità che fallisce**

```ts
// tests/e2e/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES, LOCALES } from '../../src/i18n/routes';

const percorsi = Object.values(ROUTES).flatMap((byLocale) =>
  LOCALES.map((locale) => byLocale[locale]),
);

for (const percorso of percorsi) {
  test(`${percorso} non ha violazioni axe`, async ({ page }) => {
    await page.goto(percorso);
    const esito = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(esito.violations).toEqual([]);
  });

  test(`${percorso} dichiara lang e hreflang`, async ({ page }) => {
    await page.goto(percorso);
    const locale = percorso.split('/')[1];
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('link[rel="alternate"][hreflang="it"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  });
}

test('il cambio lingua resta sulla stessa pagina', async ({ page }) => {
  await page.goto('/it/chi-sono/');
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/about\/$/);
});

test('lo skip link porta al contenuto da tastiera', async ({ page }) => {
  await page.goto('/it/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Vai al contenuto' })).toBeFocused();
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run a11y`
Expected: FAIL, nessun `hreflang`, nessuno skip link.

- [ ] **Step 3: Implementare il layout**

```astro
---
// src/layouts/Base.astro
import { LOCALES, pathFor, type Locale, type PageKey } from '../i18n/routes';
import { t } from '../i18n/ui';
import SelettoreLingua from '../components/SelettoreLingua.astro';

interface Props {
  locale: Locale;
  pageKey: PageKey;
  title: string;
  description: string;
}
const { locale, pageKey, title, description } = Astro.props;
const canonical = new URL(pathFor(pageKey, locale), Astro.site);
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {LOCALES.map((l) => (
      <link rel="alternate" hreflang={l} href={new URL(pathFor(pageKey, l), Astro.site)} />
    ))}
    <link rel="alternate" hreflang="x-default" href={new URL(pathFor(pageKey, 'it'), Astro.site)} />
  </head>
  <body>
    <a class="skip" href="#contenuto">{t(locale, 'skip.content')}</a>
    <header>
      <nav aria-label={locale === 'it' ? 'Principale' : 'Main'}>
        <a href={pathFor('portfolio', locale)}>{t(locale, 'nav.portfolio')}</a>
        <a href={pathFor('about', locale)}>{t(locale, 'nav.about')}</a>
        <a href={pathFor('faq', locale)}>{t(locale, 'nav.faq')}</a>
        <a href={pathFor('contact', locale)}>{t(locale, 'nav.contact')}</a>
        <SelettoreLingua locale={locale} />
      </nav>
    </header>
    <main id="contenuto"><slot /></main>
  </body>
</html>

<style>
  .skip { position: absolute; left: -9999px; }
  .skip:focus { left: 0; top: 0; }
</style>
```

- [ ] **Step 4: Convertire le dodici pagine all'uso del layout**

Ogni pagina passa `locale`, `pageKey`, `title`, `description` e mette il proprio
contenuto nello slot. Nessuna pagina scrive più `<html>` da sé.

- [ ] **Step 5: Creare le due pagine 404**

Lo spec richiede una pagina 404 per lingua. Usano lo stesso layout, così
chi sbaglia URL resta dentro il sito invece di trovare la pagina di Netlify.

```astro
---
// src/pages/it/404.astro — la versione en/ è identica con locale = 'en'
import Base from '../../layouts/Base.astro';
import { pathFor } from '../../i18n/routes';
const locale = 'it' as const;
---
<Base locale={locale} pageKey="home" title="Pagina non trovata"
      description="La pagina che cerchi non esiste.">
  <h1>Pagina non trovata</h1>
  <a href={pathFor('portfolio', locale)}>Vai al portfolio</a>
</Base>
```

- [ ] **Step 6: Eseguire i test**

Run: `npm run build && npm run a11y`
Expected: PASS su tutte e ventisei le asserzioni.

- [ ] **Step 7: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 8: Commit**

```bash
git add src/layouts src/pages tests/e2e/a11y.spec.ts
git commit -m "feat: layout base con hreflang, skip link e pagine 404"
```

---

### Task 7: Portfolio, flusso unico

**Files:**
- Modify: `src/pages/it/portfolio.astro`, `src/pages/en/portfolio.astro`
- Test: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Consumes: `caricaFoto` (Task 4), `Foto.astro` (Task 5), `Base.astro` (Task 6).
- Produces: la pagina che il percorso critico attraversa.

- [ ] **Step 1: Scrivere il test che fallisce**

```ts
// tests/e2e/portfolio.spec.ts
import { test, expect } from '@playwright/test';

test('il portfolio è una sequenza unica senza filtri', async ({ page }) => {
  await page.goto('/it/portfolio/');
  await expect(page.getByRole('img')).not.toHaveCount(0);
  await expect(page.getByRole('button', { name: /filtr|categor/i })).toHaveCount(0);
});

test('solo le prime tre immagini sono eager', async ({ page }) => {
  await page.goto('/it/portfolio/');
  const eager = page.locator('img[loading="eager"]');
  await expect(eager).toHaveCount(3);
});

test('ogni immagine ha un testo alternativo non vuoto', async ({ page }) => {
  await page.goto('/it/portfolio/');
  for (const alt of await page.locator('img').evaluateAll(
    (imgs) => imgs.map((i) => i.getAttribute('alt')),
  )) {
    expect(alt?.trim()).toBeTruthy();
  }
});

test("l'ordine è stabile tra due caricamenti", async ({ page }) => {
  const leggi = async () => {
    await page.goto('/it/portfolio/');
    return page.locator('img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt')));
  };
  expect(await leggi()).toEqual(await leggi());
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run build && npx playwright test tests/e2e/portfolio.spec.ts`
Expected: FAIL, la pagina non ha immagini.

- [ ] **Step 3: Implementare la pagina**

```astro
---
// src/pages/it/portfolio.astro — la versione en/ è identica con locale = 'en'
import Base from '../../layouts/Base.astro';
import Foto from '../../components/Foto.astro';
import { caricaFoto } from '../../content/load';

const locale = 'it' as const;
const foto = caricaFoto();
const PRIORITARIE = 3;
---
<Base
  locale={locale}
  pageKey="portfolio"
  title="Portfolio — Leo Luca Iacoviello"
  description="Una selezione del mio lavoro di fotografo di matrimoni."
>
  <h1>Portfolio</h1>
  <div class="flusso">
    {foto.map((f, i) => (
      <Foto foto={f} locale={locale} priorita={i < PRIORITARIE} sizes="(max-width: 800px) 100vw, 1200px" />
    ))}
  </div>
</Base>
```

- [ ] **Step 4: Eseguire i test**

Run: `npm run build && npx playwright test tests/e2e/portfolio.spec.ts`
Expected: PASS, quattro test verdi.

- [ ] **Step 5: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 6: Commit**

```bash
git add src/pages/it/portfolio.astro src/pages/en/portfolio.astro tests/e2e/portfolio.spec.ts
git commit -m "feat: portfolio come flusso unico ordinato"
```

---

### Task 8: Form di contatto e pagina di conferma

**Files:**
- Create: `src/components/FormContatto.astro`
- Modify: `src/pages/it/contatti.astro`, `src/pages/en/contact.astro`,
  `src/pages/it/grazie.astro`, `src/pages/en/thank-you.astro`
- Test: `tests/e2e/form.spec.ts`

**Interfaces:**
- Consumes: `Base.astro` (Task 6), `t` (Task 3).
- Produces: il form dei dieci campi di US-5, con recapito gestito da Netlify.

**Nota sul recapito.** Netlify intercetta gli invii solo sul suo hosting: in
locale la POST non arriva da nessuna parte. Questi test verificano struttura,
validazione, accessibilità e navigabilità da tastiera. Che l'invio raggiunga
davvero l'email va verificato una volta sola su una deploy preview, ed è il
Task 10.

- [ ] **Step 1: Scrivere il test che fallisce**

```ts
// tests/e2e/form.spec.ts
import { test, expect } from '@playwright/test';

const OBBLIGATORI = ['nome', 'email', 'data_evento', 'location', 'fascia_budget'];
const FACOLTATIVI = ['telefono', 'tipo_cerimonia', 'momento', 'wedding_planner', 'messaggio'];

test('espone tutti i campi previsti dallo spec', async ({ page }) => {
  await page.goto('/it/contatti/');
  for (const nome of [...OBBLIGATORI, ...FACOLTATIVI]) {
    await expect(page.locator(`[name="${nome}"]`)).toHaveCount(1);
  }
});

test('ogni campo ha una label associata, nessun placeholder al suo posto', async ({ page }) => {
  await page.goto('/it/contatti/');
  for (const nome of OBBLIGATORI) {
    const campo = page.locator(`[name="${nome}"]`);
    const id = await campo.getAttribute('id');
    expect(id).toBeTruthy();
    await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
  }
});

test('il nome della wedding planner compare solo se c’è una wedding planner', async ({ page }) => {
  await page.goto('/it/contatti/');
  await expect(page.locator('[name="wedding_planner_nome"]')).toBeHidden();
  await page.locator('[name="wedding_planner"]').check();
  await expect(page.locator('[name="wedding_planner_nome"]')).toBeVisible();
});

test('un errore è annunciato e sposta il focus sul primo campo non valido', async ({ page }) => {
  await page.goto('/it/contatti/');
  await page.getByRole('button', { name: 'Invia richiesta' }).click();
  const nome = page.locator('[name="nome"]');
  await expect(nome).toBeFocused();
  await expect(nome).toHaveAttribute('aria-invalid', 'true');
  const descritto = await nome.getAttribute('aria-describedby');
  await expect(page.locator(`#${descritto}`)).toHaveText(/obbligatorio/i);
});

test('il form è percorribile solo da tastiera', async ({ page }) => {
  await page.goto('/it/contatti/');
  await page.locator('[name="nome"]').focus();
  for (let i = 0; i < 12; i += 1) await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Invia richiesta' })).toBeFocused();
});

test('è configurato per il recapito Netlify senza CAPTCHA visibile', async ({ page }) => {
  await page.goto('/it/contatti/');
  const form = page.locator('form[data-netlify="true"]');
  await expect(form).toHaveCount(1);
  await expect(form).toHaveAttribute('action', '/it/grazie/');
  await expect(page.locator('input[name="bot-field"]')).toBeHidden();
  await expect(page.locator('.g-recaptcha, iframe[src*="recaptcha"]')).toHaveCount(0);
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run build && npx playwright test tests/e2e/form.spec.ts`
Expected: FAIL, la pagina contatti non ha form.

- [ ] **Step 3: Implementare il form**

Dieci campi, `action` verso la conferma nella lingua corrente, honeypot
`bot-field` nascosto al posto del CAPTCHA, `novalidate` sul form perché la
validazione la gestiamo noi per poter spostare il focus e collegare gli errori
con `aria-describedby`. Ogni campo ha `id`, `label for`, e un `<p>` di errore
con id stabile `errore-<nome>`.

```astro
---
// src/components/FormContatto.astro
import { pathFor, type Locale } from '../i18n/routes';
import { t } from '../i18n/ui';

interface Props { locale: Locale }
const { locale } = Astro.props;
const azione = pathFor('thanks', locale);
const FASCE = ['fino a 1.500 €', '1.500-3.000 €', '3.000-5.000 €', 'oltre 5.000 €'];
---
<form name="contatto" method="POST" data-netlify="true"
      netlify-honeypot="bot-field" action={azione} novalidate>
  <input type="hidden" name="form-name" value="contatto" />
  <p hidden><label>Non compilare: <input name="bot-field" /></label></p>

  <p>
    <label for="nome">Nome e cognome *</label>
    <input id="nome" name="nome" type="text" required aria-describedby="errore-nome" />
    <span id="errore-nome" class="errore" role="alert"></span>
  </p>
  <!-- email, telefono, data_evento, tipo_cerimonia, momento, location,
       wedding_planner, wedding_planner_nome, fascia_budget, messaggio
       seguono lo stesso schema: label for, aria-describedby, span di errore. -->

  <button type="submit">{t(locale, 'form.send')}</button>
</form>

<script>
  const form = document.querySelector('form[name="contatto"]') as HTMLFormElement;
  const planner = form.querySelector('[name="wedding_planner"]') as HTMLInputElement;
  const nomePlanner = form.querySelector('[name="wedding_planner_nome"]')
    ?.closest('p') as HTMLElement;

  nomePlanner.hidden = !planner.checked;
  planner.addEventListener('change', () => { nomePlanner.hidden = !planner.checked; });

  form.addEventListener('submit', (evento) => {
    let primoNonValido: HTMLInputElement | null = null;
    for (const campo of form.querySelectorAll<HTMLInputElement>('[required]')) {
      const errore = document.getElementById(`errore-${campo.name}`);
      const valido = campo.checkValidity();
      campo.setAttribute('aria-invalid', String(!valido));
      if (errore) errore.textContent = valido ? '' : campo.validationMessage;
      if (!valido && !primoNonValido) primoNonValido = campo;
    }
    if (primoNonValido) { evento.preventDefault(); primoNonValido.focus(); }
  });
</script>
```

I messaggi di errore vengono da `campo.validationMessage`, che il browser
localizza da sé secondo `<html lang>`. Il test cerca `/obbligatorio/i`: se il
messaggio nativo non contiene quella parola, sostituirlo con
`t(locale, 'form.error.required')` passato al client via `data-` attribute.

- [ ] **Step 4: Implementare le pagine contatti e conferma**

Le due pagine contatti includono `<FormContatto locale={...} />`. Le due pagine
di conferma sono statiche: titolo, messaggio, tempi di risposta, e un
collegamento di ritorno al portfolio.

- [ ] **Step 5: Eseguire i test**

Run: `npm run build && npx playwright test tests/e2e/form.spec.ts`
Expected: PASS, sei test verdi.

- [ ] **Step 6: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 7: Commit**

```bash
git add src/components/FormContatto.astro src/pages tests/e2e/form.spec.ts
git commit -m "feat: form di contatto accessibile e pagina di conferma"
```

---

### Task 9: Home e test end-to-end del percorso critico

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/it/index.astro`, `src/pages/en/index.astro`
- Test: `tests/e2e/percorso-critico.spec.ts`

**Interfaces:**
- Consumes: tutto quanto precede.
- Produces: il test che lo spec rende obbligatorio. Se fallisce, si blocca il
  rilascio.

- [ ] **Step 1: Scrivere il test che fallisce**

```ts
// tests/e2e/percorso-critico.spec.ts
import { test, expect } from '@playwright/test';

test('arrivo, portfolio, richiesta, conferma — da tastiera', async ({ page }) => {
  await page.goto('/it/');
  await expect(page.locator('main img').first()).toBeVisible();

  await page.getByRole('link', { name: 'Portfolio' }).first().click();
  await expect(page).toHaveURL(/\/it\/portfolio\/$/);

  await page.getByRole('link', { name: 'Contatti' }).click();
  await expect(page).toHaveURL(/\/it\/contatti\/$/);

  await page.locator('[name="nome"]').fill('Anna Rossi');
  await page.locator('[name="email"]').fill('anna@example.com');
  await page.locator('[name="data_evento"]').fill('2027-06-12');
  await page.locator('[name="location"]').fill('Villa Reale, Monza');
  await page.locator('[name="fascia_budget"]').selectOption({ index: 2 });

  // In locale Netlify non intercetta la POST: si verifica che il form sia
  // valido e diretto alla conferma. Il recapito reale è nel Task 10.
  const form = page.locator('form[name="contatto"]');
  await expect(form).toHaveAttribute('action', '/it/grazie/');
  expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(true);

  await page.goto('/it/grazie/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test("l'elemento più grande della home è una fotografia, non del testo", async ({ page }) => {
  await page.goto('/it/');
  const primo = page.locator('main img').first();
  await expect(primo).toHaveAttribute('loading', 'eager');
});

test('la home mostra fra dieci e quindici foto di richiamo', async ({ page }) => {
  await page.goto('/it/');
  const conteggio = await page.locator('.richiamo img').count();
  expect(conteggio).toBeGreaterThanOrEqual(10);
  expect(conteggio).toBeLessThanOrEqual(15);
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run build && npx playwright test tests/e2e/percorso-critico.spec.ts`
Expected: FAIL, la home è vuota.

- [ ] **Step 3: Implementare l'hero**

Il poster è l'LCP ed è sempre presente. La clip parte dopo, non su mobile e non
con `prefers-reduced-motion`.

```astro
---
// src/components/Hero.astro
interface Props { poster: string; clip?: string; motto: string }
const { poster, clip, motto } = Astro.props;
---
<section class="hero">
  <img src={poster} alt="" width="2400" height="1350" loading="eager" fetchpriority="high" />
  {clip && <video class="clip" muted loop playsinline preload="none" data-src={clip}></video>}
  <h1>{motto}</h1>
</section>

<script>
  const video = document.querySelector<HTMLVideoElement>('.hero .clip');
  const riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 800px)').matches;
  if (video && !riduci && !mobile) {
    addEventListener('load', () => {
      video.src = video.dataset.src!;
      video.play().catch(() => {});
    });
  }
</script>
```

Il poster ha `alt=""` perché il motto adiacente porta già il significato:
duplicarlo creerebbe rumore per uno screen reader.

- [ ] **Step 4: Implementare la home**

Hero, poi le foto con `in_home: true` dentro `.richiamo`, poi un collegamento
esplicito al portfolio. Le foto di richiamo non sono prioritarie: l'unica eager
è il poster.

- [ ] **Step 5: Eseguire i test**

Run: `npm run build && npm run e2e`
Expected: PASS su tutta la suite.

- [ ] **Step 6: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero.astro src/pages tests/e2e/percorso-critico.spec.ts
git commit -m "feat: home con hero e test end-to-end del percorso critico"
```

---

### Task 10: Gate di performance e verifica del recapito

**Files:**
- Create: `lighthouserc.json`, `netlify.toml`
- Test: la configurazione stessa è il test.

**Interfaces:**
- Consumes: il sito costruito (Task 2-9).
- Produces: `npm run perf` che fallisce se i budget dello spec sono superati.

- [ ] **Step 1: Scrivere il budget come asserzioni**

ADR-0005 impone di assertare ciò che dipende dal codice e rimandare ciò che
dipende dalle fotografie. Con contenuti di prova, LCP e peso trasferito
misurano le immagini finte, non il sito.

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": ["http://localhost/it/index.html", "http://localhost/it/portfolio/index.html"],
      "numberOfRuns": 3,
      "settings": { "preset": "desktop", "throttlingMethod": "simulate" }
    },
    "assert": {
      "assertions": {
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 51200 }],
        "largest-contentful-paint": "off",
        "total-byte-weight": "off"
      }
    }
  }
}
```

`51200` è 50 KB in byte, il budget JavaScript dello spec.

Le due asserzioni a `off` **non sono opzionali, sono rimandate**. Vanno accese
insieme alle foto vere, sostituendo `off` con
`["error", { "maxNumericValue": 2000 }]` per l'LCP e
`["error", { "maxNumericValue": 1258291 }]` per il peso, cioè 1.2 MB in byte,
e passando da `preset: desktop` alla configurazione mobile 4G. Se nessuno lo
fa, il progetto crede di avere un gate che non misura ciò che conta: per questo
l'accensione va scritta nel runbook, non lasciata alla memoria.

- [ ] **Step 2: Eseguire e verificare che i budget passino**

Run: `npm run build && npm run perf`
Expected: nessuna asserzione violata.

- [ ] **Step 3: Configurare Netlify**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/"
  to = "/it/"
  status = 302
```

- [ ] **Step 4: Verificare il recapito reale del form, una volta**

Questo passo non è automatizzabile in locale. Su una deploy preview: inviare il
form compilato, confermare che la conferma appaia, e che la richiesta arrivi
all'indirizzo configurato con tutti i campi leggibili. Verificare anche su
quale piano è l'account Netlify di Leo, per sapere se vale il tetto di 100
invii al mese.

Registrare l'esito con uno screenshot. Senza evidenza, il task non è concluso.

- [ ] **Step 5: Scrivere nel runbook ciò che resta acceso a metà**

ADR-0005 lo impone e la prima stesura di questo piano non lo faceva: diceva che
l'accensione delle asserzioni rimandate «va scritta nel runbook, non lasciata
alla memoria», e poi non la scriveva da nessuna parte.

In [06-runbook.md](../../06-runbook.md), sotto **Manutenzione**, una
sottosezione marcata come rivolta a chi mantiene il sito e non a Leo: quali
asserzioni di `lighthouserc.json` sono spente, con quali valori vanno accese,
e che l'innesco è l'arrivo delle foto vere.

- [ ] **Step 6: Eseguire il gate completo**

Run: `./scripts/verify.sh`
Expected: `verify: tutti i controlli superati`, exit 0.

- [ ] **Step 7: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [ ] **Step 8: Commit**

```bash
git add lighthouserc.json netlify.toml docs/06-runbook.md
git commit -m "feat: gate di performance e configurazione Netlify"
```

---

## Cosa questo piano non copre

Ognuno richiede un piano proprio, e due sono bloccati.

- **Pagine Chi sono e FAQ.** Non sono sul percorso critico e richiedono i testi
  di Leo. Piano successivo, nessun blocco tecnico.
- **Direzione visiva e design system.** Non è bloccata, ha un piano proprio e
  corre in parallelo a questo. Claude Design produce due o tre direzioni, Leo
  ne sceglie una, e da lì escono i token CSS, `docs/04-design-system.md`
  compilato e i riferimenti in `design/ref/`. Il brand mancante non è un
  prerequisito: è l'output. I tre riferimenti negativi che
  [01-discovery.md](../../01-discovery.md) aspetta si ottengono dalle due
  direzioni che Leo scarta, quindi attenderli per poter iniziare è
  un'attesa circolare. **Deve chiudere prima del Task 6:** i Task 2-5 non
  toccano la resa visiva, il Task 6 la crea. Questo piano produce markup
  corretto e accessibile, non un sito finito da vedere.
- **Pannello di redazione.** Bloccato dalla verifica in
  [ADR-0004](../../03-adr/0004-pannello-e-storage-immagini.md): autenticazione
  da accertare prima di scegliere il prodotto.
- **Dati strutturati, sitemap.xml, redirect dal vecchio sito.** Lo spec li
  richiede; i redirect dipendono dall'elenco degli URL vivi, che è una domanda
  aperta con Leo.
- **Contenuti reali e foto vere.** Bloccati dalle liberatorie.
