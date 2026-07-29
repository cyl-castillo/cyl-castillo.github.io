#!/usr/bin/env bash
# Regenera los assets derivados del sitio:
#   og-cover.png  — portada social (og:image), rasterizada desde tools/og-cover.html
#   cv.pdf        — CV imprimible, generado desde index.html usando su @media print
#
# Ambos son artefactos: la fuente es el HTML. Si editás index.html o
# tools/og-cover.html, volvé a correr este script y commiteá el resultado.
#
#   ./tools/build-assets.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"

CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome)"
[ -n "$CHROME" ] || { echo "error: no encontré chromium/chrome en el PATH" >&2; exit 1; }

PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT

echo "→ og-cover.png (1200x630)"
"$CHROME" --headless --disable-gpu --no-sandbox \
  --user-data-dir="$PROFILE" \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size=1200,630 \
  --screenshot="$ROOT/og-cover.png" \
  "file://$ROOT/tools/og-cover.html" 2>/dev/null

# ?lang=es explícito: en headless navigator.language es en-US, asi que sin el
# parametro el PDF saldria en ingles.
echo "→ cv.pdf (A4, es)"
"$CHROME" --headless --disable-gpu --no-sandbox \
  --user-data-dir="$PROFILE" \
  --no-pdf-header-footer \
  --print-to-pdf="$ROOT/cv.pdf" \
  "file://$ROOT/index.html?lang=es" 2>/dev/null

echo
for f in og-cover.png cv.pdf; do
  [ -s "$ROOT/$f" ] || { echo "error: $f quedó vacío" >&2; exit 1; }
  printf '  %-14s %s\n' "$f" "$(du -h "$ROOT/$f" | cut -f1)"
done
echo
echo "listo. Revisá los dos archivos antes de commitear."
