# ADR-0005 — Stack di verifica

Stato: proposto
Data: 2026-09-21

## Contesto

[ADR-0003](0003-generatore-statico-e-hosting.md) ha scelto Astro e Netlify e ha
lasciato esplicitamente fuori gli strumenti di verifica. Servono adesso, perché
il primo task implementativo non può iniziare senza: `scripts/verify.sh` cicla
su `lint typecheck build test perf a11y` e oggi quegli script non esistono.

I vincoli che la scelta deve soddisfare vengono da [02-spec.md](../02-spec.md) e
non sono negoziabili:

- Il percorso critico arrivo → portfolio → richiesta → conferma è coperto da
  test end-to-end **obbligatori**. Un fallimento lì blocca il rilascio.
- WCAG 2.2 AA su tutte le pagine, verificato con axe e a mano da tastiera.
- LCP ≤ 2.0 s, CLS < 0.1, peso fino all'LCP ≤ 1.2 MB in home e ≤ 1.5 MB nel
  portfolio, JavaScript ≤ 50 KB compressi per pagina.
- Il sito è bilingue: ogni verifica va eseguita su entrambe le lingue.

Vincolo di contesto, altrettanto reale: il sito si tocca tre volte l'anno. Ogni
strumento è un costo di manutenzione che si paga per anni contro un beneficio
che si incassa tre volte.

## Decisione

| Ruolo | Strumento |
| --- | --- |
| Test unitari e di componente | Vitest |
| Test end-to-end | Playwright |
| Accessibilità automatica | axe, via `@axe-core/playwright` |
| Budget di performance | Lighthouse CI |
| Tipi nei file `.astro` | `astro check` |
| Tipi nei file `.ts` | `tsc --noEmit` |

Le ragioni che contano, al di là della popolarità dei singoli strumenti:

**Vitest gira sulla stessa Vite che gira già sotto Astro.** Non c'è una seconda
catena di trasformazione da configurare e da tenere allineata: risolutori,
alias e plugin sono quelli del progetto. Astro fornisce inoltre
`experimental_AstroContainer`, che rende un componente `.astro` a stringa dentro
un test, ed è il modo in cui verifichiamo che il componente immagine rispetti
davvero i vincoli della pipeline invece di fidarci a vista.

**axe riusa il browser di Playwright.** Niente secondo stack di browser da
installare e aggiornare: la verifica di accessibilità è un'asserzione dentro un
test end-to-end, non un processo separato.

**Servono sia `astro check` sia `tsc --noEmit`**, e non è una ridondanza:
`tsc` non capisce la sintassi dei file `.astro`, e `astro check` non copre i
moduli TypeScript puri come la mappa delle rotte e gli schemi dei contenuti.
Ciascuno vede metà del progetto.

**Lighthouse CI perché i budget dello spec sono vincoli, non obiettivi.** Un
vincolo che nessuno misura automaticamente è un auspicio. Le soglie diventano
asserzioni che fanno fallire la build.

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |
| Jest al posto di Vitest | Diffuso e conosciuto. Scartato perché richiede una propria catena di trasformazione accanto a quella di Vite, che è già nel progetto: due configurazioni da tenere allineate per ottenere la stessa cosa. |
| Cypress al posto di Playwright | Ottima esperienza di debug interattivo. Scartato perché l'esecuzione su più browser è più onerosa e perché qui serve soprattutto una cosa sola, un test che gira in CI e blocca il rilascio: il debug interattivo non è il vincolo. |
| Nessun test end-to-end | Meno strumenti, meno manutenzione, e su sei pagine statiche è una tentazione concreta. Scartato perché lo spec rende i test end-to-end obbligatori sul percorso critico: è l'unica parte del sito che produce fatturato, ed è anche l'unica che può rompersi in silenzio. |
| Verifica di performance manuale, con Lighthouse nel browser o WebPageTest | Zero dipendenze e misure più realistiche di una simulazione. Scartato perché è una misura occasionale, non un gate: si smette di farla esattamente quando servirebbe, cioè quando si ha fretta. |
| `astro check` da solo, senza `tsc` | Uno strumento in meno. Scartato perché lascerebbe senza controllo i moduli TypeScript puri, che sono dove vivono le regole del progetto: rotte, schemi, caricamento dei contenuti. |
| Testing Library al posto del container di Astro | Familiare a chi viene da React. Scartato perché aggiungerebbe un adattatore per rendere componenti che Astro sa già rendere da sé: una dipendenza per un problema che non abbiamo. |

## Conseguenze

Positive: `./scripts/verify.sh` smette di essere un no-op e diventa il gate
unico promesso da ADR-0001. I vincoli dello spec diventano asserzioni: nessuno
può dichiarare "fatto" su un percorso critico rotto o su una pagina che viola
le WCAG, perché la build non glielo permette.

Negative: cinque dipendenze di sviluppo in più da aggiornare su un progetto che
si tocca tre volte l'anno, e che quindi le troverà sempre vecchie. Playwright
scarica i binari dei browser, quindi la prima esecuzione in ambiente pulito è
lenta e pesante. Lighthouse CI su rete simulata è rumoroso: le soglie vanno
tarate sui contenuti reali, altrimenti la build fallisce a caso e la squadra
impara a ignorarla, che è il modo peggiore in cui un gate può morire. Infine,
finché i contenuti sono di prova le misure di performance non significano
niente: il gate va acceso sul serio solo quando le foto vere sono online.
