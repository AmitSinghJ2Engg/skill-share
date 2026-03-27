---
name: product-discover
description: >
  Discovers and researches wooden premium product opportunities via three modes. BATCH: crawls
  Amazon India, Amazon US, Etsy, Pinterest across multiple marketplaces → enriched ProductCandidate[].
  SINGLE: deep multi-marketplace research on one product → ResearchRecord (demand signals, keywords,
  competition, price clusters). TRENDS: scans signals by zone from the wood opportunity map →
  TrendSignal[]. ALWAYS trigger for: "start discovery", "crawl products", "discover products",
  "research this product", "is there demand", "keyword research", "BSR analysis", "find opportunities",
  "what's trending", "which zone to explore", "run seed keywords", "find wooden products", "market
  validation", "niche research", "page 1 analysis", "batch mode", "single mode", "trends mode",
  "crawl mode", "PD-". Also trigger when market data is needed before product-evaluate runs or a
  zone needs trend scanning. If unsure — trigger.
metadata:
  domain: product
  prefix: PD-
  version: 2.1.0
---

# Product Discover

Single skill for all product discovery and research needs.

Three modes — invoke independently or chain:

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **BATCH** | seed_keywords (+ optional zone) | enriched `ProductCandidate[]` → CRM records + Slack summary | product-screen SCORE |
| **SINGLE** | product_name + category | `ResearchRecord` | product-evaluate DEEP-EVAL |
| **TRENDS** | zone_name | `TrendSignal[]` | BATCH mode or product-evaluate IDEATE |

**Capability boundary:** This skill discovers and researches. It does not score, evaluate
gates, or generate concepts — those are product-evaluate. It does not calculate margins — that is margin-calculator.

## Shared Knowledge (always in context)

The opportunity map, financial formulas, gate definitions, and data integrity rules are available in project knowledge. Do not read separate files for these — they are already in context.

## Skill-Specific Reference Files

For detailed rules loaded only when needed:

- **Source protocols**: See [reference/source-protocols.md](reference/source-protocols.md) — per-platform crawl rules for BATCH Phase 1 (covers Amazon India, US, Europe, Australia, Etsy, Pinterest, Google Trends)
- **Scoring bands**: See [reference/scoring-bands.md](reference/scoring-bands.md) — 4-band niche_score model for SINGLE mode
- **Research framework**: See [reference/research-framework.md](reference/research-framework.md) — step-by-step SINGLE mode methodology

---

## DATA INTEGRITY CONTRACT

The 7 data integrity rules (NEVER INVENT DATA, NULL IS CORRECT, SOURCE AND CONFIDENCE, etc.) are defined in project knowledge under data-integrity-rules.md. They apply to every mode, every source, every run. Non-negotiable.

---

## Marketplace Strategy

**Always-on marketplaces:** Amazon India (.in), Amazon US (.com), Etsy, Pinterest, Google Trends.

**Rotating marketplaces:** Amazon Europe (.co.uk, .de) and Amazon Australia (.com.au) rotate on alternate days.

**Rotation formula:** `day_number = (day_of_year - 1) mod 2`. Day 0 = Europe (.co.uk + .de). Day 1 = Australia (.com.au).

All marketplace results feed into the same `ProductCandidate` schema with per-platform signal blocks (all nullable).

---

## Zone Rotation (Scheduled Task)

Zones rotate on a weighted 9-day cycle. Zone 1 (Workspace) and Zone 2 (Gifts) each get 2 days; Zones 3–7 get 1 day each.

**Formula:** `cycle_position = (day_of_year - 1) mod 9`

| Cycle position | Zone |
|---|---|
| 0, 1 | Zone 1 — Workspace Products |
| 2, 3 | Zone 2 — Personalized Gifts |
| 4 | Zone 3 — Home Decor |
| 5 | Zone 4 — Cultural Gifting |
| 6 | Zone 5 — Jewelry & Accessories Storage |
| 7 | Zone 6 — Lifestyle Accessories |
| 8 | Zone 7 — Hobby & Specialty |

---

## Runtime Mode Detection

```
IF browser_control available (Claude Desktop / Claude_in_Chrome):
  → Use Mode A for all sources
  → Amazon: navigate as user session, stop at CAPTCHA, escalate to Mode B
  → Pinterest: use Claude_in_Chrome desktop app for saves data

ELSE (Claude.ai / no browser_control):
  → Amazon: Mode B (user paste) ONLY — web_fetch is robots_blocked
  → Etsy: web_search fallback acceptable
  → Pinterest: web_search — saves = null (declare)
  → Google Trends: web_fetch embed URL fallback
```

