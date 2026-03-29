# Ismokraft Product Launch Toolkit — Sheet Reference for AI Context

**Purpose:** This document captures the business logic, scoring models, formulas, and data structures from three working spreadsheets. These sheets represent the tools Ismokraft currently uses manually for product evaluation. The goal is to replace spreadsheet-based workflows with AI-powered artifacts that can evaluate products against these criteria, compute bottom-line projections, and score market opportunities automatically.

**Intended usage in the Launch Suite pipeline:**
1. **Opportunity Sheet** → Early-stage: keyword/niche filtering and demand scoring
2. **Evaluator Sheet** → Testing & planning: landed cost, Amazon fees, margin analysis
3. **Criteria Sheet** → Qualitative fit scoring: brand alignment, risk, operational feasibility
4. *(Financial Model — documented separately in CPM_Financial_Model_Reference.md)*

**Currency:** INR (₹) throughout all sheets unless explicitly marked ($) in the Evaluator.
**Market:** Amazon India (Amazon.in) is the primary channel.

---

## FILE 1: Product Evaluation Criteria Template

**File:** `Product_Evaluation_Criteria___Template.xlsx`
**Sheets:** 2 — `Sheet1` (criteria matrix), `Sheet2` (product registry stub)

### Purpose
Weighted scorecard for qualitative product evaluation. 16 criteria + 1 negative-weight risk criterion. Each scored 1–5, weighted, summed to a total out of 100.

### Scoring Formula
All cells in column G: `=(F{n}/5)*E{n}` — normalizes score to 0–weight range.

### Criteria Table (Template — scores are per-product)

| Row | Criterion | Weight (E) | Sample Score (F) | Weighted (G) |
|-----|-----------|------------|-----------------|--------------|
| 3 | Relevance to Target Audience | 11 | 1 | 2.2 |
| 4 | Uniqueness & Creativity | 11 | 3 | 6.6 |
| 5 | Quality & Durability | 10 | 5 | 10.0 |
| 6 | Brand Alignment | 10 | (empty) | 0 |
| 7 | Scalability & Profit Margins | 11 | (empty) | 0 |
| 8 | Customer Experience & Feedback | 12 | (empty) | 0 |
| 9 | Quality Packaging & Presentation | 5 | (empty) | 0 |
| 10 | Ease of Fulfillment | 5 | (empty) | 0 |
| 11 | Legal & Safety Compliance | 0 | (empty) | 0 |
| 12 | Trend & Seasonality | 5 | (empty) | 0 |
| 13 | Market Demand | 5 | (empty) | 0 |
| 14 | Competitive Advantage | 5 | (empty) | 0 |
| 15 | Vendor Reliability | 5 | (empty) | 0 |
| 16 | Financial Viability | 5 | (empty) | 0 |
| 17 | Product Lifecycle Potential | 5 | (empty) | 0 |
| 18 | Operational Feasibility | 5 | (empty) | 0 |
| 19 | **Risk Level (Negative Weight)** | **-10** | (empty) | 0 |
| 20 | **TOTAL** | **100** | Sum: 9 | **18.8** |

Each criterion includes columns B (Key Questions), C (Truth Indicators), D (How to Compile Data) — these are the rubric for scoring. Full text captured in appendix below.

### Key Design Notes for Builders
- Weights sum to 100 (including -10 for risk = net 100 when risk is 0).
- Legal & Safety has weight 0 — placeholder, not scored.
- Customer Experience has highest weight (12).
- Risk is the only criterion that SUBTRACTS from total.
- Formula `(Score/5)*Weight` means a score of 5 gives full weight, score of 1 gives 20% of weight.

### Criteria Rubric (Key Questions + Truth Indicators)

