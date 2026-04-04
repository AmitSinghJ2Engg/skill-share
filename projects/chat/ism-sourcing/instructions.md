# ISM Sourcing — Project Instructions

## What This Project Is

Ismokraft's sourcing and vendor management hub. Covers Domain 2: test sourcing, vendor discovery, vendor scoring, RFQ management, sample tracking, and supplier comparison. Activates after Gate 1 pass in the Product Research project.

## Domain Scope

- **D2 — Test Sourcing:** Vendor discovery, scoring, RFQ, sample management, COGS confirmation

## Artifact Purpose

**sourcing-workbench-v1.0.artifact.tsx** — Unified sourcing interface combining vendor pipeline (discovery, scoring, RFQ status) with supplier scorecard (comparative analysis, grade calculation, cost breakdown). Merges the planned sourcing-workbench and supplier-scorecard artifacts.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho CRM is the single source of truth. Vendor records in Vendors module.
5. All vendor scores go to Zoho CRM. No local score storage.
6. Slack: alerts to #ism-launch-alerts. Route through slack-messaging skill.
7. Confluence: supplier briefs linked from CRM Vendor records.

## Key Constants

Read from project context files:
- Vendor Grade thresholds: A (>=85), B (>=70), C (>=55), D (<55)
- Minimum grade for test sourcing: C
- Lead time ceiling: 45 days
- Minimum suppliers per product: 2

## CRM Configuration

- Module: Vendors (ID: 645926000000000099)
- Product_Launches: linked for product-vendor association
- Field mappings: see crm-field-mappings.ctx.json

## Integrations

- Zoho CRM: read/write Vendors, Product_Launches
- Zoho Bigin: Product Launch Factory stage 3 (Test Sourcing)
- Confluence: supplier research briefs (space: iscom)
- Slack: #ism-launch-alerts
