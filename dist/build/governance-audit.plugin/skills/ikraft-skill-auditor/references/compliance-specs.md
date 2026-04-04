# Compliance Specs
# ikraft-skill-auditor -- references/compliance-specs.md
# Version: 3.0.0 (merged: governance contract, PEV, execution log, error severity)
# Purpose: Governance contract structure, PEV rules, execution log schema, error severity model.

---

## Part 1: Governance Contract

Every SKILL.md must include a `## Governance Contract` section:

```yaml
skill_name: <canonical name>
version: <x.y.z>
owner: <team or person>
domain: <product|vendor|costing|marketing|operations|analytics|governance|platform|engineering|finance>
maturity_level: <L0_experimental|L1_assisted|L2_operational|L3_autonomous>
systems_accessed: [<system>]
write_permissions: [<system>]  # [] if read-only
validation_rules: <what blocks execution>
logging_level: <none|summary|full>
```

### Contract Validation

| Check | Violation |
|---|---|
| skill_name matches filename | V-037 |
| version is valid semver | V-043 |
| domain is approved value | V-037 |
| maturity_level is L0-L3 | V-015 |
| write_permissions present | V-038 |
| systems_accessed lists all systems | V-038 |
| validation_rules non-empty | V-041 |
| logging_level present for L2+ | V-042 |

Data-writing skills (non-empty write_permissions) require: L2+, logging summary/full, SOR compliance, exec log format, duplicate risk check.

L3 additional: approval block (approved_by, date, scope, review <= 90 days). Missing/expired = V-040 (CRITICAL).

Coverage: `(skills with complete contract / total registered) x 100`. Target >= 90%.

---

## Part 2: Pre-Execution Validation (PEV)

Only HIGH/CRITICAL failures block execution. MEDIUM/LOW produce warnings.

| ID | Check | Applies to | Severity | Blocks? |
|---|---|---|---|---|
| PEV-01 | Required field presence | All structured-input | HIGH | YES |
| PEV-02 | Field type mismatch | All structured-input | HIGH | YES |
| PEV-03 | Enum/range validation | Constrained fields | HIGH | YES |
| PEV-04 | Duplicate entity risk | CRM record creators | HIGH | YES |
| PEV-05 | System authority conflict | Data-writing skills | CRITICAL | YES |
| PEV-06 | Write permission check | Data-writing skills | CRITICAL | YES |
| PEV-07 | Upstream artifact availability | Workflow-chained | MEDIUM | NO |
| PEV-08 | Stale data check | Time-sensitive readers | MEDIUM | NO |
| PEV-09 | MCP connection status | MCP tool users | MEDIUM | NO |
| PEV-10 | Output schema conformance | Structured-output | LOW | NO |

Missing PEV section = V-041 (HIGH). Incomplete = V-041 (MEDIUM).

---

## Part 3: Execution Log Schema

L2/L3 data-writing skills must specify execution log format. Missing = V-042.

```json
{
  "required": ["skill", "version", "timestamp", "input_hash", "systems_modified", "records_created_or_updated", "status"],
  "properties": {
    "skill": "string",
    "version": "string -- semver",
    "timestamp": "string -- ISO 8601",
    "session_id": "string|null",
    "input_hash": "string -- SHA-256 of business inputs (excludes timestamps/session)",
    "systems_modified": "string[]",
    "records_created_or_updated": "object -- per-system: {created: int, updated: int, record_ids: string[]}",
    "status": "enum: success|partial|failed|skipped",
    "skipped_reason": "string|null",
    "error_detail": "string|null",
    "upstream_artifact_id": "string|null",
    "produced_artifact_id": "string|null"
  }
}
```

Logging levels: none (L0/L1 read-only) | summary (L2 low-volume) | full (L2+ production, L3).

Coverage: `(L2+ writers with log spec / total L2+ writers) x 100`. Target 100%.

---

## Part 4: Error Severity Model

| Level | Action | Blocks? | Alert |
|---|---|---|---|
| LOW | Log only | No | None |
| MEDIUM | P2/P3 recommendation | No maturity block | Slack if 5+ on same skill |
| HIGH | P1 with sprint target | Blocks promotion | Slack for L2+ skills |
| CRITICAL | Block execution | Immediate | Slack #ism-artifact-issues + #ismo-sprint-notify |

### Violation Severity Table

| Code | Description | Severity |
|---|---|---|
| V-001 | Missing single responsibility | HIGH |
| V-002 | Missing input schema | HIGH |
| V-003 | Missing JSON output schema | HIGH |
| V-004 | Duplicated responsibility | MEDIUM |
| V-005 | Skill mixes domains | MEDIUM |
| V-006 | Business rules embedded | MEDIUM |
| V-007 | No session protocol | LOW |
| V-008 | No auto-learn protocol | MEDIUM |
| V-009 | Non-pushy description | MEDIUM |
| V-010 | Missing Related Skills | LOW |
| V-011 | SKILL.md too long | LOW |
| V-012 | References non-existent files | HIGH |
| V-013 | Missing dependency metadata | MEDIUM |
| V-014 | Orphaned skill | MEDIUM |
| V-015 | Maturity level not set | HIGH |
| V-016 | Experimental in production | CRITICAL |
| V-017 | Not in contract but used in chain | MEDIUM |
| V-018 | Input schema contract mismatch | HIGH |
| V-019 | Output schema contract mismatch | HIGH |
| V-020 | Deprecated skill in active contract | CRITICAL |
| V-021 | No fallback declared (production) | MEDIUM |
| V-022 | Circular dependency | CRITICAL |
| V-023 | No business intelligence output | MEDIUM |
| V-024 | Safety check failed | CRITICAL |
| V-025 | Data validation missing | HIGH |
| V-026 | Data monitoring absent | HIGH |
| V-027 | Exception handling missing | HIGH |
| V-028 | Notification handling absent | MEDIUM |
| V-029 | Enrichment lacks provenance | MEDIUM |
| V-030 | AI insight undocumented | MEDIUM |
| V-031 | GenAI outcome not measured | MEDIUM |
| V-032 | Process measurement absent | LOW |
| V-033 | Observability absent | HIGH |
| V-034 | Prompt quality issues | MEDIUM |
| V-035 | UI data source unlabelled | MEDIUM |
| V-036 | UI save flow no storage target | HIGH |
| V-037 | Missing governance contract | HIGH |
| V-038 | Write permissions undeclared | CRITICAL |
| V-039 | L0/L1 writes to external system | CRITICAL |
| V-040 | L3 lacks governance approval | CRITICAL |
| V-041 | Pre-execution validation absent | HIGH |
| V-042 | Execution log absent on L2+ writer | HIGH |
| V-043 | Missing version identifier | HIGH |
| V-044 | Data authority violation | CRITICAL |
| V-045 | Artifact ID not propagated | MEDIUM |
| V-046 | Invalid state transition | HIGH |

### Escalation Rules

| Condition | Escalation |
|---|---|
| MEDIUM on L2+ production skill | -> HIGH |
| HIGH unremediated after 2 sprints | -> CRITICAL |
| V-021 on sole writer to critical entity | -> HIGH |
| 5+ MEDIUM on same skill | Aggregate -> HIGH |
| Any violation on L3 skill | Escalate one level |

### Maturity Promotion Gates

| Transition | Allowed when |
|---|---|
| L0 -> L1 | No CRITICAL or HIGH |
| L1 -> L2 | No CRITICAL/HIGH; MEDIUM <= 3 |
| L2 -> L3 | No violations at all; governance approval |
| Any -> deprecated | Always |
