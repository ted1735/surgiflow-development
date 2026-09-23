# SurgiFlow Browser Annotation Log

## 2026-09-15 — Dashboard, COIP, and deep-dive observations

This log records user-authored browser annotations. It intentionally excludes patient names, clinical narratives, identifiers, and screenshot page content.

| ID | Area | Requested behavior / observed issue | Status |
| --- | --- | --- | --- |
| 1 | Patient header → Dashboard | Any invasive-tube indicator in the patient header should contribute to the dashboard Invasive Tubes metric. | Built in v3.4.2; live smoke test pending |
| 2 | Dashboard | Invasive Tubes metric should link to its source patients. | Built in v3.4.2; live smoke test pending |
| 3 | Dashboard | Active Infusions metric is not linked to source patient-form/list data. | Existing field link confirmed; live smoke test pending |
| 4 | Patient header | Drip indicator represents active IV drips. | Reference |
| 5 | Patient form | Active IV Drips is the source form field for the dashboard metric. | Reference |
| 6 | Dashboard | Active Infusions metric should count/link active IV drips. | Existing field link confirmed; live smoke test pending |
| 7 | Patient header | Core-pathway indicators should appear in the dashboard metric. | Existing shared pathway data path confirmed; live smoke test pending |
| 8 | Dashboard | Core Pathways metric is not linked to source pathway data. | Existing shared pathway data path confirmed; live smoke test pending |
| 9 | Main dashboard table | Split available care-profile space to add an Invasive Tubes column linked to the header indicator. | Built in v3.4.2; live smoke test pending |
| 10 | Main dashboard table | Reuse the tube pill indicator in the new Invasive Tubes column. | Built in v3.4.2; live smoke test pending |
| 11 | COIP dashboard | 12-Month/MVP admissions is not displaying correctly. | Built in v3.4.2; requires provision then roster import |
| 12 | JADE/CHF deep dive | Deep dive opens full-screen without usable navigation/scrolling; top content is cut off. | Built in v3.4.2; live smoke test pending |
| 13 | JADE/CHF deep dive | Header is cut off in the deep-dive modal. | Built in v3.4.2; live smoke test pending |

## 2026-09-15 — COIP dashboard functional requests

| ID | Area | Requested behavior / observed issue | Status |
| --- | --- | --- | --- |
| 14 | COIP Active Census card | Card should be clickable and filter registry to currently admitted patients; support ranking/screening by 12-month visits, risk, and fastest return days. | Card/filter live-tested; v3.4.4 adds four-PCU room scope after live count discrepancy |
| 15 | COIP 30-Day Returns | Must show true currently admitted 30-day returns; current count of zero is not credible against the reported active census. | Built in v3.4.2; source history coverage must be smoke tested |
| 16 | COIP High Risk | Must show only currently admitted high-risk patients and filter to them on click. | Built in v3.4.2; live smoke test pending |

## Implementation rule

Before marking an item complete, verify the source field, SharePoint type, visible metric/filter behavior, and one non-PHI smoke-test result. Update this log with the build version and verification outcome.

## 2026-09-15 — Live smoke-test checkpoint

- **Confirmed in v3.4.3:** package is active; main dashboard four-PCU census renders; Invasive Tubes column renders and links; COIP loads after the schema-tolerant read repair; Active Census click/filter works; 12-Mo Admissions sort control exists; Patient Story and CHF deep dive open with a usable Close control.
- **Found and repaired for v3.4.4:** COIP active-authority logic also requires physical 68xx/78xx/88xx/89xx room scope. The live v3.4.3 count of 230 is therefore not accepted as the final four-PCU metric.
- **Still requires live action:** upload v3.4.4, run the provisioning script for `MVP Admissions 12M`, perform a complete roster import, then retest 12-month values and 30-day returns.

## 2026-09-15 — v3.4.4 final live smoke-test results

- **Passed:** v3.4.4 is active; COIP Active Census reports 152 and its click filter shows 152; High Risk reports 52 current encounters; import history shows the 9/15 roster and 9/14 CNS batches with explicit EDT timestamps.
- **Passed:** main dashboard remains four-PCU scoped; the Invasive Tubes metric and dedicated table column render source-linked values; Patient Story/CHF deep dive navigation remains usable.
- **Pending data/provisioning:** 12-month values remain blank until `MVP Admissions 12M` is provisioned and repopulated by roster import. 30-day remains 0 because this smoke test did not expose a qualifying prior-discharge/revisit pair. CNS narrative completeness, lab values, duplicate-file blocking, and conflict-toast behavior require controlled source-file test runs.

## 2026-09-16 — v3.4.5 live verification and census cleanup boundary

| ID | Area | Requested behavior / observed issue | Status |
| --- | --- | --- | --- |
| 17 | Clinical quick view, dark mode | Entered narrative text must remain readable in dark mode and use a dark text color in light mode. | **Verified in deployed v3.4.5:** five live modal textareas expose explicit light-mode dark text and dark-mode light text classes; visual confirmation remains dependent on the user's active theme. |

- **Passed live:** v3.4.5 is deployed; the main dashboard reports `Showing 289 of 289 Patients`; the four-PCU room scope is GT6 77, GT7 76, GT8 75, and WT8 61; the Invasive Tubes column is present; the quick-view modal opens below the SharePoint header.
- **Read-only scope verification:** the Master list contains 509 records total, 360 marked `Census Presence = In Census`, and 149 marked `Out of Cardiac Census`. Exactly 289 records match both the four PCU room ranges and `Census Presence = In Census`.
- **Cleanup not executed:** SharePoint's modern list control exposed only 30 visible rows for bulk selection, so no deletion was issued. The intended cleanup target remains only those exact 289 current PCU records; historical/out-of-census records and the 71 other in-census records remain protected.

## 2026-09-16 — Discharge/archive workflow diagnosis

| ID | Area | Requested behavior / observed issue | Status |
| --- | --- | --- | --- |
| 18 | Discharge / Archive | Clicking the discharge action leaves the dialog open and reports that live SharePoint is read-only. | **Root cause confirmed:** `src/App.tsx` currently defines `isSharePointReadOnly` as `Boolean(patientService)`, which reverses the live-mode condition and blocks `archiveActivePatient` before any SharePoint write. Fix and live archive verification remain pending. |

## 2026-09-16 — Live SharePoint schema export

| ID | Area | Requested deliverable | Status |
| --- | --- | --- | --- |
| 19 | SurgiFlow / COIP schema | Complete JSON and CSV exports of the live SharePoint list and column schemas. | **Completed:** 13 visible custom lists, 1,542 fields, hidden/system fields retained within each list, and field-level metadata plus `SchemaXml` exported to `docs/SurgiFlow_SharePoint_Schema.json` and `docs/SurgiFlow_SharePoint_Schema.csv`. |
