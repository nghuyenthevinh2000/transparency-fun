#!/usr/bin/env bash
set -euo pipefail

root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
destination="${1:-$root/_site}"

mkdir -p "$destination/interactive"
cp "$root/index.html" "$root/app.js" "$root/styles.css" "$root/infographic.css" "$destination/"
touch "$destination/.nojekyll"


# Publish standalone reports and their web assets, without private working files,
# source spreadsheets, README files, or the brand package.
rsync -a --prune-empty-dirs \
  --include='*/' \
  --include='*.html' --include='*.css' --include='*.js' --include='*.json' \
  --include='*.svg' --include='*.png' --include='*.jpg' --include='*.jpeg' \
  --include='*.webp' --include='*.gif' --include='*.avif' --include='*.ico' \
  --include='*.woff' --include='*.woff2' --include='*.ttf' --include='*.otf' \
  --include='*.mp4' --include='*.webm' \
  --exclude='*' \
  "$root/interactive/" "$destination/interactive/"
