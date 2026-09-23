# SurgiFlow: Enterprise O365 & SharePoint Integration Guide
This comprehensive step-by-step setup guide outlines how to integrate the **SurgiFlow Bedside Huddle Tracking Console** directly into your Microsoft Office 365, SharePoint Online, Power Platform (Power Apps & Power Automate), and Microsoft Entra ID (formerly Azure Active Directory) ecosystem.

By following these instructions, your medical organization can establish a secure, two-way, real-time data pipeline from the patient bedside to clinical administration.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Step-by-Step SharePoint List Setup](#2-step-by-step-sharepoint-list-setup)
3. [Step-by-Step Power Automate Webhook Flow Configuration](#3-step-by-step-power-automate-webhook-flow-configuration)
4. [Customizing Power Apps Mobile Forms](#4-customizing-power-apps-mobile-forms)
5. [Two-Way Synchronization (Excel/CSV Template Guide)](#5-two-way-synchronization-excelcsv-template-guide)
6. [Native SharePoint Web Part Deployment (SPFx)](#6-native-sharepoint-web-part-deployment-spfx)
7. [Microsoft Entra ID (Azure AD) Single Sign-On (SSO) Registration](#7-microsoft-entra-id-azure-ad-single-sign-on-sso-registration)
8. [Applet Congruence & Field Mapping Reference](#8-applet-congruence--field-mapping-reference)
9. [Dedicated 2nd SharePoint List: SurgiFlow CCOIP Reviews](#9-dedicated-2nd-sharepoint-list-surgiflow-ccoip-reviews)

---

## 1. Architecture Overview

SurgiFlow utilizes a **hybrid-modern lightweight architecture** designed for high availability, compliance, and effortless installation inside existing O365 tenants:

```
[ Bedside Audit Form (React App / SPFx Web Part) ]
                      │
                      ▼ (HTTP POST JSON)
[ Power Automate Trigger Flow (O365 Cloud Flow) ]
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
[ SharePoint List Database ]   [ O365 Excel Data Feed ]
```

- **Client Layer:** Runs inside the browser or as a native SharePoint Web Part. It collects clinical readiness checks, computes safety scores, and evaluates diagnostic gaps in real-time.
- **Transport Layer:** Power Automate HTTP Webhook endpoint that receives secure JSON payloads.
- **Storage Layer:** A SharePoint Custom List tracks audited patients, and optionally feeds an Excel OneDrive spreadsheet or Power BI reporting dashboard.

---

## 2. Step-by-Step SharePoint List Setup

To house SurgiFlow's patient audits, you must create a custom list inside your site collection.

### Instructions:
1. Navigate to your Microsoft SharePoint Online site.
2. Click **+ New** > **List** > Select **Blank List**.
3. Name the list `SurgiFlow Patient Huddle Audits`.
4. Create the following columns using the exact settings below:

### Columns Definition Table

| Display Name | Internal/Field Name | Field Type | Choices / Configuration | Required? | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Title** | `Title` | Single line of text | *Built-in* | **Yes** | Patient Full Name |
| **MRN** | `MRN` | Single line of text | *Index this column* | **Yes** | Patient Medical Record Number |
| **Patient Age** | `PatientAge` | Number | Integer, 0 decimals | No | Age in years |
| **Risk Stratification** | `RiskStratification` | Choice | `Low`, `Medium`, `High` | **Yes** | Discharge risk tier classification |
| **Discharge Score** | `DischargeScore` | Number | Decimal, Percentage format | **Yes** | Computed readiness score (0-100) |
| **Unit Location** | `UnitLocation` | Single line of text | e.g., `ICU-2A`, `CCU-3` | No | Ward or unit assignment |
| **Primary Diagnoses** | `PrimaryDiagnosis` | Single line of text | Comma-separated | No | Active pathway guides (e.g. HF, COPD) |
| **Audit Gaps** | `AuditGaps` | Multiple lines of text | Plain text or Rich text | No | Checklist items marked "No" (threats) |
| **Huddle Status** | `HuddleStatus` | Choice | `Huddle Completed`, `Escalated`, `Safe to Discharge` | **Yes** | Live status tracking |
| **Audited By** | `AuditedBy` | Person or Group | Include photo, Show name | **Yes** | Clinical practitioner doing the audit |
| **Huddle Date** | `HuddleDate` | Date and Time | Include Time (12-hour or 24-hour) | **Yes** | Date/Time of huddle completion |
| **Huddle Payload JSON** | `HuddlePayloadJSON` | Multiple lines of text | Plain text (maximum length) | No | Full serialized JSON for deep reporting |

> **💡 Best Practice:** Storing the entire huddle audit payload as a serialized JSON string in the `HuddlePayloadJSON` column avoids creating 50 separate SharePoint columns for secondary fields (like VAD parameters or specialist consult names). You can parse this field dynamically in Power BI!

---

## 3. Step-by-Step Power Automate Webhook Flow Configuration

Power Automate serves as the glue, routing huddle completions from SurgiFlow directly into SharePoint.

### Instructions to build the flow:
1. Go to [Power Automate (make.powerautomate.com)](https://make.powerautomate.com) and log in with your corporate O365 credentials.
2. Select **+ Create** > **Instant cloud flow**.
3. Name your flow `SurgiFlow Bedside Huddle Receiver`.
4. Choose the **When an HTTP request is received** trigger, and click **Create**.
5. Inside the HTTP trigger configuration, click **Use sample payload to generate schema** and paste the following JSON:

```json
{
  "patientName": "TED MOYER",
  "patientMRN": "20394711",
  "patientAge": "71",
  "riskStratification": "High",
  "overallReadinessScore": 85,
  "gapsCount": 2,
  "outstandingGaps": [
    "DAPT medications configured on discharge orders",
    "PCP Follow-up scheduled within 7 days"
  ],
  "campus": "AH West",
  "unit": "ICU-2A",
  "insurancePayor": "Medicare Part B",
  "admitDate": "2026-07-01",
  "primaryPathways": ["ami", "hf"],
  "finalSafetyHuddleComplete": "Yes",
  "huddleAuditTimestamp": "2026-07-20T08:00:00.000Z",
  "auditTriggerUrl": "https://surgiflow.example.com"
}
```

6. Click **+ New Step** and search for the **SharePoint: Create item** action.
7. Configure the **Create item** action as follows:
   - **Site Address:** Select your SharePoint site collection.
   - **List Name:** Select `SurgiFlow Patient Huddle Audits`.
   - **Title:** Map to `patientName` from the dynamic content list.
   - **MRN:** Map to `patientMRN`.
   - **Patient Age:** Map to `patientAge` (converted to int if necessary).
   - **Risk Stratification Value:** Select *Enter custom value* and map to `riskStratification`.
   - **Discharge Score:** Map to `overallReadinessScore`.
   - **Unit Location:** Map to `unit`.
   - **Primary Diagnoses:** Map to `Join(triggerBody()?['primaryPathways'], ', ')` using the expression editor.
   - **Audit Gaps:** Map to `Join(triggerBody()?['outstandingGaps'], decodeUriComponent('%0A'))` (newline separator).
   - **Huddle Status Value:** Select *Enter custom value* and map to `finalSafetyHuddleComplete` (e.g. Map 'Yes' to 'Safe to Discharge').
   - **Audited By Claims:** Enter the email of the person executing (or default to the Flow Owner).
   - **Huddle Date:** Map to `huddleAuditTimestamp`.
   - **Huddle Payload JSON:** Map to `string(triggerBody())` (converts full request to plain text).

8. Save the Flow.
9. **Copy the generated HTTP POST URL** from the HTTP trigger step.
10. Paste this URL into the **SurgiFlow Integration Webhook** field in Section 5 of the app to enable direct triggers!

---

## 4. Customizing Power Apps Mobile Forms

If your clinical staff uses tablets or phones at the bedside, you can build a companion Power App that references the same SharePoint database.

### Instructions:
1. Open your `SurgiFlow Patient Huddle Audits` list in SharePoint.
2. In the top command ribbon, click **Integrate** > **Power Apps** > **Create an app**.
3. Name the app `SurgiFlow Bedside Companion` and click **Create**.
4. Power Apps will automatically generate a three-screen mobile application:
   - **Browse Screen:** Lists all patients currently undergoing huddle audits, sorted by MRN or Room.
   - **Detail Screen:** Shows a rich layout of scores, safety gates, and active clinical gaps.
   - **Edit Screen:** Allows nurse managers to update action items, sign-off specialist consults, and mark barriers directly from a phone.
5. Apply corporate theme styling (Deep Navy and Slate Gray) to align the Power App with SurgiFlow's visual system.

---

## 5. Two-Way Synchronization (Excel/CSV Template Guide)

For simple administrative audits, SurgiFlow supports off-line CSV synchronization:
1. **Download the Template:** Navigate to Section 5, choose the **CSV/Excel Template** tab, and click **Download Excel/CSV Template**.
2. **Formatting Guide:**
   - **Room-Bed:** Use standard string format like `804-A`.
   - **MRN:** 8-digit hospital record integer (e.g., `20394711`).
   - **Primary Pathways:** Choose from `ami`, `cabg`, `copd`, `hf`, `pneumonia`, `thk`.
3. **Daily Syncing:** Nurse coordinators fill out the Excel sheet during shift huddles, save it on OneDrive, and Power Automate imports the rows automatically into SharePoint twice daily.

---

## 6. Native SharePoint Web Part Deployment (SPFx)

You can run SurgiFlow directly as a web part inside SharePoint pages.

### Manifest Configuration (`SurgiFlowWebPart.manifest.json`)
Create an SPFx component using the Yeoman Generator (`yo @microsoft/sharepoint`) and insert this manifest:
```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/v1.15/client-side-web-part-manifest.schema.json",
  "id": "544ce064-0979-4679-9a7c-bb8390fbb8a2",
  "alias": "SurgiFlowWebPart",
  "componentType": "WebPart",
  "supportedHosts": ["SharePointWebPart", "TeamsTab"],
  "version": "4.0.0",
  "manifestVersion": 2,
  "preconfiguredEntries": [{
    "groupId": "544ce064-0979-4679-9a7c-bb8390fbb8a2",
    "group": { "default": "Under Medical & Clinical" },
    "title": { "default": "SurgiFlow Bedside Huddle" },
    "description": { "default": "SurgiFlow perfect discharge transitions web part" },
    "officeDisplayName": { "default": "SurgiFlow" },
    "properties": {
      "description": "SurgiFlow Bedside Tracker console"
    }
  }]
}
```

### React SPFx TSX Wrapper (`SurgiFlowWebPart.ts`)
```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import App from './components/App';

export default class SurgiFlowWebPart extends BaseClientSideWebPart<any> {
  public render(): void {
    const element: React.ReactElement<any> = React.createElement(App, {
      context: this.context,
      userDisplayName: this.context.pageContext.user.displayName,
      userEmail: this.context.pageContext.user.email
    });
    ReactDom.render(element, this.domElement);
  }
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
```

### Build & Package Commands:
Run these commands in your SPFx development environment:
```bash
# Install SPFx generator dependencies
npm install -g yo @microsoft/generator-sharepoint

# Initialize the template
yo @microsoft/sharepoint --framework react --componentType webpart --componentName SurgiFlow

# Copy SurgiFlow React files into 'src/webparts/surgiFlow/'
# Build optimized production assets and package
gulp bundle --ship && gulp package-solution --ship
```
*Drag and drop the resulting `/sharepoint/solution/surgiflow.sppkg` file directly into your **SharePoint App Catalog**.*

---

## 7. Microsoft Entra ID (Azure AD) Single Sign-On (SSO) Registration

To enable secure single-sign-on (SSO) and direct access to the Microsoft Graph API, you must register SurgiFlow inside Microsoft Entra ID.

### App Registration Steps:
1. Log in to the [Microsoft Entra Admin Center](https://entra.microsoft.com) as an Application Administrator.
2. Go to **Identity** > **Applications** > **App registrations** > Click **+ New registration**.
3. Configure the registration:
   - **Name:** `SurgiFlow Huddle Tracker`
   - **Supported account types:** *Accounts in this organizational directory only (Single tenant)*
   - **Redirect URI:** Select **Single-page application (SPA)** and enter:
     `https://YOUR_ORGANIZATION_SHARPOINT_DOMAIN/_forms/spfx.aspx`
4. Click **Register**.

### API Permissions (Microsoft Graph):
SurgiFlow requires permissions to read the logged-in user's profile and query clinical group directories.
1. Inside the app registration menu, click **API permissions** > **+ Add a permission**.
2. Select **Microsoft Graph** > **Delegated permissions**.
3. Search for and check the following scopes:
   - `User.Read` (Read the active clinician's profile, name, and email)
   - `Group.Read.All` (Verify access permissions to specific hospital ward groups)
   - `Sites.ReadWrite.All` (Required if sending audits directly to SharePoint lists via API)
4. Click **Add permissions**.
5. **Grant admin consent:** Click the **Grant admin consent for [Your Organization]** button to authorize these scopes tenant-wide.

---

## 8. Applet Congruence & Field Mapping Reference

SurgiFlow's React-based data model is fully aligned with standard SharePoint schema types. The matrix below outlines how state keys map to backend values:

| React State Key (Applet) | SharePoint Column Name | Data Format | Mapping Logic / Congruence Notes |
| :--- | :--- | :--- | :--- |
| `demographics.name` | `Title` | String | Direct text mapping |
| `demographics.mrn` | `MRN` | String (Indexed) | Direct text mapping (Indexed for fast lookups) |
| `metrics.overallScore` | `DischargeScore` | Number | Multiplied by 100 on post, maps to percentage |
| `demographics.riskLvl` | `RiskStratification` | Choice | Values perfectly match (`Low`, `Medium`, `High`) |
| `gapsCount` | *Mapped in JSON* | Integer | Number of uncompleted safety rules |
| `outstandingGaps` | `AuditGaps` | Multiline Text | Array is joined with line breaks `\n` |
| `demographics.sxDate` | `SxDate` | Date/String | Mapped if surgical pathway is active |
| `demographics.surgery` | `Surgery` | String | Surgical procedure code / text |
| `specialistConsults` | *JSON Payload field* | JSON String | Contains individual provider sign-offs (Cardiology, CTS, EP, etc.) |
| `vadChecks` | *JSON Payload field* | JSON String | Tracks mechanical assist speed setting, dressing changes, and co-sign RN |
| `postHuddleNotes` | `PostHuddleNotes` | Multiline Text | Holds leader action reviews and follow-ups |

### Errors, Warnings, or Schema Gaps:
- **No Native Array Storage in SharePoint:** Array types in the applet (e.g. `anticoagulation: string[]`, `ivMeds: string[]`, `outstandingGaps: string[]`) cannot be saved directly into standard single-line columns in SharePoint.
  - *Correction:* Power Automate automatically handles this by converting arrays to comma-separated strings using `join()` before writing them to text columns.
- **Index Optimization Required for MRN:** To guarantee high-speed search across thousands of historical audits, make sure to add an Index to the `MRN` column inside SharePoint List settings under *List Settings > Indexed Columns*.

---

## 9. Dedicated 2nd SharePoint List: SurgiFlow CCOIP Reviews

To support deep-dive **Readmission Quality Surveillance**, the **Jade Heart Failure (CHF) Bundle**, and **Clinical Leadership Governance Action Plans** without bloating the daily bedside huddle list, SurgiFlow implements a **2-List Architecture**:

```
 ┌────────────────────────────────────────────────────────┐
 │           SurgiFlow Master / Daily Census              │
 │  (Bedside vitals, telemetry, chest tubes, active drips) │
 └───────────────────────────┬────────────────────────────┘
                             │ Linked by MRN & CSN
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │        SurgiFlow CCOIP Reviews (2nd List)              │
 │  (Readmission root causes, Jade CHF, Action Plans)     │
 └────────────────────────────────────────────────────────┘
```

### List 2 Setup Instructions:
1. In your SharePoint site collection, click **+ New** > **List** > **Blank List**.
2. Name the list **`SurgiFlow CCOIP Reviews`**.
3. Configure the list columns using the schema below:

### Complete CCOIP Schema Table:

| Column Title | Internal / Field Name | SharePoint Type | Options / Configuration | Required? |
| :--- | :--- | :--- | :--- | :--- |
| **Patient Name** | `Title` | Single line of text | *Built-in Title column* | **Yes** |
| **MRN** | `MRN` | Single line of text | *Indexed Column* | **Yes** |
| **Revisit CSN** | `CCOIP_RevisitCSN` | Single line of text | *Indexed Column (Unique Encounter)* | **Yes** |
| **Index CSN** | `CCOIP_IndexCSN` | Single line of text | Prior qualifying admission ID | No |
| **Days to Revisit** | `CCOIP_DaysToRevisit` | Number | Integer, 0 decimals | **Yes** |
| **Readmission ≤ 30 Days** | `CCOIP_Readmit30d` | Choice | `Yes`, `No` | **Yes** |
| **Planned Readmission** | `CCOIP_PlannedReadmit` | Choice | `Yes`, `No`, `Unsure` | **Yes** |
| **Readmitted From** | `CCOIP_ReadmittedFrom` | Choice | `Home`, `SNF`, `IPR`, `ED`, `Outside Hospital`, `Other` | No |
| **Revisits in 6 Months** | `CCOIP_Revisits6Mo` | Number | Integer | No |
| **ED Visits in 6 Months** | `CCOIP_EDVisits6Mo` | Number | Integer | No |
| **Patient Complexity** | `CCOIP_Complexity` | Choice | `Low`, `Moderate`, `High`, `Extreme - Multi-Organ` | **Yes** |
| **Full Code Status** | `CCOIP_CodeStatus` | Choice | `Full Code`, `DNR/DNI`, `Comfort Care`, `Modified` | No |
| **Was TS Following** | `CCOIP_TSFollowing` | Choice | `Yes`, `No`, `N/A` | No |
| **SNF/IPR Barriers** | `CCOIP_PostAcuteIssues` | Multiple lines of text | Plain text | No |
| **Jade: Coordinator F2F** | `Jade_CoordinatorF2F` | Choice | `Yes`, `No`, `Patient Refused`, `N/A` | No |
| **Jade: Order Set Used** | `Jade_OrderSet` | Choice | `Yes`, `No`, `Partial` | No |
| **Jade: Daily Weights** | `Jade_DailyWeights` | Choice | `Yes`, `No` | No |
| **Jade: Weight Variations Addressed** | `Jade_WeightVariations` | Choice | `Yes`, `No`, `N/A` | No |
| **Jade: Sodium Restriction** | `Jade_SodiumDocumented` | Choice | `Yes`, `No` | No |
| **Jade: Fluid Restriction** | `Jade_FluidRestriction` | Choice | `Yes`, `No` | No |
| **Jade: Diuretic Transition Plan** | `Jade_DiureticPlan` | Choice | `Yes`, `No`, `Pending` | No |
| **Jade: Dry Weight in AVS** | `Jade_DryWeightAVS` | Choice | `Yes`, `No` | No |
| **Jade CHF Bundle Score** | `Jade_BundleScore` | Number | 0 – 8 points (or % 0–100) | No |
| **Review Status** | `CCOIP_ReviewStatus` | Choice | `NEW`, `IN REVIEW`, `COMPLETE`, `FOLLOW-UP`, `ESCALATED`, `CLOSED` | **Yes** |
| **Opportunities & Gaps** | `CCOIP_Opportunities` | Multiple lines of text | Plain text | No |
| **Clinical History Summary** | `CCOIP_ClinicalHistory` | Multiple lines of text | Plain text | No |
| **Hospital Course Summary** | `CCOIP_HospitalCourse` | Multiple lines of text | Plain text | No |
| **Action Plan** | `CCOIP_ActionPlan` | Multiple lines of text | Multi-disciplinary assignments | No |
| **Review Completion %** | `CCOIP_CompletionPct` | Number | Percentage (0–100%) | **Yes** |
| **Review Payload JSON** | `CCOIP_PayloadJSON` | Multiple lines of text | Complete serialized JSON audit record | No |

---

### Power Automate CCOIP Receiver Flow:

Create a 2nd Cloud Flow named **`SurgiFlow CCOIP Review Receiver`** with the HTTP Trigger and **Create/Update Item** targeting `SurgiFlow CCOIP Reviews`:

```json
{
  "encounterId": 14,
  "patientName": "ELEANOR VANCE",
  "mrn": "90481234",
  "revisitCsn": "CSN-8849201",
  "indexCsn": "CSN-8720194",
  "daysToRevisit": 11,
  "isReadmission30d": true,
  "plannedReadmit": "No",
  "readmittedFrom": "Home",
  "complexityTier": "High",
  "reviewStatus": "COMPLETE",
  "completionPercent": 100,
  "jadeChfBundle": {
    "coordinatorF2F": "Yes",
    "orderSetUsed": "Yes",
    "dailyWeights": "Yes",
    "weightVariationsAddressed": "Yes",
    "sodiumRestricted": "Yes",
    "fluidRestricted": "Yes",
    "diureticPlan": "Yes",
    "dryWeightInAVS": "Yes",
    "score": 8
  },
  "narrative": {
    "opportunities": "Home diuretic adherence gap identified prior to revisit.",
    "actionPlan": "Transitional care nurse assigned for 48-hour post-discharge telephone follow-up."
  }
}
```

---

### Need Help?
Contact your local hospital Clinical Informatics or Enterprise O365 Administration team to provision site collection permissions for the SPFx Web Part package.
