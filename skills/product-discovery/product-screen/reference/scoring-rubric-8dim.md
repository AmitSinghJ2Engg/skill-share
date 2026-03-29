# 8-Dimension Scoring Rubric — Pipeline Score (Source-Agnostic)

Used by SCORE mode. 8 equally-weighted dimensions, max 12.5 each, total 100. Each dimension uses the **best available signal** across platforms.

## Signal Priority Principle

For every dimension, use the highest-priority signal that is non-null. If multiple platform signals exist, use the primary signal for scoring and note others as corroborating/conflicting evidence.

## Dimensions

### 1. Demand Signal (max 12.5)

Measure: Purchase intent and sales velocity across marketplaces.

**Signal priority:** Amazon BSR > Etsy sales count > Pinterest saves > Google Trends.

**Amazon BSR (primary if available):**
BSR < 2,000 → 12.5. 2,000–5,000 → 10. 5,000–10,000 → 8. 10,000–20,000 → 6. 20,000–50,000 → 3. > 50,000 → 0.
Source: Amazon India or US product page BSR field. Use lower (better) BSR if both available.

**Etsy sales count (if BSR unavailable):**
> 1,000 sales → 11. 500–1,000 → 9. 200–500 → 7. 100–200 → 5. 50–100 → 3. < 50 → 0.
Source: Etsy listing page. Max score 11 (lower ceiling — less precise than BSR).

**Pinterest saves (if Amazon + Etsy unavailable):**
> 5,000 → 9. 2,000–5,000 → 7. 500–2,000 → 5. 100–500 → 3. < 100 → 0.
Source: Pinterest search. Max score 9 (interest signal, not transactional).

**Google Trends bonus (supplementary, never standalone):**
Interest > 70 + rising → +2. Interest > 50 + stable → +1. Applied on top of primary signal. Cap: 12.5.

Null across ALL platforms → 0.

### 2. Price Point (max 12.5)

Measure: Fit with Ismokraft target range 800–2,000 INR.

800–1,200 INR (sweet spot) → 12.5. 1,200–2,000 → 10. 500–800 or 2,000–3,000 → 6. Outside 500–3,000 → 0.

Products at or below 1,000 INR qualify for zero referral fee (effective 2026-03-16) — bonus signal.

Source: Any marketplace price converted to INR. Use Amazon India price as primary if available; otherwise convert from US/Etsy USD price.

### 3. Competition Gap (max 12.5)

Measure: Competitive intensity in the category.

**Signal priority:** Amazon review counts > Etsy shop density.

**Amazon page 1 review counts (primary):**
At least one < 50 reviews → 12.5. All < 200 reviews → 10. At least one < 200 → 8. All 200–500 → 5. All > 500 → 0.
Source: Amazon India + US page 1 search results. Use the marketplace with more data.

**Etsy shop density (if Amazon unavailable):**
< 5 competing shops → 11. 5–15 shops → 8. 15–30 → 5. 30–50 → 3. > 50 → 0.
Source: Etsy search results count. Max score 11 (less precise).

**Cross-platform note:** If both signals available, use Amazon as score but flag if Etsy tells a different story.

Null across ALL platforms → 0.

### 4. Trend Strength (max 12.5)

Measure: Growth trajectory of product interest.

**Signal priority:** Google Trends > Etsy trending > Pinterest rising searches.

**Google Trends (primary):**
Score > 70 → 12.5. 50–70 → 10. 30–50 → 6. 20–30 → 3. < 20 → 0.
Source: Google Trends India geo (primary) + US geo (secondary). Use higher score.

**Etsy trending (if Google Trends unavailable):**
Product appears in Etsy trending searches → 10. Recent surge in listings → 6. No signal → 0.
Max score 10.

**Pinterest rising (supplementary):**
Appears in Pinterest trending or predicts reports → +2 bonus. Cap: 12.5.

Null across ALL platforms → 0.

### 5. Social Validation (max 12.5)

Measure: Consumer interest and social proof signals.

**Signal priority:** Pinterest saves > Etsy favorites > social web search.

**Pinterest saves (primary):**
> 500 saves or high traction → 12.5. 200–500 saves → 8. 50–200 saves → 4. < 50 → 0.
Source: Pinterest search (Claude_in_Chrome preferred for saves data).

**Etsy favorites (secondary):**
> 500 favorites on top listings → 10. 200–500 → 7. 50–200 → 4. < 50 → 0.
Source: Etsy listing favorite counts. Max score 10.

**Social web traction (tertiary):**
Strong presence in blogs/influencer content → 6. Some mentions → 3. None → 0.
Source: web_search. Max score 6.

Null across ALL platforms → 0 (not penalised beyond scoring 0).

### 6. Margin Potential (max 12.5)

Measure: Estimated COGS headroom at selling price.

SP > 3.5x COGS estimate → 12.5. 3x–3.5x → 10. 2.5x–3x → 7. 2x–2.5x → 4. < 2x → 0.

This is a rough viability signal only. Full margin calculation is margin-calculator's job.

Source: Price data from any marketplace (converted to INR) against estimated COGS. Platform-agnostic.

### 7. Category Fit (max 12.5)

Measure: Ismokraft domain match.

Exact match (wood, home decor, gifting, kitchen, office, pooja) → 12.5. Adjacent match (bamboo, natural materials, lifestyle) → 8. Partial match (material applicable but category stretch) → 4. No match → 0.

Refer to the opportunity map (in project knowledge) for zone-to-category mappings. Platform-agnostic.

### 8. Differentiation (max 12.5)

Measure: Unique angle available based on review mining and market gaps.

Clear gap or variation opportunity (3+ unmet needs) → 12.5. Some gap (1–2 opportunities) → 8. Minor complaints only → 4. Commodity listing, no differentiation possible → 0.

**Sources (use all available):**
- Amazon 1-star/2-star review analysis (India + US)
- Amazon Q&A sections
- Etsy buyer reviews and complaints
- Pinterest comment themes

Score based on combined evidence across platforms.

## Score Bands

Strong: 75–100. Promising: 55–74. Weak: 35–54. Reject: 0–34.

## Scoring Rules

- Score each dimension independently. Do not let one strong dimension inflate another.
- If a dimension's source data is null across ALL platforms, score it 0. Do not estimate.
- If data exists from one platform but not others, score using available data and note which platforms contributed.
- Round to one decimal place.
- Total = sum of all 8 dimension scores.
- Assign score_band based on total.
- Record source_platform and source_url for every dimension score.
