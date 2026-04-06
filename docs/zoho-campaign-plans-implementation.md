# Zoho CRM & Bigin — Two-Module Campaign System Implementation Plan

**Date:** 2026-04-06
**DL-017 reference:** Replaces single Campaign_Plans design from DL-016
**Status:** Plan — not yet implemented in Zoho

---

## Architecture Overview

Two-level design using the **built-in Campaigns module** (strategy/round) + a new **Amazon_Ad_Campaigns** custom module (individual campaigns).

```
Product_Launches (CRM)
  +-- Campaigns (built-in, strategy/round level)
  |     +-- Aggregate metrics, Gate 2 verdict, budget
  |     +-- Parent-child hierarchy (Phase 1 -> Phase 2)
  |     +-- Amazon_Ad_Campaigns (custom, individual campaign level)
  |           +-- 1:1 with Amazon Seller Central campaign
  |           +-- Cumulative actuals (campaign-to-date)
  |           +-- Keywords, bids, targeting, forecast
  |
ISM_ExecutionLogs (CRM)
  +-- Daily snapshots from daily-ads-analysis
        +-- Output_Summary JSON: {date, impressions, clicks, orders, spend, acos, ...}

Bigin (Product Launch Factory) <-- one-way from CRM
  +-- 5 read-only fields: strategy name, status, ACoS, spend, Gate 2 verdict
```

### Lifecycle

| Stage | Module | What happens |
|-------|--------|-------------|
| **Plan** | Campaigns + Amazon_Ad_Campaigns | AO SCENARIO -> 1 Campaigns record + N Amazon_Ad_Campaigns records |
| **Execute** | Amazon_Ad_Campaigns | Each record maps 1:1 to Seller Central campaign |
| **Track** | Amazon_Ad_Campaigns -> Campaigns | daily-ads-analysis: update cumulative actuals per campaign, aggregate to Campaigns, log daily snapshot to ISM_ExecutionLogs |
| **Optimize** | Amazon_Ad_Campaigns | Bid changes, keyword adds/removes, budget adjustments |
| **Decide** | Campaigns | Gate 2 reads aggregates. Scale/Kill/Pivot stored here |

### Daily Data Preservation

- **Actuals fields** = running totals (campaign-to-date: total impressions, total spend, etc.)
- **ACoS/CVR/CTR** = computed from cumulative totals (not daily values)
- **ISM_ExecutionLogs** = one entry per daily-ads-analysis run per campaign, `Output_Summary` stores that day's metrics as JSON
- **Trend analysis** = daily-ads-analysis queries execution logs to compute day-over-day deltas and detect anomalies

---

## 1. Zoho CRM: Customize Campaigns Module (Strategy Level)

### 1.1 Module Setup

The Campaigns module is built-in (ID: 645926000004114076). Add "Amazon PPC Test" to the Campaign Type picklist.

### 1.2 Lookup Field

Create a lookup field to Product_Launches:
- **Field Name:** Product_Launch
- **Related Module:** Product Launches (ID: 645926000008511067)
- **Related List Name:** Campaign Strategies (appears on Product_Launches detail view)

### 1.3 Custom Fields

#### Section: Strategy

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Scenario Type | Scenario_Type | Pick List | Values: Conservative, Balanced, Aggressive, Keyword_Focused, Custom |
| Test Phase | Test_Phase | Pick List | Values: Discovery, Validation, Scale |
| Total Budget (INR) | Total_Budget_INR | Currency | Decimal: 2 |

#### Section: Aggregates (rolled up from Amazon_Ad_Campaigns)

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Agg. Impressions | Agg_Impressions | Number | |
| Agg. Clicks | Agg_Clicks | Number | |
| Agg. Orders | Agg_Orders | Number | |
| Agg. Spend (INR) | Agg_Spend_INR | Currency | Decimal: 2 |
| Agg. Revenue (INR) | Agg_Revenue_INR | Currency | Decimal: 2 |
| Agg. ACoS % | Agg_ACoS_Pct | Percent | |
| Agg. CVR % | Agg_CVR_Pct | Percent | |
| Agg. CTR % | Agg_CTR_Pct | Percent | |

