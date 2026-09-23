# SurgiFlow Reports and Charge-Nurse Handoff: Data Sources Guide

**Purpose:** explain to frontline leaders what the Reports Hub displays, where each value comes from, and which fields are intentionally entered by the unit charge nurse.

## 1. The source-of-truth rule

In live SharePoint mode, the active census is read from the **SurgiFlow Master** list. The Reports Hub does not use demo census data when the live SharePoint service is active. If the live list cannot be read, the application reports the failure instead of silently substituting the local demo roster.

The active report population is roster-owned:

- the record is not discharged;
- the room resolves to one of the four PCU unit ranges; and
- `Census Presence` is `In Census`.

This keeps reports aligned with the most recent completed Epic daily-roster intake. ICU records remain available to the ADT movement logic, but they are not counted as the four-PCU active-census population.

## 2. Data flow

```text
Epic daily roster
        |
        v
COIP roster intake / reconciliation
        |
        v
SurgiFlow Master (SharePoint)
        |
        v
PnPPatientDataService
        |
        v
App floorPatients model
        |
        +--> Executive Reports
        +--> Custom Column Builder
        +--> Charge Nurse Handoff (EOSR)
        +--> Dashboard cards and patient form
```

The live service maps SharePoint internal names into the application model. Examples include `PatientName`, `MRN`, `CSN`, `Room`, `Unit`, `ServiceLine`, `AdmitDate`, `EDD`, `RiskLevel`, `LOS`, `GMLOS`, `CoreMeasures`, `Drip`, `ChestTube`, the four lab fields, bowel-movement fields, `SurgeryToday`, `Rhythm`, Foley presence, discharge-lounge status, and ride availability.

## 3. What the reports track

### Executive Reports

- **Today's Discharges & OR:** live EDD, live surgery/procedure flag, disposition, discharge lounge, and ride availability.
- **High Risk & Placements:** live risk classification and live disposition/barrier fields from the active census.
- **LOS / GMLOS Variance:** compares live LOS against live GMLOS. A missing GMLOS is left blank and is not replaced with a guessed benchmark.
- **Infusions & Tubes:** live continuous drips, chest tubes/drains, and rhythm when present in the Master record.

### Custom Column Builder

The builder uses the same active-census model and allows leaders to select, reorder, sort, filter, and export report columns. A blank cell means the source field was blank or is not part of the currently provisioned live Master schema. It is not a hidden default.

### Charge Nurse Handoff / EOSR

The handoff combines two visibly separated classes of information:

| Display treatment | Meaning | Examples |
|---|---|---|
| Green / **Live source** | Read-only aggregation of the current SharePoint census | active census, rooms with chest tubes, Foley rooms, procedures today, high-risk rooms |
| Amber / **Manual entry** | Charge-nurse operational information not supplied by the current Epic roster | staffing, floats, call-outs, LVAD/OHT rooms, Tikosyn/Sotalol rooms, trach/flap notes, audit findings, supplies, work orders, and handoff notes |

Manual fields begin blank unless a safe workflow default such as `None` is explicitly useful. They must never be presented as Epic-derived clinical facts.

## 4. How high-risk surveillance is calculated

The high-risk report uses the risk classification carried by the active Master record. In the current clinical convention, the red/high class represents a risk greater than 22%. The report therefore answers:

> Which currently admitted PCU patients have a high source risk classification?

It does **not** by itself prove that a patient has already had a 30-day readmission. Thirty-day return logic belongs to the COIP encounter/readmission registry and requires a valid index discharge plus a later revisit admission.

## 5. Print and Word handoff outputs

### Print / Save PDF

1. Select the unit and shift information.
2. Verify green live-source values.
3. Enter amber charge-nurse values.
4. Select **Print / Save PDF**.
5. In the browser print dialog, select the PDF printer or **Save as PDF**.

The generated handoff is a clean, self-contained document with separate live-source and manual-entry sections. If the SharePoint browser blocks the new window, allow pop-ups for the site and retry.

