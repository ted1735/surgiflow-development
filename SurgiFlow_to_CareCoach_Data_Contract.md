# SurgiFlow → CareCoach Data Contract

**Status:** Source-of-truth draft · **Owner:** Ted Moyer
**Validated schema date:** 2026-07-28 · **Doc version:** 1.0

---

## 1. Purpose

This document defines the **single data contract** that governs how patient
clinical context flows from SurgiFlow into the CareCoach agent — regardless of
which front end captures the data.

**Core principle:** The front end is interchangeable. The **canonical field bag
is the contract.** CareCoach depends on the contract, not the entry point.

```text
SharePoint Form ─┐
v2 React App ────┼─▶ buildSurgiFlowFieldBag ─▶ Canonical Row ─▶ SharePoint (SoR) ─▶ CareCoach / Foundry
Future Foundry ──┘
```

---

## 2. System Generations (both live today)

### v1 — Production
```text
Custom SharePoint Form → SharePoint List (SurgiFlow Master) → CareCoach
```
- 250 visible fields · 228 writable
- Governed, backed up, already approved
- **System of Record (SoR) today**

### v2 — Dev server (functional)
```text
Custom React/Node App → Local SQLite (WAL) → same field projection → CareCoach
```
- Field-level versioning, conflict detection, archive / reactivate
- Emits the **same canonical field bag** as v1
- **Not yet governed for PHI** (see §7)

**Key fact:** Both generations pass through the same translation layer
(`buildSurgiFlowFieldBag`) and validate against the same live schema. CareCoach
receives identical, normalized context from either path.

---

## 3. The Contract Layer (non-negotiable)

`buildSurgiFlowFieldBag(draft, fallback)` is the **only** approved path to
produce a CareCoach-ready row.

**Rules it enforces:**
- Every output field must exist in the **live SharePoint schema** (`fieldsByInternalName`)
- `Choice` values must match the live choice list exactly
- `MultiChoice` values are filtered to valid choices only
- `Number` fields must parse to a finite number
- Empty / `N/A` values are dropped, not written
- Any invalid value becomes a tracked **`schemaIssue`** — never silent bad data

> Governance statement: No front end may write to CareCoach context by bypassing
> this function. New fields enter the contract **only** by being added to the live
> schema first.

---

## 4. Canonical Field Map (feeds CareCoach context)

### 4.1 Operational context
| Canonical field | Internal name | Notes |
|---|---|---|
| Unit | `Unit` | Derived from room when room changes |
| Room | `Room` | Normalized via `normalizeRoom` |
| Patient name | `PatientName` | |
| MRN | `MRN` | |
| Service line | `ServiceLine` | Icon/label mapped |
| EDD | `EDD` | Overdue flag if < today |
| GMLOS | `GMLOS` | Styled vs LOS |
| Attending | `AttendingMD` | |
| Disposition | `Dispo` | Normalized (see §5) |

### 4.2 Clinical context
| Canonical field | Internal name | Notes |
|---|---|---|
| Core measures | `CoreMeasures` | HF, COPD, AMI, CABG, PNA, THK |
| Other diagnostics | `OtherDiagnostics` | Diabetes, Sepsis |
| Clinical needs | `ClinicalNeeds` | Reason to continue admission |
| Rhythm | `Rhythm` | AFib pathway trigger |
| AFib set | `AFib_Has`, `AFib_Type`, `AFib_KnownVerified`, `AFib_KnownRestarted`, `AFib_KnownAVS`, `AFib_NewTeach`, `AFib_NewScript`, `AFib_BleedingRisk` | |
| Devices | `DEV_Has`, `DEV_List`, `DEV_Presence`, `DEV_AtDischarge`, `DEV_Teachback`, `DEV_Followup` | |
| Drips | `Drip` | Active IV drip list |
| Chest tube / drains | `ChestTube`, `TubesDrainsOutput24hMl`, `TubesDrainsNotes` | |
| IV meds | `IVMeds`, `IVLasixFrequency`, `IVLasixTransition`, `IVSteroidsFrequency`, `IVSteroidsTransition` | |

