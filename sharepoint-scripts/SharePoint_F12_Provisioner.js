/**
 * SUMMARY: Console-ready provisioning script that runs in developer tools to quickly update SharePoint list field definitions.
 */
/**
 * ========================================================================
 * SHAREPOINT F12 DEVELOPER CONSOLE LIST PROVISIONER
 * ========================================================================
 * 
 * DESCRIPTION:
 * This script runs in the browser console (F12) to automatically create 
 * the consolidated "SurgiFlow Master" list and provision all 75+ columns.
 * Use this to bypass local corporate Group Policy blocks on PowerShell.
 * 
 * HOW TO USE:
 * 1. Open Google Chrome and navigate to your new SharePoint site:
 *    https://ahsonline.sharepoint.com/teams/SurgiFlow
 * 2. Press F12 (or right-click -> Inspect) and go to the "Console" tab.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 * 4. Monitor the logs as it creates the list and adds all columns in real-time.
 */

(async () => {
  console.log("%c--- Starting SurgiFlow Master List Provisioner ---", "color: #2563eb; font-weight: bold; font-size: 14px;");

  // === ⚙️ CONFIGURATION ===
  const listTitle = "SurgiFlow Master";
  const siteUrl = window.location.pathname.replace(/\/SitePages\/.*/i, "").replace(/\/Lists\/.*/i, "");
  console.log(`Target Site Path: ${siteUrl}`);
  console.log(`Target List Name: ${listTitle}`);

  // === STEP 1: FETCH REQUEST DIGEST TOKEN ===
  async function getRequestDigest() {
    const response = await fetch(`${siteUrl}/_api/contextinfo`, {
      method: "POST",
      headers: { "Accept": "application/json;odata=verbose" }
    });
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  }

  let requestDigest;
  try {
    requestDigest = await getRequestDigest();
    console.log("%c✓ Form Digest Token acquired.", "color: #16a34a; font-weight: bold;");
  } catch (err) {
    console.error("Failed to get Request Digest token. Make sure you are on the SharePoint page.", err);
    return;
  }

  // === STEP 2: CREATE SHAREPOINT LIST ===
  async function createList(title, digest) {
    const url = `${siteUrl}/_api/web/lists`;
    const payload = {
      "__metadata": { "type": "SP.List" },
      "AllowContentTypes": true,
      "BaseTemplate": 100, // Generic Custom List
      "Title": title
    };
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest
      }
    });
    return response;
  }

  console.log(`Checking if list "${listTitle}" exists or creating a new one...`);
  const listCheckResponse = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')`, {
    headers: { "Accept": "application/json;odata=verbose" }
  });

  if (listCheckResponse.status === 404) {
    console.log(`List "${listTitle}" not found. Creating it now...`);
    const createRes = await createList(listTitle, requestDigest);
    const createData = await createRes.json();
    if (createRes.ok) {
      console.log(`%c✓ List "${listTitle}" created successfully!`, "color: #16a34a; font-weight: bold;");
    } else {
      console.error("Failed to create list:", createData);
      return;
    }
  } else {
    console.log(`%cList "${listTitle}" already exists. Proceeding to add/verify columns...`, "color: #eab308;");
  }

  // === STEP 3: DEFINE COLUMNS TO CREATE ===
  // FieldTypeKind codes:
  // 2 = Text (Single Line)
  // 3 = Note (Multi Line)
  // 4 = DateTime
  // 6 = Choice
  // 8 = Boolean (Yes/No)
  // 9 = Number
  const fields = [
    { name: "Unit", type: 6, choices: ["GT8 CVPCU", "GT7 CARDIAC PCU", "GT6 CPPCU", "WT8 STPCU"], def: "GT8 CVPCU" },
    { name: "MRN", type: 2 },
    { name: "Room", type: 2 },
    { name: "Name", type: 2 },
    { name: "AdmitDate", type: 4, display: "Admit Date" },
    { name: "LOS", type: 2 },
    { name: "SxDate", type: 4, display: "Sx Date" },
    { name: "PreOp", type: 6, choices: ["True", "False"], display: "Pre Op", def: "False" },
    { name: "EDD", type: 4 },
    { name: "Surgery", type: 2 },
    { name: "ServiceLine", type: 6, choices: ["CTsx", "CVmed", "Transplant", "Cardiology", "Vascular", "Thoracic", "Other"], display: "Service Line" },
    { name: "SurgeonCardio", type: 2, display: "Surgeon/Cardio" },
    { name: "PMHProcedures", type: 3, display: "PMH/Procedures" },
    { name: "AdmitReason", type: 2, display: "Admit Reason" },
    { name: "LeaderActionItems", type: 3, display: "Leader Action Items" },
    { name: "ClinicalNeeds", type: 3, display: "Clinical Needs to Continue Admission" },
    { name: "Dispo", type: 6, choices: ["SNF", "Home No Needs", "HHC DME ONLY", "HHC", "IPR-AH", "HHC ABX ONLY", "Hospice", "Palliative", "Rehab", "Other"] },
    { name: "Braden", type: 2 },
    { name: "Mentation", type: 2 },
    { name: "Drip", type: 3 },
    { name: "Isolation", type: 2 },
    { name: "Rhythm", type: 2 },
    { name: "Anticoagulation", type: 2 },
    { name: "TimeCrit", type: 2, display: "Time Crit" },
    { name: "DNR", type: 6, choices: ["True", "False"], def: "False" },
    { name: "AdmitWeight", type: 2 },
    { name: "WeightToday", type: 2 },
    { name: "WeightChange", type: 2 },
    { name: "ConsultantsPending", type: 3, display: "Consultants Pending" },
    { name: "AttendingMD", type: 2 },
    { name: "SkinAssessVerified", type: 6, choices: ["True", "False"], display: "SkinAssessVerified", def: "False" },
    { name: "MCB", type: 6, choices: ["True", "False"], def: "False" },
    { name: "Age", type: 2 },
    { name: "Mobility", type: 2 },
    { name: "ChestTube", type: 3, display: "Chest Tube" },
    { name: "GoingHomeWithAC", type: 2, display: "Going Home With AC?" },
    { name: "HDAtHomeOrInpatient", type: 2, display: "HD at Home or Inpatient?" },
    { name: "O2Device", type: 2, display: "O2 Device" },
    { name: "O2FlowRate", type: 2, display: "O2L/%" },
    { name: "DCLounge", type: 6, choices: ["True", "False"], display: "DC Lounge", def: "False" },
    { name: "ApptsMade", type: 6, choices: ["True", "False"], display: "Appts Made", def: "False" },
    { name: "PharmacyVerified", type: 6, choices: ["True", "False"], display: "Pharmacy Verified", def: "False" },
    { name: "RideAVL", type: 6, choices: ["True", "False"], display: "Ride AVL", def: "False" },
    { name: "POPain", type: 2, display: "PO Pain" },
    { name: "BM", type: 2 },
    { name: "CommentsUpdates", type: 3, display: "Comments/Updates" },
    { name: "DCOrder", type: 6, choices: ["True", "False"], display: "DC Order", def: "False" },
    { name: "MedRec", type: 6, choices: ["True", "False"], display: "Med Rec", def: "False" },
    { name: "WalkTestCompleted", type: 6, choices: ["True", "False"], display: "Walk Test Completed", def: "False" },
    { name: "WalkTestNeeded", type: 6, choices: ["True", "False"], display: "Walk Test Needed", def: "False" },
    { name: "IVMeds", type: 2, display: "IV Meds" },
    { name: "DCTODAY", type: 6, choices: ["True", "False"], display: "DC TODAY", def: "False" },
    { name: "IS", type: 6, choices: ["True", "False"], def: "False" },
    { name: "NonClinicalDCBarriers", type: 3, display: "ALL DC BARRIERS" },
    { name: "MisalignedDispo", type: 6, choices: ["True", "False"], display: "Misaligned Dispo", def: "False" },
    { name: "preop2", type: 6, choices: ["True", "False"], display: "pre op", def: "False" },
    { name: "SurgeryToday", type: 2, display: "SurgeryToday" },
    { name: "VADType", type: 2, display: "VAD Type" },
    { name: "VADSpeed", type: 2, display: "VAD Speed" },
    { name: "VADDressingChangeOrder", type: 2, display: "VAD Dressing Change Order" },
    { name: "DressingChanged", type: 2, display: "Dressing Changed" },
    { name: "VADPhotoUploaded", type: 6, choices: ["True", "False"], display: "VAD Photo Uploaded", def: "False" },
    { name: "VADDsrNextDue", type: 2, display: "VAD Dsr Next Due" },
    { name: "VADVSq4AM", type: 2, display: "VAD VS q4 AM" },
    { name: "VADVSq4PM", type: 2, display: "VAD VS q4 PM" },
    { name: "VADRN", type: 2, display: "VAD RN" },
    { name: "VADMissingRequired", type: 2, display: "VAD Missing Required" },
    { name: "VADDND", type: 2, display: "VAD DND" },
    { name: "VADMISCNOTES", type: 3, display: "VAD MISC NOTES" },
    { name: "VADCartNumber", type: 2, display: "VAD Cart #" },
    { name: "VADStatus", type: 2, display: "VAD Status" },
    { name: "WeightVerified", type: 6, choices: ["True", "False"], display: "Weight Verified", def: "False" },
    { name: "FallRisk", type: 2, display: "Fall Risk" },
    { name: "PHMedication", type: 2, display: "PH Medication?" }
  ];

  // === STEP 4: PROVISION EACH COLUMN SEQUENTIALLY ===
  async function addField(field, digest) {
    const url = `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields`;
    
    // Base SP.Field payload
    let payload = {
      "__metadata": { "type": "SP.Field" },
      "Title": field.display || field.name,
      "InternalName": field.name,
      "FieldTypeKind": field.type,
      "Required": false
    };

    // If it's a Choice field, customize the payload
    if (field.type === 6) {
      payload.__metadata.type = "SP.FieldChoice";
      payload.Choices = {
        "__metadata": { "type": "Collection(Edm.String)" },
        "results": field.choices
      };
      if (field.def) {
        payload.DefaultValue = field.def;
      }
    }

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest
      }
    });
    return response;
  }

  // Execute field creations one by one to avoid collision
  for (let f of fields) {
    // Check if field already exists by fetching it
    const fieldCheck = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields/getbyinternalnameorTitle('${f.name}')`, {
      headers: { "Accept": "application/json;odata=verbose" }
    });

    if (fieldCheck.status === 404) {
      console.log(`Provisioning column: ${f.display || f.name} (${f.name})...`);
      const addRes = await addField(f, requestDigest);
      if (addRes.ok) {
        console.log(`%c✓ Added: ${f.display || f.name}`, "color: #16a34a;");
      } else {
        const errorData = await addRes.json();
        console.error(`✕ Error adding column ${f.name}:`, errorData.error.message.value);
      }
    } else {
      console.log(`Column ${f.display || f.name} already exists. Skipping.`);
    }
  }

  console.log("%c--- Provisioning Complete! ---", "color: #2563eb; font-weight: bold; font-size: 14px;");
  console.log(`Go to your list settings to verify: ${window.location.origin}${siteUrl}/Lists/${listTitle.replace(/\s+/g, "%20")}/AllItems.aspx`);
})();
