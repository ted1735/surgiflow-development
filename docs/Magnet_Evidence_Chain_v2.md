# Magnet Evidence Chain Version 2

## SurgiFlow and Cardiac Readmission Improvement Program

**Purpose.** This document is the controlled evidence plan for potential Magnet-facing work related to SurgiFlow, the cardiac readmission registry, discharge readiness, and charge-nurse handoff improvement. It separates verified facts, source documents, proposed measures, and evidence still to be retrieved.

**Audience.** Nursing Professional Development, Quality, Nursing Informatics, shared-governance leaders, and designated evidence owners.

**Evidence posture.** This is an internal planning and evidence-management document. It is not a Magnet submission, outcome report, security approval, legal opinion, or statement that any outcome has been achieved.

---

## 1. Program Boundary

### 1.1 Clinical and technical role

- **Epic** remains the clinical system of record for assessments, orders, medications, laboratory results, vital signs, and legal documentation.
- **SurgiFlow** is an operational coordination and situational-awareness application. Its reports must identify which content is roster-derived versus manually entered.
- **COIP** is the longitudinal readmission registry and analysis layer. Its patient-story and readmission classifications must be traceable to identified source records and documented logic.
- **Manual operational fields** are permitted only when visually distinct from source-derived data and must not be presented as Epic-derived clinical facts.

### 1.2 Scope in development

- Four cardiac PCU units are the active-census reporting scope.
- ICU records may remain available to admission, discharge, and transfer logic but are not counted in the four-PCU census metric.
- The daily Epic roster is the source of truth for the active PCU census only after a completed, auditable import.
- Historical discharges and Readmission Leader CNS reviews support longitudinal registry analysis; they do not independently establish the current census.

---

## 2. Candidate Evidence Tracks

These tracks are candidates, not assigned Magnet categories. The Magnet team must confirm alignment with its current submission template and evidence requirements.

| Track | Improvement question | Potential contribution | Evidence required before use |
|---|---|---|---|
| **Structural support for frontline innovation** | Did leadership provide a legitimate pathway and resources for a clinician-identified improvement? | Demonstrates governance, leadership support, and interdisciplinary collaboration. | Written authorization or time records, dated governance minutes, deployment communication, independent attestations. |
| **Nursing innovation and workflow improvement** | Does a source-aware charge-nurse workflow reduce fragmented information gathering and improve handoff readiness? | Demonstrates a frontline-designed operational tool embedded in existing enterprise infrastructure. | Baseline and follow-up usability/workload data, adoption data, documented workflow, source map, user feedback. |
| **Readmission prevention and longitudinal learning** | Does the registry identify actionable patterns and support interventions for qualifying readmissions? | Demonstrates data-informed nursing and interdisciplinary improvement work. | Quality-validated method, inclusion/exclusion criteria, frozen dataset, intervention linkage, outcome trend with denominators. |
| **Discharge readiness and barriers** | Can structured barriers expose delay patterns, ownership, and resolution time? | Future quality-improvement track for throughput and discharge reliability. | First-class barrier records, taxonomy, baseline, reliability checks, and agreed definition of avoidable delay. |

---

## 3. Evidence Classification Rules

| Status | Meaning | Allowed use |
|---|---|---|
| **Verified artifact** | Original record is available, dated, attributable, and retrievable. | May support a factual statement within its actual scope. |
| **Verified system behavior** | Function has been tested end to end against the live, authorized environment and documented. | May be described as implemented, with stated source and boundaries. |
| **Qualitative signal** | User feedback, testimonial, or observation without a formal study design. | May be quoted or summarized as experience; not as a quantified outcome. |
| **Planned measure** | A metric, workflow, or feature that has not yet been completed and validated. | May be described only as planned or under development. |
| **Unverified assertion** | A statement without a retrievable supporting artifact. | Do not use in Magnet-facing material until verified or removed. |

**Non-negotiable rule:** do not infer an outcome from the existence of a tool, a demonstration, an informal conversation, or a technical design document.

---

## 4. Evidence Inventory and Current Handling

