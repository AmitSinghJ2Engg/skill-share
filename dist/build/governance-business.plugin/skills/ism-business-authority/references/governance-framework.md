# Ismokraft Governance Framework

**Version:** 1.0
**Scope:** Artifact lifecycle, approval process, distribution, issue management.
**Authority:** Owned by `ism-business-authority`.

---

## Artifact Lifecycle

Every artifact moves through exactly these states. No exceptions.

```
  DRAFT --> REVIEW --> PROD --> RETIRED
    |          |                    ^
    |          v                    |
    |       REJECTED --> DRAFT     |
    |                              |
    +-------- (never deployed) ----+
```

| State | Meaning |
|---|---|
| **Draft** | Under development. Not for team use. |
| **Review** | Functionally complete. Awaiting GO FEARLESS check + approval. |
| **Prod** | Approved. Listed in Central Directory (Confluence). |
| **Rejected** | Failed review. Returns to Draft with feedback. |
| **Retired** | Replaced or decommissioned. Removed from directory. |

### State Transitions

| From | To | Trigger | Who |
|---|---|---|---|
| Draft -> Review | Builder marks ready + GO FEARLESS check | Builder |
| Review -> Prod | Approver signs off | Approver (Amit or delegated lead) |
| Review -> Rejected | Approver finds gaps | Approver |
| Rejected -> Draft | Builder addresses feedback | Builder |
| Prod -> Retired | New version replaces it OR decommissioned | Approver |
| Prod -> Draft | Critical bug, pulled for fix | Approver |

---

## Approval — RBAC

| Role | Scope | Person |
|---|---|---|
| **Primary Approver** | All artifacts, all domains | Amit |
| **Delegated Lead** | Artifacts within their domain only | Assigned per domain (TBD) |

Rules:
- Amit explicitly assigns delegation per domain
- Delegated leads cannot approve their own builds
- Amit retains override authority

---

## Approval Checklist

```
FUNCTIONALITY
  [] Does what it claims (tested with real/realistic data)
  [] All buttons/actions work
  [] Error states handled

GO FEARLESS (9 qualities from go-fearless.ctx.md)
  [] G Governed    [] O Observable  [] F Feasible
  [] E Enabler     [] A Auditable   [] R Resilient
  [] L Reliable    [] S Secure      [] S Scalable

OPERATOR READINESS
  [] Labels use business language
  [] Error messages tell user what to do
  [] Destructive actions require confirmation

DATA LIFECYCLE
  [] CRM push works (or export fallback)
  [] Drive export produces valid JSON

DECISION: APPROVED / REJECTED + feedback
```

---

## Distribution

1. Approved artifact uploaded to shared location (Confluence or shared Claude project)
2. Central Directory (Confluence) updated with: name, version, link, roles, quick-start, owner
3. Team notified via Slack `#ism-launch-alerts`

### Distribution RBAC

| Principle | Implementation |
|---|---|
| Right artifacts to right roles | Directory lists which roles each artifact serves |
| No within-artifact permission enforcement | Access control = who gets the link |
| Prevent unauthorized modification | SOP: "Do not modify prod artifacts. File a change request." |

---

## Issue Management

| Urgency | Channel |
|---|---|
| **Urgent** (broken, data loss, blocking) | Slack `#ism-artifact-issues` — owner acknowledges within 4hr |
| **Non-urgent** (feature, minor bug) | Jira ticket — label: `artifact`, component: [artifact name] |

---

## Governance Cadence

| Cadence | Activity |
|---|---|
| Per release | GO FEARLESS check + approval |
| Weekly | Review open artifact issues in Jira |
| Monthly | Audit Central Directory for stale entries |
| Quarterly | Full skill + artifact ecosystem audit |
