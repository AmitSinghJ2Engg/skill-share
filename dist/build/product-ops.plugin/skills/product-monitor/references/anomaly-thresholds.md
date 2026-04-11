# Anomaly Thresholds — COLLECT Mode

Anomalies are returned as structured `alerts[]`; **the task decides Slack routing** via `slack-messaging` per DL-018 dual-channel scheme. product-monitor never posts directly.

**Thresholds are named, not hardcoded.** See `tuning-constants.md` for values. Expressions like `high_returns_pct_max` refer to named constants — the skill cites them in `alerts[].threshold_name` output for traceability.

**Ad-metric anomalies NOT handled here.** DL-021 boundary: `ads-ops-plan` ANOMALY sub-mode owns `acos_jump`, `spend_spike`, `ctr_drop`, `zero_orders`, `budget_overpacing`. product-monitor tracks product-side signals only.

**Marketplace focus: Amazon India.** Multi-marketplace logic is future-proofed but rarely exercised today. Where a threshold is marketplace-specific, apply per marketplace; where it aggregates (returns, revenue weighted), use the aggregate.

---

## CRITICAL

**`bsr_drop`** — BSR increased by more than `bsr_drop_pct_max` from the previous snapshot (higher BSR = worse rank). Per marketplace — BSRs are market-specific.

**`high_returns`** — Return rate exceeds `high_returns_pct_max`. Aligns with Amazon's ODR policy risk tier. Aggregate (returns are customer-side).

## WARNING

**`review_velocity_low`** — New reviews/day below category median. Requires category median storage (CRM or operator input). **Skipped and noted in `data_gaps` when no benchmark storage exists today** — don't fabricate.

**`rating_drop`** — Rating below `rating_drop_floor` (absolute threshold, not relative). Per marketplace.

**`revenue_decline`** — Revenue down more than `revenue_decline_wow_pct_max` week-over-week. Requires ≥2 weeks data; skip and note in `data_gaps` otherwise. Check aggregate AND per-marketplace — a decline on any active market is WARNING even if aggregate is stable.

---

## Classification Thresholds — CLASSIFY (planned stub)

Documented for when CLASSIFY is wired up. Applies to 30+ day post-launch data (`classification_min_days` minimum). Per-marketplace + aggregate-weighted-by-revenue.

| Outcome | All conditions required |
|---|---|
| `winner` | BSR in top `winner_bsr_top_pct`% of category AND revenue on forecast AND returns < `winner_returns_pct_max` AND rating > `winner_rating_min` |
| `steady` | BSR stable AND revenue positive AND returns < `steady_returns_pct_max` AND rating > `steady_rating_min` |
| `underperformer` | BSR declining any marketplace OR revenue below forecast OR returns between `winner_returns_pct_max` and `steady_returns_pct_max` |
| `failure` | BSR > `failure_bsr_target_multiplier` × target OR returns > `high_returns_pct_max` OR revenue < `failure_revenue_pct_of_forecast`% forecast OR rating < `failure_rating_max` |
| `pending` | < `classification_min_days` since launch OR insufficient data |

Cannot classify without at least one of: BSR data from any Amazon marketplace, revenue data from any channel. Otherwise `pending`.

## Prediction Accuracy Labels (CLASSIFY planned stub)

| Original | Outcome | Label |
|---|---|---|
| STRONG | winner/steady | `accurate` |
| STRONG | failure | `overestimated` |
| WEAK | winner | `underestimated` |
| Any | No original score | `unknown` (never guess) |

## Failure Categories

`demand_miss` · `competition_overwhelmed` · `margin_squeeze` · `quality_returns` · `listing_poor` · `ads_ineffective` · `seasonal_mismatch` · `sourcing_delay` · `marketplace_mismatch` · `other`

Use `other` only when no category fits, with a note. `marketplace_mismatch` = product performs well on one market, fails on another.

---

## gate_2_contribution Rules (COLLECT mid-test context)

When `breakeven_acos_pct` is provided (signals D2.5 test context), COLLECT populates `gate_2_contribution`:

| Flag | Rule |
|---|---|
| `high_return_rate_flag` | `returns_pct > high_returns_pct_max` |
| `bsr_collapse_flag` | `bsr_drop` fired AND current BSR > target × `failure_bsr_target_multiplier` |
| `rating_risk_flag` | `rating < steady_rating_min` |
| `listing_suppressed_flag` | `listing_health.suppression` OR `buybox_ownership_pct < 50` |
| `all_clear` | None of the above |

The `test-campaign` task reads this block at Gate 2 alongside ads-ops-plan's `gate_2_readiness`. `all_clear: true` = positive signal; any flag set = "review before Gate 2 decision". product-monitor does not decide Gate 2 — it surfaces evidence.
