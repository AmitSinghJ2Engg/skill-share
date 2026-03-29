# Business Domain Map — Ismokraft

**Version:** 1.5
**Date:** 2026-03-28
**Purpose:** Defines all business domains, their boundaries, data handoffs, build priority, CRM architecture, artifact standards, scheduled tasks, and integration specs. This is the reference for Claude Cowork to build the operational system without drifting. Lives in Git — not a project knowledge file.

**Companion documents:**
- `01-system-constraints.md` — hard platform limits (plugin size, artifact sandbox, MCP list)
- `03-implementation-standards.md` — how every component (skill, plugin, artifact, project, task) is built and named
- `04-data-schemas.md` — ⚠ TO BE CREATED — full JSON schemas for all data types produced by skills

---

## Current State

Ismokraft is **pre-revenue**. The only active business flow is **Product Launches** — finding, evaluating, testing, and sourcing products for Amazon India and Shopify.

All other domains (marketing, fulfillment, finance, customer support) are **future**. The system design accommodates them now but does not build them yet.

---

## Domain Map

### Domain 1: Product Discovery & Evaluation (BUILD NOW)

**What it does:** Finds product opportunities, scans trends, profiles competitors, scores and evaluates deeply, generates product brief, runs pre-test unit economics, checks compliance feasibility, produces go/no-go decisions.

**Pipeline stages covered (Bigin):** Stage 0 (Trend & Signal Feed — pre-pipeline, automated daily task) → Stage 1 (Idea Intake) → Stage 2 (Market Research — includes competitive profiling, pre-test unit economics, compliance feasibility check) → Gate 1

**Skills involved:**
- `ikraft-keyword-intelligence` — generates daily seed keywords; scans for rising search velocity and emerging category signals. Meta ad library scan as optional additional source for Shopify-relevant products.
- `product-discover` — crawls Amazon marketplace, returns ProductCandidate[]. Daily scheduled task.
- `product-screen` — scores, ranks, filters to top-10
- `product-market-intelligence` — Stage 2: competitive landscape profiling, BSR trend analysis, review gap mining, competitive gap score. Event-triggered on records promoted to Stage 2 by human. Produces CompetitorProfile[].
- `product-evaluate` — deep 16-criteria evaluation, gate checks, ideation
- `margin-calculator` (ESTIMATE mode) — pre-test cost estimation using category benchmarks and assumed landed costs; generates CostEstimate as baseline for Domain 2.5 comparison
- `compliance-ops` (FEASIBILITY mode) — checks applicable certifications per product category, estimates timeline in weeks, risk level. Category only — no spec needed.

**Data produced:**
- TrendSignal[] (emerging categories, rising keywords, seasonal opportunities — automated daily output)
- ProductCandidate[] (discovery output)
- CompetitorProfile[] (top 5–10 competitors: ASIN, price, BSR, review count, review gaps, listing weaknesses)
- ScoredCandidate[] (screening output)
- ResearchRecord (deep evaluation — stored as Confluence page linked from CRM)
- CostEstimate (pre-test: estimated unit cost, landed cost, target selling price, rough break-even ACoS)
- ComplianceFeasibility (applicable certs per category, estimated weeks per cert, risk: LOW / MEDIUM / HIGH)
- Gate 1 result (CBFA, break-even ACoS, competitive gap score, compliance feasibility check, pass/fail)

**Data consumed from:**
- Project context (`financial-constants.json`, `gate-criteria.json`, `zone-rotation.json`)
- CRM (existing Product_Launches records for duplicate checking)
- External signals (Google Trends, Amazon BSR movement, seasonal calendars)
- Domain 4 (FeedbackSignals — read from ISM_Learnings CRM module at session start, applied to scoring weights)

**Stage 2 promotion (human decision with AI insight):** All products in Stage 1 (Idea Intake) are visible in the Discovery Dashboard. For each product, the artifact displays an AI-generated promotion insight panel:
- **Viability signal:** Composite score from ScoredCandidate data (demand strength, competition level, brand fit, margin potential)
- **Risk flags:** Any data gaps, anomalies, or concerns that need attention before promotion
- **Recommendation:** AI suggests PROMOTE / INVESTIGATE FURTHER / SKIP with reasoning
- The human sees all products and makes the promotion decision — AI provides context, not the decision. There is no automatic filtering to "top 10." Every candidate is visible with its insight panel.

**Human gate:** Gate 1 pass/fail — human approves in Discovery Dashboard before CRM record advances to Stage 2a.

**Kill path:** Gate 1 fail → (1) artifact warning panel shown, (2) CRM Note written with reason + data snapshot, (3) Slack alert to #ism-launch-alerts → CRM record moves to Bigin Rejected → KillRecord written to ISM Execution Logs.

**Park path:** Human can tag Product_Launches record as `Parked: true` at any stage. Product stays at current Bigin stage. Unparked at any time. Discovery Dashboard shows parked products with a distinct badge.

**Hands off to:** Domain 1.5 (Gate 1 pass products with CompetitorProfile[], CostEstimate, ComplianceFeasibility via CRM)

**Artifact:** Discovery Dashboard (tabs layout)
- Left nav panel: product list — all products active in last 7 days, searchable, filterable by stage and parked status
- Header: AI context panel — insights and suggestions relevant to selected product and current stage
- Right panel tabs: Pipeline Funnel | Today's Results | Product Detail | Gate Review
- Actions: Gate 1 pass/fail approval, Slack notification trigger, CRM update trigger

---

### Domain 1.5: Competitive Positioning & Differentiation (BUILD NOW — runs after Gate 1)

**What it does:** Takes Gate 1 pass products, analyses review gap findings, defines how the product stands out before sourcing cost is committed. Produces differentiation scenarios, selects winning angle, crystallises USP flowing into manufacturing spec, test listing, and final listing copy.

**Pipeline stages covered (Bigin):** Stage 2a (Differentiation Scenarios) → Stage 2b (USP Formation) → handoff to Domain 2

**Skills involved:**
- `product-market-intelligence` — deep competitor review mining, feature gap analysis, price tier mapping
- `product-evaluate` — ideation sub-mode, differentiation scoring

**Data produced:**
- DifferentiationScenario[] (5–7 differentiation paths: material upgrade, feature addition, bundle angle, price tier shift, audience pivot)
- SelectedScenario (chosen path with rationale — stored as Confluence page)
- USPStatement (1-sentence positioning + 3 proof points + target buyer profile)
- PositioningBrief (competitor landscape, gaps exploited, differentiation path, USP, messaging angle — stored as Confluence page)

**Data consumed from:**
- Domain 1 (CompetitorProfile[], ResearchRecord, Gate 1 pass product)
- Project context (`brand-rules.md`)
- CRM (Product_Launches record)

**Human gate:** SelectedScenario is human-approved — Claude generates 3–5 scenario cards in Positioning Workbench, human selects one.

**Hands off to:** Domain 2 (SelectedScenario + PositioningBrief); Domain 2.5 (USPStatement for test listing); Domain 3 (USPStatement for final listing)

**Artifact:** Positioning Workbench (wizard/stepper layout — enforces sequential flow)
- Header: AI context panel with market positioning insights
- Step 1: Competitor landscape review
- Step 2: Differentiation scenario cards (AI-generated, human selects one)
- Step 3: USP builder (AI-assisted, human refines)
- Step 4: PositioningBrief preview and export to Confluence + CRM
- Uses real-time Claude API for generating differentiation scenarios and USP copy

---

### Domain 2: Sourcing & Vendor Management (BUILD NEXT)

**What it does:** Queries existing Vendors CRM module for category match before external search. Finds new suppliers, evaluates at two scoring tiers (global VendorScore + Product-Vendor Fit Score), generates specs and RFQs, manages sample procurement. Initiates compliance process in parallel. Performs QC inspection before dispatch.

**Pipeline stages covered (Bigin):** Stage 3 (Test Sourcing — activity: supplier discovery, queries existing Vendors module first) → Stage 4 (Test Listing — activity: sample procurement + QC inspection + compliance initiation) → handoff to Domain 2.5

> **Note:** Stage names "Test Sourcing" and "Test Listing" are the canonical Bigin API names per `01-system-constraints.md` §8. The activities described here happen within those stages.

