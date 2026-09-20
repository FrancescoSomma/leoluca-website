# Design system

> Fonte di verità: l'artifact di Claude Design. Questo file è lo specchio nel
> repo, perché Claude Design non ha ancora cronologia delle versioni.

## Collegamento all'artifact

## Token

Colore, tipografia, spaziature, raggi, ombre, breakpoint. Riportati qui e
implementati come custom property CSS.

### Punti di rottura

Li fissa [02-spec.md](02-spec.md) § Dispositivi e larghezze. Non sono una
scelta del design system: il design system li recepisce. I nomi dei token li
decide il design system, i valori no.

| Larghezza | Ruolo |
| --- | --- |
| 320 px | Pavimento di WCAG 2.2 AA. Si verifica, non si disegna |
| 390 px | Telefono di riferimento |
| 768 px | Tablet in verticale |
| 1440 px | Desktop di riferimento |

Le media query si scrivono solo in `min-width`: vedi
[07-convenzioni-codice.md](07-convenzioni-codice.md).

## Componenti

## Sincronizzazione

- Da Claude Code verso Design: `/design-sync`
- Da Design verso il codice: handoff a Claude Code, oppure `/design`

Dopo ogni modifica approvata al design, aggiornare questo file nello stesso
commit del codice.
