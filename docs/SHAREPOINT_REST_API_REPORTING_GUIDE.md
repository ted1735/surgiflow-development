# SharePoint REST API vs. Power Query: Architecture & Clinical Reporting Guide

## 1. Why SharePoint REST API Outperforms Power Query for SurgiFlow
* **Direct Server-Side Filtering (`$filter`):** Power Query often pulls massive payloads across the network before filtering locally in Excel. REST API filters on the SharePoint server before returning JSON.
* **Granular Field Selection (`$select`):** Instead of fetching all 278 columns across 200+ patient records, you request only the 8–10 fields needed for a specific report (e.g., `Room, PatientName, EDD, Dispo, RiskLevel`).
* **Real-Time Speed:** Queries run sub-second directly inside browser tools, SPFx web parts, or Node.js services without opening heavy `.xlsx` files or triggering slow background data model refreshes.
* **Bidirectional Capability:** Power Query is strictly read-only. REST API allows read, batch updates, conditional writes, and status toggles in one script.

---

## 2. Core REST API URL Anatomy
All list queries use the standard SharePoint REST endpoint format:

```text
https://ahsonline.sharepoint.com/{site-path}/_api/web/lists/getbytitle('{List Title}')/items
```

### Essential OData Query Parameters:
| Operator | Purpose | Clinical Reporting Example |
| :--- | :--- | :--- |
| **`$select`** | Choose exact columns | `?$select=Room,PatientName,MRN,EDD,Dispo,AttendingMD` |
| **`$filter`** | Server-side WHERE clause | `?$filter=Unit eq 'GT8' and Status ne 'Discharged'` |
| **`$orderby`** | Sorting | `?$orderby=Room asc` or `?$orderby=EDD desc` |
| **`$top`** | Page size / Limit | `?$top=500` (SharePoint default is 100 items without this) |
| **`$expand`** | Lookup / User details | `?$select=Author/Title,Author/EMail&$expand=Author` |

---

## 3. High-Value Clinical Report Queries

### A. High Readmission Risk & Pending DC Dispositions
```text
/_api/web/lists/getbytitle('SurgiFlow Master')/items?
  $select=Room,PatientName,MRN,RiskLevel,Dispo,EDD,AttendingMD
  &$filter=(RiskLevel eq 'High >22%') and (Dispo eq 'SNF' or Dispo eq 'IPR-AH')
  &$orderby=Room asc
  &$top=500
```

### B. Patients Meeting or Exceeding GMLOS
```text
/_api/web/lists/getbytitle('SurgiFlow Master')/items?
  $select=Room,PatientName,Unit,LOS,GMLOS,ServiceLine,AttendingMD
  &$filter=LOS ge GMLOS and Status ne 'Discharged'
  &$orderby=Unit asc,Room asc
  &$top=500
```

### C. Active Unit Census Roster (Excludes Discharged)
```text
/_api/web/lists/getbytitle('WT8 STPCU SURGIFLOW')/items?
  $select=Room,PatientName,MRN,CSN,EDD,AttendingMD,ServiceLine
  &$filter=Status ne 'Discharged'
  &$orderby=Room asc
  &$top=100
```

### D. 🎯 Dedicated Report: Today's Expected Discharges & Planned Procedures
* **Target Audience:** Charge Nurses, Bed Placement, Nursing Leadership at 07:00 and 13:00 huddles.
* **Clinical Purpose:** Track every patient with `EDD eq Today` or `DCTODAY eq true` alongside their scheduled procedures/barriers to avoid delayed discharges.
```text
/_api/web/lists/getbytitle('SurgiFlow Master')/items?
  $select=Room,PatientName,MRN,CSN,Unit,EDD,DCTODAY,DCOrder,MedRec,Dispo,DCLounge,RideAVL,Surgery_x0020_Scheduled_x0020_Pr,SurgeryBarriers,SurgeryToday,AttendingMD
  &$filter=(DCTODAY eq 1 or EDD ge datetime'2026-09-16T00:00:00Z' and EDD le datetime'2026-09-16T23:59:59Z') and Status ne 'Discharged'
  &$orderby=Unit asc,Room asc
  &$top=500
```
* **Key Columns Displayed in Report:**
  * **Location & Demographics:** `Room`, `Unit`, `PatientName`, `MRN`, `CSN`
  * **Discharge Status:** `EDD`, `DC TODAY` (Yes/No), `DC Order` (Placed vs Pending), `Med Rec` (Verified vs Pending)
  * **Planned Procedures & Barriers:**
    * `Surgery Scheduled Procedure` (`Surgery_x0020_Scheduled_x0020_Pr`) — Procedure name / catheterization / TAVR / pacing
    * `Surgery Today` (`SurgeryToday`) — Confirmed for OR/Cath lab today
    * `Procedure / Surgery Barriers` (`SurgeryBarriers` / `ProcedureBarriers`) — NPO status, consent, lab clearance
  * **Departure Logistics:** `Dispo` (Home, SNF, HHC), `DC Lounge` (Eligible/Transferred), `Ride AVL` (Family, Transport, Lyft), `AttendingMD`

