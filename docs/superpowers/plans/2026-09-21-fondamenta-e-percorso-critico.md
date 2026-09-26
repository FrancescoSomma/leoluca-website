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

## Stato di avanzamento

Unica fonte dello stato del piano, che si esegue su due macchine in parallelo.
Prima di cominciare: `git switch feat/fondamenta && git pull`, poi leggi qui.

| Task | Stato | Linea | Dipende da | Branch | Preso da |
| --- | --- | --- | --- | --- | --- |
| 1 ADR-0005 | fuso | — | — | `main` | — |
| 2 Scaffold e gate | fuso | — | 1 | `feat/fondamenta` | PC 1 |
| 3 Rotte e lingua | fuso | — | 2 | `feat/fondamenta` | PC 1 |
| 4 Modello contenuti | fuso | A | 3 | `feat/fondamenta` | PC 1 |
| 5 Componente Foto | fuso | A | 4 | `feat/fondamenta` | PC 1 |
| 6 Layout base | fuso | B | 3 | `feat/fondamenta` | PC 2 |
| 8 Form e conferma | in corso | B | 6 | `feat/layout-form` | PC 2 |
| 7 Portfolio | in corso | — | 5 e 6 fusi | `feat/portfolio` | PC 1 |
| 9 Home ed e2e | bloccato | — | 7 e 8 fusi | da aprire | — |
| 10 Gate e Netlify | bloccato | — | 9 | da aprire | — |

Stati: `libero` nessuno ci lavora; `in corso` preso da una macchina;
`concluso` review passata e commit sul branch della linea; `fuso` dentro
`feat/fondamenta`; `bloccato` dipendenze non ancora fuse.

Macchine: **PC 1** è il Mac su cui sono stati eseguiti i Task 2 e 3, e tiene
la linea A. **PC 2** è la seconda macchina, e tiene la linea B. I Task 7, 9 e
10 li prende chi si libera per primo, dopo la fusione di entrambe le linee.

Binari fuori piano, per chi resta fermo: la direzione visiva, che richiede la
scelta di Francesco e di Leo (§ Cosa questo piano non copre), e la verifica di
ADR-0004, come prova usa e getta fuori dal repository.

### Protocollo

1. `git switch feat/fondamenta && git pull`.
2. Prendi il primo task `libero` della tua linea. Dentro la stessa linea si
   parte quando il task precedente è `concluso`; se la dipendenza è di
   un'altra linea, deve essere `fuso`.
3. Presa in carico, su `feat/fondamenta`: riga a `in corso`, "Preso da" con
   la tua macchina, commit `docs: prende in carico il Task N`, `git push`. Se
   il push viene rifiutato, l'altra macchina ha scritto prima:
   `git pull --rebase`, rileggi la riga e, se non è più libera, scegli un
   altro task.
4. Lavora sul branch della linea: crealo da `feat/fondamenta` se non esiste,
   altrimenti riprendilo. Le checkbox dei passi si spuntano lì.
5. Chiudi il task come da § Chiusura di ogni task. Con
   `superpowers:subagent-driven-development` la review per task la fanno
   `spec-guardian` e `code-reviewer`, non il reviewer generico della skill,
   che resta per la review finale della linea. Poi, su `feat/fondamenta`:
   riga a `concluso`, commit, push.
6. A linea finita, il branch della linea si fonde in `feat/fondamenta` con
   `git merge --no-ff`, senza PR. Se un task dell'altra linea aspetta un tuo
   task già `concluso`, chiedi subito la fusione. La fusione la approva un
   umano: prima di fondere si chiede. `./scripts/verify.sh` gira sul
   risultato della fusione prima del push. Dopo la fusione le righe passano
   a `fuso`, e quelle che ne dipendevano a `libero`.
7. Una decisione che cambia un task futuro si scrive dentro quel task, in un
   blocco `> **Modifica (AAAA-MM-GG).**`, più una riga nel registro qui
   sotto. Il ledger di superpowers in `.superpowers/` e la memoria di Claude
   restano sulla macchina che li ha scritti: ciò che non è in questo file,
   l'altra macchina non lo sa.

## Modifiche in corso d'opera

Registro delle deviazioni dal testo originale. Quelle che riguardano un task
ancora da fare sono scritte anche dentro il task, dove l'implementatore le
legge.

