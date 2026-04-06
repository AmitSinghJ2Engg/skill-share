# Task: Daily Ads Analysis

## Inputs

- CRM read: Campaigns records where Status = Active AND Type = "Amazon PPC Test"
- CRM read: Amazon_Ad_Campaigns records linked to active Campaigns
- CRM read: Product_Launches records linked to active Campaigns (stages 5-6)
- User input: daily ad metrics (Search Term Report CSV export or manual summary from Seller Central)
- Project context: `ppc-test-campaign-config.ctx.json` (thresholds, data quality criteria)
- Project context: `crm-field-mappings.ctx.json` (CRM field API names)
- Project context: `amazon-ads-campaign-fields.ctx.json` (Amazon Ads field reference)

## Prerequisites (verify before proceeding)

| Check | Source | Required |
|---|---|---|
| At least 1 Campaigns record with Status = Active, Type = "Amazon PPC Test" | CRM Campaigns | Yes |
| At least 1 Amazon_Ad_Campaigns record linked to active Campaigns | CRM Amazon_Ad_Campaigns | Yes |
| Linked Product_Launches record exists | CRM Product_Launches | Yes |
| Today's metrics available (CSV or manual) | User provides | Yes |

If no active Campaigns exist, skip run and log "no active campaigns" to ISM_ExecutionLogs.

## Steps

### Step 0: Dedup check

Query ISM_ExecutionLogs for Skill_Name = "daily-ads-analysis" AND Execution_Date = today. If found, SKIP and log "duplicate run prevented" to Slack #ism-launch-alerts.

### Step 1: Query active campaigns

Read CRM for Campaigns where Status = "Active" AND Type = "Amazon PPC Test". For each, load linked Amazon_Ad_Campaigns records and the linked Product_Launches record. Collect: product name, ASIN, campaign phase (Discovery/Validation/Scale), start date, budget, breakeven ACoS, individual campaign names and types.

### Step 2: Collect today's metrics

Request daily ad metrics from user. Accept either:
- Search Term Report CSV from Seller Central
- Manual summary: impressions, clicks, orders, spend, revenue per individual campaign (Amazon_Ad_Campaigns level)

### Step 3: Analyze performance

For each active Amazon_Ad_Campaigns record:

**If campaign is in Discovery or Validation phase:**
- Invoke **AO- ads-ops TEST mode** with phase = `analyze_discovery` or `analyze_validation`
- Compute: daily ACoS, CTR, CVR, CPC, spend vs budget
- Classify keywords into 4 buckets (winner/learner/loser/no_data)
- Rate data quality (HIGH/MEDIUM/LOW)

**If campaign is past validation (Scale phase):**
- Invoke **AO- ads-ops LIVE mode** for health_check
- Compute: campaign health, wasted spend, bid optimization recommendations

### Step 4: Compare trends

Query ISM_ExecutionLogs for previous daily-ads-analysis snapshots to compute trends.

For each Amazon_Ad_Campaigns record, compare today vs:
- **Yesterday:** delta on impressions, clicks, orders, ACoS, spend
- **Cumulative:** running totals since campaign start, trend direction (improving/stable/declining)

Flag anomalies:
- Spend spike: daily spend > 150% of daily budget
- ACoS jump: daily ACoS > breakeven ACoS + 20pp
- CTR drop: daily CTR < 50% of cumulative CTR
- Zero orders: clicks > 20 but orders = 0 today

### Step 5: Update Amazon_Ad_Campaigns actuals

For each Amazon_Ad_Campaigns record, invoke **ZO- zoho-data-ops WRITE mode** to update cumulative actuals:
- Actual_Impressions (cumulative)
- Actual_Clicks (cumulative)
- Actual_Orders (cumulative)
- Actual_Spend_INR (cumulative)
- Actual_Revenue_INR (cumulative)
- Actual_ACoS_Pct (recalculated from cumulative: Actual_Spend / Actual_Revenue)
- Actual_CVR_Pct (recalculated: Actual_Orders / Actual_Clicks)
- Actual_CTR_Pct (recalculated: Actual_Clicks / Actual_Impressions)
- Actual_CPC_INR (recalculated: Actual_Spend / Actual_Clicks)
- Data_Quality (current rating)

### Step 5.5: Aggregate to Campaigns record

For each Campaigns (strategy) record, sum across all its child Amazon_Ad_Campaigns and invoke **ZO- zoho-data-ops WRITE mode** to update:
- Agg_Impressions = SUM(child Actual_Impressions)
- Agg_Clicks = SUM(child Actual_Clicks)
- Agg_Orders = SUM(child Actual_Orders)
- Agg_Spend_INR = SUM(child Actual_Spend_INR)
- Agg_Revenue_INR = SUM(child Actual_Revenue_INR)
- Agg_ACoS_Pct = Agg_Spend_INR / Agg_Revenue_INR (blended)
- Agg_CVR_Pct = Agg_Orders / Agg_Clicks (blended)
- Agg_CTR_Pct = Agg_Clicks / Agg_Impressions (blended)
- Data_Quality = MIN across children (worst quality wins)

### Step 6: Update Product_Launches test fields

