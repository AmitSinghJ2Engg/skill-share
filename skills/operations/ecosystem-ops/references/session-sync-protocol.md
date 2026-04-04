# SESSION-SYNC Protocol

The session intelligence engine. Harvests all signals from a Claude session, classifies them,
presents for operator approval, then distributes each signal to its correct target.

---

## Signal Taxonomy — Complete Registry (20 types)

| Signal Type | What it is | Example | Primary Target |
|---|---|---|---|
| `knowledge_signal` | New factual knowledge | "ISM_SkillHealth is CustomModule20" | Target skill context section |
| `guardrail_signal` | Rule, boundary, or constraint | "Never create Epics for work items" | Target skill rules section |
| `learning_signal` | Skill behaviour that was wrong and corrected | "COMPASS didn't pull Jira before reporting" | Skill patch |
| `pattern_gap_signal` | Recurring pattern not yet in any skill | "T2 ideas surface in any mode" | Skill patch |
| `process_gap_signal` | Workflow step missing or broken | "Sprint must be created before adding tickets" | Skill patch |
| `insight_signal` | Non-obvious business/system observation | "AI OS epic is dual-purpose T1+T2" | Governance synthesis |
| `api_capability_gap` | API or MCP tool missing/out of scope | "Jira Agile API not in write:jira-work scope" | Known constraints |
| `system_constraint` | Hard system limit discovered | "Confluence rate-limits during heavy sessions" | Relevant skill |
| `tool_routing_signal` | Routing rule confirmed or established | "claude-task → TM project, manual → ISK backlog" | Routing tables |
| `operator_preference` | Style, format, or working preference | "Always include ticket description with ID" | Skill rules |
| `context_staleness` | Skill context discovered outdated | "ISK-206 was already done before session" | Skill patch |
| `velocity_signal` | What worked fast vs slow/blocked | "Atlassian tools expire in long sessions" | Planning notes |
| `decision_confirmation` | Operator confirmed a proposed decision | "FO-DEC-001 accepted" | Confluence Decisions |
| `cross_skill_dependency` | Dependency between skills changed | "ecosystem-ops orchestrates ism-founder SYNC" | Governance |
| `guardrail_validation` | Guardrail tested and held or broke | "claude-task label wasn't applied at creation" | Governance audit |
| `founder_goals` | Goals articulated this session | "First 90 days: T1 stable + AI OS running" | ism-founder + Confluence |
| `founder_strategy` | Strategic decisions or directions | "3-phase Jira+Confluence refactor accepted" | DecisionRecord |
| `founder_sync` | State updates for COMPASS | "Sprint 1 started, 3 tickets In Progress" | Confluence Live State |
| `founder_growth` | Growth hypotheses or T2 opportunities | "T2-H2: Terraform for skills and agents" | T2 hypothesis register |
| `founder_authority` | Business rules founder has declared | "Amazon FBA first, Shopify second" | ism-business-authority |
| `founder_clarity` | Previously ambiguous thing now made clear | "TM is the Task Moderator Jira project key" | Target skill + memory |

---

## Step 1: HARVEST

Scan full session conversation from first message to current point.

For each signal type in taxonomy:
- Extract all instances: corrections, confirmations, new facts, decisions, patterns, rules
- Classify by signal type. Note target skill or system.
- Draft signal record:

```
Signal: [type]
Session ref: [approximate message context]
Content: [what was said / decided / corrected]
Target: [skill name or system]
Action: [patch rules | patch context | update Confluence | persist to CRM | write to memory]
Confidence: [high | medium — flag low for operator review]
```

**Harvest threshold:** If Claude improvised, inferred, deviated, or was corrected — that is a signal. If operator confirmed or stated a rule — that is a signal.

---

## Step 2: TRIAGE

Present grouped summary to operator before writing anything:

```
SESSION-SYNC — Harvest complete
Date: [date] | Session length: ~[N] exchanges

PROPOSED WRITES ([N] signals across [N] targets):

SKILL PATCHES ([N]):
  ism-founder v1.2.x → v1.2.y
    [LE-FO-XX] pattern_gap: [description]
    [LE-FO-XX] guardrail_signal: [description]

CONFLUENCE UPDATES ([N]):
  Founder OS — Live State     → [what changes]
  Founder OS — Changelog      → [entry to append]

MEMORY WRITES ([N]):
  [key]: [value]

SKIP (low confidence or not actionable):
  [signal]: [reason]

Approve all? Or review individually?
[approve all] [review one by one] [skip this session]
```

**Rules:**
- Never write before operator approves
- Low-confidence signals always flagged for individual review
- Group by target, not by signal type
- Zero signals → report and close cleanly

---

## Step 3: DISTRIBUTE

Execute approved writes in this order (least risky first):

1. **Memory writes** — `memory_user_edits` (fastest, reversible)
2. **Skill file patches** — via skill patch invocation per skill
3. **File delivery** — present patched skill files for operator
4. **ism-founder SYNC** — push Founder OS Confluence pages
5. **Standalone Confluence** — any pages outside Founder OS
6. **CRM persistence** — for high/medium severity learning records

**ism-founder SYNC call:** Mandatory at session end if any `founder_*` signals present. Also if session touched T1/T2 strategy, Sprint state, or decisions. Updates:
- Founder OS — Live State (page 587661313)
- Founder OS — Changelog (page 587857922)
- Founder OS — Business Decisions (page 587988993)

**Skill patch format:**
```
Skill: [skill_name]
Exception type: [signal_type]
What happened: [description]
Proposed update: [what to change and where in skill]
Target: skill
Target name: [skill_name]
Severity: [low | medium | high]
```

---

## Step 4: CONFIRM

```
SESSION-SYNC — Complete
[timestamp]

WRITTEN:
  [skill_name]   v[old] → v[new]  ([N] learnings)
  Founder OS Live State     updated
  Founder OS Changelog      entry appended

SKIPPED:
  — [signal]: [reason]

MANUAL ACTIONS NEEDED:
  — [anything requiring operator action in external systems]

View Founder OS: https://ismokraft.atlassian.net/wiki/spaces/iscom/pages/587661313
```

---

## Signal Routing Map (Quick Reference)

```
knowledge_signal      → target skill context section
guardrail_signal      → target skill rules section
learning_signal       → skill patch
pattern_gap_signal    → skill patch
process_gap_signal    → skill patch
insight_signal        → governance synthesis
api_capability_gap    → ism-founder known constraints
system_constraint     → relevant skill constraint section
tool_routing_signal   → routing tables
operator_preference   → ism-founder COMPASS rules
context_staleness     → skill patch
velocity_signal       → planning notes
decision_confirmation → Confluence Decisions page
cross_skill_dep       → governance graph
guardrail_validation  → governance audit
founder_goals         → ism-founder + Confluence Live State
founder_strategy      → DecisionRecord + Confluence Decisions
founder_sync          → Confluence Live State
founder_growth        → T2 hypothesis register
founder_authority     → ism-business-authority rules
founder_clarity       → target skill + memory
```

---

## SESSION-SYNC Rules

1. **Never write without TRIAGE approval.** No exceptions.
2. **ism-founder SYNC is mandatory** at every session end where T1/T2 state changed.
3. **CRM persistence** only for high/medium severity learnings. Low severity stays in skill files only.
4. **Zero signals is valid.** Report clearly. Do not fabricate signals.
5. **Confluence rate limits.** If blocked, queue for next session and flag in CONFIRM.
6. **Operator may reject signals.** Rejected signals logged with reason — not re-proposed unless operator requests.
7. **Version bumps:** every patched skill gets PATCH bump (e.g. 1.2.2 → 1.2.3). Never MINOR/MAJOR from SESSION-SYNC.
8. **Route all Slack notifications through `slack-messaging` skill.**