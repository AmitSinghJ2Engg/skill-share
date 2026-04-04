---
name: content-writer
description: >
  Full-cycle content production in three modes. RESEARCH: researches topics
  via live web, returns ResearchBrief JSON. WRITE: produces articles, blog posts,
  LinkedIn posts, social posts, landing page copy, newsletters. LISTING: generates
  Amazon India product listing copy (title, bullets, description, A+ brief,
  backend keywords) and Shopify descriptions.
  ALWAYS trigger for: "research this topic", "content brief", "write an article",
  "blog post", "LinkedIn post", "newsletter", "landing page copy", "SEO content",
  "write a listing", "listing copy", "product title", "bullet points",
  "Amazon listing", "optimize listing", "Shopify product description", "CW-".
  If the task involves content research or writing — trigger.
metadata:
  version: "1.1.1"
  domain: marketing
  prefix: CW-
  absorbs: [content-research-writer, listing-writer]
---

# Content Writer

Three-mode content production: research, write, listing. Modes can chain in a single session.

| Mode | Purpose | Trigger |
|---|---|---|
| **RESEARCH** | Research topics via web, return ResearchBrief | "research this topic", "content brief" |
| **WRITE** | Articles, posts, landing pages, newsletters | "write an article", "blog post" |
| **LISTING** | Amazon/Shopify product listing copy | "write a listing", "Amazon listing" |

**No auto-publish. All output is draft. Operator reviews and publishes.**

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `content-writer`, `cross-skill` — apply active entries
3. Check memory for `CW-*` entries — apply active entries
4. If LISTING mode: read `references/schemas-and-steps.md` for listing rules and I/O schemas

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause, invoke `ism-learning-engine` with details
2. Await user confirmation, then resume

---

## Mode: RESEARCH

Use web_search to gather current info. Output: ResearchBrief JSON with key_findings, keyword_opportunities, competitor_content_gaps, recommended_angle, sources, confidence.

---

## Mode: WRITE

Accept ResearchBrief or direct brief. Output formats:

| Type | Length | Key rules |
|---|---|---|
| LinkedIn post | 150-250 words | Hook in line 1, max 3 hashtags |
| Blog article | 600-1,200 words | H1+H2, target keyword in H1 |
| Social post | 80-120 words | Visual description included |
| Newsletter | 400-600 words | Header + 3 sections + CTA |
| Landing page | Hero + 3 benefits + CTA | No fluffy adjectives |

No invented statistics. Flag any stat needing verification.

---

## Mode: LISTING

Read `references/schemas-and-steps.md` before generating listing copy.

**Components:** Title (200 chars max), 5 bullet points (Feature/Benefit/Proof), description (2000 chars), A+ brief, backend keywords (250 bytes).

**Never invent specs.** Dimensions, materials, certifications — ask if not provided.

See `references/schemas-and-steps.md` for full I/O schemas, execution steps, and Amazon India listing rules.

---

## Rules

1. **Never invent specs.** Mark `[REQUIRED]` if missing.
2. **Country of origin mandatory.** Flag in data_gaps if not provided.
3. **No filler copy.** Every sentence must carry information.
4. **Keyword density.** Primary keyword in title + bullet 1 + description opening.
5. **Check backend byte count.** UTF-8 multi-byte chars count as 2-3 bytes.

---

## Governance Contract

```yaml
skill_name: content-writer
version: "1.1.1"
owner: Ismokraft
domain: marketing
maturity_level: L2_operational
write_permissions: []
measurable_kpis:
  - KPI-SKILL-CW-01: Listing Quality Score (target >80%)
  - KPI-SKILL-CW-02: Content Production Rate (target >5/sprint)
```

---

## Reference Files

| File | Read when |
|---|---|
| `references/schemas-and-steps.md` | LISTING mode — I/O schemas, execution steps, listing rules |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-spec` | Upstream — ProductSpec feeds LISTING mode |
| `product-screen` | Upstream — LaunchBrief triggers LISTING |
| `zoho-data-ops` | Optional listing push to CRM Products |
| `ism-business-authority` | Consulted by — brand voice, positioning |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent product specifications, dimensions, materials, or features
- Do not fabricate reviews, ratings, competitor claims, or market statistics
- If required data is missing, block and state the exact gap
