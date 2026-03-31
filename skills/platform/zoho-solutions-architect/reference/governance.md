# Governance -- zoho-solutions-architect

## Governance Contract

```yaml
skill_name: zoho-solutions-architect
version: 1.0.0
owner: Ismokraft
domain: engineering
maturity_level: L1_assisted
systems_accessed: []
write_permissions: []
validation_rules: >
  Read-only skill. No external system writes. Output is guidance, analysis, or generated
  content only. No confirmation gate required for reads.
logging_level: none
measurable_kpis:
  - kpi_id: KPI-SKILL-ZA-01
    name: Trigger Accuracy (D1)
    source: ikraft-skill-governance SYNTHESIZE mode (SIL M5)
    measurement: "% of sessions correctly invoked for Zoho design vs off-topic or premature"
    target: ">= 80%"
    at_risk_threshold: "< 60%"
    signal_to: null
  - kpi_id: KPI-SKILL-ZA-02
    name: Tech Spec Handoff Completeness Rate
    source: "zoho-developer -- required spec fields present at handoff"
    measurement: "% of tech specs passed to zoho-developer that contain all required implementation fields"
    target: "> 85%"
    at_risk_threshold: "< 60% -- specs are incomplete, causing implementation rework"
    signal_to: ism-scrum-master
  - kpi_id: KPI-SKILL-ZA-03
    name: Design Revision Rate
    source: "ism-learning-engine LE-* records -- ZA-prefix"
    measurement: "% of designs that require revision after handoff to zoho-developer"
    target: "< 30%"
    at_risk_threshold: "> 60%"
    signal_to: ism-scrum-master
```

## Dependency Metadata

```yaml
skill_name: zoho-solutions-architect
upstream_skills: []
downstream_skills:
  - skill_name: zoho-developer
    data_produced: Tech Spec with implementation requirements
    trigger_condition: After HLD/LLD approved
  - skill_name: zoho-data-ops
    data_produced: Field mappings and data flow designs
    trigger_condition: After design approved, for runtime execution
  - skill_name: ecosystem-ops
    data_produced: Tech Specs for Confluence publishing
    trigger_condition: On the operator confirmation
  - skill_name: ism-scrum-master
    data_produced: design tasks for sprint backlog
    trigger_condition: On complex design decisions
fallback_skill: null
orphan_declared: false
```

## Execution Log

| Action | Logged fields |
|--------|---------------|
| HLD produced | solution_name, app_scope, timestamp |
| Tech Spec produced | spec_name, target_apps, timestamp |
