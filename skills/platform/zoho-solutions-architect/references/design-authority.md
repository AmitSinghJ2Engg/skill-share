# Ismokraft System Design Authority
**Version:** 2.0 | Applies to: All Zoho ecosystem processes
**Source:** https://ismokraft.atlassian.net/wiki/spaces/iscom/pages/581795841

---

## How Layers Work

Work through layers in order. A decision passing Layer 1 but failing Layer 3 is rejected -- all layers apply.
**Conflict rule:** Layer 3 (Data Flow) supersedes Layer 2 (Field Existence). A field creating data integrity problems is worse than a missing field. Otherwise lower-numbered layers take precedence.

---

## Layer 1 -- Principles (P1-P10)

| # | Principle | Rule |
|---|---|---|
| P1 | Minimum inputs, maximum utility | Every field, step, and automation must earn its place -- by enabling a decision, driving an automation, or maintaining system integrity. Comprehensiveness without utility is waste. |
| P2 | Each system has one job | CRM = strategic layer (decisions, approvals, financial records). Bigin = execution layer (pipelines, daily work). Jira = task execution only. Inventory/Books = transactional. |
| P3 | Data enters once, at source | No manual copying what another system holds. Automation moves data. Manual transcription is a design failure unless explicitly justified. |
| P4 | Gates are system-enforced | If a criterion matters, the system enforces it. Unenforced criteria are guidelines, not gates. |
| P5 | Correct path is easier than incorrect | If shortcuts or workarounds exist -- close by design. Non-compliance is a design signal, not a training problem. |
| P6 | Track what changes a decision | Not everything that changes. Only data that, if different, would produce a different decision belongs in the system. |
| P7 | Friction is intentional or it is a defect | Deliberate friction enforces quality. All other friction is waste. Distinguish before adding or removing. |
| P8 | Design for expected scale | A process that breaks under growth is a deferred problem. Stress-test every design decision against realistic scale. |
| P9 | Constraints are forcing functions | Work within hard limits. Designing around constraints produces bloat. |
| P10 | Exceptions permitted; unrecorded exceptions are not | Every exception is recorded, attributed, and visible. An unrecorded exception silently becomes the new standard. |

---

## Layer 2 -- Field Existence Rules

**Every field must satisfy at least one of these 12 criteria.**

### Tier 1 -- Operational

| # | Criterion | A field exists if... |
|---|---|---|
| 1 | Automation trigger | Its value triggers a sync, stage advance, or task creation |
| 2 | Decision formula input | It feeds a calculated metric used at an approval point |
| 3 | Review metric | It is assessed in a recurring operational or portfolio review |
| 4 | Margin / cost visibility | It directly determines a unit-level financial output |
| 5 | Accountability record | It records who decided what and when, permanently |
| 6 | Role handoff signal | It communicates inherited state to the next role without ambiguity |
| 7 | Exception documentation | It records a deliberate departure from standard rules |

### Tier 2 -- Structural / Analytical

| # | Criterion | A field exists if... |
|---|---|---|
| 8 | System infrastructure | Maintains a record link across systems -- automation only, never manual |
| 9 | Segmentation / routing | Determines which pipeline, team, view, or cohort a record belongs to |
| 10 | Structural relationship | Links this record to a related record in another module |
| 11 | Process health | Tracks time, SLA state, or stage duration -- only where platform doesn't provide natively |
| 12 | Attribution | Records origin/source for cohort-level analysis |

**If no criterion is satisfied -> field does not exist in any system.**

**Tier 2 additional check:** Confirm no lighter alternative exists -- a report, view filter, Jira label, or native feature -- before creating a Tier 2 field.

---

## System Assignment

| Assign to | When |
|---|---|
| **Bigin** | Execution team is primary producer. Triggers sync/stage validation. Needed for stage enforcement. Formula for stage-level validation (see Layer 3 exception). |
| **CRM** | PM or approver is primary producer. Calculated formula for gate decisions. Approval, decision, or post-process tracking. |
| **Jira description** | Context only. Attachment reference. Needed for task but feeds nothing upstream. |
| **Inventory / Books** | Transactional and stock records -- SKU config, pricing rules, invoice templates. Receives data from CRM/Bigin via Flow. Not duplicated in CRM/Bigin. |
| **Remove** | Nothing reads it. Duplicated elsewhere with no additional value. |

---

## Bigin Field Budget Sequence

Before adding any field to Bigin, apply in order and stop at first applicable step:
1. Satisfies at least one criterion? No -> remove entirely
2. Belongs in CRM? Yes -> move to CRM
3. Belongs in Jira? Yes -> move to Jira
4. Belongs in Inventory/Books? Yes -> move there
5. Replaces a redundant existing Bigin field? Yes -> swap, net zero
6. Draws from buffer? Yes -> follow Buffer Rule (Layer 6). Buffer count -1.
7. Buffer at zero? An existing field must be removed first. No exceptions.

