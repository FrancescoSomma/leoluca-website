# ADR-0005 — Stack di verifica

Stato: accettato
Data: 2026-09-21

## Contesto

[ADR-0003](0003-generatore-statico-e-hosting.md) ha scelto Astro e Netlify e ha
lasciato esplicitamente fuori gli strumenti di verifica. Servono adesso, perché
il primo task implementativo non può iniziare senza: `scripts/verify.sh` cicla
su `lint typecheck build test perf a11y` e oggi quegli script non esistono.

I vincoli vengono da [02-spec.md](../02-spec.md) e non sono negoziabili:

- Il percorso critico arrivo → portfolio → richiesta → conferma è coperto da
  test end-to-end **obbligatori**. Un fallimento lì blocca il rilascio.
- WCAG 2.2 AA su tutte le pagine, verificato con axe e a mano da tastiera.
- LCP ≤ 2.0 s, CLS < 0.1, peso fino all'LCP ≤ 1.2 MB in home e ≤ 1.5 MB nel
  portfolio, JavaScript ≤ 50 KB compressi per pagina.
- Il sito è bilingue: ogni verifica va eseguita su entrambe le lingue.

Due vincoli di contesto, altrettanto reali.

Il sito **si tocca tre volte l'anno**. Ogni strumento è un costo di manutenzione
che si paga per anni contro un beneficio che si incassa tre volte.

**Lo sviluppo è interamente agentico.** Chi scrive il codice non apre il sito e
non lo guarda: non ha occhi. Un essere umano che rompe un layout se ne accorge
al primo sguardo; un agente no, e continua a costruire sopra. Questo sposta il
peso della decisione: i test non sono una rete di sicurezza contro le
regressioni future, sono **l'unico organo di senso di chi sviluppa**, e la
capacità di produrre e ispezionare screenshot non è un accessorio.

## Decisione

| Ruolo | Strumento |
| --- | --- |
| Test unitari e di componente | Vitest |
| Test end-to-end **e osservazione** | Playwright |
| Accessibilità automatica | axe, via `@axe-core/playwright` |
| Budget di performance | Lighthouse CI |
| Tipi nei file `.astro` | `astro check` |
| Tipi nei file `.ts` | `tsc --noEmit` |
| Formattazione | Prettier |

Le ragioni che contano, al di là della popolarità dei singoli strumenti.

**Vitest gira sulla stessa Vite che gira già sotto Astro.** Non c'è una seconda
catena di trasformazione da configurare e da tenere allineata: risolutori,
alias e plugin sono quelli del progetto. Astro fornisce inoltre
`experimental_AstroContainer`, che rende un componente `.astro` a stringa dentro
un test, ed è il modo in cui verifichiamo che il componente immagine rispetti
davvero i vincoli della pipeline invece di fidarci a vista.

**Playwright è anche lo strumento con cui si guarda il sito, non solo quello
con cui lo si testa.** Gli screenshot ai tre punti di rottura del progetto sono
il modo in cui uno sviluppatore agentico osserva il proprio lavoro, ed è la
stessa capacità su cui poggiano la skill `/verifica-visiva` e l'agente
`design-reviewer` già presenti nel repository. Se domani si scegliesse un altro
strumento di test end-to-end, andrebbe scelto anche per questa ragione, non
solo per la qualità delle asserzioni.

**axe riusa il browser di Playwright.** Niente secondo stack di browser da
installare e aggiornare: la verifica di accessibilità è un'asserzione dentro un
test end-to-end, non un processo separato.

**Servono sia `astro check` sia `tsc --noEmit`**, e non è una ridondanza:
`tsc` non capisce la sintassi dei file `.astro`, e `astro check` non copre i
moduli TypeScript puri come la mappa delle rotte e gli schemi dei contenuti.
Ciascuno vede metà del progetto. Per uno sviluppatore agentico i tipi hanno
inoltre un valore sproporzionato: sono il segnale più economico disponibile,
arriva prima di una build e prima di un test, e risparmia iterazioni intere.

**Prettier perché il progetto lo invoca già.** `scripts/format-changed.sh`,
agganciato all'hook `PostToolUse`, cerca `node_modules/.bin/prettier` a ogni
file scritto. Non essendo mai stato deciso, non è mai stato installato, e
quell'hook non ha quindi mai fatto nulla dal primo commit. O la dipendenza entra
qui, o l'hook va rimosso: lasciare in piedi un automatismo che finge di
funzionare è peggio di non averlo.

