/**
 * Browser console script to instantly delete duplicate columns from a SharePoint list.
 * It identifies duplicates by matching display titles and preserves the one with the correct internal name.
 */

(async () => {
    const listName = "SurgiFlow Master";
    
    // 1. Fetch Request Digest token
    const contextResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    // 2. Fetch all fields
    const fieldsResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields`, {
        headers: { "accept": "application/json;odata=verbose" }
    });
    const fieldsData = await fieldsResponse.json();
    const allFields = fieldsData.d.results;

    const targets = {
        "Does the patient have family/friend support for discharge?": "FamilySupportDischarge",
        "Action Item Update (To Be Completed by Nursing)": "NursingActionItemUpdate",
        "Nursing Action Item Follow Up": "NursingActionItemFollowUp",
        "CM Leader Review": "CMLeaderReview",
        "CM Huddle Follow Up": "CMHuddleFollowUp"
    };

    console.log("Analyzing fields for duplicates...");
    
    // Group fields by Title
    const grouped = {};
    for (const field of allFields) {
        const title = field.Title;
        if (targets[title]) {
            if (!grouped[title]) {
                grouped[title] = [];
            }
            grouped[title].push(field);
        }
    }

    let deletedCount = 0;

    for (const [title, fieldsList] of Object.entries(grouped)) {
        const correctInternal = targets[title];
        console.log(`Title "${title}" has ${fieldsList.length} fields. Correct internal name: ${correctInternal}`);

        for (const field of fieldsList) {
            const isOriginal = (field.InternalName === correctInternal);
            if (!isOriginal) {
                console.log(`%cDeleting duplicate: ${field.InternalName} (ID: ${field.Id})`, "color: orange;");
                
                const deleteUrl = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields('${field.Id}')`;
                const deleteResponse = await fetch(deleteUrl, {
                    method: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": digest,
                        "X-HTTP-Method": "DELETE"
                    }
                });

                if (deleteResponse.ok) {
                    console.log(`%cSuccessfully deleted duplicate field ${field.InternalName}`, "color: green; font-weight: bold;");
                    deletedCount++;
                } else {
                    const err = await deleteResponse.text();
                    console.error(`Failed to delete field ${field.InternalName}:`, err);
                }
            } else {
                console.log(`%cKeeping original field: ${field.InternalName}`, "color: blue; font-weight: bold;");
            }
        }
    }

    console.log(`Finished. Deleted ${deletedCount} duplicate columns. Refreshing list settings page...`);
    if (deletedCount > 0) {
        window.location.reload();
    }
})();
