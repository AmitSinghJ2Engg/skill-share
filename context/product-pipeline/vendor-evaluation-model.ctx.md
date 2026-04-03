# Vendor Evaluation Model v2 — Tiered Decision System

Replaces the flat 50-question model. Evaluation now happens in 3 progressive tiers
that match how vendor relationships actually develop.

**Design principles:**
1. Don't waste time evaluating vendors who fail basic criteria (Tier 1 kills early)
2. Weight criteria by what actually predicts vendor success for private label ecommerce
3. Produce a decision (proceed / negotiate / reject), not just a grade
4. Map to Bigin Contacts fields for gate enforcement (product Gate 4 requires Grade A/B/C)
5. Practical for a solo founder — no tier has more than 7 questions

---

## Bigin Fields Required (2 fields on Contacts module)

| Proposed API Name | Type | Values |
|---|---|---|
| `Vendor_Score` | integer | 0–100 |
| `Vendor_Grade` | picklist | -None-, A, B, C, D, F |

These are pushed FROM the artifact after Tier 2 (preliminary) or Tier 3 (final).
Product pipeline Gate 4 checks `Vendor_Grade` on the linked Supplier Contact.

---

## Tier 1: Quick Screen (Before Investing Time)

**Purpose:** Disqualify obviously unfit vendors in under 5 minutes.
**When:** After first outreach response (or during IndiaMart/marketplace browsing).

### 5 Binary Checks — ALL must pass

| # | Check | How to Verify | Fail = |
|---|---|---|---|
| 1 | **Responds within 48 hours** | 2 contact attempts via WhatsApp/email/IndiaMart | No response after 2 attempts → SKIP. A vendor who's slow before money changes hands will be worse after. |
| 2 | **Provides clear pricing** | Ask for unit price at 100, 500, 1000 qty | "We'll discuss later" or no structure → SKIP. Price opacity is a red flag for hidden costs. |
| 3 | **Relevant product experience** | Ask for catalog/portfolio in the product category | Never made this type of product → SKIP for private label. (RTS vendors: check stock instead.) |
| 4 | **MOQ is feasible** | Compare to planned first order quantity | MOQ > 5× planned test order → SKIP. Unless they negotiate down, capital lock-up is too high. |
| 5 | **Ships from India** | Confirm manufacturing/warehouse location | Non-India origin when domestic sourcing is the plan → SKIP. Import adds cost, time, and compliance burden. |

**Verdict:** 5/5 pass → Proceed to Tier 2. Any fail → **Skip vendor, document reason.**

**Bigin action:** Vendor Contact gets tag `Tier1-Pass` or `Tier1-Fail`. No score yet.

---

## Tier 2: Quote & Terms Assessment (During Negotiation)

**Purpose:** Is this vendor competitive and capable? Worth ordering a sample?
**When:** After receiving a quote or detailed terms. Before spending money on samples.

### 7 Criteria — Weighted, Scored 1–5

| # | Criterion | Weight | What Score 5 Looks Like | What Score 1 Looks Like |
|---|---|---|---|---|
| 1 | **Price Competitiveness** | **25%** | Unit price ≤ target COGS with room for margin. Clear cost breakdown (material + labor + overhead). Competitive vs 2+ alternatives. | Price exceeds target COGS. No breakdown. Significantly more expensive than alternatives. |
| 2 | **Production Capability** | **20%** | MOQ flexible (negotiable for first order). Capacity to scale 5–10×. Lead time ≤ 30 days. Multiple products possible. | Rigid high MOQ. No scale capacity. Lead time > 60 days. Single product only. |
| 3 | **Quality Evidence** | **15%** | Shares portfolio with similar products. Has ISO/quality certifications. Provides test reports unprompted. References available. | No portfolio. No certifications. "Trust us" approach. Won't share references. |
| 4 | **Communication Quality** | **15%** | Responds same day. Clear and specific answers. Proactively shares info. Single POC. Professional. | Slow (>48 hrs). Vague or evasive answers. Requires repeated follow-ups. No clear POC. |
| 5 | **Terms & Payment** | **10%** | Offers 50/50 or 30/70 payment. Accepts bank transfer. No hidden fees. Sample cost deducted from first order. | 100% advance. Cash only. Undisclosed packaging/tooling fees. Sample cost non-refundable. |
| 6 | **Logistics Capability** | **10%** | Handles shipping to FBA warehouse. Provides tracking. Proper packaging for transit. Has shipped to Amazon sellers before. | No shipping experience. Buyer arranges everything. No tracking. |
| 7 | **Compliance & Documentation** | **5%** | GST registered (provides GSTIN). Can provide tax invoices. BIS/certification support if category requires. | No GST registration. Can't provide formal invoices. No compliance awareness. |

