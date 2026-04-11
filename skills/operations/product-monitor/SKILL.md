---
name: product-monitor
description: >
  PM- Product-side performance data collection, anomaly flagging, and gate_2
  contribution for Ismokraft products across test and post-launch phases.
  Phase-agnostic — works for mid-test D2.5 campaigns and post-launch D4
  products. COLLECT mode pulls BSR, reviews, rating, returns, revenue, listing
  health, flags anomalies against named thresholds (bsr_drop, high_returns,
  rating_drop, revenue_decline, review_velocity_low), and populates a
  gate_2_contribution block that feeds test-campaign Gate 2 decisions.
  CLASSIFY and FEEDBACK are planned stubs (no consumer task wired — do not
  invoke).
  For ad-metric anomalies (ACoS, ROAS, spend), use ads-ops-plan ANOMALY sub-mode
  — product-monitor does NOT own ad-metric detection (DL-021 boundary).
  ALWAYS trigger for: "how is this product doing", "product performance",
  "BSR tracking", "return rate", "rating drop", "listing health",
  "mid-test monitoring", "post-launch review", "performance snapshot", "PM-".
metadata:
  domain: operations
  prefix: PM-
  version: "3.0.0"
---

# Product Monitor

Product-side performance data collection across test and post-launch phases.
**COLLECT** is the live mode. CLASSIFY and FEEDBACK are planned stubs.

**Single responsibility:** Pull product-side signals (BSR, reviews, rating, returns, revenue, listing health), flag anomalies against named thresholds in `tuning-constants.md`, return structured data. Does NOT collect ad metrics (→ ads-ops-plan), post to Slack (→ task via slack-messaging), write CRM (→ task via zoho-data-ops), or make launch/kill decisions.

---

## Mode Selection

| User has... | Needs... | Run mode |
|---|---|---|
| Mid-test or post-launch product, current metrics | Performance snapshot + anomaly flags + gate_2 contribution | **COLLECT** |
| Launched products 30+ days, original eval scores | Outcome classification | **CLASSIFY** (stub) |
| Per-product classifications from CLASSIFY runs | Learning signals for scoring calibration | **FEEDBACK** (stub) |

