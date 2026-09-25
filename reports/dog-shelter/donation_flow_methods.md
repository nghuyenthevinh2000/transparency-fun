# Interactive Donation Flow Infographics: Two Implementation Methods

This document defines two distinct, complementary architectural methods to explore and interact with the **Transparency Fund (2024–2026)** dataset (`Danh sách hỗ trợ foster SG (2024-2026).xlsx`).

Both methods visualize the flow of **122,580,000 VND** from **22 masked benefactors** through bulk pet nutrition procurement down to **42 masked foster groups** across 11 Saigon districts, but they approach the **Time** dimension from different interaction paradigms.

---

## High-Level Comparison

| Dimension | Method 1: Time Epoch Column | Method 2: Playable Timeline Bar |
|---|---|---|
| **Core Concept** | Time is a **first-class structural stage** in the flow | Time is an **interactive controller** that morphs a 4-stage flow |
| **Visual Architecture** | 5-stage Sankey column layout | 4-stage Sankey with top/bottom playback scrubber |
| **Primary Interaction** | Node-based filtering & multi-branch path tracing | Chronological scrubbing, step-by-step playback (▶ Play/Pause) |
| **Strength** | Immediate visual comparison of years & batches at a glance | Dynamic storytelling; illustrates rhythm and growth over time |
| **Canvas Budget** | 1280 × 720 (16:9 Landscape) | 1280 × 720 (16:9 Landscape) |

---

## Method 1: The 5-Stage "Time Epoch" Sankey Architecture

### 1. Conceptual Structure
In this method, time is embedded directly into the flow as the opening column. Every dollar must flow through an epoch before reaching the benefactors, fund pool, supplies, and recipients.

```text
[STAGE 1: TIME EPOCHS] ──> [STAGE 2: BENEFACTORS] ──> [STAGE 3: CENTRAL FUND] ──> [STAGE 4: PROVISIONS] ──> [STAGE 5: FOSTER GROUPS]
  • 2024 (9 Cycles)           • Tâm An (45M)              • Disbursed: 104.5M         • Dry Kibble (82%)        • Q1 Hub (5 fosters)
  • 2025 (8 Cycles)           • Diệu Trinh (24.4M)        • Admin Bù: 5.18M           • Wet Food / Pate (18%)   • Q5 & Q10 Hub (8)
  • 2026 (5 Cycles)           • Phanxicô Hoàng (17.6M)    • Reserve Balance: 18.1M    • Direct Pet Gifts        • Outer Districts (29)
  • All Cycles (Aggregate)    • +19 Other Benefactors     • Free Shipping Subsidy                                (100% Photo Proof)
```

### 2. End-User Interactions

1. **Epoch Node Selection (Filtering & Slice Isolation)**:
   * Clicking a year (`2024`, `2025`, or `2026`) filters the downstream diagram:
     * Only benefactors who donated in that year remain fully opaque.
     * Central Fund reflects that year's disbursemnt and admin top-ups.
     * Provisions and foster recipients adjust to show only what was distributed during that year.
   * Selecting **"All Cycles (2024–2026)"** restores the cumulative total (122.58M VND).
2. **Cycle Deep-Dive (Sub-Pill Expansion)**:
   * Hovering or clicking an expand chevron on any year exposes individual batch tags (`T02/2024`, `T03/2024`, ..., `T06/2026`).
   * Clicking a batch (e.g. `T04/2026`) isolates that exact distribution cycle (showing the 5.1M VND from fund, 150K VND admin top-up, delivery subsidy by *Phêrô Nguyễn*, and the 16 specific foster recipients).
3. **Multi-Node Path Highlighting (Bi-Directional Tracing)**:
   * Hovering on any Foster Group (e.g., *Ngoại Tịnh Tâm* in Q1) traces backwards across the ribbons to show: which provisions they received, what fund supported them, and which benefactors funded that cycle.
   * Hovering on a Benefactor (e.g., *Tâm An*) illuminates all downstream paths funded by their donations.
