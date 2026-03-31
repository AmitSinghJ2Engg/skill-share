# Ismokraft Standard Patterns Library

**Purpose:** Reusable architectural patterns established for the Ismokraft Zoho ecosystem.
Every new process design must check this library first and apply applicable patterns.
When a new pattern is established, it is added here with full rationale.

**Versioning:** Each pattern has a version number. When a pattern is revised, the old version
is retained below it under `## Previous Versions` with a deprecation note.

**How Claude uses this file:**
- Read this file at the start of every design session
- Apply all applicable patterns — do not redesign from scratch what has already been decided
- When a conversation establishes a new reusable pattern, produce a new entry (see Pattern Template at end)
  and present it to the user for confirmation before adding to this file
- Flag pattern conflicts explicitly — never silently deviate from an established pattern

---

## Pattern Index

| ID | Pattern Name | Status | Version | Added |
|---|---|---|---|---|
| ISM-P001 | Stage-Activity-Jira Execution Chain | Active | 1.0 | March 2026 |
| ISM-P002 | CRM-Entry with Blueprint | Active | 1.0 | March 2026 |
| ISM-P003 | Multi-Channel Order Intake | Active | 1.0 | March 2026 |

---

---

# ISM-P001 — Stage-Activity-Jira Execution Chain

**Version:** 1.0
**Status:** Active
**Applies to:** All processes built on the Ismokraft Zoho stack that involve task execution
**Design Authority layers:** P2, P3, Layer 2 (Criteria 1, 6, 8), Layer 3
**Established:** March 2026

---

## Problem This Solves

Processes need to track both *what stage a deal/record is at* (pipeline-level) and *what specific work needs to happen* (task-level). Two failure modes exist without a standard pattern:

1. **Jira tickets triggered directly from pipeline stage changes** — creates tight coupling between CRM/Bigin and Jira. Any Bigin pipeline change requires Jira reconfiguration. Violates P2 (each system has one job) and makes the integration brittle.

2. **Ad-hoc activity creation** — team members create activities inconsistently, making it impossible to automate downstream Jira ticket creation reliably or build observable reporting.

---

## The Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: PIPELINE                                              │
│  Bigin Pipeline Stage Record  (e.g. "Sourcing", "In Review")   │
│                │                                                │
│                │  1 : many (one stage record can spawn         │
│                │           multiple activities)                 │
│                ▼                                                │
│  LAYER 2: ACTIVITY (Integration Boundary)                       │
│  Bigin Activity                                                 │
│    - Type      : standardised dropdown (see Activity Types)     │
│    - Status    : standardised dropdown (see Activity Statuses)  │
│    - Priority  : standardised dropdown                          │
│    - Jira ref  : populated by automation after ticket created   │
│    - Stage ref : system-populated link back to parent record    │
│                │                                                │
│                │  1 : many (one activity can spawn              │
│                │           multiple Jira tickets)               │
│                │  via Zoho Flow (parameter-driven, not always)  │
│                ▼                                                │
│  LAYER 3: JIRA EXECUTION                                        │
│  Jira Ticket(s)                                                 │
│    - Created by Zoho Flow based on Activity Type + parameters  │
│    - Jira ticket ID written back to Bigin Activity             │
│    - Jira = task execution only (P2). CRM/Bigin do not track   │
│      sub-task detail — they track status and outcome only      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architectural Decisions and Rationale

### AD-1: Activities are the integration boundary between Zoho and Jira

**Decision:** Bigin Activities — not pipeline stage changes — are what trigger Jira ticket creation.

**Rationale:**
- Preserves P2: Bigin owns execution state; Jira owns task execution. Pipeline stage changes are strategic signals, not task triggers.
- Loose coupling: If Jira is unavailable, Bigin activities still exist and work continues. The Jira ticket creation is a downstream side-effect, not a prerequisite.
- Enables selective triggering: Not every activity spawns a Jira ticket. The Flow applies parameter-based conditions (Activity Type, Priority, Assignee role, etc.) to decide whether a Jira ticket is warranted.

### AD-2: One pipeline stage record can have many Bigin activities

**Decision:** The relationship is 1:many. Multiple activities can exist against a single stage record simultaneously.