| Data | Task | Modifica | Perché |
| --- | --- | --- | --- |
| 2026-09-26 | 2 | `verify.sh` esegue anche `e2e`; con `--hook` solo `lint typecheck test` | L'e2e del percorso critico blocca il rilascio; il gate completo sfora i 180 s dello Stop hook |
| 2026-09-26 | 2 | `playwright.config.ts` con webServer su `astro preview` e `ASTRO_PREVIEW_BACKGROUND=1` | Senza baseURL nessun e2e gira; Astro manda `preview` in background se rileva un agente |
| 2026-09-26 | 2 | `lighthouserc.json` anticipato dal Task 10, senza upload | Lo script `perf` esiste dal Task 2; senza configurazione lhci pubblica i report |
| 2026-09-26 | 2 | Pagina `/it/` segnaposto, test del redirect di `/`, `a11y.spec.ts` su `/it/` | `e2e` e `a11y` girano davvero dal primo task invece di passare per omissione |
| 2026-09-26 | 2 | `typescript` 6.0.3 e `@astrojs/check` | Sono `tsc` e `astro check` di ADR-0005; 6.0.3 per il range di `@astrojs/check` |
| 2026-09-26 | 3 | `.prettierignore` con `*.md` | L'hook di Prettier riformattava i documenti interi, codice incollato compreso |
| 2026-09-26 | 3 | `PageKey` derivato da `PAGE_KEYS as const`, nessun cast | Convenzioni: nessun `as` fuori da `as const` e `querySelector` |
| 2026-09-26 | 3 | Test di `SelettoreLingua` con il container, `vitest.config.ts` con `getViteConfig` | Convenzioni: il markup di un componente è un contratto |
| 2026-09-26 | 3 | `src/astro-moduli.d.ts` | `tsc` non legge i `.astro`: senza, i test uscivano dal controllo dei tipi |
| 2026-09-26 | tutti | Review per task con `spec-guardian` e `code-reviewer` | CLAUDE.md e ADR-0001 punto 6; il reviewer generico di SDD resta per la review finale |
| 2026-09-26 | tutti | Un branch per linea, esecuzione su due macchine | Parallelismo, § Stato di avanzamento |
| 2026-09-26 | tutti | Fusione diretta del branch di linea in `feat/fondamenta`, senza PR | Decisione di Francesco alla chiusura della linea A; resta l'approvazione umana prima di fondere |
| 2026-09-26 | 4 | `astro/zod`, JSON importati staticamente, foto di prova Unsplash | Vedi il Task 4 |
| 2026-09-26 | 4 | Campi inglesi di Pagina e FAQ `.default("")` al posto di `min(1)` | US-8: un testo solo in italiano si salva e non si pubblica in inglese; con `min(1)` fermava la build. Filtrare spetta alle pagine (§ Cosa questo piano non copre) |
| 2026-09-26 | 5 | Foto di prova raggiungibile, controllo JPEG rafforzato | Vedi il Task 5 |
| 2026-09-26 | 5 | Dimensioni con `inferRemoteSize` di `astro:assets` e larghezze filtrate sul lato lungo, al posto di `inferSize`; test sul lato lungo e sull'originale assente dal markup | Con `inferSize` un remoto verticale riceveva un derivato 2400×3600 e un `src` alla risoluzione dell'originale: il test del piano guardava solo i descrittori `w` |
| 2026-09-26 | 9 | Il poster segue lo stesso limite di `Foto.astro`, con calcolo e larghezze in un modulo condiviso | Vedi il Task 9 |
| 2026-09-26 | 7, 8, 9 | `title` e `description` da `caricaPagine()` | Spec § SEO: "dal modello contenuti"; il piano li scriveva a mano. Review finale della linea A |
| 2026-09-26 | 7 | Test su build: `src` e `srcset` solo sotto `/_astro/` | Il container del Task 5 vede gli URL di sviluppo, che portano l'originale codificato. Review finale della linea A |
| 2026-09-26 | 6 | Solo struttura, nessuno stile | Decisione di Francesco: lo stile ha un piano proprio |
| 2026-09-26 | 7 | Test sulle richieste di immagini reali al primo render | Vedi il Task 7 |
| 2026-09-26 | 9 | Poster nella pipeline, `min-width: 768px`, foto di richiamo da estendere | Vedi il Task 9 |
| 2026-09-26 | 10 | `lighthouserc.json` esiste già; `a11y` doppio nel gate | Vedi il Task 10 |
| 2026-09-26 | 6 | `nav.label` in `ui.ts`; test hreflang sulla destinazione; axe sulle 404; `tests/unit/base.test.ts`; spazi espliciti fra i link del nav | Convenzioni, ADR-0005 e US-6: il perché di ciascuna è nel commit del Task 6 su `feat/layout-form` |
| 2026-09-26 | 8 | `compressHTML` toglie gli spazi fra i tag; bersagli sotto 24×24 px senza CSS | Vedi il Task 8 |
| 2026-09-26 | 10 | Regole 404 per lingua in `netlify.toml` | Vedi il Task 10 |
| 2026-09-26 | 6 | Link alla home come primo del nav; skip link a fuoco nel flusso con `.skip:not(:focus)` | Review finale della linea B, approvate da Francesco: nessuna pagina portava alla home (WCAG 2.4.5), lo skip link a fuoco copriva il nav |
| 2026-09-26 | tutti | Screenshot dello stato a fuoco in § Chiusura di ogni task | Lo skip link sovrapposto era invisibile negli screenshot a riposo. Approvato da Francesco |
| 2026-09-26 | 7, 8, 9 | Titolo SEO inglese vuoto: da decidere prima dello Step 3 | Vedi il Task 7 |
| 2026-09-26 | tutti | Global Constraints: si scartano le larghezze il cui lato lungo supera 2400 px | Spec § Pipeline immagini e US-2 non reggevano insieme su una foto verticale; `Foto.astro` fa già così. Decisione di Francesco |
| 2026-09-26 | tutti | Global Constraints: il ripiego WebP resta imposto, cambia il perché (PNG, non JPEG) | In Astro 7.3.3 `defaultFallbackFormat` è `png`; il formato dell'originale vale solo per un import ESM locale. Decisione di Francesco |
| 2026-09-26 | 7, 8, 9 | `seo_title_en` e `seo_description_en` obbligatori nello schema; `seoPer` in `load.ts`; una frase in spec § Pagina | Li scrive lo sviluppo, non Leo, e un `title` vuoto viola WCAG 2.4.2. Decisione di Francesco, vedi il Task 7 |

