---
name: product-pipeline-scheduled-daily-discovery
version: "1.1.0"
project: Product Pipeline
type: scheduled
schedule: "Daily, 7:00 AM IST"
skills_invoked: [KI-GENERATE, PD-BATCH, ZO-WRITE, PS-SCORE, PS-REPORT]
---

# Task: Daily Product Discovery Pipeline

## Schedule

Daily, 7:00 AM IST. Configured in Claude Desktop Cowork scheduler.

## What This Task Does

Runs the Ismokraft daily product discovery pipeline: determines today's zone, generates keywords, crawls marketplaces, scores candidates, captures learning signals, and posts a summary to Slack. This is the primary feed for the pipeline's Idea Intake stage. The task is an orchestrator -- it invokes skills by mode and handles flow control, error recovery, and telemetry. It does NOT implement skill logic directly.

## Inputs

- Project context: `zone-rotation.ctx.json` (today's zone and rotation formula)
- Project context: `crm-field-mappings.ctx.json` (CRM field API names)
- Project context: `financial-constants.ctx.json` (scoring thresholds)
- CRM read: ISM_ExecutionLogs (dedup check -- has today's run already happened?)
- CRM write: Product_Launches, ISM_ExecutionLogs, ISM_Learnings
- Slack write: `#ism-launch-reports`, `#ism-launch-alerts`

## Steps

### Step 0: Dedup check

Query ISM_ExecutionLogs for a record where Skill_Name = "daily-discovery" AND Execution_Date = today. If found, SKIP this run entirely and log "duplicate run prevented" to Slack `#ism-launch-alerts`. This prevents double CRM records from scheduler glitches.

### Step 1: Determine today's zone and marketplace rotation

Read `zone-rotation.ctx.json` from project context. Calculate today's zone and marketplace set. State the zone name, seed keywords, and active marketplaces before proceeding.

### Step 2: Generate keywords

Invoke **KI- ikraft-keyword-intelligence GENERATE mode** with today's zone.

**Guard:** If the skill returns fewer than 3 keywords, log to `#ism-launch-alerts` as "low keyword yield" and continue with available keywords. If zero keywords, skip to Step 7 (telemetry) and Step 8 (Slack) with status = "FAILED: zero keywords."

### Step 3: Run discovery

Invoke **PD- product-discover BATCH mode** with keywords from Step 2 and today's zone.

The skill handles its own crawling protocols, normalization, and deduplication internally. It returns structured `ProductCandidate[]` data. **PD does NOT write to CRM** -- data persistence is handled in Step 3b.

**Partial failure:** If some marketplaces are unreachable, the skill returns candidates from available marketplaces with null signals for unreachable ones. The task continues with available data.

**Guard:** If zero candidates returned, skip to Step 7 (telemetry) and Step 8 (Slack) with status = "zero candidates discovered."

### Step 3b: Persist candidates to CRM

Invoke **ZO- zoho-data-ops WRITE mode** to create Product_Launches records from the `ProductCandidate[]` returned in Step 3. Target: CRM > Product_Launches module. See `zoho-data-ops/reference/write-patterns.md` for the standard field mapping.

The skill handles dedup checking (matching by product name + target platform), field name resolution via `crm-field-mappings.ctx.json`, and returns created record IDs for use in Step 4.

**Guard:** If CRM write fails after retry, log error to `#ism-launch-alerts` and skip to Step 7 with status = "FAILED: CRM write error."

### Step 4: Score candidates

Invoke **PS- product-screen SCORE mode** on the `ProductCandidate[]` from Step 3.

The skill handles scoring dimensions and score band assignment internally. It returns `ScoredCandidate[]` with Opportunity_Score, Competition_Level, Search_Trend, and Financial_Viability values. **PS does NOT write to CRM** -- score persistence is handled in Step 4b.

**Guard:** If scoring fails (skill error), log error details and skip to Step 7.

### Step 4b: Persist scores to CRM

Invoke **ZO- zoho-data-ops WRITE mode** to update Product_Launches records with scores from `ScoredCandidate[]`. Uses record IDs from Step 3b. Target fields: Opportunity_Score, Competition_Level, Search_Trend, Financial_Viability.

**Guard:** If CRM update fails, log error and continue to Step 5 (scores are not blocking for report generation).

### Step 5: Generate report (conditional)

If any candidates scored 55 or above, invoke **PS- product-screen REPORT mode** on the `ScoredCandidate[]` from Step 4.

The skill handles risk filtering and top-10 ranking internally.

If all candidates scored below 55, skip this step. Note in Slack summary: "No candidates reached Promising threshold."

### Step 6: Capture learning signals

Write to **ISM_Learnings** CRM module:

```
Skill_Name: "daily-discovery"
Target_Type: "keyword_performance"
Target_Name: today's zone name
Description: JSON summary of keyword performance:
  - top_performing_keywords: keywords that surfaced STRONG/PROMISING candidates
  - zero_yield_keywords: keywords that produced 0 candidates after filtering
  - high_score_patterns: common traits of candidates scoring 75+
Severity: "info"
Status: "new"
Timestamp: now
```

This feeds the `ism-daily-learning` synthesis task (runs at 11 PM) which reads these records and proposes context file updates.

### Step 7: Write execution log

Write to **ISM_ExecutionLogs** CRM module:

```
Skill_Name: "daily-discovery"
Execution_Date: now
Status: "SUCCESS" | "PARTIAL" | "FAILED"
Input_Fingerprint: "zone={zone_id},keywords={count},marketplaces={list}"
Output_Summary: "candidates={count},scored={count},top_score={score},strong={count},promising={count}"
Systems_Modified: "Product_Launches,ISM_Learnings"
Slack_Tag: "#ism-launch-reports"
```

### Step 8: Post Slack summary

Post to **#ism-launch-reports**:

```
ISM Daily Discovery | {date} | Zone {id}: {zone_name}
Marketplaces: {list}
Keywords: {count} generated ({layer1}/{layer2}/{layer3})
Candidates: {discovered} found, {scored} scored
Score range: {min}-{max} | Strong: {n}, Promising: {n}, Weak: {n}, Reject: {n}
Top 5:
  1. {name} ({score}, {band}) - {marketplace}
  2. ...
Anomalies: {any filter flags, low-yield warnings, or "none"}
Next zone: Zone {id} ({name})
```

If status is FAILED or PARTIAL, also post to **#ism-launch-alerts** with the error details.

This step runs regardless of candidate count. Even a zero-yield run posts a summary.

## Outputs

| Output | Destination | Condition |
|--------|-------------|-----------|
| Product_Launches records | CRM (created by ZO skill, Step 3b) | Always (if candidates found) |
| Opportunity scores | CRM (updated by ZO skill, Step 4b) | Always (if candidates scored) |
| OpportunityReport | Returned by PS REPORT mode | If candidates >= 55 score |
| Learning signals | ISM_Learnings CRM module | Always |
| Execution log | ISM_ExecutionLogs CRM module | Always |
| Summary message | Slack #ism-launch-reports | Always |
| Alert message | Slack #ism-launch-alerts | On errors, low-yield, or failures |

## Error Handling

| Condition | Action | Severity |
|-----------|--------|----------|
| Duplicate run detected (Step 0) | Skip entire run, log to Slack | INFO |
| Fewer than 3 keywords (Step 2) | Continue with available, log to alerts | WARNING |
| Zero keywords (Step 2) | Skip to Step 7+8 with FAILED status | CRITICAL |
| Some marketplaces unreachable (Step 3) | Continue with available data, note in summary | WARNING |
| Zero candidates (Step 3) | Skip to Step 7+8, suggest broader keywords | CRITICAL |
| Scoring skill error (Step 4) | Skip to Step 7+8 with PARTIAL status | ERROR |
| CRM write fails | Retry once; if still failing, log error and continue | ERROR |
| Slack post fails | Log to ISM_ExecutionLogs, continue | WARNING |

## Constraints

- This task is an **orchestrator**. It invokes skills by mode. It does NOT implement crawling, scoring, or filtering logic.
- Never invent data. Unreachable marketplace = null signals, not estimates.
- Every metric produced by a skill must cite its source platform and date.
- Do NOT promote candidates to Stage 2. That is a human decision via the Discovery Dashboard.
- This task only CREATES new Product_Launches records (via ZO skill). It does not modify existing records (except adding scores to records it created in the same run, also via ZO skill).
- Business skills (PD, PS) produce data only. All CRM/Bigin writes go through `zoho-data-ops` (ZO).
- If this task has already run today (dedup check), do not run again.