### 4.3 Pathway compliance
- **HF, COPD, AMI, CABG, Pneumonia, THK** pathway fields captured per diagnosis
- Bound only when the matching core diagnosis is selected

### 4.4 Transition / discharge context
| Concept | Source fields |
|---|---|
| PCP follow-up | readiness checks |
| Specialist follow-up | readiness checks |
| DME | readiness checks |
| Transport | `FIN_Transport` |
| Home health | disposition + readiness |
| Education readiness | safety / readiness checks |

### 4.5 Risk & leader context
| Canonical field | Internal name | Notes |
|---|---|---|
| Risk level | `RiskLevel` | Normalized bucket (see §5) |
| Readmission % | `ReadmissionRiskPct` | Drives bucket |
| Leader action items | `LeaderActionItems` | Flag if non-empty / not "none" |
| Non-clinical barriers | `NonClinicalDCBarriers` | Flag if not "none" |
| CM leader review | `CM_x0020_Leader_x0020_Review` | Human expert review |
| Post-huddle notes | `POST_x0020_Huddle...`, `Nursing_x0020_Action...`, `POST_x0020_CM_x0020_Huddle...` | |

### 4.6 Final safety checks
`FIN_Escalations`, `FIN_MedRec`, `FIN_NoDupeMeds`, `FIN_Transport`,
`FIN_ZoneTool`, `FIN_Core4`, `FIN_Understanding`, `FIN_HuddleDone`

---

## 5. Normalization Rules (applied before CareCoach sees data)

**Risk level**
```text
> 22%          → "High >22%"
13% to 22%     → "Medium 13% to 22%"
< 13%          → "Low <12%"
```

**Disposition (Dispo)**
```text
home no        → Home No Needs
hhc+abx+dme    → HHC ABX DME
hhc+abx        → HHC ABX
hhc+dme        → HHC DME
home health/hhc→ HHC
snf            → SNF
ipr            → IPR-AH
```

**Core measures** → mapped to `AMI / CABG / COPD / HF / PNA / THK`

**Boolean → Choice** → `True/False` or `Yes/No` based on field's live choice list

**Room** → `normalizeRoom`; unit auto-derived via `unitNameForRoom`

> Because normalization happens **at the source**, CareCoach receives clean,
> standardized values and does not have to guess or interpret raw entries.

---

## 6. System-of-Record Decision

### Recommended (near-term): **SharePoint stays SoR**
```text
Form or v2 App → buildSurgiFlowFieldBag → SharePoint List (SoR) → CareCoach / Foundry
```
- Governed, approved, backed up, already feeding CareCoach
- v2 writes through the same field bag → SharePoint stays canonical
- Lowest risk; preserves existing governance

### Deferred option: v2 SQLite as operational store
- Faster and richer (versioning, conflict detection, archive/reactivate)
- **Triggers full PHI / hosting / identity review** before it can hold real data
- Revisit only after §7 controls are in place

**Decision:** Keep **SharePoint as System of Record**. Treat every front end as an
interchangeable entry point into the same contract.

---

## 7. Open Gap — v2 Authentication & Authorization

The v2 dev server currently:
- Accepts writes without an identity layer
- Identifies actors loosely (client-supplied)

**Required before v2 touches real PHI or becomes SoR:**
- Microsoft Entra ID authentication
- Application role enforcement
- **Server-derived** user identity (never client-supplied)
- Guarded-connector pattern (mirror the High Risk Rounding connector boundary:
  disabled unless configured **and** explicitly enabled **and** production-approved)

> The v1 SharePoint path already inherits this governance — a strong reason to keep
> SharePoint as SoR while v2 matures.

---

## 8. Change Control

- **New field:** add to live SharePoint schema → then map in `buildSurgiFlowFieldBag`
- **New choice:** add to live choice list first; unmatched choices log as `schemaIssue`
- **No front end** may write CareCoach context outside the field bag
- Re-validate schema date whenever the SharePoint list changes

---

## 9. One-Line Summary

> **The canonical field bag — not the form, not the app, not the database — is the
> contract. Keep SharePoint as the system of record, run every front end through
> `buildSurgiFlowFieldBag`, and CareCoach (and later Foundry) always receives clean,
> governed, identical clinical context.**
