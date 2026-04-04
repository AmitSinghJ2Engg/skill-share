# Artifact Prompt — ISM Procurement

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a Source-to-Pay artifact for Ismokraft covering the S2P procurement lifecycle.

### Views

1. **PO Tracker** — Purchase order lifecycle from creation to receipt to payment
2. **Payment Schedule** — Upcoming and overdue vendor payments with amount and status
3. **Invoice Reconciliation** — Match invoices to POs and deliveries, flag discrepancies
4. **Expense Dashboard** — Categorized spend analysis by vendor, product, and period
5. **Vendor Ledger** — Per-vendor transaction history and outstanding balance

### Storage Keys

- `ism:config:procurement` — payment terms, GST rates, currency settings
- `ism:procurement:state` — full artifact state
- `ism:po:{poId}:status` — per-PO tracking data
- `ism:v:{vendorId}:ledger` — per-vendor payment history

### Config Defaults

```json
{
  "gst_rate": 0.12,
  "primary_currency": "INR",
  "payment_terms_default_days": 30,
  "overdue_alert_days": 7,
  "reconciliation_tolerance_pct": 0.02
}
```

### Generate

`source-to-pay-v1.0.artifact.tsx`