| Criterion | Key Questions | Truth Indicators |
|-----------|--------------|-----------------|
| Relevance to Target Audience | Fits interests/lifestyles/gifting for target demo? | Commonly purchased by 18–45 in Tier 1 cities. Suitable for gifting occasions. |
| Uniqueness & Creativity | Distinct design? Personalizable? Emotional connection? | At least one feature not in top competitors. Can be personalized or evokes unique emotion. |
| Quality & Durability | Built to last? Feels premium? | Materials tested for sturdiness. No frequent quality complaints. |
| Brand Alignment | Embodies brand values? Complements product lines? | Visually appealing. Customizable for occasions. Minimal setup. |
| Scalability & Profit Margins | Easy to scale supply? Healthy margins? Upselling? | Supplier can scale without major price hikes. Margins meet internal targets. |
| Customer Experience & Feedback | Valuable/memorable? Evidence of positive reception? | Positive test/review data. Low return rates. |
| Packaging & Presentation | Attractive, on-brand, gift-ready? | Arrives in good condition. No additional wrapping needed. |
| Ease of Fulfillment | Easy to store/ship? Fits current logistics? | Standard storage/shipping. Quick to pack, no special tools. |
| Legal & Safety | Compliant with regulations? | Meets local standards. Vendor provides compliance docs. |
| Trend & Seasonality | Trending? Year-round or seasonal? | Stable/increasing search interest. Multi-occasion use. |
| Market Demand | Active searches? Proven market need? | Consistent/rising search volume. Comparable products selling well. |
| Competitive Advantage | Features not widely available? Better in key ways? | At least one USP better than competitors on direct comparison. |
| Vendor Reliability | Responsive, trustworthy, meets lead times? | Responds within agreed time. Delivers on schedule and quality. |
| Financial Viability | COGS/ROI/breakeven make sense? | Breakeven within acceptable timeframe. Margin meets benchmarks. |
| Product Lifecycle | Remains relevant? Can evolve? | Not tied to passing fad. Can update with trends. |
| Operational Feasibility | Manageable with current systems? | Fits current inventory/shipping/support workflows. |
| Risk Level | Supply chain risks? Legal pitfalls? Quality issues? | No legal threats. No supply disruption history. Low defect expected. |

### Sheet2 (Product Registry Stub)
Headers only: Product Name | Vendor Name | Cost Price | Retail Price. No data. Placeholder for product catalog.

---

## FILE 2: Product Bottom-line Evaluator (CPM v1.1.0)

**File:** `Product_Bottom-line_Evaluator__Corner_Puja_Mandir_-v1_1_0.xlsx`
**Sheets:** 7 — `Product Info`, `Initial Launch Costs`, `Shipping costs to Amazon`, `Amazon Fees`, `Margins 1st & 2nd`, `Longterm Bottomline Analysis`, `Fees`
**Design:** Multi-product template (rows 5, 6, 7 = products 1, 2, 3). Only product 1 ("Corner Puja Mandir") is populated. Row 5 is the reference row.

### Architecture
`Product Info` is the master input sheet. All other sheets pull from it and compute downstream. The flow is:

```
Product Info (inputs) ──┬──→ Amazon Fees (size tier + fee calc)
                        ├──→ Shipping costs to Amazon (logistics)
                        ├──→ Initial Launch Costs (one-time setup)
                        │
                        └──→ Margins 1st & 2nd (pulls from all above)
                              └──→ Longterm Bottomline Analysis
                                    └──→ back to Product Info (AI5 units to rank)

Fees sheet = static reference tables (Amazon FBA rates, size tiers, UPS rates)
```

### Sheet: Product Info — Master Inputs (Row 5 = CPM product)

