# SurgiFlow Master SharePoint Field Map & Gap Analysis Reference

**Application Version**: `v3.1.0`  
**Target SharePoint Environment**: Microsoft 365 SharePoint Online / AdventHealth Clinical Informatics  
**Primary List Target**: `SurgiFlow Master` (`https://ahsonline.sharepoint.com/teams/SurgiFlow/Lists/SurgiFlow%20Master`)  
**Secondary List Target**: `SurgiFlow CCOIP Reviews` (Linked via `MRN` and `CSN`)  
**Schema Validation Base**: 260 Live Fields Validated against `SF Master Live Data Fields and Choices.json` / SharePoint REST API

---

## Executive Summary & Scope

This document provides a **complete and accurate cross-reference mapping** between the SurgiFlow client/server application data models (`src/types.ts`, `src/storage/sharePointSchema.ts`) and the Microsoft SharePoint Online `SurgiFlow Master` list.

### Key Audit Findings:
1. **Existing Projected Columns**: 235 live custom fields already exist on `SurgiFlow Master`, including disease pathways (`AMI_*`, `CABG_*`, `COPD_*`, `HF_*`, `PNA_*`, `THK_*`), post-huddle leadership notes (`POST_x0020_Huddle_x0020_Action_x`, `CM_x0020_Leader_x0020_Review`), device checks (`DEV_*`), final safety checks (`FIN_*`), and consultant sign-offs.
2. **True Gap Columns**: Several high-value bedside checklist and multidisciplinary consult tracking fields are actively used in the UI/database but have not yet been provisioned as dedicated SharePoint columns in the live list.
3. **Internal Name Alignment**: SharePoint encodes spaces as `_x0020_` (e.g. `CM_x0020_Leader_x0020_Review`, `POST_x0020_Huddle_x0020_Action_x`), which are fully mapped in the projection engine.

---

## 1. Missing / Gap Fields to Provision in SharePoint

The following fields are actively captured and audited within SurgiFlow (bedside checklist, consults, and clinical huddle workflows) and should be provisioned in the SharePoint list using the accompanying browser console script:

