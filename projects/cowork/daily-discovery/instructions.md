# Daily Discovery — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's daily product discovery workflow (Domain 1). Use this cowork project in Claude Desktop for scheduled runs or ad-hoc discovery sessions.

## Parent Chat Project

ISM Product Research (claude.ai) — owns the product-research artifact and full D1+D1.5 context.

## Plugins to Install

- **product-discovery** — KI (keyword intelligence), PD (product discover), PS (product screen), MI (market intelligence)
- **product-evaluation** — PE (product evaluate)
- **margin-calculation** — MC (margin calculator)
- **compliance-management** — CO (compliance ops)
- **workflow-ops** — daily-discovery workflow skill

## Workflow Skills (invoke via /name)

| Action | Skill | Type | Schedule |
|---|---|---|---|
| Run Discovery Pipeline | `/daily-discovery` | scheduled | Daily, 7:00 AM IST |

Full workflow steps are in `skills/workflow/daily-discovery/SKILL.md`.

## Context Files

Read from `context/product-pipeline/`:
- `zone-rotation.ctx.json` — today's zone, seed keywords, marketplace
- `crm-field-mappings.ctx.json` — CRM field API names
- `financial-constants.ctx.json` — margin thresholds

## MCP Connections

- Zoho CRM, Zoho Bigin, Confluence, Slack

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Zoho CRM is the single source of truth.
4. All CRM writes go through `zoho-data-ops` skill.
5. All Slack messages route through `slack-messaging` skill.
