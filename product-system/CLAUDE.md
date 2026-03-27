# Ismokraft Product Operations — Project Instruction

## What This Project Is

Ismokraft is an Indian D2C brand selling premium wooden products on Amazon India, Shopify, and other marketplaces. This project manages the full product launch lifecycle — from discovering opportunities to post-launch monitoring.

## Architecture (v5)

### Core Principles

1. **Skills are stateless.** They receive inputs, produce outputs, and do not store data between sessions.
2. **CRM is the system of record.** All persistent product data lives in Zoho CRM `Product_Launches` module. Bigin pipeline auto-syncs from CRM.
3. **No skill-to-skill calls.** The operator (human or scheduled task) routes data between skills. Skills never invoke each other directly.
4. **Config is centralized.** `product-ops-config` owns all thresholds, weights, zones, CRM fields, and Slack channels. No skill hardcodes values that belong in config.
5. **Data integrity is non-negotiable.** Every skill enforces the 7 data integrity rules (see below).

### Pipeline Flow

```
Keywords → Discovery → Screening → Evaluation → Specification → Sourcing → Listing → Ads → Monitor
   ↑                                                                                          |
   └──────────────────────── Feedback Loop (scoring calibration) ─────────────────────────────┘
```

### Pipeline Stages (Bigin: Product Launch Factory)

| Stage | Gate Before | Key Skills |
|---|---|---|
| 1. New Request | — | product-discover, ikraft-keyword-intelligence |
| 2. Validated | Gate 1: Product Attractiveness (≥55) | product-evaluate DEEP-EVAL |
| 3. Research & Profitability | Gate 2: Financial Viability (margin ≥15%) | margin-calculator || 4. Test Sourcing | Gate 3: Sourcing Feasibility (≥2 vendors) | product-spec, vendor-ops, supplier-intelligence |
| 5. Test Listing | Gate 4: Vendor Quality (Grade ≥C) | content-writer LISTING |
| 6. Paid Testing | Gate 5: Listing Readiness | ads-ops |
| 7. Scale Decision Data | Gate 6: Test Campaign (ACoS ≤40%) | ads-ops ANALYZE, revenue-ops |
| 8. Sourcing Model Selection | Gate 7: Scale Decision | product-evaluate GATE-CHECK |
| 9. Final Listing | Gate 8: Final Launch Readiness | content-writer |
| 10. Published | — | product-monitor |
| 11. Rejected | Any gate failure | — |

## Skills in This System

### Core Pipeline (run in sequence)
- `ikraft-keyword-intelligence` (KI-) — Daily keyword generation
- `product-discover` (PD-) — Marketplace crawling, BATCH/SINGLE/TRENDS
- `product-screen` (PS-) — Batch scoring, SCORE/REPORT/BRIEF
- `product-evaluate` (PE-) — Deep evaluation, DEEP-EVAL/GATE-CHECK/IDEATE
- `product-spec` (SP-) — Manufacturing specs, SPEC/BRIEF/PRD
- `product-monitor` (PM-) — Post-launch tracking, MONITOR/CLASSIFY/FEEDBACK

### Supporting
- `vendor-ops` (VO-) — Supplier discovery, scoring, RFQ
- `supplier-intelligence` (SI-) — Multi-source supplier verification
- `margin-calculator` (MC-) — Unit economics, channel comparison
- `capital-planner` (CAP-) — Inventory, cash flow, budgets
- `content-writer` (CW-) — Content research, writing, listings
- `ads-ops` (AO-) — PPC campaigns, analysis
- `revenue-ops` (RO-) — Sales, reconciliation, P&L, forecasts

### System
- `product-ops-config` (CFG-) — Centralized config for all above
## 7 Data Integrity Rules

1. **No invented data.** Never fabricate prices, BSR, reviews, dimensions, or market statistics. If data is unavailable, flag the gap.
2. **Source everything.** Every data point must cite its source (Amazon page, web search, user input, CRM record).
3. **Timestamp all outputs.** Every record includes `created_date` or `timestamp`.
4. **Confidence scoring.** Rate confidence as HIGH/MEDIUM/LOW based on data completeness.
5. **CRM is truth.** If CRM data conflicts with session data, CRM wins unless the operator explicitly overrides.
6. **No silent overrides.** If a gate threshold is not met, state it. Do not proceed silently.
7. **Audit trail.** Every CRM write logs what changed, who triggered it, and why.

## Key Financial Constants

- Target Gross Margin: ≥44%
- Target Net Margin: ≥15%
- GST: 12% (wooden products)
- Price sweet spot: ₹800–₹2,000
- Price floor: ₹1,000 (brand rule)
- Target ACoS: ≤40% (test), ≤30% (scale)
- Weight ceiling: ≤2.0 kg (FBA optimization)

## Brand Rules

- Brand: Ismokraft
- Wood dominance: ≥70% wood by volume
- Manufacturing clusters: Jodhpur (primary), Moradabad, Vrindavan
- Country of origin: India (mandatory on all listings and packaging)
- Personalization: Always evaluate — it is a brand differentiator

## CRM Configuration
- **Module:** Product_Launches (Zoho CRM) — master record per product
- **Pipeline:** Product Launch Factory (Bigin) — Pipeline ID: 677677000003294514
- **Vendor data:** Contacts module (Zoho CRM)

## Slack Channels

- `#product-discovery` — Daily discovery summaries
- `#product-alerts` — Gate results, anomalies
- `#vendor-comms` — RFQ outputs, vendor scores

## Zone Rotation (Daily Discovery)

7 zones, 9-day weighted cycle: `(day_of_year - 1) mod 9`
- Positions 0-1: Zone 1 (Workspace)
- Positions 2-3: Zone 2 (Personalized Gifts)
- Position 4: Zone 3 (Home Decor)
- Position 5: Zone 4 (Cultural Gifting)
- Position 6: Zone 5 (Jewelry Storage)
- Position 7: Zone 6 (Lifestyle Accessories)
- Position 8: Zone 7 (Hobby & Specialty)

## Marketplace Rotation

Always-on: Amazon India, Amazon US, Etsy, Pinterest, Google Trends
Rotating daily: `(day_of_year - 1) mod 2` → 0=Europe, 1=Australia

## Plugin

`ismokraft-product-ops.plugin` v1.0.0 — bundles all 14 product-flow skills + 1 config skill into a single installable file for Claude Desktop.