# SF-COIP Dedicated SharePoint List Schema & Provisioning Guide

**Target SharePoint List Name**: `SurgiFlow CCOIP Reviews`  
**System Code**: `SF-COIP` (Clinical Operations Intelligence Platform / Readmission Surveillance Registry)  
**Parent Site**: AdventHealth SurgiFlow SharePoint Site Collection  
**Application Version**: `v3.0.5`  
**Primary Link Keys**: `MRN` (Medical Record Number) & `CCOIP_RevisitCSN` (Contact Serial Number)  

---

## 1. Architectural Overview & Relationship Model

The **SurgiFlow 2-List Architecture** separates high-frequency bedside clinical monitoring from deep-dive readmission quality surveillance and leadership action planning:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SurgiFlow Master List                           │
│  - Active inpatient floor census (GT6, GT7, GT8, WT8)                 │
│  - Real-time vitals, telemetry rhythms, active IV drips, chest tubes   │
│  - Daily bedside huddle readiness audits                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Linked by MRN & CSN
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                SurgiFlow CCOIP Reviews (2nd List)                      │
│  - 30-day readmission matching & root cause surveillance               │
│  - Jade Heart Failure (CHF) 8-element quality bundle                   │
│  - Multidisciplinary longitudinal review & executive action plans      │
│  - Historical case archives & audit trail                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Column Schema Specification

Below is the complete field definition table for creating the **`SurgiFlow CCOIP Reviews`** SharePoint List:

### Section A: Patient & Encounter Linking Keys

| Column Display Name | Internal Name | SharePoint Type | Required? | Configuration & Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient Name** | `Title` | Single line of text | **Yes** | Standard built-in Title column | De-identified / Star Wars SF pseudonym or clinical name |
| **MRN** | `MRN` | Single line of text | **Yes** | Indexed column | Medical Record Number |
| **Revisit CSN** | `CCOIP_RevisitCSN` | Single line of text | **Yes** | Indexed column (Unique Encounter Key) | Readmission encounter identifier |
| **Index CSN** | `CCOIP_IndexCSN` | Single line of text | No | Single line | Prior index hospitalization encounter identifier |
| **Unit** | `Unit` | Choice | No | `GT6 - CVSICU`, `GT7 - CVICU`, `GT8 - Cardiac Stepdown`, `WT8 - Cardiac Surgery`, `Other` | Inpatient nursing unit on readmission |
| **Room Number** | `Room` | Number | No | Integer, 0 decimals | Hospital room location |
| **Admitting Service Line** | `ServiceLine` | Choice | No | `Cardiology`, `Cardiothoracic Surgery`, `Vascular Surgery`, `Heart Failure / VAD`, `Structural Heart`, `General Medicine` | Admitting clinical service |

---

### Section B: Readmission Surveillance & Complexity Profiling

| Column Display Name | Internal Name | SharePoint Type | Required? | Configuration & Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Days to Revisit** | `CCOIP_DaysToRevisit` | Number | **Yes** | Integer, 0 decimals | Number of elapsed calendar days between index discharge and readmit |
| **Readmission ≤ 30 Days** | `CCOIP_Readmit30d` | Choice | **Yes** | `Yes`, `No` | Primary 30-day penalty cohort filter |
| **Planned Readmission** | `CCOIP_PlannedReadmit`| Choice | **Yes** | `Yes`, `No`, `Unsure` | Staged procedures or unavoidable scheduled revisits |
| **Readmitted From** | `CCOIP_ReadmittedFrom`| Choice | No | `Home`, `SNF`, `IPR`, `ED`, `Outside Hospital`, `Assisted Living`, `Other` | Pre-readmission living setting |
| **Revisits in Past 6 Mo** | `CCOIP_Revisits6Mo` | Number | No | Integer | High-utilizer inpatient tracking |
| **ED Visits in Past 6 Mo** | `CCOIP_EDVisits6Mo` | Number | No | Integer | Bounce-back emergency department tracking |
| **Patient Complexity** | `CCOIP_Complexity` | Choice | **Yes** | `Low`, `Moderate`, `High`, `Extreme - Multi-Organ` | Multi-morbidity and clinical acuity stratification |
| **Full Code Status** | `CCOIP_CodeStatus` | Choice | No | `Full Code`, `DNR/DNI`, `Comfort Care`, `Modified` | Goals of care & palliative alignment |
| **Transitional Support Following**| `CCOIP_TSFollowing` | Choice | No | `Yes`, `No`, `N/A` | Dedicated navigator / care coordinator involvement |
| **SNF/IPR Placement Barriers**| `CCOIP_PostAcuteIssues`| Multiple lines of text | No | Plain text | Post-acute care authorization or placement hurdles |

