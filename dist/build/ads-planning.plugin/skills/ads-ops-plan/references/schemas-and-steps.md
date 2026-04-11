# ads-ops-plan — Schemas & Execution Steps

## Input Schema — TEST Mode

```json
{
  "product_name": "string (required)",
  "asin": "string",
  "selling_price_inr": "number",
  "category": "string",
  "breakeven_acos_pct": "number (required, from margin-calculator — never estimate)",
  "target_acos_pct": "number (from margin-calculator)",
  "phase": "plan_discovery | analyze_discovery | plan_validation | analyze_validation | daily_check",
  "search_term_report_csv": "string (for analyze_*, preferred over campaign_metrics)",
  "campaign_metrics": {
    "impressions": "int", "clicks": "int", "orders": "int",
    "spend_inr": "number", "revenue_inr": "number"
  },
  "selected_scenario_id": "string (if scenario was approved via SCENARIO mode, plan_* uses CRM-stored values over config defaults)",
  "day_n": "int (required for daily_check, 1-indexed)",
  "day_k": "int (required for daily_check, total days in phase)",
  "cumulative_metrics": "object (required for daily_check, running totals)",
  "yesterday_snapshot": "object (optional for daily_check, for delta calc)"
}
```

**Phase enum mapping:** `plan_discovery` and `analyze_discovery` both output `phase: "discovery"` in TestPlan (prefix stripped). Same for validation. `daily_check` stays as-is.

---

## Output Schema — TestPlan

```
plan_id: "AO-TP-<8 digits>" (required)
product_name: string (required)
phase: "discovery" | "validation" (required — plan_discovery/analyze_discovery → discovery; plan_validation/analyze_validation → validation)
campaign (required): {
  name: string
  type: "auto" | "manual_exact" | "manual_phrase"
  bid_strategy: "dynamic_down_only" | "dynamic_up_and_down" | "fixed"
  default_bid_inr: number
  budget_daily_inr: number
  duration_days: int
}
targeting: { keywords: [string], negative_keywords: [string] }
success_criteria (required): { scale_if: string, hold_if: string, kill_if: string }
requires_approval: true (const)
```

---

## Output Schema — TestResults

```
product_name: string (required)
phase: "discovery" | "validation" | "daily_check" (required)
period: { start: "date", end: "date" }
summary (required): {
  total_spend_inr, total_revenue_inr, blended_acos_pct, blended_roas,
  total_impressions, total_clicks, total_orders, ctr_pct, cvr_pct, avg_cpc_inr
}
by_keyword: [{
  keyword, impressions, clicks, orders, spend_inr, revenue_inr,
  acos_pct, cvr_pct, cpc_inr,
  action: "promote_to_exact" | "bid_up" | "hold" | "bid_down" | "negate",
  bucket: "winner" | "learner" | "loser" | "no_data"
}]
data_quality: "HIGH" | "MEDIUM" | "LOW" (required)
extend_recommended: boolean
viable_keyword_count: int
recommendation: (required)
  phase-end: "PROCEED_TO_VALIDATION" | "EXTEND_DISCOVERY" | "READY_FOR_COMPARISON" | "EXTEND_VALIDATION" | "INSUFFICIENT_DATA"
  mid-test (daily_check only): "MID_TEST_ON_TRACK" | "MID_TEST_ANOMALY"
harvested_keywords: [string] (Phase 1 winners promoted to manual)
negative_keywords: [string] (negated in auto)
gate_2_readiness: {  # populated for analyze_validation always, daily_check from day_n >= ceil(day_k/2)
  keyword_margin_positive_count: int, keyword_margin_threshold_met: bool,
  blended_acos_pct: num, breakeven_acos_pct: num, blended_acos_threshold_met: bool,
  data_quality: "HIGH|MEDIUM|LOW", data_quality_threshold_met: bool,
  all_full_criteria_met: bool,
  path_a_orders: int, path_a_cvr_pct: num, path_a_met: bool,
  path_b_impressions: int, path_b_ctr_pct: num, path_b_met: bool,
  either_path_met: bool,
  gate_2_recommendation: "READY" | "NOT_READY" | "BORDERLINE"
}
anomalies: [Anomaly]  # see ANOMALY section
```

