---
name: ads-ops
description: >
  Amazon PPC campaign management — setup, keyword harvesting, bid optimization, performance
  analysis, scale recommendations. TEST mode (Domain 2.5): structured auto-then-manual campaign
  workflow for market validation. LIVE mode (Domain 4): ongoing optimization and budget scaling.
  Trigger for: "PPC campaign", "test campaign", "auto campaign", "manual campaign", "keyword
  harvesting", "search term report", "ACoS", "ROAS", "ad performance", "bid strategy",
  "campaign analysis", "scale or kill", "ad spend", "sponsored products".
metadata:
  version: 1.0.0
  domain: marketing
  prefix: AO-
---

# Ads Ops

Amazon PPC campaign management for Ismokraft product launches and ongoing operations.
Two modes: TEST (structured market validation) and LIVE (ongoing optimization).

**Single responsibility:** Plan, analyze, and recommend on PPC campaigns. Does not execute
Seller Central actions (team does that manually). Does not calculate margins (margin-calculator's job).

---

## Mode Selection

| User has... | Needs... | Run mode |
|---|---|---|
| New product at FBA, no campaign data | Test campaign plan + analysis | TEST |
| Running campaigns, performance data | Optimization + scale decisions | LIVE |

---

## Mode: TEST (Domain 2.5 — Market Validation)

**Trigger:** "set up test campaign", "PPC test", "keyword discovery campaign", "should we scale or kill"

Two-phase structured test per `ppc-test-campaign-config.ctx.json`:

### Phase 1: Discovery (Auto Campaigns)

**Goal:** Discover which keywords Amazon associates with the product.

1. **Plan** auto campaign: naming convention `Test_[ProductName]_SP_Auto`, budget and bid from config
2. Recommend bid strategy: Dynamic Bids - Down Only (conservative discovery)
3. Output **TestPlan** with: campaign name, type, budget/day, bid, duration, targeting, success criteria
4. TestPlan requires human approval before any spend

**After Phase 1 runs** (team executes in Seller Central):
- Team exports Search Term Report CSV from Seller Central
- Analyze report using 4-bucket framework (see `reference/ads-metrics.md` keyword action rules):
  - **Winners:** Orders >= 3, ACoS <= target → promote to manual exact
  - **Learners:** Orders >= 1, ACoS <= breakeven → hold, monitor
  - **Losers:** Orders = 0, Spend > threshold → negate
  - **No Data:** Insufficient impressions → ignore until more data
- Output: harvested keyword list, negative keyword list, data quality rating (HIGH/MEDIUM/LOW)

### Phase 2: Validation (Manual Campaigns)

**Goal:** Validate unit economics per keyword — actual CVR, ACoS, margin.

1. **Plan** manual exact-match campaign from Phase 1 winners: `Test_[ProductName]_SP_Manual_Exact`
2. Negate losers in auto campaign (keep auto running as discovery engine)
3. Recommend bid strategy: Dynamic Bids - Up and Down (maximize conversion data)
4. Budget per config; duration per config

**After Phase 2 runs:**
- Analyze Search Term Report at keyword level
- For each keyword: at this CPC and CVR, does the product make margin? (request margin-calculator COMPARISON mode)
- Rate data quality per `ppc-test-campaign-config.ctx.json` thresholds
- If LOW quality → recommend extension with `extend_recommended: true`
- Output **TestResults**: per-keyword metrics, blended ACoS/ROAS, data quality, viable keyword count

### TEST Mode Output

```
TestPlan: {campaign_name, type, budget_daily, bid_strategy, default_bid, duration_days, targeting, success_criteria}
TestResults: {keywords[], blended_acos, blended_roas, data_quality, viable_keyword_count, recommendation}
```

---

## Mode: LIVE (Domain 4 — Ongoing Management)

**Trigger:** "optimize campaigns", "ad performance review", "scale budget", "reduce ACoS", "campaign health"

Ongoing optimization of active campaigns:

1. **Health check** — classify each campaign/keyword using `reference/ads-metrics.md` thresholds:
   - ACoS vs target/breakeven, CTR health, CVR health, spend efficiency
2. **Bid optimization** — recommend bid adjustments per keyword action rules
3. **Budget scaling** — if blended ACoS <= target, recommend budget increase with guardrails
4. **Keyword expansion** — harvest new winners from auto campaigns periodically
5. **Negative management** — identify and negate wasteful search terms

### LIVE Mode Output

```
CampaignHealthReport: {campaigns[], blended_metrics, action_items[], budget_recommendation}
```

---

## Session Protocol

1. Read this SKILL.md
2. Read `reference/ads-metrics.md` — metric formulas, health thresholds, keyword action rules
3. Read `ppc-test-campaign-config.ctx.json` (project context) — phase config, budgets, thresholds
4. If analyzing data: request Search Term Report CSV or summary from user

---

## Rules

1. **Never execute Seller Central actions.** Output plans and recommendations; team executes manually.
2. **Never estimate ad performance.** Analyze actual data. If no data exists, plan the test to collect it.
3. **Always reference config.** Budgets, durations, thresholds come from `ppc-test-campaign-config.ctx.json`, not hardcoded.
4. **Show the math.** Every ACoS, ROAS, CPC calculation must trace to inputs.
5. **Human approves spend.** TestPlan and budget changes require explicit approval before execution.
6. **Margin decisions go to margin-calculator.** This skill analyzes ad metrics; margin-calculator determines if the product is profitable.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `margin-calculator` | Upstream — provides breakeven ACoS/ROAS targets; COMPARISON mode validates test economics |
| `product-monitor` | Complement — tracks BSR, reviews, returns during test window |
| `fulfillment-ops` | Upstream — FBA dispatch must complete before campaigns start |
| `ism-learning-engine` | Exception capture — unusual campaign patterns or platform changes |

---

## Reference Files

| File | Purpose |
|---|---|
| `reference/ads-metrics.md` | Metric formulas, health thresholds, campaign taxonomy, keyword action rules |
| `reference/schemas-and-steps.md` | Input/output schemas for TEST and LIVE modes |
| `ppc-test-campaign-config.ctx.json` (project) | Phase durations, budgets, bid defaults, data quality thresholds |
| `amazon-fee-table.ctx.md` (project) | Fee reference for margin context |
