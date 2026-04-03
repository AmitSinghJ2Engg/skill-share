# Financial Formulas -- Ismokraft

Canonical financial calculation models. Authoritative source for all financial calculations.
Source: `Simple_Financial_Projections_Ismokraft.xlsx` and `Product_Bottomline_Evaluator.xlsx`.

---

## Model 1: Unit Economics (Per-Order)

### Input Variables

| Variable | Symbol | Source |
|---|---|---|
| List Price / AOV | `PRICE` | User input |
| Discount % | `DISC_PCT` | User input |
| Purchase Cost (ex-factory) | `PURCHASE` | Supplier quote |
| Transportation Cost | `TRANSPORT` | Logistics quote |
| Marketplace Fees | `MKT_FEE` | Amazon fee calculator |
| Packaging & Shipping Cost | `PKG_SHIP` | Operations data |
| Tax Rate (on SP) | `TAX_PCT` | GST rate for category |
| COD + Payment Gateway % | `COD_PCT` | Platform default |
| Conversion Rate | `CVR` | Category benchmark / actual |
| Goal Profit % | `GOAL_PCT` | Business target |
| CAC Benchmark % (of SP) | `CAC_BENCH` | Industry standard |
| Lifetime Orders/Customer | `LTV_ORDERS` | Category estimate |

### Derived Calculations

```
Discount = PRICE * DISC_PCT
SP = PRICE - Discount
COGS = PURCHASE + TRANSPORT
Gross Margin = SP - COGS
Tax = TAX_PCT * SP
COD = COD_PCT * SP
Total Deductions = MKT_FEE + PKG_SHIP + Tax + COD
Net Profit = Gross Margin - Total Deductions
Net Profit % = Net Profit / SP
Investment Cost = COGS + Total Deductions
ROI = Net Profit / Investment Cost
Validation: SP == Investment Cost + Net Profit
```

### CAC / ACoS

```
Breakeven ACoS % = Net Profit %
Target ACoS % = Breakeven ACoS % - GOAL_PCT
Target ACoS (Rs) = SP * Target ACoS %
Benchmark CAC (Rs) = CAC_BENCH * SP
CPA (target) = Target ACoS (Rs)
CPC (target) = CPA * CVR
ROAS (target) = SP / Target ACoS (Rs)
Breakeven ROAS = SP / (COGS + Total Deductions)   [CORRECTED: includes all costs]
Post-Marketing Profit = Net Profit - Target ACoS (Rs)
```

If Target ACoS < 0%, product cannot support paid acquisition at goal margin.

### Lifetime Value

```
Revenue LTV = SP * LTV_ORDERS
Profit LTV = Net Profit * LTV_ORDERS   [CORRECTED: profit-based, not revenue-based]
LTV:CAC = Profit LTV / CPA   (should be > 3)
Blended Profit = (1st Order Post-Mktg Profit + (LTV_ORDERS-1) * 2nd Order Profit) / LTV_ORDERS
```

---

## Model 2: Bottomline Evaluator (Multi-Sheet)

### Shipping Costs

```
Total Volume (cbm) = (L*W*H / 100^3 * 2.54^3) * Order_Qty
Air Freight/unit = ((Air_rate * Weight) + Broker_fees + (Prep/unit * Qty)) / Qty
Sea Freight/unit = ((Sea_rate * Volume) + Broker_fees + (Prep/unit * Qty)) / Qty
Landed Cost = Shipping + Prep + Factory_Price + (Insurance * Factory_Price) + (Non-recurring/Qty) + (Damage_rate * Factory_Price)
```

### Amazon Fees

```
Size Tier = f(longest_side, median_side, shortest_side, weight, girth)
Fee Components: Referral(8-15%), Closing(fixed), Weight Handling(per kg), Pick & Pack(per unit), Storage(per cbft/mo)
Tax on fees = sum * 18% GST
Total Amazon Fees = Referral + Closing + Weight_Handling + Pick_Pack + Storage
```

### Margins (1st & 2nd Order)

```
2nd Order Cost/Unit = Landed_Cost + Amazon_Fees + (PPC_ACoS * SP) + (Damage_rate * 0.4)
2nd Order Margin = SP - 2nd Order Cost
1st Order Cost/Unit = Landed_Cost + Amazon_Fees + (Launch_Costs / Order_Qty) + (PPC_ACoS * SP)
1st Order Margin = SP - 1st Order Cost
Annual Profit = 1st_Order_Profit + (Annual_Cycles - 1) * 2nd_Order_Profit
```

### Longterm / Capital

```
Min Price 20% Profit = Total_Cost_2nd / 0.8
Target SP 100% ROI = Total_Cost_2nd * 2
Recommended Order Qty = (Mfg_Time + Ship_Time + 10) * Daily_Sales + Units_To_Rank
Capital Needed (sea) = Order_Qty * Landed_Sea * 2 + IF(1st_profit<0, ABS(1st_profit), 0)
```

---

## Model 3: ROI Calculator (Meta Ads)

```
Impressions = Budget / CPM * 1000
Clicks = Impressions * CTR;  Orders = Clicks * CVR
Revenue = Orders * AOV;  ROAS = Revenue / Budget
CPC = Budget / Clicks;  CPA = Budget / Orders
Profit = Revenue - Budget - (Orders * COGS)
```

---

## Model 4: Revenue Projections

```
Paid Orders = Budget / (CPC / CVR)
Organic Orders = Paid_Orders * Paid_Organic_Ratio
Revenue = Total_Orders * SP;  COGS_total = Total_Orders * Unit_COGS
Net Profit = Revenue - COGS_total - Operating_Expenses - Ad_Spend
```

Strategy: Buy paid traffic at breakeven to accumulate reviews; organic sales spike once reviews hit threshold.

---

## Thresholds

| Metric | Minimum | Source |
|---|---|---|
| Net Profit Margin | >=15% | business-context.md |
| Target Price (Amazon) | >=Rs 1,000 | business-context.md |
| Breakeven ACoS | Must be positive | Derived |
| LTV:CAC ratio | > 3 | Industry standard |
| ROI (2nd order) | > 50% | Derived |