Trigger phrases for COLLECT: "how is this product doing", "BSR tracking", "return rate check", "daily performance snapshot", "post-launch review", "mid-test monitoring".

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/anomaly-thresholds.md` and `references/tuning-constants.md` — thresholds and named values
3. Read `context/system-ops/resolutions.ctx.md` (filter domain `product-monitor`, `cross-skill`)
4. Read `context/product-pipeline/gate-criteria.ctx.json` for gate_2_contribution alignment
5. Read `context/product-pipeline/pipeline-config.ctx.json` for Slack routing (task posts, not skill)

---

## Mode: COLLECT

Phase-agnostic performance snapshot + anomaly detection. Works identically for D2.5 mid-test and D4 post-launch. Pure data collection + threshold checks — no classification, no decisions.

**Input:** `products: [{ product_id, product_name, launch_date|test_start_date, asin, marketplaces: ["amazon.in"], previous_snapshot }]`, `lookback_days` (default 30), `breakeven_acos_pct` (optional — signals D2.5 test context for gate_2_contribution).

**Metrics collected (product-side only, ad metrics excluded per DL-021 boundary):** BSR + trend, review count + velocity, rating, return rate %, revenue (INR), units sold, listing health (suppression, buybox %).

**Anomalies** (full rules in `references/anomaly-thresholds.md`, values in `tuning-constants.md §1`): `bsr_drop` CRITICAL, `high_returns` CRITICAL, `rating_drop` WARNING, `revenue_decline` WARNING, `review_velocity_low` WARNING (skipped when no category benchmark storage — noted in `data_gaps`).

**gate_2_contribution block** populated when `breakeven_acos_pct` is provided. Surfaces product-side evidence for the test-campaign task's Gate 2 decision alongside ads-ops-plan's `gate_2_readiness`. Fields: `high_return_rate_flag`, `bsr_collapse_flag`, `rating_risk_flag`, `listing_suppressed_flag`, `all_clear`, `notes`. Full rules in `anomaly-thresholds.md §gate_2_contribution`.

**Output (PerformanceRecord):** `product_id`, `product_name`, `phase: "test"|"post_launch"|"unknown"`, `metrics`, `metrics_per_marketplace[]`, `anomalies[]` (each cites a NAMED `threshold_name` not a raw number), `gate_2_contribution` (when applicable), `alerts[]` (with `target_channel_hint: "task_decides"`), `data_completeness_pct`, `data_gaps[]`.

---

## Modes: CLASSIFY / FEEDBACK (planned stubs — do not invoke)

Both modes are designed but **not wired to any consumer task**. If invoked, return:
```
{ "error": "CLASSIFY/FEEDBACK are planned stubs. Full design at docs/skills/product-monitor-planned-modes.md. Blocks on ism-learning-engine build-out and a weekly-outcome-review consumer task. For mid-test/post-launch monitoring, use COLLECT mode." }
```

**Design intent is preserved in `docs/skills/product-monitor-planned-modes.md`** — full CLASSIFY input/output schemas, FEEDBACK signal types (product outcomes, zone performance, scoring accuracy, failure patterns), alert thresholds (`pattern_detected` 3+, `dimension_unreliable` <50% over 20+, `zone_underperforming` 0 of last 5), and the consumer-task pseudocode. That doc is outside the plugin runtime but tracked in git. When CLASSIFY/FEEDBACK get built, restore the full mode sections here by reading that doc.

---

## Rules

1. Every metric cites source, marketplace, and date. Missing = `null`, never zero, never guessed.
2. Anomaly thresholds cited by NAMED tunable from `tuning-constants.md` in output — never as literals.
3. Returns structured data only — no Slack, no CRM writes, no decisions. Task does those.
4. **Ad metrics out of scope.** ACoS/ROAS/spend → `ads-ops-plan` ANOMALY sub-mode (DL-021 boundary).
5. CLASSIFY and FEEDBACK always return the stub error. Never process.
6. `gate_2_contribution` block only populated when a test context is signalled (breakeven_acos_pct provided).
7. `review_velocity_low` skipped when no category benchmark storage exists (and noted in `data_gaps`). Don't fabricate a benchmark.
8. **S22 NO-FAKE-DATA.** Classification requires `classification_min_days` (30) + BSR/revenue data from at least one marketplace. Otherwise `pending`. Prediction accuracy requires original scores — if unavailable, `unknown`.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `ads-ops-plan` | Sibling — owns ad-metric anomalies (DL-021 boundary), no overlap |
| `zoho-data-ops` | Downstream — task uses it to persist PerformanceRecord |
| `slack-messaging` | Downstream — task formats alerts before posting |
| `revenue-ops` | Upstream — revenue data for COLLECT's revenue metrics and revenue_decline anomaly |
| `product-discover` | Upstream (indirect, for CLASSIFY planned stub) — zone provenance + original candidate scores |
| `product-screen` | Upstream (for CLASSIFY planned stub) — original pipeline_score |
| `product-evaluate` | Upstream (for CLASSIFY planned stub) — original eval_score + dimension_scores |

---

## Reference Files

| File | Purpose |
|---|---|
| `references/anomaly-thresholds.md` | Anomaly types, classification criteria, failure taxonomy, gate_2_contribution rules — references `tuning-constants.md` for values |
| `references/tuning-constants.md` | Named threshold values (§1 anomaly, §2 classification) |
| `context/product-pipeline/gate-criteria.ctx.json` (project) | Gate 2 full_criteria alignment for gate_2_contribution output |
| `context/product-pipeline/pipeline-config.ctx.json` (project) | Slack channel routing — task reads, skill does not |
| `context/system-ops/resolutions.ctx.md` (project) | Cross-skill resolutions filtered by domain |
