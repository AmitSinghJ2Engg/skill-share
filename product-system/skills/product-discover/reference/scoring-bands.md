# Scoring Bands — 4-Band Niche Score Model

Used by SINGLE mode and the daily discovery task. Max raw score: 64 (4 bands × 16 each). Adjustable with confidence penalties.

## Band 1 — Keyword Search Volume (max 16)

> 50,000 → 16. 20,000–50,000 → 12. 8,000–20,000 → 10. 3,000–8,000 → 8. 1,000–3,000 → 6. 500–1,000 → 4. 100–500 → 2. < 100 → 0.
Sources: Helium10 CSV (user-provided) > Amazon search > web_search. Null → score 0, penalty -5.

## Band 2 — Demand / BSR (max 16)

< 500 → 16. 500–2,000 → 14. 2,000–5,000 → 12. 5,000–10,000 → 10. 10,000–20,000 → 8. 20,000–50,000 → 5. 50,000–100,000 → 2. > 100,000 → 0.
BSR-to-units estimate: BSR 1–1,000 ≈ 500–5,000/month. 1,001–5,000 ≈ 100–500. 5,001–20,000 ≈ 20–100. > 20,000 ≈ < 20.
Source: Amazon product page BSR field. Null → score 0, penalty -5.

## Band 3 — Competition (max 16)

avg reviews < 50 → 16. 50–200 → 14. 200–500 → 10. 500–1,000 → 7. 1,000–2,500 → 4. 2,500–5,000 → 2. > 5,000 → 0.
Adjustments: New entrants visible (< 200 reviews on page 1) → +2. All top sellers > 1,000 reviews → -2. Cap: 16.
Source: Amazon India page 1 search results. Null → score 0, penalty -5.

## Band 4 — Differentiability (max 16)

Multiple clear unmet needs (3+) → 14–16. Some gaps (1–2) + pricing gap → 10–13. Minor complaints, no structural gap → 6–9. Well-reviewed competitors → 2–5. Commoditized market → 0–1.
Source: Amazon review mining (1-star/2-star patterns), Q&A sections. Null → score 0, penalty -5.

## Niche Score Calculation

Raw = Band1 + Band2 + Band3 + Band4 (max 64, max with adjustments 84).
Confidence penalties: null band → -5, low confidence band → -2, high confidence → 0.
Adjusted = raw + sum(confidence_penalties).

## Quick Score (Pass 1 — before BSR available)

price_fit (max 25): 800–2500 → 25, 500–800 or 2500–4000 → 15, other → 5.
review_gap (max 25): avg < 200 → 25, < 500 → 15, < 1000 → 5, >= 1000 → 0.
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

## 12 Core Fields for Completeness

title, price, rating, review_count, brand, ASIN, BSR, FBA_status, google_trends_score, google_trends_direction, category, source_url.
