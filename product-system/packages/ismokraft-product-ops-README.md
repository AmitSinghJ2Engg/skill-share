# Ismokraft Product Ops

End-to-end product launch operations plugin for Ismokraft — from keyword discovery through post-launch monitoring.

## What This Plugin Does

Manages the full product lifecycle for an Indian D2C wooden products brand selling on Amazon India, Shopify, and other marketplaces. The plugin provides 14 specialized skills that cover discovery, evaluation, specification, sourcing, costing, content, advertising, and monitoring.

## Pipeline Flow

```
Keywords → Discovery → Screening → Evaluation → Specification → Sourcing → Listing → Ads → Monitor
   ↑                                                                                          |
   └──────────────────────── Feedback Loop (scoring calibration) ─────────────────────────────┘
```

## Skills

### Core Product Pipeline (run in sequence)

| Skill | Prefix | Modes | Purpose |
|---|---|---|---|
| ikraft-keyword-intelligence | KI- | GENERATE | Daily keyword generation for discovery |
| product-discover | PD- | BATCH, SINGLE, TRENDS | Marketplace crawling and research |
| product-screen | PS- | SCORE, REPORT, BRIEF | Batch scoring, filtering, ranking |
| product-evaluate | PE- | DEEP-EVAL, GATE-CHECK, IDEATE | Single product evaluation, gates, concepts |
| product-spec | SP- | SPEC, BRIEF, PRD | Manufacturing specs, supplier briefs, PRDs |
| product-monitor | PM- | MONITOR, CLASSIFY, FEEDBACK | Post-launch tracking and learning loop |
### Supporting Skills

| Skill | Prefix | Purpose |
|---|---|---|
| vendor-ops | VO- | Supplier discovery, scoring, RFQ generation |
| supplier-intelligence | SI- | Multi-source supplier verification and ranking |
| margin-calculator | MC- | Per-unit profitability, channel comparison, pricing |
| capital-planner | CAP- | Inventory planning, cash flow, budgets, launch capital |
| content-writer | CW- | Blog posts, listings, social content |
| ads-ops | AO- | PPC campaign planning, analysis, competitor ads |
| revenue-ops | RO- | Sales reports, reconciliation, P&L, forecasts |

### System

| Skill | Prefix | Purpose |
|---|---|---|
| product-ops-config | CFG- | Centralized config — thresholds, weights, zones, CRM fields |

## Integration Points

This plugin works with the following external systems via MCP:

- **Zoho CRM** — Product_Launches module (master data), Contacts (vendors)
- **Zoho Bigin** — Product Launch Factory pipeline (process tracking)
- **Zoho Books** — Revenue reconciliation
- **Zoho Inventory** — Stock and fulfillment data
- **Slack** — #product-discovery, #product-alerts, #vendor-comms channels
- **Jira** — Sprint tracking (via ism-scrum-master, not in this plugin)
## Setup

1. Install the plugin in Claude Desktop
2. Ensure MCP connections are active for: Zoho CRM, Zoho Bigin, Slack
3. The product-ops-config skill contains all system configuration

## Architecture Rules

- **Skills are stateless.** They receive inputs, produce outputs, and do not store data.
- **CRM is the system of record.** All persistent data lives in Zoho CRM Product_Launches.
- **No skill-to-skill calls.** The operator (you or a task) routes data between skills.
- **Config is centralized.** product-ops-config owns all thresholds, weights, and system values.
- **Data integrity is non-negotiable.** Every skill enforces the 7 data integrity rules.

## Version

Plugin: 1.0.0
Core skills: v2.1.0
Supporting skills: v1.2.0
New skills: product-spec v1.0.0, product-ops-config v1.0.0