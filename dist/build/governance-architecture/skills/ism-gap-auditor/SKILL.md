---
name: ism-gap-auditor
description: >
  Detects process and workflow gaps across the Ismokraft tech stack using live MCP data.
  Produces structured GapRecord JSON, creates Jira tickets for high-impact gaps, notifies Slack,
  publishes to Confluence. ALWAYS trigger for: "find gaps", "process audit", "what's missing",
  "what's broken", "missing automation", "gap analysis", "workflow audit", "broken handoffs",
  "tech stack gaps", "audit our systems", "what should we automate", "sprint retro gaps",
  "missing alerts", "missing gates", "system review", "process review". If unsure - trigger.
metadata:
  version: "1.2.0"
  domain: governance
  prefix: GA-
---

# ISM Gap Auditor

Detects process and workflow gaps using live MCP data. Produces `GapRecord[]` JSON, creates Jira ISK tickets, notifies `#ismo-gen-alerts`, publishes to Confluence.

**Single responsibility:** Find gaps and route them. Do not design solutions. Solutions go to downstream skills per the Handoff Matrix.

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `ism-gap-auditor` + `cross-skill`
3. Check memory for `GA-*` entries — apply active entries
4. Read `references/expected-state.md` — what correct state looks like per system

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause, invoke `ism-learning-engine` with details
2. Await user confirmation, then resume

---

## Execution Steps

1. **Intake** — Determine audit_scope (full/function/system/sprint_retro) and optional focus_area. If not provided, ask once.
2. **Live State Pull** — Query each system via MCP: Bigin (pipelines, deal counts), Jira (project board, open issues), Confluence (spaces, pages), Slack (channels, recent messages), CRM (custom modules).
3. **Gap Detection** — Compare live state against `references/expected-state.md`. Each deviation = one GapRecord.
4. **Priority Sort** — Score each gap: `priority_score = impact * 3 + urgency * 2 + (10 - effort)`. Sort descending.
5. **Jira Create** — For gaps with priority_score >= 15: create Jira ISK issue with `claude-task` label.
6. **Slack Notify** — Post top-3 gaps to `#ismo-gen-alerts`.
7. **Confluence Publish** — Create/update page in `iscom` space with full gap report.
8. **Output** — Return `GapRecord[]` JSON.

See `references/schemas-and-steps.md` for full I/O schemas, GapRecord JSON shape, and MCP call patterns.

---

## Gap Types (9)

| Type | Routes to |
|---|---|
| missing_pipeline | zoho-solutions-architect |
| missing_automation | zoho-solutions-architect -> zoho-developer |
| missing_tracking | zoho-solutions-architect |
| missing_documentation | ecosystem-ops (Confluence publish) |
| missing_artifact | operator — manual build |
| broken_handoff | zoho-developer |
| stale_process | ecosystem-ops (Confluence publish) |
| missing_alert | zoho-developer |
| missing_gate | product-evaluate |

See `references/gap-types.md` for detection criteria, default impact/effort/urgency, and examples.

---

## Rules

- Never invent gaps. Every gap must be evidenced by MCP data or documented expected-state mismatch.
- Never design solutions. State the gap, route to the correct skill.
- Always create Jira tickets for high-priority gaps (score >= 15).

---

## Governance Contract

```yaml
skill_name: ism-gap-auditor
version: "1.2.0"
owner: Ismokraft
domain: governance
maturity_level: L2_operational
systems_accessed:
  - Bigin (read — pipeline state)
  - Jira (read/write — gap tickets)
  - Confluence (read/write — gap reports)
  - Slack (write — alert notifications)
  - CRM (read — custom modules)
write_permissions: [Jira, Confluence, Slack]
measurable_kpis:
  - KPI-SKILL-IGA-01: Gap Detection Accuracy (target >90%)
  - KPI-SKILL-IGA-02: Jira Ticket Creation Rate (target 100% for score>=15)
  - KPI-SKILL-IGA-03: Gap Resolution Rate (target >60% within 1 sprint)
```

---

## Reference Files

| File | Read when |
|---|---|
| `references/expected-state.md` | Session start — correct state definitions per system |
| `references/gap-types.md` | Gap detection — 9 types with criteria and routing |
| `references/schemas-and-steps.md` | Full I/O schemas, GapRecord JSON, MCP patterns |
| `references/learnings.md` | Session start — active GA- learnings |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `ikraft-skill-auditor` | Skill-level compliance; gap-auditor handles process-level gaps |
| `ikraft-architecture-governance` | Sibling in governance-architecture plugin |
| `ism-business-authority` | Upstream — business priority alignment for gap scoring |
| `ism-learning-engine` | Exception capture sink |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent gaps or fabricate system state
- Every gap must trace to an MCP query result or expected-state mismatch
- If MCP data is unavailable, state the limitation — do not estimate
