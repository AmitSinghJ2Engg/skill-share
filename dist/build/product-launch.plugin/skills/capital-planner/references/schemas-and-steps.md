# capital-planner — Offloaded Schemas & Execution Steps
# Extracted from SKILL.md on 2026-03-15 to reduce SKILL.md to <500 lines.
# This file is the authoritative source for these sections.

---

## Input Schema (INVENTORY mode)

```json
{
  "type": "object",
  "properties": {
    "sku": { "type": "string" },
    "product_name": { "type": "string" },
    "channel": {
      "type": "string",
      "enum": ["fba", "self_ship", "shopify", "multi"]
    },
    "current_stock_units": { "type": "integer" },
    "avg_daily_sales_units": {
      "type": "number",
      "description": "Last 30d preferred — from sales-analytics actuals"
    },
    "unit_cogs_inr": {
      "type": "number",
      "description": "From margin-calculator output — do not infer"
    },
    "lead_time_days": {
      "type": "integer",
      "description": "Supplier to FBA/warehouse"
    },
    "service_level_target": {
      "type": "number",
      "enum": [0.90, 0.95, 0.99],
      "default": 0.95
    },
    "sales_std_dev_daily": { "type": ["number", "null"] },
    "lead_time_std_dev_days": { "type": "integer", "default": 3 },
    "holding_cost_pct_annual": { "type": "number", "default": 0.20 },
    "ordering_cost_inr": { "type": "number", "default": 500 }
  },
  "required": ["sku", "product_name", "channel", "current_stock_units", "avg_daily_sales_units", "unit_cogs_inr", "lead_time_days"]
}
```

Missing required fields: ask before calculating. Do not estimate avg_daily_sales_units.

---

---


## Output Schema — InventoryPlan JSON

```json
{
  "type": "object",
  "properties": {
    "sku": { "type": "string" },
    "product_name": { "type": "string" },
    "plan_date": { "type": "string", "format": "date" },
    "channel": { "type": "string" },

    "velocity": {
      "type": "object",
      "properties": {
        "avg_daily_units": { "type": "number" },
        "avg_monthly_units": { "type": "number" },
        "days_of_stock_remaining": { "type": "number" },
        "stockout_date_estimate": { "type": "string", "format": "date" }
      }
    },

    "safety_stock": {
      "type": "object",
      "properties": {
        "units": { "type": "integer" },
        "covers_days": { "type": "number" },
        "method": { "type": "string", "enum": ["z-score", "fixed-days", "manual"] },
        "z_score_used": { "type": ["number", "null"] },
        "service_level": { "type": "number" }
      }
    },

    "reorder_point": {
      "type": "object",
      "properties": {
        "units": { "type": "integer" },
        "formula": { "type": "string" },
        "days_before_stockout": { "type": "number" }
      }
    },

    "order_quantity": {
      "type": "object",
      "properties": {
        "recommended_units": { "type": "integer" },
        "method": { "type": "string", "enum": ["eoq", "fixed_coverage", "minimum_moq"] },
        "coverage_days": { "type": "number" },
        "eoq_units": { "type": ["integer", "null"] }
      }
    },

    "capital": {
      "type": "object",
      "properties": {
        "current_inventory_value_inr": { "type": "number" },
        "recommended_order_value_inr": { "type": "number" },
        "total_capital_needed_inr": { "type": "number" },
        "annual_holding_cost_inr": { "type": "number" }
      }
    },

    "alerts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["stockout_imminent", "below_rop", "overstock", "high_holding_cost"]
          },
          "message": { "type": "string" },
          "urgency": { "type": "string", "enum": ["critical", "warning", "info"] }
        }
      }
    },

    "recommendation": { "type": "string" }
  },
  "required": ["sku", "product_name", "velocity", "safety_stock", "reorder_point", "order_quantity", "capital", "alerts", "recommendation"]
}
```

---

---


## Execution Steps (INVENTORY mode)

