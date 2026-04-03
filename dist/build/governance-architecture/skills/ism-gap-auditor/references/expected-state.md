# Expected State — ISM Gap Auditor

**Purpose:** Defines what a "correct" system state looks like for each platform.
Deviations from this state are gaps. Read before Step 3 (Gap Detection).

**Last updated:** 2026-03-11

---

## Bigin — Expected State

### Pipelines
All 13 pipelines must exist. For each pipeline:
- At least one active record is expected for running business functions
- Product Launches pipeline: stages 1-9 must all be present (New Request → Final Listing)
- Sourcing Model Selection stage must have Field: Sourcing_Model_Selected populated for records past Gate 4

### Fields Per Pipeline Record (Product Launches)
These fields must be populated by the stage indicated:

| Field | Required by Stage |
|---|---|
| Opportunity_Score | Validated (stage 2) |
| Financial_Viability | Research & Profitability (stage 3) |
| Target_Platform | New Request (stage 1) |
| Sourcing_Model_Selected | Sourcing Model Selection (stage 8) |
| Scale_Verdict | Scale Decision Data (stage 7) |

Records missing required fields for their stage = `missing_tracking` gap.

### Automations
- Stage transitions must trigger Slack alerts to #ism-launch-alerts
- No automation = `missing_alert` gap

---

## Jira — Expected State

### Projects
- ISK (Ismo Scrum) must exist as team-managed project
- Active sprint must exist during working weeks
- Backlog must have issues organized by epic

### Issue Types
- Task (10041), Bug (10042), Story (10043), Epic (10044), Subtask (10045) — all must be present

### Coverage
Business functions that require tracked work but have no Jira issues present = `missing_tracking` gap.
Expected Jira coverage:
- Product research tasks
- Vendor evaluation tasks
- Finance / margin review tasks
- Content creation tasks
- Sprint ceremonies (as recurring tasks)

---

## Confluence — Expected State

### Spaces
- `iscom` (Ismokraft Discovery & Scrums) — primary active space. Must exist.
- `AF` (Ismokraft Enterprises) — legacy. Mine for context only.

### Required Pages in iscom
| Page / Section | Purpose | Staleness threshold |
|---|---|---|
| Architecture & Design (585170954) | System design docs | 90 days |
| Tech Specs (585007108) | Implementation specs | 90 days |
| Product Launches (578715650) | Launch playbooks | 60 days |
| Central Artifact Directory (585826305) | Artifact registry | 30 days |
| Process Audit reports | Gap audit history | Created per audit |

Pages not updated within their staleness threshold = `stale_process` gap.
Required pages that don't exist = `missing_documentation` gap.

### Required SOPs (expected to exist)
- Product launch process
- Vendor evaluation process
- Order fulfillment process
- Returns & refunds process
- Sprint ceremony cadence

Missing SOP = `missing_documentation` gap.

---

## Slack — Expected State

### Required Channels
All 7 channels must exist and be active:

| Channel | ID | Purpose |
|---|---|---|
| #ism-launch-alerts | C0AKNEW3V6H | Stage transitions, gate results |
| #ism-launch-reports | C0AKRTPLMPC | Digests, summaries |
| #ism-vendor-engagement | C0AKNF5AN3X | Vendor evaluation results |
| #ism-artifact-issues | C0AKRTTFL66 | Artifact errors |
| #ism-artifact-reviews | C0AKKGEALR1 | Review requests |
| #ismo-gen-alerts | C07EFJA8R8U | General catch-all |
| #ismo-sprint-notify | C0798LRK2D8 | Sprint updates |

### Alert Coverage
Business events that should trigger Slack alerts but have no automation:
- Product stage transition → #ism-launch-alerts
- Vendor score computed → #ism-vendor-engagement
- Gap audit complete → #ismo-gen-alerts
- Sprint start/end → #ismo-sprint-notify
- Artifact error → #ism-artifact-issues

Missing alert for a defined event = `missing_alert` gap.

---

## Zoho CRM — Expected State

### Custom Modules (required)
- `ISM_Objectives` — OKR objectives
- `ISM_KPIs` — KPI definitions
- `ISM_KPI_Actuals` — KPI actuals per period

If any module is missing = `missing_tracking` gap (route to zoho-solutions-architect).

### CRM Products Module
- Must have PL Product Layout active
- Product_Attractiveness_Score field must exist
- Vendor_Name lookup to CRM Vendors must be functional

---

## Zoho Flow — Expected State (manual check — no MCP)

Expected automations that should exist:
- Bigin stage change → Slack #ism-launch-alerts
- Bigin record created (New Request) → Jira ISK task created
- Vendor score Grade A/B set → #ism-vendor-engagement notification

No MCP available for Flow. These gaps must be identified from Amit's knowledge,
not from automated detection. State this limitation in the audit output.
