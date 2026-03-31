---
name: content-writer
description: >
  Full-cycle content production in three modes. RESEARCH: researches topics via live web, returns ResearchBrief JSON. WRITE: produces articles, blog posts, LinkedIn posts, social posts, landing page copy, newsletters. LISTING: generates Amazon India product listing copy (title, 5 bullets, description, A+ brief, backend keywords) and Shopify descriptions. Absorbs: content-research-writer, listing-writer. ALWAYS trigger for: "research this topic", "content brief", "write an article", "blog post", "LinkedIn post", "newsletter", "landing page copy", "SEO content", "content research", "research before writing", "create copy", "research and write", "write a listing", "listing copy", "product title", "bullet points", "product description", "A+ content", "backend keywords", "Amazon listing", "optimize listing", "Shopify product description", "CW-", "CRW-". If the task involves content research or writing — trigger. If unsure — trigger.

metadata:
  version: 1.1.1
  domain: marketing
  prefix: CW-
  absorbs:
    - content-research-writer (v2.0.0) → modes RESEARCH, WRITE
    - listing-writer → mode LISTING
  write_permissions:
    - NONE. Content generation only. No CRM or system writes.
    - Optional: LISTING output can be pushed to CRM Products via zoho-data-ops WRITE mode if requested
  dependencies:
    upstream:
      - product-spec (ProductSpec feeds LISTING mode — dimensions, materials, features)
      - product-screen (LaunchBrief triggers LISTING mode)
    downstream:
      - zoho-data-ops WRITE mode: optional LISTING push to CRM Products listing_copy field
---
# Content Writer

Three-mode content production: research → write → listing. Modes can run standalone or in sequence.

**No auto-publish. All output is draft. the operator reviews and publishes.**  
**Writes to CRM Products listing_copy only if explicitly requested, via zoho-data-ops WRITE mode.**

---

## Exception Capture

If an exception, edge case, or unexpected pattern occurs during execution:
1. Pause the current workflow
2. Invoke `ism-learning-engine` with exception details
3. Await user confirmation or rejection
4. Resume task after response

---

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `ikraft-skill-governance/references/resolutions.md` — filter by domain `content-writer`, `content-writer` (was `content-research-writer`, absorbed 2026-03-15), `listing-writer`, `cross-skill` — apply active records silently
3. Check memory for `CW-*`, `CRW-*` entries — apply active entries
4. Read `listing-rules.md` from project — Amazon India listing compliance rules

---
## Mode Selection

| User wants... | Run mode |
|---------------|----------|
| Understand a topic before writing | RESEARCH |
| Write an article, post, or general content | WRITE |
| Write an Amazon/Shopify product listing | LISTING |

Modes RESEARCH → WRITE and RESEARCH → LISTING can be chained in a single session.

---

## Mode: RESEARCH

**Trigger:** "research this topic", "content brief", "what angle to take"  
**Prefix:** CW-R-

Use web_search to gather current information on the requested topic. Produce:

### Output: ResearchBrief
```json
{
  "brief_id": "CW-R-20260314-001",
  "topic": "Corner puja mandir market India 2026",
  "key_findings": [
    "Market growing at ~18% YoY driven by apartment-dweller demand for compact solutions",
    "LED integration trending — 3 of top 10 Amazon listings now include LED",
    "Price cluster: 70% of sales between ₹800–₹1,500"
  ],
  "keyword_opportunities": ["corner mandir for small flats", "wooden puja stand led", "compact pooja mandir"],
  "competitor_content_gaps": ["No competitor addressing apartment size constraints in listing title"],  "recommended_angle": "Space-efficient + modern LED aesthetics for apartment buyers",
  "sources": ["amazon.in search results", "web search results"],
  "confidence": "Medium — Amazon data is live, growth rate is estimated from market reports"
}
```

---

## Mode: WRITE

**Trigger:** "write an article", "blog post", "LinkedIn post", "social post", "landing page"  
**Prefix:** CW-W-

Accept: ResearchBrief (from RESEARCH mode) or direct brief from user.

### Output formats by content type

**LinkedIn post:** 150–250 words. Hook in line 1. No hashtag stuffing (max 3). Professional but direct.

**Blog article:** 600–1,200 words. H1 + H2 structure. Target keyword in H1 and first paragraph. Internal CTA at end.

**Social post (Instagram/Facebook):** 80–120 words. Visual description prompt included. CTA.

**Newsletter:** Header + 3 sections + CTA. 400–600 words total.

**Landing page copy:** Hero headline + subhead + 3 benefits + CTA. No fluffy adjectives.

All content: no invented statistics. Flag any stat that needs verification. No claims not supported by research.

