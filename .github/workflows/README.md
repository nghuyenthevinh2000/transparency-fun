---
name: workflows
summary: GitHub Actions workflow that assembles public site files, checks local asset references, and deploys to Pages on pushes to main.
tags: [github-actions, github-pages, deployment]
submodules:
  deploy-pages.yml: Builds and validates a public artifact before deploying through the GitHub Pages Actions environment.
---

# Workflows

`deploy-pages.yml` runs on pushes to `main` and can also be started manually from the Actions tab. The asset check fails before deployment if an imported local module or referenced web asset was not packaged.
