# SurgiFlow Master live schema validation — 2026-07-21

Read-only source: SharePoint REST field metadata for `SurgiFlow Master` at `/teams/SurgiFlow`, rechecked after display-name cleanup. No list items or patient values were extracted.

## Confirmed remediation before production

- `CSN` now exists with internal name `CSN`, type `Number`, optional, and not indexed. Index it now, backfill from Epic/census, validate `MRN + CSN`, then make it required.
- `Status` is missing `Sent to ICU`. Current choices are `Progressing On Schedule`, `Not Improving`, `Ready for DC`, and `Discharged`.
- `Unit` stores `GT6 CPPCU`, `GT7 CARDIAC PCU`, `GT8 CVPCU`, and `WT8 STPCU`; the domain model normalizes them to `CPPCU`, `Cardiac PCU`, `CVPCU`, and `STPCU`.

## Confirmed implementation details

- Cleaned display names now use plain clinical labels. Existing internal names remain stable.
- `Room` is `Number`; `LOS` is `Text`; `GMLOS` is `Number`.
- `EDD` and `ServiceLine` are indexed. `MRN`, `PatientName`, `RiskLevel`, `Status`, `LOS`, and `GMLOS` are not indexed.
- `AMI_Meds`, `CABG_Meds`, and `HF_Meds` are `MultiChoice`; the shared UI and serializer preserve their deployed choice arrays.
- `FU_Cardio_Date`, `FU_CTS_Date`, and `FU_Pulm_Date` are `Text`; `FU_PCP_Date` and `FIN_NLReview_Date` are `DateTime`.
- Compatibility internals confirmed: `PatientName`, legacy `Name`, and deployed `OtherConsultantMiscSognoff`.
