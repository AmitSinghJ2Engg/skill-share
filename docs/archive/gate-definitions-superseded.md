# SUPERSEDED — Do Not Use as Canonical Gate Reference

**Superseded by:** `docs/02-business-domain-map.md` (canonical gate structure: 3 formal gates + stage checklists)
**Decision record:** `docs/decision-log.md` DL-001
**Status:** The criteria below are preserved as historical reference. They have been reclassified:
- Gates 1, 2 (financial), 6 (test results) -> absorbed into formal Gates 1 and 2 in `02`
- Gates 3, 4, 5, 7, 8 -> absorbed as stage exit checklists in `02` domain definitions
- Gate 3 (compliance) -> formal Gate 3 in `02`

---

# 8 Launch Gates (Historical)

Every product passes through 8 gates in the Bigin "Product Launches" pipeline. Each gate has hard requirements that must pass, blocking dependencies on other skills, and a CRM write that auto-syncs to Bigin stage transition on pass.

**Data flow:** All gate writes go to CRM `Product_Launches` module first. CRM auto-syncs to Bigin "Product Launches" pipeline, triggering the stage transition.

## Gate 1 — Product Attractiveness
CRM write: Opportunity_Score, Gate_1_Decision, Gate_1_Notes. Bigin auto-sync: New Request → Validated.
Requires: product-evaluate DEEP-EVAL.
Hard requirements: Opportunity_Score >= 55. Data quality grade A, B, or C.
Fail action: Re-evaluate with more data or reject. Gather more research via product-discover SINGLE.

## Gate 2 — Financial Viability
CRM write: Financial_Viability, Gate_2_Notes. Bigin auto-sync: Validated → Research & Profitability.
Requires: product-evaluate GATE-CHECK + margin-calculator output.
Hard requirements: Net margin >= 15%. CBFA >= 150 INR. Target ACoS <= breakeven ACoS.
Fail action: Raise SP, reduce COGS, or reduce ad dependency. Reference financial formulas.
Note: Products priced <= 1000 INR qualify for zero referral fee on Amazon India (effective 2026-03-16).

## Gate 3 — Sourcing Feasibility
CRM write: Gate_3_Approval, Gate_3_Notes. Bigin auto-sync: Research & Profitability → Test Sourcing.
Requires: product-evaluate GATE-CHECK.
Hard requirements: At least 2 potential suppliers identified. Manufacturing cluster can produce the product. Estimated lead time <= 45 days.
Fail action: Run supplier-intelligence DISCOVER or evaluate alternative clusters.

## Gate 4 — Vendor Quality
CRM write: Vendor_Score, Vendor_Grade. Bigin auto-sync: Test Sourcing → Test Listing.
Requires: product-evaluate GATE-CHECK + vendor-ops SCORE output.
Hard requirements: Vendor Grade >= C. Sample received and quality approved. COGS confirmed within target.
Fail action: Find alternative vendor or negotiate improvements.

## Gate 5 — Listing Readiness
CRM write: Gate_5_Notes. Bigin auto-sync: Test Listing → Paid Testing.
Requires: product-evaluate GATE-CHECK + content-writer LISTING output.
Hard requirements: Title + 5 bullets + description complete. Main image + 6 lifestyle images ready. Backend keywords set (all 250 bytes used).
Fail action: Complete listing copy or schedule photoshoot.

## Gate 6 — Test Campaign Results
CRM write: Scale_Verdict. Bigin auto-sync: Paid Testing → Scale Decision Data.
Requires: product-evaluate GATE-CHECK + ads-ops ANALYZE output.
Hard requirements: Minimum 500 impressions. CTR >= 0.3%. Minimum 10 orders from ads. CVR >= 5% (from ad clicks). ACoS <= breakeven ACoS.
Fail action: Extend test period, optimize targeting, improve listing.

## Gate 7 — Scale Decision
CRM write: Sourcing_Model_Selected. Bigin auto-sync: Scale Decision Data → Sourcing Model Selection.
Requires: product-evaluate GATE-CHECK.
Hard requirements: Sourcing model selected (PL/RTS/DS/POD). Unit economics validated at scale quantities. Gate 6 criteria met.
Fail action: Evaluate all 4 sourcing models against product characteristics.

## Gate 8 — Final Launch Readiness
CRM write: Gate_8_Notes. Bigin auto-sync: Sourcing Model Selection → Final Listing.
Requires: product-evaluate GATE-CHECK.
Hard requirements: Final listing live and indexed. Inventory received at FBA warehouse. All compliance met (BIS/FSSAI/MRP/Brand Registry). Launch PPC campaign configured.
Fail action: Fix listing issues, track shipment, complete certifications.

## Sourcing Models

PL (Private Label): Own branding, full control, highest margin, highest risk.
RTS (Ready to Ship): Pre-made with minimal customization, quick launch.
DS (Dropship): No inventory holding, lower margin, fastest launch.
POD (Print on Demand): Personalized items, per-unit production, good for gifting zones.
