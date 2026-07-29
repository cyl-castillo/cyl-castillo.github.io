#!/usr/bin/env bash
# Instala los hooks de tools/hooks/ en .git/hooks/.
#
#   ./tools/install-hooks.sh
#
# Hace falta una vez por clone: .git/ no se versiona, asi que el hook no viaja
# con el repo. No pisa un hook existente sin avisar.
set -euo pipefail

cd "$(dirname "$0")/.."
DEST="$(git rev-parse --git-path hooks)"

for src in tools/hooks/*; do
  name="$(basename "$src")"
  target="$DEST/$name"
  if [ -e "$target" ] && ! cmp -s "$src" "$target"; then
    echo "! $name ya existe y es distinto — no lo piso." >&2
    echo "  compara con: diff $target $src" >&2
    continue
  fi
  cp "$src" "$target"
  chmod +x "$target"
  echo "✓ $name"
done
