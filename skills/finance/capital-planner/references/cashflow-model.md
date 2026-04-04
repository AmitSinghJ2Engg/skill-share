# Cash Flow Model — Cash Flow Planner

**Purpose:** Settlement cycle timings, Amazon India payment patterns, and cash flow
intelligence specific to Indian ecommerce. Read before Step 2.

---

## §1 Settlement Timing by Channel

### Amazon India (FBA / Easy Ship)
- **Settlement cycle:** Biweekly (every 14 days)
- **Payment lag from sale:** 14-21 days (sale → settlement period close → bank transfer)
- **Model:** Revenue earned in Week N arrives as cash in Week N+2 (approx)
- **Holding:** Amazon holds funds for the full settlement period before releasing
- **Deductions:** All FBA fees, referral fees, GST on fees deducted before payout
- **Net payout rate (default):** 80-88% of gross GMV depending on category/fees

### Shopify (Razorpay / Cashfree gateway)
- **Settlement cycle:** D+1 to D+3 (next business day to 3 days)
- **Model:** Revenue earned today arrives as cash in 1-3 days
- **Deductions:** Payment gateway fee (1.5-2%), GST on gateway fee
- **Net payout rate (default):** ~98% of GMV

### Flipkart (FBF / Self-Ship)
- **Settlement cycle:** Weekly (every 7 days)
- **Payment lag:** 7-10 days post delivery confirmation
- **Net payout rate:** ~85-90% of GMV

### Meesho
- **Settlement cycle:** 7 days post delivery
- **Returns window:** 7 days return window deducted from settlement
- **Net payout rate:** ~85-88% of GMV

---

## §2 Amazon India Specific Cash Flow Patterns

### Festive Season Cash Impact (Diwali / Great Indian Festival)
- **Typical: October**
- Revenue 3-5× normal velocity for 2 weeks
- Settlement of festive revenue arrives in late October / early November
- **Capital impact:** Inventory must be funded 6-8 weeks BEFORE festive season
  (order in August, FBA shipment in September)
- Cash tied up in inventory peaks in September before festive inflows arrive

### New Product Launch Cash Pattern
```
Month 1: HIGH outflow (FBA shipment, PPC launch spend ₹15-30k)
Month 2: LOW inflow (sales still ramping, ACoS high)
Month 3+: Improving — settlement inflows begin to offset ongoing spend
Breakeven on cash: typically Month 3-4 for a new FBA product
```

### GST on Fees — Cash Timing
- Amazon deducts GST on fees (18%) from settlement
- Seller can claim GST Input Tax Credit (ITC) on these fees
- ITC credit available 1-2 months after filing GST return
- **Net effect:** Short-term cash outflow, recovered as ITC credit 30-60 days later

---

## §3 Cash Flow Stress Pattern Library

Known stress patterns for reference when generating stress_points:

| Pattern | When it occurs | Severity |
|---|---|---|
| Inventory + Ads double hit | Week where inventory order coincides with peak ad spend | high |
| Settlement gap | 2-3 weeks between last settlement and next inventory payment | medium |
| Returns surge | Post-Diwali (November) — return rate often 10-15% | medium |
| Platform fee month | Annual selling plan / subscription renewals | low |
| FBA storage surge | FBA long-term storage fees (Feb 15, Aug 15) | medium |
| Multi-SKU reorder | Two or more SKUs hit ROP in same week | high |

---

## §4 Default Assumptions

| Parameter | Default | Override with |
|---|---|---|
| Amazon settlement lag | 14 days | Actual settlement reports |
| Amazon net payout rate | 83% of GMV | settlement-reconciler actuals |
| Shopify settlement lag | 2 days | Gateway settings |
| Ad spend cadence | Weekly constant | campaign-planner data |
| Safety cash reserve | 20% of monthly COGS | ism-business-authority guidance |
| Amazon FBA fee as % of GMV | 17% | margin-calculator per SKU |

Always state which values are defaults vs actuals in the plan output.

---

## §5 Capital Cycle for a New SKU (Template)

```
T-8 weeks:  Supplier order placed. Pay supplier advance (30-50% of order value).
T-6 weeks:  Balance payment to supplier (remaining 50-70%).
T-4 weeks:  Goods arrive. FBA shipment created. Transit to Amazon.
T-2 weeks:  Goods checked in at Amazon FBA.
T=0:        Product live. PPC launched. Cash outflow: ₹15-30k/month ads.
T+2 weeks:  First sales. No cash back yet (settlement not yet).
T+4 weeks:  First settlement arrives. Partial recovery of launch costs.
T+8 weeks:  Velocity established. Settlement covering monthly ad spend.
T+12 weeks: Approaching positive cash flow on this SKU.
```

Use this template to build the weekly projections for a new product launch scenario.
