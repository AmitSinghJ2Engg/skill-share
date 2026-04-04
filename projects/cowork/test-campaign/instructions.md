# Test Campaign — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's PPC test campaign workflow. Manages test listing setup, ad campaign configuration, performance monitoring, and Gate 2 analysis. Scoped to Domain 2.5.

## Parent Chat Project

ISM Market Testing (claude.ai) — owns the market-testing artifact and full D2.5 context.

## Plugins

Install these plugins in Claude Desktop:
- **product-testing** — AO (ads ops), MO (product monitor), FO (fulfillment ops), SM (slack messaging)

## Active Skills

| Prefix | Skill | Modes Used |
|--------|-------|------------|
| FO | fulfillment-ops | SAMPLE |
| AO | ads-ops | TEST |
| MC | margin-calculator | COMPARISON |
| MO | product-monitor | MONITOR |
| ZO | zoho-data-ops | WRITE |
| SM | slack-messaging | (auto) |

## Tasks

- `tasks/product-pipeline/test-campaign/` — Event-triggered after FBA + sample confirmation

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH/MEDIUM/LOW.
4. Zoho CRM is the single source of truth.
5. All Slack messages route through slack-messaging skill.

## Context Files

Read from `context/product-pipeline/`:
- ppc-test-campaign-config.ctx.json — phase config, thresholds
- gate-criteria.ctx.json — Gate 2 thresholds
- financial-constants.ctx.json — margin formulas
- amazon-fee-table.ctx.md — fee structure

## CRM Configuration

- Module: Product_Launches
- Write to: test results, campaign metrics, Gate 2 decision
- Dedup: check ISM_ExecutionLogs before running

## Integrations

- Zoho CRM: read/write Product_Launches
- Zoho Bigin: stages 4-6
- Slack: #ism-launch-alerts, #ism-launch-reports
