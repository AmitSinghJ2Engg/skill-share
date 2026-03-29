---
name: product-screen
description: >
  PS- Scores, filters, and reports on product candidates. SCORE: 8-dimension
  scoring. REPORT: risk-filtered top-10. BRIEF: launch handoff doc.
version: "2.2.0"
lifecycle: active
---

# Product Screen

Transforms discovery data into scored, filtered, reported product opportunities.

**Boundary:** Transforms and reports only. Does not evaluate gates (product-evaluate), discover (product-discover), or compute margins (margin-calculator).

## Modes

| Mode | Input | Output | Downstream |
|---|---|---|---|
| **SCORE** | `ProductCandidate[]` | `ScoredCandidate[]` -> CRM | REPORT |
| **REPORT** | `ScoredCandidate[]` | `OpportunityReport` -> Slack | product-evaluate |
| **BRIEF** | Single evaluated product | `LaunchBrief` -> CRM | vendor-ops, content-writer |

If user provides raw CrawlBatch: redirect to product-discover BATCH. Never accept raw crawl data directly.

## MODE: SCORE

Score each ProductCandidate across 8 dimensions. Returns `ScoredCandidate[]`. Write scores to CRM.

Read `reference/scoring-rubric-8dim.md` for dimension tables, signal priorities, and scoring tiers. 8 dimensions at 12.5 points each, max 100. Bands: Strong 75-100, Promising 55-74, Weak 35-54, Reject 0-34.

CRM update per candidate: `Opportunity_Score`, `Competition_Level`, `Search_Trend`.

**Output:** candidate_id, title, total_score, score_band, dimension_scores (8 values + sources), marketplaces_scored[]. Batch: scoring_run_id (`PS-S-{YYYYMMDD}-{NNN}`), scored_count, top_candidates.

## MODE: REPORT

Apply risk filters, produce top-10 report with differentiation ideas, post to Slack.

**Stage 1 -- Risk Filter:** Read `reference/risk-filter-rules.md`. 4 filters (Trademark, Seasonality, Certification, Fragility). Verdict = worst result. PASS / CONDITIONAL (flagged) / FAIL (excluded).

**Stage 2 -- Top-10:** For top 10 PASS/CONDITIONAL (by score), per candidate: differentiation idea, wood spec, bundle opportunity, manufacturing difficulty, confidence level, marketplace opportunity.

**Stage 3 -- Slack:** Post to `#product-discovery`: top 10 with scores, filter counts, marketplace coverage.

**Output:** report_id (`PS-R-{YYYYMMDD}-{NNN}`), filter_summary, top_10 array, Markdown summary.

## MODE: BRIEF

Produce a launch brief for a single evaluated product. Update CRM.

**Output:** product_title, target_sp_inr, target_cogs_max_inr, target_margin_pct, bigin_stage, marketplace_strategy. Handoffs: margin-calculator (verify margin), vendor-ops (DISCOVER), content-writer (LISTING).

Brief ID: `PS-B-{YYYYMMDD}-{NNN}`. CRM: set `Launch_Priority`.

## Input Validation

| Mode | Required | Block if missing |
|---|---|---|
| SCORE | ProductCandidate[] with title + platform + one scored field | Redirect to product-discover BATCH |
| REPORT | ScoredCandidate[] from SCORE | Cannot filter/rank without scores |
| BRIEF | product_title, target_sp_inr, target_cogs_max_inr | LaunchBrief incomplete without financials |

## Halt Conditions

- SCORE: < 5 candidates after dedup -> flag, suggest broader keywords via product-discover
- REPORT: > 50% candidates FAIL risk filter -> investigate dominant fail reason first
- REPORT: all top-10 score < 55 -> report result, recommend different seed keywords

## Rules

1. Never invent scores. Null source data across ALL platforms = score 0.
2. Never accept raw CrawlBatch. Redirect to product-discover BATCH.
3. Margin Potential dimension is rough viability only. Full margin = margin-calculator.
4. All ScoredCandidate outputs must trace to input data. Unscored dimensions marked N/A with reason.
5. FAIL candidates in REPORT excluded but logged in rejection_log with reason.
6. All score updates write to CRM `Product_Launches` records. No local file saves.
7. Report summary goes to Slack `#product-discovery`.
8. Data integrity rules from project context apply to all modes.

## Trigger Phrases

PS-, score these candidates, rank these products, filter the candidates, generate the report, top 10 products, product opportunity report, which products passed, shortlist report, final report, launch brief, brief for this product.