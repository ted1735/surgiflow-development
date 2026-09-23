# SurgiFlow End of Shift Report (EOSR): Multi-Unit Strategy, Schema & Architecture Plan

## 1. Executive Summary & Purpose
This document serves as the authoritative blueprint and roadmap for transitioning SurgiFlow from static Excel macro workbooks (`GT7 EOSR -template.xlsm` and `wt8-eosr template.xlsm`) into a high-performance, real-time web application module.

The goal is to provide a unified, automated End of Shift Report (EOSR) across all cardiac surgical stepdown and intensive care units (**GT6**, **GT7**, **GT8**, **WT8**, **ACSU**, **CVICU**, **CICU**) that eliminates manual double-documentation while preserving unit-specific clinical workflows.

---

## 2. In-Depth Analysis of Current Production Workbooks

### A. GT7 CPCU (Rooms 7801–7840) — Heart Failure, Transplant & MCS Focus
*Source File:* [`SF-Reports/GT7 EOSR -template.xlsm`](file:///c:/Users/tedmo/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/SF-Reports/GT7%20EOSR%20-template.xlsm)
* **Mechanical Circulatory Support & Transplant:**
  * Dedicated tracking for **LVAD** patients (Left Ventricular Assist Device, e.g. Rooms 13, 22).
  * **OHT** (Orthotopic Heart Transplant) patient tracking (e.g. Rooms 03, 08, 11, 23, 27, 39).
* **Arrhythmia & High-Risk Medications:**
  * Specific rooms on **Tikosyn** and **Sotalol** requiring strict EKG/telemetry monitoring.
* **Infection Prevention (IP) Playbook:**
  * Overdue CHG bathing room numbers (e.g. Rooms 17, 18, 35, 37, 21, 33).
  * Foley care validation & documentation times (e.g. "7821 completed @ 04:00").
  * Central Line / Midline line audits (e.g. "13/13 verified").
  * **Diagnostic "Selfies":** Blood culture selfies, Karius test, Foley urine culture, C. diff, and CDT.
* **Staffing & Operational Tracking:**
  * Shift vs. Next Shift staffing matrix: RN, HUC, PCT, Flex RN.
  * Float-in and Float-out tracking with origin/destination units (e.g. "laura GT6 PCT").
  * Midnight Census vs. End of Shift Census.
  * Language/communication assistance needs (e.g. "Spanish 25 & 16; Portuguese 23").
  * Next-day procedures list (CABG, RHC, TAVR).

### B. WT8 STPCU (Rooms 8901–8936) — Thoracic Surgery, Airway & Surgical Oncology Focus
*Source File:* [`SF-Reports/wt8-eosr template.xlsm`](file:///c:/Users/tedmo/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/SF-Reports/wt8-eosr%20template.xlsm)
* **Airway & Specialized Surgical Care:**
  * **Tracheostomy & Laryngectomy** specific patient tracking (e.g. `8910 - trach, 8925 - Laryngectomy`).
  * **Chest Tubes & Drainage Systems:** High-volume Atrium/Thopaz chest tubes, JP drains, pleuroperitoneal shunts.
  * **Surgical Flaps:** Free flap & muscle flap perfusion checks (e.g. `8930 - muscle flap`).
  * **PACU Direct Recoveries & ICU Downgrades:** Transfer coordination (e.g. `8913 - CVICU/BOYER`).
* **Daily Rotating DNV Leadership Audits:**
  * **Monday:** Pain Management DNV Audits.
  * **Tuesday:** Telemetry Orders & Lead Placement DNV Audits.
  * **Wednesday:** Incentive Spirometry Frequency & Education Audits.
  * **Friday:** Blood Product Administration & Documentation Audits.
* **Pre-Op Readiness Audits:**
  * Dual CHG wipe validation (CHG 1 & CHG 2 completed prior to OR).
  * Nurse Leader Unit Fall Prevention Interventions validation.
* **Environmental & Supply Escalations:**
  * AIMS work orders (e.g. "CMU mouse work order, coffee machine work order").
  * Equipment inventory shortages (telemetry battery packs, patient translation tablets).
  * Clinical events & Rapid Response Team (RRT) calls during shift.

---

## 3. Core Architecture Decision: List Strategy

### Comparison of Options:
| Factor | Option A: Add to `SurgiFlow Master` | Option B: Dedicated `SurgiFlow_EOSR` List (Recommended) |
| :--- | :--- | :--- |
| **Data Granularity** | Patient-level (1 row = 1 active bed) | Shift/Unit-level (1 row = 1 shift report event) |
| **Historical Retention** | ❌ None (overwritten whenever patient transfers or discharges) | ✅ Permanent historical audit trail for quality, ANCC, and DNV |
| **Schema Impact** | ❌ Bloats patient table with 50+ shift-level columns | ✅ Keeps patient schema clean and focused |
| **Race Conditions** | ❌ High (Charge nurse editing bed row while nurse updates IV drip) | ✅ Zero conflict between shift reports and bed census |
| **Performance** | ❌ Heavy payloads on every bed query | ✅ Sub-second lightweight shift reports |

### The Winning Strategy:
1. **`SurgiFlow Master` remains the authoritative source for live patient beds.**
2. **A new `SurgiFlow_EOSR` SharePoint list is created** (or provisioned per site) to store shift summary instances.
3. **Automated Cross-List Aggregation:** When a Charge Nurse opens the EOSR module:
   * The web application queries `SurgiFlow Master` via REST API for active beds in that unit.
   * It **automatically computes and aggregates**:
     * Current unit census & bed occupancy percentage.
     * Room numbers with active Foleys, Chest Tubes, Trachs, LVADs, and Wound Vacs.
     * Room numbers on Time-Critical Meds (Sotalol, Tikosyn, Tacro).
     * Scheduled next-day procedures and surgeries.
   * The Charge Nurse only needs to review, validate audits, and enter operational shift notes.

---

## 4. Complete Technical Schema for `SurgiFlow_EOSR` List

```text
Target SharePoint Site: https://ahsonline.sharepoint.com/teams/SurgiFlow (or Unit Sites)
List Name: SurgiFlow_EOSR
List Entity Name: SP.Data.SurgiFlow_x005F_EOSRListItem
```

### Column Specifications:

| Group | Field Display Name | Internal Name | Field Type | Details / Choices |
| :--- | :--- | :--- | :--- | :--- |
| **Header** | Report ID | `Title` | Text | `GT7-20260916-AM` (Auto-generated) |
| | Unit | `Unit` | Choice | `GT6 CPPCU`, `GT7 CPCU`, `GT8 CVPCU`, `WT8 STPCU`, `WT9 ACSU`, `CVICU`, `CICU` |
| | Shift Date | `ShiftDate` | DateTime | Date Only |
| | Shift Type | `ShiftType` | Choice | `Day (AM)`, `Night (PM)` |
| | Charge Nurse | `ChargeNurse` | Text / User | Auto-filled from current user session |
| | Flex RN | `FlexRN` | Text | Name of flex resource |
| | HUC Name | `HUCName` | Text | Health Unit Coordinator |
| **Census** | Midnight Census | `CensusMidnight` | Number | Integer |
| | End of Shift Census | `CensusEOS` | Number | Auto-calculated from active rooms |
| | Total Discharges This Shift | `DischargesThisShift` | Number | Count of discharged records |
| | Total Admissions / Transfers In | `AdmissionsThisShift` | Number | Count of admitted records |
| **Staffing Matrix** | RN Count (Current Shift) | `Staffing_RN_Current` | Number | Staff on current shift |
| | RN Count (Next Shift) | `Staffing_RN_Next` | Number | Scheduled oncoming shift |
| | PCT Count (Current Shift) | `Staffing_PCT_Current` | Number | Patient Care Tech count |
| | PCT Count (Next Shift) | `Staffing_PCT_Next` | Number | Scheduled oncoming PCTs |
| | HUC Count (Current / Next) | `Staffing_HUC` | Text | e.g. "1 / 1" |
| | Float In Staff | `FloatInStaff` | Note | Unit source and staff names |
| | Float Out Staff | `FloatOutStaff` | Note | Destination unit and staff names |
| | Call Outs / Unfilled | `CallOuts` | Note | Staff absences & variance notes |
| **Auto-Computed Clinical Flags** | Time Critical Med Rooms | `Auto_TimeCriticalRooms` | Note | Auto-generated: e.g. `7828 (Sotalol), 7835 (Sotalol)` |
| | Active Foley Catheter Rooms | `Auto_FoleyRooms` | Note | Auto-generated room list |
| | Active Chest Tube Rooms | `Auto_ChestTubeRooms` | Note | Auto-generated room list |
| | Trach / Airway Rooms | `Auto_TrachRooms` | Note | Auto-generated room list |
| | Wound Vac Rooms | `Auto_WoundVacRooms` | Note | Auto-generated room list |
| | High Readmit Risk (>22%) Rooms | `Auto_HighRiskRooms` | Note | Auto-generated room list |
| | Scheduled Procedures Tomorrow | `Auto_ProceduresTomorrow`| Note | Auto-generated procedure list & times |
| **Unit-Specific MCS / Airway** | LVAD Rooms (GT7 / GT8) | `Rooms_LVAD` | Text | e.g. `7813, 7822` |
| | OHT Transplant Rooms (GT7) | `Rooms_OHT` | Text | e.g. `7803, 7808, 7811, 7823, 7827, 7839` |
| | Surgical Flaps (WT8 / GT6) | `Rooms_Flaps` | Text | e.g. `8930 - muscle flap` |
| | ICU Downgrades / PACU Recoveries| `ICU_Downgrades` | Note | e.g. `8913 - CVICU/BOYER` |
| **Audits & Infection Prevention** | Overdue CHG Baths Rooms | `Audit_OverdueCHG` | Note | Rooms overdue for CHG bath |
| | Foley Care Validated Rooms | `Audit_FoleyCareValidated`| Note | Rooms & times validated |
| | Central Line Dressings Due | `Audit_CentralLineDressings`| Note | Dressing change due dates/rooms |
| | Rotating DNV Audit Type | `Audit_DNV_Type` | Choice | `Pain`, `Telemetry`, `Incentive Spirometry`, `Blood Products`, `N/A` |
| | Rotating DNV Audit Findings | `Audit_DNV_Findings` | Note | Leader findings & coaching opportunities |
| | Hand Hygiene Audits Submitted | `Audit_HandHygieneCount` | Number | Number of completed observations |
| | IP Diagnostic Selfies Validated | `Audit_SelfiesCompleted` | MultiChoice | `Blood Culture`, `Karius`, `Foley Urine`, `C. Diff`, `CDT` |
| **Operations & Hand-off** | Rapid Response / Clinical Issues | `Operational_RRT_Issues` | Note | Patient decompensations & transfers |
| | Equipment & Supply Needs | `Operational_Supplies` | Note | Tele batteries, AIMS tickets, tablets |
| | Environmental / Work Orders | `Operational_WorkOrders` | Note | Maintenance requests |
| | Charge Nurse Hand-off Summary | `Operational_HandoffNotes`| Note | Free text shift summary |

---

## 5. UI Implementation & Micro-Save Architecture

### A. Navigation & Entry Point:
* An **`[📋 End of Shift Report (EOSR)]`** primary button added to the top navigation header of `surgiflow-importer.html` and the SPFx Command Center.
* Clicking the button opens the dedicated EOSR Workspace modal or full-screen drawer.

### B. Dynamic Unit Form Profiles:
* The UI automatically detects the current unit context:
  * **GT7 View:** Displays the Mechanical Circulatory Support (LVAD), Transplant (OHT), Tikosyn/Sotalol, and IP Selfie sections.
  * **WT8 View:** Displays the Thoracic Trach/Airway, Chest Tube drainage, Surgical Free Flap, and rotating DNV audit sections.
  * **GT8 / GT6 View:** Displays the Cardiopulmonary, telemetry stepdown, and vascular audit sections.

### C. Zero-Friction Micro-Save Engine:
* **Debounced Asynchronous Autosave:**
  ```javascript
  // 400ms debounce timer on input
  let saveTimeout;
  function onFieldChange(fieldName, value) {
    clearTimeout(saveTimeout);
    updateLocalCache(fieldName, value);
    setSaveStatusIndicator('saving');
    
    saveTimeout = setTimeout(async () => {
      await patchEOSRRecord({ [fieldName]: value });
      setSaveStatusIndicator('saved');
    }, 400);
  }
  ```
* **Status Badges:**
  * `🟢 Saved at 06:48 AM` (All changes synchronized to SharePoint).
  * `🟡 Saving...` (Network patch in progress).
  * `🔴 Offline (Cached locally)` (Saved to `IndexedDB`, auto-syncs when online).

### D. Export & Shift Handoff Broadcast:
* **Print / Clipboard Layout:** One-click print stylesheet formatted specifically for landscape 8.5x11 clipboards during shift huddle.
* **Microsoft Teams Markdown Copy:** One-click "Copy for Teams" button that formats the entire report into a clean, markdown-card snippet ready to paste into the unit's Microsoft Teams Charge Nurse channel.

---

## 6. Actionable Implementation Checklist (Pick Up Here)

- [ ] **Step 1: Provision SharePoint List**
  - Run automated REST API script to create `SurgiFlow_EOSR` on the `/teams/SurgiFlow` site.
  - Add the 40 columns specified in Section 4 above.
- [ ] **Step 2: Build UI Component in `surgiflow-importer.html`**
  - Add the `[📋 End of Shift Report (EOSR)]` modal interface.
  - Implement the auto-aggregation query against `SurgiFlow Master` to pull active census, lines, tubes, and time-critical med rooms.
- [ ] **Step 3: Implement Debounced Micro-Save**
  - Wire up `postWithRetry` for `MERGE` requests to `SurgiFlow_EOSR`.
  - Add `localStorage`/`IndexedDB` offline buffer.
- [ ] **Step 4: Test Multi-Unit Profiles**
  - Validate GT7 profile with live LVAD / OHT fields.
  - Validate WT8 profile with live Trach / Thoracic DNV audit fields.
