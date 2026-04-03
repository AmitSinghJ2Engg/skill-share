---
name: product-spec
description: >
  Converts evaluated products into structured manufacturing specifications,
  supplier briefs, and internal PRDs. Three modes: SPEC (ProductSpec with
  dimensions, materials, BOM, finish, packaging, compliance, weight, labeling),
  BRIEF (SupplierBrief for vendor-ops RFQ), PRD (internal Product Requirements
  Document for launch team).
  ALWAYS trigger for: "product spec", "create spec", "BOM", "bill of materials",
  "material spec", "wood spec", "packaging spec", "supplier brief", "vendor brief",
  "PRD", "product requirements", "launch document", "define this product",
  "spec this out", "SP-". If unsure — trigger.
metadata:
  domain: product
  prefix: SP-
  version: "1.0.0"
---

# Product Spec

Converts evaluated products into structured, actionable specifications.

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **SPEC** | product_name + EvalRecord or LaunchBrief | ProductSpec | BRIEF, PRD, content-writer, margin-calculator |
| **BRIEF** | ProductSpec | SupplierBrief | vendor-ops RFQ mode |
| **PRD** | ProductSpec + market context | ProductRequirementsDoc | Launch team reference |

**Boundary:** Defines what to build. Does not evaluate (product-evaluate), find vendors (vendor-ops), calculate margins (margin-calculator), or write listings (content-writer).

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `product-spec`, `cross-skill`
3. Check memory for `SP-*` entries — apply active entries
4. For SPEC: read `references/bom-template.md` — component categories, cost structure
5. For compliance: read `references/compliance-matrix.md`

---

## Mode: SPEC

Creates complete product specification — the single source of truth for dimensions, materials, construction, packaging, compliance, and cost targets.

**Required:** product_name, category, target_sp_inr, target_cogs_max_inr. **Recommended:** zone, eval_record.

**Steps:** Confirm inputs → determine compliance from compliance-matrix.md → build spec sections (identity, dimensions, materials, BOM, surface treatment, hardware, packaging, weight, compliance, labeling, quality checkpoints) → compute BOM_Total_COGS vs target → set confidence → return ProductSpec.

**COGS flags:** BOM > target = COGS_RISK. BOM < 70% target = COGS_LOW (verify no components missed).

See `references/schemas-and-steps.md` for full ProductSpec JSON schema and wood species database.

---

## Mode: BRIEF

Transforms ProductSpec into vendor-facing SupplierBrief. Strips internal strategy, adds vendor communication blocks.

**Required:** ProductSpec. **Do NOT share:** target SP, margin targets, competitive positioning.

Standard terms: 30% advance / 70% on delivery. Sample timeline: 7-14 days. Quote format: per-unit breakdown by component.

See `references/schemas-and-steps.md` for SupplierBrief JSON schema.

---

## Mode: PRD

Generates internal Product Requirements Document — the launch team reference covering what, why, who, and how.

**Required:** ProductSpec. **Recommended:** EvalRecord, ResearchRecord, marketplace_strategy.

Sections: Executive Summary, Problem Statement, Target Customer, Spec Summary, Competitive Landscape, Financial Summary, Launch Plan, Risk Register, Success Metrics, Open Questions.

See `references/schemas-and-steps.md` for PRD JSON schema.

---

## Rules

1. **Every dimension cites its source.** No dimension without provenance.
2. **BOM costs are estimates until vendor-quoted.** Mark `estimated` or `vendor_quoted`.
3. **Wood species must be India-manufacturable.** Jodhpur, Moradabad, or Vrindavan clusters.
4. **Compliance is mandatory.** If required for category, it appears in spec. Flag as `check_required` if data unavailable.
5. **Weight includes packaging.** Gross weight = product + inner + outer packaging.
6. **MOQ is range-based.** Minimum viable + optimal with rationale.

---

## Governance Contract

```yaml
skill_name: product-spec
version: "1.0.0"
owner: Ismokraft
domain: product
maturity_level: L2_operational
write_permissions: []
measurable_kpis:
  - KPI-SKILL-SP-01: Spec Completeness (target >90% fields populated)
  - KPI-SKILL-SP-02: BOM Accuracy (target <15% variance from vendor quote)
```

---

## Reference Files

| File | Read when |
|---|---|
| `references/bom-template.md` | SPEC — component categories, cost structure |
| `references/compliance-matrix.md` | SPEC — BIS, FSSAI, packaging rules |
| `references/packaging-standards.md` | SPEC — FBA tiers, Shopify specs |
| `references/schemas-and-steps.md` | All modes — JSON schemas, wood species |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-evaluate` | Upstream — EvalRecord, ConceptBatch |
| `product-screen` | Upstream — LaunchBrief |
| `margin-calculator` | Validates BOM against margin targets |
| `vendor-ops` | Downstream — SupplierBrief for RFQ |
| `content-writer` | Downstream — ProductSpec for LISTING |
| `capital-planner` | Downstream — BOM_Total_COGS |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent dimensions, materials, certifications, or features
- BOM costs are estimates until vendor-quoted — never present as confirmed
- If compliance data is unavailable, flag — do not omit
