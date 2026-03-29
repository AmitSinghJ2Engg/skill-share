# Ismokraft — Corner Puja Mandir (CPM) Financial Model Reference

**Source file:** `Simple_Financial_Projections_Ismokraft__Corner_Puja_Mandir___CPM_.xlsx`
**Sheets:** 4 — `Unit Economics`, `ROI Calculator`, `Revenue Projections - Current M`, `Income Statement - Monthly`
**Currency:** INR (₹). No symbols in cells.
**Status:** Working draft. Contains formula and structural errors documented below with corrections.

---

## PRODUCT CONTEXT

This workbook models three different products/scenarios. They are NOT the same product.

| Sheet | Product | Price (AOV) | COGS | Channel |
|-------|---------|-------------|------|---------|
| Unit Economics | Generic CPM product | ₹1,200 (SP ₹1,080 after 10% discount) | ₹600 | Amazon/marketplace |
| ROI Calculator | Higher-ticket variant or bundle | ₹2,000 | Not modeled | Meta Ads funnel |
| Revenue Projections | 11-in-1 Pocket Knife (SKU 7377633563) | ₹899 | ₹420 | Meta Ads |

Unit Economics is the **canonical source** for shared constants (CVR, Goal Profit %, Lifetime Orders, CAC). Income Statement uses Unit Economics product. Revenue Projections uses the knife product but pulls CVR/Goal/Lifetime from Unit Economics.

---

## SHEET 1: Unit Economics

Per-unit profitability for one product. Two sections: **First Order** (paid acquisition) and **Second Order** (repeat purchase).

### First Order — Inputs (hardcoded)

| Cell | Label | Value | Note |
|------|-------|-------|------|
| C5 | Price / AOV | 1200 | List price before discount |
| D6 | Discount % | 10% | Of price |
| C8 | Purchase Cost | 500 | |
| C9 | Transportation Cost | 100 | |
| C12 | Marketplace Fees | 20 | Size/weight dependent — placeholder |
| C13 | Avg Packaging & Shipping | 100 | |
| D14 | Tax Rate | 12% | Of SP |
| D15 | COD + Payment Gateway | 2% | Of SP |
| C22 | Conversion Rate (CVR) | 2% | |
| C26 | Goal Profit % | 10% | Target net margin |
| D29 | CAC Benchmark % | 30% | Of SP — industry standard |
| C43 | Lifetime Orders/Customer | 2 | |

### First Order — Derived (formulas)

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| C6 | Discount ₹ | `=C5*D6` | 120 |
| C7 | Selling Price (SP) | `=C5-C6` | 1,080 |
| C10 | COGS | `=C9+C8` | 600 |
| C11 | Gross Margin ₹ | `=C7-C10` | 480 |
| D11 | GM % | `=(C7-C10)/C7` | 44.44% |
| C14 | Tax ₹ | `=D14*C7` | 129.6 |
| C15 | COD ₹ | `=D15*C7` | 21.6 |
| C16 | Total Other Deductions | `=C12+C13+C14+C15` | 271.2 |
| C17 | Net Profit ₹ | `=C11-C16` | 208.8 |
| D17 | Net Profit Margin % | `=C17/C7` | 19.33% |
| C18 | Investment Cost | `=C10+C16` | 871.2 |
| C19 | Recheck | `=C18+C17` | 1,080 (validation: equals SP) |
| C20 | ROI | `=C17/C18` | 23.97% |

### First Order — CAC Analysis

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| C25 | Breakeven ACoS % | `=D17` | 19.33% |
| C27 | Target ACoS % | `=C25-C26` | 9.33% |
| C28 | Target ACoS ₹ | `=C7*C27` | 100.8 |
| C29 | Benchmark CAC ₹ | `=D29*C7` | 324 |
| C30 | CAC Difference | `=C28-C29` | -223.2 |
| C34 | Target CPC | `=C28*C22` | 2.016 |
| D34 | Benchmark CPC | `=C29*C22` | 6.48 |
| C32 | Target CPA | `=C34/C22` | 100.8 |
| D32 | Benchmark CPA | `=D34/C22` | 324 |

