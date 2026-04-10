# Content Writer — Schemas and Steps

LISTING mode has two sub-modes — **CREATE** (write a listing from product specs) and **AUDIT** (score, diff, and rewrite an existing draft). Both share the same channel rules and self-verification checklist; they differ in input shape and what the output adds.

## LISTING / CREATE Input Schema

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "category": { "type": "string", "description": "Amazon category" },
    "key_features": { "type": "array", "items": { "type": "string" } },
    "target_keywords": { "type": "array", "items": { "type": "string" } },
    "price_range_inr": { "type": "string" },
    "specs": {
      "type": "object",
      "properties": {
        "material": { "type": "string" },
        "dimensions_cm": { "type": "string" },
        "weight_grams": { "type": "integer" },
        "colour": { "type": "string" },
        "country_of_origin": { "type": "string" },
        "certifications": { "type": "array", "items": { "type": "string" } }
      }
    },
    "research_brief": { "type": "object", "description": "Optional ResearchBrief from RESEARCH mode" },
    "channel": { "type": "string", "enum": ["amazon_india", "shopify"], "default": "amazon_india" }
  },
  "required": ["product_name", "category", "key_features", "target_keywords"]
}
```

## LISTING / CREATE Output Schema

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "channel": { "type": "string" },
    "listing": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "description": "<=200 chars" },
        "bullet_points": { "type": "array", "items": { "type": "string" }, "minItems": 5, "maxItems": 5 },
        "description": { "type": "string", "description": "<=2000 chars, HTML allowed" },
        "backend_keywords": { "type": "string", "description": "<=250 bytes" },
        "search_terms": { "type": "array", "items": { "type": "string" }, "minItems": 5, "maxItems": 5 },
        "a_plus_brief": { "type": "array", "items": { "type": "object" }, "description": "3 modules if Brand Registry active" }
      },
      "required": ["title", "bullet_points", "description", "backend_keywords", "search_terms"]
    },
    "char_counts": { "type": "object" },
    "keywords_placed": { "type": "object" },
    "data_gaps": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["product_name", "listing", "char_counts"]
}
```

## LISTING / CREATE Execution Steps

1. **Validate Inputs** — Confirm specs from vendor-ops, product-spec, or operator. Use research_brief audience intelligence if present.
2. **Build Title** — Apply format: `[Brand] [Primary Keyword] [Material] [Key Feature] [Size] [Use Case]`. Place primary keyword in first 80 chars. Max 200 chars.
3. **Write 5 Bullets** — Feature, Benefit, Proof structure. Primary keyword in bullet 1. Secondary keywords in bullets 2-4. Bullet 5: trust/spec/care.
4. **Write Description** — Expand bullets into 3-4 paragraphs. Include use cases, occasions. Max 2000 chars.
5. **Backend Keywords** — Terms NOT in title/bullets. Include Hindi transliterations. Count bytes (UTF-8 multi-byte = 2-3 bytes). Max 250 bytes.
6. **Search Terms & A+ Brief** — 5 search term fields (<=50 chars each). A+ brief: 3 module suggestions if Brand Registry active.
7. **Output** — Return full ListingOutput JSON with char_counts and keywords_placed table.

## LISTING / AUDIT Input Schema

