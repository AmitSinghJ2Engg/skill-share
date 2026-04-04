# revenue-ops — Offloaded Schemas & Execution Steps
# Extracted from SKILL.md on 2026-03-15 to reduce SKILL.md to <500 lines.
# This file is the authoritative source for these sections.

---

## Input Schema (SALES mode)

```json
{
  "type": "object",
  "properties": {
    "report_type": {
      "type": "string",
      "enum": ["summary", "by_asin", "by_category", "by_channel", "trend", "comparison"]
    },
    "period": {
      "type": "string",
      "description": "today | this_week | last_week | this_month | last_month | YTD | custom (YYYY-MM-DD to YYYY-MM-DD)"
    },
    "channel": {
      "type": "string",
      "enum": ["all", "amazon", "shopify", "flipkart", "meesho"],
      "default": "all"
    },
    "asin_filter": { "type": "array", "items": { "type": "string" } },
    "compare_to": {
      "type": "string",
      "enum": ["previous_period", "same_period_last_year", "target"]
    },
    "data_source": {
      "type": "string",
      "enum": ["zoho_analytics", "uploaded_file", "manual"],
      "default": "zoho_analytics"
    }
  },
  "required": ["report_type", "period"]
}
```

If `report_type` and `period` are missing, ask before proceeding.

---

---


## Output Schema — SalesReport JSON

```json
{
  "type": "object",
  "properties": {
    "report_id": { "type": "string", "pattern": "SA-[0-9]{8}-[0-9]{3}" },
    "report_type": { "type": "string" },
    "period": { "type": "object", "properties": { "start": {}, "end": {} } },
    "channel": { "type": "string" },
    "generated_at": { "type": "string", "format": "date" },

    "summary": {
      "type": "object",
      "properties": {
        "total_revenue_inr": { "type": "number" },
        "total_units": { "type": "number" },
        "avg_order_value_inr": { "type": "number" },
        "total_orders": { "type": "number" },
        "gross_margin_inr": { "type": ["number", "null"] },
        "gross_margin_pct": { "type": ["number", "null"] },
        "returns_count": { "type": ["number", "null"] },
        "return_rate_pct": { "type": ["number", "null"] }
      }
    },

    "by_asin": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "asin": { "type": "string" },
          "product_name": { "type": "string" },
          "units": { "type": "number" },
          "revenue_inr": { "type": "number" },
          "revenue_pct_of_total": { "type": "number" },
          "avg_selling_price": { "type": "number" },
          "gross_margin_pct": { "type": ["number", "null"] },
          "trend": { "type": "string", "enum": ["growing", "stable", "declining", "unknown"] }
        }
      }
    },

    "by_channel": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "channel": { "type": "string" },
          "units": { "type": "number" },
          "revenue_inr": { "type": "number" },
          "revenue_pct_of_total": { "type": "number" },
          "avg_order_value": { "type": "number" }
        }
      }
    },

    "trend_data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "period_label": { "type": "string" },
          "revenue_inr": { "type": "number" },
          "units": { "type": "number" },
          "period_over_period_growth_pct": { "type": ["number", "null"] }
        }
      }
    },

    "comparison": {
      "type": "object",
      "properties": {
        "compare_to": { "type": "string" },
        "revenue_delta_inr": { "type": ["number", "null"] },
        "revenue_delta_pct": { "type": ["number", "null"] },
        "units_delta": { "type": ["number", "null"] },
        "units_delta_pct": { "type": ["number", "null"] }
      }
    },

    "kpi_actuals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "kpi_name": { "type": "string" },
          "actual_value": { "type": "number" },
          "unit": { "type": "string" },
          "period": { "type": "string" }
        }
      }
    },

    "insights": {
      "type": "array",
      "maxItems": 3,
      "items": { "type": "string" }
    },
    "data_gaps": { "type": "array", "items": { "type": "string" } },
    "execution_trace": {
      "skill": "sales-analytics",
      "version": "1.1.0",
      "fingerprint": "sales-analytics:{channel}:{period}:{YYYY-MM-DD}",
      "steps_executed": ["data_collection", "normalisation", "metrics_computation", "kpi_extraction", "actuals_push", "insights", "output"],
      "systems_read": ["zoho_analytics"],
      "systems_written": ["okr-kpi-governance"],
      "decision_summary": "Revenue ₹{X} | Units {N} | Channels: {channels}. KPI actuals: {pushed|pending}.",
      "kpi_delta": [{"id": "KPI-SKILL-SA-02", "value": "{synced|pending}"}, {"id": "KPI-SKILL-SA-03", "value": "{N} channels"}],
      "anomaly_flag": false,
      "status": "success"
    }
  },
  "required": ["report_id", "report_type", "period", "summary", "data_gaps", "execution_trace"]
}
```

