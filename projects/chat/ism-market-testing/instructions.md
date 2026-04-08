# ISM Market Testing — Project Instructions

## What This Project Is

Ismokraft's market testing and scale decision hub. Covers Domain 2.5: test listing creation, PPC campaign setup and monitoring, performance analysis, and Gate 2 scale-or-kill decisions. Activates after test sourcing confirms viable vendors.

## Domain Scope

- **D2.5 — Market Testing:** Test listing, paid testing (PPC), performance monitoring, scale decision

## Artifact Purpose

**market-testing-v1.0.artifact.tsx** — Unified testing interface with 5 views: Product Intake (listing parse + keyword import), Campaign Planner (scenario generation + comparison), Performance Monitor (daily metrics + trends + anomalies), Keyword Analyzer (4-bucket classification + bid recommendations), Scale Decision (Gate 2 analysis + cost comparison).

## Skills Referenced

| Prefix | Skill | Modes Used | Purpose |
|--------|-------|------------|---------|
| PD | product-discover | LISTING_PARSE | Extract product data from Amazon listing URL |
| KI | ikraft-keyword-intelligence | IMPORT | Normalize Helium10/Jungle Scout keyword CSV |
| AO | ads-ops | SCENARIO, TEST, LIVE | Campaign planning, test analysis, optimization |
| MC | margin-calculator | COMPARISON | Pre-test vs actual vs test economics |
| FO | fulfillment-ops | SAMPLE | FBA dispatch verification |
| PM | product-monitor | MONITOR | BSR, reviews, listing health during test |
| ZO | zoho-data-ops | WRITE | CRM read/write for Campaigns, Amazon_Ad_Campaigns, Product_Launches |
| SM | slack-messaging | (auto) | Formatted Slack messages |

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth.
5. All test results go to Zoho CRM. No local score storage.
6. Slack (task-level): alerts to #ism-launch-alerts, reports to #ism-launch-reports. Route through slack-messaging skill.
7. Slack (CRM workflow): Zoho workflow rules send automated alerts to #marketing-ops-alerts (C081MG4HXK6) — strategy activation, ACoS warnings, auto-complete, rollup notifications.
7. Confluence: test results linked from CRM records.

## Key Constants

Read from project context files:
- Gate 2 Path A: >= 10 orders AND CVR >= 5%
- Gate 2 Path B: >= 500 impressions AND CTR >= 0.3%
- Target ACoS (test phase): <= 40%
- DQ thresholds per ppc-test-campaign-config.ctx.json
- Scenario templates per ppc-test-campaign-config.ctx.json

## CRM Configuration

Two-module campaign system (DL-017):
- Module: Product_Launches (ID: 645926000008511067) — product record
- Module: Campaigns (ID: 645926000000000055, built-in) — strategy/round level, aggregate metrics, Gate 2 verdict. Lookup to Product_Launches.
- Module: Amazon_Ad_Campaigns (custom) — individual campaign level, 1:1 with Seller Central campaign, cumulative actuals. Lookups to Campaigns + Product_Launches.
- ISM_ExecutionLogs — daily snapshots (Output_Summary JSON) for trend analysis
- Field mappings: see crm-field-mappings.ctx.json
- Campaign config: see ppc-test-campaign-config.ctx.json
- Amazon Ads fields: see amazon-ads-campaign-fields.ctx.json
- Module design: see docs/campaign-plans-module-design.json
- Bigin: one-way sync from CRM (5 read-only fields: strategy name, status, ACoS, spend, Gate 2 verdict)

## Tasks

- `tasks/product-pipeline/test-campaign/` — Event-triggered after FBA + sample confirmation. Full D2.5 workflow with campaign scenarios.
- `tasks/product-pipeline/daily-ads-analysis/` — Scheduled daily. Active campaign monitoring, CRM updates, Slack digest.

## Integrations

- Zoho CRM: read/write Product_Launches, Campaigns, Amazon_Ad_Campaigns, ISM_ExecutionLogs
- Zoho Bigin: Product Launch Factory stages 4-6 (one-way sync from CRM)
- Amazon Seller Central: campaign data (manual import via clipboard)
- Helium10 / Jungle Scout: keyword research CSV (manual import)
- Slack (task-level): #ism-launch-alerts, #ism-launch-reports
- Slack (CRM workflows): #marketing-ops-alerts (C081MG4HXK6)
