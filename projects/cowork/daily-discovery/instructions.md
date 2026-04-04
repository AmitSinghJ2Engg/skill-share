# Daily Discovery — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's daily product discovery workflow. Runs the daily-discovery task: zone-based keyword generation, product scanning, scoring, and CRM updates. Scoped to Domain 1 early-stage discovery only.

## Parent Chat Project

ISM Product Research (claude.ai) — owns the product-research artifact and full D1+D1.5 context.

## Plugins

Install these plugins in Claude Desktop:
- **product-discovery** — KI (keyword intelligence), PD (product discover), PS (product screen), MI (market intelligence)
- **product-evaluation** — PE (product evaluate), MC (margin calculator), CO (compliance ops)

## Active Skills

| Prefix | Skill | Modes Used |
|--------|-------|------------|
| KI | ikraft-keyword-intelligence | GENERATE |
| PD | product-discover | BATCH |
| PS | product-screen | SCORE, REPORT |
| ZO | zoho-data-ops | WRITE |
| SM | slack-messaging | (auto) |

## Tasks

- `tasks/product-pipeline/daily-discovery/` — Scheduled daily at 7:00 AM IST

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH/MEDIUM/LOW.
4. Zoho CRM is the single source of truth.
5. All Slack messages route through slack-messaging skill.

## Context Files

Read from `context/product-pipeline/`:
- zone-rotation.ctx.json — today's zone, seed keywords, marketplace
- crm-field-mappings.ctx.json — CRM field API names
- financial-constants.ctx.json — margin thresholds

## Zone Rotation

7 product zones rotate on a 9-day cycle. Read zone-rotation.ctx.json for today's zone.

## CRM Configuration

- Module: Product_Launches (ID: 645926000008511067)
- Write to: discovery fields, screening scores
- Dedup: check ISM_ExecutionLogs before running

## Integrations

- Zoho CRM: read/write Product_Launches
- Zoho Bigin: stage updates
- Confluence: research records
- Slack: #ism-launch-alerts, #ism-launch-reports
