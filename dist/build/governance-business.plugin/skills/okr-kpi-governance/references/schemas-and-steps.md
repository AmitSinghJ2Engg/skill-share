# OKR/KPI Governance — Schemas, Steps, and Integration

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "register_objective",
        "register_kpi",
        "update_kpi_target",
        "evaluate_kpi_performance",
        "load_kpi_registry",
        "generate_kpi_recommendation"
      ]
    },
    "payload": {
      "type": "object",
      "description": "Action-specific inputs. See per-capability schemas below."
    }
  },
  "required": ["action"]
}
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "action": { "type": "string" },
    "result": { "type": "object", "description": "Action-specific output per capability schemas below." },
    "crm_record_id": { "type": "string", "description": "CRM record ID if write performed. Null for reads." },
    "crm_write_status": { "type": "string", "enum": ["created", "updated", "skipped", "not_applicable"] },
    "execution_trace": {
      "skill": "okr-kpi-governance",
      "version": "1.1.2",
      "fingerprint": "okr-kpi-governance:{action}:{kpi_id}:{YYYY-MM-DD}",
      "steps_executed": ["pev_checks", "capability_dispatch", "gateway_delegate", "output"],
      "systems_read": ["ism-learning-engine"],
      "systems_written": ["ism-learning-engine PERSIST mode"],
      "decision_summary": "Action: {action}. KPI: {kpi_id}. CRM: {crm_write_status}.",
      "status": "success"
    }
  },
  "required": ["action", "result", "execution_trace"]
}
```

---

## CRM Persistence

### Three CRM Modules

| Module API Name | Purpose | Parent of |
|---|---|---|
| `ISM_Objectives` | One record per Objective | `ISM_KPIs` |
| `ISM_KPIs` | One record per KPI definition | `ISM_KPI_Actuals` |
| `ISM_KPI_Actuals` | One record per period evaluation result | — |

Full schema and MCP call patterns in `crm-persistence.md`.

### Persistence Protocol (via ism-learning-engine PERSIST mode)
1. Validate inputs and compute values locally
2. Pass structured record payload to `ism-learning-engine` PERSIST mode
3. Receive `crm_record_id` from gateway response
4. Do NOT call `ZohoCRM_Create_Records` or `ZohoCRM_Update_Record` directly

### Read Protocol
1. Check session memory for already-fetched records
2. If not in session: `ZohoCRM_Get_Records(module=ISM_KPIs, filter=Status=active)`
3. Cache in session memory for session duration

---

## Per-Capability Schemas

### 1 — register_objective

**Input:**
```json
{
  "objective_name": "string — unique, required",
  "owner": "string — person or team, required",
  "quarter": "string — Q[1-4]-YYYY format, required",
  "description": "string — what success looks like, required"
}
```

**Steps:** Assign OBJ-NNN → validate (quarter format, uniqueness, known owner) → PERSIST mode → receive crm_record_id.

**Output:**
```json
{
  "objective_id": "OBJ-NNN",
  "objective_name": "string",
  "owner": "string",
  "quarter": "string",
  "status": "active",
  "crm_record_id": "string",
  "created_at": "YYYY-MM-DD"
}
```

### 2 — register_kpi

**Input:**
```json
{
  "kpi_name": "string — snake_case, unique",
  "display_name": "string",
  "linked_objective": "OBJ-NNN",
  "metric_source": "Zoho Analytics | Bigin | Zoho CRM | Amazon Seller Central | Shopify | Meta Ads Manager | Manual",
  "formula": "string",
  "unit": "% | INR | count | ratio",
  "target_value": "number",
  "benchmark_range": { "min": "number", "max": "number" },
  "forecast_value": "number | null",
  "reporting_frequency": "daily | weekly | monthly | quarterly",
  "direction": "higher_is_better | lower_is_better"
}
```

**Validation:** linked_objective must exist with crm_record_id. min < max. target within/above benchmark. direction required.

**Steps:** Assign KPI-NNN → validate → PERSIST mode → append to parent Objective's kpis array.

**Output:**
```json
{
  "kpi_id": "KPI-NNN",
  "kpi_name": "string",
  "display_name": "string",
  "linked_objective": "OBJ-NNN",
  "status": "active",
  "crm_record_id": "string",
  "created_at": "YYYY-MM-DD"
}
```

### 3 — update_kpi_target

**Input:**
```json
{
  "kpi_id": "KPI-NNN",
  "new_target_value": "number",
  "new_benchmark_range": { "min": "number", "max": "number" },
  "reason": "string",
  "effective_from": "YYYY-MM-DD"
}
```

PERSIST mode updates CRM. Appends previous target to Target_History_JSON. Idempotent — no write if values unchanged.

**Output:**
```json
{
  "kpi_id": "string",
  "previous_target_value": "number",
  "new_target_value": "number",
  "effective_from": "string",
  "crm_record_id": "string",
  "updated": "boolean"
}
```

### 4 — update_forecast

**Input:**
```json
{
  "kpi_id": "KPI-NNN",
  "forecast_value": "number",
  "forecast_basis": "string",
  "forecast_period": "YYYY-MM or YYYY-QN"
}
```

Updates Forecast_Value and Forecast_Basis on ISM_KPIs CRM record.

### 5 — evaluate_kpi_performance

**Input:**
```json
{
  "kpi_id": "KPI-NNN",
  "actual_value": "number",
  "period": "YYYY-MM or YYYY-QN",
  "prior_period_actual": "number | null"
}
```

**Steps:** Load KPI definition → run evaluation algorithm (see evaluation-engine.md §1) → upsert ISM_KPI_Actuals (search before write).

**Output:**
```json
{
  "kpi_id": "string",
  "kpi_name": "string",
  "period": "string",
  "actual_value": "number",
  "target_value": "number",
  "performance_status": "below_target | on_track | above_target",
  "gap_value": "number",
  "gap_pct": "number",
  "within_benchmark": "boolean",
  "trend_direction": "improving | declining | stable | insufficient_data",
  "recommendation": "string",
  "recommendation_actions": ["string"],
  "recommendation_priority": "high | medium | low",
  "crm_actuals_record_id": "string"
}
```

### 6 — generate_kpi_recommendation

**Input:** kpi_id + performance_status + trend_direction + gap_pct

Full recommendation matrix in `evaluation-engine.md` §3.

**Output:**
```json
{
  "recommendation": "string",
  "recommendation_actions": ["string"],
  "priority": "high | medium | low"
}
```

---

## Pre-Execution Validation

| Check | Severity | Block condition | Response |
|---|---|---|---|
| PEV-01 — action present | HIGH | Missing → block | "Specify action: register_objective / register_kpi / ..." |
| PEV-02 — payload complete | HIGH | Required fields absent → block | "Missing required fields: [list]" |
| PEV-03 — OBJ-NNN valid | HIGH | linked_objective not found → block | "Objective [OBJ-NNN] not found. Register first." |
| PEV-04 — Duplicate KPI | MEDIUM | kpi_name exists for same obj → warn | "KPI exists. Confirm duplicate or update existing." |
| PEV-05 — LE available | HIGH | PERSIST mode unreachable → block | "Cannot persist — retry when accessible." |

---

## Integration Contract for Analytics Artifacts

1. Artifact calls Claude API with Zoho CRM MCP server included
2. Claude fetches KPI definition from ISM_KPIs
3. Claude calls evaluate_kpi_performance(kpi_id, actual_value, period)
4. Artifact receives EvaluationResult
5. Use performance_status for colour coding
6. Use recommendation_actions for insight panel
7. Never hardcode targets inside the artifact

### Dashboard Colour Convention

| Status | Colour | Badge |
|---|---|---|
| `above_target` | Green `#22c55e` | Above Target |
| `on_track` | Amber `#f59e0b` | On Track |
| `below_target` | Red `#ef4444` | Below Target |

---

## Execution Trace

Append the `execution_trace` block from the output schema at the end of every response. Always populated regardless of action type.
