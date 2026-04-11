# product-monitor — Planned Modes Design (CLASSIFY + FEEDBACK)

**Status:** Planned. Not yet wired to any consumer task. **Do not invoke from runtime skill.**

**Why this file exists:** CLASSIFY and FEEDBACK are designed-but-unbuilt modes of `skills/operations/product-monitor/`. They were in the original SKILL.md as active modes, but the DL-021 product-monitor audit (2026-04-11) confirmed they have no consumers: no task wires them up, no storage exists for the "category median benchmark" they reference, and the feedback-loop closure is blocked on the unbuilt `ism-learning-engine`.

Per the DL-021 postscript policy — "design intent for planned-but-unwired modes belongs in `docs/skills/{skill}-planned-modes.md`, not in runtime references" — the full design was moved here to preserve it without consuming plugin budget. The skill's runtime `SKILL.md` still has stub sections that error out if someone tries to invoke these modes and points at this doc for the design intent.

**When to build:** CLASSIFY is unblocked when `ism-learning-engine` exists + a consumer task (probably a weekly `outcome-review` cron per DL-020 execution modes) is wired up. FEEDBACK is unblocked after CLASSIFY runs are accumulating in CRM.

---

## Mode: CLASSIFY (planned)

**Purpose:** Compare actual post-launch performance against the original evaluation predictions from `product-discover`, `product-screen`, and `product-evaluate`. Classify outcomes and identify which scoring dimensions were predictive vs misleading.

### Input

```
{
  "performance_records": [  // from product-monitor COLLECT mode, persisted in CRM
    {
      "product_id": "...",
      "product_name": "...",
      "metrics": { "BSR": ..., "revenue_inr": ..., "returns_pct": ..., "rating": ..., ... },
      "metrics_per_marketplace": [{ "marketplace": "amazon.in", ... }],
      "period_days": 30  // ≥ classification_min_days from tuning-constants.md §2
    }
  ],
  "original_eval_records": [  // from CRM — original evaluation scores
    {
      "product_id": "...",
      "eval_score": "STRONG" | "MODERATE" | "WEAK",     // product-evaluate verdict
      "pipeline_score": number,                          // product-screen pipeline_score
      "dimension_scores": {                              // per-dimension breakdown
        "demand": number,
        "margin": number,
        "competition": number,
        "seasonality": number,
        "compliance": number,
        "sourcing": number,
        "returns_risk": number,
        "differentiation": number
      }
    }
  ]
}
```

### Classification logic

Apply the thresholds from `skills/operations/product-monitor/references/anomaly-thresholds.md` Classification Thresholds table (all values named in `tuning-constants.md §2`):

| Outcome | Rule |
|---|---|
| `winner` | BSR in top `winner_bsr_top_pct`% of category AND revenue on forecast AND returns < `winner_returns_pct_max` AND rating > `winner_rating_min` |
| `steady` | BSR stable AND revenue positive AND returns < `steady_returns_pct_max` AND rating > `steady_rating_min` |
| `underperformer` | BSR declining on any marketplace OR revenue below forecast OR returns between `winner_returns_pct_max` and `steady_returns_pct_max` |
| `failure` | BSR > `failure_bsr_target_multiplier` × target OR returns > `high_returns_pct_max` OR revenue < `failure_revenue_pct_of_forecast`% forecast OR rating < `failure_rating_max` |
| `pending` | < `classification_min_days` since launch OR insufficient data |

Multi-marketplace products: per-marketplace classification AND an overall classification weighted by revenue contribution. A product can be `winner` on Amazon US and `underperformer` on Amazon India — record both.

### Prediction accuracy labels

For each classified product, compare the classification outcome against the original `eval_score`:

| Original eval_score | Actual outcome | Accuracy label |
|---|---|---|
| STRONG | winner / steady | `accurate` |
| STRONG | failure | `overestimated` |
| WEAK | winner | `underestimated` |
| Any | No original score available | `unknown` (never guess) |

### Dimension attribution

When a product is classified as `failure`, compute which scoring dimensions were most accurate vs most misleading:

- **`most_accurate_dimension`**: the dimension whose score best predicted the actual outcome (e.g., if `returns_risk` was scored LOW and the product failed on high returns, returns_risk was "accurate but the threshold was wrong")
- **`most_misleading_dimension`**: the dimension whose score most strongly disagreed with the actual outcome (e.g., if `demand` was scored HIGH and the product failed on zero demand, demand was "misleading")

The specific algorithm for this attribution is deferred until there's at least 20+ classified products to calibrate against. For v1.0, use a simple rank-based comparison: normalize each dimension to 0-1, compute each dimension's "prediction agreement" vs the outcome (winner/steady → 1.0, failure → 0.0), and flag the dimension with highest/lowest agreement.

### Output

```
OutcomeClassification[] = [{
  product_id: string,
  product_name: string,
  outcome: "winner" | "steady" | "underperformer" | "failure" | "pending",
  outcome_per_marketplace: [{
    marketplace: string,
    outcome: same enum,
    primary: bool  // true for the marketplace with most revenue
  }],
  prediction_accuracy: "accurate" | "overestimated" | "underestimated" | "unknown",
  most_accurate_dimension: string | null,
  most_misleading_dimension: string | null,
  failure_category: string | null,  // from failure_categories enum in anomaly-thresholds.md
  was_predictable: bool,  // true if ANY dimension score warned about the failure signal
  classified_at: ISO timestamp,
  period_days: int
}]
```

