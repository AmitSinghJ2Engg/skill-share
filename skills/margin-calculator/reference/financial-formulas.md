# Financial Formulas Reference

Core unit economics chain for margin calculation and gate checks.

## Unit Economics Chain

SP = AOV × (1 - Discount%). Selling price after discount.
COGS = Purchase_Cost + Transportation_Cost.
Gross Margin = SP - COGS. Target: > 40%.
Total Deductions = Marketplace Fees + Packaging/Shipping + Tax + COD/Gateway.
Tax = 12% GST × SP (default).
COD/Gateway = 2% × SP (default).
Net Profit = Gross Margin - Total Deductions. Per-unit profit before ad spend.
Net Margin % = Net Profit / SP. Gate 2 threshold: >= 15%.
Breakeven ACoS = Net Margin %. Maximum ACoS before the product loses money.
Target ACoS = Breakeven ACoS - Goal Profit %. ACoS that maintains target profit.
CBFA = Net Profit - Ad Spend Per Unit. Contribution Before Fixed Allocation. Gate 2 threshold: >= 150 INR.

## Defaults

Discount: 10%. Tax rate: 12% GST. COD/Gateway: 2%. Marketplace fee: 20 INR. Packaging/shipping: 100 INR. Goal profit: 10%. CAC benchmark: 30%. CVR: 2%. Lifetime orders: 2.

## Gate 2 Thresholds

Net margin minimum: 15%. CBFA minimum: 150 INR. ACoS maximum: breakeven ACoS (equals net margin %).

## Zero Referral Fee

Products priced <= 1000 INR qualify for zero referral fee on Amazon India (effective 2026-03-16). Strong margin signal for budget-range products.