---

## MODE: BATCH

**Purpose:** Discover raw product candidates from multiple marketplaces, then transform and enrich into scored-ready `ProductCandidate[]`. Write results to CRM and send Slack summary.

**When to invoke:** "start discovery", "run seed keywords", "crawl for wooden products", "find products in [zone]".

### Phase 1 — Crawl

Read [reference/source-protocols.md](reference/source-protocols.md) for per-source rules.

**Keyword sourcing options (choose one):**
- **Option A (recommended):** Invoke `ikraft-keyword-intelligence` first to get structured keywords with layer metadata, then use those keywords for crawling.
- **Option B (standalone):** Load seed keywords from input or zone defaults from the opportunity map (in project knowledge), expand each seed (max 5 per seed, from observed autocomplete only).

1. Load keywords — from keyword skill output (Option A) or seed expansion (Option B)
2. Determine today's marketplace set: always-on (Amazon India, Amazon US, Etsy, Pinterest, Google Trends) + rotating marketplace per formula
3. For each keyword and each enabled marketplace: apply source protocol, fetch or accept user paste
4. Produce `CrawlRecord` — all raw_fields as-is, never interpreted
5. Set crawl_status: success | captcha_blocked | robots_blocked | js_failed | user_paste
6. Produce `CrawlBatch` with batch_id = `PD-BATCH-{YYYYMMDD}-{NNN}`

**Halt:** Zero success records across ALL marketplaces → halt, report blocks, request Mode B paste.

### Phase 2 — Extract + Normalise

1. Parse raw_fields per platform rules → typed `ExtractedProduct` per record
2. Convert currencies to INR canonical (USD → INR, GBP → INR, EUR → INR, AUD → INR)
3. Apply category filter (excluded categories from opportunity map in project knowledge)
4. Deduplicate: exact ID match within platform, then cross-platform fuzzy title match >= 80%
5. Assign candidate_id: `PD-{YYYYMMDD}-{0001..NNNN}`
6. Compute data_completeness_pct from platform-relevant core fields
7. Map to ProductCandidate schema with per-platform signal blocks

**Halt:** Zero candidates survive filter → halt, return rejection_log.

### Phase 3 — Enrich

1. For each candidate: query Pinterest saves, Google Trends score/direction, Etsy favorites, social traction
2. Populate per-platform signal blocks — null if source unreachable (valid, not an error)
3. Record enrichment_gaps[] for candidates where all signals = null
4. Return complete ProductCandidate[]

### Phase 4 — Output

1. **CRM write:** For each ProductCandidate, call `ZohoCRM_createRecords` on `Product_Launches` module. Map fields per CRM Field Mapping table below. CRM auto-syncs to Bigin "Product Launches" pipeline at "Idea Intake" stage.
2. **Slack summary:** Send daily discovery summary to #product-discovery via Slack. Include: zone researched, keywords used, candidates found, top 5 by data completeness, marketplace coverage stats.

**Output:** `ProductCandidate[]` + `BatchRunSummary` + CRM record IDs + Slack message confirmation.

---

## MODE: SINGLE

**Purpose:** Deep multi-marketplace research on a single known product. Returns `ResearchRecord` ready for product-evaluate DEEP-EVAL.

**When to invoke:** "research this product", "is there demand for X", "BSR analysis", "page 1 analysis".

Read [reference/research-framework.md](reference/research-framework.md) for step-by-step methodology.
Read [reference/scoring-bands.md](reference/scoring-bands.md) for niche_score band tables.

**Depth options:** quick (5–10 min, steps 1–2), standard (15–20 min, steps 1–5), deep (30–45 min, steps 1–5 + ASIN deep-dive).

**Research steps:**
1. Keyword Discovery — search queries across Amazon India, Amazon US, Etsy; record primary/secondary keywords
2. Demand Analysis — multi-platform demand signals (Amazon BSR where available, Etsy sales rank, Pinterest saves, Google Trends); assign demand_band using best available signal
3. Competitor Analysis — page 1 scan on Amazon India + US + Etsy; assign competition_band
4. Differentiation Scan — review mining (Amazon 1-star/2-star), Etsy review patterns, Q&A gaps
5. Financial Quick Check — price viability flag across marketplaces (not a calculation)

**Niche Score:** Sum all 4 bands per scoring-bands.md. Apply confidence penalties. Assign verdict (STRONG/PROMISING/CONDITIONAL/NEEDS_DATA/WEAK/REJECT).

**Handoff:** ResearchRecord complete → hand off to product-evaluate DEEP-EVAL for full evaluation.

