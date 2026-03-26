---
name: product-discover
description: >
  Discovers and researches wooden premium product opportunities via three modes. BATCH: crawls
  Amazon India/US, Etsy, Pinterest, Google Trends → enriched ProductCandidate[]. SINGLE: deep
  Amazon India research on one product → ResearchRecord (BSR, keywords, competition, price
  clusters). TRENDS: scans signals by zone from the wood opportunity map → TrendSignal[]. ALWAYS
  trigger for: "start discovery", "crawl products", "discover products", "research this product",
  "is there demand", "keyword research", "BSR analysis", "find opportunities", "what's trending",
  "which zone to explore", "run seed keywords", "find wooden products", "market validation", "niche
  research", "page 1 analysis", "batch mode", "single mode", "trends mode", "crawl mode", "PD-".
  Also trigger when market data is needed before product-evaluate runs or a zone needs trend scanning.
  If unsure — trigger.
metadata:
  domain: product
  prefix: PD-
  version: 2.0.0
---

# Product Discover

Single skill for all product discovery and research needs.

Three modes — invoke independently or chain:

| Mode | Input | Output | Feeds |
|---|---|---|---|
| **BATCH** | seed_keywords (+ optional zone) | enriched `ProductCandidate[]` | product-screen SCORE |
| **SINGLE** | product_name + category | `ResearchRecord` | product-evaluate DEEP-EVAL |
| **TRENDS** | zone_name | `TrendSignal[]` | BATCH mode or product-evaluate IDEATE |

**Capability boundary:** This skill discovers and researches. It does not score, evaluate
gates, or generate concepts — those are product-evaluate. It does not calculate margins — that is margin-calculator.

## Shared Knowledge (always in context)

The opportunity map, financial formulas, gate definitions, and data integrity rules are available in project knowledge. Do not read separate files for these — they are already in context.

## Skill-Specific Reference Files

For detailed rules loaded only when needed:

- **Source protocols**: See [reference/source-protocols.md](reference/source-protocols.md) — per-platform crawl rules for BATCH Phase 1
- **Scoring bands**: See [reference/scoring-bands.md](reference/scoring-bands.md) — 4-band niche_score model for SINGLE mode
- **Research framework**: See [reference/research-framework.md](reference/research-framework.md) — step-by-step SINGLE mode methodology

---

## DATA INTEGRITY CONTRACT

The 7 data integrity rules (NEVER INVENT DATA, NULL IS CORRECT, SOURCE AND CONFIDENCE, etc.) are defined in project knowledge under data-integrity-rules.md. They apply to every mode, every source, every run. Non-negotiable.

---

## Runtime Mode Detection

```
IF browser_control available (Claude Desktop):
  → Use Mode A for all sources
  → Amazon: navigate as user session, stop at CAPTCHA, escalate to Mode B

ELSE (Claude.ai / no browser_control):
  → Amazon: Mode B (user paste) ONLY — web_fetch is robots_blocked
  → Etsy: web_search fallback acceptable
  → Pinterest: web_search — saves = null (declare)
  → Google Trends: web_fetch embed URL fallback
```

---

## MODE: BATCH

**Purpose:** Discover raw product candidates from marketplaces, then transform and enrich into scored-ready `ProductCandidate[]`.

**When to invoke:** "start discovery", "run seed keywords", "crawl for wooden products", "find products in [zone]".

### Phase 1 — Crawl

Read [reference/source-protocols.md](reference/source-protocols.md) for per-source rules.

**Keyword sourcing options (choose one):**
- **Option A (recommended):** Invoke `ikraft-keyword-intelligence` first to get structured keywords with layer metadata, then use those keywords for crawling.
- **Option B (standalone):** Load seed keywords from input or zone defaults from the opportunity map (in project knowledge), expand each seed (max 5 per seed, from observed autocomplete only).

1. Load keywords — from keyword skill output (Option A) or seed expansion (Option B)
2. For each keyword and each enabled source: apply source protocol, fetch or accept user paste
3. Produce `CrawlRecord` — all raw_fields as-is, never interpreted
4. Set crawl_status: success | captcha_blocked | robots_blocked | js_failed | user_paste
5. Produce `CrawlBatch` with batch_id = `PI-BATCH-{YYYYMMDD}-{NNN}`

**Halt:** Zero success records → halt, report blocks, request Mode B paste.

### Phase 2 — Extract + Normalise