| Priority | Field Display Name | SharePoint Internal Name | SharePoint Type | Allowed Choices / Formatting | Description & Clinical Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | **Active IV Drips** | `ActiveIVDrips` | `MultiChoice` | `Amiodarone`, `Cardizem`, `Diltiazem`, `Dobutamine`, `Dopamine`, `Epinephrine`, `Esmolol`, `Heparin`, `Insulin`, `Milrinone`, `Nicardipine`, `Nitroglycerin`, `Norepinephrine`, `Levophed`, `Nitroprusside`, `Nipride`, `Precedex`, `Vasopressin`, `Other` | Multi-select active cardiac/vasoactive infusions (expands single `Drip`) |
| **High** | **Chest Tube Days** | `ChestTubeDays` | `Number` | Integer (0–99) | Duration invasive surgical chest drain has been in place |
| **High** | **Last Bowel Movement Date** | `LastBMDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Tracks opioid-induced constipation & GI readiness |
| **High** | **Foley Catheter Present** | `Foley` | `Choice` | `Yes`, `No` | CAUTI surveillance presence flag |
| **High** | **Foley Insertion Date** | `FoleyInsertedDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Tracks catheter dwell time |
| **High** | **Foley Removal Protocol Status** | `FoleyStatus` | `Choice` | `Indicated - Protocol Active`, `Trial of Void Pending`, `Discontinued Today`, `Chronic Indwelling`, `N/A - No Foley` | Catheter weaning and trial of void protocol status |
| **Medium** | **Physical Therapy Seen Date** | `PT_SeenDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Physical therapy mobility evaluation date |
| **Medium** | **Occupational Therapy Seen Date** | `OT_SeenDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Occupational therapy ADL evaluation date |
| **Medium** | **Speech-Language Pathology Seen Date** | `SLP_SeenDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Dysphagia / aspiration risk consult date |
| **Medium** | **Case Management Seen Date** | `CM_SeenDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Case manager initial consult date |
| **Medium** | **Social Work Seen Date** | `SW_SeenDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Psychosocial / complex discharge planning consult date |
| **Medium** | **Wound Care Seen Date** | `WoundCare_SeenDate` | `DateTime` | Date Only (`YYYY-MM-DD`) | Surgical site / pressure injury specialist consult date |
| **Medium** | **VAD Driveline Care Completed** | `VAD_DrivelineCare` | `Choice` | `Yes`, `No`, `N/A` | LVAD/RVAD driveline dressing & site assessment |
| **Medium** | **VAD INR Current** | `VAD_INR_Current` | `Number` | 1 decimal place (e.g. `2.4`) | Measured point-of-care or laboratory INR |
| **Medium** | **VAD INR Goal Range** | `VAD_INR_Goal` | `Text` | Single line (e.g. `2.0 - 3.0`) | Target therapeutic anticoagulation window |
| **Medium** | **Afib Rhythm Classification** | `AfibClassification` | `Choice` | `Sinus Rhythm`, `NSR w/ PACs/PVCs`, `Atrial Fibrillation`, `Atrial Flutter`, `Paced Rhythm`, `Ventricular Tachycardia`, `Other Arrhythmia` | Real-time cardiac telemetry rhythm category |
| **Medium** | **Afib Rate Control Strategy** | `AfibRateControl` | `Choice` | `Beta Blocker`, `Calcium Channel Blocker`, `Digoxin`, `Amiodarone`, `Combination`, `Pending Initiation`, `N/A` | Pharmacologic rate control compliance |
| **Low** | **Surgery Scheduled Procedure** | `SurgeryProcedure` | `Text` | Single line of text | Scheduled surgical or procedural description |

---

## 2. Complete Cross-Reference Mapping: Application vs. SharePoint Schema

### Module 1: Patient Demographics & Identification

| App Property (`PatientDemographics`) | App Type | SharePoint Internal Name | SharePoint Column Title | SharePoint Type | Matching Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | `PatientName` | Patient Name | `Text` | **Matched** |
| `mrn` | `string` | `MRN` | MRN | `Text` | **Matched** |
| `csn` / `encounter_id` | `string` | `CSN` / `Title` | CSN / Title | `Number` / `Text` | **Matched** |
| `unit` | `string` | `Unit` | Unit | `Choice` | **Matched** |
| `room` | `string` | `Room` | Room | `Number` | **Matched** |
| `campus` | `string` | `Campus` | Campus | `Text` | **Matched** |
| `serviceLine` | `string` | `ServiceLine` | Service Line | `Choice` | **Matched** |
| `admitDate` | `string` (ISO) | `AdmitDate` | Admit Date | `DateTime` | **Matched** |
| `sxDate` | `string` (ISO) | `SxDate` | Sx Date | `DateTime` | **Matched** |
| `edd` | `string` (ISO) | `EDD` | EDD | `DateTime` | **Matched** |
| `riskLvl` | `string` | `RiskLevel` | Risk Level | `Choice` | **Matched** |
| `readmissionRiskPct` | `number` | `ReadmissionRiskPct` | Readmission Risk Percent | `Number` | **Matched** |
| `attendingMD` | `string` | `AttendingMD` | AttendingMD | `Text` | **Matched** |
| `payor` | `string` | `Payor` | Payor | `Text` | **Matched** |
| `disposition` | `string` | `Dispo` | Dispo | `Choice` | **Matched** |
| `clinicalNeeds` | `string` | `ClinicalNeeds` | Clinical Needs to Continue Admission | `Note` | **Matched** |
| `leaderActionItems` | `string` | `LeaderActionItems` | Leader Action Items | `Note` | **Matched** |
| `commentsUpdates` | `string` | `CommentsUpdates` | Comments/Updates | `Note` | **Matched** |
| `nonClinicalDCBarriers` | `string` | `NonClinicalDCBarriers` | Non-Clinical DC Barriers | `Note` | **Matched** |
| `status` | `string` | `Status` | Status | `Choice` | **Matched** |

---

### Module 2: Lines, Tubes, Drains & Bedside Telemetry

| App Property (`PatientDemographics`) | App Type | SharePoint Internal Name | SharePoint Column Title | SharePoint Type | Matching Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `drips` / `activeDrips` | `string[]` | `Drip` | Drip | `MultiChoice` | **Matched** |
| `activeIVDrips` | `string[]` | `ActiveIVDrips` | Active IV Drips | `MultiChoice` | **Gap: Add Column** |
| `chestTube` | `string[]` | `ChestTube` | Tubes & Drains | `MultiChoice` | **Matched** |
| `tubesDrainsOutput24hMl` | `number` | `TubesDrainsOutput24hMl` | Tubes & Drains: Total Output (mL/24 hr) | `Number` | **Matched** |
| `tubesDrainsNotes` | `string` | `TubesDrainsNotes` | Tubes & Drains Notes | `Note` | **Matched** |
| `chestTubeDays` | `number` | `ChestTubeDays` | Chest Tube Days | `Number` | **Gap: Add Column** |
| `bm` / `bmDate` | `string` | `BM` | BM | `Text` | **Matched** |
| `lastBMDate` | `string` | `LastBMDate` | Last Bowel Movement Date | `DateTime` | **Gap: Add Column** |
| `foley` | `string` | `Foley` | Foley Catheter Present | `Choice` | **Gap: Add Column** |
| `foleyStatus` | `string` | `FoleyStatus` | Foley Removal Protocol Status | `Choice` | **Gap: Add Column** |
| `foleyInsertedDate` | `string` | `FoleyInsertedDate` | Foley Insertion Date | `DateTime` | **Gap: Add Column** |
| `rhythm` | `string` | `Rhythm` | Rhythm | `Choice` | **Matched** |
| `anticoagulation` | `string[]` | `Anticoagulation` | Anticoagulation | `MultiChoice` | **Matched** |
| `timeCrit` | `string[]` | `TimeCrit` | Time Crit | `MultiChoice` | **Matched** |
| `mobility` | `string` | `Mobility` | Mobility | `Choice` | **Matched** |
| `fallRisk` | `string` | `FallRisk` | Fall Risk | `Choice` | **Matched** |
| `weightVerified` | `string` | `WeightVerified` | Weight Verified | `Choice` | **Matched** |
| `o2Device` | `string` | `O2Device` | O2 Device | `Text` | **Matched** |
| `o2FlowRate` | `string` | `O2FlowRate` | O2L/% | `Text` | **Matched** |

---

### Module 3: Multidisciplinary Seen Dates & Specialist Consults

| App Property (`SpecialistConsults`) | App Type | SharePoint Internal Name | SharePoint Column Title | SharePoint Type | Matching Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cardiologySignoff` | `string` | `CardiologyConsultSignoff` | Cardiology Consult Sign-off | `Choice` | **Matched** |
| `cardiologyName` | `string` | `CardiologyConsultName` | Cardiology Consultant Name | `Text` | **Matched** |
| `epCardiologySignoff` | `string` | `EPCardiologyConsultSignoff` | EP Cardiology Consult Sign-off | `Choice` | **Matched** |
| `epCardiologyName` | `string` | `EPCardiologyConsultName` | EP Cardiology Consultant Name | `Text` | **Matched** |
| `advancedHFSignoff` | `string` | `AdvancedHFConsultSignoff` | Advanced HF Consult Sign-off | `Choice` | **Matched** |
| `advancedHFName` | `string` | `AdvancedHFConsultName` | Advanced HF Consultant Name | `Text` | **Matched** |
| `ctsSignoff` | `string` | `CTSConsultSignoff` | CTS Consult Sign-off | `Choice` | **Matched** |
| `ctsName` | `string` | `CTSConsultName` | CTS Consultant Name | `Text` | **Matched** |
| `pulmonarySignoff` | `string` | `PulmonaryConsultSignoff` | Pulmonary Consult Sign-off | `Choice` | **Matched** |
| `pulmonaryName` | `string` | `PulmonaryConsultName` | Pulmonary Consultant Name | `Text` | **Matched** |
| `infectiousDiseaseSignoff`| `string` | `InfectiousDiseaseConsultSignoff` | Infectious Disease Consult Sign-off | `Choice` | **Matched** |
| `infectiousDiseaseName` | `string` | `InfectiousDiseaseConsultName` | Infectious Disease Consultant Name | `Text` | **Matched** |
| `hemeOncoSignoff` | `string` | `HemeOncoConsultSignoff` | Heme/Onco Consult Sign-off | `Choice` | **Matched** |
| `hemeOncoName` | `string` | `HemeOncoConsultName` | Heme/Onco Consultant Name | `Text` | **Matched** |
| `giSignoff` | `string` | `GIConsultSignoff` | GI Consult Sign-off | `Choice` | **Matched** |
| `giName` | `string` | `GIConsultName` | GI Consultant Name | `Text` | **Matched** |
| `nephrologySignoff` | `string` | `NephrologyConsultSignoff` | Nephrology Consult Sign-off | `Choice` | **Matched** |
| `nephrologyName` | `string` | `NephrologyConsultName` | Nephrology Consultant Name | `Text` | **Matched** |
| `hospiceSignoff` | `string` | `HospiceConsultSignoff` | Hospice Consult Sign-off | `Choice` | **Matched** |
| `hospiceName` | `string` | `HospiceConsultName` | Hospice Consultant Name | `Text` | **Matched** |
| `palliativeSignoff` | `string` | `PalliativeConsultSignoff` | Palliative Consult Sign-off | `Choice` | **Matched** |
| `palliativeName` | `string` | `PalliativeConsultName` | Palliative Consultant Name | `Text` | **Matched** |
| `endocrinologySignoff` | `string` | `EndocrinologyConsultSignoff` | Endocrinology Consult Sign-off | `Choice` | **Matched** |
| `endocrinologyName` | `string` | `EndocrinologyConsultName` | Endocrinology Consultant Name | `Text` | **Matched** |
| `neurologySignoff` | `string` | `NeurologyConsultSignoff` | Neurology Consult Sign-off | `Choice` | **Matched** |
| `neurologyName` | `string` | `NeurologyConsultName` | Neurology Consultant Name | `Text` | **Matched** |
| `neurosurgerySignoff` | `string` | `NeurosurgeryConsultSignoff` | Neurosurgery Consult Sign-off | `Choice` | **Matched** |
| `neurosurgeryName` | `string` | `NeurosurgeryConsultName` | Neurosurgery Consultant Name | `Text` | **Matched** |
| `otherConsultantMisc` | `string` | `OtherConsultantMisc` | Other Consultant (Misc) | `Note` | **Matched** |
| `otherConsultantMiscSognoff`| `string` | `OtherConsultantMiscSognoff` | Other Consultant (Misc) Sign-off | `Choice` | **Matched** |
| `ptEval` | `string` | `PTOTEval` | PT/OT Eval Completed | `Choice` | **Matched** |
| `ptSeenDate` | `string` | `PT_SeenDate` | PT Seen Date | `DateTime` | **Gap: Add Column** |
| `otSeenDate` | `string` | `OT_SeenDate` | OT Seen Date | `DateTime` | **Gap: Add Column** |
| `slpSeenDate` | `string` | `SLP_SeenDate` | SLP Seen Date | `DateTime` | **Gap: Add Column** |
| `cmSeenDate` | `string` | `CM_SeenDate` | CM Seen Date | `DateTime` | **Gap: Add Column** |
| `swSeenDate` | `string` | `SW_SeenDate` | SW Seen Date | `DateTime` | **Gap: Add Column** |
| `woundCareSeenDate` | `string` | `WoundCare_SeenDate` | Wound Care Seen Date | `DateTime` | **Gap: Add Column** |