---

### Section C: Jade Heart Failure (CHF) Quality Bundle

| Column Display Name | Internal Name | SharePoint Type | Required? | Configuration & Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Jade: Coordinator F2F Visit** | `Jade_CoordinatorF2F` | Choice | No | `Yes`, `No`, `Patient Refused`, `N/A` | Bedside Heart Failure educator consult completed |
| **Jade: HF Order Set Used** | `Jade_OrderSet` | Choice | No | `Yes`, `No`, `Partial` | Guideline-directed clinical order set utilized |
| **Jade: Daily Weights Ordered** | `Jade_DailyWeights` | Choice | No | `Yes`, `No` | Standing daily standing weight order active |
| **Jade: Weight Variations Addressed** | `Jade_WeightVariations`| Choice | No | `Yes`, `No`, `N/A` | Diuretic adjustments made for weight spikes |
| **Jade: Sodium Restriction Documented**| `Jade_SodiumDocumented`| Choice | No | `Yes`, `No` | ≤ 2g sodium diet education charted |
| **Jade: Fluid Restriction Documented** | `Jade_FluidRestriction` | Choice | No | `Yes`, `No` | Fluid restriction order and education charted |
| **Jade: Diuretic Transition Plan** | `Jade_DiureticPlan` | Choice | No | `Yes`, `No`, `Pending` | IV-to-oral diuretic conversion and discharge dosage plan |
| **Jade: Discharge Dry Weight in AVS** | `Jade_DryWeightAVS` | Choice | No | `Yes`, `No` | Baseline dry weight printed on After Visit Summary |
| **Jade CHF Bundle Score** | `Jade_BundleScore` | Number | No | Number (0 to 8 points or 0–100%) | Composite CHF bundle compliance score |

---

### Section D: Clinical Leadership Governance & Longitudinal Narrative

| Column Display Name | Internal Name | SharePoint Type | Required? | Configuration & Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Review Status** | `CCOIP_ReviewStatus` | Choice | **Yes** | `NEW`, `IN REVIEW`, `COMPLETE`, `FOLLOW-UP`, `ESCALATED`, `CLOSED` | Leadership review workflow gate |
| **Opportunities & Gaps** | `CCOIP_Opportunities` | Multiple lines of text | No | Plain text | Identified clinical, transition, or medication gaps |
| **Clinical History Summary** | `CCOIP_ClinicalHistory`| Multiple lines of text | No | Plain text | Narrative summary of baseline comorbidities |
| **Hospital Course Summary** | `CCOIP_HospitalCourse` | Multiple lines of text | No | Plain text | Narrative summary of readmission inpatient trajectory |
| **Multidisciplinary Action Plan** | `CCOIP_ActionPlan` | Multiple lines of text | No | Plain text | Clear follow-up assignments & accountability |
| **Review Completion Percentage** | `CCOIP_CompletionPct` | Number | **Yes** | Percentage (0–100%) | Form and audit completeness meter |
| **Reviewer Name / Signoff** | `CCOIP_Reviewer` | Single line of text | No | Name / Clinical Title | Lead clinician completing audit |
| **Full CCOIP Payload JSON** | `CCOIP_PayloadJSON` | Multiple lines of text | No | Plain text (Raw JSON) | Serialized snapshot of complete audit trail |

---

## 3. Automated PnP PowerShell Provisioning Script

Run the following PowerShell script to provision the list and all fields automatically in Microsoft 365:

