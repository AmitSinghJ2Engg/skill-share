# Research Framework — SINGLE Mode

Step-by-step methodology for deep single-product research. Returns ResearchRecord for product-lab DEEP-EVAL.

## Depth Options

quick (5–10 min): Steps 1–2 only → partial ResearchRecord.
standard (15–20 min): Steps 1–5 → full ResearchRecord (default).
deep (30–45 min): Steps 1–5 + ASIN deep-dive per Step 3 extended → full ResearchRecord + competitor ASIN analysis.

## Step 1 — Keyword Discovery

Queries: "{product_name}" site:amazon.in. "{primary_keyword}" Amazon India best seller. "{category}" Amazon.in most wished for.
Output: primary_keyword, secondary_keywords, search_volume_data.
If Helium10/Jungle Scout data is provided, use directly — mark source explicitly.

## Step 2 — Demand Analysis

From BSR data (own research or user-provided). Assign demand_band per scoring-bands.md.
State basis: "Estimated from BSR ~X,XXX on [date]".

## Step 3 — Competitor Analysis

Search Amazon India page 1 for primary keyword. For top 5–10 results: review_count, rating, price, brand_type, new_entry_signs.
Assign competition_band per scoring-bands.md.

## Step 4 — Differentiation Scan

Search recent 1-star and 2-star reviews for top competitors. Look for: quality issues, sizing problems, missing features, packaging complaints.
Check Q&A sections for unmet needs. List concrete differentiation opportunities.

## Step 5 — Financial Quick Check

Is the category viable at 800–1,200 INR? Does page 1 operate in this range?
Products <= 1,000 INR qualify for zero referral fee (effective 2026-03-16) — strong margin signal.
This is a viability FLAG only. Full margin calculation is margin-calculator's job.
