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

In Zoho CRM > Setup > Modules and Fields > Create New Module:

- **Module Name:** Amazon Ad Campaigns
- **API Name:** Amazon_Ad_Campaigns (auto-generated)
- **Singular Label:** Amazon Ad Campaign
- **Plural Label:** Amazon Ad Campaigns

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
| Top of Search Adjustment % | Top_of_Search_Adjustment_Pct | Percent | |
| Product Pages Adjustment % | Product_Pages_Adjustment_Pct | Percent | |
| Rest of Search Adjustment % | Rest_of_Search_Adjustment_Pct | Percent | |

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
| Notes | Notes | Multi Line | |
| Slack Shared | Slack_Shared | Checkbox | Default: false |
| Confluence URL | Confluence_URL | URL | |

### 2.4 Layout Configuration

- **Detail View:** Identity > Settings > Ad Group & Keywords > Forecast > Actuals > Meta
- **List View:** Campaign_Name, Campaign_Type, Status, Targeting_Type, Daily_Budget_INR, Actual_ACoS_Pct, Data_Quality

---

## 3. Validation Rules

### Amazon_Ad_Campaigns

| Rule | Condition | Error Message |
|---|---|---|
| Budget check | Daily_Budget_INR > 0 when Status = Approved | "Daily budget must be positive before approval" |
| Date check | End_Date > Start_Date when both filled | "End date must be after start date" |

---

## 4. Workflow Rules

### 4.1 Campaign Strategy Activation

- **Trigger:** Campaigns.Status changes to Active
- **Action:** Slack webhook to #ism-launch-alerts
- **Template:** "Campaign strategy '{Campaign_Name}' activated. Scenario: {Scenario_Type}. Budget: INR {Total_Budget_INR}."

### 4.2 Ad Campaign Start Date

- **Trigger:** Amazon_Ad_Campaigns.Status changes to Active
- **Action:** Set Start_Date to today if blank

### 4.3 ACoS Breakeven Alert

- **Trigger:** Amazon_Ad_Campaigns.Actual_ACoS_Pct updated AND > breakeven (from Product_Launches.Break_even_ACoS)
- **Action:** Slack alert to #ism-launch-alerts: "ACoS exceeded breakeven for {Campaign_Name}"

### 4.4 Strategy Completion

- **Trigger:** All child Amazon_Ad_Campaigns have Status = Completed
- **Action:** Update Campaigns.Status -> Completed

---

## 5. Zoho Bigin: One-Way Sync (CRM -> Bigin)

### 5.1 New Fields on Product Launch Factory Pipeline

| Field Name | Type | Source |
|---|---|---|
| Active_Campaign_Strategy | Text | Campaigns.Campaign_Name |
| Campaign_Status | Pick List | Campaigns.Status |
| Campaign_ACoS_Current | Percent | Campaigns.Agg_ACoS_Pct |
| Campaign_Spend_Total | Currency | Campaigns.Agg_Spend_INR |
| Gate_2_Verdict | Pick List | Campaigns.Gate_2_Verdict |

### 5.2 Zoho Flow Rules (CRM -> Bigin only, no reverse)

1. **Status sync:** Campaigns.Status changes -> update Bigin strategy name + status
2. **Metrics sync:** Campaigns aggregate fields updated -> update Bigin ACoS + spend + Gate 2 verdict

No Bigin -> CRM sync. Bigin is a read-only visibility layer.

---

## 6. MCP Integration Notes

### 6.1 CRUD via MCP

```
# Create strategy (after AO SCENARIO mode selects a scenario)
zoho_crm_create_record(module: "Campaigns", data: {Campaign_Name, Scenario_Type, Type: "Amazon PPC Test", ...})

# Create individual campaigns (N per strategy)
zoho_crm_create_record(module: "Amazon_Ad_Campaigns", data: {Campaign_Name, Campaign_Strategy: campaign_id, ...})

# Update campaign actuals (daily-ads-analysis task)
zoho_crm_update_record(module: "Amazon_Ad_Campaigns", id: record_id, data: {Actual_Impressions, ...})

# Update strategy aggregates (daily-ads-analysis task)
zoho_crm_update_record(module: "Campaigns", id: strategy_id, data: {Agg_Impressions, Agg_ACoS_Pct, ...})

# Read active strategies
zoho_crm_search_records(module: "Campaigns", criteria: "(Status:equals:Active)(Type:equals:Amazon PPC Test)")

# Read campaigns for a strategy
zoho_crm_get_related_records(module: "Campaigns", id: strategy_id, related: "Amazon_Ad_Campaigns")

# Log daily snapshot
zoho_crm_create_record(module: "ISM_ExecutionLogs", data: {Skill_Name: "daily-ads-analysis", Output_Summary: "{json}", ...})
```

### 6.2 Module ID Discovery

After customizing Campaigns and creating Amazon_Ad_Campaigns:
1. Campaigns ID is known: 645926000004114076
2. Amazon_Ad_Campaigns: go to Setup > Developer Hub > APIs > API Names, find module ID
3. Update `crm-field-mappings.ctx.json` with the Amazon_Ad_Campaigns module ID

### 6.3 Bigin Updates via MCP

```
zoho_bigin_update_record(module: "Pipelines", id: bigin_record_id, data: {Active_Campaign_Strategy, Campaign_ACoS_Current, ...})
```

---

## 7. Implementation Checklist

### Zoho CRM — Campaigns Module
- [ ] Add "Amazon PPC Test" to Campaign Type picklist
- [ ] Add lookup field to Product_Launches
- [ ] Create custom fields (strategy, aggregates, gate_2 sections)
- [ ] Configure layout and list view
- [ ] Verify MCP access via `crm_data_metadata`

### Zoho CRM — Amazon_Ad_Campaigns Module
- [ ] Create custom module
- [ ] Add lookup fields to Campaigns + Product_Launches
- [ ] Create all field groups (identity, settings, ad_group_keywords, forecast, actuals, meta)
- [ ] Configure layout and list view
- [ ] Add validation rules (budget, dates)
- [ ] Record module ID in crm-field-mappings.ctx.json

### Workflow Rules
- [ ] Create workflow: Campaign Strategy Activation -> Slack
- [ ] Create workflow: Ad Campaign Start Date auto-set
- [ ] Create workflow: ACoS Breakeven Alert
- [ ] Create workflow: Strategy Completion auto-transition

### Zoho Bigin
- [ ] Add 5 new fields to Product Launch Factory pipeline
- [ ] Create Zoho Flow rule: status sync (CRM -> Bigin)
- [ ] Create Zoho Flow rule: metrics sync (CRM -> Bigin)

### Validation
- [ ] MCP: create Campaigns record + 2 linked Amazon_Ad_Campaigns, verify lookups
- [ ] MCP: update cumulative actuals, verify aggregates on Campaigns
- [ ] MCP: create ISM_ExecutionLogs entry with daily snapshot JSON
- [ ] Workflow: status transitions trigger Slack
- [ ] Bigin: verify one-way sync updates fields

---

## 8. Data Migration

No migration needed — Campaign_Plans module was never created in Zoho. This is a clean implementation of the two-module design.
