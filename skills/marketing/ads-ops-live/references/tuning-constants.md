# ads-ops-live — Tuning Constants

All tunable thresholds and magnitudes used by ads-ops-live live here. The skill references these by name rather than hardcoding, so they can be tuned without editing skill prose.

**Shared with `ads-ops-plan`:** §1-§4 are identical across the two skills. Changes should be applied to both. Sections §5-§7 (anomaly, ranking, forecast) are D2.5-only and live only in ads-ops-plan.

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

Used by §6 of `ads-metrics.md` and LIVE mode bid recommendations.

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

## §5. Budget Scaling Guardrails

Used by LIVE mode budget scaling recommendations.

| Name | Value | Meaning |
|---|---|---|
| `scale_max_increase_pct` | 25 | Maximum single-action budget increase. Scale in steps rather than large jumps |
| `scale_stability_days_required` | 7 | Campaign must have been at_target or profitable for this many consecutive days before a scale recommendation fires |
| `scale_min_orders` | 15 | Minimum cumulative orders in the stability window before scaling — one-off days don't justify it |