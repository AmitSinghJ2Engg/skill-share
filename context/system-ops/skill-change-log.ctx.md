# Skill Change Log
# Version: 1.0.0
# Purpose: Chronological record of skill status changes.
# Updated by: ikraft-skill-governance (registry maintenance)

---

## Entry Schema

Fields: `change_id` (CL-NNNN), `date`, `change_type`, `skill_name`, `from`, `to`, `rationale`, `governance_version`, `author`.

Change types: GOVERNANCE_UPGRADE | SKILL_CREATED | SKILL_MODIFIED | MATURITY_PROMOTED | MATURITY_DEMOTED | SKILL_DEPRECATED | SKILL_RETIRED | LABEL_MIGRATED | REGISTRY_UPDATED | DEPENDENCY_UPDATED | CONTRACT_ADDED | AUDIT_COMPLETED | SOR_UPDATED

---

## Log Entries (CL-0055 onward)

- cl_id: CL-0055
  date: 2026-03-13
  skill: ikraft-skill-governance/references/skill-registry.md
  sprint: Sprint 5
  summary: ism-resolution-registry entry added to skill-registry.md.

- cl_id: CL-0056
  date: 2026-03-13
  skill: ikraft-skill-intelligence
  from_version: "1.1.0" -> "1.1.1"
  sprint: Sprint 5
  summary: Maturity promoted L1_assisted -> L2_operational.

- cl_id: CL-0057
  date: 2026-03-13
  skill: execution-log-schema.md
  sprint: Sprint 5
  summary: Bigin references removed, replaced with ISM_ExecutionLogs.

- cl_id: CL-0058
  date: 2026-03-15
  skill: ecosystem-ops
  version: 1.0.0 -> 2.0.0
  sprint: Consolidation Sprint
  summary: Absorbed artifact-lifecycle as Function 4.

- cl_id: CL-0059
  date: 2026-03-15
  skill: artifact-lifecycle
  version: 1.0.0 -> RETIRED
  summary: All capabilities absorbed into ecosystem-ops v2.0.0 Function 4.

- cl_id: CL-0060
  date: 2026-03-15
  skill: ikraft-skill-governance
  version: 3.0.5 -> 4.0.0
  summary: Absorbed ikraft-skill-intelligence as SYNTHESIZE mode. Added REGISTRY mode.

- cl_id: CL-0061
  date: 2026-03-15
  skill: ikraft-skill-intelligence
  version: 1.1.1 -> RETIRED
  summary: SYNTHESIZE mode absorbed into ikraft-skill-governance v4.0.0.

- cl_id: CL-0062
  date: 2026-03-15
  skill: ism-learning-engine
  version: 1.1.1 -> 2.0.0
  summary: Absorbed ism-crm-gateway as PERSIST and QUERY modes.

- cl_id: CL-0063
  date: 2026-03-15
  skill: ism-crm-gateway
  version: 1.0.1 -> RETIRED
  summary: PERSIST and QUERY modes absorbed into ism-learning-engine v2.0.0.

- cl_id: CL-0064
  date: 2026-03-15
  skill: ism-resolution-registry
  version: 1.0.0 -> DEMOTED
  summary: Demoted to protocol reference. Invocations route to ikraft-skill-governance REGISTRY mode.

- cl_id: CL-0065
  date: 2026-03-15
  skill: product-lab
  version: 1.0.0 -> 1.1.0
  summary: BATCH-SCORE mode removed, Pre-Execution Validation added.

- cl_id: CL-0066
  date: 2026-03-15
  skill: vendor-ops
  version: 1.0.0 -> 1.1.0
  summary: S8/S10/S11/S16/S19 governance remediation. CRM write path -> ism-learning-engine PERSIST.

- cl_id: CL-0067
  date: 2026-03-15
  skill: capital-planner
  version: 1.0.0 -> 1.1.0
  summary: S8/S10/S11/S16/S19 governance remediation. CRM write path -> ism-learning-engine PERSIST.

- cl_id: CL-0068
  date: 2026-03-15
  skill: content-writer
  version: 1.0.0 -> 1.1.0
  summary: S8/S10/S11/S16/S19 governance remediation. CRM write path -> ism-learning-engine PERSIST.

- cl_id: CL-0069
  date: 2026-03-15
  skill: ads-ops
  version: 1.0.0 -> 1.1.0
  summary: S8/S10/S11/S16/S19 governance remediation. Stale ikraft-skill-intelligence refs replaced.

2026-03-15 | ikraft-skill-governance | 4.0.0 -> 5.0.0 | Added ARCHITECTURE mode: 7 Laws, context registry, artifact audit, skill creation guardrail.
2026-03-15 | artifacts-builder-v2 | 1.0.0 -> 2.0.0 | AB-P003 SlackDispatcher, AB-P004 AIInsightPanel, AB-P005 decision-support mandatory.
2026-03-15 | ism-skill-factory | 1.1.2 -> 1.2.0 | S23 AI_INSIGHTS_SPEC and S24 SLACK_PAYLOAD_SPEC added.
2026-03-15 | ism-learning-engine | 2.0.0 -> 2.1.0 | CAPTURE STEP 4 fixed -- produces SlackPayloadSpec.
2026-03-15 | automation-designer | 1.1.0 -> 1.2.0 | AlertSpec updated with slack_payload_spec block.
2026-03-15 | webapp-testing | 1.1.0 -> 1.2.0 | 15 Ismokraft artifact standard test cases added.
2026-03-15 | ecosystem-ops | 2.0.0 -> 2.1.0 | Function 4 gate acknowledges V-056/V-057/V-058.

---

## Earlier History (CL-0001 through CL-0054)

Archived. Key milestones:
- CL-0001 (2026-03-11): Governance v3.0 upgrade. 20 standards, 46 violation codes.
- CL-0002 (2026-03-12): 11 missing reference files restored. Migration baseline established.
- CL-0003 (2026-03-12): Skill registry baseline created. 35 active skills registered.
- CL-0013 (2026-03-13): ism-crm-gateway created. Centralised CRM writes.
- CL-0014 (2026-03-12): 6 core skills promoted to L2_operational.
- CL-0018 (2026-03-13): Sprint 2 audit completed. 5 skills scored, all-green.
- CL-0020..CL-0028 (Sprint 3): PEV and Execution Log additions across 8 skills.
- CL-0029..CL-0036 (Sprint 3): KPI closing steps and execution_trace added.
- CL-0037..CL-0054 (Sprint 4): verification_method added to 16 skills. Gateway routing for ism-learning-engine and ikraft-skill-intelligence.