---

### Module 4: Disease-Specific Core Measure Pathways

| Pathway Area | Live SharePoint Internal Name | Live Column Title | SharePoint Type | Matching Status |
| :--- | :--- | :--- | :--- | :--- |
| **AMI Medications** | `AMI_Meds` | AMI Medications (`DAPT`, `Statin`, `Beta-blocker`, `ACE/ARB/ARNI`) | `MultiChoice` | **Matched** |
| **AMI Cath / PCI** | `AMI_Cath` | AMI: Heart Cath/PCI This Encounter | `Choice` | **Matched** |
| **AMI Provider** | `AMI_Provider` | AMI: Provider (Date/Name) | `Text` | **Matched** |
| **AMI Cardiac Rehab** | `AMI_Rehab` | AMI: Cardiac Rehab Referral | `Choice` | **Matched** |
| **CABG Medications** | `CABG_Meds` | CABG Medications | `MultiChoice` | **Matched** |
| **CABG Encounter** | `CABG_Encounter` | CABG: This Encounter | `Choice` | **Matched** |
| **CABG Surgeon** | `CABG_Surgeon` | CABG: Surgeon (Date/Name) | `Text` | **Matched** |
| **CABG Glycemic** | `CABG_Glycemic` | CABG: Glycemic Control Plan | `Choice` | **Matched** |
| **CABG Navigator** | `CABG_Navigator` | CABG: Navigator Contact AVS | `Choice` | **Matched** |
| **COPD Regimen** | `COPD_Regimen` | COPD: Inhaler/Neb Regimen Optimized | `Choice` | **Matched** |
| **COPD Technique** | `COPD_Technique` | COPD: Inhaler Technique Education | `Choice` | **Matched** |
| **COPD Plan** | `COPD_Plan` | COPD: Steroid/Antibiotic Plan | `Choice` | **Matched** |
| **COPD Smoking** | `COPD_Smoking` | COPD: Smoking Cessation | `Choice` | **Matched** |
| **COPD Rehab** | `COPD_Rehab` | COPD: Pulmonary Rehab Referral | `Choice` | **Matched** |
| **COPD Walk Test** | `COPD_WalkTest` | COPD: Walk Test 24-48 hrs | `Choice` | **Matched** |
| **HF Medications** | `HF_Meds` | HF Medications (`Diuretic`, `Beta-Blocker`, `ACE/ARB/ARNI`, `MRAs`, `SGLT2`) | `MultiChoice` | **Matched** |
| **HF Standing Weight**| `HF_StandingWeight` | HF: Daily Standing Weight | `Choice` | **Matched** |
| **HF Order Set** | `HF_OrderSet` | HF: CHF Order Set EPIC | `Choice` | **Matched** |
| **HF Rehab Phase 1** | `HF_RehabPhase1` | HF: Cardiac Rehab Phase I | `Choice` | **Matched** |
| **HF Sodium / Fluid**| `HF_Sodium` / `HF_Fluid` | HF: Sodium Restriction / Fluid Restriction | `Choice` | **Matched** |
| **HF Diuretic Plan** | `HF_DiureticPlan` | HF: Diuretic Plan for DC | `Choice` | **Matched** |
| **HF Dry Weight** | `HF_DryWeight` | HF: Dry Weight on AVS | `Choice` | **Matched** |
| **PNA IS Education** | `PNA_ISEd` | PNA: IS Education Teach-back | `Choice` | **Matched** |
| **PNA IS Use** | `PNA_ISUse` | PNA: IS Usage Documented | `Choice` | **Matched** |
| **PNA Plan** | `PNA_Plan` | PNA: Steroid & Antibiotic Plan | `Choice` | **Matched** |
| **THK Pain Education**| `THK_PainEd` | THK: Pain Med Education | `Choice` | **Matched** |
| **THK VTE Prophylaxis**| `THK_VTE` | THK: VTE Prophylaxis | `Choice` | **Matched** |
| **THK PT/OT** | `THK_PTOT` | THK: PT/OT Arranged | `Choice` | **Matched** |
| **THK DME** | `THK_DME` | THK: DME Arranged | `Choice` | **Matched** |