## Global Constraints

Valgono per ogni task. I valori sono copiati dallo spec, non riassunti.

- Astro **7.3.3**. Nessun downgrade, nessuna 6.x.
- LCP ≤ **2.0 s** su 4G lenta simulata, mobile. CLS < **0.1**.
- Peso trasferito fino all'LCP: home ≤ **1.2 MB**, portfolio ≤ **1.5 MB**.
- Clip hero ≤ **6 s**, ≤ **1.5 MB**, senza traccia audio.
- JavaScript trasferito ≤ **50 KB compressi per pagina**, pagine pubbliche.
- **WCAG 2.2 AA** su tutte le pagine. axe senza violazioni.
- Derivati immagine: **AVIF e WebP**, larghezze **400, 800, 1200, 1600, 2400**,
  scartate quelle a cui il lato lungo supererebbe **2400 px**: un 2:3 si ferma
  a 1600 × 2400.
- Il formato di ripiego va imposto a **WebP** esplicitamente: su un `src`
  remoto il default di `<Picture>` è PNG; il formato dell'originale vale solo
  per un import ESM locale. Nessun JPEG servito.
- `loading="lazy"` ovunque tranne **le prime tre** immagini del flusso e il
  poster dell'hero.
- Lato lungo massimo servito: **2400 px**. Nessun originale raggiungibile dal
  markup.
- Testo alternativo **obbligatorio in italiano e in inglese** per ogni foto.
- Un contenuto privo di versione inglese **non si pubblica** in inglese.
  Nessun ripiego automatico sull'italiano.
- **Nessuna dipendenza nuova senza un ADR accettato.** Vale anche per le
  dipendenze di sviluppo.
- Commit atomici, conventional commits, un branch per linea di lavoro (§
  Stato di avanzamento).
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
   1.4.10 e axe non lo rileva. Più lo stato a fuoco: uno screenshot dopo
   ogni Tab dal caricamento, finché il focus non esce dall'header, e dopo
   ogni Tab sui controlli nuovi del task, stati d'errore compresi. Nel Task 6
   lo skip link a fuoco copriva il nav, e a riposo non si vedeva. Chi
   sviluppa qui non ha occhi e un layout rotto non fallisce nessun test: è
   l'argomento centrale di
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

- [x] **Step 1: Creare il progetto Astro**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston
npm pkg set dependencies.astro=7.3.3
npm install
npx astro --version   # deve stampare 7.3.3
```

- [x] **Step 2: Configurare Astro**

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

- [x] **Step 3: Installare le dipendenze di verifica**

Autorizzate da ADR-0005. Non anticipare questo passo se l'ADR non è accettato.

```bash
npm install -D vitest @playwright/test @axe-core/playwright @lhci/cli prettier
npx playwright install --with-deps chromium
```

Prettier va installato anche se nessuno script lo invoca direttamente:
`scripts/format-changed.sh`, agganciato all'hook `PostToolUse`, lo cerca in
`node_modules/.bin/prettier` a ogni file scritto e finora non lo trovava.

- [x] **Step 4: Aggiungere gli script che `verify.sh` cerca**

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

- [x] **Step 5: Redirect della radice**

```astro
---
// src/pages/index.astro
return Astro.redirect('/it/');
---
```

- [x] **Step 6: Aggiungere robots.txt**

Lo spec lo elenca nella sitemap. `sitemap.xml` arriva in un piano successivo,
quindi qui non va referenziato: un `Sitemap:` che punta al nulla è peggio che
assente.

```
# public/robots.txt
User-agent: *
Allow: /
```

- [x] **Step 7: Verificare che la build passi**

Run: `npm run build`
Expected: build completata senza errori.

Run: `./scripts/verify.sh`
Expected: esce 0. Ora esegue davvero gli script, non li salta.

- [x] **Step 8: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [x] **Step 9: Commit**

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

- [x] **Step 1: Scrivere il test che fallisce**

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

- [x] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run test`
Expected: FAIL, `Cannot find module '../../src/i18n/routes'`.

