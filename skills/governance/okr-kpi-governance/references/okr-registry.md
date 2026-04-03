# OKR Registry
# okr-kpi-governance — references/okr-registry.md
# This is the live source of truth for all Ismokraft objectives and KPIs.
# Updated via register_objective, register_kpi, update_kpi_target, update_forecast.
# Never edit directly without going through the capability workflow.
# Last updated: 2026-03-11

---

## ID Counters

```
next_objective_id : OBJ-001
next_kpi_id       : KPI-001
```

Update these counters when registering new entries. They are monotonically increasing.
Do not reuse retired IDs.

---

## Active Objectives

### OBJ-001 — [Placeholder: Register your first objective]

> No objectives registered yet. Use `register_objective` to add the first one.

**Template — copy and populate:**

```
### OBJ-NNN — [Objective Name]

| Field | Value |
|---|---|
| objective_id | OBJ-NNN |
| objective_name | [name] |
| owner | [person or team] |
| quarter | Q[1-4]-YYYY |
| description | [what success looks like] |
| status | active |
| kpis | [KPI-NNN, KPI-NNN] |
| crm_record_id | [returned by ZohoCRM after record creation] |
```

---

## Active KPIs

> No KPIs registered yet. Use `register_kpi` to add the first one.

**Template — copy and populate:**

```
### KPI-NNN — [display_name]

| Field | Value |
|---|---|
| kpi_id | KPI-NNN |
| kpi_name | [snake_case_name] |
| display_name | [Human Label] |
| metric_source | [Zoho Analytics / Bigin / etc.] |
| formula | [e.g. orders / sessions × 100] |
| unit | [% / ₹ / count / ratio] |
| target_value | [number] |
| benchmark_range_min | [number] |
| benchmark_range_max | [number] |
| forecast_value | [number or null] |
| reporting_frequency | [daily / weekly / monthly / quarterly] |
| linked_objective | OBJ-NNN |
| status | active |
| crm_record_id | [returned by ZohoCRM after record creation] |

**Target history:**
| effective_from | target_value | benchmark_min | benchmark_max | reason |
|---|---|---|---|---|
| YYYY-MM-DD | [number] | [number] | [number] | Initial registration |
```

---

## Deprecated KPIs

*(KPIs retired from active use. Preserved for historical context.)*

---

## Completed Objectives

*(Objectives closed at quarter end.)*

---

## Registry Changelog

| Date | Action | ID | Detail |
|---|---|---|---|
| 2026-03-11 | CREATED | — | Registry initialised |

---

## Pre-Defined KPI Definitions

The following KPIs are pre-approved for Ismokraft. Use these definitions when registering.
Full formulas and context in `references/kpi-catalogue.md`.

### Ecommerce Performance KPIs

| kpi_name | formula | unit | typical_target | metric_source |
|---|---|---|---|---|
| `conversion_rate` | orders / sessions × 100 | % | 3.5 | Zoho Analytics |
| `average_order_value` | gross_revenue / orders | ₹ | business-specific | Zoho Analytics |
| `revenue_monthly` | sum(order_value) | ₹ | business-specific | Zoho Analytics |
| `units_sold_monthly` | count(orders) | count | business-specific | Zoho Analytics |
| `return_rate` | returns / orders × 100 | % | < 5 | Zoho Analytics |
| `repeat_customer_rate` | repeat_buyers / total_buyers × 100 | % | > 20 | Zoho Analytics |

### Amazon Channel KPIs

| kpi_name | formula | unit | typical_target | metric_source |
|---|---|---|---|---|
| `amazon_acos` | ad_spend / ad_revenue × 100 | % | < 20 | Amazon Seller Central |
| `amazon_roas` | ad_revenue / ad_spend | ratio | > 4 | Amazon Seller Central |
| `amazon_tacos` | ad_spend / total_revenue × 100 | % | < 10 | Amazon Seller Central |
| `listing_ctr` | clicks / impressions × 100 | % | > 0.5 | Amazon Seller Central |
| `organic_rank_p1` | products ranked page 1 / total products × 100 | % | > 60 | Manual |

### Financial KPIs

| kpi_name | formula | unit | typical_target | metric_source |
|---|---|---|---|---|
| `gross_margin_pct` | (revenue - COGS) / revenue × 100 | % | > 40 | Zoho Books |
| `net_margin_pct` | net_profit / revenue × 100 | % | > 15 | Zoho Books |
| `contribution_margin` | revenue - variable_costs | ₹ | business-specific | Zoho Books |
| `cac` | total_ad_spend / new_customers | ₹ | business-specific | Manual |
| `ltv` | avg_order_value × avg_orders_per_year × avg_customer_lifespan | ₹ | > 3× CAC | Manual |

### Operations KPIs

| kpi_name | formula | unit | typical_target | metric_source |
|---|---|---|---|---|
| `inventory_turnover` | COGS / avg_inventory_value | ratio | > 6 | Zoho Inventory |
| `stockout_rate` | stockout_days / total_days × 100 | % | < 5 | Zoho Inventory |
| `order_fulfilment_time_hrs` | avg(dispatch_time - order_time) | hours | < 24 | Bigin |
| `vendor_on_time_rate` | on_time_deliveries / total_deliveries × 100 | % | > 90 | Bigin |

### Marketing KPIs

| kpi_name | formula | unit | typical_target | metric_source |
|---|---|---|---|---|
| `meta_roas` | meta_revenue / meta_spend | ratio | > 3 | Meta Ads Manager |
| `meta_cpc` | meta_spend / meta_clicks | ₹ | business-specific | Meta Ads Manager |
| `email_open_rate` | opens / delivered × 100 | % | > 20 | Manual |
| `new_customer_pct` | new_customers / total_customers × 100 | % | > 30 | Zoho Analytics |
