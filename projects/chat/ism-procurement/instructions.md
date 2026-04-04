# ISM Procurement — Project Instructions

## What This Project Is

Ismokraft's source-to-pay procurement management hub. Covers the S2P pipeline: purchase orders, vendor payments, expense tracking, invoice reconciliation, and procurement analytics. Supports all domains that involve vendor payments and purchase management.

## Domain Scope

- **S2P — Source to Pay:** Purchase orders, vendor payments, expense tracking, invoice reconciliation

## Artifact Purpose

**source-to-pay-v1.0.artifact.tsx** — Procurement dashboard tracking the full source-to-pay lifecycle: PO creation, vendor payment scheduling, invoice matching, expense categorization, and payment status. Links to Zoho Books and Zoho Inventory for financial records.

## Data Integrity Rules

1. Never invent data. If a field is null, report null — do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels mandatory: HIGH (verified), MEDIUM (single source), LOW (estimated).
4. Zoho Books is the financial source of truth for procurement.
5. Slack: alerts to #ism-launch-alerts. Route through slack-messaging skill.

## Key Constants

Read from project context files:
- GST Rate: 12% (wooden products)
- Payment terms: as per vendor agreements
- Currency: INR primary, USD for international vendors

## CRM Configuration

- Module: Vendors (for vendor details)
- Bigin: Procure To Pay pipeline (layout ID: 677677000002680495)
- Zoho Books: invoices, items, purchase orders
- Zoho Inventory: items, packages

## Integrations

- Zoho CRM: read Vendors
- Zoho Bigin: Procure To Pay pipeline
- Zoho Books: invoices, purchase orders, expense tracking (read/write)
- Zoho Inventory: items, packages (read/write)
- Razorpay: payment settlements, refunds (read)
- Slack: #ism-launch-alerts
