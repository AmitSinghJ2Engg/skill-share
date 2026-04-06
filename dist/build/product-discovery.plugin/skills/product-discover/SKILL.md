---
name: product-discover
description: >
  PD- Discovers wooden premium product opportunities via three modes. BATCH: crawls
  marketplaces with seed keywords into ProductCandidate[]. SINGLE: deep research on one
  product into ResearchRecord. TRENDS: scans zone signals into TrendSignal[].
version: "2.3.0"
lifecycle: active
---

# Product Discover

Discovers and researches product opportunities across Amazon India, Amazon US, Etsy, Pinterest, and Google Trends.

## Modes

| Mode | Input | Output | Downstream |
|---|---|---|---|
| **BATCH** | seed_keywords (+ optional zone) | `ProductCandidate[]` + `BatchRunSummary` | product-screen |
| **SINGLE** | product_name + category | `ResearchRecord` | product-evaluate |
| **TRENDS** | zone_name | `TrendSignal[]` | BATCH or product-evaluate |
| **LISTING_PARSE** | amazon_url | `ListingRecord` | ads-ops SCENARIO |

**Boundary:** This skill discovers and researches. It does not score (product-screen), evaluate gates (product-evaluate), or calculate margins (margin-calculator).

## MODE: BATCH

1. Load keywords --from `ikraft-keyword-intelligence` output (preferred) or seed expansion from zone defaults in project context (`zone-rotation.ctx.json`).
2. Determine today's marketplace set: always-on + rotating marketplace per rotation formula in project context (`pipeline-config.ctx.json`).
3. For each keyword x marketplace: crawl per source protocols in `references/source-protocols.md`. Produce `CrawlRecord` with raw fields as-is.
4. Extract and normalize: parse per platform, convert currencies to INR, apply category filter from project context, deduplicate (exact ID + fuzzy title >= 80%).
5. Assign `candidate_id`: `PD-{YYYYMMDD}-{0001..NNNN}`. Compute `data_completeness_pct`.
6. Enrich: Pinterest saves, Google Trends, Etsy favorites. Null if unreachable (valid, not error).
7. Return `ProductCandidate[]` + `BatchRunSummary`. **No CRM writes or Slack posts** -- persistence and notifications handled by zoho-data-ops and task orchestrator.

**Output:** `ProductCandidate[]` + `BatchRunSummary`.

## MODE: SINGLE

Deep multi-marketplace research on one product. Depth: quick (steps 1-2), standard (1-5), deep (1-5 + ASIN dive).

1. Keyword discovery --search across Amazon India, US, Etsy. Record primary/secondary keywords.
2. Demand analysis --BSR, Etsy sales rank, Pinterest saves, Google Trends. Assign demand band per scoring model in `references/scoring-bands.md`.
// TODO: Move scoring band thresholds to gate-criteria.ctx.json in project context so both Cowork and Desktop plugin users have them at runtime.
3. Competitor analysis --page 1 scan on Amazon India + US + Etsy. Assign competition band.
4. Differentiation scan --review mining (1-star/2-star), Q&A gaps, Etsy review patterns.
5. Financial quick check --price viability flag (not a margin calculation).
6. Compute `niche_score` from band sums per `references/scoring-bands.md`. Assign verdict.

**Output:** `ResearchRecord`. Hand off to product-evaluate DEEP-EVAL.

Note: `niche_score` is a research indicator only. `Opportunity_Score` in CRM is owned by product-evaluate.

## MODE: TRENDS

1. Load zone from project context (`zone-rotation.ctx.json`) --get zone default keywords (max 3).
2. For each keyword: Google Trends (India geo), web search for signals, Amazon India + US best sellers, Etsy trending.
3. Pinterest scan if available.
4. Produce `TrendSignal` per keyword: signal_strength, trend_direction, confidence, evidence[], marketplaces_checked[].

**Output:** Ranked `TrendSignal[]` by signal_strength desc.

## MODE: LISTING_PARSE

Extract structured product data from an Amazon listing URL for campaign planning.

1. Read the product page (user provides URL; Claude fetches or user pastes HTML).
2. Extract core fields: ASIN, title, bullets[], description, price, brand, category, parent_asin, variation_count, main_image_url.
3. Extract competitor signals: rating, review_count, BSR, BSR_category.
4. Parse title + bullets for implicit keywords (product-type + material + use-case + modifier tokens).
5. Extract "Customers also viewed" ASINs (competitor_asins[]) if visible.
6. Mine review themes: top 3 positive mentions, top 3 negative/complaint patterns (from visible reviews).
7. Output `ListingRecord` with all fields, confidence per field (HIGH if extracted, LOW if inferred).

**Output:** `ListingRecord` — structured JSON:
```json
{
  "asin": "string", "title": "string", "bullets": ["string"],
  "price_inr": "number", "brand": "string", "category": "string",
  "bsr": "number|null", "rating": "number|null", "review_count": "number|null",
  "implicit_keywords": ["string"], "competitor_asins": ["string"],
  "review_themes": { "positive": ["string"], "negative": ["string"] },
  "data_completeness_pct": "number"
}
```

## Input Validation

| Mode | Required | Block if missing |
|---|---|---|
| BATCH | >=1 seed_keyword or zone | No search target |
| SINGLE | product_name + category | Incomplete research |
| TRENDS | zone in project context | List valid zones |
| LISTING_PARSE | amazon_url | No listing to parse |

## Halt Conditions

- BATCH Phase 1: zero success across all marketplaces -> halt, request user paste
- BATCH Phase 2: zero candidates after filter -> halt, return rejection_log
- SINGLE: name not specific -> ask for full name + category
- TRENDS: all signals UNKNOWN -> return with UNKNOWN confidence, never invent

## Rules

1. Never invent BSR, reviews, or search volume. Unverifiable = null + data_gap.
2. Source everything --every data point traces to URL or user export.
3. Financial quick check is NOT margin calculation.
4. Returns structured data only. CRM writes handled by zoho-data-ops. No local file saves.
5. Data integrity rules from project context apply to all modes.

## Trigger Phrases

PD-, start discovery, crawl products, discover products, research this product, is there demand, find opportunities, what's trending, run seed keywords, batch mode, single mode, trends mode, parse listing, listing parse, extract listing data, LISTING_PARSE.