`gate_2_readiness` rules:
- `keyword_margin_threshold_met`: `keyword_margin_positive_count >= full_criteria.keyword_margin_min_positive` (3)
- `blended_acos_threshold_met`: `blended_acos_pct <= breakeven_acos_pct`
- `data_quality_threshold_met`: `data_quality in [HIGH, MEDIUM]`
- `all_full_criteria_met`: AND of the three above (compliance is checked by test-campaign task, not the skill)
- `path_a_met`: `path_a_orders >= 10 AND path_a_cvr_pct >= 5`
- `path_b_met`: `path_b_impressions >= 500 AND path_b_ctr_pct >= 0.3`
- `either_path_met`: OR of path_a_met, path_b_met
- `gate_2_recommendation`: `READY` if `all_full_criteria_met AND either_path_met`. `BORDERLINE` if any threshold is within 10% of pass. Else `NOT_READY`.

---

## Execution Steps — TEST Mode

### `plan_discovery` / `plan_validation`

1. If `selected_scenario_id` provided → read linked Campaigns + Amazon_Ad_Campaigns CRM records, use those values (precedence over config defaults — scenario was already approved).
2. Else → load `ppc-test-campaign-config.ctx.json#phases.phase_1_discovery` (or `phase_2_validation`).
3. Build TestPlan: campaign name from `amazon_campaign_naming` pattern, targeting, success_criteria from `gate-criteria.ctx.json#gate_2`.
4. Always set `requires_approval: true`.

### `analyze_discovery` / `analyze_validation`

1. Parse Search Term Report CSV (preferred) or campaign_metrics summary.
2. Compute per-keyword metrics per `ads-metrics.md §1`; classify (4-bucket) per §6 using **cumulative** metrics.
3. Rate data_quality against `ppc-test-campaign-config.ctx.json#data_quality_thresholds`.
4. Populate `gate_2_readiness` — evaluate each full_criterion from `gate-criteria.ctx.json#gate_2` and each Path A/B criterion. Set `gate_2_recommendation` to READY / NOT_READY / BORDERLINE (BORDERLINE when thresholds are within 10% of pass).
5. Choose recommendation:
   - `analyze_discovery`: `PROCEED_TO_VALIDATION` if data_quality in [HIGH, MEDIUM] AND ≥3 viable keywords; `EXTEND_DISCOVERY` if LOW; `INSUFFICIENT_DATA` if < ceil(duration×0.5) elapsed.
   - `analyze_validation`: `READY_FOR_COMPARISON` if gate_2_recommendation=READY; `EXTEND_VALIDATION` if BORDERLINE or fixably NOT_READY; `INSUFFICIENT_DATA` otherwise.
6. Output TestResults with harvested_keywords, negative_keywords, gate_2_readiness, recommendation.

### `daily_check`

Invoked by `daily-ads-analysis` task during an in-progress test. Mid-test snapshot, **never** a phase-end recommendation.

1. Require `day_n`, `day_k`, `cumulative_metrics`. Optional `yesterday_snapshot`.
2. Classify keywords using **cumulative** metrics (a keyword with 0 orders today but 5 cumulative is a winner, not a loser).
3. Rate data_quality from cumulative.
4. Populate `gate_2_readiness` only if `day_n >= ceil(day_k / 2)` — below the halfway mark, too early for Gate 2 visibility.
5. Invoke ANOMALY detection (below) on today's delta + cumulative + budget → populate `anomalies[]`.
6. Set `recommendation = MID_TEST_ANOMALY` if anomalies non-empty, else `MID_TEST_ON_TRACK`. Never emit phase-end enum values from daily_check.

**Fallback: campaign-level cumulative without per-keyword data.** If `cumulative_metrics` is provided at campaign-total granularity only (no per-keyword breakdown — e.g., the task pulled aggregate counters from `Campaigns` CRM record rather than a Search Term Report), follow this fallback instead of failing:

- Leave `by_keyword` as an empty array. Do NOT fabricate per-keyword estimates by dividing totals.
- Drop `data_quality` one tier: a rating that would have been HIGH on per-keyword data becomes MEDIUM; MEDIUM becomes LOW; LOW stays LOW. This reflects the reduced confidence from missing keyword-level detail.
- Anomaly detection still runs on the campaign totals (spend_spike, budget_overpacing, acos_jump, ctr_drop, zero_orders all work on aggregate metrics).
- Gate_2_readiness still populates per the day_n rule, but note in `forecast_notes` or a top-level note that `keyword_margin_positive_count` is an aggregate estimate, not a per-keyword count — the task should request a Search Term Report export before the phase-end `analyze_validation` run.

This fallback is intentional: `daily-ads-analysis` reads from CRM (cumulative counters updated by the task), not from a fresh STR every day. Requiring per-keyword data daily would make the task unworkable.

---

## ANOMALY Sub-Mode

