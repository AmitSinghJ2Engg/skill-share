---
name: product-evaluate
description: >
  Evaluates, gate-checks, and ideates wooden premium product opportunities.
  Three modes: DEEP-EVAL (16-criteria weighted evaluation with ResearchRecord,
  scored verdict with cited evidence), GATE-CHECK (product against 8 launch
  gates, go/no-go with blockers and fix actions), IDEATE (structured product
  concepts with evidence-backed differentiation and wood specs).
  ALWAYS trigger for: "evaluate this", "gate check", "can we launch", "is this
  ready", "go no-go", "generate concepts", "ideate", "product concepts",
  "differentiation ideas", "PE-", "gate 1-8", "deep eval".
  Do NOT trigger for batch scoring — route to product-screen.
metadata:
  domain: product
  prefix: PE-
  version: "2.1.0"
---

# Product Evaluate

Single-product evaluation, gate-checking, and concept generation.

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **DEEP-EVAL** | product_name + ResearchRecord | EvalRecord (Opportunity_Score 0-100) | GATE-CHECK |
| **GATE-CHECK** | product data + gate_number (1-8 or "all") | GateResult[] go/no-go | product-screen BRIEF |
| **IDEATE** | zone or product + optional research | ConceptBatch | product-discover or vendor-ops |

**Boundary:** Evaluates single products only. Not batches (product-screen), market data (product-discover), margins (margin-calculator), or listings (content-writer).

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `product-evaluate`, `cross-skill`
3. For DEEP-EVAL: read `references/product-eval-model.md` — 16-criteria rubric
4. For IDEATE: read `references/ideation-framework.md` — concept structure and hard rules

---

## Mode: DEEP-EVAL

16-criteria weighted evaluation across 4 dimensions. See `references/product-eval-model.md` for full rubric.

| Dimension | Weight | Criteria |
|---|---|---|
| Market Demand | 30% | Search Volume, Demand Signal, Trend Direction, Category Size |
| Competition Beatability | 25% | Review Moat, Brand Concentration, New Entrant Success, Listing Quality Gap |
| Margin Potential | 25% | Price Cluster Fit, COGS Headroom, Fee Structure, Risk (negative weight) |
| Differentiation Room | 20% | Unmet Needs, Personalization Fit, Wood Advantage, Legal & Safety (weight 0) |

**Steps:** Confirm inputs → score 16 criteria (cite source for each) → compute weighted total → adjust for null criteria → apply verdict thresholds (STRONG 75+, MODERATE 55-74, WEAK 35-54, REJECT 0-34) → return EvalRecord with Opportunity_Score.

**Output:** EvalRecord with eval_id, Opportunity_Score, verdict, dimension_scores, criterion_details (16 entries), strengths[], risks[], data_gaps[], confidence.

---

## Mode: GATE-CHECK

Evaluate product against one or all 8 gates. Gate criteria from `gate-criteria.ctx.json`. Stage checklists from `02-business-domain-map.md`.

**Steps:** Check hard requirements (PASS/FAIL with specific field cited) → compute scored sum → apply threshold → assign verdict (PASS/MARGINAL/FAIL/INCOMPLETE).

Every FAIL includes: failed criterion, actual value, threshold, and specific fix action with formula reference.

| Gate | Name | Bigin Transition |
|---|---|---|
| 1 | Product Attractiveness | New Request → Validated |
| 2 | Financial Viability | Validated → Research & Profitability |
| 3 | Sourcing Feasibility | R&P → Test Sourcing |
| 4 | Vendor Quality | Test Sourcing → Test Listing |
| 5 | Listing Readiness | Test Listing → Paid Testing |
| 6 | Test Campaign Results | Paid Testing → Scale Decision |
| 7 | Scale Decision | Scale Decision → Sourcing Model |
| 8 | Final Launch Readiness | Sourcing Model → Final Listing |

**Output:** GateResult[] with verdict, hard_reqs, scored_sum, blockers[], fix_actions[].

---

## Mode: IDEATE

Generate evidence-backed product concepts for a zone or product. See `references/ideation-framework.md` for structure and hard rules.

**Hard rules:** Price floor 1000 INR. Weight ceiling 2.0 kg. Wood dominance 70%+. India manufacture (Jodhpur/Moradabad/Vrindavan). Differentiation hooks cited. No generic claims.

**Output:** ConceptBatch with concepts[], zone_signal_summary, recommended_concept_id.

---

## Rules

1. Every score cites its source. No score without evidence.
2. Opportunity_Score is the sole Gate 1 value. niche_score is research-phase only.
3. Null inputs excluded from total, documented in gaps[]. Never substituted.
4. Gate FAIL verdicts include threshold, actual value, and fix direction.
5. Financial thresholds from project knowledge. Never hardcoded.
6. Returns structured data only. CRM writes handled by zoho-data-ops.

---

## Reference Files

| File | Read when |
|---|---|
| `references/product-eval-model.md` | DEEP-EVAL — 16-criteria rubric |
| `references/ideation-framework.md` | IDEATE — concept structure, hard rules |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-discover` | Upstream — ResearchRecord, TrendSignal[] |
| `product-screen` | Bidirectional — EvalRecord for REPORT/BRIEF |
| `margin-calculator` | Gate 2 requires margin output |
| `vendor-ops` | Gate 4 requires vendor quality |
| `content-writer` | Gate 5 requires listing |
| `ads-ops` | Gate 6 requires campaign verdict |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Every score cites source field, value, platform, and date
- Null inputs produce conservative handling, not zero or estimated
- Gate verdicts cite the specific criterion that failed
- Ideation hooks cite every differentiation claim