**⚠ ERROR — C32 is circular:** C32 = C34/C22 = (C28×C22)/C22 = C28. CPA always equals ACoS₹. The CPC→CPA derivation adds nothing — C32 just equals C28. Not functionally wrong, but misleading. CPA and "Target ACoS ₹" are the same number.

### First Order — ROAS & Post-Marketing

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| C36 | ROAS (Target) | `=C7/C32` | 10.71 |
| D36 | ROAS (Benchmark) | `=C7/D32` | 3.33 |
| C37 | Breakeven ROAS (Target) | `=C7/(C32+C10)` | 1.54 |
| D37 | Breakeven ROAS (Bench) | `=C7/(D32+C10)` | 1.17 |
| C39 | Post-Mkt Profit (Target) | `=C17-C32` | 108 |
| D39 | Post-Mkt Profit (Bench) | `=C17-D32` | -115.2 |
| C40 | Post-Mkt ROI (Target) | `=C39/(C12+C10+C32)` | 14.98% |
| D40 | Post-Mkt ROI (Bench) | `=D39/(C12+C10+D32)` | -12.20% |

**⚠ ERROR — C40/D40 denominator is wrong:** Formula uses `MktFees(20) + COGS(600) + CPA` = 720.8. Missing Pkg/Shipping(100), Tax(129.6), COD(21.6). Correct denominator = total investment = `C18 + CPA` = 871.2 + CPA.

| | Sheet Value | Corrected |
|--|-------------|-----------|
| C40 (Target ROI) | 14.98% | `108 / (871.2 + 100.8)` = **11.11%** |
| D40 (Bench ROI) | -12.20% | `-115.2 / (871.2 + 324)` = **-9.64%** |

### First Order — LTV

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| C44 | LTV | `=C7*C43` | 2,160 |
| C46 | LTV/CAC (Target) | `=C44/C32` | 21.43 |
| D46 | LTV/CAC (Bench) | `=C44/D32` | 6.67 |

### Amazon PPC Bid Optimizer (Rows 49–54)

| Cell | Label | Value/Formula |
|------|-------|---------------|
| C51 | Current ACOS | 40 (input) |
| C52 | Cost Per Click | 5.49 (input) |
| C53 | Target ACOS | 12 (input) |
| C54 | New MAX Bid | `=IF(C51<(0.84*C53), 1.2*C52, (C52/C51)*C53)` = 1.647 |

Logic: If current ACOS < 84% of target → scale bid up 20%. Otherwise → proportionally reduce bid.

### Second Order Economics (Rows 56–79)

Identical structure to first order. All product costs reference first-order inputs. Key difference:

| | First Order | Second Order |
|--|-------------|--------------|
| CAC | 100.8 (target) / 324 (bench) | **10 (hardcoded C75/D75)** |
| Post-Mkt Profit | 108 / -115.2 | **198.8** |
| ROAS | 10.71 / 3.33 | **108** |

**⚠ SAME ERROR — C79/D79 denominator:** Uses `C65+C63+C75` (MktFees+COGS+CAC = 630). Should be `C71+C75` (Investment Cost + CAC = 881.2).

| | Sheet Value | Corrected |
|--|-------------|-----------|
| C79 (ROI) | 31.56% | `198.8 / 881.2` = **22.56%** |

---

## SHEET 2: ROI Calculator

Ad spend ROI simulator. "Current Case" + 4 months (M1–M4). All months use identical inputs — no variation modeled.

### Structure per column (B=Current, E=M1, H=M2, K=M3, N=M4)

