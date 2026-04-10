# Ads Metrics Reference — Ads Performance Reporter

**Purpose:** All metric definitions, formulas, health thresholds, and field mappings.

**Threshold values are named, not hardcoded.** See `tuning-constants.md` for the actual numbers. When reading this file, the expressions like `above_target_multiplier` or `loss_making_min_spend_inr` refer to named constants defined there. This exists so the values can be tuned without editing this prose.

---

## §1 Metric Formulas

| Metric | Formula | Notes |
|---|---|---|
| ACoS % | (ad_spend / ad_revenue) × 100 | Advertising Cost of Sales |
| ROAS | ad_revenue / ad_spend | Return on Ad Spend |
| TACOS % | (ad_spend / total_revenue) × 100 | Total ACoS — requires organic + ad revenue |
| CTR % | (clicks / impressions) × 100 | Click-through rate |
| CVR % | (orders / clicks) × 100 | Conversion rate |
| CPC ₹ | ad_spend / clicks | Cost per click |
| CPA ₹ | ad_spend / orders | Cost per acquisition |
| Wasted Spend | SUM(spend where orders = 0) | Zero-return spend |

---

## §2 Health Classification

Health is always relative to `target_acos` and `breakeven_acos` from margin-calculator, plus the named tunables in `tuning-constants.md §1`.

| Condition | Health Label | Default Action |
|---|---|---|
| `acos ≤ target_acos` | profitable | scale |
| `target_acos < acos ≤ breakeven_acos` | at_target | hold |
| `acos > breakeven_acos AND acos ≤ breakeven_acos × above_target_multiplier` | above_target | optimise |
| `acos > breakeven_acos × above_target_multiplier` OR (`orders = 0` AND `spend > loss_making_min_spend_inr`) | loss_making | pause |
| `spend = 0` OR `impressions = 0` | no_data | investigate |

`above_target_multiplier` and `loss_making_min_spend_inr` are defined in `tuning-constants.md §1`.

**For Meta ads:** replace ACoS with CPA-based assessment.
Target CPA = `(target_acos_pct / 100) × avg_selling_price_inr`.

---

## §3 Campaign Type Taxonomy

| Campaign Type | Platform | Notes |
|---|---|---|
| auto | Amazon | Targets automatically by Amazon — broad reach, useful for keyword discovery |
| manual_exact | Amazon | Exact keyword match — most precise, typically lowest ACoS |
| manual_broad | Amazon | Broad match — wider reach, monitor for irrelevant searches |
| manual_phrase | Amazon | Phrase match — balanced precision and reach |
| sponsored_brand | Amazon | Brand keyword campaigns — brand defense |
| sponsored_display | Amazon | Display retargeting — typically higher ACoS |
| meta_prospecting | Meta | Top-of-funnel, cold audience |
| meta_retargeting | Meta | Warm audience — website visitors, cart abandoners |
| meta_lookalike | Meta | Lookalike from customer list |

---

## §4 Amazon Ads CSV Field Mapping

Standard Amazon Advertising bulk report column → schema field:

| CSV Column | Maps To |
|---|---|
| Campaign Name | campaign_name |
| Campaign Type | campaign_type (map: SP Auto → auto, SP Manual → manual_exact etc.) |
| Ad Group Name | adgroup_name |
| Keyword / Targeting | keyword |
| Match Type | match_type |
| Impressions | impressions |
| Clicks | clicks |
| Click-through Rate | ctr_pct |
| Spend | spend_inr |
| 7 Day Total Sales | revenue_inr |
| 7 Day Total Orders (#) | orders |
| 7 Day Conversion Rate | cvr_pct |
| Cost Per Click (CPC) | cpc_inr |
| Advertising Cost of Sales (ACoS) | acos_pct |
| Return on Advertising Spend (ROAS) | roas |

---

## §5 Meta Ads CSV Field Mapping

Standard Meta Ads Manager export column → schema field:

| CSV Column | Maps To |
|---|---|
| Campaign name | campaign_name |
| Adset name | adgroup_name |
| Amount spent (INR) | spend_inr |
| Impressions | impressions |
| Link clicks | clicks |
| CTR (link click-through rate) | ctr_pct |
| Purchases | orders |
| Purchase conversion value | revenue_inr |
| Cost per purchase | cpa_inr |
| ROAS (return on ad spend) | roas |

---

## §6 Keyword Action Rules

Threshold values below reference `tuning-constants.md §2` and §3.

| Condition | Action | Magnitude | Rule |
|---|---|---|---|
| `orders ≥ 3 AND acos ≤ target_acos` | bid_up | `+bid_up_pct` of current bid | Strong performer — push for more volume |
| `orders ≥ 1 AND target_acos < acos ≤ breakeven_acos` | hold | (no change) | Efficient — do not disrupt |
| `orders = 0 AND spend > negate_min_spend_inr` | negate (auto/broad) OR bid_down (exact) | `−bid_down_pct` of current bid, floored at `min_bid_inr` | Wasted spend |
| `orders ≥ promote_min_orders` in auto campaign AND `acos ≤ target_acos` | promote_to_exact | New manual bid = `current_auto_bid × promote_bid_multiplier` | Graduate to manual exact |
| `acos > breakeven × negate_acos_multiplier AND orders < negate_max_orders` | negate | (binary) | Consistently underperforming |

**Bid adjustment output contract:** When action is `bid_up`, `bid_down`, or `promote_to_exact`, the output MUST include the specific `recommended_bid_inr` value, not just the action label. "bid_up" alone is incomplete advice that the team can't execute without guessing.

Example:
```json
{
  "keyword": "wooden pen holder",
  "current_bid_inr": 5,
  "action": "bid_up",
  "recommended_bid_inr": 6,  // 5 × 1.20, rounded
  "rationale": "orders=4, acos=22% ≤ target_acos=28%"
}
```

---

## §7 Overall Health Verdict Rules

Threshold values below reference `tuning-constants.md §4`.

```
healthy:                all campaigns at_target or profitable
                        AND wasted_spend < healthy_wasted_pct_max % of total_spend

needs_optimisation:     some campaigns above_target
                        AND wasted_spend between healthy_wasted_pct_max and needs_optimisation_wasted_pct_max

critical:               any loss_making campaign with spend > critical_loss_making_min_spend_inr
                        OR wasted_spend > needs_optimisation_wasted_pct_max

insufficient_data:      total_spend < insufficient_data_min_spend_inr
                        OR period < insufficient_data_min_days
```