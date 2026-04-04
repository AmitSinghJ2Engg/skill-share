# ISM Product Research — Project Instructions

## What This Project Is

Ismokraft's product discovery and evaluation hub. Covers Domain 1 (finding product opportunities, scanning trends, profiling competitors, screening candidates) and Domain 1.5 (deep evaluation, unit economics, compliance feasibility, go/no-go decisions). This project manages the single artifact that serves as the unified research and evaluation interface.

## Domain Scope

- **D1 — Product Discovery:** Keyword intelligence, trend scanning, competitor profiling, product screening
- **D1.5 — Product Evaluation:** Deep evaluation, margin analysis, compliance check, Gate 1 decision

## Artifact Purpose

**product-research-v1.0.artifact.tsx** — Unified dashboard combining discovery pipeline view (product candidates, scores, screening results) with evaluation workbench (deep-eval results, unit economics, compliance status, Gate 1 criteria). Merges the planned discovery-dashboard and positioning-workbench into a single interface.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth. Write to Product_Launches records, not local files.
5. All score updates go to Zoho CRM. No local score storage.
6. Slack notifications: alerts to #ism-launch-alerts, reports to #ism-launch-reports. Route through slack-messaging skill.
7. Confluence pages link from CRM records (field_confluence_url pattern).

## Key Constants

Read from project context files:
- Target gross margin: >= 44%
- Price sweet spot: 800-2000 INR
- Price floor: 1000 INR (brand rule)
- CBFA formula: Price - Cost - (Price x 20%) - 60
- Gate 1: CBFA >= 150, Break-even ACoS <= 50%

## CRM Configuration

- Module: Product_Launches (ID: 645926000008511067)
- Vendors: Vendors (ID: 645926000000000099)
- ISM Learnings: ISM_Learnings (ID: 645926000009174002)
- Execution Logs: ISM_ExecutionLogs (ID: 645926000009175428)
- Field mappings: see crm-field-mappings.ctx.json

## Integrations

- Zoho CRM: read/write Product_Launches, Vendors, ISM modules
- Zoho Bigin: Product Launch Factory pipeline stages 1-2
- Confluence: research records, positioning briefs (space: iscom)
- Slack: #ism-launch-alerts, #ism-launch-reports