Same as CREATE inputs, plus an `existing_listing` block. The operator hands you a draft (or a live listing pulled from CRM) and asks you to improve it.

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "category": { "type": "string" },
    "channel": { "type": "string", "enum": ["amazon_india", "shopify"] },
    "specs": { "type": "object", "description": "Same shape as CREATE specs" },
    "target_keywords": { "type": "array", "items": { "type": "string" } },
    "existing_listing": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "bullet_points": { "type": "array", "items": { "type": "string" } },
        "description": { "type": "string" },
        "backend_keywords": { "type": "string", "description": "Amazon only" },
        "search_terms": { "type": "array", "items": { "type": "string" }, "description": "Amazon only" },
        "meta_description": { "type": "string", "description": "Shopify only" },
        "variants": { "type": "array", "items": { "type": "object" } },
        "faq": { "type": "array", "items": { "type": "object" }, "description": "Shopify only" }
      },
      "required": ["title"]
    }
  },
  "required": ["product_name", "channel", "existing_listing"]
}
```

## LISTING / AUDIT Output Schema

Returns the same `listing` object as CREATE (the rewritten version), plus two extra top-level fields:

```json
{
  "audit_summary": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "element": { "type": "string", "enum": ["title", "bullets", "description", "keywords", "variants", "faq", "image_copy"] },
        "score": { "type": "string", "enum": ["good", "fix", "rewrite"] },
        "issues": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["element", "score"]
    }
  },
  "change_list": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "element": { "type": "string" },
        "before": { "type": "string" },
        "after": { "type": "string" },
        "rationale": { "type": "string" }
      },
      "required": ["element", "before", "after", "rationale"]
    }
  }
}
```

## LISTING / AUDIT Execution Steps

1. **Read existing_listing** — parse current title, bullets, description, keywords, variants, FAQ. Note what's present and what's missing.
2. **Score per element** — apply the channel's rules (Amazon India or Shopify section below). Rate each element `good` / `fix` / `rewrite`.
3. **Flag issues** — char overruns, banned terms (Amazon), feature-led bullets that should be benefit-led, keyword stuffing, broken variant consistency, unverified or invented claims, missing primary keyword in title front.
4. **Rewrite flagged elements** — preserve factual accuracy. Mark unknown specs `[VERIFY]` rather than inventing. If `score: good`, leave the element as-is in the output.
5. **Build change_list** — one row per material edit with before / after / rationale. Skip cosmetic edits; this table justifies real changes.
6. **Run self-verification checklist** before delivering.

## Amazon India Listing Rules

- Title: no ALL CAPS, no special characters (|, /, - allowed), no promotional phrases
- Include primary keyword in first 80 chars of title
- Bullet points: 100-150 chars each, Feature, Benefit, Proof
- Description: 2000 chars max, HTML sparingly
- Backend keywords: 250 bytes max, comma-separated, no title/bullet repetition

## Amazon India Banned Terms

Do not use these in title, bullets, or description. Amazon flags them as promotional, non-compliant, or requiring substantiation:

- **Promotional**: `best`, `#1`, `top-rated`, `bestseller`, `sale`, `discount`, `cheap`, `free shipping`, `guarantee`, `100% guarantee`, `lifetime warranty` (unless certified)
- **Medical/health claims**: `cure`, `treat`, `prevent`, `heal`, `FDA approved` (unless certified for the specific claim)
- **Sustainability claims**: `eco-friendly`, `biodegradable`, `compostable` (only with certification)
- **Formatting bans**: ALL CAPS phrases, excessive punctuation (`!!!`, `???`), special characters (`! ? $ ~ @ # *`), emojis

When AUDIT mode encounters any of these in `existing_listing`, flag with `score: fix` or `rewrite` and remove or replace them in the rewritten copy.

## Shopify Listing Rules

Use when `channel: "shopify"`. Shopify is a DTC storefront — Google SEO and brand voice matter more than marketplace ranking signals.

- **Title**: 50–70 chars for SERP. Brand voice forward, evocative is OK. Include primary keyword but don't stuff.
- **Highlights** (optional): 3–6 scannable benefit bullets above the fold. Skip if PDP body covers benefits well.
- **PDP body (description)**: story-driven, longer form acceptable. Use H2/H3, short paragraphs, bold key phrases. Include social proof hooks (review snippets, UGC mentions). No char hard limit but aim 300–800 words.
- **Meta description**: 150–160 chars. Primary keyword + clear CTA.
- **Variants**: clean Size / Color / Material option names. Consistent SKUs. Variant images mapped correctly.
- **FAQ block**: schema-friendly Q&A (FAQPage structured data eligible). Cover shipping, returns, sizing/fit, materials, care, common use cases. 4–8 questions typical.
- **Image-copy callouts**: hero banner text, lifestyle captions, UGC quote callouts, infographic text. Include even if operator didn't ask — they materially affect conversion.
- **SEO lens**: target Google search intent (informational vs transactional). Suggest alt text per image and 2–3 internal link opportunities to related products or collections.
- **No banned-term list**: Shopify doesn't enforce promotional language bans the way Amazon does. Brand voice can use superlatives if substantiated.

## Self-Verification Checklist

Run before delivering CREATE or AUDIT output. The skill must not return a listing until every applicable item is checked.

- [ ] Channel explicitly declared (`amazon_india` or `shopify`)
- [ ] Title within channel char limit (Amazon: ≤200, primary keyword in first 80; Shopify: 50–70)
- [ ] Bullets respect channel rules (Amazon: 5 bullets, 100–150 chars each, benefit-led; Shopify: 3–6 highlights optional)
- [ ] No Amazon banned terms (when channel = amazon_india)
- [ ] No ALL CAPS, no excessive punctuation, no banned special characters (Amazon)
- [ ] Backend keywords ≤250 bytes, no title/bullet repetition (Amazon)
- [ ] Meta description 150–160 chars with primary keyword + CTA (Shopify)
- [ ] FAQ block present and schema-friendly (Shopify, when applicable)
- [ ] Image-copy suggestions included (Shopify)
- [ ] Variants internally consistent — titles differ only on the variant attribute
- [ ] Country of origin specified or flagged in `data_gaps` (Amazon India mandatory)
- [ ] No invented specs — `[VERIFY]` tags used for unknowns
- [ ] AUDIT only: `change_list` justifies every material edit; cosmetic-only edits omitted
- [ ] AUDIT only: elements scored `good` are preserved unchanged in the rewritten output

## MCP Integration

When operator says "push listing to CRM":
- Use Zoho CRM MCP to update Products module with listing content
- Alert `#ism-launch-alerts` — format via `slack-messaging` skill before posting
