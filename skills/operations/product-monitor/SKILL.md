---
name: product-monitor
description: >
  Post-launch product monitoring and feedback loop closure. Three modes: MONITOR (pull BSR, reviews, ad metrics, return rates for launched products → PerformanceRecord[]), CLASSIFY (compare actual vs predicted performance → OutcomeClassification[]), FEEDBACK (generate learning signals for scoring calibration, zone weighting, failure patterns → FeedbackSignals). Closes the learning loop — without it, the system cannot self-calibrate. ALWAYS trigger for: "how is this product doing", "post-launch review", "performance check", "BSR tracking", "return rate", "review velocity", "is this a winner", "product outcome", "calibrate scoring", "scoring accuracy", "prediction accuracy", "feedback loop", "learning signals", "zone performance", "failure pattern", "what went wrong", "why did this fail", "PM-", "launch monitoring", "weekly review", "product health", "anomaly alert". Do NOT trigger for pre-launch evaluation (product-evaluate) or discovery (product-discover). If unsure — trigger.
metadata:
  domain: product
  prefix: PM-
  version: 2.1.0
---

# Product Monitor

Post-launch monitoring and feedback loop closure for the product pipeline.

Three modes — run in sequence (MONITOR → CLASSIFY → FEEDBACK) or independently:

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **MONITOR** | launched_products[] | PerformanceRecord[] + anomalies | CLASSIFY |
| **CLASSIFY** | performance_records + original_eval_records | OutcomeClassification[] | FEEDBACK |
| **FEEDBACK** | classifications | FeedbackSignals (learning signals) | Upstream skills calibration |

**Capability boundary:** This skill monitors and classifies launched products only. It does not discover products (product-discover), score batches (product-screen), evaluate opportunity or gates (product-evaluate), or make launch/kill decisions (Gate 7 is product-evaluate GATE-CHECK).

## Why This Skill Exists

The product pipeline discovers, scores, evaluates, and launches products. Without post-launch tracking, there is no way to know whether scores were accurate, which zones produce winners, what patterns cause failures, or which scoring dimensions are reliable. Product-monitor closes this gap.

## Shared Knowledge (always in context)

The opportunity map, financial formulas, gate definitions, and data integrity rules are available in project knowledge. Do not read separate files for these — they are already in context.

## Skill-Specific Reference Files

For detailed rules loaded only when needed:

- **Anomaly thresholds**: See [reference/anomaly-thresholds.md](reference/anomaly-thresholds.md) — metric thresholds for MONITOR, classification criteria for CLASSIFY, failure categories

---

## DATA INTEGRITY CONTRACT

The 7 data integrity rules are defined in project knowledge. In addition, product-monitor enforces:

1. **Every metric cites source, platform, and date.** "BSR = 4,200 (source: amazon.in, pulled 2026-03-26)" or "Revenue = $342 (source: amazon.com Seller Central, 2026-03-26)". No metric without provenance.
2. **Missing metrics are null, not zero.** If a metric cannot be pulled, set to null and reduce data_completeness_pct. Never substitute zero.
3. **Classification requires minimum data.** At least 30 days since launch AND at least BSR or revenue data from at least one marketplace. Otherwise classify as "pending".
4. **Prediction accuracy requires original scores.** If original eval_score unavailable, set prediction_accuracy = "unknown". Never guess.
5. **Failure patterns must be categorised.** Every failure uses the failure category enum from anomaly-thresholds.md. If ambiguous, use "other" with explanation.

---

## MODE: MONITOR

**Purpose:** Collect current performance metrics for launched products across all active marketplaces. Pure data collection — no decisions.

**When to invoke:** "how is this product doing", "performance check", "BSR tracking", weekly monitoring run.

Read [reference/anomaly-thresholds.md](reference/anomaly-thresholds.md) for threshold values.

### Required Inputs

launched_products[] with: product_id, product_name, launch_date, launch_channels[] (amazon_india / amazon_us / amazon_europe / amazon_au / shopify_india / multi_channel). Optional: asin_india, asin_us, lookback_days (default 30).

