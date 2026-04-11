# margin-calculator — Schemas & Execution Steps (all 5 modes)

**Authoritative I/O schemas for all 5 modes.** Pre-v3.0.0 this file only documented ACTUAL mode; the other 4 modes were implied but never formally specified. DL-023 audit finding MC1 fixed this gap.

**Shorthand notation** — pseudo-schema form, same compression pattern as DL-021 ads-ops-plan. Every field name and type is preserved; JSON-Schema boilerplate is compressed.

---

## Shared Input Block

All 5 modes accept these common fields:

```
product_name: string (required)
list_price_inr: number (required — MRP / listed price, previously "AOV", renamed in v3.0.0 per MC11)
cogs_inr: number (required for ACTUAL, ESTIMATE — operator provides or ask; NEVER estimate)
weight_grams: int (required for Amazon fee calculation)
category: string (required — Amazon category, determines referral fee)
fulfillment_model: "fba" | "self_ship" | "easy_ship" (default: "fba")
discount_pct: number (default: tuning-constants.md §1 defaults.discount_pct = 10)
weekly_ad_spend_inr: number (optional — for ACoS/ROAS context in output)
```

**Never estimate COGS.** If not provided in inputs, ask the user. Do not proceed with a guessed value. S22 rule.

---

## Mode: ESTIMATE

### Input
Shared Input Block + `cogs_confidence: "ESTIMATED"` (default).

### Output — `CostEstimate`
```
product_name: string
cogs_confidence: "ESTIMATED"                       # distinguishes from MarginRecord
inputs_used: {
  list_price_inr, cogs_inr, weight_grams, category, ...
  each field with source: "operator" | "vendor_quote" | "ctx_default" | "skill_default"
}
unit_economics: {                                   # same structure as ACTUAL MarginRecord
  list_price_inr, discount_inr, net_sp_inr, cogs_inr,
  gross_margin_inr, gross_margin_pct,
  deductions: {
    referral_fee_inr, closing_fee_inr, weight_handling_inr,
    packaging_shipping_inr, gst_on_fees_inr, cod_gateway_inr,
    returns_cost_inr, total_deductions_inr
    # NOTE: no gst_on_product_inr — pass-through per channel-fee-models.md §2
  },
  net_profit_inr, net_margin_pct,
  investment_cost_inr, roi_pct
}
paid_acquisition: {
  target_acos_pct: number,                           # from fc.acos_targets.test_phase_max_pct or ACTUAL
  breakeven_acos_pct: number,                        # = net_margin_pct
  cpa_max_inr: number,
  breakeven_roas: number
}
ltv: {
  ltv_orders: int,                                   # from tuning-constants.md §2
  ltv_inr: number,
  blended_profit_per_order_inr: number,
  ltv_cac_ratio: number | null                       # null if cpa_inr unavailable
}
gate_1_contribution: {                               # NEW in v3.0.0 — structured Gate 1 handoff
  cbfa_inr: number,                                  # net_profit - ad_spend_per_unit
  cbfa_meets_threshold: bool,                        # cbfa_inr >= gc.gate_1.criteria.cbfa_min_inr
  breakeven_acos_meets_threshold: bool,              # <= gc.gate_1.criteria.break_even_acos_max_pct
  all_margin_criteria_met: bool,                     # AND of the two above (compliance is checked by compliance-ops, not here)
  rationale: string
}
zero_referral_fee_eligible: bool                     # list_price_inr <= fc.pricing.zero_referral_fee_threshold_inr
verdict: "PASS" | "MARGINAL" | "FAIL"                # skill-local quality check, NOT a gate decision
verdict_detail: {
  net_margin_check: bool,
  price_floor_check: bool,
  ltv_cac_check: bool | null
}
cogs_target_for_vendor_discovery: number             # COGS threshold to pass to vendor-ops
gaps: [string]                                        # inputs that were absent (e.g., ["cpa_inr"])
context_paths_cited: [string]                         # e.g., ["fc.margins.target_net_margin_pct", "gc.gate_1.criteria.cbfa_min_inr"]
```

---

## Mode: ACTUAL

### Input
Same as ESTIMATE, but `cogs_confidence: "CONFIRMED"` (vendor quote).

