/**
 * SUMMARY: Browser console script using SharePoint REST API to strip emojis from all list column Display Names (Titles).
 */

(async () => {
    const listName = "SurgiFlow Master";
    console.log(`%cStarting emoji clean-up for SharePoint list: ${listName}`, "color: cyan; font-weight: bold; font-size: 14px;");

    // 1. Fetch Request Digest token
    const contextResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    // 2. Fetch all non-hidden list fields
    const fieldsResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields?$filter=Hidden eq false`, {
        headers: { "accept": "application/json;odata=verbose" }
    });
    const fieldsData = await fieldsResponse.json();
    const fields = fieldsData.d.results;

    function cleanTitle(title) {
        if (!title) return title;
        // Regex matching emoji ranges, variation selectors, zero-width joiners
        let cleaned = title.replace(/\p{Extended_Pictographic}/gu, '');
        cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '');
        return cleaned.trim();
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const field of fields) {
        const oldTitle = field.Title;
        const newTitle = cleanTitle(oldTitle);

        if (oldTitle === newTitle) {
            skippedCount++;
            continue;
        }

        try {
            const url = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameorTitle('${field.InternalName}')`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose;charset=utf-8",
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE"
                },
                body: JSON.stringify({
                    "__metadata": { "type": field.__metadata.type || "SP.Field" },
                    "Title": newTitle
                })
            });

            if (response.ok) {
                console.log(`%c[Cleaned] ${field.InternalName}: "${oldTitle}" -> "${newTitle}"`, "color: green;");
                updatedCount++;
            } else {
                const errData = await response.json();
                console.warn(`[Error] ${field.InternalName}:`, errData.error?.message?.value || response.statusText);
                errorCount++;
            }
        } catch (err) {
            console.error(`[Exception] ${field.InternalName}:`, err);
            errorCount++;
        }
    }

    console.log(`%cFinished! Successfully updated ${updatedCount} fields, skipped ${skippedCount} clean fields, ${errorCount} errors.`, "color: green; font-weight: bold; font-size: 14px;");
})();
