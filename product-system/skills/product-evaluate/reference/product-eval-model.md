# 16-Criteria Product Evaluation Model — DEEP-EVAL

The authoritative model for single-product evaluation. Produces Opportunity_Score (0–100) — the sole value written to CRM `Product_Launches` module (auto-syncs to Bigin Gate 1).

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
| 1 | Search Volume | 10 | Helium10/Amazon search (India or US) | Exclude, document in gaps[] |
| 2 | Demand Signal | 10 | Best available: Amazon BSR (India/US) > Etsy sales count > Pinterest saves | Exclude, document in gaps[] |
| 3 | Trend Direction | 5 | Google Trends (India + US geos) > Etsy trending > Pinterest rising | Exclude, document in gaps[] |
| 4 | Category Size | 5 | Amazon category analysis (India or US) > Etsy category depth | Exclude, document in gaps[] |

## Dimension 2 — Competition Beatability (25% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 5 | Review Moat | 8 | Best available: Amazon page 1 avg reviews (India/US) > Etsy shop review counts | Exclude, document in gaps[] |
| 6 | Brand Concentration | 7 | Best available: Amazon page 1 brand analysis (India/US) > Etsy top seller analysis | Exclude, document in gaps[] |
| 7 | New Entrant Success | 5 | Best available: Amazon page 1 new listings < 6 months (India/US) > Etsy new shop traction | Exclude, document in gaps[] |
| 8 | Listing Quality Gap | 5 | Best available: Amazon competitor A+ content, images, bullets (India/US) > Etsy listing quality | Exclude, document in gaps[] |

## Dimension 3 — Margin Potential (25% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 9 | Price Cluster Fit | 8 | Best available: Amazon price distribution (India primary, US secondary) > Etsy price range | Exclude, document in gaps[] |
| 10 | COGS Headroom | 7 | Supplier intelligence / estimate (platform-agnostic) | Exclude, document in gaps[] |
| 11 | Fee Structure | 5 | Amazon fee calculator (India marketplace) or US fee calculator | Exclude, document in gaps[]. Products at or below 1,000 INR qualify for zero referral fee (effective 2026-03-16). |
| 12 | Risk (NEGATIVE weight) | -10 | Returns risk, seasonal volatility, certifications (all marketplaces) | Exclude if null. A raw score of 5 means maximum risk = -10 from total. |

## Dimension 4 — Differentiation Room (20% weight)

| # | Criterion | Weight | Data Source | If null |
|---|---|---|---|---|
| 13 | Unmet Needs | 8 | Amazon 1-star/2-star review mining (India + US) + Etsy buyer complaints | Exclude, document in gaps[] |
| 14 | Personalization Fit | 5 | Product category analysis (platform-agnostic) | Exclude, document in gaps[] |
| 15 | Wood Advantage | 5 | Material analysis — does wood add genuine value? (platform-agnostic) | Exclude, document in gaps[] |
| 16 | Legal & Safety | 0 | Certification needs across target marketplaces, IP risk | Weight = 0. Tracked but does not affect score. Informational only. |

## Verdict Thresholds

STRONG (75–100): Proceed to sourcing.
MODERATE (55–74): Proceed with caution, address weak areas.
WEAK (35–54): Reconsider — significant concerns.
REJECT (0–34): Do not pursue.

## Confidence Levels

HIGH: All scoring inputs present and directly observed from at least one marketplace.
MEDIUM: Some inputs null, score derived from available data across marketplaces.
LOW: Majority of inputs null, score is directional only.

## Evidence Requirement

Every criterion score must cite the specific data point, its value, source platform, and date. Example:

```
Criterion: Demand Signal — Score: 4/5
Reason: Primary keyword "wooden desk organizer" BSR = 3,200 on amazon.in; Etsy shows 620 sales for top listing
Source: amazon.in product page (2026-03-14), etsy.com search (2026-03-14)
```

No score without a cited reason.

## Multi-Marketplace Scoring Guidance

When data is available from multiple marketplaces:
- Use the marketplace with the most complete data as primary source for scoring.
- Note corroborating or conflicting signals from other marketplaces.
- If marketplaces disagree (e.g., strong demand on Amazon US but weak on India), document the discrepancy and score conservatively.
- Record all marketplaces evaluated in the EvalRecord.

## Relationship to niche_score

niche_score (from product-discover SINGLE mode) is a research-phase indicator only. It never writes to CRM or Bigin. Opportunity_Score from this model is the authoritative Gate 1 value, written to CRM `Product_Launches` module field Opportunity_Score. CRM auto-syncs to Bigin, triggering the New Request → Validated transition.
