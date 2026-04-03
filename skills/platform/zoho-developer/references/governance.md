# Governance -- zoho-developer

## Governance Contract

```yaml
skill_name: zoho-developer
version: 1.1.0
owner: Ismokraft
domain: engineering
maturity_level: L1_assisted
systems_accessed: []
write_permissions: []
validation_rules: >
  Requires tech_spec or problem_description minimum.
  Output is code only -- the operator applies changes to Zoho manually.
measurable_kpis:
  - kpi_id: KPI-SKILL-ZD-01
    name: Trigger Accuracy (D1)
    source: ikraft-architecture-governance SYNTHESIZE mode (SIL M5)
    measurement: "% of sessions correctly invoked for Zoho code tasks"
    target: ">= 80%"
    at_risk_threshold: "< 60%"
    signal_to: null
  - kpi_id: KPI-SKILL-ZD-02
    name: Code Deployment Success Rate
    source: post-deployment verification
    measurement: "% of Deluge/Flow code outputs that deploy and run without error on first attempt"
    target: "> 70%"
    at_risk_threshold: "< 40%"
    signal_to: ism-scrum-master
  - kpi_id: KPI-SKILL-ZD-03
    name: Tech Spec Adherence Rate
    source: ism-learning-engine ZD-* records
    measurement: "% of implementations that follow zoho-solutions-architect tech spec without undocumented deviations"
    target: "> 85%"
    at_risk_threshold: "< 60%"
    signal_to: null
```

## Dependency Metadata

```yaml
skill_name: zoho-developer
upstream_skills:
  - skill_name: zoho-solutions-architect
    data_consumed: Tech Spec with Deluge/Flow/Creator requirements
    required: false
  - skill_name: automation-designer
    data_consumed: AutomationSpec for implementation
    required: false
downstream_skills:
  - skill_name: ism-scrum-master
    data_produced: implementation tasks and bug fixes
    trigger_condition: On code review or test failure
  - skill_name: zoho-data-ops
    data_produced: Custom functions that zoho-data-ops may call
    trigger_condition: When data ops requires server-side logic
fallback_skill: null
orphan_declared: false
```

## Execution Log

| Action | Logged fields |
|--------|---------------|
| Function written | function_name, target_app, lines_of_code, timestamp |
| Flow configured | flow_name, trigger_event, action_count, timestamp |
| Bug fixed | issue_ref, function_name, timestamp |
