# transparency-fun

Open `index.html` through a local HTTP server to browse the directory and its interactive reports. The shared Open notebook design rules are documented in [`DESIGN.md`](./DESIGN.md).

The motto is **“Transparency, made fun to explore.”** Its positioning and usage live in [`brand/messaging.md`](./brand/messaging.md). Published report folders are linked through `interactive/index.js`; follow [`DESIGN.md`](./DESIGN.md) for every future interactive infographic and report.

To change the homepage feature, move `featured: true` to the desired report in [`interactive/index.js`](./interactive/index.js). Its title, description, number, and link update together.

## Deployment

The site is published at <https://nghuyenthevinh2000.github.io/transparency-fun/>. Pushes to `main` run [the GitHub Pages workflow](./.github/workflows/deploy-pages.yml), which uses [`scripts/build-pages.sh`](./scripts/build-pages.sh) to upload only web-serving files. The workflow can also be run manually from GitHub Actions. GitHub Pages must use **GitHub Actions** as its build and deployment source.

Shared browser datasets live under [`interactive/data/`](./interactive/data/) following [`DATA.md`](./DATA.md). The GitHub Pages deployment publishes only reviewed web files and datasets from `interactive/`; all source workbooks and research materials under `reports/` remain strictly local and private.
