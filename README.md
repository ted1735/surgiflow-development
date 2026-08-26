# 🏥 SurgiFlow Multi-Site Development & Bulk Importer Hub

[![HIPAA Compliant](https://img.shields.io/badge/Security-HIPAA%20Compliant-blue.svg)](#security--hipaa-compliance)
[![SharePoint Online](https://img.shields.io/badge/SharePoint-Modern%20Lists%20REST%20v1-038387.svg)](#-live-sharepoint-site-directory)
[![Epic EMR](https://img.shields.io/badge/Integration-Epic%20Report%20Ingestion-crimson.svg)](#-epic-report-ingestion-specification)

SurgiFlow is the enterprise clinical patient tracking and operations command board for the AdventHealth cardiac surgical and stepdown PCU networks. This repository houses the development tools, schema definitions, view formatting templates, and the **Standalone SurgiFlow Bulk Importer (`surgiflow-importer.html`)**.

---

## 🔗 Related Repositories
* **SF-CCOIP (Clinical Command Operations & Intelligence Platform):** [https://github.com/ted1735/SF-CCOIP](https://github.com/ted1735/SF-CCOIP)

---

## 🌐 Live SharePoint Site Directory

The SurgiFlow ecosystem spans 1 master list and 4 specialized surgical stepdown units:

| Target Site | Unit Description | SharePoint URL / List Path | List GUID |
| :--- | :--- | :--- | :--- |
| 🌐 **SurgiFlow Master** | All Units & ICUs (2700, 5800, 6800, 7800, 8800, 8900, 9900) | `https://ahsonline.sharepoint.com/teams/SurgiFlow/Lists/SurgiFlow%20Master` | `getbytitle('SurgiFlow Master')` |
| 🫀 **GT6 CPPCU** | Cardiopulmonary PCU (Rooms 6801–6840) | `https://ahsonline.sharepoint.com/sites/group-gt6leadershipteamgroup/Lists/GT6%20SURGIFLOW%20CPPCU` | `b1516083-a63d-4301-8686-4bd9d64675d3` |
| 💓 **GT7 CPCU** | Cardiac PCU (Rooms 7801–7840) | `https://ahsonline.sharepoint.com/teams/GT7Charge/Lists/GT7%20SURGIFLOW` | `570b3e34-d9c1-4484-950f-be70f4b5d2da` |
| 🩺 **GT8 CVPCU** | Cardiovascular PCU (Rooms 8801–8840) | `https://ahsonline.sharepoint.com/teams/group-reliefchargecvpcu/Lists/GT8%20SURGIFLOW` | `5664d807-d99a-40bd-ba04-d7855b1ccaf7` |
| 🫁 **WT8 STPCU** | Surgical Thoracic PCU (Rooms 8901–8940) | `https://ahsonline.sharepoint.com/teams/WT8Charge/Lists/CTPCU%20POC%20TOOL%20V5` | `745b597b-f67a-401f-b412-b44daf8a7fd3` |

---

## 📥 Epic Report Ingestion Specification

The bulk importer (`surgiflow-importer.html`) ingests two distinct Epic standard exports and merges them automatically:

```
[ Epic Report 1: Census & Readmissions ] ──┐
                                          ├──► [ Smart Merge Engine ] ──► [ 5-Site Preset Adapter ] ──► SharePoint REST API
[ Epic Report 2: Labs, Weights & IS ]    ──┘     (Room + MRN + Name)       (Type-Safe OData Batch)
```

### **1. Report 1: Active Census & Readmission Risk**
* **Format:** Excel (`.xlsx`) or CSV (`.csv`)
* **Primary Columns Extracted:**
  * `Room` / `Bed`
  * `Patient Name`
  * `MRN`
  * `CSN` *(Encounter ID for longitudinal tracking)*
  * `Age` & `Attending MD`
  * `Admit Reason / Working DRG` & `Admit Date`
  * `EDD` (Estimated Discharge Date), `LOS`, and `GMLOS` (Geometric Mean LoS)
  * `Discharge Disposition` & `Readmission Risk Level`
  * `Fall Risk` & `Braden Score`

### **2. Report 2: Labs, Weights & Incentive Spirometry**
* **Format:** Excel (`.xlsx`) or CSV (`.csv`)
* **Primary Columns Extracted:**
  * `Admit Weight` & `Weight Today`
  * `Potassium (K+)`
  * `Magnesium (Mg)`
  * `Hemoglobin (Hgb)`
  * `Creatinine (Cr)`
  * `Incentive Spirometry (IS)` frequency

---

## 🧠 Smart Appointment Parsing Engine

Hospital follow-up appointments and clinic visits are automatically extracted from free-text Case Management / CMA notes via regular expression pattern matching:

1. **Provider Identification:** Captures provider names (e.g. `with Ralph Gousse, MD`, `Dr. Subraya`, `Mirana Jean, APRN`).
2. **Date & Time Extraction:** Matches standardized appointment timestamps (e.g. `Aug 27, 2026 8:45 AM`, `Sep 02, 2026 @ 10:00 AM`).
3. **Specialty Classification:** Classifies appointments into `PCP`, `Cardiology`, `Cardiothoracic Surgery (CTS)`, `Pulmonology`, `Nephrology`, or `Specialist`.
4. **Structured Note Generation:** Compiles appointments into a concise summary stored exclusively in **`Appointment Detail` (`Appointment_x0020_Detail`)**:
   ```text
   PCP — Aug 27, 2026 8:45 AM with Ralph Gousse, MD; Cardiology — Sep 02, 2026 10:00 AM with Haley Verbeck, PA-C
   ```

---

## 🛡️ Clinical Safeguards & Data Integrity Rules

1. **Strict Protection of Clinical Shift Notes:**
   * **`Clinical Needs to Continue Admission` (`field_22` / `ClinicalNeeds`) is completely blacklisted and unmapped from the write payload.**
   * Nursing and physician shift updates, drips, and barriers are never overwritten by automated imports.

2. **Room Conflict & Turnover Detection:**
   * If a room in SharePoint is occupied by an old patient and Epic contains a new admission for that room:
   * The tool displays an interactive confirmation dialog showing old vs. new occupant details.
   * **`[OK]` Click:** Moves the old patient record to the **SharePoint Recycle Bin** and sends a clean `POST` for the new admission, preventing data cross-contamination.

3. **Type-Safe `Edm.Double` & Calculated Column Filter:**
   * Runtime inspection cleans and extracts numbers for numeric fields (e.g. `"72.8 kg"` → `72.8`).
   * Automatically ignores `Calculated` formula columns (like `LOS` on GT6/GT7) to prevent REST 400 Bad Request errors.

4. **Auto-Refreshing Security Digest (`getDigest`):**
   * Automatically issues and renews `X-RequestDigest` tokens via `/_api/contextinfo`, preventing `403 Forbidden` errors during long batch imports.

---

## 🚀 How to Run the Importer

1. Open [`surgiflow-importer.html`](surgiflow-importer.html) in any modern browser (Chrome / Edge).
2. Drag and drop **Report 1** (Census) and **Report 2** (Labs/Weights) into their respective drop zones.
3. Select your target SharePoint list from the preset dropdown (`SurgiFlow Master`, `GT6`, `GT7`, `GT8`, or `WT8`).
4. Click **Generate Console Script** and copy the code.
5. In your SharePoint list tab, press **F12** (Developer Tools) → navigate to the **Console** tab → paste and press **Enter**.

---

## 🔒 Security & HIPAA Compliance

This repository enforces strict HIPAA compliance rules via [`.gitignore`](.gitignore). No protected health information (PHI), real patient identifiers, or raw hospital spreadsheet dumps are ever tracked in version control.