| Row | Metric | Input/Formula | Value |
|-----|--------|---------------|-------|
| 2 | Amount Spent | 50,000 (B2 hardcoded, others ref it) | 50,000 |
| 3 | CPM | 350 (B3/E3 hardcoded, others chain) | 350 |
| 4 | Impressions | `=Spend/CPM*1000` | 142,857 |
| 5 | CTR | 0.5% (B5 hardcoded) | 0.5% |
| 6 | Clicks | `=IMP*CTR` | 714.3 |
| 7 | CPC | `=Spend/Clicks` | 70 |
| 8 | CR | 1% (B8 hardcoded) | 1% |
| 9 | AOV | 2,000 (B9 hardcoded) | 2,000 |
| 10 | Purchases | `=Clicks*CR` | 7.14 |
| 11 | CAC | `=Spend/Purchases` | 7,000 |
| 12 | Revenue | `=AOV*Purchases` | 14,285.7 |
| 13 | ROI | `=Revenue/Spend` | 0.2857 |

**⚠ NOTE — "ROI" here = Revenue÷Spend, not profit-based.** Value 0.29 means ROAS < 1 — this is a **loss scenario**. Every ₹1 spent returns only ₹0.29 in revenue.

---

## SHEET 3: Revenue Projections - Current M

Single-month P&L for "Ultimate 11-in-1 Adventure Pocket Knife" (₹899). Includes revenue, costs, CLTV analysis, and benchmarking.

### Inputs

| Cell | Label | Value |
|------|-------|-------|
| B8 | Price | 899 |
| B9 | Marketplace Fees | 0 |
| B10 | Avg Shipping | 100 |
| B11 | Purchase Cost | 320 |
| F2 | Meta Ad Budget/month | 50,000 |
| F4 | Operating Cost/month | 25,000 |
| F17 | Return Estimate % | 20% |
| F51 | Customer Lifespan (yrs) | 1 |

### Cross-sheet refs

| Cell | Source | Value |
|------|--------|-------|
| B29 (Goal Profit) | `='Unit Economics'!C26` | 10% |
| B31 (CVR) | `='Unit Economics'!C22` | 2% |
| B42 (Lifetime Orders) | `='Unit Economics'!C43` | 2 |

### Derived — Unit Economics

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| B15 | Product Costs | `=B10+B11` | 420 |
| B16 | Gross Profit/unit | `=B8-B15` | 479 |
| B17 | GP % | `=B16/B8` | 53.28% |
| B21 | Breakeven ACoS % | `=B17` | 53.28% |
| B30 | Target ACoS % | `=B21-B29` | 43.28% |
| B32 | Target CPA | `=B8*B30` | 389.1 |
| B33 | Target CPC | `=B32*B31` | 7.782 |
| B38 | Post-Mkt Profit/unit | `=B16-B36` | 89.9 |
| B39 | Post-Mkt ROI | `=B38/(B9+B15+B36)` | 11.11% |

### Derived — Revenue

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| F8 | Est ACoS % | `=B30` | 43.28% |
| F9 | CVR | `=B31` | 2% |
| F10 | ACoS ₹/unit | `=F8*F15` | 389.1 |
| F11 | Avg CPC | `=F10*F9` | 7.782 |
| F3 | Est Sales from budget | `=ROUND(F2/F10,0)` | 129 |
| F15 | SP/unit | `=B8` | 899 |
| F16 | Sale Estimate | `=J4` | 129 |
| F19 | Total Revenue | `=F15*F16` | 115,971 |
| F17 | Return % | 20% (hardcoded) | |
| F20 | Revenue after Returns | `=(1-F17)*F19` | 92,776.8 |

### Derived — Costs

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| F26 | Cost/unit | `=B15` | 420 |
| F27 | Marketing Cost/unit | `=F10` | 389.1 |
| F29 | Total Var Cost/unit | `=F26+F27` | 809.1 |
| F30 | Total Variable Costs | `=F29*F16` | 104,373.9 |
| F32 | Operating Cost | `=F4` | 25,000 |
| F34 | Total Costs incl Ads | `=F32+F30` | 129,373.9 |

**⚠ NOTE — J10 rounding mismatch:** J10 (Total Ad Spend) = `F27*F16` = 389.1×129 = 50,193.9, but actual budget F2 = 50,000. The ₹193.9 gap comes from rounding in F3 (129 units × 389.1 ≠ 50,000). Minor but causes J11 (ROI on Ad Spend) to use derived spend, not actual budget.

