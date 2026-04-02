---
name: vendor-ops
description: >
  End-to-end vendor qualification in three modes. DISCOVER: delegates to supplier-intelligence for full multi-source ranked discovery. SCORE: SCORE: 3-tier evaluation (quick screen → quote → sample) or dropship comms scoring — returns VendorScore + grade A–F. RFQ: generates Request for Quotation document. Absorbs: vendor-discovery, vendor-scorer, rfq-generator. ALWAYS trigger for: "find suppliers", "find vendors", "source this product", "who makes this", "IndiaMart search", "supplier search", "manufacturer search", "find a factory", "where to source", "vendor shortlist", "score this vendor", "evaluate this supplier", "vendor score", "vendor grade", "tier 1 check", "quick screen vendor", "communication score", "generate RFQ", "write to supplier", "send quote request", "sourcing email", "RFQ for product", "VO-". If the task involves finding, evaluating, or contacting a vendor — trigger. If unsure — trigger.

metadata:
  version: 1.2.0
  domain: supply
  prefix: VO-
  absorbs:
    - vendor-discovery → mode DISCOVER
    - vendor-scorer → mode SCORE
    - rfq-generator → mode RFQ
  write_permissions:
    - Zoho CRM Contacts: Vendor_Score (int), Vendor_Grade (picklist) — SCORE mode only, via zoho-data-ops WRITE mode
    - Bigin Contacts: read-only
    - All RFQ documents: generate only, no auto-send
  dependencies:
    upstream:
      - product-spec (SupplierBrief triggers DISCOVER and feeds RFQ)
      - product-screen (LaunchBrief triggers DISCOVER)
    downstream:
      - zoho-data-ops WRITE mode (SCORE mode writes Vendor_Score, Vendor_Grade)
      - rfq-generator output feeds Slack vendor channel manually
---
# Vendor Ops

Three-mode vendor qualification workflow: find → score → contact.

**Single responsibility per mode:**
- DISCOVER: find suppliers
- SCORE: evaluate them
- RFQ: contact them

**Writes only Vendor_Score and Vendor_Grade to CRM Contacts via zoho-data-ops WRITE mode. Everything else is generate/display only.**

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
2. Read `ikraft-skill-governance/references/resolutions.md` — filter by domain `vendor-ops`, `vendor-discovery`, `vendor-scorer`, `rfq-generator`, `cross-skill` — apply active records silently3. Check memory for `VO-*` entries — apply active entries
4. Read `vendor-comms-scoring.md` from project — for SCORE mode communication criteria
5. Read `vendor-tracker-extras.md` from project — for active vendor context

---

## Mode Selection

| User has... | Needs... | Run mode |
|-------------|----------|----------|
| A product spec, no vendor yet | Supplier shortlist | DISCOVER |
| Vendor name/profile/responses | Evaluation + grade | SCORE |
| A shortlisted vendor to contact | RFQ document | RFQ |

---

## Mode: DISCOVER

**This mode now delegates to `supplier-intelligence`.**

DISCOVER mode in vendor-ops accepted basic IndiaMart/TradeIndia search and returned 3–5 raw profiles.
That capability has been superseded by `supplier-intelligence` which runs 15+ sources, verifies
against government databases, deduplicates, classifies, and delivers a ranked intelligence report.

**Correct workflow:**
```
SupplierSearchRequest
  → supplier-intelligence FULL mode
  → SupplierIntelligenceReport (ranked, verified)
  → vendor-ops SCORE mode (qualify top candidates)
```

**When to call vendor-ops SCORE directly (skip supplier-intelligence):**
- You already have a specific named supplier from a referral or prior relationship- You are re-evaluating a previously identified vendor
- supplier-intelligence has already run and returned top candidates

**Input accepted by vendor-ops SCORE:**
- `VerifiedSupplier` from supplier-intelligence output, OR
- A named vendor with contact details and product information

**Output: VerifiedSupplier[] → SCORE mode**

---

## Mode: SCORE

**Trigger:** "score this vendor", "vendor score", "is this vendor good", "evaluate this supplier"  
**Prefix:** VO-S-

### Vendor Type Determination
Ask or infer: Factory/PL vendor (custom production) or Dropship/RTS vendor (ready-to-ship)?