**Skills involved:**
- `product-spec` — converts evaluated product into manufacturing spec, BOM, supplier brief, PRD; incorporates SelectedScenario. Canva design request for packaging mockup.
- `supplier-intelligence` — queries Vendors CRM module first (category match, global score filter), then runs external search (IndiaMART, TradeIndia, factory directories + additional sources per Claude's expertise). Returns ranked vendor list.
- `vendor-ops` — two-tier scoring: (1) updates global VendorScore in Vendors module, (2) creates Product-Vendor Fit Score in Vendor_Evaluations linked to both Vendors record and Product_Launches record. RFQ generation.
- `margin-calculator` (ACTUAL mode) — unit economics against confirmed supplier quote; updates CostEstimate from Domain 1 with real numbers
- `compliance-ops` (INITIATION mode) — generates compliance brief per product category + spec; triggers Jira ticket creation via CRM activity → Bigin task activity → Jira "ismo scrum" board (existing automation). Management may be internal or external — ticket owner tracks it.

**Data produced:**
- ProductSpec (dimensions, materials, BOM, finish, packaging, compliance notes — incorporates SelectedScenario; packaging mockup request sent to Canva)
- SupplierBrief (brief document stored in Confluence: ISM/Vendor Intelligence/Supplier Research/)
- VendorScore + Grade (A-F) in Vendors CRM module (global, reusable across products)
- Product-Vendor Fit Score (in Vendor_Evaluations, linked to Product_Launches + Vendors)
- ConfirmedVendorRecord (confirmed supplier: Vendors module record ID, name, contact, MOQ, lead time, payment terms)
- RFQ document
- MarginRecord (actual per-unit profitability from confirmed supplier quote)
- PricingStrategy (launch price, floor price, target price tier vs. competitors)
- SampleConfirmation (QC status: PASS / FAIL / WAIVED. Rule: WAIVED only if Domain 2.5 testing mode = data-buying AND human approves override. Conversion testing mode requires PASS.)
- ComplianceRecord (certs applicable, Jira ticket IDs per cert, owner, initiated date, expected completion dates)

**Data consumed from:**
- Domain 1 (ResearchRecord, CostEstimate, CompetitorProfile[])
- Domain 1.5 (SelectedScenario, PositioningBrief)
- Project context (`financial-constants.json`, `pipeline-config.json`)
- CRM (Product_Launches record, Vendors module, Vendor_Evaluations records)

**Stage exit checklists (enforced by Sourcing Workbench — artifact disables advance until met):**
- Stage 3 (Test Sourcing) exit: ≥ 2 potential suppliers identified. Manufacturing cluster can produce the product. Estimated lead time ≤ 45 days.
- Stage 4 (Test Listing) exit: Vendor Grade ≥ C. Sample received and quality approved (QC self-inspection checklist PASS). COGS confirmed within target margin.

**Human gate:** SampleConfirmation dispatch approval — human reviews QC result in Sourcing Workbench and approves or rejects before sample ships.

**Kill path:** If no vendor passes evaluation → (1) artifact warning, (2) CRM Note, (3) Slack alert → CRM to Rejected → KillRecord in ISM Execution Logs.

**Hands off to:** Domain 2.5 (SampleConfirmation + MarginRecord + PricingStrategy + ProductSpec + ConfirmedVendorRecord + ComplianceRecord)

**Artifact:** Sourcing Workbench (tabs layout)
- Left nav: product list (7-day window, filterable)
- Header: AI context panel with sourcing insights and vendor suggestions
- Tabs: Vendor Search | Evaluation (global + fit scores) | RFQ Generator | QC & Dispatch
- Actions: sample dispatch approval, CRM write triggers

---

### Domain 2.5: Market Testing & Scale Decision (BUILD AFTER FIRST SAMPLE ARRIVES)

**What it does:** Dispatches factory samples to Amazon FBA. Runs structured paid ad tests (data-buying or conversion testing mode). Analyses results, compares against pre-test estimates. Checks compliance timeline. Makes commit/don't-commit decision. Gate 2 pass triggers Source to Pay pipeline.

**Pipeline stages covered (Bigin):** Stage 5 (FBA Sample Dispatch → Paid Testing — 1–3 weeks) → Stage 6 (Results Analysis + Pre/Post Cost Comparison + Compliance Timeline Check → Scale Decision) → Gate 2

**Testing modes:**
- **Data-buying mode** — collects impression, CTR, keyword ranking data. Market signal goal. QC WAIVED permitted.
- **Conversion testing mode** — measures actual CVR, ACoS, purchase behaviour. Unit economics validation. QC PASS mandatory.

**Test execution framework:**

Phase 1 (Data-buying): Run auto campaigns for 7-10 days. Goal is keyword discovery — which keywords Amazon associates with the product. Low budget. Output: keyword list with impression/CTR data.

Phase 2 (Conversion testing): Run manual campaigns targeting Phase 1 keywords. Larger budget. Goal is actual CVR and ACoS per keyword to validate bottom-line economics.

**Test stopping and data quality:**
- Tests always run their configured duration (`duration_days` in `testing-config.json`). No early auto-stop.
- After each phase completes, the analysis rates data quality as HIGH / MEDIUM / LOW based on volume collected in the given time:
  - HIGH: Sufficient data across enough keywords to make confident margin decisions
  - MEDIUM: Directional signal present but some keywords lack volume
  - LOW: Insufficient data to draw conclusions
- If data quality is LOW, Test Lab B surfaces an `extend_recommended: true` flag with suggested extension period (`max_extension_days` from config).
- Extension is always human-approved — never automatic.

**Keyword-level bottom-line validation:**
- Human exports PPC Search Term Report from Seller Central as CSV
- Imports into Test Lab B artifact (via papaparse CSV import)
- Test Lab B + real-time Claude analyzes at keyword level: at this keyword's actual CPC and CVR, does the product make margin?
- The Gate 2 decision is NOT "did we get enough impressions" — it is "across all viable keywords, is there enough volume at viable unit economics for bulk economics to work?"
- `testing-config.json` contains: `duration_days` per mode, `data_quality_thresholds` (volume benchmarks for HIGH/MEDIUM/LOW rating), `max_extension_days`

**Seller Central manual steps** (no MCP integration): creating the test listing, setting up FBA inbound shipment plan in Seller Central are done by team. Guided by the **Seller Central Operations artifact** (see "Launch & Ops" project). Fulfillment-ops creates the Zoho records; team does Seller Central manually. Note: Zoho Inventory is connected to Seller Central as a selling channel — order data flows automatically once live.

**Skills involved:**
- `ads-ops` (TEST mode) — test campaign setup: budget caps, bid strategy, duration, mode selection
- `margin-calculator` (COMPARISON mode) — post-test: CostEstimate (D1) vs. MarginRecord (D2) vs. TestActuals; generates CostingScenarios
- `product-monitor` (TEST mode) — BSR movement, review velocity, return rate, conversion data during test window
- `fulfillment-ops` (SAMPLE mode) — creates Zoho Inventory Package record, Zoho Books shipping expense entry, generates FNSKU labeling guide and inbound shipment checklist

**Data produced:**
- TestPlan (mode, budget/week, duration, targeting, success thresholds — human-approved before any spend)
- TestListingDraft (basic listing copy from USPStatement — baseline for Domain 3 content-writer; stored in Confluence: ISM/Product Launch Factory/Test Results/)
- TestResults (impressions, CTR, CVR, ACoS, BSR movement, units sold, ROAS by week, by mode)
- CostComparison (D1 CostEstimate vs. D2 MarginRecord vs. TestActuals)
- CostingScenarios (3–5 bulk scenarios at different MOQ/price: break-even, target, stretch)
- ComplianceTimelineCheck (ComplianceRecord.expectedCompletionDate vs. ScaleDecision.launchTimeline — PASS / WARNING / BLOCK)
- ScaleDecision (commit/don't commit; if commit: quantity, target landed cost, max MOQ, launch timeline)
- Gate 2 result (CVR/ACoS meets CostingScenario thresholds + ComplianceTimelineCheck PASS or human-accepted WARNING)

**Data consumed from:**
- Domain 2 (SampleConfirmation, MarginRecord, PricingStrategy, ProductSpec, ConfirmedVendorRecord, ComplianceRecord)
- Domain 1 (CostEstimate)
- Domain 1.5 (USPStatement)
- Project context (`testing-config.json`, `gate-criteria.json`, `financial-constants.json`)
- CRM (Product_Launches record)

**Stage exit checklists (enforced by Test Lab artifacts — disable advance until met):**
- Stage 5 (Paid Testing) exit: Title + 5 bullets + description complete. Main image + 6 lifestyle images ready. Backend keywords set. TestPlan approved.
- Stage 6 (Scale Decision) exit: Keyword-level bottom-line validation complete. CostComparison generated. ComplianceTimelineCheck performed.

**Human gates:**
- TestPlan approval — before any ad spend is committed
- ScaleDecision / bulk commit (Gate 2) — highest-stakes decision in the pipeline

**Kill path:** Gate 2 fail or don't commit → (1) artifact warning, (2) CRM Note, (3) Slack alert to #ism-launch-alerts → CRM to Rejected → KillRecord in ISM Execution Logs.

**Hands off to:** Domain 3 (ScaleDecision, CostingScenarios, TestResults, TestListingDraft, confirmed bulk specs). Gate 2 pass also triggers **Source to Pay pipeline record** in Bigin.

**Artifacts:** Test Lab is split into two artifacts to stay within 2,000-line limit.
- **Test Lab A** — Plan + Run (wizard/stepper: Mode Selection → Budget & Targeting → TestPlan Approval → Live Test Tracker with daily metrics)
- **Test Lab B** — Analyze + Decide (tabs: Cost Comparison | CVR Analysis | Compliance Timeline | Costing Scenarios | Scale Decision). Uses real-time Claude API for scale decision analysis and scenario recommendations.
- Both: left nav product list, header AI context panel

---

### Domain 3: Listing & Launch Preparation (BUILD AFTER DOMAIN 2.5)

**What it does:** Initiates bulk order. Creates Amazon India and Shopify listings (starting from TestListingDraft). Manages compliance to completion. Defines review strategy. Prepares platform setup. Source to Pay pipeline runs in parallel.

**Pipeline stages covered (Bigin):** Stage 7 (Bulk Order Initiation — spawns Source to Pay pipeline, main pipeline continues independently) → Stage 8 (Final Listing — Amazon + Shopify) → Stage 9 (Compliance) → Gate 3 → Stage 10 (Platform Setup) → Stage 11 (Product Live)

**Shopify parallel track:** Domain 3 produces two listings for the same product. Fulfillment via Amazon MCF (FBA stock) for now. Multi-warehouse flexibility is a future concern.

**Seller Central manual steps:** Platform Setup (Stage 10) involves Seller Central configuration that is team-executed. Guided by the **Seller Central Operations artifact**. Zoho Inventory is connected to Seller Central as a selling channel — inventory syncs automatically once inbound shipment is processed.

**Canva usage:** `content-writer` generates design briefs for Canva: A+ content image layouts, Shopify product imagery requirements. Human executes in Canva. Canva designs linked from CRM record.

**Skills involved:**
- `content-writer` (AMAZON mode + SHOPIFY mode) — starts from TestListingDraft baseline, not from scratch. AMAZON: title, bullets, description, A+ content copy, backend keywords. SHOPIFY: product title, description, SEO meta.
- `capital-planner` — inventory planning, cash flow, launch capital. Uses ComplianceRecord.expectedCompletionDate to set realistic launch date.
- `compliance-ops` (COMPLETION mode) — monitors Jira cert tickets to completion, generates Gate 3 checklist, confirms all certs in hand.
- `fulfillment-ops` (BULK mode) — when bulk order arrives: Zoho Inventory Package record + Zoho Books shipping expense + FNSKU labeling guide + bulk inbound checklist.

**Data produced:**
- AmazonListingCopy (from TestListingDraft + USPStatement — stored in Confluence: ISM/Product Launch Factory/Research Records/)
- ShopifyListingCopy (from TestListingDraft + USPStatement)
- CanvaBrief (A+ content image layout specs, Shopify imagery requirements)
- ReviewStrategy (email sequence timing, Vine eligibility, early reviewer targeting — manual execution; Zoho Desk automation is future)
- ComplianceCompletionRecord (all cert numbers, issuing bodies, expiry dates; Jira tickets closed)
- LaunchCapitalPlan (inventory investment, working capital, launch ad budget, cash flow timeline)
- Gate 3 result (all certifications obtained, pass/fail)

**Data consumed from:**
- Domain 2.5 (ScaleDecision, CostingScenarios, TestResults, TestListingDraft)
- Domain 2 (ProductSpec, ConfirmedVendorRecord, PricingStrategy, ComplianceRecord)
- Domain 1.5 (USPStatement)
- Project context (`listing-standards.json`, `compliance-requirements.json`, `brand-rules.md`)
- CRM (Product_Launches record)

**Stage exit checklists (enforced by Launch Control — disable advance until met):**
- Stage 7 (Bulk Order): Source to Pay pipeline record created. PO raised in Zoho Books.
- Stage 8 (Final Listing): Final listing live and indexed. Both Amazon and Shopify listings approved.
- Stage 10 (Platform Setup): Seller Central configured (shipping templates, tax settings, return policy, Brand Registry). Inventory received at FBA warehouse. Launch PPC campaign configured.

**Human gates:**
- Amazon listing copy approval
- Shopify listing copy approval
- Gate 3 compliance sign-off (all certs confirmed in hand)

**Kill path:** Gate 3 fail → (1) artifact warning, (2) CRM Note, (3) Slack alert → CRM to Rejected → KillRecord in ISM Execution Logs.

**Hands off to:** Domain 4 (AmazonListingCopy, ShopifyListingCopy, LaunchCapitalPlan, ReviewStrategy)

**Artifact:** Launch Control (tabs layout)
- Left nav: product list (7-day window)
- Header: AI context panel with launch readiness insights
- Tabs: Listing Copy (Amazon + Shopify) | Compliance Tracker | Capital Plan | Go-Live Readiness
- Actions: listing approval, Gate 3 sign-off, Canva brief export

---

### Domain 4: Post-Launch Operations (BUILD WHEN PRODUCTS GO LIVE)

**What it does:** Monitors live performance, manages ad campaigns, executes review strategy, tracks revenue via Razorpay settlements, handles returns. Produces HandoffPackage for operations team. Runs kill workflow with learning extraction. Feeds learning back to Domain 1 via ISM_Learnings.

**Pipeline stages covered (Bigin):** Stage 11 (Product Live) → Published

**Razorpay data:** Settlement reports and refund data are read via Razorpay MCP to populate PLStatement and ReturnsReport. Exact available endpoints to be confirmed via MCP probe (see Known Gaps).

**Zoho Analytics:** Domain 4 performance data is surfaced in Zoho Analytics views for dashboards and pipeline-level reporting. Analytics workspace config in `analytics-config.json`.

**Skills involved:**
- `product-monitor` (LIVE mode) — BSR tracking, review velocity vs. ReviewStrategy targets, return rates, anomaly detection
- `ads-ops` (LIVE mode) — PPC campaign management, ACoS analysis, scale/pivot/kill decisions
- `revenue-ops` — sales reporting, Razorpay settlement reconciliation, P&L
- `ism-learning-engine` — triggered on CampaignVerdict: kill. Extracts which Domain 1 criteria predicted or failed to predict the outcome. Writes to ISM_Learnings CRM module (CustomModule17, ID: 645926000009174006). Scheduled task picks up and updates Git context files.

**Data produced:**
- PerformanceRecord[] (BSR, reviews, ad metrics, returns — vs. ReviewStrategy targets)
- CampaignVerdict (scale / pivot / reprice / kill)
- RepricingDecision (trigger: competitor repricing, Buy Box loss, promotional window, margin drift. Output: recommended price, floor price, ceiling price, rationale, duration if promotional. Not ad-related pricing — separate from ads-ops ACoS decisions.)
- SalesReport, ReturnsReport, PLStatement
- HandoffPackage (sales velocity, current stock level, reorder formula, recommended next order quantity, ConfirmedVendorRecord, lead time — operations team may supplement from their own sources)
- FeedbackSignals (written to ISM_Learnings CRM module — picked up by daily learning synthesis task → Git → Project Knowledge)
- ShopifyCustomerSignal (future — when Shopify launches: purchase history, repeat rate, lifetime value. Feeds future product decisions. Not active until Shopify order volume warrants.)

**Data consumed from:**
- Domain 3 (live listing, launch data, ReviewStrategy, LaunchCapitalPlan)
- Amazon Seller Central (manual data entry or future API)
- Razorpay MCP (settlements, refunds)
- Zoho Analytics (aggregated performance views)
- CRM (Product_Launches post-launch fields)

**Human gate:** CampaignVerdict: kill is human-approved in Operations Dashboard.

**Kill path:** kill approved → (1) artifact warning, (2) CRM Note, (3) Slack alert to #ism-launch-alerts → CRM to Bigin Rejected → KillRecord in ISM Execution Logs → `ism-learning-engine` triggered → FeedbackSignals written to ISM_Learnings → daily task synthesizes → Git updated → operator deploys to Project Knowledge.

**Hands off to:** Domain 1 (FeedbackSignals via ISM_Learnings → learning synthesis loop); Operations Team (HandoffPackage via CRM + clipboard export)

**Artifact:** Operations Dashboard (tabs layout)
- Left nav: product list (active live products)
- Header: AI context panel with performance insights and ad recommendations
- Tabs: Performance | Ad Campaigns | Revenue & P&L | Review Velocity | HandoffPackage
- Zoho Analytics views embedded or linked for pipeline-level reporting

---

### Domain 5: Marketing & Brand (BUILD WHEN SCALING)
Content marketing, social media, email, SEO. Skills: `content-writer` (RESEARCH + WRITE modes), `ads-ops` (PLAN mode). **Placeholder — not active.**

### Domain 6: Customer Support (BUILD WHEN ORDER VOLUME WARRANTS)
Ticket management, buyer messages, returns. Tech: Zoho Desk (MCP connected). **Placeholder — not active.**

### Domain 7: Finance & Accounting (BUILD WHEN REVENUE STARTS)
GST, invoices, settlements, P&L. Tech: Zoho Books + Zoho Inventory (MCP connected). **Placeholder — not active.**

---

## Source to Pay Pipeline

Separate Bigin pipeline triggered at Gate 2 pass (ScaleDecision = commit). Linked to same Product_Launches CRM record as main pipeline. Main pipeline continues through Stages 7–11 independently.

**Pipeline name:** Source to Pay
**Trigger:** Gate 2 pass — artifact approval button writes commit decision → Claude calls MCP → creates Source to Pay pipeline record in Bigin

| # | Stage | Owner | System Action |
|---|---|---|---|
| 1 | PO Raised | Founder | Zoho Books Purchase Order created via MCP |
| 2 | Deposit Paid | Founder | Zoho Books payment entry; CRM updated |
| 3 | Production Started | Supplier | CRM status update |
| 4 | QC Inspection | Founder (self-inspection) | Self-inspection checklist completed with photos, linked to ProductSpec. CRM QC result logged. |
| 5 | Shipment Booked | Founder | Carrier + shipment details in CRM |
| 6 | Goods Arrived | Warehouse | Zoho Inventory receipt created via MCP |
| 7 | FBA Inbound Created | Founder | `fulfillment-ops` BULK: Inventory Package + Books expense + FNSKU guide + checklist |
| 8 | Stock Live | System | CRM updated; HandoffPackage stock levels updated |

### Source to Pay — QC Self-Inspection Checklist (Stage 4)

For a pre-revenue company with 1-2 people, no separate QC team exists. The founder performs self-inspection using a structured checklist linked to the ProductSpec:

1. **Dimensions check:** Measure L/W/H against ProductSpec tolerances. Photograph with measuring tape.
2. **Material check:** Verify wood type, finish, and material composition matches spec. Close-up photos.
3. **Weight check:** Weigh sample. Must be within ProductSpec tolerance and under weight ceiling (2.0 kg for FBA).
4. **Functionality check:** Test all moving parts, closures, mechanisms. Video if applicable.
5. **Finish quality:** Check for defects — scratches, rough edges, uneven finish, color consistency.
6. **Packaging check:** Verify packaging matches spec, product is secure, no damage risk in transit.
7. **Labeling check:** MRP label, country of origin, brand name present and correct.
8. **Photo documentation:** Minimum 6 photos uploaded to CRM record: front, back, top, detail, packaging, label.

Result: PASS / FAIL / CONDITIONAL (with notes). Logged to CRM SampleConfirmation fields. Links to ProductSpec for reference comparison.

---

## Data Flow Between Domains

```
Domain 1       Domain 1.5      Domain 2       Domain 2.5      Domain 3       Domain 4
(Discovery) → (Positioning) → (Sourcing) → (Mkt Testing) → (Listing)  → (Post-Launch)
     │               │                           │                               │
     │               └──── USPStatement ────────►│──────────────────────►        │
     └──── CostEstimate ──────────────────────►  CostComparison         ISM_Learnings
                                                 │                               │
                                           Gate 2 pass                   (daily synthesis)
                                                 │                               ▼
                                                 ▼                         Git context files
                                       Source to Pay Pipeline                    │
                                       (parallel with Domain 3)                  ▼
                                                                          Project Knowledge
                                                                          → Domain 1 scoring
```

**Handoff mechanism:** CRM record (Product_Launches). Gates carry all accumulated data forward. Skills read from CRM at start of each session.

**Within a session:** `window.storage` (namespace `ism:`) for transient UI state only — active product ID, active tab, scroll position. Never for business data.

---

## Feedback Loops

The system improves over time through structured feedback from Domain 4 back to earlier domains. Each loop has a data source, a synthesis mechanism, and a destination.

### Loop 1: Scoring Calibration (existing — strengthen)

**Source:** Domain 4 — `ism-learning-engine` produces FeedbackSignals on product kill or scale.
**Mechanism:** Daily learning synthesis task (`ism-daily-learning`) reads ISM_Learnings CRM module → synthesizes → writes to `context/pending-updates/`.
**Destination:** Domain 1 scoring weights in project context. Operator reviews pending-updates, commits to Git, deploys to Project Knowledge.
**Strengthening:** Add Slack notification when pending-updates has new files: `ism-daily-learning` posts to `#ism-launch-reports`: "Learning synthesis complete — N files pending review in context/pending-updates/." This prevents stale scoring weights from unreviewed files accumulating.

### Loop 2: Supplier Performance Feedback (new)

**Source:** Domain 4 — when a product is killed or scaled, the confirmed vendor's contribution to the outcome is assessed.
**Mechanism:** `ism-learning-engine` produces a SupplierPerformanceDelta: was the vendor's quality, delivery, or cost accuracy predictive of the outcome? Did poor quality contribute to failure?
**Destination:** Vendors CRM module — VendorScore updated (quality_consistency_score, delivery_reliability_score). If systemic pattern confirmed across 3+ products, vendor grade adjusted.
**Impact:** Future `supplier-intelligence` queries reflect updated vendor grades. Poor vendors deprioritized automatically.

### Loop 3: Differentiation Outcome Feedback (new)

**Source:** Domain 4 — PerformanceRecord[] shows how the product performed in market.
**Mechanism:** `ism-learning-engine` attributes performance to the SelectedScenario from Domain 1.5. Was the differentiation angle (material upgrade, feature addition, bundle angle, price tier shift, audience pivot) correlated with success or failure?
**Destination:** ISM_Learnings CRM module, field: `differentiation_outcome`. Over time, enables pattern analysis: "material upgrade differentiations succeed 70% of the time; price tier shifts fail 60%."
**Impact:** Domain 1.5 (Positioning Workbench) can surface historical success rates per differentiation type when generating scenarios.

### Loop 4: Actual vs. Estimated Cost Feedback (new)

**Source:** Domain 3 / Source to Pay — when bulk order completes (Stage 8: Stock Live), the actual landed cost is known.
**Mechanism:** Compare actual landed cost against: (a) Domain 1 CostEstimate (pre-test benchmark), (b) Domain 2 MarginRecord (supplier quote), (c) Domain 2.5 TestActuals. Produce CostAccuracyDelta.
**Destination:** ISM_Learnings CRM module, field: `cost_accuracy_delta`. Daily synthesis task picks up and adjusts `financial-constants.json` baseline assumptions (e.g., if freight estimates are consistently 15% low, adjust default).
**Impact:** Domain 1 CostEstimate accuracy improves over time. margin-calculator ESTIMATE mode becomes more reliable.

---

## Data Type Conventions

**Blanket rule — applies to ALL data types produced by skills:**

Every object written by a skill to CRM must include:
- `created_at` — ISO 8601 timestamp (`2026-03-28T07:30:00+05:30`)
- `confidence` — `HIGH` / `MEDIUM` / `LOW` based on data completeness and source quality
- `source[]` — array of data sources cited (e.g., `["Amazon BSR", "IndiaMART quote", "category benchmark"]`)

These fields are non-negotiable. Claude must include them in every output. ISM Execution Logs also timestamps every CRM write independently.

**Key data types and their primary fields** (full schemas in `03-data-schemas.md` — to be created):

| Data Type | Primary fields | Domain | Storage |
|---|---|---|---|
| TrendSignal | keyword, category, velocity_delta, marketplace | D1 | CRM related list |
| ProductCandidate | asin, title, bsr, price, review_count, category | D1 | CRM related list |
| CompetitorProfile | asin, price, bsr, review_count, gaps[], listing_weaknesses[] | D1 | CRM related list |
| ResearchRecord | evaluation_scores{}, gate1_inputs{}, ideation[] | D1 | Confluence page + CRM Note ID |
| CostEstimate | unit_cost, landed_cost, selling_price, cbfa, breakeven_acos | D1 | CRM text field (JSON) |
| ComplianceFeasibility | certs_required[], timeline_weeks{}, risk_level | D1 | CRM text field (JSON) |
| SelectedScenario | scenario_type, description, rationale, differentiators[] | D1.5 | Confluence page + CRM text field |
| USPStatement | one_liner, proof_points[], target_buyer | D1.5 | CRM text field (JSON) |
| PositioningBrief | competitor_landscape, gaps_exploited, usp, messaging_angle | D1.5 | Confluence page + CRM Note ID |
| ProductSpec | dimensions{}, materials[], bom[], packaging{}, compliance_notes | D2 | CRM text field (JSON) |
| MarginRecord | unit_cost, landed_cost, amazon_fee, net_margin, gross_margin | D2 | CRM fields (scalars) |
| ConfirmedVendorRecord | vendor_crm_id, name, contact, moq, lead_time_days, payment_terms | D2 | CRM fields (scalars) |
| ComplianceRecord | certs[], jira_ticket_ids{}, owner_type, owner_name, expected_dates{} | D2 | CRM text field (JSON) |
| SampleConfirmation | qc_status, waiver_reason, approved_by, dispatch_date | D2 | CRM fields (scalars) |
| TestPlan | mode, budget_per_week, duration_weeks, targeting{}, thresholds{} | D2.5 | CRM text field (JSON) |
| TestListingDraft | title, bullets[], description, keywords[] | D2.5 | Confluence page + CRM Note ID |
| TestResults | impressions, ctr, cvr, acos, bsr_delta, units_sold, roas_by_week[] | D2.5 | Confluence page + CRM Note ID |
| CostComparison | estimate{}, actual{}, test_actuals{}, variance_pct{} | D2.5 | Confluence page + CRM Note ID |
| CostingScenarios | scenarios[]{moq, unit_cost, landed_cost, margin, break_even} | D2.5 | CRM related list |
| ScaleDecision | decision, quantity, target_landed_cost, max_moq, launch_timeline | D2.5 | CRM fields (scalars) |
| AmazonListingCopy | title, bullets[], description, aplus_brief, backend_keywords[] | D3 | Confluence page + CRM Note ID |
| ShopifyListingCopy | title, description, seo_title, seo_description, tags[] | D3 | Confluence page + CRM Note ID |
| ReviewStrategy | email_sequence{}, vine_eligible, launch_review_target | D3 | CRM text field (JSON) |
| LaunchCapitalPlan | inventory_cost, working_capital, ad_budget, cash_flow_timeline[] | D3 | CRM text field (JSON) |
| RepricingDecision | trigger, recommended_price, floor_price, ceiling_price, rationale, duration_days | D4 | CRM text field (JSON) |
| HandoffPackage | sales_velocity, stock_level, reorder_formula, next_order_qty, vendor_id | D4 | CRM text field (JSON) |
| FeedbackSignals | criteria_performance{}, estimate_accuracy{}, differentiation_outcome, cost_accuracy_delta{}, supplier_performance_delta{}, recommendations[] | D4 | ISM_Learnings CRM module |
| ShopifyCustomerSignal | purchase_history[], repeat_rate, lifetime_value, segments[] | D4 (future) | CRM text field (JSON) |
| SupplierPerformanceDelta | vendor_id, quality_score_delta, delivery_score_delta, cost_accuracy, outcome_correlation | D4 | Vendors CRM module + ISM_Learnings |
| CostAccuracyDelta | estimate_landed, actual_landed, variance_pct, variance_category | D4 | ISM_Learnings CRM module |

---

## CRM Data Storage Architecture

| Data Type | Storage Approach |
|---|---|
| Scalar values (prices, scores, dates, pass/fail, IDs) | Direct fields on Product_Launches CRM record |
| Small JSON objects <5 KB (CostEstimate, Gate results, PricingStrategy, ScaleDecision, USPStatement, ComplianceRecord, ReviewStrategy, LaunchCapitalPlan, HandoffPackage) | CRM text fields, JSON-stringified |
| Large documents (ResearchRecord, PositioningBrief, TestListingDraft, TestResults, CostComparison, AmazonListingCopy, ShopifyListingCopy) | Confluence pages — naming: `[ProductName]-[DataType]-[YYYY-MM-DD]`. Page URL stored in CRM field. |
| Large arrays (TrendSignal[], ProductCandidate[], CompetitorProfile[], CostingScenarios[], DifferentiationScenario[]) | CRM related list sub-module records — one record per item |
| Learning and calibration data | ISM_Learnings CRM module (CustomModule17, ID: 645926000009174006) |
| All approval decisions and CRM writes | ISM Execution Logs custom module: field changed, old value, new value, who triggered, timestamp, domain context |

**Prerequisite:** Product_Launches and Vendors module field API names are Known Gaps — retrieve before building CRM write skills. Claude can create missing fields via MCP.

---

## Vendor Module Architecture

Two-tier vendor scoring to support supplier reuse across multiple products.

**Tier 1 — Global VendorScore (Vendors CRM module, ID: 645926000000030005):**
- One record per supplier (reused across all products)
- Fields to add: `categories_served[]`, `communication_score`, `quality_consistency_score`, `delivery_reliability_score`, `overall_grade` (A-F), `total_products_evaluated`
- `supplier-intelligence` queries this module first (category match + grade filter) before external search
- `vendor-ops` updates this record after each product engagement if pattern is detected

**Tier 2 — Product-Vendor Fit Score (Vendor_Evaluations — linked to both Vendors record AND Product_Launches record):**
- One record per product-vendor evaluation
- Fields: `vendor_crm_id`, `product_launches_id`, `material_capability_score`, `spec_compliance_score`, `sample_quality_score`, `rfq_price_vs_target`, `fit_grade`, `recommendation`
- Does not affect global VendorScore unless systemic pattern confirmed across 3+ products

**Supplier reuse flow:** `supplier-intelligence` → queries Vendors module → shows existing vendors with global score → runs external search for gaps → `vendor-ops` scores all candidates at both tiers → human selects vendor → both records updated.

---

## Human Decision Points

**Standard approval pattern:** AI produces output → artifact presents for human review with AI context in header → human approves or rejects via button → artifact generates structured approval payload → Claude in conversation sees payload → calls MCP to write CRM → writes ISM Execution Logs entry (who, what, when, domain).

| Decision Point | Domain | Artifact | Stakes |
|---|---|---|---|
| Gate 1 pass/fail | Domain 1 | Discovery Dashboard | Medium |
| SelectedScenario (differentiation path) | Domain 1.5 | Positioning Workbench | High |
| SampleConfirmation dispatch approval | Domain 2 | Sourcing Workbench | Medium |
| TestPlan approval (before ad spend) | Domain 2.5 | Test Lab A | High |
| ScaleDecision / bulk commit (Gate 2) | Domain 2.5 | Test Lab B | Critical |
| Amazon listing copy approval | Domain 3 | Launch Control | Medium |
| Shopify listing copy approval | Domain 3 | Launch Control | Medium |
| Gate 3 compliance sign-off | Domain 3 | Launch Control | High |
| CampaignVerdict: kill | Domain 4 | Operations Dashboard | High |

All other Claude outputs are AI-produced, human-visible, but do not block pipeline advancement.

---

## Kill / Archive Workflow

**At any gate failure (Gate 1, 2, or 3):**
1. Artifact displays warning panel with gate result detail
2. CRM Note written: gate failed, reason, confidence scores, data snapshot
3. Slack message to `#ism-launch-alerts`: `❌ [ProductName] failed Gate [N]. Reason: [X]. Moved to Rejected.`
4. CRM record moves to Bigin Rejected stage
5. KillRecord written to ISM Execution Logs

**At Domain 4 CampaignVerdict: kill:**
1. Human approves kill in Operations Dashboard
2. Steps 1–5 above, plus:
3. `ism-learning-engine` triggered → extracts which Domain 1 scoring criteria predicted/failed to predict outcome, calculates CostEstimate vs. live performance delta
4. Writes FeedbackSignals to ISM_Learnings module
5. HandoffPackage produced (even for killed products — captures final state)
6. Daily learning synthesis task reads ISM_Learnings → writes synthesized output to `skill-share/context/pending-updates/` → operator reviews and manually commits to Git → context files deployed to Project Knowledge

---

## Artifact Architecture Standards

### Data Pattern
- **Inbound (CRM → artifact):** Claude reads CRM via MCP at session start → renders artifact with data embedded in initial state. Artifact shows a "Refresh" option that triggers Claude to re-read CRM and re-render.
- **Outbound (artifact → CRM):** Approval buttons generate a structured JSON payload displayed in the conversation thread. Claude automatically recognises the payload and calls the appropriate MCP tool. No manual copy-paste required.
- **Clipboard fallback (required):** Every artifact that produces data must have an "Export JSON" button. Every artifact that consumes data must have an "Import JSON" button. These are fallback mechanisms for when CRM is unavailable — the primary path is always CRM-first via MCP. See 03 §3.
- `window.storage` (`ism:` namespace): transient session state only — active product ID, active tab, UI preferences. Never business data. Full key schema deferred to artifact build phase (see Known Gaps).

### UX Principles
- **Operational first:** every screen should help the user take the next action, not just display information
- **AI insights:** header panel on every artifact provides Claude-generated context about the selected product and current domain — what's notable, what needs attention
- **AI suggestions:** where applicable, Claude pre-fills recommendations (e.g., suggested differentiation scenario, suggested scale decision) with reasoning, human confirms or overrides
- **Graceful degradation:** if required data is missing from CRM, disable dependent buttons and show a clear message explaining what's missing and which domain produces it. Do not show empty states without explanation.

### Navigation Patterns

| Artifact | Pattern | Reason |
|---|---|---|
| Discovery Dashboard | Tabs | Multiple independent views, no required order |
| Positioning Workbench | Wizard/stepper | Sequential — cannot build USP before selecting scenario |
| Sourcing Workbench | Tabs | Multiple independent views |
| Test Lab A (Plan + Run) | Wizard/stepper | Sequential — cannot run before planning |
| Test Lab B (Analyze + Decide) | Tabs | Independent analysis views |
| Launch Control | Tabs | Multiple independent views |
| Operations Dashboard | Tabs | Multiple independent views |
| Seller Central Operations | Checklist + tabs | Task tracking across two domains |
| Portfolio Dashboard | Tabs | Independent strategic views, no product-specific flow |

### Portfolio Dashboard (Strategic View — "Product Pipeline" project)

Cross-cutting artifact that provides a portfolio-level view across all pipeline stages. Not domain-specific — aggregates data from all domains.

**Purpose:** Total capital visibility, pipeline health, strategic decision support.
**Tabs:**
- **Pipeline Overview:** All active products across all stages. Count per stage. Visual funnel.
- **Capital Committed:** Total ad spend + PO values + test costs across all active products. Broken down by stage.
- **Parked Products:** Products tagged `Parked: true` with reasons, duration parked, and unpark recommendations.
- **Kill Rate Analysis:** Kill rate by stage, by time period. Which stages are the biggest filters.
- **Portfolio Insights:** AI-generated strategic observations — concentration risk, capital allocation, pipeline velocity trends.

**Data source:** Reads from Bigin pipeline + CRM Product_Launches records via MCP. No real-time Claude API needed — pre-computed aggregation.

### Multi-Product Layout (all artifacts except Seller Central Operations and Portfolio Dashboard)
```
┌──────────┬────────────────────────────────────────────────────┐
│ Product  │ [AI Context Header — insights for selected product] │
│ List     ├────────────────────────────────────────────────────┤
│ (7-day   │                                                     │
│ window)  │  [Tab 1] [Tab 2] [Tab 3] [Tab 4]                   │
│          │                                                     │
│ Filter:  │  [Main content area for selected tab]               │
│ by stage │                                                     │
│ by park  │  [Action buttons — CRM write triggers]              │
│ status   │                                                     │
└──────────┴────────────────────────────────────────────────────┘
```

### Real-time Claude API Usage
Artifacts that call the Anthropic API in real-time (API key configured in artifact):

| Artifact | What Claude generates in real-time |
|---|---|
| Positioning Workbench | DifferentiationScenario options from CompetitorProfile[], USP copy from SelectedScenario |
| Test Lab B | Scale decision analysis, CostingScenario narrative, recommendation with reasoning |

All other artifacts display pre-computed skill output. They do not call Claude API.

### Artifact Size Management
- Target: under 2,000 lines per artifact file
- Test Lab is split into A (Plan + Run) and B (Analyze + Decide) specifically for this reason
- Complex tabs that exceed ~400 lines should be broken into sub-components within the same file
- Use Tailwind CSS utilities only — no compiled CSS

---

## Scheduled Tasks Registry

All tasks are self-contained — no dependency on conversation state. Each task includes its own CRM queries and error handling.

### Task 1: Daily Product Discovery
- **Name:** `ism-daily-discovery`
- **Schedule:** Daily, 7:00 AM IST
- **Trigger:** Time-based (Cowork scheduled task)
- **Sequence:** Invokes `ikraft-keyword-intelligence` → generates seed keywords → invokes `product-discover` → crawls Amazon marketplace
- **CRM write:** Creates ProductCandidate records in Product_Launches related list
- **Error handling:** Fewer than 5 candidates found → post warning to `#ism-launch-alerts`. Zero candidates → post critical alert.
- **Completion:** Post daily summary to `#ism-launch-reports` (count of candidates, top 3 by score)

### Task 2: Stage 2 Intelligence
- **Name:** `ism-stage2-intelligence`
- **Trigger:** Event-based — fires when human promotes a product to Stage 2 in Bigin (Bigin webhook or Cowork poll)
- **Sequence:** Reads Product_Launches record → invokes `product-market-intelligence` → creates CompetitorProfile[] records in CRM related list → updates ResearchRecord → stores ResearchRecord in Confluence (ISM/Product Launch Factory/Research Records/)
- **CRM query:** `GET /crm/v7/Product_Launches/{record_id}` (record ID from trigger)
- **Error handling:** Fewer than 3 competitors found → set confidence = LOW, flag in CRM Note, post to `#ism-launch-alerts`
- **Completion:** CRM updated; no Slack notification (human promoted it, they know it ran)

### Task 3: Stage 3 Vendor Search
- **Name:** `ism-stage3-vendor-search`
- **Trigger:** Event-based — fires when a Product_Launches record enters Stage 3 (Test Sourcing) in Bigin
- **Sequence:** Reads ProductSpec + category from CRM → queries Vendors CRM module for category match → invokes `supplier-intelligence` for external search (IndiaMART, TradeIndia, factory directories + Claude's additional sources) → `vendor-ops` scores all candidates → creates/updates Vendor records in Vendors module → links top candidates to Product_Launches
- **CRM query:** `GET /crm/v7/Vendors?category=[product_category]&grade=A,B,C`
- **Error handling:** Fewer than 3 vendors found → post alert to `#ism-launch-alerts` with product name
- **Completion:** CRM updated with vendor list; Slack summary if new high-grade vendor found

### Task 4: Daily Learning Synthesis
- **Name:** `ism-daily-learning`
- **Schedule:** Daily, 11:00 PM IST
- **Trigger:** Time-based
- **Sequence:** Reads ISM_Learnings records created in last 24 hours (CustomModule17) → invokes `ism-learning-engine` to synthesize → generates updated content for relevant context files → commits updated files to Git repo (`C:\Users\amits\ClaudeMain\Claude-Cowork\Git-Skill-Share\skill-share\context\`)
- **CRM query:** `GET /crm/v7/CustomModule17?created_after=[yesterday_11pm]`
- **Error handling:** No learnings in 24 hours → log to ISM Execution Logs, no Slack alert
- **Completion:** Git commit made. Operator deploys updated context files to Claude.ai Project Knowledge as needed.

---

## Slack Integration Spec

**Channels:**
- `#ism-launch-alerts` — gate events, kills, commits, compliance blocks, product live
- `#ism-launch-reports` — daily digest, on-demand reports

**Event → Message mapping:**

| Event | Channel | Format |
|---|---|---|
| Gate 1 pass | #ism-launch-alerts | `✅ [ProductName] passed Gate 1. Confidence: [H/M/L]. Moving to Positioning.` |
| Gate 1 fail | #ism-launch-alerts | `❌ [ProductName] failed Gate 1. Reason: [CBFA/ACoS/Compliance]. Moved to Rejected.` |
| Gate 2 commit | #ism-launch-alerts | `🚀 [ProductName] committed for bulk order. Qty: [X]. Landed cost: ₹[X]. Source to Pay created.` |
| Gate 2 fail | #ism-launch-alerts | `❌ [ProductName] failed Gate 2. [CVR/ACoS/Compliance] threshold not met. Moved to Rejected.` |
| Compliance block | #ism-launch-alerts | `⚠️ [ProductName] compliance BLOCKED at Gate 2. Cert completion: [date]. Launch window: [date].` |
| Product live | #ism-launch-alerts | `🎉 [ProductName] is LIVE on [Amazon/Shopify]. Stage 11 reached.` |
| Product killed (D4) | #ism-launch-alerts | `🔴 [ProductName] killed. Learning captured to ISM_Learnings.` |
| Daily digest | #ism-launch-reports | Pipeline summary: products per stage, total spend deployed, kills this week, candidates added |

**Message types (artifact-triggered):**
- **Alert** — automatic, triggered by gate events and kill workflow
- **Daily digest** — scheduled, sent by `ism-daily-discovery` completion
- **On-demand brief** — human clicks "Share to Slack" in artifact → Claude formats product brief and posts
- **On-demand report** — human requests pipeline or financial report from artifact → Claude generates and posts
- **Peer review** (future) — sends evaluation to a reviewer for feedback

**Known gap:** Slack channel IDs for `#ism-launch-alerts` and `#ism-launch-reports` still not filled. Fill in `pipeline-config.json` before Slack integration is built.

---

## Confluence Page Structure

**Space:** ISM
**Root folder URL:** https://ismokraft.atlassian.net/wiki/spaces/iscom/folder/452788225
**Management rule:** All pages created by skills/artifacts go inside the folder structure below. Claude must check for existing folder before creating. If folder doesn't exist, create it via Confluence MCP before writing pages.

```
ISM Knowledge Base (Confluence Space: ISM)
├── Product Launch Factory/
│   ├── Research Records/          ← ResearchRecord pages
│   ├── Positioning Briefs/        ← PositioningBrief + SelectedScenario pages
│   ├── Test Results/              ← TestListingDraft, TestResults, CostComparison pages
│   └── Learning Archive/          ← Synthesised learning summaries by period
├── Vendor Intelligence/
│   └── Supplier Research/         ← SupplierBrief pages
├── Compliance & Regulatory/
│   └── Certification Tracking/    ← ComplianceRecord narrative pages
└── SOP Documents/
    ├── Seller Central Operations/  ← Manual step-by-step procedures
    └── FBA Inbound Guide/          ← FNSKU labeling, shipment procedures
```

**Page naming convention:** `[ProductName]-[DataType]-[YYYY-MM-DD]`
Example: `WoodenSpiceRack-ResearchRecord-2026-03-28`

**Jira ticket creation flow:** No skill or artifact creates Jira tickets directly. The flow is:
1. Artifact approval → CRM update (ComplianceRecord with cert details)
2. CRM update triggers create 'task' type activity in CRM followed by task activity creation in Bigin. 
3. Bigin activity task triggers Jira ticket creation in "ismo scrum" board (existing workflow automation)
4. Team picks up tickets in coming sprints
One Jira ticket per certification, with assignee and due date from ComplianceRecord.

**Conflict prevention:** Each data type has a dedicated sub-folder. Pages are created by Claude via Confluence MCP — never manually unless explicitly overriding. Human edits are permitted but Claude will overwrite on next write unless record is marked `human_edited: true` in CRM.

---

## Seller Central Operations Artifact

Standalone React artifact in "Launch & Ops" project. Covers all manual Seller Central steps across two domains in one place. Also linked to Confluence SOP for detailed instructions.

**Scope:** Stage 4/5 (test listing creation for Domain 2.5) + Stage 10 (platform setup for Domain 3)

**Tabs:**
1. **Test Listing Setup** — checklist for creating FBA test listing in Seller Central (ASIN creation, listing copy paste from TestListingDraft, FBA inbound shipment plan, FNSKU labeling)
2. **Platform Setup** — checklist for full platform configuration (shipping templates, tax settings, return policy, Brand Registry, A+ content publishing)
3. **Status Tracker** — completion status saved to CRM; incomplete steps highlighted

Each checklist item has: step description, Confluence SOP link, completion checkbox, CRM update trigger.

---

## Recommended Project Structure

### 2 Claude Projects + 1 Ops Project

**"Product Pipeline"** (Claude.ai project)
- Covers: Domain 1 + 1.5 + 2 + 2.5
- Plugins: 4 plugins (1a product-discovery, 1b product-evaluation, 2a product-sourcing, 2b product-testing — all under 20 KB each)
- Artifacts: 6 (Discovery Dashboard v1.0, Positioning Workbench v1.0, Sourcing Workbench v1.0, Test Lab A v1.0, Test Lab B v1.0, Portfolio Dashboard v1.0)
- Project knowledge: context files listed below
- Requires: CLAUDE.md per 03 §4 — defines project context, pipeline, integrations, artifact registry
- CLAUDE.md template: `docs/CLAUDE-product-pipeline.md` (to be created during build session)

**"Launch & Ops"** (Claude.ai project)
- Covers: Domain 3 + 4 + Source to Pay tracking
- Plugins: 2 plugins (3 product-launch, 4 product-ops)
- Artifacts: 4 (Launch Control v1.0, Operations Dashboard v1.0, Source to Pay Tracker v1.0, Seller Central Operations v1.0)
- Project knowledge: context files listed below
- Requires: CLAUDE.md per 03 §4
- CLAUDE.md template: `docs/CLAUDE-launch-ops.md` (to be created during build session)

**"System Ops"** (Claude.ai project)
- System-level skills, governance, Zoho platform. Amit only. Not shared.

### Context File Inventory

All files are stored in Git at `skill-share/context/` and loaded into Claude.ai Project Knowledge. Total target: under 50 KB per project.

**`context/product-pipeline/` files ("Product Pipeline"):**

| File | Format | Content | Est. KB |
|---|---|---|---|
| `crm-field-mappings.json` | JSON | Product_Launches field names + API names, Vendors module fields, Vendor_Evaluations fields, ISM Execution Logs fields, ISM Learnings fields, Bigin pipeline ID + stage IDs | ~8 KB |
| `financial-constants.json` | JSON | CBFA formula, break-even ACoS formula, target margins, GST rate, price sweet spot, price floor, weight ceiling, ACoS targets per phase | ~3 KB |
| `gate-criteria.json` | JSON | Gate 1 thresholds (CBFA min, ACoS max, compliance rules), Gate 2 thresholds (CVR/CTR paths A+B), Gate 3 checklist | ~4 KB |
| `zone-rotation.json` | JSON | Zone definitions, rotation schedule, marketplace rotation, scoring weights per zone | ~3 KB |
| `brand-rules.md` | MD | Brand name, brand story, values, price floor rule, target customer profiles, positioning guardrails, tone of voice | ~3 KB |
| `testing-config.json` | JSON | Default test budgets per mode, duration range, mode decision criteria, scaling thresholds, bid strategy defaults | ~3 KB |
| `pipeline-config.json` | JSON | Bigin pipeline IDs, Bigin stage IDs, Source to Pay pipeline ID, Slack channel IDs (fill when known), ISM Learnings module ID + fields, Vendors module ID, Confluence space key | ~2 KB |

**Total `context/product-pipeline/`: ~26 KB**

**`context/launch-ops/` files ("Launch & Ops"):**

| File | Format | Content | Est. KB |
|---|---|---|---|
| `listing-standards.json` | JSON | Amazon India listing format rules (char limits, keyword density, prohibited terms), Shopify format rules, SEO guidelines | ~4 KB |
| `compliance-requirements.json` | JSON | BIS, FSSAI, MRP labeling, CoO, Brand Registry requirements per product category | ~5 KB |
| `launch-benchmarks.json` | JSON | ACoS targets by phase, BSR targets by category, review velocity benchmarks, CVR benchmarks | ~3 KB |
| `analytics-config.json` | JSON | Zoho Analytics workspace IDs, view names, KPI definitions for Domain 4 reporting | ~2 KB |

**Total `context/launch-ops/`: ~14 KB**

---

## Skill Modes Design Pattern

Multi-mode skills use a **single SKILL.md covering all modes** — no reference files in plugins (see 03 §2). All mode execution steps, input/output contracts, and trigger phrases fit within the 5 KB SKILL.md budget. Mode-specific configuration (data values, thresholds, CRM field names) lives in project context files and is read at runtime.

**Trigger phrase format:** `{PREFIX}- {action phrase}` (e.g., `MC- estimate unit costs for this product`, `AO- set up test campaign`). Trigger phrases are for system-level invocation (scheduled tasks, debugging) only. End users interact exclusively with artifacts.

| Skill | Prefix | Modes | Appears in plugins |
|---|---|---|---|
| `margin-calculator` | MC | ESTIMATE, ACTUAL, COMPARISON | 1b, 2a |
| `ads-ops` | AO | TEST, LIVE | 2b, 4 |
| `product-monitor` | MO | TEST, LIVE | 2b, 4 |
| `compliance-ops` | CO | FEASIBILITY, INITIATION, COMPLETION | 1b, 2b, 3 |
| `fulfillment-ops` | FO | SAMPLE, BULK | 2b, 3 |
| `content-writer` | CW | AMAZON, SHOPIFY, RESEARCH, WRITE | 3 (launch modes); D5 future |

---

## Plugin Splitting Plan

"Product Pipeline" uses 4 plugins (1a, 1b, 2a, 2b). "Launch & Ops" uses 2 plugins (3, 4). Maximum 5 skills per plugin, no reference files. The same SKILL.md appears in multiple plugins where a skill serves multiple domains — mode switching is controlled by project context (`pipeline-config.json`), not by reference files. See 03 §2 for build process.

### Plugin 1a: "product-discovery" (Domain 1 — discovery stages) — ~17 KB
- `ikraft-keyword-intelligence` (KI) → ~4 KB
- `product-discover` (PD) → ~4 KB
- `product-screen` (PS) → ~4 KB
- `product-market-intelligence` (MI) → ~5 KB

### Plugin 1b: "product-evaluation" (Domains 1 + 1.5 — evaluation, economics, compliance feasibility) — ~14 KB
- `product-evaluate` (PE) → ~4 KB
- `margin-calculator` (MC) → ~5 KB — all modes in SKILL.md; ESTIMATE mode active via project context
- `compliance-ops` (CO) → ~5 KB — all modes in SKILL.md; FEASIBILITY mode active via project context

### Plugin 2a: "product-sourcing" (Domain 2) — ~18 KB
- `product-spec` (SP) → ~4 KB
- `supplier-intelligence` (SI) → ~5 KB
- `vendor-ops` (VO) → ~4 KB
- `margin-calculator` (MC) → ~5 KB — same SKILL.md as 1b; ACTUAL + COMPARISON modes active

### Plugin 2b: "product-testing" (Domain 2.5) — ~17 KB
- `ads-ops` (AO) → ~4 KB — all modes in SKILL.md; TEST mode active via project context
- `product-monitor` (MO) → ~4 KB — all modes in SKILL.md; TEST mode active
- `fulfillment-ops` (FO) → ~4 KB — all modes in SKILL.md; SAMPLE mode active
- `compliance-ops` (CO) → ~5 KB — same SKILL.md as 1b; INITIATION mode active

### Plugin 3: "product-launch" (Domain 3) — ~18 KB — future
- `content-writer` (CW) → ~5 KB — AMAZON + SHOPIFY modes active
- `capital-planner` (CP) → ~4 KB
- `compliance-ops` (CO) → ~5 KB — same SKILL.md; COMPLETION mode active
- `fulfillment-ops` (FO) → ~4 KB — same SKILL.md; BULK mode active

### Plugin 4: "product-ops" (Domain 4) — ~16 KB — future
- `product-monitor` (MO) → ~4 KB — same SKILL.md; LIVE mode active
- `ads-ops` (AO) → ~4 KB — same SKILL.md; LIVE mode active
- `revenue-ops` (RO) → ~4 KB
- `ism-learning-engine` (LE) → ~4 KB

**Note:** `product-ops-config` removed — content lives in project context files. No config skill needed.

---

## Build Order

### Phase 0: Prerequisites (MUST complete before proceeding)

**Verification gate:** Do NOT proceed past Phase 0 until ALL items below are confirmed complete and their outputs are in `pipeline-config.json`. Each item has a verification check.

| Step | What | Verification | Why |
|---|---|---|---|
| 0 | Retrieve CRM Product_Launches field API names via MCP | `crm-field-mappings.json` has Product_Launches fields populated | Prerequisite for all CRM write skills |
| 0a | Retrieve Vendors module fields via MCP; add missing VendorScore fields | `crm-field-mappings.json` has Vendors fields; VendorScore fields exist in module | Prerequisite for supplier reuse architecture |
| 0b | Audit ISM_Learnings module (CustomModule17) fields via MCP; add missing fields | `crm-field-mappings.json` has ISM_Learnings fields including differentiation_outcome, cost_accuracy_delta, supplier_performance_delta | Prerequisite for feedback loops |
| 0c | Design Source to Pay Pipeline in Bigin (8 stages) | `pipeline-config.json` has Source to Pay pipeline ID and stage IDs | Prerequisite for Gate 2 trigger build |
| 0d | Set up Confluence space ISM with folder structure | Confluence folders verified accessible via MCP write test | Prerequisite for large document storage |
| 0e | Probe Zoho Books/Inventory available MCP operations | Document available operations, missing permissions, unneeded access in `pipeline-config.json` | Prerequisite for fulfillment-ops design |
| 0f | Verify Confluence MCP page creation works | Test page created and deleted in ISM space | Prerequisite for document storage strategy |

### Phase 1: Foundation

| Step | What | Why |
|---|---|---|
| 1 | Design SKILL.md for `fulfillment-ops` and `compliance-ops` | New skills needed by multiple domains — design before plugin build |
| 2 | Generate `context/product-pipeline/` files (all 7 JSON/MD files) | Required before any skill or artifact reads project context |
| 2a | Create CLAUDE.md for "Product Pipeline" and "Launch & Ops" | Required per 03 §4 — defines context, pipeline stages, integrations, artifact registry |

**Context file generation instructions (Step 2):**
Run in a Cowork session with workspace set to the repo. For each context file:
1. Read the file spec from this document (Context File Inventory section above) for required content.
2. Query MCP tools to retrieve live data: `GET /crm/v7/settings/fields` for CRM mappings, `GET /bigin/v1/settings/fields` for Bigin stage IDs, Slack MCP for channel IDs.
3. Cross-reference with `01-system-constraints.md` for financial constants and `02-business-domain-map.md` for gate criteria.
4. Write the file to `context/{project}/` in the repo.
5. Validate: file format matches spec, total size under budget, all placeholder values filled or explicitly marked as Known Gap.

### Phase 2: Plugins

| Step | What | Why |
|---|---|---|
| 3 | Trim existing SKILL.md files to under 5 KB (start with product-discover as reference example) | Current files are 10-16 KB — must trim before plugin build |
| 3a | Build Plugin 1a "product-discovery" (KI, PD, PS, MI — 4 skills) | Enable daily discovery pipeline |
| 3b | Build Plugin 1b "product-evaluation" (PE, MC, CO — 3 skills) | Enable evaluation, pre-test economics, compliance feasibility |
| 4 | Build Plugin 2a "product-sourcing" (SP, SI, VO, MC — 4 skills) | Enable vendor sourcing and actual unit economics |
| 4a | Build Plugin 2b "product-testing" (AO, MO, FO, CO — 4 skills) | Enable paid testing, FBA dispatch, compliance initiation |

### Phase 3: Automation + Artifacts

| Step | What | Why |
|---|---|---|
| 5 | Set up 4 Cowork scheduled tasks (discovery, stage-2, stage-3, learning) | Automate daily pipeline and learning loop |
| 6 | Build Discovery Dashboard artifact | Discovery + Stage 2 promotion + Gate 1 |
| 6a | Build Positioning Workbench artifact | Differentiation + USP |
| 6b | Build Portfolio Dashboard artifact | Strategic portfolio view |
| 7 | Build Sourcing Workbench artifact | Vendor evaluation + dispatch approval |
| 7a | Build Test Lab A artifact (Plan + Run) | Test campaign planning and live tracking |
| 7b | Build Test Lab B artifact (Analyze + Decide) | Cost comparison + keyword-level validation + scale decision |

### Phase 4: Launch & Operations (when products go live)

| Step | What | Why |
|---|---|---|
| 8 | Generate `context/launch-ops/` files | Required before Domain 3-4 skills read project context |
| 8a | Build Plugin 3 "product-launch" + Plugin 4 "product-ops" | Enable listing, compliance completion, post-launch monitoring |
| 8b | Build Launch Control, Operations Dashboard, Source to Pay Tracker, Seller Central Operations artifacts | Full launch and operations UI |

---

## Existing Skills Inventory (43 Total)

### Product Pipeline (17 skills)
`ikraft-keyword-intelligence`, `product-market-intelligence`, `product-discover`, `product-screen`, `product-evaluate`, `product-spec`, `product-monitor`, `supplier-intelligence`, `vendor-ops`, `margin-calculator`, `capital-planner`, `content-writer`, `ads-ops`, `revenue-ops`, `ism-learning-engine` (active in D4), `fulfillment-ops` ⚠ NEW, `compliance-ops` ⚠ NEW

### Zoho Platform (3 skills)
`zoho-solutions-architect`, `zoho-developer`, `automation-designer`

### Governance & System (7 skills)
`ecosystem-ops`, `ism-skill-factory`, `ikraft-skill-governance`, `ism-gap-auditor`, `skill-commander`, `ism-sop-builder`, `okr-kpi-governance`

### Founder & Operations (3 skills)
`ism-founder`, `ism-scrum-master`, `ism-business-authority`

### Content & Market Research (1 skill)
`doc-coauthoring`

### Artifact Builders (2 skills)
`artifacts-builder-v2`, `web-artifacts-builder`

### File Format Skills (4 skills)
`docx`, `xlsx`, `pptx`, `pdf`

### Other Utility (5 skills)
`mcp-builder`, `mcp-guide`, `internal-comms`, `slack-gif-creator`, `webapp-testing`

### Assessment:
- `product-ops-config` removed from plugins — content moves to project context files
- `ism-learning-engine` promoted from governance to active Product Pipeline use (Domain 4)
- 2 new skills needed: `fulfillment-ops` and `compliance-ops` — design before plugin build (priority 1)
- `04-data-schemas.md` companion document to be created — full JSON schemas for all 25+ data types. Lives at `skill-share/docs/04-data-schemas.md` (see 03 §6 Git structure)

---

## Known Gaps

Do not assume values. Fill before dependent build tasks.

| Gap | Action | Priority |
|---|---|---|
| CRM Product_Launches field API names | `GET /crm/v7/settings/fields?module=Product_Launches` | 0 |
| Bigin Product Launch Factory field API names | `GET /bigin/v1/settings/fields?module=Deals` | 0 |
| Vendors module field API names + missing VendorScore fields | `GET /crm/v7/settings/fields?module=Vendors` then add fields via MCP | 0a |
| ISM_Learnings module field structure (CustomModule17) | `GET /crm/v7/settings/fields?module=CustomModule17` then audit and add fields | 0b |
| Source to Pay Pipeline in Bigin | Create via Bigin MCP or UI — 8 stages | 0c |
| Confluence space ISM + folder structure | Create via Confluence MCP | 0d |
| Slack channel IDs (#ism-launch-alerts, #ism-launch-reports) | Retrieve via Slack MCP then fill in `pipeline-config.json` | Before Slack integration |
| Razorpay available MCP endpoints | Probe Razorpay MCP to confirm settlement/refund data available | Before Domain 4 build |
| Zoho Flow IDs for registered flows | Retrieve from automation-registry.md | Before automation build |
| `fulfillment-ops` SKILL.md | Design from scratch. See `03-implementation-standards.md` §8 for directory and build instructions. | Priority 1 |
| `compliance-ops` SKILL.md | Design from scratch. See `03-implementation-standards.md` §8 for directory and build instructions. | Priority 1 |
| Zoho Books/Inventory available MCP operations | Probe via MCP: identify available operations, missing permissions, unneeded access. Document results in `pipeline-config.json`. | Phase 0e |
| Confluence MCP page creation verification | Test page creation in ISM space. Verify folder creation works. URL: see Confluence Page Structure section. | Phase 0f |
| `04-data-schemas.md` | Create full JSON schemas for all 25+ data types listed in Data Type Conventions (including new types: RepricingDecision, ShopifyCustomerSignal, SupplierPerformanceDelta, CostAccuracyDelta). Lives at `skill-share/docs/04-data-schemas.md`. | Before skill build |
| `window.storage` key schema | Define full key table for all 8 artifacts (format: `ism:{entity}:{id}:{sub}` per 03 §7). Defer to artifact build phase — each artifact defines its own keys at build time. | Before artifact build |
| `context/product-pipeline/` files (7 files) | Generate during build phase | Priority 2 |
| Jira project key for compliance ticket creation via Bigin | Retrieve from Jira MCP | Before compliance build |