- [x] **Step 3: Implementare la mappa**

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

- [x] **Step 4: Implementare le stringhe di interfaccia**

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

- [x] **Step 5: Creare i file di pagina vuoti richiesti dal test**

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

- [x] **Step 6: Implementare il selettore lingua**

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

- [x] **Step 7: Eseguire i test**

Run: `npm run test`
Expected: PASS, sei test verdi.

- [x] **Step 8: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [x] **Step 9: Commit**

```bash
git add src/i18n src/components/SelettoreLingua.astro src/pages tests/unit/routes.test.ts
git commit -m "feat: mappa rotte bilingue e selettore lingua"
```

---

### Task 4: Modello dei contenuti validato

> **Modifica (2026-09-26).** Tre correzioni, già riportate nei blocchi qui
> sotto.
> - `zod` si importa da `astro/zod`: è la stessa libreria (zod 4) inclusa in
>   Astro 7.3.3, mentre il pacchetto `zod` diretto sarebbe una dipendenza non
>   coperta da ADR.
> - `load.ts` importa i JSON staticamente. `readFileSync(new URL(…,
>   import.meta.url))` non regge nel bundle di build di Vite: il percorso non
>   punta più a `src/content/`, e la build si romperebbe al Task 7, il primo a
>   chiamare `caricaFoto()` da una pagina.
> - Le foto di prova sono gli originali Unsplash già usati dai prototipi
>   (Step 5).
>
> `vitest.config.ts` esiste già dal Task 3.

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

- [x] **Step 1: Scrivere il test che fallisce**

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

- [x] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run test`
Expected: FAIL, modulo `src/content/schema` inesistente.

- [x] **Step 3: Implementare gli schemi**

```ts
// src/content/schema.ts
import { z } from 'astro/zod';

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

- [x] **Step 4: Implementare il caricamento**

```ts
// src/content/load.ts
import type { Locale } from '../i18n/routes';
import {
  FotoSchema, FaqSchema, PaginaSchema, ImpostazioniSchema,
  type Foto, type Faq, type Pagina, type Impostazioni,
} from './schema';
// Import statici, non letture da disco: nel bundle di build di Vite un
// percorso relativo a import.meta.url non punta più ai file sorgente.
import datiFoto from './foto.json';
import datiFaq from './faq.json';
import datiPagine from './pagine.json';
import datiImpostazioni from './impostazioni.json';

export function caricaFoto(): Foto[] {
  const foto = FotoSchema.array().parse(datiFoto);
  const ordini = foto.map((f) => f.ordine);
  if (new Set(ordini).size !== ordini.length) {
    throw new Error('foto.json: due foto hanno lo stesso ordine');
  }
  return foto.sort((a, b) => a.ordine - b.ordine);
}

export function caricaFaq(): Faq[] {
  return FaqSchema.array().parse(datiFaq).sort((a, b) => a.ordine - b.ordine);
}

export function caricaPagine(): Pagina[] {
  return PaginaSchema.array().parse(datiPagine);
}

export function caricaImpostazioni(): Impostazioni {
  return ImpostazioniSchema.parse(datiImpostazioni);
}

export function altPer(foto: Foto, locale: Locale): string {
  return locale === 'it' ? foto.alt_it : foto.alt_en;
}
```

- [x] **Step 5: Creare dati di prova**

`foto.json` con almeno cinque voci che puntano a immagini di prova remote,
`ordine` da 0 a 4, le prime due con `in_home: true`. Non usare foto di Leo: le
liberatorie non sono confermate.

Le foto sono le prime cinque di `prototypes/comune/foto.js` sul branch
`prototypes` (`git show prototypes:prototypes/comune/foto.js`). `file` è
l'originale, `https://images.unsplash.com/photo-<id>` senza parametri: pesa
alcuni MB, come gli originali veri. `alt_it` è il campo `alt` di lì; `alt_en`
dice la stessa cosa in inglese, non parola per parola
([05-content.md](../../05-content.md) § Immagini).

`pagine.json`, `faq.json` e `impostazioni.json` con valori segnaposto che
passano lo schema. Email su `example.com`, nessun contatto reale.

- [x] **Step 6: Eseguire i test**

Run: `npm run test`
Expected: PASS, otto test verdi.

- [x] **Step 7: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [x] **Step 8: Commit**