**Rationale:**
- Reflects real work: A single "In Sourcing" stage record may require a supplier outreach activity, a sample request activity, and a costing activity — all at the same time.
- Activities are not sequential by default. Dependencies between activities (if any) are documented in the process-specific design, not assumed from the pattern.

### AD-3: One Bigin activity can have many Jira tickets

**Decision:** The relationship is 1:many. A single activity can spawn multiple Jira tickets.

**Rationale:**
- Some activities involve work across multiple Jira assignees or workstreams.
- The Bigin Activity remains the single source of truth for *what* needs doing. Jira tickets are the execution units for *who does it and how*.
- The Bigin Activity "Jira Reference" field stores a comma-separated list of Jira ticket IDs (or a linked field if Bigin supports it). Jira ticket count is observable from this field.

### AD-4: Jira ticket creation is parameter-driven, not automatic on every activity

**Decision:** A Zoho Flow evaluates parameters before deciding whether to create a Jira ticket.

**Rationale:**
- Not every Bigin activity requires Jira execution. Internal check-ins, notes, and follow-ups stay in Bigin.
- Parameters evaluated by the Flow are process-specific and must be documented in each process's Tech Spec. Common parameters: Activity Type, Priority, Assignee department, Deal value threshold.
- This keeps Jira clean and purposeful — Jira tickets represent real execution work, not every interaction.

### AD-5: Jira ticket ID is written back to the Bigin Activity

**Decision:** After Jira ticket creation, the Flow writes the Jira ticket ID (or IDs) back to the Bigin Activity record.

**Rationale:**
- Auditability (P10, Layer 3): The Bigin Activity is the source of truth. Without the Jira reference, the link is invisible and unauditable.
- Enables status rollup: Future automation can read Jira ticket status and surface it in Bigin without manual entry (P3).
- Layer 2 Criterion 8: The Jira reference field is a system infrastructure field — populated by automation only, never manually.

---

## Standard Activity Fields (apply to ALL processes using this pattern)

Every Bigin Activity created under this pattern must have these fields. Process-specific fields may be added only if they satisfy Layer 2 criteria.

| Field Name | API Name | Type | Criterion # | Tier | Populated by |
|---|---|---|---|---|---|
| Activity Type | activity_type | Dropdown | 1 (automation trigger) | 1 | Human (required) |
| Activity Status | activity_status | Dropdown | 1 (stage advance trigger) | 1 | Human → auto-updated by Flow |
| Priority | activity_priority | Dropdown | 1 (Jira trigger parameter) | 1 | Human (required) |
| Parent Record ID | parent_record_id | Text (auto) | 8 (system infrastructure) | 2 | Automation only |
| Parent Module | parent_module | Dropdown | 8 (system infrastructure) | 2 | Automation only |
| Jira Ticket Reference | jira_ticket_ref | Text (auto) | 8 (system infrastructure) | 2 | Automation only — never manual |
| Jira Ticket Count | jira_ticket_count | Number (formula) | 3 (review metric) | 1 | Formula — derived from jira_ticket_ref |

---

## Standard Activity Types (baseline — extend per process, do not remove)

| Activity Type | Triggers Jira? | Default Priority |
|---|---|---|
| Supplier Outreach | Conditional | Medium |
| Sample Request | Yes | High |
| Costing / Pricing Review | Yes | High |
| Internal Review | No | Low |
| Follow-up | No | Low |
| Approval Request | Yes | High |
| Issue / Exception | Yes | High |

> Process-specific types are added to this table in the relevant process Tech Spec.
> The master list is maintained in Bigin's Activity Type dropdown configuration.

---

## Standard Activity Statuses

| Status | Meaning | Triggers |
|---|---|---|
| Not Started | Activity created, work not begun | — |
| In Progress | Work underway | — |
| Waiting on External | Blocked by third party | Optional alert to team |
| Waiting on Internal | Blocked by internal dependency | Create follow-up task |
| Completed | Work done, outcome recorded | Check if parent record should advance |
| Cancelled | Activity no longer required | Record reason in Notes |

---

## Flow Design for Jira Ticket Creation (standard structure)

Every Flow implementing this pattern must follow this structure:

```
TRIGGER: Bigin Activity created or Activity Type / Priority changed

STEP 1: Bigin - Fetch Activity record (get all standard fields)
  → Error branch: Log to ops-alerts, halt

STEP 2: Condition - Does this Activity Type + Priority combination warrant a Jira ticket?
  → Parameters: Activity Type, Priority, [process-specific conditions]
  → If NO: End flow here. No ticket created.

STEP 3: Jira - Create Ticket
  → Project: [process-specific]
  → Issue Type: [mapped from Activity Type]
  → Summary: "[Activity Type] — [Parent Record Name] — [Date]"
  → Description: Include Bigin Activity ID, Parent Record ID, link back to Bigin
  → Priority: [mapped from Activity Priority]
  → Error branch: Log to ops-alerts, alert system admin, halt

STEP 4: Bigin - Write Jira Ticket ID back to Activity (jira_ticket_ref field)
  → Append to existing value if field already has entries (comma-separated)
  → Error branch: Log to ops-alerts — this is a data integrity failure, escalate

STEP 5: Bigin - Increment jira_ticket_count (if not formula field)
  → Skip if jira_ticket_count is a formula field

END
```

**Naming convention for this Flow:** `[Process Name] - Activity to Jira Bridge`

---

## Observability Requirements

Every implementation of this pattern must surface these metrics in Zoho Analytics:

| Metric | Source | Purpose |
|---|---|---|
| Activities per stage record | Bigin | Workload distribution |
| Activity status breakdown | Bigin | Bottleneck identification |
| Activities with no Jira ticket (where type warrants one) | Bigin | Bridge failure detection |
| Jira tickets per activity | Bigin (jira_ticket_count) | Complexity indicator |
| Time from activity creation to Jira ticket creation | Flow log + Bigin | Automation lag monitoring |

---

## What This Pattern Does NOT Cover

- The content or structure of Jira tickets (defined per process)
- How Jira ticket status flows back to Bigin (defined per process — future pattern)
- What triggers the Bigin Activity to be created in the first place (defined per process)
- Escalation rules if an activity stays in "Waiting" status too long (defined per process)

These are intentionally left to process-specific design to keep the pattern reusable.

---

## Test Cases for This Pattern

| # | Test | Input | Expected Output |
|---|---|---|---|
| 1 | Activity created, type = "Sample Request", priority = High | New Bigin Activity | Jira ticket created; jira_ticket_ref populated within 60s |
| 2 | Activity created, type = "Follow-up", priority = Low | New Bigin Activity | No Jira ticket; activity stays in Bigin only |
| 3 | Second Jira ticket created for same activity | Activity amended, second trigger | jira_ticket_ref contains both IDs, comma-separated |
| 4 | Jira API unavailable during ticket creation | Jira down | Flow logs error, ops-alerts notified, Activity NOT corrupted |
| 5 | Jira ticket created but writeback fails | Flow step 4 fails | ops-alerts notified immediately, data integrity flag raised |

---

---

# ISM-P002 — CRM-Entry with Blueprint

**Version:** 1.0
**Status:** Active
**Applies to:** All Ismokraft processes where a PM, approver, or strategic role is the primary data producer — including account management, strategic sourcing qualification, opportunity management, and any process where approval or decision gates precede execution team involvement.
**Design Authority layers:** P2, P3, P4, P5, Layer 2 (Criteria 1, 4, 5, 8), Layer 3 (Entry Point Determination), Layer 4
**Established:** March 2026

---

## Problem This Solves

Two failure modes arise when the entry point isn't explicitly determined:

1. **PM/strategic data forced into Bigin first** — Bigin is optimised for execution team workflows. Forcing PM-driven data entry into Bigin violates P2 (wrong system for the producer), creates unnecessary field duplication when the data later moves to CRM, and bypasses CRM's native Blueprint and approval tooling.

2. **Unguided CRM data entry** — Without Blueprint, CRM data entry is unstructured. Fields are completed out of order, gates are unenforced, and records reach execution stage with incomplete strategic data. This violates P4 (gates must be system-enforced).

---

