# margin-calculator — Offloaded Schemas & Execution Steps
# Extracted from SKILL.md on 2026-03-15 to reduce SKILL.md to <500 lines.
# This file is the authoritative source for these sections.

---

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "selling_price_inr": { "type": "number", "description": "MRP / listed price" },
    "cogs_inr": { "type": "number", "description": "Total landed cost per unit" },
    "weight_grams": { "type": "integer", "description": "Actual product weight" },
    "category": { "type": "string", "description": "Amazon category — determines referral fee" },
    "fulfillment_model": {
      "type": "string",
      "enum": ["fba", "self_ship", "easy_ship"],
      "default": "fba"
    },
    "discount_pct": { "type": "number", "description": "Default: 10%" },
    "weekly_ad_spend_inr": { "type": "number", "description": "Optional — for ACoS/ROAS calculation" }
  },
  "required": ["product_name", "selling_price_inr", "cogs_inr", "weight_grams", "category"]
}
```

**Never estimate COGS.** If not provided, ask. Do not proceed with guessed COGS.

---


## Output Schema

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "inputs_used": {
      "type": "object",
      "description": "All inputs with flag: actual vs default"
    },
    "unit_economics": {
      "type": "object",
      "properties": {
        "selling_price_inr": { "type": "number" },
        "discount_inr": { "type": "number" },
        "net_sp_inr": { "type": "number" },
        "cogs_inr": { "type": "number" },
        "gross_margin_inr": { "type": "number" },
        "gross_margin_pct": { "type": "number" },
        "deductions": {
          "type": "object",
          "properties": {
            "referral_fee_inr": { "type": "number" },
            "closing_fee_inr": { "type": "number" },
            "weight_handling_inr": { "type": "number" },
            "packaging_shipping_inr": { "type": "number" },
            "gst_on_fees_inr": { "type": "number" },
            "cod_payment_gateway_inr": { "type": "number" },
            "total_deductions_inr": { "type": "number" }
          }
        },
        "net_profit_inr": { "type": "number" },
        "net_margin_pct": { "type": "number" },
        "investment_cost_inr": { "type": "number" },
        "roi_pct": { "type": "number" }
      }
    },
    "paid_acquisition": {
      "type": "object",
      "properties": {
        "target_acos_pct": { "type": "number" },
        "breakeven_acos_pct": { "type": "number" },
        "cpa_max_inr": { "type": "number" },
        "breakeven_roas": { "type": "number" }
      }
    },
    "ltv": {
      "type": "object",
      "properties": {
        "ltv_orders": { "type": "integer" },
        "ltv_inr": { "type": "number" },
        "blended_profit_per_order_inr": { "type": "number" },
        "ltv_cac_ratio": { "type": ["number", "null"] }
      }
    },
    "verdict": {
      "type": "string",
      "enum": ["PASS", "MARGINAL", "FAIL"]
    },
    "verdict_detail": {
      "type": "object",
      "properties": {
        "net_margin_check": { "type": "boolean" },
        "price_check": { "type": "boolean" },
        "ltv_cac_check": { "type": ["boolean", "null"] }
      }
    },
    "cogs_target_for_vendor_discovery": {
      "type": "number",
      "description": "COGS threshold to pass to vendor-discovery"
    },
    "gaps": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional inputs that were absent at calculation time — stated as field names"
    },
    "execution_trace": {
      "skill": "margin-calculator",
      "version": "1.1.0",
      "fingerprint": "margin-calculator:{product_name}:{YYYY-MM-DD}",
      "steps_executed": ["fee_calculation", "margin_computation", "viability_check"],
      "systems_read": ["bigin_pipelines"],
      "systems_written": ["slack"],
      "decision_summary": "Financial_Viability={Pass|Marginal|Fail}. Net margin {X}%. Breakeven ROAS {X}.",
      "kpi_delta": [{"id": "KPI-SKILL-MC-02", "value": "{Pass|Marginal|Fail}"}],
      "anomaly_flag": false,
      "status": "success"
    }
  },
  "required": ["product_name", "unit_economics", "verdict", "gaps", "execution_trace"]
}
```

---