```bash
git add src/content tests/unit/content.test.ts
git commit -m "feat: modello contenuti validato con zod"
```

---

### Task 5: Componente immagine conforme alla pipeline

> **Modifica (2026-09-26).** Due correzioni, già riportate nel test qui sotto.
> - La foto del test punta a un originale Unsplash raggiungibile invece che a
>   `storage.example`, che non esiste: `inferSize` scarica l'immagine per
>   leggerne le dimensioni, quindi il test richiede la rete.
> - "Non serve mai JPEG" cerca anche il parametro `f=jpg` degli URL di
>   `/_image` e il tipo `image/jpeg`: con un originale senza estensione la sola
>   regex sull'estensione non troverebbe nulla, e passerebbe comunque.
>
> `vitest.config.ts` con `getViteConfig` esiste già dal Task 3.

**Files:**
- Create: `src/components/Foto.astro`
- Test: `tests/unit/foto-component.test.ts`

**Interfaces:**
- Consumes: `Foto`, `altPer` (Task 4), `Locale` (Task 3).
- Produces: componente `<Foto foto={...} locale={...} priorita={boolean} sizes={string} />`
  che rende un `<picture>` conforme ai Global Constraints.

- [x] **Step 1: Scrivere il test che fallisce**

Il test rende il componente con il container di Astro e verifica il markup.

```ts
// tests/unit/foto-component.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Foto from '../../src/components/Foto.astro';

const foto = {
  file: 'https://images.unsplash.com/photo-1532454781337-fc3edff34f91', ordine: 0,
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
    expect(html).not.toMatch(/\.jpe?g["\s]|f=jpe?g|image\/jpeg/);
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

- [x] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run test`
Expected: FAIL, componente inesistente.

- [x] **Step 3: Implementare il componente**

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

- [x] **Step 4: Eseguire i test**

Run: `npm run test`
Expected: PASS, otto test verdi.

Se `inferSize` fallisce su URL remoti in build, sostituirlo con
`inferRemoteSize()` da `astro/assets/utils` chiamato nel frontmatter e passare
`width`/`height` espliciti. Il test su `width`/`height` copre entrambi i casi.

- [x] **Step 5: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [x] **Step 6: Commit**

```bash
git add src/components/Foto.astro tests/unit/foto-component.test.ts
git commit -m "feat: componente immagine conforme alla pipeline"
```

---

### Task 6: Layout base accessibile

> **Modifica (2026-09-26).** Solo struttura: layout, `lang`, `hreflang`, skip
> link, pagine 404 e test axe. Nessuno stile, tranne nascondere lo skip link
> finché non riceve il focus: la direzione visiva non è scelta, e lo stile di
> layout, portfolio, form e hero ha un piano proprio (§ Cosa questo piano non
> copre). I token non esistono ancora, quindi quel CSS resta quello del blocco
> dello Step 3.
>
> `tests/e2e/a11y.spec.ts` esiste già dal Task 2, con un solo test su `/it/`:
> lo Step 1 lo riscrive. Gli screenshot a 390, 768 e 1440 px e il controllo a
> 320 px restano obbligatori: anche il markup nudo deve riflussare.

**Files:**
- Create: `src/layouts/Base.astro`
- Modify: i dodici file in `src/pages/it/` e `src/pages/en/` per usarlo
- Modify: `tests/e2e/a11y.spec.ts` (esiste dal Task 2)

**Interfaces:**
- Consumes: `pathFor`, `otherLocale`, `keyForPath`, `t` (Task 3).
- Produces: `<Base locale={Locale} pageKey={PageKey} title={string}
  description={string}>` con `<html lang>`, `hreflang` reciproco più
  `x-default`, skip link, e `<slot />` dentro `<main id="contenuto">`.

- [x] **Step 1: Scrivere il test di accessibilità che fallisce**

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

