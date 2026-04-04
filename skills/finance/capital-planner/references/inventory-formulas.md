# Inventory Formulas — Inventory Planner

**Purpose:** All formulas, constants, and alert conditions. Read before Step 2.

---

## §1 Core Formulas

### Days of Stock Remaining
```
days_remaining = current_stock_units / avg_daily_sales_units
stockout_date = today + days_remaining
```

### Safety Stock

**Method 1: Z-Score (preferred when std_dev data available)**
```
z_score lookup:
  90% service level → z = 1.28
  95% service level → z = 1.65  ← default
  99% service level → z = 2.33

safety_stock = z × SQRT(
  (lead_time_days × sales_std_dev_daily²) +
  (avg_daily_sales_units² × lead_time_std_dev_days²)
)
```

**Method 2: Fixed-Days Fallback (when std_dev unavailable)**
```
service_level_to_days:
  90% → 5 days
  95% → 7 days  ← default
  99% → 14 days

safety_stock = avg_daily_sales_units × fixed_days
```

### Reorder Point
```
reorder_point = (avg_daily_sales_units × lead_time_days) + safety_stock

For FBA channel:
  effective_lead_time = lead_time_days + 7  (Amazon check-in buffer)
  reorder_point = (avg_daily_sales_units × effective_lead_time) + safety_stock
```

### EOQ (Economic Order Quantity)
```
EOQ = SQRT(
  (2 × avg_monthly_units × ordering_cost_inr) /
  (unit_cogs_inr × holding_cost_pct_annual / 12)
)

Defaults:
  ordering_cost_inr = ₹500 (preparation + shipping fixed cost per order)
  holding_cost_pct_annual = 0.20 (20% of COGS per year = storage + capital cost + damage)
```

**If EOQ < vendor MOQ:** use vendor MOQ as order_quantity, note the override.
**If EOQ unavailable (missing ordering_cost):** use fixed_coverage method:
```
fixed_coverage_days = 60  (2 months — Ismokraft default)
order_quantity = avg_daily_sales_units × fixed_coverage_days
```

### Capital
```
current_inventory_value_inr = current_stock_units × unit_cogs_inr
recommended_order_value_inr = order_quantity × unit_cogs_inr
total_capital_needed_inr = recommended_order_value_inr  (current stock is already paid)
annual_holding_cost_inr = current_inventory_value_inr × holding_cost_pct_annual
```

---

## §2 Ismokraft FBA-Specific Adjustments

| Factor | Adjustment | Reason |
|---|---|---|
| Amazon check-in buffer | +7 days to lead_time | Amazon FBA check-in takes 3-10 days |
| Seasonal spike buffer (Diwali Oct, NYE Dec, Navratri Oct) | +30% to safety_stock in Aug/Sep | Pre-festive stock build |
| Low-BSR product (BSR < 2,000) | safety_stock × 1.25 | Higher velocity variance |
| New product (<90 days live) | Use service_level = 0.99 | Velocity not yet stable |
| Multi-channel SKU | Separate plan per channel; sum for supplier order | Avoid channel cannibalization |

---

## §3 Coverage Benchmarks (Ismokraft context)

| Situation | Recommended Coverage |
|---|---|
| First FBA shipment | 60-90 days (conservative — velocity unknown) |
| Stable product, established velocity | 45-60 days |
| Fast mover (BSR < 500) | 30-45 days (shorter cycle, less capital tied) |
| Slow mover (BSR > 20,000) | 90-120 days (reduce order frequency) |
| Launch Gate 8 minimum | 60 days (hard requirement from gate-definitions.md) |

---

## §4 Alert Conditions

| Alert Type | Trigger Condition | Urgency |
|---|---|---|
| `stockout_imminent` | days_remaining ≤ (lead_time_days + 7) | critical |
| `below_rop` | current_stock_units ≤ reorder_point | critical |
| `overstock` | days_remaining > 120 | warning |
| `high_holding_cost` | annual_holding_cost_inr > ₹50,000 for the SKU | warning |
| `new_product_low_data` | product <90 days live + no sales std_dev | info |
| `fba_capacity_risk` | recommended order > 500 units AND BSR > 10,000 | info |

---

## §5 Glossary

| Term | Definition |
|---|---|
| ROP | Reorder Point — stock level at which a new order must be placed |
| Safety Stock | Buffer stock held to absorb demand/supply variability |
| EOQ | Economic Order Quantity — order size that minimises total inventory cost |
| Service Level | Probability of not stocking out during the replenishment lead time |
| Holding Cost | Annual cost of holding inventory (storage + capital opportunity cost + shrinkage) |
| Lead Time | Days from placing order with supplier to stock available for sale |
