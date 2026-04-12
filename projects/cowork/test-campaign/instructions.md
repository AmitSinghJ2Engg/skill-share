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
- **workflow-ops** — all 6 workflow skills (test-launch-prep, campaign-plan, campaign-analysis, scale-decision, daily-ads-analysis, daily-discovery)

## Workflow Skills (invoke via /name)

| Action | Skill | Type |
|---|---|---|
| Prepare Test Launch | `/test-launch-prep` | interactive |
| Plan Campaign | `/campaign-plan` | interactive |
| Analyze Campaign Results | `/campaign-analysis` | interactive |
| Make Scale Decision | `/scale-decision` | interactive |
| Daily Ads Monitoring | `/daily-ads-analysis` | scheduled |

Full workflow steps are in each skill's SKILL.md at `skills/workflow/{name}/`.

## Context Files

Read from `context/product-pipeline/`:
- `ppc-test-campaign-config.ctx.json` — phase config, thresholds, scenario templates
- `gate-criteria.ctx.json` — Gate 2 thresholds
- `financial-constants.ctx.json` — margin formulas
- `amazon-fee-table.ctx.md` — fee structure
- `amazon-ads-campaign-fields.ctx.json` — Amazon Ads field reference
- `crm-field-mappings.ctx.json` — CRM field API names
- `pipeline-config.ctx.json` — Slack channel routing

## MCP Connections

- Zoho CRM, Zoho Bigin, Zoho Inventory, Zoho Books
- Slack (via slack-messaging skill)

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Zoho CRM is the single source of truth.
4. All CRM writes go through `zoho-data-ops` skill.
5. All Slack messages route through `slack-messaging` skill.
