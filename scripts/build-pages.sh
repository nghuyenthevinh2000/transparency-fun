#!/usr/bin/env bash
set -euo pipefail

root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
destination="${1:-$root/_site}"

mkdir -p "$destination/interactive"
cp "$root/index.html" "$root/app.js" "$root/sound.js" "$root/styles.css" "$root/infographic.css" "$destination/"
touch "$destination/.nojekyll"

# Publish shared static media assets (audio, visuals), without README or working notes.
if [ -d "$root/assets" ]; then
  mkdir -p "$destination/assets"
  rsync -a \
    --include='*/' \
    --include='*.json' \
    --include='*.mp3' --include='*.wav' --include='*.ogg' --include='*.m4a' \
    --include='*.svg' --include='*.png' --include='*.jpg' --include='*.jpeg' \
    --include='*.webp' --include='*.gif' --include='*.avif' --include='*.ico' \
    --exclude='*' \
    "$root/assets/" "$destination/assets/"

  # Dynamically generate audio manifest and canonical fallback in the published site
  node -e '
    const fs = require("fs");
    const path = require("path");
    const srcDir = process.argv[1];
    const destDir = process.argv[2];
    const exts = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);
    const files = fs.existsSync(destDir) ? fs.readdirSync(destDir) : [];
    const detected = files.filter(f => exts.has(path.extname(f).toLowerCase()) && f !== "ambient.mp3");

    const srcJsonPath = path.join(srcDir, "tracks.json");
    let tracks = [];
    if (fs.existsSync(srcJsonPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(srcJsonPath, "utf8"));
        if (Array.isArray(existing)) {
          tracks = existing.filter(t => detected.includes(t));
        }
      } catch {}
    }
    for (const d of detected) {
      if (!tracks.includes(d)) tracks.push(d);
    }
    if (tracks.length === 0) tracks = detected;

    const jsonContent = JSON.stringify(tracks, null, 2) + "\n";
    fs.writeFileSync(path.join(destDir, "tracks.json"), jsonContent);
    fs.writeFileSync(srcJsonPath, jsonContent);
    if (tracks.length > 0) {
      fs.copyFileSync(path.join(destDir, tracks[0]), path.join(destDir, "ambient.mp3"));
    }
  ' "$root/assets" "$destination/assets"
fi

# Publish standalone reports and their web assets, without private working files,
# source spreadsheets, README files, or the brand package.
rsync -a --prune-empty-dirs \
  --include='*/' \
  --include='*.html' --include='*.css' --include='*.js' --include='*.json' \
  --include='*.svg' --include='*.png' --include='*.jpg' --include='*.jpeg' \
  --include='*.webp' --include='*.gif' --include='*.avif' --include='*.ico' \
  --include='*.woff' --include='*.woff2' --include='*.ttf' --include='*.otf' \
  --include='*.mp3' --include='*.wav' --include='*.ogg' --include='*.m4a' \
  --include='*.mp4' --include='*.webm' \
  --exclude='*' \
  "$root/interactive/" "$destination/interactive/"
