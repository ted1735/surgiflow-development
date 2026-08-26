/**
 * Browser console script to migrate patient names from the old legacy "Name" column
 * into the new consolidated "PatientName" column.
 */

(async () => {
    const listName = "SurgiFlow Master";
    
    console.log("Starting data migration from Name to PatientName...");

    // 1. Fetch Request Digest token
    const contextResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    // 2. Fetch all items (up to 5000)
    const itemsResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/items?$select=Id,Name,PatientName&$top=5000`, {
        headers: { "accept": "application/json;odata=verbose" }
    });
    const itemsData = await itemsResponse.json();
    const items = itemsData.d.results;

    console.log(`Fetched ${items.length} items. Analyzing name fields...`);

    let migratedCount = 0;

    for (const item of items) {
        const legacyName = item.Name;
        const newName = item.PatientName;

        // If legacy Name is populated but PatientName is empty or different, update it
        if (legacyName && legacyName !== newName) {
            console.log(`Migrating Item ID ${item.Id}: "${legacyName}" -> PatientName`);

            const updateUrl = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/items(${item.Id})`;
            const updateResponse = await fetch(updateUrl, {
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE",
                    "If-Match": "*"
                },
                body: JSON.stringify({
                    "__metadata": { "type": item.__metadata.type },
                    "PatientName": legacyName
                })
            });

            if (updateResponse.ok) {
                migratedCount++;
            } else {
                const err = await updateResponse.text();
                console.error(`Failed to update item ${item.Id}:`, err);
            }
        }
    }

    console.log(`%cFinished! Successfully migrated ${migratedCount} patient names.`, "color: green; font-weight: bold; font-size: 13px;");
    if (migratedCount > 0) {
        console.log("Reloading page...");
        window.location.reload();
    }
})();