```powershell
# Connect to SharePoint Site
$SiteUrl = "https://yourorg.sharepoint.com/sites/SurgiFlow"
Connect-PnPOnline -Url $SiteUrl -Interactive

$ListName = "SurgiFlow CCOIP Reviews"

# 1. Create List
New-PnPList -Title $ListName -Template GenericList -EnableVersioning

# 2. Add Patient Linking Fields
Add-PnPField -List $ListName -DisplayName "MRN" -InternalName "MRN" -Type Text -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Revisit CSN" -InternalName "CCOIP_RevisitCSN" -Type Text -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Index CSN" -InternalName "CCOIP_IndexCSN" -Type Text -AddToDefaultView
Add-PnPField -List $ListName -DisplayName "Unit" -InternalName "Unit" -Type Choice -Choices @("GT6 - CVSICU","GT7 - CVICU","GT8 - Cardiac Stepdown","WT8 - Cardiac Surgery","Other") -AddToDefaultView
Add-PnPField -List $ListName -DisplayName "Room" -InternalName "Room" -Type Number -AddToDefaultView
Add-PnPField -List $ListName -DisplayName "Service Line" -InternalName "ServiceLine" -Type Choice -Choices @("Cardiology","Cardiothoracic Surgery","Vascular Surgery","Heart Failure / VAD","Structural Heart","General Medicine")

# 3. Add Readmission Surveillance Fields
Add-PnPField -List $ListName -DisplayName "Days to Revisit" -InternalName "CCOIP_DaysToRevisit" -Type Number -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Readmission <= 30 Days" -InternalName "CCOIP_Readmit30d" -Type Choice -Choices @("Yes","No") -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Planned Readmission" -InternalName "CCOIP_PlannedReadmit" -Type Choice -Choices @("Yes","No","Unsure") -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Readmitted From" -InternalName "CCOIP_ReadmittedFrom" -Type Choice -Choices @("Home","SNF","IPR","ED","Outside Hospital","Assisted Living","Other")
Add-PnPField -List $ListName -DisplayName "Revisits in Past 6 Mo" -InternalName "CCOIP_Revisits6Mo" -Type Number
Add-PnPField -List $ListName -DisplayName "ED Visits in Past 6 Mo" -InternalName "CCOIP_EDVisits6Mo" -Type Number
Add-PnPField -List $ListName -DisplayName "Patient Complexity" -InternalName "CCOIP_Complexity" -Type Choice -Choices @("Low","Moderate","High","Extreme - Multi-Organ") -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Full Code Status" -InternalName "CCOIP_CodeStatus" -Type Choice -Choices @("Full Code","DNR/DNI","Comfort Care","Modified")
Add-PnPField -List $ListName -DisplayName "Transitional Support Following" -InternalName "CCOIP_TSFollowing" -Type Choice -Choices @("Yes","No","N/A")
Add-PnPField -List $ListName -DisplayName "SNF/IPR Placement Barriers" -InternalName "CCOIP_PostAcuteIssues" -Type Note

# 4. Add Jade Heart Failure Bundle Fields
Add-PnPField -List $ListName -DisplayName "Jade: Coordinator F2F Visit" -InternalName "Jade_CoordinatorF2F" -Type Choice -Choices @("Yes","No","Patient Refused","N/A")
Add-PnPField -List $ListName -DisplayName "Jade: HF Order Set Used" -InternalName "Jade_OrderSet" -Type Choice -Choices @("Yes","No","Partial")
Add-PnPField -List $ListName -DisplayName "Jade: Daily Weights Ordered" -InternalName "Jade_DailyWeights" -Type Choice -Choices @("Yes","No")
Add-PnPField -List $ListName -DisplayName "Jade: Weight Variations Addressed" -InternalName "Jade_WeightVariations" -Type Choice -Choices @("Yes","No","N/A")
Add-PnPField -List $ListName -DisplayName "Jade: Sodium Restriction Documented" -InternalName "Jade_SodiumDocumented" -Type Choice -Choices @("Yes","No")
Add-PnPField -List $ListName -DisplayName "Jade: Fluid Restriction Documented" -InternalName "Jade_FluidRestriction" -Type Choice -Choices @("Yes","No")
Add-PnPField -List $ListName -DisplayName "Jade: Diuretic Transition Plan" -InternalName "Jade_DiureticPlan" -Type Choice -Choices @("Yes","No","Pending")
Add-PnPField -List $ListName -DisplayName "Jade: Discharge Dry Weight in AVS" -InternalName "Jade_DryWeightAVS" -Type Choice -Choices @("Yes","No")
Add-PnPField -List $ListName -DisplayName "Jade CHF Bundle Score" -InternalName "Jade_BundleScore" -Type Number -AddToDefaultView

# 5. Add Governance & Narrative Fields
Add-PnPField -List $ListName -DisplayName "Review Status" -InternalName "CCOIP_ReviewStatus" -Type Choice -Choices @("NEW","IN REVIEW","COMPLETE","FOLLOW-UP","ESCALATED","CLOSED") -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Opportunities & Gaps" -InternalName "CCOIP_Opportunities" -Type Note
Add-PnPField -List $ListName -DisplayName "Clinical History Summary" -InternalName "CCOIP_ClinicalHistory" -Type Note
Add-PnPField -List $ListName -DisplayName "Hospital Course Summary" -InternalName "CCOIP_HospitalCourse" -Type Note
Add-PnPField -List $ListName -DisplayName "Multidisciplinary Action Plan" -InternalName "CCOIP_ActionPlan" -Type Note
Add-PnPField -List $ListName -DisplayName "Review Completion %" -InternalName "CCOIP_CompletionPct" -Type Number -AddToDefaultView -Required
Add-PnPField -List $ListName -DisplayName "Reviewer Signoff" -InternalName "CCOIP_Reviewer" -Type Text
Add-PnPField -List $ListName -DisplayName "Full CCOIP Payload JSON" -InternalName "CCOIP_PayloadJSON" -Type Note

# 6. Index Primary Query Keys
Set-PnPFieldIndex -List $ListName -Field "MRN" -Add
Set-PnPFieldIndex -List $ListName -Field "CCOIP_RevisitCSN" -Add

Write-Host "SurgiFlow CCOIP Reviews list provisioned successfully!" -ForegroundColor Green
```

