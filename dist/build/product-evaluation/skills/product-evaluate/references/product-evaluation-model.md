# Product Evaluation Model v2 — Stage-Gated Decision System

Replaces the single-score 16-criteria model. Evaluation now happens AT EACH pipeline stage
with specific entry criteria that must pass before a product advances.

**Design principles:**
1. Each gate produces a VERDICT (proceed / fix / stop), not just a number
2. Hard requirements (binary pass/fail) separate from scored assessments (weighted)
3. Every hard requirement maps to a Bigin field — designed for workflow enforcement
4. Scored assessments computed in artifacts, summary pushed to Bigin
5. Criteria are measurable for a solo founder with Helium10, Amazon data, and supplier quotes

**Pipeline stages:** New Request → Validated → Research & Profitability → Test Sourcing →
Test Listing → Paid Testing → Scale Decision Data → Sourcing Model Selection → Final Listing

---

## New Bigin Fields Required (3 fields — within budget)

| Proposed API Name | Type | Values | Gate |
|---|---|---|---|
| `Opportunity_Score` | integer | 0–100 | Gate 2 output |
| `Financial_Viability` | picklist | -None-, Pass, Marginal, Fail | Gate 3 output |
| `Scale_Verdict` | picklist | -None-, Scale, Pivot, Kill | Gate 7 output |

These fields receive values FROM the artifact (source of truth for computation).
Bigin workflow rules enforce: field must have required value before stage transition.

---

## Gate 1: New Request → Validated

**Purpose:** Is this idea worth spending 30 minutes researching?

### Hard Requirements (all must pass)

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 1.1 | Category selected | `Product_Category` | Not -None- |
| 1.2 | Platform selected | `Target_Platform` | At least one value |
| 1.3 | Description exists | `Description` | Not empty |

### No scored assessment at this gate.

**Verdict:** All 3 hard requirements met → **Proceed to Validated**. Any missing → record stays.

**Bigin enforcement:** Workflow rule on stage transition to "Validated": validate 1.1–1.3.

---

## Gate 2: Validated → Research & Profitability

**Purpose:** Is the market opportunity real? Worth committing time to financial analysis?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 2.1 | Target selling price set | `Target_Selling_Price` | > 0 |
| 2.2 | Target customer defined | `Target_Customer` | Not empty |
| 2.3 | USP articulated | `USP` | Not empty |

### Scored Assessment: Opportunity Score (artifact calculates → pushes to `Opportunity_Score`)

| Criterion | Weight | What it measures | Data source |
|---|---|---|---|
| Market Demand | 30% | Is there proven buying intent for this product? | Helium10 search volume, sales estimates, BSR data |
| Competition Beatability | 25% | Can a new entrant realistically win on Page 1? | Review barrier (avg reviews of top 10), brand concentration, listing quality gaps |
| Margin Potential | 25% | Does the price point support ≥15% net margin? | Selling price vs estimated COGS range, Amazon fee tier |
| Differentiation Room | 20% | Is there space to be meaningfully different? | Review complaints (pain points), feature gaps in top sellers, packaging/branding gap |

**Scoring per criterion (1–5):**

**Market Demand (Weight: 30%)**
```
5 — Primary keyword >10,000 monthly searches AND top 10 avg >300 units/month
4 — Primary keyword 5,000–10,000 AND top 10 avg 150–300 units/month
3 — Primary keyword 2,000–5,000 AND top 10 avg 50–150 units/month
2 — Primary keyword 500–2,000 AND top 10 avg 20–50 units/month
1 — Primary keyword <500 OR top 10 avg <20 units/month
```
*Note: Volumes calibrated for Amazon India. US Amazon volumes are 5–10× higher.*

**Competition Beatability (Weight: 25%)**
```
5 — Top 10 avg <100 reviews AND no dominant brand (>30% share) AND poor listing quality
4 — Top 10 avg 100–500 reviews AND mixed brand strength AND some listing gaps
3 — Top 10 avg 500–1,500 reviews AND 1–2 strong brands AND decent listings
2 — Top 10 avg 1,500–3,000 reviews AND established brands AND good listings
1 — Top 10 avg >3,000 reviews OR dominant brand (>50% share) OR Amazon own brand
```
*Key insight: Review count is the strongest predictor of cost-to-compete. A market where
top sellers have 3,000+ reviews requires ₹5–10L in review acquisition investment.*

**Margin Potential (Weight: 25%)**
```
5 — Estimated net margin >25% at market-competitive price
4 — Estimated net margin 20–25%
3 — Estimated net margin 15–20% (meets minimum threshold)
2 — Estimated net margin 10–15% (below target, needs optimization)
1 — Estimated net margin <10% OR negative at competitive price
```
*Uses rough estimate at this stage: SP − estimated_COGS − FBA_fees (~30% of SP) − tax (12%).*
*Detailed calculation happens at Gate 3 (Financial Viability).*

