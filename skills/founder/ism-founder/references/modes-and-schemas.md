# ISM Founder — Modes, Schemas & Confluence Registry

Detailed output structures and schemas for all seven modes of ism-founder.
Read on demand from SKILL.md session protocol.

---

## Track Context

**Dual-purpose pattern (codified 2026-03-17):** The AI OS Infrastructure epic [T1-AOS] is simultaneously T1 infrastructure and T2 R&D. Any ticket tagged `claude-task` or `skill-infrastructure` is dual-purpose — treat as investment in both tracks. Call this out explicitly in reporting.

**T2 hypotheses (active — none killed):**
- T2-H1: One dashboard for Indian online sellers (Vertical SaaS)
- T2-H2: Terraform/HashiCorp for skills & agents (Infra / dev tools)
- T2-H3: Specialized domain apps (Platform → vertical apps)

ISM is a reference customer, not the T2 prototype.

**Atlassian constraints:**
- Goals API (`home.atlassian.com`) not accessible via MCP scopes — operator maintains Goals manually
- Jira Agile API (sprint creation/assignment) requires `write:board-scope:jira-software` not in MCP — operator creates sprints manually

---

## COMPASS Output Structure

```
COMPASS — {date}

TRACK 1 (Ecommerce): {one-line status}
  Stage: {current stage in launch pipeline}
  Blocker: {top blocker or "none"}
  Next action: {specific, actionable}

TRACK 2 (SaaS Product): {one-line status}
  Stage: {current stage in product lifecycle}
  Blocker: {top blocker or "none"}
  Next action: {specific, actionable}

CROSS-TRACK: {any dependency or conflict, or "clear"}

RECOMMENDATION: Work on {Track X} — {why} — {specific task}
```

---

## STRATEGY Output — DecisionRecord

```json
{
  "decision_id": "FO-DEC-{NNN}",
  "date": "YYYY-MM-DD",
  "track": "T1 | T2 | BOTH",
  "question": "...",
  "options_considered": [
    { "option": "...", "pros": ["..."], "cons": ["..."] }
  ],
  "recommendation": "...",
  "reasoning": "...",
  "evidence_sources": ["MI-001", "ism-business-authority", "operator input"],
  "status": "proposed | accepted | rejected | noted",
  "next_action": "..."
}
```

**Status definitions:**
- `proposed` — recommendation made, awaiting operator confirmation
- `accepted` — operator confirmed, in effect
- `rejected` — operator rejected, not proceeding
- `noted` — strategic signal captured for future reference; too early to decide

---

## EXECUTE Output

```
EXECUTION PLAN — {task description}

Step 1: {skill-name} — {what it does} — {input it needs}
Step 2: {skill-name} — {what it does} — {depends on step 1 output}
...

Ready to execute? [confirm to proceed]
```

**Jira ticket routing:**

| Ticket type | Project | Who executes | Sprint? |
|---|---|---|---|
| `claude-task` | Task Moderator (TM) | Claude autonomously | No |
| Manual work | ISK — Ismo Scrum (backlog) | Team | Yes |

---

## ALLOCATE Output — AllocationRecord

```json
{
  "allocation_id": "FO-ALC-{NNN}",
  "date": "YYYY-MM-DD",
  "inputs": {
    "hours_per_week": null,
    "monthly_capital": null,
    "runway_months": null
  },
  "t1_allocation": {
    "hours_pct": null,
    "capital_pct": null,
    "rationale": "..."
  },
  "t2_allocation": {
    "hours_pct": null,
    "capital_pct": null,
    "rationale": "..."
  },
  "guardrails": ["..."],
  "review_trigger": "..."
}
```

---

## TRACK Output — MilestoneReport

```
FOUNDER REVIEW — {date}

TRACK 1 MILESTONES:
  [x] {completed milestone} — {date}
  [→] {in progress} — {expected date}
  [ ] {upcoming} — {target date}

TRACK 2 MILESTONES:
  [x] {completed milestone} — {date}
  [→] {in progress} — {expected date}
  [ ] {upcoming} — {target date}

VELOCITY: {milestones completed this month} / {planned}
AT RISK: {list any milestones behind schedule}
```

---

## SYNC — Confluence Page Registry

```yaml
confluence_pages:
  cloudId: "7c0aaf74-d99e-441b-a2c3-8ff528ee6a14"
  live_state:
    pageId: "587661313"
    title: "Founder OS — Live State"
    url: "https://ismokraft.atlassian.net/wiki/spaces/iscom/pages/587661313"
  changelog:
    pageId: "587857922"
    title: "Founder OS — Changelog"
    url: "https://ismokraft.atlassian.net/wiki/spaces/iscom/pages/587857922"
  business_decisions:
    pageId: "587988993"
    title: "Founder OS — Business Decisions"
    url: "https://ismokraft.atlassian.net/wiki/spaces/iscom/pages/587988993"
```

**SYNC trigger → update rules:**

| Trigger | Live State | Changelog | Business Decisions |
|---|---|---|---|
| COMPASS run | Update Compass + timestamp | Yes | No |
| STRATEGY accepted | Update Recent Decisions | Yes | Yes — full DecisionRecord |
| STRATEGY rejected | No change | Yes | Yes — with rejected status |
| TRACK review | Update Milestone Tracker | Yes | No |
| ALLOCATE confirmed | Update Active Allocation | Yes | No |
| PRODUCT stage change | Update T2 stage | Yes | No |

**SYNC rules:**
- Read current page before updating (`getConfluencePage`)
- Never overwrite entire page — update relevant sections only
- Changelog entries appended (newest at top) — never replaced
- Business Decisions entries appended — never replaced
- `last_updated` timestamp set on every update
- Changelog format: `### [DATE] — [MODE] — [BRIEF SUMMARY]`
- If API fails, log failure and notify operator — do not skip silently

---

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "enum": ["COMPASS", "STRATEGY", "PRODUCT", "EXECUTE", "ALLOCATE", "TRACK", "SYNC"]
    },
    "track": {
      "type": "string",
      "enum": ["T1", "T2", "BOTH"],
      "description": "Which track. Inferred if not stated."
    },
    "context": {
      "type": "string",
      "description": "Operator's question, decision, or request."
    },
    "product_stage": {
      "type": "string",
      "enum": ["IDEATE", "VALIDATE", "SCOPE", "PLAN", "BUILD", "BETA", "LAUNCH"],
      "description": "For PRODUCT mode — current T2 lifecycle stage."
    }
  },
  "required": ["context"]
}
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "mode": { "type": "string" },
    "track": { "type": "string" },
    "output_type": {
      "type": "string",
      "enum": ["CompassReport", "DecisionRecord", "ProductOutput", "ExecutionPlan", "AllocationRecord", "MilestoneReport", "SyncResult"]
    },
    "content": { "type": "object" },
    "next_action": { "type": "string" },
    "skills_invoked": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["mode", "output_type", "content"]
}
```