---

---


## Execution Steps (SALES mode)

### Step 1 — Collect Data
**Source: zoho_analytics (default)**
```
ZohoAnalytics_getAllWorkspaces() → identify Ismokraft workspace
ZohoAnalytics_getViews(workspace_id) → find sales-related views
ZohoAnalytics_createExportJobSQLQuery(
  query: "SELECT * FROM [sales_view] WHERE order_date BETWEEN '{start}' AND '{end}'"
)
ZohoAnalytics_downloadExportedData(job_id) → get raw records
```
**Source: uploaded_file** — Parse CSV/Excel. Map columns per `references/metrics-reference.md` §3.
**Source: manual** — Accept figures directly. Mark all in data_gaps: "manually entered — not from system."

### Step 2 — Compute Metrics
Apply formulas from `references/metrics-reference.md`. Show calculation basis.
Gross margin requires COGS. If COGS not available, leave null and note in data_gaps. Do not estimate.

### Step 3 — Build Trend (if trend or comparison requested)
State clearly: "Prior period: {date range}. Current period: {date range}."
Trend requires ≥2 periods — if only one period available, skip and note.

### Step 4 — Extract KPI Actuals
| Computed value | KPI name |
|---|---|
| total_revenue_inr | gross_revenue |
| total_units | units_sold |
| avg_order_value_inr | average_order_value |
| return_rate_pct | return_rate |

### Step 5 — Push Actuals to OKR System (on confirmation)
If KPIs are registered in okr-kpi-governance:
Call `evaluate_kpi_performance` for each KPI in kpi_actuals[].
If not available, output kpi_actuals[] for manual entry.

### Step 6 — Generate Insights
Max 3 observations. One sentence each.
Focus on: highest performer, biggest mover, most notable anomaly.

### Step 7 — Output
Return full SalesReport JSON. Follow with formatted summary block:

```
SALES REPORT: [Period] | [Channel]
═══════════════════════════════════
Revenue:     ₹X,XX,XXX   [▲/▼ X% vs prior]
Units:       X,XXX       [▲/▼ X% vs prior]
AOV:         ₹X,XXX
Margin:      XX% [if available]

TOP ASIN:    [name]  ₹XX,XXX  (XX% of revenue)
BOTTOM ASIN: [name]  ₹X,XXX   (X% of revenue)

INSIGHTS:
1. [observation]
2. [observation]
3. [observation]
```

### Step 8 — KPI Update (Closing Step)

End every response with:

```
KPI delta this run:
  - KPI-SKILL-SA-02 (Actuals Sync Rate): {synced to okr-kpi-governance | pending — say "push KPI actuals" to sync}
    Status: {on-track — synced | pending — not yet pushed}
  - KPI-SKILL-SA-03 (Revenue Attribution Completeness): {N} channels reported — {channels listed}
    Status: {on-track — ≥2 channels | at-risk — single channel only}

To push these actuals to the KPI registry, say: "push KPI actuals"
and I will invoke okr-kpi-governance.
```

Note: KPI-SKILL-SA-01 (Trigger Accuracy) is measured by ikraft-skill-intelligence — do not report it here.

Also append the `execution_trace` block from the SalesReport JSON output at the end of every response.

---

---


## Input Schema (RECONCILE mode)

