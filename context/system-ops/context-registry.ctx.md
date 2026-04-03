# Context Registry
# ikraft-skill-governance v5.0 | Last updated: 2026-03-15

Single source of truth for all business knowledge objects. Skills reference by `context_id` and `canonical_location`. Never embed knowledge that has a registry entry.

**Governed by:** LAW-6 (Context Must Be Centralized) | **Enforced by:** ikraft-skill-governance ARCHITECTURE mode (V-049, V-052)

---

## Registry Entries

### CTX-001 -- Amazon India Fee Structure 2026
```yaml
context_id: CTX-001
type: fee_structure
canonical_location: "ikraft-skill-governance/references/architecture-laws.md#amazon-india-fee-structure-2026-ctx-001"
primary_owner: margin-calculator
referencing_skills: [margin-calculator, product-lab]
last_updated: 2026-03-15
duplication_risk: HIGH
```

### CTX-002 -- Financial Formulas
```yaml
context_id: CTX-002
type: formula_library
canonical_location: "margin-calculator/references/financial-formulas.md"
primary_owner: margin-calculator
referencing_skills: [margin-calculator, revenue-ops, capital-planner, product-lab]
last_updated: 2026-03-15
duplication_risk: HIGH
```

### CTX-003 -- Product Evaluation Model v2
```yaml
context_id: CTX-003
type: evaluation_model
canonical_location: "ism-business-authority/refs/product-evaluation-model.md"
primary_owner: product-lab
referencing_skills: [product-lab, product-pipeline, ism-business-authority]
last_updated: 2026-03-15
duplication_risk: MEDIUM
```

### CTX-004 -- Vendor Evaluation Model v2
```yaml
context_id: CTX-004
type: evaluation_model
canonical_location: "ism-business-authority/refs/vendor-evaluation-model.md"
primary_owner: vendor-ops
referencing_skills: [vendor-ops, supplier-intelligence]
last_updated: 2026-03-15
duplication_risk: MEDIUM
```

### CTX-005 -- GO FEARLESS Standard v1.0
```yaml
context_id: CTX-005
type: quality_standard
canonical_location: "ism-business-authority/refs/go-fearless.md"
primary_owner: ism-business-authority
referencing_skills: [ism-business-authority, ecosystem-ops, artifacts-builder-v2, ikraft-skill-governance]
last_updated: 2026-03-11
duplication_risk: HIGH
```

### CTX-006 -- Business Context
```yaml
context_id: CTX-006
type: business_configuration
canonical_location: "ism-business-authority/refs/business-context.md"
primary_owner: ism-business-authority
referencing_skills: [ism-business-authority, product-lab, margin-calculator, product-intelligence]
last_updated: 2026-03-15
duplication_risk: HIGH
```

### CTX-007 -- Opportunity Scoring Model
```yaml
context_id: CTX-007
type: scoring_model
canonical_location: "product-lab/refs/opportunity-scoring-model.md"
primary_owner: product-lab
referencing_skills: [product-lab, product-pipeline, product-intelligence]
last_updated: 2026-03-15
duplication_risk: MEDIUM
```

### CTX-008 -- CRM Field Mappings
```yaml
context_id: CTX-008
type: integration_schema
canonical_location: "zoho-solutions-architect/refs/crm-field-mappings.md"
primary_owner: zoho-solutions-architect
referencing_skills: [zoho-solutions-architect, zoho-developer, margin-calculator, product-lab, ism-learning-engine]
last_updated: 2026-03-15
duplication_risk: HIGH
```

### CTX-009 -- Bigin Live State
```yaml
context_id: CTX-009
type: system_state
canonical_location: "zoho-solutions-architect/refs/bigin-live-state.md"
primary_owner: zoho-solutions-architect
referencing_skills: [zoho-solutions-architect, ism-gap-auditor, ism-scrum-master]
last_updated: 2026-03-15
duplication_risk: LOW
```

### CTX-010 -- Storage Schema
```yaml
context_id: CTX-010
type: storage_convention
canonical_location: "ecosystem-ops/refs/storage-schema.md"
primary_owner: ecosystem-ops
referencing_skills: [ecosystem-ops, artifacts-builder-v2]
last_updated: 2026-03-15
duplication_risk: LOW
```

---

## Governance Rules

1. One entry per knowledge object -- no overlapping domains.
2. canonical_location must exist before adding entry.
3. primary_owner is accountable for updates.
4. HIGH duplication_risk objects: quarterly review for embedded copies.
5. All referencing artifacts must be listed for change impact analysis.
6. Never delete -- mark `status: superseded` with `superseded_by` field.
7. New objects approved by ikraft-skill-governance ARCHITECTURE mode.
