# Product Evaluation — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's product evaluation workflow. Handles deep evaluation, unit economics analysis, compliance feasibility checks, and Gate 1 decisions. Scoped to Domain 1.5.

## Parent Chat Project

ISM Product Research (claude.ai) — owns the product-research artifact and full D1+D1.5 context.

## Plugins

Install these plugins in Claude Desktop:
- **product-evaluation** — PE (product evaluate), MC (margin calculator), CO (compliance ops)

## Active Skills

| Prefix | Skill | Modes Used |
|--------|-------|------------|
| PE | product-evaluate | DEEP-EVAL, GATE-CHECK, IDEATE |
| MC | margin-calculator | ESTIMATE, BREAKEVEN |
| CO | compliance-ops | FEASIBILITY |
| ZO | zoho-data-ops | WRITE |
| SM | slack-messaging | (auto) |

## Tasks

(Future — evaluation task bundles to be defined)

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH/MEDIUM/LOW.
4. Zoho CRM is the single source of truth.
5. All Slack messages route through slack-messaging skill.

## Context Files

Read from `context/product-pipeline/`:
- gate-criteria.ctx.json — Gate 1 thresholds
- financial-constants.ctx.json — margin formulas, CBFA
- crm-field-mappings.ctx.json — CRM field API names

## CRM Configuration

- Module: Product_Launches
- Write to: evaluation scores, compliance feasibility, Gate 1 result
- Dedup: check ISM_ExecutionLogs before running

## Integrations

- Zoho CRM: read/write Product_Launches
- Zoho Bigin: Gate 1 stage transition
- Confluence: positioning briefs
- Slack: #ism-launch-alerts (gate decisions)