```json
{
  "type": "object",
  "properties": {
    "settlement_file": {
      "type": "string",
      "description": "Amazon settlement CSV — upload or paste. Required."
    },
    "books_data": {
      "type": "string",
      "description": "Zoho Books sales data for the same period. Optional — will attempt MCP pull if not provided."
    },
    "settlement_period": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "format": "date" },
        "end": { "type": "string", "format": "date" }
      },
      "required": ["start", "end"]
    },
    "marketplace": {
      "type": "string",
      "enum": ["amazon_india", "amazon_global"],
      "default": "amazon_india"
    }
  },
  "required": ["settlement_file", "settlement_period"]
}
```

If `settlement_file` is missing, ask for it. Do not proceed without it.
If `books_data` is missing, attempt Zoho Books pull via MCP first. If that fails, proceed settlement-only and mark `reconciliation.status = "incomplete"`.

---

---


## Output Schema — ReconciliationReport JSON

```json
{
  "type": "object",
  "properties": {
    "settlement_id": { "type": "string" },
    "period": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "format": "date" },
        "end": { "type": "string", "format": "date" }
      }
    },
    "marketplace": { "type": "string" },
    "report_date": { "type": "string", "format": "date" },
    "settlement_summary": {
      "type": "object",
      "properties": {
        "gross_product_sales": { "type": "number" },
        "total_fees_charged": { "type": "number" },
        "total_adjustments": { "type": "number" },
        "net_settlement_amount": { "type": "number" },
        "transaction_count": { "type": "integer" }
      }
    },
    "books_summary": {
      "type": "object",
      "properties": {
        "recorded_revenue": { "type": ["number", "null"] },
        "recorded_fees": { "type": ["number", "null"] },
        "unrecorded_transactions": { "type": ["integer", "null"] },
        "data_source": {
          "type": "string",
          "enum": ["zoho_books_mcp", "uploaded", "zoho_analytics", "unavailable"]
        }
      }
    },
    "reconciliation": {
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["reconciled", "discrepancies_found", "incomplete"] },
        "matched_transactions": { "type": "integer" },
        "unmatched_settlement_lines": { "type": "integer" },
        "unmatched_books_entries": { "type": "integer" },
        "revenue_delta_inr": { "type": "number" },
        "fee_delta_inr": { "type": "number" }
      }
    },
    "discrepancies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "discrepancy_id": { "type": "string", "pattern": "DISC-[0-9]{3}" },
          "type": {
            "type": "string",
            "enum": [
              "fee_overcharge", "missing_in_books", "missing_in_settlement",
              "amount_mismatch", "unrecognized_line_type"
            ]
          },
          "settlement_line_type": { "type": "string" },
          "settlement_amount": { "type": ["number", "null"] },
          "books_amount": { "type": ["number", "null"] },
          "delta_inr": { "type": "number" },
          "order_id": { "type": ["string", "null"] },
          "description": { "type": "string" },
          "action_required": { "type": "string" },
          "severity": { "type": "string", "enum": ["high", "medium", "low"] }
        }
      }
    },
    "fee_audit": {
      "type": "object",
      "properties": {
        "referral_fees_charged": { "type": "number" },
        "referral_fees_expected": { "type": ["number", "null"] },
        "referral_fee_delta": { "type": ["number", "null"] },
        "fba_fees_charged": { "type": "number" },
        "closing_fees_charged": { "type": "number" },
        "weight_handling_charged": { "type": "number" },
        "other_fees": { "type": "number" },
        "gst_on_fees": { "type": "number" },
        "fee_audit_note": { "type": "string" }
      }
    },
    "action_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item": { "type": "string" },
          "priority": { "type": "string", "enum": ["high", "medium", "low"] },
          "owner": { "type": "string", "enum": ["Amit", "zoho-developer", "accountant"] }
        }
      }
    },
    "data_gaps": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["settlement_id", "period", "settlement_summary", "reconciliation", "action_items"]
}
```

---

---


## Execution Steps (RECONCILE mode)

### Step 1 — Parse Settlement File
Read the settlement CSV. Map columns per `references/settlement-schema.md`.
Group by `transaction_type`:
- `Order` — product sales (principal, tax, shipping)
- `Refund` — return credits
- `Transfer` — actual bank transfer
- `FBA Inventory Fee` / `Subscription` / `Adjustment` — fee types

Compute `settlement_summary` from these groups.

