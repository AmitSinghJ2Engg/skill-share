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

---

## Input Schema — SCENARIO Mode (Domain 2.5 — Campaign Planning)

```json
{
  "type": "object",
  "properties": {
    "listing_record": {
      "type": "object",
      "description": "From product-discover LISTING_PARSE",
      "properties": {
        "asin": { "type": "string" },
        "title": { "type": "string" },
        "bullets": { "type": "array", "items": { "type": "string" } },
        "price_inr": { "type": "number" },
        "brand": { "type": "string" },
        "category": { "type": "string" },
        "bsr": { "type": ["number", "null"] },
        "rating": { "type": ["number", "null"] },
        "review_count": { "type": ["number", "null"] },
        "implicit_keywords": { "type": "array", "items": { "type": "string" } },
        "competitor_asins": { "type": "array", "items": { "type": "string" } },
        "review_themes": {
          "type": "object",
          "properties": {
            "positive": { "type": "array", "items": { "type": "string" } },
            "negative": { "type": "array", "items": { "type": "string" } }
          }
        },
        "data_completeness_pct": { "type": "number" }
      }
    },
    "keyword_sets": {
      "type": "array",
      "description": "From ikraft-keyword-intelligence IMPORT or GENERATE",
      "items": {
        "type": "object",
        "properties": {
          "keyword": { "type": "string" },
          "demand_estimate": { "type": ["number", "null"] },
          "competition_estimate": { "type": ["number", "null"] },
          "intent_class": { "type": "string", "enum": ["brand", "competitor", "generic", "long_tail"] },
          "h10_score": { "type": ["number", "null"] },
          "organic_rank": { "type": ["number", "null"] },
          "sponsored_rank": { "type": ["number", "null"] }
        }
      }
    },
    "budget_constraints": {
      "type": "object",
      "properties": {
        "total_budget_inr": { "type": "number" },
        "daily_budget_max_inr": { "type": "number" },
        "duration_max_days": { "type": "integer" }
      },
      "required": ["total_budget_inr"]
    },
    "breakeven_acos_pct": { "type": "number" },
    "target_acos_pct": { "type": "number" }
  },
  "required": ["listing_record", "budget_constraints", "breakeven_acos_pct"]
}
```

---

## Output Schema — CampaignPlan (SCENARIO mode)

```json
{
  "type": "object",
  "properties": {
    "campaign_name": { "type": "string" },
    "start_date": { "type": "string", "format": "date" },
    "end_date": { "type": "string", "format": "date" },
    "country": { "type": "string", "enum": ["IN", "US"] },
    "daily_budget_inr": { "type": "number" },
    "bidding_strategy": {
      "type": "string",
      "enum": ["dynamic_up_and_down", "dynamic_down_only", "fixed"]
    },
    "bid_adjustments": {
      "type": "object",
      "properties": {
        "top_of_search_pct": { "type": "number" },
        "product_pages_pct": { "type": "number" },
        "rest_of_search_pct": { "type": "number" }
      }
    },
    "ad_groups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ad_group_name": { "type": "string" },
          "products": { "type": "array", "items": { "type": "string" }, "description": "ASINs" },
          "targeting_type": { "type": "string", "enum": ["auto", "manual_exact", "manual_phrase", "manual_broad"] },
          "default_bid_inr": { "type": "number" }
        }
      }
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "keyword": { "type": "string" },
          "match_type": { "type": "string", "enum": ["exact", "phrase", "broad"] },
          "bid_inr": { "type": ["number", "null"] }
        }
      }
    },
    "negative_keywords": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "keyword": { "type": "string" },
          "match_type": { "type": "string", "enum": ["negative_exact", "negative_phrase"] }
        }
      }
    },
    "excluded_asins": { "type": "array", "items": { "type": "string" } },
    "forecast": {
      "type": "object",
      "properties": {
        "estimated_impressions": { "type": "integer" },
        "estimated_clicks": { "type": "integer" },
        "estimated_orders_low": { "type": "integer" },
        "estimated_orders_high": { "type": "integer" },
        "estimated_total_spend_inr": { "type": "number" },
        "estimated_acos_low_pct": { "type": "number" },
        "estimated_acos_high_pct": { "type": "number" }
      }
    },
    "risk_assessment": {
      "type": "object",
      "properties": {
        "risk_level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH"] },
        "data_quality_potential": { "type": "string", "enum": ["HIGH", "MEDIUM", "LOW"] },
        "budget_efficiency_rating": { "type": "string", "enum": ["HIGH", "MEDIUM", "LOW"] }
      }
    }
  },
  "required": ["campaign_name", "daily_budget_inr", "bidding_strategy", "ad_groups"]
}
```

---

## Output Schema — CampaignScenario (SCENARIO mode wrapper)

```json
{
  "type": "object",
  "properties": {
    "scenario_id": { "type": "string", "pattern": "AO-SC-[0-9]{8}-[0-9]{2}" },
    "scenario_type": {
      "type": "string",
      "enum": ["conservative", "balanced", "aggressive", "keyword_focused", "custom"]
    },
    "label": { "type": "string", "description": "Human-readable scenario name" },
    "goal": { "type": "string", "description": "Primary objective of this scenario" },
    "campaigns": {
      "type": "array",
      "items": { "$ref": "#CampaignPlan" },
      "description": "One or more CampaignPlan objects in this scenario"
    },
    "total_budget_inr": { "type": "number" },
    "total_duration_days": { "type": "integer" },
    "rank": { "type": "integer", "description": "1 = recommended" },
    "recommendation_reason": { "type": "string" }
  },
  "required": ["scenario_id", "scenario_type", "campaigns", "total_budget_inr"]
}
```

---

## Execution Steps — SCENARIO Mode

1. **Load config** — read `ppc-test-campaign-config.ctx.json` for scenario templates, bid defaults, naming conventions
2. **Load field reference** — read `amazon-ads-campaign-fields.ctx.json` for Amazon Ads field alignment
3. **Validate inputs** — ListingRecord must have ASIN + title; budget_constraints must have total_budget_inr; breakeven_acos_pct required
4. **Generate scenarios** — for each scenario type (conservative, balanced, aggressive, keyword_focused):
   - Apply template defaults from config
   - Build CampaignPlan(s) with Amazon Ads-compliant fields
   - Calculate forecast estimates from keyword data + bid levels
   - Assess risk based on budget exposure and data quality potential
5. **Rank scenarios** — score by: budget efficiency (spend vs expected learnings), risk level, Gate 2 alignment
6. **Output CampaignScenario[]** — sorted by rank; include comparison table summary
7. **Await selection** — user picks a scenario; saved to CRM via zoho-data-ops as 1 Campaigns record (strategy) + N Amazon_Ad_Campaigns records (individual campaigns)
