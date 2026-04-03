---
name: margin-calculator
description: >
  Per-unit profitability for Amazon India and Shopify. Five modes: ESTIMATE (assumed COGS),
  ACTUAL (confirmed vendor COGS), COMPARISON (pre vs actual vs test data), CHANNEL (Amazon
  vs Shopify side-by-side), BREAKEVEN (break-even units/revenue). Trigger for: "calculate
  margin", "unit economics", "is this profitable", "Amazon fees", "breakeven", "ACoS", "ROAS",
  "cost breakdown", "FBA fees", "net profit", "gross margin", "channel comparison",
  "min selling price", "break-even units", "cost comparison", "costing scenarios".
metadata:
  version: 2.0.0
  domain: finance
  prefix: MC-
---

# Margin Calculator

Per-unit profitability for Amazon India and Shopify. Five modes run independently or in sequence.

**Single responsibility:** Compute unit economics and channel comparison. Do not project cash flows
(capital-planner's job). Do not analyze ad performance (ads-ops's job).

---

## Mode Selection

| User has... | Needs... | Run mode |
|---|---|---|
| Product idea, estimated costs | Pre-test unit economics | ESTIMATE |
| Confirmed vendor quote | Actual unit economics | ACTUAL |
| Test results + earlier estimates | Pre vs post cost comparison | COMPARISON |
| Same product, both channels | Which channel is more profitable | CHANNEL |
| CPU and fixed costs | How many units to break even | BREAKEVEN |

**Domain mapping:** ESTIMATE = Domain 1 (pre-Gate 1), ACTUAL = Domain 2 (post-vendor),
COMPARISON = Domain 2.5 (post-test), CHANNEL/BREAKEVEN = any domain as needed.

---

## Mode: ESTIMATE

**Trigger:** "estimate margin", "pre-test economics", "rough profitability"
**Prefix:** MC-E-

Same formula chain as ACTUAL but with assumed/estimated COGS. Output CostEstimate (not MarginRecord)
to signal these are estimates. Flag all assumptions explicitly.

If COGS is estimated, label: `"cogs_confidence": "ESTIMATED"`. If from vendor quote: `"CONFIRMED"`.

---

## Mode: ACTUAL

**Trigger:** "calculate margin", "unit economics", "what's the margin", "is this profitable"
**Prefix:** MC-A-

Core unit economics using confirmed inputs. Formula chain from `references/financial-formulas.md`:

```
SP → Net SP (SP × (1 - discount%))
  → Gross Margin (Net SP - COGS)
  → Deductions (referral + closing + weight + packaging + COD/PG + GST on fees + returns)
  → Net Profit (Gross Margin - Deductions)
  → Net Margin % (Net Profit / Net SP)
  → ROI % (Net Profit / Investment Cost)
  → Breakeven ACoS, ROAS, CPA, LTV, Blended Profit
```

**Fee lookup:**
- Amazon: see `amazon-fee-table.ctx.md` (project context) for 2026 referral fees, closing fees, weight handling, FBA pick & pack, GST
- Shopify: see `references/channel-fee-models.md` §1-2

**Output:** MarginRecord with verdict (PASS / MARGINAL / FAIL).

**Verdict logic:** Net margin >= 15% AND SP >= ₹1,000 AND LTV:CAC > 3 → PASS.
1-2 fail but net margin >= 10% → MARGINAL. Net margin < 10% or all 3 fail → FAIL.

---

## Mode: COMPARISON (Domain 2.5)

**Trigger:** "compare costs", "pre vs actual", "cost comparison", "costing scenarios"
**Prefix:** MC-X-

Compares up to three data points:
1. **CostEstimate** (Domain 1) — pre-test assumed economics
2. **MarginRecord** (Domain 2) — confirmed vendor COGS economics
3. **TestActuals** (Domain 2.5) — actual CPC, CVR, ACoS from test campaigns

**Output:**
- **CostComparison** — side-by-side table: estimate vs actual vs test for SP, COGS, fees, margin, ACoS
- **CostingScenarios** (3-5 bulk scenarios) — at different MOQ/price points: break-even, target, stretch

```json
{
  "cost_comparison": {
    "estimate": {"net_margin_pct": 22, "breakeven_acos": 22},
    "actual": {"net_margin_pct": 19, "breakeven_acos": 19},
    "test": {"actual_acos": 35, "viable_keywords": 5}
  },
  "costing_scenarios": [
    {"moq": 100, "cogs_inr": 600, "net_margin_pct": 19, "breakeven_units": 173},
    {"moq": 500, "cogs_inr": 520, "net_margin_pct": 24, "breakeven_units": 142}
  ],
  "recommendation": "SCALE | HOLD | KILL"
}
```

---

## Mode: CHANNEL

**Trigger:** "compare channels", "Amazon vs Shopify margin", "channel comparison"
**Prefix:** MC-C-

Run ACTUAL mode twice: once with Amazon fees, once with Shopify fees. Same product, same COGS, same SP.
See `references/channel-fee-models.md` §4 for ChannelComparisonRecord output schema.

If shopify_plan not provided → default to Basic (2% platform fee) and declare assumption.

---

## Mode: BREAKEVEN

**Trigger:** "break-even units", "how many units to break even", "break-even revenue"
**Prefix:** MC-B-

See `references/channel-fee-models.md` §6. Requires cpu_inr (from ACTUAL mode output).
Optional: fixed_costs_monthly_inr, cpa_inr. If fixed costs not provided → product-level break-even only.

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/financial-formulas.md` — complete formula chain
3. Read `references/channel-fee-models.md` — Shopify fees, returns, channel comparison, pricing, break-even
4. For Amazon fees: reference `amazon-fee-table.ctx.md` (project context)

---

## Rules

1. **Never estimate COGS.** Ask if not provided. Do not assume or guess.
2. **Use corrected formulas.** Breakeven ROAS, LTV, Blended Profit, CPA per financial-formulas.md.
3. **Category determines referral fee.** Always confirm or ask.
4. **Weight determines weight handling fee.** Always confirm or ask.
5. **Show the full math.** Every output number must be traceable to inputs + formula.
6. **Always state which values are defaults vs actuals.** Never hide assumptions.

---

## Default Assumptions

| Parameter | Default | Source |
|---|---|---|
| Discount % | 10% | financial-formulas.md |
| Tax rate on SP | 12% | financial-formulas.md |
| COD + Payment Gateway | 2% of SP | financial-formulas.md |
| Packaging & Shipping | ₹100 | financial-formulas.md |
| Goal Profit % | 10% | financial-formulas.md |
| Lifetime Orders | 2 | financial-formulas.md |

---

## Input/Output Schemas

See `references/schemas-and-steps.md` for full JSON schemas.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-evaluate` | Upstream — product context; uses margin threshold in scoring |
| `vendor-ops` | Upstream — provides confirmed COGS from vendor quote |
| `ads-ops` | Downstream — receives breakeven ACoS and ROAS targets |
| `capital-planner` | Downstream — receives per-unit margin for cash flow modelling |
| `revenue-ops` | Complement — reconciles actual fees against 2026 fee schedule |
| `ism-learning-engine` | Exception capture — unusual fee structures or edge cases |

---

## Reference Files

| File | Read when |
|---|---|
| `references/financial-formulas.md` | Session start — complete formula chain |
| `references/channel-fee-models.md` | Shopify fees, returns model, channel comparison, pricing, break-even |
| `references/schemas-and-steps.md` | Input/output JSON schemas |
| `amazon-fee-table.ctx.md` (project) | Amazon India 2026 fee tables |
