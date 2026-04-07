# Zoho MCP Connection Strategy for Claude Code

## Problem
Claude Code's `.mcp.json` config defines MCP servers (zoho-crm, zoho-bigin), but they may not appear as native tools (`mcp__zoho-crm__*`) in the deferred tools list. This happens when the MCP server processes fail to start or connect at session init.

## Solution: Direct HTTP JSON-RPC
The MCP endpoints are standard HTTP servers. Call them directly via `curl` + JSON-RPC, bypassing the MCP client layer entirely.

### Connection Config (from `.mcp.json`)
```
zoho-crm:           https://temp-zohocrm-code-60067027941.zohomcp.in/mcp/<token>/message
zoho-bigin:         https://bigin-pipeline-product-launch-manager-60067027941.zohomcp.in/mcp/<token>/message
zoho-crm-workflow:  https://crm-workflow-mcp-60067027941.zohomcp.in/mcp/<token>/message
```
**Note:** The `temp-` prefix on zoho-crm URL suggests temporary/session-based URLs. Check Zoho Developer Console > MCP Connections if URLs expire.

### How to Call

**1. Discover tools:**
```bash
MCP_URL="<endpoint_url>"
curl -s -X POST "$MCP_URL" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

**2. Call a tool:**
```bash
curl -s -X POST "$MCP_URL" -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools/call",
    "params":{
      "name":"TOOL_NAME",
      "arguments":{...tool-specific args...}
    },
    "id":N
  }'
```

**3. Parse response:**
Response shape: `{ result: { content: [{ type: "text", text: "<json-string>" }] } }`
The `text` field is a JSON string that needs a second `json.loads()`.

### Parsing Pattern (Python)
```python
import json, sys
data = json.load(sys.stdin)
content = data.get('result', {}).get('content', [])
for c in content:
    if c.get('type') == 'text':
        parsed = json.loads(c['text'])
        # parsed is the actual Zoho API response