1. Parse raw_fields per platform rules → typed `ExtractedProduct` per record
2. Convert currencies (INR canonical)
3. Apply category filter (excluded categories from opportunity map in project knowledge)
4. Deduplicate (exact ID match, then fuzzy title >= 80%)
5. Assign candidate_id: `PI-{YYYYMMDD}-{0001..NNNN}`
6. Compute data_completeness_pct from 12 core fields
7. Map to ProductCandidate schema

**Halt:** Zero candidates survive filter → halt, return rejection_log.

### Phase 3 — Enrich

1. For each candidate: query Pinterest saves, Google Trends score/direction, social traction
2. Populate social_signals block — null if source unreachable (valid, not an error)
3. Record enrichment_gaps[] for candidates where all signals = null
4. Return complete ProductCandidate[]

**Output:** `ProductCandidate[]` + `BatchRunSummary`

---

## MODE: SINGLE

**Purpose:** Deep Amazon India market research on a single known product. Returns `ResearchRecord` ready for product-evaluate DEEP-EVAL.

**When to invoke:** "research this product", "is there demand for X", "BSR analysis", "page 1 analysis".

Read [reference/research-framework.md](reference/research-framework.md) for step-by-step methodology.
Read [reference/scoring-bands.md](reference/scoring-bands.md) for niche_score band tables.

**Depth options:** quick (5–10 min, steps 1–2), standard (15–20 min, steps 1–5), deep (30–45 min, steps 1–5 + ASIN deep-dive).

**Research steps:**
1. Keyword Discovery — search queries, record primary/secondary keywords
2. Demand Analysis — BSR-based estimation, assign demand_band
3. Competitor Analysis — page 1 scan, assign competition_band
4. Differentiation Scan — 1-star/2-star reviews, Q&A gaps
5. Financial Quick Check — price viability flag only (not a calculation)

**Niche Score:** Sum all 4 bands per scoring-bands.md. Apply confidence penalties. Assign verdict (STRONG/PROMISING/CONDITIONAL/NEEDS_DATA/WEAK/REJECT).

**Handoff:** ResearchRecord complete → hand off to product-evaluate DEEP-EVAL for full evaluation.

```
niche_score is a research-phase indicator only.
It does NOT write to Bigin. Opportunity_Score written to Bigin is owned by
product-evaluate DEEP-EVAL — that is the authoritative Gate 1 value.
```

---

## MODE: TRENDS

**Purpose:** Scan for trending product signals within a specific zone from the opportunity map (in project knowledge).

**When to invoke:** "what's trending in [zone]", "which zone should we explore", "trend scan".

**Steps:**
1. Load zone from opportunity map (project knowledge) — get zone default keywords
2. For each zone keyword (max 3): Google Trends score + direction for India geo, web_search for trending signals, Amazon India best seller signals
3. Pinterest scan: pin volume signal
4. Produce TrendSignal per keyword: signal_strength (HIGH/MEDIUM/LOW/UNKNOWN), trend_direction (rising/stable/declining/breakout/unknown), confidence, evidence (list every source citation)
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
| Zero crawl success records | BATCH Phase 1 | Halt. Report block type. Request Mode B paste. |
| Zero candidates after filter | BATCH Phase 2 | Halt. Return rejection_log. Suggest keyword review. |
| Product name not specific enough | SINGLE | Ask for full product name + category. |
| Zone not in opportunity map | TRENDS | List valid zones. Ask user to select. |
| All trend signals = UNKNOWN | TRENDS | Return result with UNKNOWN confidence. Do not invent signals. |

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
5. niche_score is not Opportunity_Score. niche_score is a research-phase indicator. Opportunity_Score written to Bigin Gate 1 is owned by product-evaluate DEEP-EVAL only.

---

## Execution Log

```
[EXEC:product_discover:PD-{MODE}-{YYYYMMDD}-{NNN}]
product-discover v2.0.0 | {YYYY-MM-DD} | Mode: {BATCH|SINGLE|TRENDS}
Zone/Product: {context}
{BATCH}: Phase 1: {N} crawled | Phase 2: {N} candidates | Phase 3: {N} enriched
{SINGLE}: Depth: {quick|standard|deep} | niche_score: {N} | verdict: {verdict}
{TRENDS}: Zone: {zone} | Signals: {N} | Avg strength: {HIGH|MEDIUM|LOW}
Data sources used: {list}
Confidence: {overall}
```
