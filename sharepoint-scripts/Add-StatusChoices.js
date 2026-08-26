/**
 * ========================================================================
 * GT6 SURGIFLOW CPPCU - ADD STATUS COLUMN CHOICES
 * ========================================================================
 * 
 * DESCRIPTION:
 * This script runs in the browser console (F12) on your SharePoint page to
 * update the choice options of your "Status" column (🚦 CLINICAL PROGRESS 🚦)
 * to include "Discharged" and "Sent to ICU".
 * 
 * Target Field Internal Name: _x0001f6a6__x0020_CLINICAL_x0020
 * 
 * HOW TO USE:
 * 1. Open Google Chrome and navigate to your SharePoint list:
 *    https://ahsonline.sharepoint.com/sites/group-gt6leadershipteamgroup/Lists/GT6%20SURGIFLOW%20CPPCU/Patient%20Dashboard.aspx
 * 2. Press F12 (or right-click -> Inspect) and go to the "Console" tab.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 * 4. Monitor the logs to verify the choices are updated successfully.
 */

(async () => {
  console.log("%c--- Updating Status Column Choices ---", "color: #2563eb; font-weight: bold; font-size: 14px;");

  const listTitle = "GT6 SURGIFLOW CPPCU";
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

  // === STEP 2: UPDATE STATUS FIELD CHOICES ===
  const fieldInternalName = "_x0001f6a6__x0020_CLINICAL_x0020";
  const targetChoices = [
    "Progressing On Schedule",
    "Not Improving",
    "Ready for DC",
    "Discharged",
    "Sent to ICU"
  ];

  console.log(`Updating column "${fieldInternalName}" choices...`);
  try {
    const url = `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields/getbyinternalnameorTitle('${fieldInternalName}')`;
    const response = await fetch(url, {
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
        "Choices": {
          "__metadata": { "type": "Collection(Edm.String)" },
          "results": targetChoices
        }
      })
    });

    if (response.ok) {
      console.log(`%c✓ Successfully updated "Status" choices to:`, "color: #16a34a; font-weight: bold;");
      console.log(targetChoices);
    } else {
      const data = await response.json();
      console.error(`✕ Error updating column "${fieldInternalName}":`, data.error.message.value);
    }
  } catch (e) {
    console.error(`✕ Fetch error updating column "${fieldInternalName}":`, e);
  }

  console.log("%c--- Column Update Complete ---", "color: #2563eb; font-weight: bold; font-size: 14px;");
})();
