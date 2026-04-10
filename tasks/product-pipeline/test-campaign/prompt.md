# Task: Test Campaign Workflow (Domain 2.5)

## Inputs

- CRM read: Product_Launches record (SampleConfirmation, MarginRecord, PricingStrategy, ProductSpec, ComplianceRecord)
- Domain 1 data: CostEstimate (pre-test economics from margin-calculator ESTIMATE mode)
- Domain 1.5 data: USPStatement (for test listing draft)
- Project context: `ppc-test-campaign-config.ctx.json` (campaign config)
- Project context: `gate-criteria.ctx.json` (Gate 2 thresholds)
- Project context: `financial-constants.ctx.json` (financial thresholds)
- Project context: `amazon-fee-table.ctx.md` (fee reference)

## Prerequisites (verify before proceeding)

| Check | Source | Required |
|---|---|---|
| SampleConfirmation.status = PASS or WAIVED | CRM Product_Launches | Yes |
| MarginRecord exists (ACTUAL mode output) | CRM Product_Launches | Yes |
| CostEstimate exists (ESTIMATE mode output) | CRM Product_Launches | Yes |
| USPStatement exists | CRM Product_Launches or Confluence | Yes |
| ASIN assigned (FBA listing created) | Team confirms | Yes |

If any prerequisite is missing, state exactly what is needed and from which domain/skill. Do not proceed with partial data.

## Steps

### Step 0: Parse Amazon listing URL

Invoke **PD- product-discover LISTING_PARSE mode**:
- User provides the Amazon listing URL for the test product
- The skill extracts: ASIN, title, bullets, price, brand, category, BSR, rating, review count, implicit keywords, competitor ASINs, review themes
- Output: `ListingRecord` with confidence per field

**Guard:** If URL not provided or extraction yields incomplete data (data_completeness_pct < 50%), ask user to provide missing fields manually (ASIN, title, category at minimum). Continue with available data.

### Step 0.5: Import Helium10 keywords (optional)

If user has Helium10 or Jungle Scout keyword research data:

Invoke **KI- ikraft-keyword-intelligence IMPORT mode**:
- User provides CSV data (file content or paste) and source_type (helium10_cerebro, helium10_magnet, jungle_scout, generic_csv)
- The skill normalizes columns, classifies keywords by intent (brand/competitor/generic/long_tail), deduplicates, and scores
- Output: `KeywordSet[]` with per-keyword metrics (demand, competition, intent_class, h10_score, organic_rank)

**Guard:** If CSV parsing fails, log error and continue to Step 1 without keyword data. Campaign planning can proceed with implicit keywords from LISTING_PARSE.

If user does not have keyword research data, skip this step. Note in the workflow that SCENARIO mode will use only implicit keywords from the ListingRecord.

### Step 1: Verify FBA dispatch and listing readiness

Invoke **FO- fulfillment-ops SAMPLE mode** to verify:
- Zoho Inventory Package record exists
- FBA inbound shipment received (team confirms manually)
- FNSKU labeling complete

**Stage 5 exit checklist** (from domain map):
- [ ] Title + 5 bullets + description complete
- [ ] Main image + 6 lifestyle images ready
- [ ] Backend keywords set
- [ ] TestPlan approved (completed in Step 2)

If listing is not ready, output checklist of remaining items. Do not proceed to Step 2 until listing basics are confirmed.

### Step 1.5: Generate campaign scenarios

Invoke **AO- ads-ops-plan SCENARIO mode** with:
- `listing_record`: ListingRecord from Step 0
- `keyword_sets`: KeywordSet[] from Step 0.5 (or empty if skipped)
- `budget_constraints`: total_budget_inr, daily_budget_max_inr, duration_max_days from user or CRM (Amazon_PPC_Budget, Test_Budget_Allocated)
- `breakeven_acos_pct` and `target_acos_pct` from MarginRecord

The skill reads `ppc-test-campaign-config.ctx.json` for scenario templates and generates 3-5 campaign flavors (Conservative, Balanced, Aggressive, Keyword-focused, Custom). Each scenario is a complete Amazon Ads-compliant CampaignPlan with campaigns, ad groups, targeting, bids, and forecasts.

Output: `CampaignScenario[]` with comparison table and recommendation.

### Step 1.6: Select scenario and save to CRM

Present the scenario comparison table to the user. The table includes: scenario type, total budget, duration, expected data quality, risk level, and recommendation.

**Human gate:** User selects a scenario. This is the campaign plan commitment.

After selection, create two levels of CRM records:

1. **Campaigns record (strategy level):**
   - Invoke **ZO- zoho-data-ops WRITE mode** to create a `Campaigns` record with Status = "Planning", Type = "Amazon PPC Test"
   - Set Product_Launch lookup, Scenario_Type, Test_Phase, Total_Budget_INR from the selected scenario
   - Gate_2_Verdict = "Pending"

