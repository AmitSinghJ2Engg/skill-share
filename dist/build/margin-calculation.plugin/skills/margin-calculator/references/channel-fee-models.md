# Channel Fee Models — margin-calculator
# Owner: margin-calculator
# Covers: Shopify fees, returns cost model, channel comparison, pricing model, break-even
# Last updated: 2026-03-15

---

## §1 — Shopify Fee Model (India)

### Payment Gateway (Razorpay — default for India Shopify)

| Plan | Transaction Fee | Payment Processing | Notes |
|---|---|---|---|
| Razorpay standard | 2% of SP | + ₹0 | Most common for D2C |
| Razorpay Pro (>₹5L/mo) | 1.75% | + ₹0 | Negotiated rate |
| International card | 3% | + ₹0 | Rare for India D2C |

**Default to use:** `razorpay_pct = 0.02` (2%)

### Shopify Platform Fee (applies when NOT using Shopify Payments)

| Shopify Plan | Platform Fee on each transaction |
|---|---|
| Basic (₹1,499/mo) | 2.0% |
| Shopify (₹5,599/mo) | 1.0% |
| Advanced (₹22,680/mo) | 0.5% |

**Note:** If using Razorpay (not Shopify Payments), platform fee APPLIES on top of gateway fee.
Most India sellers on Basic = 2% Razorpay + 2% Shopify platform = ~4% total on SP.

**Formula:**
```
shopify_total_fee_inr = SP × (razorpay_pct + shopify_platform_pct)
```

**Default input:** `shopify_platform_pct = 0.02` (Basic plan). Override if operator is on higher plan.

### Shopify: No Closing Fee, No Weight Handling Fee
Unlike Amazon, Shopify has no closing fee or weight-based fee. Fulfillment is self-arranged.
Shipping cost is operator-provided as `shipping_inr` input.

### GST on Shopify Fees
Razorpay and Shopify charge 18% GST on their service fees.
```
gst_on_shopify_fees_inr = shopify_total_fee_inr × 0.18
```
This GST is claimable as Input Tax Credit (same as Amazon fee GST).

---

## §2 — GST on Product (Output Tax)

Distinct from GST on fees (which is input tax credit for the seller).

Product GST is charged on the selling price and collected from the buyer.
The seller remits to GSTN and can offset with ITC.

**For margin calculations:** GST on product is a pass-through — it does NOT affect net margin
when the buyer pays the GST-inclusive price. However, it affects:
- The declared SP on invoices (₹SP includes GST)
- Cash flow timing (GST collected → remitted monthly/quarterly)

**Rule for margin-calculator:** Use SP as the GST-inclusive price (as listed on platform).
Do not separately deduct product GST from margin unless operator requests ex-GST margin.
If operator asks for ex-GST margin, declare: `sp_ex_gst = SP / (1 + gst_rate)`.

**Common HSN-based GST rates for Ismokraft category:**
| Category | GST Rate |
|---|---|
| Wooden handicrafts / home décor | 12% |
| Wooden furniture / mandir | 12% |
| Metal handicrafts | 12% |
| Puja items (religious articles) | 0% (exempt) |
| Stationery | 12% or 18% |

**Default:** 12% for wooden home décor / gifting products.

---

## §3 — Returns Cost Model

Returns affect margin. Model returns cost as a deduction per unit sold (expected value).

```
returns_cost_per_unit = return_rate × (SP × return_restocking_pct + return_shipping_inr)

where:
  return_rate            = % of units returned (default: 5% Amazon FBA, 3% Shopify)
  return_restocking_pct  = % of SP lost on returned item (default: 15% — damage, repack, disposal)
  return_shipping_inr    = inbound return shipping cost (FBA: ₹0 Amazon absorbs; Shopify: ₹60-120)
```

**Amazon FBA returns:**
- Amazon handles return shipping from customer
- Seller bears: restocking fee (if item unsellable) or repack cost (if sellable)
- Default: `return_rate = 5%, return_restocking_pct = 10%, return_shipping_inr = 0`

**Shopify returns:**
- Seller bears return shipping (prepaid label or customer pays)
- Default: `return_rate = 3%, return_restocking_pct = 15%, return_shipping_inr = 80`

