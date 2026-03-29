---
name: product-market-intelligence
description: >
  MI- Competitive landscape profiling, BSR trend analysis, review gap mining.
  PROFILE: competitor scan into CompetitorProfile[]. GAPS: review mining for
  differentiation. TRENDS: BSR movement and price tier mapping.
version: "1.0.0"
lifecycle: active
---

# Product Market Intelligence

Profiles competitive landscape and mines review gaps for products promoted to Stage 2. Event-triggered on human promotion decision.

**Boundary:** This skill analyses competitors and markets. It does not score candidates (product-screen), evaluate gates (product-evaluate), or generate keywords (ikraft-keyword-intelligence).

## Modes

| Mode | Input | Output | Downstream |
|---|---|---|---|
| **PROFILE** | product_name + category | `CompetitorProfile[]` (5-10) → CRM | product-evaluate, GAPS |
| **GAPS** | `CompetitorProfile[]` | `GapAnalysis` | product-evaluate (differentiation) |
| **TRENDS** | product_name or category | `CompetitiveLandscape` | PROFILE (context), product-evaluate |

## MODE: PROFILE

Competitive landscape scan for a product. Identify top 5-10 direct competitors across marketplaces.

1. **Amazon India scan**: Page 1 results -- capture ASIN, title, price (INR), BSR, review_count, rating, seller type, listing age.
2. **Amazon US scan**: Same search. Convert prices to INR. Flag products absent from India as opportunity signals.
3. **Etsy scan**: Equivalent products -- listing URL, price, sales_count, favorites, shop rating.
4. **Rank and select** top 5-10 most direct competitors by relevance.
5. **Per-competitor**: price tier, positioning angle, listing quality score, review sentiment themes.
6. **CRM write**: Store summary on Product_Launches record. Full profiles to Confluence.

**Output:** `CompetitorProfile[]` per competitor: competitor_id (`MI-C-{NNN}`), asin/url, title, marketplace, price_inr, bsr, review_count, rating, price_tier, positioning, review_themes[]. Run ID: `MI-P-{YYYYMMDD}-{NNN}`.

## MODE: GAPS

Deep review mining and feature gap analysis from competitor data. Runs after PROFILE.

1. **Review mining**: Top 5 competitors -- analyse 1-star/2-star reviews. Extract: quality issues, missing features, sizing, packaging damage, unmet expectations.
2. **Q&A mining**: Amazon Q&A sections -- unanswered questions and recurring requests.
3. **Feature gap matrix**: Cross-reference complaints across competitors. Gaps in 3+ competitors = strong differentiation signal.
4. **Price tier gaps**: Map prices into tiers. Identify underserved bands in Ismokraft's 800-2000 INR range.
5. **Gap scoring**: Per gap -- frequency, severity, addressability (solvable with wood/craft approach).

**Output:** `GapAnalysis` -- gaps[] (gap_description, frequency, severity, addressability, competitor_evidence[]), price_tier_map, recommended_differentiation_angles[]. Gap run ID: `MI-G-{YYYYMMDD}-{NNN}`.

## MODE: TRENDS

BSR trend analysis and competitive landscape movement over time.

1. **BSR tracking**: For known competitors (from PROFILE), check current BSR vs. stored BSR. Flag significant moves (>20% change).
2. **New entrant detection**: Re-scan category on Amazon India/US. Flag new listings (< 30 days) in the category with early traction (reviews > 5 or BSR < 50,000).
3. **Price movement**: Compare current prices against stored CompetitorProfile[]. Flag price drops > 10% or new price tier entrants.
4. **Seasonal pattern check**: Cross-reference with Google Trends for category. Flag if approaching seasonal peak or trough.

**Output:** `CompetitiveLandscape` -- bsr_movers[], new_entrants[], price_changes[], seasonal_signals[]. Trend run ID: `MI-T-{YYYYMMDD}-{NNN}`.

## Input Validation

| Mode | Required | Block if missing |
|---|---|---|
| PROFILE | product_name + category | No search target |
| GAPS | CompetitorProfile[] from PROFILE | Cannot mine without competitors |
| TRENDS | product_name or category + prior CompetitorProfile[] | No baseline for comparison |

## Halt Conditions

- PROFILE: < 3 competitors found across all marketplaces -> flag thin market, report available data
- GAPS: zero reviews accessible for top competitors -> report gap analysis impossible, suggest manual review
- TRENDS: no prior CompetitorProfile[] stored -> redirect to PROFILE first

## Rules

1. Never invent BSR, review counts, or prices. Unverifiable data = null + data_gap.
2. Source every data point to URL or user export.
3. All writes to CRM `Product_Launches` records. Full profiles stored as Confluence pages.
4. Review mining is read-only analysis. Never post reviews or interact with competitor listings.
5. Price conversions use live exchange rates. Note rate and date used.
6. Data integrity rules from project context apply to all modes.

## Trigger Phrases

MI-, competitive analysis, competitor profile, who are the competitors, market intelligence, review mining, gap analysis, BSR trends, competitive landscape, price tier analysis, new entrants, market scan.