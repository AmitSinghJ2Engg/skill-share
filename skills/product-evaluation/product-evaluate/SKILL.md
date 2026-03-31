---
name: product-evaluate
description: >
  Evaluates, gate-checks, and ideates wooden premium product opportunities. Three modes: DEEP-EVAL (16-criteria weighted evaluation + ResearchRecord → scored verdict with cited evidence), GATE-CHECK (evaluates a product against any of 8 launch gates → go/no-go with blockers and fix actions), IDEATE (structured product concepts with evidence-backed differentiation hooks and wood specs). Batch scoring of ProductCandidate[] is handled by product-screen — not this skill. ALWAYS trigger for: evaluate this, gate check, can we launch this, is this product ready, what's blocking launch, go no-go, generate concepts, ideate, product concepts, what should we build, differentiation ideas, PE-, gate 1, gate 2, gate 3, launch readiness, deep eval, evaluate single product. Do NOT trigger for batch scoring of ProductCandidate lists — route to product-screen. If unsure — trigger.
metadata:
  domain: product
  prefix: PE-
  version: 2.1.0
---

# Product Evaluate

Single skill for product evaluation, gate-checking, and concept generation.

Three modes — invoke independently or chain:

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **DEEP-EVAL** | product_name + ResearchRecord | EvalRecord with verdict + evidence | GATE-CHECK |
| **GATE-CHECK** | product data + gate_number (or "all") | GateResult[] go/no-go per gate | product-screen BRIEF |
| **IDEATE** | zone or product + optional research | ConceptBatch structured concepts | product-discover SINGLE or vendor-ops |

**Capability boundary:** This skill evaluates single products and generates concepts. It does not score batches (product-screen SCORE mode), gather market data (product-discover), calculate margins (margin-calculator), or write listings (content-writer).

## Shared Knowledge (always in context)

The opportunity map, financial formulas, gate definitions, and data integrity rules are available in project knowledge. Do not read separate files for these — they are already in context.

## Skill-Specific Reference Files

For detailed rules loaded only when needed:

- **Evaluation model**: See [reference/product-eval-model.md](reference/product-eval-model.md) — 16-criteria weighted model for DEEP-EVAL (multi-marketplace data sources)
- **Ideation framework**: See [reference/ideation-framework.md](reference/ideation-framework.md) — concept structure, hard rules, manufacturing clusters for IDEATE

---

## DATA INTEGRITY CONTRACT

The 7 data integrity rules are defined in project knowledge under data-integrity-rules.md. In addition, product-evaluate enforces these skill-specific rules:

1. **Every score cites its source field.** "Demand score = 4/5 because BSR = 3,200 (source: amazon.in, 2026-03-14)" or "Demand score = 3/5 because Etsy sales = 450 (source: etsy.com, 2026-03-14)". No score without a cited reason.
2. **Confidence is mandatory on every output.** HIGH = all inputs present. MEDIUM = some null. LOW = majority null. Never omit or inflate.
3. **Null inputs produce conservative handling, not zero or estimated.** Exclude from total, document in gaps[].
4. **Gate verdicts cite the specific criterion that failed.** "Gate 2 FAIL: Net margin = 11.2% — below 15% threshold." No vague failures.
5. **Ideation hooks cite every differentiation claim.** Every hook references a real signal. Generic claims are not valid.
6. **Formulas are not invented in this skill.** Gate 2 thresholds use financial formulas from project knowledge. Scoring uses the eval model reference file.
7. **Opportunity_Score is the authoritative Gate 1 value.** Returned to caller for CRM persistence via zoho-data-ops. niche_score from product-discover is research-phase only — never used as a gate criterion.

---

## MODE: DEEP-EVAL

**Purpose:** Deep 16-criteria weighted evaluation of a single product using structured research data from multiple marketplaces. Returns EvalRecord with Opportunity_Score.

**When to invoke:** "evaluate this product", "deep evaluate", "16-criteria score", "product verdict", "should we pursue this".

Read [reference/product-eval-model.md](reference/product-eval-model.md) for full criteria tables and rubric.

### Steps

1. Confirm inputs: product_name, category, and at least one of: ResearchRecord from product-discover SINGLE, or user-provided research data.
2. Score each of the 16 criteria (raw 1–5) using the rubric in product-eval-model.md. Use best available marketplace data for each criterion.
3. For each score, cite the specific data point, its value, source platform, and date.
4. Compute Weighted_Score per criterion = (Raw_Score / 5) x Weight.
5. Compute Adjusted_Total = raw_total x (100 / max_possible_from_scored_criteria).
6. Apply verdict thresholds: STRONG (75–100), MODERATE (55–74), WEAK (35–54), REJECT (0–34).
7. Identify top 3 strengths and top 3 risks — every point must cite source data.
8. Return EvalRecord with Opportunity_Score and Gate_1_Decision. CRM writes and Slack notifications handled by zoho-data-ops and task orchestrator.