**Returns cost is included in Total Deductions.** Declare in output as `returns_cost_inr`.

---

## §4 — Contribution Margin by Channel (Side-by-Side)

When operator requests channel comparison, run unit economics for both channels
from the same product inputs, substituting only the channel-specific fees.

**Amazon channel deductions:**
```
amazon_deductions = referral_fee + closing_fee + weight_handling + fba_pickpack
                  + gst_on_amazon_fees + returns_cost_amazon
```

**Shopify channel deductions:**
```
shopify_deductions = shopify_gateway_fee + shopify_platform_fee
                   + gst_on_shopify_fees + shipping_inr + returns_cost_shopify
```

**Output: ChannelComparisonRecord**
```json
{
  "sku": "string",
  "sp_inr": 800,
  "cogs_inr": 200,
  "amazon": {
    "total_deductions_inr": 145,
    "cpu_inr": 455,
    "cmr_pct": 59.2,
    "breakeven_roas": 2.31,
    "verdict": "PASS"
  },
  "shopify": {
    "total_deductions_inr": 98,
    "cpu_inr": 502,
    "cmr_pct": 65.4,
    "breakeven_roas": null,
    "verdict": "PASS"
  },
  "better_channel": "shopify",
  "margin_delta_inr": 47,
  "note": "Shopify margin higher by ₹47/unit due to lower platform fees. Consider Shopify for high-velocity SKUs."
}
```

**S22 rule:** If any fee input is missing for a channel, that channel's record has `verdict: null`
and `data_gap: ["field_name"]`. Never substitute estimated fees.

---

## §5 — Minimum Viable Selling Price (Pricing Model)

Minimum SP is the price at which net margin = 0 (break-even on unit economics, no profit).
Target SP is the price at which net margin = goal_margin_pct.

```
min_viable_sp = COGS + total_variable_deductions_at_min_sp
              (solve iteratively since fees depend on SP)

Iterative approach (3 passes sufficient):
  Pass 1: estimate SP = COGS × 2.5
  Pass 2: compute fees at estimated SP → recompute SP = COGS + fees
  Pass 3: recompute fees at Pass 2 SP → final min_viable_sp

target_sp = min_viable_sp / (1 - goal_margin_pct)
```

**Discount impact:**
```
effective_sp_after_discount = sp × (1 - discount_pct)
discount_cost_inr           = sp × discount_pct
max_safe_discount_pct       = (net_margin_pct - floor_margin_pct)
  where floor_margin_pct = 10% (Marginal threshold)
```

**Output fields to add to MarginRecord:**
- `min_viable_sp_inr`
- `target_sp_inr` (at goal_margin_pct)
- `max_safe_discount_pct`
- `current_vs_target_delta_inr` (positive = room to discount, negative = below target)

---

## §6 — Break-Even Units and Break-Even Revenue

Break-even in this context = covering fixed costs with contribution margin.

```
break_even_units   = fixed_costs_monthly / cpu_inr
break_even_revenue = break_even_units × net_sp_inr

where:
  cpu_inr            = contribution per unit (net_sp - cogs - total_deductions)
  fixed_costs_monthly = operator-provided (rent, tools, team, etc.)
```

**If fixed_costs_monthly not provided:**
- Return break_even_units with note: "Fixed costs not provided — break-even computed assuming zero fixed costs (product-level only)"
- Do NOT default fixed_costs to zero silently — declare the assumption.

**Post-marketing break-even (includes ad spend):**
```
post_mkt_cpu         = cpu_inr - cpa_inr
post_mkt_break_even  = fixed_costs_monthly / post_mkt_cpu
```

---

## §7 — Post-Marketing Contribution Margin

After accounting for paid acquisition cost per unit:

```
post_mkt_cm_inr  = cpu_inr - cpa_inr
post_mkt_cmr_pct = post_mkt_cm_inr / net_sp_inr × 100

where cpa_inr = actual or target CPA from ads-ops
```

If `cpa_inr` not provided, output `post_mkt_cm_inr: null` with `data_gap: ["cpa_inr"]`.
Never estimate CPA — it must come from ads-ops actuals or operator input. S22.

---

## Revision History
| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-03-15 | Created — Shopify fees, returns model, channel comparison, pricing model, break-even |