#### Section: Gate 2

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Gate 2 Verdict | Gate_2_Verdict | Pick List | Values: Scale, Kill, Pivot, Pending. Default: Pending |
| Gate 2 Date | Gate_2_Date | Date | |
| Gate 2 Rationale | Gate_2_Rationale | Multi Line | |
| Risk Level | Risk_Level | Pick List | Values: LOW, MEDIUM, HIGH |
| Data Quality | Data_Quality | Pick List | Values: HIGH, MEDIUM, LOW |

### 1.4 Layout & Views

- **Detail View:** Identity > Strategy > Aggregates > Gate 2 > Related Amazon_Ad_Campaigns list
- **List View:** Campaign_Name, Status, Scenario_Type, Agg_ACoS_Pct, Gate_2_Verdict

---

## 2. Zoho CRM: Create Amazon_Ad_Campaigns Custom Module

### 2.1 Module Creation

Created via MCP `ZohoCRM_createModules` on 2026-04-06:

- **Module Name:** Amazon Ad Campaigns
- **API Name:** Amazon_Ad_Campaigns
- **Module ID:** 645926000009971002
- **Singular Label:** Amazon Ad Campaign
- **Plural Label:** Amazon Ad Campaigns
- **Profiles:** Administrator (645926000000031157), Standard (645926000000031160)

### 2.2 Lookup Fields

- **Campaign_Strategy:** Lookup -> Campaigns
- **Product_Launch:** Lookup -> Product_Launches

### 2.3 Field Groups and Fields

#### Section: Identity

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Campaign Name | Campaign_Name | Single Line | Required |
| Campaign Type | Campaign_Type | Pick List | Values: SP, SB, SD |
| Status | Status | Pick List | Values: Draft, Approved, Active, Paused, Completed, Archived. Default: Draft |
| Amazon Campaign ID | Amazon_Campaign_ID | Single Line | Amazon SC campaign ID (post-creation) |

#### Section: Settings

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Targeting Type | Targeting_Type | Pick List | Values: Auto, Manual_Exact, Manual_Phrase, Manual_Broad |
| Bidding Strategy | Bidding_Strategy | Pick List | Values: Dynamic_Up_Down, Dynamic_Down_Only, Fixed |
| Daily Budget (INR) | Daily_Budget_INR | Currency | Decimal: 2 |
| Start Date | Start_Date | Date | |
| End Date | End_Date | Date | |
| Country | Country | Pick List | Values: IN, US. Default: IN |
| Top of Search Adjustment % | Top_Search_Adj_Pct | Percent | |
| Product Pages Adjustment % | Product_Pages_Adj_Pct | Percent | |
| Rest of Search Adjustment % | Rest_Search_Adj_Pct | Percent | |

#### Section: Ad Group & Keywords

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Ad Group Name | Ad_Group_Name | Single Line | |
| Default Bid (INR) | Default_Bid_INR | Currency | Decimal: 2 |
| Product ASINs | Product_ASINs | Multi Line | JSON array |
| Target Keywords | Target_Keywords_JSON | Multi Line | JSON: [{keyword, match_type, bid_inr}] |
| Negative Keywords | Negative_Keywords_JSON | Multi Line | JSON: [{keyword, match_type}] |
| Excluded ASINs | Excluded_ASINs | Multi Line | JSON array |
| Keyword Source | Keyword_Source | Pick List | Values: Helium10, Auto_Harvested, Manual, Mixed |

#### Section: Forecast

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Est. Impressions | Est_Impressions | Number | |
| Est. Clicks | Est_Clicks | Number | |
| Est. Orders (Low) | Est_Orders_Low | Number | |
| Est. Orders (High) | Est_Orders_High | Number | |
| Est. Total Spend (INR) | Est_Total_Spend_INR | Currency | Decimal: 2 |
| Est. ACoS Low % | Est_ACoS_Low_Pct | Percent | |
| Est. ACoS High % | Est_ACoS_High_Pct | Percent | |
| Risk Level | Risk_Level | Pick List | Values: LOW, MEDIUM, HIGH |