```
niche_score is a research-phase indicator only.
It does NOT write to CRM or Bigin. Opportunity_Score written to CRM (syncs to Bigin)
is owned by product-evaluate DEEP-EVAL — that is the authoritative Gate 1 value.
```

---

## MODE: TRENDS

**Purpose:** Scan for trending product signals within a specific zone from the opportunity map (in project knowledge).

**When to invoke:** "what's trending in [zone]", "which zone should we explore", "trend scan".

**Steps:**
1. Load zone from opportunity map (project knowledge) — get zone default keywords
2. For each zone keyword (max 3): Google Trends score + direction for India geo, web_search for trending signals, Amazon India + US best seller signals, Etsy trending searches
3. Pinterest scan: pin volume signal (use Claude_in_Chrome if available)
4. Produce TrendSignal per keyword: signal_strength (HIGH/MEDIUM/LOW/UNKNOWN), trend_direction (rising/stable/declining/breakout/unknown), confidence, evidence (list every source citation), marketplaces_checked[]
5. Return ranked TrendSignal[] by signal_strength desc

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| BATCH | At least one seed_keyword or zone | Block — no search target |
| SINGLE | product_name + category | Block — research incomplete without product name |
| TRENDS | zone matching opportunity map | Block — list valid zones if unrecognised |

If blocked: state exact missing input. Do not proceed. Do not invent data.

## Halt Conditions

| Condition | Mode | Action |
|---|---|---|
| Zero crawl success records across ALL marketplaces | BATCH Phase 1 | Halt. Report block type per marketplace. Request Mode B paste. |
| Zero candidates after filter | BATCH Phase 2 | Halt. Return rejection_log. Suggest keyword review. |
| Product name not specific enough | SINGLE | Ask for full product name + category. |
| Zone not in opportunity map | TRENDS | List valid zones. Ask user to select. |
| All trend signals = UNKNOWN | TRENDS | Return result with UNKNOWN confidence. Do not invent signals. |

---

## CRM Field Mapping (BATCH Phase 4)

| ProductCandidate field | CRM `Product_Launches` field |
|---|---|
| title | Name |
| category | Product_Category |
| marketplaces_found (comma-separated) | Target_Platform |
| "Idea Intake" (constant) | Current_Stage |
| primary_keyword_volume | Primary_Keyword_Search_Volume |
| price_range_string | Competitor_Price_Range |
| JSON summary of candidate data | Product_Brief |
| avg_competitor_bsr (if available) | Avg_Competitor_BSR |
| avg_competitor_reviews (if available) | Avg_Competitor_Reviews |

---

## Related Skills

| Skill | Relationship |
|---|---|
| ikraft-keyword-intelligence | Upstream — provides structured keywords for BATCH Phase 1 |
| product-screen | Downstream — receives ProductCandidate[] for SCORE mode |
| product-evaluate | Downstream — receives ResearchRecord (SINGLE) or TrendSignal[] (TRENDS) |
| margin-calculator | Sibling — receives product data for unit economics (not this skill's job) |

---

## Rules

1. Never invent BSR, review counts, or search volume. Cannot verify = null + data_gap.
2. State all sources. Every data point must trace to a URL or user-provided export.
3. Financial quick check is not margin calculation. Do not compute fees or net profit.
4. Hand off to product-evaluate. At output end: "ResearchRecord ready. Run product-evaluate to generate full evaluation score."
5. niche_score is not Opportunity_Score. niche_score is a research-phase indicator. Opportunity_Score written to CRM (syncs to Bigin) Gate 1 is owned by product-evaluate DEEP-EVAL only.
6. All candidate data writes to CRM `Product_Launches` module. No local file saves.
7. Daily summary goes to Slack #product-discovery. No auto-memory storage.

---

## Execution Log

```
[EXEC:product_discover:PD-{MODE}-{YYYYMMDD}-{NNN}]
product-discover v2.1.0 | {YYYY-MM-DD} | Mode: {BATCH|SINGLE|TRENDS}
Zone/Product: {context}
Marketplaces: {list of marketplaces crawled}
{BATCH}: Phase 1: {N} crawled ({N} per marketplace) | Phase 2: {N} candidates | Phase 3: {N} enriched | Phase 4: {N} CRM records created
{SINGLE}: Depth: {quick|standard|deep} | niche_score: {N} | verdict: {verdict} | Marketplaces researched: {list}
{TRENDS}: Zone: {zone} | Signals: {N} | Avg strength: {HIGH|MEDIUM|LOW} | Marketplaces scanned: {list}
Data sources used: {list}
Confidence: {overall}
CRM records: {ids or "N/A"}
Slack: {sent/skipped}
```
