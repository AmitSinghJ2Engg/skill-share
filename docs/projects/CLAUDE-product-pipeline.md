# Product Pipeline -- Project Instruction

## What This Project Is

Ismokraft's product discovery, evaluation, sourcing, and testing pipeline. Covers Domains 1 through 2.5: finding product opportunities, scoring and evaluating them, sourcing from vendors, and running market tests. Pre-revenue stage -- building the system to launch products on Amazon India, Amazon US, and Shopify.

## Pipeline Flow

```
Idea Intake -> Research & Profitability -> [Gate 1] -> Test Sourcing -> Test Listing -> Paid Testing -> Scale Decision -> [Gate 2]
```

Bigin pipeline: "Product Launch Factory" (layout ID: 677677000003294514)
CRM module: Product_Launches (141 fields)

## Skills Available

| Prefix | Skill | Modes |
|--------|-------|-------|
| KI | ikraft-keyword-intelligence | GENERATE, SCAN |
| PD | product-discover | BATCH, SINGLE, TRENDS |
| PS | product-screen | SCORE, REPORT, BRIEF |
| MI | product-market-intelligence | PROFILE, GAPS, TRENDS |
| PE | product-evaluate | DEEP-EVAL, GATE-CHECK, IDEATE |
| MC | margin-calculator | ESTIMATE, ACTUAL, COMPARISON |
| CO | compliance-ops | FEASIBILITY, INITIATION |
| SP | product-spec | SPEC, BOM, BRIEF |
| SI | supplier-intelligence | SEARCH, RANK |
| VO | vendor-ops | DISCOVER, SCORE, RFQ |
| AO | ads-ops | SETUP, MONITOR, OPTIMIZE |
| MO | product-monitor | DAILY, WEEKLY, ALERT |
| FO | fulfillment-ops | SAMPLE |

## Data Integrity Rules

1. Never invent data. If a field is null, report null -- do not estimate.
2. Source everything. Every data point traces to a URL, API response, or user input.
3. Confidence levels are mandatory. HIGH (verified), MEDIUM (single source), LOW (estimated).
4. CRM is the single source of truth. Write to Product_Launches records, not local files.
5. All score updates go to CRM. No local score storage.
6. Slack notifications for alerts go to #ism-launch-alerts, reports to #ism-launch-reports.
7. Confluence pages link from CRM records (field_confluence_url pattern).

## Key Financial Constants

Read from `financial-constants.json`:
- Target gross margin: >= 44%
- Price sweet spot: 800-2000 INR
- Price floor: 1000 INR (brand rule)
- CBFA formula: Price - Cost - (Price * 20%) - 60
- Gate 1: CBFA >= 150, Break-even ACoS <= 50%
- Gate 2 Path A: >= 10 orders AND CVR >= 5%
- Gate 2 Path B: >= 500 impressions AND CTR >= 0.3%

## CRM Configuration

- Module: `Product_Launches` (ID: 645926000008511067)
- Vendors: `Vendors` (ID: 645926000000000099)
- ISM Learnings: `ISM_Learnings` (ID: 645926000009174002)
- Execution Logs: `ISM_ExecutionLogs` (ID: 645926000009175428)
- Field mappings: see `crm-field-mappings.json`

## Integrations

- Zoho CRM: read/write Product_Launches, Vendors, ISM modules
- Zoho Bigin: Product Launch Factory pipeline stage management
- Zoho Books: expense tracking (read-only MCP, 12 tools)
- Zoho Inventory: item and package management (read/write MCP, 26 tools)
- Confluence: research records, compliance tracking, supplier briefs (space: iscom)
- Jira: compliance certification tickets (via CRM-Bigin-Jira automation)
- Slack: #ism-launch-alerts, #ism-launch-reports

## Zone Rotation

7 product zones rotate on a 9-day cycle. Read `zone-rotation.json` for today's zone, seed keywords, and marketplace rotation.
