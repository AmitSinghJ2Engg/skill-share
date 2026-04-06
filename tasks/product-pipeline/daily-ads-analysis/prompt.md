# Task: Daily Ads Analysis

## Inputs

- CRM read: Campaign_Plans records where Plan_Status = Active
- CRM read: Product_Launches records linked to active Campaign_Plans (stages 5-6)
- User input: daily ad metrics (Search Term Report CSV export or manual summary from Seller Central)
- Project context: `ppc-test-campaign-config.ctx.json` (thresholds, data quality criteria)
- Project context: `crm-field-mappings.ctx.json` (CRM field API names)
- Project context: `amazon-ads-campaign-fields.ctx.json` (Amazon Ads field reference)

## Prerequisites (verify before proceeding)

| Check | Source | Required |
|---|---|---|
| At least 1 Campaign_Plan with Plan_Status = Active | CRM Campaign_Plans | Yes |
| Linked Product_Launches record exists | CRM Product_Launches | Yes |
| Today's metrics available (CSV or manual) | User provides | Yes |

If no active Campaign_Plans exist, skip run and log "no active campaigns" to ISM_ExecutionLogs.

## Steps

### Step 0: Dedup check

Query ISM_ExecutionLogs for Skill_Name = "daily-ads-analysis" AND Execution_Date = today. If found, SKIP and log "duplicate run prevented" to Slack #ism-launch-alerts.

### Step 1: Query active campaigns

Read CRM for Campaign_Plans where Plan_Status = "Active". For each, load the linked Product_Launches record. Collect: product name, ASIN, campaign phase (Discovery/Validation/Scale), start date, budget, breakeven ACoS.

### Step 2: Collect today's metrics

Request daily ad metrics from user. Accept either:
- Search Term Report CSV from Seller Central
- Manual summary: impressions, clicks, orders, spend, revenue per campaign

### Step 3: Analyze performance

For each active campaign:

**If campaign is in Discovery or Validation phase:**
- Invoke **AO- ads-ops TEST mode** with phase = `analyze_discovery` or `analyze_validation`
- Compute: daily ACoS, CTR, CVR, CPC, spend vs budget
- Classify keywords into 4 buckets (winner/learner/loser/no_data)
- Rate data quality (HIGH/MEDIUM/LOW)

**If campaign is past validation (Scale phase):**
- Invoke **AO- ads-ops LIVE mode** for health_check
- Compute: campaign health, wasted spend, bid optimization recommendations

### Step 4: Compare trends

For each campaign, compare today vs:
- **Yesterday:** delta on impressions, clicks, orders, ACoS, spend
- **Cumulative:** running totals since campaign start, trend direction (improving/stable/declining)

Flag anomalies:
- Spend spike: daily spend > 150% of daily budget
- ACoS jump: daily ACoS > breakeven ACoS + 20pp
- CTR drop: daily CTR < 50% of cumulative CTR
- Zero orders: clicks > 20 but orders = 0 today

### Step 5: Update Campaign_Plans actuals

Invoke **ZO- zoho-data-ops WRITE mode** to update Campaign_Plans record:
- Actual_Impressions (cumulative)
- Actual_Clicks (cumulative)
- Actual_Orders (cumulative)
- Actual_Spend_INR (cumulative)
- Actual_Revenue_INR (cumulative)
- Actual_ACoS_Pct (recalculated)
- Actual_CVR_Pct (recalculated)
- Actual_CTR_Pct (recalculated)
- Actual_CPC_INR (recalculated)
- Data_Quality (current rating)

### Step 6: Update Product_Launches test fields

Invoke **ZO- zoho-data-ops WRITE mode** to update Product_Launches record:
- Test_Impressions, Test_Clicks, Test_Orders (cumulative)
- Total_Test_Spend (cumulative across all campaigns for this product)
- Test_Revenue (cumulative)
- Test_ACoS, Test_CVR, Test_CTR (recalculated from cumulative)

### Step 7: Monitor product health

Invoke **PM- product-monitor MONITOR mode** to check:
- BSR movement since campaign started
- Review velocity and rating
- Listing health (suppression, buybox)

### Step 8: Write execution log

Write to **ISM_ExecutionLogs** CRM module:

```
Skill_Name: "daily-ads-analysis"
Execution_Date: now
Status: "SUCCESS" | "PARTIAL" | "FAILED"
Input_Fingerprint: "campaigns={count},products={product_names}"
Output_Summary: "day={N},spend_today={inr},acos_today={pct},cumulative_acos={pct},anomalies={count}"
Systems_Modified: "Campaign_Plans,Product_Launches"
Slack_Tag: "#ism-launch-alerts"
```

### Step 9: Write learning signal (if anomalies detected)

If any anomalies flagged in Step 4, write to **ISM_Learnings**:

```
Skill_Name: "daily-ads-analysis"
Target_Type: "campaign_anomaly"
Target_Name: product name
Description: JSON with anomaly_type, metric_value, threshold, trend_context
Severity: "warning"
Status: "new"
Timestamp: now
```

### Step 10: Post daily digest to Slack

**Route through `slack-messaging` skill** for correct mrkdwn formatting.

Post to **#ism-launch-alerts**:

```
ISM Daily Ads Report | {date} | Day {N} of campaign
{product_name} — {scenario_type} campaign
Today: {impressions} imp | {clicks} clicks | {orders} orders | INR {spend} spend | {acos}% ACoS
Cumulative: {total_imp} imp | {total_orders} orders | INR {total_spend} | {cum_acos}% ACoS
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
| Campaign_Plans actuals update | CRM Campaign_Plans | Always |
| Product_Launches test fields update | CRM Product_Launches | Always |
| Product health check | Returned by PM | Always |
| Execution log | ISM_ExecutionLogs | Always |
| Learning signal | ISM_Learnings | If anomalies detected |
| Daily digest | Slack #ism-launch-alerts | Always |

## Error Handling

| Condition | Action |
|---|---|
| No active Campaign_Plans | Skip run, log to ISM_ExecutionLogs |
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
