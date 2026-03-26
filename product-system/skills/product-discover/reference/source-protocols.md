# Source Protocols

Per-platform crawl rules for BATCH Phase 1. Detect runtime mode first, then apply per-source rules.

## Runtime Mode Detection

Mode A (Browser Control): Claude Desktop or Claude_in_Chrome available. Navigate as user session. Full data extraction.
Mode B (User Paste): No browser control (Claude.ai). User copies data from their browser. Treated as verified input. Record runtime_used = user_paste.

## Amazon India (Priority 1)

Mode A: Navigate to search results page. Extract: title, ASIN (from URL), price, rating, review_count, brand, FBA badge. Pages per keyword: 2. Products per keyword: 20. Time budget: 120 sec/keyword. On CAPTCHA: stop this keyword, log captcha_blocked, move to next. Retry: on timeout/ECONNRESET, wait 15 sec, max 1 retry.
Mode B: User paste ONLY — web_fetch is robots_blocked. Data trusted. runtime_used = user_paste.

## Etsy (Priority 2)

Mode A: Navigate or web_search fallback. Extract: title, price, shop_name. Keyword filter: Layer 1 (anchor) keywords only, not Layer 2/3.
Mode B: web_search site:etsy.com "{keyword}" wooden. Extract title, price, shop_name from snippets.

## Google Trends (Priority 3)

Mode A: Navigate to trends.google.com/trends/explore?q={keyword}&geo=IN. Extract: interest_score (0-100), direction (rising/stable/declining/breakout). Batch similar keywords, fetch once per unique root. On fail: score=null, direction=unknown. Max 1 retry.
Mode B: web_fetch embed URL fallback. Lower reliability — chart may not render.

## Pinterest (Priority 4)

Mode A: Navigate logged-in for saves data. Extract: pin_count, saves (if visible). Search pattern: site:pinterest.com "{keyword}" wooden.
Mode B: web_search — saves = null (declared). Saves data requires browser session. Null is valid.

## Crawl Status Values

success, captcha_blocked, robots_blocked, js_failed, user_paste.

## Total Time Budget

Pass 1 (all sources): 30 minutes maximum.
