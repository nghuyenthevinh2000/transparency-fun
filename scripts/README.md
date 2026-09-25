---
name: scripts
summary: Public-only static-site build script packaging the homepage, standalone reports, and masked foster-relief data for GitHub Pages.
tags: [deployment, static-site, github-pages]
submodules:
  build-pages.sh: Copies web assets and the masked data module/JSON required by interactive reports into a Pages artifact.
---

# Site build

Run `bash scripts/build-pages.sh /path/to/output` from any directory to assemble the same public files GitHub Actions uploads. The output contains the homepage, standalone reports, and their masked `foster_data.js`/`foster_data.json` dependencies. The original workbook, working documents, and other private files are excluded.
