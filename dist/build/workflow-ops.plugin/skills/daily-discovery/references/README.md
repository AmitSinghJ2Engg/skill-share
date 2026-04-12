# Daily Discovery — References

## Context Files
- `context/product-pipeline/zone-rotation.ctx.json` — zone rotation formula and schedule
- `context/product-pipeline/crm-field-mappings.ctx.json` — CRM field API names
- `context/product-pipeline/financial-constants.ctx.json` — scoring thresholds

## Plugins Required
- `product-discovery` — KI, PD, PS skills
- `product-ops` — SM (slack-messaging)
- Zoho Data Ops (ZO) — CRM read/write via MCP

## CRM Modules
- `Product_Launches` — candidate records (created/updated)
- `ISM_ExecutionLogs` — telemetry (dedup check + write)
- `ISM_Learnings` — learning signals (keyword performance)

## Slack Channels
- `#ism-launch-reports` — daily summary
- `#ism-launch-alerts` — errors and low-yield warnings
