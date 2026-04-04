# Artifact Prompt — ISM Live Ops

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build an Ops Dashboard artifact for Ismokraft covering Domain 4 (Live Operations).

### Views

1. **Product Health** — Live products with BSR, rating, review count, revenue, and health status indicators
2. **Ad Performance** — Campaign metrics (ACoS, ROAS, spend, sales) with trend lines
3. **Inventory Status** — Stock levels, reorder alerts, FBA vs merchant fulfillment status
4. **Revenue Tracker** — Monthly revenue, margins, and P&L by product
5. **Learning Feed** — Captured insights and pattern recognition from live data

### Storage Keys

- `ism:config:live-ops` — ACoS targets, margin targets, monitoring thresholds
- `ism:live-ops:state` — full artifact state
- `ism:p:{productId}:ops` — per-product operational data
- `ism:p:{productId}:ads` — per-product ad performance

### Config Defaults

```json
{
  "target_acos_scale": 0.30,
  "target_net_margin": 0.15,
  "bsr_alert_threshold_pct_change": 0.20,
  "inventory_reorder_days": 14,
  "review_velocity_target": 5
}
```

### Generate

`ops-dashboard-v1.0.artifact.tsx`
