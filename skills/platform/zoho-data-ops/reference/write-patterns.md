# Write Patterns -- zoho-data-ops

Standard patterns for record creation, update, dedup, and error handling across all Zoho apps via MCP.

---

## Dedup Before Create

Before creating any record, search for existing records with matching key fields.

**CRM Product_Launches:**
- Key fields: `Name` (Product Name) + `Target_Platform`
- Search: `zoho.crm.searchRecords("Product_Launches", "(Name:equals:{name})AND(Target_Platform:equals:{platform})")`
- If match found: switch to update, return existing record ID with warning "dedup: existing record found"

**Bigin Pipelines:**
- Key fields: `Deal_Name` + `Pipeline` layout
- Search via Bigin MCP search tool
- If match found: switch to update

**General dedup rule:** The caller (task) defines which fields constitute a "duplicate." This skill executes the check. If the caller does not specify dedup fields, use the module's Name field as default.

---

## Error Handling

### MCP Call Failure
```
1. Capture error message and error code from MCP response
2. If transient error (timeout, rate limit): retry once after 2 seconds
3. If persistent error (auth failure, invalid module, field not found): return immediately with error details
4. Never retry more than once -- return error to caller for decision
```

### Field Validation Failure
```
1. If required field is missing from input data: return error listing missing fields
2. If field type mismatch (e.g., string sent for integer field): attempt coercion, warn if coerced
3. If field API name not found in crm-field-mappings.json: halt, report "unknown field" error
```

### Partial Write Failure (batch operations)
```
1. If writing multiple records and some fail: continue with remaining records
2. Return status: "partial" with successful record IDs and failed record details
3. Caller decides whether to retry failed records
```

---

## Standard Write Sequences

### Create Product_Launches Record (from ProductCandidate[])

```
Input: ProductCandidate object from product-discover skill
Target: CRM > Product_Launches module

Field mapping:
  candidate.name         -> Name
  candidate.platform     -> Target_Platform
  candidate.category     -> Product_Category
  candidate.price        -> Target_Selling_Price
  candidate.source_url   -> Opportunity_Analysis_URL
  "Idea Intake"          -> Current_Stage

Post-create:
  Return record ID to caller for downstream score updates
```

### Update Scores on Product_Launches (from ScoredCandidate[])

```
Input: ScoredCandidate object from product-screen skill + record ID
Target: CRM > Product_Launches module

Field mapping:
  scored.opportunity_score  -> Opportunity_Score
  scored.competition_level  -> Competition_Level
  scored.search_trend       -> Search_Trend
  scored.financial_viability -> Financial_Viability

Pre-update:
  Verify record ID exists (READ mode). If not found, return error.
```

### Write Execution Log

```
Input: Execution log data from task
Target: CRM > ISM_ExecutionLogs module

Field mapping:
  log.skill_name        -> Skill_Name
  log.execution_date    -> Execution_Date
  log.status            -> Status
  log.input_fingerprint -> Input_Fingerprint
  log.output_summary    -> Output_Summary
  log.systems_modified  -> Systems_Modified
  log.slack_tag         -> Slack_Tag

No dedup: execution logs are always created, never updated.
```

### Write Learning Signal

```
Input: Learning signal data from task
Target: CRM > ISM_Learnings module

Field mapping:
  signal.skill_name   -> Skill_Name
  signal.target_type  -> Target_Type
  signal.target_name  -> Target_Name
  signal.description  -> Description
  signal.severity     -> Severity
  signal.status       -> Status ("new")
  signal.timestamp    -> Timestamp

No dedup: learning signals are always created fresh.
```

---

## Cross-App Sync Patterns

### Bigin Pipeline Stage -> CRM Current_Stage

```
Source: Bigin > Pipelines > stage field
Target: CRM > Product_Launches > Current_Stage

Trigger: When Bigin stage changes (event-driven, not scheduled)
Direction: Bigin -> CRM (one-way)
Field: Map Bigin stage API name to CRM Current_Stage picklist value
Linkage: Use CRM_Record_ID field on Bigin record to find CRM target
```

### CRM Vendor_Score -> Bigin Contact

```
Source: CRM > Vendors > Evaluation_Score, Vendor_Grade
Target: Bigin > Contacts > Vendor_Score, Vendor_Grade

Trigger: When CRM vendor evaluation is updated
Direction: CRM -> Bigin (one-way)
Linkage: Match by vendor name or cross-system ID
```

---

## MCP Tool Selection Guide

| App | Operation | MCP Tool Pattern |
|-----|-----------|-----------------|
| CRM | Create record | `createRecord` with module name and data |
| CRM | Update record | `updateRecord` with module name, record ID, and data |
| CRM | Search | `searchRecords` with module name and criteria |
| Bigin | Create/update | Bigin MCP operations (similar pattern) |
| Books | Read invoice | `get_invoice` with invoice ID |
| Inventory | Create item | `create_item` with item data |
| Inventory | Create PO | `create_purchase_order` with PO data |
| Desk | Create ticket | Desk MCP ticket operations |

Exact MCP tool names and endpoints are in `pipeline-config.json` under `mcp_endpoints`.
