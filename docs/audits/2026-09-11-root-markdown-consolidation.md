# Root Markdown Consolidation Audit — 2026-09-11

## Scope

Audited the Markdown files at the repository root. The goal was a concise active root while preserving historical and detailed material.

## Result

The root is governed to contain only:

1. `README.md`
2. `VERSIONING_LOG.md`
3. `SURGIFLOW_SHAREPOINT_LIST_SCHEMA.md`

No substantive document was deleted. Detailed active references were relocated under `docs/`; stale or superseded material was relocated under `docs/archive/2026-09-11-root-markdown/`.

## Active references relocated

| Prior root file | Current location | Reason |
|---|---|---|
| `bedside_discharge_audit_tree.md` | `docs/reference/bedside-discharge-audit-tree.md` | Detailed clinical workflow reference. |
| `MASTER_EPIC_REPORT_COLUMN_SPECIFICATION.md` | `docs/reference/master-epic-report-column-specification.md` | Source-report field reference; requires future validation against current Epic report. |
| `SURGIFLOW_HUDDLE_WORKSPACE_DEPLOYMENT.md` | `docs/deployment/huddle-workspace-deployment.md` | Deployment reference. |
| `SurgiFlow_IndexedDB_SPFx_Implementation.md` | `docs/architecture/indexeddb-spfx-implementation.md` | Architecture reference; historical design, not an assertion of live behavior. |

## Historical documents archived

The archive retains prior versions, plans, runbooks, field analyses, branding notes, and the original work-laptop handoff. They may contain useful context but are not current operating instruction.

## Source and live-schema findings

- The active SPFx services directly name `SurgiFlow Master` and `SurgiFlow COIP Reviews`.
- COIP runtime aliases and the provisioning-script field names differ for encounter identity and room fields. The signed-in, read-only comparison verified that the active list uses the runtime aliases (`Revisit_x0020_CSN`, `Index_x0020_CSN`, and `Room_x0020_Number`), not the provisioning-script proposal.
- The active SPFx field contract was verified against both `SurgiFlow Master` and `SurgiFlow COIP Reviews` on 2026-09-11. No SharePoint fields, records, indexes, or settings were changed.
- Session-start and session-finish metadata checks found 275 non-hidden Master fields and 63 non-hidden COIP fields. Every runtime-contract field was present at both checks.
- The live COIP list has duplicate narrative display fields with distinct internal names. This remains an explicit data-governance follow-up; no consolidation is authorized.

## Follow-up

At the session finish and every subsequent development session, compare the active lists’ field titles, internal names, types, required state, choices, and indexes to the canonical schema. Record verified changes here or in a subsequent dated audit.
