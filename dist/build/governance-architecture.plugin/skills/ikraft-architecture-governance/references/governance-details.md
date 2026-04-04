# Governance Details — Compact Reference
# Trimmed 2026-04-03 from 35KB to ~8KB. Full narrative removed; tables and checklists retained.

---

## ARCHITECTURE Mode

Enforces the 7 Laws. Validates layer separation: Context (knowledge) -> Skills (logic) -> Artifacts (execution). Produces `ArchitectureComplianceReport`. Read-only — never modifies skills, artifacts, or context files.

### 3-Layer Model

| Layer | Contains | Location | Rule |
|---|---|---|---|
| CONTEXT | Fee structures, pricing, taxonomies, market rules | `references/` files | No executable code or workflows |
| SKILLS | Reasoning, formulas, orchestration, decisions | SKILL.md files | No UI code, no embedded knowledge |
| ARTIFACTS | Dashboards, calculators, reports, forms | JSX/HTML artifacts | No business rules, no self-directed action |

### Law Quick-Check Table

| Law | Check | Violation | Severity |
|---|---|---|---|
| LAW-1 | Skills contain only logic/orchestration — no JSX/HTML/CSS/data-loops | V-048 | HIGH |
| LAW-2 | Artifacts have no hardcoded business rules or formulas | V-047 | CRITICAL |
| LAW-3 | Knowledge in `references/`, not inline in skills | V-052 | MEDIUM |
| LAW-4 | Artifacts receive parameters from skills, never self-configure strategy | V-051 | CRITICAL |
| LAW-5 | No pricing/margin/ranking/gate formulas in artifact code | V-047 | CRITICAL |
| LAW-6 | Context registered in context-registry.md, no duplication across skills | V-049 | MEDIUM |
| LAW-7 | Pre-creation guardrail run before any new skill | V-050/V-053 | HIGH |

### ARCHITECTURE Audit Workflow

```
A1: Load references (architecture-laws.md, context-registry.md, artifact-audit-rules.md)
A2: Skill scan — LAW-1/3/6: flag V-048 (UI code), V-052 (inline rules), V-049 (duplication)
A3: Artifact scan — LAW-2/5: flag V-047 (business logic) per line
A4: Orchestration check — LAW-4: flag V-051 (no upstream skill)
A5: Context registry validation — LAW-6: verify canonical locations, flag unregistered objects
A6: Skill creation guardrail — LAW-7: run 5-step protocol, return SkillCreationVerdict
A7: Extended checks — V-054 (no AI_INSIGHTS_SPEC), V-055 (direct Slack MCP), V-056/V-057/V-058 (missing artifact components)
A8: Produce ArchitectureComplianceReport grouped by Law
```

---

## Governance Responsibilities (1-16)

### 1 — Skill Scan
Cross-reference `available_skills` against registry. Flag: UNREGISTERED, GHOST ENTRY, MATURITY UNSET, CONTRACT MISSING (V-037), VERSION MISSING (V-043).

### 2 — Standards Evaluation
Score each skill (1-10) against 20 standards in `skill-standards.md`.

### 3 — Violation Code Table

| Code | Description | Sev |
|---|---|---|
| V-001 | Missing single responsibility | HIGH |
| V-002 | Missing input schema | HIGH |
| V-003 | Missing JSON output schema | HIGH |
| V-004 | Duplicated responsibility | MED |
| V-005 | Mixed domains | MED |
| V-006 | Embedded business rules | MED |
| V-007 | No session protocol | LOW |
| V-008 | No auto-learn protocol | MED |
| V-009 | Undertrigger risk | MED |
| V-010 | Missing Related Skills | LOW |
| V-011 | SKILL.md >500 lines unoffloaded | LOW |
| V-012 | References non-existent files | HIGH |
| V-013 | Missing dependency metadata | MED |
| V-014 | Orphaned skill | MED |
| V-015 | Maturity not set | HIGH |
| V-016 | Experimental in production | CRIT |
| V-017 | Contract ref but no contract | MED |
| V-018 | Input schema mismatch | HIGH |
| V-019 | Output schema mismatch | HIGH |
| V-020 | Deprecated skill in active contract | CRIT |
| V-021 | No fallback, production skill | MED |
| V-022 | Circular dependency | CRIT |
| V-023 | No measurable insight | MED |
| V-024 | Unsafe data operations | CRIT |
| V-025 | Missing data validation | HIGH |
| V-026 | No data monitoring | HIGH |
| V-027 | No exception handling on ext calls | HIGH |
| V-028 | No notification handling | MED |
| V-029 | No provenance metadata | MED |
| V-030 | AI insight undocumented | MED |
| V-031 | No accuracy feedback loop | MED |
| V-032 | No process measurement | LOW |
| V-033 | Observability absent | HIGH |
| V-034 | Prompt quality issues | MED |
| V-035 | No source label on UI data | MED |
| V-036 | No durable storage target | HIGH |
| V-037 | Missing governance contract | HIGH |
| V-038 | Write perms undeclared | CRIT |
| V-039 | Writes below L2 | CRIT |
| V-040 | L3 no approval record | CRIT |
| V-041 | No pre-exec validation | HIGH |
| V-042 | No execution log | HIGH |
| V-043 | Missing version | HIGH |
| V-044 | Data authority violation | CRIT |
| V-045 | Artifact ID not propagated | MED |
| V-046 | Invalid state transition | HIGH |
| V-047 | Business logic in artifact | CRIT |
| V-048 | UI/exec code in skill | HIGH |
| V-049 | Knowledge duplicated | MED |
| V-050 | LAW-7 guardrail skipped | HIGH |
| V-051 | Artifact operates independently | CRIT |
| V-052 | Rules embedded in skill | MED |
| V-053 | Redundant skill created | HIGH |
| V-054 | No AI_INSIGHTS_SPEC | MED |
| V-055 | Direct Slack MCP in auto path | CRIT |
| V-056 | Missing SlackDispatcher | HIGH |
| V-057 | Missing AIInsightPanel | HIGH |
| V-058 | Missing decision-support elements | HIGH |