**Factory/PL vendors → 3-Tier evaluation**

**Tier 1: Quick Screen (binary — all must pass)**
| Check | Pass | Fail → Stop |
|-------|------|-------------|
| GST registered | Yes | No |
| Active listing on platform | Yes | No/Inactive |
| Product category match | Yes | No |
| MOQ ≤ 200 units | Yes | >200 |
| Responds to inquiry | Yes | No response in 48h |

If any Tier 1 fails → FAIL. Do not score further. Recommend replacement.
**Tier 2: Quote Assessment (scored, threshold ≥55/100)**
| Criterion | Weight | 0 | 5 | 10 |
|-----------|--------|---|---|-----|
| Price vs COGS target | 25% | >30% over | 10–30% over | Within target |
| Sample availability | 15% | No | On request | Yes, in stock |
| Lead time | 15% | >45 days | 30–45 days | <30 days |
| Communication quality | 20% | Poor/slow | Adequate | Professional, fast |
| Product photos quality | 15% | No photos | Low quality | High quality, multiple angles |
| Customization capability | 10% | None | Limited | Full (size, finish, logo) |

**Tier 3: Sample Assessment (scored, threshold ≥55/100)**
| Criterion | Weight | 0 | 5 | 10 |
|-----------|--------|---|---|-----|
| Build quality | 30% | Poor | Acceptable | Excellent |
| Finish consistency | 20% | Inconsistent | Minor variance | Consistent |
| Matches specifications | 25% | Significant deviation | Minor deviation | Exact match |
| Packaging quality | 15% | No packaging | Basic | Retail-ready |
| Wood quality/species | 10% | Wrong species | Acceptable | Exact spec |

Final Score = T2 × 50% + T3 × 50%

**Dropship/RTS vendors → Communication Scoring**
Use `vendor-comms-scoring.md` criteria. Score 0–100. Grade directly.

**Grade Scale:**
A (85–100): Proceed to RFQ  
B (70–84): Proceed with note  
C (55–69): Negotiate before proceeding  
D (40–54): Use only if no alternatives  
F (<40): Reject  
**Output: VendorScoreRecord**
```json
{
  "score_id": "VO-S-20260314-001",
  "vendor_name": "Raj Wooden Crafts",
  "vendor_type": "factory_pl",
  "tier1_result": "PASS",
  "tier2_score": 72,
  "tier3_score": 68,
  "final_score": 70,
  "grade": "B",
  "verdict": "Proceed with negotiation — price 12% above target, request 10-unit sample before committing",
  "crm_write": {"field": "Vendor_Score", "value": 70, "field2": "Vendor_Grade", "value2": "B"}
}
```

After confirmation, route `crm_write` payload to `zoho-data-ops` WRITE mode.

---

## Mode: RFQ

**Trigger:** "generate RFQ", "write to supplier", "draft supplier message", "sourcing email"  
**Prefix:** VO-R-

### RFQ Document
Generate a professional RFQ for the vendor. Include:

```
Subject: Request for Quotation — [Product Name] — Ismokraft

Dear [Vendor Name],
We are Ismokraft, a D2C home décor brand selling on Amazon India and Shopify.
We are evaluating suppliers for [Product Name] and would like to receive a formal quotation.

PRODUCT SPECIFICATIONS:
- Product: [title]
- Material: [wood species, finish]
- Dimensions: [L × W × H cm]
- Weight target: [gms]
- Target SP (our selling price): ₹[X]

QUOTATION REQUIRED:
1. Unit price at MOQ [n] units
2. Unit price at [2× MOQ] units
3. MOQ and lead time
4. Sample availability and sample cost
5. Customization options (size, finish, logo/branding)
6. Packaging specification and cost
7. GST invoice availability
8. Payment terms

Please reply within 3 business days.

Regards,
[the operator / Ismokraft]
```

**Output: RFQRecord**
```json
{
  "rfq_id": "VO-R-20260314-001",  "vendor_name": "Raj Wooden Crafts",
  "product": "Corner Puja Stand — Sheesham Premium",
  "sent_via": "EMAIL / WHATSAPP / INDIAMART_MESSAGE",
  "rfq_text": "[full text above]",
  "follow_up_date": "2026-03-17",
  "status": "DRAFT"
}
```

