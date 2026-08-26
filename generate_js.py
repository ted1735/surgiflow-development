# SUMMARY: Python generator script to output provisioning JavaScript arrays from source CSV schemas.
import csv
import json

csv_path = r"c:\Users\tedmo\OneDrive - AdventHealth\aaReadmissions\SurgiFlow_Export_Package\SurgiFlow_Master_Schema.csv"
js_path = r"c:\Users\tedmo\OneDrive - AdventHealth\aaReadmissions\SurgiFlow_Export_Package\Create-SurgiFlowColumns.js"

fields = []
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not row['DisplayName']:
            continue
        fields.append(row)

js_content = """
// Run this script in the browser console (F12) while on your SharePoint site: https://ahsonline.sharepoint.com/teams/SurgiFlow
// Ensure the list "SurgiFlow Master" has already been created.

(async () => {
    const listName = "SurgiFlow Master";
    console.log("Starting column creation for " + listName + "...");

    // Fetch Request Digest token
    const contextResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    const fields = """ + json.dumps(fields, indent=2) + """;

    for (const field of fields) {
        let type = field.FieldType;
        let displayName = field.DisplayName;
        let internalName = field.InternalName;
        let choices = field.Choices ? field.Choices.split(';').map(c => c.trim()).filter(c => c) : [];
        let required = field.Required === 'TRUE' ? 'TRUE' : 'FALSE';
        let defaultValue = field.Default ? field.Default.trim() : '';

        let xml = '';
        if (type === 'Choice') {
            let choiceXml = choices.map(c => `<CHOICE>${c}</CHOICE>`).join('');
            xml = `<Field Type='Choice' DisplayName='${displayName}' Name='${internalName}' Required='${required}' Format='Dropdown'><CHOICES>${choiceXml}</CHOICES>`;
            if (defaultValue) {
                xml += `<Default>${defaultValue}</Default>`;
            }
            xml += `</Field>`;
        } else if (type === 'MultiChoice') {
            let choiceXml = choices.map(c => `<CHOICE>${c}</CHOICE>`).join('');
            xml = `<Field Type='MultiChoice' DisplayName='${displayName}' Name='${internalName}' Required='${required}'><CHOICES>${choiceXml}</CHOICES>`;
            if (defaultValue) {
                xml += `<Default>${defaultValue}</Default>`;
            }
            xml += `</Field>`;
        } else if (type === 'Note') {
            xml = `<Field Type='Note' DisplayName='${displayName}' Name='${internalName}' Required='${required}' NumLines='6' RichText='FALSE' />`;
        } else if (type === 'DateTime') {
            let format = field.Choices === 'DateOnly' ? 'DateOnly' : 'DateTime';
            xml = `<Field Type='DateTime' DisplayName='${displayName}' Name='${internalName}' Required='${required}' Format='${format}' />`;
        } else {
            xml = `<Field Type='Text' DisplayName='${displayName}' Name='${internalName}' Required='${required}' MaxLength='255' />`;
        }

        const payload = {
            parameters: {
                __metadata: { type: "SP.XmlSchemaFieldCreationInformation" },
                SchemaXml: xml,
                Options: 12
            }
        };

        try {
            const response = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields/createfieldasxml`, {
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose;charset=utf-8",
                    "X-RequestDigest": digest
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`%cAdded: ${displayName}`, "color: green");
            } else {
                console.error(`Error adding ${displayName}:`, data.error.message.value);
            }
        } catch (e) {
            console.error(`Fetch error adding ${displayName}:`, e);
        }
    }
    console.log("Column creation finished!");
})();
"""

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("JavaScript script generated successfully!")
