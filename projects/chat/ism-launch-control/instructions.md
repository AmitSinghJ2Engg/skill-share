# ISM Launch Control — Project Instructions

## What This Project Is

Ismokraft's product launch management hub. Covers Domain 3: sourcing model selection, final listing creation, compliance certification completion, platform setup, and go-live. Activates after Gate 2 pass in the Market Testing project.

## Domain Scope

- **D3 — Product Launch:** Sourcing model selection, final listing, compliance completion (Gate 3), platform setup, go-live

## Artifact Purpose

**launch-control-v1.0.artifact.tsx** — Launch management interface combining listing builder (final content, images, SEO), compliance tracker (certification status, Gate 3 criteria), and platform setup checklist (Seller Central config, tax, shipping, returns). Merges the planned launch-control and seller-central-ops artifacts.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth.
5. Slack: alerts to #ism-launch-alerts. Route through slack-messaging skill.
6. Confluence: compliance tracking linked from CRM records.

## Key Constants

Read from project context files:
- Gate 3: All certifications obtained (100% completion)
- Sourcing models: PL (Private Label), RTS (Ready to Ship), DS (Dropship), POD (Print on Demand)

## CRM Configuration

- Module: Product_Launches (post-Gate 2 fields)
- Bigin: Product Launch Factory stages 7-10
- Field mappings: see crm-field-mappings.ctx.json

## Integrations

- Zoho CRM: read/write Product_Launches
- Zoho Bigin: Product Launch Factory stages 7-10
- Jira: compliance certification tickets (via Bigin automation)
- Confluence: compliance tracking, listing copy (space: iscom)
- Amazon Seller Central: listing management (manual until MCP available)
- Slack: #ism-launch-alerts