| Cell | Field | Value | Note |
|------|-------|-------|------|
| D5 | Description | Corner Puja Mandir | |
| F5 | Factory Price/Unit | 550 | ₹ |
| G5/H5/I5 | L/W/H (cm) | 20/25/45 | |
| J5 | Weight (kg) | 1.5 | |
| K5 | Target Selling Price | 1200 | ₹ |
| L5 | Sales Price | `=IF(M5="₹",K5-N5,K5-(K5*(N5/100)))` = **1080** | After discount |
| M5 | Discount Type | % | "₹" or "%" |
| N5 | Discount Value | 10 | |
| O5 | Units to Rank (manual) | 15 | Overridden by AI5 if keyword data exists |
| P5 | Units per Master Carton | 50 | |
| Q5 | Sales/day target | 5 | |
| R5 | Mfg Time (days) | 15 | |
| S5 | Shipping Time to Amazon (days) | 5 | |
| T5 | Admin & Other % | 5% | Of factory price |
| U5 | Payment Transfer Fees | 0 | |
| V5 | Clippable Coupon Value | (empty) | Post-rank coupon |
| W5 | Target PPC TACOS % | 12% | |
| X5 | Total Inspection Cost | 2000 | ₹ total, amortized over order qty |
| Y5 | Est Damaged & Return Rate | 2% | |
| Z5 | Other Variable Costs | 0 | |

#### Derived Fields

| Cell | Field | Formula | Value |
|------|-------|---------|-------|
| AA5 | Available for Product Expenses | `=L5-AC5` | 972 |
| AB5 | Actual Profit | `='Margins 1st & 2nd'!M5` | 15.02 |
| AC5 | Target Profit | `=IF(M5="₹",N5,L5*(N5/100))` | 108 |
| AD5–AG5 | Dimensions (inches) / Weight (lbs) | CONVERT functions | 7.87/9.84/17.72/3.31 |
| AH5 | Max Inventory Turns/Year | `=365/(S5+R5+30+10)` | 6.08 |
| AI5 | Units to Rank (auto) | `=IF(LBA!W5>0, LBA!W5, O5)` | 12.6 |

**NOTE on AI5:** Uses keyword CPR data from Longterm Bottomline Analysis W5 if available. The 30+10 in AH5 = 30 days selling buffer + 10 days admin buffer.

### Sheet: Initial Launch Costs (Row 5)

| Cell | Field | Value |
|------|-------|-------|
| F5 | Trademark & Legal | 0 |
| G5 | Product Photo & Design | 3000 |
| H5 | Logo & Package Design | 3000 |
| I5 | Website Setup | 1000 |
| J5 | Molds/Samples | 3000 |
| K5 | Initial PPC Test Budget | 5000 |
| L5 | Launch Service Fees | 1000 |
| M5 | Social Media Ad Fees | 0 |
| N5 | Other Setup Costs | 0 |
| **Total** | **SUM(F5:N5)** | **16,000** |

### Sheet: Amazon Fees (Row 5)

**Size Tier Classification:** Complex nested IF formulas comparing product dimensions against thresholds from Fees sheet. For CPM product: **Large Oversized** (J5=4, all tier tests fail → falls to largest).

| Cell | Field | Value | Note |
|------|-------|-------|------|
| L5 | Referral Fee | 20 | Hardcoded, should be % of SP |
| M5 | Closing Fee | 15 | |
| N5 | Weight Handling Fee | 78 | |
| O5 | Pick Pack Fee | 22 | |
| P5 | Storage Cost/Unit Sold | 12.79 | |
| R5 | Taxes on Fees (18% GST) | `=(L5+M5+N5+O5+P5)*0.18` = 26.60 | |
| W5 | Total Fee excl GST | `=L5+M5+N5+O5+P5` = **147.79** | |
| V5 | Total Fee incl GST | `=W5+R5` = **174.39** | |
| X5 | % of Selling Price | `=W5/L5(ProductInfo)` = **13.68%** | |
| T5 | Est Monthly Units Sold | `=Q5(PI)*30` = 150 | |
| U5 | Avg Inventory Units Stored | `=T5*1.5` = 225 | |
| S5 | Monthly Storage Cost | `=(U5-T5)*30` = 2250 | **⚠ ERROR: unit is unclear. (225-150)*30 = 2250 — likely means ₹2250/month total storage, not per-unit** |

### Sheet: Shipping costs to Amazon (Row 5)