---

### Module 5: Clinical Leadership Governance & Scores

| App Property | App Type | SharePoint Internal Name | SharePoint Column Title | SharePoint Type | Matching Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `postHuddleActionItemUpdate` | `string` | `POST_x0020_Huddle_x0020_Action_x` | POST Huddle Action Item Update | `Note` | **Matched** |
| `nursingActionItemFollowUp` | `string` | `Nursing_x0020_Action_x0020_Item_` | Nursing Action Item Follow Up (NM Owner) | `Note` | **Matched** |
| `caseManagementLeaderReview`| `string` | `CM_x0020_Leader_x0020_Review` | CM Leader Review | `Note` | **Matched** |
| `postCMHuddleFollowUp` | `string` | `POST_x0020_CM_x0020_Huddle_x0020` | POST CM Huddle Follow Up | `Note` | **Matched** |
| `overallReadinessScore` | `number` | `DischargeScore` | Discharge Score (%) | `Number` | **Matched** |
| `coreMeasureScore` | `number` | `CoreMeasureCompliance` | Core Measure Compliance (%) | `Number` | **Matched** |

---

## 3. Data Transformation & Normalization Rules

When syncing data between SurgiFlow and SharePoint, the projection engine (`src/storage/sharePointSchema.ts`) applies these rules:

