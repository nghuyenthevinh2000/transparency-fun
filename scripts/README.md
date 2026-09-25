---
name: scripts
summary: Public-only site packaging and local-reference validation for Transparency Fun's GitHub Pages deployment.
tags: [deployment, static-site, github-pages]
submodules:
  build-pages.sh: Copies public web assets and versioned datasets from interactive/ into a Pages artifact.
  check-pages.mjs: Checks packaged HTML, CSS, JS imports, and literal fetches for missing local files.
---

# Site build

Run `bash scripts/build-pages.sh /path/to/output` from any directory to assemble the same public files GitHub Actions uploads. The output contains the homepage, standalone reports, and reviewed public datasets under `interactive/data/`. The original workbooks, working documents, and other private files in `reports/` are completely excluded.

Run `node scripts/check-pages.mjs /path/to/output` before publishing. The GitHub Actions workflow runs this check automatically and stops if a report imports a file that was not packaged.
