# Product Spec — Schemas and Reference Data

## Wood Species Database

| Species | Source Cluster | Density | Best For | Price Band (INR/cft) |
|---|---|---|---|---|
| Sheesham (Indian Rosewood) | Jodhpur | High | Furniture, heavy items | 1,800-2,500 |
| Mango Wood | Jodhpur | Medium | Decorative, gifts | 800-1,200 |
| Acacia | Jodhpur | Medium-High | Kitchen, outdoor | 1,200-1,800 |
| Babool (Kikar) | Jodhpur, Moradabad | High | Small items, turned | 600-900 |
| Pine | Moradabad | Low | Light items, painted | 500-800 |
| MDF + Veneer | All clusters | Low | Budget products, painted | 300-500 |

---

## ProductSpec Output Schema (SPEC mode)

```json
{
  "spec_id": "SP-S-{YYYYMMDD}-{NNN}",
  "product_name": "string",
  "category": "string",
  "zone": "string",
  "target_sp_inr": "number",
  "target_cogs_max_inr": "number",
  "dimensions": {
    "length_cm": "number", "width_cm": "number", "height_cm": "number",
    "tolerance_pct": "number (default 5)", "source": "string"
  },
  "materials": {
    "primary_wood": "string", "wood_grade": "string",
    "secondary_materials": ["string"], "joinery_method": "string",
    "wood_percentage_vol": "number (min 70)"
  },
  "bom": [{
    "component": "string", "material": "string", "quantity": "number",
    "unit": "string", "estimated_cost_inr": "number",
    "cost_status": "estimated | vendor_quoted", "notes": "string | null"
  }],
  "bom_total_cogs_inr": "number",
  "cogs_vs_target": "WITHIN | COGS_RISK | COGS_LOW",
  "surface_treatment": {
    "finish_type": "lacquer | polish | paint | oil | wax | raw",
    "coats": "number", "color": "string | null", "drying_method": "string"
  },
  "hardware_fittings": [{
    "item": "string", "material": "string", "quantity": "number",
    "estimated_cost_inr": "number"
  }],
  "packaging": {
    "inner_wrap": "string", "outer_box": "string", "insert_type": "string | null",
    "box_dimensions_cm": {"l": "number", "w": "number", "h": "number"},
    "fba_size_tier": "Standard | Oversize", "packaging_cost_inr": "number"
  },
  "weight": {
    "net_product_grams": "number", "packaging_grams": "number",
    "gross_grams": "number"
  },
  "compliance": [{
    "requirement": "string", "status": "met | pending | not_applicable | check_required",
    "notes": "string | null"
  }],
  "labeling": {
    "mrp_sticker": true, "barcode_type": "EAN-13 | UPC-A",
    "country_of_origin": "India", "care_instructions": "string",
    "brand_label": "Ismokraft"
  },
  "quality_checkpoints": [{
    "checkpoint": "string", "acceptance_criteria": "string",
    "inspection_method": "string"
  }],
  "moq_guidance": {
    "minimum_viable_units": "number", "optimal_units": "number",
    "rationale": "string"
  },
  "differentiation_hooks": ["string"],
  "personalization_options": ["string | null"],
  "confidence": "HIGH | MEDIUM | LOW",
  "data_gaps": ["string"]
}
```

---

## SupplierBrief Output Schema (BRIEF mode)

```json
{
  "brief_id": "SP-B-{YYYYMMDD}-{NNN}",
  "product_name": "string",
  "spec_id": "string",
  "sections": {
    "product_overview": "string (vendor-facing, 2-3 sentences)",
    "dimensions": "object (from ProductSpec)",
    "material_spec": "object (wood, secondary, joinery)",
    "surface_treatment": "object",
    "hardware_fittings": "array",
    "packaging_brief": "string",
    "quality_requirements": "array of checkpoints",
    "quantity_tiers": { "sample": "3-5", "pilot": "number", "production": "number" },
    "compliance_requirements": "array",
    "payment_terms": "30% advance, 70% on delivery",
    "sample_timeline": "7-14 days",
    "quote_format": "per-unit breakdown by component"
  },
  "do_not_share": ["target_sp", "margin_target", "competitive_positioning"]
}
```

---

## ProductRequirementsDoc Output Schema (PRD mode)

```json
{
  "prd_id": "SP-P-{YYYYMMDD}-{NNN}",
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
    "risk_register": [{"risk": "string", "severity": "string", "mitigation": "string"}],
    "success_metrics": "object (30_day, 90_day targets)",
    "open_questions": ["string"]
  },
  "confidence": "HIGH | MEDIUM | LOW"
}
```