Invoked inline from `daily_check` or standalone by the `daily-ads-analysis` task. Detects 5 anomaly types using thresholds from `tuning-constants.md §5`.

### Anomaly schema

```json
{
  "anomaly_type": "spend_spike | acos_jump | ctr_drop | zero_orders | budget_overpacing",
  "severity": "info | warning | critical",
  "metric_value": number,
  "threshold": number,
  "context": "human-readable, e.g., 'daily spend ₹850 vs daily budget ₹500'",
  "campaign_name": "...",
  "recommended_action": "what the operator should consider"
}
```

### Detection rules (all thresholds from `tuning-constants.md §5`)

| Anomaly | Rule | Severity |
|---|---|---|
| `spend_spike` | `daily_spend > daily_budget × spend_spike_pct_of_daily_budget / 100` | warning |
| `acos_jump` | `daily_acos_pct > breakeven_acos_pct + acos_jump_pp_above_breakeven` | warning |
| `ctr_drop` | `daily_ctr_pct < cumulative_ctr_pct × ctr_drop_pct_of_cumulative / 100` | info |
| `zero_orders` | `daily_clicks > zero_orders_min_clicks AND daily_orders = 0` | warning |
| `budget_overpacing` | `cumulative_spend / total_budget > elapsed_days / total_duration + budget_overpacing_delta` | warning |

### Standalone invocation input

```json
{
  "mode": "ANOMALY",
  "campaign_name": "...",
  "total_budget_inr": number,
  "total_duration_days": number,
  "elapsed_days": number,
  "daily_metrics": { "impressions", "clicks", "orders", "spend_inr", "revenue_inr" },
  "cumulative_metrics": { ... },
  "daily_budget_inr": number,
  "breakeven_acos_pct": number
}
```

Output: `Anomaly[]` (possibly empty).

---

## Input Schema — SCENARIO Mode

```
listing_record (required, from product-discover LISTING_PARSE): {
  asin, title, bullets: [string], price_inr, brand, category,
  bsr: num|null, rating: num|null, review_count: num|null,
  implicit_keywords: [string], competitor_asins: [string],
  review_themes: { positive: [string], negative: [string] },
  data_completeness_pct: num
}
keyword_sets (from ikraft-keyword-intelligence IMPORT/GENERATE): [{
  keyword, demand_estimate: num|null, competition_estimate: num|null,
  intent_class: "brand"|"competitor"|"generic"|"long_tail",
  h10_score: num|null, organic_rank: num|null, sponsored_rank: num|null
}]
budget_constraints (required): {
  total_budget_inr (required), daily_budget_max_inr, duration_max_days
}
breakeven_acos_pct: number (required)
target_acos_pct: number
```

---

## Output Schema — CampaignPlan (SCENARIO mode)

Keywords and negative_keywords nest **inside** each ad_group — real Amazon Ads structure has keywords owned by specific ad groups. Multi-ad-group scenarios (e.g., Aggressive with exact + broad) model each group separately.

```
campaign_name: string (required)
start_date, end_date: "date"
country: "IN" | "US"
daily_budget_inr: number (required)
bidding_strategy: "dynamic_up_and_down" | "dynamic_down_only" | "fixed" (required)
bid_adjustments: { top_of_search_pct, product_pages_pct, rest_of_search_pct }
ad_groups (required): [{
  ad_group_name: string
  products: [string]  # ASINs
  targeting_type: "auto" | "manual_exact" | "manual_phrase" | "manual_broad"
  default_bid_inr: number
  keywords: [{ keyword, match_type: "exact"|"phrase"|"broad", bid_inr: num|null }]
  negative_keywords: [{ keyword, match_type: "negative_exact"|"negative_phrase" }]
}]
excluded_asins: [string]
forecast (required): {  # Every value must trace to references/forecast-model.md
  estimated_impressions: int, estimated_clicks: int,
  estimated_orders_low: int, estimated_orders_high: int,
  estimated_total_spend_inr: num,
  estimated_acos_low_pct: num|null, estimated_acos_high_pct: num|null,
  forecast_confidence: "HIGH" | "MEDIUM" | "LOW" (required),
  computed_via: "references/forecast-model.md v1.0" (required const),
  forecast_notes: string  # e.g., "first-campaign auto drag likely"
}
risk_assessment: {
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  data_quality_potential: "HIGH" | "MEDIUM" | "LOW"
  budget_efficiency_rating: "HIGH" | "MEDIUM" | "LOW"
}
```

---

## Output Schema — CampaignScenario (wrapper)

