# ikraft-skill-auditor -- Offloaded Schemas & Execution Steps
# Extracted from SKILL.md to reduce size. Authoritative source for these sections.

---

## Input / Output Schemas

### Audit Request Input
```json
{
  "type": "object",
  "properties": {
    "scope": {
      "type": "string",
      "enum": ["full", "single", "domain", "dependency", "contract", "maturity", "authority", "execution_log", "governance_contract"],
      "description": "full=all skills | single=one skill | domain=one domain | dependency=graph only | contract=contracts only | maturity=lifecycle only | authority=data authority | execution_log=log coverage | governance_contract=contract blocks only"
    },
    "target": { "type": "string", "description": "Required when scope=single/domain/contract" },
    "include_recommendations": { "type": "boolean", "default": true },
    "include_dependency_graph": { "type": "boolean", "default": false },
    "include_contract_validation": { "type": "boolean", "default": false },
    "include_data_authority": { "type": "boolean", "default": false },
    "include_execution_log_coverage": { "type": "boolean", "default": false },
    "severity_filter": {
      "type": "string",
      "enum": ["all", "critical_only", "high_and_above", "medium_and_above"],
      "default": "all"
    }
  },
  "required": ["scope"]
}
```

### Governance Audit Report Output
```json
{
  "type": "object",
  "properties": {
    "audit_date": { "type": "string", "format": "date" },
    "audit_version": { "type": "string" },
    "scope": { "type": "string" },
    "registry_summary": {
      "type": "object",
      "properties": {
        "total_skills": { "type": "integer" },
        "by_domain": { "type": "object" },
        "by_maturity": {
          "type": "object",
          "properties": {
            "L0_experimental": { "type": "integer" },
            "L1_assisted": { "type": "integer" },
            "L2_operational": { "type": "integer" },
            "L3_autonomous": { "type": "integer" },
            "deprecated": { "type": "integer" },
            "unset": { "type": "integer" }
          }
        },
        "unregistered": { "type": "array", "items": { "type": "string" } },
        "ghost_entries": { "type": "array", "items": { "type": "string" } },
        "missing_governance_contracts": { "type": "array", "items": { "type": "string" } },
        "missing_versions": { "type": "array", "items": { "type": "string" } }
      }
    },
    "coverage_metrics": {
      "type": "object",
      "properties": {
        "governance_contract_coverage_pct": { "type": "number" },
        "execution_log_coverage_pct": { "type": "number" },
        "write_permission_declared_pct": { "type": "number" },
        "pre_exec_validation_pct": { "type": "number" }
      }
    },
    "skill_audits": { "type": "array", "items": { "$ref": "#/definitions/skill_audit_row" } },
    "violation_summary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "violation_code": { "type": "string" },
          "severity": { "type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
          "affected_skills": { "type": "array", "items": { "type": "string" } },
          "count": { "type": "integer" }
        }
      }
    },
    "dependency_summary": {
      "type": "object",
      "properties": {
        "orphan_skills": { "type": "array", "items": { "type": "string" } },
        "circular_dependencies": { "type": "array" },
        "workflow_gaps": { "type": "array", "items": { "type": "string" } },
        "total_edges": { "type": "integer" }
      }
    },
    "contract_status": { "type": "array" },
    "data_authority_status": {
      "type": "object",
      "properties": {
        "sor_conflicts": { "type": "array" },
        "unauthorized_writes": { "type": "array", "items": { "type": "string" } }
      }
    },
    "recommendations": { "type": "array", "items": { "$ref": "#/definitions/recommendation" } },
    "ai_insights": { "type": "array" }
  },
  "definitions": {
    "skill_audit_row": {
      "type": "object",
      "properties": {
        "skill_name": { "type": "string" },
        "domain": { "type": "string" },
        "version": { "type": ["string", "null"] },
        "owner": { "type": ["string", "null"] },
        "maturity_level": { "type": "string", "enum": ["L0_experimental", "L1_assisted", "L2_operational", "L3_autonomous", "deprecated", "unset"] },
        "purpose": { "type": "string" },
        "quality_score": { "type": "integer", "minimum": 1, "maximum": 10 },
        "violated_standards": { "type": "array", "items": { "type": "string" } },
        "has_governance_contract": { "type": "boolean" },
        "has_input_schema": { "type": "boolean" },
        "has_output_schema": { "type": "boolean" },
        "has_execution_log": { "type": "boolean" },
        "has_pre_exec_validation": { "type": "boolean" },
        "write_permissions_declared": { "type": "boolean" },
        "data_authority_compliant": { "type": "boolean" },
        "fallback_skill": { "type": ["string", "null"] },
        "duplicate_of": { "type": ["string", "null"] },
        "upstream_skills": { "type": "array", "items": { "type": "string" } },
        "downstream_skills": { "type": "array", "items": { "type": "string" } },
        "critical_violations": { "type": "array", "items": { "type": "string" } },
        "high_violations": { "type": "array", "items": { "type": "string" } },
        "medium_violations": { "type": "array", "items": { "type": "string" } },
        "low_violations": { "type": "array", "items": { "type": "string" } }
      }
    },
    "recommendation": {
      "type": "object",
      "properties": {
        "skill_name": { "type": "string" },
        "action": { "type": "string" },
        "priority": { "type": "string", "enum": ["P1", "P2", "P3"] },
        "rationale": { "type": "string" },
        "instructions": { "type": "string" },
        "blocked_by_severity": { "type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW", "none"] }
      }
    }
  }
}
```

