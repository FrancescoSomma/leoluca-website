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

# In hook mode lo Stop hook ha 180s: niente build, e2e o Lighthouse, che lo
# sforerebbero. L'uso manuale gira la catena intera, build prima di tutto
# ciò che dipende da dist/.
if [ "$HOOK_MODE" -eq 1 ]; then
  STEPS="lint typecheck test"
else
  STEPS="lint typecheck build test e2e perf a11y"
fi

# --if-present passa se lo script manca.
for step in $STEPS; do
  npm run "$step" --if-present --silent || fail "npm run $step è fallito"
done

[ "$HOOK_MODE" -eq 1 ] || echo "verify: tutti i controlli superati"
exit 0
