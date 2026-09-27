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
  `"throttlingMethod": "simulate"`. Senza preset la rete torna quella dello
  spec, 4G lenta simulata e mobile; lo schermo no, perché il predefinito di
  Lighthouse è 412 px a DPR 1.75 e lo spec (§ Dispositivi) misura i budget a
  390 px. Aggiungere quindi:
  `"screenEmulation": { "mobile": true, "width": 390, "height": 844,
  "deviceScaleFactor": 3, "disabled": false }`. DPR 3 è quello di un
  iPhone, decisione di Francesco del 2026-09-27: i budget si misurano sul
  telefono che le coppie usano davvero. Con 1.75 il browser sceglie un
  derivato di circa metà peso, e il budget passerebbe più facilmente che
  per chi guarda il sito.
- Nei due gruppi di `assertMatrix` (home e portfolio), aggiungere
  `"aggregationMethod": "median-run"` accanto ad `"assertions"`. Senza,
  lhci usa `optimistic` e per un `maxNumericValue` prende il migliore dei 3
  run; il run mediano è ciò che un visitatore ottiene di solito, mentre
  `pessimistic` fallirebbe sul rumore.

Avvertenza: `total-byte-weight` conta tutti i byte del caricamento, non solo
quelli fino all'LCP come dice lo spec. È più severo. Se sfora per le immagini
pigre che partono dopo l'LCP, va ripensata la metrica, non alzato il valore.
Se cambiare la misura o lo spec lo decide Francesco: chi accende i controlli
si ferma e gli porta il caso.

Dopo l'accensione, eseguire `./scripts/verify.sh`: se il gate diventa rosso,
il budget è violato e si interviene sul sito, non sulla soglia.

### Messa online sull'account Netlify di Leo

Copre il form e il piano dell'account; collegamento del repository al sito
di Leo, dominio su Register.it e certificato restano da scrivere (F7).

Checklist, in quest'ordine, da eseguire sull'account di Leo. Il sito di prova
usato per la verifica funzionale è su un account di Francesco e non conta.

- [ ] Il piano dell'account: sui piani a crediti gli invii dei form sono
      illimitati; sui vecchi piani Free e Starter il tetto è di 100 invii al
      mese per sito, non superabile (ADR-0003).
- [ ] Sul piano Free a crediti, i crediti consumati nel mese: il tetto è di
      300 al mese, rigido, non se ne comprano altri. Li consumano la banda
      (20 crediti per GB) e ogni deploy di produzione (15); deploy preview e
      branch deploy non costano crediti. A crediti esauriti tutti i progetti
      del team si sospendono fino al ciclo successivo: i visitatori vedono
      "Site not available" e il form non riceve invii. È il rischio più
      probabile per un sito di fotografie: 300 crediti sono al massimo circa
      15 GB al mese, e se il pannello (ADR-0004) pubblica a ogni salvataggio,
      ogni salvataggio è un deploy di produzione. Controllare anche che gli
      avvisi di Netlify al 50, 75 e 100 % arrivino a chi mantiene il sito.
- [ ] Il rilevamento dei form acceso: sui siti nuovi può essere spento, e
      senza la POST del form non arriva a nessuno. Netlify rileva i form
      quando pubblica: dopo averlo acceso serve una nuova pubblicazione.
- [ ] Le notifiche email, una per ciascuno dei due form `contatto-it` e
      `contatto-en`, verso l'indirizzo di destinazione vero delle richieste.
      Si configura su Netlify, non nel codice (piano, § Vincoli aperti). Il
      nome del form nella notifica dice la lingua della richiesta.
- [ ] Un invio di prova per lingua: da `/it/contatti/` arriva a
      `/it/grazie/`, da `/en/contact/` a `/en/thank-you/`. Ciascuno arriva
      all'indirizzo vero. Un invio che Netlify classifica spam non manda
      notifica: se l'invio di prova non arriva, si guarda la vista Spam dei
      due form nel pannello Forms, non solo la cartella spam della posta. Al
      primo giro sul sito di prova due invii da un browser automatico con
      indirizzo `@example.com` erano finiti lì.
- [ ] Il branch deploy più recente non ha `X-Robots-Tag: noindex`
      (documentazione di Netlify, misurato sul sito di prova). Sul sito di
      Leo pubblicare solo il branch di produzione, oppure lasciare le
      anteprime Private.
