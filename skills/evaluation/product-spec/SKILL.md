---
name: product-spec
description: >
  Converts evaluated products into structured manufacturing specifications, supplier
  briefs, and internal PRDs. Three modes: SPEC (ProductSpec with dimensions, materials,
  BOM, finish, packaging, compliance, weight, labeling), BRIEF (SupplierBrief for
  vendor-ops RFQ — what to send manufacturers), PRD (internal Product Requirements
  Document for launch team). ALWAYS trigger for: "product spec", "create spec",
  "BOM", "bill of materials", "material spec", "wood spec", "packaging spec",
  "supplier brief", "what to send the vendor", "vendor brief", "manufacturer brief",
  "PRD", "product requirements", "product requirements document", "launch document",
  "what are we building", "define this product", "spec this out", "SP-". Sits between
  product-evaluate and vendor-ops — without it, vendors receive vague descriptions
  instead of structured specs. If unsure — trigger.
metadata:
  domain: product
  prefix: SP-
  version: 1.0.0
  dependencies:
    upstream:
      - product-evaluate (EvalRecord or GateResult feeds SPEC mode)
      - product-screen (LaunchBrief feeds SPEC mode)
      - margin-calculator (MarginRecord validates BOM cost targets)
    downstream:
      - vendor-ops (SupplierBrief feeds RFQ mode)
      - content-writer (ProductSpec feeds LISTING mode — dimensions, materials, features)
      - capital-planner (BOM_Total_COGS feeds LAUNCH mode)
---
# Product Spec

Converts evaluated product opportunities into structured, actionable specifications.

Three modes — run in sequence (SPEC → BRIEF → PRD) or independently:

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **SPEC** | product_name + EvalRecord or LaunchBrief | ProductSpec | BRIEF, PRD, content-writer, margin-calculator |
| **BRIEF** | ProductSpec | SupplierBrief → ready for vendor-ops RFQ | vendor-ops RFQ mode |
| **PRD** | ProductSpec + market context | ProductRequirementsDoc | Launch team reference |

**Capability boundary:** This skill defines what to build. It does not evaluate opportunity (product-evaluate), find vendors (vendor-ops), calculate margins (margin-calculator), or write listings (content-writer).

## Why This Skill Exists

The product pipeline has a gap between "this product is worth pursuing" (product-evaluate) and "find me a manufacturer" (vendor-ops). Without a structured spec, vendors receive vague product descriptions, resulting in misquoted prices, wrong materials, incorrect dimensions, and wasted sample rounds. This skill formalizes the handoff.

## Shared Knowledge (always in context)

The opportunity map, financial formulas, gate definitions, and data integrity rules are available in project knowledge. Do not read separate files for these — they are already in context.

## Skill-Specific Reference Files

- **BOM template**: See [reference/bom-template.md](reference/bom-template.md) — component categories, cost structure, wood species database
- **Compliance matrix**: See [reference/compliance-matrix.md](reference/compliance-matrix.md) — BIS, FSSAI, packaging rules by product category
- **Packaging standards**: See [reference/packaging-standards.md](reference/packaging-standards.md) — FBA packaging tiers, Shopify fulfillment specs
---

## DATA INTEGRITY CONTRACT

The 7 data integrity rules from project knowledge apply. In addition, product-spec enforces:

1. **Every dimension cites its source.** "Length = 30cm (source: competitor analysis, top-3 Amazon India listings)" or "Length = 30cm (source: user-specified)". No dimension without provenance.
2. **BOM costs are estimates until vendor-quoted.** Mark every cost as `estimated` or `vendor_quoted`. Never present estimates as confirmed costs.
3. **Wood species must be manufacturable in India.** Only specify species available from Jodhpur, Moradabad, or Vrindavan clusters. If uncertain, list alternatives and flag.
4. **Compliance requirements are mandatory, not optional.** If a product category requires BIS certification, it must appear in the spec. Never omit compliance because data is unavailable — flag as `compliance_check_required`.
5. **Weight includes packaging.** Gross weight (product + inner packaging + outer packaging) is what determines FBA fees. Always compute and display both net and gross.
6. **MOQ guidance is range-based.** Never state a single MOQ number — provide range (minimum viable for testing, optimal for unit cost) with rationale.