4. **Detail Inspector Drawer (Bottom Panel)**:
   * Displays the audited details for the active selection:
     * **Benefactor detail**: Dates of contribution, total amount, share of total fund.
     * **Provision detail**: Exact brands (Catta 18kg, Tony 24kg, Licious 20kg, Wow 85g), unit prices, and quantities.
     * **Foster detail**: District, shelter contact alias, number of portions, special dietary notes (e.g., *"đổi hạt thành pate cho mèo già"*), and Drive photo STT verification.

### 3. Canvas & Layout Allocation (1280 × 720 px)

* **Width Partitioning (1280 px)**:
  * Stage 1 (Time Epochs): `160 px`
  * Stage 2 (Benefactors): `240 px`
  * Stage 3 (Fund Pool): `220 px`
  * Stage 4 (Provisions): `220 px`
  * Stage 5 (Foster Groups & Districts): `340 px`
  * Gaps & Margins: `100 px` total
* **Vertical Height Budget (720 px)**:
  * `Y: 000 – 090` (90px): Header, title, and 3 global KPI cards.
  * `Y: 090 – 500` (410px): 5-column interactive Sankey canvas with SVG connectors.
  * `Y: 500 – 660` (160px): Dual-card interactive inspector drawer.
  * `Y: 660 – 720` (60px): Data audit footer & transparency verification badge.

---

## Method 2: Synchronized Interactive Timeline Bar (Playable Chronological Flow)

### 1. Conceptual Structure
In this method, the main stage retains a clean **4-stage spatial layout** (`Benefactors ──> Fund ──> Provisions ──> Foster Care`), while time is controlled by a dedicated **interactive timeline scrubber and playback engine** anchored at the header/footer.

```text
[TIMELINE SCRUBBER / PLAYBAR: Feb 2024 ══════════════●═══════════════ Jun 2026] [▶ Play] [⏸ Pause] [Speed: 1x/2x]
                                             │
                                             ▼
[STAGE 1: BENEFACTORS] ──────> [STAGE 2: FUND POOL] ──────> [STAGE 3: PROVISIONS] ──────> [STAGE 4: FOSTER CARE]
(Active donors in period)       (Monthly deployment + top-up)  (Bags of kibble & pate)    (Active recipients)
```

### 2. End-User Interactions

1. **Chronological Playback (Story Mode)**:
   * Clicking **▶ Play** initiates an animated month-by-month walk through the 22 distribution cycles.
   * The scrubber marker advances along the timeline bar (`T02/2024` → `T03/2024` → ... → `T06/2026`).
   * At each month step:
     * The flow ribbons dynamically scale and pulse to reflect that month's incoming funds and disbursements.
     * Special event callouts appear (e.g., *"Tháng 09/2024: MTQ Thiện Tâm tài trợ 20kg hạt Maxime"*; *"Tháng 08/2025: MTQ Diệu Khiết tặng 54 lon pate 400g"*; *"Mỗi tháng: MTQ Phêrô Nguyễn tài trợ 100% phí ship"*).
     * The foster recipient list highlights which shelters received care packages in that cycle.
2. **Manual Timeline Scrubbing & Stepping**:
   * Dragging the timeline handle or clicking any month pip immediately seeks to that date.
   * Prev (`◄`) and Next (`►`) keyboard/click controls allow fine-grained step navigation.
3. **Cumulative vs. Discrete Month Toggle**:
   * **Discrete Month View**: Shows only what happened in the selected monthly cycle.
   * **Cumulative Growth View**: Watch the fund accumulate from 0 to 122.58M VND, showing the running total of food delivered (thousands of kilograms of dry kibble and thousands of cans of pate).
4. **District Filter & Search Sync**:
   * Users can click a district pill (`Quận 1`, `Bình Thạnh`, `Tân Bình`, etc.) while playing or scrubbing; only shelters in that district will be highlighted across all chronological cycles.

