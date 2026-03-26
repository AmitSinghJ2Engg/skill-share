# 8-Dimension Scoring Rubric — Pipeline Score

Used by SCORE mode. 8 equally-weighted dimensions, max 12.5 each, total 100.

## Dimensions

### 1. Demand Signal (max 12.5)

Measure: BSR rank in category.

BSR < 2,000 → 12.5. 2,000–5,000 → 10. 5,000–10,000 → 8. 10,000–20,000 → 6. 20,000–50,000 → 3. > 50,000 → 0.

Source: Amazon product page BSR field. Null → 0.

### 2. Price Point (max 12.5)

Measure: Fit with Ismokraft target range 800–2,000 INR.

800–1,200 INR (sweet spot) → 12.5. 1,200–2,000 → 10. 500–800 or 2,000–3,000 → 6. Outside 500–3,000 → 0.

Products at or below 1,000 INR qualify for zero referral fee (effective 2026-03-16) — bonus signal.

### 3. Competition Gap (max 12.5)

Measure: Review count of top-3 sellers on page 1.

At least one < 50 reviews → 12.5. All < 200 reviews → 10. At least one < 200 → 8. All 200–500 → 5. All > 500 → 0.

Source: Amazon India page 1 search results. Null → 0.

### 4. Trend Strength (max 12.5)

Measure: Google Trends 90-day score for India geo.

Score > 70 → 12.5. 50–70 → 10. 30–50 → 6. 20–30 → 3. < 20 → 0.

Source: Google Trends. Null → 0.

### 5. Social Validation (max 12.5)

Measure: Pinterest saves or social traction signals.

> 500 saves or high traction → 12.5. 200–500 saves → 8. 50–200 saves → 4. < 50 or null → 0.

Source: Pinterest, Instagram, social web search. Null is valid (not penalised beyond scoring 0).

### 6. Margin Potential (max 12.5)

Measure: Estimated COGS headroom at selling price.

SP > 3.5x COGS estimate → 12.5. 3x–3.5x → 10. 2.5x–3x → 7. 2x–2.5x → 4. < 2x → 0.

This is a rough viability signal only. Full margin calculation is margin-calculator's job.

### 7. Category Fit (max 12.5)

Measure: Ismokraft domain match.

Exact match (wood, home decor, gifting, kitchen, office, pooja) → 12.5. Adjacent match (bamboo, natural materials, lifestyle) → 8. Partial match (material applicable but category stretch) → 4. No match → 0.

Refer to the opportunity map (in project knowledge) for zone-to-category mappings.

### 8. Differentiation (max 12.5)

Measure: Unique angle available based on review mining and market gaps.

Clear gap or variation opportunity (3+ unmet needs) → 12.5. Some gap (1–2 opportunities) → 8. Minor complaints only → 4. Commodity listing, no differentiation possible → 0.

Source: Amazon 1-star/2-star review analysis, Q&A sections.

## Score Bands

Strong: 75–100. Promising: 55–74. Weak: 35–54. Reject: 0–34.

## Scoring Rules

- Score each dimension independently. Do not let one strong dimension inflate another.
- If a dimension's source data is null, score it 0. Do not estimate.
- Round to one decimal place.
- Total = sum of all 8 dimension scores.
- Assign score_band based on total.
