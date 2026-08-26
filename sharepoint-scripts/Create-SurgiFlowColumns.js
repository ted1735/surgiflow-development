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
    "DisplayName": "Time Crit",
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
    "DisplayName": "Arrival Time",
    "InternalName": "ArrivalTime",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
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
    "DisplayName": "Non-Clinical DC Barriers",
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
    "DisplayName": "VAD Cart #",
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
    "DisplayName": "Transferred From",
    "InternalName": "TransferredFrom",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  },
  {
    "DisplayName": "Time Seen By Leader",
    "InternalName": "TimeSeenByLeader",
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
    "Notes": ""
  },
  {
    "DisplayName": "PH Medication?",
    "InternalName": "PHMedication",
    "FieldType": "Text",
    "Choices": "",
    "Required": "FALSE",
    "Default": "",
    "Notes": ""
  }
];

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
