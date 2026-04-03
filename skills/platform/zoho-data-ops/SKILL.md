---
name: zoho-data-ops
description: >
  ALWAYS trigger when a skill or task needs to read, write, search, create, update, or sync
  records in any Zoho app via MCP. This is the runtime data I/O layer for all Zoho apps:
  CRM, Bigin, Books, Inventory, Desk, Analytics. Business skills produce structured data;
  this skill persists it. Also trigger for: "write to CRM", "create record",
  "update Bigin stage", "search module", "sync Bigin to CRM", "dedup check".
  If a task or skill needs Zoho MCP I/O, trigger immediately. Prefix: ZO-
disable-model-invocation: true
version: "1.0.0"
lifecycle: prototype
---

# Zoho Data Ops

Runtime Zoho data I/O layer for Ismokraft. Handles all MCP-based read, write, search, and sync operations across every connected Zoho app (CRM, Bigin, Books, Inventory, Desk, Analytics).

**This skill executes data operations.** It does NOT design systems (`zoho-solutions-architect`) or write Deluge/Flow code (`zoho-developer`).

## Modes

| Mode | Input | Output | When to use |
|------|-------|--------|-------------|
| WRITE | Structured data + target app/module | Record IDs, success/failure | Persisting skill output to any Zoho app |
| READ | Target app/module + query criteria | Record data or list | Fetching data from any Zoho app |
| SYNC | Source + target app/module + field mapping | Sync result, records updated | Cross-app field synchronization |

Supported apps: CRM (read/write), Bigin (read/write), Books (read-only), Inventory (read/write), Desk (read/write), Analytics (read-only). For MCP endpoints, see `pipeline-config.ctx.json`.

## Execution Steps

### WRITE Mode

1. Identify target app, module, and operation (create or update).
2. Resolve field API names from `crm-field-mappings.ctx.json`. Never guess.
3. Validate: all required fields present. Halt if missing.
4. Dedup: search for existing records with matching key fields. If found, switch to update.
5. Execute MCP call. Retry once on transient failure.
6. Return record IDs, operation performed, any warnings.

### READ Mode

1. Identify target app, module, query criteria.
2. Build query using field API names from `crm-field-mappings.ctx.json`.
3. Execute MCP call. Return structured data or empty result.

### SYNC Mode

1. Identify source and target app/module.
2. Map fields per project context. Only sync fields passing the Sync Field Test.
3. Read source via READ mode, write to target via WRITE mode.
4. Return count synced, any failures with record IDs.

See `references/write-patterns.md` for standard field mappings, dedup rules, and error handling recipes.

## Input Contract

| Field | Required | Description |
|-------|----------|-------------|
| target_app | Yes | crm, bigin, books, inventory, desk, analytics |
| target_module | Yes | Module API name (e.g., Product_Launches, Pipelines) |
| operation | Yes | create, update, search, get, sync |
| data | Write only | Structured data using field API names |
| query | Read only | Search criteria or record ID |

## Output Contract

Returns: `status` (success/partial/failed), `record_ids[]`, `operation`, `errors[]`, `warnings[]`.

## Rules

- Never guess field API names. Always read from `crm-field-mappings.ctx.json` or `pipeline-config.ctx.json`.
- Never write to Analytics or Books (read-only via MCP).
- Every write is idempotent. Dedup check before create.
- If MCP unavailable, return structured error. Do not retry indefinitely.

## Related Skills

| Skill | Relationship |
|-------|-------------|
| `zoho-solutions-architect` | Upstream -- designs data flows this skill executes |
| `zoho-developer` | Peer -- builds Deluge code; this skill handles MCP I/O |
| `product-discover` | Upstream -- produces ProductCandidate[] for CRM writes |
| `product-screen` | Upstream -- produces ScoredCandidate[] for CRM updates |

## Reference Files

| File | Read when |
|------|-----------|
| `references/write-patterns.md` | Standard dedup, error handling, field mappings, sync patterns |

## Trigger Phrases

write to CRM, create record, update record, search module, read from Bigin, sync fields,
persist data, Bigin update, Inventory create, dedup check, ISM_ExecutionLogs write
