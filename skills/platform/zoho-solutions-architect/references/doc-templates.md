# Documentation Templates

---

## Metadata Block (use at top of every document)

```
| Field | Value |
|---|---|
| Document Title | [Title] |
| Author | Claude - Zoho Solutions Architect |
| Date | [Date] |
| Version | 1.0 (Draft) |
| Status | Draft / In Review / Approved |
| Affected Apps | [List of Zoho apps] |
| Reviewed By | [Name] |
```

---

## HLD Template — High Level Design

> Use when: Cross-app integration, new feature/module, or stakeholder sign-off needed.

```markdown
# [Feature/Solution Name] — High Level Design

## 1. Problem Statement
[1-3 sentences describing the business problem. What is broken, missing, or inefficient today?]

## 2. Goals
- [Goal 1]
- [Goal 2]

## 3. Out of Scope
- [What this solution does NOT cover]

## 4. Solution Overview
[2-4 paragraph narrative describing the solution at a conceptual level. No technical details.]

## 5. App Interaction Diagram
[Describe the data flow between apps. Use ASCII or text diagram.]

Example:
Bigin (Deal Won) → Zoho Flow → Books (Create Invoice) → Inventory (Reserve Stock)

## 6. Key Design Decisions
| Decision | Option Chosen | Reason |
|---|---|---|
| Orchestration layer | Zoho Flow | Loosely coupled, no-code, auditable |
| ... | ... | ... |

## 7. Architecture Principles Applied
- **Scalability**: [How]
- **Loose Coupling**: [How]
- **Auditability**: [How]
- **Observability**: [How]

## 8. Assumptions
- [Assumption 1]

## 9. Risks & Mitigations
| Risk | Likelihood | Mitigation |
|---|---|---|
| ... | Low/Med/High | ... |

## 10. Open Questions
- [ ] [Question needing answer before implementation]
```

---

## LLD Template — Low Level Design

> Use when: The solution has complex logic, data transformations, or multiple modules.

```markdown
# [Feature/Solution Name] — Low Level Design

## 1. Module / Field Mapping
| Source App | Source Field (API Name) | Target App | Target Field (API Name) | Transform |
|---|---|---|---|---|
| Bigin | deal_name | Books | customer_name | Direct copy |
| ... | ... | ... | ... | ... |

## 2. Trigger Conditions
| Trigger | App | Event | Conditions |
|---|---|---|---|
| Deal Won | Bigin | Stage = "Won" | Deal value > 0 |

## 3. Process Flow (Detailed)
[Step-by-step logic with conditions and branches]

Step 1: [Trigger fires]
  → Check: [Condition]
    → If TRUE: [Action A]
    → If FALSE: [Action B / Log error]

## 4. Error States
| Error | Cause | Handling |
|---|---|---|
| Record not found | Deleted record | Log + alert to ops-channel |
| API timeout | Rate limit hit | Retry 3x with 5s delay |

## 5. Data Validation Rules
- [Field X must not be null before creating Books record]
- [Amount must be > 0]

## 6. API Endpoints Used (if applicable)
| App | Endpoint | Method | Purpose |
|---|---|---|---|
| Books | /invoices | POST | Create invoice |

## 7. Rollback Plan
[What to do if something goes wrong mid-implementation]
```

---

## Tech Spec Template

> Use when: Automation, Deluge script, or Flow configuration needs to be built.

```markdown
# [Feature/Solution Name] — Tech Spec

## 1. Overview
[One paragraph: what is being built, why, and which app(s) it lives in]

## 2. Trigger
- **App**: [Zoho App]
- **Module**: [Module name]
- **Event**: [Record Created / Field Updated / Scheduled / Webhook]
- **Conditions**: [Any filter conditions]

## 3. Implementation Type
- [ ] Zoho Flow
- [ ] Workflow + Function (Deluge)
- [ ] Blueprint
- [ ] API Integration
- [ ] Configuration only

## 4. Logic / Script

### Plain English Description
[Describe in plain English what the logic does, step by step]

### Deluge Script (if applicable)
```deluge
// Purpose: 
// Trigger: 
// Author: Claude - Zoho Solutions Architect Skill
// Version: 1.0

[script here]
```

### Line-by-Line Explanation
| Line(s) | What it does |
|---|---|
| 1-3 | Header comments |
| 5 | Fetch the lead record by ID |

## 5. Connections / Credentials Required
- [Zoho Books OAuth Connection — scope: ZohoBooks.invoices.CREATE]

## 6. Dependencies
- [This requires the "Deal Won" stage to exist in Bigin pipeline X]

## 7. Go-Live Checklist
- [ ] Tested in sandbox
- [ ] Error handling verified
- [ ] Stakeholder signed off on HLD
- [ ] Rollback plan documented
```

---

## Implementation Notes Template

> Use when: Always — this is the junior team member's guide.

```markdown
# [Feature/Solution Name] — Implementation Notes

## Overview
[2-3 sentences: what you're about to do and why]

**Estimated time**: [X minutes / hours]
**Skill level required**: Beginner / Intermediate / Advanced
**Apps involved**: [List]

---

## Prerequisites
Before starting, confirm:
- [ ] You have Admin access to [App(s)]
- [ ] [Any existing record / config that must exist first]
- [ ] You've read the Tech Spec and understand the expected outcome

---

## Steps

### Step 1: [Short action title]
1. Log in to [App] at [URL]
2. Navigate to **[Menu] → [Submenu] → [Section]**
3. Click **[Button Name]**
4. Fill in the following fields:
   - **Field Name**: [exact value or description]
   - **Field Name**: [exact value or description]
5. Click **Save**

💡 **Tip**: [Helpful shortcut or clarification]
⚠️ **Warning**: [Anything that could go wrong or cause data issues]

### Step 2: [Next action]
[...]

---

## Verification
After completing all steps, verify the implementation worked:

1. [Action to test — e.g., "Create a test Deal in Bigin with Stage = Won"]
2. [Expected result — e.g., "Within 30 seconds, an Invoice should appear in Zoho Books"]
3. [Where to check — e.g., "Go to Books → Invoices → sort by Created Date (newest first)"]

✅ **Pass**: [What success looks like]
❌ **Fail**: [What to do if it doesn't work — who to contact, what to check]

---

## Rollback
If something went wrong:
1. [Step to undo — e.g., "Disable the Flow: Zoho Flow → [Flow Name] → Toggle OFF"]
2. [Any manual cleanup needed]
```

---

## Test Cases Template

> Use when: Financial workflows, critical automations, or anything that touches live customer/order data.

```markdown
# [Feature/Solution Name] — Test Cases

| # | Test Name | Preconditions | Input / Action | Expected Output | Pass/Fail |
|---|---|---|---|---|---|
| 1 | Happy path | [Setup needed] | [What to do] | [What should happen] | |
| 2 | Edge case: [describe] | ... | ... | ... | |
| 3 | Error case: [describe] | ... | ... | Error logged, alert sent | |

## How to Run Tests
1. [Instructions for running in sandbox/test environment]
2. [How to reset test data after]
```