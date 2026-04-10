# ads-ops — Tuning Constants

All tunable thresholds, multipliers, and weights used by ads-ops live here. The skill references these by name rather than hardcoding the values in logic, so they can be tuned without editing skill prose.

**Why not in `context/product-pipeline/`?** These values are consumed only by ads-ops, not shared across skills. Context budget is at ceiling (DL-018 note: 49,992 / 50,000 bytes used). Per DL-005 spirit, skill-local tuning knobs legitimately live in the skill's own references. If any of these values later need to be shared (e.g., margin-calculator starts reading bid thresholds), promote them to `context/` at that point.

**Versioning:** Any material change to these values is a breaking change to eval benchmarks — bump the skill version and note the change in git history.

---

## §1. Health Thresholds

Used by §2 of `ads-metrics.md` (campaign/keyword health classification).

| Name | Value | Meaning |
|---|---|---|
| `above_target_multiplier` | 1.5 | ACoS multiplier above which a keyword/campaign flips from `above_target` → `loss_making`. i.e., loss_making when `acos > breakeven_acos × 1.5` |
| `loss_making_min_spend_inr` | 500 | Minimum spend (₹) before a zero-order keyword can be classified `loss_making`. Below this, it's `no_data` regardless of orders |

---

## §2. Keyword Action Thresholds

Used by §6 of `ads-metrics.md` (keyword-level bid actions).

| Name | Value | Meaning |
|---|---|---|
| `negate_min_spend_inr` | 100 | Zero-order keywords with spend > this get negated (auto/broad) or bid_down (exact) |
| `promote_min_orders` | 5 | Orders threshold in auto campaign to graduate a keyword to manual exact match |
| `negate_acos_multiplier` | 2.0 | ACoS multiplier above which underperforming keywords get negated. i.e., negate when `acos > breakeven × 2.0` |
| `negate_max_orders` | 3 | Maximum order count for the negate rule to apply (above this, the volume justifies keeping it) |
| `min_bid_inr` | 2 | Floor for bid-down recommendations — never recommend bids below this |

---

## §3. Bid Adjustment Magnitudes

Used by §6 of `ads-metrics.md` and SCENARIO mode keyword bid recommendations.

| Name | Value | Meaning |
|---|---|---|
| `bid_up_pct` | 20 | Percentage increase when action is `bid_up`. New bid = current × 1.20 |
| `bid_down_pct` | 15 | Percentage decrease when action is `bid_down`. New bid = current × 0.85 |
| `promote_bid_multiplier` | 1.1 | Multiplier applied to the auto campaign's bid when promoting a winner to manual exact. New manual bid = auto bid × 1.10 |

---

## §4. Overall Health Verdict Thresholds

Used by §7 of `ads-metrics.md` (campaign-level verdict rules).

| Name | Value | Meaning |
|---|---|---|
| `healthy_wasted_pct_max` | 10 | `healthy` verdict requires wasted_spend < this % of total_spend |
| `needs_optimisation_wasted_pct_max` | 25 | `needs_optimisation` verdict fires when wasted_spend is between `healthy_wasted_pct_max` and this |
| `critical_loss_making_min_spend_inr` | 2000 | Any single loss_making campaign with spend above this forces the overall verdict to `critical` |
| `insufficient_data_min_spend_inr` | 500 | Below this total spend, verdict is `insufficient_data` regardless of other signals |
| `insufficient_data_min_days` | 5 | Below this period length, verdict is `insufficient_data` regardless of other signals |

---

## §5. Anomaly Detection Thresholds (ANOMALY sub-mode)

Used by the ANOMALY sub-mode of TEST and LIVE modes (invoked daily by `daily-ads-analysis` task).

| Name | Value | Meaning |
|---|---|---|
| `spend_spike_pct_of_daily_budget` | 150 | Daily spend above this % of the campaign's daily budget flags a spend spike anomaly |
| `acos_jump_pp_above_breakeven` | 20 | Daily ACoS above (breakeven_acos + this many percentage points) flags an ACoS jump |
| `ctr_drop_pct_of_cumulative` | 50 | Daily CTR below this % of the cumulative CTR flags a CTR drop |
| `zero_orders_min_clicks` | 20 | If daily clicks exceed this but orders = 0, flag zero-orders anomaly |
| `budget_overpacing_delta` | 0.20 | If `(cumulative_spend / total_budget) > (elapsed_days / total_duration) + this`, flag overpacing |