```

### Windows Considerations
- Use `$TEMP` not `/tmp` for temp files
- Python is `python` not `python3` (Anaconda)
- Bash tool uses Unix syntax but runs on Windows Git Bash

## Available Zoho CRM MCP Tools (29 as of 2026-04-06)
## + Workflow (13 tools) + Bigin (19 tools)
**Read:** getModules, getFields, getFieldsWithID, getLayouts, getLayoutById, getLayoutRules, getLayoutRulesById, getRelatedLists, getRelatedRecords, getRelatedRecord, getRecord, getPipeline, getPipelines, getPickListValues, getPickListValuesAssociations, getCustomViews, getCustomViewById, getNotes, getNotesModule, getNoteById, getDuplicateCheckPreference
**Write:** createFields (max 5/call), createRecords, createModules, createDuplicateCheckPreference
**Update:** updateRecord, updateRecords, updateModules
**Query:** executeCOQLQuery (requires WHERE clause)

## API Gotchas
- `executeCOQLQuery` requires a WHERE clause — `SELECT ... FROM Module LIMIT 10` fails
- `createFields` max 5 fields per call — batch accordingly
- `createRecords` and `updateRecord` use `path_variables.module` (not query_params)
- `getRecord` and `updateRecord` use `path_variables.recordID` (not `id`)
- `textarea` data_type requires `"textarea":{"type":"large|medium|small"}` config in createFields
- No `updateFields` tool — can't modify existing picklist values via MCP. Zoho CRM accepts non-listed picklist values via API (stored on record, but not shown in UI dropdown). Add values manually in Zoho UI.
- `getPickListValues` needs `path_variables.fieldId` (numeric string), not field API name
- `getRelatedRecords` needs `path_variables.parentRecordModule`, `parentRecord`, `relatedList` + `query_params.fields` (mandatory)
- Related list API name ≠ module API name. Use `getRelatedLists` to discover. E.g. Amazon_Ad_Campaigns appears as `Ad_Campaigns` related list on Campaigns.
- Large responses may truncate — save to `$TEMP` file and parse from disk

## Workflow MCP Tools (13 — zoho-crm-workflow endpoint)
**Read:** getWorkflowRules, getWorkflowRuleById, getWorkflowRulesCount, getWorkflowRulesActionsCount, getWorkflowRuleUsage, getWorkflowConfigurations, getWorkflowTasks
**Write:** postWorkflowRule, createWorkflowTasks
**Update:** updateWorkflowRule, updateWorkflowRuleById, updateWorkflowTaskById, reorderWorkflowRules

### Workflow Gotchas
- `postWorkflowRule` requires `execute_when.details.repeat` field (even if false)
- `slack_notifications` is inline (non-associate) but needs Slack channel ID from integration config — easier to create in Zoho UI
- `field_updates`, `webhooks`, `functions` are associate actions — need pre-creation via separate API, then referenced by ID
- Deluge custom functions can only be created in Zoho CRM Developer Space (UI), not via MCP

## Bigin MCP Tools (19 — zoho-bigin endpoint)
**Read:** getModules, getModulesMetadata, getFieldsMetadata, getLayoutsMetadata, getRecords, getSpecificRecord, getRelatedListRecords, getRecordsFromSpecificTeamPipeline, getNotesFromSpecificRecord, recordsCount, getRecordCountForSpecificTag, searchRecords, getRecordsUsingCoqlQuery
**Write:** addRecords, upsertRecords, addNotes, addNotesToSpecificRecord, addTagsToSpecificRecord
**Update:** updateSpecificRecord

### Bigin Gotchas
- `searchRecords` needs `path_variables.module_api_name` (not query_params)
- `updateSpecificRecord` path variable is `id` (not `record_id`)
- Bigin record lookup by CRM_Record_ID: `criteria="(CRM_Record_ID:equals:{crm_product_launch_id})"`
- Bigin Pipelines module ID: 677677000000000043

## Module IDs (confirmed 2026-04-06)
| Module | ID |
|--------|-----|
| Campaigns | 645926000000000055 |
| Product_Launches | 645926000008511067 |
| ISM_ExecutionLogs | 645926000009175428 |
| ISM_Learnings | 645926000009174002 |
| ISM_SkillFeedback | 645926000009176002 |
| ISM_SkillHealth | 645926000009179002 |

## Amazon_Ad_Campaigns Module (created 2026-04-06, DL-017 Step 3)
- **Module ID:** 645926000009971002
- **Profile IDs:** Administrator=645926000000031157, Standard=645926000000031160
- **43 custom fields** created (see full list via `getFields` on module)
- **Key field IDs:**
  - Campaign_Strategy (lookup→Campaigns): 645926000009973001
  - Product_Launch (lookup→Product_Launches): 645926000009973026
  - Status (picklist): 645926000009973079
  - Campaign_Type (picklist): 645926000009973052
- **Notes field renamed** to Campaign_Notes (Notes is a Zoho reserved keyword)
- **textarea type** only supports: small, large, rich_text (not medium)

## Campaigns Module Custom Fields (created 2026-04-06, DL-017 Step 2)
| API Name | Type | Field ID |
|----------|------|----------|
| Product_Launch | lookup (→Product_Launches) | 645926000009961001 |
| Scenario_Type | picklist | 645926000009961027 |
| Test_Phase | picklist | 645926000009961060 |
| Total_Budget_INR | currency | 645926000009961086 |
| Agg_Impressions | bigint | 645926000009962001 |
| Agg_Clicks | bigint | 645926000009962018 |
| Agg_Orders | bigint | 645926000009962035 |
| Agg_Spend_INR | currency | 645926000009962052 |
| Agg_Revenue_INR | currency | 645926000009962069 |
| Agg_ACoS_Pct | percent | 645926000009965001 |
| Agg_CVR_Pct | percent | 645926000009965018 |
| Agg_CTR_Pct | percent | 645926000009965035 |
| Gate_2_Verdict | picklist | 645926000009965053 |
| Gate_2_Date | date | 645926000009965082 |
| Gate_2_Rationale | textarea | 645926000009960002 |
| Risk_Level | picklist | 645926000009966002 |
| Data_Quality | picklist | 645926000009966029 |