---

## Layer 3 -- Data Flow Rules

### Entry Point Determination (resolve before designing any flow)

**The data entry point is not fixed to Bigin or CRM -- it is determined by who is the primary producer for this process.**

| Primary Producer | Entry Point | Design Approach |
|---|---|---|
| Execution team (ops, sourcing, supplier mgmt) | **Bigin** | Pipeline stage + Activities -> ISM-P001 chain -> Zoho Flow syncs relevant fields up to CRM |
| PM / approver / strategic role | **CRM** | CRM Blueprint for guided entry -> validation rules -> Zoho Flow pushes execution record to Bigin when execution team work begins |
| Mixed / handoff (e.g. PM qualifies, team executes) | **CRM first, Bigin second** | PM creates + qualifies in CRM via Blueprint; Flow creates Bigin record at handoff trigger; ISM-P001 applies from Bigin onwards |

**Entry point must be stated explicitly in every HLD and Tech Spec.**

**CRM-entry design requirements** (applies whenever CRM is the entry point):
- Use **Zoho CRM Blueprint** to enforce sequential data entry stages with per-transition mandatory fields
- Every Blueprint transition is a gate: define which fields are required before the transition is permitted
- Validation rules enforce quantitative thresholds at the field level (Layer 4 applies)
- When execution work is triggered, a Zoho Flow creates the corresponding Bigin record

---

- **Flow is directional.** Define direction at design time. Bidirectional sync only where minimum necessary.
- **Single source of truth per field.** One system owns each field. When sync fails, producing system is authoritative.
- **Bidirectional sync conflict rule.** Define tiebreaker at design time. Default: most recent timestamp wins.
- **Syncs are event-driven, not scheduled.** No scheduled syncs permitted.

### Sync Field Test (all three; first "yes" is sufficient)
1. Direct input to a formula producing a gate decision metric in CRM? -> Sync required
2. Approver needs it in CRM to decide without opening source system? -> Sync required
3. Pre-condition for a CRM validation rule? -> Sync required

If all three are no -> field stays in source system. Does not appear in CRM.

### Formula Field Placement
- Formula fields belong in CRM by default (stable, auditable, multi-source).
- **Exception:** Formula may exist in Bigin when required for stage completion validation. CRM is authoritative.

### Manual Bridge Tolerance
- **Numeric and URL fields:** Zero manual bridges permitted.
- **Judgment and approval fields:** Manual entry is correct. Must be blocking.
- **Context and narrative:** Lives in Jira task descriptions. Never enters CRM or Bigin.

### Cascade Failure Recovery
Every cascading Flow must have its execution log monitored weekly minimum.

---

## Layer 4 -- Approval and Gate Design Rules

### Gate Anatomy (every approval point must have exactly these components)

| Component | Type | Rule |
|---|---|---|
| Decision field | Dropdown | Options are specific and exhaustive. No "Other." |
| Decided By | User lookup | Auto-populated from logged-in user on save. Not editable. |
| Decision Date | Date/Time | Auto-populated on save. Not editable. |
| Notes | Multi-line text | Minimum character count enforced on all decisions including approval |
| Quantitative criteria | Validation rules | Present only where numeric thresholds apply |

- **Quantitative criteria** = validation rules that physically prevent saving when thresholds unmet.
- **Qualitative criteria** = enforced by requiring Notes minimum character count.
- **Pre-conditions** = completeness thresholds. System-enforced, no override.
- **Criteria** = performance thresholds. Can be overridden with documented justification (150-char minimum).
- **Decisions are permanent.** Never edited or deleted.
- **Decisions cascade automatically.**

---

## Layer 5 -- Role and Access Rules

- Each role has a primary system. Other systems = read-only except at designed handoff/approval points.
- One entry, one owner per field.
- Every approval role must have a documented delegate before process goes live.

---

## Layer 6 -- Governance Rules

### Change Classification

| Class | Definition | Approver | Lead time |
|---|---|---|---|
| **A -- Structural** | Gate criteria, sync flow, field removal, stage add/remove, threshold change | PM + sys admin | 2 weeks |
| **B -- Additive** | New field (buffer), new CRM section, new Zoho Flow, new Jira template | PM | 1 week |
| **C -- Operational** | Label change, view filter, dropdown option, access change | Sys admin | Immediate + logged |

### Emergency Change Process
1. Sys admin documents: what's broken, affected records, fix
2. PM approves
3. Fix implemented immediately
4. Full Class A change record completed within 5 working days

### Buffer Rule
Buffer = reserved for genuine post-launch operational needs only.
Consuming buffer requires: written description, Layer 2 criterion, confirmation no repurpose possible, PM approval.

### Non-Compliance Response
Repeated non-compliance = design signal. Apply Layer 2 and 3 tests. Determine: productive friction (enforce harder) vs unproductive friction (redesign/remove).
