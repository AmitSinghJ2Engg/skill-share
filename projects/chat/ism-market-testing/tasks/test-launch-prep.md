# Prepare Test Launch

Set up everything needed to test-launch a product via Amazon PPC: parse the listing, import keyword research, verify FBA readiness, generate campaign scenarios, and save the selected plan to CRM.

## Prerequisites

Before starting, verify these exist in CRM by invoking **ZO- zoho-data-ops READ mode** on the Product_Launches record:

| Check | Source | Required |
|---|---|---|
| SampleConfirmation.status = PASS or WAIVED | CRM Product_Launches | Yes |
| MarginRecord exists (ACTUAL mode output) | CRM Product_Launches | Yes |
| CostEstimate exists (ESTIMATE mode output) | CRM Product_Launches | Yes |
| USPStatement exists | CRM Product_Launches or Confluence | Yes |
| ASIN assigned (FBA listing created) | Team confirms | Yes |

If any prerequisite is missing, state exactly what is needed and from which domain/skill. Do not proceed with partial data.

## Context files to read

- `ppc-test-campaign-config.ctx.json` — campaign config, scenario templates
- `gate-criteria.ctx.json` — Gate 2 thresholds (for breakeven_acos_pct reference)
- `financial-constants.ctx.json` — financial thresholds
- `amazon-fee-table.ctx.md` — fee reference
- `crm-field-mappings.ctx.json` — CRM field definitions

## Steps

### 1. Parse Amazon listing URL

Invoke **PD- product-discover LISTING_PARSE mode**:
- User provides the Amazon listing URL for the test product
- The skill extracts: ASIN, title, bullets, price, brand, category, BSR, rating, review count, implicit keywords, competitor ASINs, review themes
- Output: `ListingRecord` with confidence per field

**Guard:** If URL not provided or extraction yields incomplete data (data_completeness_pct < 50%), ask user to provide missing fields manually (ASIN, title, category at minimum). Continue with available data.

### 2. Import keyword research (optional)

If user has Helium10 or Jungle Scout keyword research data:

Invoke **KI- ikraft-keyword-intelligence IMPORT mode**:
- User provides CSV data (file content or paste) and source_type (helium10_cerebro, helium10_magnet, jungle_scout, generic_csv)
- The skill normalizes columns, classifies keywords by intent (brand/competitor/generic/long_tail), deduplicates, and scores
- Output: `KeywordSet[]` with per-keyword metrics (demand, competition, intent_class, h10_score, organic_rank)

**Guard:** If CSV parsing fails, log error and continue without keyword data. Campaign planning can proceed with implicit keywords from LISTING_PARSE.

If user does not have keyword research data, skip this step. Note that SCENARIO mode will use only implicit keywords from the ListingRecord.

### 3. Verify FBA dispatch and listing readiness

Invoke **FO- fulfillment-ops SAMPLE mode** to verify:
- Zoho Inventory Package record exists
- FBA inbound shipment received (team confirms manually)
- FNSKU labeling complete

**Listing readiness checklist:**
- [ ] Title + 5 bullets + description complete
- [ ] Main image + 6 lifestyle images ready
- [ ] Backend keywords set

If listing is not ready, output checklist of remaining items. Do not proceed until listing basics are confirmed.

### 4. Generate campaign scenarios

Invoke **AO- ads-ops-plan SCENARIO mode** with:
- `listing_record`: ListingRecord from step 1
- `keyword_sets`: KeywordSet[] from step 2 (or empty if skipped)
- `budget_constraints`: total_budget_inr, daily_budget_max_inr, duration_max_days from user or CRM (Amazon_PPC_Budget, Test_Budget_Allocated)
- `breakeven_acos_pct` and `target_acos_pct` from MarginRecord

The skill reads `ppc-test-campaign-config.ctx.json` for scenario templates and generates 3-5 campaign flavors (Conservative, Balanced, Aggressive, Keyword-focused, Custom). Each scenario is a complete Amazon Ads-compliant CampaignPlan with campaigns, ad groups, targeting, bids, and forecasts.

Output: `CampaignScenario[]` with comparison table and recommendation.

### 5. Select scenario and save to CRM

Present the scenario comparison table to the user. The table includes: scenario type, total budget, duration, expected data quality, risk level, and recommendation.

**Human decision:** User selects a scenario. This is the campaign plan commitment.

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

**Human decision:** User reviews the CRM records and approves (Campaigns Status -> "Active", Amazon_Ad_Campaigns Status -> "Approved").

### 6. Post setup summary to Slack

Invoke **SM- slack-messaging** to post a test-launch setup summary to **#ism-launch-alerts** including: product name, ASIN, selected scenario type, budget, duration, number of campaigns created, and next action (create campaigns in Seller Central).

## Completion criteria

This task is done when:
- [x] ListingRecord extracted (or manual fallback provided)
- [x] KeywordSet[] imported (or explicitly skipped)
- [x] FBA dispatch verified
- [x] Campaign scenarios generated and one selected
- [x] Campaigns + Amazon_Ad_Campaigns records created in CRM
- [x] Setup summary posted to Slack

**Next action (human, outside Claude):** Create the auto campaign in Seller Central per the approved TestPlan. Come back for "Plan Discovery Campaign" when ready.

## Constraints

- This task is an **orchestrator**. Skills do the calculations.
- **Never execute Seller Central actions.** Campaign creation is done by team manually.
- All CRM writes go through `zoho-data-ops` skill.
- All Slack messages go through `slack-messaging` skill for mrkdwn formatting.
