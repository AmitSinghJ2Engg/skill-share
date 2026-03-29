# Product System Architecture v5.0
## Date: 2026-03-27

### Core Changes from v4
1. Multi-marketplace (Amazon IN/US always, Europe/Australia rotate, Etsy, Pinterest)
2. Source-agnostic scoring (BSR is one signal among many, not the primary)
3. Data flow: CRM → Bigin → downstream (no direct Bigin writes)
4. React app reads Bigin, writes to CRM on human approval
5. No local file saves — CRM records + Slack summaries only

---

## Data Flow

```
Scheduled Task (daily 9 AM IST)
  ├─ Step 1: Zone rotation (weighted: Zone 1,2 = 2x; Zone 3-7 = 1x)
  ├─ Step 2: Keyword intelligence (ikraft-keyword-intelligence)
  ├─ Step 3: Multi-marketplace crawl (product-discover BATCH)
  │    ├─ Amazon India (always)
  │    ├─ Amazon US (always)
  │    ├─ Amazon Europe (rotate)
  │    ├─ Amazon Australia (rotate)
  │    ├─ Etsy (always, web search)
  │    └─ Pinterest (always, desktop app or web search)
  ├─ Step 4: Source-agnostic scoring (product-screen SCORE)
  ├─ Step 5: Risk filter + Top-10 report (product-screen REPORT)
  ├─ Step 6: Write to Zoho CRM Product_Launches module
  │    └─ Auto-syncs to Bigin "Product Launches" at "Idea Intake"
  └─ Step 7: Post Slack summary to #product-discovery
```

### Human Review Flow
```
React Dashboard (reads from Bigin)
  ├─ Team sees candidates at "Idea Intake"
  ├─ Reviews scores, source data, differentiation ideas
  ├─ Clicks "Deep Research" → triggers product-discover SINGLE
  ├─ Clicks "Evaluate" → triggers product-evaluate DEEP-EVAL
  ├─ Clicks "Approve to CRM" → React app:
  │    ├─ Updates CRM record (Current_Stage, Gate_1_Decision, etc.)
  │    └─ Updates Bigin record (Stage → "New Request" or "Validated")
  └─ Product enters gate progression workflow
```

---

## Multi-Marketplace Strategy

| Marketplace | Frequency | Mode A (browser) | Mode B (no browser) |
|---|---|---|---|
| Amazon India | Every run | Direct navigation | web_search fallback |
| Amazon US | Every run | Direct navigation | web_search fallback |
| Amazon Europe (.co.uk, .de) | Alternate days | Direct navigation | web_search fallback |
| Amazon Australia | Alternate days | Direct navigation | web_search fallback |
| Etsy | Every run | Direct navigation | web_search |
| Pinterest | Every run | Desktop app if available | web_search |

### Marketplace Rotation for Secondary Markets
Day calculation: (day_of_year - 1) mod 2
- Even days: Amazon Europe (.co.uk)
- Odd days: Amazon Australia (.com.au)

---

## Source-Agnostic Scoring Model

BSR is Amazon-specific. The 8-dimension scoring model uses universal signals.

### Signal Mapping by Platform

| Dimension | Amazon | Etsy | Pinterest | Google |
|---|---|---|---|---|
| Demand Signal | BSR rank in category | Sales count, Favorites | Pin saves, Repins | Search volume (Keyword Planner) |
| Price Point | Listing price → INR | Listing price → INR | n/a | n/a |
| Competition Gap | Review count of top sellers, # of sellers | Review count, shop count | n/a | n/a |
| Trend Strength | n/a | n/a | n/a | Trends 90-day score + direction |
| Social Validation | n/a | Favorites count | Saves, Repins, Board inclusions | n/a |
| Margin Potential | Price vs estimated COGS | Price vs estimated COGS | n/a (no price) | n/a |
| Category Fit | Category match to Ismokraft zones | Category/tag match | Board/pin category match | n/a |
| Differentiation | 1-2 star review gaps, Q&A | Review complaints, missing features | n/a | n/a |

### Scoring Rules
- Each dimension scored 0-12.5, total max 100
- Use the BEST available signal across platforms for each dimension
- If no platform returned data for a dimension → score 0 (not estimated)
- Every score carries: value, source_platform, confidence (HIGH/MEDIUM/LOW/UNKNOWN)
- Score bands unchanged: Strong 75-100, Promising 55-74, Weak 35-54, Reject 0-34

### Common Candidate Schema

