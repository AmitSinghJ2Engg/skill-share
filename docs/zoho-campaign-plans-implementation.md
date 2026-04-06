# Zoho CRM & Bigin — Campaign_Plans Implementation Plan

**Date:** 2026-04-06
**DL-016 reference:** Phase 1 design in `context/product-pipeline/campaign-plans-module-design.ctx.json`
**Status:** Plan — not yet implemented in Zoho

---

## 1. Zoho CRM: Create Campaign_Plans Custom Module

### 1.1 Module Creation

In Zoho CRM > Setup > Modules and Fields > Create New Module:

- **Module Name:** Campaign Plans
- **API Name:** Campaign_Plans (auto-generated)
- **Module Icon:** Bullseye or Chart
- **Singular Label:** Campaign Plan
- **Plural Label:** Campaign Plans

### 1.2 Lookup Field

Create a lookup field to Product_Launches:
- **Field Name:** Product_Launch
- **Related Module:** Product Launches (ID: 645926000008511067)
- **Related List Name:** Campaign Plans (appears on Product_Launches detail view)

### 1.3 Field Groups and Fields

Create fields in the order below. Group them using Zoho CRM sections.

#### Section: Identity

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Plan Name | Plan_Name | Single Line | Required, Unique |
| Plan Version | Plan_Version | Number | Default: 1 |
| Plan Status | Plan_Status | Pick List | Values: Draft, Approved, Active, Completed, Archived. Default: Draft |
| Scenario Type | Scenario_Type | Pick List | Values: Conservative, Balanced, Aggressive, Keyword_Focused, Custom |
| Approved By | Approved_By | User Lookup | |
| Approved Date | Approved_Date | Date | |

#### Section: Campaign Settings

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Campaign Name | Campaign_Name | Single Line | Amazon Seller Central campaign name |
| Start Date | Start_Date | Date | |
| End Date | End_Date | Date | |
| Country | Country | Pick List | Values: IN, US. Default: IN |
| Daily Budget (INR) | Daily_Budget_INR | Currency | Decimal: 2 |
| Total Budget Estimate (INR) | Total_Budget_Estimate_INR | Currency | Decimal: 2 |
| Bidding Strategy | Bidding_Strategy | Pick List | Values: Dynamic_Up_Down, Dynamic_Down_Only, Fixed |

#### Section: Bidding Details

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Top of Search Adjustment % | Top_of_Search_Adjustment_Pct | Percent | |
| Product Pages Adjustment % | Product_Pages_Adjustment_Pct | Percent | |
| Rest of Search Adjustment % | Rest_of_Search_Adjustment_Pct | Percent | |

#### Section: Ad Groups & Targeting

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Ad Group Name | Ad_Group_Name | Single Line | |
| Targeting Type | Targeting_Type | Pick List | Values: Auto, Manual_Exact, Manual_Phrase, Manual_Broad |
| Default Bid (INR) | Default_Bid_INR | Currency | Decimal: 2 |
| Product ASINs | Product_ASINs | Multi Line | JSON array of ASINs |

#### Section: Keywords

| Field Name | API Name | Type | Properties |
|---|---|---|---|
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

#### Section: Actuals (updated daily by daily-ads-analysis task)

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Actual Impressions | Actual_Impressions | Number | |
| Actual Clicks | Actual_Clicks | Number | |
| Actual Orders | Actual_Orders | Number | |
| Actual Spend (INR) | Actual_Spend_INR | Currency | Decimal: 2 |
| Actual Revenue (INR) | Actual_Revenue_INR | Currency | Decimal: 2 |
| Actual ACoS % | Actual_ACoS_Pct | Percent | |
| Actual CVR % | Actual_CVR_Pct | Percent | |
| Actual CTR % | Actual_CTR_Pct | Percent | |
| Actual CPC (INR) | Actual_CPC_INR | Currency | Decimal: 2 |
| Phase | Phase | Pick List | Values: Discovery, Validation, Scale |
| Data Quality | Data_Quality | Pick List | Values: HIGH, MEDIUM, LOW |

#### Section: Meta

| Field Name | API Name | Type | Properties |
|---|---|---|---|
| Notes | Notes | Multi Line | |
| Slack Shared | Slack_Shared | Checkbox | Default: false |
| Confluence URL | Confluence_URL | URL | |

### 1.4 Layout Configuration

- **Default Layout:** Include all fields above
- **Detail View:** Arrange sections in order: Identity > Campaign Settings > Bidding > Ad Groups > Keywords > Forecast > Actuals > Meta
- **List View:** Plan_Name, Plan_Status, Scenario_Type, Daily_Budget_INR, Actual_ACoS_Pct, Data_Quality

### 1.5 Validation Rules

| Rule | Condition | Error Message |
|---|---|---|
| Budget check | Daily_Budget_INR > 0 when Plan_Status = Approved | "Daily budget must be positive before approval" |
| Date check | End_Date > Start_Date when both filled | "End date must be after start date" |
| Approval gate | Approved_By required when Plan_Status changes to Approved | "Approver required for plan approval" |

---

## 2. Zoho CRM: Workflow Rules

### 2.1 Plan Approval Notification

- **Trigger:** Plan_Status changes from Draft to Approved
- **Action:** Email alert to plan owner + Slack notification via webhook to #ism-launch-alerts
- **Template:** "Campaign Plan '{Plan_Name}' approved by {Approved_By}. Start: {Start_Date}. Budget: INR {Daily_Budget_INR}/day."

