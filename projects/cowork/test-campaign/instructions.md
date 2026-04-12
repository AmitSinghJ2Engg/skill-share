# Test Campaign — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's PPC test campaign workflow (Domain 2.5). Use this cowork project in Claude Desktop for ad-hoc sessions or scheduled runs. For the artifact-driven workflow, use the Chat project (ISM Market Testing on claude.ai).

## Parent Chat Project

ISM Market Testing (claude.ai) — owns the market-testing artifact and full D2.5 context.

## Plugins to Install

- **product-testing** — FO (fulfillment ops), PM (product monitor), SM (slack messaging)
- **ads-planning** — AO (ads-ops-plan: SCENARIO, TEST, ANOMALY)
- **product-discovery** — PD (product discover), KI (keyword intelligence)
- **product-evaluation** — product-evaluate, product-market-intelligence
- **margin-calculation** — MC (margin calculator)
- **compliance-management** — CO (compliance ops)
- **platform-io** — ZO (zoho data ops)
- **workflow-ops** — all 6 workflow skills

## Workflow Skills (invoke via /name)

| Action | Skill | Type | Schedule |
|---|---|---|---|
| Prepare Test Launch | `/test-launch-prep` | interactive | — |
| Plan Campaign | `/campaign-plan` | interactive | — |
| Analyze Campaign Results | `/campaign-analysis` | interactive | — |
| Make Scale Decision | `/scale-decision` | interactive | — |
| Daily Ads Monitoring | `/daily-ads-analysis` | scheduled | Daily, 10:00 AM IST |

Full workflow steps are in each skill's SKILL.md at `skills/workflow/{name}/`.

## Schedule Registration

Scheduled workflows need to be registered at the execution layer (the SKILL.md `metadata.schedule` field is documentation only):

**Windows Task Scheduler (via DL-020 helper):**
```powershell
.\tools\register-scheduled-task.ps1 -TaskName "daily-ads-analysis" -Schedule "Daily 10:00"
```

**Claude Code `/loop` (session-scoped, temporary):**
```
/loop 24h /daily-ads-analysis
```

**Claude Desktop scheduled tasks:**
Configure in Desktop settings → Scheduled Tasks.

**Claude Cloud scheduled tasks:**
Register via `/schedule` command in Claude Code.

## Context Files

Read from `context/product-pipeline/`:
- `ppc-test-campaign-config.ctx.json` — phase config, thresholds, scenario templates, Helium10 column mapping
- `gate-criteria.ctx.json` — Gate 2 thresholds
- `financial-constants.ctx.json` — margin formulas
- `amazon-fee-table.ctx.md` — fee structure
- `amazon-ads-campaign-fields.ctx.json` — Amazon Ads campaign field reference
- `crm-field-mappings.ctx.json` — CRM field API names
- `pipeline-config.ctx.json` — Slack channel routing

## MCP Connections

Configure in `.mcp.json` (gitignored, per-user credentials):
- zoho-crm — read/write CRM modules
- zoho-bigin — read Product Launch Factory pipeline
- zoho-inventory — read Package records (FBA dispatch verification)
- zoho-books — read financial reference
- Slack — via slack-messaging skill (channel IDs in pipeline-config.ctx.json)

## CRM Configuration

Two-module campaign system (DL-017):
- **Product_Launches** (ID: 645926000008511067) — product record, test metrics, Gate 2 decision
- **Campaigns** (built-in, ID: 645926000000000055) — strategy/round level, aggregate metrics, Gate 2 verdict. Lookup to Product_Launches.
- **Amazon_Ad_Campaigns** (custom) — individual campaign level, 1:1 with Seller Central campaign, cumulative actuals. Lookups to Campaigns + Product_Launches.
- **ISM_ExecutionLogs** — daily snapshots (Output_Summary JSON) for trend analysis
- **ISM_Learnings** — learning signals for ism-learning-engine
- Field mappings: see `crm-field-mappings.ctx.json`
- Campaign config: see `ppc-test-campaign-config.ctx.json`
- Amazon Ads fields: see `amazon-ads-campaign-fields.ctx.json`
- Module design: see `docs/campaign-plans-module-design.json`
- Bigin: one-way sync from CRM (5 read-only fields: strategy name, status, ACoS, spend, Gate 2 verdict)
- Dedup: check ISM_ExecutionLogs before running daily-ads-analysis

## Integrations

- Zoho CRM: read/write Product_Launches, Campaigns, Amazon_Ad_Campaigns, ISM_ExecutionLogs, ISM_Learnings
- Zoho Bigin: stages 4-6 (one-way sync from CRM)
- Zoho Inventory: Package records (FBA dispatch)
- Zoho Books: financial reference
- Helium10 / Jungle Scout: keyword CSV import (manual upload)
- Amazon Seller Central: listing URL, Search Term Report CSV (manual export)
- Slack (task-level posts): #ism-launch-alerts (C0AKNEW3V6H), #ism-launch-reports — routed through slack-messaging skill
- Slack (CRM workflow alerts): #marketing-ops-alerts (C081MG4HXK6) — Zoho-native instant actions (4.1 strategy activated, 4.3 ACoS alert, 4.4 auto-complete, 4.5 rollup)

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH/MEDIUM/LOW.
4. Zoho CRM is the single source of truth.
5. All CRM writes go through `zoho-data-ops` skill.
6. All Slack messages route through `slack-messaging` skill.