### 3. Canvas & Layout Allocation (1280 × 720 px)

* **Width Partitioning (1280 px)**:
  * Stage 1 (Benefactors): `260 px`
  * Stage 2 (Fund Pool & Top-ups): `240 px`
  * Stage 3 (Provisions & Supplies): `260 px`
  * Stage 4 (Foster Shelters & Districts): `380 px`
  * Gaps & Margins: `140 px` total
* **Vertical Height Budget (720 px)**:
  * `Y: 000 – 080` (80px): Title, global totals, and Cumulative/Discrete mode toggle.
  * `Y: 080 – 140` (60px): Interactive Playable Timeline Bar with play/pause, scrub track, and 22 monthly pips.
  * `Y: 140 – 540` (400px): 4-column dynamic flow stage with animated ribbons and milestone callout tags.
  * `Y: 540 – 670` (130px): Monthly batch summary card (itemized invoice & delivery verification).
  * `Y: 670 – 720` (50px): Footer, playback keyboard shortcut hint (`Space` to play/pause, `←/→` to scrub), and audit note.

---

## Data Model & Schema (Shared by Both Methods)

Both implementations consume a standardized, masked JSON structure derived from `Danh sách hỗ trợ foster SG (2024-2026).xlsx`:

```json
{
  "summary": {
    "total_income": 122580000,
    "total_disbursed": 104500000,
    "total_admin_topup": 5182000,
    "total_cycles": 22,
    "unique_donors": 22,
    "unique_fosters": 42
  },
  "donors": [
    { "id": "d1", "name": "Tâm An", "tradition": "Buddhism", "total_donated": 45000000, "count": 44 },
    { "id": "d2", "name": "Diệu Trinh", "tradition": "Buddhism", "total_donated": 24400000, "count": 29 },
    { "id": "d3", "name": "Phanxicô Hoàng", "tradition": "Catholic", "total_donated": 17600000, "count": 23 },
    { "id": "d4", "name": "Diệu Khiết", "tradition": "Buddhism", "total_donated": 10600000, "count": 13 },
    { "id": "d5", "name": "Diệu Thiện", "tradition": "Buddhism", "total_donated": 8000000, "count": 3 }
  ],
  "cycles": [
    {
      "code": "042026",
      "month": "T4/2026",
      "year": 2026,
      "used_from_fund": 5100000,
      "admin_topup": 150000,
      "supplies": [
        { "name": "Hạt Licious 20kg", "qty": "6 tải", "total_cost": 4470000 },
        { "name": "Pate Chaozol 85gr", "qty": "200 lon", "total_cost": 780000 }
      ],
      "sponsor_notes": "Phêrô Nguyễn hỗ trợ tiền ship",
      "fosters_served": 16,
      "fosters": [
        { "name": "cô Diệu Hoa", "district": "Q1", "portions": 1, "drive_stt": 1 },
        { "name": "chị Phúc An", "district": "Q10", "portions": 1, "note": "đổi hạt thành pate", "drive_stt": 7 }
      ]
    }
  ]
}
```

---

## Authoring Roadmap

1. **Step 1 — Data Compilation**: Compile `Danh sách hỗ trợ foster SG (2024-2026).xlsx` into a clean, embedded JSON data object.
2. **Step 2 — Method 1 Build (`flow_epoch_infographic.html`)**:
   * Implement 5-column Sankey layout using `blue-professional` design tokens.
   * Add column-level filtering and bidirectional ribbon highlighting.
3. **Step 3 — Method 2 Build (`flow_timeline_infographic.html`)**:
   * Implement 4-column flow with the animated chronological scrubber and play/pause timeline engine.
4. **Step 4 — High-DPI Verification**:
   * Capture 2x Retina screenshots for both visuals to verify zero-overflow and crisp 1280 × 720 px rendering.