## The Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  ENTRY: CRM Record created (PM / approver / strategic role)     │
│    - Source: Manual entry, web form, inbound lead, or API       │
│    - Module: Leads, Deals, Accounts, or custom module           │
│                │                                                │
│                ▼                                                │
│  STAGE 1–N: CRM Blueprint (one transition per process stage)    │
│    - Each transition has required fields (mandatory completion) │
│    - Validation rules enforce quantitative thresholds           │
│    - Approval transitions use CRM native approvals              │
│    - Enrichment steps: PM adds strategic data per transition    │
│                │                                                │
│                │  At handoff trigger (Blueprint stage or field) │
│                ▼                                                │
│  HANDOFF FLOW: Zoho Flow creates Bigin execution record         │
│    - Triggered by: Blueprint stage change OR field value change │
│    - Copies only the fields that pass the Sync Field Test       │
│    - Sets Bigin record to correct pipeline + stage              │
│    - Writes Bigin record ID back to CRM record (Criterion 8)    │
│                │                                                │
│                ▼                                                │
│  EXECUTION: Bigin pipeline + ISM-P001 chain (if applicable)     │
│    - Bigin = execution source of truth from this point          │
│    - CRM = strategic source of truth throughout                 │
│    - Status rollups from Bigin → CRM (event-driven, not manual) │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architectural Decisions and Rationale

### AD-1: Zoho CRM Blueprint is the mandatory mechanism for CRM-entry processes

**Decision:** Whenever CRM is the entry point, Blueprint must be used to structure data entry and enforce per-stage completion. Layout rules and mandatory field markers alone are not sufficient.

**Rationale:**
- Blueprint enforces sequential stage progression with transition-level required fields — fields can be mandatory at a specific stage without being mandatory on the entire record. This matches how real processes work (some fields are only known mid-process).
- Blueprint transitions are themselves gates: they physically prevent moving to the next stage until required fields are complete (P4).
- Blueprint history is auditable and permanent — every transition is timestamped and attributed (P10).
- Blueprint enables the correct path to be easier than workarounds: the transition button is the action, and it only appears when pre-conditions are met (P5).

### AD-2: CRM is the source of truth for strategic fields; Bigin is the source of truth for execution fields

**Decision:** Fields do not migrate ownership when the record is handed off. CRM owns what the PM enters. Bigin owns what the execution team enters. Neither writes to the other's fields directly.

**Rationale:**
- P3: Data enters once at source. The PM enters strategic data once in CRM. The execution team enters execution data once in Bigin.
- P2: Each system has one job. CRM is not updated with execution-layer detail. Bigin is not updated with strategic-layer decisions.
- Layer 3 Sync Field Test gates what crosses the boundary — only fields that fail the sync test travel; the rest stay in their source system.

### AD-3: The handoff trigger is a Zoho Flow event, not a manual step

**Decision:** The Bigin record is created by Zoho Flow automatically when the CRM Blueprint reaches the designated handoff stage (or a handoff field is set). The PM does not manually create the Bigin record.

**Rationale:**
- P3: No manual transcription. The data moves by automation.
- P7: No unintentional friction at handoff. The Bigin record exists before the execution team opens Bigin.
- Reliability: Manual handoff steps are skipped under pressure. Automation is not.

### AD-4: CRM record ID is written to Bigin; Bigin record ID is written back to CRM

**Decision:** After the Flow creates the Bigin record, it writes the Bigin record ID to a dedicated field in the CRM record. The CRM record ID is included in the Bigin record at creation.

**Rationale:**
- Layer 2 Criterion 8: These are system infrastructure fields — cross-system record links. Populated by automation only, never manually.
- Auditability: Either record can be navigated to the other. No orphaned records.
- Future automation: Status rollups from Bigin → CRM use this link. Without it, the rollup cannot find the right CRM record.

### AD-5: ISM-P001 applies from the Bigin record onwards (if the process involves activities and Jira)

**Decision:** Once the Bigin record exists, ISM-P001 (Stage-Activity-Jira Execution Chain) applies in the normal way.

**Rationale:**
- ISM-P002 defines *how the record gets to Bigin*. ISM-P001 defines *what happens in Bigin*. They are composable, not mutually exclusive.
- Processes that do not require Jira execution (Bigin-only processes) use ISM-P002 for entry and the standard Bigin pipeline for execution, without ISM-P001.

---

## CRM Blueprint Design Requirements

Every Blueprint designed under this pattern must include:

