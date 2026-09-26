# Sito fotografo di eventi

Documentazione di progetto in `docs/`. Processo di sviluppo: `docs/03-adr/0001-processo-di-sviluppo.md`.

Verifica: `./scripts/verify.sh`

## Ambiente

- Node ≥ 22.12, come in `.nvmrc`.
- `npm ci`, poi `npx playwright install chromium`.
- Google Chrome installato: lo usa Lighthouse CI.
- Claude Code con i plugin `superpowers@claude-plugins-official`, per
  eseguire il piano, e `frontend-design@claude-plugins-official`, per il
  piano di stile. Agenti, skill e hook di progetto arrivano con `.claude/`.

## Da dove partire

Lo stato del lavoro e il protocollo per lavorare in parallelo su più macchine
sono in testa al piano in esecuzione:
`docs/superpowers/plans/2026-09-21-fondamenta-e-percorso-critico.md`, §
Stato di avanzamento.
