# Runbook

> Da completare in F7. Deve essere leggibile dal fotografo, non da uno
> sviluppatore.

## Come si pubblica una nuova galleria

## Cosa fare se il sito non è raggiungibile

## Contatti e credenziali

Dove sono custodite, non quali sono.

## Manutenzione

Cosa è coperto, con che frequenza, cosa no.

Le due sottosezioni seguenti sono rivolte a chi mantiene il sito, non a Leo.

### Asserzioni di Lighthouse spente

In `lighthouserc.json`, nei due gruppi di `assert.assertMatrix` che
corrispondono a home (`/(it|en)/index\.html$`) e portfolio
(`/(it|en)/portfolio/index\.html$`), `largest-contentful-paint` e
`total-byte-weight` sono a `"off"`. Con le foto di prova misurerebbero le
immagini finte, non il sito: ADR-0005 impone di assertare ciò che dipende dal
codice e rimandare ciò che dipende dalle fotografie.

**Innesco:** l'arrivo delle foto vere, cioè quando le liberatorie sono
confermate e `src/content/foto.json` e il poster dell'hero in
`src/content/impostazioni.json` puntano agli originali veri.

Da fare, tutto insieme, all'innesco:

- Sostituire `"off"` con questi valori (spec § Budget):
  - `largest-contentful-paint`, home e portfolio:
    `["error", { "maxNumericValue": 2000 }]` (2.0 s).
  - `total-byte-weight`, home: `["error", { "maxNumericValue": 1258291 }]`
    (1.2 MB in byte).
  - `total-byte-weight`, portfolio:
    `["error", { "maxNumericValue": 1572864 }]` (1.5 MB in byte).
- In `ci.collect.settings`, togliere `"preset": "desktop"` e lasciare
  `"throttlingMethod": "simulate"`. Senza preset Lighthouse usa la sua
  configurazione predefinita, mobile con 4G lenta simulata: è la condizione
  dello spec. Col preset desktop i numeri non dicono nulla sul budget.

Avvertenza: `total-byte-weight` conta tutti i byte del caricamento, non solo
quelli fino all'LCP come dice lo spec. È più severo. Se sfora per le immagini
pigre che partono dopo l'LCP, va ripensata la metrica, non alzato il valore.

Dopo l'accensione, eseguire `./scripts/verify.sh`: se il gate diventa rosso,
il budget è violato e si interviene sul sito, non sulla soglia.

### Messa online sull'account Netlify di Leo

Checklist, in quest'ordine, da eseguire sull'account di Leo. Il sito di prova
usato per la verifica funzionale è su un account di Francesco e non conta.

- [ ] Il piano dell'account e quanti invii di form al mese include. Netlify è
      passata ai crediti, con invii illimitati; i vecchi piani Free e
      Starter hanno un tetto di 100 invii al mese, non superabile
      (ADR-0003).
- [ ] Il rilevamento dei form acceso: sui siti nuovi può essere spento, e
      senza la POST del form non arriva a nessuno. Netlify rileva i form
      quando pubblica: dopo averlo acceso serve una nuova pubblicazione.
- [ ] Le notifiche email del form `contatto` verso l'indirizzo di
      destinazione vero delle richieste. Si configura su Netlify, non nel
      codice (piano, § Vincoli aperti).
- [ ] Un invio di prova per lingua: da `/it/contatti/` arriva a
      `/it/grazie/`, da `/en/contact/` a `/en/thank-you/`. Ciascuno arriva
      all'indirizzo vero e non finisce nello spam.
