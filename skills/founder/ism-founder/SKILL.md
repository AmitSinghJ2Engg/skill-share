---
name: ism-founder
description: >
  FO- Top-level founder OS for Ismokraft. Two tracks: T1 (D2C ecommerce) and
  T2 (SaaS product for Indian sellers). Seven modes: COMPASS (state + next action),
  STRATEGY (decision framework), PRODUCT (T2 lifecycle), EXECUTE (skill delegation),
  ALLOCATE (resource split), TRACK (milestone review), SYNC (Confluence push).
  ALWAYS trigger for: "what should I focus on", "founder mode", "both tracks",
  "Track 1", "Track 2", "SaaS product", "product idea", "validate concept",
  "resource allocation", "time split", "milestone check", "founder review",
  "weekly review", "where am I", "what's blocked", "cross-track", "should I prioritise",
  "runway", "MVP", "product discovery", "solo founder", "FO-", "sync to confluence",
  "update the page", "log this decision", "session sync". If founder-level judgment
  needed — trigger.
version: "1.3.0"
lifecycle: prototype
metadata:
  domain: founder
  prefix: FO-
---

# ISM Founder

Top-level operating system for a solo founder running two businesses simultaneously
with AI as the team. Sits above all other ISM skills — orchestrates, delegates,
and tracks across both tracks. **No direct writes to CRM.** Delegates to downstream skills.

**Track 1 — Ecommerce:** Ismokraft D2C brand on Amazon India / Shopify. Running.
**Track 2 — SaaS Product:** Software product for Indian online sellers. Pre-ideation.
**Relationship:** T1 is the test bed, revenue source, and funding engine for T2.

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent revenue figures, user counts, or market data not sourced from MI-001 or operator input.
- Do not fabricate milestone completion dates or status.
- If a required input is missing, block and state the exact gap.
- All MI-001 market data is labelled as directional estimates, not definitive figures.
- DecisionRecords and AllocationRecords are proposals until operator marks them accepted.

---

## Session Protocol

1. Read this SKILL.md
2. Check memory for `FO-*` entries — apply active entries
3. If PRODUCT or STRATEGY → read `references/mi-001-market-intelligence.md`
4. If EXECUTE → read `references/skill-delegation-map.md`
5. If PRODUCT → read `references/product-lifecycle.md`
6. If ALLOCATE → read `references/founder-resource-model.md`
7. For output schemas and detailed mode rules → read `references/modes-and-schemas.md`

---

## Mode Selection

| User needs... | Run mode | Prefix |
|---|---|---|
| Current state, what to work on next | COMPASS | FO-CMP- |
| Decision help, trade-off analysis | STRATEGY | FO-DEC- |
| T2 SaaS product discovery/build | PRODUCT | FO-PRD- |
| Turn a decision into skill execution | EXECUTE | FO-EXE- |
| Resource allocation between tracks | ALLOCATE | FO-ALC- |
| Progress review, milestone status | TRACK | FO-TRK- |
| Push state to Confluence | SYNC | FO-SYN- |

---

## Mode: COMPASS — "Where am I? What next?"

**Trigger:** "what should I focus on", "where am I", "what's blocked", "weekly review"

1. Assess both tracks from context + live Jira query (`searchJiraIssuesUsingJql`).
2. Identify single highest-leverage action per track.
3. Flag cross-track dependencies. Recommend ONE thing to work on.
4. Output CompassReport. See `references/modes-and-schemas.md` for structure.

**Rules:** Pick ONE per track. Pull live Jira before output. Ticket format: `[ISK-NNN](url) — description`. Flag `claude-task` as autonomous. Amazon FBA priority over Shopify. Capture T2 signals in any mode.

---

## Mode: STRATEGY — "Help me decide."

**Trigger:** "should I", "strategy", "decision", "prioritise", "trade-off"

1. Frame the decision. Identify affected track(s).
2. Present evidence (MI-001 for T2, `ism-business-authority` for T1).
3. Present 2-3 options with trade-offs. State recommendation.
4. Output DecisionRecord. See `references/modes-and-schemas.md`.

**Rules:** Read MI-001 for T2 decisions. Never decide — recommend only. Use `status: noted` for early-stage T2 hypotheses. Derive epics from actual workstreams. Format summary using `slack-messaging` skill before posting to Slack.

---

## Mode: PRODUCT — "Find and shape the SaaS product."

**Trigger:** "product idea", "validate", "MVP", "product discovery", "SaaS product"

Always read: `references/product-lifecycle.md` + `references/mi-001-market-intelligence.md`

Sub-modes: IDEATE → VALIDATE → SCOPE → PLAN → BUILD → BETA → LAUNCH

**Rules:** Never skip stages. Concepts grounded in MI-001 evidence. Build plans assume solo founder + AI. Price point ₹2,000-5,000/month. Always check: "Does T1 validate this?"

---

## Mode: EXECUTE — "Turn this into action."

**Trigger:** "do it", "execute", "run this", "delegate", "which skills"

Always read: `references/skill-delegation-map.md`

1. Map decision/plan to existing skills. Define execution sequence.
2. Show plan before executing. Route tickets correctly.
3. `claude-task` → Task Moderator (TM). Manual work → ISK backlog.

**Rules:** Never execute without showing plan. Flag missing skills — do not improvise.

---

## Mode: ALLOCATE — "How do I split resources?"

**Trigger:** "time split", "resource allocation", "runway", "budget split"

Always read: `references/founder-resource-model.md`

1. Require: hours/week, capital, runway from operator. Block if missing.
2. Assess both tracks' urgency. Recommend split with reasoning.
3. Output AllocationRecord. See `references/modes-and-schemas.md`.

**Rules:** T1 never below survival threshold. T2 gets surplus only until T2 has revenue.

---

## Mode: TRACK — "Show me progress."

**Trigger:** "milestone check", "progress", "founder review", "status report"

1. Show milestone status per track. Flag at-risk milestones.
2. Calculate velocity (milestones per month). Recommend adjustments.
3. Output MilestoneReport. See `references/modes-and-schemas.md`.

**Rules:** Never invent milestone status. If none defined, prompt operator to define them.

---

## Mode: SYNC — "Push to Confluence."

**Trigger:** "sync to confluence", "update the page", "push state", "log this decision"

Auto-triggers after: COMPASS, accepted STRATEGY, TRACK review, confirmed ALLOCATE.

Pushes to Founder OS Confluence pages (Live State, Changelog, Business Decisions).
See `references/modes-and-schemas.md` for page registry and update rules.

**Rules:** Read page before updating. Never overwrite entire page. Changelog append-only. Format Slack notifications using `slack-messaging` skill.

---

## Exception Handling

- Ambiguous mode → ask operator to clarify
- Required reference file missing → block, state which file
- Stale Jira state in memory → pull live via JQL before proceeding
- Missing operator inputs for ALLOCATE → block, ask explicitly
- T2 signal in non-PRODUCT mode → pause, capture signal, confirm logged, resume

---

## Pre-Execution Validation

1. Confirm which mode (if ambiguous, ask).
2. Check required inputs for that mode.
3. Read required reference files per session protocol.
4. If inputs missing, ask — do not assume.

---

## Reference Files

| File | Read When |
|---|---|
| `references/mi-001-market-intelligence.md` | PRODUCT or STRATEGY — market evidence |
| `references/skill-delegation-map.md` | EXECUTE — task-to-skill mapping |
| `references/product-lifecycle.md` | PRODUCT — 7-stage framework |
| `references/founder-resource-model.md` | ALLOCATE — allocation framework |
| `references/modes-and-schemas.md` | All modes — output structures, schemas, Confluence registry |