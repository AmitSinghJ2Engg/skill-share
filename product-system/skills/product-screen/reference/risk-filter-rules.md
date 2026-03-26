# Risk Filter Rules — REPORT Mode

4 risk filters applied to scored candidates before top-10 ranking. Each filter returns PASS, CONDITIONAL, or FAIL.

FAIL candidates are excluded from the top-10 report. CONDITIONAL candidates are included but flagged for manual review.

## Filter 1 — Trademark

Criteria: Product name contains branded or trademarked terms.

PASS: Generic product name, no brand dependency.
CONDITIONAL: Brand-adjacent naming but generic alternative exists. Flag for review.
FAIL: Branded name with no generic alternative. Cannot list without IP risk.

Examples of FAIL: "Ikea-style shelf", product names containing registered brand terms.
Examples of CONDITIONAL: "Montessori wooden toy" (Montessori is genericised but check context).

## Filter 2 — Seasonality

Criteria: Demand concentration in calendar quarters.

PASS: Demand spread across 3+ quarters. No single quarter exceeds 40%.
CONDITIONAL: One quarter has 40–70% of demand. Viable with inventory planning.
FAIL: > 70% of sales concentrated in one quarter. High stockout or dead-stock risk.

Evidence sources: Google Trends seasonal pattern, Amazon BSR history (if available), category knowledge from opportunity map (in project knowledge).

## Filter 3 — Certification

Criteria: Product requires mandatory certifications to sell in India or on Amazon.

PASS: No certifications required. Standard wood/home decor product.
CONDITIONAL: Optional certification exists (ISI mark for some categories). Adds cost but not blocking.
FAIL: Mandatory certification needed — electrical (BIS), food-contact (FSSAI), medical devices, children's safety standards.

Note: Most wooden home decor and gifting products are PASS. Flag kitchen items that contact food.

## Filter 4 — Fragility

Criteria: Breakage risk during FBA warehouse handling and shipping.

PASS: Solid wood, no fragile components. Standard packaging sufficient.
CONDITIONAL: Some fragile elements (thin legs, glass inserts) but protectable with custom packaging. Adds cost.
FAIL: Glass-dominant, thin ceramic, unsupported overhangs, products that cannot survive a 1-metre drop test.

Note: Wood products generally score well here. Watch for combined materials (wood + glass, wood + ceramic).

## Applying Filters

1. Evaluate all 4 filters per candidate.
2. Final filter_verdict = worst individual result (one FAIL = overall FAIL).
3. Record individual filter results for transparency.
4. FAIL candidates excluded from top-10 but logged in rejection_log with reason.
5. CONDITIONAL candidates ranked normally but carry a flag and review note.
