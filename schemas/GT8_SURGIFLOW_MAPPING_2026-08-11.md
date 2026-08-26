# GT8 SURGIFLOW Schema & Mapping Documentation (2026-08-11)

## Overview
This document records the exact column mapping between the Epic Readmissions export (`SURGIFLOW__GT678WT8WT9__wNotes_GMLOS_20260810_2039.xlsx`) and the `GT8 SURGIFLOW` SharePoint List hosted at `/teams/group-reliefchargecvpcu/Lists/GT8 SURGIFLOW`.

---

## Unit Boundaries & Auto-Filtering
* **Target Site Path:** `/teams/group-reliefchargecvpcu`
* **Target List Name:** `GT8 SURGIFLOW`
* **Unit Scope:** GT8 CVPCU
* **Room Boundary:** Rooms `8801` to `8840` (inclusive).
* **Filtering Rule:** Rows outside 8801–8840 are automatically excluded during preview, JSON serialization, and batch REST updates.

---

## Verified Field Mappings

| App / Importer Key | Target Display Name | Candidate Internal Names | Excel Source Column(s) | Data Type | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `room` | Room Number | `Room`, `Title` | `Room and Bed`, `Room #` | Text/Title | Digits parsed (8801–8840) |
| `name` | Patient Name | `Name`, `PatientName` | `Patient Name` | Text | Primary display |
| `mrn` | MRN | `MRN` | `MRN` | Text | Primary Deduplication Key |
| `csn` | CSN | `CSN` | `CSN` | Text | Secondary Deduplication Key |
| `attendingMD` | Attending MD | `AttendingMD`, `Attending` | `Attending` | Text | Clinical Provider |
| `readmissionRiskLevel` | Readmission Risk Level | `ReadmissionRiskLevel`, `RiskLevel`, `_x26a0__x0020_Readmission_x0020_Risk_x0020_Level_x0020__x26a0_` | `IP Risk of Unplanned Readmission Score Column` | Text | Score / Level |
| `edd` | EDD | `EDD` | `EDD` | DateTime | Estimated Discharge Date |
| `dispo` | Discharge Disposition | `Dispo`, `DischargeDisposition` | `Discharge Disposition`, `Discharge Dispo/Follow Up Recommendations` | Choice | Disposition |
| `age` | Age | `Age` | `Age` | Number/Text | Patient Age |
| `fallRisk` | Fall Risk Score | `FallRisk`, `FallRiskScore` | `Fall Risk Score` | Text/Number | Risk Score |
| `weightToday` | Weight Today | `WeightToday`, `Weight` | `Weight Today` | Text/Number | Weight |
| `admitDate` | Admit Date | `AdmitDate` | `Admit Date/Time` | DateTime | Admission Date |
| `los` | LOS | `LOS`, `LoS` | `LoS` | Text/Number | Length of Stay |
| `gmlos` | GMLOS | `GMLOS` | `GMLOS ` | Text/Number | Geometric Mean LOS |
| `braden` | Braden Score | `Braden` | `Braden Score` | Text | Braden Score |
| `admitReason` | Admit Reason / DRG | `AdmitReason` | `Working DRG Name`, `Primary Problem` | Text | Working Diagnosis |
| `appointmentDetail` | Appointment Detail | `AppointmentDetail`, `AppointmentDetails` | `Care Navigation Notes` | Note | Smart Clause Extracted |
| `status` | Clinical Progress | `Status`, `_x001f_CLINICAL_x0020_PROGRESS_x001f_` | `Care Navigation Status` | Choice | Default: `Progressing On Schedule` |
| `unit` | Unit | `Unit` | `Department` | Choice | Default: `GT8 CVPCU` |
| `daysPastGMLOS` | Days Past GMLOS | `DaysPastGMLOS` | `Days Past GMLOS` | Number | Calculated variance |
| `gmlosOutlier` | GMLOS Outlier | `GMLOSOutlier` | `GMLOS Oulier` | Text/Choice | Outlier tag |
| `lastEF` | Last EF | `LastEF` | `Last EF` | Text/Number | Ejection Fraction |
| `lastEFDate` | Last EF Date | `LastEFDate` | `Last EF Date` | DateTime | EF Assessment Date |
| `nextPCPVisit` | Next PCP Visit | `NextPCPVisit` | `Next PCP Visit` | DateTime | Scheduled Visit |
| `openCareGaps` | Open Care Gaps | `OpenCareGaps` | `Open Care Gaps` | Text/Note | Care Gaps |

---

## Linked Tool Files
* Importer Page: [`surgiflow-importer-GT8.html`](file:///C:/Users/tjm254/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow/surgiflow-importer-GT8.html)
* JSON Schema Map: [`GT8_SURGIFLOW_Field_Map.json`](file:///C:/Users/tjm254/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow/schemas/GT8_SURGIFLOW_Field_Map.json)