### Registry Entry Schema
```json
{
  "type": "object",
  "properties": {
    "skill_name": { "type": "string" },
    "version": { "type": "string" },
    "owner": { "type": ["string", "null"] },
    "domain": { "type": "string" },
    "purpose": { "type": "string", "maxLength": 100 },
    "maturity_level": { "type": "string", "enum": ["L0_experimental", "L1_assisted", "L2_operational", "L3_autonomous", "deprecated"] },
    "write_permissions": { "type": "array", "items": { "type": "string" } },
    "systems_accessed": { "type": "array", "items": { "type": "string" } },
    "validation_rules": { "type": "string" },
    "logging_level": { "type": "string", "enum": ["none", "summary", "full"] },
    "governance_contract_declared": { "type": "boolean" },
    "inputs_schema": { "type": "string" },
    "outputs_schema": { "type": "string" },
    "upstream_skills": { "type": "array", "items": { "type": "string" } },
    "downstream_skills": { "type": "array", "items": { "type": "string" } },
    "related_workflows": { "type": "array", "items": { "type": "string" } },
    "artifacts_using_skill": { "type": "array", "items": { "type": "string" } },
    "fallback_skill": { "type": ["string", "null"] },
    "quality_score": { "type": ["integer", "null"], "minimum": 1, "maximum": 10 },
    "last_audited": { "type": ["string", "null"], "format": "date" },
    "prefix": { "type": ["string", "null"] },
    "status": { "type": "string", "enum": ["active", "deprecated", "pending-review"] }
  },
  "required": ["skill_name", "version", "domain", "purpose", "maturity_level", "status", "write_permissions"]
}
```

---

## Mode Dispatch Input Schema

```json
{
  "type": "object",
  "properties": {
    "mode": { "type": "string", "enum": ["AUDIT", "SYNTHESIZE", "REGISTRY", "ARCHITECTURE"] },
    "target": { "type": "string" },
    "audit_scope": { "type": "string", "enum": ["full", "standards", "dependencies", "maturity", "contracts", "data_authority"] },
    "synthesis_input": { "type": "array", "items": { "type": "string" } },
    "registry_action": { "type": "string", "enum": ["read", "add", "update_status"] },
    "resolution_record": { "type": "object" },
    "architecture_task": { "type": "string", "enum": ["full_audit", "artifact_validation", "context_registry_check", "skill_layer_scan", "skill_creation_guardrail", "law_check"] },
    "proposed_skill_name": { "type": "string" },
    "proposed_skill_domain": { "type": "string" },
    "artifact_code": { "type": "string" },
    "law_number": { "type": "integer", "minimum": 1, "maximum": 7 }
  },
  "required": ["mode"]
}
```

---

## SYNTHESIZE Mode (absorbed from ikraft-skill-intelligence)

Observes skill executions, synthesises patterns from LE-* records, scores performance, and produces governance improvement recommendations. **Reads and recommends only -- never modifies skills directly.**

### Six Modules

| Module | Code | Purpose |
|---|---|---|
| Execution Observer | M1 | Record compact execution events |
| Decision Evaluator | M2 | Assess skill selection quality |
| Learning Synthesiser | M3 | Aggregate LE-* records into patterns |
| Knowledge Base Manager | M4 | Maintain domain heuristics |
| Performance Scorer | M5 | Score per-skill across 5 dimensions |
| Governance Recommender | M6 | Produce improvement recommendations |

### Performance Scoring (M5)

| Dimension | Measures |
|---|---|
| D1 Trigger Accuracy | Was the skill triggered at the right time? |
| D2 Output Compliance | Did output match declared schema? |
| D3 Exception Rate | How often does this skill generate LE records? |
| D4 Downstream Adoption | Do downstream skills use this skill's output? |
| D5 Evolution Velocity | Is the skill improving? |

Score: 1-5 per dimension. Bands: >=4 Healthy / 3-3.9 Watch / <3 At Risk.

### Recommendation Types (M6)

| Type | Route to |
|---|---|
| triggering_fix | ism-skill-factory |
| schema_update | ism-skill-factory |
| rule_addition | ism-skill-factory |
| maturity_promotion | AUDIT mode |
| skill_split | ism-skill-factory |
| skill_deprecation | AUDIT mode + ism-scrum-master |
| dependency_gap | AUDIT mode |
| governance_contract_gap | AUDIT mode |

### Prompt Quality (PROMPT-QUALITY mode)

Scores prompts: Conciseness (20%), Precision (25%), Scope Clarity (20%), Accuracy (25%), Stability (10%).
Grades: A (9-10), B (7-8), C (5-6), D (3-4), F (0-2).
Modes: provide prompt text (Score) | provide feedback (Log) | ask status (Report).