### Derived — Profitability

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| F39 | Units After Returns | `=(1-F17)*F16` | 103.2 |
| F40 | "Gross Profit/unit" | `=F15-F29` | 89.9 |
| F41 | "Gross Profit after Returns" | `=F40*F39` | 9,277.68 |
| F43 | Revenue (post-returns) | `=F15*F39` | 92,776.8 |
| F44 | Total Costs | `=F34` | 129,373.9 |
| F45 | Net P/L | `=F43-F44` | **-36,597.1** |

**⚠ ERROR — F40 label is wrong:** F40 = SP - (Product Cost + Marketing Cost). This is **Contribution Margin per unit**, not Gross Profit.

**⚠ ERROR — F41 formula is materially wrong:** `F40*F39` = ContribMargin × UnitsSold. This applies marketing cost to only 103.2 sold units. But marketing was spent on ALL 129 units (you pay for ads whether or not customer returns).

Correct calculation:
```
Revenue (post-returns):     899 × 103.2 = 92,776.8
Product cost (all units):   420 × 129   = 54,180.0
Marketing cost (all units): 389.1 × 129 = 50,193.9
Contribution:               92,776.8 - 54,180.0 - 50,193.9 = -11,597.1
```

| | Sheet Value | Corrected |
|--|-------------|-----------|
| F41 | 9,277.68 | **-11,597.1** |

Cross-check: F45 (Net P/L) = -36,597.1 = Contribution(-11,597.1) - Operating(25,000) = -36,597.1 ✓. The final net P/L is actually correct because F45 uses `Revenue(post-returns) - ALL costs(on all units)`. The error is isolated to F41.

### J37 (Total Contribution Margin) — cascading error

J37 = `J35 × J21` = F40 × F16 = 89.9 × 129 = **11,597.1**. Uses all units with the per-unit margin. Contradicts F41 (9,277.68) for the same concept. Neither is correct — correct Total CM = **-11,597.1** (revenue post-returns minus all variable costs on all units).

### Benchmarking Table

| Cell | Metric | Sheet Value | Correct Value | Note |
|------|--------|-------------|---------------|------|
| M18/J36 | Gross Profit Margin / CM Ratio | 0.277 (hardcoded) | **10% (CM)** or **53.3% (GP)** | Stale. J36 label says "CM/SP" → should be F40/F15 = 10%. M18 label says "Gross Profit Margin" → should be B17 = 53.3%. Either way, 0.277 is wrong. |
| N18 | Industry Standard | 30–40% | — | This benchmark is for GP margin, so M18 should be 53.3% (above standard, not below) |
| O18 | Gap | "Below" | **"Above"** | Follows from corrected M18 |
| M22 | ROI on Ads | 4.62 | ✓ numerically | Label says "ROI on Ads" but value is CLTV/CAC ratio from F54, not ad spend ROI |

### CLTV vs CAC

| Cell | Label | Formula | Value |
|------|-------|---------|-------|
| F49 | Avg Purchase Value | `=F15` | 899 |
| F50 | Purchase Frequency | `=B42` | 2 |
| F52 | CLTV | `=F49*F50*F51` | 1,798 |
| F53 | CAC | `=F10` | 389.1 |
| F54 | CLTV/CAC | `=F52/F53` | 4.62 |

---

## SHEET 4: Income Statement - Monthly

16-month projection (M1–M16). Uses Unit Economics product (₹1,080 SP). Models escalating ad spend + organic growth ramp.

### Strategy (text in rows 1–4)
- Buy paid traffic to accumulate reviews, even at breakeven
- Once reviews hit threshold → organic sales spike
- Bottleneck: inventory capital as volume grows

### Assumptions (Rows 35–47)

**Marketing Budget (Row 37):** M1=50,000, M2=55,000, then +10,000/month → M16=195,000.

