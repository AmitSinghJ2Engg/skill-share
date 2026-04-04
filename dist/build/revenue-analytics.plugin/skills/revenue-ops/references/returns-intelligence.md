# Returns Intelligence — Returns Analyzer

**Purpose:** Return reason taxonomy, category benchmarks, account health rules,
Amazon India-specific return reason codes. Read before Step 1.

---

## §1 Amazon India Return Reason Code Taxonomy

Map Amazon's return reason codes to root_cause_category:

| Amazon Reason Code | Reason Label | Root Cause Category |
|---|---|---|
| DEFECTIVE | Item is defective | product_quality |
| NOT_AS_DESCRIBED | Item not as described | listing_accuracy |
| WRONG_ITEM_SENT | Wrong item sent | fulfillment |
| MISSING_PARTS | Missing parts or accessories | fulfillment / packaging |
| DAMAGED_BY_CARRIER | Damaged in shipping | packaging |
| ACCIDENTAL_ORDER | Ordered by mistake | customer_error |
| NO_LONGER_NEEDED | No longer needed | customer_error |
| INACCURATE_WEBSITE_DESCRIPTION | Inaccurate description | listing_accuracy |
| DID_NOT_APPROVE | Did not approve purchase | customer_error |
| SIZE_TOO_SMALL | Size/fit issue (too small) | listing_accuracy |
| SIZE_TOO_LARGE | Size/fit issue (too large) | listing_accuracy |
| POOR_QUALITY | Poor quality | product_quality |
| NOT_COMPATIBLE | Not compatible with device | listing_accuracy |
| ARRIVED_TOO_LATE | Arrived too late | fulfillment |
| UNAUTHORIZED_PURCHASE | Unauthorized purchase | customer_error |

---

## §2 Return Rate Benchmarks — Amazon India

**By category (approximate, based on Indian ecommerce data):**

| Category | Acceptable | Warning | Critical |
|---|---|---|---|
| Home & Kitchen | < 5% | 5-10% | > 10% |
| Sports & Fitness | < 6% | 6-12% | > 12% |
| Stationery / Office | < 3% | 3-8% | > 8% |
| Puja / Religious | < 4% | 4-8% | > 8% |
| Baby & Kids | < 4% | 4-8% | > 8% |
| General / Other | < 6% | 6-10% | > 10% |
| Electronics accessories | < 8% | 8-15% | > 15% |
| Apparel / Fashion | < 15% | 15-25% | > 25% |

**Platform-level return rate threshold:**
- Amazon's ODR (Order Defect Rate) threshold = 1.0%
  ODR = (negative feedback + A-to-Z claims + chargebacks) / total orders × 100
  Breaching 1.0% ODR = account suspension risk

**Return rate ≠ ODR.** A return without an A-to-Z claim or negative feedback does not
count toward ODR. However, high return rates signal listing/product problems and
often precede ODR violations.

---

## §3 Root Cause → Corrective Action Mapping

| Root Cause Category | Common Corrective Actions |
|---|---|
| listing_accuracy | Update title, bullets, images to accurately describe size/material/compatibility. Add scale reference image. Add size chart if applicable. |
| product_quality | Raise quality issue with vendor-scorer. Request QC hold on next batch. Get replacement sample and re-inspect. |
| packaging | Upgrade packaging (bubble wrap, foam insert, rigid box). Review FBA packaging requirements. Add fragile label. |
| fulfillment | Check FBA inventory age and condition. Inspect for damage in warehouse. File FBA reimbursement if Amazon at fault. |
| customer_error | No product action needed. Consider A+ content to set clearer expectations. Add FAQ to listing Q&A. |
| counterfeit | File brand protection report with Amazon. Consider brand registry enrollment. |

---

## §4 Account Health Risk Rules

```
ODR Threshold:   1.0% — Amazon suspension trigger
Pre-Cancellation Rate:  < 2.5%
Late Shipment Rate:     < 4% (self-ship only)

Suspension risk classification:
  low:      ODR < 0.5% AND no ASIN at critical return rate
  medium:   ODR 0.5-0.8% OR 1+ ASIN at critical return rate
  high:     ODR 0.8-1.0% OR ASIN has > 5 A-to-Z claims in period
  critical: ODR > 1.0% — immediate action required
```

---

## §5 FBA Returns — Amazon India Specifics

**Unfulfillable inventory:** Amazon marks returned items as "unfulfillable" if damaged.
These units sit in FBA and incur storage fees. Options:
1. Removal order (₹20-50 per unit) — get it back
2. Disposal order (₹5-15 per unit) — destroy it
3. FBA Grading — Amazon re-lists as "Used" (applicable to some categories)

**Return reimbursement:** If Amazon loses a returned item or it's returned damaged
by their process, file a reimbursement request within 90 days.

**Returns processing fee (new 2024):** Amazon charges a returns processing fee for
high-return-rate ASINs in some categories. This appears as "Returns Processing Fee"
in settlement reports. Flag if this appears — indicates Amazon has classified the ASIN
as high-return.
