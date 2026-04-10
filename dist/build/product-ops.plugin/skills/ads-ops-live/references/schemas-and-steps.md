# ads-ops-live — Schemas & Execution Steps

## Input Schema — LIVE Mode

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "asin": { "type": "string" },
    "report_type": { "type": "string", "enum": ["amazon_ppc", "meta_ads"] },
    "period": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "format": "date" },
        "end": { "type": "string", "format": "date" }
      }
    },
    "data_source": { "type": "string", "enum": ["uploaded_csv", "manual"] },
    "search_term_report_csv": { "type": "string", "description": "Path or content of bulk report CSV (preferred)" },
    "campaign_metrics": {
      "type": "object",
      "description": "Summary metrics fallback if CSV not provided. Precedence: CSV wins when both are supplied."
    },
    "target_acos_pct": { "type": "number", "description": "From margin-calculator" },
    "breakeven_acos_pct": { "type": "number", "description": "From margin-calculator" },
    "current_budgets": {
      "type": "array",
      "description": "Per-campaign current daily budget and scaling history for stability checks",
      "items": {
        "type": "object",
        "properties": {
          "campaign_name": { "type": "string" },
          "daily_budget_inr": { "type": "number" },
          "last_scaled_date": { "type": ["string", "null"] },
          "days_at_target_or_better": { "type": "integer" }
        }
      }
    }
  },
  "required": ["product_name", "report_type", "period", "breakeven_acos_pct"]
}
```

---

## Output Schema — CampaignHealthReport

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
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
        "overall_acos_pct": { "type": "number" },
        "overall_roas": { "type": "number" },
        "overall_tacos_pct": { "type": ["number", "null"] },
        "wasted_spend_inr": { "type": "number" },
        "wasted_spend_pct_of_total": { "type": "number" }
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
          "revenue_inr": { "type": "number" },
          "acos_pct": { "type": "number" },
          "roas": { "type": "number" },
          "health": { "type": "string", "enum": ["profitable", "at_target", "above_target", "loss_making", "no_data"] },
          "action": { "type": "string", "enum": ["scale", "hold", "optimise", "pause", "investigate"] },
          "days_at_target_or_better": { "type": "integer" },
          "scale_eligible": { "type": "boolean", "description": "True if campaign meets budget scaling guardrails (stability + min orders)" }
        }
      }
    },
    "by_keyword": {
      "type": "array",
      "description": "Per-keyword bid recommendations. Every action that changes a bid MUST include recommended_bid_inr.",
      "items": {
        "type": "object",
        "properties": {
          "keyword": { "type": "string" },
          "campaign_name": { "type": "string" },
          "match_type": { "type": "string" },
          "current_bid_inr": { "type": "number" },
          "acos_pct": { "type": "number" },
          "orders": { "type": "integer" },
          "spend_inr": { "type": "number" },
          "action": { "type": "string", "enum": ["bid_up", "bid_down", "hold", "negate", "promote_to_exact", "no_change"] },
          "recommended_bid_inr": { "type": ["number", "null"], "description": "Required when action is bid_up/bid_down/promote_to_exact. Null for hold/negate/no_change." },
          "rationale": { "type": "string" }
        }
      }
    },
    "harvested_keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Winners harvested from auto campaigns this period, ready to promote to manual exact"
    },
    "budget_recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "campaign_name": { "type": "string" },
          "current_daily_budget_inr": { "type": "number" },
          "recommended_daily_budget_inr": { "type": "number" },
          "change_pct": { "type": "number", "description": "Capped at scale_max_increase_pct from tuning-constants" },
          "rationale": { "type": "string" },
          "stability_check_passed": { "type": "boolean" }
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
          "action": { "type": "string", "description": "Specific action — name the campaign or keyword, no generic advice" },
          "expected_impact": { "type": "string" }
        }
      }
    }
  },
  "required": ["product_name", "summary", "health_verdict", "recommendations"]
}
```

---

## Execution Steps — LIVE Mode

1. **Load data** — parse bulk report CSV (preferred) or `campaign_metrics` summary. Map columns per `ads-metrics.md §4` (Amazon) or §5 (Meta).
2. **Compute metrics** — ACoS, ROAS, TACoS, CTR, CVR, CPC per `ads-metrics.md §1`.
3. **Classify campaigns** — each campaign's health per `ads-metrics.md §2` using `target_acos_pct` and `breakeven_acos_pct` and the named thresholds from `tuning-constants.md §1`.
4. **Classify keywords** — per `ads-metrics.md §6` keyword action rules using `tuning-constants.md §2` thresholds. For each action that changes a bid (`bid_up`, `bid_down`, `promote_to_exact`), compute `recommended_bid_inr` using the magnitudes from `tuning-constants.md §3`:
   - `bid_up`: `round(current_bid × (1 + bid_up_pct / 100))`
   - `bid_down`: `max(round(current_bid × (1 - bid_down_pct / 100)), min_bid_inr)`
   - `promote_to_exact`: `round(auto_bid × promote_bid_multiplier)`
5. **Budget scaling check** — for each campaign classified `profitable` or `at_target`:
   - Check `days_at_target_or_better >= scale_stability_days_required` (default 7)
   - Check cumulative orders in the stability window `>= scale_min_orders` (default 15)
   - If both pass, compute recommended budget = `current × (1 + scale_max_increase_pct / 100)` (default 25%)
   - Mark `scale_eligible: true` and add to `budget_recommendations[]`
   - Never recommend scaling more than once per 7-day window
6. **Keyword expansion** — from auto campaigns, harvest keywords where `orders >= promote_min_orders AND acos <= target_acos`. Add to `harvested_keywords[]`.
7. **Negative management** — flag search terms meeting negate rules (§6). Do not auto-apply; recommend to the operator.
8. **Overall health verdict** — apply `ads-metrics.md §7` rules using `tuning-constants.md §4` thresholds. Output: healthy / needs_optimisation / critical / insufficient_data.
9. **Generate recommendations** — max 5, ranked by priority (high/medium/low). Each must be specific (name the campaign or keyword) — no generic advice like "lower bids" or "add negatives". High-priority items go first.
10. **Output CampaignHealthReport** — full structure per schema above.

---

## Bid Magnitude Output Contract

Every bid-changing action output must include `recommended_bid_inr`. Example:

```json
{
  "keyword": "wooden pen holder",
  "campaign_name": "Scale_WoodenPenHolder_SP_Manual_Exact_v1",
  "match_type": "exact",
  "current_bid_inr": 6,
  "acos_pct": 18,
  "orders": 12,
  "spend_inr": 420,
  "action": "bid_up",
  "recommended_bid_inr": 7,
  "rationale": "orders=12, acos=18% ≤ target_acos=28% — strong performer, +20% bid per bid_up_pct"
}
```

Never emit `{"action": "bid_up"}` without a number. The team cannot act on an action without a magnitude.