| Cell | Field | Formula | Value |
|------|-------|---------|-------|
| F5 | Total Volume (cbm) | `=dims_in * (2.54^3/100^3) * order_qty` | 3.71 |
| G5 | Total Weight (kg) | `=order_qty * weight` | 247.5 |
| K5 | Air Freight/kg | 350 (hardcoded) | ₹ |
| L5 | Sea Freight/cbm | 20000 (hardcoded) | ₹ |
| O5 | Prep/Labeling per unit | 20 (hardcoded) | ₹ |
| P5 | Domestic Logistic/unit | 70 (hardcoded) | ₹ |
| R5 | Air Freight Total/unit | `=((K5*G5)+M5+(O5*qty))/qty` | 552.27 |
| S5 | Sea Freight Total/unit | `=((L5*F5)+N5+(O5*qty))/qty` | 476.06 |
| T5 | Cheapest Freight/unit | `=MIN(R5:S5)` | 476.06 (sea) |

**Landed Cost per Unit formulas (U5/V5/W5):** These are the critical cost-build-up formulas:

```
U5 (Domestic Landed) = Prep(20) + DomesticLogistic(70) + FactoryPrice(550) 
    + (Admin% * FactoryPrice)(27.5) + (InspectionCost + OtherVar + TransferFees)/qty(12.12)
    + (ReturnRate * qty * FactoryPrice)/qty(11) 
    = 690.62

V5 (Sea Landed) = UPS_rate(3.25) + SeaFreight/unit(476.06) + FactoryPrice(550)
    + AdminCost(27.5) + Amortized_OneTime(12.12) + ReturnCost(11)
    = 1079.93

W5 (Air Landed) = UPS_rate(3.25) + AirFreight/unit(552.27) + FactoryPrice(550)
    + AdminCost(27.5) + Amortized_OneTime(12.12) + ReturnCost(11)
    = 1156.14
```

### Sheet: Margins 1st & 2nd (Row 5)

**2nd Order Margins (steady-state, no launch costs):**

| Cell | Field | Formula | Value |
|------|-------|---------|-------|
| F5 | Total Product Cost/unit | `=DomesticLanded(690.62) + AmazonFees(147.79) + PPC(12%*1080=129.6) + Coupon(0*0.4)` | 968.01 |
| G5 | Gross Margin/unit | `=SalesPrice(1080) - F5` | 111.99 |
| H5 | Profit % | `=G5/SalesPrice` | 10.37% |
| I5 | ROI % | `=G5/F5` | 11.57% |
| J5 | Total Profit/Loss per order | `=order_qty(165) * G5` | 18,478 |
| K5 | Total Profit/Loss per year | `=1stOrderProfit + (MaxTurns-1) * 2ndOrderProfit` | 96,409 |

**1st Order Margins (includes launch cost amortization):**

| Cell | Field | Formula | Value |
|------|-------|---------|-------|
| L5 | Total Product Cost/unit | `=DomesticLanded + AmazonFees + LaunchCosts/qty + PPC` | 1064.98 |
| M5 | Gross Margin/unit | `=1080 - 1064.98` | **15.02** |
| N5 | Profit % | `=M5/1080` | **1.39%** |
| P5 | Total 1st Order Profit | `=165 * 15.02` | 2,478 |

**⚠ NOTE on V5 (Coupon):** Formula includes `V5*0.4` where V5 is clippable coupon value. The 0.4 multiplier appears to mean 40% of customers use the coupon. Currently V5 is empty, so this term is 0.

**⚠ NOTE on L5 (1st Order):** Uses `Shipping!V5` (sea landed, 1079.93) instead of `U5` (domestic, 690.62) for 1st order. This is intentional — first shipment assumed to be imported via sea.

### Sheet: Longterm Bottomline Analysis (Row 5)

