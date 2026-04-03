# Architecture Laws Reference
# ikraft-skill-governance v5.0 | Last updated: 2026-03-15
# Trimmed 2026-04-03. Examples removed; compact definitions retained.

---

## 3-Layer Model

| Layer | Purpose | Location | Rule |
|---|---|---|---|
| CONTEXT | Fee structures, pricing, taxonomies, market rules, supplier signals | `references/` files | Read-only. No executable code. |
| SKILLS | Reasoning, formulas, orchestration, decisions | SKILL.md files | No UI. No raw execution. No embedded knowledge. |
| ARTIFACTS | Dashboards, calculators, reports, forms | JSX/HTML artifacts | No business rules. No self-directed action. |

---

## LAW-1 -- Skills Are the Logic Layer

Skills contain reasoning, formulas, workflows, orchestration only. Prohibited: JSX, HTML, CSS, file I/O, data loops, database queries, UI component definitions.
**Violation:** V-048 (HIGH)

## LAW-2 -- Artifacts Are the Execution Layer

Artifacts perform operational work. Prohibited: hardcoded business constants, pricing formulas not from skill output, gate logic, scoring algorithms, strategy decisions.
**Violation:** V-047 (CRITICAL)

## LAW-3 -- Context Is the Knowledge Layer

Context stores knowledge (fees, tax rules, taxonomies, benchmarks). Skills reference context; they do not embed it. Prohibited in context: workflow steps, UI instructions, session protocols.
**Violation:** V-052 (MEDIUM)

## LAW-4 -- Skills Orchestrate Artifacts

Chain: User request -> skill reads context -> skill selects artifact + parameters -> artifact executes -> returns output. Artifacts never independently select operating parameters.
**Violation:** V-051 (CRITICAL). Detection: artifact contains decision branches determining *what to calculate* rather than *how to display*.

## LAW-5 -- No Business Rules Inside Artifacts

| Formula Category | Belongs In |
|---|---|
| Net margin | margin-calculator + financial-formulas.md |
| Amazon referral/FBA fees | margin-calculator + amazon-fee-table.md |
| Break-even ROAS / LTV | margin-calculator + financial-formulas.md |
| Product opportunity score | product-lab + opportunity-scoring-model.md |
| Gate pass/fail | product-lab GATE-CHECK mode |
| Vendor tier qualification | vendor-ops + vendor-evaluation-model.md |
| ACoS / ROAS verdict | ads-ops |

**Violation:** V-047 (CRITICAL)

## LAW-6 -- Context Must Be Centralized

Every knowledge object has one canonical location, one `context_id`, registered in `context-registry.md`. When updated, only canonical file changes; referencing skills get `#ism-changes` notification. Duplicate detection: two skills declaring same fee/threshold independently = V-049.
**Violation:** V-049 (MEDIUM)

## LAW-7 -- Ecosystem Minimalism

Pre-creation guardrail mandatory. See `skill-creation-guardrail.md` for 5-step protocol. Targets: max 30 active skills, max 5 per domain, 0 merge candidates, 0 orphans.
**Violations:** V-050 (HIGH) skipped guardrail, V-053 (HIGH) redundant skill created.

---

## Canonical Context Objects

| ID | Name | Owner Skill |
|---|---|---|
| CTX-001 | Amazon India Fee Structure 2026 | margin-calculator |
| CTX-002 | Financial Formulas | margin-calculator |
| CTX-003 | Product Evaluation Model v2 | product-lab |
| CTX-004 | Vendor Evaluation Model v2 | vendor-ops |
| CTX-005 | GO FEARLESS Standard v1.0 | ism-business-authority |
| CTX-006 | Business Context | ism-business-authority |
| CTX-007 | Opportunity Scoring Model | product-lab |
| CTX-008 | CRM Field Mappings | zoho-solutions-architect |
| CTX-009 | Bigin Live State | zoho-solutions-architect |
| CTX-010 | Storage Schema | ecosystem-ops |

---

## Amazon India Fee Structure 2026 (CTX-001)

Effective March 16, 2026. Source: Amazon India Seller Central.

| Fee | Rate |
|---|---|
| Referral (Home Decor/Puja/Wood, >1000 SP) | 9.5% on SP above 1000 |
| Closing 0-500 | 5 |
| Closing 500-1000 | 12 |
| Closing 1000-2000 | 20 |
| Closing 2000-5000 | 40 |
| Closing >5000 | 70 |
| Weight <500g | 29 |
| Weight 500g-1kg | 37 |
| Weight >1kg | 37 + 9 per 500g |
| FBA Pick Small/Std/Large | 14 / 20 / 40 |
| GST on all fees | 18% |
