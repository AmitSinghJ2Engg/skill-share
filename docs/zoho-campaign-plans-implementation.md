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

## 4. Workflow Rules

> **Navigate:** Setup > Automation > Workflow Rules > + Create Rule
> All rules use native Zoho CRM **Instant Slack Notification** actions. Channel: `#marketing-ops-alerts` (Slack ID: C081MG4HXK6). Requires Zoho CRM Slack integration to be authorized (Setup > Channels > Chat > Slack).

### 4.1 Campaign Strategy Activation → Slack — DONE (workflow ID: 645926000010000003)

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: Strategy Activated → Slack |
| **Module** | Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Status is modified AND Status equals "Active" |

**Instant Action → Slack Notification** to `#marketing-ops-alerts`:

```
📊 Campaign Strategy Activated
Strategy: ${Campaigns.Campaign Name}
Scenario: ${Campaigns.Scenario Type}
Phase: ${Campaigns.Test Phase}
Total Budget: INR ${Campaigns.Total Budget INR}
Product: ${Campaigns.Product Launch}
```

> Rule created via MCP on 2026-04-07. Slack action configured manually in Zoho UI.

### ~~4.2 Ad Campaign Start Date Auto-Set~~ — REMOVED

> Start_Date should be set by the caller (MCP / daily-ads-analysis) in the same API call that sets Status to "Active". No server-side workflow needed.

### 4.3 ACoS Update Alert → Slack

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: ACoS Update Alert |
| **Module** | Amazon Ad Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Actual_ACoS_Pct is modified AND Actual_ACoS_Pct > 0 |

**Instant Action → Slack Notification** to `#marketing-ops-alerts`:

```
⚠️ ACoS Update — Review Required
Campaign: ${Amazon Ad Campaigns.Name}
Type: ${Amazon Ad Campaigns.Campaign Type} | Targeting: ${Amazon Ad Campaigns.Targeting Type}
Actual ACoS: ${Amazon Ad Campaigns.Actual ACoS Pct}%
Breakeven ACoS: ${Amazon Ad Campaigns.Lookup:Product Launch.Break even ACoS}%
Actual Spend: INR ${Amazon Ad Campaigns.Actual Spend INR}
Revenue: INR ${Amazon Ad Campaigns.Actual Revenue INR}
Strategy: ${Amazon Ad Campaigns.Lookup:Campaign Strategy.Campaign Name}
```

> **Design note:** Uses native Slack notification with lookup merge fields instead of Deluge custom function + Zoho Flow webhook. Both actual ACoS and breakeven ACoS are shown side-by-side so the team can assess at a glance. No programmatic comparison needed — human reads the alert.

### 4.5 Aggregate Rollup to Strategy (MANUAL — Deluge Custom Function)

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: Rollup Actuals to Strategy |
| **Module** | Amazon Ad Campaigns |
| **When** | On a record action — Create or Edit |
| **Condition** | Any — match all records (no criteria filter) |

**Instant Action → Custom Function (Deluge):**

Function arguments (configure in Zoho UI):
- `int Campaign_Strategy` — mapped to Amazon_Ad_Campaigns.Campaign_Strategy

```deluge
// ISM: Rollup Actuals to Strategy
// Sums actuals from all child Amazon_Ad_Campaigns and updates parent Campaigns record
info "Rollup: checking strategy_id=" + Campaign_Strategy;

if (Campaign_Strategy != null && Campaign_Strategy != 0)
{
    siblings = zoho.crm.getRelatedRecords("Ad_Campaigns", "Campaigns", Campaign_Strategy);
    total_imp = 0;
    total_clicks = 0;
    total_orders = 0;
    total_spend = 0.0;
    total_rev = 0.0;

    for each rec in siblings
    {
        total_imp = total_imp + ifnull(rec.get("Actual_Impressions"), 0).toLong();
        total_clicks = total_clicks + ifnull(rec.get("Actual_Clicks"), 0).toLong();
        total_orders = total_orders + ifnull(rec.get("Actual_Orders"), 0).toLong();
        total_spend = total_spend + ifnull(rec.get("Actual_Spend_INR"), 0.0).toDecimal();
        total_rev = total_rev + ifnull(rec.get("Actual_Revenue_INR"), 0.0).toDecimal();
    }

    // Compute derived ratios
    acos = if(total_rev > 0, (total_spend / total_rev * 100).round(2), 0.0);
    cvr = if(total_clicks > 0, (total_orders.toDecimal() / total_clicks * 100).round(2), 0.0);
    ctr = if(total_imp > 0, (total_clicks.toDecimal() / total_imp * 100).round(2), 0.0);

    info "Rollup: imp=" + total_imp + " clicks=" + total_clicks + " orders=" + total_orders + " spend=" + total_spend + " rev=" + total_rev;
    info "Rollup: acos=" + acos + "% cvr=" + cvr + "% ctr=" + ctr + "%";

    update_map = Map();
    update_map.put("Agg_Impressions", total_imp);
    update_map.put("Agg_Clicks", total_clicks);
    update_map.put("Agg_Orders", total_orders);
    update_map.put("Agg_Spend_INR", total_spend);
    update_map.put("Agg_Revenue_INR", total_rev);
    update_map.put("Agg_ACoS_Pct", acos);
    update_map.put("Agg_CVR_Pct", cvr);
    update_map.put("Agg_CTR_Pct", ctr);

    result = zoho.crm.updateRecord("Campaigns", Campaign_Strategy, update_map);
    info "Rollup: updated strategy, result=" + result;
}
else
{
    info "Rollup: SKIPPED — no Campaign_Strategy linked";
}
```