| Artifact | What it can support | Current classification | Handling instruction |
|---|---|---|---|
| SurgiFlow Functional and COIP Architecture | System purpose, source boundaries, intended workflow, COIP architecture, known validation gates. | Authored technical reference. | Use to explain design; pair outcome claims with independent data. |
| COIP Patient Story Source Definition | Patient-story eligibility, identity logic, clinical-review definition, source provenance. | Authored data-governance reference. | Use to explain registry method; validate implementation against the production schema. |
| Reports and Charge Nurse Handoff Data Sources Guide | Roster source-of-truth rule, manual-versus-live distinction, import audit design. | Authored operational reference. | Use as a workflow/source map; confirm live behavior before claiming deployment results. |
| Bedside Discharge Audit Tree | Proposed readiness, support, cardiac, device, safety, and specialty checks. | Clinical workflow design. | Use as design evidence; do not report barrier outcomes until structured data exist. |
| ANM time-savings communication | An individual user reported a perceived reduction in time and improved workflow. | Qualitative signal. | Preserve original with date; do not calculate organization-wide savings from it. |
| InfoSec Governance and Risk Management communication | A specialist discussed the explained control approach and gave a favorable response. | Consultation record. | Describe only as a consultation with favorable feedback; never as security approval or certification. |
| Copilot Studio licensing communication | An enterprise licensing workflow was completed. | Administrative artifact. | Use only if the related tool is in scope; it does not establish clinical impact or security approval. |
| Protected development-time records | Potential evidence of organizational resources for frontline improvement. | Retrieval required. | Obtain original approvals and timekeeping records before making the claim. |
| Council, committee, Informatics, and deployment records | Potential evidence of governance, interdisciplinary collaboration, and rollout. | Retrieval required. | Obtain dated minutes, emails, or approved records; role-based attestation is supplementary. |
| Quality readmission trend and benchmark data | Potential empirical outcome evidence. | Validation required. | Quality must confirm source, population, dates, denominator, exclusions, and interpretation. |

---

## 5. Safe Claim Language

### 5.1 Appropriate wording now

- “SurgiFlow is designed as an operational coordination layer that uses current roster-derived information and clearly identified manual operational inputs.”
- “COIP is designed to maintain an auditable longitudinal registry with source-aware identity and review logic.”
- “The team has identified structured discharge barriers as a future-state requirement for reliable resolution-time and delay analysis.”
- “A dated InfoSec consultation record documents discussion of the control approach and favorable feedback as described.”
- “Early user feedback suggests potential workflow benefit; formal usability and time data are still required.”

### 5.2 Do not use unless evidence is verified

- “SurgiFlow is security approved,” “certified,” or “passed a formal assessment.”
- “Zero shadow systems,” “zero duplicate documentation,” or “zero net-new cost.”
- “Protected development time was approved” without written approval and timekeeping evidence.
- “SurgiFlow reduced workload,” “saved three hours,” or “eliminated paper brains” without a defined and completed measure.
- “The registry reduced 30-day readmissions” without a Quality-validated comparison and intervention linkage.
- Any claim that a planned feature, roadmap item, or untested source mapping is live.

---

## 6. Readmission and COIP Evidence Requirements

### 6.1 Registry method that must be frozen before outcome analysis

- Qualifying patient and encounter identity rules.
- Index discharge and revisit admission source fields.
- General readmission, 30-day readmission, and followed-core-patient classifications.
- Inclusion and exclusion criteria.
- Clinical-review completion rule: valid patient identity plus valid numeric Revisit MRN and CSN plus core review content in BQ, BR, and BS.
- Patient-story rule: a complete clinical review plus longitudinal history of at least two distinct encounters for the patient.
- Data-quality exceptions, unresolved matches, and treatment of intentionally blank/masked Revisit CSNs.

### 6.2 Outcome evidence package

Before reporting a readmission result, retain:

1. Quality-approved measure specification and owner.
2. Source extract, run date, and locked analysis period.
3. Unit-level numerator, denominator, exclusions, and comparison method.
4. Intervention timeline and intended mechanism.
5. Run chart or control chart with dates and annotation of changes.
6. Interpretation signed or reviewed by the accountable Quality/data owner.

---

## 7. Nursing Innovation Evaluation Plan

