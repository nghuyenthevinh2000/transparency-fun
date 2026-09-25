# Public data standard

Interactive reports may use small, versioned public datasets. **Keep source workbooks and research notes in `reports/`; put only reviewed browser-ready data under `interactive/data/`.** The GitHub Pages build includes supported web assets from `interactive/`, but does not publish the rest of `reports/`.

## Location and contract

```text
interactive/data/<dataset-slug>/v1/
├── README.md           # directory frontmatter, source and schema notes
├── <dataset_name>.json # canonical browser-ready data, if JSON is needed
└── <dataset_name>.js   # optional ES module for reports that import data
```

- Use a stable lowercase kebab-case slug and a `v1`, `v2`, ... directory for breaking schema changes. Keep the old version while published reports still use it.
- A dataset may contain JSON, a JS module, or both. If both exist, they must represent the same reviewed records. Do not store an unmasked source copy here.
- Document the data's source, date range, units, field meanings, masking, and any omissions in the version folder's `README.md`. Each directory keeps its own frontmatter per repository rules.
- Files under `interactive/data/` are **public** after deployment. Never put contact details, credentials, private links, or raw spreadsheets there.

## Load from a report

From `interactive/<report-slug>/script.js`, import a sibling public dataset using a relative path:

```js
import { FOSTER_DATA } from '../data/foster-relief/v1/foster_data.js';
```

Or load JSON from the report page (whose URL ends in `interactive/<report-slug>/`):

```js
const response = await fetch('../data/foster-relief/v1/foster_data.json');
if (!response.ok) throw new Error(`Data unavailable: ${response.status}`);
const data = await response.json();
```

The public paths are relative to the report, so they work both locally and at GitHub Pages' `/transparency-fun/` project subpath. Keep rendering or calculation logic in the report folder; the data directory contains only data and its documentation.

## Publishing and verification

`scripts/build-pages.sh` copies `.js` and `.json` files under `interactive/` (including `interactive/data/`) into the Pages artifact; no custom build rule is needed for datasets in this location. The `scripts/check-pages.mjs` verification step in GitHub Actions confirms that all local imports, fetch calls, and referenced assets exist in the artifact before deployment.

The reference dataset [`foster-relief/v1`](interactive/data/foster-relief/v1/) is published and loaded by both [`donation-epochs`](interactive/donation-epochs/) and [`donation-timeline`](interactive/donation-timeline/). All source workbooks and unmasked working documents remain excluded from the public Pages artifact.

## Adding or updating a dataset

1. **New dataset**: Create `interactive/data/<slug>/v1/` with the reviewed data (`.js` and/or `.json`) and a `README.md` documenting source, schema, units, and privacy masking. Add directory frontmatter for `<slug>/` and `v1/`.
2. **Breaking schema changes**: Create a new version directory (`v2/`, etc.) alongside `v1/`. Retain earlier versions until all published reports migrating to the new schema are deployed and validated.
3. **Validation**: Test locally with `bash scripts/build-pages.sh <output-dir> && node scripts/check-pages.mjs <output-dir>` before pushing.
