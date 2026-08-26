/**
 * ========================================================================
 * GT8 SURGIFLOW - CREATE STATUS COLUMN
 * ========================================================================
 * 
 * DESCRIPTION:
 * This script runs in the browser console (F12) on your SharePoint page to
 * automatically create the "Status" column with display name "🚦 CLINICAL PROGRESS 🚦"
 * and choice values: Progressing On Schedule, Not Improving, Ready for DC, Discharged, Sent to ICU.
 * 
 * HOW TO USE:
 * 1. Open Google Chrome or Microsoft Edge and navigate to your SharePoint list:
 *    https://ahsonline.sharepoint.com/teams/group-reliefchargecvpcu/Lists/GT8%20SURGIFLOW/Patient%20Dashboard.aspx
 * 2. Press F12 (or right-click -> Inspect) and go to the "Console" tab.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 * 4. Monitor the logs to verify creation is successful.
 */

(async () => {
  console.log("%c--- Creating Status Column on GT8 SURGIFLOW ---", "color: #2563eb; font-weight: bold; font-size: 14px;");

  const listTitle = "GT8 SURGIFLOW";
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
    console.error("Failed to get Request Digest token. Make sure you are on the SharePoint list page.", err);
    return;
  }

  // === STEP 2: CREATE CHOICE FIELD "Status" ===
  const fieldName = "Status";
  const choices = [
    "Progressing On Schedule",
    "Not Improving",
    "Ready for DC",
    "Discharged",
    "Sent to ICU"
  ];

  console.log(`Creating database field "${fieldName}" (Choice type)...`);
  const createUrl = `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields`;
  
  const createPayload = {
    "__metadata": { "type": "SP.FieldChoice" },
    "FieldTypeKind": 6, // Choice
    "Title": fieldName,
    "Required": false,
    "Choices": {
      "__metadata": { "type": "Collection(Edm.String)" },
      "results": choices
    }
  };

  try {
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose;charset=utf-8",
        "X-RequestDigest": requestDigest
      },
      body: JSON.stringify(createPayload)
    });

    if (createRes.ok) {
      console.log(`%c✓ Successfully created choice column "${fieldName}"!`, "color: #16a34a; font-weight: bold;");
    } else {
      const errData = await createRes.json();
      const msg = errData.error.message.value;
      
      if (msg.includes("already exists")) {
        console.warn(`Column "${fieldName}" already exists. Proceeding to update...`);
      } else {
        throw new Error(msg);
      }
    }

    // === STEP 3: RENAME DISPLAY TITLE TO "🚦 CLINICAL PROGRESS 🚦" ===
    const displayTitle = "🚦 CLINICAL PROGRESS 🚦";
    console.log(`Renaming display name of "${fieldName}" to "${displayTitle}"...`);
    
    const updateUrl = `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields/getbyinternalnameorTitle('${fieldName}')`;
    const updateRes = await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose;charset=utf-8",
        "X-RequestDigest": requestDigest,
        "X-HTTP-Method": "MERGE",
        "IF-MATCH": "*"
      },
      body: JSON.stringify({
        "__metadata": { "type": "SP.FieldChoice" },
        "Title": displayTitle
      })
    });

    if (updateRes.ok) {
      console.log(`%c✓ Successfully renamed column to "${displayTitle}"!`, "color: #16a34a; font-weight: bold;");
    } else {
      const errData = await updateRes.json();
      console.error(`✕ Failed to rename display title:`, errData.error.message.value);
    }

  } catch (err) {
    console.error("✕ Failed to create/configure column:", err);
  }

  console.log("%c--- Column Provisioning Complete ---", "color: #2563eb; font-weight: bold; font-size: 14px;");
})();
