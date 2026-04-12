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

## Schedule Registration

The daily-discovery workflow needs to be registered at the execution layer:

**Windows Task Scheduler (via DL-020 helper):**
```powershell
.\tools\register-scheduled-task.ps1 -TaskName "daily-discovery" -Schedule "Daily 07:00"
```

**Claude Code `/loop` (session-scoped, temporary):**
```
/loop 24h /daily-discovery
```

**Claude Desktop scheduled tasks:**
Configure in Desktop settings → Scheduled Tasks.

**Claude Cloud scheduled tasks:**
Register via `/schedule` command in Claude Code.

## Context Files

Read from `context/product-pipeline/`:
- `zone-rotation.ctx.json` — today's zone, seed keywords, marketplace rotation
- `crm-field-mappings.ctx.json` — CRM field API names
- `financial-constants.ctx.json` — margin thresholds

## MCP Connections

Configure in `.mcp.json` (gitignored, per-user credentials):
- zoho-crm — read/write Product_Launches, ISM_ExecutionLogs, ISM_Learnings
- zoho-bigin — stage updates
- Confluence — research records
- Slack — via slack-messaging skill

## CRM Configuration

- **Product_Launches** (ID: 645926000008511067) — discovery fields, screening scores
- **ISM_ExecutionLogs** — dedup check + execution log
- **ISM_Learnings** — keyword performance signals
- Dedup: check ISM_ExecutionLogs before running (Skill_Name = "daily-discovery" AND Execution_Date = today)

## Zone Rotation

7 product zones rotate on a 9-day cycle. Read `zone-rotation.ctx.json` for today's zone.

## Integrations

- Zoho CRM: read/write Product_Launches, ISM_ExecutionLogs, ISM_Learnings
- Zoho Bigin: stage updates (one-way CRM → Bigin)
- Confluence: research records
- Slack: #ism-launch-reports (daily summary), #ism-launch-alerts (errors/anomalies)

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH/MEDIUM/LOW.
4. Zoho CRM is the single source of truth.
5. All CRM writes go through `zoho-data-ops` skill.
6. All Slack messages route through `slack-messaging` skill.
