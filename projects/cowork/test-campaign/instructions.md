# Test Campaign — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's PPC test campaign workflow. Manages Amazon listing parsing, keyword import, campaign scenario generation, test campaign setup, performance monitoring, daily ads analysis, and Gate 2 scale decision. Scoped to Domain 2.5.

## Parent Chat Project

ISM Market Testing (claude.ai) — owns the market-testing artifact and full D2.5 context.

## Plugins

Install these plugins in Claude Desktop:
- **product-testing** — AO (ads ops), PM (product monitor), FO (fulfillment ops), CO (compliance ops), SM (slack messaging)
- **product-discovery** — PD (product discover), KI (keyword intelligence)

## Active Skills

| Prefix | Skill | Modes Used |
|--------|-------|------------|
| PD | product-discover | LISTING_PARSE |
| KI | ikraft-keyword-intelligence | IMPORT |
| FO | fulfillment-ops | SAMPLE |
| AO | ads-ops | SCENARIO, TEST, LIVE |
| MC | margin-calculator | COMPARISON |
| PM | product-monitor | MONITOR |
| ZO | zoho-data-ops | WRITE |
| SM | slack-messaging | (auto) |

## Tasks

- `tasks/product-pipeline/test-campaign/` — Event-triggered after FBA + sample confirmation. Steps 0-12: listing parse, keyword import, scenario generation, campaign planning, monitoring, analysis, Gate 2 decision.
- `tasks/product-pipeline/daily-ads-analysis/` — Scheduled daily at 10:00 AM IST. Active campaign monitoring, CRM actuals update, anomaly detection, Slack digest.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH/MEDIUM/LOW.
4. Zoho CRM is the single source of truth.
5. All Slack messages route through slack-messaging skill.

## Context Files

Read from `context/product-pipeline/`:
- ppc-test-campaign-config.ctx.json — phase config, thresholds, scenario templates, Helium10 column mapping
- gate-criteria.ctx.json — Gate 2 thresholds
- financial-constants.ctx.json — margin formulas
- amazon-fee-table.ctx.md — fee structure
- amazon-ads-campaign-fields.ctx.json — Amazon Ads campaign field reference
- campaign-plans-module-design.ctx.json — Campaign_Plans CRM module design

## CRM Configuration

- Module: Product_Launches — product record, test metrics, Gate 2 decision
- Module: Campaign_Plans — structured campaign plans (lookup to Product_Launches)
- Write to: Campaign_Plans (plan creation, daily actuals), Product_Launches (test summary fields), ISM_ExecutionLogs, ISM_Learnings
- Dedup: check ISM_ExecutionLogs before running daily-ads-analysis

## Integrations

- Zoho CRM: read/write Product_Launches, Campaign_Plans
- Zoho Bigin: stages 4-6
- Helium10 / Jungle Scout: keyword CSV import
- Amazon Seller Central: listing URL, Search Term Report CSV
- Slack: #ism-launch-alerts, #ism-launch-reports
