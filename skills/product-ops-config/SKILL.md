---
name: product-ops-config
description: >
  Centralized configuration for the Ismokraft product operations system. Contains
  scoring weights, gate thresholds, zone definitions, marketplace rotation, fee
  table pointers, Slack channels, CRM module/field names, and brand rules. All
  product-flow skills reference this config instead of hardcoding values.
  ALWAYS trigger for: "config", "thresholds", "scoring weights", "zone rotation",
  "fee table", "CRM fields", "Slack channels", "brand rules", "system config",
  "what are the gate thresholds", "marketplace rotation schedule". Also loads
  automatically when any product-flow skill needs a configuration value.
  If unsure — trigger.
metadata:
  domain: system
  prefix: CFG-
  version: 1.0.0
  write_permissions: []
---

# Product Ops Config

Single source of truth for all configurable values across the product operations system. No skill should hardcode any value that appears here.

---

## Pipeline Stages (Bigin: Product Launch Factory)

| Stage # | Stage Name | Gate Before | Skills Involved |
|---|---|---|---|
| 1 | New Request | — | product-discover, ikraft-keyword-intelligence || 2 | Validated | Gate 1 (Product Attractiveness) | product-evaluate DEEP-EVAL |
| 3 | Research & Profitability | Gate 2 (Financial Viability) | margin-calculator, product-evaluate GATE-CHECK |
| 4 | Test Sourcing | Gate 3 (Sourcing Feasibility) | product-spec, vendor-ops, supplier-intelligence |
| 5 | Test Listing | Gate 4 (Vendor Quality) | content-writer LISTING |
| 6 | Paid Testing | Gate 5 (Listing Readiness) | ads-ops |
| 7 | Scale Decision Data | Gate 6 (Test Campaign Results) | ads-ops ANALYZE, revenue-ops |
| 8 | Sourcing Model Selection | Gate 7 (Scale Decision) | product-evaluate GATE-CHECK |
| 9 | Final Listing | Gate 8 (Final Launch Readiness) | content-writer |
| 10 | Published | — | product-monitor |
| 11 | Rejected | — (can happen at any gate) | — |

**Bigin Pipeline ID:** 677677000003294514

---

## Gate Thresholds

| Gate | Name | Hard Requirements | Scored Threshold |
|---|---|---|---|
| 1 | Product Attractiveness | Opportunity_Score exists | Opportunity_Score ≥ 55 |
| 2 | Financial Viability | Net margin ≥ 15%, COGS confirmed | Financial_Viability score ≥ 60 |
| 3 | Sourcing Feasibility | ≥ 2 qualified vendors, sample ordered | Gate_3_Approval = true |
| 4 | Vendor Quality | Sample received, quality inspection pass | Vendor_Score ≥ 60, Vendor_Grade ≥ C |
| 5 | Listing Readiness | Title, 5 bullets, images (min 5), A+ brief | Gate_5 checklist complete |
| 6 | Test Campaign Results | ≥ 14 days PPC data, ≥ 50 clicks | ACoS ≤ 40%, CVR ≥ 1.5% |
| 7 | Scale Decision | Revenue covers ad spend, positive CM | Scale_Verdict = SCALE or PIVOT |
| 8 | Final Launch Readiness | Inventory ≥ 30 days, listing live, ads active | Gate_8 checklist complete |

---
## Scoring Weights

### product-screen: 8-Dimension Model (equal weight)
Each dimension: 12.5 points. Total: 100.

### product-evaluate: 16-Criteria Model (weighted)
| Dimension | Weight | Criteria Count |
|---|---|---|
| Market Demand | 30% | 4 |
| Competition Beatability | 25% | 4 |
| Margin Potential | 25% | 4 (includes Risk at -10) |
| Differentiation Room | 20% | 4 (includes Legal at 0) |

### Score Bands
| Band | Range | Action |
|---|---|---|
| STRONG | 75–100 | Proceed to next gate |
| PROMISING / MODERATE | 55–74 | Proceed with caution |
| WEAK | 35–54 | Needs improvement or reject |
| REJECT | 0–34 | Do not proceed |

---

## Zone Definitions (Opportunity Map)

