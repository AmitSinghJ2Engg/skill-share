---
name: product-pipeline-event-test-campaign
version: "1.0.0"
project: Product Pipeline
type: event
trigger: "Product at FBA + SampleConfirmation exists in CRM"
skills_invoked: [FO-SAMPLE, AO-TEST, MC-COMPARISON, PM-TEST]
---

# Task: Test Campaign Workflow (Domain 2.5)

## Trigger

Event-based: activated when a product has been dispatched to Amazon FBA and a SampleConfirmation record exists in CRM with status PASS or WAIVED. Team initiates this task manually after confirming FBA inbound shipment is received.

## What This Task Does

Orchestrates the full Domain 2.5 market testing workflow: FBA dispatch tracking, test listing preparation, PPC campaign planning, performance analysis, cost comparison, and Gate 2 scale decision. This is the critical path between "sample at FBA" and "commit to bulk order."

The task is an orchestrator — it invokes skills by mode and handles flow control. It does NOT implement campaign logic, margin calculations, or Seller Central actions directly.

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

### Step 2: Plan Phase 1 discovery campaign

Invoke **AO- ads-ops TEST mode** with phase = `plan_discovery`:
- Product name, ASIN, selling price, category from CRM record
- breakeven_acos_pct and target_acos_pct from MarginRecord

The skill reads `ppc-test-campaign-config.ctx.json` for budget, bid, and duration defaults. It outputs a **TestPlan** with campaign name, type (auto), bid strategy, budget, duration, and success criteria.

**Human gate:** TestPlan requires explicit approval before any ad spend is committed. Present the plan clearly and wait for approval.

### Step 3: Monitor Phase 1 (team executes campaign)

Team creates the auto campaign in Seller Central per the TestPlan. During the campaign:

Invoke **PM- product-monitor TEST mode** periodically to track:
- BSR movement, review velocity, return rate
- Basic listing health (suppression, buybox status)

After Phase 1 duration completes (per config), team exports the Search Term Report CSV from Seller Central.

### Step 4: Analyze Phase 1 results

Invoke **AO- ads-ops TEST mode** with phase = `analyze_discovery`:
- Provide Search Term Report CSV or manual metrics summary
- breakeven_acos_pct from MarginRecord

The skill analyzes keyword performance, classifies into 4 buckets (winner/learner/loser/no_data), rates data quality, and outputs **TestResults** with harvested keywords and negative keywords.

**Decision point based on data quality:**
- HIGH/MEDIUM → proceed to Phase 2 (Step 5)
- LOW + extend_recommended → present extension option to team. If approved, extend Phase 1 by config `max_extension_days`. If rejected, proceed with available data.

### Step 5: Plan Phase 2 validation campaign

Invoke **AO- ads-ops TEST mode** with phase = `plan_validation`:
- Harvested keywords from Step 4
- Negative keywords from Step 4

The skill outputs a TestPlan for manual exact-match campaigns targeting Phase 1 winners. Auto campaign continues in parallel with negatives applied.

**Human gate:** TestPlan requires approval before Phase 2 spend.

### Step 6: Analyze Phase 2 results

After Phase 2 completes, team exports Search Term Report again.

Invoke **AO- ads-ops TEST mode** with phase = `analyze_validation`:
- Phase 2 Search Term Report CSV
- Phase 1 TestResults for context

The skill outputs TestResults with per-keyword margin viability assessment and blended metrics.

### Step 7: Cost comparison and costing scenarios

Invoke **MC- margin-calculator COMPARISON mode** with:
- CostEstimate (Domain 1) — pre-test assumed economics
- MarginRecord (Domain 2) — actual vendor COGS economics
- TestActuals from Step 6 — actual CPC, CVR, ACoS from test campaigns

The skill outputs:
- **CostComparison** — side-by-side: estimate vs actual vs test
- **CostingScenarios** (3-5 bulk scenarios at different MOQ/price points)

### Step 8: Compliance timeline check

Read ComplianceRecord from CRM. Compare expected completion dates against the proposed launch timeline from CostingScenarios.

Output **ComplianceTimelineCheck**:
- PASS: all certs expected before launch date
- WARNING: some certs may not complete in time (human can accept risk)
- BLOCK: critical certs will not be ready

### Step 9: Gate 2 — Scale Decision

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

**If FAIL:** Output kill/park recommendation with full rationale. Log to CRM and Slack.

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
| Slack alerts | #ism-launch-alerts | On gate decisions |

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
