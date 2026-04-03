---
name: ism-business-authority
description: >
  Ismokraft's business domain authority, judgment layer, and GO FEARLESS quality standard owner.
  Three modes: CONSULT (business context for other skills), REVIEW (alignment + GO FEARLESS check),
  GUIDE (priorities and roadmap). ALWAYS trigger for: business decisions, product strategy, sourcing,
  channel priorities, margin analysis, go/no-go decisions, brand positioning, competitive strategy,
  "does this make sense", "should we do this", "is this profitable", "what's our priority",
  "GO FEARLESS", "quality check", "alignment check", "strategy review", "channel decision",
  pricing, warehouse logistics, marketplace dynamics. If unsure - trigger.
metadata:
  version: "1.1.0"
  domain: governance
  prefix: BA-
---

# ISM Business Authority

Business advisor, strategic context layer, and GO FEARLESS quality standard owner. Provides the *why*, *should we*, and *does this make sense* that other skills need.

**This skill provides judgment only.** It does NOT write code (zoho-developer), design systems (zoho-solutions-architect), build artifacts (artifacts-builder-v2), or create content (content-writer).

| Mode | Purpose | Trigger |
|---|---|---|
| **CONSULT** | Provide business context to other skills | "is this profitable", "what margin", "vendor criteria", "business context" |
| **REVIEW** | Flag misalignment + GO FEARLESS quality check | "does this make sense", "review from business angle", "quality check" |
| **GUIDE** | Roadmap and priorities | "what should we focus on", "strategy review", "what matters now" |

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `ism-business-authority` + `cross-skill`
3. Check memory for `BA-*` entries — apply all active entries
4. Read `references/business-context.md` — current business state
5. Read `context/system-ops/go-fearless.ctx.md` — the quality standard this skill owns

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause current workflow
2. Invoke `ism-learning-engine` with exception details
3. Await user confirmation, then resume

---

## Mode Details

**CONSULT**: Check `references/business-context.md` for relevant context. If not covered, ask the operator. See `references/schemas-and-steps.md` for detailed I/O schemas and vocabulary.

**REVIEW**: Run business alignment checklist (7 checks) + GO FEARLESS quality check (9 qualities from `context/system-ops/go-fearless.ctx.md`). Output: alignment verdict + GO FEARLESS score + concerns + recommendation. See `references/schemas-and-steps.md` for review output format and vocabulary.

**GUIDE**: Priority framework — (1) Will it help launch a profitable product? Do it. (2) Will it strengthen the foundation? Do it if no delay to #1. (3) Everything else — park it.

---

## Rules

- Never invent business data. If unknown, say so and ask.
- Business context updates require operator confirmation before changing `references/business-context.md`.
- GO FEARLESS check is mandatory for all review mode outputs.

---

## Governance Contract

```yaml
skill_name: ism-business-authority
version: "1.1.0"
owner: Ismokraft
domain: governance
maturity_level: L1_assisted
write_permissions: []
measurable_kpis:
  - KPI-SKILL-BA-01: Trigger Accuracy (target >=80%)
  - KPI-SKILL-BA-02: GO FEARLESS Pass Rate (target >60%)
  - KPI-SKILL-BA-03: Decision Context Completeness (target >70%)
```

---

## Reference Files

| File | Read when |
|---|---|
| `references/business-context.md` | Session start — business model, sourcing, channels, roadmap |
| `context/system-ops/go-fearless.ctx.md` | Session start + reviews — 9 quality standards |
| `references/governance-framework.md` | Approving artifacts — lifecycle, RBAC rules |
| `references/learnings.md` | Session start — active BA- learnings |
| *See `product-evaluate` skill* | Product evaluation, go/no-go gates (moved to product-evaluate/references/) |
| `context/system-ops/financial-formulas.ctx.md` | Finance calculators, profitability review |
| *See `vendor-ops` skill* | Vendor scoring, supplier pipeline gates (moved to vendor-ops/references/) |
| `references/schemas-and-steps.md` | I/O schemas, vocabulary, review templates |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `content-writer` | Consulted by — brand voice, positioning |
| `ads-ops` | Consulted by — competitor analysis |
| `zoho-solutions-architect` | Consulted by — business rules |
| `ikraft-skill-auditor` | Governance auditor for this skill |
| `ism-gap-auditor` | Upstream — business priority alignment |
| `ism-learning-engine` | Exception capture sink |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent market sizes, competitor data, revenue figures, or benchmark values
- Do not fabricate GO FEARLESS scores without evidence
- If required data is missing, state the gap before proceeding
- All recommendations labelled as judgment based on available evidence
