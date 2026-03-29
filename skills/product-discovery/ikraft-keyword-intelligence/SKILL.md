---
name: ikraft-keyword-intelligence
description: >
  KI- Generates daily seed keywords and scans rising search signals. GENERATE:
  3-layer keyword model into KeywordSet[]. SCAN: search velocity and emerging
  category signals into TrendSignal[].
version: "2.0.0"
lifecycle: active
---

# Keyword Intelligence

Generates structured, prioritised keywords for daily product discovery and scans for emerging search signals.

**Boundary:** This skill generates and scores keywords only. It does not crawl products (product-discover), score candidates (product-screen), or write to CRM/Slack.

## Modes

| Mode | Input | Output | Downstream |
|---|---|---|---|
| **GENERATE** | zone_id + date | `KeywordSet[]` (5-30 keywords) | product-discover BATCH |
| **SCAN** | zone_id or category | `TrendSignal[]` | GENERATE (refinement), product-discover TRENDS |

## MODE: GENERATE

Produce a prioritised keyword list for today's discovery run using 3 layers.

1. **Load zone data** from project context (`zone-rotation.json`). Extract today's zone seed keywords (Layer 1: Strategic Anchors, max 5). These are stable, curated terms from the opportunity map. Confidence: HIGH.
2. **Expand via autocomplete** (Layer 2: Dynamic Expansion). For each Layer 1 seed, capture Amazon India + Google autocomplete suggestions (max 5 per seed). Filter out excluded categories (toys, medical, electronics, apparel, baby, kids, licensed IP). Each keyword must contain a material or product signal (wood, wooden, bamboo, etc.) or match an opportunity map category. Skip Layer 2 entirely if browser unavailable -- note `layer2_skipped: true`. Confidence: MEDIUM.
3. **Generate intent variants** (Layer 3: Intent & Premium). Combine zone product types with occasion, emotion, persona, and purchase-intent modifiers. Generate 5-8 keywords. Prioritise modifiers that performed well in past learning signals; suppress modifiers with zero-yield across 3+ runs. Confidence: LOW.
4. **Apply learning signals** (if `keyword-learning-signals.json` exists in project context): promote top-performing keywords, suppress zero-yield keywords (3+ consecutive runs), use high-score patterns for Layer 3 generation.
5. **Score each keyword**: demand_estimate, competition_estimate, intent_signal, novelty (HIGH if unused or 10+ runs ago, MEDIUM if 4-10, LOW if last 3). Target novelty ratio >= 0.30.
6. **Assign semantic cluster** per keyword (e.g. desk_organization, anniversary_gifting, wall_decor). One keyword = one cluster.
7. **Validate output**: 5-30 keywords, no duplicates, no excluded category terms, novelty ratio checked.

**Output:** `KeywordSet[]` with per-keyword: keyword, layer (1/2/3), cluster, scores, source, confidence, zone_id. Metadata: zone info, date, layer breakdown, suppressed_keywords[], novelty_ratio.

## MODE: SCAN

Detect rising search velocity and emerging category signals for keyword refinement.

1. **Google Trends scan** (India + US geo) for zone default keywords and recent top performers. Flag rising/breakout signals.
2. **Amazon movers & shakers** scan for zone-relevant categories. Identify new product types entering best-seller lists.
3. **Meta ad library scan** (optional, Shopify-relevant): search for active ads in zone categories. Flag products with high ad frequency as potential Shopify opportunities.
4. **Produce TrendSignal[]** per keyword/category: signal_strength, trend_direction (rising/stable/declining/breakout), confidence, evidence[], sources_checked[].

**Output:** Ranked `TrendSignal[]` by signal_strength desc. Feed into GENERATE for learning signal updates.

## Input Validation

| Mode | Required | Block if missing |
|---|---|---|
| GENERATE | zone_id (1-7) + date | No zone data to load |
| SCAN | zone_id or category name | No search target |

Both modes require opportunity map accessible in project context.

## Halt Conditions

- GENERATE: all Layer 1 seeds suppressed (zero-yield 3+ runs) -> halt, request manual keyword review
- GENERATE: zero keywords pass validation -> halt, return empty set with reason
- SCAN: all signals UNKNOWN -> return with UNKNOWN confidence, never invent trends

## Rules

1. Layer 1 keywords come from the opportunity map. Never invent seed keywords.
2. Layer 2 keywords come from real autocomplete. If unavailable, skip -- never fake.
3. Layer 3 keywords are pattern-derived and labelled confidence LOW. Never present as search-validated.
4. Never invent demand or competition scores. Unknown = UNKNOWN.
5. Data integrity rules from project context apply.

## Trigger Phrases

KI-, generate keywords, seed keywords, keyword intelligence, daily keywords, expand keywords, keyword for zone, what keywords should I use, scan trends, search velocity, rising keywords.