```
scenario_id: "AO-SC-<8 digits>-<2 digits>" (required)
scenario_type: "conservative" | "balanced" | "aggressive" | "keyword_focused" | "custom" (required)
label: string        # human-readable scenario name
goal: string         # primary objective of this scenario
campaigns: [CampaignPlan] (required)   # 1+ campaigns in this scenario
total_budget_inr: number (required)
total_duration_days: int
rank: int            # 1 = recommended
recommendation_reason: string
```

---

## Execution Steps — SCENARIO Mode

1. **Load config** — read `ppc-test-campaign-config.ctx.json` for scenario templates, bid defaults, naming conventions
2. **Load field reference** — read `amazon-ads-campaign-fields.ctx.json` for Amazon Ads field alignment
3. **Load tunables** — read `tuning-constants.md §6` for ranking weights and competition adjustments, and `references/forecast-model.md` for the forecast formulas
4. **Validate inputs** — ListingRecord must have ASIN + title; budget_constraints must have total_budget_inr; breakeven_acos_pct required
5. **Generate scenarios** — for each scenario type (conservative, balanced, aggressive, keyword_focused):
   - Apply template defaults from config
   - Build CampaignPlan(s) with Amazon Ads-compliant fields. **Keywords nest inside ad_groups[]** (each ad group has its own keyword list) — see CampaignPlan schema.
   - Compute the `forecast` block per `references/forecast-model.md` (every forecast number must be traceable via `forecast.computed_via`)
   - Assess risk based on budget exposure (total_budget_inr / breakeven_acos), data quality potential (keyword count × expected impressions), and scenario type default risk
6. **Rank scenarios** — apply the explicit formula from `tuning-constants.md §6`:
   ```
   score = 0.4 × budget_efficiency_score
         + 0.3 × data_quality_potential_score
         + 0.2 × risk_inverse_score
         + 0.1 × keyword_coverage_score

   then apply competition adjustment per §6 if avg competition_estimate is above/below percentile thresholds
   then apply tiebreaker: if two scenarios are within 0.05 score, prefer lower total_budget_inr
   ```
   Cite the scores in each scenario's `recommendation_reason`, e.g., "Balanced ranked #1 (score 0.72) — high data quality potential (0.9) at moderate risk (0.6); penalized slightly by competition adjustment for 'handcrafted wooden' category."
7. **Output CampaignScenario[]** — sorted by rank; rank 1 is the recommended pick; include comparison table summary showing for each scenario: total_budget_inr, duration, forecast ACoS range, forecast confidence, risk level, score, rank
8. **Await selection** — user picks a scenario; saved to CRM via zoho-data-ops per the CRM Field Mapping below

---

## CRM Field Mapping — CampaignPlan → Amazon_Ad_Campaigns

When a scenario is selected, zoho-data-ops WRITE mode persists each CampaignPlan (one per ad group) as an Amazon_Ad_Campaigns record. Field mapping is **direct by name** with CamelCase transformation unless noted:

- Direct (PascalCase + _INR/_Pct suffixes preserved): `campaign_name`→`Campaign_Name`, `country`, `daily_budget_inr`, `start_date`, `end_date`, `ad_groups[i].ad_group_name`→`Ad_Group_Name`, `default_bid_inr`, `targeting_type`, `keywords` (serialized JSON), `negative_keywords` (serialized JSON), `excluded_asins` (serialized JSON)
- `bid_adjustments.{placement}_pct`→`{Placement}_Adjustment_Pct` (top_of_search, product_pages, rest_of_search)
- `bidding_strategy`: enum mapping (`dynamic_up_and_down`→"Dynamic - Up and Down", `dynamic_down_only`→"Dynamic - Down Only", `fixed`→"Fixed Bids")
- `forecast.*`: `Forecast_Impressions`, `Forecast_Clicks`, `Forecast_Orders_Min/Max`, `Forecast_Spend_INR`, `Forecast_ACoS_Min/Max_Pct` (nullable), `Forecast_Confidence`
- Parent lookups: `Campaign_Strategy` → parent Campaigns record; `Product_Launch` → Product_Launches record
- Fixed on create: `Status = "Draft"` (operator manually advances to "Approved")

**Multi-ad-group scenarios:** If `ad_groups[]` length > 1, create N Amazon_Ad_Campaigns records — one per ad group, sharing the same Campaign_Strategy parent. Naming: `<CampaignPlan.campaign_name>_<ad_group.ad_group_name>` (keep short, e.g., `Test_WoodenPenHolder_SP_Manual_Exact_v1_AG1`).