## Cosa si assera subito e cosa si aspetta

I budget di performance non sono tutti misurabili nello stesso momento. Il
criterio è: **si assera ciò che dipende dal codice, si rimanda ciò che dipende
dalle fotografie**, perché finché i contenuti sono di prova una misura sulle
foto non descrive nulla.

| Asserzione | Quando | Perché |
| --- | --- | --- |
| CLS < 0.1 | subito | Dipende dal markup e dalle dimensioni dichiarate, non dal peso dei file |
| Punteggio accessibilità pieno | subito | Dipende dal markup |
| JavaScript ≤ 50 KB compressi | subito | Dipende dal codice che scriviamo |
| LCP ≤ 2.0 s | con le foto vere | È dominato dal peso della fotografia dell'hero |
| Peso trasferito fino all'LCP | con le foto vere | Misura i contenuti, non il codice |

Un verde ottenuto su immagini di prova è peggio di un rosso: comunica una
sicurezza che non esiste, e nessuno ricontrolla ciò che risulta già verde.

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |
| Jest al posto di Vitest | Diffuso e conosciuto. Scartato perché richiede una propria catena di trasformazione accanto a quella di Vite, che è già nel progetto: due configurazioni da tenere allineate per ottenere la stessa cosa. |
| Cypress al posto di Playwright | Ottima esperienza di debug interattivo. Scartato perché il debug interattivo serve a un umano che guarda, e qui non c'è: servono esecuzione affidabile in CI e screenshot programmabili, dove Playwright è più diretto e copre più browser senza costi aggiuntivi. |
| Nessun test end-to-end | Meno strumenti, meno manutenzione, e su sei pagine statiche è una tentazione concreta. Scartato due volte: lo spec li rende obbligatori sul percorso critico, e senza di essi uno sviluppatore che non vede il sito non ha alcun modo di sapere se funziona. |
| Verifica di performance manuale, con Lighthouse nel browser o WebPageTest | Zero dipendenze e misure più realistiche di una simulazione. Scartato perché è una misura occasionale, non un gate: si smette di farla esattamente quando servirebbe, cioè quando si ha fretta. |
| Assertare subito tutti i budget, foto di prova comprese | Coerente con lo spec alla lettera. Scartato perché produrrebbe fallimenti casuali su misure prive di significato, e un gate che fallisce a caso viene aggirato invece che ascoltato. |
| `astro check` da solo, senza `tsc` | Uno strumento in meno. Scartato perché lascerebbe senza controllo i moduli TypeScript puri, che sono dove vivono le regole del progetto: rotte, schemi, caricamento dei contenuti. |
| Testing Library al posto del container di Astro | Familiare a chi viene da React. Scartato perché aggiungerebbe un adattatore per rendere componenti che Astro sa già rendere da sé: una dipendenza per un problema che non abbiamo. |
| Nessun formattatore | Una dipendenza in meno, e la formattazione non cambia il comportamento. Scartato perché l'hook che lo invoca esiste già nel repository: o si installa, o si toglie l'hook. |

## Conseguenze

Positive: `./scripts/verify.sh` smette di essere un no-op e diventa il gate
unico promesso da ADR-0001. I vincoli dello spec diventano asserzioni: nessuno
può dichiarare "fatto" su un percorso critico rotto o su una pagina che viola
le WCAG, perché la build non glielo permette. Chi sviluppa acquista la capacità
di vedere il proprio lavoro, che senza Playwright non avrebbe.

Negative: sei dipendenze di sviluppo da aggiornare su un progetto che si tocca
tre volte l'anno, e che quindi le troverà sempre vecchie. Playwright scarica i
binari dei browser, quindi la prima esecuzione in ambiente pulito è lenta e
pesante, e da quel momento ogni esecuzione della suite completa costa minuti,
non secondi. Le asserzioni rimandate vanno accese davvero quando arrivano le
foto: se nessuno lo fa, restano spente per sempre e il progetto crede di avere
un gate che in realtà non misura ciò che conta. Va messo nel runbook.
