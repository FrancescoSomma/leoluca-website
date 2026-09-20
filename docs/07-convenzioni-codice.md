# Convenzioni di codice

Regole estratte dal piano di implementazione e dallo spec, non inventate qui.
Dove il piano decide una cosa una volta, questo documento la rende valida
sempre: il piano muore con il merge, la convenzione resta.

Sono vincoli verificabili, non preferenze. `code-reviewer` segnala soltanto ciò
che è scritto qui dentro.

## Nomi

- Il dominio è in italiano: `Foto`, `caricaFoto`, `altPer`, `ordine`,
  `in_home`. I termini di framework e di piattaforma restano in inglese:
  `Props`, `slot`, `srcset`, `locale`. Il contenuto è italiano e il modello lo
  rispecchia; mescolare le due lingue dentro la stessa entità produce
  `caricaPhotos` accanto a `fotoList`.
- Il file di un componente porta il nome del componente: `Foto.astro` rende
  `<Foto />`.
- Quando un tipo e un componente hanno lo stesso nome, si rinomina l'import,
  non il tipo: `import type { Foto as DatoFoto }`. Il nome del dominio vale più
  della comodità di chi importa.

## Direzione delle dipendenze

Un file per responsabilità, e le frecce vanno in un verso solo.

- `src/i18n/routes.ts` non conosce i contenuti.
- `src/content/load.ts` non conosce le rotte, a parte il tipo `Locale`.
- I componenti non caricano i dati: li ricevono come prop. Chi carica è la
  pagina.

Un componente che chiama `caricaFoto()` da sé non è verificabile senza il
filesystem e non è riusabile in un'altra pagina.

## Astrazioni

- Nessuna astrazione senza un secondo caso d'uso già presente nel codice. Il
  rischio di questo progetto è costruire troppo: la lista "in eccesso" di
  `spec-guardian` conta quanto quella dei requisiti mancanti.
- I valori vincolati dallo spec sono costanti, mai parametri. Larghezze
  immagine, formati, numero di immagini prioritarie: renderli configurabili
  significa offrire a chi usa il componente un modo di violare lo spec.
- Nessuna opzione di configurazione che non abbia un secondo valore usato
  davvero, da qualche parte, adesso.

## TypeScript

- `strict` è acceso e non si spegne per file.
- I tipi del contenuto derivano dallo schema zod con `z.infer`. Mai un tipo
  scritto a mano accanto a uno schema che lo descrive già: divergono al primo
  cambiamento, e a divergere è sempre quello che nessuno controlla.
- Nessun `any`. Nessun `as` tranne due casi: i letterali `as const` e i
  `querySelector` negli script di browser, dove il DOM non è tipizzabile
  altrimenti.
- Ogni componente dichiara la propria `interface Props`. Nessuna prop letta da
  `Astro.props` senza un tipo che la descriva.

## Test

- Moduli puri — rotte, schemi, caricamento: Vitest, in `tests/unit/`.
- Markup di un componente: Vitest con il container di Astro, sempre in
  `tests/unit/`. Il markup è un contratto e si verifica come tale.
- Comportamento nel browser, navigazione, focus, accessibilità: Playwright, in
  `tests/e2e/`.
- Il test si scrive prima e lo si vede fallire. Un test mai fallito non prova
  nulla: prova solo di essere stato scritto.
- Si asserisce il vincolo dello spec, non il dettaglio di implementazione. "Non
  serve JPEG" è un vincolo; "chiama `<Picture>` con questi argomenti" è un
  dettaglio.

## CSS

- Solo token del design system. Nessun valore letterale per colore, spaziatura,
  tipografia, raggio, ombra o punto di rottura.
- Gli stili stanno nel componente che li usa.

## Commenti

- Il commento dice il perché, mai il cosa. Il cosa è già nel codice, e se non si
  capisce il problema è il codice.
- Un vincolo non ovvio va commentato dove vive, non solo nello spec: il ripiego
  WebP imposto a mano, il poster dell'hero con `alt=""`, le larghezze non
  parametrizzabili. Chi legge quella riga fra un anno non ha lo spec aperto.
- Niente intestazioni decorative, niente commenti di sezione, nessun `TODO` che
  non abbia una riga corrispondente in [01-discovery.md](01-discovery.md).

## Fuori da questo documento

Non perché non conti, ma perché lo copre già qualcun altro. Ciò che compare qui
sotto `code-reviewer` non lo segnala.

| Cosa | Chi se ne occupa |
| --- | --- |
| Formato, virgolette, indentazione, larghezza delle righe | Prettier, via l'hook `PostToolUse` |
| Tipi e null safety | `tsc --noEmit` e `astro check` |
| Requisiti mancanti o codice in eccesso rispetto allo spec | `spec-guardian` |
| Fedeltà al design, stati mancanti, contrasto | `design-reviewer` |
| Principi generali di ingegneria del software | nessuno, e per scelta: non sono verificabili su un diff, e un documento che li elenca si legge una volta sola |
