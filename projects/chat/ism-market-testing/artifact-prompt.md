# Artifact Prompt — ISM Market Testing

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a unified Market Testing artifact for Ismokraft covering Domain 2.5 (Test Listing through Scale Decision). This artifact is the primary interface for campaign planning, performance monitoring, and scale decisions.

### Views

1. **Product Intake** — Input Amazon listing URL or paste product data. Preview extracted ListingRecord fields (ASIN, title, bullets, price, BSR, rating, implicit keywords). Import Helium10/Jungle Scout CSV — preview parsed KeywordSet with intent classification and dedup stats. Validate data completeness before proceeding.

2. **Campaign Planner** — Configure campaigns using Amazon Ads-aligned fields (from `amazon-ads-campaign-fields.ctx.json`). Generate 3-5 scenario flavors (Conservative, Balanced, Aggressive, Keyword-focused, Custom) with comparison table showing: total budget, duration, risk level, data quality potential, forecast. Select scenario, review full CampaignPlan details, approve. "Save to CRM" button creates 1 Campaigns record (strategy) + N Amazon_Ad_Campaigns records (individual campaigns) via clipboard bridge.

3. **Performance Monitor** — Daily metrics import (paste CSV or enter manually). Trend charts: ACoS, CTR, CVR, CPC over time (Recharts line charts). Day-over-day and cumulative comparisons. Anomaly flags with visual indicators (spend spike, ACoS jump, CTR drop, zero-order days). Budget pacing bar (spent vs remaining vs total). Per-campaign breakdown for multi-campaign scenarios.

4. **Keyword Analyzer** — Per-keyword performance breakdown table with sortable columns. 4-bucket classification (winner/learner/loser/no_data) with color coding. Bid recommendation per keyword based on ACoS vs target. Intent class filter (brand/competitor/generic/long_tail). Negative keyword list builder. Export keyword report for Seller Central actions.

5. **Scale Decision** — Gate 2 Path A/B analysis (Path A: orders + CVR, Path B: impressions + CTR). Cost comparison: estimate vs actual vs test economics (from margin-calculator COMPARISON). Costing scenarios at different MOQ/price points. Compliance timeline check. Scale/kill/pivot recommendation with supporting evidence. "Approve Scale" / "Kill Product" action buttons.

### AI Insights Panel

- Summarize keyword performance patterns (which intent classes convert best)
- Suggest bid adjustments based on ACoS trends
- Predict Gate 2 outcome likelihood from current data trajectory
- Flag data quality risks (insufficient volume, too few keywords)
- Powered by Anthropic API if available; static analysis fallback otherwise

### Action Buttons

- **Export JSON** — copies full state payload to clipboard (required fallback)
- **Import JSON** — prompts for JSON paste, restores state
- **Share to Slack** — generates formatted mrkdwn summary for the active view, copies to clipboard. User pastes to Claude for routing through slack-messaging skill.
- **Save to CRM** — generates structured payload for Campaigns + Amazon_Ad_Campaigns modules. User pastes to Claude for routing through zoho-data-ops skill.
- **Approve Plan** — changes plan status to Approved in state, generates CRM update payload for both modules
- **Start Campaign** — changes strategy status to Active, generates CRM update payload

### Storage Keys

- `ism:config:market-testing` — PPC thresholds, Gate 2 criteria, phase config, scenario template defaults
- `ism:market-testing:state` — full artifact state (active view, all form data)
- `ism4_p:{productId}:listing` — ListingRecord per product
- `ism4_p:{productId}:keywords` — imported KeywordSet per product
- `ism4_p:{productId}:scenarios` — generated CampaignScenario[] per product
- `ism4_p:{productId}:strategy` — selected Campaigns record (strategy) + aggregate metrics
- `ism4_p:{productId}:campaigns` — Amazon_Ad_Campaigns records + daily metrics per campaign
- `ism4_p:{productId}:scale-decision` — Gate 2 analysis data

### Config Loading

Load configuration from `ism:config:market-testing` storage key (seeded from project context files). Authoritative sources:
- Gate 2 criteria: `gate-criteria.ctx.json`
- PPC config, scenario templates, thresholds: `ppc-test-campaign-config.ctx.json`
- Financial constants: `financial-constants.ctx.json`

If storage key is empty (first load), use these **fallback defaults** until context is seeded:

```json
{
  "gate2_path_a": { "min_orders": 10, "min_cvr": 0.05 },
  "gate2_path_b": { "min_impressions": 500, "min_ctr": 0.003 },
  "target_acos_test": 0.40,
  "phases": ["Discovery", "Validation", "Scale"],
  "keyword_thresholds": {
    "scale_acos_max": 0.30,
    "pause_acos_min": 0.50,
    "kill_spend_no_sales": 500
  },
  "scenario_defaults": {
    "conservative": { "daily_budget": 400, "duration": 10 },
    "balanced": { "daily_budget": 750, "duration": 12 },
    "aggressive": { "daily_budget": 1500, "duration": 14 },
    "keyword_focused": { "daily_budget": 1000, "duration": 12 }
  },
  "anomaly_thresholds": {
    "spend_spike_pct": 1.5,
    "acos_jump_pp": 20,
    "ctr_drop_pct": 0.5
  }
}
```

These are fallback values only. Always prefer context-seeded storage when available.

### Generate

`market-testing-v1.0.artifact.tsx`
