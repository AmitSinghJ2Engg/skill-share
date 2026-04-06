# Daily Ads Analysis — References

## Context Files
- `context/product-pipeline/ppc-test-campaign-config.ctx.json` — PPC thresholds, data quality criteria, scenario templates
- `context/product-pipeline/crm-field-mappings.ctx.json` — CRM field API names (Campaign_Plans + Product_Launches)
- `context/product-pipeline/amazon-ads-campaign-fields.ctx.json` — Amazon Ads field reference
- `context/product-pipeline/campaign-plans-module-design.ctx.json` — Campaign_Plans module design spec

## Plugins Required
- `product-testing` — AO (ads ops), PM (product monitor), SM (slack messaging)
- Zoho Data Ops (ZO) — CRM read/write via MCP

## CRM Modules
- `Campaign_Plans` — campaign plan actuals (daily updates)
- `Product_Launches` — product test metrics (cumulative)
- `ISM_ExecutionLogs` — telemetry
- `ISM_Learnings` — anomaly signals

## Slack Channels
- `#ism-launch-alerts` — daily digest, anomaly flags
