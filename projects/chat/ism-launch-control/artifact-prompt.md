# Artifact Prompt — ISM Launch Control

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a Launch Control artifact for Ismokraft covering Domain 3 (Product Launch).

### Views

1. **Sourcing Model Selection** — Comparison matrix for PL/RTS/DS/POD with unit economics at scale
2. **Listing Builder** — Final listing checklist (title, bullets, description, images, A+ content status)
3. **Compliance Tracker** — Certification status per product with Gate 3 progress indicator
4. **Platform Setup** — Seller Central configuration checklist (tax, shipping, returns, FBA)

### Storage Keys

- `ism:config:launch-control` — sourcing model definitions, compliance requirements
- `ism:launch-control:state` — full artifact state
- `ism:p:{productId}:launch` — per-product launch data
- `ism:p:{productId}:compliance` — per-product compliance status

### Config Defaults

```json
{
  "sourcing_models": ["PL", "RTS", "DS", "POD"],
  "gate3_requirement": "all_certifications_obtained",
  "listing_checklist": [
    "Title optimized",
    "5 bullet points",
    "Description with HTML",
    "Main image + 6 lifestyle images",
    "A+ content (if eligible)",
    "Backend keywords"
  ],
  "platform_checklist": [
    "Tax registration",
    "Shipping template",
    "Return policy",
    "FBA enrollment",
    "Brand registry"
  ]
}
```

### Generate

`launch-control-v1.0.artifact.tsx`