Invoke **ZO- zoho-data-ops WRITE mode** to update Product_Launches record:
- Test_Impressions, Test_Clicks, Test_Orders (cumulative across all campaigns for this product)
- Total_Test_Spend (cumulative across all campaigns for this product)
- Test_Revenue (cumulative)
- Test_ACoS, Test_CVR, Test_CTR (recalculated from cumulative)

### Step 6.5: Log daily snapshot to ISM_ExecutionLogs

Write one ISM_ExecutionLogs entry **per Amazon_Ad_Campaigns record** with today's daily metrics:

```
Skill_Name: "daily-ads-analysis"
Execution_Date: now
Status: "SUCCESS"
Input_Fingerprint: "campaign={campaign_name},campaign_id={amazon_ad_campaign_id}"
Output_Summary: JSON: {
  "date": "YYYY-MM-DD",
  "daily_impressions": N,
  "daily_clicks": N,
  "daily_orders": N,
  "daily_spend_inr": N,
  "daily_revenue_inr": N,
  "daily_acos_pct": N,
  "cumulative_impressions": N,
  "cumulative_spend_inr": N,
  "cumulative_acos_pct": N,
  "data_quality": "HIGH|MEDIUM|LOW",
  "anomalies": []
}
Systems_Modified: "Amazon_Ad_Campaigns,Campaigns,Product_Launches"
Slack_Tag: "#ism-launch-alerts"
```

These daily snapshots enable trend analysis in Step 4 on subsequent runs.

### Step 7: Monitor product health

Invoke **PM- product-monitor MONITOR mode** to check:
- BSR movement since campaign started
- Review velocity and rating
- Listing health (suppression, buybox)

### Step 8: Write summary execution log

Write one summary ISM_ExecutionLogs entry for the overall run:

```
Skill_Name: "daily-ads-analysis"
Execution_Date: now
Status: "SUCCESS" | "PARTIAL" | "FAILED"
Input_Fingerprint: "strategies={count},campaigns={count},products={product_names}"
Output_Summary: "day={N},spend_today={inr},acos_today={pct},cumulative_acos={pct},anomalies={count}"
Systems_Modified: "Amazon_Ad_Campaigns,Campaigns,Product_Launches"
Slack_Tag: "#ism-launch-alerts"
```

### Step 9: Write learning signal (if anomalies detected)

If any anomalies flagged in Step 4, write to **ISM_Learnings**:

```
Skill_Name: "daily-ads-analysis"
Target_Type: "campaign_anomaly"
Target_Name: product name
Description: JSON with anomaly_type, metric_value, threshold, trend_context, campaign_name
Severity: "warning"
Status: "new"
Timestamp: now
```

### Step 10: Post daily digest to Slack

**Route through `slack-messaging` skill** for correct mrkdwn formatting.

Post to **#ism-launch-alerts**:

```
ISM Daily Ads Report | {date} | Day {N} of campaign
{product_name} -- {scenario_type} strategy ({N} campaigns)

Per-campaign breakdown:
  {campaign_name} ({targeting_type}):
    Today: {impressions} imp | {clicks} clicks | {orders} orders | INR {spend} | {acos}% ACoS
    Cumulative: {total_imp} imp | {total_orders} orders | INR {total_spend} | {cum_acos}% ACoS

Strategy totals:
  Today: {agg_impressions} imp | {agg_orders} orders | INR {agg_spend} | {agg_acos}% ACoS
  Cumulative: {agg_total_imp} imp | {agg_total_orders} orders | INR {agg_total_spend} | {agg_cum_acos}% ACoS

vs Yesterday: ACoS {delta}, CTR {delta}, Orders {delta}
Data Quality: {HIGH/MEDIUM/LOW}
Anomalies: {list or "none"}
Keywords: {winners} winners, {learners} learners, {losers} losers
Budget remaining: INR {remaining} ({pct}% of total)
```

If anomalies detected, append recommendations (e.g., "Consider negating keyword X", "Budget pacing ahead of schedule").

## Outputs

| Output | Destination | Condition |
|---|---|---|
| Amazon_Ad_Campaigns actuals update | CRM Amazon_Ad_Campaigns | Always |
| Campaigns aggregate update | CRM Campaigns | Always |
| Product_Launches test fields update | CRM Product_Launches | Always |
| Daily snapshot logs | ISM_ExecutionLogs (per campaign) | Always |
| Product health check | Returned by PM | Always |
| Summary execution log | ISM_ExecutionLogs | Always |
| Learning signal | ISM_Learnings | If anomalies detected |
| Daily digest | Slack #ism-launch-alerts | Always |

## Error Handling

| Condition | Action |
|---|---|
| No active Campaigns | Skip run, log to ISM_ExecutionLogs |
| Metrics not provided | Ask user to export from Seller Central |
| CRM write fails | Retry once; if still failing, log error, continue to Slack |
| Anomaly thresholds exceeded | Flag in digest, do NOT auto-pause campaigns |

## Constraints

- This task is an **orchestrator**. Skills do the calculations.
- **Never execute Seller Central actions.** Bid changes, negatives, pauses are recommendations only.
- **Never auto-pause or modify campaigns.** Anomaly flags are for human review.
- All CRM writes go through `zoho-data-ops` skill.
- All Slack messages go through `slack-messaging` skill.
- Runs once per day. Dedup check prevents duplicate runs.