### Metrics Collected

| Metric | Source(s) | Anomaly trigger |
|---|---|---|
| BSR (current + trend) | Amazon India and/or US product page | Drop more than 50% from previous check |
| Review count + velocity | Amazon India and/or US product page | Below category median |
| Average rating | Amazon India and/or US product page | Below 3.5 |
| Return rate % | Seller Central (India/US) / Zoho | Above 10% |
| Revenue INR (aggregated) | Zoho Books / Seller Central (all channels) | Decline more than 30% week-over-week |
| Revenue USD (if US channel) | Amazon US Seller Central | (tracked separately, converted to INR for aggregation) |
| Units sold | Zoho Inventory / Seller Central (all channels) | (tracked, no anomaly trigger) |
| Ad metrics (ACoS, ROAS, spend) | Amazon Ads (India/US) / ads-ops output | ACoS above target |
| Etsy metrics (if listed) | Etsy shop dashboard / Etsy API | Views declining, favorites dropping |

### Multi-Marketplace Aggregation

For products listed on multiple marketplaces:
- Revenue: aggregate across all channels in INR
- BSR: track per marketplace (not aggregated — BSR is marketplace-specific)
- Reviews: track per marketplace
- Return rate: track per marketplace and blended

### Anomaly Detection

Anomalies are flagged with severity (CRITICAL / WARNING) and marketplace context, but NOT acted on. Operator or task layer decides response.

### CRM Output

Return PerformanceRecord[] with all metrics and anomalies. CRM note creation and Post_Launch_Status updates handled by zoho-data-ops.

### Output: PerformanceRecord[]

Per product: product_id, product_name, launch_channels[], metrics (all collected values with source, platform, and date), anomalies[] (type, severity, marketplace, details), data_completeness_pct.

Run ID: PM-M-{YYYYMMDD}-{NNN}.

---

## MODE: CLASSIFY

**Purpose:** Compare actual performance against original evaluation predictions. Classify each product's outcome. Update CRM.

**When to invoke:** "is this a winner", "product outcome", "classify performance", after MONITOR produces records.

### Required Inputs

performance_records[] from MONITOR mode. original_eval_records[] with: product_id, eval_score (Opportunity_Score from product-evaluate), pipeline_score (from product-screen), dimension_scores (optional, for accuracy analysis).

### Classification Logic

See [reference/anomaly-thresholds.md](reference/anomaly-thresholds.md) for full criteria. Summary:

winner → top performer across BSR (on listed Amazon marketplaces), revenue, returns, rating.
steady → stable positive metrics.
underperformer → one or more metrics declining.
failure → significant miss on key metrics.
pending → under 30 days or insufficient data.

For multi-marketplace products: classify based on aggregated revenue + per-marketplace BSR performance. A product can be a "winner" on one marketplace and "underperformer" on another — note per-marketplace classification alongside overall.

### Prediction Accuracy

For each classified product: compare outcome against original verdict. Flag which scoring dimension was most accurate and which was most misleading.

### CRM Output

Return OutcomeClassification[]. CRM updates (Post_Launch_Status, classification notes) handled by zoho-data-ops.

### Output: OutcomeClassification[]

Per product: product_id, outcome (overall), outcome_per_marketplace{}, outcome_reasoning, prediction_accuracy, most_accurate_dimension, most_misleading_dimension, days_since_launch.

Run ID: PM-C-{YYYYMMDD}-{NNN}.

---

## MODE: FEEDBACK

**Purpose:** Generate structured learning signals from classifications. This is what makes the system learn across sessions.

**When to invoke:** "calibrate scoring", "learning signals", "feedback loop", "what went wrong", after CLASSIFY produces classifications.

### What It Generates

**Product outcome signals:** Per product — outcome, metrics, prediction accuracy. Stored as CRM notes on the product record for cross-session reference.

