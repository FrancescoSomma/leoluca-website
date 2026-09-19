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
