# SurgiFlow Architectural Journal & Progression Log

**Date:** September 2, 2026  
**Author:** SurgiFlow Architecture & Engineering  
**Version Baseline:** SPFx 1.23.2 | Node.js v22.14.0 | PnPjs v3.26.0  
**SharePoint Tenant Site:** `https://ahsonline.sharepoint.com/teams/SurgiFlow`

---

## 1. Executive Architecture: The 2-List Operating Model

To support real-time bedside clinical workflows alongside deep longitudinal readmission quality surveillance, the system runs on a **clean, decoupled 2-List SharePoint Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LIST 1: SurgiFlow Master (Bedside)                   │
│  - Target: Real-time Inpatient Census (GT6, GT7, GT8, WT8)             │
│  - Data: Live vitals, telemetry, active IV drips, chest tubes, audits  │
│  - Concurrency: Modified timestamps & leaf-level micro-patch           │
│  - GUID: 66d23d4e-dbbd-4ab8-a68b-428e2f8103cd                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Linked by MRN & CSN
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LIST 2: SurgiFlow COIP Reviews (Quality & Governance)      │
│  - Target: Readmission surveillance & Jade CHF 8-element bundle        │
│  - Data: Root-cause narratives, multidisciplinary action plans, audit  │
│  - Concurrency: Independent micro-patch on governance reviews          │
│  - GUID: ae9cdb77-7a99-4b00-853a-f078c39c034f                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Milestones Completed

1. **Site Contents Cleanup:**
   * Removed 11 legacy/orphaned `SF-RCC_*` helper lists to eliminate database bloat.
   * Removed obsolete prototype lists: `Bedside DC Readiness Huddles`, `Gaps`, `Issue tracker list`, `Readmission Huddle v1`.
2. **List 2 Provisioning (`SurgiFlow COIP Reviews`):**
   * Auto-provisioned all 34 clinical fields including Choice dropdowns, Numbers, and Multi-line Note fields (`SP.FieldMultiLineText`).
   * Indexed `MRN` and `COIP_RevisitCSN` for high-performance cross-list lookups.
3. **Dual-List Service & Micro-Patching ([`sharePointDualListService.ts`](file:///c:/Users/tjm254/servers/Surgiflow-RCC-Standalone-/src/services/sharePointDualListService.ts)):**
   * Implemented leaf-level diffing (`buildDraftPatch`) so concurrent nursing, case management, and physician updates merge without clinical race conditions.
   * Optimistic ETag locking across both lists.

---

## 3. How to Spin Up the SPFx Dev Server (For SharePoint Workbench)

### Step 1: In your terminal (Git Bash or CMD)
Navigate to the SPFx workspace and launch the local Heft dev server:

```bash
cd /c/Users/tjm254/servers/SF-CCOIP-main/packages/spfx
./node_modules/.bin/heft start --clean
```
*(Or in Windows CMD: `cd /d "C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx" && .\node_modules\.bin\heft.cmd start --clean`)*

The server will build the TypeScript solution and host manifests on **`https://localhost:4321`**.

---

### Step 2: Open SharePoint Workbench in Browser

Navigate to your authenticated SharePoint Workbench with debug manifests enabled:

👉 **[Launch SurgiFlow SPFx in SharePoint Workbench](https://ahsonline.sharepoint.com/teams/SurgiFlow/_layouts/15/workbench.aspx?debug=true&noredir=true&debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fbuild%2Fmanifests.js)**

1. When SharePoint displays **"Warning: debug scripts found"**, click **"Load debug scripts"**.
2. Click the **`+` (Add a new web part)** icon on the canvas.
3. Select **`SurgiFlow Bedside Huddle & RCC Cardiac Hub`**.
4. The web part will mount and connect directly to your live **`SurgiFlow Master`** and **`SurgiFlow COIP Reviews`** lists.