### 4 — Dependency Mapping
Verify `upstream_skills`, `downstream_skills`, `related_workflows`, `artifacts_using_skill`. Detect orphans, circular deps (V-022), contract gaps (V-013, V-014).

### 5 — Maturity Lifecycle (L0-L3)
L0 Experimental -> L1 Assisted -> L2 Operational -> L3 Autonomous. Any -> deprecated. Only L2+ may write external systems. Block: L0/L1 writing external, L3 without approval, experimental in production contracts, deprecated in active chains, production with quality_score < 7.

### 6 — Governance Contract Validation
Required: `skill_name`, `version`, `owner`, `domain`. Data-writing skills also need: `systems_accessed`, `write_permissions`, `validation_rules`, `logging_level`.

### 7 — Pre-Execution Validation
Check: missing params (V-041), schema mismatch (V-041), duplicate entity (V-044), authority conflict (V-038), write permission (V-038). Only HIGH blocks execution.

### 8 — Execution Log Audit
L2+ data-writing skills must specify: `skill`, `version`, `timestamp`, `input_hash`, `systems_modified`, `records_created_or_updated`, `status`. Missing = V-042.

### 9 — Data Authority Rules
Each entity has one authoritative SOR. Flag V-044 for: writing to non-SOR, dual writes without sync doc, conflicting SOR assignments.

### 10 — Workflow Contract Validation
Verify: all chain skills registered/active, no deprecated in chain, input/output handoffs valid, no L0 in production workflow, artifact ID propagation (V-045), state transitions valid (V-046).

### 11 — Extended Checks (C1-C18)
C1 BI, C2 Domain expertise, C3 Gap exploration, C4 Validation, C5 Alerting, C6 Fallback, C7 Safety, C8 GenAI insight, C9 Data validation, C10 Data monitoring, C11 Exception handling, C12 Notification, C13 Enrichment provenance, C14 AI insight docs, C15 GenAI outcome, C16 Process measurement, C17 Observability, C18 Prompt quality.

### 12 — Error Severity
LOW=log only. MEDIUM=warn+refactor list. HIGH=block maturity promotion. CRITICAL=block execution+trigger audit.

### 13 — Version Governance
Verify: semver exists, matches registry, changelog has entries, no production ref >1 MAJOR behind.

### 14 — Automated Scan
Targets: missing contracts, deprecated in active, schema drift, orphan artifacts, cross-system inconsistencies, version mismatches.

### 15 — Registry Maintenance
Update skill-registry.md, dependency-graph.md, skill-change-log.md after audits. Never modify skill files.

### 16 — Report Production
Include: registry summary, per-skill audit rows, violation table (CRIT->HIGH->MED->LOW), dependency graph, contract status, data authority, execution log coverage, governance contract coverage, prioritized refactoring recs.

---

## Refactoring Actions

| Action | When |
|---|---|
| SPLIT | >1 responsibility or mixed domains |
| MERGE | >=80% overlap |
| ADD_INPUT_SCHEMA | No input schema |
| ADD_OUTPUT_SCHEMA | No output schema |
| ADD_CONTEXT_REF | Embedded business rules |
| MAKE_PUSHY | Undertrigger risk |
| ADD_AUTO_LEARN | Repeated use, no learnings |
| ADD_RELATED_SKILLS | Section missing |
| REGISTER | Not in registry |
| DEREGISTER | No longer exists |
| ADD_DEPENDENCY_METADATA | Missing upstream/downstream |
| SET_MATURITY_LEVEL | Not set |
| PROMOTE_MATURITY | Meets next level |
| DEMOTE_OR_DEPRECATE | Violates production reqs |
| ADD_TO_CONTRACT | In workflow, no contract |
| REMOVE_FROM_CONTRACT | Deprecated in active contract |
| ADD_FALLBACK | Production, no fallback |
| LOG_CHANGE | Modified, no changelog |
| ADD_GOVERNANCE_CONTRACT | Missing contract block |
| ADD_WRITE_PERMISSIONS | Writes externally, undeclared |
| ADD_EXECUTION_LOG | L2+ writer, no log |
| ADD_VERSION | No version ID |
| RESOLVE_DATA_AUTHORITY | SOR conflict |
| ADD_PRE_EXEC_VALIDATION | No validation docs |
| PURGE_ARTIFACT_LOGIC | Business rules in artifact (V-047/V-051) |
| EXTRACT_SKILL_EXECUTION | Execution/UI code in skill (V-048) |
| CENTRALIZE_CONTEXT | Knowledge duplicated (V-049/V-052) |
| RUN_SKILL_GUARDRAIL | No LAW-7 check (V-050) |
| MERGE_OR_EXTEND | Redundant skill (V-053) |
| REGISTER_CONTEXT | Unregistered context object |
| WIRE_SKILL_ORCHESTRATION | Artifact operating independently (V-051) |
