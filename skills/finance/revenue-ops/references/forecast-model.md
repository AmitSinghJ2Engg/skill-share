# Forecast & Financial Statements Model — revenue-ops
# Owner: revenue-ops
# Covers: pre-revenue scenario forecasting, P&L statement, marketing efficiency report
# Last updated: 2026-03-15

---

## §1 — Pre-Revenue Scenario Forecasting Model

For businesses with no sales history. Projects revenue from traffic assumptions.

### Input Variables

| Variable | Symbol | Description | Default |
|---|---|---|---|
| Monthly traffic (sessions) | `TRAFFIC` | Estimated sessions to listing/store | Operator-provided |
| Conversion rate | `CVR` | % of sessions that purchase | Amazon: 10–15%, Shopify: 1.5–3% |
| Average order value | `AOV` | Revenue per order | = SP for single-SKU |
| Repeat purchase rate | `RPR` | % of customers who buy again in 90 days | 15% (default) |
| Repeat order interval | `ROI_DAYS` | Average days between repeat orders | 60 days |

### Revenue Projection Formula

```
monthly_orders     = TRAFFIC × CVR
monthly_revenue    = monthly_orders × AOV

repeat_orders_month = monthly_orders × RPR × (30 / ROI_DAYS)
total_orders_month  = monthly_orders + repeat_orders_month
total_revenue_month = total_orders_month × AOV

annualized_revenue  = SUM(total_revenue_month, months 1–12)
  [accounting for month-over-month growth if growth_rate provided]
```

**S22 rule:** CVR defaults are labelled `confidence: LOW, source: "industry_benchmark"`.
If operator provides actual CVR from live data → `confidence: HIGH, source: "operator_actuals"`.
Never mix benchmark CVR with actual revenue to claim a mixed-confidence projection.

### Three Scenario Model

| Scenario | Traffic Mult | CVR | AOV Mult | Growth/Mo |
|---|---|---|---|---|
| Conservative | 0.6× base | Low end of range | 1.0× | 5% MoM |
| Realistic | 1.0× base | Mid range | 1.0× | 10% MoM |
| Aggressive | 1.5× base | High end of range | 1.1× | 20% MoM |

**Output: ForecastRecord**
```json
{
  "forecast_id": "RO-F-20260315-001",
  "basis": "pre_revenue_scenario",
  "inputs": {
    "base_monthly_traffic": 5000,
    "cvr_amazon_pct": 12.0,
    "cvr_shopify_pct": 2.0,
    "aov_inr": 800,
    "assumptions": [
      {"field": "cvr_amazon_pct", "confidence": "LOW", "source": "industry_benchmark_10-15pct"},
      {"field": "base_monthly_traffic", "confidence": "LOW", "source": "operator_estimate"}
    ]
  },
  "scenarios": {
    "conservative": {
      "monthly_orders": 180,
      "monthly_revenue_inr": 144000,
      "month_12_revenue_inr": 232000,
      "annual_revenue_inr": 2160000
    },
    "realistic": {
      "monthly_orders": 300,
      "monthly_revenue_inr": 240000,
      "month_12_revenue_inr": 744000,
      "annual_revenue_inr": 4320000
    },
    "aggressive": {
      "monthly_orders": 495,
      "monthly_revenue_inr": 396000,
      "month_12_revenue_inr": 3850000,
      "annual_revenue_inr": 9120000
    }
  },
  "planning_recommendation": "Use conservative scenario for capital planning. Use realistic for OKR targets."
}
```

---

## §2 — Simplified P&L Statement

For early-stage ecommerce. Generated monthly or quarterly.

### Structure

```
REVENUE
  Gross Revenue (GMV)                       ₹XXX
  Less: Returns & Refunds                  -₹XXX
  Net Revenue                               ₹XXX

COST OF GOODS
  Product COGS (units sold × cogs/unit)    -₹XXX
  Inbound Freight (amortised)              -₹XXX
  Gross Profit                              ₹XXX
  Gross Margin %                             XX%

PLATFORM COSTS
  Amazon Fees (referral + closing + FBA)   -₹XXX
  Shopify Gateway + Platform Fees          -₹XXX
  Returns Processing                       -₹XXX
  Contribution Profit                       ₹XXX
  Contribution Margin %                      XX%

MARKETING SPEND
  Amazon Ads                               -₹XXX
  Meta Ads                                 -₹XXX
  Google Ads                               -₹XXX
  Total Marketing                          -₹XXX
  Marketing % of Revenue                     XX%
  Post-Marketing Profit                     ₹XXX
  Post-Marketing Margin %                    XX%

OPERATING EXPENSES
  Platform & Tools                         -₹XXX
  Operations & Packaging                   -₹XXX
  Team / Freelancers                       -₹XXX
  Miscellaneous                            -₹XXX
  Total OpEx                               -₹XXX

EBITDA                                      ₹XXX
EBITDA Margin %                              XX%

NET PROFIT / (LOSS)                         ₹XXX
Net Margin %                                 XX%
```

