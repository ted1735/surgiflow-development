/**
 * SUMMARY: Browser console script to apply schema modifications (making fields optional, renaming display names).
 */

(async () => {
    const listName = "SurgiFlow Master";
    console.log("Starting SharePoint List column adjustments...");

    // Fetch Request Digest token
    const contextResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    // Schema updates to apply:
    // 1. CoreMeasures -> Optional
    // 2. OtherDiagnostics -> "DM or Sepsis"
    // 3. Status -> "CLINICAL PROGRESS"
    // 4. NonClinicalDCBarriers -> "ALL DC BARRIERS"
    // 5. ServiceLine -> Add "Pulm HTN" choice
    // 6. GMLOS -> Create backend number field
    
    const modifications = [
        {
            internal: "GMLOS",
            create: true,
            properties: {
                "__metadata": { "type": "SP.FieldNumber" },
                "FieldTypeKind": 9,
                "Title": "GMLOS",
                "Required": false
            }
        },
        {
            internal: "FamilySupportDischarge",
            create: true,
            properties: {
                "__metadata": { "type": "SP.Field" },
                "FieldTypeKind": 2,
                "Title": "Does the patient have family/friend support for discharge?",
                "Required": false
            }
        },
        {
            internal: "NursingActionItemUpdate",
            create: true,
            properties: {
                "__metadata": { "type": "SP.FieldMultiLineText" },
                "FieldTypeKind": 3,
                "Title": "POST Huddle Action Item Update (NM Owner)",
                "Required": false,
                "NumberOfLines": 6,
                "RichText": false
            }
        },
        {
            internal: "NursingActionItemFollowUp",
            create: true,
            properties: {
                "__metadata": { "type": "SP.FieldMultiLineText" },
                "FieldTypeKind": 3,
                "Title": "Nursing Action Item Follow Up (NM Owner)",
                "Required": false,
                "NumberOfLines": 6,
                "RichText": false
            }
        },
        {
            internal: "CMLeaderReview",
            create: true,
            properties: {
                "__metadata": { "type": "SP.FieldMultiLineText" },
                "FieldTypeKind": 3,
                "Title": "CM Leader Review",
                "Required": false,
                "NumberOfLines": 6,
                "RichText": false
            }
        },
        {
            internal: "CMHuddleFollowUp",
            create: true,
            properties: {
                "__metadata": { "type": "SP.FieldMultiLineText" },
                "FieldTypeKind": 3,
                "Title": "POST CM Huddle Follow Up",
                "Required": false,
                "NumberOfLines": 6,
                "RichText": false
            }
        },
        {
            internal: "CoreMeasures",
            properties: { "Required": false }
        },
        {
            internal: "OtherDiagnostics",
            properties: { "Title": "DM or Sepsis" }
        },
        {
            internal: "Status",
            properties: { "Title": "CLINICAL PROGRESS" }
        },
        {
            internal: "NonClinicalDCBarriers",
            properties: { "Title": "ALL DC BARRIERS" }
        },
        {
            internal: "ServiceLine",
            type: "SP.FieldChoice",
            properties: {
                "Choices": {
                    "results": ["CTsx", "CVmed", "Transplant", "Cardiology", "Vascular", "Thoracic", "Pulm HTN", "Other"]
                }
            }
        }
    ];

    for (const mod of modifications) {
        try {
            if (mod.create) {
                const createUrl = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields`;
                const createResponse = await fetch(createUrl, {
                    method: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose;charset=utf-8",
                        "X-RequestDigest": digest
                    },
                    body: JSON.stringify(mod.properties)
                });
                if (createResponse.ok) {
                    console.log(`%cSuccess: Created column "${mod.internal}"!`, "color: green; font-weight: bold;");
                } else {
                    const err = await createResponse.json();
                    console.warn(`${mod.internal} column warning (likely already exists):`, err.error.message.value);
                }
                continue;
            }

            const url = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameorTitle('${mod.internal}')`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose;charset=utf-8",
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE"
                },
                body: JSON.stringify({
                    "__metadata": { "type": mod.type || "SP.Field" },
                    ...mod.properties
                })
            });

            if (response.ok) {
                console.log(`%cSuccess: Updated column "${mod.internal}" properties:`, "color: green; font-weight: bold;", mod.properties);
            } else {
                const data = await response.json();
                console.error(`Error updating column "${mod.internal}":`, data.error.message.value);
            }
        } catch (e) {
            console.error(`Fetch error updating column "${mod.internal}":`, e);
        }
    }

    console.log("SharePoint column adjustments finished.");
})();
