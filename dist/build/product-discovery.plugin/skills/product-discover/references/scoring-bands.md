# Scoring Bands — 4-Band Niche Score Model

Used by SINGLE mode and the daily discovery task. Max raw score: 64 (4 bands × 16 each). Adjustable with confidence penalties.

## Band 1 — Keyword Search Volume (max 16)

> 50,000 → 16. 20,000–50,000 → 12. 8,000–20,000 → 10. 3,000–8,000 → 8. 1,000–3,000 → 6. 500–1,000 → 4. 100–500 → 2. < 100 → 0.
Sources: Helium10 CSV (user-provided) > Amazon search suggest volume > web_search. Null → score 0, penalty -5.

## Band 2 — Demand Signal (max 16)

**Source-agnostic demand scoring.** Use the best available signal from any platform:

**Amazon BSR (if available):**
< 500 → 16. 500–2,000 → 14. 2,000–5,000 → 12. 5,000–10,000 → 10. 10,000–20,000 → 8. 20,000–50,000 → 5. 50,000–100,000 → 2. > 100,000 → 0.

**Etsy sales rank / sales count (if BSR unavailable):**
> 1,000 sales → 14. 500–1,000 → 12. 200–500 → 10. 100–200 → 8. 50–100 → 5. 10–50 → 2. < 10 → 0.

**Pinterest saves (if Amazon + Etsy unavailable):**
> 5,000 saves → 12. 2,000–5,000 → 10. 500–2,000 → 7. 100–500 → 4. < 100 → 0. Max score capped at 12 (lower confidence than transactional signals).

**Google Trends (supplementary — does not replace above):**
Interest > 70 + rising → +2 bonus. Interest > 50 + stable → +1 bonus. Cap: 16.

**Signal priority:** Amazon BSR > Etsy sales count > Pinterest saves > Google Trends (bonus only).
Use highest-priority available signal. Null across ALL platforms → score 0, penalty -5.

## Band 3 — Competition (max 16)

**Source-agnostic competition scoring.** Use best available signal:

**Amazon page 1 review counts (primary):**
avg reviews < 50 → 16. 50–200 → 14. 200–500 → 10. 500–1,000 → 7. 1,000–2,500 → 4. 2,500–5,000 → 2. > 5,000 → 0.
Adjustments: New entrants visible (< 200 reviews on page 1) → +2. All top sellers > 1,000 reviews → -2. Cap: 16.

**Etsy shop competition (if Amazon data unavailable):**
Fewer than 5 shops selling similar → 14. 5–15 shops → 10. 15–30 shops → 7. 30–50 shops → 4. > 50 shops → 0. Max score capped at 14 (lower precision than Amazon review counts).

**Cross-platform check:** If both Amazon and Etsy data available, use Amazon as primary score but flag if Etsy shows significantly different competition level (marketplace_discrepancy note).

Source: Amazon India + US page 1 search results, Etsy search results. Null across ALL → score 0, penalty -5.

## Band 4 — Differentiability (max 16)

Multiple clear unmet needs (3+) → 14–16. Some gaps (1–2) + pricing gap → 10–13. Minor complaints, no structural gap → 6–9. Well-reviewed competitors → 2–5. Commoditized market → 0–1.

**Sources (use all available):**
- Amazon review mining (1-star/2-star patterns) — India and US
- Amazon Q&A sections
- Etsy review patterns and buyer feedback
- Pinterest comment themes (if available via Claude_in_Chrome)

Null across ALL platforms → score 0, penalty -5.

## Niche Score Calculation

Raw = Band1 + Band2 + Band3 + Band4 (max 64, max with adjustments 84).
Confidence penalties: null band → -5, low confidence band → -2, high confidence → 0.
Adjusted = raw + sum(confidence_penalties).

## Quick Score (Pass 1 — before demand data available)

price_fit (max 25): 800–2500 → 25, 500–800 or 2500–4000 → 15, other → 5.
review_gap (max 25): avg < 200 → 25, < 500 → 15, < 1000 → 5, >= 1000 → 0. (Use best available: Amazon reviews or Etsy shop count mapped.)
trend_signal (max 20): rising/breakout → 20, stable → 10, declining/unknown → 0.
rating_quality (max 15): avg < 4.0 → 15, < 4.3 → 10, >= 4.3 → 5.
new_entrant_gap (max 15): any < 100 reviews on page 1 → 15, any < 200 → 5, none → 0.
Combined = opportunity_score × (data_completeness / 100).

## Verdict Thresholds

STRONG: adjusted >= 55, data quality A or B.
PROMISING: adjusted >= 45, data quality A/B/C. Or: adjusted >= 55 with quality C.
CONDITIONAL: adjusted 35–54, data quality A or B.
NEEDS_DATA: opportunity_score >= 70 but data quality D or F. High potential, insufficient data — not scored as weak.
WEAK: adjusted 20–34.
REJECT: adjusted < 20.

## Data Quality Grades

A: >= 10 fields, 0 null bands. All bands HIGH/MEDIUM confidence.
B: >= 8 fields, max 1 null band.
C: >= 6 fields, max 2 null bands.
D: >= 4 fields. Product needs more research.
F: <= 3 fields. Insufficient for any decision.

## Platform-Agnostic Core Fields for Completeness

12 core fields (platform-agnostic): title, price_inr, rating, review_count (or equivalent), brand_or_shop, product_id (ASIN or listing_id), demand_signal (BSR or sales_count or saves), google_trends_score, google_trends_direction, category, source_url, source_platform.

Completeness = (non-null core fields / 12) × 100.
