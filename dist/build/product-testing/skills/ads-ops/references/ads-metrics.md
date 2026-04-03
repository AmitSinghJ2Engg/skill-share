# Ads Metrics Reference — Ads Performance Reporter

**Purpose:** All metric definitions, formulas, health thresholds, and field mappings.

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

## §2 Health Classification (threshold-driven, NOT hardcoded)

Health is always relative to target_acos and breakeven_acos from margin-calculator.

| Condition | Health Label | Default Action |
|---|---|---|
| acos ≤ target_acos | profitable | scale |
| target_acos < acos ≤ breakeven_acos | at_target | hold |
| acos > breakeven_acos AND acos ≤ breakeven_acos × 1.5 | above_target | optimise |
| acos > breakeven_acos × 1.5 OR orders = 0 with spend > ₹500 | loss_making | pause |
| spend = 0 OR impressions = 0 | no_data | investigate |

**For Meta ads:** replace ACoS with CPA-based assessment.
Target CPA = (target_acos_pct / 100) × avg_selling_price_inr.

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

| Condition | Action | Rule |
|---|---|---|
| orders ≥ 3 AND acos ≤ target | bid_up | Strong performer — push for more volume |
| orders ≥ 1 AND acos between target and breakeven | hold | Efficient — do not disrupt |
| orders = 0 AND spend > ₹100 | negate (if auto/broad) or bid_down (if exact) | Wasted spend |
| orders ≥ 5 in auto campaign AND acos ≤ target | promote_to_exact | Graduate to manual exact |
| acos > breakeven × 2 AND orders < 3 | negate | Consistently underperforming |

---

## §7 Overall Health Verdict Rules

```
healthy:                all campaigns at_target or profitable; wasted_spend < 10% of total_spend
needs_optimisation:     some campaigns above_target; wasted_spend 10-25% of total_spend
critical:               any loss_making campaign with spend > ₹2,000 in period;
                        wasted_spend > 25% of total_spend
insufficient_data:      total_spend < ₹500 OR period < 5 days
```