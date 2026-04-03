# Content Writer — Schemas and Steps

## LISTING Mode Input Schema

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

## LISTING Mode Output Schema

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

## LISTING Execution Steps

1. **Validate Inputs** — Confirm specs from vendor-ops, product-spec, or operator. Use research_brief audience intelligence if present.
2. **Build Title** — Apply format: `[Brand] [Primary Keyword] [Material] [Key Feature] [Size] [Use Case]`. Place primary keyword in first 80 chars. Max 200 chars.
3. **Write 5 Bullets** — Feature, Benefit, Proof structure. Primary keyword in bullet 1. Secondary keywords in bullets 2-4. Bullet 5: trust/spec/care.
4. **Write Description** — Expand bullets into 3-4 paragraphs. Include use cases, occasions. Max 2000 chars.
5. **Backend Keywords** — Terms NOT in title/bullets. Include Hindi transliterations. Count bytes (UTF-8 multi-byte = 2-3 bytes). Max 250 bytes.
6. **Search Terms & A+ Brief** — 5 search term fields (<=50 chars each). A+ brief: 3 module suggestions if Brand Registry active.
7. **Output** — Return full ListingOutput JSON with char_counts and keywords_placed table.

## Amazon India Listing Rules

- Title: no ALL CAPS, no special characters (|, /, - allowed), no promotional phrases
- Include primary keyword in first 80 chars of title
- Bullet points: 100-150 chars each, Feature, Benefit, Proof
- Description: 2000 chars max, HTML sparingly
- Backend keywords: 250 bytes max, comma-separated, no title/bullet repetition

## MCP Integration

When operator says "push listing to CRM":
- Use Zoho CRM MCP to update Products module with listing content
- Alert `#ism-launch-alerts` via Slack MCP
