# Settlement Schema — Settlement Reconciler

**Purpose:** Amazon India settlement CSV field definitions and transaction type taxonomy.
Read at Step 1 before parsing.

---

## §1 Settlement CSV Structure

Amazon settlement files have two sections:

### Header Block (first ~10 rows)
Key fields:
- `settlement-id` — unique ID for this settlement period
- `settlement-start-date` — period start
- `settlement-end-date` — period end
- `deposit-date` — date funds transferred to bank
- `total-amount` — net amount deposited (= net_settlement_amount)
- `currency` — INR for Amazon India

### Transaction Rows
Each row = one transaction line.

| Column | Field Name | Description |
|---|---|---|
| settlement-id | settlement_id | Links to header |
| settlement-start-date | period_start | |
| settlement-end-date | period_end | |
| deposit-date | deposit_date | |
| total-amount | total_amount | Net amount for this settlement |
| currency | currency | INR |
| transaction-type | transaction_type | See §2 below |
| order-id | order_id | Amazon order ID |
| merchant-order-id | merchant_order_id | Seller's own order ID if set |
| adjustment-id | adjustment_id | For non-order transactions |
| shipment-id | shipment_id | |
| marketplace-name | marketplace | e.g., "Amazon.in" |
| amount-type | amount_type | Principal, Tax, Shipping, FBA, etc. |
| amount-description | amount_description | Fee description |
| amount | amount | ₹ value (negative = deduction) |
| fulfillment-id | fulfillment_id | FBA or MFN |
| posted-date | posted_date | When this line posted |
| posted-date-time | posted_datetime | |
| item-code | item_code | ASIN or fee code |
| merchant-adj-itemid | merchant_adj_itemid | Adjustment reference |

---

## §2 Transaction Type Taxonomy

### Revenue Lines (positive amount)
| transaction_type | amount_type | Meaning |
|---|---|---|
| Order | Principal | Product selling price |
| Order | Tax | GST collected from buyer |
| Order | Shipping | Shipping charged to buyer |
| Order | Giftwrap | Gift wrap charged |

### Deduction Lines (negative amount)
| transaction_type | amount_type | Meaning |
|---|---|---|
| Order | FBAPerUnitFulfillmentFee | FBA pick & pack fee |
| Order | ReferralFee | % referral fee on category |
| Order | VariableClosingFee | Closing fee by price slab |
| Order | WeightHandlingFee | Weight-based FBA fee |
| Order | Commission | Same as ReferralFee in some reports |
| Order | FixedClosingFee | Flat closing fee |
| Order | GiftwrapChargeback | Giftwrap reversal |

### Returns
| transaction_type | amount_type | Meaning |
|---|---|---|
| Refund | Principal | Principal refunded to buyer |
| Refund | Tax | Tax refunded |
| Refund | FBAPerUnitFulfillmentFee | Fee refunded on return |

### Fees (not order-specific)
| transaction_type | amount_description | Meaning |
|---|---|---|
| FBA Inventory Fee | FBAStorageFee | Monthly storage fee |
| Subscription | Selling on Amazon Fee | Monthly plan fee |
| Adjustment | FBADisposalFee | Disposal of inventory |
| Adjustment | LostOrDamagedReimbursement | Amazon reimburses lost stock |

### Transfer
| transaction_type | Meaning |
|---|---|
| Transfer | Actual bank transfer — the total-amount line |

---

## §3 Amount Signs

- **Positive** = money flowing TO seller
- **Negative** = money flowing FROM seller (fees, refunds paid)

Net settlement = SUM(all amounts including positives and negatives)

---

## §4 Known Quirks — Amazon India

1. **GST on fees:** Amazon charges 18% GST on all fee types. This appears as a separate line with amount_description = "GST" or embedded in the fee amount depending on the report version.

2. **Tax collected ≠ Tax remitted:** The "Tax" column in Order rows = GST collected from buyer. Amazon remits this to the government. It should NOT be counted as revenue. It flows through as Tax Liability in Books.

3. **FBA fees vary by month:** Storage fees post at month-end as a batch. They may appear in a different settlement period than the orders they relate to.

4. **Reimbursements:** LostOrDamagedReimbursement appears as positive Adjustment. It is not revenue — it is an insurance recovery. Map to separate Books account.

5. **Multi-channel fulfillment:** MCF orders have different fee structure. Flag separately if present.
