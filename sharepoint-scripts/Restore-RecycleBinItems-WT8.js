/**
 * ========================================================================
 * WT8 (CTPCU POC TOOL V5) - RECYCLE BIN PATIENT RECOVERY UTILITY (SAFE-RESTORE)
 * ========================================================================
 * 
 * DESCRIPTION:
 * This script runs in the browser console (F12) on your SharePoint page to:
 * 1. Automatically fix any previously restored items in the list that have a blank status,
 *    updating them to "Discharged".
 * 2. Query ALL 750+ deleted patients (including items deleted by other users like Matthew Petrovich)
 *    using GetRecycleBinItemsByQueryInfo(ShowOnlyMyItems=false).
 * 3. Restore them ONE BY ONE and immediately set their status to "Discharged".
 * 
 * Target Field: 🚦 CLINICAL PROGRESS 🚦 (Status)
 * Target Endpoint: _api/web/GetRecycleBinItemsByQueryInfo
 * 
 * HOW TO USE:
 * 1. Open Google Chrome or Microsoft Edge on your list page or Recycle Bin page:
 *    https://ahsonline.sharepoint.com/teams/WT8Charge/Lists/CTPCU%20POC%20TOOL%20V5/AllItems.aspx
 * 2. Press F12 (or right-click -> Inspect) and go to the "Console" tab.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 * 4. Monitor the logs as it recovers all 750 items and marks them as Discharged.
 */

