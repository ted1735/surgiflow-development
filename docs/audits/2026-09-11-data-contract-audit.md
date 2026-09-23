# SurgiFlow Data Contract Audit — 2026-09-11

## Result

The v3.3.28 deployment candidate passes the automated contract audit against the signed-in live SharePoint metadata snapshot and the four supplied source workbooks.

- 7 live lists inspected read-only.
- 353 writable, non-system fields captured across those lists.
- 332 SharePoint field/type contracts checked: 254 bundled `SurgiFlow Master` fields plus 78 fields used by active Master/COIP ingestion payloads.
- 4 source workbooks and 16 required source-column contracts checked.
- 0 blocking mismatches remain in the automated audit.
- No patient-level values are stored in either audit artifact.

## Confirmed fixes

| Contract issue | Live authority | Source repair |
|---|---|---|
| COIP encounter room was sent as Number | `SurgiFlow COIP Encounters.Room_x0020_Number` is Text | Send normalized room text. |
| Master LOS was sent as Number | `SurgiFlow Master.LOS` is Text | Send trimmed LOS text. |
| Similar room fields have different types | COIP Reviews room is Number; COIP Encounters room is Text | Keep list-specific serializers. |
| Bundled Master schema contained stale friendly/internal names | Live metadata has SharePoint-generated internal names | Regenerated the bundled schema from the live snapshot and remapped existing fields. |
| Historical workbooks could lose source-specific context | Workbooks use Index/Revisit-prefixed columns | Added source-aware unit, LOS, GMLOS, admit-date, attending, disposition, and diagnosis aliases. |
| SharePoint Choice values could receive unsupported source text | Live Master Choice definitions are authoritative | Normalize service line, risk, disposition, unit, status, and census-presence writes. |

## Source workbook contracts

| Import mode | File / sheet | Encounter identity | Operational role |
|---|---|---|---|
| Epic Daily Roster | `SURGIFLOW_Master_Cardiac_Hospital_2026v1_20260911_0942.xlsx` / `appts` | MRN + CSN | Complete current-census authority; creates/updates/transfers/reactivates and, only after a fully successful commit, archives and discharges absent active encounters. |
| Readmission Leader | `Readmission Leader Workbookv41-8-21-2026.xlsx` / `CNS` | Revisit MRN + Revisit CSN | Longitudinal review import; does not reconcile active census. |
| Historical Discharges | `discharged2026-throughJune4th.xlsx` / `discharged` | Index MRN + Index CSN, with `CSN` accepted as the workbook's index encounter column | Historical encounter timeline; does not reconcile active census. |
| Process Metrics | `Process Metric Export years ALL.xlsx` / `Export` | Index MRN + Index CSN | Longitudinal process metrics; does not reconcile active census. |

The roster sample contained 151 data rows. CSN values are preserved from raw worksheet cells before SharePoint Number conversion, preventing display/scientific-format corruption. Identifiers longer than Excel's 15-digit numeric precision are a blocking audit finding.

## Live list inventory

| List | Items at inspection | Writable fields | v3.3.28 connection |
|---|---:|---:|---|
| SurgiFlow Master | 145 | 254 | Active PnP read, explicit import reconciliation, and ETag-protected field patches |
| SurgiFlow COIP Reviews | 1 | 40 | Read-only merge into dashboard/story view |
| SurgiFlow COIP Encounters | 6 | 15 | Active PnP encounter registration/update/archive |
| SurgiFlow COIP Import Batches | 1 | 13 | Active PnP import provenance/status |
| SurgiFlow COIP Encounter Snapshots | 6 | 9 | Active PnP immutable import/archive snapshots |
| SurgiFlow COIP Source Captures | 0 | 14 | Active PnP deliberate source capture |
| SurgiFlow COIP Audit Events | 1 | 8 | Active PnP review/risk/action/import audit events |

## Remaining schema gaps

Seven UI values have no matching writable live Master field and therefore remain excluded from SharePoint writes: `ReadmissionRiskPct`, `TubesDrainsOutput24hMl`, `TubesDrainsNotes`, `IVLasixFrequency`, `IVLasixTransition`, `IVSteroidsFrequency`, and `IVSteroidsTransition`.

This exclusion prevents invalid requests and save-loop toasts, but those values are not durable across devices until the corresponding SharePoint columns are explicitly approved, created, live-verified, and added to the bundled schema. No live fields were created or changed during this audit.

## Repeatable checks

```powershell
npm run sync:schema-snapshot
npm run audit:contracts
npm run build
```

`sync:schema-snapshot` refreshes the bundled Master schema from the checked-in, PHI-safe live metadata capture. A fresh signed-in SharePoint metadata capture must be obtained at session start and finish before that synchronization is treated as current.

## Evidence

- `docs/audits/2026-09-11-live-sharepoint-field-contract.json`
- `docs/audits/2026-09-11-source-workbook-field-contract.json`
- `scripts/audit_sharepoint_payload_contracts.cjs`
- `scripts/audit_source_workbook_contracts.py`
- `scripts/sync_sharepoint_schema_snapshot.cjs`

Deployment and a signed-in smoke test are still required before v3.3.28 can be called live-verified.