### E. 🛑 Pending Discharge Tasks & Barrier Escalation Board
* **Target Audience:** Case Managers, Social Work, Nurse Leaders.
* **Clinical Purpose:** Highlights patients delayed or blocked by multi-disciplinary barriers.
```text
/_api/web/lists/getbytitle('SurgiFlow Master')/items?
  $select=Room,PatientName,Unit,EDD,Dispo,NonClinicalDCBarriers,MisalignedDispo,DispMisalignEscalation,HHCAuthSubmitted,DMEArranged,CorrectPharmacy,ConsultantsPending,LeaderActionItems
  &$filter=(Status ne 'Discharged') and (DispMisalignEscalation eq 'Yes' or NonClinicalDCBarriers ne null or MisalignedDispo eq 1)
  &$orderby=Unit asc,Room asc
  &$top=500
```
* **Tracked Action Items:**
  * **Care Management Barriers:** `Non-Clinical DC Barriers` (`NonClinicalDCBarriers` / `CMNotes`)
  * **Disposition Misalignments:** `Misaligned Dispo` (`MisalignedDispo` / `PTIE`) & `Disposition Misalignment Escalation` (`DispMisalignEscalation`)
  * **Equipment & Authorization:** `HHC/SNF Auth Submitted` (`HHCAuthSubmitted`), `DME Arranged` (`DMEArranged`), `Correct Pharmacy` (`CorrectPharmacy`)
  * **Physician Consult Sign-offs:** `Consultants Pending` (`ConsultantsPending`) and un-signed specialty consults.


---

## 4. How Execution & Authentication Work

### In the Browser (Zero Setup / Same-Session Auth):
* When run in the browser (or an HTML tool like `surgiflow-importer.html`), the browser automatically passes the user's active login cookie:
  ```javascript
  const res = await fetch("https://ahsonline.sharepoint.com/teams/SurgiFlow/_api/web/lists/getbytitle('SurgiFlow Master')/items?$select=Room,PatientName,EDD&$top=500", {
    headers: {
      "Accept": "application/json;odata=verbose"
    }
  });
  const data = await res.json();
  const patients = data.d.results;
  ```

### Handling Lists with >5,000 Items (The List View Threshold):
* Indexed columns must be used in `$filter` if the list grows over 5,000 records.
* Use pagination via `data.d.__next` to seamlessly step through large record sets:
  ```javascript
  async function fetchAllItems(url) {
    let results = [];
    let nextUrl = url;
    while (nextUrl) {
      const resp = await fetch(nextUrl, { headers: { 'Accept': 'application/json;odata=verbose' } });
      const data = await resp.json();
      results = results.concat(data.d.results);
      nextUrl = data.d.__next || null;
    }
    return results;
  }
  ```

---

## 5. Recommended Architecture for Custom Reports
1. **Lightweight HTML/JS Leader Dashboards:**
   * Single `.html` file hosted on SharePoint or run locally.
   * Pulls live data using `fetch()` in <1 second.
   * Renders searchable cards, print-ready huddle sheets, or filtered CSV/PDF exports without touching Excel.
2. **Scheduled Automated Reports (Power Automate / Azure Function):**
   * Uses HTTP with Microsoft Entra ID (Azure AD) app credentials to query REST API at scheduled intervals (e.g. 06:00 and 18:00).
   * Generates formatted summaries posted to Teams or emailed to charge nurses.
3. **SPFx Web Part (SurgiFlow-v2.0):**
   * Embeds directly into SharePoint pages.
   * Queries REST API via `spHttpClient` with built-in token management.

---

