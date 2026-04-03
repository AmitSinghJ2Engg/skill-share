# Vendor Tracker — Operational Templates

**Source:** `Vendor_Evaluation_Tracker_1.xlsx` (sheets: Product Specification, Price Comparison, Quality Checklist, Quote Template, Notes)
**Purpose:** Operational templates used during vendor evaluation that supplement the scoring models. These are NOT scoring models — they're working documents and checklists.
**Relationship:** Used alongside `vendor-eval-model.md` (scoring) and `vendor-comms-scoring.md` (communication scoring).

---

## 1. Quote Template

Standard cost breakdown to request from every vendor. Send this structure when requesting quotes.

```
QUOTE REQUEST — Required Cost Breakdown
────────────────────────────────────────
1. Material cost (per unit)
2. Labour cost (per unit)
3. Setup cost (one-time)
4. Sample cost
5. Tooling cost (if any)
6. Expected unit cost at:
   - 500 units
   - 1,000 units
   - 2,000 units
7. Lead-time (days from order to dispatch)
8. MOQ (minimum order quantity)
```

**Usage:** Copy and send via WhatsApp/email during Tier 2 evaluation (vendor-eval-model.md). Responses populate the Price Comparison sheet.

---

## 2. Price Comparison Template

Multi-vendor cost comparison grid. Up to 5 vendors side-by-side.

```
PRICE COMPARISON — [Product Name]
──────────────────────────────────────────────────────────────
                    Vendor 1    Vendor 2    Vendor 3    Vendor 4    Vendor 5
Item / Component    ID  Qty ₹   ID  Qty ₹   ID  Qty ₹   ID  Qty ₹   ID  Qty ₹
────────────────    ── ── ──    ── ── ──    ── ── ──    ── ── ──    ── ── ──
[Component 1]       ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..
[Component 2]       ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..
[Component N]       ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..  ..
────────────────
TOTAL               ..          ..          ..          ..          ..
```

**Fields per vendor per item:**
- ID: Vendor's item/SKU reference
- Qty: Quantity quoted
- ₹: Unit price at that quantity

**Usage:** Fill after receiving quotes from multiple vendors. Used to compare landed costs before selecting a vendor for sampling.

---

## 3. Product Specification Template

Captures product design requirements to share with vendors.

```
PRODUCT SPECIFICATION — [Product Name]
──────────────────────────────────────
Design file:    [filename.dxf / .ai / .pdf]
Material:       [e.g., 5.5mm~ prelaminated MDF (Natural Teak)]

Features:
- [Feature 1, e.g., "Has arc in front"]
- [Feature 2, e.g., "Bigger than competition"]
- [Feature 3, e.g., "Made of prelaminated MDF wood"]
- [Feature 4, e.g., "Brown color"]

Dimensions:     [L × W × H in cm/mm]
Weight:         [grams]
Finish:         [e.g., laminated, painted, polished]
Color options:  [e.g., Natural Teak, Walnut, White]
```

**Current product data (Corner Puja Mandir):**
- Design file: `corner mandir.dxf`
- Material: 5.5mm~ prelaminated MDF (Natural Teak)
- Features: Arc in front, bigger than competition, prelaminated MDF wood, brown color

**Usage:** Send to vendor with Quote Template. Ensures all vendors quote against identical specs.

---

## 4. Quality Checklist

Sample inspection checklist. Used when a vendor sample arrives.

```
QUALITY CHECKLIST — Sample Inspection
──────────────────────────────────────
When the sample arrives, inspect:

☐ Material feel / finish
☐ Durability (e.g., box opening/closing cycles)
☐ Print / branding accuracy
☐ Packaging presentation (gifting standard)

Actions:
- Take photos of each checkpoint
- Score each dimension (1-10)
- Compare against Product Specification above
```

**Usage:** Part of Tier 3 evaluation (vendor-eval-model.md). Score feeds into Quality Evidence criterion.

---

## 5. Vendor Comparison Decision Framework (from Notes sheet)

Structured decision-making approach after collecting all vendor data.

### Cost Analysis Framework
```
Unit Cost = Direct Materials + Direct Labour + Overheads (fixed + variable)
```

### Decision Inputs
1. **Target unit cost** — from margin-calculator / unit economics
2. **Minimum acceptable quality** — defined before sampling:
   - Must-haves: fit, finish, materials, durability (CMF)
   - Nice-to-haves: what you'd pay extra for
   - QC checklist: give factory clear specs upfront
   - Baseline: "not negotiating purely cost-blind"
3. **Quality-cost tradeoff** — cost of poor quality / rework:
   - If sample fails quality, what's the cost (time + money + brand)?
4. **Cost per unit at scale** — volume pricing curve
5. **Acceptable band** — e.g., "pay up to X% above lowest quote only if quality score is significantly higher"
6. **Go/no-go criteria** — e.g., "if sample cost > 30% higher than target AND quality difference < 10% better → reject"

### Supplier Comparison Table
```
                    Sample    Unit Cost     Lead-time   Quality   Finish/Material   Delivery      Setup/       Total
Supplier            Quote ₹   @target vol ₹  (days)    Score     Risk             Reliability   Tooling ₹    Score
                                                       (1-10)    (H/M/L)          (1-10)
──────────────────  ────────  ────────────  ─────────  ────────  ───────────────   ──────────    ──────────   ──────
Supplier A          ...       ...           ...        ...       ...               ...           ...          ...
Supplier B          ...       ...           ...        ...       ...               ...           ...          ...
Supplier C          ...       ...           ...        ...       ...               ...           ...          ...
```

**Usage:** Final comparison after Tier 2/3 scoring. Combines quantitative scores with operational judgment.

---

## Workflow Integration

These templates are used at specific points in the vendor evaluation flow:

```
Vendor Contact
    ↓
Tier 1 Quick Screen (vendor-eval-model.md) → Pass/Fail
    ↓ Pass
Send Quote Template + Product Specification → Vendor
    ↓
Receive Quote → Fill Price Comparison
    ↓
Tier 2 Scoring (vendor-eval-model.md) → Weighted score
    ↓ Score ≥ threshold
Order Sample → Receive → Quality Checklist
    ↓
Tier 3 Scoring (vendor-eval-model.md) → Final score + grade
    ↓
Comparison Table → Go/No-Go Decision
```
