# Skill Metadata Schema
# ikraft-skill-auditor -- references/skill-metadata-schema.md
# Version: 2.0.0
# Purpose: Structured metadata every skill must declare for dependency tracking and registry.

---

## Per-Skill Dependency Block

```yaml
## Dependency Metadata

skill_name: <canonical skill name>

upstream_skills:
  - skill_name: <name>
    data_consumed: <what output consumed>
    required: true | false

downstream_skills:
  - skill_name: <name>
    data_produced: <what output passed>
    trigger_condition: always | conditional | manual

related_workflows:
  - workflow_name: <name matching workflow-contract-registry.md>
    role: producer | consumer | coordinator | validator
    step_number: <step in chain>

artifacts_using_skill:
  - artifact_name: <filename>
    data_dependency: <what data displayed>

fallback_skill: <skill name or null>
fallback_reason: <why no fallback if null>

orphan_declared: false
orphan_reason: null
```

---

## Field Requirements

| Field | Required | Notes |
|---|---|---|
| upstream_skills | Yes | Empty [] for root skills |
| downstream_skills | Yes | Empty [] for terminal skills |
| related_workflows | Yes | Empty [] if not in any named workflow |
| artifacts_using_skill | Yes | Empty [] if no artifact calls this skill |
| fallback_skill | Yes | Registered active skill or null |
| fallback_reason | Conditional | Required if null for L2+ |
| orphan_declared | Conditional | Required if both upstream and downstream empty |

---

## Orphan Rules

Undeclared orphan (V-014): empty upstream + downstream + workflows, orphan_declared not true.
Declared orphan: orphan_declared true with orphan_reason.

---

## Canonical Workflow Names

| Workflow Name | Primary Chain |
|---|---|
| WF-PRODUCT-LAUNCH | market-researcher -> product-scorer -> margin-calculator -> launch-gate-checker |
| WF-VENDOR-EVALUATION | vendor-discovery -> vendor-scorer -> rfq-generator |
| WF-SPRINT-CYCLE | ism-gap-auditor -> ecosystem-ops |
| WF-ARTIFACT-RELEASE | ecosystem-ops (artifact lifecycle) |
| WF-ZOHO-IMPLEMENTATION | zoho-solutions-architect -> zoho-developer |
| WF-SKILL-CREATION | skill-creator -> ikraft-skill-auditor |

---

## Dependency Validation Rules (STEP 4)

| Check | Violation | Severity |
|---|---|---|
| Upstream does not reciprocate downstream declaration | V-013 | MEDIUM |
| Downstream does not reciprocate upstream declaration | V-013 | MEDIUM |
| No upstream/downstream/workflows, orphan_declared false | V-014 | MEDIUM |
| In workflow-contract-registry but no related_workflows | V-013 | MEDIUM |
| Cycle detected in directed graph | V-022 | CRITICAL |
| Deprecated skill in active dependency | V-020 | CRITICAL |
