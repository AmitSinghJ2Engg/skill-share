# Launch & Ops -- Project Instruction

## What This Project Is

Ismokraft's product launch and live operations pipeline. Covers Domains 3 and 4: taking tested products through final listing, compliance completion, platform setup, and into live operations monitoring. Activates after Gate 2 pass in the Product Pipeline project.

## Pipeline Flow

```
[Gate 2 pass] -> Sourcing Model Selection -> Final Listing -> Compliance & Certifications -> [Gate 3] -> Platform Setup -> Published -> Live Ops
```

Bigin pipeline: "Product Launch Factory" stages 7-11 (shared pipeline with Product Pipeline)
Source to Pay pipeline: "Procure To Pay" (layout ID: 677677000002680495)

## Skills Available

| Prefix | Skill | Modes |
|--------|-------|-------|
| CW | content-writer | LISTING, A_PLUS, BRAND |
| CP | capital-planner | FORECAST, ALLOCATE |
| CO | compliance-ops | COMPLETION |
| FO | fulfillment-ops | BULK |
| MO | product-monitor | DAILY, WEEKLY, ALERT |
| AO | ads-ops | SCALE, OPTIMIZE, REPORT |
| RO | revenue-ops | MARGIN, PORTFOLIO, REORDER |
| LE | ism-learning-engine | CAPTURE, SYNTHESIZE, APPLY |

## Data Integrity Rules

Same 7 rules as Product Pipeline project. CRM is single source of truth. Never invent data. Source everything. Confidence levels mandatory.

## Key Constants

Read from `financial-constants.ctx.json`:
- Target ACoS (scale phase): <= 30%
- Target net margin: >= 15%
- All pricing and margin formulas same as Product Pipeline

Read from `gate-criteria.ctx.json`:
- Gate 3: all certifications obtained (100% completion)

## CRM Configuration

Same modules as Product Pipeline:
- Product_Launches, Vendors, ISM_Learnings, ISM_ExecutionLogs
- Field mappings: see `crm-field-mappings.ctx.json`

Post-launch fields: `Post_Launch_Status`, `Month_1_*`, `Month_3_*`, `BSR_at_Launch`, `Final_Listing_URL_Amz`, `Final_Listing_URL_com`, `Live_Date`

## Integrations

- All Product Pipeline integrations plus:
- Zoho Inventory: stock management, reorder tracking
- Zoho Books: revenue tracking, expense reconciliation
- Amazon Seller Central: listing management, advertising (via MCP when available)

## Context Files (Phase 4)

When this project is fully active, generate `context/launch-ops/` files:
- listing-standards.json
- compliance-requirements.json
- launch-benchmarks.json
- analytics-config.json

Until then, this project shares `context/product-pipeline/` context files.
