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
