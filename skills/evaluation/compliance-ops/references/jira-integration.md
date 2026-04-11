# Jira Integration — INITIATION Mode (planned stub)

**Status:** Automation exists currently per Amit's DL-024 audit Q3 answer, **but may need testing**. This file documents the flow so that when INITIATION mode gets wired up, the skill knows how Jira tickets actually get created.

**Not called from TIMELINE_CHECK.** TIMELINE_CHECK reads existing ComplianceRecord (and its Jira ticket IDs) from CRM — it doesn't create new Jira tickets. This file is for the planned INITIATION mode.

---

## Flow Diagram

```
compliance-ops INITIATION mode (planned)
    ↓
    writes ComplianceRecord with cert list to CRM Product_Launches
    (via zoho-data-ops, task orchestrator handles the write)
    ↓
    updates CRM stage field to a value that triggers Bigin sync
    ↓
Zoho CRM → Zoho Bigin (automatic stage-based sync, already configured)
    ↓
    Bigin task activity is created per certification
    ↓
Bigin → Jira (on-stage automation)
    ↓
    Jira "ismo scrum" board ticket created per certification
    ↓
    Jira ticket ID propagates back to CRM (via Bigin sync) → ComplianceRecord.jira_ticket_id
```

The skill **does not call Jira directly** — no Jira MCP is in the `.mcp.json` configuration, and direct Jira API calls would bypass the CRM state of record. All Jira interactions go through the Bigin→Jira automation.

---

## Prerequisites (to verify before INITIATION goes live)

Per Amit's answer, "The automation exists currently or may need testing." When building INITIATION, verify:

1. **Zoho CRM → Bigin sync is configured** for Product_Launches records with compliance stage transitions. Check Zoho CRM workflow rules for the trigger.
2. **Bigin task → Jira ticket creation** fires on the right stage. Check Bigin automation rules.
3. **Jira "ismo scrum" board** exists and accepts tickets from Bigin.
4. **Ticket ID round-trip works** — a ticket created via the flow has its Jira ID visible in the CRM record within a reasonable latency (minutes, not hours).
5. **Failure mode handling** — what happens if the automation doesn't fire or Jira is down? Is there a retry? A Slack alert?

None of these are documented today. The first time INITIATION runs in production, these need to be explicitly tested.

---

## Fallback if Automation Fails

If INITIATION mode runs and the Jira automation is unresponsive or fails to return ticket IDs within a reasonable window:

- Return `ComplianceRecord` with `jira_ticket_id: null` per cert
- Add `"Jira automation unresponsive — create tickets manually on ismo scrum board"` to `gaps[]`
- Do NOT block the ComplianceRecord creation — the record is still valid without Jira IDs; they can be added later
- Do NOT fabricate ticket IDs

---

## Alternative: Direct Jira MCP (not recommended)

If the CRM-Bigin-Jira automation proves too unreliable, a future alternative is a direct Jira MCP integration. That would require:

- New MCP server: Atlassian Jira MCP (exists in the broader Claude ecosystem — see `claude_ai_Atlassian` in available deferred tools, or Docker MCP Atlassian)
- New `.mcp.json` entry for Jira
- Refactor INITIATION to call Jira directly instead of relying on the automation
- Lose the CRM-Bigin state synchronization (would need to re-add it)

**This is not the current design.** Stick with the CRM→Bigin→Jira flow until it's proven broken in production. Bypassing the automation would create dual sources of truth (CRM view vs direct Jira view) which is a DL-013/018 violation.

---

## Changelog

- **2026-04-12:** Created as part of DL-024 compliance-ops audit (CO13). Documents the existing-but-unverified automation flow per Amit's Q3 answer. When INITIATION mode is built and wired to a consumer task, this document should be revised with verified flow details.