1. **Risk Stratification Normalization**:
   - App: `'High'` $\rightarrow$ SharePoint: `'High >22%'`
   - App: `'Medium'` $\rightarrow$ SharePoint: `'Medium 13% to 22%'`
   - App: `'Low'` $\rightarrow$ SharePoint: `'Low <=12%'`

2. **Discharge Disposition Normalization**:
   - App: `'Home No Needs'` $\rightarrow$ SharePoint: `'Home No Needs'`
   - App: `'Home Health Care'` $\rightarrow$ SharePoint: `'HHC'`
   - App: `'Home Health Care + DME'` $\rightarrow$ SharePoint: `'HHC DME'`
   - App: `'Home Health Care + ABX'` $\rightarrow$ SharePoint: `'HHC ABX'`
   - App: `'Home Health Care + ABX + DME'` $\rightarrow$ SharePoint: `'HHC ABX DME'`
   - App: `'Skilled Nursing Facility'` $\rightarrow$ SharePoint: `'SNF'`
   - App: `'Inpatient Rehabilitation'` $\rightarrow$ SharePoint: `'IPR-AH'`

3. **MultiChoice Serialization**:
   - MultiChoice arrays (e.g. `['Heparin', 'Insulin']`) are passed directly as typed arrays to SharePoint REST API payloads or mapped to valid choice sets.
