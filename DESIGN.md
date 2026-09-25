# Transparency Fun design system

**Applies to:** the directory, every published interactive report, and every future interactive infographic in this project. **Chosen direction:** Open notebook. New topics may change the illustration and data visualization, but they should still feel like pages from the same collection.

The live references are the directory [`index.html`](./index.html), shared [`styles.css`](./styles.css), and shared [`infographic.css`](./infographic.css). This guide describes that shared system rather than any individual report. Keep it aligned with the shared styles whenever the design changes.

## The idea

Make transparency inviting and usable. A visitor should know what a report explains, which inputs they can change, what the output means, and where its numbers came from. The look is an **open editorial notebook**: warm paper, oversized serif headlines, small monospaced labels, ruled divisions, and a single vermilion signal color. It is playful without making the underlying information less clear.

### Motto and voice

**Transparency, made fun to explore.** Lead with openness and invite people to follow what they care passionately about. “Fun” means hands-on discovery, not making light of serious subject matter. “Explore” means visitors can inspect the steps, inputs, and evidence themselves. Use direct, curious language; keep claims grounded in each report's sources and assumptions. The project-wide verbal identity lives in [`brand/messaging.md`](./brand/messaging.md).

## Visual rules

| Role | Token / treatment | Use |
| --- | --- | --- |
| Page | `--paper: #f3f0e7` | Warm, uninterrupted background. |
| Primary text | `--ink: #202822` | Headlines, important values, strong rules. |
| Secondary text | `--muted: #586258` | Descriptions and methodological notes. |
| Dividers | `--line: #c6cbc1` | Consistent 1px rules, chart guides, row borders. |
| Signal | `--orange: #de5e3b` | Main action, active input, emphasized value or small marker. |
| Inset | `--sage: #e7eadf` | Control panels, featured surfaces, annotations. |

- Use **Georgia / Times New Roman** (`--serif`) for large display headings and prominent figures; regular weight, close tracking. Use **Arial / Helvetica** (`--sans`) for body copy and controls. Use **system monospace** (`--mono`) for numbers in the index, labels, assumptions, and small metadata. Keep labels uppercase and sparse; body text stays in sentence case.
- The site uses body text at `16px / 1.55`, metadata at roughly `11px` with `.07em` tracking, and fluid display type. Reuse the type tokens in `styles.css` instead of introducing a different font family for each report.
- Keep frames square, lines fine, and whitespace generous. Prefer flat color, editorial rules, and simple geometric diagrams to glossy cards, gradient backgrounds, stock imagery, decorative dashboards, or extra accent colors.
- The tilted featured cover and its offset vermilion shadow are a **single homepage focal treatment**. Do not repeat that effect on every report panel or chart. A report's diagrams may have their own shapes or muted supporting fills while retaining the shared ink, paper, rule, and signal language.

## Layout and page anatomy

- Keep content within `.wrap`: `1240px` maximum, `24px` outer gutters on desktop (`18px` on narrow screens). Sections have visible boundaries and room to breathe.
- Each standalone report page must include the same wordmark, navigation, directory back link, and footer as `index.html`. Use relative links that work when the report URL is opened directly.
- Directory cards have an index number, short subject label, distinct cover illustration, clear title, one-sentence description, and an **Open report** action. An unpublished slot says **Coming soon**, has no assigned topic, and is not a link.
- Published cards use the shared geometric cover by default. A report may instead set `cover: { src, alt }` in `interactive/index.js`; the same image appears on its directory card and when featured. Store the asset in the report's own folder and keep it within the Open notebook color system. The card and featured slot have **different aspect ratios** and crop the image with `object-fit: cover`: keep the focal subject near the center, keep essential text outside the image in the HTML, and check both crops at phone and desktop widths before publishing.
- A report begins with its number and subject, a plain-language question as its headline, and a short promise of what the visitor can explore. Follow with the interactive explanation, then its assumptions/method and useful next questions or sources.
- For interactive infographics, pair a **control or explanation zone** with a **visual/result zone** on wide screens. On phones, stack the introduction, controls, visualization, and method in reading order. Use the right visual form for the subject—flow, chart, comparison, timeline, map—without forcing every topic into the same diagram.
- Current responsive reference: the directory moves from three columns to two at `760px` and one at `520px`; report panels stack at `760px`. Keep the complete explanation readable at a narrow phone width without horizontal page scrolling.

