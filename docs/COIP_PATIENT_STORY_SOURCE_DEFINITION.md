# COIP Patient Story: Source Definition and Clinical Review Rules

**Status:** Source definition and refactor plan only. No code, SharePoint list, or patient data was changed by creating this document.

**Prepared:** 2026-09-20

## Purpose

This document defines what SurgiFlow should mean by a **COIP Patient Story**, what qualifies as a complete CNS clinical review, and which source supplies each part of the result.

The Patient Story is a longitudinal clinical view. It is not the same thing as a single encounter, a single import row, or a clinical-review flag.

## Recommended definition

A Patient Story is available only when both conditions are true:

1. The patient has a qualifying CNS Clinical Review.
2. The patient has longitudinal encounter evidence involving at least two distinct encounters.

```text
PatientStoryAvailable =
  CompleteClinicalReview
  AND HasLongitudinalHistory
```

If either condition is false, the patient should remain visible in COIP with an explicit status, but should not be labeled as having a complete Patient Story.

## CNS Clinical Review definition

The canonical CNS source is the `CNS` worksheet in the Readmission Leader workbook. The clinical-review narrative is located in columns `BQ:CN`.

### Core narrative fields

These three fields are the minimum clinical-review requirement:

| Column | Source header | Requirement |
|---|---|---|
| BQ | Opportunities and Callouts | Required |
| BR | Clinical History | Required |
| BS | Hosp Course | Required |

The three fields are the clinical substance of the review. A review is not complete if any one of these three fields is blank, masked, or only a placeholder.

### Supplementary fields

Columns `BT:CN` are supplementary and should be preserved with the review. They include readmission risk, bucket, index unit, service line, huddle information, HF/Jade fields, and additional notes.

Supplementary values enrich the Patient Story but do not block the review from qualifying when the three core narrative fields are complete.

```text
ValidReviewText(value) =
  trimmed value is not blank
  AND value is not '-', '--', '—', 'N/A', 'Unknown', or 'Not documented'

CoreReviewComplete =
  ValidReviewText(BQ)
  AND ValidReviewText(BR)
  AND ValidReviewText(BS)
```

## Review identity and linkage

A CNS row can be included in the COIP review registry only when it can be safely attached to a patient encounter:

```text
ValidReviewIdentity =
  Patient Name is present
  AND Revisit MRN is numeric
  AND Revisit CSN is numeric
```

Blank or masked Revisit CSNs are intentionally excluded from clinical-review linkage. Index MRN or Index CSN must not be substituted as the Revisit identity. A missing Index CSN may remain visible as a linkage gap, but it must not cause a valid Revisit MRN/CSN review to be discarded.

```text
CompleteClinicalReview =
  ValidReviewIdentity
  AND CoreReviewComplete
```

Each review should be attached to its Revisit CSN. The Index CSN is the prior-encounter relationship when supplied or when resolved from the COIP encounter history.

## Longitudinal history definition

The story should use a distinct encounter set rather than counting rows or imports.

```text
EncounterSet = distinct valid CSNs from:
  - SurgiFlow COIP Encounters for the patient MRN
  - valid Index CSN/Revisit CSN relationships in the CNS source
  - historical discharge imports
  - completed daily-roster snapshots when they represent a distinct encounter

LongitudinalEncounterCount = count(EncounterSet)

HasLongitudinalHistory = LongitudinalEncounterCount >= 2
```

The same CSN appearing in multiple imports counts once. A new import version is not a new admission.

## Patient Story status model

The UI should use separate states rather than one overloaded `hasClinicalReview` flag.

| Status | Meaning |
|---|---|
| No clinical review | No qualifying CNS review is linked to the patient |
| Partial clinical review | A CNS row exists, but BQ, BR, or BS is incomplete |
| Reviewed single encounter | Core review is complete, but only one encounter is known |
| Longitudinal history, review pending | At least two encounters exist, but no complete CNS review is linked |
| Patient Story available | At least two encounters and a complete CNS review exist |

The first four states are not failures. They are honest data-availability states and should remain searchable and visible in COIP.

## What the Patient Story displays

The Patient Story should be a structured projection of source data:

1. **Current encounter:** current room, unit, admission date, acuity, risk, labs, drips, tubes, pathways, and active operational fields from the current Epic roster.
2. **Encounter timeline:** prior and current encounters, CSNs, admissions, discharges, dispositions, service lines, and days between encounters.
3. **CNS review episodes:** each qualifying review attached to its Revisit CSN, ordered by revisit admission date.
4. **Readmission context:** index encounter, revisit encounter, days to revisit, 30-day classification, general-readmission classification, and followed-core status.
5. **Supplementary clinical content:** risk, bucket, service line, huddle fields, and Jade/HF fields when present.
6. **Operational actions and barriers:** manual COIP actions, discharge barriers, readiness, and resolution history, clearly labeled as manual or operational data.
7. **Provenance:** source workbook, worksheet, import batch, source row, imported timestamp, and record version.

