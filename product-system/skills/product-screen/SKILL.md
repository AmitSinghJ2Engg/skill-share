---
name: product-screen
description: >
  Transforms discovery data into filtered, scored, ranked product reports. Three active modes: SCORE (8-dimension scoring → ScoredCandidate[]), REPORT (risk-filtered top-10 with differentiation ideas), BRIEF (launch handoff doc). NORMALIZE removed — product-discover BATCH handles normalisation. ALWAYS trigger for: "score these candidates", "score this discovery batch", "rank these products", "filter the candidates", "generate the report", "top 10 products", "product opportunity report", "which products passed", "shortlist report", "final report", "trademark check", "launch brief", "brief for this product", "PS-". Run modes in sequence: SCORE → REPORT → BRIEF. If the task involves processing, scoring, or reporting on a batch of products — trigger. If unsure — trigger.
metadata:
  domain: product
  prefix: PS-
  version: 2.0.0
---

# Product Screen

Transforms discovery data into actionable product opportunity outputs. Three modes run in sequence: score candidates, filter and report, brief for launch handoff.

**Capability boundary:** This skill transforms and reports. It does not evaluate products against launch gates (product-evaluate), research products from scratch (product-discover), or compute margins (margin-calculator, invoked read-only in BRIEF mode).

## Shared Knowledge (always in context)

The opportunity map, financial formulas, gate definitions, and data integrity rules are available in project knowledge. Do not read separate files for these — they are already in context.

## Skill-Specific Reference Files

For detailed rules loaded only when needed:

- **Scoring rubric**: See [reference/scoring-rubric-8dim.md](reference/scoring-rubric-8dim.md) — 8-dimension scoring model for SCORE mode
- **Risk filters**: See [reference/risk-filter-rules.md](reference/risk-filter-rules.md) — 4 filters for REPORT mode Stage 1

---

## DATA INTEGRITY CONTRACT

The 7 data integrity rules (NEVER INVENT DATA, NULL IS CORRECT, SOURCE AND CONFIDENCE, etc.) are defined in project knowledge under data-integrity-rules.md. They apply to every mode, every candidate, every run. Non-negotiable.

---

## Mode Selection

| User has... | Needs... | Run mode |
|---|---|---|
| Raw CrawlBatch | ProductCandidate[] | Run product-discover BATCH first (NORMALIZE removed) |
| ProductCandidate[] | Ranked scored list | SCORE |
| ScoredCandidate[] | Risk-filtered top-10 report | REPORT |
| Single evaluated product | Launch handoff doc | BRIEF |

If user provides raw CrawlBatch: redirect to product-discover BATCH. Never accept raw crawl data directly.

---

## MODE: SCORE

**Purpose:** Score each ProductCandidate across 8 dimensions. Returns ScoredCandidate[].

**When to invoke:** "score these candidates", "rank these products", "score this discovery batch".

Read [reference/scoring-rubric-8dim.md](reference/scoring-rubric-8dim.md) for full dimension tables and scoring tiers.

### 8-Dimension Overview

All dimensions equally weighted at 12.5 points each, total max 100:

| Dimension | What to measure | 0 points | 12.5 points |
|---|---|---|---|
| Demand Signal | BSR rank in category | BSR > 50,000 | BSR < 2,000 |
| Price Point | Ismokraft target 800–2,000 INR | Outside 500–3,000 | 800–1,200 sweet spot |
| Competition Gap | Review count of top-3 sellers | All > 500 reviews | At least one < 50 |
| Trend Strength | Google Trends 90-day score | Score < 20 | Score > 70 |
| Social Validation | Pinterest saves / social traction | null / low | > 500 saves |
| Margin Potential | COGS headroom at SP | SP < 2x COGS | SP > 3.5x COGS |
| Category Fit | Ismokraft domain match | No match | Exact match |
| Differentiation | Unique angle available | Commodity | Clear gap |

### Score Bands

Strong: 75–100. Promising: 55–74. Weak: 35–54. Reject: 0–34.

### Output: ScoredCandidate[]

Each candidate gets: candidate_id, title, total_score, score_band, dimension_scores (8 values), score_notes.

Batch output includes: scoring_run_id (PS-S-{YYYYMMDD}-{NNN}), scored_count, top_candidates list.

---

## MODE: REPORT

**Purpose:** Apply risk filters, then produce a top-10 ranked report with differentiation ideas.

**When to invoke:** "generate the report", "top 10 products", "which products passed", "filter the candidates".

Read [reference/risk-filter-rules.md](reference/risk-filter-rules.md) for filter criteria and verdict logic.

### Stage 1: Risk Filter

4 filters per candidate. Final verdict = worst individual result.