| Zone | Name | Focus | Weight (rotation days) |
|---|---|---|---|
| 1 | Workspace Products | Desk organizers, pen holders, laptop stands | 2 |
| 2 | Personalized Gifts | Engraved items, occasion gifts, name plates | 2 || 3 | Home Decor | Wall art, photo frames, candle holders | 1 |
| 4 | Cultural Gifting | Puja items, diya sets, festival gifts | 1 |
| 5 | Jewelry & Accessories Storage | Jewelry boxes, watch cases, valet trays | 1 |
| 6 | Lifestyle Accessories | Phone stands, coasters, key holders | 1 |
| 7 | Hobby & Specialty | Chess sets, puzzles, display cases | 1 |

### Zone Rotation Formula
`cycle_position = (day_of_year - 1) mod 9`

| Position | Zone |
|---|---|
| 0, 1 | Zone 1 |
| 2, 3 | Zone 2 |
| 4 | Zone 3 |
| 5 | Zone 4 |
| 6 | Zone 5 |
| 7 | Zone 6 |
| 8 | Zone 7 |

---

## Marketplace Rotation

**Always-on:** Amazon India (.in), Amazon US (.com), Etsy, Pinterest, Google Trends

**Rotating:** `day_number = (day_of_year - 1) mod 2`
- Day 0: Amazon Europe (.co.uk, .de)
- Day 1: Amazon Australia (.com.au)

---
## Financial Formulas (Key Constants)

| Constant | Value | Source |
|---|---|---|
| Target Gross Margin | ≥ 44% | Unit Economics sheet |
| Target Net Margin | ≥ 15% | Gate 2 threshold |
| Marketplace Fees (Amazon India) | Category-dependent, see amazon-fee-table.md | Amazon Seller Central |
| Tax Rate (GST) | 12% of SP (for wooden products) | Standard rate |
| COD + Payment Gateway | 2% of SP | Industry standard |
| Default Returns Rate | 5% | Conservative assumption |
| CAC Benchmark | 30% of SP | Industry standard |
| Target ACoS | ≤ 40% (test), ≤ 30% (scale) | Gate 6 threshold |

### Price Band
- Sweet spot: ₹800–₹2,000 SP
- Acceptable: ₹500–₹3,000 SP
- Below ₹500: reject (margin insufficient)
- Above ₹3,000: conditional (higher return risk)

---

## CRM Configuration

### Module: Product_Launches (Zoho CRM)
Key fields written by skills:
- `Opportunity_Score` — product-evaluate DEEP-EVAL
- `Gate_1_Decision` through `Gate_8_Notes` — product-evaluate GATE-CHECK
- `Financial_Viability` — margin-calculator (via artifact)
- `Vendor_Score`, `Vendor_Grade` — vendor-ops SCORE
- `Product_Spec_Status`, `Spec_Version`, `BOM_Total_COGS` — product-spec- `Scale_Verdict` — ads-ops / product-evaluate
- `Post_Launch_Status` — product-monitor
- `Launch_Priority` — product-screen BRIEF

### Module: Contacts (Zoho CRM — Vendors)
- `Vendor_Score`, `Vendor_Grade` — vendor-ops SCORE

### Pipeline: Product Launch Factory (Bigin)
- Pipeline ID: 677677000003294514
- Auto-syncs from CRM Product_Launches gate decisions

---

## Slack Channels

| Channel | Purpose | Skills That Post |
|---|---|---|
| #product-discovery | Daily discovery summaries, batch reports | product-discover, product-screen |
| #product-alerts | Gate results, anomalies, high-priority signals | product-evaluate, product-monitor |
| #vendor-comms | RFQ outputs, vendor scores | vendor-ops |

---

## Brand Rules

- **Brand name:** Ismokraft
- **Tagline:** (to be defined)
- **Wood dominance:** ≥ 70% wood by volume for all products
- **Price floor:** ₹1,000 minimum SP (no sub-₹1,000 products)
- **Weight ceiling:** ≤ 2.0 kg per unit (FBA optimization)
- **Manufacturing clusters:** Jodhpur (primary), Moradabad, Vrindavan- **Personalization:** Always evaluate personalization fit — it's a brand differentiator
- **Country of origin:** India (mandatory on all listings and packaging)