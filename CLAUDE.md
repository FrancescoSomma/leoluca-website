# Sito fotografo di eventi

Sito statico orientato ai contenuti. Le foto sono il prodotto: fedeltà visiva e
performance su immagini pesanti vengono prima di ogni altra considerazione
tecnica.

## Stato

Stack non ancora deciso (fase F3). Non introdurre framework, CMS, librerie o
servizi prima che l'ADR corrispondente in `docs/03-adr/` sia in stato
`accettato`.

## Comandi

- `./scripts/verify.sh` — gate unico di verifica. Eseguilo prima di dichiarare
  concluso un task. Finché lo stack non è deciso non fa nulla e passa.

## Regole

- Ogni immagine passa dalla pipeline immagini. Mai un file originale servito
  direttamente.
- Budget di performance e accessibilità: vedi `docs/02-spec.md`. Sono vincoli,
  non obiettivi.
- Nessuna dipendenza nuova senza un ADR accettato.
- Convenzioni di codice: `docs/07-convenzioni-codice.md`. Valgono per ogni
  file sorgente. Le verifica `code-reviewer`.
- "Fatto" richiede evidenza: output del comando, test che passa, o screenshot.
  Mai una dichiarazione senza prova.
- IMPORTANT: non implementare nulla che non sia in `docs/02-spec.md`. Se serve
  qualcosa che non c'è, fermati e proponilo.

## Workflow

- Modifica su più file o approccio incerto: plan mode prima di editare. Fix
  puntuale descrivibile in una frase: procedi diretto.
- Un branch per slice verticale, commit atomici, conventional commits.
- `/clear` tra task non correlati.

## Contesto

@docs/02-spec.md