**Differentiation Room (Weight: 20%)**
```
5 — Clear 2+ differentiation angles from competitor review analysis + feature gaps
4 — 1 strong differentiation angle + packaging/branding opportunity
3 — Differentiation possible but requires design/innovation investment
2 — Commodity market, differentiation limited to branding only
1 — No clear differentiation possible, pure price competition
```

### Opportunity Score Calculation

```
Score = (Market_Demand × 0.30 + Competition × 0.25 + Margin × 0.25 + Differentiation × 0.20) × 20
```

Multiplied by 20 to map the 1–5 weighted average onto a 0–100 scale.

| Score | Verdict | Action |
|---|---|---|
| ≥70 | **Strong** — proceed to financial analysis | Move to Research & Profitability |
| 55–69 | **Promising** — proceed with noted concerns | Move, but document weak areas for monitoring |
| 40–54 | **Marginal** — investigate further before committing | Stay in Validated, address weak criteria |
| <40 | **Weak** — park or discard | Do not advance. Document reason. |

**Bigin enforcement:** Stage transition to "Research & Profitability" requires:
`Opportunity_Score >= 55` AND hard requirements 2.1–2.3 met.

---

## Gate 3: Research & Profitability → Test Sourcing

**Purpose:** Can we make money on this product? Is it worth spending money on samples?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 3.1 | Opportunity assessed | `Opportunity_Score` | ≥ 55 |
| 3.2 | Financial analysis completed | `Financial_Viability` | Not -None- |
| 3.3 | Financial verdict positive | `Financial_Viability` | = Pass OR Marginal |

### Scored Assessment: Financial Viability (artifact calculates → pushes to `Financial_Viability`)

The artifact runs the full unit economics model (see `financial-formulas.md`) and produces a verdict:

| Check | Pass Condition | Data Required |
|---|---|---|
| Net margin per unit | ≥ 15% after ALL costs (COGS + FBA fees + packaging + tax + COD) | SP, estimated COGS, product dimensions/weight |
| Breakeven ACoS | > 0% (product can support paid acquisition) | Net margin % |
| Target CPC | ≤ observed market CPC for primary keywords | ACoS × CVR, Helium10 CPC data |
| Capital requirement | ≤ available capital (currently bootstrapped) | Order qty × landed cost + launch costs |
| LTV:CAC ratio | > 2 (at estimated repeat purchase rate) | Net profit × LTV orders ÷ CPA |

**Verdict logic:**
```
Pass     — All 5 checks pass
Marginal — 4 of 5 pass, AND the failure is CPC or Capital (fixable)
Fail     — Net margin < 15% OR Breakeven ACoS ≤ 0% (fundamental economics broken)
```

**Bigin enforcement:** Stage transition to "Test Sourcing" requires:
`Financial_Viability` = Pass or Marginal.

---

## Gate 4: Test Sourcing → Test Listing

**Purpose:** Do we have a reliable supplier with acceptable product quality?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 4.1 | Supplier linked | `Supplier` (lookup) | Not empty |
| 4.2 | Landed cost confirmed | `Landed_Cost_Per_Unit` | > 0 |
| 4.3 | Sourcing marked complete | `Test_Sourcing_Complete` | = true |
| 4.4 | Vendor grade acceptable | `Vendor_Grade` on linked Contact | = A, B, or C |

### Scored Assessment: Vendor Evaluation

Uses the tiered vendor model (see `vendor-evaluation-model.md`).
Vendor must pass Tier 1 + achieve at least Grade C overall.

**Bigin enforcement:** Stage transition to "Test Listing" requires:
4.1–4.3 on Pipeline record AND `Vendor_Grade` on linked Supplier Contact ∈ {A, B, C}.

**Cross-system check:** Artifact re-validates that landed cost + vendor quote still produces
≥15% net margin (re-runs Gate 3 financial checks with confirmed numbers). If margin dropped
below 15%, artifact flags the discrepancy — doesn't block in Bigin but shows warning.

---

## Gate 5: Test Listing → Paid Testing

**Purpose:** Is the listing ready to receive paid traffic?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 5.1 | Listing URL set | `Test_Listing_URL` | Not empty |
| 5.2 | Listing marked complete | `Test_Listing_Complete` | = true |
| 5.3 | Compliance confirmed | `Product_Compliance_Status` | = Compliant |
| 5.4 | Go-live date set | `Test_Listing_Go_Live_Date` | Not empty |
| 5.5 | Test mode selected | `Idea_Test_Mode` | Not -None- |

