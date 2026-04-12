# Make Scale Decision

The highest-stakes decision in the product pipeline. Compare estimated vs actual vs test economics, check compliance timeline, compile all evidence, and present the Gate 2 scale-or-kill decision to the human. Write the verdict to CRM, post alerts, and log everything.

## Prerequisites

Invoke **ZO- zoho-data-ops READ mode** on the Product_Launches, Campaigns, and ISM_ExecutionLogs records:

| Check | Source | Required |
|---|---|---|
| CostEstimate (Domain 1 pre-test economics) | CRM Product_Launches | Yes |
| MarginRecord (Domain 2 actual vendor COGS) | CRM Product_Launches | Yes |
| Phase 2 TestResults (per-keyword margin viability, blended metrics) | CRM ISM_ExecutionLogs | Yes |
| ComplianceRecord (certs_applicable[], expected_completion_dates) | CRM Product_Launches | Yes |
| Campaigns record with active status | CRM Campaigns | Yes |

If any prerequisite is missing, state exactly what is needed. Do not proceed with partial data — Gate 2 decisions require complete evidence.

## Context files to read

- `gate-criteria.ctx.json` — **authoritative** Gate 2 pass criteria (keyword_margin_min_positive, blended_acos_lte, data_quality_required, compliance)
- `financial-constants.ctx.json` — financial thresholds
- `crm-field-mappings.ctx.json` — CRM field definitions for dual-write
- `pipeline-config.ctx.json` — Slack channel routing

## Steps

### 1. Cost comparison and costing scenarios

Invoke **MC- margin-calculator COMPARISON mode** with:
- CostEstimate (Domain 1) — pre-test assumed economics
- MarginRecord (Domain 2) — actual vendor COGS economics
- TestActuals from Phase 2 TestResults — actual CPC, CVR, ACoS from test campaigns

The skill outputs:
- **CostComparison** — side-by-side: estimate vs actual vs test
- **CostingScenarios** (3-5 bulk scenarios at different MOQ/price points)
- **gate_2_margin_contribution** block — actual_vs_estimate_delta_pct, blended_acos_threshold_met, scale_feasibility (PROCEED/REVISIT_COGS/ABORT), rationale

### 2. Compliance timeline check