#### Section: Actuals (cumulative, updated daily by daily-ads-analysis)

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Actual Impressions | Actual_Impressions | Number | Cumulative (campaign-to-date) |
| Actual Clicks | Actual_Clicks | Number | Cumulative |
| Actual Orders | Actual_Orders | Number | Cumulative |
| Actual Spend (INR) | Actual_Spend_INR | Currency | Decimal: 2, cumulative |
| Actual Revenue (INR) | Actual_Revenue_INR | Currency | Decimal: 2, cumulative |
| Actual ACoS % | Actual_ACoS_Pct | Percent | Computed from cumulative totals |
| Actual CVR % | Actual_CVR_Pct | Percent | Computed from cumulative totals |
| Actual CTR % | Actual_CTR_Pct | Percent | Computed from cumulative totals |
| Actual CPC (INR) | Actual_CPC_INR | Currency | Decimal: 2, computed |
| Phase | Phase | Pick List | Values: Discovery, Validation, Scale |
| Data Quality | Data_Quality | Pick List | Values: HIGH, MEDIUM, LOW |

#### Section: Meta

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Campaign Notes | Campaign_Notes | Multi Line | (Notes is reserved keyword) |
| Slack Shared | Slack_Shared | Checkbox | Default: false |
| Confluence URL | Confluence_URL | URL | |

### 2.4 Layout Configuration

- **Detail View:** Identity > Settings > Ad Group & Keywords > Forecast > Actuals > Meta
- **List View:** Campaign_Name, Campaign_Type, Status, Targeting_Type, Daily_Budget_INR, Actual_ACoS_Pct, Data_Quality

---

## 3. Validation Rules (MANUAL — Zoho UI)

> **Why manual:** No MCP tool for creating validation rules. Must be done in Zoho CRM UI.

### Rule 1: Budget Check (Amazon_Ad_Campaigns)

**Navigate:** Setup > Customization > Modules > Amazon Ad Campaigns > Validation Rules > + New Rule

| Setting | Value |
|---------|-------|
| **Rule Name** | Budget Required Before Approval |
| **Module** | Amazon Ad Campaigns |
| **Description** | Ensures daily budget is set before campaign approval |

**Rule criteria (execute rule when):**
```
Status equals "Approved"
AND Daily_Budget_INR is null OR Daily_Budget_INR equals 0
```

**Alert:**
- Message: "Daily budget must be positive before approval"
- Field to highlight: Daily_Budget_INR

### Rule 2: Date Sequence Check (Amazon_Ad_Campaigns)

**Navigate:** Same module > Validation Rules > + New Rule

| Setting | Value |
|---------|-------|
| **Rule Name** | End Date After Start Date |
| **Module** | Amazon Ad Campaigns |
| **Description** | Prevents end date before start date |

**Rule criteria (execute rule when):**
```
End_Date is not null
AND Start_Date is not null
AND End_Date is before Start_Date
```

**Alert:**
- Message: "End date must be after start date"
- Field to highlight: End_Date

---

## 4. Workflow Rules (MANUAL — Zoho UI)

> **Why manual:** No MCP tool for workflow rule creation. Must be done in Zoho CRM UI.
> **Navigate for all rules:** Setup > Automation > Workflow Rules > + Create Rule

### 4.1 Campaign Strategy Activation → Slack

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: Strategy Activated → Slack |
| **Module** | Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Status is modified AND Status equals "Active" |

**Instant Action → Webhook:**