### Scoring Rules

Each criterion scored 1–5 on a defined rubric (above). No half-points.

**Tier 2 Score Calculation:**
```
T2_weighted = (C1×0.25 + C2×0.20 + C3×0.15 + C4×0.15 + C5×0.10 + C6×0.10 + C7×0.05)
T2_score    = (T2_weighted / 5) × 100     // normalize to 0-100
```

| T2 Score | Verdict | Action |
|---|---|---|
| ≥ 70 | **Order sample** | Proceed to Tier 3 |
| 55–69 | **Negotiate first** | Address specific weak criteria, then reassess |
| < 55 | **Reject** | Do not invest in sample. Document reason. |

**Bigin action:** Push preliminary `Vendor_Score` = T2_score. `Vendor_Grade` set based on T2 only
(will be updated after Tier 3).

---

## Tier 3: Sample & Verification (After Sample Receipt)

**Purpose:** Does the actual product meet expectations? Can this vendor execute?
**When:** After receiving and inspecting the physical sample.

### 5 Criteria — Weighted, Scored 1–5

| # | Criterion | Weight | What Score 5 Looks Like | What Score 1 Looks Like |
|---|---|---|---|---|
| 1 | **Product Quality** | **35%** | Material, finish, and durability match or exceed specs. No defects. Feels premium. Would pass Amazon customer expectations at the listed price. | Flimsy, cheap feel. Defects visible. Material doesn't match description. Would generate returns. |
| 2 | **Spec Accuracy** | **25%** | Dimensions, weight, color, material exactly match quote/catalog. No surprises. | Significant deviations from quoted specs. Different material or dimensions than agreed. |
| 3 | **Packaging Capability** | **20%** | Clean packaging. Custom branding possible. Gift-ready (critical for Ismokraft positioning). Protective enough for FBA transit. | Poor packaging. No custom capability. Product arrives damaged. Not presentable. |
| 4 | **Issue Responsiveness** | **10%** | If any issues arose during sampling (delays, misunderstandings), vendor resolved quickly and professionally. | Issues ignored, deflected, or handled poorly. Defensiveness instead of solutions. |
| 5 | **Scale Readiness** | **10%** | Consistency across 2+ samples (if ordered). Vendor confirms capacity and timeline for first bulk order. Provides clear production schedule. | Single sample was one-off quality. Vendor vague on bulk capacity. No production timeline. |

### Scoring Rules

Same 1–5 rubric per criterion.

**Tier 3 Score Calculation:**
```
T3_weighted = (C1×0.35 + C2×0.25 + C3×0.20 + C4×0.10 + C5×0.10)
T3_score    = (T3_weighted / 5) × 100     // normalize to 0-100
```

---

## Final Grade Calculation

```
Final_Score = (T2_score × 0.50) + (T3_score × 0.50)
```

Equal weighting because both matter: a vendor with great terms but bad product (or vice versa) is unsuitable.

### Grade Thresholds

