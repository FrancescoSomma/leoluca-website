# Sito fotografo di eventi

Sito statico orientato ai contenuti. Le foto sono il prodotto: fedeltà visiva e
performance su immagini pesanti vengono prima di ogni altra considerazione
tecnica.

## Stato

Stack deciso: Astro 7.3.3 e Netlify (ADR-0003), CMS git-based e storage a
oggetti con il prodotto ancora da scegliere (ADR-0004), Vitest, Playwright,
axe, Lighthouse CI e Prettier (ADR-0005). Nient'altro entra senza un ADR
accettato in `docs/03-adr/`.

Codice: scaffold Astro attivo (Task 2 di
`docs/superpowers/plans/2026-09-21-fondamenta-e-percorso-critico.md`
concluso). Si prosegue dal Task 3.

Direzione visiva: non definita. Nessun token, `design/ref/` è vuoto. Finché
resta così le pagine si scrivono con markup nudo, `design-reviewer` non ha un
riferimento e la skill `/verifica-visiva` non può girare. Il binario del
design corre in parallelo e deve chiudere prima del Task 6.

## Comandi

- `./scripts/verify.sh` — gate unico di verifica. Eseguilo prima di dichiarare
  concluso un task. Ora esegue la catena intera (`lint typecheck build test
e2e perf a11y`); in modalità `--hook` esegue solo `lint typecheck test`,
  perché lo Stop hook ha un timeout di 180 s.

## Regole

- Ogni immagine passa dalla pipeline immagini. Mai un file originale servito
  direttamente.
- Budget di performance e accessibilità: vedi `docs/02-spec.md`. Sono vincoli,
  non obiettivi.
- Nessuna dipendenza nuova senza un ADR accettato.
- Convenzioni di codice: `docs/07-convenzioni-codice.md`. Valgono per ogni
  file sorgente. Le verifica `code-reviewer`.
- "Fatto" richiede evidenza: output del comando, test che passa, o screenshot.
  Mai una dichiarazione senza prova. Per una pagina che si vede, l'evidenza
  comprende gli screenshot a 390, 768 e 1440 px: chi sviluppa qui non ha occhi
  e un layout rotto non fallisce nessun test.
- IMPORTANT: non implementare nulla che non sia in `docs/02-spec.md`. Se serve
  qualcosa che non c'è, fermati e proponilo.

## Workflow

- Modifica su più file o approccio incerto: plan mode prima di editare. Fix
  puntuale descrivibile in una frase: procedi diretto.
- Un branch per slice verticale, commit atomici, conventional commits.
- Prima di ogni merge, review in contesto pulito sul diff: `spec-guardian`
  sempre, `code-reviewer` se c'è codice, `design-reviewer` quando esiste un
  riferimento in `design/ref/` (ADR-0001 punto 6). Ogni segnalazione si
  risolve, o si rifiuta con il motivo scritto nel commit.
- `/clear` tra task non correlati.

## Contesto

@docs/02-spec.md
