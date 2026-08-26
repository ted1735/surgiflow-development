# SUMMARY: Python script that generates migration logic to port legacy tracking columns to the new standardized SurgiFlow database schema.
import csv
import json

csv_path = r"c:\Users\tedmo\OneDrive - AdventHealth\aaReadmissions\SurgiFlow_Export_Package\SurgiFlow_Master_Schema.csv"
js_path = r"c:\Users\tedmo\OneDrive - AdventHealth\aaReadmissions\SurgiFlow_Export_Package\Migrate-SurgiFlowData.js"

fields = []
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not row['DisplayName']:
            continue
        fields.append(row)

js_content = """
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

    const masterFields = """ + json.dumps(fields, indent=2) + """;

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
"""

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Migration JavaScript generated successfully!")
