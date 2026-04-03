# Evaluation Engine
# okr-kpi-governance — references/evaluation-engine.md
# Read when: executing evaluate_kpi_performance or generate_kpi_recommendation

---

## S1 — Evaluation Algorithm

### Step 1: Resolve KPI definition
Load KPI record from `okr-registry.md` using `kpi_id`.
Extract: `target_value`, `benchmark_range`, `unit`, `forecast_value`, `display_name`, `linked_objective`.

### Step 2: Compute gap
```
gap_value = actual_value - target_value
gap_pct   = (gap_value / target_value) x 100
```

### Step 3: Determine performance_status

```
For KPIs where HIGHER is better (revenue, conversion_rate, ROAS, margin, rank):
  if actual_value >= target_value x 1.05    -> above_target
  if actual_value >= target_value x 0.95    -> on_track
  if actual_value < target_value x 0.95     -> below_target

For KPIs where LOWER is better (ACoS, return_rate, stockout_rate, TACoS, CPC):
  if actual_value <= target_value x 0.95    -> above_target
  if actual_value <= target_value x 1.05    -> on_track
  if actual_value > target_value x 1.05     -> below_target
```

**Direction flag per KPI category:**

| Category | Direction |
|---|---|
| revenue, aov, conversion_rate, roas, meta_roas, margin_pct, ltv, rank, ctr, repeat_rate | higher_is_better |
| acos, tacos, return_rate, stockout_rate, cac, cpc, fulfilment_time | lower_is_better |

If a KPI is not in either list, default to `higher_is_better` and flag for review.

### Step 4: Determine trend_direction

Requires `prior_period_actual`. If null -> `insufficient_data`.

```
For higher_is_better KPIs:
  delta = actual_value - prior_period_actual
  if delta > prior_period_actual x 0.03      -> improving
  if delta < prior_period_actual x -0.03     -> declining
  else                                        -> stable

For lower_is_better KPIs:
  delta = actual_value - prior_period_actual
  if delta < prior_period_actual x -0.03     -> improving  (going lower = good)
  if delta > prior_period_actual x 0.03      -> declining
  else                                        -> stable

trend_magnitude = abs(delta / prior_period_actual x 100)  # % change
```

### Step 5: Benchmark range check
```
if actual_value >= benchmark_range.min AND actual_value <= benchmark_range.max:
  within_benchmark = true
else:
  within_benchmark = false
```

### Step 6: Generate recommendation
Call S3 Recommendation Matrix using `performance_status` + `trend_direction` + `kpi_name`.

### Step 7: Assemble EvaluationResult
Output fields: `kpi_id`, `kpi_name`, `display_name`, `period`, `actual_value`, `target_value`, `benchmark_range`, `forecast_value`, `performance_status`, `gap_value`, `gap_pct`, `within_benchmark`, `trend_direction`, `trend_magnitude`, `recommendation`, `recommendation_actions[]`, `recommendation_priority`, `linked_objective`, `unit`.

---

## S2 — Performance Status Decision Table

| KPI type | Actual vs Target | Status |
|---|---|---|
| higher_is_better | >= 105% of target | above_target |
| higher_is_better | 95% - 105% of target | on_track |
| higher_is_better | < 95% of target | below_target |
| lower_is_better | <= 95% of target | above_target |
| lower_is_better | 95% - 105% of target | on_track |
| lower_is_better | > 105% of target | below_target |

**Status + Trend priority matrix:**

| Status | Trend | Priority |
|---|---|---|
| below_target | declining | high |
| below_target | stable | high |
| below_target | improving | medium |
| on_track | declining | medium |
| on_track | stable | low |
| on_track | improving | low |
| above_target | declining | medium |
| above_target | stable | low |
| above_target | improving | low |

---

## S3 — Recommendation Matrix

### Ecommerce / Conversion

| kpi_name | status | recommendation | actions |
|---|---|---|---|
| conversion_rate | below_target | Diagnose listing quality first. | Audit listings for A+ gaps, Check price vs BSR competitors, Run search term report, Test main image |
| conversion_rate | on_track + declining | Intervene before it drops below target. | Review recent listing changes, Check competitor pricing, A/B test hero image |
| conversion_rate | above_target | Protect with consistent listing quality. | Document what's working, Maintain review velocity |

### Amazon Ads

| kpi_name | status | recommendation | actions |
|---|---|---|---|
| amazon_acos | below_target (too high) | Ad spend inefficiency. | Pause low-performing keywords, Increase bids on exact-match converters, Add negative keywords, Review campaign structure |
| amazon_acos | above_target | Well controlled. Evaluate growth spend. | Identify top keywords with budget headroom, Test broad match on proven ASINs |
| amazon_roas | below_target + declining | Revenue per ad rupee falling. | Reallocate to top-ROAS campaigns, Reduce awareness spend, Improve product page |
| amazon_tacos | below_target | Ad spend large relative to total revenue. | Scale organic rank, Increase organic keywords via external traffic, Review ad type mix |

### Revenue / Financial

| kpi_name | status | recommendation | actions |
|---|---|---|---|
| revenue_monthly | below_target + declining | Fix acquisition and conversion. | Protect top SKU ranking, Audit pricing, Increase proven ad budget, Add SKU variants |
| revenue_monthly | below_target + improving | Sustain momentum. | Double down on recovering channel, Ensure inventory supports growth |
| gross_margin_pct | below_target | Review cost structure. | Renegotiate COGS, Audit Amazon fee category, Review packaging weight, Test 5-8% price increase |
| cac | below_target (too high) | CAC too high relative to LTV. | Improve ROAS, Test organic growth, Improve checkout conversion |

### Operations

| kpi_name | status | recommendation | actions |
|---|---|---|---|
| inventory_turnover | below_target | Capital tied up. | Promote slow-moving SKUs, Reduce next PO, Review pricing |
| stockout_rate | below_target (too high) | Losing revenue and rank. | Build 60-day safety stock, Set reorder alerts, Review lead times |
| vendor_on_time_rate | below_target | Vendor reliability poor. | Escalate via Bigin task, Identify backup supplier, Add delivery penalty clause |

### Generic fallback

```
if below_target:
  recommendation = "{display_name} is below target by {gap_pct}%. Investigate root cause."
  actions = ["Review source data accuracy", "Compare with prior 3 periods", "Check external factors"]

if on_track:
  recommendation = "{display_name} is on track. Monitor for drift."
  actions = ["Continue current approach", "Review at next cycle"]

if above_target:
  recommendation = "{display_name} exceeds target by {gap_pct}%. Consider raising target."
  actions = ["Update forecast upward", "Evaluate raising target for next quarter"]
```

---

## S4 — Batch Evaluation Protocol

When evaluating all KPIs in a single call:

1. Iterate all KPIs in `okr-registry.md` with `status: active`
2. Require `actual_values` dict keyed by `kpi_id`
3. Run `evaluate_kpi_performance` for each KPI
4. Group results by `linked_objective`
5. Compute objective-level health score:
   ```
   objective_score = (
     (count(above_target) x 1.0) +
     (count(on_track) x 0.5) +
     (count(below_target) x 0.0)
   ) / total_kpis x 100
   ```
6. Return batch output with: `evaluation_date`, `period`, `objectives[]` (each with `objective_id`, `objective_name`, `objective_score`, `kpi_evaluations[]`), `summary` (total counts + top 3 high_priority_recommendations)
