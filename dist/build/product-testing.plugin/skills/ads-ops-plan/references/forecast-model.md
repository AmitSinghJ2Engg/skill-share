# ads-ops — SCENARIO Mode Forecast Model v1.0

**Purpose:** Explicit, traceable formulas for the `forecast` block in `CampaignPlan` output. Every forecast number must trace back to these formulas so the operator can verify the math.

**Why this file exists:** SCENARIO mode produces forecasts that the operator uses to commit real budget. Without traceable methodology, the forecast is just a guess and violates ads-ops Rule 4 ("Show the math"). Per Amit's Q1 answer, we use **generic Amazon India SP baselines** (not Ismokraft historical data — we don't have enough yet).

**Calibration source:** Baselines live in `tuning-constants.md §7`. Revisit once 5+ completed Ismokraft test campaigns provide category-specific signal.

---

## Step 1 — Per-keyword position share

**Intuition:** A keyword's position share is the fraction of searches where your ad appears. It's driven by bid competitiveness.

```
if sponsored_rank (Helium10) is available:
    position_share = 1 / max(1, sponsored_rank)    # e.g., rank 3 → 0.33
elif competition_estimate is available:
    position_share = default_position_share × bid_multiplier
    bid_multiplier = lookup_by_bid_percentile(bid, category_bid_range)
else:
    position_share = default_position_share         # fallback: 0.15
```

`bid_multiplier` uses the percentile lookup from `tuning-constants.md §7`:
- top 25% of category bids → `position_share_high_bid_multiplier` (2.5)
- middle 50% → 1.0
- bottom 25% → `position_share_low_bid_multiplier` (0.4)

Cap `position_share` at 1.0.

---

## Step 2 — Per-keyword estimated impressions

```
if demand_estimate (search volume) is available:
    estimated_impressions_keyword = demand_estimate × position_share × (duration_days / 30)
else:
    estimated_impressions_keyword = 0    # cannot forecast without demand signal
    flag keyword as "no_forecast" in forecast_notes
```

The `× duration_days / 30` normalizes monthly search volume to the campaign period (Helium10 reports monthly volume by default).

---

## Step 3 — Aggregate campaign-level impressions

```
estimated_impressions = Σ(estimated_impressions_keyword) over all targeted keywords in the CampaignPlan
```

For auto campaigns (no explicit keywords), fall back to:
```
estimated_impressions = (daily_budget_inr / expected_cpc) × expected_ctr × duration_days / expected_ctr
                     = (daily_budget_inr / expected_cpc) × duration_days
```
where `expected_cpc ≈ default_bid_inr × 0.7` (the skill's bid is a ceiling; actual CPC runs lower).

---

## Step 4 — Estimated clicks

```
estimated_clicks = estimated_impressions × (default_ctr_pct / 100)
```

`default_ctr_pct` = 0.5 from `tuning-constants.md §7`. When the input `ListingRecord` has rating and review_count, apply a quality multiplier:
```
if rating >= 4.0 AND review_count >= 20:
    quality_multiplier = 1.3     # well-reviewed listings convert better on clicks
elif rating >= 3.5:
    quality_multiplier = 1.0
else:
    quality_multiplier = 0.7

estimated_clicks × = quality_multiplier
```

Clamp `estimated_clicks` to at most `estimated_impressions` (can't click more than you see).

---

## Step 5 — Estimated orders (low/high range)

```
estimated_orders_low = estimated_clicks × (default_cvr_p25_pct / 100)
estimated_orders_high = estimated_clicks × (default_cvr_p75_pct / 100)
```

`default_cvr_p25_pct = 2.0`, `default_cvr_p75_pct = 8.0` from `tuning-constants.md §7`.

Round to the nearest integer. Floor at 0.

---

## Step 6 — Estimated total spend

```
estimated_total_spend_inr = estimated_clicks × expected_cpc
expected_cpc = default_bid_inr × 0.7
```

The 0.7 factor reflects that Amazon's second-price auction typically charges below the bid ceiling. If `bid_strategy == "dynamic_up_and_down"`, use 0.85 instead (bids can escalate); if `dynamic_down_only`, use 0.6.

Cap `estimated_total_spend_inr` at `daily_budget_inr × duration_days` (you can't spend more than the budget allows).

---

## Step 7 — Estimated ACoS range

```
if estimated_orders_low == 0:
    estimated_acos_high_pct = null       # cannot compute — no sales denominator
else:
    estimated_acos_high_pct = (estimated_total_spend_inr / (estimated_orders_low × selling_price_inr)) × 100

if estimated_orders_high == 0:
    estimated_acos_low_pct = null
else:
    estimated_acos_low_pct = (estimated_total_spend_inr / (estimated_orders_high × selling_price_inr)) × 100
```

Note the swap: **low orders → high ACoS** (fewer sales over the same spend), **high orders → low ACoS**. The range represents pessimistic vs optimistic outcome bands.

Round percentages to 1 decimal place. Cap at 9999.9 (loss-making absurdity).

---

## Step 8 — Confidence tier

Attach a confidence label based on how much of the input had real signal:

```
inputs_with_demand = count(keywords where demand_estimate is not null)
total_inputs = count(keywords)
demand_coverage = inputs_with_demand / total_inputs

if demand_coverage >= 0.75 AND ListingRecord has rating AND review_count:
    forecast_confidence = "HIGH"
elif demand_coverage >= 0.5:
    forecast_confidence = "MEDIUM"
else:
    forecast_confidence = "LOW"
```

Add `forecast_confidence` to the output (outside the numeric `forecast` block).

---

## Output contract

Every CampaignPlan output's `forecast` block must include a `computed_via` field citing this file:

```json
"forecast": {
  "estimated_impressions": 4500,
  "estimated_clicks": 23,
  "estimated_orders_low": 0,
  "estimated_orders_high": 2,
  "estimated_total_spend_inr": 161,
  "estimated_acos_low_pct": 16.1,
  "estimated_acos_high_pct": null,
  "forecast_confidence": "LOW",
  "computed_via": "references/forecast-model.md v1.0"
}
```

**Never** produce forecast numbers without this citation. If the formulas don't apply (e.g., totally zero input signal), return the block with all nulls and `forecast_confidence: "LOW"` — don't fabricate.

---

## §9 Known limitations of v1.0

1. **No irrelevant-traffic drag.** Auto campaigns spray; first 5-7 days typically run above forecast ACoS. Add to `forecast_notes` when producing forecasts for Conservative/Balanced auto-heavy scenarios.
2. **No category-specific CVR.** All categories use 2-8% baseline range.
3. **No seasonality.** Diwali, Raksha Bandhan, etc. shift demand dramatically.
4. **Crude position_share.** Percentile lookup rather than Amazon Sponsored Rank distribution.
5. **CTR quality multiplier is heuristic.** Non-linear relationship with rating/reviews ignored.

Acceptable for v1.0 — forecast is directional (pick between scenarios), not prescriptive (commit to a number). v2.0 begins when 5+ completed Ismokraft test campaigns provide calibration data via ISM_ExecutionLogs.