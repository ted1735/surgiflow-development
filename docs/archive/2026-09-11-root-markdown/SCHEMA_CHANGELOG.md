# SurgiFlow Schema Change Log

## Versioning Policy & Guidelines
- **Major / Large Change**: Increment minor version by `+0.1` (e.g., `3.0.x` -> `3.1.0`).
- **Minor Change / Polish**: Increment patch version by `+0.01` (e.g., `3.0.4` -> `3.0.5`).
- **Synchronization Requirement**: The version number must be updated consistently across:
  1. `package.json` (`version`)
  2. `server.ts` (`/api/health` response object)
  3. `src/App.tsx` (Top navigation brand header badge)
  4. `SCHEMA_CHANGELOG.md`

---

## v3.1.4 — Unified 49-Column Epic Master Ingestion & Alias Expansion (2026-09-01)
- **Unified Master Workbook Support**: Verified the 49-column `SURGIFLOW_Master_Cardiac_Hospital_2026v1` report containing all clinical labs (`Last HGB (24h)`, `Creatinine`, `Last K+`, `Magnesium`), weights (`Admit Weight`, `Last Weight`), GMLOS, and DRG metrics.
- **Roster Ingestion Aliases**: Added comprehensive column header aliases in `ccoipRouter.ts` supporting `Last HGB (24h)`, `Creatinine2`, `Weight Doc/Date`, and `Working DRG Name`.
- **System Version Bump**: Incremented codebase to `v3.1.4` across package manifest, server health endpoint, and dynamic UI badges.

## v3.1.3 — Master Epic Report Column Specification Published (2026-09-01)
- **Report Specification**: Published [`MASTER_EPIC_REPORT_COLUMN_SPECIFICATION.md`](file:///e:/servers/Surgiflow-RCC-Standalone-/MASTER_EPIC_REPORT_COLUMN_SPECIFICATION.md) defining the 8 lab/weight columns needed to unify Epic Reporting Workbench exports into a single 49-column daily roster.
- **Version Bump**: Incremented codebase to `v3.1.3` across package manifest, server health endpoint, and dynamic UI badges.

## v3.1.2 — Footer Modernization & Dynamically Mirrored Version / Build Timestamp (2026-09-01)
- **Footer Text Update**: Replaced legacy footer text with bold clinical banner: **"Built For The Bedside"**.
- **Mirrored Versioning**: Dynamically linked the footer release badge directly to `APP_VERSION` (`v3.1.2`) mirroring the top navigation brand header.
- **Build Timestamp Synchronization**: Added `APP_LAST_UPDATED` (`2026-09-01 08:22 EDT`) displaying the timestamp of the latest build across the app footer.
- **System Version Bump**: Updated `package.json`, `server.ts` (`/api/health`), `src/App.tsx`, and release documentation to `v3.1.2`.

## v3.1.1 — Definitive Census Room Displacement Engine & Historical Archiving (2026-09-01)
- **Version Increment**: Updated to `v3.1.1` across `package.json`, `server.ts` (`/api/health`), `src/App.tsx` (brand header), and release documentation.
- **Definitive Census Room Displacement**: When uploading the Epic `appts` sheet, incoming room occupants replace any existing patient in that bed as the ground truth.
- **Automated Historical Archive**: Displaced previous occupants are automatically archived with `"Room Transfer / Discharged"` disposition and stored in the **Historical database / Archived patients** section.
- **Active Roster Reconciliation**: Stale active encounters not present in the definitive upload are automatically marked inactive (`is_current_admission = 0`).

## v3.1.0 — Clinical Labs, Report Import Display Architecture & Complete SharePoint Expansion (2026-09-01)
- **Version Increment**: Updated to `v3.1.0` across `package.json`, `server.ts` (`/api/health`), `src/App.tsx` (brand header), and all documentation.
- **Clinical Labs Integration**: Provisioned and rendered clinical labs in the exact clinical sequence (`Hgb`, `Create`, `K+`, `Mg+`) in both the Patient Form header bar and the Director Overview modal.
- **Display-Only Data Security**: Configured imported lab, echo, and clinical parameters as read-only, preventing accidental overrides during multidisciplinary bedside huddles.
- **Live Schema Expansion to 260 Columns**: Integrated 18 bedside/consult gap fields and 7 clinical lab/echo metrics (`Lab_Hemoglobin`, `Lab_Creatinine`, `Lab_Potassium`, `Lab_Magnesium`, `Echo_LVEF`, `WorkingDRG`, `OSARisk`).
- **Census Deduplication**: Enforced composite key deduplication across all 4 inpatient units (`GT8`, `GT7`, `GT6`, `WT8`).
- **Footer Polish**: Removed legacy marketing text from the bottom footer.

## v3.0.5 — COIP Dedicated Schema, Lazy-Load Splitting & Master Field Gap Analysis
- Incremented system release to `v3.0.5` across server health endpoint, top header badge, and package manifest.
- Published `/SURGIFLOW_SHAREPOINT_FIELD_MAP_AND_GAP_ANALYSIS.md` cross-referencing Master schema against live UI fields with all missing gap fields.
- Published `/SF_COIP_SHAREPOINT_LIST_SCHEMA.md` with complete 30-column 2nd list schema, PnP PowerShell script, and Power Automate webhook payload.
- Implemented `React.lazy` code-splitting and `Suspense` for CCOIP modals to eliminate initial dashboard load overhead.
- Added user-selected pagination options (`15`, `30`, `50`, `100`, `Show All`) to the CCOIP surveillance dashboard.

## v.alpha-4.00 — Huddle workflow and compact header refinement

- Added field-level leadership action entry to the two-column Patient Summary, including safe next/previous-patient navigation.
- Reworked the sticky patient context to mirror dashboard risk, barrier, leadership, infusion, and Tubes & Drains indicators.
- Replaced ambiguous critical-gap display with distinct Critical Blockers and All Unresolved views.
- Retired redundant checklist risk-context, pathway-summary, and manual-save controls; retained the SQLite micro-save workflow.

## v.alpha-3.50 — Huddle dashboard and risk-alignment preparation

- Added `ReadmissionRiskPct` as the numeric source for Low, Medium, and High readmission-risk status.
- Reconciled Service Line choices and added VAD, Plastics, Ortho, Onc, and OFF.
- Defined risk bands: Low 0–12%, Medium 13–22%, High >22%.

## v.alpha-3.00 — Concurrent clinical documentation protection

- Replaced full-draft autosaves with versioned, leaf-field patches.
- SQLite now merges unrelated concurrent changes automatically.
- A same-field collision preserves the user’s in-progress entry and presents **Keep mine** or **Use latest**; no automatic refresh or loss of work.
- Added per-field version tracking to retain the SQLite-to-SharePoint/SQL migration boundary.

## v.alpha-2.50 — Local SQLite live-data alignment

- SQLite is the active local data source; SharePoint is retained for a future, explicit integration phase.
- `ChestTube` display title changed to **Tubes & Drains** while retaining its internal name for SharePoint compatibility.
- Added `Hemovac` and `Pacer Wires` to the `ChestTube` multi-select choices.
- Added `TubesDrainsOutput24hMl` as a Number field for total output in mL per 24 hours.
- Added `TubesDrainsNotes` as a Note field.
- Added structured IV Lasix and IV Steroids frequency/transition fields.
- Mentation UI now uses the live schema choices exactly.

Every future UI/data change must update:

1. `schemas/SF Master Live Data Fields and Choices.json`
2. `schemas/SurgiFlow_Master_Dashboard_v6_Field_Map.json`
3. `src/storage/sharePointSchema.ts`
4. This change log
