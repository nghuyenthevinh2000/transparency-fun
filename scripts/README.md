---
name: scripts
summary: Small scripts used to assemble and validate the public Transparency Fun static site.
tags: [deployment, static-site, github-pages]
submodules:
  build-pages.sh: Copies only web-serving assets into a GitHub Pages artifact directory.
---

# Site build

Run `bash scripts/build-pages.sh /path/to/output` from any directory to assemble the same public files GitHub Actions uploads. The output contains the homepage and standalone interactive reports, excluding working documents and spreadsheets.
