#!/usr/bin/env bash
#
# bootstrap.sh — F0: sistema operativo del progetto "sito fotografo di eventi"
#
# Crea la struttura di repo, la configurazione di Claude Code e gli stub dei
# documenti. Idempotente: non sovrascrive mai un file esistente, si limita a
# segnalarlo. Eseguire dalla root del repo:
#
#   bash bootstrap.sh
#
set -uo pipefail

created=0
skipped=0

# write <path> — legge il contenuto da stdin e lo scrive solo se il file non esiste
write() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  if [ -e "$path" ]; then
    cat >/dev/null
    printf '  = %s (esiste, saltato)\n' "$path"
    skipped=$((skipped + 1))
    return
  fi
  cat >"$path"
  printf '  + %s\n' "$path"
  created=$((created + 1))
}

echo "F0 — scaffold progetto"
echo

if [ ! -d .git ]; then
  git init -q
  echo "  + repo git inizializzato"
fi

# ---------------------------------------------------------------------------
# CLAUDE.md
# ---------------------------------------------------------------------------

write CLAUDE.md <<'EOF'
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
EOF

# ---------------------------------------------------------------------------
# Configurazione Claude Code
# ---------------------------------------------------------------------------

write .claude/settings.json <<'EOF'
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git branch:*)",
      "Bash(git checkout:*)",
      "Bash(npm run:*)",
      "Bash(gh:*)",
      "Bash(./scripts/verify.sh)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/format-changed.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/verify.sh --hook",
            "timeout": 180
          }
        ]
      }
    ]
  }
}
EOF

write .claude/skills/discovery/SKILL.md <<'EOF'
---
name: discovery
description: Conduce l'intervista di discovery con il cliente e produce docs/01-discovery.md
disable-model-invocation: true
---

# Discovery

Conduci l'intervista usando lo strumento AskUserQuestion, una domanda per volta,
finché ogni area qui sotto non è coperta. Non fare domande la cui risposta è già
in `docs/00-brief.md`. Scava sui punti difficili, non su quelli ovvi.

Al termine scrivi `docs/01-discovery.md` con le risposte, e marca esplicitamente
ciò che è rimasto indeterminato.

## Aree da coprire

**Business**
- Che tipo di eventi fotografa e quali vuole fotografare di più
- Da dove arrivano oggi i clienti e quanti contatti riceve al mese
- Cosa deve succedere perché il sito sia considerato un successo, in numeri
- Chi sono i concorrenti diretti sul territorio e cosa fanno meglio di lui

**Contenuti**
- Quante foto ha, in che formato, chi le seleziona
- Quante gallerie prevede di pubblicare all'anno
- Servono gallerie private per i clienti (link protetto, download, scadenza)
- Ha video, e in che quantità
- Ha già testi, logo, palette, o vanno prodotti
- Diritti d'uso: può pubblicare i volti degli invitati, servono liberatorie

**Operatività**
- Chi carica le gallerie dopo il lancio, lui o noi
- Quanto è disposto a imparare per farlo da solo
- Da che dispositivo lavora quando le carica

**Vincoli**
- Sito esistente, dominio, URL da mantenere o redirezionare
- Presenza su Instagram o altri canali da integrare
- Lingue richieste
- Budget e finestra temporale reale

## Gotchas

- "Voglio che sia bello" non è un requisito. Traducilo in un riferimento
  concreto: chiedi tre siti che gli piacciono e tre che detesta, e perché.
- La domanda su chi carica le gallerie determina stack, hosting e prezzo. Se la
  risposta è vaga, non chiuderla: registrala come aperta in ADR-0002.
- Un fotografo sottostima sempre il numero di foto. Chiedi il peso in GB
  dell'ultimo matrimonio consegnato.
- Non proporre soluzioni tecniche durante l'intervista.
EOF

write .claude/skills/adr/SKILL.md <<'EOF'
---
name: adr
description: Scrive o aggiorna un Architecture Decision Record in docs/03-adr/
disable-model-invocation: true
---

# ADR

Registra una decisione tecnica in `docs/03-adr/`, usando
`docs/03-adr/0000-template.md` come base.

1. Numera progressivamente (`NNNN-slug-breve.md`).
2. Una sola decisione per ADR.
3. Elenca le alternative scartate con il motivo reale dello scarto, non con una
   giustificazione a posteriori.