### P&L Formula Chain

```
gross_profit     = net_revenue - total_cogs
contribution_profit = gross_profit - platform_costs
post_mkt_profit  = contribution_profit - total_marketing_spend
ebitda           = post_mkt_profit - total_opex
net_profit       = ebitda  [pre-tax, no depreciation for early stage]

gross_margin_pct        = gross_profit / net_revenue × 100
contribution_margin_pct = contribution_profit / net_revenue × 100
post_mkt_margin_pct     = post_mkt_profit / net_revenue × 100
ebitda_margin_pct       = ebitda / net_revenue × 100
```

**S22 rule:** Any line without a data source is labelled `null` with `data_gap`.
Never populate COGS, platform fees, or ad spend from estimates without declaring confidence.

### Output: PLStatement

```json
{
  "statement_id": "RO-PL-20260315-001",
  "period": "2026-03",
  "basis": "actuals | forecast_realistic | forecast_conservative",
  "lines": {
    "gross_revenue_inr": null,
    "returns_inr": null,
    "net_revenue_inr": null,
    "cogs_inr": null,
    "gross_profit_inr": null,
    "gross_margin_pct": null,
    "platform_costs_inr": null,
    "contribution_profit_inr": null,
    "contribution_margin_pct": null,
    "marketing_spend_inr": null,
    "post_mkt_profit_inr": null,
    "post_mkt_margin_pct": null,
    "opex_inr": null,
    "ebitda_inr": null,
    "net_profit_inr": null,
    "net_margin_pct": null
  },
  "data_gaps": ["gross_revenue_inr", "cogs_inr"],
  "confidence": "LOW"
}
```

---

## §3 — Marketing Efficiency Report

Computed per channel and blended. Run after any ad data is available.

### Metrics

| Metric | Formula | Target | At-Risk |
|---|---|---|---|
| ROAS | revenue / ad_spend | > breakeven_roas | < breakeven_roas |
| ACoS % | ad_spend / revenue × 100 | < breakeven_acos_pct | > be_acos + 5pp |
| CAC | ad_spend / orders | < max_cac_allowed | > max_cac_allowed |
| TACOS % | ad_spend / total_channel_revenue × 100 | < 12% | > 20% |
| Marketing % of Revenue | total_ad_spend / net_revenue × 100 | < 20% | > 30% |

### Attribution Windows (declare on every report)

| Channel | Click | View | Window |
|---|---|---|---|
| Amazon Ads | 7-day | — | 7 days |
| Meta Ads | 7-day click | 1-day view | 7 days |
| Google Ads | 30-day | — | 30 days |

**Cross-channel note:** Revenue may be double-counted if a customer clicks Meta then Amazon.
Declare: "Attribution overlap possible across channels — blended figures may overcount revenue."

### Output: MarketingEfficiencyReport

```json
{
  "report_id": "RO-ME-20260315-001",
  "period": "30d",
  "breakeven_roas": 1.48,
  "max_cac_allowed_inr": 96.67,
  "channels": [
    {
      "name": "amazon_ads",
      "spend_inr": 3000,
      "revenue_inr": 18000,
      "orders": 36,
      "roas": 6.0,
      "acos_pct": 16.7,
      "cac_inr": 83.3,
      "attribution_window_days": 7,
      "status": "HEALTHY",
      "flags": []
    }
  ],
  "blended": {
    "total_spend_inr": 10500,
    "total_revenue_inr": 47000,
    "total_orders": 118,
    "blended_roas": 4.48,
    "blended_cac_inr": 89.0,
    "marketing_pct_of_revenue": 22.3,
    "status": "WATCH",
    "flags": ["marketing_pct_above_20pct"]
  },
  "attribution_note": "Attribution overlap possible across channels"
}
```

---

## §4 — Budget vs Actual Variance

When both budget and actuals are available, compute variance.

```
variance_inr  = actual - budget
variance_pct  = (actual - budget) / budget × 100

label:
  > +10%  → "over_budget"
  -10% to +10% → "on_track"
  < -10%  → "under_budget"

for revenue lines: over_budget is POSITIVE (more revenue than planned)
for cost lines:    over_budget is NEGATIVE (more spend than planned)
```

Output a variance table per budget category.
Flag any cost category > 20% over budget as `review_required`.

---

## Revision History
| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-03-15 | Created — scenario forecasting, P&L model, marketing efficiency, budget variance |