### Step 1 — Validate Inputs
`avg_daily_sales_units` must come from sales-analytics output or Amit's confirmed actuals.
If user estimates it, accept but flag: "Note: daily sales is an estimate — rerun with sales-analytics actuals."

### Step 2 — Calculate
In sequence (formulas in `references/inventory-formulas.md`):
1. Days of stock remaining: `current_stock / avg_daily_units`
2. Safety stock: z-score method if std_dev available; fixed-days fallback
3. Reorder point: `(avg_daily_units × lead_time_days) + safety_stock`
4. EOQ: if ordering_cost and holding_cost provided; fixed-coverage fallback
5. Capital: `current_stock × unit_cogs` and `order_qty × unit_cogs`
6. Stockout date: `today + days_of_stock_remaining`

Show each formula with numbers substituted.

**FBA lead time note:** Supplier → FBA = supplier lead_time_days + ~7 days (Amazon check-in).
Apply this adjustment automatically when channel = fba.

### Step 3 — Generate Alerts
Check each alert condition per `references/inventory-formulas.md` §4. One record per triggered condition.

### Step 4 — Output and Notification
Return full InventoryPlan JSON. The `alerts[]` array and `recommendation` field carry all actionable data.
Artifact layer handles any Bigin field update via Zoho Flow — do not call Bigin write tools.

If `alerts[]` contains `stockout_imminent` or `below_rop`, format alert via `slack-messaging` skill and post to `#ism-launch-alerts`. Include: SKU, days of stock, ROP units, estimated stockout date, action.
Idempotent: check prior alert thread before posting — do not duplicate for same SKU+date.

### Step 5 — Output
Return full InventoryPlan JSON. Follow with summary:

```
INVENTORY PLAN: [SKU] — [Product]
══════════════════════════════════
Daily velocity:    X.X units/day
Days of stock:     XX days (stockout ~YYYY-MM-DD)
Safety stock:      XX units (XX days cover @ 95% SL)
Reorder point:     XX units ← ORDER NOW if below this
Rec. order qty:    XXX units (XX days coverage)
Capital needed:    ₹XX,XXX

ALERT: [most urgent alert]
NEXT ACTION: [recommendation]
```

---

---


## Input Schema (CASHFLOW mode)

```json
{
  "type": "object",
  "properties": {
    "opening_cash_inr": {
      "type": "number",
      "description": "Cash available today"
    },
    "projection_period_weeks": {
      "type": "integer",
      "default": 12,
      "description": "How many weeks to project"
    },
    "skus": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": { "type": "string" },
          "channel": { "type": "string", "enum": ["fba", "self_ship", "shopify"] },
          "weekly_units": { "type": "number" },
          "avg_selling_price_inr": { "type": "number" },
          "unit_cogs_inr": {
            "type": "number",
            "description": "Must come from margin-calculator output"
          },
          "next_order_units": {
            "type": "integer",
            "description": "From inventory-planner output"
          },
          "next_order_date": { "type": "string", "format": "date" },
          "settlement_lag_days": {
            "type": "integer",
            "default": 14,
            "description": "Default: 14 for Amazon FBA"
          }
        },
        "required": ["sku", "channel", "weekly_units", "avg_selling_price_inr", "unit_cogs_inr"]
      },
      "minItems": 1
    },
    "weekly_ad_spend_inr": { "type": "number" },
    "fixed_costs_monthly_inr": {
      "type": "number",
      "description": "Optional — platform fees, salaries, overheads"
    },
    "other_inflows": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "amount_inr": { "type": "number" },
          "date": { "type": "string", "format": "date" }
        }
      }
    },
    "other_outflows": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "amount_inr": { "type": "number" },
          "date": { "type": "string", "format": "date" }
        }
      }
    }
  },
  "required": ["opening_cash_inr", "skus", "weekly_ad_spend_inr"]
}
```

`unit_cogs_inr` must come from margin-calculator output, not guessed.
`next_order_units` should come from inventory-planner output.