### 4 Dimensions Overview

| Dimension | Weight | Criteria count |
|---|---|---|
| Market Demand | 30% | 4 criteria (Search Volume, Demand Signal, Trend Direction, Category Size) |
| Competition Beatability | 25% | 4 criteria (Review Moat, Brand Concentration, New Entrant Success, Listing Quality Gap) |
| Margin Potential | 25% | 4 criteria (Price Cluster Fit, COGS Headroom, Fee Structure, Risk [negative weight]) |
| Differentiation Room | 20% | 4 criteria (Unmet Needs, Personalization Fit, Wood Advantage, Legal & Safety [weight 0]) |

**Special criteria:** Risk (criterion 12) has weight -10. A raw score of 5 means maximum risk penalty. Legal & Safety (criterion 16) has weight 0 — tracked but does not affect score.

### Output: EvalRecord

Contains: eval_id (PE-E-{YYYYMMDD}-{NNN}), product_name, Opportunity_Score (0–100), verdict, dimension_scores, criterion_details (16 entries with raw_score, weighted_score, evidence, source_platform, source_url), strengths[], risks[], data_gaps[], confidence, marketplaces_evaluated[], crm_record_id.

---

## MODE: GATE-CHECK

**Purpose:** Evaluate a product against one gate or all 8 gates. Returns structured go/no-go with blockers and fix actions. Updates CRM and notifies Slack.

**When to invoke:** "gate check", "can we launch", "is this ready for [stage]", "what's blocking", gate numbers 1–8.

Gate definitions: read formal gate criteria from project context (`gate-criteria.json`). Stage exit checklists are defined in `02-business-domain-map.md` domain sections.

### Steps

1. Identify which gate(s) to evaluate. If "all", run all 8 in sequence.
2. For each gate: check all hard requirements (PASS or FAIL with specific missing field cited), compute scored requirements sum, apply threshold.
3. Assign verdict: PASS / MARGINAL / FAIL / INCOMPLETE.
4. If FAIL: state the specific criterion, actual value, threshold, and minimum fix required.
5. If INCOMPLETE: state exactly what data is missing.
6. Return GateResult[] with gate decisions and notes. CRM writes and Slack notifications handled by zoho-data-ops and task orchestrator.

### Fix Action Format

Every FAIL must include a specific, actionable fix:

```
Gate 2 FAIL
Failed criterion: Net margin % = 11.2% (threshold: >= 15%)
Fix required: Raise SP from 1,080 to 1,300 INR (adds 3.8% margin)
  OR reduce COGS from 600 to 520 INR (adds 4.2% margin)
  OR both: SP 1,200 + COGS 560 = 15.1% margin (PASS)
Formula reference: financial-formulas.md, Core Chain
```

### Gate Map — CRM + Bigin Pipeline Alignment

All gate data returned to caller. CRM writes handled by zoho-data-ops (auto-syncs to Bigin, triggering stage transitions).

| Gate | Name | CRM Fields Written | Bigin Transition (auto-sync) |
|---|---|---|---|
| 1 | Product Attractiveness | Opportunity_Score, Gate_1_Decision, Gate_1_Notes | New Request → Validated |
| 2 | Financial Viability | Financial_Viability, Gate_2_Notes | Validated → Research & Profitability |
| 3 | Sourcing Feasibility | Gate_3_Approval, Gate_3_Notes | Research & Profitability → Test Sourcing |
| 4 | Vendor Quality | Vendor_Score, Vendor_Grade | Test Sourcing → Test Listing |
| 5 | Listing Readiness | Gate_5_Notes | Test Listing → Paid Testing |
| 6 | Test Campaign Results | Scale_Verdict | Paid Testing → Scale Decision Data |
| 7 | Scale Decision | Sourcing_Model_Selected | Scale Decision Data → Sourcing Model Selection |
| 8 | Final Launch Readiness | Gate_8_Notes | Sourcing Model Selection → Final Listing |

### Output: GateResult[]

Per gate: gate_number, gate_name, verdict, hard_reqs[] (pass/fail each), scored_sum, threshold, blockers[], fix_actions[], incomplete_fields[], crm_fields_written[], bigin_transition.

---

## MODE: IDEATE

