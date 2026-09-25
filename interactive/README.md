---
name: interactive
summary: Published report registry, standalone interactive reports, and a versioned public-data namespace for shared browser data.
tags:
- transparency-fun
- reports
- interactive
- modules
submodules:
  data/: Versioned public datasets shared by interactive reports.
  donation-epochs/: Interactive foster-aid flow report with its own cover artwork.
  donation-timeline/: Playable chronological timeline report stepping month-by-month
    through 22 foster relief cycles (2024–2026), 122.58M VND in donations, and 42
    Saigon shelters.
  index.js: Published report metadata, featured flag, optional cover paths, destinations, and future slots.
---

# Interactive reports

To publish a report, create a folder with `index.html`, `styles.css`, `script.js`, and `README.md`, then register its URL and metadata in `index.js`. Give it the number of an existing future slot to replace that slot automatically. Each report loads directly at its own URL; remaining future slots are non-interactive.

To choose the homepage feature, add `featured: true` to **one** published report in `index.js` and remove it from the previous one. The homepage picks that report's link, index, title, and description automatically. If no report has the flag, the first published report is featured. See [`../DESIGN.md`](../DESIGN.md) for the required folder contract and design rules.

Each published report uses the shared geometric cover art by default. To use its own image in the directory and featured card, put an image in that report's folder and add an optional `cover` object to its entry in `index.js`:

```js
cover: {
  src: './interactive/my-report/cover.svg',
  alt: 'Brief description of the image',
},
```

The `src` is relative to the site homepage. SVG, PNG, JPG, and WebP files are included in the Pages build. Omit `cover` to keep the default art. The card and featured slot crop images to different shapes; center the important artwork and check both slots at mobile and desktop sizes. Keep essential words in the card's HTML title rather than at an image edge.

For shared data, use [`data/`](./data/) and follow the versioned public-data contract in [`../DATA.md`](../DATA.md).