### Output — `MarginRecord`
Identical structure to `CostEstimate` except `cogs_confidence: "CONFIRMED"`. Same fields, same gate_1_contribution, same verdict logic.

---

## Mode: COMPARISON (D2.5 Gate 2 feeder)

### Input
```
product_name: string
cost_estimate: CostEstimate                          # from D1 ESTIMATE run
margin_record: MarginRecord                          # from D2 ACTUAL run
test_actuals: TestActuals (required)                 # from D2.5 ads-ops-plan test campaign output
bulk_scenarios_requested: int (default 4)           # how many CostingScenarios to generate
```

### Input sub-type: `TestActuals`
```
campaign_id: string
period_days: int
total_impressions: int
total_clicks: int
total_orders: int
total_spend_inr: number
total_revenue_inr: number
blended_acos_pct: number                             # from ads-ops-plan TEST analyze_validation
blended_roas: number
avg_cpc_inr: number
avg_cvr_pct: number
cpa_inr: number                                      # derived: total_spend / total_orders
data_quality: "HIGH" | "MEDIUM" | "LOW"
```

### Output — `CostComparison`
```
product_name: string
periods: {
  d1_estimate: { net_margin_pct, breakeven_acos_pct, cpa_max_inr, cogs_inr },
  d2_actual:   { net_margin_pct, breakeven_acos_pct, cpa_max_inr, cogs_inr },
  d2_5_test:   { actual_cpa_inr, actual_acos_pct, implied_net_margin_pct }
}
deltas: {
  cogs_delta_inr: number,                            # d2_actual.cogs - d1_estimate.cogs
  cogs_delta_pct: number,
  net_margin_delta_pct: number,                      # d2_actual - d1_estimate
  breakeven_acos_delta_pct: number,
  actual_vs_estimate_summary: string                 # human-readable
}
test_reality_check: {
  actual_cpa_vs_max: number,                         # test_actuals.cpa_inr - d2_actual.cpa_max_inr (positive = over budget)
  actual_acos_vs_breakeven: number,                  # test_actuals.blended_acos - d2_actual.breakeven_acos
  test_vs_actual_delta_pct: number,                  # gap between test-implied margin and d2 actual margin
  commentary: string
}
gate_2_margin_contribution: {                        # NEW v3.0.0 — structured Gate 2 handoff
  actual_vs_estimate_delta_pct: number,
  test_vs_actual_delta_pct: number,
  bulk_margin_meets_target: bool,                    # top CostingScenario net_margin >= fc.margins.target_net_margin_pct
  keyword_margin_positive_count: int,                # number of keywords where per-keyword margin > 0 at actual CVR/CPC (joined with ads-ops-plan by_keyword data)
  keyword_margin_threshold_met: bool,                # keyword_margin_positive_count >= gc.gate_2.full_criteria.keyword_margin_min_positive
  blended_acos_threshold_met: bool,                  # test_actuals.blended_acos_pct <= d2_actual.breakeven_acos_pct
  scale_feasibility: "PROCEED" | "REVISIT_COGS" | "ABORT",
  rationale: string
}
```

### Output — `CostingScenarios`
```
scenarios: [{
  scenario_id: "MC-CS-<date>-<nn>",
  scenario_type: "conservative" | "balanced" | "aggressive",
  moq_units: int,                                    # minimum order quantity
  unit_cost_landed_inr: number,                      # COGS at this MOQ (vendor tier pricing)
  bulk_investment_inr: number,                        # moq_units × unit_cost_landed_inr
  implied_unit_economics: {
    cogs_inr, net_sp_inr, net_profit_inr, net_margin_pct,
    breakeven_acos_pct, target_acos_pct
  },
  risk_flags: [string],                              # e.g., ["high_moq_capital_risk", "cogs_below_market_outlier"]
  recommendation: "PICK" | "HOLD" | "AVOID",
  rationale: string
}]
recommended_scenario_id: string                      # the top PICK
```

---

## Mode: CHANNEL (utility)

### Input
Shared Input Block + `shopify_plan: "basic" | "shopify" | "advanced"` (default: "basic", declare as assumption).

### Output — `ChannelComparisonRecord`
Defined in `channel-fee-models.md §4`. Fields: sku, sp_inr, cogs_inr, amazon: { total_deductions_inr, cpu_inr, cmr_pct, breakeven_roas, verdict }, shopify: {...same...}, better_channel, margin_delta_inr, note.

