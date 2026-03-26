---
name: product-monitor
description: >
  Post-launch product monitoring and feedback loop closure. Three modes: MONITOR (pull BSR, reviews, ad metrics, return rates for launched products → PerformanceRecord[]), CLASSIFY (compare actual vs predicted performance → OutcomeClassification[]), FEEDBACK (generate learning signals for scoring calibration, zone weighting, failure patterns → FeedbackSignals). Closes the learning loop — without it, the system cannot self-calibrate. ALWAYS trigger for: "how is this product doing", "post-launch review", "performance check", "BSR tracking", "return rate", "review velocity", "is this a winner", "product outcome", "calibrate scoring", "scoring accuracy", "prediction accuracy", "feedback loop", "learning signals", "zone performance", "failure pattern", "what went wrong", "why did this fail", "PM-", "launch monitoring", "weekly review", "product health", "anomaly alert". Do NOT trigger for pre-launch evaluation (product-evaluate) or discovery (product-discover). If unsure — trigger.
metadata:
  domain: product
  prefix: PM-
  version: 2.0.0
---

# Product Monitor

Post-launch monitoring and feedback loop closure for the product pipeline.

Three modes — run in sequence (MONITOR → CLASSIFY → FEEDBACK) or independently:

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **MONITOR** | launched_products[] | PerformanceRecord[] + anomalies | CLASSIFY |
| **CLASSIFY** | performance_records + original_eval_records | OutcomeClassification[] | FEEDBACK |
| **FEEDBACK** | classifications | Learning signals + alerts | Auto-memory, upstream skills |

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

1. **Every metric cites source and date.** "BSR = 4,200 (source: amazon.in, pulled 2026-03-26)". No metric without provenance.
2. **Missing metrics are null, not zero.** If a metric cannot be pulled, set to null and reduce data_completeness_pct. Never substitute zero.
3. **Classification requires minimum data.** At least 30 days since launch AND at least BSR or revenue data. Otherwise classify as "pending".
4. **Prediction accuracy requires original scores.** If original eval_score unavailable, set prediction_accuracy = "unknown". Never guess.
5. **Failure patterns must be categorised.** Every failure uses the failure category enum from anomaly-thresholds.md. If ambiguous, use "other" with explanation.

---

## MODE: MONITOR

**Purpose:** Collect current performance metrics for launched products. Pure data collection — no decisions.

**When to invoke:** "how is this product doing", "performance check", "BSR tracking", weekly monitoring run.

Read [reference/anomaly-thresholds.md](reference/anomaly-thresholds.md) for threshold values.

### Required Inputs

launched_products[] with: product_id, product_name, launch_date, launch_channel (amazon_india / shopify_india / both). Optional: asin, lookback_days (default 30).

### Metrics Collected

| Metric | Source | Anomaly trigger |
|---|---|---|
| BSR (current + trend) | Amazon India product page | Drop more than 50% from previous check |
| Review count + velocity | Amazon India product page | Below category median |
| Average rating | Amazon India product page | Below 3.5 |
| Return rate % | Seller Central / Zoho | Above 10% |
| Revenue INR | Zoho Books / Seller Central | Decline more than 30% week-over-week |
| Units sold | Zoho Inventory / Seller Central | (tracked, no anomaly trigger) |
| Ad metrics (ACoS, ROAS, spend) | Amazon Ads / ads-ops output | ACoS above target |

### Anomaly Detection

Anomalies are flagged with severity (CRITICAL / WARNING) but NOT acted on. Operator or task layer decides response.

### Output: PerformanceRecord[]

Per product: product_id, product_name, metrics (all collected values with source and date), anomalies[] (type, severity, details), data_completeness_pct.

Run ID: PM-M-{YYYYMMDD}-{NNN}.

---

## MODE: CLASSIFY

**Purpose:** Compare actual performance against original evaluation predictions. Classify each product's outcome.

**When to invoke:** "is this a winner", "product outcome", "classify performance", after MONITOR produces records.

### Required Inputs

performance_records[] from MONITOR mode. original_eval_records[] with: product_id, eval_score (Opportunity_Score from product-evaluate), pipeline_score (from product-screen), dimension_scores (optional, for accuracy analysis).

### Classification Logic

See [reference/anomaly-thresholds.md](reference/anomaly-thresholds.md) for full criteria. Summary:

winner → top performer across BSR, revenue, returns, rating.
steady → stable positive metrics.
underperformer → one or more metrics declining.
failure → significant miss on key metrics.
pending → under 30 days or insufficient data.

### Prediction Accuracy

For each classified product: compare outcome against original verdict. Flag which scoring dimension was most accurate and which was most misleading.

### Output: OutcomeClassification[]

Per product: product_id, outcome, outcome_reasoning, prediction_accuracy, most_accurate_dimension, most_misleading_dimension, days_since_launch.

Run ID: PM-C-{YYYYMMDD}-{NNN}.

---

## MODE: FEEDBACK

**Purpose:** Generate structured learning signals from classifications. This is what makes the system learn across sessions.

**When to invoke:** "calibrate scoring", "learning signals", "feedback loop", "what went wrong", after CLASSIFY produces classifications.

### What It Generates

**Product outcome signals:** Per product — outcome, metrics, prediction accuracy. Stored via auto-memory for cross-session reference.

**Zone performance signals:** Aggregate wins/failures per zone. Identifies which zones produce winners and which underperform. Feeds back into opportunity map zone prioritisation.

**Scoring accuracy signals:** Per dimension — was this dimension's score predictive of actual outcome? Identifies reliable and misleading dimensions across the portfolio.

**Failure pattern signals:** Per failure — categorised reason, was_predictable flag, corrective action suggestion. Identifies if 3+ products failed at the same gate for the same reason (pattern alert).

### Alert Generation

Alerts are generated in output but NOT sent. Operator or task layer handles dispatch.

| Alert | Trigger | Severity |
|---|---|---|
| pattern_detected | 3+ products failed at same gate for same reason | CRITICAL |
| dimension_unreliable | Scoring dimension below 50% accuracy over 20+ products | WARNING |
| zone_underperforming | Zone with 0 strong candidates in last 5 runs | WARNING |
| anomaly_critical | Any CRITICAL anomaly from MONITOR | CRITICAL |

### Output: FeedbackSignals

Contains: learning_signals[] (per product), zone_performance_summary, scoring_accuracy_summary, failure_patterns[], alerts[].

Run ID: PM-F-{YYYYMMDD}-{NNN}.

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| MONITOR | launched_products[] with product_id + launch_date | Block — nothing to monitor |
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

1. Every metric cites source and date. No metric without provenance.
2. Missing data is null, not zero. Never substitute.
3. Products under 30 days cannot be classified. Always "pending".
4. Without original scores, prediction accuracy is "unknown".
5. Failure categories must use the defined enum. No free-text categories.
6. Alerts are generated but never sent directly. Output only.

---

## Execution Log

```
[EXEC:product_monitor:PM-{MODE}-{YYYYMMDD}-{NNN}]
product-monitor v2.0.0 | {YYYY-MM-DD} | Mode: {MONITOR|CLASSIFY|FEEDBACK}
Products: {N}
{MONITOR}: Metrics collected: {N} | Anomalies: {N} CRITICAL, {N} WARNING
{CLASSIFY}: Winners: {N} | Steady: {N} | Underperformers: {N} | Failures: {N} | Pending: {N}
{FEEDBACK}: Signals: {N} | Alerts: {N} | Patterns detected: {N}
Data sources: {list}
```
