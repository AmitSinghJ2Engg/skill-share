# Audit Templates
# ikraft-skill-auditor -- references/audit-templates.md
# Version: 2.0.0
# Purpose: Standard templates for governance audit report production (STEP 14).

---

## Full Audit Report Template

```
# Ismokraft Skill Governance Audit Report

**Audit Date**: [ISO date]
**Auditor**: ikraft-skill-governance v[version]
**Scope**: [full | single | domain | ...]
**Target**: [skill name, domain, or "All Skills"]
**Reference Files Used**: [list]
**Reference Files Missing**: [list -- declare LIMITED SCOPE if any]

---

## 1. Registry Summary

| Metric | Value |
|---|---|
| Total active skills | N |
| Total deprecated | N |
| Unregistered | N |
| Ghost entries | N |
| Missing governance contract | N |
| Missing version | N |

### Maturity Distribution
| Level | Count | % of Active |
|---|---|---|
| L0_experimental | N | % |
| L1_assisted | N | % |
| L2_operational | N | % |
| L3_autonomous | N | % |

## 2. Coverage Metrics
| Metric | Value | Target |
|---|---|---|
| Governance contract coverage | N% | >= 90% |
| Execution log coverage (L2+ writers) | N% | 100% |
| Write permission declared | N% | 100% |
| Pre-execution validation | N% | 100% |

## 3. Per-Skill Audit Table
| Skill | Domain | Maturity | Version | Score | Contract | Violations | Write Perms | Exec Log |
|---|---|---|---|---|---|---|---|---|

## 4. Violation Summary (by CRITICAL/HIGH/MEDIUM/LOW)
| Violation | Affected Skills | Count |
|---|---|---|

## 5. Dependency Summary [SKIP IF MISSING: dependency-graph.md]
| Metric | Value |
|---|---|
| Total edges | N |
| Orphan skills | N |
| Circular dependencies | N |
| Workflow gaps | N |

## 6. Workflow Contract Status [SKIP IF MISSING: workflow-contract-registry.md]
| Workflow | Status | Violations | Artifact Propagation |
|---|---|---|---|

## 7. Data Authority Status
| Entity | Authoritative System | Status | Issue |
|---|---|---|---|

## 8. Skills Requiring Immediate Action
### CRITICAL -- This Sprint
| Skill | Issue | Action | Urgency |
|---|---|---|---|

### HIGH -- Next Sprint
| Skill | Issue | Action | Sprint |
|---|---|---|---|

## 9. Recommendations (Prioritised)
| Priority | Skill | Action | Rationale |
|---|---|---|---|

## 10. AI Insights
[Patterns and structural observations]

## 11. Audit Metadata
| Field | Value |
|---|---|
| Governance version | [x.y.z] |
| Standards applied | S1-S21 |
| Extended checks | C1-C18 |
| Next recommended audit | [date] |
```

---

## Single-Skill Audit Template

```
# Skill Audit -- [skill_name]

**Audit Date**: [date] | **Version**: [x.y.z] | **Domain**: [domain] | **Maturity**: [L0-L3]

## Standards Evaluation
| Standard | Pass | Deduction | Violation | Notes |
|---|---|---|---|---|
| S1-S21 | | | | |

**Total Score**: N / 10

## Governance Contract Status
Contract declared: YES/NO. [Validate fields against compliance-specs.md]

## Dependency Status
| Field | Declared | Consistent |
|---|---|---|

## Violations
| Code | Severity | Description |
|---|---|---|

## Recommendations
| Action | Priority | Instructions |
|---|---|---|
```

---

## Registry Update Entry Template

```yaml
# Registry update -- [date]
skill_name: [name]
  quality_score: [new]
  last_audited: [date]
  last_audit_version: "[x.y.z]"
  flags: [updated list]
```