---

## 4. Power Automate Webhook Integration Payload

When saving or completing a CCOIP Review, SurgiFlow emits the following JSON structure to the Power Automate endpoint:

```json
{
  "encounterId": 14,
  "patientName": "ELEANOR VANCE",
  "mrn": "90481234",
  "revisitCsn": "CSN-8849201",
  "indexCsn": "CSN-8720194",
  "unit": "GT8 - Cardiac Stepdown",
  "room": 814,
  "serviceLine": "Cardiology",
  "daysToRevisit": 11,
  "readmission30d": "Yes",
  "plannedReadmit": "No",
  "readmittedFrom": "Home",
  "revisits6Mo": 2,
  "edVisits6Mo": 1,
  "complexity": "High",
  "codeStatus": "Full Code",
  "transitionalSupport": "Yes",
  "postAcuteIssues": "Home diuretic adherence gap identified.",
  "jadeChf": {
    "coordinatorF2F": "Yes",
    "orderSetUsed": "Yes",
    "dailyWeights": "Yes",
    "weightVariationsAddressed": "Yes",
    "sodiumDocumented": "Yes",
    "fluidRestriction": "Yes",
    "diureticPlan": "Yes",
    "dryWeightInAVS": "Yes",
    "bundleScore": 8
  },
  "narrative": {
    "reviewStatus": "COMPLETE",
    "opportunities": "Home weight monitoring log was not reinforced at prior discharge.",
    "clinicalHistory": "68yo F with HFrEF (EF 25%), CKD Stage III, DM2.",
    "hospitalCourse": "Presented in acute decompensated HF with 12 lb weight gain. Successfully diuresed with IV Bumex.",
    "actionPlan": "Transitional care navigator assigned for 48h post-discharge home visit. HF clinic visit booked for Day 5.",
    "completionPct": 100,
    "reviewer": "Dr. Sarah Jenkins, MD"
  }
}
```