| Cell | Field | Formula | Value |
|------|-------|---------|-------|
| F5 | Min Price for 20% Margin | `=2ndOrderCost/0.8` | 1210.01 |
| G5 | Target SP for 100% ROI | `=2ndOrderCost*2` | 1936.02 |
| I5 | Min Price for 30% Margin | `=2ndOrderCost/0.7` | 1382.87 |
| J5 | Target SP for 150% ROI | `=2ndOrderCost*2.5` | 2420.03 |
| L5 | Recommended Order Qty | `=(MfgTime+ShipTime+10)*DailySales + UnitsToRank` | 165 |
| M5 | Recommended Capital (2x) | `=L5*DomesticLanded*2` | 227,905 |
| N5 | Min Capital (1.5x) | `=L5*DomesticLanded*1.5` | 170,929 |
| O5 | 30% Factory Deposit | `=(L5*FactoryPrice)*0.3` | 27,225 |
| P5 | Balance Needed | `=L5*DomesticLanded*1.5 + LaunchCosts` | 186,929 |
| R5/T5/V5 | Keyword CPR targets | 5/5/8 (hardcoded) | |
| W5 | Est Sales to Rank | `=(R5+T5+V5)*0.7` | 12.6 |

**NOTE on L5 formula:** Row 5 uses `+10` buffer, rows 6+ use `+40`. This is inconsistent — likely 10 was a test value, 40 is the intended buffer.

### Sheet: Fees (Static Reference)

Amazon FBA fee schedule (US-based rates as of June 2021). Contains:
- Size tier thresholds (Small Standard through Special Oversize)
- FBA fulfillment fees per tier
- Storage fees by quarter (Standard vs Oversize)
- UPS inbound shipping estimates per tier
- Factory-to-USA freight estimates (Sea: $60/cbm, Air: $4/kg)

**⚠ CRITICAL: These are US Amazon (FBA) fees, not Amazon.in fees. The Amazon Fees sheet L5:P5 uses hardcoded Indian values (₹20 referral, ₹78 weight handling, etc.) which override the US fee schedule for the actual calculation. The Fees sheet is used only for UPS rate lookups and size tier classification logic.**

---

## FILE 3: Product Opportunity Test Template (v1.1.0)

**File:** `Product_Opportunity_Test_Template_-_v_1_1_0.xlsx`
**Sheets:** 8 — `Before You Start`, `Overview`, `Opportunity Basics`, `Opportunity Test`, `Customer Feedback`, `X-Ray Insight Calculator`, `Market Landscape`, `Observation Checklist`
**Design:** Indian Amazon market. Multi-keyword evaluation template with sample data for ~16 product keywords.

### Sheet: Before You Start (Advisory — text only)

**Products to Avoid:** Fashion (returns), Electronics (defects), Supplements (certifications), Seasonal (inventory risk).
**Products to Look For:** Differentiable niches, poor competitor listings, future growth potential.
**Keywords to Look For:** Long-tail sub-niches, consistent search volume, not trendy.

### Sheet: Opportunity Basics — Niche Scoring Engine

**Purpose:** Score product keywords across 7 dimensions. Each keyword gets a NICHE SCORE (col D) = sum of individual ratings.

#### Scoring Rubrics (formula patterns in row 10+)

| Dimension | Column (input) | Column (rating) | Scoring Logic | Max |
|-----------|---------------|-----------------|---------------|-----|
| Sales (demand) | G (Avg Sales) | H | 0→100: 0, 101→500: 4, 501→1000: 8, 1001→2000: 12, >2000: 16 | 16 |
| Search Volume | I | J | 0→5K: 0, 5K→10K: 2, 10K→20K: 4, 20K→30K: 8, >30K: 10 | 10 |
| Search Trend | K (text) | L | Going down: 0, Erratic: 2, Steady: 4, Going up: 8, Spiking: 10 | 10 |
| # Relevant Products | M | N | 0–2: 0, 3–5: 16, 6–15: 12, 16–20: 8, 21–24: 4, >24: 0 | 16 |
| Avg Reviews (competition) | O | P | 1–200: 16, 201–350: 12, 351–500: 8, 501–750: 4, >750: 0 | 16 |
| Sales Profit Ratio | S (AvgSP) / T (AvgFBA) | V = `SP/FBAFee` | Raw ratio, not bucketed | ~3–5 |
| Differentiability | W (text) | X | Low: 4, Medium: 8, High: 12, Incredible: 16 | 16 |