---

## §6. SCENARIO Ranking Weights

Used by SCENARIO mode Execution Step 5 (scenario ranking formula).

| Name | Value | Meaning |
|---|---|---|
| `weight_budget_efficiency` | 0.4 | Weight on budget efficiency score (expected keywords with data per ₹1000) |
| `weight_data_quality_potential` | 0.3 | Weight on expected data quality rating (HIGH=1.0, MEDIUM=0.6, LOW=0.2) |
| `weight_risk_inverse` | 0.2 | Weight on inverse risk score (LOW=1.0, MEDIUM=0.6, HIGH=0.2) |
| `weight_keyword_coverage` | 0.1 | Weight on unique keywords targeted as a fraction of total input keywords |
| `competition_high_percentile` | 70 | Above this percentile (of avg competition_estimate across input keywords), penalize Aggressive by `competition_penalty_pct` and boost Conservative by `competition_boost_pct` |
| `competition_low_percentile` | 30 | Below this percentile, apply the inverse adjustment |
| `competition_penalty_pct` | 30 | Score penalty on Aggressive in high-competition markets (or Conservative in low-competition) |
| `competition_boost_pct` | 20 | Score boost on Conservative in high-competition markets (or Aggressive in low-competition) |

**Tiebreaker:** When two scenarios score within 0.05 of each other, prefer the lower `total_budget_inr` (cheaper test wins).

**Formula:**
```
score = (weight_budget_efficiency × budget_efficiency_score)
      + (weight_data_quality_potential × data_quality_potential_score)
      + (weight_risk_inverse × risk_inverse_score)
      + (weight_keyword_coverage × keyword_coverage_score)

budget_efficiency_score = (expected_keywords_with_data / total_budget_inr) × 1000
data_quality_potential_score = {HIGH: 1.0, MEDIUM: 0.6, LOW: 0.2}[risk_assessment.data_quality_potential]
risk_inverse_score = {LOW: 1.0, MEDIUM: 0.6, HIGH: 0.2}[risk_assessment.risk_level]
keyword_coverage_score = unique_keywords_targeted / total_input_keywords
```

After computing the raw score, apply competition adjustment:
```
if avg_competition_estimate > competition_high_percentile:
    aggressive_score *= (1 - competition_penalty_pct/100)
    conservative_score *= (1 + competition_boost_pct/100)
elif avg_competition_estimate < competition_low_percentile:
    conservative_score *= (1 - competition_penalty_pct/100)
    aggressive_score *= (1 + competition_boost_pct/100)
```

---

## §7. Forecast Baselines (Amazon India SP)

Used by `references/forecast-model.md` (SCENARIO mode forecast computation).

These are **generic Amazon India Sponsored Products baselines** per Amit's Q1 answer — we don't have Ismokraft historical data to calibrate against, so the forecast uses category-agnostic defaults until real data is available.

| Name | Value | Meaning |
|---|---|---|
| `default_ctr_pct` | 0.5 | Baseline CTR for Amazon India SP campaigns when no category or keyword data is available |
| `default_cvr_p25_pct` | 2.0 | 25th-percentile conversion rate baseline — used for `estimated_orders_low` |
| `default_cvr_p75_pct` | 8.0 | 75th-percentile conversion rate baseline — used for `estimated_orders_high` |
| `default_position_share` | 0.15 | Baseline share of potential impressions a keyword captures when bid and competition data are absent |
| `position_share_high_bid_multiplier` | 2.5 | Multiplier on `default_position_share` when bid is in the top 25% of category bids |
| `position_share_low_bid_multiplier` | 0.4 | Multiplier on `default_position_share` when bid is in the bottom 25% of category bids |

**When to revisit:** Once Ismokraft has 5+ completed test campaigns with known search volume / actual impressions / actual CVR, replace these baselines with category-specific values derived from `ISM_ExecutionLogs`.