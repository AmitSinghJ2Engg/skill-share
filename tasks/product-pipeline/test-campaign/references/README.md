# Test Campaign — References

## Context Files
- `context/product-pipeline/ppc-test-campaign-config.ctx.json` — PPC campaign config (budget, bids, durations)
- `context/product-pipeline/gate-criteria.ctx.json` — Gate 2 pass thresholds
- `context/product-pipeline/financial-constants.ctx.json` — financial thresholds
- `context/product-pipeline/amazon-fee-table.ctx.md` — Amazon India 2026 fee tables

## Plugins Required
- `product-testing` — FO, AO, PM, CO, SM skills
- `product-evaluation` — MC (margin-calculator)
- Zoho Data Ops (ZO) — CRM read/write via MCP

## CRM Modules
- `Product_Launches` — product record (SampleConfirmation, MarginRecord, CostEstimate, etc.)
- `ISM_ExecutionLogs` — telemetry
- `ISM_Learnings` — Gate 2 decision signals

## Slack Channels
- `#ism-launch-alerts` — gate decisions, kill/park alerts, errors
