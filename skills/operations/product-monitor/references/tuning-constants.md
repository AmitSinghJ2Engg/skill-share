# product-monitor — Tuning Constants

All tunable thresholds for `anomaly-thresholds.md`. Named, not hardcoded, so values can be tuned without editing skill prose.

**Why not in `context/`?** Same rationale as ads-ops-plan (DL-021): these values are consumed only by product-monitor, not shared across skills. product-pipeline context is at its 50 KB ceiling. Promote to `context/` if another skill ever consumes these values directly.

**Versioning:** Any material change is a breaking change to eval benchmarks — bump the skill version and note the change in git history.

---

## §1. Anomaly Thresholds

Used by `anomaly-thresholds.md` CRITICAL and WARNING sections.

| Name | Value | Meaning |
|---|---|---|
| `bsr_drop_pct_max` | 50 | BSR increase % above which a `bsr_drop` CRITICAL anomaly fires. Per marketplace. |
| `high_returns_pct_max` | 10 | Return rate % above which a `high_returns` CRITICAL anomaly fires. Aligns with Amazon ODR risk tier. |
| `rating_drop_floor` | 3.5 | Average rating floor — below this triggers a `rating_drop` WARNING. Absolute, not relative. Per marketplace. |
| `revenue_decline_wow_pct_max` | 30 | Week-over-week revenue drop % above which a `revenue_decline` WARNING fires. Applied to aggregate AND per-marketplace. |

---

## §2. Classification Thresholds (CLASSIFY planned stub)

Used by `anomaly-thresholds.md` classification section. These values apply when CLASSIFY is wired up; they're defined now so the threshold design is locked for the day consumer tasks exist.

| Name | Value | Meaning |
|---|---|---|
| `classification_min_days` | 30 | Minimum days since launch before a product can be classified (below → `pending`) |
| `winner_bsr_top_pct` | 20 | BSR must be in top N% of category to qualify as `winner` |
| `winner_returns_pct_max` | 5 | Winner requires returns < N% |
| `winner_rating_min` | 4.0 | Winner requires rating > N |
| `steady_returns_pct_max` | 10 | Steady requires returns < N% (same as high_returns_pct_max cutoff — not coincidence) |
| `steady_rating_min` | 3.5 | Steady requires rating > N |
| `failure_rating_max` | 3.0 | Rating below N is a failure signal |
| `failure_bsr_target_multiplier` | 2 | BSR > N × target → failure |
| `failure_revenue_pct_of_forecast` | 50 | Revenue < N% of forecast → failure |