### Download Word

**Download Word** creates a Word-compatible `.doc` document containing the same handoff sections. It is intentionally a portable compatibility export rather than a native `.docx` package. A native `.docx` generator can be added later if the organization requires Word styles, headers/footers, or document properties.

## 6. Future Epic enrichment

The current charge-nurse specialty boxes for **LVAD, OHT, Tikosyn, Sotalol, tracheostomy, flap, and ICU downgrade** are manual because those fields are not yet reliably supplied by the roster contract. When the Epic report is enriched:

1. add the field to the source workbook contract;
2. map the source column to a SharePoint Master field;
3. include the field in the live service select/canonical mapper;
4. display it with the green live-source treatment;
5. retain the amber manual field only as a clearly labeled exception or override; and
6. validate the value against a known patient before removing the manual designation.

This prevents a blank source field from being mistaken for a clinical negative.

## 7. Validation checklist before leader use

- Confirm the page is running in live SharePoint mode.
- Confirm the active census count matches the latest completed Epic roster import.
- Confirm the import batch timestamp and source file are visible in import history.
- Open one patient and compare room, unit, risk, drips, tubes, labs, BM, surgery, and discharge fields with the Master list.
- Confirm a missing source value displays blank or `—`, not a fabricated value.
- Confirm amber fields are entered by the charge nurse and remain visually distinct.
- Test **Print / Save PDF** and **Download Word** in the SharePoint browser.
- Preserve the exported handoff with the shift date and unit when it becomes part of the operational record.

## 8. Import History: admit, transfer, and discharge deep dive

Open **Import History & Rollback** to review the reconciliation audit for each completed Epic daily-roster batch. The history card records:

- **Admit / reactivate:** new CSNs and previously discharged CSNs that returned to the complete roster;
- **Transfer:** the same CSN moving from one room or unit to another, including ICU-to-PCU and PCU-to-ICU classifications when both locations are present;
- **Discharge:** active PCU records absent from a successfully completed roster, after the COIP archive snapshot is created; and
- **Audit context:** source file, importer, Eastern timestamp, aggregate counts, and the patient-level movement detail.

Select **View movement detail** on a roster batch to inspect the patient, MRN, CSN, prior location, incoming location, and movement type. This is intentionally attached to the batch rather than inferred from the current dashboard, so a later deep dive can reconstruct what the roster reconciliation did at that point in time. Older batches created before the detailed overview was added retain their original aggregate history but do not have retroactive movement detail.

The overview is stored in the existing import-batch validation note alongside the source fingerprint, so no new SharePoint list is required for this first implementation. The individual source snapshots and COIP audit events remain the authoritative supporting records. Transfer summaries are displayed in navy/bold and are clickable; room transfers, unit transfers, ICU-to-PCU, and PCU-to-ICU are separately counted.

### Import safety and incomplete uploads

Before Master reconciliation begins, the roster reserves a `Running` import batch. An identical completed source is rejected, and an identical active source is blocked from starting a second writer. The browser shows item progress, disables tab/close actions during the commit, and warns before page refresh or navigation. If the page is still stuck after **20 minutes**, refresh once, open Import History, confirm the batch is `Running` or `Failed`, and re-upload the exact same source file. The same source fingerprint reuses the incomplete reservation; snapshot writes are upserted by batch and CSN rather than blindly duplicated. A completed batch remains protected from repeat upload.

## 9. Known boundaries

- A successful local build proves the code compiles; it does not prove that a newly uploaded SPFx package is active in SharePoint.
- Live report correctness depends on the current SharePoint field schema and the completeness of the latest Epic roster import.
- Native Word `.docx` output is not yet implemented; the current Word option is a Word-compatible `.doc` export.
- Future source fields such as LVAD/OHT/Tikosyn/Sotalol should not be treated as live until the enriched Epic report, SharePoint field, and mapper are all validated end to end.
