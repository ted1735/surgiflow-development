/**
 * ========================================================================
 * GT6 SURGIFLOW CPPCU - RECYCLE BIN PATIENT RECOVERY UTILITY (SAFE-RESTORE)
 * ========================================================================
 * 
 * DESCRIPTION:
 * This script runs in the browser console (F12) on your SharePoint page to:
 * 1. Automatically scan all current active list items and set any blank or 
 *    uninitialized status fields to "Progressing On Schedule".
 * 2. Scan, restore, and set the status of deleted patients to "Discharged"
 *    ONE BY ONE to prevent active dashboard clutter.
 * 
 * Target Field: 🚦 CLINICAL PROGRESS 🚦 (OData__x0001f6a6__x0020_CLINICAL_x0020)
 * Target Bin: Site Collection Recycle Bin (_api/site/recyclebin)
 * 
 * HOW TO USE:
 * 1. Open Google Chrome or Microsoft Edge and navigate to your SharePoint list:
 *    https://ahsonline.sharepoint.com/sites/group-gt6leadershipteamgroup/Lists/GT6%20SURGIFLOW%20CPPCU/Patient%20Dashboard.aspx
 * 2. Press F12 (or right-click -> Inspect) and go to the "Console" tab.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 * 4. Monitor the logs as it recovers the items and marks them as Discharged.
 */

(async () => {
  console.log("%c--- Starting SurgiFlow Safe Recycle Bin Recovery ---", "color: #2563eb; font-weight: bold; font-size: 14px;");

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

  // === STEP 2: GET LIST DATA & ENTITY TYPE ===
  console.log(`Fetching list settings...`);
  let listItemEntityType = "";
  try {
    const listRes = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')`, {
      headers: { "Accept": "application/json;odata=verbose" }
    });
    if (!listRes.ok) throw new Error("Could not find list: " + listTitle);
    const listData = await listRes.json();
    listItemEntityType = listData.d.ListItemEntityTypeFullName;
    console.log(`%c✓ Connected to list. Entity Type: ${listItemEntityType}`, "color: #16a34a;");
  } catch (err) {
    console.error("Failed to fetch list configuration:", err);
    return;
  }

  // === STEP 3: SCAN ACTIVE PATIENTS & SET UNSET STATUSES TO "Progressing On Schedule" ===
  console.log(`Scanning active patients and setting blank statuses to "Progressing On Schedule"...`);
  const existingIds = new Set();
  try {
    const activeRes = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$select=Id,OData__x0001f6a6__x0020_CLINICAL_x0020&$top=5000`, {
      headers: { "Accept": "application/json;odata=verbose" }
    });
    const activeData = await activeRes.json();
    const activeItems = activeData.d.results;
    activeItems.forEach(item => existingIds.add(item.Id));
    console.log(`✓ Found ${existingIds.size} active items in list.`);

    let activeItemsUpdated = 0;
    for (const item of activeItems) {
      const currentStatus = item.OData__x0001f6a6__x0020_CLINICAL_x0020;
      // If the status is not already set to a valid choice, default it to "Progressing On Schedule"
      if (currentStatus !== "Progressing On Schedule" && 
          currentStatus !== "Not Improving" && 
          currentStatus !== "Ready for DC" && 
          currentStatus !== "Discharged" && 
          currentStatus !== "Sent to ICU") {
        
        console.log(`Initializing status for active Item ID ${item.Id} to "Progressing On Schedule"...`);
        const updateRes = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${item.Id})`, {
          method: "POST",
          body: JSON.stringify({
            "__metadata": { "type": listItemEntityType },
            "OData__x0001f6a6__x0020_CLINICAL_x0020": "Progressing On Schedule"
          }),
          headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": requestDigest,
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
          }
        });
        if (updateRes.ok) {
          activeItemsUpdated++;
        } else {
          console.error(`✕ Failed to update active Item ID ${item.Id}`);
        }
      }
    }
    console.log(`%c✓ Successfully set status to "Progressing On Schedule" for ${activeItemsUpdated} active patients.`, "color: #16a34a;");
  } catch (err) {
    console.error("Failed to scan active list items or initialize statuses:", err);
    return;
  }

  // === STEP 4: FETCH DELETED ITEMS FROM SITE RECYCLE BIN ===
  console.log("Searching Site Collection Recycle Bin for patients deleted from this list...");
  let recycleBinItems = [];
  let isSiteBin = true;

  try {
    let rbRes = await fetch(`${siteUrl}/_api/site/recyclebin`, {
      headers: { "Accept": "application/json;odata=verbose" }
    });
    
    if (rbRes.status === 403 || rbRes.status === 401) {
      console.warn("Access denied to Site Collection Recycle Bin. Falling back to User-level Recycle Bin...");
      rbRes = await fetch(`${siteUrl}/_api/web/recyclebin`, {
        headers: { "Accept": "application/json;odata=verbose" }
      });
      isSiteBin = false;
    }

    if (!rbRes.ok) throw new Error(`HTTP error ${rbRes.status}`);

    const rbData = await rbRes.json();
    const listRelativePath = `Lists/${listTitle}`;
    
    recycleBinItems = rbData.d.results.filter(item => {
      const origDir = (item.DirName || "").toLowerCase();
      return origDir.includes(listRelativePath.toLowerCase());
    });

    console.log(`Found ${recycleBinItems.length} matching deleted item(s) in the Recycle Bin.`);
  } catch (err) {
    console.error("Failed to read the SharePoint Recycle Bin:", err);
    return;
  }

  if (recycleBinItems.length === 0) {
    console.log("%cNo items from this list were found in your Recycle Bin. Exiting.", "color: #ea580c; font-weight: bold;");
    return;
  }

  // List all items to be restored
  console.table(recycleBinItems.map(item => ({
    Title: item.Title || "Unnamed Item",
    DeletedDate: new Date(item.DeletedDate).toLocaleString(),
    OriginalDirectory: item.DirName
  })));

  const binPath = isSiteBin ? "site/recyclebin" : "web/recyclebin";

  // === STEP 5: RESTORE AND DISCHARGE ONE BY ONE ===
  console.log("%cStarting safe restore loop (one-by-one)...", "color: #2563eb; font-weight: bold;");
  let restoredCount = 0;
  let updatedCount = 0;

  for (const item of recycleBinItems) {
    const label = item.Title || `GUID: ${item.Id}`;
    
    try {
      // A. Scan active list item IDs before restoring
      const activeRes = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$select=Id&$top=5000`, {
        headers: { "Accept": "application/json;odata=verbose" }
      });
      const activeData = await activeRes.json();
      const beforeIds = new Set(activeData.d.results.map(i => i.Id));

      // B. Restore the item
      console.log(`Restoring item: "${label}"...`);
      const restoreRes = await fetch(`${siteUrl}/_api/${binPath}('${item.Id}')/restore()`, {
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
        const afterRes = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$select=Id&$top=5000`, {
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

        // D. Update its status immediately
        const updatePayload = {
          "__metadata": { "type": listItemEntityType },
          "OData__x0001f6a6__x0020_CLINICAL_x0020": "Discharged"
        };

        const updateRes = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${id})`, {
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
          console.error(`✕ Restored "${label}" but failed to update status to Discharged: HTTP ${updateRes.status}`);
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
