---
name: margin-calculator
description: >
  MC- Per-unit profitability authority for Amazon India and Shopify. Five modes:
  ESTIMATE (pre-test assumed COGS, D1), ACTUAL (confirmed vendor COGS, D2),
  COMPARISON (estimate vs actual vs test data, D2.5 Gate 2 feeder with
  gate_2_margin_contribution output), CHANNEL (Amazon vs Shopify side-by-side
  utility), BREAKEVEN (break-even units/revenue utility).
  Reads financial-constants.ctx.json and gate-criteria.ctx.json — never
  hardcodes thresholds. Every output traces to named context paths.
  ALWAYS trigger for: "calculate margin", "unit economics", "is this profitable",
  "Amazon fees", "breakeven", "cost breakdown", "FBA fees", "net profit",
  "gross margin", "channel comparison", "Amazon vs Shopify", "min selling price",
  "break-even units", "cost comparison", "costing scenarios", "scenario
  economics", "MC-". For ACoS/ROAS on ad metrics, see ads-ops-plan (MC provides
  target/breakeven ACoS, ads-ops-plan measures actual).
metadata:
  version: 3.0.0
  domain: finance
  prefix: MC-
---

# Margin Calculator

Per-unit profitability authority for Amazon India and Shopify. Five modes run independently or in sequence.

**Single responsibility:** Compute unit economics and channel comparison. Does NOT project cash flows (→ capital-planner), does NOT analyze actual ad performance (→ ads-ops-plan), does NOT post to Slack or write CRM (task handles via slack-messaging + zoho-data-ops).

---

## Mode Selection

| User has... | Needs... | Run mode | Domain | Task consumer |
|---|---|---|---|---|
| Product idea, estimated COGS | Pre-test unit economics → Gate 1 | **ESTIMATE** | D1 | daily-discovery / product-evaluate |
| Confirmed vendor quote | Actual unit economics | **ACTUAL** | D2 | product-sourcing workflows |
| Test results + prior estimates + vendor actuals | Pre vs actual vs test cost comparison + scale scenarios → Gate 2 | **COMPARISON** | D2.5 | test-campaign Step 7 |
| Same product, both channels | Which channel is more profitable | **CHANNEL** | any (utility) | — general-purpose |
| CPU and fixed costs | How many units to break even | **BREAKEVEN** | any (utility) | — general-purpose |

**CHANNEL and BREAKEVEN are general-purpose utility modes** — no task orchestration today; invoked directly when a user asks. Unlike stub modes, they fully work and return structured data.

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/financial-formulas.md` — unit economics chain, LTV, ACoS targets (values cite context paths, not hardcoded)
3. Read `references/channel-fee-models.md` — Shopify fees, returns, channel comparison, pricing, break-even
4. Read `references/schemas-and-steps.md` — I/O schemas for all 5 modes + gate_2_margin_contribution
5. Read `references/tuning-constants.md` — skill-local values not in project context
6. Read `context/product-pipeline/financial-constants.ctx.json` — **authoritative** source for margins, pricing, ACoS targets, CBFA formula, break_even_acos formula
7. Read `context/product-pipeline/gate-criteria.ctx.json` — **authoritative** Gate 1 + Gate 2 criteria. CBFA ≥ 150 is **gate_1**, not gate_2. Gate 2 has different fields (keyword_margin_positive_count, blended_acos_lte, data_quality, compliance).
8. For Amazon fees: reference `context/product-pipeline/amazon-fee-table.ctx.md`
9. Request product_name, list_price (MRP), cogs_inr, weight_grams, category. **Never estimate COGS.**

---

## Mode: ESTIMATE

Pre-test assumed unit economics for Domain 1 (pre-Gate-1). Same formula chain as ACTUAL but with assumed/estimated COGS. Output `CostEstimate` (distinct from `MarginRecord`) to signal these are estimates.

Flag COGS origin: `cogs_confidence: "ESTIMATED"` (operator/benchmark) or `"CONFIRMED"` (vendor quote).

Full I/O schema → `references/schemas-and-steps.md`.

---

## Mode: ACTUAL

Core unit economics using confirmed vendor inputs. Full formula chain in `references/financial-formulas.md`. Amazon fees from `amazon-fee-table.ctx.md`; Shopify fees from `channel-fee-models.md §1-2`.

**Output:** `MarginRecord` with skill-local verdict (PASS / MARGINAL / FAIL). The verdict is **margin-calculator's own quality check**, distinct from Gate 1 or Gate 2 decisions. It uses three thresholds, each cited by source:

1. **Net margin ≥ `financial-constants.ctx.json#margins.target_net_margin_pct`** (default 15%) — target, not a gate
2. **Selling price ≥ `financial-constants.ctx.json#pricing.price_floor_inr`** (default ₹1,000) — brand rule, not a gate
3. **LTV:CAC > `tuning-constants.md#verdict.ltv_cac_min`** (default 3) — skill-local benchmark

Verdict logic:
- All 3 met → **PASS**
- 1-2 fail but net margin ≥ 10% → **MARGINAL**
- Net margin < 10% OR all 3 fail → **FAIL**

