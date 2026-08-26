/**
 * ========================================================================
 * WT8 (CTPCU POC TOOL V5) - CONFIGURE READMISSION RISK LEVEL COLUMN
 * ========================================================================
 * 
 * DESCRIPTION:
 * This script runs in the browser console (F12) on your SharePoint page to:
 * 1. Provision/update the "RiskLevel" column with display title "⚠️ Readmission Risk Level ⚠️".
 * 2. Configure choices: "Low <12%", "Medium 13% to 22%", "High >22%".
 * 3. Apply standard SharePoint Green, Yellow, and Red choice pill formatting:
 *    - "Low <12%"         -> Standard SharePoint Green
 *    - "Medium 13% to 22%" -> Standard SharePoint Yellow
 *    - "High >22%"        -> Standard SharePoint Red
 * 
 * HOW TO USE:
 * 1. Open Google Chrome or Microsoft Edge and navigate to your SharePoint list:
 *    https://ahsonline.sharepoint.com/teams/WT8Charge/Lists/CTPCU%20POC%20TOOL%20V5/AllItems.aspx
 * 2. Press F12 (or right-click -> Inspect) and go to the "Console" tab.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 * 4. Monitor the logs to verify creation and formatting.
 */

(async () => {
  console.log("%c--- Configuring Risk Level Column on WT8 List ---", "color: #2563eb; font-weight: bold; font-size: 14px;");

  const siteUrl = window.location.pathname.replace(/\/SitePages\/.*/i, "").replace(/\/Lists\/.*/i, "");
  const listPath = decodeURIComponent(window.location.pathname.replace(/\/[^\/]+\.aspx.*/i, ""));
  
  console.log(`Target Site Path: ${siteUrl}`);
  console.log(`Target List Relative Path: ${listPath}`);

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

  // Define endpoint using GetList(serverRelativeUrl)
  const listEndpoint = `${siteUrl}/_api/web/GetList('${listPath}')`;

  // === STEP 2: DEFINE COLUMN & CHOICES ===
  const fieldName = "RiskLevel";
  const displayTitle = "⚠️ Readmission Risk Level ⚠️";
  const choices = [
    "Low <12%",
    "Medium 13% to 22%",
    "High >22%"
  ];

  // === STEP 3: DEFINE COLUMN FORMATTING JSON ===
  const formatterObj = {
    "$schema": "https://developer.microsoft.com/json-schemas/sp/v1/column-formatting.schema.json",
    "elmType": "div",
    "attributes": {
      "class": "=if(@currentField == 'Low <12%', 'sp-css-backgroundColor-successBackground sp-css-color-successText', if(@currentField == 'Medium 13% to 22%', 'sp-css-backgroundColor-warningBackground sp-css-color-warningText', if(@currentField == 'High >22%', 'sp-css-backgroundColor-severeWarningBackground sp-css-color-severeWarningText', '')))"
    },
    "style": {
      "padding": "4px 10px",
      "border-radius": "16px",
      "font-weight": "700",
      "font-size": "11px",
      "display": "inline-flex",
      "align-items": "center",
      "gap": "4px"
    },
    "children": [
      {
        "elmType": "span",
        "txtContent": "@currentField"
      }
    ]
  };

  const customFormatterString = JSON.stringify(formatterObj);

  // === STEP 4: CREATE / UPDATE FIELD ===
  console.log(`Creating/updating field "${fieldName}"...`);
  const createUrl = `${listEndpoint}/fields`;
  
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
      const msg = errData.error ? errData.error.message.value : "Field warning/creation check";
      console.warn(`Column check/creation: ${msg}. Proceeding to configure...`);
    }

    // === STEP 5: UPDATE TITLE & APPLY CUSTOM FORMATTER ===
    console.log(`Applying title "${displayTitle}" and Green/Yellow/Red formatting to "${fieldName}"...`);
    
    const updateUrl = `${listEndpoint}/fields/getbyinternalnameorTitle('${fieldName}')`;
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
        "Title": displayTitle,
        "CustomFormatter": customFormatterString
      })
    });

    if (updateRes.ok) {
      console.log(`%c✓ Successfully configured "${displayTitle}" with Green/Yellow/Red formatting!`, "color: #16a34a; font-weight: bold;");
    } else {
      const errData = await updateRes.json();
      console.error(`✕ Failed to apply column configuration/formatting:`, errData.error.message.value);
    }

  } catch (err) {
    console.error("✕ Failed to configure column:", err);
  }

  console.log("%c--- Column Configuration Complete ---", "color: #2563eb; font-weight: bold; font-size: 14px;");
})();