**Purpose:** Generate structured, evidence-backed product concepts for a given zone or based on a researched product. All concepts are specific to wooden products manufacturable in India.

**When to invoke:** "generate concepts", "ideate", "what should we build in [zone]", "product ideas", "differentiation ideas".

Read [reference/ideation-framework.md](reference/ideation-framework.md) for concept structure, hard rules, and manufacturing cluster constraints.

### Steps

1. Determine input path: zone only (5 concepts), zone + product type (3 variants), or evaluated product (3 improvement concepts).
2. For each concept, apply all 7 hard rules from ideation-framework.md.
3. Score each concept's viability (HIGH / MEDIUM / LOW) based on zone signals.
4. Return ConceptBatch.

### Hard Rules Summary

Price floor: at least 1,000 INR. Weight ceiling: at most 2.0 kg. Wood dominance: at least 70% wood by volume. India manufacture: Jodhpur / Moradabad / Vrindavan. Differentiation hooks cited. No generic claims. Gaps declared.

### Output: ConceptBatch

Contains: run_id (PE-I-{YYYYMMDD}-{NNN}), zone, concept_count, concepts[] (each with concept_id, working_title, core_form, wood_spec, price_band, differentiation_hooks, personalization_fit, marketplace_fit, manufacturing_difficulty, confidence, signal_sources, gaps_declared, next_step), zone_signal_summary, recommended_concept_id.

---

## BATCH-SCORE — Not This Skill

Batch scoring of ProductCandidate[] is owned by product-screen SCORE mode. Route all batch scoring requests there.

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| DEEP-EVAL | product_name + ResearchRecord (at minimum demand signal, price, competition data from at least one marketplace) | Block — cannot score without market data |
| GATE-CHECK | product data + gate_number (1–8 or "all") | Block — gate number required |
| IDEATE | zone or product category | Warn if no research available — note LOW confidence |

If blocked: state exact missing input. Do not proceed. Do not substitute with assumptions.

## Halt Conditions

| Condition | Mode | Action |
|---|---|---|
| No product name | DEEP-EVAL | Ask for product name + category. |
| No research data at all | DEEP-EVAL | Warn: confidence = LOW. Proceed only if user confirms. |
| Gate data missing all financials | GATE-CHECK gate 2 | Return INCOMPLETE. State fields needed. |
| Zone not in opportunity map | IDEATE | List valid zones from project knowledge. Ask user to select. |
| Concept would violate price floor | IDEATE | Adjust concept or discard. Never generate sub-1,000 INR concepts. |

---

## Related Skills

| Skill | Relationship |
|---|---|
| product-discover | Upstream — produces ResearchRecord (SINGLE), TrendSignal[] (TRENDS) |
| product-screen | Bidirectional — receives EvalRecord for REPORT/BRIEF; provides ScoredCandidate[] as DEEP-EVAL input |
| margin-calculator | Sibling — Gate 2 requires margin-calculator output as input |
| vendor-ops | Sibling — Gate 4 requires vendor quality data as input |
| content-writer | Sibling — Gate 5 requires listing as input |
| ads-ops | Sibling — Gate 6 requires campaign verdict as input |

---

## Rules

1. Every score cites its source. No score without evidence.
2. Opportunity_Score is the sole authoritative Gate 1 value. niche_score is research-phase only.
3. Null inputs are excluded from scoring total and documented in gaps[]. Never substituted.
4. Gate FAIL verdicts include specific threshold, actual value, and actionable fix direction.
5. Ideation concepts satisfy all 7 hard rules or are discarded.
6. Financial thresholds come from project knowledge (financial-formulas.md). Never hardcoded.
7. Returns structured data only. CRM writes handled by zoho-data-ops. No direct Bigin writes.
8. Gate results returned to caller. Notifications handled by task orchestrator. No auto-memory storage.

---

## Execution Log

```
[EXEC:product_evaluate:PE-{MODE}-{YYYYMMDD}-{NNN}]
product-evaluate v2.1.0 | {YYYY-MM-DD} | Mode: {DEEP-EVAL|GATE-CHECK|IDEATE}
{DEEP-EVAL}: {product} | Score: {N}/100 | Verdict: {verdict} | Confidence: {level} | Marketplaces: {list} | CRM: {record_id}
{GATE-CHECK}: Gate {N} | Verdict: {PASS|FAIL|MARGINAL|INCOMPLETE} | Blockers: {N} | CRM: {fields_written} | Slack: {sent/skipped}
{IDEATE}: Zone: {zone} | Concepts: {N} | Recommended: {concept_id}
Data sources: {list}
```
