# SIL Module Protocols v1.0.0
# Trimmed 2026-04-03. Examples removed; protocol definitions and schemas retained.

---

## M1 -- Execution Observer (Passive)

Fires on every skill invocation. Records `SILExecutionRecord` (4 fields only).

| Verdict | When |
|---|---|
| correct | Best available skill; output matched schema |
| suboptimal | Better-fit skill existed; output still useful |
| wrong | Clearly wrong choice |
| anomaly | Output deviated from schema or unexpected behavior |

**Session aggregate:** `SI-EXEC-[YYYYMMDD]` — skills invoked N, correct X%, suboptimal Y%, anomalies Z. Discard raw records after aggregation.

**Meta vs operational:** Classify each invocation. `operational` = skill performing its function (feeds D1/D2 scoring). `meta` = SKILL.md read during audit/review (excluded from D1/D2). Rule: trigger was "read to audit/review" = meta.

Do not store: full output text, user message content, PII or business data.

---

## M2 -- Decision Evaluator (On-demand or triggered by M1 suboptimal/wrong)

Sequence: extract intent -> map to domain -> enumerate available skills -> identify better match -> score 1-5 -> record rationale (<=50 words) -> if score <=3: invoke M6 with `triggering_fix`.

| Score | Meaning |
|---|---|
| 5 | Perfect match |
| 4 | Good, minor alternatives |
| 3 | Suboptimal, better option available |
| 2 | Poor, wrong domain/skill |
| 1 | Wrong, should not have been invoked |

Output: `{ skill_invoked, skill_best_fit, decision_score, rationale, recommendation }`

---

## M3 -- Learning Synthesiser (On-demand or auto at >=3 LE-* same type/skill)

Sequence: group LE records by skill x exception_type -> count >=3: confirmed pattern -> create SILKnowledgeEntry (proposed) -> count 1-2: watch list -> high-severity >1 sprint old: escalate to M6 -> 2+ LE same target: flag priority -> present to Amit for validation -> validated: add to sil-knowledge-base.md as active.

| Pattern Type | Entry Type |
|---|---|
| Same exception x same skill x >=3 | rule |
| Same target across skills x >=2 | heuristic |
| Same workaround repeated | anti-pattern |

Validation: statement must be falsifiable, applies_to >=1 skill, >=2 source LEs cited.

---

## M4 -- Knowledge Base Manager (On-demand)

Lifecycle: proposed -> validated (Amit confirms) -> active (>=1 session without contradiction) -> superseded (newer entry replaces).

Operations: Add (from M3), Supersede (fix makes rule redundant), Review (requested/quarterly), Apply (scan active entries during SIL analysis).

---

## M5 -- Performance Scorer (On-demand)

| Dim | Code | Score 5 | Score 3 | Score 1 |
|---|---|---|---|---|
| Trigger Accuracy | D1 | >=90% correct | 60-74% | <45% or no data |
| Output Compliance | D2 | 0 anomalies | 6-15% rate | >30% or no schema |
| Exception Rate | D3 | 0 LE records | 3-5 LE, none high | >2 high unresolved |
| Downstream Adoption | D4 | Upstream of >=2 prod | In contracts only | Orphan (V-014) |
| Evolution Velocity | D5 | >=2 versions, LEs resolved | Initial, some resolved | Initial, high LEs unresolved |

Composite = average(D1-D5). Healthy >=4.0, Watch 3.0-3.9, At Risk <3.0.
<3 execution records: score D1/D2 as 3 with "insufficient data" note.

---

## M6 -- Governance Recommender (On-demand or triggered by M2/M3/M5)

Sequence: identify root cause -> assign rec_type -> assign priority (P1 blocks operation / P2 degrades quality / P3 improvement) -> write rationale (<=300 chars) -> write suggested_action (<=300 chars) -> assign route_to -> present to Amit.

| rec_type | route_to |
|---|---|
| triggering_fix | skill-creator (description update) |
| schema_update | skill-creator (schema fix) |
| rule_addition | skill-creator (add to references/) |
| maturity_promotion | ikraft-skill-auditor (registry update) |
| skill_split | skill-creator (new skill) |
| skill_deprecation | ikraft-skill-auditor + operator — manual action |
| dependency_gap | ikraft-skill-auditor (dep graph) |
| governance_contract_gap | ikraft-skill-auditor (V-037 to V-046) |

SIL NEVER routes automatically. All routes require Amit's explicit confirmation.
