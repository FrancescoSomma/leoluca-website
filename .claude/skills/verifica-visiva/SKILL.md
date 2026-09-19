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