---

## MODE: SPEC

**Purpose:** Create a complete product specification from an evaluated product. This is the single source of truth for what the product IS — dimensions, materials, construction, packaging, compliance, and cost targets.

**When to invoke:** "create spec", "product spec", "define this product", "what are we building", "spec this out".

Read [reference/bom-template.md](reference/bom-template.md) for component categories.

### Required Inputs

| Input | Source | Required |
|---|---|---|
| product_name | User or LaunchBrief | Yes |
| category | User or EvalRecord | Yes |
| target_sp_inr | LaunchBrief or user | Yes |
| target_cogs_max_inr | LaunchBrief or margin-calculator | Yes |
| zone | Opportunity map zone | Recommended || eval_record | product-evaluate output | Recommended |
| concept_batch | product-evaluate IDEATE output | Optional |
| competitor_data | product-discover SINGLE output | Optional |

### Steps

1. Confirm all required inputs. If target_sp or target_cogs_max missing, block and state what's needed.
2. Determine product category constraints from compliance-matrix.md.
3. Build the ProductSpec section by section:
   - Core identity (name, category, zone, SKU prefix)
   - Physical dimensions (L × W × H in cm, tolerances)
   - Materials and construction (primary wood, secondary materials, joinery, finish)
   - Bill of Materials (component-level breakdown with estimated costs)
   - Surface treatment (finish type, coats, drying method)
   - Hardware and fittings (hinges, magnets, locks — if applicable)
   - Packaging (inner wrap, outer box, insert, labeling)
   - Weight (net product, gross with packaging)
   - Compliance and certifications (BIS, FSSAI, export — by category)
   - Labeling requirements (MRP sticker, barcode, country of origin, care instructions)
   - Quality checkpoints (3 minimum acceptance criteria for incoming inspection)
4. Compute BOM_Total_COGS from component estimates. Compare against target_cogs_max_inr.
   - If BOM > target: flag as COGS_RISK with specific components to optimize.
   - If BOM < 70% of target: flag as COGS_LOW — verify no critical components missed.
5. Set confidence: HIGH (competitor data + eval available), MEDIUM (partial data), LOW (concept only).
6. Return ProductSpec with BOM_Total_COGS. CRM writes (Product_Spec_Status, Spec_Version, BOM_Total_COGS) handled by zoho-data-ops.

### Wood Species Database (Quick Reference)

| Species | Source Cluster | Density | Best For | Price Band (₹/cft) |
|---|---|---|---|---|
| Sheesham (Indian Rosewood) | Jodhpur | High | Furniture, heavy items | 1,800–2,500 || Mango Wood | Jodhpur | Medium | Decorative, gifts | 800–1,200 |
| Acacia | Jodhpur | Medium-High | Kitchen, outdoor | 1,200–1,800 |
| Babool (Kikar) | Jodhpur, Moradabad | High | Small items, turned | 600–900 |
| Pine | Moradabad | Low | Light items, painted | 500–800 |
| MDF + Veneer | All clusters | Low | Budget products, painted | 300–500 |

### Output: ProductSpec

