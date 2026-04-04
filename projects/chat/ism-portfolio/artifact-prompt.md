# Artifact Prompt — ISM Portfolio

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a Portfolio Dashboard artifact for Ismokraft providing a cross-domain strategic view.

### Views

1. **Pipeline Overview** — Kanban/funnel view of all products by pipeline stage with health indicators
2. **Investment Tracker** — Total spend per product, per domain, with ROI projections
3. **KPI Dashboard** — Portfolio metrics: products in pipeline, gate pass rates, average cycle time, kill rate
4. **Stage Heatmap** — Time-in-stage analysis highlighting bottlenecks

### Storage Keys

- `ism:config:portfolio` — pipeline stage definitions, KPI targets
- `ism:portfolio:state` — full artifact state
- `ism:portfolio:snapshot` — latest portfolio data snapshot

### Config Defaults

```json
{
  "pipeline_stages": [
    "Idea Intake", "Market Research", "Test Sourcing",
    "Test Listing", "Paid Testing", "Scale Decision",
    "Sourcing Model Selection", "Final Listing",
    "Compliance", "Platform Setup", "Product Live"
  ],
  "health_thresholds": {
    "days_in_stage_warning": 14,
    "days_in_stage_critical": 30
  }
}
```

### Generate

`portfolio-dashboard-v1.0.artifact.tsx`