The system should not flatten every source into one untraceable paragraph. The story may include a concise summary, but the underlying timeline and source sections must remain inspectable.

## Source-of-truth boundaries

The CNS workbook is the source of truth for the imported CNS clinical-review narrative. It is not the source of truth for every COIP field.

| Data domain | Source of truth |
|---|---|
| Current admitted census | Epic daily roster |
| Current room and unit | Latest complete Epic daily roster |
| Historical discharges | Historical discharge workbook/import |
| CNS clinical narrative | Readmission Leader workbook, `CNS` worksheet, `BQ:CN` |
| Patient identity and encounter relationships | COIP identity/encounter registry, reconciled to source identities |
| Manual actions, barriers, and readiness | COIP manual workflow fields |
| Import versions and provenance | COIP source captures, snapshots, and import batches |

This means the workbook can be the single source of truth for CNS reviews without incorrectly replacing the Epic roster as the source of truth for current census.

## Verified source-workbook counts

The supplied workbook was checked using the `CNS` worksheet without changing it.

- Data rows: `2,242`
- Nonblank `BQ` rows: `1,026`
- Nonblank `BR` rows: `1,024`
- Nonblank `BS` rows: `1,023`
- Rows with all three core fields populated: `1,022`
- Rows with all three core fields plus Patient Name and numeric Revisit MRN/CSN: `221`
- Of those 221 linkable rows, all have at least one non-core value in `BT:CN`.
- `37` rows contain content specifically in the Jade/HF range `CF:CN`.

Therefore, the expected initial rebuild should distinguish:

```text
1,022 = core clinical-review-complete source rows
221   = core-complete rows safely linkable to a patient/revisit identity
37    = linkable rows with Jade/HF-column content specifically
```

The `1,022` number is a source-review count. It should not be presented as `1,022 Patient Stories` until the encounter-history rule is evaluated. A row without a valid Revisit identity cannot become a connected Patient Story, even when its narrative is clinically valuable.

## Current implementation gaps to resolve

The current code should be refactored before relying on Patient Story metrics:

- The server review workflow currently treats Jade notes as part of the core narrative and applies an additional structured-field completion threshold. That does not match the proposed BQ/BR/BS rule.
- The live SharePoint review mapper can set `hasClinicalReview` from a general flag or completed-field count without proving that BQ, BR, and BS are all valid.
- The live SharePoint patient-detail method returns encounter records in `history` but currently returns an empty `encounterHistory` array, while the Patient Story UI reads `encounterHistory`.
- The older parser has fallback behavior that can use Index identity or fabricate placeholder identities. That must be removed for CNS review linkage.
- A single Boolean should not represent review completeness, longitudinal history, story availability, or data provenance.

## Recommended rebuild approach

Because this is still development and the CNS workbook is the authoritative review source, a controlled rebuild is probably safer than manually repairing thousands of inconsistent SharePoint cells. It should not happen until the definitions are approved.

### Phase 1: Preserve and validate

1. Export or back up affected COIP lists and current import history.
2. Preserve raw source captures and any manual actions/barriers that should not be lost.
3. Run a dry-run import of the CNS worksheet only.
4. Produce projected counts for core-complete, identity-valid, duplicate, excluded, and supplement-bearing rows.

### Phase 2: Refactor the data model

1. Store BQ:CN as canonical review fields on the review record.
2. Store the original row payload and source metadata separately.
3. Key the review to numeric Revisit MRN/CSN.
4. Calculate core-review status independently from story status.
5. Build longitudinal encounter history from distinct CSNs.
6. Return the populated encounter history to the Patient Story UI.

### Phase 3: Controlled reset and reload

If the dry run reconciles correctly, purge and reseed only the affected source-derived records. Do not delete manual COIP actions, barriers, or readiness documentation unless explicitly approved.

Then reload the CNS worksheet and verify the expected counts before rebuilding dashboard metrics.

### Phase 4: Acceptance checks

- Every BQ/BR/BS-complete row is classified correctly.
- Blank or masked Revisit CSN rows are excluded from linkage and reported separately.
- No Index MRN/CSN substitution occurs.
- Duplicate CNS rows merge by Revisit MRN/CSN without losing nonblank supplementary values.
- A one-encounter patient is not labeled as having a Patient Story.
- A two-encounter patient without a complete CNS review is not labeled as having a Patient Story.
- A qualifying review plus two distinct encounters produces a Patient Story.
- The Patient Story timeline displays the actual encounter history.
- Every narrative and supplement can be traced back to its workbook, worksheet, row, and import batch.

## Decision requested before implementation

The proposed definition is:

```text
Complete Clinical Review = valid Revisit identity + valid BQ + valid BR + valid BS
Patient Story = Complete Clinical Review + at least two distinct encounters
```

The preferred next step is a dry-run/refactor audit against the CNS worksheet before any purge or SharePoint rewrite. No purge, re-upload, or code change is included in this document change.