### 4.4 Strategy Completion Auto-Transition — DONE (workflow ID: 645926000010005071)

| Setting | Value |
|---------|-------|
| **Rule Name** | ISM: Strategy Auto-Complete |
| **Module** | Amazon Ad Campaigns |
| **When** | On a record action — Edit |
| **Condition** | Status is modified AND Status equals "Completed" |

**Instant Action → Custom Function (Deluge):**

Function arguments (configure in Zoho UI):
- `int Campaign_Strategy` — mapped to Amazon_Ad_Campaigns.Campaign_Strategy

```deluge
// ISM: Strategy Auto-Complete
// When all child Amazon_Ad_Campaigns are Completed, auto-complete the parent Campaigns record
info "Strategy AutoComplete: checking strategy_id=" + Campaign_Strategy;

if (Campaign_Strategy != null && Campaign_Strategy != 0)
{
    siblings = zoho.crm.getRelatedRecords("Ad_Campaigns", "Campaigns", Campaign_Strategy);
    total = siblings.size();
    completed_count = 0;
    all_complete = true;

    for each rec in siblings
    {
        status = rec.get("Status");
        info "Strategy AutoComplete: sibling " + rec.get("Name") + " status=" + status;
        if (status != "Completed")
        {
            all_complete = false;
        }
        else
        {
            completed_count = completed_count + 1;
        }
    }

    info "Strategy AutoComplete: " + completed_count + "/" + total + " completed, all_complete=" + all_complete;

    if (all_complete && total > 0)
    {
        update_map = Map();
        update_map.put("Status", "Complete");
        result = zoho.crm.updateRecord("Campaigns", Campaign_Strategy, update_map);
        info "Strategy AutoComplete: updated strategy to Complete, result=" + result;
    }
}
else
{
    info "Strategy AutoComplete: SKIPPED — no Campaign_Strategy linked";
}
```

**Note:** Related list API name confirmed as `Ad_Campaigns` (verified 2026-04-06).

---

## 5. Zoho Bigin: One-Way Sync (MCP — task-side, replaces Zoho Flow)

> **Revised approach:** Instead of Zoho Flow rules, the `daily-ads-analysis` task pushes campaign data to Bigin in the same MCP run that updates CRM. This is simpler, debuggable (logged in ISM_ExecutionLogs), and has no async delays.

### 5.1 Bigin Pipeline Fields — DONE

All 5 fields created on Product Launch Factory pipeline (as single-line text/double/currency — values sourced from CRM):

| Field | API Name | Bigin Type | Confirmed |
|-------|----------|-----------|-----------|
| Active Campaign Strategy | Active_Campaign_Strategy | text | verified 2026-04-07 |
| Campaign Status | Campaign_Status | text | verified 2026-04-07 |
| Campaign ACoS Current | Campaign_ACoS_Current | double | verified 2026-04-07 |
| Campaign Spend Total | Campaign_Spend_Total | currency | verified 2026-04-07 |
| Gate 2 Verdict | Gate_2_Verdict | text | verified 2026-04-07 |

### 5.2 MCP Sync Pattern (CRM → Bigin)

**How it works:** After updating Campaigns aggregates in CRM, the task finds the corresponding Bigin record and pushes the campaign fields.

**Record lookup chain:**
```
Campaign.Product_Launch (CRM lookup) → Product_Launch record ID
  → Bigin_searchRecords(criteria="CRM_Record_ID:equals:{product_launch_id}")
  → Bigin record ID
  → Bigin_updateSpecificRecord with campaign fields
```

**Verified MCP calls (tested 2026-04-07):**

```bash
BIGIN_URL="<from .mcp.json zoho-bigin endpoint>"

# 1. Find Bigin record by CRM Product_Launch ID
Bigin_searchRecords
  path_variables.module_api_name="Pipelines"
  query_params.criteria="(CRM_Record_ID:equals:{PRODUCT_LAUNCH_ID})"
  → returns Bigin record with id

# 2. Update Bigin record with campaign data
Bigin_updateSpecificRecord
  path_variables.module_api_name="Pipelines"  id={BIGIN_RECORD_ID}
  body.data: [{
    Active_Campaign_Strategy: campaign_name,
    Campaign_Status: campaign_status,
    Campaign_ACoS_Current: agg_acos_pct,
    Campaign_Spend_Total: agg_spend_inr,
    Gate_2_Verdict: gate_2_verdict
  }]
```

### 5.3 Important: No Reverse Sync

- **Never** update CRM from Bigin for these fields
- Bigin is a read-only visibility layer for campaign data
- All writes happen in CRM first, then push to Bigin via MCP

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

### Workflow Rules (see §4 — all use native Slack instant actions)
- [x] 4.1: Strategy Activated → Slack (MCP rule ID: 645926000010000003, Slack action configured in UI)
- [x] ~~4.2: Auto-Set Start Date~~ — REMOVED (caller sets Start_Date in same API call)
- [ ] 4.3: ACoS Update Alert → Slack (native Slack notification — no Deluge/Flow needed, see §4.3 for message template)
- [x] 4.4: Strategy Auto-Complete (Deluge, ID: 645926000010005071, tested — auto-completes strategy)

### Zoho Bigin (MCP sync, see §5)
- [x] Add 5 fields to Product Launch Factory pipeline (§5.1) — all created as text/double/currency
- [x] MCP sync pattern verified: search by CRM_Record_ID + update (§5.2, tested 2026-04-07)
- [x] ~~Zoho Flow rules~~ — REPLACED by task-side MCP sync (no Flow needed)

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