### Standard infographic formats

Every report chooses **one canvas format** for its infographic: landscape **16:9** (a 1920 × 1080 design artboard) or portrait **9:16** (a 1080 × 1920 design artboard). These are aspect ratios, not fixed on-screen pixel dimensions. The surrounding report remains a responsive page; controls, citations, long labels, and explanations live **outside** the fixed-ratio canvas so they remain readable on phones.

Use the shared [`infographic.css`](./infographic.css) in the report HTML alongside `../../styles.css` and the report's own `styles.css`:

```html
<link rel="stylesheet" href="../../styles.css">
<link rel="stylesheet" href="../../infographic.css">
<link rel="stylesheet" href="styles.css">

<figure class="infographic-frame" data-format="16:9">
  <div class="infographic-canvas"><!-- report-specific visualization --></div>
  <figcaption>What the visual means, with source or illustrative status.</figcaption>
</figure>
```

Use `data-format="9:16"` for a portrait report. The shared frame preserves the ratio at any viewport width: landscape fills the content width up to `1240px`; portrait stays centered and no wider than `440px`. It scales down on phones without horizontal page overflow. Design compact, legible content **inside** a landscape canvas at phone width; place detailed tables or prose immediately below it. Adapt the report's own layout for portrait (for example, a vertical flow) rather than squeezing the landscape arrangement into a tall frame. Do not add a format switch to a report unless a separate product need calls for one.

## Interaction and data integrity

1. Every adjustable input needs a visible label, a displayed current value, and a direct relationship to the result. Prefer native controls when possible; keyboard interaction must work.
2. Update values and the explanation together when an input changes. State units, formula or calculation logic, and which assumptions are user-controlled. Do not use color as the only way to communicate a result.
3. Clearly distinguish **sourced facts**, **estimates**, and **illustrative examples**. Cite real datasets close to the claim (source, date, and scope); label hypothetical numbers as examples. Never imply that a model describes a specific organization when its data does not.
4. Give charts, flows, and visual marks a textual interpretation nearby. Provide meaningful headings, appropriate `label`/`output` relationships, keyboard-visible focus, legible contrast, and a readable reduced-motion state. Motion should help show a change, not obscure it.
5. Keep the interaction self-contained where possible. Do not turn future slots into dead links or show a clickable report before its page exists.

## Required report-folder contract

Every published interactive infographic/report has its **own folder**. The required files are:

```text
interactive/<report-name>/
├── README.md    # folder frontmatter and short explanation
├── index.html   # complete, directly loadable semantic page and report content
├── styles.css   # report-specific layout and visualization styles
└── script.js    # only the behavior and calculations for this report
```

`index.html` links to `../../styles.css`, `../../infographic.css`, **and** its sibling `styles.css`, and loads its sibling `script.js` as a module. It must contain the report content as HTML; `script.js` enhances that page instead of generating the entire page from a string. The directory links directly to the folder URL. A report must render its explanation and method even if its JavaScript fails; only its interactive output requires the script. Additional local assets or data may live inside that folder.

## Adding a report

1. Plan the subject, the question visitors can answer, the source or illustrative status of each number, the controls, the visualization, and the takeaway. For new page designs, show a project-specific preview and obtain approval before implementing, following the repository's web-design workflow.
2. Create `interactive/<report-name>/` with its own `README.md`, `index.html`, `styles.css`, and `script.js`. Choose 16:9 or 9:16 for its infographic frame. Build the full explanation in the HTML, report-specific visuals in its CSS, and interactions in its JS. Keep the approved palette and shared header/footer by importing the site CSS.
3. Add an entry with `number`, `category`, `title`, `description`, and `href: './interactive/<report-name>/'` to [`interactive/index.js`](./interactive/index.js). Reuse a future slot's number to replace it, or add a new number. The directory renders published cards from this registry.
4. Verify the home card, direct folder URL, input/output behavior, narrow and wide layouts, source/method copy, and keyboard access. Update each modified directory's `README.md` frontmatter. Update this document if the approved design system itself changes.

**Before publishing:** Does it look like Open notebook? Is the main question clear? Can visitors inspect the inputs and understand the result? Are factual claims sourced and illustrative values labeled? Does the module work at phone width and from the directory?