2. **Amazon_Ad_Campaigns records (individual campaign level):**
   - For each campaign in the selected scenario, invoke **ZO- zoho-data-ops WRITE mode** to create an `Amazon_Ad_Campaigns` record with Status = "Draft"
   - Set Campaign_Strategy lookup to the Campaigns record created above
   - Set Product_Launch lookup to the same Product_Launches record
   - Populate campaign settings, bidding details, ad group, keywords, and forecast fields from the scenario's CampaignPlan

**Human gate:** User reviews the CRM records and approves (Campaigns Status -> "Active", Amazon_Ad_Campaigns Status -> "Approved"). The approved plan becomes the TestPlan for Phase 1/2 execution.

### Step 2: Plan Phase 1 discovery campaign

Invoke **AO- ads-ops-plan TEST mode** with phase = `plan_discovery`:
- Product name, ASIN, selling price, category from CRM record
- breakeven_acos_pct and target_acos_pct from MarginRecord
- Campaign parameters from the approved Amazon_Ad_Campaigns record (budget, bid strategy, duration)

The skill reads `ppc-test-campaign-config.ctx.json` for defaults and the Amazon_Ad_Campaigns record for approved overrides. It outputs a **TestPlan** aligned with the selected scenario.

**Human gate:** TestPlan requires explicit approval before any ad spend is committed. Present the plan clearly and wait for approval.

### Step 3: Monitor Phase 1 (team executes campaign)

Team creates the auto campaign in Seller Central per the TestPlan. During the campaign:

Invoke **PM- product-monitor MONITOR mode** periodically to track:
- BSR movement, review velocity, return rate
- Basic listing health (suppression, buybox status)

After Phase 1 duration completes (per config), team exports the Search Term Report CSV from Seller Central.

### Step 4: Analyze Phase 1 results

Invoke **AO- ads-ops-plan TEST mode** with phase = `analyze_discovery`:
- Provide Search Term Report CSV or manual metrics summary
- breakeven_acos_pct from MarginRecord

The skill analyzes keyword performance, classifies into 4 buckets (winner/learner/loser/no_data), rates data quality, and outputs **TestResults** with harvested keywords and negative keywords.

**Persist TestResults:** Write an ISM_ExecutionLogs entry via **ZO- zoho-data-ops WRITE mode**:
- Skill_Name: "test-campaign-phase1-analysis"
- Output_Summary: full TestResults JSON (keyword buckets, harvested keywords, data quality rating, blended metrics)
- Input_Fingerprint: "product={product_name},asin={asin},phase=discovery"

**Decision point based on data quality:**
- HIGH/MEDIUM -> proceed to Phase 2 (Step 5)
- LOW + extend_recommended -> present extension option to team. If approved, extend Phase 1 by config `max_extension_days`. If rejected, proceed with available data.

### Step 5: Plan Phase 2 validation campaign

Invoke **AO- ads-ops-plan TEST mode** with phase = `plan_validation`:
- Harvested keywords from Step 4
- Negative keywords from Step 4

The skill outputs a TestPlan for manual exact-match campaigns targeting Phase 1 winners. Auto campaign continues in parallel with negatives applied.

**Human gate:** TestPlan requires approval before Phase 2 spend.

### Step 6: Analyze Phase 2 results

After Phase 2 completes, team exports Search Term Report again.

Invoke **AO- ads-ops-plan TEST mode** with phase = `analyze_validation`:
- Phase 2 Search Term Report CSV
- Phase 1 TestResults for context

The skill outputs TestResults with per-keyword margin viability assessment and blended metrics.

**Persist TestResults:** Write an ISM_ExecutionLogs entry via **ZO- zoho-data-ops WRITE mode**:
- Skill_Name: "test-campaign-phase2-analysis"
- Output_Summary: full TestResults JSON (per-keyword margin viability, blended ACoS/ROAS, viable keyword count, recommendation)
- Input_Fingerprint: "product={product_name},asin={asin},phase=validation"

### Step 7: Cost comparison and costing scenarios

Invoke **MC- margin-calculator COMPARISON mode** with:
- CostEstimate (Domain 1) -- pre-test assumed economics
- MarginRecord (Domain 2) -- actual vendor COGS economics
- TestActuals from Step 6 -- actual CPC, CVR, ACoS from test campaigns

The skill outputs:
- **CostComparison** -- side-by-side: estimate vs actual vs test
- **CostingScenarios** (3-5 bulk scenarios at different MOQ/price points)

### Step 8: Compliance timeline check