### Step 2 — Pull Books Data
```
Zoho Books via ZohoAnalytics MCP (if connected):
  ZohoAnalytics_createExportJobSQLQuery(
    "SELECT * FROM books_invoices WHERE date BETWEEN {start} AND {end} AND marketplace='Amazon India'"
  )
```

If Books MCP unavailable: `books_summary.data_source = "unavailable"`.
Proceed with settlement-only analysis. Set `reconciliation.status = "incomplete"`.

### Step 3 — Match Transactions
For each Order transaction in settlement:
- Find corresponding Books invoice by order_id
- Compare settlement amount vs Books invoice amount
- Matched if within ₹1 (rounding tolerance)
- Unmatched → discrepancy: `missing_in_books` or `amount_mismatch`

For each Books invoice not found in settlement:
- Add discrepancy: `missing_in_settlement`

### Step 4 — Fee Audit
For each fee category in settlement:
- Compare against expected fee rates from `references/reconciliation-rules.md` §2
- Flag overcharge > ₹10 per transaction or > ₹500 aggregate
- Record in `fee_audit` block

### Step 5 — Flag Discrepancies
Assign severity:
- `high`: missing transaction > ₹1,000 | fee overcharge > ₹500 | unrecognized line type
- `medium`: amount mismatch ₹100–999 | fee variance ₹50–499
- `low`: rounding differences < ₹100 | cosmetic mismatches

Generate `action_items` for all high-severity discrepancies.

### Step 6 — Slack Alert (if high-severity discrepancies found)

Format via `slack-messaging` skill, then post to `#ismo-gen-alerts`. Include: period, net delta, high-severity count, top action item.

Routine reconciliation summary → format via `slack-messaging`, post to `#ism-launch-reports`.

### Step 7 — Output
Return full ReconciliationReport JSON. Follow with summary block:

```
RECONCILIATION: {settlement_id} | {period}
══════════════════════════════════════════
Settlement net:   ₹X,XX,XXX
Books recorded:   ₹X,XX,XXX  [or UNAVAILABLE]
Delta:            ₹XX,XXX    [▲ overpaid | ▼ underpaid | ✅ balanced]

Status:           RECONCILED | X DISCREPANCIES | INCOMPLETE
Matched:          X of X transactions
Unmatched:        X (high: X, medium: X, low: X)

Fee audit:
  Referral:   ₹XX,XXX  [✅ correct | ⚠️ ₹X overcharge]
  FBA:        ₹XX,XXX  [✅ correct | ⚠️ ₹X overcharge]
  GST:        ₹XX,XXX
  Total fees: ₹XX,XXX

TOP ACTION: {action_items[0].item}
```

---

---


## Input Schema (RETURNS mode)

```json
{
  "type": "object",
  "properties": {
    "data_source": {
      "type": "string",
      "enum": ["amazon_returns_report", "manual", "uploaded_csv"]
    },
    "period": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "format": "date" },
        "end": { "type": "string", "format": "date" }
      }
    },
    "sku_filter": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Defaults to all SKUs if omitted"
    },
    "channel": {
      "type": "string",
      "enum": ["amazon", "shopify", "all"],
      "default": "amazon"
    },
    "unit_net_profit_inr": {
      "type": ["number", "null"],
      "description": "From margin-calculator — for margin impact calculation"
    }
  },
  "required": ["data_source", "period"]
}
```

---

---


## Output Schema — ReturnsReport JSON

