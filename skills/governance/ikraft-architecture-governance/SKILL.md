---
name: ikraft-architecture-governance
description: >
  Architecture compliance and ecosystem intelligence for Ismokraft. Two modes: ARCHITECTURE (7-Law enforcement — Context->Skills->Artifacts layer separation, artifact logic leak detection, context centralization, skill creation guardrail LAW-7) and SYNTHESIZE (pattern synthesis from LE-* records, per-skill performance scoring, evolution recommendations, prompt quality analysis).
  TRIGGER when: architecture audit, layer check, artifact has business logic, context duplicated, new skill needed, skill explosion, context registry, 7 laws, LAW-, synthesize learnings, skill analytics, SIL report, SI-, prompt quality, how is skill doing. If unsure - trigger.
metadata:
  version: "1.0.0"
  domain: governance
  prefix: AG-
  split_from: ikraft-skill-governance v5.1.0
  split_date: "2026-04-03"
  split_reason: "DL-010 — ARCHITECTURE+SYNTHESIZE modes split from AUDIT+REGISTRY. Ecosystem health analysis."
---

# Ikraft Architecture Governance

Architecture compliance and ecosystem intelligence skill. Validates layer separation and synthesizes learning patterns. Reads, validates, and reports only — never modifies skills, artifacts, or context files.

| Mode | Purpose | Trigger |
|---|---|---|
| **ARCHITECTURE** | 7-Law enforcement: Context->Skills->Artifacts layer separation, artifact logic leaks, context centralization, skill creation guardrail | "architecture audit", "does artifact X contain business logic", "is context duplicated", "should we create a new skill", "LAW-", "layer check" |
| **SYNTHESIZE** | Pattern synthesis from LE-* records, per-skill performance scoring, evolution recommendations, prompt quality | "synthesize learnings", "how is X skill doing", "SIL report", "SI-", "prompt quality" |

---

## Session Protocol

### At Session START
1. Read this SKILL.md fully
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `cross-skill` — apply active records
3. Check memory for `AG-*`, `SI-*` entries — apply all active entries
4. Read `context/system-ops/context-registry.ctx.md` — load context object registry

### ARCHITECTURE mode — load on demand
- Architecture laws: `references/architecture-laws.md`
- Artifact audit rules: `references/artifact-audit-rules.md`
- Skill creation guardrail (LAW-7): `references/skill-creation-guardrail.md`
- Governance details (architecture workflow): `references/governance-details.md`

### SYNTHESIZE mode — load on demand
- SIL reference (knowledge base + performance + templates): `references/sil-reference.md`
- Module protocol detail: `references/sil-module-protocols.md`
- Prompt quality scoring: `references/prompt-quality.md`

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause the current workflow
2. Invoke `ism-learning-engine` with exception details
3. Await user confirmation or rejection
4. Resume task after response

### Auto-Learn (ISM-LEARN-PROTOCOL)
After analysis: "Did a new architecture violation pattern emerge? A new layer-crossing? A context duplication? A prompt quality insight?"
If yes -> propose `AG-*` or `SI-*` learning. If no -> state "No new learnings."

---

## Architecture Rules (Non-Negotiable)

**7-Law Architecture rules (see `references/architecture-laws.md` for full detail):**
21. Skills contain only reasoning, formulas, workflows, orchestration — no UI code (LAW-1)
22. Artifacts contain only execution logic — no business rules, no strategic decisions (LAW-2)
23. All knowledge lives in centralized context modules — never embedded inline (LAW-3)
24. Every artifact workflow initiated by a skill — artifacts never operate autonomously (LAW-4)
25. Artifacts never contain pricing formulas, margin logic, ranking rules (LAW-5)
26. Context objects must be registered in `context/system-ops/context-registry.ctx.md` before use (LAW-6)
27. Before new skill creation, LAW-7 guardrail: audit for overlap, check extension, confirm no merge candidate (LAW-7)

**Insight and delivery rules:**
28. Skills producing scored output must declare AI_INSIGHTS_SPEC block
29. Skills warranting Slack notifications must declare SLACK_PAYLOAD_SPEC block
30. No skill may call Slack MCP silently — Slack dispatch is artifact-layer responsibility
31-33. Production artifacts must include SlackDispatcher, AIInsightPanel, decision-support elements
34. Skill delivery MUST use `.skill` zip packaging

---

## ARCHITECTURE Mode — 3-Layer Model

```
LAYER 1 — CONTEXT (Knowledge)
  Store business knowledge. Read-only. No executable code.

LAYER 2 — SKILLS (Logic)
  Reasoning, formulas, orchestration. References context. Directs artifacts.

LAYER 3 — ARTIFACTS (Execution)
  Dashboards, calculators, reports. Executes skill instructions. No business rules.
```

Architecture mode validates compliance across all 3 layers. Produces `ArchitectureComplianceReport`.

---

## SYNTHESIZE Mode

Absorbed from ikraft-skill-intelligence v1.1.1. Analyzes LE-* learning records, performance patterns, and prompt quality across the ecosystem.

**Capabilities:**
1. **Pattern Synthesis** — Extract recurring patterns from LE-* records across all skills
2. **Performance Scoring** — Per-skill performance metrics from learning data
3. **Evolution Recommendations** — Suggest skill improvements based on accumulated patterns
4. **Prompt Quality** — Score and improve skill descriptions for triggering accuracy

---

## Governance Contract

```yaml
skill_name: ikraft-architecture-governance
version: "1.0.0"
owner: Ismokraft
domain: governance
maturity_level: L2_operational
systems_accessed:
  - context registry (read — context/system-ops/context-registry.ctx.md)
  - skill registry (read — context/system-ops/skill-registry.ctx.md)
write_permissions: []
write_note: Read-only skill. All outputs are reports and recommendations.
measurable_kpis:
  - KPI-SKILL-AG-01: Architecture Violation Detection Rate
  - KPI-SKILL-AG-02: Layer Compliance Score (target >90%)
  - KPI-SKILL-AG-03: Synthesis Actionability Rate (% of recommendations acted on)
```

---

## Related Skills

| Skill | Relationship |
|---|---|
| `ikraft-skill-auditor` | Sibling — standards compliance + resolution registry |
| `ism-gap-auditor` | Process gaps; architecture-governance handles structural compliance |
| `artifacts-builder-v2` | Artifacts are architecture audit subjects |
| `ecosystem-ops` | Ecosystem health — architecture validates structure |
| `ism-learning-engine` | Exception capture sink; LE-* records are SYNTHESIZE input |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent architecture violations or compliance scores
- Do not fabricate learning patterns or performance metrics
- If input data is missing, block and state the exact gap
- All outputs are labelled as: generated assessment, not verified system state