### No scored assessment at this gate.

This gate is execution readiness — either the work is done or it isn't.

**Bigin enforcement:** Validate 5.1–5.5 on stage transition to "Paid Testing".

---

## Gate 6: Paid Testing → Scale Decision Data

**Purpose:** Do we have enough data to make a go/no-go decision?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 6.1 | Test period set | `Test_Start_Date` | Not empty |
| 6.2 | Test ran minimum duration | `Test_End_Date` | ≥ Test_Start_Date + 14 days |
| 6.3 | Data collected | `Test_Impressions` | ≥ 1,000 |

### No scored assessment — this is data sufficiency, not judgment.

**Bigin enforcement:** Validate 6.1–6.3 on stage transition to "Scale Decision Data".

---

## Gate 7: Scale Decision Data → Sourcing Model Selection

**Purpose:** Based on test data, should we scale, pivot, or kill this product?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 7.1 | Decision recorded | `Scale_Decision_Complete` | = true |
| 7.2 | Verdict set | `Scale_Verdict` | Not -None- |
| 7.3 | Verdict is not Kill | `Scale_Verdict` | = Scale OR Pivot |

### Scored Assessment: Scale Decision (artifact calculates → pushes to `Scale_Verdict`)

Assessment varies by test mode (`Idea_Test_Mode`):

**IF Conversion Test (testing with orders):**

| Metric | Scale | Pivot | Kill |
|---|---|---|---|
| Actual ACoS vs Target ACoS | ≤ Target | 1.0–1.5× Target | > 1.5× Target |
| CVR | ≥ Category avg | 0.5–1.0× avg | < 0.5× avg |
| Order trend (week 2 vs week 1) | Improving | Flat | Declining |
| Return rate | < 5% | 5–10% | > 10% |

**IF PPC Demand Test (testing without orders):**

| Metric | Scale | Pivot | Kill |
|---|---|---|---|
| CTR | ≥ 0.4% | 0.2–0.4% | < 0.2% |
| CPC vs ceiling | ≤ Target CPC | 1.0–1.3× Target | > 1.3× Target |
| Impression share (if available) | > 50% | 20–50% | < 20% |

**Verdict logic:**
```
Scale — Majority of metrics in "Scale" column AND no metric in "Kill"
Pivot — Mix of results, OR one metric in Kill but others strong
Kill  — Majority in "Kill" column OR fundamental economics broken
```

**Bigin enforcement:** Stage transition to "Sourcing Model Selection" requires:
`Scale_Verdict` = Scale or Pivot. Kill → record moves to Closed Lost.

---

## Gate 8: Sourcing Model Selection → Final Listing

**Purpose:** Is the scaling plan locked and execution-ready?

### Hard Requirements

| # | Requirement | Bigin Field | Validation |
|---|---|---|---|
| 8.1 | Sourcing model selected | `Sourcing_Model_Selected` | Not -None- |
| 8.2 | Fulfillment method set | `Fulfillment_Method` | Not -None- |
| 8.3 | MOQ defined | `Production_MOQ` | > 0 |
| 8.4 | Confirmed selling price | `Selling_Price_Confirmed` | > 0 |

### No scored assessment — execution readiness check.

**Bigin enforcement:** Validate 8.1–8.4.

---

## Summary: Gate Map

```
Stage                      Gate  Hard Reqs  Scored?     Bigin Verdict Field
─────────────────────────  ────  ─────────  ──────────  ─────────────────────
New Request → Validated     G1    3          No          (field completeness)
Validated → Research        G2    3          Yes (4 cr)  Opportunity_Score ≥55
Research → Test Sourcing    G3    3          Yes (5 ch)  Financial_Viability ∈ {Pass,Marginal}
Test Sourcing → Test List   G4    4          Vendor eval Vendor_Grade ∈ {A,B,C}
Test Listing → Paid Test    G5    5          No          (execution readiness)
Paid Testing → Scale Data   G6    3          No          (data sufficiency)
Scale Data → Sourcing Sel   G7    3          Yes (3-4m)  Scale_Verdict ∈ {Scale,Pivot}
Sourcing Sel → Final List   G8    4          No          (execution readiness)
```

**Total hard requirements across all gates:** 28 checks, all mapped to existing or proposed Bigin fields.
**Total scored assessments:** 3 (Opportunity, Financial, Scale) — all computed in artifact.
**New Bigin fields required:** 3 (Opportunity_Score, Financial_Viability, Scale_Verdict).

---

Bigin enforcement: Each gate uses a workflow rule on stage transition to validate required fields.
Implementation details in zoho-solutions-architect domain.
