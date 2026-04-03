---
name: ikraft-skill-auditor
description: >
  Standards compliance auditor for Ismokraft skills. Two modes: AUDIT (20 standards S1-S20, 46+ violation codes V-001-V-058, L0-L3 maturity lifecycle, governance contracts, execution logs, data authority) and REGISTRY (resolution registry lookups and capture).
  TRIGGER when: audit skill, skill health, governance report, skill standards, violations, maturity, promote skill, compliance check, governance contract, execution log, write permission, data authority, L0-L3, skill quality score. If unsure - trigger.
metadata:
  version: "1.0.0"
  domain: governance
  prefix: IG-
  split_from: ikraft-skill-governance v5.1.0
  split_date: "2026-04-03"
  split_reason: "DL-010 — 408KB single skill exceeded 70KB plugin limit. AUDIT+REGISTRY modes split from ARCHITECTURE+SYNTHESIZE."
---

# Ikraft Skill Auditor

Standards compliance auditor for the Ismokraft skill ecosystem. Reads, audits, and reports only — never modifies other skills.

| Mode | Purpose | Trigger |
|---|---|---|
| **AUDIT** | Standards compliance (S1-S20), violation detection, L0-L3 maturity, dependency maps, data authority, governance contracts | "audit skill X", "governance report", violation codes, contracts |
| **REGISTRY** | Resolution registry lookups and new resolution capture | "check registry", "what was fixed", "RR-", "show resolutions" |

---

## Session Protocol

### At Session START
1. Read this SKILL.md fully
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `cross-skill` — apply active records
3. Check memory for `IG-*` entries — apply all active entries
4. Read `references/learnings.md` — apply all active entries
5. Read `context/system-ops/skill-registry.ctx.md` — load current registry state
6. Read `context/system-ops/dependency-graph.ctx.md` — load current dependency state

### AUDIT mode — load on demand
- Standards evaluation: `references/skill-standards.md`
- Governance checks: `references/governance-checks.md`
- Compliance specs (contracts, PEV, exec-log, error model): `references/compliance-specs.md`
- Audit report formatting: `references/audit-templates.md`
- UI artifact data source audit: `references/governance-data-source-standards.md`
- Data authority (system-of-record): `references/data-authority-rules.md`
- Workflow contract validation: `context/system-ops/workflow-contracts.ctx.md`
- Change log review: `context/system-ops/skill-change-log.ctx.md`
- Maturity model: `references/skill-maturity-model.md`
- Metadata schema: `references/skill-metadata-schema.md`
- I/O schemas + steps: `references/schemas-and-steps.md`

### REGISTRY mode
- Resolution records: `context/system-ops/resolutions.ctx.md`

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause the current workflow
2. Invoke `ism-learning-engine` with exception details
3. Await user confirmation or rejection
4. Resume task after response

### Auto-Learn (ISM-LEARN-PROTOCOL)
After every audit run: "Did a new violation pattern emerge? A dependency anomaly? A contract violation? A data authority conflict?"
If yes -> propose `IG-*` learning. If no -> state "No new learnings."

---

## Governance Rules (Non-Negotiable)

**Standards 1-20** (see `references/skill-standards.md` for full rubric):
1-10: Single responsibility, input/output schemas, context references, reusability, no duplication, domain assignment, related skills, auto-learn, pushy descriptions
11-15: Dependency metadata, maturity level, quality score >=7, deprecated cleanup, fallback declaration
16-20: Governance contract, write permissions, version declared, pre-execution validation, execution log format

**Rule 34** (RR-009): Skill delivery MUST use `.skill` zip packaging via `package_skill.py`. Never present individual files.

---

## REGISTRY Mode

Use when operator asks about resolution registry. All skills read `resolutions.ctx.md` silently at session start — that is NOT REGISTRY mode.

### Triggers
- "check registry", "what was fixed for [issue]", "has this happened before", "add a resolution record", "RR-[number]", "show active resolutions for [domain]"

### Actions
1. **Read**: load `context/system-ops/resolutions.ctx.md`, filter by domain or ID
2. **Add**: format new ResolutionRecord, propose addition (requires operator confirmation)
3. **Update status**: change status active -> superseded on operator instruction

---

## Governance Contract

```yaml
skill_name: ikraft-skill-auditor
version: "1.0.0"
owner: Ismokraft
domain: governance
maturity_level: L2_operational
systems_accessed:
  - skill registry (read — context/system-ops/skill-registry.ctx.md)
  - workflow contracts (read — context/system-ops/workflow-contracts.ctx.md)
  - dependency graph (read — context/system-ops/dependency-graph.ctx.md)
write_permissions: []
write_note: Read-only skill. All outputs are reports and recommendations.
measurable_kpis:
  - KPI-SKILL-ISG-01: Violation Detection Rate (improving trend)
  - KPI-SKILL-ISG-02: Ecosystem Compliance Score (target >7.0)
  - KPI-SKILL-ISG-03: CRITICAL Violation Resolution Rate (target >80%)
```

---

## Related Skills

| Skill | Relationship |
|---|---|
| `ikraft-architecture-governance` | Sibling — architecture compliance + ecosystem intelligence |
| `ism-skill-factory` | Creates skills — auditor checks what factory produces |
| `ecosystem-ops` | Manages ecosystem health — auditor checks skill compliance |
| `ism-scrum-master` | Audit findings feed into sprint backlog |
| `ism-gap-auditor` | Process-level gaps; auditor handles skill-level compliance |
| `ism-learning-engine` | Exception capture sink |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent field values, configurations, or specifications not provided as input
- Do not fabricate ticket numbers or system identifiers
- If a required input is missing, block and state the exact gap
- All outputs are labelled as: generated assessment, not verified system state