Read ComplianceRecord from CRM. Compare expected completion dates against the proposed launch timeline from CostingScenarios.

Output **ComplianceTimelineCheck**:
- PASS: all certs expected before launch date
- WARNING: some certs may not complete in time (human can accept risk)
- BLOCK: critical certs will not be ready

### Step 9: Gate 2 -- Scale Decision

Present all evidence for the human to make the commit/don't-commit decision:

| Evidence | Source |
|---|---|
| CostComparison (estimate vs actual vs test) | Step 7 |
| CostingScenarios (bulk economics) | Step 7 |
| Keyword-level margin viability | Step 6 |
| Blended ACoS vs breakeven ACoS | Step 6 |
| Data quality rating | Step 6 |
| ComplianceTimelineCheck | Step 8 |

**Gate 2 pass criteria** (from `gate-criteria.ctx.json`):
- Keyword-level margin positive on >= 3 keywords with sufficient volume
- Blended ACoS <= breakeven ACoS
- Data quality HIGH or MEDIUM
- ComplianceTimelineCheck PASS or human-accepted WARNING

**Human gate:** This is the highest-stakes decision in the pipeline. Present clearly, recommend, but the human decides.

**If PASS:** Output ScaleDecision with quantity, target landed cost, max MOQ, launch timeline. This triggers Domain 3 (bulk order initiation + Source to Pay pipeline).

**If FAIL:** Output kill/park recommendation with full rationale. Log to CRM. Post kill/park alert to Slack via `slack-messaging` skill.

**Dual-write (both verdicts):** After human decides, invoke **ZO- zoho-data-ops WRITE mode** to update BOTH:
1. `Campaigns.Gate_2_Verdict` = PASS/FAIL/CONDITIONAL, `Gate_2_Date` = today, `Gate_2_Rationale` = summary
2. `Product_Launches.Scale_Verdict` = same verdict, `Scale_Decision_Complete` = true

These two fields must always be in sync. Campaigns is the operational record; Product_Launches is the pipeline-level record read by Bigin and downstream domains.

### Step 10: Write execution log

Write to **ISM_ExecutionLogs** CRM module:

```
Skill_Name: "test-campaign"
Execution_Date: now
Status: "SUCCESS" | "PARTIAL" | "FAILED"
Input_Fingerprint: "product={product_name},asin={asin},phases_completed={1|2|both}"
Output_Summary: "gate2_verdict={PASS|FAIL|CONDITIONAL},winners={count},blended_acos={pct},scale_qty={qty_or_na}"
Systems_Modified: "Campaigns,Amazon_Ad_Campaigns,Product_Launches,ISM_Learnings"
Slack_Tag: "#ism-launch-alerts"
```

### Step 11: Write learning signal

Write to **ISM_Learnings** CRM module:

```
Skill_Name: "test-campaign"
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

### Step 12: Post Slack summary

**Route through `slack-messaging` skill** for correct mrkdwn formatting.

Post Gate 2 decision summary to **#ism-launch-alerts** with: product name, verdict, key metrics, and next action.

## Outputs

| Output | Destination | Condition |
|---|---|---|
| TestPlan (Phase 1 + 2) | Presented to team | Always |
| TestResults (Phase 1 + 2) | Stored in CRM/Confluence | After each phase |
| CostComparison | CRM Product_Launches | After Step 7 |
| CostingScenarios | CRM Product_Launches | After Step 7 |
| ComplianceTimelineCheck | CRM Product_Launches | After Step 8 |
| ScaleDecision | CRM Product_Launches | After Gate 2 |
| Gate 2 result | CRM stage advance | On pass |
| Slack alerts (via `slack-messaging` skill) | #ism-launch-alerts | On gate decisions |
| ISM_ExecutionLogs record | CRM ISM_ExecutionLogs | Always |
| ISM_Learnings record | CRM ISM_Learnings | On Gate 2 decision |

## Error Handling

| Condition | Action |
|---|---|
| Missing prerequisite data | State exact gap, do not proceed |
| Search Term Report not provided | Ask team to export from Seller Central |
| Data quality LOW after both phases | Recommend extension or abort; human decides |
| Compliance BLOCK | Cannot pass Gate 2; present options (wait, accept risk, abort) |
| Skill invocation fails | Log error, present partial results, ask for manual input |

## Constraints

- This task is an **orchestrator**. Skills do the calculations.
- **Never execute Seller Central actions.** Campaign creation, listing updates, and FBA shipments are done by team manually.
- **Never auto-pass Gate 2.** Human always decides.
- **Never estimate test results.** Analyze actual data only.
- All CRM writes go through `zoho-data-ops` skill.
- All Slack messages go through `slack-messaging` skill for mrkdwn formatting.
