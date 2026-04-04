---
name: supplier-intelligence
description: >
  SI- Supplier Intelligence Engine. Five modes: DISCOVER (multi-source B2B, directory,
  govt, maps, social, export data), ENRICH (cross-reference + dedup), VERIFY (credibility
  score 0-100), CLASSIFY (Manufacturer/OEM-ODM/Trader/Distributor), RANK (5-dimension
  weighted ranking). ALWAYS trigger for: "find suppliers", "supplier discovery",
  "who manufactures this", "India supplier", "manufacturer search", "source this product",
  "verify supplier", "supplier report", "rank suppliers", "IndiaMart", "TradeIndia",
  "GSTIN verify", "MCA check", "factory verification", "SI-". Feeds vendor-ops SCORE
  mode with pre-ranked verified candidates. If unsure — trigger.
version: "1.0.0"
lifecycle: prototype
metadata:
  domain: supply
  prefix: SI-
---

# Supplier Intelligence

Transforms a product sourcing request into a ranked, verified supplier intelligence report.
Five modes chain automatically or run independently.

**This skill discovers and ranks.** It does not score individual vendors post-contact (vendor-ops SCORE),
generate RFQs (vendor-ops RFQ), or calculate margins (margin-calculator).

| Mode | Input | Output |
|---|---|---|
| **DISCOVER** | SupplierSearchRequest | RawSupplierRecord[] from 15+ sources |
| **ENRICH** | RawSupplierRecord[] | EnrichedSupplier[] with website + social signals |
| **VERIFY** | EnrichedSupplier[] | VerifiedSupplier[] with credibility_score 0-100 |
| **CLASSIFY** | VerifiedSupplier[] | ClassifiedSupplier[] with supplier_type |
| **RANK** | ClassifiedSupplier[] | SupplierIntelligenceReport (ranked, full profiles) |

---

## S22 — Data Integrity (NO-FAKE-DATA)

1. **Never invent data.** Every field value must be read from a source or null.
2. **Null is correct.** A fabricated number is a data lie.
3. **Mark source and confidence for every value.** HIGH = observed, MEDIUM = derived, LOW = inferred, UNKNOWN = no data.
4. **Blocked sources are declared, not worked around.**
5. **User paste is trusted input.**
6. **Partial records are valid and must not be hidden.**
7. **Inference is labelled, never presented as fact.**

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/india-supplier-clusters.md` — cluster and platform context
3. If DISCOVER → read `references/supplier-source-protocols.md`
4. If ENRICH → read `references/deduplication-rules.md`
5. If VERIFY → read `references/verification-model.md`
6. If CLASSIFY → read `references/classification-model.md`
7. If RANK → read `references/ranking-model.md`

---

## Runtime Mode Detection

- **Mode A (Claude Desktop / browser_control):** Direct platform navigation. Stop at CAPTCHA — escalate to Mode B.
- **Mode B (Claude.ai / no browser):** web_search + web_fetch. Operator paste for blocked portals. Government data: always operator-provided or Mode A only.

---

## Mode: DISCOVER

**Trigger:** "find suppliers", "supplier search", "who makes this", "find factories"
**Prefix:** SI-D-

1. Accept SupplierSearchRequest (product_name + category required). See `references/schemas-and-steps.md` for full input schema.
2. Generate source-specific keyword sets using cluster data from `references/india-supplier-clusters.md`.
3. Run 7 source groups in order per `references/supplier-source-protocols.md`: B2B marketplaces, business directories, government DBs, maps, social, export data, company websites.
4. Output RawSupplierRecord[] — one per unique source listing. Do not merge here.

---

## Mode: ENRICH

**Trigger:** Automatically after DISCOVER, or with RawSupplierRecord[] provided.
**Prefix:** SI-E-

1. Parse all records per `references/supplier-source-protocols.md` parsing rules.
2. Deduplicate per `references/deduplication-rules.md`: GSTIN primary key, fuzzy name + phone secondary, merge keeping highest completeness.
3. Cross-reference enrichment: fill gaps from additional sources.
4. Compute data_completeness_pct. Assign candidate_id: SI-{YYYYMMDD}-{NNNN}.
5. Output EnrichedSupplier[].

---

## Mode: VERIFY

**Trigger:** Automatically after ENRICH, or with EnrichedSupplier[] provided.
**Prefix:** SI-V-

Apply the 6-group credibility scoring model (0-100 points) from `references/verification-model.md`. Every point must cite its source — never award points on assumption. Score bands: 75-100 Verified, 50-74 Partial, 25-49 Unverified, 0-24 Red Flag. Output VerifiedSupplier[].

---

## Mode: CLASSIFY

**Trigger:** Automatically after VERIFY, or with VerifiedSupplier[] provided.
**Prefix:** SI-C-

Apply the signal matrix from `references/classification-model.md` to classify each supplier as Manufacturer, OEM-ODM, Trader, or Distributor. If top two types within 2 points, mark Ambiguous. Output ClassifiedSupplier[].

---

## Mode: RANK

**Trigger:** Automatically after CLASSIFY, or with ClassifiedSupplier[] provided.
**Prefix:** SI-R-

Apply the 5-dimension weighted ranking model from `references/ranking-model.md`. Output SupplierIntelligenceReport with executive summary, ranked table, top 10 full profiles, red flags, data gaps, and recommended next actions.

---

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|---|---|---|
| DISCOVER | product_name + category | Block — no search target |
| ENRICH | At least 1 RawSupplierRecord | Block |
| VERIFY | At least 1 EnrichedSupplier | Block |
| CLASSIFY | At least 1 VerifiedSupplier | Block |
| RANK | 3+ ClassifiedSuppliers recommended | Warn if fewer |

---

## Halt Conditions

| Condition | Action |
|---|---|
| Zero results from all B2B platforms | Halt. Suggest broader keywords or adjacent cluster. |
| All government portals blocked | Continue with non-government signals. Score reflects missing data. |
| All candidates Red Flag | Report honestly. Recommend expanding search. |
| < 3 candidates after dedup | Warn. Recommend re-running with different keywords. |

---

## Reference Files

| File | Read When |
|---|---|
| `references/india-supplier-clusters.md` | Always — cluster + platform context |
| `references/supplier-source-protocols.md` | DISCOVER — per-platform crawl rules |
| `references/deduplication-rules.md` | ENRICH — fuzzy matching, merge logic |
| `references/verification-model.md` | VERIFY — credibility scoring rubric |
| `references/classification-model.md` | CLASSIFY — signal matrix |
| `references/ranking-model.md` | RANK — 5-dimension weights |
| `references/supplier-data-schema.md` | All modes — canonical field definitions |
| `references/schemas-and-steps.md` | All modes — full I/O schemas and step details |