(async () => {
  console.log("%c--- Starting WT8 SurgiFlow Safe Recycle Bin Recovery ---", "color: #2563eb; font-weight: bold; font-size: 14px;");

  // Determine siteUrl and listPath even if user is on RecycleBin.aspx
  let siteUrl = window.location.pathname.replace(/\/_layouts\/.*/i, "").replace(/\/SitePages\/.*/i, "").replace(/\/Lists\/.*/i, "");
  let listPath = "/teams/WT8Charge/Lists/CTPCU POC TOOL V5";

  if (!window.location.pathname.toLowerCase().includes("_layouts")) {
    const rawListPath = window.location.pathname.replace(/\/[^\/]+\.aspx.*/i, "");
    if (rawListPath.toLowerCase().includes("/lists/")) {
      listPath = decodeURIComponent(rawListPath);
    }
  }

  // Pure list folder name for filtering
  const listFolderName = "ctpcu poc tool v5";

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
    console.error("Failed to get Request Digest token. Make sure you are on the SharePoint page.", err);
    return;
  }

  // Define endpoint using GetList(serverRelativeUrl)
  const listEndpoint = `${siteUrl}/_api/web/GetList('${listPath}')`;

  // === STEP 2: GET LIST GUID & ENTITY TYPE VIA GetList ===
  console.log(`Connecting to list at path...`);
  let listGuid = "";
  let listItemEntityType = "";
  let listTitleName = "";
  
  try {
    const listRes = await fetch(listEndpoint, {
      headers: { "Accept": "application/json;odata=verbose" }
    });
    if (!listRes.ok) throw new Error("Could not find list at path: " + listPath);
    const listData = await listRes.json();
    listGuid = listData.d.Id;
    listTitleName = listData.d.Title;
    listItemEntityType = listData.d.ListItemEntityTypeFullName;
    console.log(`%c✓ Connected to list "${listTitleName}". GUID: ${listGuid}, Entity Type: ${listItemEntityType}`, "color: #16a34a;");
  } catch (err) {
    console.error("Failed to fetch list configuration:", err);
    return;
  }

  // Standard immutable GUID-based items endpoint
  const itemsEndpoint = `${siteUrl}/_api/web/lists(guid'${listGuid}')/items`;

  // === STEP 3: AUTO-DETECT STATUS FIELD INTERNAL NAME ===
  let statusInternalName = "";
  try {
    const fieldsRes = await fetch(`${siteUrl}/_api/web/lists(guid'${listGuid}')/fields?$select=InternalName,Title`, {
      headers: { "Accept": "application/json;odata=verbose" }
    });
    const fieldsData = await fieldsRes.json();
    
    // Specifically search for CLINICAL PROGRESS or custom Status, ignoring system _ModerationStatus
    const statusField = fieldsData.d.results.find(f => 
      f.InternalName !== "_ModerationStatus" && (
        (f.Title && f.Title.includes("CLINICAL PROGRESS")) || 
        f.InternalName === "Status" ||
        (f.Title && f.Title === "Status")
      )
    );

    if (statusField) {
      statusInternalName = statusField.InternalName;
      console.log(`%c✓ Detected Status Field Internal Name: "${statusInternalName}" (Display Title: "${statusField.Title}")`, "color: #16a34a; font-weight: bold;");
    } else {
      console.error("%c✕ ERROR: The 'Status' / '🚦 CLINICAL PROGRESS 🚦' column does NOT exist on this list yet!", "color: #dc2626; font-weight: bold; font-size: 14px;");
      console.error("%cPlease run Create-StatusColumn-WT8.js in your console first to create the column, then re-run this script.", "color: #ea580c; font-weight: bold;");
      return;
    }
  } catch (e) {
    console.error("Error inspecting list fields:", e);
    return;
  }

  // === STEP 4: CLEANUP / UPDATE PREVIOUSLY RESTORED ITEMS WITH BLANK STATUS ===
  console.log("Checking for previously restored items in list with blank/unset status...");
  try {
    const activeRes = await fetch(`${itemsEndpoint}?$select=Id,${statusInternalName}&$top=5000`, {
      headers: { "Accept": "application/json;odata=verbose" }
    });
    const activeData = await activeRes.json();
    let fixedCount = 0;
    
    for (const item of activeData.d.results) {
      const statusVal = item[statusInternalName];
      if (!statusVal || statusVal === "" || statusVal === "–" || statusVal === null) {
        console.log(`Setting status of Item ID ${item.Id} to "Discharged"...`);
        const updatePayload = {
          "__metadata": { "type": listItemEntityType }
        };
        updatePayload[statusInternalName] = "Discharged";

        const fixRes = await fetch(`${itemsEndpoint}(${item.Id})`, {
          method: "POST",
          body: JSON.stringify(updatePayload),
          headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": requestDigest,
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
          }
        });
        if (fixRes.ok) {
          fixedCount++;
        } else {
          try {
            const errData = await fixRes.json();
            console.error(`✕ Failed to update Item ID ${item.Id}:`, errData.error.message.value);
          } catch (e) {
            console.error(`✕ Failed to update Item ID ${item.Id}: HTTP ${fixRes.status}`);
          }
        }
      }
    }
    if (fixedCount > 0) {
      console.log(`%c✓ Fixed and updated ${fixedCount} previously restored items to "Discharged"!`, "color: #16a34a; font-weight: bold;");
    } else {
      console.log("No unassigned restored items found in list.");
    }
  } catch (err) {
    console.warn("Pre-cleanup check warning:", err);
  }

  // === STEP 5: FETCH ALL DELETED ITEMS VIA GetRecycleBinItemsByQueryInfo (ShowOnlyMyItems=false) ===
  console.log("Querying Recycle Bin for ALL deleted patients (including items deleted by team members)...");
  let recycleBinItems = [];
  
  try {
    const queryUrl = `${siteUrl}/_api/web/GetRecycleBinItemsByQueryInfo(rowLimit=@a1,isAscending=@a2,itemState=@a3,orderby=@a4,pagingInfo=@a5,ShowOnlyMyItems=@a6)?@a1='5000'&@a2=false&@a3=1&@a4=3&@a5=null&@a6=false`;
    const rbRes = await fetch(queryUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose",
        "X-RequestDigest": requestDigest
      }
    });

    if (!rbRes.ok) throw new Error(`HTTP error ${rbRes.status}`);

    const rbData = await rbRes.json();
    const allResults = rbData.d.results || [];
    
    // Match against folder name "ctpcu poc tool v5"
    recycleBinItems = allResults.filter(item => {
      const origDir = decodeURIComponent(item.DirName || "").toLowerCase();
      return origDir.includes(listFolderName);
    });

    console.log(`%c✓ Found ${recycleBinItems.length} matching deleted patient card(s) out of ${allResults.length} total recycle bin items!`, "color: #16a34a; font-weight: bold; font-size: 13px;");

    // Fallback filter if needed
    if (recycleBinItems.length === 0 && allResults.length > 0) {
      console.log("Inspecting all recycle bin items for list entries...");
      recycleBinItems = allResults.filter(item => {
        const dir = decodeURIComponent(item.DirName || "").toLowerCase();
        return dir.includes("lists/") || dir.includes("ctpcu");
      });
      console.log(`Fallback filter found ${recycleBinItems.length} item(s).`);
    }

  } catch (err) {
    console.error("Failed to read the Recycle Bin using GetRecycleBinItemsByQueryInfo:", err);
    return;
  }

  if (recycleBinItems.length === 0) {
    console.log("%cAll items in your Recycle Bin for this list have already been restored and discharged! Exiting.", "color: #16a34a; font-weight: bold;");
    return;
  }

  // List all items to be restored in table
  console.table(recycleBinItems.map(item => ({
    RoomOrTitle: item.Title || "Unnamed Item",
    DeletedBy: item.DeletedByName || "Unknown",
    DeletedDate: new Date(item.DeletedDate).toLocaleString(),
    OriginalDirectory: item.DirName
  })));

  // === STEP 6: RESTORE AND DISCHARGE ONE BY ONE ===
  console.log("%cStarting safe restore loop (one-by-one)...", "color: #2563eb; font-weight: bold;");
  let restoredCount = 0;
  let updatedCount = 0;

  for (const item of recycleBinItems) {
    const label = item.Title || `GUID: ${item.Id}`;
    
    try {
      // A. Scan active list item IDs before restoring
      const activeRes = await fetch(`${itemsEndpoint}?$select=Id&$top=5000`, {
        headers: { "Accept": "application/json;odata=verbose" }
      });
      const activeData = await activeRes.json();
      const beforeIds = new Set(activeData.d.results.map(i => i.Id));

      // B. Restore the item by GUID via Web RecycleBin API
      console.log(`Restoring item: "${label}" (Deleted by: ${item.DeletedByName || 'Team Member'})...`);
      const restoreRes = await fetch(`${siteUrl}/_api/web/recyclebin('${item.Id}')/restore()`, {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": requestDigest
        }
      });

      if (!restoreRes.ok) {
        console.error(`✕ Failed to restore "${label}": HTTP ${restoreRes.status}`);
        continue;
      }
      restoredCount++;

      // C. Scan list IDs again to find the newly restored ID (with retry logic for SharePoint indexing latency)
      let newlyAdded = null;
      for (let attempt = 1; attempt <= 4; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 600)); // wait 600ms for indexing
        const afterRes = await fetch(`${itemsEndpoint}?$select=Id&$top=5000`, {
          headers: { "Accept": "application/json;odata=verbose" }
        });
        const afterData = await afterRes.json();
        newlyAdded = afterData.d.results.find(i => !beforeIds.has(i.Id));
        if (newlyAdded) break;
        console.log(`Retrying to locate restored ID for "${label}" (Attempt ${attempt}/4)...`);
      }

      if (newlyAdded) {
        const id = newlyAdded.Id;
        console.log(`Setting status of Item ID ${id} to "Discharged"...`);

        // D. Update its status immediately via GUID items endpoint
        const updatePayload = {
          "__metadata": { "type": listItemEntityType }
        };
        updatePayload[statusInternalName] = "Discharged";

        const updateRes = await fetch(`${itemsEndpoint}(${id})`, {
          method: "POST",
          body: JSON.stringify(updatePayload),
          headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": requestDigest,
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
          }
        });

        if (updateRes.ok) {
          console.log(`%c✓ Successfully restored and marked Room "${label}" as Discharged.`, "color: #16a34a;");
          updatedCount++;
        } else {
          try {
            const errData = await updateRes.json();
            console.error(`✕ Restored "${label}" but failed to update status to Discharged:`, errData.error.message.value);
          } catch (e) {
            console.error(`✕ Restored "${label}" but failed to update status to Discharged: HTTP ${updateRes.status}`);
          }
        }
      } else {
        console.warn(`✕ Restored "${label}" but could not identify its restored list ID after waiting. You may need to manually discharge it.`);
      }

      // Small throttle delay between operations
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (e) {
      console.error(`✕ Error during restoration process for "${label}":`, e);
    }
  }

  console.log(`%c--- Safe Recovery Completed! ---`, "color: #2563eb; font-weight: bold; font-size: 14px;");
  console.log(`Summary: ${recycleBinItems.length} checked. ${restoredCount} restored. ${updatedCount} marked as "Discharged".`);
})();
