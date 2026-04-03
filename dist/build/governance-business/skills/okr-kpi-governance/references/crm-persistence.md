# CRM Persistence
# okr-kpi-governance — references/crm-persistence.md
# Read when: any CRM read or write operation for OKR/KPI data

---

## S1 — Module Design

Three custom modules in Zoho CRM. Created once by `zoho-solutions-architect`.

### Module 1: ISM_Objectives

| Field label | API name | Type | Required |
|---|---|---|---|
| Name | Name | Text(255) | Y |
| Objective ID | Objective_ID | Text(20) | Y |
| Owner | Owner_Name | Text(100) | Y |
| Quarter | Quarter | Picklist | Y |
| Description | Description | Textarea | Y |
| Status | Status | Picklist (active, completed, paused) | Y |
| KPI Count | KPI_Count | Integer | N |

Parent of: `ISM_KPIs` (via `Linked_Objective` lookup)

### Module 2: ISM_KPIs

| Field label | API name | Type | Required |
|---|---|---|---|
| Name | Name | Text(255) | Y |
| KPI ID | KPI_ID | Text(20) | Y |
| KPI Name | KPI_Name | Text(100) | Y |
| Linked Objective | Linked_Objective | Lookup -> ISM_Objectives | Y |
| Metric Source | Metric_Source | Picklist | Y |
| Formula | Formula | Textarea | Y |
| Unit | Unit | Picklist (%, INR, count, ratio) | Y |
| Direction | Direction | Picklist (higher_is_better, lower_is_better) | Y |
| Target Value | Target_Value | Decimal(10,2) | Y |
| Benchmark Min | Benchmark_Min | Decimal(10,2) | Y |
| Benchmark Max | Benchmark_Max | Decimal(10,2) | Y |
| Forecast Value | Forecast_Value | Decimal(10,2) | N |
| Forecast Basis | Forecast_Basis | Textarea | N |
| Reporting Frequency | Reporting_Frequency | Picklist (daily, weekly, monthly, quarterly) | Y |
| Status | Status | Picklist (active, deprecated, under-review) | Y |
| Target History JSON | Target_History_JSON | Textarea | N |

Parent of: `ISM_KPI_Actuals`

### Module 3: ISM_KPI_Actuals

| Field label | API name | Type | Required |
|---|---|---|---|
| Name | Name | Text(255) | Y |
| Linked KPI | Linked_KPI | Lookup -> ISM_KPIs | Y |
| Period | Period | Text(20) | Y |
| Actual Value | Actual_Value | Decimal(10,2) | Y |
| Target Value (snapshot) | Target_Value_Snapshot | Decimal(10,2) | Y |
| Performance Status | Performance_Status | Picklist (below_target, on_track, above_target) | Y |
| Gap Value | Gap_Value | Decimal(10,2) | Y |
| Gap Pct | Gap_Pct | Decimal(10,2) | Y |
| Trend Direction | Trend_Direction | Picklist | N |
| Trend Magnitude | Trend_Magnitude | Decimal(10,2) | N |
| Recommendation | Recommendation | Textarea | N |
| Recommendation Priority | Recommendation_Priority | Picklist (high, medium, low) | N |
| Evaluation Date | Evaluation_Date | Date | Y |

---

## S2 — Sync Protocol

### Write (skill -> CRM)

| Capability | MCP call | Notes |
|---|---|---|
| register_objective | `ZohoCRM_Create_Records(module=ISM_Objectives, data={...})` | Store returned `id` as `crm_record_id` |
| register_kpi | `ZohoCRM_Create_Records(module=ISM_KPIs, data={...})` | Store returned `id` |
| update_kpi_target | `ZohoCRM_Update_Record(module=ISM_KPIs, id=crm_record_id, data={...})` | Append previous target to Target_History_JSON |
| evaluate_kpi_performance | `ZohoCRM_Create_Records(module=ISM_KPI_Actuals, data={...})` | Search before create (idempotent) |

### Read (CRM -> skill, session start)

```
ZohoCRM_Get_Records(module=ISM_KPIs, criteria="Status = 'active'")
-> cache in session memory for evaluation calls
```

---

## S3 — MCP Call Patterns

### Fetch active KPIs
```json
{ "tool": "ZohoCRM_Get_Records", "module": "ISM_KPIs", "criteria": "(Status:equals:active)" }
```

### Fetch actuals for a period
```json
{ "tool": "ZohoCRM_Search_Records", "module": "ISM_KPI_Actuals", "criteria": "(Period:equals:2026-03)" }
```

### Write evaluation result
```json
{ "tool": "ZohoCRM_Create_Records", "module": "ISM_KPI_Actuals",
  "data": { "Name": "{kpi_name} -- {period}", "Linked_KPI": "{crm_record_id}",
    "Period": "{period}", "Actual_Value": 0, "Target_Value_Snapshot": 0,
    "Performance_Status": "{status}", "Gap_Value": 0, "Gap_Pct": 0,
    "Evaluation_Date": "{date}" } }
```

---

## S4 — Error Handling

| Error | Resolution |
|---|---|
| Module not found | Run one-time setup via `zoho-solutions-architect` first |
| Lookup field fails | Register parent record first |
| Duplicate record | Search first, then update instead of create |
| Auth error | `suggest_connectors` with CRM MCP UUID |

All write failures reported to `#ismo-gen-alerts`.
