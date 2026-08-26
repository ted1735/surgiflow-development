/**
 * SUMMARY: JavaScript automation to copy and migrate existing patient records from older list structures to active SurgiFlow lists.
 */

// Run this script in the browser console (F12) while on your SharePoint site: https://ahsonline.sharepoint.com/teams/SurgiFlow
// This will read active patient data from all 4 unit lists and migrate them into your consolidated "SurgiFlow Master" list.

(async () => {
    const targetSiteUrl = "https://ahsonline.sharepoint.com/teams/SurgiFlow";
    const targetListName = "SurgiFlow Master";

    console.log("Starting live data migration to consolidated list...");

    // 1. Get Target List Details (RequestDigest and ListItemEntityTypeFullName)
    const contextResponse = await fetch(targetSiteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    const listResponse = await fetch(targetSiteUrl + "/_api/web/lists/getbytitle('" + targetListName + "')", {
        headers: { "accept": "application/json;odata=verbose" }
    });
    const listData = await listResponse.json();
    const itemType = listData.d.ListItemEntityTypeFullName;

    // Fetch existing items in the Master List to prevent duplicates
    console.log("Checking for existing items in Master list to prevent duplication...");
    const existingResponse = await fetch(targetSiteUrl + "/_api/web/lists/getbytitle('" + targetListName + "')/items?$select=MRN,Unit,Name,Title&$top=5000", {
        headers: { "accept": "application/json;odata=verbose" }
    });
    const existingData = await existingResponse.json();
    const existingItems = existingData?.d?.results || [];
    const existingKeys = new Set(existingItems.map(item => (item.MRN || item.Name || item.Title || "").trim() + "_" + (item.Unit || "")));
    console.log(`Found ${existingKeys.size} existing items in the Master List.`);

    // 2. Define Source Lists
    const sources = [
        {
            unit: "GT8 CVPCU",
            siteUrl: "https://ahsonline.sharepoint.com/teams/group-reliefchargecvpcu",
            listName: "GT8 SURGIFLOW"
        },
        {
            unit: "GT7 CARDIAC PCU",
            siteUrl: "https://ahsonline.sharepoint.com/teams/GT7Charge",
            listName: "GT7 SURGIFLOW"
        },
        {
            unit: "GT6 CPPCU",
            siteUrl: "https://ahsonline.sharepoint.com/sites/group-gt6leadershipteamgroup",
            listName: "GT6 SURGIFLOW CPPCU"
        },
        {
            unit: "WT8 STPCU",
            siteUrl: "https://ahsonline.sharepoint.com/teams/WT8Charge",
            listName: "CTPCU POC TOOL V5"
        }
    ];

    // Helper to resolve the correct Display Title of a list using its URL name
    const getListTitleByUrlName = async (siteUrl, urlName) => {
        try {
            const response = await fetch(`${siteUrl}/_api/web/lists?$select=Title,RootFolder/Name&$expand=RootFolder`, {
                headers: { "accept": "application/json;odata=verbose" }
            });
            if (!response.ok) return urlName;
            const data = await response.json();
            const lists = data?.d?.results || [];
            const targetName = decodeURIComponent(urlName).toLowerCase();
            for (const list of lists) {
                if (list.RootFolder && list.RootFolder.Name && list.RootFolder.Name.toLowerCase() === targetName) {
                    return list.Title;
                }
            }
        } catch (e) {
            console.error("Error resolving list title:", e);
        }
        return urlName;
    };

    const masterFields = [
  {
    "DisplayName": "Unit",
    "InternalName": "Unit",
    "FieldType": "Choice",
    "Choices": "GT8 CVPCU; GT7 CARDIAC PCU; GT6 CPPCU; WT8 STPCU",
    "Required": "TRUE",
    "Default": "GT8 CVPCU",
    "Notes": ""
  },
  {
    "DisplayName": "MRN",
    "InternalName": "MRN",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Room",
    "InternalName": "Room",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Name",
    "InternalName": "Name",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Admit Date",
    "InternalName": "AdmitDate",
    "FieldType": "DateTime",
    "Choices": "DateOnly",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "LOS",
    "InternalName": "LOS",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Sx Date",
    "InternalName": "SxDate",
    "FieldType": "DateTime",
    "Choices": "DateOnly",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Pre Op",
    "InternalName": "PreOp",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "EDD",
    "InternalName": "EDD",
    "FieldType": "DateTime",
    "Choices": "DateOnly",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Surgery",
    "InternalName": "Surgery",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Service Line",
    "InternalName": "ServiceLine",
    "FieldType": "Choice",
    "Choices": "CTsx; CVmed; Transplant; Cardiology; Vascular; Thoracic; Other",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Surgeon/Cardio",
    "InternalName": "SurgeonCardio",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "PMH/Procedures",
    "InternalName": "PMHProcedures",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Admit Reason",
    "InternalName": "AdmitReason",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Leader Action Items",
    "InternalName": "LeaderActionItems",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Clinical Needs to Continue Admission",
    "InternalName": "ClinicalNeeds",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Dispo",
    "InternalName": "Dispo",
    "FieldType": "Choice",
    "Choices": "SNF; Home No Needs; HHC DME ONLY; HHC; IPR-AH; HHC ABX ONLY; Hospice; Palliative; Rehab; Other",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Braden",
    "InternalName": "Braden",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Mentation",
    "InternalName": "Mentation",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Drip",
    "InternalName": "Drip",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Isolation",
    "InternalName": "Isolation",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Rhythm",
    "InternalName": "Rhythm",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Anticoagulation",
    "InternalName": "Anticoagulation",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Time Crit",
    "InternalName": "TimeCrit",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DNR",
    "InternalName": "DNR",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "AdmitWeight",
    "InternalName": "AdmitWeight",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "WeightToday",
    "InternalName": "WeightToday",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "WeightChange",
    "InternalName": "WeightChange",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Consultants Pending",
    "InternalName": "ConsultantsPending",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "AttendingMD",
    "InternalName": "AttendingMD",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "SkinAssessVerified",
    "InternalName": "SkinAssessVerified",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "MCB",
    "InternalName": "MCB",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Arrival Time",
    "InternalName": "ArrivalTime",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Age",
    "InternalName": "Age",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Mobility",
    "InternalName": "Mobility",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Chest Tube",
    "InternalName": "ChestTube",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Going Home With AC?",
    "InternalName": "GoingHomeWithAC",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HD at Home or Inpatient?",
    "InternalName": "HDAtHomeOrInpatient",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "O2 Device",
    "InternalName": "O2Device",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "O2L/%",
    "InternalName": "O2FlowRate",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DC Lounge",
    "InternalName": "DCLounge",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Appts Made",
    "InternalName": "ApptsMade",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Pharmacy Verified",
    "InternalName": "PharmacyVerified",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Ride AVL",
    "InternalName": "RideAVL",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "PO Pain",
    "InternalName": "POPain",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "BM",
    "InternalName": "BM",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Comments/Updates",
    "InternalName": "CommentsUpdates",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DC Order",
    "InternalName": "DCOrder",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Med Rec",
    "InternalName": "MedRec",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Walk Test Completed",
    "InternalName": "WalkTestCompleted",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Walk Test Needed",
    "InternalName": "WalkTestNeeded",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "IV Meds",
    "InternalName": "IVMeds",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DC TODAY",
    "InternalName": "DCTODAY",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "IS",
    "InternalName": "IS",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Non-Clinical DC Barriers",
    "InternalName": "NonClinicalDCBarriers",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Misaligned Dispo",
    "InternalName": "MisalignedDispo",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "pre op",
    "InternalName": "preop2",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "SurgeryBarriers",
    "InternalName": "SurgeryBarriers",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "SurgeryToday",
    "InternalName": "SurgeryToday",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Type",
    "InternalName": "VADType",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Speed",
    "InternalName": "VADSpeed",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Dressing Change Order",
    "InternalName": "VADDressingChangeOrder",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Dressing Changed",
    "InternalName": "DressingChanged",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Photo Uploaded",
    "InternalName": "VADPhotoUploaded",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Dsr Next Due",
    "InternalName": "VADDsrNextDue",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD VS q4 AM",
    "InternalName": "VADVSq4AM",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD VS q4 PM",
    "InternalName": "VADVSq4PM",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD RN",
    "InternalName": "VADRN",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Missing Required",
    "InternalName": "VADMissingRequired",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD DND",
    "InternalName": "VADDND",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD MISC NOTES",
    "InternalName": "VADMISCNOTES",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Cart #",
    "InternalName": "VADCartNumber",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Status",
    "InternalName": "VADStatus",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Transferred From",
    "InternalName": "TransferredFrom",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Time Seen By Leader",
    "InternalName": "TimeSeenByLeader",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Weight Verified",
    "InternalName": "WeightVerified",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Fall Risk",
    "InternalName": "FallRisk",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "PH Medication?",
    "InternalName": "PHMedication",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  }
];

    // Helper to search source item properties dynamically based on display name and internal fallbacks
    const getSourceValue = (item, targetField) => {
        const name = targetField.InternalName;
        
        let fallbacks = [name, name.toLowerCase(), name.toUpperCase()];
        
        // Add display name permutations
        fallbacks.push(targetField.DisplayName);
        fallbacks.push(targetField.DisplayName.replace(/ /g, "_x0020_"));
        fallbacks.push(targetField.DisplayName.replace(/ /g, ""));
        
        // Special custom mappings based on known field naming conventions
        if (name === "NonClinicalDCBarriers") {
            fallbacks.push("CMNotes", "CM_x0020_Notes", "Non_x002d_Clinical_x0020_DC_x0020_Barriers", "NonClinicalDCBarriers");
        } else if (name === "ClinicalNeeds") {
            fallbacks.push("field_22", "ClinicalNeedstoContinueAdmission", "Clinical_x0020_Needs_x0020_to_x0020_Continue_x0020_Admission");
        } else if (name === "ServiceLine") {
            fallbacks.push("field_18", "Service_x0020_Line");
        } else if (name === "SurgeonCardio") {
            fallbacks.push("field_7", "Surgeon_x0020_Cardio");
        } else if (name === "Dispo") {
            fallbacks.push("field_23", "Discharge_x0020_Disposition", "DischargeDisposition");
        } else if (name === "Name") {
            fallbacks.push("field_1");
        } else if (name === "Room") {
            fallbacks.push("Title");
        } else if (name === "SxDate") {
            fallbacks.push("field_8", "Sx_x0020_Date");
        } else if (name === "ChestTube") {
            fallbacks.push("field_29", "Chest_x0020_Tube");
        } else if (name === "EDD") {
            fallbacks.push("field_10");
        } else if (name === "AdmitReason") {
            fallbacks.push("field_3", "Admit_x0020_Reason");
        }

        // Search the item
        for (const f of fallbacks) {
            if (item[f] !== undefined && item[f] !== null) {
                if (typeof item[f] === 'object') {
                    if (item[f].Value !== undefined) return item[f].Value;
                    if (item[f].results !== undefined) return item[f].results;
                    return JSON.stringify(item[f]);
                }
                return item[f];
            }
            if (item[f + "Value"] !== undefined) return item[f + "Value"];
        }
        return null;
    };

    // Migrate from each source
    for (const source of sources) {
        console.log(`%c[MIGRATION] Fetching active patients from ${source.unit}...`, "color: cyan; font-weight: bold;");
        try {
            const resolvedTitle = await getListTitleByUrlName(source.siteUrl, source.listName);
            console.log(`Resolved list name for ${source.listName} -> "${resolvedTitle}"`);
            
            const response = await fetch(`${source.siteUrl}/_api/web/lists/getbytitle('${resolvedTitle.replace(/'/g, "''")}')/items?$top=5000`, {
                headers: { "accept": "application/json;odata=verbose" }
            });
            if (!response.ok) {
                console.error(`%cFailed to load list: ${source.listName} from ${source.siteUrl}`, "color: red;");
                continue;
            }
            const data = await response.json();
            const items = data?.d?.results || [];
            console.log(`Found ${items.length} items. Starting migration...`);

            for (const item of items) {
                const payload = {
                    __metadata: { type: itemType },
                    Unit: source.unit
                };

                for (const masterField of masterFields) {
                    if (masterField.InternalName === "Unit") continue;
                    
                    const val = getSourceValue(item, masterField);
                    if (val !== null && val !== '') {
                        if (masterField.FieldType === 'Choice' || masterField.FieldType === 'MultiChoice') {
                            if (masterField.FieldType === 'MultiChoice') {
                                let arrVal = Array.isArray(val) ? val : (typeof val === 'string' ? val.split(';').map(x=>x.trim()) : [val]);
                                payload[masterField.InternalName] = {
                                    __metadata: { type: "Collection(Edm.String)" },
                                    results: arrVal
                                };
                            } else {
                                payload[masterField.InternalName] = String(val);
                            }
                        } else if (masterField.FieldType === 'DateTime') {
                            try {
                                payload[masterField.InternalName] = new Date(val).toISOString();
                            } catch(e) {}
                        } else {
                            payload[masterField.InternalName] = String(val);
                        }
                    }
                }

                // Deduplicate check
                const itemKey = ((payload.MRN || payload.Name || payload.Title || "").trim() + "_" + (payload.Unit || ""));
                if (existingKeys.has(itemKey)) {
                    console.log(`%cSkipped (already exists): ${payload.Name || payload.Title || "Unknown"} (${source.unit})`, "color: orange;");
                    continue;
                }

                // POST item to Master List
                const createResponse = await fetch(targetSiteUrl + "/_api/web/lists/getbytitle('" + targetListName + "')/items", {
                    method: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose;charset=utf-8",
                        "X-RequestDigest": digest
                    },
                    body: JSON.stringify(payload)
                });

                if (createResponse.ok) {
                    const patientName = payload.Name || payload.Title || "Unknown Patient";
                    console.log(`%c✔ Migrated: ${patientName} (${source.unit})`, "color: green;");
                } else {
                    const errData = await createResponse.json();
                    const patientName = payload.Name || payload.Title || "Unknown Patient";
                    console.error(`%c✘ Error migrating ${patientName}:`, "color: red;", errData.error.message.value);
                }
            }
        } catch (e) {
            console.error(`Fatal error migrating ${source.unit}:`, e);
        }
    }
    console.log("%c=== MIGRATION COMPLETE ===", "color: green; font-weight: bold;");
})();
