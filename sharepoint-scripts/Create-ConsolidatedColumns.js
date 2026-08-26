/**
 * SUMMARY: Browser-executable JavaScript utility using the SharePoint REST API to dynamically provision required SurgiFlow metadata columns.
 */

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

    // Get current fields to check if they already exist
    const currentFieldsResponse = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields?$filter=Hidden eq false`, {
        headers: { "accept": "application/json;odata=verbose" }
    });
    const currentFieldsData = await currentFieldsResponse.json();
    const existingInternals = new Set(currentFieldsData.d.results.map(f => f.InternalName.toLowerCase()));
    const existingDisplays = new Set(currentFieldsData.d.results.map(f => f.Title.toLowerCase()));

    const fields = [
  {
    "DisplayName": "Unit",
    "InternalName": "Unit",
    "FieldType": "Choice",
    "Choices": "GT8 CVPCU; GT7 CARDIAC PCU; GT6 CPPCU; WT8 STPCU",
    "Required": "TRUE",
    "Default": "GT8 CVPCU",
    "Notes": ""
  },
  {
    "DisplayName": "MRN",
    "InternalName": "MRN",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Room",
    "InternalName": "Room",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Name",
    "InternalName": "Name",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Admit Date",
    "InternalName": "AdmitDate",
    "FieldType": "DateTime",
    "Choices": "DateOnly",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "LOS",
    "InternalName": "LOS",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Sx Date",
    "InternalName": "SxDate",
    "FieldType": "DateTime",
    "Choices": "DateOnly",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Pre Op",
    "InternalName": "PreOp",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "EDD",
    "InternalName": "EDD",
    "FieldType": "DateTime",
    "Choices": "DateOnly",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Surgery",
    "InternalName": "Surgery",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Service Line",
    "InternalName": "ServiceLine",
    "FieldType": "Choice",
    "Choices": "CTsx; CVmed; Transplant; Cardiology; Vascular; Thoracic; Other",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Surgeon/Cardio",
    "InternalName": "SurgeonCardio",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "PMH/Procedures",
    "InternalName": "PMHProcedures",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Admit Reason",
    "InternalName": "AdmitReason",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Leader Action Items",
    "InternalName": "LeaderActionItems",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Clinical Needs to Continue Admission",
    "InternalName": "ClinicalNeeds",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Dispo",
    "InternalName": "Dispo",
    "FieldType": "Choice",
    "Choices": "SNF; Home No Needs; HHC DME ONLY; HHC; IPR-AH; HHC ABX ONLY; Hospice; Palliative; Rehab; Other",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Braden",
    "InternalName": "Braden",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Mentation",
    "InternalName": "Mentation",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Drip",
    "InternalName": "Drip",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Isolation",
    "InternalName": "Isolation",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Rhythm",
    "InternalName": "Rhythm",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Anticoagulation",
    "InternalName": "Anticoagulation",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "⏱⏱ Time Crit ⏱⏱",
    "InternalName": "TimeCrit",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DNR",
    "InternalName": "DNR",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "AdmitWeight",
    "InternalName": "AdmitWeight",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "WeightToday",
    "InternalName": "WeightToday",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "WeightChange",
    "InternalName": "WeightChange",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Consultants Pending",
    "InternalName": "ConsultantsPending",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "AttendingMD",
    "InternalName": "AttendingMD",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "SkinAssessVerified",
    "InternalName": "SkinAssessVerified",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "MCB",
    "InternalName": "MCB",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Age",
    "InternalName": "Age",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Mobility",
    "InternalName": "Mobility",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Chest Tube",
    "InternalName": "ChestTube",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Going Home With AC?",
    "InternalName": "GoingHomeWithAC",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HD at Home or Inpatient?",
    "InternalName": "HDAtHomeOrInpatient",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "O2 Device",
    "InternalName": "O2Device",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "O2L/%",
    "InternalName": "O2FlowRate",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DC Lounge",
    "InternalName": "DCLounge",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Appts Made",
    "InternalName": "ApptsMade",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Pharmacy Verified",
    "InternalName": "PharmacyVerified",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Ride AVL",
    "InternalName": "RideAVL",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "PO Pain",
    "InternalName": "POPain",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "BM",
    "InternalName": "BM",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Comments/Updates",
    "InternalName": "CommentsUpdates",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DC Order",
    "InternalName": "DCOrder",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Med Rec",
    "InternalName": "MedRec",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Walk Test Completed",
    "InternalName": "WalkTestCompleted",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Walk Test Needed",
    "InternalName": "WalkTestNeeded",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "IV Meds",
    "InternalName": "IVMeds",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DC TODAY",
    "InternalName": "DCTODAY",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "IS",
    "InternalName": "IS",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "ALL DC BARRIERS",
    "InternalName": "NonClinicalDCBarriers",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Misaligned Dispo",
    "InternalName": "MisalignedDispo",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "pre op",
    "InternalName": "preop2",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "SurgeryToday",
    "InternalName": "SurgeryToday",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Type",
    "InternalName": "VADType",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Speed",
    "InternalName": "VADSpeed",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Dressing Change Order",
    "InternalName": "VADDressingChangeOrder",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Dressing Changed",
    "InternalName": "DressingChanged",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Photo Uploaded",
    "InternalName": "VADPhotoUploaded",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Dsr Next Due",
    "InternalName": "VADDsrNextDue",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD VS q4 AM",
    "InternalName": "VADVSq4AM",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD VS q4 PM",
    "InternalName": "VADVSq4PM",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD RN",
    "InternalName": "VADRN",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Missing Required",
    "InternalName": "VADMissingRequired",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD DND",
    "InternalName": "VADDND",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD MISC NOTES",
    "InternalName": "VADMISCNOTES",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Cart",
    "InternalName": "VADCartNumber",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "VAD Status",
    "InternalName": "VADStatus",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Weight Verified",
    "InternalName": "WeightVerified",
    "FieldType": "Choice",
    "Choices": "True; False",
    "Required": "FALSE",
    "Default": "False",
    "Notes": ""
  },
  {
    "DisplayName": "Fall Risk",
    "InternalName": "FallRisk",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "",
    "CustomFormatter": {
      "elmType": "div",
      "style": {
        "background-color": "=if(@currentField == '', '', if(indexOf(@currentField, 'High') > -1 || indexOf(@currentField, 'high') > -1 || (Number(@currentField) > 0 && Number(@currentField) >= 45), '#fee2e2', if(indexOf(@currentField, 'Medium') > -1 || indexOf(@currentField, 'medium') > -1 || indexOf(@currentField, 'Moderate') > -1 || indexOf(@currentField, 'moderate') > -1 || (Number(@currentField) > 0 && Number(@currentField) >= 25), '#fef9c3', '#dcfce7')))",
        "color": "=if(@currentField == '', '', if(indexOf(@currentField, 'High') > -1 || indexOf(@currentField, 'high') > -1 || (Number(@currentField) > 0 && Number(@currentField) >= 45), '#b91c1c', if(indexOf(@currentField, 'Medium') > -1 || indexOf(@currentField, 'medium') > -1 || indexOf(@currentField, 'Moderate') > -1 || indexOf(@currentField, 'moderate') > -1 || (Number(@currentField) > 0 && Number(@currentField) >= 25), '#a16207', '#15803d')))",
        "border": "=if(@currentField == '', '', if(indexOf(@currentField, 'High') > -1 || indexOf(@currentField, 'high') > -1 || (Number(@currentField) > 0 && Number(@currentField) >= 45), '1.5px solid #fca5a5', if(indexOf(@currentField, 'Medium') > -1 || indexOf(@currentField, 'medium') > -1 || indexOf(@currentField, 'Moderate') > -1 || indexOf(@currentField, 'moderate') > -1 || (Number(@currentField) > 0 && Number(@currentField) >= 25), '1.5px solid #fde047', '1.5px solid #86efac')))",
        "padding": "4px 8px",
        "border-radius": "12px",
        "font-weight": "bold",
        "display": "inline-block"
      },
      "txtContent": "@currentField"
    }
  },
  {
    "DisplayName": "PH Medication?",
    "InternalName": "PHMedication",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Patient Name",
    "InternalName": "PatientName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "TRUE",
    "Default": "",
    "Notes": "System of record patient name"
  },
  {
    "DisplayName": "Payor",
    "InternalName": "Payor",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text payor name"
  },
  {
    "DisplayName": "CORE Measures",
    "InternalName": "CoreMeasures",
    "FieldType": "MultiChoice",
    "Choices": "AMI; CABG; COPD; HF; PNA; THK",
    "Required": "TRUE",
    "Default": "",
    "Notes": "Drives which conditional modules apply"
  },
  {
    "DisplayName": "Other Diagnosis",
    "InternalName": "OtherDiagnostics",
    "FieldType": "MultiChoice",
    "Choices": "Diabetes; Sepsis",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Readmit Risk",
    "InternalName": "RiskLevel",
    "FieldType": "Choice",
    "Choices": "Low; Medium; High",
    "Required": "FALSE",
    "Default": "Low",
    "Notes": "AH V2 IP Risk Level",
    "CustomFormatter": {
      "elmType": "div",
      "style": {
        "background-color": "=if(@currentField == '', '', if(indexOf(@currentField, 'High') > -1 || indexOf(@currentField, '22%') > -1, '#fee2e2', if(indexOf(@currentField, 'Medium') > -1 || indexOf(@currentField, '13%') > -1 || indexOf(@currentField, '13-22%') > -1, '#fef9c3', if(indexOf(@currentField, 'Low') > -1 || indexOf(@currentField, '12%') > -1 || indexOf(@currentField, '<12%') > -1, '#dcfce7', if(Number(@currentField) > 0 || @currentField == '0', if(Number(@currentField) > 22, '#fee2e2', if(Number(@currentField) >= 13, '#fef9c3', '#dcfce7')), '#dcfce7')))))",
        "color": "=if(@currentField == '', '', if(indexOf(@currentField, 'High') > -1 || indexOf(@currentField, '22%') > -1, '#b91c1c', if(indexOf(@currentField, 'Medium') > -1 || indexOf(@currentField, '13%') > -1 || indexOf(@currentField, '13-22%') > -1, '#a16207', if(indexOf(@currentField, 'Low') > -1 || indexOf(@currentField, '12%') > -1 || indexOf(@currentField, '<12%') > -1, '#15803d', if(Number(@currentField) > 0 || @currentField == '0', if(Number(@currentField) > 22, '#b91c1c', if(Number(@currentField) >= 13, '#a16207', '#15803d')), '#15803d')))))",
        "border": "=if(@currentField == '', '', if(indexOf(@currentField, 'High') > -1 || indexOf(@currentField, '22%') > -1, '1.5px solid #fca5a5', if(indexOf(@currentField, 'Medium') > -1 || indexOf(@currentField, '13%') > -1 || indexOf(@currentField, '13-22%') > -1, '1.5px solid #fde047', if(indexOf(@currentField, 'Low') > -1 || indexOf(@currentField, '12%') > -1 || indexOf(@currentField, '<12%') > -1, '1.5px solid #86efac', if(Number(@currentField) > 0 || @currentField == '0', if(Number(@currentField) > 22, '1.5px solid #fca5a5', if(Number(@currentField) >= 13, '1.5px solid #fde047', '1.5px solid #86efac')), '1.5px solid #86efac')))))",
        "padding": "4px 8px",
        "border-radius": "12px",
        "font-weight": "bold",
        "display": "inline-block"
      },
      "txtContent": "@currentField"
    }
  },
  {
    "DisplayName": "Status",
    "InternalName": "Status",
    "FieldType": "Choice",
    "Choices": "In Progress; Ready for DC; Discharged",
    "Required": "FALSE",
    "Default": "In Progress",
    "Notes": "List/workflow field \u2014 set in the app or by flow; not on the bedside form"
  },
  {
    "DisplayName": "Other",
    "InternalName": "OtherConsultants",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Cardiology Sign-off",
    "InternalName": "CardiologyConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Cardiology MD",
    "InternalName": "CardiologyConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "EP Cardiology Sign-off",
    "InternalName": "EPCardiologyConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "EP Cardiology MD",
    "InternalName": "EPCardiologyConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Advanced HF Sign-off",
    "InternalName": "AdvancedHFConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Advanced HF MD",
    "InternalName": "AdvancedHFConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "CTS Sign-off",
    "InternalName": "CTSConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "CTS MD",
    "InternalName": "CTSConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Pulmonary Sign-off",
    "InternalName": "PulmonaryConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Pulmonary MD",
    "InternalName": "PulmonaryConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Infectious Disease Sign-off",
    "InternalName": "InfectiousDiseaseConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Infectious Disease MD",
    "InternalName": "InfectiousDiseaseConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Heme/Onco Sign-off",
    "InternalName": "HemeOncoConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Heme/Onco MD",
    "InternalName": "HemeOncoConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "GI Sign-off",
    "InternalName": "GIConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "GI MD",
    "InternalName": "GIConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Nephrology Sign-off",
    "InternalName": "NephrologyConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Nephrology MD",
    "InternalName": "NephrologyConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Hospice Sign-off",
    "InternalName": "HospiceConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Hospice MD",
    "InternalName": "HospiceConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Palliative Sign-off",
    "InternalName": "PalliativeConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Palliative MD",
    "InternalName": "PalliativeConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Endocrinology Sign-off",
    "InternalName": "EndocrinologyConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Endocrinology MD",
    "InternalName": "EndocrinologyConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Neurology Sign-off",
    "InternalName": "NeurologyConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Neurology MD",
    "InternalName": "NeurologyConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Neurosurgery Sign-off",
    "InternalName": "NeurosurgeryConsultSignoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Individual specialist consult sign-off (mirrors DCmd granularity). Blank = not addressed / no consult; Yes = consult completed & signed off; No = open gap."
  },
  {
    "DisplayName": "Neurosurgery MD",
    "InternalName": "NeurosurgeryConsultName",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text consultant/physician name for the paired sign-off. Optional; complements the Yes/No consult sign-off."
  },
  {
    "DisplayName": "Other (Misc)",
    "InternalName": "OtherConsultantMisc",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text catch-all for any additional consultants during the admission not covered by the fixed specialties (e.g., specialty + physician name + date). Keeps a running record of miscellaneous consults."
  },
  {
    "DisplayName": "Other (Misc) Sign-off",
    "InternalName": "OtherConsultantMiscSognoff",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free-text catch-all for any additional consultants during the admission not covered by the fixed specialties (e.g., specialty + physician name + date). Keeps a running record of miscellaneous consults."
  },
  {
    "DisplayName": "Active IV Meds Transition Plan",
    "InternalName": "ActiveIVTransition",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "IV Lasix/Bumex; Antibiotics; Steroids; Drips"
  },
  {
    "DisplayName": "PT/OT Eval Completed",
    "InternalName": "PTOTEval",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final Destination",
    "InternalName": "FinalDestination",
    "FieldType": "MultiChoice",
    "Choices": "HHC; IPR; SNF; Home (no needs)",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final Destination Other",
    "InternalName": "FinalDestinationOther",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Disposition Misalignment Escalation",
    "InternalName": "DispMisalignEscalation",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Declined HHC -> leadership escalation completed?"
  },
  {
    "DisplayName": "Home Equipment Verified",
    "InternalName": "HomeEquipment",
    "FieldType": "MultiChoice",
    "Choices": "Scale; BP Machine/Cuff; Pulse Oximetry",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HHC/SNF/IPR Auth Submitted",
    "InternalName": "HHCAuthSubmitted",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DME/Supplies",
    "InternalName": "DMESupplies",
    "FieldType": "MultiChoice",
    "Choices": "FWW; Oxygen; IV Infusion; LV",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DME/Supplies Other",
    "InternalName": "DMESuppliesOther",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "DME/Supplies Arranged",
    "InternalName": "DMEArranged",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Correct Pharmacy Listed",
    "InternalName": "CorrectPharmacy",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Med Access & Cost Resolved",
    "InternalName": "MedAccessResolved",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Wound Care Instructions",
    "InternalName": "WoundCareInstructions",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "If applicable"
  },
  {
    "DisplayName": "PCP Scheduled",
    "InternalName": "FU_PCP",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "All CORE measures, within 1 week of DC"
  },
  {
    "DisplayName": "PCP Appt Date",
    "InternalName": "FU_PCP_Date",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Free text date/provider"
  },
  {
    "DisplayName": "Cardio Scheduled",
    "InternalName": "FU_Cardio",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Shown/required when AMI/HF/CABG measure is on the chart OR a cardiology (Cardio/EP Cardio/AHF) consult is on the case"
  },
  {
    "DisplayName": "Cardio Appt Date",
    "InternalName": "FU_Cardio_Date",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Provider + date"
  },
  {
    "DisplayName": "CTS/Surgeon Scheduled",
    "InternalName": "FU_CTS",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Shown/required when CABG measure is on the chart OR CTS (Cardiothoracic Surgery) consult is on the case"
  },
  {
    "DisplayName": "CTS/Surgeon Appt Date",
    "InternalName": "FU_CTS_Date",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Provider + date"
  },
  {
    "DisplayName": "Bridge Services Requested",
    "InternalName": "FU_Bridge",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Dispatch Health Acute, HSC, AHMG Cardiac Bridge"
  },
  {
    "DisplayName": "Bridge Services Detail",
    "InternalName": "FU_Bridge_Detail",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Pulm Scheduled",
    "InternalName": "FU_Pulm",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Shown/required when COPD/PNA measure is on the chart OR a Pulm consult is on the case"
  },
  {
    "DisplayName": "Pulm Appt Date",
    "InternalName": "FU_Pulm_Date",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Has A-Fib",
    "InternalName": "AFib_Has",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "History or new A-Fib"
  },
  {
    "DisplayName": "A-Fib Type",
    "InternalName": "AFib_Type",
    "FieldType": "Choice",
    "Choices": "Known; New",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Known: AC Verified/Bridged",
    "InternalName": "AFib_KnownVerified",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Known: AC Restarted Inpatient",
    "InternalName": "AFib_KnownRestarted",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Known: AC on AVS w/ Dose",
    "InternalName": "AFib_KnownAVS",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "New: A-Fib Teach-back",
    "InternalName": "AFib_NewTeach",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "New: AC Prescription Provided",
    "InternalName": "AFib_NewScript",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "New: Bleeding Risk Documented",
    "InternalName": "AFib_BleedingRisk",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Only if no script provided"
  },
  {
    "DisplayName": "AMI Medications",
    "InternalName": "AMI_Meds",
    "FieldType": "MultiChoice",
    "Choices": "DAPT; Statin; Beta-blocker; ACE/ARB/ARNI",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "AMI: Heart Cath/PCI This Encounter",
    "InternalName": "AMI_Cath",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "AMI: Provider (Date/Name)",
    "InternalName": "AMI_Provider",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "AMI: Cardiac Rehab Referral",
    "InternalName": "AMI_Rehab",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "CABG Medications",
    "InternalName": "CABG_Meds",
    "FieldType": "MultiChoice",
    "Choices": "Antiplatelet; Statin; Beta-blocker; Stool Regimen; Diuretic; Antiarrhythmic; Pain Regimen",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "CABG: This Encounter",
    "InternalName": "CABG_Encounter",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "CABG: Surgeon (Date/Name)",
    "InternalName": "CABG_Surgeon",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "CABG: Cardiac Rehab Referral",
    "InternalName": "CABG_Rehab",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "CABG: Glycemic Control Plan",
    "InternalName": "CABG_Glycemic",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "If applicable"
  },
  {
    "DisplayName": "CABG: Navigator Contact AVS",
    "InternalName": "CABG_Navigator",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "COPD: Inhaler/Neb Regimen Optimized",
    "InternalName": "COPD_Regimen",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "RT/COPD Navigator"
  },
  {
    "DisplayName": "COPD: Inhaler Technique Education",
    "InternalName": "COPD_Technique",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "RT/COPD Navigator"
  },
  {
    "DisplayName": "COPD: Steroid/Antibiotic Plan",
    "InternalName": "COPD_Plan",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "COPD: Smoking Cessation",
    "InternalName": "COPD_Smoking",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "COPD: Pulmonary Rehab Referral",
    "InternalName": "COPD_Rehab",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "If applicable"
  },
  {
    "DisplayName": "COPD: Walk Test 24-48 hrs",
    "InternalName": "COPD_WalkTest",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF Medications",
    "InternalName": "HF_Meds",
    "FieldType": "MultiChoice",
    "Choices": "Diuretic; Beta-Blocker; ACE/ARB/ARNI; MRAs (Spironolactone); SGLT2 (Jardiance)",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Daily Standing Weight",
    "InternalName": "HF_StandingWeight",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Stable Weight Trend",
    "InternalName": "HF_WeightTrend",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Reassess if bed scale utilized"
  },
  {
    "DisplayName": "HF: CHF Order Set EPIC",
    "InternalName": "HF_OrderSet",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Nurse driven"
  },
  {
    "DisplayName": "HF: Cardiac Rehab Phase I",
    "InternalName": "HF_RehabPhase1",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Sodium Restriction",
    "InternalName": "HF_Sodium",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Sodium Restriction Value",
    "InternalName": "HF_SodiumValue",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Fluid Restriction",
    "InternalName": "HF_Fluid",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Fluid Restriction Value",
    "InternalName": "HF_FluidValue",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Diuretic Plan for DC",
    "InternalName": "HF_DiureticPlan",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Diuretic Plan Value",
    "InternalName": "HF_DiureticValue",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Dry Weight on AVS",
    "InternalName": "HF_DryWeight",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "HF: Dry Weight Value",
    "InternalName": "HF_DryWeightValue",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "PNA: Steroid & Antibiotic Plan",
    "InternalName": "PNA_Plan",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "PNA: IS Education Teach-back",
    "InternalName": "PNA_ISEd",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "PNA: IS Usage Documented",
    "InternalName": "PNA_ISUse",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "RN"
  },
  {
    "DisplayName": "PNA: Vaccination Status Addressed",
    "InternalName": "PNA_Vaccination",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: Pain Med Education",
    "InternalName": "THK_PainEd",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: Pain Med Order for DC",
    "InternalName": "THK_PainOrder",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: VTE Prophylaxis",
    "InternalName": "THK_VTE",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: Weight-Bearing Status",
    "InternalName": "THK_WeightBearing",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: PT/OT Arranged",
    "InternalName": "THK_PTOT",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: Activity Restrictions",
    "InternalName": "THK_Activity",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "THK: DME Arranged",
    "InternalName": "THK_DME",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: Escalations Completed",
    "InternalName": "FIN_Escalations",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "If gaps identified"
  },
  {
    "DisplayName": "Final: DC Med Rec by Pharmacy",
    "InternalName": "FIN_MedRec",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: IP Med Parameters on AVS",
    "InternalName": "FIN_IPMedParams",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: No Duplicate Meds",
    "InternalName": "FIN_NoDupeMeds",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: New Meds & Dx Education",
    "InternalName": "FIN_NewMedsEd",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "High-risk emphasis row"
  },
  {
    "DisplayName": "Final: All Meds Dose & Frequency",
    "InternalName": "FIN_MedDetails",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: Reliable Transport Confirmed",
    "InternalName": "FIN_Transport",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: Zone Tool on AVS",
    "InternalName": "FIN_ZoneTool",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Whole-Person Care Journey, CORE-specific"
  },
  {
    "DisplayName": "Final: Core 4 Pack Given",
    "InternalName": "FIN_Core4",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: AVS Reviewed w/ Patient & Family",
    "InternalName": "FIN_AVSReviewed",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: Patient Verbalized Understanding",
    "InternalName": "FIN_Understanding",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Appropriate teach-back completed"
  },
  {
    "DisplayName": "Final: Readmission Huddle Completed Prior to DC",
    "InternalName": "FIN_HuddleDone",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Final: Nurse Leader Review",
    "InternalName": "FIN_NLReview",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Discharge Excellence Final Review"
  },
  {
    "DisplayName": "Final: Nurse Leader Review Date",
    "InternalName": "FIN_NLReview_Date",
    "FieldType": "DateTime",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Has Device",
    "InternalName": "DEV_Has",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Device List",
    "InternalName": "DEV_List",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "PICC, Foley, Wound Vac, etc."
  },
  {
    "DisplayName": "Device Presence Documented",
    "InternalName": "DEV_Presence",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Devices at Discharge Identified",
    "InternalName": "DEV_AtDischarge",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Device Teach-back Completed",
    "InternalName": "DEV_Teachback",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Device DC Follow-up Addressed",
    "InternalName": "DEV_Followup",
    "FieldType": "Choice",
    "Choices": "Yes; No",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Device Documentation Notes",
    "InternalName": "DEV_Notes",
    "FieldType": "Note",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": "Required when any device item = No; flows into the huddle note output"
  }
];

    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    console.log(`Checking and adding ${fields.length} columns...`);
    let addedCount = 0;
    let skippedCount = 0;

    for (const field of fields) {
        let type = field.FieldType;
        let displayName = field.DisplayName;
        let internalName = field.InternalName;
        let choices = field.Choices ? field.Choices.split(';').map(c => c.trim()).filter(c => c) : [];
        let required = field.Required === 'TRUE' ? 'TRUE' : 'FALSE';
        let defaultValue = field.Default ? field.Default.trim() : '';

        async function applyCustomFormatting(internalName, displayName, formatterObj) {
            try {
                const updateRes = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameorTitle('${internalName}')`, {
                    method: "POST",
                    body: JSON.stringify({
                        "__metadata": { "type": "SP.Field" },
                        "CustomFormatter": JSON.stringify(formatterObj)
                    }),
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": digest,
                        "X-HTTP-Method": "MERGE",
                        "IF-MATCH": "*"
                    }
                });
                if (updateRes.ok) {
                    console.log(`%cApplied Column Formatting to: ${displayName}`, "color: #0284c7; font-weight: bold;");
                } else {
                    const errData = await updateRes.json();
                    console.error(`Error applying formatting to ${displayName}:`, errData.error.message.value);
                }
            } catch (e) {
                console.error(`Fetch error applying formatting to ${displayName}:`, e);
            }
        }

        // Check if exists
        if (existingInternals.has(internalName.toLowerCase())) {
            console.log(`%cChecking/Updating existing field: ${displayName} (${internalName})`, "color: #0284c7;");
            skippedCount++;
            
            // Perform MERGE to update Title (display name) and CustomFormatter (if any)
            try {
                const updatePayload = {
                    "__metadata": { "type": "SP.Field" },
                    "Title": displayName
                };
                if (field.CustomFormatter) {
                    updatePayload.CustomFormatter = JSON.stringify(field.CustomFormatter);
                }
                const updateRes = await fetch(_spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameorTitle('${internalName}')`, {
                    method: "POST",
                    body: JSON.stringify(updatePayload),
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": digest,
                        "X-HTTP-Method": "MERGE",
                        "IF-MATCH": "*"
                    }
                });
                if (updateRes.ok) {
                    console.log(`%c✓ Successfully updated existing field: ${displayName}`, "color: green;");
                } else {
                    const errData = await updateRes.json();
                    console.error(`Error updating existing field ${displayName}:`, errData.error.message.value);
                }
            } catch (e) {
                console.error(`Fetch error updating existing field ${displayName}:`, e);
            }
            continue;
        }

        let escapedDisplayName = escapeXml(displayName);
        let escapedInternalName = escapeXml(internalName);
        let escapedDefaultValue = escapeXml(defaultValue);

        let xml = '';
        if (type === 'Choice') {
            let choiceXml = choices.map(c => `<CHOICE>${escapeXml(c)}</CHOICE>`).join('');
            xml = `<Field Type='Choice' DisplayName='${escapedDisplayName}' Name='${escapedInternalName}' Required='${required}' Format='Dropdown'><CHOICES>${choiceXml}</CHOICES>`;
            if (defaultValue) {
                xml += `<Default>${escapedDefaultValue}</Default>`;
            }
            xml += `</Field>`;
        } else if (type === 'MultiChoice') {
            let choiceXml = choices.map(c => `<CHOICE>${escapeXml(c)}</CHOICE>`).join('');
            xml = `<Field Type='MultiChoice' DisplayName='${escapedDisplayName}' Name='${escapedInternalName}' Required='${required}'><CHOICES>${choiceXml}</CHOICES>`;
            if (defaultValue) {
                xml += `<Default>${escapedDefaultValue}</Default>`;
            }
            xml += `</Field>`;
        } else if (type === 'Note') {
            xml = `<Field Type='Note' DisplayName='${escapedDisplayName}' Name='${escapedInternalName}' Required='${required}' NumLines='6' RichText='FALSE' />`;
        } else if (type === 'DateTime') {
            let format = field.Choices === 'DateOnly' ? 'DateOnly' : 'DateTime';
            xml = `<Field Type='DateTime' DisplayName='${escapedDisplayName}' Name='${escapedInternalName}' Required='${required}' Format='${format}' />`;
        } else {
            xml = `<Field Type='Text' DisplayName='${escapedDisplayName}' Name='${escapedInternalName}' Required='${required}' MaxLength='255' />`;
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
                addedCount++;
                existingInternals.add(internalName.toLowerCase());
                existingDisplays.add(displayName.toLowerCase());
                if (field.CustomFormatter) {
                    await applyCustomFormatting(internalName, displayName, field.CustomFormatter);
                }
            } else {
                console.error(`Error adding ${displayName}:`, data.error.message.value);
            }
        } catch (e) {
            console.error(`Fetch error adding ${displayName}:`, e);
        }
    }
    console.log(`Finished: Added ${addedCount} columns, Skipped ${skippedCount} columns.`);
})();