**CAC (Row 38):** All months = `='Unit Economics'!$C$32` = **100.8** (Target CPA, not benchmark).

**Paid Orders (Row 39):** `=ROUND(Budget/CAC, 0)`. Range: 496 → 1,935.

**Organic Ratio (Row 41):**

| M1 | M2 | M3 | M4–M11 | M12–M16 |
|----|----|----|--------|---------|
| 0% | 2% | 5% | +10%/month (15%→85%) | 100% |

**Organic Orders (Row 42):** `=ROUND(Paid × Ratio, 0)`. Range: 0 → 1,935.

**Total Orders (Row 43):** `=Paid + Organic`. Range: 496 → 3,870.

### Income Statement Lines

| Row | Line | Formula Pattern | Per Unit |
|-----|------|-----------------|----------|
| 10 | Net Revenue | `=Orders × 'UE'!$C$7` | 1,080 |
| 13 | Amazon Fulfillment | `=Orders × 'UE'!$C$12` | 20 |
| 14 | Clearco Payback | `=Revenue × $B$14` (B14=0) | 0 (disabled) |
| 15 | Product COGS | `='UE'!C10 × Orders` | 600 |
| 16 | Total COGS | `=SUM(13:15)` | 620 |
| 18 | Gross Profit | `=Revenue - COGS` | 460 |
| 19 | GP % | `=GP/Revenue` | 42.59% (constant) |
| 22 | Advertising | `=Row 37 (Budget)` | varies |
| 24 | Post-Marketing Profit | `=GP - Ads` | varies |
| 25 | Profit % | `=PostMkt/Revenue` | 33.3%→37.9% |

**⚠ ERROR — Income Statement is missing cost lines.** COGS only includes Fulfillment(20) + Product(600) = 620/unit. The Unit Economics model deducts 4 additional costs that are absent here:

| Missing Cost | Per Unit ₹ | M1 Impact (×496) | M16 Impact (×3,870) |
|--------------|-----------|-------------------|---------------------|
| Packaging & Shipping | 100 | 49,600 | 387,000 |
| Tax (12% of SP) | 129.6 | 64,281.6 | 501,552 |
| COD + Gateway (2% of SP) | 21.6 | 10,713.6 | 83,592 |
| **Total Missing** | **251.2** | **124,595.2** | **972,144** |