Every candidate from any platform normalises to this structure:

```
ProductCandidate {
  candidate_id: string          // PD-{YYYYMMDD}-{0001..NNNN}
  title: string
  source_platform: enum         // amazon_in, amazon_us, amazon_uk, amazon_de, amazon_au, etsy, pinterest
  source_url: string
  source_currency: string       // USD, INR, GBP, EUR, AUD
  price_original: number        // in source currency
  price_inr: number             // converted to INR
  category: string
  zone_id: integer              // 1-7
  
  // Platform-specific signals (null if not available from this platform)
  demand_signals: {
    bsr: integer | null                 // Amazon only
    bsr_category: string | null         // Amazon only
    sales_count: integer | null         // Etsy
    favorites: integer | null           // Etsy
    pin_saves: integer | null           // Pinterest
    search_volume: integer | null       // Google
    signal_source: string
    confidence: enum
  }
  
  competition_signals: {
    review_count: integer | null
    avg_rating: number | null
    seller_count: integer | null        // Amazon
    shop_count: integer | null          // Etsy
    top_seller_reviews: integer | null  // highest review count in top 3
    signal_source: string
    confidence: enum
  }
  
  trend_signals: {
    google_trends_score: integer | null // 0-100
    trend_direction: enum | null        // rising, stable, declining, breakout, unknown
    signal_source: string
    confidence: enum
  }
  
  social_signals: {
    pinterest_saves: integer | null
    etsy_favorites: integer | null
    signal_source: string
    confidence: enum
  }
  
  differentiation_signals: {
    review_gaps: string[] | null        // from 1-2 star reviews
    qa_gaps: string[] | null            // from Q&A section
    missing_features: string[] | null
    signal_source: string
    confidence: enum
  }
  
  // Metadata
  data_completeness_pct: number         // % of non-null fields across all signal blocks
  source_keywords: string[]
  crawl_timestamp: string
  crawl_mode: enum                      // mode_a_browser, mode_b_search, user_paste
}
```

---

## CRM Field Mapping

Target module: `Product_Launches` (custom module)
Only required field: `Name`

| CRM Field (api_name) | Source | Notes |
|---|---|---|
| Name | candidate.title | Required |
| Product_Category | candidate.category | Picklist |
| Target_Platform | candidate.source_platform | Picklist: amazon_in, amazon_us, etsy, etc. |
| Current_Stage | "Idea Intake" | Always for new discovery candidates |
| Market_Size | demand band from scoring | Picklist: High, Medium, Low |
| Competition_Level | competition band from scoring | Picklist: High, Medium, Low |
| Search_Trend | trend_direction | Picklist: Rising, Stable, Declining |
| Opportunity_Score | total_score (0-100) | Integer |
| Avg_Competitor_BSR | demand_signals.bsr | Integer, null for non-Amazon |
| Avg_Competitor_Reviews | competition_signals.review_count | Integer |
| Primary_Keyword_Search_Volume | demand_signals.search_volume | Integer |
| Competitor_Price_Range | derived from crawl | Text, e.g. "800-1500 INR" |
| Target_Selling_Price | candidate.price_inr | Currency |
| Seasonality | risk_filter.seasonality verdict | Picklist |
| Financial_Viability | margin quick check | Picklist |
| Product_Brief | differentiation idea + description | Textarea |
| Opportunity_Analysis_URL | candidate.source_url | Website |
| Launch_Priority | score_band | Picklist: Strong, Promising, Weak |
| Tag | "Zone {N} | {zone_name} | {YYYY-MM-DD}" | Text |
| Bigin_Record_ID | (set by sync) | Auto-populated |

---

## Slack Integration

### Daily Summary Message
Channel: #product-discovery
Timing: After scheduled task completes
Content:
- Date, zone, marketplace coverage
- Keywords generated (count, top 3)
- Candidates found (count by platform)
- Top 5 scored candidates (name, score, platform, price)
- Risk filter results (pass/conditional/fail counts)
- Any halts or data gaps

### Weekly Monitoring Summary
Channel: #product-discovery
Timing: Weekly (product-monitor output)
Content:
- Launched products status
- Anomalies detected
- Winner/failure classifications

---

## Learning Signals Storage

No local files. Two options:
1. CRM Notes: Attach learning signals as a note on a designated "Discovery System" record in Product_Launches
2. Slack Canvas: Update a pinned canvas in #product-discovery with keyword performance data

The scheduled task reads previous learning signals from whichever store is active.
