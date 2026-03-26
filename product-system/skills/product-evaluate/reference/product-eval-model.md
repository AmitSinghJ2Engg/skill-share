# 16-Criteria Product Evaluation Model — DEEP-EVAL

The authoritative model for single-product evaluation. Produces Opportunity_Score (0–100) — the sole value written to Bigin Gate 1.

## Scoring Method

Formula per criterion: Weighted_Score = (Raw_Score / 5) x Weight.
Adjusted_Total = raw_total x (100 / max_possible_from_scored_criteria).
Raw score range: 1–5 per criterion. Max total: 100.

## Rubric (all criteria)

5 = Exceptional — clearly exceeds requirements.
4 = Strong — meets all requirements well.
3 = Adequate — meets minimum requirements.
2 = Weak — falls short in noticeable ways.
1 = Poor — fundamentally misaligned.

## Dimension 1 — Market Demand (30% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 1 | Search Volume | 10 | Helium10/Amazon search | Exclude, document in gaps[] |
| 2 | BSR Demand Signal | 10 | Amazon product page | Exclude, document in gaps[] |
| 3 | Trend Direction | 5 | Google Trends | Exclude, document in gaps[] |
| 4 | Category Size | 5 | Amazon category analysis | Exclude, document in gaps[] |

## Dimension 2 — Competition Beatability (25% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 5 | Review Moat | 8 | Amazon page 1 avg reviews | Exclude, document in gaps[] |
| 6 | Brand Concentration | 7 | Amazon page 1 brand analysis | Exclude, document in gaps[] |
| 7 | New Entrant Success | 5 | Amazon page 1 new listings (< 6 months) | Exclude, document in gaps[] |
| 8 | Listing Quality Gap | 5 | Competitor A+ content, images, bullets | Exclude, document in gaps[] |

## Dimension 3 — Margin Potential (25% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 9 | Price Cluster Fit | 8 | Amazon price distribution | Exclude, document in gaps[] |
| 10 | COGS Headroom | 7 | Supplier intelligence / estimate | Exclude, document in gaps[] |
| 11 | Fee Structure | 5 | Amazon fee calculator | Exclude, document in gaps[]. Products at or below 1,000 INR qualify for zero referral fee (effective 2026-03-16). |
| 12 | Risk (NEGATIVE weight) | -10 | Returns risk, seasonal volatility, certifications | Exclude if null. A raw score of 5 means maximum risk = -10 from total. |

## Dimension 4 — Differentiation Room (20% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 13 | Unmet Needs | 8 | Amazon 1-star/2-star review mining | Exclude, document in gaps[] |
| 14 | Personalization Fit | 5 | Product category analysis | Exclude, document in gaps[] |
| 15 | Wood Advantage | 5 | Material analysis — does wood add genuine value? | Exclude, document in gaps[] |
| 16 | Legal & Safety | 0 | Certification needs, IP risk | Weight = 0. Tracked but does not affect score. Informational only. |

## Verdict Thresholds

STRONG (75–100): Proceed to sourcing.
MODERATE (55–74): Proceed with caution, address weak areas.
WEAK (35–54): Reconsider — significant concerns.
REJECT (0–34): Do not pursue.

## Confidence Levels

HIGH: All scoring inputs present and directly observed.
MEDIUM: Some inputs null, score derived from available data.
LOW: Majority of inputs null, score is directional only.

## Evidence Requirement

Every criterion score must cite the specific data point, its value, and its source with date. Example:

```
Criterion: Search Volume — Score: 4/5
Reason: Primary keyword "wooden desk organizer" = 8,400 monthly searches
Source: Helium10 CSV provided by user, dated 2026-03-14
```

No score without a cited reason.

## Relationship to niche_score

niche_score (from product-intelligence SINGLE mode) is a research-phase indicator only. It never writes to Bigin. Opportunity_Score from this model is the authoritative Gate 1 value, written to Bigin field Opportunity_Score, triggering the New Request to Validated transition.