---

---


## Output Schema — CashFlowPlan JSON

```json
{
  "type": "object",
  "properties": {
    "plan_date": { "type": "string", "format": "date" },
    "projection_weeks": { "type": "integer" },
    "opening_cash_inr": { "type": "number" },
    "closing_cash_inr": { "type": "number" },
    "weekly_projections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "week": { "type": "integer" },
          "week_start": { "type": "string", "format": "date" },
          "inflows_inr": { "type": "number" },
          "outflows_inr": { "type": "number" },
          "net_cash_movement_inr": { "type": "number" },
          "closing_balance_inr": { "type": "number" },
          "notes": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "stress_points": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "week": { "type": "integer" },
          "date": { "type": "string", "format": "date" },
          "type": {
            "type": "string",
            "enum": ["inventory_payment", "cash_negative", "cash_low", "multiple_outflows"]
          },
          "projected_balance_inr": { "type": "number" },
          "shortfall_inr": { "type": ["number", "null"] },
          "description": { "type": "string" },
          "mitigation": { "type": "string" }
        }
      }
    },
    "summary": {
      "type": "object",
      "properties": {
        "min_cash_balance_inr": { "type": "number" },
        "min_cash_week": { "type": "integer" },
        "capital_runway_weeks": { "type": ["integer", "null"] },
        "total_inventory_spend_inr": { "type": "number" },
        "total_ad_spend_inr": { "type": "number" },
        "total_revenue_projected_inr": { "type": "number" },
        "total_settlement_receipts_inr": { "type": "number" },
        "net_position_change_inr": { "type": "number" }
      }
    },
    "verdict": {
      "type": "string",
      "enum": ["healthy", "tight", "critical", "insufficient_data"]
    },
    "recommendations": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 3
    },
    "data_gaps": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["plan_date", "projection_weeks", "opening_cash_inr", "weekly_projections", "verdict"]
}
```

---

---


## Execution Steps (CASHFLOW mode)

### Step 1 — Validate Inputs
`unit_cogs_inr` must be confirmed as from margin-calculator or Amit's actuals.
If `weekly_units` is estimated, flag: "Note: velocity is estimated — rerun with actuals."

### Step 2 — Build Week-by-Week Cash Flow

**Inflows per week:**
- Settlement receipts = prior week revenue × (1 - amazon_fee_pct), arriving `settlement_lag_days` after sale week
- Shopify: settlement D+1
- Amazon FBA India: biweekly (every 14 days)

**Outflows per week:**
- Inventory orders: lump sum on `next_order_date` per SKU
- Ad spend: `weekly_ad_spend_inr` each week
- Fixed costs: `fixed_costs_monthly_inr / 4.33` per week

→ See `references/cashflow-model.md` for settlement timing details.

### Step 3 — Identify Stress Points
- `closing_balance_inr < opening_cash_inr × 0.20` → cash_low
- `closing_balance_inr < 0` → cash_negative (critical)
- Week with largest single outflow → inventory_payment stress point

### Step 4 — Generate Verdict
- `healthy`: min_balance > 30% of opening cash, no negative weeks
- `tight`: min_balance 10-30% of opening cash, or 1 week near-negative
- `critical`: any week with negative balance, or runway < 4 weeks
- `insufficient_data`: missing key inputs

### Step 5 — Output
Return CashFlowPlan JSON. Follow with summary table:

```
CASH FLOW PLAN: {period} | {projection_weeks} weeks
═════════════════════════════════════════════════════
Opening:   ₹X,XX,XXX
Closing:   ₹X,XX,XXX  ({+/-} ₹XX,XXX)
Min week:  Week {N} (₹X,XX,XXX — {date})
Verdict:   HEALTHY / TIGHT / CRITICAL

STRESS POINTS:
  Week {N}: ₹{balance} — {description}

TOP RECOMMENDATION: {recommendations[0]}
```

Include disclaimer: "Cash flow projection — actual timing will vary."

---

---