Do NOT auto-send. Mark status DRAFT. the operator sends manually. Update to SENT when confirmed.

---

## Exception Handling

- If vendor has no IndiaMart/TradeIndia listing → flag, search Google Maps + Justdial as fallback
- If Tier 1 fails → stop evaluation, output reason clearly, recommend next vendor in shortlist
- If price not shared in quote → set price_vs_target = null, mark T2 score incomplete, request resubmission
- If sample not yet received → run Tier 2 only, mark Tier 3 as "PENDING_SAMPLE"

---

## Execution Log Template

```
VO-EXEC-{id}
Mode: {DISCOVER | SCORE | RFQ}
Product: {product_name}
Vendor: {vendor_name or "batch discovery"}
Started: {timestamp}
Output: {VendorProfile[] | VendorScoreRecord | RFQRecord}
CRM Write: {none | field=value}
Errors: {none | description}
```
---

## Reference Files

| File | Load when |
|------|-----------|
| `references/sourcing-intelligence.md` | DISCOVER mode — cluster data, platform search rules |
| `ism-business-authority/references/vendor-evaluation-model.md` | SCORE mode — full 3-tier model, weights, thresholds |
| `references/vendor-comms-scoring.md` | SCORE mode (dropship) — communication scoring criteria |
| `references/vendor-tracker-extras.md` | SCORE mode — tracker field mappings, active vendor context |
| `references/rfq-templates.md` | RFQ mode — product-specific RFQ templates |
| `references/learnings.md` | All modes — apply active LE-* entries at session start |

---

## Input Schema (DISCOVER mode)

→ See `references/schemas-and-steps.md`

## Output Schema — VendorProfile JSON

→ See `references/schemas-and-steps.md`

## Execution Steps (DISCOVER mode)

→ See `references/schemas-and-steps.md`

## Input Schema (SCORE mode)

→ See `references/schemas-and-steps.md`

## Model Selection

| Vendor Type | Model | Reference |
|---|---|---|| Factory, Private Label, Manufacturer | 3-Tier system | `ism-business-authority/references/vendor-evaluation-model.md` |
| Dropship partner, RTS supplier | Communication scoring | `references/vendor-comms-scoring.md` |
| Either type — operational templates | Quote, price comparison, QC | `references/vendor-tracker-extras.md` |

---

---

## Factory / PL Vendors: 3-Tier System

### Tier 1: Quick Screen (5 binary checks — ALL must pass)

| # | Check | Fail = Skip |
|---|---|---|
| 1 | Responds within 48 hours | No response after 2 attempts → SKIP |
| 2 | Provides clear pricing | "We'll discuss later" → SKIP |
| 3 | Relevant product experience | Never made this type → SKIP |
| 4 | MOQ is feasible | MOQ > 5× planned test order → SKIP |
| 5 | Ships from India | Non-India when domestic sourcing planned → SKIP |

**Verdict:** 5/5 → Tier 2. Any fail → Skip, document reason.

### Tier 2: Quote & Terms (7 criteria, weighted, scored 1–5, threshold ≥55)

| Criterion | Weight |
|---|---|
| Price Competitiveness | 25% |
| Production Capability | 20% |
| Quality Evidence | 15% |
| Communication Quality | 15% |
| Customisation Flexibility | 10% |
| Terms & Conditions | 10% |
| Compliance & Documentation | 5% |
Score: `SUM(score × weight) × 20` → 0-100 scale. Threshold: ≥55 to proceed to Tier 3.

### Tier 3: Sample & Capability (5 criteria, weighted)

| Criterion | Weight |
|---|---|
| Sample Quality | 30% |
| Specification Accuracy | 25% |
| Delivery Reliability | 20% |
| Communication During Process | 15% |
| Packaging & Presentation | 10% |

**Final Score:** `(Tier2 × 50%) + (Tier3 × 50%)` → 0-100

### Grade Mapping

| Grade | Score | Meaning |
|---|---|---|
| A | 80-100 | Excellent — preferred vendor |
| B | 65-79 | Good — reliable option |
| C | 50-64 | Acceptable — proceed with conditions |
| D | 35-49 | Below standard — last resort |
| F | 0-34 | Unacceptable — reject |