**NICHE SCORE** (D) = `=SUM(H,J,L,N,P,V,X)` — **Max theoretical ≈ 84+ratio**

Additional input columns (not scored): F (Avg BSR), Q (Avg Rating), R (Avg Revenue), Y–AF (4 related keywords with CPR values), AG (Size S/H), AI–AL (Trendster interest).

#### ⚠ ERROR — Column V (Sales Profit Ratio) is mislabeled and incorrectly computed

**Label:** "Avg SALES PROFIT RATIO"
**Formula:** `=IF(ISNUMBER(S/T), S/T, 0)` = AvgSellingPrice / AvgFBAFee
**Problem:** This is a price-to-fee ratio, NOT a profit ratio. Profit ratio should be `(SP - FBAFee - COGS) / SP` or similar. The current formula rewards high prices regardless of cost structure.
**Impact:** Adds 2–5 points to niche score for what is essentially a pricing multiple, not profitability. Low-impact since the value is small relative to the 16-point dimensions.

#### ⚠ ERROR — Column U (Avg Sales Profit)

**Formula:** `=S-T` (AvgSP - AvgFBAFee)
**Label:** "Avg SALES PROFIT"
**Problem:** This is gross revenue minus Amazon fees only — it excludes COGS, shipping, PPC. It's a fee margin, not sales profit. Fine as a rough filter but the label misleads.

#### Sample Data (populated keywords, rows 10–25)

| Keyword | Niche Score | Decision | Sales | Search Vol | Trend | Reviews | Differentiation |
|---------|-------------|----------|-------|------------|-------|---------|----------------|
| bathroom cabinet (sample) | 42.5 | — | 432 | 93,791 | Erratic | 893 | Incredible |
| bathroom cleaning brush electric | 36.6 | y | 70 | 3,809 | Steady | 55 | — |
| toilet paper holder | 38.9 | y | 381 | 11,383 | Steady | 528 | High |
| self adhesive bathroom shelf | 42.2 | y | 587 | 4,434 | Steady | 1,360 | Incredible |
| karambit knife | 26.0 | y | 200 | 3,754 | Erratic | 45 | — |
| broom holder wall mounted | 30.5 | y | 744 | 4,005 | Going up | 1,036 | — |

### Sheet: Opportunity Test — Page 1 Analysis

**Purpose:** For shortlisted keywords, evaluate if you can rank on Page 1 by analyzing top 16 listings across 5 related keywords.

#### Score Formula per keyword
`K{n} = -C + D - E + F + G + H - I + J`

Where (all counts out of top 16 listings):
- C: Products aged >24 months (negative — established = harder)
- D: Products with <500 reviews (positive — weak competitors)
- E: Review velocity >10 OR <1 (negative — extremes are bad)
- F: Products with rating <4 (positive — room to improve)
- G: Products with sales >300 (positive — demand proven)
- H: Products with BSR <10000 (positive — active category)
- I: Dominating sales/brands (negative — monopoly risk)
- J: Products with LES <7 (positive — poor listing quality = opportunity)

**Aggregate per product:** 5 keywords × score, summed in K16/K22/K28/K34/K40.

| Product | KW1 Score | KW2 | KW3 | KW4 | KW5 | Total | Go? |
|---------|-----------|-----|-----|-----|-----|-------|-----|
| toilet paper holder | 42 | 43 | 44 | 41 | 42 | **212** | Y |
| portable jet spray | 27 | 24 | 27 | 24 | 24 | **126** | N |
| bathroom shelf | 38 | 36 | 34 | 36 | 38 | **182** | Y |
| broom holder | 34 | 35 | 36 | 41 | 36 | **182** | N |
| karambit knife | 40 | 34 | 35 | 36 | 45 | **190** | Y |