Corrected M1 Post-Marketing Profit: 178,160 - 124,595 = **53,565** (vs sheet's 178,160).
Corrected M16 Post-Marketing Profit: 1,585,200 - 972,144 = **613,056** (vs sheet's 1,585,200).

The sheet overstates profit by ₹251.2 per unit across all months.

### Cash Management (Row 30)

Starting cash B30 = 50,000. Each month: `=Prior + Post-Marketing Profit`. Cumulative, no working capital or payment terms.

M16 sheet value: 13,122,380. Significantly overstated due to missing cost lines above.

### Inventory (Rows 45–47) — placeholder, not active

| Row | Purpose | Status |
|-----|---------|--------|
| 45 | Purchase orders | All zeros |
| 46 | Arrivals | `=Purchase from 3 months prior` (3-month lead time) — all zero/None |
| 47 | Running total | `=Prior - Orders + Arrivals` — goes to -32,603 |
| 32 | Inventory Investment ₹ | `=Row45 × 'UE'!$C$10` (COGS per unit) — all zeros |

Row 33 (Financing): empty placeholder.
Row 14 (Clearco Payback): B14=0%, disabled. Set % to activate revenue-share repayment from M5.

### Monthly Summary (sheet values, NOT corrected for missing costs)

| | M1 | M6 | M12 | M16 |
|--|-----|------|------|------|
| Orders | 496 | 1,272 | 3,076 | 3,870 |
| Revenue | 535,680 | 1,373,760 | 3,322,080 | 4,179,600 |
| COGS | 307,520 | 788,640 | 1,907,120 | 2,399,400 |
| GP | 228,160 | 585,120 | 1,414,960 | 1,780,200 |
| Ads | 50,000 | 95,000 | 155,000 | 195,000 |
| Post-Mkt Profit | 178,160 | 490,120 | 1,259,960 | 1,585,200 |
| Cumulative Cash | 228,160 | 1,884,520 | 7,270,820 | 13,122,380 |

---

## CROSS-SHEET DEPENDENCY MAP

```
Unit Economics (source of truth)
  ├── C7  (SP=1080)           → Income Statement Row 10 (Revenue)
  ├── C10 (COGS=600)          → Income Statement Row 15 (Product) + Row 32 (Inventory)
  ├── C12 (MktFees=20)        → Income Statement Row 13 (Fulfillment)
  ├── C22 (CVR=2%)            → Revenue Projections B31
  ├── C26 (Goal Profit=10%)   → Revenue Projections B29
  ├── C32 (Target CPA=100.8)  → Income Statement Row 38 (CAC, all months)
  └── C43 (Lifetime Orders=2) → Revenue Projections B42

Revenue Projections (standalone single-month deep dive)
  ├── Own product inputs (899/420) — NOT connected to Income Statement
  └── Pulls CVR, Goal%, Lifetime from Unit Economics

Income Statement (multi-month projection)
  └── Fully driven by Unit Economics product (1080/600/20)
```

---

## ERROR SUMMARY FOR BUILDERS

| # | Location | Issue | Corrected Logic |
|---|----------|-------|-----------------|
| 1 | UE C40/D40 | Post-Mkt ROI denom = `C12+C10+CPA`. Missing Pkg(100), Tax(129.6), COD(21.6) | Use `C18+CPA` (= Investment Cost + CPA). Corrected Target ROI = **11.11%**, Bench = **-9.64%** |
| 2 | UE C79/D79 | Same as #1 in Second Order section | Use `C71+C75` (= 881.2). Corrected ROI = **22.56%** |
| 3 | UE C32 | Circular: CPA = CPC/CVR = (ACoS₹×CVR)/CVR = ACoS₹. Always equals C28 | Not wrong, just redundant. CPA ≡ Target ACoS ₹ |
| 4 | RP F40 | Labeled "Gross Profit per Unit" | Actually **Contribution Margin** (SP minus ALL variable costs incl marketing) |
| 5 | RP F41 | `=F40×F39` allocates marketing cost to sold units only. Marketing is spent on ALL units regardless of returns | Correct = Revenue(post-returns) - ProductCost(all) - Marketing(all) = **-11,597.1** not 9,277.68. Note: F45 (Net P/L = -36,597.1) IS correct |
| 6 | RP J37 | `=J35×J21` = 89.9×129 = 11,597.1. Contradicts F41 (9,277.68) for same concept | Both wrong. Correct Total CM = **-11,597.1** |
| 7 | RP J36/M18 | Hardcoded 0.277. J36 label = "CM Ratio = CM/SP". M18 label = "GP Margin" | J36 should be F40/F15 = **10%**. M18 should be B17 = **53.3%**. 0.277 matches neither |
| 8 | RP O18 | Benchmark gap = "Below" (vs 30-40% industry GP) | If corrected M18 = 53.3% GP, gap should be **"Above"** |
| 9 | RP M22 | Labeled "ROI on Ads" | Value is CLTV/CAC ratio (4.62), not ad spend ROI |
| 10 | RP J10 | Ad spend = F27×F16 = 50,193.9 vs actual budget F2 = 50,000 | Rounding artefact from F3. Use F2 for actual budget |
| 11 | IS Rows 13–15 | COGS = 620/unit. Missing Pkg/Ship(100), Tax(129.6), COD(21.6) = **251.2/unit** | Add cost rows or adjust. Sheet overstates profit by 251.2 × orders every month |
| 12 | IS Row 30 | Cash = cumulative profit. No working capital, receivables, inventory outflow | Treat as gross potential, not actual cash |

When building from this model: use Unit Economics inputs as master, apply corrections #1/#2/#11 for accurate profitability, and note F45 in Revenue Projections IS correct despite F41 being wrong.