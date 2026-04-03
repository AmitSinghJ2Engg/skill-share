# Financial Model Reference — Ismokraft

**Source:** `Simple_Financial_Projections_Ismokraft__Corner_Puja_Mandir___CPM_.xlsx`
**Status:** Case study reference. Contains known errors (documented below with corrections).

---

## Unit Economics Formula Chain (canonical)

From the Unit Economics sheet. Master inputs at SP=₹1,200 (₹1,080 after 10% discount), COGS=₹600.

```
SP (₹1,200) → Discount 10% → Net SP (₹1,080)
→ COGS (₹600) = Purchase(₹500) + Transport(₹100)
→ Gross Margin = Net SP - COGS = ₹480 (44.4%)
→ Deductions:
    Marketplace Fees:     ₹20 (size-dependent placeholder)
    Packaging & Shipping: ₹100
    Tax (12% of SP):      ₹129.60
    COD/Gateway (2%):     ₹21.60
    Total Deductions:     ₹271.20
→ Net Profit = ₹480 - ₹271.20 = ₹208.80 (19.3% margin)
→ Investment Cost = COGS + Deductions = ₹871.20
→ ROI = Net Profit / Investment Cost = 23.97%
→ Breakeven ACoS = Net Margin % = 19.3%
→ Target ACoS = Breakeven - Goal(10%) = 9.3% → ₹100.80 CPA
→ LTV = SP × Lifetime Orders(2) = ₹2,160
```

## Key Defaults (from Unit Economics sheet)

| Parameter | Value | Cell |
|---|---|---|
| Discount % | 10% | D6 |
| Tax rate | 12% of SP | D14 |
| COD + Gateway | 2% of SP | D15 |
| Packaging & Shipping | ₹100 | C13 |
| Goal Profit % | 10% | C26 |
| CVR | 2% | C22 |
| CAC Benchmark | 30% of SP | D29 |
| Lifetime Orders | 2 | C43 |

## Bid Optimizer Logic

From Amazon PPC Bid Optimizer section (rows 49-54):
```
If current_acos < (0.84 × target_acos):
    new_bid = current_bid × 1.20     # Scale up 20%
Else:
    new_bid = (current_bid / current_acos) × target_acos    # Proportional reduction
```

## Income Statement Model (16-month projection)

Uses Unit Economics product (₹1,080 SP, ₹600 COGS). Key structure:
- **Marketing budget:** ₹50K/month → ₹195K/month (escalating +₹10K/month)
- **CAC:** Fixed at Target CPA (₹100.80) from Unit Economics
- **Organic ratio ramp:** 0% (M1) → 100% (M12+), modelling review-driven organic growth
- **Cash model:** Cumulative profit, no working capital or payment terms modelled

---

## Known Errors (12 documented)

Critical corrections for anyone building from this model:

### Error #1-2: Post-Marketing ROI denominator (Unit Economics)
Cells C40/D40/C79/D79 use `MarketplaceFees + COGS + CPA` as denominator. Missing Packaging(₹100), Tax(₹129.60), COD(₹21.60). Correct: use `InvestmentCost + CPA`.
- Target ROI: sheet 14.98% → corrected **11.11%**
- Benchmark ROI: sheet -12.20% → corrected **-9.64%**

### Error #3: CPA = ACoS₹ (circular, not wrong)
C32 = CPC/CVR = (ACoS₹ × CVR)/CVR = ACoS₹. CPA always equals Target ACoS ₹. Redundant, not incorrect.

### Error #4-6: Revenue Projections contribution margin (Pocket Knife ₹899)
- F40 labeled "Gross Profit" is actually Contribution Margin (SP - all variable costs)
- F41 allocates marketing cost to sold-only units. Marketing is spent on ALL units regardless of returns
- Correct Total CM = Revenue(post-returns) - ProductCost(all) - Marketing(all) = **-₹11,597** (not +₹9,278)
- Note: F45 (Net P/L = -₹36,597) IS correct despite F41 being wrong

### Error #7-9: Benchmarking table stale values
Hardcoded 0.277 for both CM Ratio (J36) and GP Margin (M18). Should be 10% and 53.3% respectively. Gap assessment inverted.

### Error #11: Income Statement missing cost lines (CRITICAL)
COGS only includes Fulfillment(₹20) + Product(₹600) = ₹620/unit. Missing ₹251.20/unit in Packaging, Tax, COD. Overstates profit by ₹251.20 × orders every month. M16 overstated by ~₹972K.

### Builder guidance
- Use Unit Economics inputs as master source of truth
- Apply corrections #1/#2/#11 for accurate profitability
- Revenue Projections uses different product (₹899 knife vs ₹1,080 CPM) — do not mix
- Income Statement cash model (Row 30) is gross potential, not actual cash position
