---
name: workflows
summary: GitHub Actions workflow that packages public site files and deploys them to GitHub Pages on pushes to main.
tags: [github-actions, github-pages, deployment]
submodules:
  deploy-pages.yml: Builds a public-only artifact and deploys it through the GitHub Pages Actions environment.
---

# Workflows

`deploy-pages.yml` runs on pushes to `main` and can also be started manually from the Actions tab.