---

## Mode: BREAKEVEN (utility)

### Input
```
cpu_inr: number (required, from ACTUAL mode output)
fixed_costs_monthly_inr: number (optional — if absent, declare assumption and compute product-level only)
cpa_inr: number (optional — enables post-marketing break-even)
```

### Output — `BreakEvenRecord`
```
cpu_inr: number
fixed_costs_monthly_inr: number | null
break_even_units: int                                # fixed_costs / cpu (or 0 if fixed_costs absent)
break_even_revenue_inr: number                       # break_even_units × net_sp_inr
post_marketing: {
  post_mkt_cpu_inr: number | null,                   # cpu - cpa (null if cpa absent)
  post_mkt_break_even_units: int | null,
  cpa_inr: number | null
}
assumptions_declared: [string]                        # e.g., ["fixed_costs_monthly_inr absent — product-level break-even only"]
```

See `channel-fee-models.md §6` for the formulas.

---

## Execution Trace (shared across all modes)

Every output includes an `execution_trace` block for auditability:

```
execution_trace: {
  skill: "margin-calculator",
  version: "3.0.0",                                  # must match SKILL.md frontmatter (MC6 fix)
  fingerprint: "margin-calculator:{product_name}:{YYYY-MM-DD}",
  mode: "ESTIMATE" | "ACTUAL" | "COMPARISON" | "CHANNEL" | "BREAKEVEN",
  steps_executed: [string],
  systems_read: [string],                            # e.g., ["context.financial-constants", "context.gate-criteria"]
  systems_written: [],                               # ALWAYS empty — skill never writes to Slack/CRM directly (MC7 fix)
                                                     # Task does all writes via zoho-data-ops and slack-messaging
  context_paths_cited: [string],                      # named paths from fc.* and gc.*
  decision_summary: string,                           # e.g., "verdict=PASS, net_margin=18.3%, gate_1_margin_criteria_met=true"
  kpi_delta: [{id, value}],
  anomaly_flag: bool,
  status: "success" | "partial" | "error"
}
```

---

## CRM Field Mapping — MarginRecord / CostEstimate → Product_Launches

When the task persists margin output via `zoho-data-ops WRITE mode`, field mapping is direct-by-name with CRM naming:

- `net_sp_inr` → `Net_SP_INR`
- `cogs_inr` → `COGS_INR`
- `gross_margin_inr` / `gross_margin_pct` → `Gross_Margin_INR` / `Gross_Margin_Pct`
- `net_profit_inr` / `net_margin_pct` → `Net_Profit_INR` / `Net_Margin_Pct`
- `deductions.total_deductions_inr` → `Total_Deductions_INR`
- `deductions.referral_fee_inr` → `Referral_Fee_INR`
- `deductions.closing_fee_inr` → `Closing_Fee_INR`
- `deductions.weight_handling_inr` → `Weight_Handling_INR`
- `deductions.gst_on_fees_inr` → `GST_On_Fees_INR`
- `deductions.returns_cost_inr` → `Returns_Cost_INR`
- `paid_acquisition.breakeven_acos_pct` → `Breakeven_ACoS_Pct`
- `paid_acquisition.target_acos_pct` → `Target_ACoS_Pct`
- `ltv.ltv_inr` → `LTV_INR`
- `ltv.ltv_cac_ratio` → `LTV_CAC_Ratio`
- `gate_1_contribution.cbfa_inr` → `CBFA_INR`
- `gate_1_contribution.all_margin_criteria_met` → `Gate_1_Margin_OK`
- `verdict` → `MC_Verdict`
- `cogs_target_for_vendor_discovery` → `COGS_Target_INR`
- `zero_referral_fee_eligible` → `Zero_Referral_Fee_Eligible` (bool)
- For `CostEstimate` (D1 ESTIMATE), prefix fields with `Est_` and distinguish via `cogs_confidence` field on the record
- For `MarginRecord` (D2 ACTUAL), fields are direct (no prefix)

COMPARISON mode's `CostComparison` and `CostingScenarios` outputs are larger; they're typically stored as JSON blobs in a single `MC_Cost_Comparison_JSON` / `MC_Costing_Scenarios_JSON` field rather than split into individual CRM columns, because the scenario count varies.