| Element | Requirement |
|---|---|
| Stage names | Match the business process stage names exactly. Use consistent naming convention across all Blueprints. |
| Transition required fields | Define per transition — not globally on the module. Fields required at Stage 2 are not required at Stage 1. |
| Transition owner | Specify which role can perform each transition. Approvals use CRM native approval transitions. |
| Approval transitions | Use Blueprint's built-in approval mechanism. Approval status, approver, and date auto-captured by CRM. |
| Rejection handling | Every approval transition must have a rejection path with required Notes field. |
| Handoff stage | Exactly one stage designated as the execution handoff point. Flow trigger fires on entry to this stage. |
| SLA / time tracking | Use Blueprint's time-in-stage feature where SLA enforcement is required. Do not create manual date fields to replicate native functionality (P1). |

---

## Standard Cross-System Infrastructure Fields

These fields are created under this pattern. Process-specific fields are added only if they satisfy Layer 2 criteria.

**On the CRM record:**

| Field Name | API Name | Type | Criterion # | Tier | Populated by |
|---|---|---|---|---|---|
| Bigin Record ID | bigin_record_id | Text (auto) | 8 (system infrastructure) | 2 | Automation only — never manual |
| Bigin Pipeline | bigin_pipeline | Dropdown | 8 (system infrastructure) | 2 | Automation only |
| Execution Handoff Date | execution_handoff_date | Date/Time | 5 (accountability record) | 1 | Automation only — on Flow trigger |

**On the Bigin record (created by Flow):**

| Field Name | API Name | Type | Criterion # | Tier | Populated by |
|---|---|---|---|---|---|
| CRM Record ID | crm_record_id | Text (auto) | 8 (system infrastructure) | 2 | Automation only — never manual |
| CRM Record Type | crm_record_type | Dropdown | 8 (system infrastructure) | 2 | Automation only |
| CRM Link | crm_link | URL | 8 (system infrastructure) | 2 | Automation only |

---

## Handoff Flow Structure (standard)

```
TRIGGER: CRM Blueprint reaches [Handoff Stage] OR CRM field [handoff_trigger_field] set to [value]

STEP 1: CRM - Fetch record (get all fields to be passed to Bigin)
  → Error branch: Log to ops-alerts, halt

STEP 2: Condition - Has a Bigin record already been created? (check bigin_record_id)
  → If YES: Log duplicate trigger, halt — do not create second Bigin record
  → If NO: Continue

STEP 3: Bigin - Create Deal/Contact record
  → Pipeline: [process-specific]
  → Stage: [process-specific entry stage]
  → Populate: fields that pass the Sync Field Test only
  → Include: crm_record_id, crm_record_type, crm_link
  → Error branch: Log to ops-alerts, alert system admin, halt

STEP 4: CRM - Write Bigin Record ID back to CRM record (bigin_record_id field)
  → Also write bigin_pipeline, execution_handoff_date
  → Error branch: Log to ops-alerts — this is a data integrity failure, escalate immediately

END
```

**Naming convention for this Flow:** `[Process Name] - CRM to Bigin Handoff`

---

## Observability Requirements

| Metric | Source | Purpose |
|---|---|---|
| CRM records with no Bigin ID after handoff stage | CRM | Detects handoff Flow failures |
| Bigin records with no CRM ID | Bigin | Detects orphaned execution records |
| Time in each Blueprint stage | CRM (Blueprint native) | SLA tracking and bottleneck identification |
| Approval cycle time | CRM (Blueprint native) | Approval process health |
| Rejection rate per transition | CRM (Blueprint native) | Gate calibration — high rejection = gate criteria may need adjustment |

---

## What This Pattern Does NOT Cover

- The specific Blueprint stage names and transition fields for each process (defined per process in the Tech Spec)
- Which CRM module to use (Leads, Deals, Accounts — defined per process)
- Status rollup from Bigin back to CRM after execution begins (defined per process — future pattern)
- Bigin execution workflow post-handoff (covered by ISM-P001 if applicable)
- Processes where data originates outside both systems (external API, web form) — entry point for these is CRM; this pattern then applies

---

## Test Cases for This Pattern

