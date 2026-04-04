# Artifact Prompt — ISM Market Testing

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a unified Market Testing artifact for Ismokraft covering Domain 2.5 (Test Listing through Scale Decision).

### Views

1. **Campaign Planner** — Test campaign setup with budget, keywords, bid strategy, phase configuration (Discovery, Refinement, Validation)
2. **Performance Monitor** — Real-time metrics dashboard (impressions, clicks, CTR, orders, CVR, ACoS, spend)
3. **Scale Decision** — Gate 2 analysis with path A/B evaluation, keyword-level P&L, scale/kill/pivot recommendation
4. **Keyword Analyzer** — Per-keyword performance breakdown with classification (scale/optimize/pause/kill)

### Storage Keys

- `ism:config:market-testing` — PPC thresholds, Gate 2 criteria, phase config
- `ism:market-testing:state` — full artifact state
- `ism:p:{productId}:campaign` — per-product campaign data
- `ism:p:{productId}:scale-decision` — per-product Gate 2 analysis

### Config Defaults

```json
{
  "gate2_path_a": { "min_orders": 10, "min_cvr": 0.05 },
  "gate2_path_b": { "min_impressions": 500, "min_ctr": 0.003 },
  "target_acos_test": 0.40,
  "phases": ["Discovery", "Refinement", "Validation"],
  "keyword_thresholds": {
    "scale_acos_max": 0.30,
    "pause_acos_min": 0.50,
    "kill_spend_no_sales": 500
  }
}
```

### Generate

`market-testing-v1.0.artifact.tsx`