**Product Gate 4 requires Grade A, B, or C.**

---

---
## Dropship / RTS Vendors: Communication Scoring

8 categories, 22 questions. Each scored 1-5, weighted. Total max = 5.00.

| Category | Questions | Total Weight |
|---|---|---|
| Product, Services & Catalog | 5 | 0.23 |
| Order Processing | 2 | 0.08 |
| Payment & Fees | 2 | 0.10 |
| Shipping & Logistics | 4 | 0.16 |
| Returns & Refunds | 4 | 0.20 |
| Tech & Integration | 2 | 0.08 |
| Support & Communication | 2 | 0.10 |
| Branding | 1 | 0.05 |

**Score interpretation:**
- 4.0-5.0 → Strong partner, proceed (Grade A/B)
- 3.0-3.9 → Acceptable, negotiate weak areas (Grade C)
- 2.0-2.9 → Risky, proceed only if no alternatives (Grade D)
- Below 2.0 → Reject (Grade F)

Full question bank in `references/vendor-comms-scoring.md`.

---

---

## Multi-Vendor Comparison

When comparing 2+ vendors, produce a comparison table:
```
VENDOR COMPARISON: [Product Name]
═══════════════════════════════════
              Vendor A    Vendor B    Vendor C
Score:        72/100      68/100      45/100
Grade:        B           B           D
Tier:         2           3           2
Price/unit:   ₹XXX        ₹XXX        ₹XXX
Lead time:    XX days     XX days     XX days
MOQ:          XXX         XXX         XXX
Strengths:    [...]       [...]       [...]
Weaknesses:   [...]       [...]       [...]

RECOMMENDATION: [Vendor X] — [reasoning]
```

Use `references/vendor-tracker-extras.md` for the price comparison template and decision framework.

---

---

## Rules (SCORE mode)

1. **Never invent vendor data.** Missing data = gap. Document it in `gaps[]`.
2. **Tier 1 is binary.** All 5 pass or skip the vendor. No partial Tier 1 scoring.
3. **Don't mix models.** Factory vendors → 3-tier. Dropship vendors → comms scoring.
4. **Always state the tier.** A Tier 2 score of 72 means no sample has been received yet.
5. **Quote template:** When vendor needs a quote request, use template from `references/vendor-tracker-extras.md`.

---
---

## Related Skills

| Skill | Relationship |
|---|---|
| `product-spec` | Upstream — SupplierBrief triggers DISCOVER and feeds RFQ |
| `product-screen` | Upstream — LaunchBrief triggers DISCOVER mode |
| `zoho-data-ops` | Write gate — WRITE mode writes Vendor_Score, Vendor_Grade to CRM |
| `margin-calculator` | Peer — margin viability informs vendor COGS target |
| `ism-scrum-master` | Downstream — vendor gaps become Jira tickets |

---

## Dependency Metadata

```
skill_name: vendor-ops

upstream_skills:
  - skill_name: product-spec
    data_consumed: SupplierBrief or ProductSpec
    required: false
  - skill_name: product-screen
    data_consumed: LaunchBrief
    required: false

downstream_skills:
  - skill_name: zoho-data-ops
    data_produced: VendorScore + VendorGrade for CRM Contacts write
    trigger_condition: SCORE mode confirmed grade

fallback_skill: null
orphan_declared: false
```
---

## Governance Contract

```yaml
skill_name: vendor-ops
version: 1.2.0
owner: Ismokraft
domain: supply
maturity_level: L2_operational
systems_accessed:
  - Zoho CRM Contacts (read + write via zoho-data-ops)
write_permissions:
  - Zoho CRM Contacts: Vendor_Score (int), Vendor_Grade (picklist) — via zoho-data-ops WRITE mode only
validation_rules: >
  Required fields per mode must be present. See Pre-Execution Validation.
  No external writes from this skill directly — all CRM writes via zoho-data-ops WRITE mode.
logging_level: summary
```

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent vendor capabilities, certifications, prices, or response quality scores.
- Do not fabricate supplier profiles or communication history.
- If vendor data is incomplete, flag missing fields — do not fill with assumptions.
- All VendorScore results must trace to input evidence; unscored tiers are marked as incomplete.