4. Stato iniziale `proposto`. Passa ad `accettato` solo su conferma esplicita
   dell'umano.
5. Una decisione superata non si cancella: si marca `superata da NNNN`.

## Gotchas

- Se stai scrivendo un ADR per giustificare codice già scritto, fermati: la
  decisione è già stata presa male. Segnalalo.
- Se non esistono alternative credibili, la decisione non merita un ADR.
- Le conseguenze negative vanno scritte. Un ADR senza costi è marketing.
EOF

write .claude/skills/verifica-visiva/SKILL.md <<'EOF'
---
name: verifica-visiva
description: Confronta l'implementazione di una pagina con il design di riferimento via screenshot e corregge le differenze
---

# Verifica visiva

Chiude il loop tra design e implementazione senza passare da un giudizio umano
a ogni iterazione.

1. Avvia il dev server.
2. Fai uno screenshot della pagina a 390px, 768px e 1440px di larghezza.
3. Confronta con il riferimento in `design/ref/<pagina>-<breakpoint>.png`.
4. Elenca le differenze raggruppate per categoria: spaziature, tipografia,
   colore, gerarchia, stati.
5. Correggi.
6. Ripeti da 2 finché la lista è vuota o contiene solo voci che hai marcato come
   accettabili, con il motivo.
7. Mostra gli screenshot finali come evidenza.

## Gotchas

- Se esiste un token per un valore, usa il token. Non inserire mai un valore
  letterale per far combaciare uno screenshot.
- Differenze di rendering dei font e di antialiasing non sono bug: marcale
  accettabili e vai avanti.
- Non modificare componenti condivisi per aggiustare una singola pagina. Se
  serve, fermati e segnalalo.
- Se il riferimento manca, non inventarlo: chiedi l'export dal design.
EOF

write .claude/agents/design-reviewer.md <<'EOF'
---
name: design-reviewer
description: Rivede l'implementazione di una pagina contro il design di riferimento, in contesto pulito
tools: Read, Glob, Grep, Bash
model: opus
---

Sei un design engineer. Vedi solo il diff e il design di riferimento, non il
ragionamento che ha prodotto il codice.

Valuta esclusivamente:
- fedeltà al design di riferimento (spaziature, tipografia, colore, gerarchia)
- comportamento responsive ai tre breakpoint di progetto
- stati mancanti: caricamento, vuoto, errore, focus, hover
- uso dei token del design system al posto di valori letterali
- accessibilità: contrasto, ordine di tabulazione, testo alternativo

Riporta solo scostamenti che un utente noterebbe o che violano il design
system. Non riportare preferenze stilistiche sul codice. Cita file e riga.
Se non trovi scostamenti rilevanti, dillo e fermati: non cercare a tutti i
costi qualcosa da segnalare.
EOF

write .claude/agents/spec-guardian.md <<'EOF'
---
name: spec-guardian
description: Verifica che un diff rispetti docs/02-spec.md e non introduca scope creep
tools: Read, Glob, Grep, Bash
model: sonnet
---

Confronta il diff con `docs/02-spec.md` e con l'ADR di riferimento.

Riporta due liste, entrambe obbligatorie:

1. **Mancante** — requisiti dello spec non implementati o implementati
   parzialmente.
2. **In eccesso** — codice, astrazioni, dipendenze, opzioni di configurazione o
   casi gestiti che non corrispondono a nessun requisito. Questa lista conta
   quanto la prima: su questo progetto il rischio principale è costruire troppo.

Ignora stile, formattazione e preferenze architetturali. Ogni voce con file,
riga e il requisito violato o assente.
EOF

# ---------------------------------------------------------------------------
# Script
# ---------------------------------------------------------------------------

write scripts/verify.sh <<'EOF'
#!/usr/bin/env bash
#
# Gate unico di verifica del progetto.
#
#   ./scripts/verify.sh          uso manuale, esce 1 in caso di fallimento
#   ./scripts/verify.sh --hook   usato dallo Stop hook, esce 2 così Claude
#                                legge l'errore e prosegue invece di fermarsi
#
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 0

HOOK_MODE=0
[ "${1:-}" = "--hook" ] && HOOK_MODE=1

fail() {
  echo "verify: $1" >&2
  [ "$HOOK_MODE" -eq 1 ] && exit 2
  exit 1
}