| Setting | Value |
|---------|-------|
| **Name** | Slack ISM Launch Alert — Strategy |
| **URL** | *(your #ism-launch-alerts Slack webhook URL)* |
| **Method** | POST |
| **Body (JSON)** | See below |

```json
{
  "text": "Campaign strategy '${Campaigns.Campaign Name}' activated.\nScenario: ${Campaigns.Scenario Type}\nBudget: INR ${Campaigns.Total Budget INR}\nProduct: ${Campaigns.Product Launch}"
}
```

### 4.2 Ad Campaign Start Date Auto-Set

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: Auto-Set Start Date on Activation |
| **Module** | Amazon Ad Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Status is modified AND Status equals "Active" AND Start_Date is empty |

**Instant Action → Field Update:**

| Field | Value |
|-------|-------|
| Start_Date | Current Date (use `${CURRENTDATE}`) |

### 4.3 ACoS Breakeven Alert

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: ACoS Breakeven Alert |
| **Module** | Amazon Ad Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Actual_ACoS_Pct is modified AND Actual_ACoS_Pct > 0 |

**Instant Action → Custom Function (Deluge):**

> A workflow field update can't cross-reference Product_Launches.Break_even_ACoS directly. Use a Custom Function instead:

```deluge
// Get the linked Product Launch's Break-even ACoS
product_launch_id = input.Product_Launch;
if (product_launch_id != null)
{
    product = zoho.crm.getRecordById("Product_Launches", product_launch_id);
    breakeven = ifnull(product.get("Break_even_ACoS"), 0.0);
    actual = ifnull(input.Actual_ACoS_Pct, 0.0);
    if (actual > breakeven && breakeven > 0)
    {
        // Post to Slack
        slack_payload = Map();
        slack_payload.put("text", "ACoS ALERT: " + input.Name + " at " + actual + "% exceeds breakeven " + breakeven + "%. Campaign: " + input.Campaign_Strategy);
        response = invokeurl
        [
            url: "<your-slack-webhook-url>"
            type: POST
            parameters: slack_payload.toString()
            content-type: "application/json"
        ];
    }
}
```

**Note:** Replace `<your-slack-webhook-url>` with the actual #ism-launch-alerts Slack incoming webhook URL.

### 4.4 Strategy Completion Auto-Transition

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: Strategy Auto-Complete |
| **Module** | Amazon Ad Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Status is modified AND Status equals "Completed" |

**Instant Action → Custom Function (Deluge):**

```deluge
// Check if ALL sibling Amazon_Ad_Campaigns under the same strategy are Completed
strategy_id = input.Campaign_Strategy;
if (strategy_id != null)
{
    siblings = zoho.crm.getRelatedRecords("Ad_Campaigns", "Campaigns", strategy_id);
    all_complete = true;
    for each rec in siblings
    {
        if (rec.get("Status") != "Completed")
        {
            all_complete = false;
        }
    }
    if (all_complete && siblings.size() > 0)
    {
        update_map = Map();
        update_map.put("Status", "Complete");
        zoho.crm.updateRecord("Campaigns", strategy_id, update_map);
    }
}
```

**Note:** The related list API name is confirmed as `Ad_Campaigns` (verified via `getRelatedLists` on Campaigns, 2026-04-06).

---

## 5. Zoho Bigin: One-Way Sync (MANUAL — Zoho UI + Zoho Flow)

> **Why manual:** No MCP tool for Bigin field creation or Zoho Flow rules. Must be done in Zoho Bigin UI and Zoho Flow.

### 5.1 Add Fields to Product Launch Factory Pipeline

**Navigate:** Bigin > Settings > Pipelines > Product Launch Factory > Fields > + New Field

Create these 5 fields (all read-only in practice — only updated by Zoho Flow, never manually):

| # | Field Label | API Name | Type | Picklist Values (if applicable) |
|---|-------------|----------|------|---------------------------------|
| 1 | Active Campaign Strategy | Active_Campaign_Strategy | Single Line | — |
| 2 | Campaign Status | Campaign_Status | Pick List | Planning, Active, Inactive, Complete |
| 3 | Campaign ACoS Current | Campaign_ACoS_Current | Percent | — |
| 4 | Campaign Spend Total | Campaign_Spend_Total | Currency (INR) | — |
| 5 | Gate 2 Verdict | Gate_2_Verdict | Pick List | Scale, Kill, Pivot, Pending |

### 5.2 Create Zoho Flow Rules (CRM → Bigin only)

**Navigate:** flow.zoho.com > + Create Flow

#### Flow 1: Campaign Status Sync

| Setting | Value |
|---------|-------|
| **Flow Name** | ISM: Campaign Status → Bigin |
| **Trigger** | Zoho CRM > Module: Campaigns > When: Record edited |
| **Trigger Filter** | Status is modified OR Campaign_Name is modified |

**Actions (in order):**

1. **Fetch Bigin record** — Custom Function or Zoho CRM lookup:
   - Get the Product_Launch linked to this Campaign
   - Use Product_Launch.Bigin_Record_ID to find the Bigin deal
2. **Update Bigin record:**
   - Active_Campaign_Strategy = `${CRM.Campaigns.Campaign_Name}`
   - Campaign_Status = `${CRM.Campaigns.Status}`

**If no Bigin record found:** Log warning, skip update (don't fail).

#### Flow 2: Campaign Metrics Sync

| Setting | Value |
|---------|-------|
| **Flow Name** | ISM: Campaign Metrics → Bigin |
| **Trigger** | Zoho CRM > Module: Campaigns > When: Record edited |
| **Trigger Filter** | Any of: Agg_ACoS_Pct, Agg_Spend_INR, Gate_2_Verdict is modified |

**Actions (in order):**

1. **Fetch Bigin record** (same pattern as Flow 1)
2. **Update Bigin record:**
   - Campaign_ACoS_Current = `${CRM.Campaigns.Agg_ACoS_Pct}`
   - Campaign_Spend_Total = `${CRM.Campaigns.Agg_Spend_INR}`
   - Gate_2_Verdict = `${CRM.Campaigns.Gate_2_Verdict}`

### 5.3 Important: No Reverse Sync

- **Never** create a Bigin → CRM flow for these fields
- Bigin is a read-only visibility layer for campaign data
- All writes happen in CRM (via MCP / daily-ads-analysis task)

---

## 6. MCP Integration Notes

> See `docs/zoho-mcp-connection.md` for full connection strategy, tool list, and API gotchas.

### 6.1 Verified CRUD Patterns (all tested 2026-04-06)

```bash
MCP_URL="<from .mcp.json zoho-crm endpoint>"

# Create strategy (AO SCENARIO → Campaigns)
ZohoCRM_createRecords  path_variables.module="Campaigns"
  body.data: [{Campaign_Name, Type:"Amazon PPC Test", Scenario_Type, Product_Launch:{id:PL_ID}, ...}]

# Create individual campaigns (N per strategy)
ZohoCRM_createRecords  path_variables.module="Amazon_Ad_Campaigns"
  body.data: [{Name, Campaign_Strategy:{id:STRATEGY_ID}, Product_Launch:{id:PL_ID}, ...}]

# Update campaign actuals (daily-ads-analysis)
ZohoCRM_updateRecord  path_variables.module="Amazon_Ad_Campaigns"  recordID=RECORD_ID
  body.data: [{Actual_Impressions, Actual_Clicks, Actual_Spend_INR, ...}]

# Update strategy aggregates
ZohoCRM_updateRecord  path_variables.module="Campaigns"  recordID=STRATEGY_ID
  body.data: [{Agg_Impressions, Agg_Clicks, Agg_ACoS_Pct, ...}]

# Read active strategies
ZohoCRM_executeCOQLQuery  body.select_query="SELECT ... FROM Campaigns WHERE Type = 'Amazon PPC Test' AND Status = 'Active' LIMIT 50"

# Read campaigns for a strategy (related list name = Ad_Campaigns)
ZohoCRM_getRelatedRecords  path_variables: parentRecordModule="Campaigns" parentRecord=STRATEGY_ID relatedList="Ad_Campaigns"
  query_params.fields="Name,Campaign_Type,Status,..."

# Log daily snapshot
ZohoCRM_createRecords  path_variables.module="ISM_ExecutionLogs"
  body.data: [{Name:"daily-ads-analysis-YYYY-MM-DD", Skill_Name:"daily-ads-analysis", Output_Summary:"{json}", ...}]
```

### 6.2 Module IDs (confirmed)

| Module | ID |
|--------|-----|
| Campaigns | 645926000000000055 |
| Amazon_Ad_Campaigns | 645926000009971002 |
| Product_Launches | 645926000008511067 |
| ISM_ExecutionLogs | 645926000009175428 |

### 6.3 Key Related List API Names

| Parent Module | Related List API Name | Child Module |
|---------------|----------------------|--------------|
| Campaigns | Ad_Campaigns | Amazon_Ad_Campaigns |
| Campaigns | Child_Campaigns | Campaigns (self) |
| Product_Launches | Campaign_Strategies | Campaigns |
| Product_Launches | Amazon_Ad_Campaigns | Amazon_Ad_Campaigns |

---

## 7. Implementation Checklist

### Zoho CRM — Campaigns Module
- [x] Add "Amazon PPC Test" to Campaign Type picklist (accepted via API; add to UI dropdown manually)
- [x] Add lookup field to Product_Launches (field ID: 645926000009961001)
- [x] Create custom fields — 17 fields: strategy, aggregates, gate_2 sections (all SUCCESS)
- [ ] Configure layout and list view (manual — arrange sections in Zoho UI)
- [x] Verify MCP access — full CRUD confirmed via direct HTTP JSON-RPC

### Zoho CRM — Amazon_Ad_Campaigns Module
- [x] Create custom module (module ID: 645926000009971002)
- [x] Add lookup fields to Campaigns (645926000009973001) + Product_Launches (645926000009973026)
- [x] Create all field groups — 43 custom fields across identity, settings, ad_group_keywords, forecast, actuals, meta (all SUCCESS)
- [ ] Configure layout and list view (manual — arrange sections in Zoho UI)
- [ ] Add validation rules (budget, dates)
- [ ] Record module ID in crm-field-mappings.ctx.json

### Validation Rules (MANUAL — Zoho UI, see §3)
- [ ] Create rule: Budget Required Before Approval (Amazon_Ad_Campaigns)
- [ ] Create rule: End Date After Start Date (Amazon_Ad_Campaigns)

### Workflow Rules (MANUAL — Zoho UI, see §4)
- [ ] Create workflow 4.1: Strategy Activated → Slack webhook
- [ ] Create workflow 4.2: Auto-Set Start Date on Activation
- [ ] Create workflow 4.3: ACoS Breakeven Alert (Custom Function + Slack)
- [ ] Create workflow 4.4: Strategy Auto-Complete (Custom Function)

### Zoho Bigin (MANUAL — Bigin UI + Zoho Flow, see §5)
- [ ] Add 5 new fields to Product Launch Factory pipeline (§5.1)
- [ ] Create Zoho Flow: Campaign Status → Bigin (§5.2 Flow 1)
- [ ] Create Zoho Flow: Campaign Metrics → Bigin (§5.2 Flow 2)

### Validation (MCP verified 2026-04-06)
- [x] MCP: create Campaigns record + 2 linked Amazon_Ad_Campaigns, verify lookups
  - Strategy: 645926000009962086, Ad campaigns: 645926000009973216, 645926000009973217
  - Related list API name on Campaigns: `Ad_Campaigns` (not Amazon_Ad_Campaigns)
  - Lookups verified: Campaign_Strategy → Campaigns, Product_Launch → Product_Launches
- [x] MCP: update cumulative actuals, verify aggregates on Campaigns
  - Set actuals on both campaigns, aggregated to strategy: 8300 imp, 201 clicks, 14 orders, INR 2256 spend
- [x] MCP: create ISM_ExecutionLogs entry with daily snapshot JSON (id: 645926000009970087)
- [ ] Workflow: status transitions trigger Slack (requires manual workflow setup first)
- [ ] Bigin: verify one-way sync updates fields (requires manual Zoho Flow setup first)

### Cleanup
- [ ] Delete test record 645926000009961103 (__DELETE_ME_TEST_RECORD__)
- [ ] Optionally delete test strategy 645926000009962086 + ad campaigns after workflow verification

---

## 8. Data Migration

No migration needed — Campaign_Plans module was never created in Zoho. This is a clean implementation of the two-module design.
