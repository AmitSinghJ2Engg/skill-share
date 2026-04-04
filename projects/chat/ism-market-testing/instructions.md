# ISM Market Testing — Project Instructions

## What This Project Is

Ismokraft's market testing and scale decision hub. Covers Domain 2.5: test listing creation, PPC campaign setup and monitoring, performance analysis, and Gate 2 scale-or-kill decisions. Activates after test sourcing confirms viable vendors.

## Domain Scope

- **D2.5 — Market Testing:** Test listing, paid testing (PPC), performance monitoring, scale decision

## Artifact Purpose

**market-testing-v1.0.artifact.tsx** — Unified testing interface combining campaign planner (test setup, budget allocation, keyword targeting) with scale decision workbench (performance analysis, Gate 2 criteria, scale/kill recommendation). Merges the planned campaign-planner and scale-decision-workbench artifacts.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth.
5. All test results go to Zoho CRM. No local score storage.
6. Slack: alerts to #ism-launch-alerts, reports to #ism-launch-reports. Route through slack-messaging skill.
7. Confluence: test results linked from CRM records.

## Key Constants

Read from project context files:
- Gate 2 Path A: >= 10 orders AND CVR >= 5%
- Gate 2 Path B: >= 500 impressions AND CTR >= 0.3%
- Target ACoS (test phase): <= 40%
- DQ thresholds per ppc-test-campaign-config.ctx.json

## CRM Configuration

- Module: Product_Launches (ID: 645926000008511067)
- Field mappings: see crm-field-mappings.ctx.json, ppc-test-campaign-config.ctx.json

## Integrations

- Zoho CRM: read/write Product_Launches
- Zoho Bigin: Product Launch Factory stages 4-6 (Test Listing, Paid Testing, Scale Decision)
- Amazon Seller Central: campaign data (manual import via clipboard)
- Slack: #ism-launch-alerts, #ism-launch-reports
