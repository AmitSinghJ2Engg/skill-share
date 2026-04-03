# KPI Catalogue
# okr-kpi-governance — references/kpi-catalogue.md
# Approved KPI definitions with formulas, units, and benchmark guidance.
# Read when: registering a new KPI — check here before defining from scratch.
# Cross-reference: margin-calculator skill owns fee and ROAS calculation logic.

---

## Amazon Channel

| kpi_name | Formula | Unit | Direction | Benchmark |
|---|---|---|---|---|
| conversion_rate | (orders / sessions) x 100 | % | higher_is_better | 3.0 - 5.0% |
| amazon_acos | (ad_spend / ad_revenue) x 100 | % | lower_is_better | 15 - 25% |
| amazon_roas | ad_revenue / ad_spend | ratio | higher_is_better | 3.0x - 6.0x |
| amazon_tacos | (ad_spend / total_revenue) x 100 | % | lower_is_better | 5 - 12% |
| listing_ctr | (clicks / impressions) x 100 | % | higher_is_better | 0.3 - 0.8% |
| organic_rank_p1 | (page 1 products / tracked products) x 100 | % | higher_is_better | > 50% |

Notes:
- conversion_rate uses sessions (unique visitors), not page views. Benchmark brass/home decor at 2.5-4.5%.
- amazon_acos: Never set target above breakeven. Use `margin-calculator` to derive breakeven ACoS.
- amazon_roas: Inverse of ACoS. Do not register both unless reporting to different audiences.
- amazon_tacos: Most strategic Amazon KPI. Decreasing TACoS = organic rank improving. Target < 8% for scaled products.

---

## Revenue & Financial

| kpi_name | Formula | Unit | Direction | Benchmark |
|---|---|---|---|---|
| revenue_monthly | sum(order_value excl. returns) | INR | higher_is_better | Business-specific |
| average_order_value | gross_revenue / count(orders) | INR | higher_is_better | Business-specific |
| gross_margin_pct | Via `margin-calculator` skill | % | higher_is_better | 35 - 55% |
| net_margin_pct | Via `margin-calculator` skill | % | higher_is_better | 10 - 20% |
| cac | Via `margin-calculator` skill | INR | lower_is_better | < LTV / 3 |
| ltv | Via `margin-calculator` skill (profit-based) | INR | higher_is_better | > 3x CAC |

Notes:
- revenue_monthly: Use net revenue (post-returns).
- gross_margin_pct: COGS must include landed cost (product + freight + customs + packaging).

---

## Customer

| kpi_name | Formula | Unit | Direction | Benchmark |
|---|---|---|---|---|
| return_rate | (returns / orders) x 100 | % | lower_is_better | < 5% home; < 8% fashion |
| repeat_customer_rate | (customers >= 2 orders / total) x 100 | % | higher_is_better | 15 - 30% |
| new_customer_pct | (new customers / total) x 100 | % | context-dependent | Growth phase = higher |

---

## Operations

| kpi_name | Formula | Unit | Direction | Benchmark |
|---|---|---|---|---|
| inventory_turnover | COGS / average_inventory_value | ratio | higher_is_better | 4 - 8x |
| stockout_rate | (zero_inventory_days / total_days) x 100 | % | lower_is_better | < 3% |
| order_fulfilment_time_hrs | avg(dispatch - order) in hours | hours | lower_is_better | < 24hr |
| vendor_on_time_rate | (on_time / total_deliveries) x 100 | % | higher_is_better | > 90% |

---

## Marketing

| kpi_name | Formula | Unit | Direction | Benchmark |
|---|---|---|---|---|
| meta_roas | meta_revenue / meta_ad_spend | ratio | higher_is_better | 2.5x - 5.0x |
| meta_cpc | meta_spend / meta_clicks | INR | lower_is_better | 5 - 25 INR |

Note: meta_roas uses 7-day click attribution as standard.

---

## Formulas via margin-calculator

Do not redefine: Breakeven ROAS, Net profit per unit, Amazon fee breakdown, GST on fees.
When a KPI depends on these, note: "Compute via margin-calculator skill."
