---
name: ecosystem-ops
description: >
  EO- Manages the Ismokraft AI Business OS ecosystem. Five functions: HEALTH (skill
  inventory, integrity checks, claims audit), DRIVE (data exports to Google Drive),
  CONFLUENCE (publishing, organizing pages), ARTIFACTS (lifecycle management, GO FEARLESS
  gates), SESSION-SYNC (signal harvesting and distribution at session end). ALWAYS
  trigger for: "skill health", "ecosystem check", "export to Drive", "publish to
  Confluence", "artifact status", "promote artifact", "GO FEARLESS check", "session sync",
  "harvest session", "end session", "what did we learn today", "EO-". If the task involves
  ecosystem health, Drive/Confluence publishing, artifact lifecycle, or session
  harvesting — trigger.
version: "2.3.0"
lifecycle: prototype
metadata:
  domain: operations
  prefix: EO-
---

# Ecosystem Ops

Manages the Ismokraft AI Business OS ecosystem. Five functions: skill health,
Drive exports, Confluence publishing, artifact lifecycle, and SESSION-SYNC
(session signal harvesting and distribution).

**This skill does NOT audit skill standards** — that is `ikraft-skill-auditor`.

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent field values, configurations, or specifications not provided as input.
- Do not fabricate step counts, ticket numbers, or system identifiers.
- If a required input is missing, block and state the exact gap.
- All outputs labelled as generated specification, not verified system state.

---

## Session Protocol

1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `cross-skill`
3. Check memory for `EO-*`, `AL-*`, `SYS-*` entries
4. If Confluence task → read `references/space-map.md`
5. If claims audit → read `references/claims-audit.md`
6. If artifact lifecycle → read `references/artifact-lifecycle.md`
7. If SESSION-SYNC → read `references/session-sync-protocol.md`
8. For I/O schemas → read `references/schemas-and-steps.md`

---

## Function Selection

| User needs... | Run function | Prefix |
|---|---|---|
| Skill inventory, integrity checks, claims audit | HEALTH | EO-H- |
| Export data to Google Drive | DRIVE | EO-D- |
| Publish/organize Confluence pages | CONFLUENCE | EO-C- |
| Artifact lifecycle, GO FEARLESS, version bumps | ARTIFACTS | EO-A- |
| Session signal harvest + distribution | SESSION-SYNC | EO-SS- |

---

## Function 1: HEALTH — Skill Ecosystem Health

**Trigger:** "skill health", "ecosystem check", "integrity check", "claims audit"

1. **Inventory:** List all skills, count by domain, flag unregistered or ghost entries.
2. **Integrity (6 checks):** Terminology, Schema/Fields, Business Rules, Integration Contracts, Cascade Impact, Instruction Conflicts.
3. **Claims audit:** Verify skills against live MCP data per `references/claims-audit.md`.
4. **Context modules:** Canonical locations per `references/context-modules.md`. Update canonical first, then propagate.

---

## Function 2: DRIVE — Data Exports

**Trigger:** "export to Drive", "backup this"

1. Require: file ready for export. Block if not.
2. Export to `Ismokraft Artifact Exports/{category}/{name}/v{X.Y.Z}/`.
3. Format: JSON with `_meta` header (artifact, version, exportedAt, exportType, recordCount).
4. Every production artifact must have an export. Monthly full export. Never delete — archive only.

---

## Function 3: CONFLUENCE — Publishing

**Trigger:** "publish to Confluence", "update the wiki", "organize wiki"

Always read: `references/space-map.md`

| Path | When | Flow |
|---|---|---|
| Direct Publish | Short content, approved | Create/update page → confirm URL |
| Review-First | SOPs, specs, reports | Export doc → operator reviews → publish |
| Organize | Page restructuring | Identify → propose location → confirm → move (never delete) |

Space: `iscom` (ID 443809796). Central Directory: page 585826305.

**Rules:** One source of truth — link, don't duplicate. Never delete — archive. Version in page title. Page header required (Author, Version, Status, Last reviewed, Owner). Route Slack notifications through `slack-messaging` skill.

---

## Function 4: ARTIFACTS — Lifecycle Management

**Trigger:** "artifact status", "promote artifact", "GO FEARLESS check", "version bump"

Lifecycle: `Draft → Review → Production → Retired`

Full transition rules, GO FEARLESS check rubric, version bump rules, and current registry in `references/artifact-lifecycle.md`.

**Key rules:**
- GO FEARLESS check required before Review → Production (9-point check, score 9/9 or Conditional 7-8/9).
- Version must match: filename, footer, registry, Confluence page title.
- On promotion: update registry, update Confluence Central Directory, notify via `slack-messaging`.
- On retirement: confirm no active dependencies, archive — never delete.

---

## Function 5: SESSION-SYNC — Signal Harvesting

**Trigger:** "session sync", "harvest session", "end session", "what did we learn today"

Full protocol in `references/session-sync-protocol.md`. Four steps:

1. **HARVEST** — Scan full session. Classify signals per 20-type taxonomy.
2. **TRIAGE** — Present grouped summary to operator. Never write without approval.
3. **DISTRIBUTE** — Execute approved writes in order: memory → skill patches → Confluence → CRM.
4. **CONFIRM** — Report what was written, files delivered, manual actions needed.

**Key rules:**
- Never write without TRIAGE approval — no exceptions.
- Zero signals is a valid result — do not fabricate.
- Route all Slack notifications through `slack-messaging` skill.

---

## Exception Handling

- Confluence API fails → log failure, notify operator, do not skip silently
- Claims audit finds stale data → flag specific fields for verification
- Artifact GO FEARLESS fails → list specific gaps, return to builder
- SESSION-SYNC zero signals → report cleanly, close session
- Rate limits hit during long session → queue remaining writes, flag in output

---

## Pre-Execution Validation

| Check | Required | Response |
|---|---|---|
| operation_type defined | Yes | Clarify: health / Drive / Confluence / artifact / session-sync |
| Confluence parentPageId | For new pages | Check space-map |
| File ready for Drive export | For exports | Confirm path before upload |
| Confirm before overwrite | Always | State changes, await confirmation |

---

## Reference Files

| File | Read When |
|---|---|
| `references/space-map.md` | Confluence tasks — page IDs and folder structure |
| `references/claims-audit.md` | Claims audit — full check list |
| `references/artifact-lifecycle.md` | Artifact tasks — lifecycle, GO FEARLESS, registry |
| `references/session-sync-protocol.md` | SESSION-SYNC — signal taxonomy, 4-step protocol, routing |
| `references/context-modules.md` | HEALTH — canonical knowledge locations |
| `references/schemas-and-steps.md` | All functions — I/O schemas |