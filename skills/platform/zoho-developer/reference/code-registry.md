# Ismokraft Code Registry

**Purpose**: Authoritative list of all custom code running in the Ismokraft Zoho stack.
Every function, Creator app, and Widget must be registered here before going live.

**ID format**:
- `ISM-FN-[NNN]` — Deluge custom functions
- `ISM-CR-[NNN]` — Zoho Creator apps
- `ISM-WG-[NNN]` — Widgets and Client Scripts
- `ISM-FL-[NNN]` — Zoho Flows (where custom logic exists)

**Status values**: Draft | Active | Deprecated | Deleted

---

## Deluge Custom Functions

| ID | Name | App | Trigger | Status | Version | Last Modified | Notes |
|---|---|---|---|---|---|---|---|
| ISM-FN-000 | sendAlert Utility | CRM | Called by other functions | Active | 1.0 | 2026-03 | Shared alert utility — all functions should call this |
| ISM-FN-001 | Activity-to-Jira Bridge | Bigin | Zoho Flow (Flow 14) | Active | 1.1 | 2026-03 | ISM-P001 implementation; routes Bigin Activity → Jira ticket |

---

## Zoho Creator Apps

| ID | Name | Purpose | Status | Version | Last Modified | Notes |
|---|---|---|---|---|---|---|
| *(none yet)* | | | | | | |

---

## Widgets & Client Scripts

| ID | Name | App | Location | Status | Version | Last Modified | Notes |
|---|---|---|---|---|---|---|---|
| *(none yet)* | | | | | | |

---

## Zoho Flows (with custom logic)

| ID | Flow Name | Trigger App | Trigger Event | Status | Last Modified | Notes |
|---|---|---|---|---|---|---|
| ISM-FL-014 | Activity-to-Jira Bridge | Bigin | Activity created/updated | Active | 2026-03 | Calls ISM-FN-001 |

---

## Registry Maintenance Rules

1. **Before going live**: Add a Draft entry to the registry
2. **On deploy**: Change status to Active; set version to 1.0
3. **On modify**: Increment version; update Last Modified; add note describing change
4. **On deprecate**: Change status to Deprecated; note what replaced it
5. **Never delete rows** from this registry — deprecated entries stay for audit history
6. **ID assignment**: Use next available number in each series; never reuse a deleted ID