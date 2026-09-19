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
