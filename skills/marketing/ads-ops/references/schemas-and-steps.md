# ads-ops — Schemas & Execution Steps

---

## Input Schema — TEST Mode (Domain 2.5)

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "asin": { "type": "string" },
    "selling_price_inr": { "type": "number" },
    "category": { "type": "string" },
    "breakeven_acos_pct": {
      "type": "number",
      "description": "From margin-calculator — required for health classification"
    },
    "target_acos_pct": {
      "type": "number",
      "description": "From margin-calculator — breakeven minus goal profit"
    },
    "phase": {
      "type": "string",
      "enum": ["plan_discovery", "analyze_discovery", "plan_validation", "analyze_validation"]
    },
    "search_term_report_csv": {
      "type": "string",
      "description": "Path or content of Amazon Search Term Report CSV (for analyze phases)"
    },
    "campaign_metrics": {
      "type": "object",
      "description": "Summary metrics if CSV not provided",
      "properties": {
        "impressions": { "type": "integer" },
        "clicks": { "type": "integer" },
        "orders": { "type": "integer" },
        "spend_inr": { "type": "number" },
        "revenue_inr": { "type": "number" }
      }
    }
  },
  "required": ["product_name", "phase"]
}
```

`breakeven_acos_pct` must come from margin-calculator. If not provided, ask — do not estimate.

---

## Output Schema — TestPlan

```json
{
  "type": "object",
  "properties": {
    "plan_id": { "type": "string", "pattern": "AO-TP-[0-9]{8}" },
    "product_name": { "type": "string" },
    "phase": { "type": "string", "enum": ["discovery", "validation"] },
    "campaign": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "type": { "type": "string", "enum": ["auto", "manual_exact", "manual_phrase"] },
        "bid_strategy": { "type": "string", "enum": ["dynamic_down_only", "dynamic_up_and_down", "fixed"] },
        "default_bid_inr": { "type": "number" },
        "budget_daily_inr": { "type": "number" },
        "duration_days": { "type": "integer" }
      }
    },
    "targeting": {
      "type": "object",
      "properties": {
        "keywords": { "type": "array", "items": { "type": "string" } },
        "negative_keywords": { "type": "array", "items": { "type": "string" } }
      }
    },
    "success_criteria": {
      "type": "object",
      "properties": {
        "scale_if": { "type": "string" },
        "hold_if": { "type": "string" },
        "kill_if": { "type": "string" }
      }
    },
    "requires_approval": { "type": "boolean", "const": true }
  },
  "required": ["plan_id", "product_name", "phase", "campaign", "success_criteria"]
}
```

---

## Output Schema — TestResults

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "phase": { "type": "string" },
    "period": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "format": "date" },
        "end": { "type": "string", "format": "date" }
      }
    },
    "summary": {
      "type": "object",
      "properties": {
        "total_spend_inr": { "type": "number" },
        "total_revenue_inr": { "type": "number" },
        "blended_acos_pct": { "type": "number" },
        "blended_roas": { "type": "number" },
        "total_impressions": { "type": "integer" },
        "total_clicks": { "type": "integer" },
        "total_orders": { "type": "integer" },
        "ctr_pct": { "type": "number" },
        "cvr_pct": { "type": "number" },
        "avg_cpc_inr": { "type": "number" }
      }
    },
    "by_keyword": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "keyword": { "type": "string" },
          "impressions": { "type": "integer" },
          "clicks": { "type": "integer" },
          "orders": { "type": "integer" },
          "spend_inr": { "type": "number" },
          "revenue_inr": { "type": "number" },
          "acos_pct": { "type": "number" },
          "cvr_pct": { "type": "number" },
          "cpc_inr": { "type": "number" },
          "action": {
            "type": "string",
            "enum": ["promote_to_exact", "bid_up", "hold", "bid_down", "negate"]
          },
          "bucket": {
            "type": "string",
            "enum": ["winner", "learner", "loser", "no_data"]
          }
        }
      }
    },
    "data_quality": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"]
    },
    "extend_recommended": { "type": "boolean" },
    "viable_keyword_count": { "type": "integer" },
    "recommendation": {
      "type": "string",
      "enum": ["PROCEED_TO_VALIDATION", "EXTEND_DISCOVERY", "READY_FOR_COMPARISON", "EXTEND_VALIDATION", "INSUFFICIENT_DATA"]
    },
    "harvested_keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Keywords promoted from auto to manual (Phase 1 output)"
    },
    "negative_keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Keywords to negate in auto campaign"
    }
  },
  "required": ["product_name", "phase", "summary", "data_quality", "recommendation"]
}
```

---

## Input Schema — LIVE Mode (Domain 4)

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "report_type": { "type": "string", "enum": ["amazon_ppc", "meta_ads"] },
    "period": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "format": "date" },
        "end": { "type": "string", "format": "date" }
      }
    },
    "data_source": { "type": "string", "enum": ["uploaded_csv", "manual"] },
    "target_acos_pct": { "type": "number" },
    "breakeven_acos_pct": { "type": "number" }
  },
  "required": ["product_name", "report_type", "period"]
}
```

---

## Output Schema — CampaignHealthReport (LIVE mode)

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "period": { "type": "object" },
    "summary": {
      "type": "object",
      "properties": {
        "total_spend_inr": { "type": "number" },
        "total_revenue_inr": { "type": "number" },
        "overall_acos_pct": { "type": "number" },
        "overall_roas": { "type": "number" },
        "overall_tacos_pct": { "type": ["number", "null"] },
        "wasted_spend_inr": { "type": "number" }
      }
    },
    "by_campaign": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "campaign_name": { "type": "string" },
          "campaign_type": { "type": "string" },
          "spend_inr": { "type": "number" },
          "acos_pct": { "type": "number" },
          "health": { "type": "string", "enum": ["profitable", "at_target", "above_target", "loss_making", "no_data"] },
          "action": { "type": "string", "enum": ["scale", "hold", "optimise", "pause", "investigate"] }
        }
      }
    },
    "health_verdict": {
      "type": "string",
      "enum": ["healthy", "needs_optimisation", "critical", "insufficient_data"]
    },
    "recommendations": {
      "type": "array",
      "maxItems": 5,
      "items": {
        "type": "object",
        "properties": {
          "priority": { "type": "string", "enum": ["high", "medium", "low"] },
          "action": { "type": "string" },
          "expected_impact": { "type": "string" }
        }
      }
    }
  },
  "required": ["product_name", "summary", "health_verdict", "recommendations"]
}
```

---

## Execution Steps — TEST Mode

1. **Load config** — read `ppc-test-campaign-config.ctx.json` for phase params
2. **Plan phase** — generate TestPlan from config defaults + product inputs; await approval
3. **After team executes** — receive Search Term Report CSV or manual metrics
4. **Analyze** — compute per-keyword metrics using `reference/ads-metrics.md` formulas
5. **Classify keywords** — 4-bucket framework (winner/learner/loser/no_data) per ads-metrics.md
6. **Rate data quality** — compare against config thresholds (HIGH/MEDIUM/LOW)
7. **Output TestResults** — harvested keywords, negatives, data quality, recommendation

## Execution Steps — LIVE Mode

1. **Load data** — parse CSV or manual input; map columns per `reference/ads-metrics.md` §5
2. **Compute metrics** — ACoS, ROAS, TACoS, CTR, CVR per `reference/ads-metrics.md` §1
3. **Classify campaigns** — health status using target/breakeven ACoS thresholds
4. **Keyword analysis** — bid adjustments per keyword action rules
5. **Generate recommendations** — max 5, specific to campaigns/keywords (no generic advice)
6. **Output CampaignHealthReport**
