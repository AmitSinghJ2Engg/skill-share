# Skill Delegation Map

**Used by:** EXECUTE mode
**Purpose:** Maps task types to the correct downstream ISM skill.

---

## Track 1 (Ecommerce) Delegation

### Product Discovery & Launch

| Task | Skill | Mode | Input needed |
|---|---|---|---|
| Find product opportunities | `product-discover` | — | Seed keywords, category, zone |
| Deep research on product | `product-market-intelligence` | PROFILE or TRENDS | ASIN or product name |
| Screen candidates | `product-screen` | — | Product batch from discovery |
| Evaluate a product deeply | `product-evaluate` | DEEP-EVAL | Product details + research data |
| Gate-check launch readiness | `product-evaluate` | GATE-CHECK | Product + gate number |
| Generate product concepts | `product-evaluate` | IDEATE | Category constraints + specs |

### Vendor & Sourcing

| Task | Skill | Mode | Input needed |
|---|---|---|---|
| Find suppliers | `supplier-intelligence` | DISCOVER | Product category, material, geography |
| Enrich + dedup suppliers | `supplier-intelligence` | ENRICH | Raw supplier records |
| Verify supplier credibility | `supplier-intelligence` | VERIFY | Supplier name, GSTIN, website |
| Score a vendor | `vendor-ops` | SCORE | Vendor details, communication samples |
| Generate RFQ | `vendor-ops` | RFQ | Product specs, quantity, timeline |

### Financial

| Task | Skill | Mode | Input needed |
|---|---|---|---|
| Calculate unit economics | `margin-calculator` | UNIT or CHANNEL | Product costs, selling price, channel |
| Find minimum viable price | `margin-calculator` | PRICING | Cost structure, target margin |
| Break-even analysis | `margin-calculator` | BREAKEVEN | Fixed costs, unit economics |
| Inventory planning | `capital-planner` | INVENTORY | SKU velocity, lead times |
| Cash flow projection | `capital-planner` | CASHFLOW | Revenue, expenses, payment cycles |
| Budget allocation | `capital-planner` | BUDGET | Total capital, priorities |
| Sales report | `revenue-ops` | SALES | Date range, channel |
| Returns analysis | `revenue-ops` | RETURNS | Date range |
| Settlement reconciliation | `revenue-ops` | RECONCILE | Settlement file, order data |

### Content & Marketing

| Task | Skill | Mode | Input needed |
|---|---|---|---|
| Research a topic | `content-writer` | RESEARCH | Topic, audience, purpose |
| Write content | `content-writer` | WRITE | Brief or topic |
| Amazon listing copy | `content-writer` | LISTING | Product details, keywords |
| Analyse competitor ads | `ads-ops` | EXTRACT | URL, screenshot, or ad copy |
| Plan a campaign | `ads-ops` | PLAN | Product, budget, target ACoS |
| Analyse ad performance | `ads-ops` | ANALYZE | Campaign data |

### Systems

| Task | Skill | Mode | Input needed |
|---|---|---|---|
| Design Zoho workflow | `zoho-solutions-architect` | — | Business requirement |
| Write Zoho code | `zoho-developer` | — | Tech spec from architect |

### Business Judgment

| Task | Skill | Mode | Input needed |
|---|---|---|---|
| Business decision | `ism-business-authority` | — | Decision context |
| Go/no-go judgment | `ism-business-authority` | — | Product or initiative details |
| Quality check (GO FEARLESS) | `ism-business-authority` | — | Artifact or output to check |

---

## Track 2 (SaaS Product) Delegation

Track 2 tasks are primarily handled within `ism-founder` PRODUCT mode.
External delegation occurs only for:

| Task | Skill | When |
|---|---|---|
| Fresh market research | `product-market-intelligence` | MI-001 data stale or new segment needed |
| Design backend on Zoho | `zoho-solutions-architect` | If SaaS uses Zoho as backend |
| Build Zoho integrations | `zoho-developer` | If SaaS connects to Zoho |
| Pricing model validation | `margin-calculator` | SaaS unit economics |
| Capital planning for SaaS | `capital-planner` | Runway and burn rate |

---

## Cross-Track Delegation

| Task | Skill | When |
|---|---|---|
| Define OKRs/KPIs for both tracks | `okr-kpi-governance` | Quarterly planning |
| Find system gaps | `ism-gap-auditor` | Periodic system review |

---

## Chain Patterns

Common multi-skill execution sequences:

### New Product Launch (T1)
```
product-discover → product-evaluate (DEEP-EVAL) → margin-calculator (UNIT)
→ product-evaluate (GATE-CHECK) → supplier-intelligence (DISCOVER) → capital-planner (LAUNCH)
```

### Validate SaaS Concept (T2)
```
ism-founder (PRODUCT/VALIDATE) → product-market-intelligence (if needed)
→ margin-calculator (PRICING) → capital-planner (CASHFLOW)
```

### Monthly Founder Review
```
ism-founder (COMPASS) → revenue-ops (SALES) → ism-founder (TRACK)
→ ism-founder (ALLOCATE)
```