---

## Mode: LISTING
**Trigger:** "write a listing", "listing copy", "Amazon listing", "product title", "bullet points"  
**Prefix:** CW-L-

Read `listing-rules.md` before generating any listing copy.

### Listing Components

**Title (200 chars max, Amazon India)**
Formula: `[Brand] [Primary Keyword] [Material] [Key Feature] [Size/Variant] [Use Case]`
Example: `Ismokraft Corner Wooden Puja Mandir Stand with LED Light for Home | Sheesham Wood | 17×15×10 inch`

Rules from `listing-rules.md`:
- No ALL CAPS words
- No special characters (|, /, – allowed, & allowed)
- Include primary keyword in first 80 chars
- Do not include promotional phrases (Best, No. 1, etc.)

**5 Bullet Points (each 100–150 chars)**
Structure: Benefit → Feature → Proof
- Bullet 1: Primary use case + key differentiator
- Bullet 2: Material quality + specification
- Bullet 3: Dimension/fit + installation
- Bullet 4: LED feature + power spec (if applicable)
- Bullet 5: Gift/occasion angle + packaging

**Product Description (2,000 chars max)**
3–4 paragraphs. Expand on each bullet. Include secondary keywords naturally.

**A+ Content Brief** (for Seller Central A+ module)
Module recommendations + headline + body for each module. Not the final HTML — a brief for the operator to fill.
**Backend Keywords (250 bytes max, Amazon India)**
Comma-separated. Exclude words already in title/bullets. Include: alternate spellings, Hindi transliterations, synonyms.

Example: `puja stand, pooja stand, mandir for home, temple corner, wooden temple, led puja, sheesham mandir`

### Output: ListingRecord
```json
{
  "listing_id": "CW-L-20260314-001",
  "product": "Corner Puja Mandir — Sheesham Premium LED",
  "title": "Ismokraft Corner Wooden Puja Mandir Stand with LED Light for Home | Sheesham Wood | 17×15×10 inch",
  "bullets": ["...", "...", "...", "...", "..."],
  "description": "...",
  "aplus_brief": "...",
  "backend_keywords": "puja stand, pooja stand, mandir for home, ...",
  "compliance_flags": [],
  "crm_push_ready": true
}
```

---

## Exception Handling

- If listing title exceeds 200 chars → trim, flag trimmed words
- If product has no differentiator → flag, ask for one concrete difference from competitors before proceeding
- If research returns conflicting data (e.g., two sources disagree on market size) → present both, do not pick one
- If keyword data not available (no Helium10) → use Amazon search suggest + manual observation, flag as "estimated without Helium10"

---
## Execution Log Template

```
CW-EXEC-{id}
Mode: {RESEARCH | WRITE | LISTING}
Topic/Product: {name}
Input: {ResearchBrief_id | direct_brief | product_spec}
Started: {timestamp}
Output: {ResearchBrief | ContentPiece | ListingRecord}
CRM Push: {none | pending_confirmation}
Errors: {none | description}
```

---

## Reference Files

No inherited references from absorbed skills.
Runtime context files: read from project files `listing-rules.md` and `campaign-logic.md`.

---

## Input Schema (LISTING mode)

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "category": { "type": "string", "description": "Amazon category" },
    "key_features": {
      "type": "array",      "items": { "type": "string" },
      "description": "Confirmed product features — do not invent"
    },
    "target_keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Primary + secondary keywords"
    },
    "price_range_inr": { "type": "string", "description": "e.g. ₹800-1,200" },
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
    "research_brief": {
      "type": "object",
      "description": "Optional — ResearchBrief JSON from content-writer (audience pain points, language patterns, competitor gaps)"
    },
    "channel": {
      "type": "string",
      "enum": ["amazon_india", "shopify"],
      "default": "amazon_india"
    },
    "brand_name": { "type": "string", "description": "Optional — Ismokraft brand or sub-brand" }  },
  "required": ["product_name", "category", "key_features", "target_keywords"]
}
```

**Never invent dimensions, materials, certifications, or features.** If specs are not provided, ask.

---

---

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "channel": { "type": "string" },
    "listing": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "≤200 chars — Brand + Product + Feature + Material + Size + Colour"
        },
        "bullet_points": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 5,
          "maxItems": 5,
          "description": "Each ≤500 chars — Feature → Benefit → Proof structure"
        },
        "description": {          "type": "string",
          "description": "≤2000 chars — HTML allowed (br, b, ul, li)"
        },
        "backend_keywords": {
          "type": "string",
          "description": "≤250 bytes — comma-separated, no repetition of title/bullet terms"
        },
        "search_terms": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 5,
          "maxItems": 5,
          "description": "5 fields — ≤50 chars each"
        },
        "a_plus_brief": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "module": { "type": "integer" },
              "type": { "type": "string" },
              "content_suggestion": { "type": "string" }
            }
          },
          "description": "3 modules — only if Brand Registry is active"
        }
      },
      "required": ["title", "bullet_points", "description", "backend_keywords", "search_terms"]
    },
    "char_counts": {      "type": "object",
      "properties": {
        "title_chars": { "type": "integer" },
        "backend_bytes": { "type": "integer" },
        "description_chars": { "type": "integer" }
      }
    },
    "keywords_placed": {
      "type": "object",
      "description": "Where each target keyword appears — title / bullet_N / description / backend"
    },
    "data_gaps": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["product_name", "listing", "char_counts"]
}
```

