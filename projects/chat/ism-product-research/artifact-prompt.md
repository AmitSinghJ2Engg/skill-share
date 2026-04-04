# Artifact Prompt — ISM Product Research

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a unified Product Research artifact for Ismokraft covering Domain 1 (Discovery) and Domain 1.5 (Evaluation).

### Views

1. **Discovery Pipeline** — Table/card view of product candidates with keyword scores, trend signals, screening scores, and pipeline stage
2. **Evaluation Workbench** — Deep-eval results panel with unit economics (CBFA, margin, ACoS), compliance feasibility, and Gate 1 criteria checklist
3. **Trend Scanner** — Visualization of keyword trends and market signals across zones

### Storage Keys

- `ism:config:product-research` — config thresholds (margins, CBFA, ACoS)
- `ism:product-research:state` — full artifact state
- `ism:p:{productId}:discovery` — per-product discovery data
- `ism:p:{productId}:evaluation` — per-product evaluation data

### Config Defaults

```json
{
  "target_gross_margin": 0.44,
  "price_sweet_spot": [800, 2000],
  "price_floor": 1000,
  "cbfa_gate1_min": 150,
  "breakeven_acos_max": 0.50
}
```

### Generate

`product-research-v1.0.artifact.tsx`
