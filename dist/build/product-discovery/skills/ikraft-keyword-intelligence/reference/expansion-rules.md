# Expansion Rules — ikraft-keyword-intelligence
# Rules for expanding seed keywords via autocomplete and applying category filters.
# Absorbed from product-intelligence/references/keyword-expansion.md + enhanced with Layer 3 and learning integration.

---

## Purpose

Seed keywords (Layer 1) are starting points. Expansion multiplies the discovery surface
without manual input. This file governs how Layer 2 (autocomplete) and Layer 3 (intent) keywords are generated.

**Core rule:** Expanded keywords must come from observed search suggestions or defined intent patterns — not invented by Claude.

---

## Layer 2 — Autocomplete Expansion

### Mode A (Claude_in_Chrome available)

For each Layer 1 seed keyword:

1. **Amazon India autocomplete:**
    - Navigate to amazon.in
    - Type the seed keyword into the search bar
    - Wait for autocomplete dropdown to appear (1-2 seconds)
    - Read the top 5 suggestions
    - Record each as a Layer 2 keyword with `source: amazon_autocomplete`

2. **Google autocomplete:**
    - Navigate to google.com or use Google search bar
    - Type `{seed_keyword} wooden` into the search bar
    - Read the top 3 NEW suggestions (skip duplicates of Amazon results)
    - Record each as a Layer 2 keyword with `source: google_autocomplete`

3. **Maximum per seed:** 5 total expanded keywords (Amazon + Google combined)
4. **Maximum total Layer 2:** 25 keywords (5 seeds × 5 expansions)

### Mode B (no browser / Claude.ai fallback)

Layer 2 is SKIPPED entirely in Mode B. Do not attempt to simulate autocomplete via web search.
Set `layer2_skipped: true` in output metadata.

The run will proceed with Layer 1 (5 keywords) + Layer 3 (5-8 keywords) only.
This is acceptable. A smaller but honest keyword set is better than fabricated expansions.

---

## Layer 3 — Intent & Premium Generation

Layer 3 keywords are built by combining a zone's product types with intent modifiers.
These are NOT from autocomplete — they are pattern-derived and labeled as such.

### Intent modifier categories:

| Category | Modifiers |
|---|---|
| Occasion | for birthday, for anniversary, for diwali, for wedding, for housewarming, for raksha bandhan, for corporate gift, for farewell, for new year |
| Aspiration | premium, luxury, handcrafted, artisan, designer, handmade, eco-friendly |
| Buyer persona | for men, for women, for couple, for office, for home, for him, for her |
| Purchase intent | buy online india, best [product] india, handmade [product] online, [product] price in india |
| Feature | with engraving, with name, personalised, customised, with drawer, with lid |

### Generation rules:

1. Select 2-3 modifier categories relevant to today's zone
2. For each Layer 1 seed keyword, combine with 1-2 modifiers
3. Generate 5-8 total Layer 3 keywords
4. Prioritize modifiers that appear in learning signals as top performers
5. Suppress modifiers that have been zero-yield for 3+ runs

### Examples (illustrative — actual generation uses live zone data):

| Zone | Seed | Layer 3 Keyword |
|---|---|---|
| 2 (Gifts) | personalized wooden gift box | personalized wooden gift box for anniversary |
| 1 (Workspace) | wooden desk organizer | premium wooden desk organizer for office |
| 4 (Cultural) | wooden corner puja mandir | handcrafted wooden puja mandir for home |

---

## Category Filters

Before adding ANY keyword (Layer 2 or Layer 3) to the output, check these filters.
If a keyword matches any exclusion, skip it silently and log the skip.

### Excluded category terms:
- `toys`, `toy`, `play`, `game` (except chess — chess is Zone 7)
- `medical`, `health`, `therapy`
- `electronics`, `electric`, `electronic`, `USB`, `bluetooth`
- `apparel`, `clothing`, `shirt`, `dress`
- `baby`, `infant`, `toddler` (age-restricted certification requirements)
- `kids` (when used as primary audience — "for kids" is excluded, "kids room decor" is borderline, err on side of exclusion)

### Excluded IP terms:
- Any brand name (Nike, Samsung, Disney, Marvel, etc.)
- Character names from franchised properties
- Trademarked product names

### Required signal:
Every keyword must contain at least one material or product type signal:
- Material: `wood`, `wooden`, `bamboo`, `timber`, `teak`, `sheesham`, `mango wood`, `rosewood`
- OR: be a recognized product category from the opportunity map (e.g., "desk organizer", "puja mandir", "jewelry box")

Keywords that pass no material/product signal and are not recognizable product categories → skip.

---

## Duplicate Handling

Before finalizing the keyword list:
1. Exact match dedup: remove identical strings (case-insensitive)
2. Near-match dedup: if two keywords differ only by word order (e.g., "wooden pen holder" vs "pen holder wooden"), keep the one from the higher layer (Layer 1 > Layer 2 > Layer 3)
3. Substring containment: if keyword A is a substring of keyword B (e.g., "wooden box" and "wooden box for men"), keep BOTH — they target different search intents

---

## CAPTCHA / Failure Handling (Layer 2 only)

During Mode A autocomplete expansion:

1. **Amazon CAPTCHA**: If CAPTCHA appears while typing a seed keyword:
    - Wait 15 seconds, retry once
    - If CAPTCHA appears again → skip Amazon autocomplete for this seed
    - Record in `expansion_failures`: `{ "seed": "...", "source": "amazon_autocomplete", "error": "captcha_blocked" }`
    - Try Google autocomplete for this seed instead

2. **Timeout**: If autocomplete dropdown doesn't appear within 10 seconds:
    - Skip this seed's Amazon expansion
    - Record in `expansion_failures`
    - Try Google autocomplete

3. **Consecutive failures**: If 3 consecutive seeds fail Amazon autocomplete:
    - Stop Amazon autocomplete entirely for this run
    - Continue with Google autocomplete only for remaining seeds
    - Log `amazon_autocomplete_suspended` in metadata

4. **Google fallback also fails**: If Google autocomplete also fails:
    - Skip Layer 2 for this seed
    - The seed still contributes as a Layer 1 keyword
    - A run with fewer but honest keywords is the correct behavior

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-03-26 | Initial — absorbed from product-intelligence keyword-expansion.md, enhanced with Layer 3 and learning integration |