---

## Mode: FEEDBACK (planned)

**Purpose:** Aggregate CLASSIFY outcomes into learning signals that feed upstream scoring calibration. Makes the system self-calibrating: if a scoring dimension is consistently wrong, adjust its weight or the threshold; if a zone consistently produces failures, deprioritize it; if a failure pattern repeats, add a gate check.

### Input

```
{
  "classifications": OutcomeClassification[],  // from CLASSIFY runs, possibly across multiple batches
  "scope_days": 90,                             // default lookback window for aggregates
  "min_sample_size": 5                          // skip aggregates with fewer than N products
}
```

### 4 signal types generated

1. **Product outcomes** (`learning_signals[]`): per product, with metrics and prediction accuracy. Fine-grained data for the learning engine.

2. **Zone performance** (`zone_performance_summary`): aggregate wins/failures per zone (from `context/product-pipeline/zone-rotation.ctx.json`). Identifies zones that consistently produce strong vs weak products.

3. **Scoring accuracy** (`scoring_accuracy_summary`): per dimension, was the score predictive of actual outcome? E.g., "returns_risk predicted 87% of return-rate failures correctly, demand predicted 42%".

4. **Failure patterns** (`failure_patterns[]`): categorized failure reasons with `was_predictable` flag. Surfaces systemic issues (e.g., "5 products failed on sourcing_delay in the last 90 days — vendor evaluation process has a gap").

### 3 alert types

Alerts returned in the `alerts[]` output block. The calling task decides Slack routing (per DL-018 dual-channel — task-level posts go to `#ism-launch-alerts`). FEEDBACK itself does not post to Slack.

| Alert type | Rule | Severity |
|---|---|---|
| `pattern_detected` | **3+** products failed at the same gate for the same reason within `scope_days` | CRITICAL |
| `dimension_unreliable` | A scoring dimension has **< 50%** prediction accuracy over **20+** classified products | WARNING |
| `zone_underperforming` | A zone has produced **0** strong candidates (winners) in its last **5** runs | WARNING |

The specific thresholds (3+ / 50% over 20+ / 0 out of 5) are v1.0 design decisions. They should be moved to `tuning-constants.md §3 (FEEDBACK)` when the mode is actually wired up, and calibrated once there's enough data.

### Output

```
FeedbackSignals = {
  learning_signals: [  // 1. Product outcomes
    {
      product_id, product_name, outcome, metrics_snapshot, prediction_accuracy,
      most_accurate_dimension, most_misleading_dimension, failure_category,
      was_predictable, classified_at
    }
  ],
  zone_performance_summary: [  // 2. Zone performance
    {
      zone_name: string,
      total_launched: int,
      winners: int,
      steadys: int,
      underperformers: int,
      failures: int,
      win_rate_pct: number,
      period_days: int
    }
  ],
  scoring_accuracy_summary: [  // 3. Scoring accuracy per dimension
    {
      dimension: string,
      total_classified: int,
      accurate_count: int,
      overestimated_count: int,
      underestimated_count: int,
      accuracy_pct: number
    }
  ],
  failure_patterns: [  // 4. Failure patterns
    {
      pattern_id: string,
      category: failure_category_enum,
      gate: string | null,           // e.g., "Gate 2", "D2.5 test"
      affected_products: [product_id],
      count: int,
      was_predictable_count: int,    // how many had warnings in original scores
      first_seen: ISO date,
      last_seen: ISO date
    }
  ],
  alerts: [  // 3 alert types above
    {
      type: "pattern_detected" | "dimension_unreliable" | "zone_underperforming",
      severity: "CRITICAL" | "WARNING",
      message: string,
      evidence: { ...rule-specific context... },
      target_channel_hint: "task_decides"
    }
  ]
}
```

---

## Dependencies when built

1. **`ism-learning-engine`** must exist — it's the consumer of FEEDBACK learning signals. Today it's a placeholder. Without it, FEEDBACK signals would accumulate in CRM but never update upstream scoring.

2. **A consumer task** — probably a `weekly-outcome-review` task (DL-020 execution mode: scheduled cron, maybe weekly on Monday 8am IST). Pseudocode:
   ```
   1. Query CRM for products launched in the last 90 days with classified = false
   2. For each: invoke product-monitor COLLECT to get fresh metrics
   3. Read original eval scores from CRM (product-evaluate output)
   4. Invoke product-monitor CLASSIFY with both inputs
   5. Persist OutcomeClassification to CRM
   6. Once classifications exist: invoke product-monitor FEEDBACK
   7. Write FeedbackSignals to ism-learning-engine via zoho-data-ops
   8. Post alerts (if any) via slack-messaging → #ism-launch-alerts
   ```

3. **Category median benchmark storage** — referenced by COLLECT's `review_velocity_low` anomaly, but also used by CLASSIFY's "BSR in top N% of category" check. Currently has no storage mechanism; needs a `category-benchmarks.ctx.json` or a CRM custom module.

4. **Original eval scores in CRM** — must be persisted on product records when product-evaluate runs. Verify the CRM field mapping before wiring CLASSIFY.

---

## Changelog

- **2026-04-11:** Initial extraction from `skills/operations/product-monitor/SKILL.md` as part of DL-021 product-monitor audit (PM2 option b). Design intent preserved verbatim from v2.1.0 SKILL.md with audit notes added. The skill's runtime SKILL.md now has stub sections that error out on invocation and point to this file.
