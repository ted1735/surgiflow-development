/**
 * SUMMARY: Browser console script to instantly add all consolidated columns to the active SharePoint list view.
 */

(async () => {
    const listName = "SurgiFlow Master";
    const fallbackViewName = "Readmission Huddle Board";

    // 1. Fetch Request Digest token
    const contextResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo", {
        method: "POST",
        headers: { "accept": "application/json;odata=verbose" }
    });
    const contextData = await contextResponse.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    // 2. Auto-detect active view ID
    let viewTargetUrl = "";
    let targetName = "";
    if (typeof _spPageContextInfo !== "undefined" && _spPageContextInfo.viewId) {
        const viewId = _spPageContextInfo.viewId.replace("{", "").replace("}", "").replace("{", "").replace("}", "");
        viewTargetUrl = `views('${viewId}')`;
        targetName = `GUID: ${viewId}`;
        console.log(`%cAuto-detected active view: ${targetName}`, "color: cyan; font-weight: bold;");
    } else {
        viewTargetUrl = `views/getbytitle('${fallbackViewName}')`;
        targetName = fallbackViewName;
        console.log(`%cUsing fallback view name: ${targetName}`, "color: yellow;");
    }

    const fields = [
  "Unit",
  "MRN",
  "Room",
  "Name",
  "AdmitDate",
  "LOS",
  "GMLOS",
  "SxDate",
  "PreOp",
  "EDD",
  "Surgery",
  "ServiceLine",
  "SurgeonCardio",
  "PMHProcedures",
  "AdmitReason",
  "LeaderActionItems",
  "ClinicalNeeds",
  "Dispo",
  "Braden",
  "Mentation",
  "Drip",
  "Isolation",
  "Rhythm",
  "Anticoagulation",
  "TimeCrit",
  "DNR",
  "AdmitWeight",
  "WeightToday",
  "WeightChange",
  "ConsultantsPending",
  "AttendingMD",
  "SkinAssessVerified",
  "MCB",
  "Age",
  "Mobility",
  "ChestTube",
  "GoingHomeWithAC",
  "HDAtHomeOrInpatient",
  "O2Device",
  "O2FlowRate",
  "DCLounge",
  "ApptsMade",
  "PharmacyVerified",
  "RideAVL",
  "POPain",
  "BM",
  "CommentsUpdates",
  "DCOrder",
  "MedRec",
  "WalkTestCompleted",
  "WalkTestNeeded",
  "IVMeds",
  "DCTODAY",
  "IS",
  "NonClinicalDCBarriers",
  "MisalignedDispo",
  "preop2",
  "SurgeryToday",
  "VADType",
  "VADSpeed",
  "VADDressingChangeOrder",
  "DressingChanged",
  "VADPhotoUploaded",
  "VADDsrNextDue",
  "VADVSq4AM",
  "VADVSq4PM",
  "VADRN",
  "VADMissingRequired",
  "VADDND",
  "VADMISCNOTES",
  "VADCartNumber",
  "VADStatus",
  "WeightVerified",
  "FallRisk",
  "PHMedication",
  "PatientName",
  "Payor",
  "GoingHomeWithAC_Details",
  "ConsultantsPending_Details",
  "OtherConsultants",
  "FinalDestination",
  "THK_Pathway",
  "THK_MD_Ordered",
  "THK_ST_Ordered",
  "THK_OT_Ordered",
  "THK_PT_Ordered",
  "THK_CM_Consult",
  "THK_SW_Consult",
  "THK_DC_Needs_Identified",
  "THK_MD_Completed",
  "THK_ST_Completed",
  "THK_OT_Completed",
  "THK_PT_Completed",
  "THK_DND",
  "THK_RN_Handoff",
  "THK_TeamLeaderSignoff",
  "THK_PreOpStatus",
  "THK_PostOpStatus",
  "FamilySupportDischarge",
  "NursingActionItemUpdate",
  "NursingActionItemFollowUp",
  "CMLeaderReview",
  "CMHuddleFollowUp",
  "CoreMeasures",
  "OtherDiagnostics",
  "RiskLevel",
  "Status",
  "AM_Pathway",
  "AM_MD_Ordered",
  "AM_BetaBlocker",
  "AM_Statin",
  "AM_ACE_ARB",
  "AM_P2Y12",
  "AM_EchoDone",
  "AM_Teaching",
  "AM_MedRec",
  "AM_PostDCAppt",
  "AM_CardioConsult",
  "AM_HF_MD_Completed",
  "AM_DND",
  "AM_RN_Handoff",
  "AM_HuddleDone",
  "AM_NLReview",
  "AM_NLReview_Date",
  "AF_Pathway",
  "AF_MD_Ordered",
  "AF_Anticoagulation",
  "AF_BetaBlocker",
  "AF_EchoDone",
  "AF_Teaching",
  "AF_MedRec",
  "AF_PostDCAppt",
  "AF_CardioConsult",
  "AF_HF_MD_Completed",
  "AF_DND",
  "AF_RN_Handoff",
  "AF_HuddleDone",
  "AF_NLReview",
  "AF_NLReview_Date",
  "CA_Pathway",
  "CA_MD_Ordered",
  "CA_Aspirin",
  "CA_BetaBlocker",
  "CA_Statin",
  "CA_ACE_ARB",
  "CA_EchoDone",
  "CA_Teaching",
  "CA_MedRec",
  "CA_PostDCAppt",
  "CA_CardioConsult",
  "CA_HF_MD_Completed",
  "CA_DND",
  "CA_RN_Handoff",
  "CA_HuddleDone",
  "CA_NLReview",
  "CA_NLReview_Date",
  "HF_Pathway",
  "HF_MD_Ordered",
  "HF_GDMT",
  "HF_EchoDone",
  "HF_Teaching",
  "HF_MedRec",
  "HF_PostDCAppt",
  "HF_CardioConsult",
  "HF_MD_Completed",
  "HF_DND",
  "HF_RN_Handoff",
  "HF_HuddleDone",
  "HF_NLReview",
  "HF_NLReview_Date",
  "CO_Pathway",
  "CO_MD_Ordered",
  "CO_Bronchodilator",
  "CO_Steroid",
  "CO_InhalerTeach",
  "CO_LobeDone",
  "CO_Teaching",
  "CO_MedRec",
  "CO_PostDCAppt",
  "CO_CardioConsult",
  "CO_HF_MD_Completed",
  "CO_DND",
  "CO_RN_Handoff",
  "CO_HuddleDone",
  "CO_NLReview",
  "CO_NLReview_Date",
  "PN_Pathway",
  "PN_MD_Ordered",
  "PN_Antibiotic",
  "PN_SputumBlood",
  "PN_Vaccine",
  "PN_Teaching",
  "PN_MedRec",
  "PN_PostDCAppt",
  "PN_CardioConsult",
  "PN_HF_MD_Completed",
  "PN_DND",
  "PN_RN_Handoff",
  "PN_HuddleDone",
  "PN_NLReview",
  "PN_NLReview_Date",
  "THK_Pathway_1",
  "THK_MD_Ordered_1",
  "THK_MD_Completed_1",
  "THK_PTOT",
  "THK_Activity",
  "THK_DME",
  "FIN_Escalations",
  "FIN_MedRec",
  "FIN_IPMedParams",
  "FIN_NoDupeMeds",
  "FIN_NewMedsEd",
  "FIN_MedDetails",
  "FIN_Transport",
  "FIN_ZoneTool",
  "FIN_Core4",
  "FIN_AVSReviewed",
  "FIN_Understanding",
  "FIN_HuddleDone",
  "FIN_NLReview",
  "FIN_NLReview_Date",
  "DEV_Has",
  "DEV_List",
  "DEV_Presence",
  "DEV_AtDischarge",
  "DEV_Teachback",
  "DEV_Followup",
  "DEV_Notes"
];

    console.log(`Starting to add ${fields.length} fields to view...`);

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const field of fields) {
        try {
            const url = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/${viewTargetUrl}/viewfields/addviewfield('${field}')`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose;charset=utf-8",
                    "X-RequestDigest": digest
                }
            });

            if (response.ok) {
                console.log(`%cAdded: ${field}`, "color: green;");
                addedCount++;
            } else {
                const data = await response.json();
                const errMsg = data.error?.message?.value || "";
                if (errMsg.indexOf("already exists") >= 0 || errMsg.indexOf("already in the view") >= 0) {
                    console.log(`%cAlready in view: ${field}`, "color: gray;");
                    skippedCount++;
                } else {
                    console.warn(`Error for ${field}:`, errMsg);
                    errorCount++;
                }
            }
        } catch (e) {
            console.error(`Fetch error adding ${field}:`, e);
            errorCount++;
        }
    }

    console.log(`%cFinished! Successfully added ${addedCount} new fields, ${skippedCount} already present, ${errorCount} errors.`, "color: green; font-weight: bold; font-size: 13px;");
})();
