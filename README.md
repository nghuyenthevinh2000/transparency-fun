---
name: transparency-fun
summary: Transparency Fun static site with interactive reports, masked data dependencies, configurable cover artwork, and GitHub Pages deployment.
tags:
- transparency-fun
- projects
- web-design
submodules:
  .gitignore: Excludes local machine files, screenshots, build output, and a source workbook containing contact information.
  .github/: GitHub Pages Actions deployment configuration.
  brand/: Persistent brand context and current messaging for Transparency Fun's curiosity-led
    transparency positioning.
  interactive/: Registry of featured selection and optional report covers, plus standalone HTML/CSS/JS report folders.
  reports/: Documentation and resources for projects/transparency-fun/reports.
  scripts/: GitHub Pages packaging of public web assets and the masked data needed by reports.
  DESIGN.md: Transparency Fun design system
  app.js: Renders directory cards, optional cover images, and the selected featured report from the registry.
  index.html: Transparency Fun — Transparency, made fun to explore. — Transparency,made
    fun.
  infographic.css: File infographic.css
  styles.css: Shared Open notebook styling with default artwork and contained per-report cover images.
---

# transparency-fun

Open `index.html` through a local HTTP server to browse the directory and its interactive reports. The shared Open notebook design rules are documented in [`DESIGN.md`](./DESIGN.md).

The motto is **“Transparency, made fun to explore.”** Its positioning and usage live in [`brand/messaging.md`](./brand/messaging.md). Published report folders are linked through `interactive/index.js`; follow [`DESIGN.md`](./DESIGN.md) for every future interactive infographic and report.

To change the homepage feature, move `featured: true` to the desired report in [`interactive/index.js`](./interactive/index.js). Its title, description, number, and link update together.

## Deployment

The site is published at <https://nghuyenthevinh2000.github.io/transparency-fun/>. Pushes to `main` run [the GitHub Pages workflow](./.github/workflows/deploy-pages.yml), which uses [`scripts/build-pages.sh`](./scripts/build-pages.sh) to upload only web-serving files. The workflow can also be run manually from GitHub Actions. GitHub Pages must use **GitHub Actions** as its build and deployment source.

The published artifact also includes `reports/dog-shelter/foster_data.js` and `.json` because both interactive report modules load that masked dataset. The source spreadsheet remains local.