# F0: nessuno stack deciso, il gate è inattivo e non deve dare fastidio.
if [ ! -f package.json ]; then
  [ "$HOOK_MODE" -eq 1 ] && exit 0
  echo "verify: stack non ancora configurato, nessun controllo da eseguire"
  exit 0
fi

# Aggiungi qui gli script man mano che esistono. --if-present passa se mancano.
for step in lint typecheck build test perf a11y; do
  npm run "$step" --if-present --silent || fail "npm run $step è fallito"
done

[ "$HOOK_MODE" -eq 1 ] || echo "verify: tutti i controlli superati"
exit 0
EOF
chmod +x scripts/verify.sh 2>/dev/null

write scripts/format-changed.sh <<'EOF'
#!/usr/bin/env bash
#
# PostToolUse hook: formatta il singolo file appena scritto da Claude.
# Non blocca mai il flusso: in caso di dubbio esce 0.
#
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" \
  | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
  | head -n 1)

[ -n "$file" ] || exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs|*.css|*.scss|*.json|*.md|*.astro|*.html)
    if [ -x node_modules/.bin/prettier ]; then
      node_modules/.bin/prettier --write "$file" >/dev/null 2>&1
    fi
    ;;
esac

exit 0
EOF
chmod +x scripts/format-changed.sh 2>/dev/null

# ---------------------------------------------------------------------------
# Documenti
# ---------------------------------------------------------------------------

write docs/00-brief.md <<'EOF'
# Brief

> Da compilare in F1, una pagina, firmato dal cliente.

## Cliente

## Obiettivo di business

Cosa deve cambiare nella sua attività perché il sito sia valso la spesa.

## Cosa misuriamo

## Fuori discussione

Vincoli non negoziabili emersi dal cliente.
EOF

write docs/01-discovery.md <<'EOF'
# Discovery

> Prodotto dalla skill `/discovery`. Registra le risposte, non le
> interpretazioni.

## Business

## Contenuti

## Operatività

## Vincoli

## Rimasto aperto

- Chi aggiorna le gallerie dopo il lancio → ADR-0002
EOF

write docs/02-spec.md <<'EOF'
# Specifica

> Da completare in F2. Deve essere autoconsistente: chi la legge deve poter
> implementare senza tornare alla chat.

## Sitemap

## Modello dei contenuti

## User story

Formato: come <ruolo> voglio <azione> per <beneficio>, con criteri di
accettazione verificabili.

## Budget (vincoli, non obiettivi)

| Metrica | Limite | Come si misura |
| --- | --- | --- |
| LCP (4G, mobile) | ≤ 2.0 s | Lighthouse CI, pagina galleria più pesante |
| CLS | < 0.1 | Lighthouse CI |
| Peso trasferito homepage | ≤ 1.2 MB | Lighthouse CI |
| Accessibilità | WCAG 2.2 AA sui percorsi principali | axe, verifica manuale tastiera |

I valori sopra sono una proposta di partenza: vanno confermati o corretti in F2
sui contenuti reali.

## Percorso critico

Arrivo → galleria → richiesta preventivo → conferma. È l'unico percorso coperto
da test end-to-end obbligatori.

## Fuori ambito

Elenco esplicito di ciò che non facciamo in questa versione. Serve al
`spec-guardian`.
EOF

write docs/03-adr/0000-template.md <<'EOF'
# ADR-0000 — Titolo

Stato: proposto | accettato | superata da ADR-NNNN
Data: AAAA-MM-GG

## Contesto

Cosa rende necessaria una decisione adesso.

## Decisione

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |

## Conseguenze

Positive e negative. Se non ci sono conseguenze negative, l'analisi è
incompleta.
EOF

write docs/03-adr/0001-processo-di-sviluppo.md <<'EOF'
# ADR-0001 — Processo di sviluppo agentico

Stato: accettato
Data: 2026-09-19

## Contesto

Progetto sviluppato con Claude Design e Claude Code. Serve stabilire dove
vivono le decisioni e cosa vale come "fatto", prima di scrivere codice.

## Decisione

1. Le decisioni vivono in `docs/`, versionate. Le chat sono volatili e non
   fanno testo.
2. Tre livelli: conversazione (analisi, requisiti, contenuti), Claude Design
   (direzione visiva e design system), Claude Code (implementazione, verifica,
   deploy).