| # | Test | Input | Expected Output |
|---|---|---|---|
| 1 | Blueprint reaches handoff stage | CRM record manually advanced | Bigin record created within 60s; bigin_record_id populated in CRM |
| 2 | Flow triggered twice for same record | Duplicate trigger (e.g. field re-saved) | Second Bigin record NOT created; duplicate trigger logged |
| 3 | Required Blueprint field missing at transition | PM attempts to advance stage | Transition blocked; CRM displays field requirement |
| 4 | Approval transition — approver rejects | Approval rejection | CRM record returned to previous stage; Notes required before rejection saves |
| 5 | Bigin record created but CRM writeback fails | Flow Step 4 fails | ops-alerts notified immediately; CRM record has no bigin_record_id (detectable via observability metric) |

---

---

# Pattern Template

*Use this when adding a new pattern to this library.*

```markdown
# ISM-P[NNN] — [Pattern Name]

**Version:** 1.0
**Status:** Active
**Applies to:** [Which processes / scenarios]
**Design Authority layers:** [Which principles and layers this embodies]
**Established:** [Month Year]

## Problem This Solves
[What breaks without this pattern? What failure modes does it prevent?]

## The Pattern
[ASCII diagram + prose description]

## Architectural Decisions and Rationale
### AD-1: [Decision]
**Decision:** [What was decided]
**Rationale:** [Why — reference principles and layers]

## Standard Fields (if applicable)
[Field table with criterion numbers]

## Standard Flow Structure (if applicable)
[Step-by-step flow template]

## Observability Requirements
[Metrics that must be tracked]

## What This Pattern Does NOT Cover
[Explicit scope boundaries]

## Test Cases
[Standard test cases for this pattern]
```


---

# ISM-P003 — Multi-Channel Order Intake

**Version:** 1.0
**Status:** Active
**Applies to:** All ecommerce order flows from any sales channel into the Ismokraft Zoho stack
**Design Authority layers:** P2, P3, Layer 2 (Criteria 1, 3, 4, 8), Layer 3
**Established:** March 2026

---

## Problem This Solves

Ismokraft sells across multiple channels (Amazon, Shopify, Flipkart, etc.). Without a standard pattern, two failure modes emerge:

1. **Direct channel → Books path**: Some teams try to create invoices directly from channel order data, bypassing Zoho Inventory. This creates stock visibility gaps, mismatched SKU records, and GST compliance risk (HSN codes may not be populated).

2. **Ad-hoc channel integration design**: Each channel integration gets designed independently, producing inconsistent data structures, conflicting automation triggers, and no unified return flow.

---

## The Pattern

