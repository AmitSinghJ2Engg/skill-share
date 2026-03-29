# Research Framework — SINGLE Mode

Step-by-step methodology for deep single-product research across multiple marketplaces. Returns ResearchRecord for product-evaluate DEEP-EVAL.

## Depth Options

quick (5–10 min): Steps 1–2 only → partial ResearchRecord.
standard (15–20 min): Steps 1–5 → full ResearchRecord (default).
deep (30–45 min): Steps 1–5 + ASIN deep-dive per Step 3 extended → full ResearchRecord + competitor analysis across marketplaces.

## Step 1 — Keyword Discovery

**Amazon India queries:** "{product_name}" site:amazon.in. "{primary_keyword}" Amazon India best seller. "{category}" Amazon.in most wished for.
**Amazon US queries:** "{product_name}" site:amazon.com. "{primary_keyword}" Amazon best seller.
**Etsy queries:** "{product_name}" site:etsy.com wooden. "{primary_keyword}" Etsy trending.

Output: primary_keyword, secondary_keywords, search_volume_data, platforms_searched[].
If Helium10/Jungle Scout data is provided, use directly — mark source explicitly.

## Step 2 — Demand Analysis

**Multi-platform demand signals (use best available):**

1. Amazon BSR (India and/or US) — if available, assign demand_band per scoring-bands.md Band 2 Amazon table. State basis: "Estimated from BSR ~X,XXX on amazon.{domain} [date]".
2. Etsy sales count — if BSR unavailable, use Etsy sales count per scoring-bands.md Band 2 Etsy table.
3. Pinterest saves — if Amazon + Etsy unavailable, use Pinterest saves per scoring-bands.md Band 2 Pinterest table.
4. Google Trends — supplementary signal. Record interest_score and direction for India + US geos.

**Signal used must be declared:** "Demand band assigned from {source}: {value} on {date}."

## Step 3 — Competitor Analysis

**Amazon India + US:** Search page 1 for primary keyword on both marketplaces. For top 5–10 results per marketplace: review_count, rating, price, brand_type, new_entry_signs.
**Etsy:** Search for primary keyword. Record: number of competing shops, top seller sales counts, price range.

Assign competition_band per scoring-bands.md Band 3 using best available data (Amazon primary, Etsy secondary).

## Step 4 — Differentiation Scan

**Amazon (India + US):** Search recent 1-star and 2-star reviews for top competitors. Look for: quality issues, sizing problems, missing features, packaging complaints. Check Q&A sections for unmet needs.
**Etsy:** Check buyer reviews for similar complaints or wishes.

List concrete differentiation opportunities with source citations.

## Step 5 — Financial Quick Check

Is the category viable at 800–1,200 INR on Amazon India? Does page 1 operate in this range?
On Amazon US: What is the equivalent USD price range? Is there margin headroom?
Products <= 1,000 INR qualify for zero referral fee on Amazon India (effective 2026-03-16) — strong margin signal.
This is a viability FLAG only. Full margin calculation is margin-calculator's job.

## Marketplace Coverage Summary

Every ResearchRecord must include:

```
marketplaces_researched: [list of platforms actually checked]
marketplace_gaps: [list of platforms where data was unavailable + reason]
primary_demand_source: {platform used for demand band}
primary_competition_source: {platform used for competition band}
```
