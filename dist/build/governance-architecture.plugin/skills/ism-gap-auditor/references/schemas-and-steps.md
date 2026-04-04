# ISM Gap Auditor — Schemas, Steps, and MCP Patterns

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "audit_scope": {
      "type": "string",
      "enum": ["full", "function", "system", "sprint_retro"],
      "description": "Scope of gap audit. If not provided, ask once."
    },
    "focus_area": {
      "type": "string",
      "description": "Optional narrowing — e.g., 'vendor pipeline', 'product launch', 'alerts'"
    }
  },
  "required": ["audit_scope"]
}
```

## Output Schema (GapRecord[])

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "gap_id": { "type": "string", "description": "GA-NNN sequential ID" },
      "gap_type": {
        "type": "string",
        "enum": [
          "missing_pipeline", "missing_automation", "missing_tracking",
          "missing_documentation", "missing_artifact", "broken_handoff",
          "stale_process", "missing_alert", "missing_gate"
        ]
      },
      "title": { "type": "string", "description": "One-line gap summary" },
      "description": { "type": "string", "description": "What's missing and why it matters" },
      "evidence": { "type": "string", "description": "MCP query result or expected-state mismatch that proves the gap" },
      "system": { "type": "string", "description": "Affected system (Bigin, Jira, Confluence, Slack, CRM)" },
      "impact": { "type": "integer", "minimum": 1, "maximum": 3, "description": "1=low, 2=medium, 3=high" },
      "urgency": { "type": "integer", "minimum": 1, "maximum": 3, "description": "1=later, 2=soon, 3=now" },
      "effort": { "type": "integer", "minimum": 1, "maximum": 10, "description": "1=quick, 5=medium, 10=deep" },
      "priority_score": { "type": "number", "description": "impact*3 + urgency*2 + (10-effort)" },
      "handoff_skill": { "type": "string", "description": "Skill that owns the fix per gap-types.md" },
      "jira_ticket": { "type": "string", "description": "ISK-NNN if created (score >= 15), null otherwise" },
      "status": { "type": "string", "enum": ["open", "ticketed", "acknowledged"] }
    },
    "required": ["gap_id", "gap_type", "title", "description", "evidence", "system", "impact", "urgency", "effort", "priority_score", "handoff_skill", "status"]
  }
}
```

---

## MCP Call Patterns

### Bigin — Pipeline State
```
Bigin_getModules()          → list all pipelines
Bigin_getRecords(module)    → records per pipeline, check stage distribution
Bigin_getFields(module)     → field definitions, check for empty required fields
```

### Jira — Issue State
```
Jira_SearchIssues(jql="project = ISK ORDER BY created DESC", maxResults=50)
Jira_SearchIssues(jql="project = ISK AND labels = claude-task")
```

### Confluence — Documentation State
```
Confluence_SearchContent(query="space = iscom", limit=50)
Confluence_GetPage(pageId)  → check modifiedTime for staleness
```

### Slack — Alert Coverage
```
Slack_ListChannels()        → verify expected channels exist
Slack_GetChannelHistory(channel="#ismo-gen-alerts", limit=20)
```

### CRM — Custom Module State
```
ZohoCRM_Get_Records(module="Vendors", page=1, per_page=50)
ZohoCRM_Get_Records(module="ISM_Objectives")
ZohoCRM_Get_Records(module="ISM_KPIs")
```

---

## Priority Scoring

```
priority_score = impact * 3 + urgency * 2 + (10 - effort)
```

| Rating | Impact (×3) | Urgency (×2) | Effort (10−x) |
|---|---|---|---|
| high/now/quick | 3 → 9 | 3 → 6 | 1 → 9 |
| medium/soon/medium | 2 → 6 | 2 → 4 | 5 → 5 |
| low/later/deep | 1 → 3 | 1 → 2 | 10 → 0 |

**Maximum possible:** 9 + 6 + 9 = 24
**Jira ticket threshold:** score >= 15

Sort gaps descending by priority_score. Ties broken by impact (high > medium > low).

---

## Jira Ticket Template (score >= 15)

```
Project: ISK
Issue Type: Task
Summary: [GA-NNN] {gap_title}
Description:
  Gap Type: {gap_type}
  Evidence: {evidence}
  Priority Score: {priority_score}
  Handoff: {handoff_skill}
Labels: claude-task, gap-audit
```

---

## Slack Notification Template

Post top-3 gaps to `#ismo-gen-alerts`:

```
Gap Audit Complete — {audit_scope} scope
Top gaps:
1. [GA-NNN] {title} (score: {priority_score}, type: {gap_type})
2. [GA-NNN] {title} (score: {priority_score}, type: {gap_type})
3. [GA-NNN] {title} (score: {priority_score}, type: {gap_type})
Full report: {confluence_page_url}
```

---

## Confluence Report Template

Page in `iscom` space. Title: `Gap Audit — {date} — {audit_scope}`.

Sections:
1. Audit Summary (scope, systems queried, total gaps found)
2. Gap Table (all GapRecords sorted by priority_score)
3. Jira Tickets Created (linked)
4. Systems Not Queried / Limitations
