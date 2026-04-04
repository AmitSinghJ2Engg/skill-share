# Reconciliation Rules — Settlement Reconciler

**Purpose:** Matching logic, fee rate table, and discrepancy thresholds.
Read at Steps 3 and 4.

---

## §1 Transaction Matching Rules

### Rule 1: Order Matching
Match each settlement Order transaction to a Books invoice using `order_id`.
- Match found + amounts within ₹1 → MATCHED
- Match found + amount differs by > ₹1 → DISCREPANCY (type: amount_mismatch)
- No match found in Books → DISCREPANCY (type: missing_in_books)
- Books invoice exists but no settlement line → DISCREPANCY (type: missing_in_settlement)

### Rule 2: Tax Handling
Settlement "Tax" amount_type = GST collected from buyer.
This is NOT revenue. It should map to a Tax Liability account in Books.
If Books records tax as revenue → DISCREPANCY (type: amount_mismatch, note: "tax misclassified as revenue")

### Rule 3: Refund Matching
Settlement Refund transactions → match to Books credit notes.
Refund principal + refund tax = total Books credit note amount.
Tolerance: ₹1.

### Rule 4: Fee Matching
Settlement fees aggregate by type. Compare to Books "Amazon Fee" expense entries.
Tolerance: ₹10 per fee category (rounding across multiple transactions).
Aggregate variance > ₹500 for any fee type → DISCREPANCY (type: fee_overcharge or amount_mismatch).

### Rule 5: Reimbursement Lines
LostOrDamagedReimbursement → should map to Books "Other Income" or "Inventory Recovery" account.
If not recorded in Books → DISCREPANCY (type: missing_in_books)

---

## §2 Expected Fee Rates — Amazon India 2026

**Effective March 16, 2026. Source: Amazon Seller Central + memory.**

### Referral Fees
| Selling Price | Referral Fee |
|---|---|
| ≤ ₹1,000 | 0% (zero referral fee program) |
| > ₹1,000 — Home & Kitchen | 7% |
| > ₹1,000 — Furniture | 8% |
| > ₹1,000 — Toys | 5% |
| > ₹1,000 — Office Supplies | 7% |
| > ₹1,000 — Garden | 8% |
| > ₹1,000 — General / Other | 10% |
| > ₹1,000 — Sports | 8% |

### Closing Fees (FBA)
| Price Range | Closing Fee |
|---|---|
| ≤ ₹250 | ₹5 |
| ₹251–₹500 | ₹10 |
| ₹501–₹1,000 | ₹30 |
| ₹1,001–₹5,000 | ₹40 |
| > ₹5,000 | ₹70 |

### FBA Weight Handling (standard size, local/regional)
| Weight | Fee |
|---|---|
| ≤ 500g | ₹29 |
| 501–1,000g | ₹40 |
| 1,001–2,000g | ₹57 |
| 2,001–5,000g | ₹78 |
| > 5,000g | ₹78 + ₹15 per 500g above 5kg |

### FBA Pick & Pack
| Size | Fee |
|---|---|
| Standard | ₹14–₹40 (by size tier) |

### GST on Fees
18% on all Amazon fee types. GST should be on fees only, not on the selling price
(Amazon's GST is a cost to seller, not the buyer's GST which Amazon collects separately).

---

## §3 Discrepancy Severity Rules

| Condition | Severity |
|---|---|
| Revenue delta > ₹10,000 across settlement | high |
| Single unmatched transaction > ₹1,000 | high |
| Fee overcharge > ₹500 in aggregate | high |
| Unrecognized transaction_type | high |
| Revenue delta ₹1,000–₹9,999 | medium |
| Single unmatched transaction ₹100–₹999 | medium |
| Fee variance ₹50–₹499 | medium |
| Revenue delta < ₹1,000 | low |
| Rounding difference < ₹10 | low |
| Missing Books entry < ₹100 | low |

---

## §4 Fee Dispute Guidance

If a fee overcharge is confirmed (settlement fee > expected fee from §2):
1. Note the order_id and fee_type in the discrepancy record
2. action_required: "Raise reimbursement request via Amazon Seller Central > Help > Contact Us > FBA Issue"
3. Amazon SLA for fee reimbursement: 7-15 business days
4. If overcharge recurs across multiple orders: escalate via ism-business-authority → decision to raise formal dispute

**Statute of limitations:** Amazon reimbursement claims must be filed within 18 months of the transaction date.

---

## §5 Books Account Mapping

| Settlement Line Type | Zoho Books Account |
|---|---|
| Order Principal | Sales / Revenue |
| Order Tax (GST collected) | GST Payable (Liability) |
| Order Shipping | Shipping Income (if charged to buyer) |
| Refund Principal | Sales Returns |
| Referral Fee | Amazon Fees (Expense) |
| FBA Fees | Fulfillment Costs (Expense) |
| Closing Fee | Amazon Fees (Expense) |
| Weight Handling | Fulfillment Costs (Expense) |
| GST on Fees | GST Input Credit (Asset) |
| Reimbursement | Other Income |
| Storage Fee | Inventory Storage (Expense) |
| Transfer | Bank / Current Account |