## 6. Self-Service Custom Report Builder (User-Defined Reports)
To enable frontline clinical leaders to build custom reports without developer intervention:

### Implementation Pattern:
* **JSON Report Definition Store:**
  * Save user report templates in browser `localStorage` or a dedicated SharePoint List (`SurgiFlow_Saved_Reports`).
  * Structure of a user report definition:
    ```json
    {
      "id": "gt8_high_risk_dispo",
      "title": "GT8 High Risk Dispo Follow-up",
      "targetList": "GT8 SURGIFLOW",
      "selectedColumns": ["Room", "PatientName", "MRN", "RiskLevel", "Dispo", "EDD", "AttendingMD"],
      "filters": [
        { "field": "RiskLevel", "op": "eq", "value": "High >22%" },
        { "field": "Status", "op": "ne", "value": "Discharged" }
      ],
      "sortBy": "Room",
      "sortDirection": "asc"
    }
    ```
* **Dynamic Query Compiler:**
  * A lightweight UI form takes user-selected columns and filters, dynamically compiles the OData query string, and calls `fetch()`.
* **Export Options:**
  * **One-Click CSV Export:** Generates an immediate downloadable `.csv` using standard browser Blob APIs.
  * **Print-Friendly Clinical Huddle View:** Formats clean, high-contrast tables designed for nursing clipboard rounds.

---

## 7. Reports Action Button in SurgiFlow UI
* **UI Location:** Top right header toolbar next to "Reset All" and "Generate Console Script".
* **Modal / Drawer Interface:**
  * **Quick Reports Tab:** Pre-configured clinical reports (e.g., Readmit Risk >22%, GMLOS Outliers, Foley Protocol Active, Pending Consults).
  * **Custom Query Tab:** Checkbox column selector from the live list schema + simple filter dropdowns.
  * **Saved Reports:** Personal or shared presets accessible with one click.

---

## 8. Clinical Unit Guides & Hospital-Wide Guide
Standardized operational reference cards and unit handbooks embedded directly in the workflow:

### A. Individual Unit Guides (GT6, GT7, GT8, WT8):
* **Target Rooms & Physical Layout:** Room number ranges, telemetry capabilities, stepdown criteria.
* **Service Line Focus:** Primary surgical/medical teams (e.g., CTsx, CVmed, Thoracic, Vascular, Heart Failure).
* **Unit Specific Escalation Triggers:** Bed turnover timing, charge nurse contact lines, specific post-op pathways.

### B. Hospital-Wide Surgical Flow Guide:
* **Consolidated PCU + ICU Matrix:** Room allocation across 2700 CVICU, 5800 CICU, 9900 ACSU, 6800 GT6, 7800 GT7, 8800 GT8, and 8900 WT8.
* **ICU to Stepdown Transfer Workflow:** Automatic reconciliation when a patient steps down between units.
* **Network-Wide Discharge Lounge Criteria & Transport Triggers.**

---

## 9. End of Shift Report (EOSR) Specifications & Auto-Save Architecture

### A. Core Structure of the EOSR:
* **System-Populated Fields (Zero Manual Entry):**
  * Current Unit Census (Total occupied, incoming transfers, pending discharges).
  * Outlier Alert Counts (Patients past GMLOS, High Readmission Risk count).
  * Foley Catheter & Chest Tube Days (calculated directly from date fields).
  * Active Drips & Time-Critical Med summary.
* **User-Input Clinical Fields:**
  * Leader Operational Notes & Staffing Variances.
  * Escalation Roadblocks (Pending insurance auth, specialized DME delays, consult delays).
  * Charge Nurse Sign-off & Shift Hand-off Notes.

### B. Micro-Save & Auto-Save Architecture:
* **Real-Time Field Debounce (Micro-Saves):**
  * When a leader types in an EOSR note or changes a dropdown, a 400ms debounce timer triggers an asynchronous `MERGE` patch to SharePoint.
  * Uses the existing `postWithRetry` engine with fresh `X-RequestDigest`.
* **Visual Save Indicators:**
  * Green indicator: `Saved just now`.
  * Yellow pulsing dot: `Saving...`.
  * Red badge: `Offline - cached locally in IndexedDB`.
* **Local Fallback (Zero Data Loss):**
  * If the network drops, changes save instantly to browser `IndexedDB`/`localStorage` and auto-sync as soon as SharePoint reconnects.