**Zone performance signals:** Aggregate wins/failures per zone. Identifies which zones produce winners and which underperform. Feeds back into opportunity map zone prioritisation.

**Scoring accuracy signals:** Per dimension — was this dimension's score predictive of actual outcome? Identifies reliable and misleading dimensions across the portfolio.

**Failure pattern signals:** Per failure — categorised reason, was_predictable flag, corrective action suggestion. Identifies if 3+ products failed at the same gate for the same reason (pattern alert).

### Output Destinations

Return FeedbackSignals. CRM notes, Slack alerts, and Slack canvas updates handled by zoho-data-ops and task orchestrator. No auto-memory storage.

### Alert Generation

Alerts are generated and sent to Slack #product-alerts:

| Alert | Trigger | Severity | Slack |
|---|---|---|---|
| pattern_detected | 3+ products failed at same gate for same reason | CRITICAL | Yes |
| dimension_unreliable | Scoring dimension below 50% accuracy over 20+ products | WARNING | Yes |
| zone_underperforming | Zone with 0 strong candidates in last 5 runs | WARNING | Yes |
| anomaly_critical | Any CRITICAL anomaly from MONITOR | CRITICAL | Yes |

### Output: FeedbackSignals

Contains: learning_signals[] (per product), zone_performance_summary, scoring_accuracy_summary, failure_patterns[], alerts[], crm_notes_created[], slack_messages_sent[].

Run ID: PM-F-{YYYYMMDD}-{NNN}.

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| MONITOR | launched_products[] with product_id + launch_date + launch_channels[] | Block — nothing to monitor |
| CLASSIFY | performance_records[] + original_eval_records[] | Block — cannot classify without both |
| FEEDBACK | OutcomeClassification[] from CLASSIFY | Block — nothing to learn from |

If blocked: state exact missing input. Do not proceed. Do not invent data.

## Halt Conditions

| Condition | Mode | Action |
|---|---|---|
| No launched products provided | MONITOR | Return empty with reasoning |
| All products under 30 days old | CLASSIFY | Return all as "pending" |
| No original scores available | CLASSIFY | Set all prediction_accuracy = "unknown" |
| No failures in batch | FEEDBACK | Skip failure patterns, note in output |

---

## Related Skills

| Skill | Relationship |
|---|---|
| product-discover | Upstream (indirect) — its scores are validated by this skill's accuracy checks |
| product-screen | Upstream — pipeline_score compared against actual outcomes |
| product-evaluate | Upstream — eval_score (Opportunity_Score) compared against actual outcomes |
| ads-ops | Upstream — ad metrics (ACoS, ROAS) used in MONITOR |
| revenue-ops | Upstream — revenue data used in MONITOR |
| margin-calculator | Sibling — actual margins compared to predicted |

---

## Rules

1. Every metric cites source, platform, and date. No metric without provenance.
2. Missing data is null, not zero. Never substitute.
3. Products under 30 days cannot be classified. Always "pending".
4. Without original scores, prediction accuracy is "unknown".
5. Failure categories must use the defined enum. No free-text categories.
6. Returns structured data only. CRM notes and Slack alerts handled by zoho-data-ops and task orchestrator. No local file saves. No auto-memory.

---

## Execution Log

```
[EXEC:product_monitor:PM-{MODE}-{YYYYMMDD}-{NNN}]
product-monitor v2.1.0 | {YYYY-MM-DD} | Mode: {MONITOR|CLASSIFY|FEEDBACK}
Products: {N} | Marketplaces monitored: {list}
{MONITOR}: Metrics collected: {N} | Anomalies: {N} CRITICAL, {N} WARNING | CRM notes: {N}
{CLASSIFY}: Winners: {N} | Steady: {N} | Underperformers: {N} | Failures: {N} | Pending: {N} | CRM updated: {N}
{FEEDBACK}: Signals: {N} | Alerts: {N} | Patterns detected: {N} | Slack sent: {N} | CRM notes: {N}
Data sources: {list}
```
