---
name: okr-kpi-governance
description: >
  Source of truth for Ismokraft OKRs, KPIs, benchmarks, and forecasts. Manages
  Objectives, KPIs, benchmarks, actuals, and recommendations. Persists all data
  to Zoho CRM custom modules across sessions.
  ALWAYS trigger for: "OKR", "KPI", "define a KPI", "register objective",
  "set a target", "KPI benchmark", "what's our target for X", "performance target",
  "forecast", "update forecast", "evaluate performance", "KPI status",
  "below target", "above target", "dashboard benchmarks", "KPI registry",
  "add a KPI", "update target", "OKR hierarchy", "quarterly objective",
  "business targets", "ROAS target", "ACoS target", "revenue target",
  "margin target", "save KPI to CRM", "load KPIs from CRM", "persist objectives".
  Also trigger when any analytics artifact asks for benchmark data or comparison thresholds.
  If a dashboard or report needs a target to compare against — trigger. If unsure — trigger.
metadata:
  version: "1.1.2"
  domain: governance
  prefix: OKR-
---

# OKR / KPI Governance

Source of truth for all Ismokraft performance data — objectives, KPIs, benchmarks, forecasts, and the evaluation + recommendation logic that analytics artifacts consume.

**This skill defines. Analytics artifacts consume. Never the reverse.** CRM is the storage layer. This skill file is the definition layer.

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `okr-kpi-governance` + `cross-skill`
3. Check memory for `OKR-*` entries — apply active entries
4. Read `references/okr-registry.md` — active objectives and KPI definitions
5. Read `references/crm-persistence.md` — CRM module schema and MCP call patterns
6. If evaluation or dashboard work: read `references/evaluation-engine.md`
7. If reading/evaluating KPIs: fetch live records from `ISM_Objectives` and `ISM_KPIs` CRM modules

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause, invoke `ism-learning-engine` with details
2. Await user confirmation, then resume

---

## Capabilities (6)

| Capability | Purpose |
|---|---|
| `register_objective` | Create OBJ-NNN, persist to ISM_Objectives |
| `register_kpi` | Create KPI-NNN linked to objective, persist to ISM_KPIs |
| `update_kpi_target` | Update target + benchmark, append history |
| `update_forecast` | Update forecast value + basis |
| `evaluate_kpi_performance` | Compute status, gap, trend, recommendation; write ISM_KPI_Actuals |
| `generate_kpi_recommendation` | Recommendation matrix from performance data |

See `references/schemas-and-steps.md` for full I/O schemas, per-capability input/output, CRM persistence protocol, integration contract, and pre-execution validation checks.

---

## Rules

1. **This skill defines. Artifacts consume.** Targets are never hardcoded in artifacts.
2. **CRM is the persistent store.** All writes delegated to ism-learning-engine PERSIST mode.
3. **Idempotent actuals writes.** Search before create on `ISM_KPI_Actuals`.
4. **direction is required on every KPI.** No default assumed.
5. **benchmark_range.min must be < max.** Validate before write.

---

## Governance Contract

```yaml
skill_name: okr-kpi-governance
version: "1.1.2"
owner: Ismokraft
domain: governance
maturity_level: L2_operational
systems_accessed:
  - Zoho CRM custom modules (read — ISM_Objectives, ISM_KPIs, ISM_KPI_Actuals)
  - ism-learning-engine PERSIST mode (write delegation)
write_permissions: []
measurable_kpis:
  - KPI-SKILL-OKR-01: KPI Registry Coverage (target >80%)
  - KPI-SKILL-OKR-02: Actuals Update Frequency (target >60%)
  - KPI-SKILL-OKR-03: At-Risk KPI Response Rate (target >70%)
```

---

## Reference Files

| File | Read when |
|---|---|
| `references/okr-registry.md` | Every session — active OKRs and KPI definitions |
| `references/crm-persistence.md` | Any CRM read/write — module design + MCP patterns |
| `references/evaluation-engine.md` | Evaluation or recommendation work — full algorithm |
| `references/kpi-catalogue.md` | Registering new KPIs — approved formulas and benchmarks |
| `references/schemas-and-steps.md` | I/O schemas, capability details, PEV checks, integration contract |
| `references/learnings.md` | Session start — active OKR- learnings |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `zoho-solutions-architect` | Designs the 3 CRM custom modules |
| `ism-learning-engine` | Write gate — all CRM creates/updates via PERSIST mode |
| `margin-calculator` | Source of costing KPI formulas |
| `ads-ops` | Consumes ROAS/ACoS benchmarks; sends actuals for evaluation |
| `revenue-ops` | Sends revenue/units actuals for evaluation |
| `artifacts-builder-v2` | Builds dashboards consuming evaluation output |
| `ism-gap-auditor` | At-risk KPI signals trigger gap audit |
| `ism-scrum-master` | At-risk KPIs generate Jira tasks |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Every numeric field must have a cited source or be `null`
- Null fields must appear in `null_fields[]` or `data_gaps[]`
- Confidence must be declared: `HIGH | MEDIUM | LOW | UNKNOWN`
- No value may be estimated without `confidence: LOW` and source basis stated
- Do not proceed with guessed inputs — block and state the missing input
