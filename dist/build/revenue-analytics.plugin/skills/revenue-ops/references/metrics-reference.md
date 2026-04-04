# Metrics Reference — Sales Analytics

**Purpose:** All metric definitions, formulas, and Zoho Analytics field mappings.
Read before Step 2 (Compute Metrics).

---

## §1 Core Metric Definitions

| Metric | Formula | Unit | Notes |
|---|---|---|---|
| gross_revenue | SUM(order_value) | ₹ | Before returns, before deductions |
| net_revenue | gross_revenue - returns_value | ₹ | After returns |
| units_sold | COUNT(units per order) | count | Gross units including returned |
| net_units | units_sold - returned_units | count | After returns |
| total_orders | COUNT(distinct order_id) | count | |
| average_order_value | gross_revenue / total_orders | ₹ | |
| return_rate_pct | (returned_units / units_sold) × 100 | % | lower_is_better |
| gross_margin_inr | net_revenue - total_cogs | ₹ | Requires COGS — null if unavailable |
| gross_margin_pct | (gross_margin_inr / net_revenue) × 100 | % | Requires COGS |
| period_over_period_growth | (current - prior) / prior × 100 | % | |
| revenue_pct_of_total | (asin_revenue / total_revenue) × 100 | % | Share of wallet |

**Gross margin note:** COGS must include landed cost (factory price + freight + customs + packaging).
If only factory price is available, use it but add note: "COGS = factory price only — excludes freight."
Do not include Amazon fees in COGS. Fees are a separate deduction.

---

## §2 Trend Classification

After computing `period_over_period_growth_pct` for an ASIN or category:

| Growth | Trend Label |
|---|---|
| > +10% | growing |
| -10% to +10% | stable |
| < -10% | declining |
| Only 1 period of data | unknown |

---

## §3 Zoho Analytics Field Mapping

When pulling from Zoho Analytics, expect these field names (may vary by view — confirm with actual view schema):

| Our Metric | Expected Zoho Analytics Field | Notes |
|---|---|---|
| order_id | Order ID / Transaction ID | |
| order_date | Order Date / Created Time | Date field |
| asin | ASIN / Item SKU | May need join to product master |
| product_name | Product Title / Item Name | |
| channel | Sales Channel / Marketplace | e.g., "Amazon", "Shopify" |
| units | Quantity | Per line item |
| order_value | Item Price × Quantity | Or "Gross Revenue" if aggregated |
| return_flag | Return Status / Is Return | Boolean or "Returned" string |
| cogs | COGS / Cost Price | Often absent — check |
| category | Product Category / Department | |

If actual field names differ, note the mapping used in `data_gaps`.

---

## §4 Amazon Settlement Report Fields

When Amit uploads an Amazon settlement report (CSV):

| Settlement Column | Maps To | Notes |
|---|---|---|
| type | transaction_type | Filter for "Order" type |
| description | order_description | |
| amount | order_value | For "Principal" description |
| amazon-fees | deductions | FBA fees, referral fees |
| order-id | order_id | |
| posted-date | order_date | |
| sku | asin | May need ASIN lookup |

For settlement reports, `gross_revenue` = sum of all "Principal" amounts.
Fee deductions are NOT subtracted in sales analytics — they go to settlement-reconciler.

---

## §5 Shopify Export Fields

When Amit uploads a Shopify export:

| Shopify Column | Maps To | Notes |
|---|---|---|
| Name | order_id | |
| Created at | order_date | |
| Lineitem sku | asin | SKU, not ASIN |
| Lineitem quantity | units | |
| Lineitem price | unit_selling_price | |
| Total | order_value | |
| Refunded Amount | return_value | |
| Product Type | category | |

---

## §6 Minimum Data Requirements Per Report Type

| report_type | Minimum Required Fields |
|---|---|
| summary | order_date, order_value, units |
| by_asin | order_date, order_value, units, asin/sku |
| by_channel | order_date, order_value, channel |
| by_category | order_date, order_value, category |
| trend | order_date, order_value — needs ≥2 time buckets |
| comparison | Same as primary period + comparison period data |