| Score | Grade | Meaning | Product Gate 4 |
|---|---|---|---|
| 80–100 | **A** | Preferred vendor. Priority for orders and relationship investment. | ✅ Passes |
| 65–79 | **B** | Good vendor. Proceed with standard terms and normal oversight. | ✅ Passes |
| 50–64 | **C** | Acceptable vendor. Proceed with closer oversight and documented risk mitigation. | ✅ Passes (with flag) |
| 35–49 | **D** | Below standard. Proceed ONLY if no alternatives exist AND with explicit risk acceptance. | ❌ Blocks Gate 4 |
| < 35 | **F** | Reject. Do not proceed. | ❌ Blocks Gate 4 |

**Bigin action:** Push final `Vendor_Score` and `Vendor_Grade` to Contact record.

---

## Comparison Mode

When evaluating multiple vendors for the same product:

**Side-by-side comparison shows:**
- Tier 2 score per criterion (radar chart)
- Tier 3 score per criterion (radar chart)
- Final grade
- Price comparison: unit cost at test quantity + at scale quantity
- Lead time comparison
- Specific criterion where vendors differ most (decision driver)

**Decision output:** "Vendor X is recommended because [specific reason]. Risk vs Vendor Y: [specific tradeoff]."

Not just "Vendor X scored 73, Vendor Y scored 68." The difference must be meaningful.

---

## Price Comparison Module (Standalone — No Score Impact)

Price comparison is separate from the scored evaluation. It provides context, not a grade.

| Data Point | Per Vendor |
|---|---|
| Unit price at test quantity (50–100 units) | ₹ |
| Unit price at scale quantity (500–1000 units) | ₹ |
| MOQ | Units |
| Lead time (order to delivery) | Days |
| Sample cost | ₹ (refundable on first order?) |
| Shipping cost to FBA | ₹ per unit (or ₹ per shipment) |
| Payment terms | Advance %, milestone, credit |
| **Landed cost per unit** | = Unit price + shipping + packaging + overhead per unit |

**Landed cost** is the number that feeds into the unit economics model (Gate 3).

---

## Quality Checklist (Physical Inspection — Part of Tier 3)

When the sample arrives, photograph and score each:

| Inspection Point | Pass/Fail | Notes |
|---|---|---|
| Material matches description | | |
| Finish quality (smooth, no rough edges, no discoloration) | | |
| Dimensions within ±5% of spec | | |
| Weight within ±10% of spec | | |
| Durability test (appropriate to product — opening/closing, stress) | | |
| Branding/print accuracy (if custom) | | |
| Packaging protects product in transit | | |
| Overall: would a customer paying ₹[SP] feel satisfied? | | |

Any fail on the first or last point is a hard fail — overrides Tier 3 scoring.

---

## Artifact → Bigin Data Flow

```
Tier 1: Quick Screen
  Artifact: 5 binary checks → PASS/FAIL
  Bigin:    Tag on Contact ("Tier1-Pass" or "Tier1-Fail")

Tier 2: Quote Assessment
  Artifact: 7 criteria scored → T2_score (0-100)
  Bigin:    Vendor_Score = T2_score, Vendor_Grade = preliminary grade

Tier 3: Sample Verification
  Artifact: 5 criteria scored → T3_score (0-100) → Final_Score → Final_Grade
  Bigin:    Vendor_Score = Final_Score, Vendor_Grade = Final_Grade

Product Gate 4 enforcement:
  Bigin workflow rule checks: linked Supplier Contact has Vendor_Grade ∈ {A, B, C}
```

---

## Storage Keys (artifact)

| Key | Content |
|---|---|
| `ism:vendors` | Vendor registry (all vendors, all stages) |
| `ism:v:{vid}:tier1` | Tier 1 screen results |
| `ism:v:{vid}:tier2` | Tier 2 scores per criterion + notes |
| `ism:v:{vid}:tier3` | Tier 3 scores per criterion + photos + notes |
| `ism:v:{vid}:price` | Price comparison data |
| `ism:v:{vid}:quality` | Quality checklist results |
| `ism:p:{pid}:evaluations` | Per-product vendor evaluations (links product to vendor assessments) |