Invoke **CO- compliance-ops TIMELINE_CHECK mode** with:
- `compliance_record`: ComplianceRecord from CRM Product_Launches (contains certs_applicable[] with initiated_date, expected_completion_date, mandatory flag, jira_ticket_id per cert)
- `launch_timeline_date`: proposed launch date from CostingScenarios (use the recommended scenario's launch window)

The skill outputs **ComplianceTimelineCheck** with:
- `timeline_verdict`: PASS | WARNING | BLOCK
- `gate_2_compliance_contribution` block: {timeline_verdict, all_certs_expected_before_launch, at_risk_certs[], critical_certs_blocked[], gate_2_compliance_met, rationale}
- `context_paths_cited`: references `gc.gate_2.full_criteria.compliance` and `tuning-constants §1 timeline_buffer_days`

Per `gc.gate_2.full_criteria.compliance = "PASS or WARNING"` (from gate-criteria.ctx.json), a WARNING verdict is Gate-2-acceptable with explicit human acknowledgement; a BLOCK verdict fails Gate 2 and requires launch date shift or escalation.

### 3. Gate 2 — Scale Decision

Present all evidence for the human to make the commit/don't-commit decision:

| Evidence | Source |
|---|---|
| CostComparison (estimate vs actual vs test) | Step 1 (margin-calculator) |
| CostingScenarios (bulk economics) | Step 1 (margin-calculator) |
| gate_2_margin_contribution | Step 1 (margin-calculator) |
| Keyword-level margin viability | Phase 2 TestResults (from CRM) |
| Blended ACoS vs breakeven ACoS | Phase 2 TestResults (from CRM) |
| Data quality rating | Phase 2 TestResults (from CRM) |
| ComplianceTimelineCheck | Step 2 (compliance-ops) |
| gate_2_compliance_contribution | Step 2 (compliance-ops) |

**Gate 2 pass criteria** (from `gate-criteria.ctx.json`):
- Keyword-level margin positive on >= 3 keywords with sufficient volume
- Blended ACoS <= breakeven ACoS
- Data quality HIGH or MEDIUM
- ComplianceTimelineCheck PASS or human-accepted WARNING

**Human decision:** This is the highest-stakes decision in the pipeline. Present clearly, recommend, but the human decides.

**If PASS:** Output ScaleDecision with quantity, target landed cost, max MOQ, launch timeline. This triggers Domain 3 (bulk order initiation + Source to Pay pipeline).

**If FAIL:** Output kill/park recommendation with full rationale.

### 4. Write verdict to CRM (dual-write)

After human decides, invoke **ZO- zoho-data-ops WRITE mode** to update BOTH:

1. `Campaigns.Gate_2_Verdict` = PASS/FAIL/CONDITIONAL, `Gate_2_Date` = today, `Gate_2_Rationale` = summary
2. `Product_Launches.Scale_Verdict` = same verdict, `Scale_Decision_Complete` = true

These two fields must always be in sync. Campaigns is the operational record; Product_Launches is the pipeline-level record read by Bigin and downstream domains.

### 5. Write execution log

Write to **ISM_ExecutionLogs** CRM module via **ZO- zoho-data-ops WRITE mode**:

```
Skill_Name: "scale-decision"
Execution_Date: now
Status: "SUCCESS" | "PARTIAL" | "FAILED"
Input_Fingerprint: "product={product_name},asin={asin},phases_completed={1|2|both}"
Output_Summary: "gate2_verdict={PASS|FAIL|CONDITIONAL},winners={count},blended_acos={pct},scale_qty={qty_or_na}"
Systems_Modified: "Campaigns,Amazon_Ad_Campaigns,Product_Launches,ISM_Learnings"
Slack_Tag: "#ism-launch-alerts"
```

### 6. Write learning signal

Write to **ISM_Learnings** CRM module via **ZO- zoho-data-ops WRITE mode**:

```
Skill_Name: "scale-decision"
Target_Type: "gate2_decision"
Target_Name: product name
Description: JSON summary of:
  - gate2_verdict: PASS/FAIL/CONDITIONAL
  - winning_keywords_count: N
  - blended_acos_vs_breakeven: actual vs threshold
  - data_quality: HIGH/MEDIUM/LOW
  - compliance_status: PASS/WARNING/BLOCK
  - scale_quantity: N (if PASS)
  - kill_reason: text (if FAIL)
Severity: "info"
Status: "new"
Timestamp: now
```

### 7. Post Slack summary

Invoke **SM- slack-messaging** to post Gate 2 decision summary to **#ism-launch-alerts** with: product name, verdict, key metrics (blended ACoS, winning keywords, compliance status, scale quantity or kill reason), and next action.

If FAIL, also post a kill/park alert with the full rationale.

## Completion criteria

This task is done when:
- [x] CostComparison + CostingScenarios generated
- [x] ComplianceTimelineCheck completed with verdict
- [x] All Gate 2 evidence presented to human
- [x] Human has made PASS/FAIL/CONDITIONAL decision
- [x] Verdict written to BOTH Campaigns and Product_Launches (dual-write)
- [x] Execution log written to ISM_ExecutionLogs
- [x] Learning signal written to ISM_Learnings
- [x] Slack summary posted to #ism-launch-alerts

**If PASS:** Next actions are Domain 3 — bulk order initiation, listing optimization, capital planning. These are separate workflows.
**If FAIL:** Product is parked or killed. CRM reflects the decision. No further test-campaign actions.

## Constraints

- **Never auto-pass Gate 2.** Human always decides.
- **Never estimate test results.** Analyze actual data only.
- **Never invent compliance timelines or certificate numbers.** Read from CRM ComplianceRecord as-is.
- All CRM writes go through `zoho-data-ops` skill.
- All Slack messages go through `slack-messaging` skill for mrkdwn formatting.
