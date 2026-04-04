# Source Protocols

Per-platform crawl rules for BATCH Phase 1. Detect runtime mode first, then apply per-source rules.

## Runtime Mode Detection

Mode A (Browser Control): Claude Desktop, Claude_in_Chrome, or Control_Chrome available. Navigate as user session. Full data extraction.
Mode B (User Paste): No browser control (Claude.ai). User copies data from their browser. Treated as verified input. Record runtime_used = user_paste.

---

## Marketplace Schedule

**Always-on (every run):** Amazon India, Amazon US, Etsy, Pinterest, Google Trends.
**Rotating:** `(day_of_year - 1) mod 2`. Day 0 = Amazon Europe (.co.uk + .de). Day 1 = Amazon Australia (.com.au).

---

## Amazon India (Priority 1a — Always On)

Mode A: Navigate to amazon.in search results page. Extract: title, ASIN (from URL), price (INR), rating, review_count, brand, FBA badge, BSR (if visible on listing). Pages per keyword: 2. Products per keyword: 20. Time budget: 120 sec/keyword. On CAPTCHA: stop this keyword, log captcha_blocked, move to next. Retry: on timeout/ECONNRESET, wait 15 sec, max 1 retry.
Mode B: User paste ONLY — web_fetch is robots_blocked. Data trusted. runtime_used = user_paste.

## Amazon US (Priority 1b — Always On)

Mode A: Navigate to amazon.com search results page. Extract: title, ASIN (from URL), price (USD), rating, review_count, brand, Prime badge, BSR (if visible). Pages per keyword: 2. Products per keyword: 20. Time budget: 120 sec/keyword. On CAPTCHA: stop this keyword, log captcha_blocked, move to next. Retry: on timeout, wait 15 sec, max 1 retry.
Mode B: User paste ONLY. runtime_used = user_paste.
Currency: Convert USD → INR at crawl time. Record exchange rate used.

## Amazon Europe (Priority 1c — Rotating, Day 0)

**Only crawled when `(day_of_year - 1) mod 2 == 0`.**

Mode A: Navigate to amazon.co.uk AND amazon.de search results. Extract: title, ASIN, price (GBP/EUR), rating, review_count, brand, Prime badge, BSR (if visible). Pages per keyword: 1. Products per keyword: 10 per domain. Time budget: 90 sec/keyword/domain. On CAPTCHA: log and skip.
Mode B: User paste ONLY. runtime_used = user_paste.
Currency: Convert GBP/EUR → INR. Record exchange rates.
Language: amazon.de results may be in German — extract numeric fields (price, rating, review_count) regardless. Title recorded as-is.

## Amazon Australia (Priority 1d — Rotating, Day 1)

**Only crawled when `(day_of_year - 1) mod 2 == 1`.**

Mode A: Navigate to amazon.com.au search results. Extract: title, ASIN, price (AUD), rating, review_count, brand, Prime badge, BSR (if visible). Pages per keyword: 1. Products per keyword: 10. Time budget: 90 sec/keyword. On CAPTCHA: log and skip.
Mode B: User paste ONLY. runtime_used = user_paste.
Currency: Convert AUD → INR. Record exchange rate.

## Etsy (Priority 2 — Always On)

Mode A: Navigate or web_search fallback. Extract: title, price (USD), shop_name, sales_count (if visible), favorites_count (if visible), listing_age. Keyword filter: Layer 1 (anchor) keywords only, not Layer 2/3.
Mode B: web_search site:etsy.com "{keyword}" wooden. Extract title, price, shop_name from snippets.
Currency: Convert USD → INR. Etsy prices are typically USD.

## Google Trends (Priority 3 — Always On)

Mode A: Navigate to trends.google.com/trends/explore?q={keyword}&geo=IN. Extract: interest_score (0-100), direction (rising/stable/declining/breakout). Also check &geo=US for US market signal. Batch similar keywords, fetch once per unique root. On fail: score=null, direction=unknown. Max 1 retry.
Mode B: web_fetch embed URL fallback. Lower reliability — chart may not render.
Note: Run for both India (geo=IN) and US (geo=US) geos. Record both as separate signals.

## Pinterest (Priority 4 — Always On)

Mode A (Claude_in_Chrome available): Open Pinterest desktop app. Search "{keyword} wooden". Extract: pin_count, saves (if visible), related searches. This is the preferred method for saves data.
Mode A (browser only): Navigate logged-in for saves data. Search pattern: "{keyword}" wooden.
Mode B: web_search site:pinterest.com "{keyword}" wooden — saves = null (declared). Saves data requires browser session. Null is valid.
Note: Pinterest saves signal feeds Social Validation dimension in scoring.

---

## Crawl Status Values

success, captcha_blocked, robots_blocked, js_failed, user_paste.

## Per-Platform Signal Blocks (ProductCandidate Schema)

Each candidate carries nullable signal blocks per platform:

```
amazon_in: { asin, bsr, price_inr, rating, review_count, fba, brand }
amazon_us: { asin, bsr, price_usd, price_inr, rating, review_count, prime, brand }
amazon_eu: { asin, bsr, price_local, price_inr, rating, review_count, domain }  // .co.uk or .de
amazon_au: { asin, bsr, price_aud, price_inr, rating, review_count }
etsy: { listing_id, price_usd, price_inr, shop_name, sales_count, favorites, listing_age }
pinterest: { pin_count, saves, related_searches }
google_trends: { interest_score_in, direction_in, interest_score_us, direction_us }
```

All blocks nullable. A candidate may have data from 1 platform or all. Null blocks are valid per data integrity rules.

## Total Time Budget

Pass 1 (all sources): 45 minutes maximum.