### Sheet: Customer Feedback — Review Analysis

**Purpose:** Capture pain points from competitor reviews and document how your product will differentiate. Template for up to 5 products, 2 columns each (Pain Points | How Your Product Stands Out).

Only "toilet paper holder" (actually bathroom cabinet based on content) has data — 22 pain points documented including: broken mirrors, poor packaging, narrow shelves, loose magnets, poor plastic quality. Differentiation responses documented for each.

### Sheet: X-Ray Insight Calculator

**Purpose:** Paste Helium 10 X-Ray data for top 16 products from a keyword search. Auto-calculates summary metrics.

**Headers (Row 1):** ASIN, URL, Image URL, Brand, Price₹, Sales, Revenue, BSR, Fees₹, Active Sellers, Ratings, Review Count, Images, Review Velocity, Buy Box, Category, Size Tier, Fulfillment, Dimensions, Weight, Creation Date

**Calculated columns:**
- X: Sales to Review ratio = `=G/O` (Sales ÷ Review Velocity)
- Y: Reviews per 100 Sales = `=100/X`

**Summary (Row 20):** COUNTIF formulas matching the Opportunity Test criteria:
- Reviews <500, Review velocity outliers, Rating <4, Sales >300, BSR <10000, Dominating sales (>900), Low listing quality (Images <6)

### Sheet: Market Landscape

**Purpose:** Document top 10 competitors per product keyword + top 25 keywords from Cerebro analysis. Columns: ASIN, Avg Rev 1 Year, Sale Trend, Sale Price, Product Cost, Net, Margin%, ROI%.

Mostly template — only competitor ASINs and keyword lists populated from Opportunity Test cross-references.

### Sheet: Observation Checklist — Final Go/No-Go Scoring

**Purpose:** 34-item weighted checklist across 4 categories. Yes/No answers, scored with `=IF(D{n}="YES",E{n},0)`. Supports 2 products side-by-side (columns D–G and H–K).

#### Categories and Weights

| Category | Items | Max Score | Key Criteria |
|----------|-------|-----------|-------------|
| Market (rows 5–13) | 8 | 28 | 10+ daily sales, BSR <5K, 50K+ searches, Google Trends stable, <5K indexed products |
| Competitive Landscape (14–19) | 5 | 19 | No famous brands in top 3, <50 review products on P1, <800 reviews in top 3, improvement opportunities |
| Product (20–30) | 10 | 34 | Not restricted, bundleable, >₹1500 price, brandable, giftable, recurring purchases, year-round, simple |
| Sourcing (31–36) | 4+2NA | 19 | Standard size, not fragile, >35% margin, test-order possible |
| **Total** | **27 scored** | **100** | |

**Score interpretation (C39):**
- <40: Be cautious
- 40–60: Medium opportunity
- 60+: Good opportunity

**Sample data (bathroom cabinet):** Score = **62/100** (Good opportunity)

#### Listing Optimization Checklist (rows 41–48) — not scored
7-item checklist: 5+ images, 250+ word description, product specs, 5+ bullets, good keywords, keyword-rich title, compare top 5 competitors.

#### PPC Campaign Checklist (rows 50–53) — not scored
3 items: Early reviewer program, giveaways/email, run PPC campaigns.

---

## CROSS-FILE RELATIONSHIP MAP