| Measure | Definition | Collection method | Decision use |
|---|---|---|---|
| Adoption | Eligible shifts or users who use the intended SurgiFlow workflow. | Auditable application or workflow record. | Determines whether outcome interpretation is plausible. |
| Handoff readiness | Completeness of the designated operational handoff elements. | Defined audit sample before and after implementation. | Tests whether the workflow improves reliable preparation. |
| Information-gathering burden | Time and navigation required to assemble the operational view. | Consistent time-motion observation. | Tests workflow efficiency without relying on anecdote. |
| Perceived workload | Validated short workload instrument, with defined collection conditions. | Baseline and follow-up survey. | Tests cognitive burden. |
| Usability | Standard usability instrument or locally approved equivalent. | Anonymous user survey with response rate reported. | Identifies whether the workflow is usable enough to sustain. |
| Manual workaround prevalence | Presence and purpose of paper or unmanaged local workarounds. | Dated observational audit with agreed definition. | Tests whether the workflow consolidates rather than fragments work. |
| Data reliability | Agreement between displayed values and their authoritative source. | Scheduled source-to-display audit. | Prevents safety or credibility claims based on stale/misaligned data. |

No threshold should be presented as an accepted success criterion until the responsible nursing, Quality, and Magnet stakeholders approve the measure plan.

---

## 8. Governance and Privacy Evidence

### 8.1 Evidence to retrieve

- Dated shared-governance and committee minutes showing problem identification, review, decisions, and implementation follow-up.
- Nursing Informatics correspondence describing the reviewed scope and any agreed next steps.
- Enterprise deployment or application-catalog records.
- Original leadership authorization and timekeeping records if protected build time will be cited.
- A formal security/privacy review pathway or documented guidance, if available.
- Role-based attestations that state only personally observed facts.

### 8.2 Privacy and evidence handling

- Do not include patient identifiers, screenshots containing PHI, raw roster exports, or live operational records in a Magnet packet.
- Use de-identified aggregates, approved screenshots, and redacted workflow examples.
- Keep original evidence in the appropriate governed system; the evidence packet should contain approved copies or references.
- Treat informal chat records as limited-scope documentation, not as formal approvals.

---

## 9. Literature Foundation

### Retain as core background sources

1. **Mershon et al.** Collaborative electronic handoff design. Supports the rationale for a concise, workflow-embedded, customizable digital cognitive aid.
2. **Information and Data Visualization Needs among Direct Care Nurses in the Intensive Care Unit.** Use the peer-reviewed PMC version, not the ResearchGate mirror.

### Supplemental background only

- Dissertations and local academic projects on electronic or bedside handoffs may inform design and measurement but should not carry the principal evidence argument.

### Exclude from the core Magnet bibliography

- Vendor marketing material, including the Epic Stork article, because it is not relevant evidence for a cardiac PCU operational workflow.
- Duplicate copies of the same article.
- Sources without clear authorship, methods, relevance, or durable access.

---

## 10. Immediate Evidence Priorities

1. **Confirm the Magnet evidence template and category fit** with Nursing Professional Development before writing a submission narrative.
2. **Retrieve original organizational records** for governance, deployment, and any protected development-time claim.
3. **Freeze and validate the COIP/readmission method** with Quality before calculating or communicating outcomes.
4. **Establish baseline measures** for handoff readiness, source-to-display reliability, workload, usability, and workaround prevalence.
5. **Complete a formal privacy/security pathway** or obtain written guidance on the appropriate pathway.
6. **Build structured barriers and discharge-readiness records** before asserting delay, resolution-time, or avoidable-day results.
7. **Create a claim-to-artifact register** with owner, location, date, verification status, and approved wording.

---

## 11. Excluded Material

The following should remain outside shared Magnet evidence materials:

- Personal employment strategy, stakeholder politics, interpersonal analysis, or speculation about organizational changes.
- Names or narratives not needed to establish the factual evidence chain.
- Unverified technical, financial, compliance, adoption, or clinical-outcome claims.
- Roadmap features described as current production capability.
- Any patient-identifiable source material.

---

## 12. Source Documents Used to Build This Plan

- `docs/SurgiFlow_Feature_and_COIP_Functional_Architecture.docx`
- `docs/COIP_PATIENT_STORY_SOURCE_DEFINITION.md`
- `docs/REPORTS_HANDOFF_DATA_SOURCES_GUIDE.md`
- `docs/reference/bedside-discharge-audit-tree.md`
- `Magnet/Magnet_Evidence_Chain.md` (reviewed as source material; not submission-ready)
- `Magnet/Magnet_Evidence_Addendum_B_InfoSec.md`
- `Magnet/ANM-timesavings-3hrsforReadmissionWork.pdf`
- `Magnet/InfoSec Governance & Risk Management Review Record.pdf`
- `Magnet/CareCoach-copilotStudioLicenseApproval.pdf`

**Version:** 2.0  
**Created:** 2026-09-20  
**Status:** Internal evidence plan requiring owner verification before external use.