---

---

## Execution Steps (LISTING mode)

### Step 1 — Validate Inputs
Confirm all specs are from vendor-ops, product-spec, or the operator's actuals.
If `research_brief` is present, use `audience_intelligence.language_patterns` and
`content_angles` to inform bullet framing and headline choices.

### Step 2 — Build Title
Apply title format. Place primary keyword naturally. Count characters.

### Step 3 — Write 5 Bullets
Feature → Benefit → Proof. Primary keyword in bullet 1.Secondary keywords spread across bullets 2–4. Bullet 5: trust/spec/care.

### Step 4 — Write Description
Expand bullets into paragraph form. Use HTML sparingly.
Include use cases, occasions, compatibility.

### Step 5 — Backend Keywords
List terms NOT in title/bullets. Include Hindi transliterations if relevant.
Count bytes (not characters) — UTF-8 multi-byte characters count as 2-3 bytes.

### Step 6 — Search Terms & A+ Brief
5 search term fields, ≤50 chars each.
A+ brief: 3 module suggestions (image+text, comparison chart, brand story) if Brand Registry active.

### Step 7 — Output
Return full ListingOutput JSON.
Show char_counts and keywords_placed table.

---

---

## MCP Integration

When the user says "push listing to CRM":
- Use Zoho CRM MCP to update Products module with listing content
- Alert `#ism-launch-alerts` (C0AKNEW3V6H) via Slack MCP

---

---

## Rules (LISTING mode)
1. **Never invent specs.** Dimensions, materials, certifications — ask if not provided. Mark as `[REQUIRED]` in output if missing.
2. **Country of origin is mandatory.** If not provided, flag in data_gaps and mark `[REQUIRED]`.
3. **No filler copy.** Every sentence must carry information. No "This amazing product will transform your life."
4. **Keyword density.** Primary keyword in title + bullet 1 + description opening. Secondary keywords distributed. Backend for long-tail only.
5. **Check backend byte count.** UTF-8 characters beyond ASCII count as multiple bytes. State byte count in output.

---

---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-spec` | Upstream — ProductSpec feeds LISTING mode (dimensions, materials, features) |
| `product-screen` | Upstream — LaunchBrief triggers LISTING mode |
| `zoho-data-ops` | Optional listing push to CRM Products via WRITE mode |
| `ism-learning-engine` | Exception capture [future] |
| `ism-scrum-master` | Downstream — content tasks become sprint tickets |

---

## Dependency Metadata

```
skill_name: content-writer

upstream_skills:
  - skill_name: product-spec
    data_consumed: ProductSpec for LISTING mode (dimensions, materials, features)
    required: false
  - skill_name: product-screen    data_consumed: LaunchBrief triggers LISTING mode
    required: false

downstream_skills:
  - skill_name: ism-learning-engine
    data_produced: LISTING output pushed to CRM Products listing_copy (optional)
    trigger_condition: On the operator requests

fallback_skill: null
orphan_declared: false
```

---

## Governance Contract

```yaml
skill_name: content-writer
version: 1.1.1
owner: Ismokraft
domain: marketing
maturity_level: L2_operational
systems_accessed:
  - None (generation only)
write_permissions:
  - NONE — content generation only. Optional LISTING push to CRM Products via zoho-data-ops WRITE mode.
validation_rules: >
  Required fields per mode must be present. See Pre-Execution Validation.
  No external writes from this skill directly — all CRM writes via zoho-data-ops WRITE mode.
logging_level: summary
```

---

## S22 — Data Integrity (NO-FAKE-DATA)
- Do not invent product specifications, dimensions, materials, or features not provided as input.
- Do not fabricate reviews, ratings, competitor claims, or market statistics.
- If required data (product specs, target keywords, USPs) is missing, block and state the exact gap.
- Listing copy must only claim features explicitly confirmed by the operator.