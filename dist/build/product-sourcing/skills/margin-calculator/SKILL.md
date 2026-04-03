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

Core unit economics using confirmed inputs. Full formula chain in `references/financial-formulas.md`.
Amazon fees: `amazon-fee-table.ctx.md` (project context). Shopify fees: `references/channel-fee-models.md` §1-2.

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

**Output:** CostComparison (side-by-side: estimate vs actual vs test) + CostingScenarios (3-5 MOQ/price scenarios). See `references/schemas-and-steps.md`.

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

## Defaults

See `references/financial-formulas.md` — Defaults section. Key: Discount 10%, Tax 12% GST, COD/Gateway 2%, Packaging ₹100, Goal Profit 10%, LTV Orders 2.
