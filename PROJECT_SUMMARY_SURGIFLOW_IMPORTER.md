# SurgiFlow Bulk Importer & Multi-Site SharePoint Schema Synchronization Summary

## 📌 Executive & Operational Summary
This session finalized the architecture, clinical safeguards, live schema synchronization, and execution engine for **SurgiFlow Bulk Importer (`surgiflow-importer.html`)** across all 5 SharePoint sites in the AdventHealth cardiac surgical network.

---

## 🏥 1. Multi-Site SharePoint Live Schema Parity

A live REST API audit verified 100% column parity across all five target SharePoint environments:

| SharePoint Target | Site Path / List Name | Total Fields | New Columns Verified Live |
| :--- | :--- | :--- | :--- |
| 🌐 **SurgiFlow Master** | `/teams/SurgiFlow`<br>`SurgiFlow Master` | **257 fields** | `CSN` (Number), `GMLOS` (Number), `AppointmentDetail` (Note), `Creatinine`, `Potassium_K`, `Magnesium`, `Hemoglobin_Hgb`, `IncentiveSpirometry` |
| 🫀 **GT6 CPPCU** | `/sites/group-gt6...`<br>`GT6 SURGIFLOW CPPCU` | **110 fields** | `CSN` (Text), `GMLOS` (Number), `AppointmentDetail` (Note), `Creatinine`, `Potassium_K`, `Magnesium`, `Hemoglobin_Hgb`, `IncentiveSpirometry` |
| 💓 **GT7 CPCU** | `/teams/GT7Charge`<br>`GT7 SURGIFLOW` | **110 fields** | `CSN` (Text), `GMLOS` (Number), `AppointmentDetail` (Note), `Creatinine`, `Potassium_K`, `Magnesium`, `Hemoglobin_Hgb`, `IncentiveSpirometry` |
| 🩺 **GT8 CVPCU** | `/teams/group-relief...`<br>`GT8 SURGIFLOW` | **114 fields** | `CSN` (Text), `GMLOS` (Number), `AppointmentDetail` (Note), `Creatinine`, `Potassium_K`, `Magnesium`, `Hemoglobin_Hgb`, `IncentiveSpirometry` |
| 🫁 **WT8 STPCU** | `/teams/WT8Charge`<br>`WT8 STPCU SURGIFLOW` | **93 fields** | `CSN` (Number), `GMLOS` (Number), `AppointmentDetail` (Note), `Creatinine`, `Potassium_K`, `Magnesium`, `Hemoglobin_Hgb`, `IncentiveSpirometry`, `RiskLevel` |

---

## ⚙️ 2. Core Importer Engine Enhancements (`surgiflow-importer.html`)

1. **Dual Drag-and-Drop Ingestion:**
   * **Zone 1 (Census / Readmissions):** Ingests live Epic census with patient demographics, room, MRN, CSN, EDD, LOS, GMLOS, and admission baseline data.
   * **Zone 2 (Labs & Weights):** Ingests live Epic labs (`K+`, `Mg`, `Hgb`, `Creatinine`), daily weights, and incentive spirometry.
   * **Smart Auto-Merge:** Merges both files in real time on `Room + MRN + Patient Name`.

2. **Full ICU Unit Coverage on SurgiFlow Master:**
   * 2700 CVICU (2701–2740)
   * 5800 CICU (5801–5840)
   * 9900 WT9 ACSU (9901–9940)
   * 3200 MSICU & 4800 VTICU

3. **Authoritative Clinical Matching & Tracking:**
   * **Matching Keys:** Authoritative matching on **`Room` + `MRN` + `Name`** (First/Last).
   * **Tracking Key:** **`CSN` (Encounter Number)** is tracked and written across all 5 sites as the unique clinical encounter identifier.

4. **Dynamic Type Safety (`parseVal` & `Edm.Double`):**
   * Dynamically checks SharePoint field metadata (`TypeAsString`) at runtime.
   * Automatically cleans and extracts numeric floats for `Number` / `Integer` fields (e.g. `"72.8 kg"` → `72.8`).
   * Automatically bypasses read-only and `Calculated` formula columns (such as `LOS` on GT6/GT7).

5. **Fresh Form Digest & Auto-Retry (`postWithRetry`):**
   * Queries `/_api/contextinfo` to obtain a fresh `X-RequestDigest` token before batch execution.
   * Automatically catches `403` / `401` expiration errors mid-batch, refreshes the token in the background, and retries.

---

## 🛡️ 3. Clinical Safety, Data Integrity & Recovery

1. **Room Occupant Turnover & Conflict Detection:**
   * When an incoming Epic record occupies a room currently held by a different patient in SharePoint:
     * Interactive confirmation prompts the user:
       ```text
       ⚠️ [ROOM OCCUPANT CHANGED] Room 6815:
       Old Patient to DELETE: Doe, John (MRN: 11111111)
       New Patient to ADMIT:  Smith, Jane (MRN: 22222222, CSN: 5010499999)
       ```
     * **Click `[OK]`:** Recycles/deletes the old record in SharePoint (sent to Recycle Bin) and creates a clean new record for the incoming patient. This prevents mixing old drips, historical shift notes, or old chest tube entries.
     * **Click `[Cancel]`:** Keeps the old record and creates a separate new item.

2. **Permanent Guardrail on `Clinical Needs to Continue Admission`:**
   * `Clinical Needs to Continue Admission` (`field_22` / `ClinicalNeeds`) has been **completely blacklisted and removed from the importer write payload**.
   * Nursing and physician shift updates are 100% protected and will never be overwritten.

3. **Multi-Unit Shift Note Recovery:**
   * Executed automated SharePoint REST API version rollback across all 4 unit lists:
     * **GT8 CVPCU (8800s):** 33 of 33 occupied patient rooms restored.
     * **GT6 CPPCU (6800s):** 40 of 40 occupied patient rooms restored 2 revisions back.
     * **GT7 CPCU (7800s):** 40 of 40 occupied patient rooms restored to pre-import nursing versions.
     * **WT8 STPCU (8900s):** 36 of 36 occupied patient rooms restored 1 revision back.

---

## 📁 Key File Deliverables
* [`surgiflow-importer.html`](file:///c:/Users/tedmo/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/surgiflow-importer.html) — Canonical single-file bulk importer application.
* [`schemas/SurgiFlow_Master_Parsed_Schema.json`](file:///c:/Users/tedmo/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/schemas/SurgiFlow_Master_Parsed_Schema.json) — 257-column live schema definition for SurgiFlow Master.
* [`PROJECT_SUMMARY_SURGIFLOW_IMPORTER.md`](file:///c:/Users/tedmo/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/PROJECT_SUMMARY_SURGIFLOW_IMPORTER.md) — Comprehensive technical documentation and audit log.
