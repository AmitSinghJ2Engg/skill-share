---
name: compliance-ops
description: >
  CO- Manages product compliance across three stages. FEASIBILITY: category-level
  cert check for Gate 1. INITIATION: generates compliance brief and triggers Jira
  tickets. COMPLETION: monitors certs to Gate 3 pass.
version: "1.0.0"
lifecycle: prototype
---

# Compliance Ops

Manages product compliance from early feasibility check through certification completion. Three modes align with pipeline stages: pre-sourcing assessment, mid-pipeline initiation, and pre-launch gate.

**Boundary:** This skill manages compliance workflow. It does not evaluate products (product-evaluate), source vendors (vendor-ops), or calculate margins (margin-calculator).

## Modes

| Mode | Input | Output | Downstream |
|---|---|---|---|
| **FEASIBILITY** | product_category | `ComplianceFeasibility` -> CRM | product-evaluate (Gate 1) |
| **INITIATION** | product_category + ProductSpec | `ComplianceRecord` -> CRM + Jira | fulfillment-ops, product-monitor |
| **COMPLETION** | product_id + ComplianceRecord | `ComplianceCompletionRecord` -> CRM | Gate 3 decision |

## MODE: FEASIBILITY

Category-level compliance check for Gate 1 assessment. No product spec needed.

1. Read product category from CRM `Product_Launches` record.
2. Look up applicable certifications per category from project context. India marketplace: BIS (electrical), FSSAI (food-contact), CPSC (children's). Most wooden home decor/gifting = no mandatory certs.
3. Estimate timeline in weeks per certification.
4. Assign risk level: LOW (no mandatory certs), MEDIUM (optional certs recommended), HIGH (mandatory certs required).
5. Return `ComplianceFeasibility`. CRM writes (`Product_Compliance_Status`, `Certifications_Required`) handled by zoho-data-ops.

**Output:** `ComplianceFeasibility` -- applicable_certs[], estimated_weeks_per_cert, risk_level (LOW/MEDIUM/HIGH). Run ID: `CO-F-{YYYYMMDD}-{NNN}`.

## MODE: INITIATION

Generates compliance brief and triggers Jira ticket creation after vendor selection.

1. Read product category + ProductSpec (materials, dimensions, finish, packaging).
2. Determine applicable certifications based on category + spec combination.
3. Generate compliance brief document: cert type, requirements, estimated cost, timeline, responsible party (internal/external).
4. Trigger Jira ticket creation: CRM activity -> Bigin task activity -> Jira "ismo scrum" board (existing automation). One ticket per certification.
5. Return `ComplianceRecord`. CRM writes and Confluence page creation handled by zoho-data-ops.

**Output:** `ComplianceRecord` -- certs_applicable[], jira_ticket_ids[], owner, initiated_date, expected_completion_dates[]. Run ID: `CO-I-{YYYYMMDD}-{NNN}`.

## MODE: COMPLETION

Monitors Jira cert tickets to completion for Gate 3.

1. Read existing ComplianceRecord from CRM Product_Launches record.
2. Check Jira ticket status for each certification (via CRM activity sync).
3. For completed certs: collect certificate numbers, issuing bodies, expiry dates.
4. Generate Gate 3 compliance checklist: all certs obtained? all valid? no expired?
5. Return `ComplianceCompletionRecord` with gate 3 result. CRM writes and Slack alerts handled by zoho-data-ops and task orchestrator.

**Output:** `ComplianceCompletionRecord` -- cert_numbers[], issuing_bodies[], expiry_dates[], gate_3_result (PASS/FAIL). Run ID: `CO-C-{YYYYMMDD}-{NNN}`.

## Input Validation

| Mode | Required | Block if missing |
|---|---|---|
| FEASIBILITY | product_category | Cannot assess without category |
| INITIATION | product_category + ProductSpec | Cannot generate brief without spec |
| COMPLETION | product_id + existing ComplianceRecord | Redirect to INITIATION first |

## Halt Conditions

- FEASIBILITY: category not in project context cert mapping -> flag unknown category, report no data
- INITIATION: Jira automation not responding -> log failure, continue with manual ticket creation note
- COMPLETION: any cert expired before launch -> FAIL Gate 3, flag expired cert with urgency

## Rules

1. Never invent certification timelines. Use category standards from project context.
2. Risk levels must be evidenced by applicable regulations.
3. Jira ticket creation is via existing CRM-Bigin-Jira automation, not direct MCP call.
4. All dates must be specific (no "soon" or "eventually").
5. Data integrity rules from project context apply to all modes.

## Trigger Phrases

CO-, check compliance feasibility, what certs do we need, initiate compliance, compliance brief, start compliance workflow, are certifications done, compliance status, Gate 3 compliance check.