```json
{
  "spec_id": "SP-S-{YYYYMMDD}-{NNN}",
  "product_name": "string",
  "category": "string",
  "zone": "string",
  "target_sp_inr": "number",
  "target_cogs_max_inr": "number",
  "dimensions": {
    "length_cm": "number",
    "width_cm": "number",
    "height_cm": "number",
    "tolerance_pct": "number (default 5)",
    "source": "string"
  },
  "materials": {
    "primary_wood": "string",
    "wood_grade": "string",
    "secondary_materials": ["string"],
    "joinery_method": "string",
    "wood_percentage_vol": "number (min 70)"
  },  "bom": [
    {
      "component": "string",
      "material": "string",
      "quantity": "number",
      "unit": "string",
      "estimated_cost_inr": "number",
      "cost_status": "estimated | vendor_quoted",
      "notes": "string | null"
    }
  ],
  "bom_total_cogs_inr": "number",
  "cogs_vs_target": "WITHIN | COGS_RISK | COGS_LOW",
  "surface_treatment": {
    "finish_type": "string (lacquer | polish | paint | oil | wax | raw)",
    "coats": "number",
    "color": "string | null",
    "drying_method": "string"
  },
  "hardware_fittings": [
    {
      "item": "string",
      "material": "string",
      "quantity": "number",
      "estimated_cost_inr": "number"
    }
  ],
  "packaging": {
    "inner_wrap": "string",    "outer_box": "string",
    "insert_type": "string | null",
    "box_dimensions_cm": {"l": "number", "w": "number", "h": "number"},
    "fba_size_tier": "string (Standard | Oversize)",
    "packaging_cost_inr": "number"
  },
  "weight": {
    "net_product_grams": "number",
    "packaging_grams": "number",
    "gross_grams": "number"
  },
  "compliance": [
    {
      "requirement": "string",
      "status": "met | pending | not_applicable | check_required",
      "notes": "string | null"
    }
  ],
  "labeling": {
    "mrp_sticker": true,
    "barcode_type": "string (EAN-13 | UPC-A)",
    "country_of_origin": "India",
    "care_instructions": "string",
    "brand_label": "Ismokraft",
    "additional_labels": ["string"]
  },
  "quality_checkpoints": [
    {
      "checkpoint": "string",
      "acceptance_criteria": "string",      "inspection_method": "string"
    }
  ],
  "moq_guidance": {
    "minimum_viable_units": "number",
    "optimal_units": "number",
    "rationale": "string"
  },
  "differentiation_hooks": ["string"],
  "personalization_options": ["string | null"],
  "confidence": "HIGH | MEDIUM | LOW",
  "data_gaps": ["string"],
  "crm_record_id": "string | null",
  "spec_version": "string",
  "created_date": "string (YYYY-MM-DD)"
}
```

---

## MODE: BRIEF

**Purpose:** Transform a ProductSpec into a SupplierBrief — the document sent to manufacturers when requesting quotes. Strips internal strategy, adds vendor-facing language, includes reference images guidance.

**When to invoke:** "supplier brief", "vendor brief", "what to send the vendor", "brief for manufacturer".

### Required Inputs

| Input | Source | Required |
|---|---|---|| ProductSpec | SPEC mode output | Yes |
| target_moq | User or ProductSpec.moq_guidance | Recommended |
| preferred_clusters | User or default (Jodhpur) | Optional |

### Steps

1. Confirm ProductSpec is available. If not, redirect to SPEC mode first.
2. Extract vendor-relevant sections from ProductSpec:
   - Product description (category, use case — no internal strategy)
   - Dimensions with tolerances
   - Material specification (wood species, grade, secondary materials)
   - Surface treatment requirements
   - Hardware/fittings list
   - Packaging requirements (brief — vendor provides packaging quote separately)
   - Quality requirements (checkpoints as acceptance criteria)
   - Quantity: initial sample (3–5 units), pilot batch (MOQ minimum), production batch (optimal)
   - Compliance requirements vendor must meet
3. Add standard Ismokraft vendor communication blocks:
   - Payment terms template (30% advance, 70% on delivery — standard)
   - Sample timeline expectation (7–14 days)
   - Quote format requested (per-unit breakdown by component)
4. Do NOT include: target selling price, margin targets, competitive positioning, differentiation strategy.
5. Return SupplierBrief.

### Output: SupplierBrief

```json
{
  "brief_id": "SP-B-{YYYYMMDD}-{NNN}",  "product_name": "string",
  "spec_id": "string (reference to ProductSpec)",
  "sections": {
    "product_overview": "string (2-3 sentences, vendor-facing)",
    "dimensions": "object (from ProductSpec.dimensions)",
    "material_spec": "object (wood, secondary, joinery)",
    "surface_treatment": "object",
    "hardware_fittings": "array",
    "packaging_brief": "string",
    "quality_requirements": "array of checkpoints",
    "quantity_tiers": {
      "sample": "number (3-5)",
      "pilot": "number",
      "production": "number"
    },
    "compliance_requirements": "array",
    "payment_terms": "string",
    "sample_timeline": "string",
    "quote_format": "string"
  },
  "reference_images_guidance": "string (what images to request from vendor)",
  "do_not_share": ["target_sp", "margin_target", "competitive_positioning"]
}
```