### 2.2 Plan Activation

- **Trigger:** Plan_Status changes from Approved to Active
- **Action:** Set Start_Date to today if blank. Send Slack notification.

### 2.3 Plan Completion

- **Trigger:** End_Date reached AND Plan_Status = Active
- **Action:** Update Plan_Status to Completed. Trigger daily-ads-analysis final summary.

### 2.4 ACoS Alert

- **Trigger:** Actual_ACoS_Pct updated AND Actual_ACoS_Pct > breakeven threshold (from Product_Launches.Break_even_ACoS)
- **Action:** Slack alert to #ism-launch-alerts: "ACoS exceeded breakeven for {Plan_Name}"

---

## 3. Zoho Bigin: Pipeline Updates

### 3.1 Current Pipeline Stages (Product Launch Factory)

The existing Bigin pipeline covers stages 1-10. Campaign_Plans maps to stages 5-6:
- **Stage 5: Paid Testing** — Campaign_Plans with Plan_Status = Active
- **Stage 6: Scale Decision** — Campaign_Plans with Plan_Status = Completed + Gate 2 evaluation

### 3.2 Bigin Field Additions

Add to the Product Launch Factory pipeline record:

| Field Name | Type | Purpose |
|---|---|---|
| Active_Campaign_Plan_Name | Text | Name of active Campaign_Plan (synced from CRM) |
| Campaign_Plan_Status | Pick List | Draft/Approved/Active/Completed (synced from CRM) |
| Campaign_ACoS_Current | Percent | Latest ACoS from active campaign (synced daily) |
| Campaign_Spend_Total | Currency | Cumulative spend across all campaigns (synced daily) |

### 3.3 Bigin <-> CRM Sync Rules

| Direction | Trigger | Fields Synced |
|---|---|---|
| CRM -> Bigin | Campaign_Plans.Plan_Status changes | Active_Campaign_Plan_Name, Campaign_Plan_Status |
| CRM -> Bigin | Daily-ads-analysis updates actuals | Campaign_ACoS_Current, Campaign_Spend_Total |
| Bigin -> CRM | Stage advanced to 5 (Paid Testing) | Creates placeholder Campaign_Plans record with Plan_Status = Draft |

**Sync method:** Zoho Flow or Deluge custom function triggered by workflow rules.

---

## 4. MCP Integration Notes

### 4.1 Campaign_Plans CRUD via MCP

The zoho-data-ops skill accesses Campaign_Plans through Zoho CRM MCP:

```
# Create plan (after AO SCENARIO mode selects a scenario)
zoho_crm_create_record(module: "Campaign_Plans", data: {Plan_Name, Scenario_Type, ...})

# Update actuals (daily-ads-analysis task)
zoho_crm_update_record(module: "Campaign_Plans", id: record_id, data: {Actual_Impressions, ...})

# Read active plans (daily-ads-analysis Step 1)
zoho_crm_search_records(module: "Campaign_Plans", criteria: "(Plan_Status:equals:Active)")

# Read plans for a product
zoho_crm_get_related_records(module: "Product_Launches", id: product_id, related: "Campaign_Plans")
```

### 4.2 Module ID Discovery

After creating the module in Zoho CRM, record the module ID:
1. Go to Setup > Developer Hub > APIs > API Names
2. Find Campaign_Plans module ID
3. Update `crm-field-mappings.ctx.json` with the actual module ID

### 4.3 Bigin Updates via MCP

```
# Update Bigin pipeline record with campaign data
zoho_bigin_update_record(module: "Pipelines", id: bigin_record_id, data: {Active_Campaign_Plan_Name, Campaign_ACoS_Current, ...})
```

---

## 5. Implementation Checklist

### Zoho CRM
- [ ] Create Campaign_Plans custom module
- [ ] Add lookup field to Product_Launches
- [ ] Create all field groups (identity, campaign_settings, bidding_details, ad_groups, keywords, forecast, actuals, meta)
- [ ] Configure default layout and list view
- [ ] Add validation rules (budget, dates, approval)
- [ ] Create workflow: Plan Approval Notification
- [ ] Create workflow: Plan Activation
- [ ] Create workflow: Plan Completion
- [ ] Create workflow: ACoS Alert
- [ ] Record module ID in crm-field-mappings.ctx.json
- [ ] Test MCP CRUD operations (create, read, update, search)

### Zoho Bigin
- [ ] Add 4 new fields to Product Launch Factory pipeline
- [ ] Create CRM -> Bigin sync rule (Plan_Status changes)
- [ ] Create CRM -> Bigin sync rule (daily actuals)
- [ ] Create Bigin -> CRM sync rule (Stage 5 trigger)
- [ ] Test sync in both directions

### Validation
- [ ] Create a test Campaign_Plan via MCP, verify all fields save correctly
- [ ] Update actuals via MCP, verify cumulative calculations
- [ ] Trigger Plan_Status transitions, verify workflow rules fire
- [ ] Verify Bigin sync updates pipeline record
- [ ] Run daily-ads-analysis task against test plan, verify full flow

---

## 6. Data Migration

No migration needed — this is a new module. Existing products in stages 5-6 without Campaign_Plans records will have plans created retroactively during their next test-campaign task execution (via the new Step 1.6 in the updated test-campaign prompt).
