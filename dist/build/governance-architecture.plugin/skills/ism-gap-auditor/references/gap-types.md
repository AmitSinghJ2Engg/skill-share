# Gap Types — ISM Gap Auditor

**Purpose:** Full definitions for each gap type, detection criteria, default
impact/effort/urgency ratings, and examples. Read before Step 3.

---

## Gap Type Reference

### missing_pipeline
**Definition:** A business function operates but has no Bigin pipeline to track it.
**Detection:** Business function is active (Amit confirms work happens) but no corresponding pipeline exists in Bigin_getModules() results.
**Default ratings:** impact=high, effort=deep, urgency=soon
**handoff:** zoho-solutions-architect
**Example:** Marketing campaign tracking has no pipeline — all campaign data lives in spreadsheets.

---

### missing_automation
**Definition:** A handoff between two systems that should be automatic is manual.
**Detection:** A business event in system A should trigger an action in system B, but no Zoho Flow automation exists for it.
**Default ratings:** impact=medium, effort=medium, urgency=soon
**handoff:** zoho-solutions-architect → zoho-developer
**Example:** Product record in Bigin reaches "Validated" stage but no Jira task is auto-created for sourcing work.

---

### missing_tracking
**Definition:** Work happens or data exists but nothing records it in any system.
**Detection:** Jira has no issues of a particular type, or a Bigin field that should be populated is empty across records at the relevant stage.
**Default ratings:** impact=medium, effort=quick, urgency=now
**handoff:** zoho-solutions-architect (if needs new field/pipeline) or ecosystem-ops (Confluence publish) (if process needs defining first)
**Example:** Vendor negotiations happen over WhatsApp/email but no notes are logged in Bigin Contacts.

---

### missing_documentation
**Definition:** A business process exists and is understood but is not written down anywhere accessible to the team.
**Detection:** No Confluence SOP found for the process, OR Confluence search returns nothing for expected process keywords.
**Default ratings:** impact=medium, effort=quick, urgency=soon
**handoff:** ecosystem-ops (Confluence publish)
**Example:** How to process a customer return is known by one person but has no SOP.

---

### missing_artifact
**Definition:** The team needs an interactive tool, calculator, or dashboard but none exists.
**Detection:** A domain skill exists (e.g., margin-calculator) but no corresponding artifact exists to make it self-service. Or a function requires UI that no artifact provides.
**Default ratings:** impact=high, effort=deep, urgency=soon
**handoff:** operator — manual build
**Example:** Product Hub is still pending — all 6 spokes at ⬜ status.

---

### broken_handoff
**Definition:** Data should flow between two systems but the connection is broken, missing, or producing errors.
**Detection:** A Zoho Flow exists but the target record IDs are stale, OR a Bigin field lookup to CRM returns null for records that should have a linked record.
**Default ratings:** impact=high, effort=medium, urgency=now
**handoff:** zoho-developer
**Example:** Bigin Product record has Vendor_Name lookup field but CRM Vendors module records don't exist, so all lookups fail.

---

### stale_process
**Definition:** A process, SOP, or system config exists but is outdated and no longer reflects current operations.
**Detection:** Confluence page modifiedTime > staleness threshold (see expected-state.md), OR page content references retired skills, old pipeline stages, or deprecated fields.
**Default ratings:** impact=low, effort=quick, urgency=later
**handoff:** ecosystem-ops (Confluence publish) (SOP update) or system-ops (Confluence page update)
**Example:** A Confluence SOP references ism-confluence-publisher (retired 2026-03-11).

---

### missing_alert
**Definition:** An important business event occurs but no Slack notification is triggered.
**Detection:** An event type is defined in expected-state.md alert coverage table but no corresponding automation sends to the relevant channel.
**Default ratings:** impact=medium, effort=quick, urgency=soon
**handoff:** alert-designer
**Example:** Vendor score Grade F is assigned but no alert fires to #ism-vendor-engagement.

---

### missing_gate
**Definition:** A product or decision moves through a pipeline stage without a formal checkpoint that should exist.
**Detection:** Bigin records advance past a stage without the required field being populated (per expected-state.md field coverage table). Or a gate defined in product-evaluation-model has no corresponding Bigin validation.
**Default ratings:** impact=high, effort=medium, urgency=now
**handoff:** launch-gate-checker (for gate design), zoho-solutions-architect (for Bigin enforcement)
**Example:** Products advance from "Research & Profitability" to "Test Sourcing" with Financial_Viability = null.

---

## Priority Score Reference

| Scenario | Impact | Urgency | Effort | Score |
|---|---|---|---|---|
| Broken production flow | high | now | quick | 9.0 |
| Missing gate blocking launches | high | now | medium | 4.5 |
| Manual handoff, easy fix | medium | now | quick | 6.0 |
| Missing documentation | medium | soon | quick | 2.0 |
| Stale SOP | low | later | quick | 0.33 |
| Missing analytics tool | high | soon | deep | 2.0 |

Sort descending. Ties broken by impact level (high > medium > low).
