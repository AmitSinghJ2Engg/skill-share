# 8 Launch Gates

Every product passes through 8 gates in the Bigin "Product Launch Factory" pipeline. Each gate has hard requirements that must pass, blocking dependencies on other skills, and a Bigin stage transition on pass.

## Gate 1 — Product Attractiveness
Bigin: New Request → Validated. Writes: Opportunity_Score.
Requires: product-lab DEEP-EVAL.
Hard requirements: Opportunity_Score >= 55. Data quality grade A, B, or C.
Fail action: Re-evaluate with more data or reject. Gather more research via product-intelligence SINGLE.

## Gate 2 — Financial Viability
Bigin: Validated → Research & Profitability. Writes: Financial_Viability.
Requires: product-lab GATE-CHECK + margin-calculator output.
Hard requirements: Net margin >= 15%. CBFA >= 150 INR. Target ACoS <= breakeven ACoS.
Fail action: Raise SP, reduce COGS, or reduce ad dependency. Reference financial formulas.
Note: Products priced <= 1000 INR qualify for zero referral fee on Amazon India (effective 2026-03-16).

## Gate 3 — Sourcing Feasibility
Bigin: Research & Profitability → Test Sourcing.
Requires: product-lab GATE-CHECK.
Hard requirements: At least 2 potential suppliers identified. Manufacturing cluster can produce the product. Estimated lead time <= 45 days.
Fail action: Run supplier-intelligence DISCOVER or evaluate alternative clusters.

## Gate 4 — Vendor Quality
Bigin: Test Sourcing → Test Listing. Writes: Vendor_Score.
Requires: product-lab GATE-CHECK + vendor-ops SCORE output.
Hard requirements: Vendor Grade >= C. Sample received and quality approved. COGS confirmed within target.
Fail action: Find alternative vendor or negotiate improvements.

## Gate 5 — Listing Readiness
Bigin: Test Listing → Paid Testing.
Requires: product-lab GATE-CHECK + content-writer LISTING output.
Hard requirements: Title + 5 bullets + description complete. Main image + 6 lifestyle images ready. Backend keywords set (all 250 bytes used).
Fail action: Complete listing copy or schedule photoshoot.

## Gate 6 — Test Campaign Results
Bigin: Paid Testing → Scale Decision Data. Writes: Scale_Verdict.
Requires: product-lab GATE-CHECK + ads-ops ANALYZE output.
Hard requirements: Minimum 500 impressions. CTR >= 0.3%. Minimum 10 orders from ads. CVR >= 5% (from ad clicks). ACoS <= breakeven ACoS.
Fail action: Extend test period, optimize targeting, improve listing.

## Gate 7 — Scale Decision
Bigin: Scale Decision Data → Sourcing Model Selection. Writes: Sourcing_Model_Selected.
Requires: product-lab GATE-CHECK.
Hard requirements: Sourcing model selected (PL/RTS/DS/POD). Unit economics validated at scale quantities. Gate 6 criteria met.
Fail action: Evaluate all 4 sourcing models against product characteristics.

## Gate 8 — Final Launch Readiness
Bigin: Sourcing Model Selection → Final Listing.
Requires: product-lab GATE-CHECK.
Hard requirements: Final listing live and indexed. Inventory received at FBA warehouse. All compliance met (BIS/FSSAI/MRP/Brand Registry). Launch PPC campaign configured.
Fail action: Fix listing issues, track shipment, complete certifications.

## Sourcing Models

PL (Private Label): Own branding, full control, highest margin, highest risk.
RTS (Ready to Ship): Pre-made with minimal customization, quick launch.
DS (Dropship): No inventory holding, lower margin, fastest launch.
POD (Print on Demand): Personalized items, per-unit production, good for gifting zones.