```json
{
  "type": "object",
  "properties": {
    "report_id": { "type": "string", "pattern": "RT-[0-9]{8}-[0-9]{3}" },
    "period": { "type": "object" },
    "channel": { "type": "string" },
    "report_date": { "type": "string", "format": "date" },

    "summary": {
      "type": "object",
      "properties": {
        "total_units_sold": { "type": "integer" },
        "total_units_returned": { "type": "integer" },
        "overall_return_rate_pct": { "type": "number" },
        "total_refund_value_inr": { "type": "number" },
        "margin_impact_inr": { "type": ["number", "null"] },
        "account_health_risk": {
          "type": "string",
          "enum": ["low", "medium", "high", "critical"]
        }
      }
    },

    "by_sku": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": { "type": "string" },
          "product_name": { "type": "string" },
          "units_sold": { "type": "integer" },
          "units_returned": { "type": "integer" },
          "return_rate_pct": { "type": "number" },
          "primary_return_reason": { "type": "string" },
          "return_reasons_breakdown": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "reason_code": { "type": "string" },
                "count": { "type": "integer" },
                "pct": { "type": "number" }
              }
            }
          },
          "margin_impact_inr": { "type": ["number", "null"] },
          "risk_level": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
          "root_cause": { "type": "string", "description": "One sentence diagnosis" },
          "corrective_action": { "type": "string", "description": "One sentence specific fix" }
        }
      }
    },

    "return_reasons_aggregate": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "reason_code": { "type": "string" },
          "reason_label": { "type": "string" },
          "count": { "type": "integer" },
          "pct_of_total_returns": { "type": "number" },
          "root_cause_category": {
            "type": "string",
            "enum": ["product_quality", "listing_accuracy", "packaging", "fulfillment", "customer_error", "counterfeit"]
          }
        }
      }
    },

    "account_health": {
      "type": "object",
      "properties": {
        "estimated_odr_pct": { "type": ["number", "null"] },
        "odr_threshold_amazon": { "type": "number", "description": "1.0% — breach = suspension risk" },
        "asin_at_risk": { "type": "array", "items": { "type": "string" } },
        "suspension_risk": { "type": "string", "enum": ["low", "medium", "high"] }
      }
    },

    "recommendations": {
      "type": "array",
      "maxItems": 5,
      "items": {
        "type": "object",
        "properties": {
          "priority": { "type": "string", "enum": ["high", "medium", "low"] },
          "sku": { "type": "string" },
          "action": { "type": "string" },
          "root_cause_addressed": { "type": "string" },
          "owner": {
            "type": "string",
            "enum": ["listing", "product", "packaging", "supplier", "ops"]
          }
        }
      }
    },

    "data_gaps": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["report_id", "period", "summary", "by_sku", "recommendations", "data_gaps"]
}
```

---

---


## Execution Steps (RETURNS mode)

### Step 1 — Load Data
Parse uploaded Amazon returns report or Amit's manual data.
Map return reason codes per `references/returns-intelligence.md` §1 reason taxonomy.

### Step 2 — Compute Rates
For each SKU: `return_rate_pct = (units_returned / units_sold) × 100`
Compare to benchmarks from `references/returns-intelligence.md` §2. Flag SKUs above threshold.

### Step 3 — Root Cause Classification
For each SKU, assign `root_cause_category` per reason taxonomy.
Identify `primary_return_reason` (highest count reason code).
Write one-sentence root cause: "High return rate driven by {category}: {specific pattern}."
**Root cause ≠ return reason.** Reason = what customer says. Root cause = underlying operational/product failure.

### Step 4 — Margin Impact
If `unit_net_profit_inr` provided (from margin-calculator):
```
margin_impact_inr = units_returned × unit_net_profit_inr
```
If not provided, set null.

### Step 5 — Account Health Assessment
Estimate ODR from A-to-Z claims + chargebacks + negative feedback (if data available).
Compare to Amazon's ODR threshold (1.0%). Classify suspension risk.
Flag ASINs with return_rate > category benchmark as `asin_at_risk`.
If data is partial, mark estimated_odr_pct as estimate in data_gaps.

### Step 6 — Generate Recommendations
Max 5, ordered by priority. Each must name a specific SKU and a specific action.
Example: "Update listing images for SKU XYZ to show scale/size clearly — primary return reason is 'not as described: size'."

### Step 7 — Output and Notification
Return full ReturnsReport JSON. The `by_sku[].risk_level` field carries the high-risk flag.
Artifact layer handles any Bigin field update via Zoho Flow — do not call Bigin write tools.

If any SKU `risk_level = high` or `critical`, format alert via `slack-messaging` skill and post to `#ism-launch-alerts`. Include: SKU, return rate %, top reason, risk level, action.
Idempotent: check prior alert thread before posting — do not duplicate for same SKU+date.

---

---