---

## MODE: PRD

**Purpose:** Generate an internal Product Requirements Document — the single reference for the launch team covering what the product is, why it exists, who it's for, and how it will be launched.

**When to invoke:** "PRD", "product requirements document", "launch document", "internal product doc".
### Required Inputs

| Input | Source | Required |
|---|---|---|
| ProductSpec | SPEC mode output | Yes |
| EvalRecord | product-evaluate output | Recommended |
| ResearchRecord | product-discover SINGLE output | Optional |
| marketplace_strategy | LaunchBrief or user | Recommended |

### Steps

1. Confirm ProductSpec exists. If not, redirect to SPEC mode.
2. Build PRD sections:
   - Executive Summary (product name, category, zone, one-line value proposition)
   - Problem Statement (what gap this product fills — from EvalRecord strengths/differentiation)
   - Target Customer (demographics, occasions, use cases)
   - Product Specification Summary (key specs from ProductSpec — not full BOM)
   - Competitive Landscape (from ResearchRecord — top 3 competitors, Ismokraft's angle)
   - Financial Summary (target SP, COGS, margin — from margin-calculator)
   - Launch Plan (marketplace strategy, listing priorities, initial ad budget guidance)
   - Risk Register (from EvalRecord risks + compliance gaps)
   - Success Metrics (30-day: BSR target, review count; 90-day: revenue, return rate)
   - Open Questions (unresolved items requiring decisions)
3. Return ProductRequirementsDoc. CRM note creation handled by zoho-data-ops.

### Output: ProductRequirementsDoc

```json
{  "prd_id": "SP-P-{YYYYMMDD}-{NNN}",
  "product_name": "string",
  "spec_id": "string",
  "sections": {
    "executive_summary": "string",
    "problem_statement": "string",
    "target_customer": "string",
    "spec_summary": "object (key dimensions, materials, weight)",
    "competitive_landscape": "string",
    "financial_summary": "object (sp, cogs, margin_pct)",
    "launch_plan": "object (marketplaces, sequence, timeline)",
    "risk_register": "array of {risk, severity, mitigation}",
    "success_metrics": "object (30_day, 90_day targets)",
    "open_questions": "array of string"
  },
  "confidence": "HIGH | MEDIUM | LOW",
  "created_date": "string"
}
```

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| SPEC | product_name + category + target_sp_inr + target_cogs_max_inr | Block — cannot spec without cost targets |
| BRIEF | ProductSpec | Block — redirect to SPEC mode first |
| PRD | ProductSpec | Block — redirect to SPEC mode first |

If blocked: state exact missing input. Do not proceed. Do not substitute with assumptions.
## Halt Conditions

| Condition | Mode | Action |
|---|---|---|
| No product name | SPEC | Ask for product name + category |
| BOM exceeds target_cogs_max by > 30% | SPEC | Complete spec but flag COGS_RISK prominently |
| Wood species not in India clusters | SPEC | Suggest alternative species, flag for verification |
| ProductSpec missing dimensions | BRIEF | Block — incomplete spec cannot generate vendor brief |
| No EvalRecord available | PRD | Proceed with LOW confidence, note gaps |

---

## Related Skills

| Skill | Relationship |
|---|---|
| product-evaluate | Upstream — provides EvalRecord, ConceptBatch |
| product-screen | Upstream — provides LaunchBrief |
| margin-calculator | Validates BOM against margin targets |
| vendor-ops | Downstream — receives SupplierBrief for RFQ |
| content-writer | Downstream — receives ProductSpec for LISTING |
| capital-planner | Downstream — receives BOM_Total_COGS for LAUNCH mode |