3. Il design system è sincronizzato tra Design e repo. Le decisioni visive sono
   rispecchiate come token nel codice.
4. Ogni fase ha un gate. Nessun passaggio alla fase successiva senza il gate.
5. "Fatto" richiede evidenza verificabile, prodotta da `./scripts/verify.sh` o
   da screenshot di confronto.
6. Ogni slice implementativa passa da una review in contesto pulito
   (`design-reviewer`, `spec-guardian`) prima del merge.

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |
| Decisioni nelle chat | Non ricostruibili, non condivisibili con il cliente |
| Design ricostruito da screenshot | Perde i token e l'intento, produce deriva visiva |
| Nessun gate, iterazione continua | Su un progetto a contenuto visivo porta a rifacimenti tardivi e costosi |

## Conseguenze

Positive: il progetto è ripartibile da zero leggendo `docs/`, e il processo è
riutilizzabile su altri progetti.

Negative: overhead iniziale di una mezza giornata, e disciplina richiesta nel
non prendere scorciatoie quando il task sembra piccolo.
EOF

write docs/03-adr/0002-gestione-contenuti.md <<'EOF'
# ADR-0002 — Gestione dei contenuti dopo il lancio

Stato: proposto
Data: 2026-09-19

## Contesto

Chi carica le gallerie dopo il lancio è la decisione che determina stack, CMS,
hosting, costo ricorrente e contratto di manutenzione. È deliberatamente aperta
finché F1 non produce la risposta del cliente.

## Domanda aperta

Il fotografo pubblica da solo, o la pubblicazione resta a noi?

## Criterio di decisione

Decide il cliente in F1, sulla base di: frequenza di pubblicazione attesa,
disponibilità a imparare uno strumento, e disponibilità a pagare un canone di
manutenzione. Non decidiamo noi per lui e non scegliamo il CMS "perché è
meglio".

## Decisione

Da prendere in F3.
EOF

write docs/04-design-system.md <<'EOF'
# Design system

> Fonte di verità: l'artifact di Claude Design. Questo file è lo specchio nel
> repo, perché Claude Design non ha ancora cronologia delle versioni.

## Collegamento all'artifact

## Token

Colore, tipografia, spaziature, raggi, ombre, breakpoint. Riportati qui e
implementati come custom property CSS.

## Componenti

## Sincronizzazione

- Da Claude Code verso Design: `/design-sync`
- Da Design verso il codice: handoff a Claude Code, oppure `/design`

Dopo ogni modifica approvata al design, aggiornare questo file nello stesso
commit del codice.
EOF

write docs/05-content.md <<'EOF'
# Contenuti

## Tono di voce

## Testi per pagina

## SEO

Parole chiave per pagina, title, meta description, dati strutturati
(LocalBusiness, ImageObject).

## Immagini

Convenzioni di naming, testo alternativo, crediti, liberatorie.
EOF

write docs/06-runbook.md <<'EOF'
# Runbook

> Da completare in F7. Deve essere leggibile dal fotografo, non da uno
> sviluppatore.

## Come si pubblica una nuova galleria

## Cosa fare se il sito non è raggiungibile

## Contatti e credenziali

Dove sono custodite, non quali sono.

## Manutenzione

Cosa è coperto, con che frequenza, cosa no.
EOF

write design/ref/README.md <<'EOF'
# Riferimenti visivi

Screenshot esportati dal design, usati dalla skill `/verifica-visiva` e
dall'agente `design-reviewer`.

Convenzione: `<pagina>-<larghezza>.png`, per esempio `home-390.png`,
`home-1440.png`.
EOF

write .gitignore <<'EOF'
node_modules/
dist/
build/
.astro/
.cache/
.env
.env.*
!.env.example
.DS_Store
*.log
.claude/settings.local.json
EOF

write README.md <<'EOF'
# Sito fotografo di eventi

Documentazione di progetto in `docs/`. Processo di sviluppo: `docs/03-adr/0001-processo-di-sviluppo.md`.

Verifica: `./scripts/verify.sh`
EOF

echo
echo "Fatto: $created file creati, $skipped saltati."
echo
echo "Prossimi passi:"
echo "  1. git add -A && git commit -m \"chore: scaffold di progetto (F0)\""
echo "  2. apri Claude Code nella root e lancia /discovery per iniziare F1"
