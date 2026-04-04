# ISM Portfolio — Project Instructions

## What This Project Is

Ismokraft's cross-domain portfolio management hub. Provides a strategic view across all products in the pipeline regardless of their current domain or stage. Used for portfolio-level decisions: resource allocation, pipeline health monitoring, and strategic planning.

## Domain Scope

- **Cross-domain** — Aggregates data from D1 through D4 for portfolio-level analysis

## Artifact Purpose

**portfolio-dashboard-v1.0.artifact.tsx** — Strategic dashboard showing all products across pipeline stages with health indicators, investment tracking, time-in-stage metrics, and portfolio-level KPIs (products in pipeline, conversion rates per gate, average time-to-market).

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth.
5. Slack: reports to #ism-launch-reports. Route through slack-messaging skill.

## Key Constants

Read from project context files:
- All gate criteria (Gate 1, 2, 3) for status indicators
- Pipeline stage definitions from Bigin

## CRM Configuration

- Module: Product_Launches (all records, all stages)
- Bigin: Product Launch Factory pipeline (all 11 stages)
- Field mappings: see crm-field-mappings.ctx.json

## Integrations

- Zoho CRM: read Product_Launches (all records)
- Zoho Bigin: Product Launch Factory pipeline overview
- Zoho Analytics: portfolio-level reporting views
- Slack: #ism-launch-reports