- [x] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npm run a11y`
Expected: FAIL, nessun `hreflang`, nessuno skip link.

- [x] **Step 3: Implementare il layout**

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

- [x] **Step 4: Convertire le dodici pagine all'uso del layout**

Ogni pagina passa `locale`, `pageKey`, `title`, `description` e mette il proprio
contenuto nello slot. Nessuna pagina scrive più `<html>` da sé.

- [x] **Step 5: Creare le due pagine 404**

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

- [x] **Step 6: Eseguire i test**

Run: `npm run build && npm run a11y`
Expected: PASS su tutte e ventisei le asserzioni.

- [x] **Step 7: Chiudere il task**

Vedi [§ Chiusura di ogni task](#chiusura-di-ogni-task): gate, screenshot se il
task produce una pagina che si vede, e i tre agenti di review sul diff. Le
segnalazioni si risolvono prima del commit, non dopo.

- [x] **Step 8: Commit**

```bash
git add src/layouts src/pages tests/e2e/a11y.spec.ts
git commit -m "feat: layout base con hreflang, skip link e pagine 404"
```

---

### Task 7: Portfolio, flusso unico

> **Modifica (2026-09-26).** US-2 chiede che al primo render vengano
> *richieste* al massimo 3 immagini: contare gli attributi `loading="eager"`
> non lo prova. Allo Step 1 si aggiunge un test che, a 390 e a 1440 px di
> larghezza, conta le richieste delle foto del flusso partite prima di
> qualunque scorrimento (`page.on('request')` con `resourceType() ===
> 'image'`, escluse favicon e simili, fino a `networkidle`) e verifica che
> siano al massimo 3.
>
> Il motivo è una scoperta dei prototipi: il lazy loading nativo di Chrome
> anticipa di circa 1250 px, e a 390 px, con immagini basse, ne ha richieste
> 6. Se il test fallisce non lo si allenta in silenzio: è una decisione da
> portare a un umano, con le due strade possibili, un caricamento pigro
> governato da `IntersectionObserver` oppure un emendamento a US-2.

> **Modifica (2026-09-26, dalla review finale della linea A).** Due
> correzioni.
>
> - `title` e `description` vengono da `caricaPagine()`, per slug e lingua
>   (`seo_title_*`, `seo_description_*`), non scritti nella pagina: lo spec §
>   SEO li vuole "dal modello contenuti". Gli slug di `pagine.json`
>   coincidono con le chiavi di `PAGE_KEYS`. Il blocco dello Step 3 li scrive
>   a mano.
> - Allo Step 1 si aggiunge un test sulla pagina costruita: ogni `src` e ogni
>   candidato di `srcset` delle foto comincia con `/_astro/`. Copre "nessun
>   originale raggiungibile dal markup" e "nessun JPEG" sull'output reale. Il
>   test del container del Task 5 non basta: in sviluppo gli URL sono
>   `/_image?href=…` e portano l'originale codificato.
>
> **Da decidere con un umano prima dello Step 3** (dalla review finale della
> linea B, vale anche per i Task 8 e 9). Dal Task 4 `seo_title_en` e
> `seo_description_en` possono essere vuoti. Letti da `caricaPagine()`, una
> pagina non tradotta avrebbe `<title></title>` in inglese, contro WCAG 2.4.2,
> e `Base.astro` lo accetta senza errore. Il ripiego sull'italiano è escluso,
> e US-6 vuole comunque la controparte di ogni pagina: cosa fa la pagina
> inglese in quel caso non lo dice né lo spec né il piano.

> **Modifica (2026-09-26, decisione di Francesco).** Chiude il punto qui
> sopra. `seo_title_en` e `seo_description_en` diventano obbligatori nello
> schema, `min(1)` come i campi italiani e come `alt_en`: li scrive lo
> sviluppo, non Leo (05-content), e una pagina senza `title` viola WCAG 2.4.2.
> Se mancano la build fallisce e Netlify tiene online l'ultima deploy
> riuscita; il pannello li marcherà obbligatori. US-8 resta valido per i testi
> di Leo: `titolo_en` e `corpo_en` possono restare vuoti. Spec § Pagina lo
> dice da questa data. Scartati: un ripiego su una stringa inglese fissa, che
> lascerebbe silenziosa la traduzione mancante, e il non pubblicare la pagina
> inglese, contro US-6.
>
> Lo schema lo cambia solo questo task. In `content.test.ts` il test US-8
> della Pagina passa con i campi SEO inglesi e con `titolo_en` e `corpo_en`
> vuoti, e un test nuovo rifiuta i campi SEO inglesi vuoti. Le pagine leggono
> `title` e `description` da `seoPer`, in `load.ts` subito dopo
> `caricaPagine()`, con un test per lingua e uno per lo slug assente:
>
> ```ts
> export function seoPer(slug: string, locale: Locale) {
>   const pagina = caricaPagine().find((p) => p.slug === slug);
>   if (!pagina) throw new Error(`pagine.json: manca la pagina "${slug}"`);
>   return locale === "it"
>     ? { title: pagina.seo_title_it, description: pagina.seo_description_it }
>     : { title: pagina.seo_title_en, description: pagina.seo_description_en };
> }
> ```
>
> `slug` è una stringa e non un `PageKey`: `load.ts` non conosce le rotte, a
> parte `Locale` (convenzioni). I Task 8 e 9 la usano così com'è.

**Files:**
- Modify: `src/pages/it/portfolio.astro`, `src/pages/en/portfolio.astro`,
  `src/content/schema.ts`, `src/content/load.ts`
- Test: `tests/e2e/portfolio.spec.ts`, `tests/unit/content.test.ts`

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

> **Modifica (2026-09-26).** Due scoperte del Task 6, che valgono per il
> form.
>
> - `compressHTML` di Astro toglie gli spazi fra i tag del sorgente: due
>   elementi in riga scritti su righe diverse escono attaccati. Nel nav di
>   `Base.astro` li separa un `{" "}` esplicito.
> - Senza CSS nessun bersaglio arriva ai 24×24 px che lo spec chiede per
>   2.5.8, e axe non se ne accorge sempre: passa sui link in riga per
>   l'eccezione inline, e segnala `target-size` sui bersagli a blocco
>   impilati, come il nav in `<ul>` provato e scartato nel Task 6. Il CSS
>   resta escluso fino al piano di stile. Se axe segnala `target-size` sui
>   controlli del form, non si allenta il test e non si aggiunge CSS: è una
>   decisione da portare a un umano.

> **Modifica (2026-09-26, dalla review finale della linea A).** Vale per
> contatti e conferma.
>
> - `title` e `description` vengono da `caricaPagine()`, per slug e lingua
>   (`seo_title_*`, `seo_description_*`), non scritti nella pagina: lo spec §
>   SEO li vuole "dal modello contenuti". Gli slug di `pagine.json`
>   coincidono con le chiavi di `PAGE_KEYS`.

> **Modifica (2026-09-26, decisione di Francesco).** Titolo SEO inglese vuoto:
> deciso nel Task 7, ultimo blocco Modifica. `seo_title_en` e
> `seo_description_en` sono obbligatori nello schema, quindi il `title`
> inglese non è mai vuoto e la pagina non gestisce il caso. `title` e
> `description` si leggono con `seoPer("contact", locale)` e
> `seoPer("thanks", locale)` di `load.ts`. Se il Task 7 non è ancora fuso,
> `seoPer` si copia dal Task 7 identica, nello stesso punto di `load.ts`: due
> aggiunte uguali si fondono senza conflitto. Schema e test dello schema li
> cambia solo il Task 7.

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

> **Modifica (2026-09-26).** Quattro correzioni.
> - Il poster passa dalla pipeline immagini. Il blocco originale usava
>   `<img src={poster}>`, cioè l'originale servito direttamente, contro la
>   regola "mai un file originale servito" e contro lo spec, che vuole il
>   poster in AVIF. Il blocco dello Step 3 è corretto di conseguenza. Le
>   larghezze coincidono con quelle di `Foto.astro`: usate in due posti, una
>   costante condivisa ha il secondo caso d'uso che le convenzioni chiedono.
> - La clip si scarica solo se `(min-width: 768px)` è vera, al posto di
>   `(max-width: 800px)`: le convenzioni ammettono solo `min-width`, e 768 px
>   è la larghezza tablet dello spec e la soglia già usata nei prototipi.
> - Il test della home chiede da 10 a 15 foto con `in_home`, ma `foto.json`
>   del Task 4 ne ha 2. Lo estende questo task, allo Step 4, con altre foto di
>   `prototypes/comune/foto.js` e il loro `alt` in italiano e in inglese: il
>   Task 4 resta com'è.
> - Per il piano di stile, non per questo task: se il poster 16:9 viene
>   ritagliato a 4:5 al telefono, `sizes` deve dichiarare la larghezza del
>   ritaglio (nei prototipi `222vw`), altrimenti il browser sceglie un derivato
>   troppo piccolo.

> **Modifica (2026-09-26, dal Task 5).** Il blocco dello Step 3 usa
> `inferSize` con `widths` fino a 2400. Per un originale remoto, Picture mette
> nell'`src` dell'`<img>` un derivato alla larghezza dell'originale (il poster
> di prova è 5472×3648) e non limita i `widths`: il lato lungo supera i
> 2400 px. `Foto.astro` lo evita dal Task 5: legge le dimensioni con
> `inferRemoteSize` di `astro:assets`, non di `astro/assets/utils`, che senza
> configurazione non controlla `remotePatterns`; tiene solo le larghezze con
> lato lungo ≤ 2400 e passa `width`/`height` espliciti al posto di
> `inferSize`. Hero fa lo stesso: il calcolo e `LARGHEZZE` escono da
> `Foto.astro` in un modulo condiviso, che Hero è il secondo a usare.
> Con il calcolo si sposta anche il test a valori fissi di
> `foto-component.test.ts` (il ritratto 4480×6720 dichiara 1600×2400): un
> rapporto invertito ritaglia ogni ritratto in orizzontale, ed è l'errore più
> probabile durante l'estrazione. Per la home, `title` e `description` vengono
> da `caricaPagine()` come nel Task 7.

> **Modifica (2026-09-26, decisione di Francesco).** Titolo SEO inglese vuoto:
> deciso nel Task 7, ultimo blocco Modifica. I campi SEO inglesi sono
> obbligatori nello schema, e la home legge `title` e `description` con
> `seoPer("home", locale)` di `load.ts`, che a questo punto esiste già.

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
import { Picture } from 'astro:assets';

interface Props { poster: string; clip?: string; motto: string }
const { poster, clip, motto } = Astro.props;
---
<section class="hero">
  <Picture
    src={poster}
    inferSize
    formats={['avif', 'webp']}
    fallbackFormat="webp"
    widths={[400, 800, 1200, 1600, 2400]}
    sizes="100vw"
    alt=""
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
  {clip && <video class="clip" muted loop playsinline preload="none" data-src={clip}></video>}
  <h1>{motto}</h1>
</section>

<script>
  const video = document.querySelector<HTMLVideoElement>('.hero .clip');
  const riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const largo = window.matchMedia('(min-width: 768px)').matches;
  if (video && !riduci && largo) {
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

> **Modifica (2026-09-26).** `lighthouserc.json` esiste già dal Task 2, con le
> asserzioni dello Step 1 e le URL di `/it/` e `/it/portfolio/`: lo Step 1 si
> riduce a verificarlo. Da decidere qui: `tests/e2e/a11y.spec.ts` gira due
> volte nel gate, perché `npm run e2e` lo include già e `verify.sh` poi esegue
> anche `a11y`.
>
> Lo Step 4 non lo chiude un agente da solo: serve una persona con accesso
> all'account Netlify di Leo, per la deploy preview e per leggere l'email
> ricevuta. L'agente prepara tutto il resto e poi si ferma a chiederlo.
>
> Dal Task 6: le 404 per lingua sono `src/pages/it/404.astro` e
> `src/pages/en/404.astro`, che Astro scrive in `dist/it/404/index.html` e
> `dist/en/404/index.html`. La gestione speciale di Astro vale solo per
> `/404` alla radice, e Netlify da sola serve solo `/404.html`: senza regole,
> un URL sconosciuto mostra la 404 di Netlify. Allo Step 3, dopo la regola di
> `/`:
>
> ```toml
> [[redirects]]
>   from = "/en/*"
>   to = "/en/404/"
>   status = 404
>
> [[redirects]]
>   from = "/*"
>   to = "/it/404/"
>   status = 404
> ```
>
> Senza `force`, Netlify non applica una regola a un percorso che esiste come
> file, quindi queste colpiscono solo gli URL sconosciuti; fuori da `/en/` il
> ripiego è l'italiano, come `x-default`. Per lo stesso motivo la regola di `/`
> verso `/it/` non scatta, perché `dist/index.html` esiste: oggi reindirizza
> quella pagina. Allo Step 4, sulla deploy preview, verificare che
> `/en/inesistente/` risponda 404 con la pagina inglese.

**Files:**
- Modify: `lighthouserc.json` (esiste dal Task 2)
- Create: `netlify.toml`
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
  di Leo. Piano successivo, nessun blocco tecnico. Dal Task 4 i campi inglesi
  di Pagina e FAQ possono essere stringhe vuote: la pagina inglese omette la
  voce, senza ripiego sull'italiano (US-8), e il pannello lo segnala. I loro
  `title` e `description` sono ancora i segnaposto letterali del Task 6:
  quel piano li porta su `caricaPagine()`, come i Task 7-9 per le loro
  pagine.
- **Direzione visiva, design system e stile.** Non blocca questo piano, che
  produce markup corretto e accessibile, non un sito finito da vedere: il
  Task 6 costruisce solo la struttura. Le direzioni si esplorano con
  prototipi in codice sul branch `prototypes`, al posto di Claude Design
  previsto da ADR-0001 punto 2, che va emendato. Leo ne sceglie una, e da lì
  escono i token CSS, `docs/04-design-system.md` compilato e i riferimenti in
  `design/ref/`. Il brand mancante non è un prerequisito: è l'output. I tre
  riferimenti negativi che [01-discovery.md](../../01-discovery.md) aspetta
  si ottengono dalle direzioni che Leo scarta, quindi attenderli per poter
  iniziare è un'attesa circolare. Lo stile di layout, portfolio, form e hero
  è un piano proprio: parte a direzione scelta e usa la skill
  frontend-design, `/verifica-visiva` e `design-reviewer`. Deve portare ogni
  bersaglio interattivo a 24×24 px (2.5.8) e verificarlo con un test proprio:
  senza CSS i link del nav sono alti 17 px, e axe non lo segnala (Task 6).
- **Pannello di redazione.** Bloccato dalla verifica in
  [ADR-0004](../../03-adr/0004-pannello-e-storage-immagini.md): autenticazione
  da accertare prima di scegliere il prodotto.
- **Dati strutturati, sitemap.xml, redirect dal vecchio sito.** Lo spec li
  richiede; i redirect dipendono dall'elenco degli URL vivi, che è una domanda
  aperta con Leo.
- **Contenuti reali e foto vere.** Bloccati dalle liberatorie.
