# COIP SharePoint List Topology Audit — 2026-09-11

## Scope and method

This is a signed-in, read-only audit of the COIP lists on the active SurgiFlow SharePoint site, paired with a source review of the deployed SPFx project. No lists, fields, indexes, records, package files, or application settings were changed.

The audit deliberately excludes patient-level content. Item counts are operational metadata only.

## Verified live inventory

| List | Item count at inspection | Intended function | Active SPFx connection | Status |
|---|---:|---|---|---|
| `SurgiFlow Master` | 145 | Patient registry and bedside form | `PnPPatientDataService` reads and patches individual fields with ETag protection. | **Connected** |
| `SurgiFlow COIP Reviews` | 1 | COIP review records displayed by the dashboard | `PnPCoipReviewService` reads items through PnP. The deployed service is read-only. | **Connected, read-only** |
| `SurgiFlow COIP Encounters` | 6 | Encounter-level registry for COIP imports/reconciliation | `PnPCoipRegistryService` registers, updates, restores, and archives encounter state. | **Connected in v3.3.28 candidate** |
| `SurgiFlow COIP Import Batches` | 1 | Import-run provenance and reconciliation summary | `PnPCoipRegistryService` records explicit import status/counts. | **Connected in v3.3.28 candidate** |
| `SurgiFlow COIP Encounter Snapshots` | 6 | Imported source-row snapshot retention | `PnPCoipRegistryService` records import and final Master snapshots. | **Connected in v3.3.28 candidate** |
| `SurgiFlow COIP Source Captures` | 0 | Source-system capture and supersession record | `PnPCoipRegistryService` writes deliberate user captures. | **Connected in v3.3.28 candidate** |
| `SurgiFlow COIP Audit Events` | 1 | Event-level audit trail | `PnPCoipRegistryService` records import, encounter, review, risk, and action events. | **Connected in v3.3.28 candidate** |

## Support-list field signatures

| List | Verified custom fields relevant to its purpose |
|---|---|
| COIP Encounters | MRN, Encounter CSN, Index CSN, Admit Date, Discharge Date, Unit, Room Number (**Text**, despite the display name), Service Line, Primary Diagnosis, Disposition, Is Current Admission, Source Modified At, Content Hash, Review Key |
| COIP Import Batches | Source Type, File Name, Imported At, Imported By, Records Seen, Records Created, Records Updated, Records Unchanged, Records Skipped, Reconcile Active Census, Import Status, Validation Notes |
| COIP Encounter Snapshots | Encounter CSN, MRN, Import Batch ID, Source Sheet, Source Row Number, Imported At, Raw Data JSON, Content Hash |
| COIP Source Captures | Encounter CSN, MRN, Import Batch ID, Source Type, Source System, Source Date Time, Captured At, Captured By, External Record Key, Content Hash, Source Version, Original Content, Superseded |
| COIP Audit Events | Event Type, Entity Type, Entity Key, Import Batch ID, Actor, Occurred At, Details |

Every support list retains SharePoint's required `Title` field. No custom field was indexed or marked unique at inspection. The lists use textual MRN/CSN values and numeric Import Batch IDs; they do not enforce parent-child relationships with SharePoint lookup fields.

The 2026-09-11 signed-in metadata recheck confirmed `SurgiFlow COIP Encounters.Room_x0020_Number` is Text. It must not be confused with the Number-typed room field on `SurgiFlow COIP Reviews`.

## Runtime connection trace

- `src/webparts/surgiflow/components/SurgiflowRoot.tsx` constructs `PnPPatientDataService`, `PnPCoipReviewService`, and `PnPCoipRegistryService` using the signed-in SPFx context.
- `PnPCoipReviewService` reads the existing review list; `PnPCoipRegistryService` owns explicit support-list writes.
- `PnPPatientDataService.reconcileConfirmedDailyCensus()` coordinates current-census Master updates with COIP registration and discharge archives.
- Relative `/api/ccoip/*` routes are no longer the production SPFx data path for these controls.
- The source-level connection and package build must still be followed by a signed-in post-deployment smoke test.

## Governance and operational findings

1. The support lists are connected through SharePoint-native PnP services in the v3.3.28 deployment candidate.
2. `SurgiFlow COIP Reviews` remains read-only; the five support lists receive only deliberate commits.
3. `SurgiFlow COIP Reviews` has duplicate narrative display names with different internal fields. Preserve both until record use and source mapping are audited.
4. No COIP micro-save behavior is used. Import, capture, review, risk, and action writes remain explicit user actions.
5. Source validation or any SharePoint failure prevents automatic absent-record discharge.

## Implemented architecture

The v3.3.28 candidate uses the SharePoint-native COIP workflow. SharePoint remains the governed data store, user permissions flow through the SPFx context, `Title` is supplied on every created item, CSN is the encounter identity, MRN connects longitudinal encounters, and import/snapshot/audit records preserve provenance.

## Master-skill session rule

At the start and finish of each development session, check the seven lists above, classify each as connected, read-only, or legacy, and compare the result to `SURGIFLOW_SHAREPOINT_LIST_SCHEMA.md`. Run `npm run audit:contracts` before packaging. Never call a new package production-ready until a signed-in post-deployment PnP smoke test succeeds.
