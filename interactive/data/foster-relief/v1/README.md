---
name: v1
summary: Reviewed browser-ready dataset of Saigon cat foster relief (2024–2026), covering 22 cycles, 122.58M VND, 22 benefactors, and 42 foster groups.
tags:
- foster-relief
- public-data
- v1
- dataset
submodules:
  foster_data.js: ES module exporting FOSTER_DATA object for interactive reports.
  foster_data.json: Canonical JSON dataset representing reviewed records.
---

# Foster-relief dataset v1

Reviewed public dataset powering interactive reports including [`donation-epochs`](../../donation-epochs/) and [`donation-timeline`](../../donation-timeline/).

## Provenance and scope

- **Source workbook**: Derived from local spreadsheet `Danh sách hỗ trợ foster SG (2024-2026).xlsx` kept privately in `reports/dog-shelter/`.
- **Date range**: February 2024 to June 2026 across 22 distribution cycles.
- **Totals**:
  - Total inflow: 122,580,000 VND
  - Total disbursed from fund: 113,170,000 VND
  - Total admin top-up: 6,975,000 VND
  - Total provision value delivered: 119,015,000 VND
  - Benefactors: 22 masked contributors across 144 contribution records
  - Foster groups: 42 recipients across 11 Saigon districts (318 disbursement events)

## Units

- **Currency**: Vietnamese Đồng (VND), integers.
- **Aid supplies**: Portions and packaging units (bags of dry food: 15kg, 18kg, 20kg, 24kg; wet food / pate: 85g pouches, 400g cans).

## Schema structure

Both `foster_data.js` and `foster_data.json` provide identical reviewed records structured as follows:

- **`metadata`**: Top-level summary counts, financial totals, and source reference.
- **`donors_summary`**: Benefactor dictionary keyed by masked alias containing `total_amount`, `count`, active `years`, and `in_kind` contributions.
- **`donors_records`**: 144 individual donation events with `year`, ISO `date`, masked `donor`, `amount` (VND), `in_kind` note, and `target_month`.
- **`fosters_summary`**: Recipient dictionary keyed by foster alias containing `district`, `total_portions`, `cycles_count`, and cycle labels.
- **`cycles`**: 22 chronological cycle objects with `code`, `label` (e.g. `T02/2024`), `year`, `month`, `used_fund`, `admin_topup`, `total_value`, `supplies` breakdown, and `fosters` distribution list with portion counts and photo proof STT references (`drive_stt`).

## Masking and privacy

- **Benefactors**: Real identities masked using Dharma names, Catholic baptismal names, or initials.
- **Foster shelters**: Personal names, phone numbers, and full street addresses stripped; district-level geolocation and public aliases retained for geographic analysis.
- **Verification**: Drive photo sequence indices (`drive_stt`) retained for auditability without exposing private storage links.
