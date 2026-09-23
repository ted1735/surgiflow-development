# Master Epic Report Column Specification

**Target Report Base**: `SURGIFLOW__GT678WT8WT9GT5CVICU__wNotes_GMLOS_20260901_0605.xlsx` (Sheet: `appts`)  
**Secondary Source Merged**: `ALL_CARDIAC_Patient_Overview_Weight_KMgCHGHGB_20260901_0603.xlsx`  
**Application Version Target**: `v3.1.2`  
**Purpose**: Single, unified daily Epic reporting roster to drive the definitive census, clinical readiness scores, and read-only lab indicators.

---

## 1. Executive Overview

To consolidate your two separate Epic daily reports into **one unified Master Epic Report Template**, keep Report 2 (`wNotes_GMLOS`) as your foundation (41 columns) and add the **8 unique lab, weight, and pulmonary columns** from Report 1 (`Weight_KMgCHGHGB`).

Once these columns are added, a single report upload will power:
1. **Definitive Patient Census & Room Occupancy**
2. **Clinical Labs Banner** (`Hgb`, `Create`, `K+`, `Mg+`) in exact requested order
3. **Weight Tracking & Live Delta Variance** (`Admit Weight`, `Last Weight`, `Weight Doc/Date`)
4. **Bedside Inpatient Indicators** (`Last BM Date`, `Incentive Spirometer`)
5. **Care Management & Readmission Surveillance** (`GMLOS`, `LOS`, `Care Navigation Notes`, `Working DRG`, `Echo LVEF`)

---

## 2. Specific Columns to Add to Your Base Epic Report

Add the following **8 columns** into your Master Epic report template:

| Column Header Name in Epic | Data Type | Sample Value | SurgiFlow Destination Field | Clinical & Operational Role in SurgiFlow |
| :--- | :--- | :--- | :--- | :--- |
| **`Admit Weight`** | String / Numeric | `52.16 kg` | `demographics.admitWeight` / `AdmitWeight` | Baseline inpatient admission weight. |
| **`Last Weight`** | String / Numeric | `54 kg (119 lb 0.8 oz)` | `demographics.weightToday` / `WeightToday` | Live current weight. Drives automatic $\Delta$ weight gain/loss box. |
| **`Weight Doc/Date`** | Date / Timestamp | `2026-08-31 06:00` | `demographics.weightDate` / `WeightVerified` | Verification timestamp for clinical weight documentation. |
| **`Last Hgb`** | Numeric (1 dec) | `14.1` | `demographics.hgb` / `Lab_Hemoglobin` | **Hgb** metric in the Patient Form & Director Dashboard lab banner. |
| **`Creatinine`** | String / Numeric | `0.5 mg/dL` | `demographics.creatinine` / `Lab_Creatinine` | **Create** metric in the Patient Form & Director Dashboard lab banner. |
| **`Last K+`** | Numeric (1 dec) | `3.6` | `demographics.potassium` / `Lab_Potassium` | **K+** metric in the Patient Form & Director Dashboard lab banner. |
| **`Magnesium`** | Numeric (1 dec) | `2.0` | `demographics.magnesium` / `Lab_Magnesium` | **Mg+** metric in the Patient Form & Director Dashboard lab banner. |
| **`Level Incentive Spirometer`** | Numeric / String | `1250 mL` | `demographics.is` / `IS` | Pulmonary incentive spirometry inspiratory volume target. |

> [!NOTE]
> **Already Handled by Base Report:**
> - `Room and Bed` (Col 2) replaces `Room`
> - `Fall Risk Score` (Col 39) covers fall score
> - `Braden Score` (Col 40) covers pressure injury risk score
> - `Incentive Spirometry Frequency` (Col 15) is already supported

---

## 3. Recommended Column Layout for the Unified 49-Column Master Report

When building the custom view or report in Epic Reporting Workbench / Cogito, order the columns as follows:

```
[Col 1]  Department
[Col 2]  Room and Bed
[Col 3]  Patient Name
[Col 4]  CSN
[Col 5]  MRN
[Col 6]  Attending
[Col 7]  Age
[Col 8]  Patient Class
[Col 9]  Primary Problem
[Col 10] Admit Date/Time
[Col 11] EDD
[Col 12] EDD Update Status
[Col 13] LoS
[Col 14] GMLOS
[Col 15] Days Past GMLOS
[Col 16] GMLOS Oulier
[Col 17] Exp Disch to CMLOS
[Col 18] IP Risk of Unplanned Readmission Score Column
[Col 19] MVP Past Admissions
[Col 20] Readmission to Hospital
[Col 21] Working DRG Name
[Col 22] Last EF
[Col 23] Last EF Date
[Col 24] Last Hgb                     <-- [NEW LAB]
[Col 25] Creatinine                   <-- [NEW LAB]
[Col 26] Last K+                      <-- [NEW LAB]
[Col 27] Magnesium                    <-- [NEW LAB]
[Col 28] Admit Weight                 <-- [NEW WEIGHT]
[Col 29] Last Weight                  <-- [NEW WEIGHT]
[Col 30] Weight Doc/Date              <-- [NEW WEIGHT]
[Col 31] Fall Risk Score
[Col 32] Braden Score
[Col 33] OSA Risk
[Col 34] Level Incentive Spirometer   <-- [NEW PULMONARY]
[Col 35] Gastrointesinal Last BM Date (T-2) <-- [NEW GI]
[Col 36] Discharge Disposition
[Col 37] Discharge Dispo/Follow Up Recommendations
[Col 38] Post D/C Follow up Therapy Service Recommendations
[Col 39] Dischrg Order Status
[Col 40] Time Since Disch Ord Placed
[Col 41] Meds to Bed Response
[Col 42] Encounter Pharmacy
[Col 43] Dischrg Med Rec
[Col 44] Payer
[Col 45] Fin Class
[Col 46] Next PCP Visit
[Col 47] Follow-up Providers
[Col 48] Care Navigation Notes
[Col 49] Enrolling Programs
```

---

## 4. Key Rules for the Unified Epic Report

1. **Sheet Naming**: Keep the default tab named **`appts`** (or standard first worksheet) so the importer parses it instantly.
2. **Read-Only / Display-Only Guarantee**: Imported values for labs, weights, DRG, and echo EF will display in SurgiFlow as protected, read-only badges to safeguard data integrity during rounding.
3. **Room Vacancy Rule**: Uploading this report immediately updates the active room assignments and auto-archives displaced patients to the **Historical Database / Archived Patients** section.