```
┌──────────────────────────────────────────────────────────────────────┐
│  LAYER 1: CHANNEL (Source)                                           │
│  Amazon IN / Shopify / Flipkart / Meesho / other                     │
│                │                                                      │
│                │  Order event (webhook or API poll)                   │
│                │  Connector: Native (Amazon/Shopify) or               │
│                │             3rd-party (Flipkart/Meesho)              │
│                ▼                                                      │
│  LAYER 2: ZOHO INVENTORY (Operational Centre)                        │
│  Sales Order created                                                  │
│    - Channel name: standardised picklist field                        │
│    - Fulfillment model: FBA / FBF / Self-ship / Dropship             │
│    - Warehouse: channel-appropriate warehouse record                  │
│    - HSN codes: inherited from Item record (must exist)              │
│    - Stock: allocated from correct warehouse on SO creation          │
│                │                                                      │
│                │  Trigger: Sales Order status = Confirmed             │
│                │  via Zoho Flow                                       │
│                ▼                                                      │
│  LAYER 3: ZOHO BOOKS (Financial Record)                              │
│  Invoice auto-created from Sales Order                               │
│    - GST: calculated from HSN code + place of supply                │
│    - E-invoice IRN: generated if turnover > ₹5Cr                    │
│    - Payment: matched at settlement level (not per-order)            │
│                │                                                      │
│                │  Return path (when applicable)                       │
│                ▼                                                      │
│  RETURN FLOW                                                         │
│  Channel return → Inventory (stock receipt)                          │
│    → Books (Credit Note against original invoice)                    │
│    → CRM (if Sync Field Test passes: update customer LTV)           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Architectural Decisions and Rationale

### AD-1: Zoho Inventory is the mandatory intermediary
**Decision:** All channels funnel orders into Zoho Inventory before anything reaches Books. No channel writes directly to Books.
**Rationale:** P2 (correct system for correct job) — Inventory manages stock, Books manages money. P3 (data enters once) — HSN codes, warehouse assignments, and SKU data live in Inventory; duplicating them in Books would violate single-source-of-truth. Also ensures stock deduction happens before invoice creation.

### AD-2: Invoice creation is triggered by Sales Order confirmation, not order placement
**Decision:** Books invoice is created when Inventory Sales Order status = Confirmed (stock allocated, not just received).
**Rationale:** P4 (system-enforced gates) — An invoice should not exist for an order that can't be fulfilled. Confirmed state ensures stock was available and allocated before financial commitment is recorded.

### AD-3: Payment reconciliation is at settlement level
**Decision:** Books payment receipts are matched to marketplace settlement files, not to individual order payments.
**Rationale:** Marketplaces (Amazon, Flipkart) aggregate payments across orders and deduct fees before remitting. Attempting per-order payment recording creates phantom reconciliation that doesn't match actual bank deposits. Settlement-level matching reflects real cash flow.

### AD-4: Returns use Credit Notes — never invoice reversal or deletion
**Decision:** All returns create a Credit Note in Books against the original invoice. Original invoice is never modified or deleted.
**Rationale:** GST audit trail requirement. Credit Notes are the legally correct instrument for reversing supply. Deleting or modifying invoices violates Books audit integrity and creates GSTR-1 reconciliation problems.

---

## Standard Fields for Sales Order (Inventory)

| Field Name | API Name | Criterion # | Tier | Justification |
|---|---|---|---|---|
| Channel Name | channel_name | 9 (Routing) | 2 | Determines fulfillment warehouse + carrier; required for settlement matching |
| Fulfillment Model | fulfillment_model | 9 (Routing) | 2 | Determines whether Inventory or marketplace handles physical shipment |
| Marketplace Order ID | marketplace_order_id | 8 (System infrastructure) | 2 | Required for settlement matching and return linking |
| Warehouse | warehouse_id | 1 (Automation trigger) | 1 | Triggers correct stock allocation; prevents oversell |

---

## Standard Flow Structure

**Flow: Channel Order → Inventory → Books**
1. Trigger: New Sales Order created in Inventory (webhook from channel connector)
2. Step: Inventory — Confirm Sales Order (validate stock availability)
3. Step: Inventory — Allocate stock from channel-appropriate warehouse
4. Condition: If Fulfillment Model = FBA or FBF → skip shipping step (marketplace handles)
5. Condition: If Fulfillment Model = Self-ship or Easy Ship → generate packing slip + carrier label
6. Step: Books — Create Invoice from Sales Order (auto-link; GST auto-calculated)
7. Step (conditional): If e-invoice enabled → generate IRN via NIC API
8. Error branch: If Books invoice creation fails → Cliq alert to ops-alerts; hold shipment

**Flow: Return → Credit Note**
1. Trigger: Return received in Inventory (stock receipt from return)
2. Step: Inventory — Create Return Receipt; update stock (sellable or damaged reason code)
3. Step: Books — Create Credit Note against original invoice
4. Condition: If original order customer exists in CRM → update LTV/return count via Sync Field Test
5. Error branch: If original invoice not found → Cliq alert; manual review required

---

## Observability Requirements
- Weekly: Review Inventory → Books sync failures (orders where SO confirmed but invoice not created)
- Weekly: Review unmatched marketplace settlements (settlements received but no matching Books payment)
- Monthly: Reconcile GSTR-1 output from Books against marketplace settlement data
- Alert: Any SO → Invoice flow failure must trigger Cliq notification within 1 hour

---

## What This Pattern Does NOT Cover
- Advertising cost reconciliation (treated separately as vendor bill)
- FBA inventory valuation in Books (separate periodic reconciliation process)
- B2B invoice model (Myntra/Nykaa vendor relationship) — different from B2C order flow
- Prepaid vs COD payment timing differences (handled in payment reconciliation workflow)

---

## Test Cases
1. New Amazon order → Inventory SO created → Books invoice created with correct GST
2. Self-ship order → packing slip + carrier label generated → tracking number written back to channel
3. Customer return → stock received in Inventory → Credit Note created in Books → original invoice not modified
4. RTO (undelivered) → stock received → no Credit Note created (customer was not charged)
5. Settlement file received → matched against outstanding Books invoices at settlement level