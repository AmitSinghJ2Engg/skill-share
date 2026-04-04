# Artifact Prompt — ISM Sourcing

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a unified Sourcing Workbench artifact for Ismokraft covering Domain 2 (Test Sourcing).

### Views

1. **Vendor Pipeline** — Table of vendors per product with discovery status, score, grade, RFQ status, sample status
2. **Supplier Scorecard** — Comparative analysis of 2+ vendors with weighted scoring across quality, price, reliability, communication
3. **RFQ Tracker** — RFQ lifecycle from sent to response to negotiation to acceptance
4. **Cost Breakdown** — Per-vendor unit economics comparison (COGS, shipping, duties, landed cost)

### Storage Keys

- `ism:config:sourcing` — vendor scoring weights, grade thresholds
- `ism:sourcing:state` — full artifact state
- `ism:v:{vendorId}:score` — per-vendor scoring data
- `ism:p:{productId}:sourcing` — per-product sourcing pipeline

### Config Defaults

```json
{
  "grade_thresholds": { "A": 85, "B": 70, "C": 55 },
  "min_grade_for_sourcing": "C",
  "lead_time_ceiling_days": 45,
  "min_suppliers_per_product": 2,
  "scoring_weights": {
    "quality": 0.30,
    "price": 0.25,
    "reliability": 0.25,
    "communication": 0.20
  }
}
```

### Generate

`sourcing-workbench-v1.0.artifact.tsx`
