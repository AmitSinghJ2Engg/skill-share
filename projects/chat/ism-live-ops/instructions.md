# ISM Live Ops — Project Instructions

## What This Project Is

Ismokraft's live product operations hub. Covers Domain 4: post-launch monitoring, advertising optimization, inventory management, revenue tracking, and learning capture. Activates when products reach the Product Live stage.

## Domain Scope

- **D4 — Live Operations:** Product monitoring, ad optimization, inventory, revenue tracking, learning engine

## Artifact Purpose

**ops-dashboard-v1.0.artifact.tsx** — Operations dashboard showing live product health (BSR, reviews, revenue), advertising performance (ACoS, ROAS), inventory status, and month-over-month trends. Provides operational alerts and learning capture.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth.
5. Slack: alerts to #ism-launch-alerts, reports to #ism-launch-reports. Route through slack-messaging skill.

## Key Constants

Read from project context files:
- Target ACoS (scale phase): <= 30%
- Target net margin: >= 15%
- BSR monitoring thresholds per category

## CRM Configuration

- Module: Product_Launches (post-launch fields: Post_Launch_Status, Month_1_*, Month_3_*, BSR_at_Launch, Live_Date)
- Field mappings: see crm-field-mappings.ctx.json

## Integrations

- Zoho CRM: read/write Product_Launches (post-launch data)
- Zoho Bigin: Product Launch Factory stage 11 (Product Live)
- Zoho Books: revenue tracking, expense reconciliation
- Zoho Inventory: stock management, reorder tracking
- Amazon Seller Central: performance data (manual import via clipboard)
- Slack: #ism-launch-alerts, #ism-launch-reports
