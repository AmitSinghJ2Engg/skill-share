# Amazon India Fee Table — 2026
**Source:** Amazon Seller Central + sellerrocket.in
**Effective:** March 16, 2026
**Last updated:** 2026-03-11
**Owner skill:** margin-calculator
**Used by:** margin-calculator, campaign-planner, cash-flow-planner

---

## Referral Fee

### Zero Referral Fee — Products ≤ ₹1,000
Effective March 16, 2026: Zero referral fees expanded to all products priced **up to ₹1,000**
across 1,800+ categories.

**Impact:** Products priced at or below ₹1,000 incur ₹0 referral fee regardless of category.

### Referral Fee — Products > ₹1,000

| Category | Referral Fee % |
|---|---|
| Books | 5.0% |
| Consumer Electronics | 5.0% |
| Mobile Phones & Accessories | 5.0% |
| Computers & Accessories | 5.0% |
| Home & Kitchen | 9.0% |
| Home Improvement | 9.0% |
| Kitchen & Dining | 9.0% |
| Baby Products | 9.0% |
| Health & Personal Care | 9.0% |
| Beauty | 9.0% |
| Grocery & Gourmet Foods | 9.0% |
| Pet Supplies | 9.0% |
| Sports & Outdoors | 9.0% |
| Toys & Games | 9.0% |
| Industrial & Scientific | 9.0% |
| Office Products | 9.0% |
| Clothing & Accessories | 9.5% |
| Shoes & Handbags | 9.5% |
| Jewellery | 9.5% |
| Watches | 9.5% |
| Luggage & Travel | 9.5% |
| Furniture | 9.5% |
| Automotive | 9.5% |
| Musical Instruments | 9.5% |
| Default (all others) | 9.0% |

**Formula:** `Referral_Fee_₹ = SP > 1000 ? SP × category_rate : 0`

---

## Closing Fee

Flat fee by selling price slab. Applies to all orders regardless of category.

| Selling Price Range | Closing Fee |
|---|---|
| ₹0 – ₹300 | ₹5 |
| ₹301 – ₹500 | ₹10 |
| ₹501 – ₹1,000 | ₹20 |
| ₹1,001 – ₹5,000 | ₹40 |
| ₹5,001 – ₹10,000 | ₹60 |
| ₹10,001 and above | ₹70 |

---

## Weight Handling Fee (EasyShip / Self-Ship)

Charged by Amazon for logistics on non-FBA shipments.
Base rate for orders under 500g: **₹29**

| Weight | Rate |
|---|---|
| ≤ 500g | ₹29 |
| 501g – 1 kg | ₹42 |
| 1.01 kg – 2 kg | ₹58 |
| 2.01 kg – 5 kg | ₹78 + ₹15 per kg above 2 |
| Above 5 kg | ₹120 + ₹15 per kg above 5 |

**Formula (simplified for ≤ 500g products):** `Weight_Handling = 29`

---

## FBA Fees

### FBA Pick & Pack (per unit)

| Product Size Tier | Pick & Pack Fee |
|---|---|
| Small (≤ 250g, ≤ 25×15×10 cm) | ₹14 |
| Standard (≤ 500g, ≤ 30×25×15 cm) | ₹21 |
| Large (≤ 5 kg, ≤ 45×35×25 cm) | ₹40 |
| Oversize (> 5 kg or > 45×35×25 cm) | ₹75+ (quote) |

**Formula:** Look up tier by actual weight and dimensions.

### FBA Storage (monthly, per cubic foot) — Reference Only
- Standard size: ₹20–₹40 per cubic foot depending on month
- Not included in per-unit calculation unless explicitly modelling storage costs

---

## GST on Amazon Fees

18% GST applies to all Amazon service fees (referral + closing + weight handling + FBA).

**Formula:**
```
Taxable_Fees = Referral_Fee + Closing_Fee + Weight_Handling + FBA_Fee
GST_on_Fees = Taxable_Fees × 0.18
Total_Deductions = Taxable_Fees + GST_on_Fees
```

---

## Total Deductions Formula

```
Total_Deductions = (Referral_Fee + Closing_Fee + Weight_Handling_or_FBA) × 1.18
```

---

## Category Lookup Notes

- If a product spans multiple categories (e.g. a health & kitchen product), use the higher rate.
- For Ismokraft's primary categories (home décor, puja items, gifting, kitchen accessories): use **9.0%** as default.
- If the product is priced ≤ ₹1,000: referral fee = **₹0** regardless of category.

---

## Exception Pattern

If product category is not in this table, or if a new fee announcement changes these rates,
invoke `ism-learning-engine` with type `api_behavior` or `rule_gap`.

---

## Revision History

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 2026-03-11 | Initial — extracted from margin-calculator. 2026 fee update incorporated. | Audit |