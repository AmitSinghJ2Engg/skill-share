---
name: content-writer
description: >
  Full-cycle content production in three modes. RESEARCH: researches topics
  via live web, returns ResearchBrief JSON. WRITE: produces articles, blog posts,
  LinkedIn posts, social posts, landing page copy, newsletters. LISTING: creates
  or audits Amazon India and Shopify product listings — title, bullets, description,
  A+ brief / PDP body, backend keywords, variants, FAQ, image-copy callouts.
  Two listing sub-modes: CREATE (write from specs) and AUDIT (score, diff, and
  rewrite an existing draft).
  ALWAYS trigger for: "research this topic", "content brief", "write an article",
  "blog post", "LinkedIn post", "newsletter", "landing page copy", "SEO content",
  "write a listing", "listing copy", "product title", "bullet points",
  "Amazon listing", "optimize listing", "audit listing", "improve listing",
  "rewrite listing", "audit my Amazon listing", "improve my Shopify PDP",
  "Shopify product description", "CW-".
  If the task involves content research, writing, or listing optimization — trigger.
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
| **LISTING / CREATE** | Write Amazon or Shopify listing from product specs | "write a listing", "Amazon listing" |
| **LISTING / AUDIT** | Score, diff, and rewrite an existing listing draft | "audit listing", "improve listing", "rewrite listing" |

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

Two sub-modes: **CREATE** (write from specs) and **AUDIT** (improve an existing draft).

Read `references/schemas-and-steps.md` before either sub-mode — it has channel rules for both Amazon India and Shopify, the Amazon banned-term list, I/O schemas for CREATE and AUDIT, execution steps, and the self-verification checklist.

**Channel selection is mandatory.** Amazon India and Shopify follow materially different rules (char limits, banned terms, structure, SEO model). Set `channel: amazon_india` or `channel: shopify` before any work. If unclear, ask.

**Components by channel:**
- *Amazon India:* Title (≤200 chars), 5 bullet points (Feature/Benefit/Proof), description (≤2000 chars), A+ brief modules, backend keywords (≤250 bytes), search terms.
- *Shopify:* Title (50–70 chars SERP), optional highlights (3–6 bullets), PDP body (story-driven, longer form), meta description, variants, FAQ block, image-copy callouts.

**AUDIT sub-mode** delivers in addition to the rewritten listing: an `audit_summary` (element-by-element score: good / fix / rewrite, with issues flagged) and a `change_list` table (before / after / rationale for every material edit).

**Never invent specs.** Dimensions, materials, certifications, country of origin — ask if not provided. Mark unknowns `[VERIFY]` rather than guessing.

**Run the self-verification checklist** in `references/schemas-and-steps.md` before delivering any CREATE or AUDIT output.

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