Full I/O schema → `references/schemas-and-steps.md`.

---

## Mode: COMPARISON (D2.5 — Gate 2 feeder)

Compares up to three data points for a test-campaign at Gate 2:
1. **CostEstimate** (D1) — pre-test assumed economics
2. **MarginRecord** (D2) — confirmed vendor COGS economics
3. **TestActuals** (D2.5) — actual CPC, CVR, ACoS from test campaigns (provided by the task, sourced from ads-ops-plan TEST mode output)

**Outputs:**
- `CostComparison` — side-by-side: estimate vs actual vs test
- `CostingScenarios` — 3-5 bulk economic scenarios (varying MOQ / price points)
- `gate_2_margin_contribution` block — structured handoff to test-campaign Gate 2 decision, matching `gate-criteria.ctx.json#gate_2.full_criteria`. Fields: `actual_vs_estimate_delta_pct`, `test_vs_actual_delta_pct`, `bulk_margin_meets_target`, `scale_feasibility` (PROCEED / REVISIT_COGS / ABORT), `rationale`.

The test-campaign task reads `gate_2_margin_contribution` at Step 9 (Gate 2 presentation) alongside ads-ops-plan's `gate_2_readiness` and product-monitor's `gate_2_contribution`.

Full I/O schemas → `references/schemas-and-steps.md`.

---

## Mode: CHANNEL (utility)

Run ACTUAL mode twice with Amazon fees and Shopify fees. Same product, same COGS, same list_price. Output `ChannelComparisonRecord` per `references/channel-fee-models.md §4`.

If `shopify_plan` not provided, default to Basic (2% platform fee) and declare the assumption in `inputs_used`.

---

## Mode: BREAKEVEN (utility)

Compute break-even units and revenue from `cpu_inr` (contribution per unit) and `fixed_costs_monthly_inr`. See `channel-fee-models.md §6`. Requires `cpu_inr` (from ACTUAL mode output). Optional: `fixed_costs_monthly_inr`, `cpa_inr`.

If `fixed_costs_monthly_inr` not provided → product-level break-even only; declare the assumption explicitly (don't silently default to zero).

---

## Rules

1. **Never estimate COGS.** Ask if not provided. Do not assume or guess.
2. **Never hardcode thresholds.** Read values from `financial-constants.ctx.json` and `gate-criteria.ctx.json` — cite the path in every output.
3. **Never deduct GST on the product from margin.** GST on product is pass-through (collected from buyer, remitted, offset by ITC). See `channel-fee-models.md §2`. **GST on fees** is a separate input tax credit line, already in the deduction chain.
4. **Gate attribution discipline.** CBFA ≥ 150 is **gate_1**, not gate_2. ESTIMATE/ACTUAL feed Gate 1; COMPARISON feeds Gate 2. Don't mix them.
5. **Category determines referral fee.** Always confirm or ask.
6. **Weight determines weight handling fee.** Always confirm or ask.
7. **Show the full math.** Every output number traces to inputs + formula. Verdict thresholds cite context paths.
8. **Always state which values are defaults vs actuals.** Populate `inputs_used` with a `source` field per input: `"operator"`, `"vendor_quote"`, `"ctx_default"`, `"skill_default"`.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `capital-planner` | Downstream — margin-calculator produces unit economics; capital-planner projects cash flows and inventory |
| `ads-ops-plan` | Bidirectional — MC provides target_acos_pct + breakeven_acos_pct; ads-ops-plan provides actual CPA + ACoS for COMPARISON mode TestActuals |
| `product-evaluate` | Upstream — product-evaluate consumes MC's ESTIMATE output for Gate 1 decisions |
| `vendor-ops` | Upstream — confirmed COGS feeds ACTUAL mode |
| `zoho-data-ops` | Downstream — task uses it to persist MarginRecord / CostComparison to CRM |
| `slack-messaging` | Downstream — task formats Slack output (skill never posts directly) |

---

## Reference Files

| File | Purpose |
|---|---|
| `references/financial-formulas.md` | Complete formula chain (unit economics, LTV, ACoS, CBFA, break-even) with explicit citations to `financial-constants.ctx.json` paths |
| `references/channel-fee-models.md` | Shopify fees, returns cost model, channel comparison, pricing model, break-even |
| `references/schemas-and-steps.md` | I/O schemas for all 5 modes (ESTIMATE, ACTUAL, COMPARISON, CHANNEL, BREAKEVEN), gate_2_margin_contribution structure, CRM field mapping |
| `references/tuning-constants.md` | Skill-local values not in project context (e.g., ltv_cac_min, verdict margin cutoffs) |
| `context/product-pipeline/financial-constants.ctx.json` (project) | **Authoritative** margins, pricing, ACoS targets, CBFA/break_even_acos formulas |
| `context/product-pipeline/gate-criteria.ctx.json` (project) | **Authoritative** Gate 1 + Gate 2 criteria |
| `context/product-pipeline/amazon-fee-table.ctx.md` (project) | Amazon fee reference table |