```
Opportunity Test Template (market research phase)
  ├── Opportunity Basics → Niche viability scoring (demand, competition, trends)
  ├── Opportunity Test → Page 1 rankability analysis
  ├── Customer Feedback → Competitor pain points & differentiation strategy
  ├── Market Landscape → Competitor revenue & keyword mapping
  ├── Observation Checklist → Final go/no-go scoring (62/100 = good)
  │
  ▼ SHORTLISTED PRODUCT
  │
Evaluation Criteria Template (qualitative fit)
  ├── 16 weighted criteria → Total weighted score out of 100
  ├── Rubric provides structured evaluation questions
  │
  ▼ PRODUCT APPROVED
  │
Bottom-line Evaluator (financial viability)
  ├── Product Info → Master inputs (price, dimensions, costs, targets)
  ├── Amazon Fees → Size tier + fee calculation
  ├── Shipping → Landed cost per unit (domestic/sea/air)
  ├── Margins 1st & 2nd → Profit per order, per year
  ├── Longterm Analysis → Min prices, capital requirements, order quantities
  │
  ▼ FINANCIALLY VIABLE
  │
Financial Model (CPM_Financial_Model_Reference.md)
  ├── Unit Economics → Per-unit profitability (1st & 2nd order)
  ├── Revenue Projections → Single-month P&L with sensitivity
  ├── Income Statement → 16-month projection with organic growth
```

---

## ERROR SUMMARY FOR BUILDERS

| # | File | Location | Issue | Corrected Logic |
|---|------|----------|-------|-----------------|
| 1 | Evaluator | Amazon Fees S5 | Monthly Storage = `(225-150)*30` = 2250. Unit unclear — is this total ₹ or per-unit? | Likely total monthly storage cost in ₹. Per-unit would be S5/T5. Clarify before building. |
| 2 | Evaluator | Amazon Fees L5 | Referral Fee hardcoded at ₹20. Amazon.in referral is typically 5–15% of SP (₹54–162 for ₹1080). | ₹20 is way too low. Should be `=SP * referral_rate%`. For home category ~8% = ₹86.4 |
| 3 | Evaluator | Fees sheet | FBA fee schedule is US-based (June 2021). Not applicable to Amazon.in. | Only used for UPS rate lookups. Indian fees are hardcoded in Amazon Fees sheet. But Indian hardcoded fees should be verified against current Amazon.in fee schedule. |
| 4 | Evaluator | Longterm L5 vs L6 | L5 uses `+10` day buffer, L6+ uses `+40`. Inconsistent. | Use consistent buffer. 40 appears to be intended default. |
| 5 | Evaluator | Margins L6/M6 rows 6–7 | Multiple #REF!, #NUM!, #DIV/0! errors | Template formulas in rows 6–7 have broken references. Only row 5 works. Template needs repair for multi-product use. |
| 6 | Evaluator | ProductInfo BB15 | Orphan formula `=REPLACE("ttt",,,"uuu")` → #VALUE! | Junk cell. Delete. |
| 7 | Opportunity | Basics V (col) | Labeled "Avg SALES PROFIT RATIO" but formula is `SP/FBAFee` | This is a price-to-fee ratio, not profit ratio. Rename or fix formula to include COGS. |
| 8 | Opportunity | Basics U (col) | Labeled "Avg SALES PROFIT" but formula is `SP - FBAFee` | This is fee margin, not profit. Missing COGS, shipping, PPC. |
| 9 | Opportunity | Basics N scoring | #Relevant Products: 3–5 gets 16 (best), 6–15 gets 12 | Counter-intuitive: very few relevant products (3–5) scores highest. This penalizes niches with moderate competition. Intentional design choice (sweet spot = few competitors with proven demand), but should be documented for AI consumption. |
| 10 | Criteria | E19 (Risk) | Weight = -10. Formula `=(F19/5)*(-10)` means score of 5 = -10 penalty | Correct behavior. High risk score = high penalty. But a score of 0 = no penalty (not "low risk"), so the scale is 0 (no risk assessed) to -10 (maximum risk). |
| 11 | Evaluator | Margins F5 | Includes `V5*0.4` (coupon × 40% redemption rate) | Currently 0 because V5 is empty. When coupon is set, this reduces margin. The 40% redemption rate is hardcoded — should be a configurable input. |