| Filter | Criteria | Fail condition |
|---|---|---|
| Trademark | Branded terms in product name | Branded name, no generic alternative |
| Seasonality | Demand concentration | > 70% sales in one quarter |
| Certification | Mandatory certifications needed | Electrical, food-contact, medical |
| Fragility | Breakage risk in FBA shipping | Glass, thin ceramic, unsupported overhangs |

Verdicts: PASS (include), CONDITIONAL (include + flag), FAIL (exclude from report).

### Stage 2: Top-10 Report

For the top 10 PASS/CONDITIONAL candidates (ranked by score), produce per candidate:

1. Differentiation idea — what variation would win (1–2 sentences)
2. Wood specification recommendation — species, finish, treatment
3. Bundle opportunity — what to pair with it
4. Manufacturing difficulty — Easy / Medium / Hard
5. Confidence level — High / Medium / Low (based on data completeness)

### Output: OpportunityReport

Report includes: report_id (PS-R-{YYYYMMDD}-{NNN}), filter_summary (pass/conditional/fail counts), top_10 array, and a Markdown summary table.

---

## MODE: BRIEF

**Purpose:** Produce a structured launch brief for a single evaluated product. Activates downstream skills.

**When to invoke:** "launch brief", "brief for this product", single product ready for sourcing.

### Output: LaunchBrief

Contains: product_title, target_sp_inr, target_cogs_max_inr, target_margin_pct, bigin_stage, and handoff triggers for:

- **margin-calculator** — verify margin at target SP and COGS (read-only invocation)
- **vendor-ops** — DISCOVER mode for manufacturers matching product spec
- **content-writer** — LISTING mode for Amazon India listing after listing approval

Brief ID format: PS-B-{YYYYMMDD}-{NNN}.

---

## NORMALIZE Mode — Removed

NORMALIZE mode has been removed. product-discover BATCH already runs crawl, extract + normalise, and enrich — producing clean ProductCandidate[] ready for scoring.

Correct flow: product-discover BATCH → ProductCandidate[] → product-screen SCORE.

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| SCORE | ProductCandidate[] with at minimum title + platform + one scored field | Block — redirect to product-discover BATCH |
| SCORE (raw CrawlBatch given) | — | Block — redirect to product-discover BATCH first |
| REPORT | ScoredCandidate[] from SCORE | Block — cannot filter/rank without scores |
| BRIEF | product_title, target_sp_inr, target_cogs_max_inr | Block — LaunchBrief incomplete without financials |

If blocked: state exact missing input. Do not proceed. Do not invent data.

## Halt Conditions

| Condition | Mode | Action |
|---|---|---|
| < 5 candidates after dedup | SCORE | Flag, suggest broader keywords via product-discover |
| > 50% candidates FAIL risk filter | REPORT | Investigate dominant fail reason before proceeding |
| All top-10 score < 55 | REPORT | Report result, recommend different seed keywords |
| Legacy prefix used (PDC-, POS-, PDR-, POR-) | Any | Acknowledge maps to PS-, proceed normally |

---

## Related Skills

| Skill | Relationship |
|---|---|
| product-discover | Upstream — provides ProductCandidate[] from BATCH mode |
| ikraft-keyword-intelligence | Indirect upstream — provides keywords to product-discover |
| product-evaluate | Downstream — receives ScoredCandidate[] for DEEP-EVAL and GATE-CHECK |
| margin-calculator | Invoked in BRIEF mode for unit economics (read-only) |
| vendor-ops | Downstream — LaunchBrief triggers DISCOVER mode |
| content-writer | Downstream — LaunchBrief triggers LISTING mode |

---

## Rules

1. Never invent scores. If a dimension's source data is null, score it 0. Do not estimate.
2. Never accept raw CrawlBatch. Redirect to product-discover BATCH.
3. Margin Potential dimension is a rough viability signal. Full margin calculation is margin-calculator's job.
4. All ScoredCandidate outputs must trace to input data. Unscored dimensions are marked N/A.
5. FAIL candidates in REPORT mode are excluded but logged in rejection_log with reason.

---

## Execution Log

```
[EXEC:product_pipeline:PS-{MODE}-{YYYYMMDD}-{NNN}]
product-screen v2.0.0 | {YYYY-MM-DD} | Mode: {SCORE|REPORT|BRIEF}
Input: {source_data_id or description}
Candidates in: {N} | Candidates out: {N}
{SCORE}: Score range: {min}–{max} | Bands: {N} Strong, {N} Promising, {N} Weak, {N} Reject
{REPORT}: Filters: {N} pass, {N} conditional, {N} fail | Top-10 generated
{BRIEF}: Product: {title} | Handoffs: {skill names}
Errors: {none | description}
```
