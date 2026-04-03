---
name: product-monitor
description: >
  Post-launch product monitoring and feedback loop closure. Three modes:
  MONITOR (pull BSR, reviews, ad metrics, return rates for launched products),
  CLASSIFY (compare actual vs predicted performance, outcome classification),
  FEEDBACK (generate learning signals for scoring calibration and failure patterns).
  ALWAYS trigger for: "how is this product doing", "post-launch review",
  "performance check", "BSR tracking", "return rate", "review velocity",
  "is this a winner", "product outcome", "calibrate scoring", "prediction accuracy",
  "feedback loop", "learning signals", "failure pattern", "PM-".
  Do NOT trigger for pre-launch evaluation or discovery. If unsure — trigger.
metadata:
  domain: product
  prefix: PM-
  version: "2.1.0"
---

# Product Monitor

Post-launch monitoring and feedback loop closure.

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **MONITOR** | launched_products[] | PerformanceRecord[] + anomalies | CLASSIFY |
| **CLASSIFY** | performance_records + original_eval_records | OutcomeClassification[] | FEEDBACK |
| **FEEDBACK** | classifications | FeedbackSignals | Upstream calibration |

**Boundary:** Monitors launched products only. Does not discover (product-discover), evaluate (product-evaluate), or make launch/kill decisions.

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `product-monitor`, `cross-skill`
3. Read `references/anomaly-thresholds.md` — metric thresholds, classification criteria

---

## Mode: MONITOR

Collect performance metrics across all active marketplaces. Pure data collection — no decisions.

**Input:** launched_products[] with product_id, product_name, launch_date, launch_channels[]. Optional: asin, lookback_days (default 30).

**Metrics:** BSR + trend, review count + velocity, average rating, return rate %, revenue (INR aggregated), units sold, ad metrics (ACoS, ROAS, spend).

**Multi-marketplace:** Revenue aggregated across channels in INR. BSR, reviews, return rates tracked per marketplace.

**Anomalies:** Flagged with severity (CRITICAL/WARNING) but NOT acted on. See `references/anomaly-thresholds.md` for triggers.

**Output:** PerformanceRecord[] with metrics (source, platform, date), anomalies[], data_completeness_pct.

---

## Mode: CLASSIFY

Compare actual performance against original evaluation predictions. Classify outcomes.

**Input:** performance_records[] + original_eval_records[] (eval_score, pipeline_score, dimension_scores).

**Classifications:** winner (top BSR/revenue/rating) | steady (stable positive) | underperformer (declining) | failure (significant miss) | pending (<30 days or insufficient data).

Multi-marketplace products get per-marketplace classification alongside overall.

**Prediction accuracy:** Compare outcome vs original verdict. Flag most accurate and most misleading scoring dimensions.

**Output:** OutcomeClassification[] with outcome, outcome_per_marketplace, prediction_accuracy, most_accurate_dimension, most_misleading_dimension.

---

## Mode: FEEDBACK

Generate structured learning signals from classifications. Makes the system self-calibrating.

**Signals generated:**
- **Product outcomes:** Per product with metrics and prediction accuracy
- **Zone performance:** Aggregate wins/failures per zone
- **Scoring accuracy:** Per dimension — was score predictive of actual outcome?
- **Failure patterns:** Categorised reasons with was_predictable flag

**Alerts** (to Slack #product-alerts):
- pattern_detected: 3+ products failed at same gate for same reason (CRITICAL)
- dimension_unreliable: dimension <50% accuracy over 20+ products (WARNING)
- zone_underperforming: 0 strong candidates in last 5 runs (WARNING)

**Output:** FeedbackSignals with learning_signals[], zone_performance_summary, scoring_accuracy_summary, failure_patterns[], alerts[].

---

## Rules

1. Every metric cites source, platform, and date.
2. Missing data is null, not zero.
3. Products under 30 days cannot be classified — always "pending".
4. Without original scores, prediction accuracy is "unknown".
5. Failure categories use the defined enum from anomaly-thresholds.md.
6. Returns structured data only. CRM/Slack handled by zoho-data-ops and task orchestrator.

---

## Reference Files

| File | Read when |
|---|---|
| `references/anomaly-thresholds.md` | All modes — metric thresholds, classification criteria, failure categories |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-discover` | Upstream (indirect) — scores validated by accuracy checks |
| `product-screen` | Upstream — pipeline_score compared against outcomes |
| `product-evaluate` | Upstream — Opportunity_Score compared against outcomes |
| `ads-ops` | Upstream — ad metrics for MONITOR |
| `revenue-ops` | Upstream — revenue data for MONITOR |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Every metric cites source, platform, and date
- Missing metrics are null, not zero
- Classification requires minimum 30 days + BSR/revenue data
- Prediction accuracy requires original scores — if unavailable, "unknown"
