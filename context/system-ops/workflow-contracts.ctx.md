# Workflow Contract Registry
# Version: 1.0.0-baseline
# Purpose: Formal contracts for multi-skill workflows.
# Baseline date: 2026-03-12

---

## Contract Schema

Each contract declares: `workflow_name`, `status`, `skill_chain`, per-step required_inputs/expected_outputs/state_transitions, `artifact_propagation`.

---

## WF-PRODUCT-LAUNCH

```yaml
workflow_name: WF-PRODUCT-LAUNCH
status: active
version: 1.1.0
skill_chain: [product-intelligence, product-lab, margin-calculator, product-lab]

steps:
  - step: 1
    skill: product-intelligence
    required: [product_keyword, target_platform]
    produces: [product_keyword, keyword_demand_score, bsr_range, competitor_count, price_cluster, niche_health, ResearchRecord]
    exit: ResearchRecord with niche_health set

  - step: 2
    skill: product-lab
    required: [ResearchRecord, product_name]
    produces: [opportunity_score(0-100), criterion_breakdown, verdict(Strong/Moderate/Weak/Reject)]
    routing: Strong|Moderate -> step 3; Weak|Reject -> EXIT

  - step: 3
    skill: margin-calculator
    required: [product_name, selling_price, cogs, target_platform]
    produces: [net_margin_pct, breakeven_roas, financial_viability(Pass/Marginal/Fail), per_unit_breakdown]
    routing: Pass|Marginal -> step 4; Fail -> EXIT

  - step: 4
    skill: product-lab
    required: [opportunity_score, financial_viability, current_pipeline_stage]
    produces: [gate_results(8 gates), overall_verdict(GO/NO_GO/CONDITIONAL), next_pipeline_stage]

parallel_paths:
  - content-writer: after step 1, if niche_health=Healthy|Moderate
  - ads-ops: after step 3, if financial_viability=Pass

invariants: [product_keyword, product_name, niche_health, verdict, financial_viability, opportunity_score, overall_verdict]

state_transitions:
  New Request -> Validated -> Research & Profitability -> Test Sourcing -> Test Listing -> Paid Testing -> Scale Decision Data
```

---

## WF-VENDOR-EVALUATION

```yaml
workflow_name: WF-VENDOR-EVALUATION
status: active
version: 1.1.0
skill_chain: [vendor-ops(discover), vendor-ops(score), vendor-ops(rfq)]

steps:
  - step: 1 (DISCOVER)
    skill: vendor-ops
    required: [product_name, category, target_moq, target_unit_price_inr]
    produces: [discovery_run_id, vendors[](vendor_name, vendor_type, profile, quick_screen)]
    exit: at least 1 vendor with screen_verdict=PASS

  - step: 2 (SCORE)
    skill: vendor-ops
    required: [vendor_name, vendor_type]
    produces: [score(0-100), grade(A-F), verdict(Proceed/Negotiate/Sample/Reject), breakdown, gaps]
    routing: A|B|C -> step 3; D|F -> EXIT

  - step: 3 (RFQ)
    skill: vendor-ops
    required: [product_name, category, vendor_name, vendor_type, target_price_range, target_moq]
    produces: [rfq_record, rfq_document]

invariants: [product_name, category, target_moq, vendor_name, vendor_type, grade]
```

---

## WF-SPRINT-CYCLE

```yaml
workflow_name: WF-SPRINT-CYCLE
status: active
version: 1.1.0
skill_chain: [ism-gap-auditor, ism-scrum-master, ecosystem-ops]

steps:
  - step: 1 — ism-gap-auditor: produces gap_records, jira_tickets_created
  - step: 2 — ism-scrum-master: consumes gap_records, produces sprint_plan
  - step: 3 — ecosystem-ops: produces health_report (end of sprint)

notes: Steps 1 and 3 are trigger-based. Step 2 can run without step 1.
```

---

## WF-ARTIFACT-RELEASE

```yaml
workflow_name: WF-ARTIFACT-RELEASE
status: active
version: 1.1.0
skill_chain: [artifacts-builder-v2, ecosystem-ops]

steps:
  - step: 1 — artifacts-builder-v2: required [artifact_name, artifact_type, mode]. Produces artifact_jsx, artifact_version.
  - step: 2 — ecosystem-ops: required [artifact_name, artifact_version, target_status]. Manages lifecycle.

state_transitions: Draft -> Review (GO FEARLESS pass) -> Production (Amit approval) -> Retired
```

---

## WF-ZOHO-IMPLEMENTATION

```yaml
workflow_name: WF-ZOHO-IMPLEMENTATION
status: active
version: 1.1.0
skill_chain: [zoho-solutions-architect, zoho-developer]

steps:
  - step: 1 — zoho-solutions-architect: required [problem_description, zoho_apps_in_scope]. Produces HLD, LLD, tech_spec.
  - step: 2 — zoho-developer: required [tech_spec]. Produces code, test_cases. Code handed to Amit for deployment.

invariants: [problem_description, tech_spec]
```

---

## WF-SKILL-CREATION

```yaml
workflow_name: WF-SKILL-CREATION
status: active
version: 1.1.0
skill_chain: [ism-skill-factory, ikraft-skill-governance]

steps:
  - step: 1 — ism-skill-factory: required [skill_intent, domain]. Produces skill_name, skill_file (SKILL.md), prefix, standards_checklist.
  - step: 2 — ikraft-skill-governance: audits skill_file. Produces audit_report, quality_score, violations, grade.

loop: If score < 7 or CRITICAL violations -> return to step 1. Max 3 cycles before escalation.
```

---

## Validation Status (2026-03-13)

| Workflow | Handoffs | Status |
|---|---|---|
| WF-PRODUCT-LAUNCH | CONFIRMED | data-contract v1.1.0 |
| WF-VENDOR-EVALUATION | CONFIRMED | data-contract v1.1.0 |
| WF-SPRINT-CYCLE | inferred | data-contract v1.1.0 |
| WF-ARTIFACT-RELEASE | inferred | data-contract v1.1.0 |
| WF-ZOHO-IMPLEMENTATION | inferred | data-contract v1.1.0 |
| WF-SKILL-CREATION | inferred | data-contract v1.1.0 |
