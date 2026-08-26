# SurgiFlow SPFx Migration Plan

## Executive Decision

- **Host:** SharePoint Framework (SPFx) web part on `https://ahsonline.sharepoint.com/teams/SurgiFlow`.
- **Primary data source:** Existing `SurgiFlow Master` SharePoint List.
- **UI:** Preserve the React three-tab experience: Overview, Patient Form, Readmission Checklist.
- **Authentication:** Current SharePoint/Entra user context; no separate login.
- **Backend:** None. Use PnPjs/SPFx context to access SharePoint directly.
- **AI:** Remove Gemini and all external AI transmission.
- **Power Automate:** Retain approved background ingestion/archive workflows only; do not send webhook URLs from the browser.

## Supported Baseline

- SPFx `1.23.2`
- Node.js `22`
- TypeScript `5.8`
- React `17.0.1` (required by SPFx 1.23.2; the standalone React 19 application must be adapted)
- PnPjs for SharePoint list reads and writes

## List Strategy

Keep one active patient list because the active census is approximately 200 records and fewer than 100 users. Do not retrieve all 224 business columns during census loading.

### Census Query

Retrieve only:

- `ID`
- `MRN`
- `CSN` (new indexed field; verify whether an equivalent already exists)
- `PatientName`
- `Room`
- `Unit`
- `ServiceLine`
- `EDD`
- `Status`
- `DCTODAY`
- `ClinicalNeeds`
- `NonClinicalDCBarriers`
- `Modified`

Filter to active records using indexed fields. Load the full selected patient record on demand and prefetch the adjacent patients.

### Required Indexes

- `CSN`
- `MRN`
- `Status`
- `Unit`
- `EDD`

### Encounter Identity

Use SharePoint `ID` for writes and use `MRN + CSN` for encounter matching. MRN alone is not an encounter identifier. If the existing list has no CSN-equivalent column, add:

| Display name  | Internal name |                Type | Required | Indexed |
| ------------- | ------------- | ------------------: | -------: | ------: |
| Encounter CSN | `CSN`         | Single line of text |      Yes |     Yes |

## Compatibility Aliases

Do not rename deployed SharePoint internal names. Preserve them and normalize in TypeScript.

| Existing internal name       | React/domain alias           | Reason                                |
| ---------------------------- | ---------------------------- | ------------------------------------- |
| `Name`                       | `legacyName`                 | Legacy duplicate of `PatientName`     |
| `PatientName`                | `patientName`                | System-of-record display name         |
| `PreOp`                      | `preOp`                      | Primary pre-op field                  |
| `preop2`                     | `legacyPreOp`                | Legacy duplicate                      |
| `OtherConsultantMiscSognoff` | `otherConsultantMiscSignoff` | Preserve deployed typo                |
| `DCTODAY`                    | `dcToday`                    | Normalize capitalization only in code |
| `FIN_NLReview_Date`          | `nurseLeaderReviewDate`      | Domain-friendly name                  |

## Autosave Design

1. Update React state immediately on user input.
2. Add only changed internal field names to the selected patient's dirty-field map.
3. Debounce saves for 750 milliseconds.
4. PATCH only dirty fields to the item by SharePoint `ID`.
5. Keep a per-patient serialized save queue so updates cannot arrive out of order.
6. Flush pending changes when the user selects another patient, while navigating immediately.
7. Display `Saving`, `Saved`, `Offline`, `Retrying`, or `Conflict` in the persistent header.
8. Retry HTTP 429/503 responses using `Retry-After` and bounded exponential backoff.
9. Retain unsaved changes in memory until SharePoint confirms success.
10. On ETag conflict, reload the server record and merge fields not changed locally; surface same-field conflicts.

## Three-Tab Data Behavior

### Overview

- Uses the lightweight census query and client-side derived metrics.
- Filters by the four cardiac units: GT6/CPPCU, GT7/Cardiac PCU, GT8/CVPCU, WT8/STPCU.
- Does not load checklist and long-note fields for all patients.

### Patient Form

- Loads the full selected SharePoint item on demand.
- Uses schema-driven field groups and conditional sections.
- Writes directly to the existing `SurgiFlow Master` item.
- Uses choice values exactly as deployed in SharePoint.

### Readmission Checklist

- Reads the same selected patient's values.
- Displays only applicable modules based on `CoreMeasures`, diagnoses, devices, A-Fib, and consult state.
- Treats required-but-blank answers as missing information, not as successful completion.
- Never returns 100% when zero applicable fields have been answered.

## Security Requirements

- Remove `server.ts` Gemini routes and `@google/genai`.
- Remove `/api/send-power-automate` and arbitrary URL forwarding.
- Remove all embedded patient records and presets from the source repository.
- Use synthetic, clearly labeled test fixtures only.
- Do not store PHI in `localStorage`, browser logs, telemetry payloads, or error messages.
- Rely on existing SharePoint site/list permissions and Entra authentication.
- Do not request tenant-wide deployment or application-only permissions.

## Deployment Scope

Package as a site-scoped SPFx solution. Request a site collection app catalog for the SurgiFlow site if one is not already enabled. The package should not use tenant-wide deployment and should request no Microsoft Graph API permissions.

## Delivery Sequence

### Section 1 - Containment

- Make the GitHub repository private.
- Remove PHI from the working tree and rewrite affected Git history.
- Remove Gemini and arbitrary webhook forwarding.
- Replace production-like fixtures with synthetic data.

### Section 2 - SPFx Foundation

- Scaffold SPFx 1.23.2 with React 17.0.1.
- Port the visual components without changing the user workflow.
- Add configurable site URL and list title properties.
- Add the typed PnPjs data service and domain adapters.

### Section 3 - Performance and Autosave

- Implement indexed lightweight census loading.
- Implement selected-patient lazy loading and adjacent prefetch.
- Implement dirty-field PATCH queue, debounce, retry, and conflict handling.
- Add persistent save-state indicators and navigation safeguards.

### Section 4 - Clinical Logic and Verification

- Correct blank-field scoring.
- Remove synthetic age generation and hard-coded current dates.
- Validate MRN + CSN encounter matching.
- Test choice, multi-choice, boolean, date, number, and multiline field serialization.
- Run build, lint, unit, integration, and rendered UI verification.

