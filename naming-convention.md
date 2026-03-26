# Ismokraft Skill Naming Convention

Pattern: `{domain}-{verb}`

Domain prefix groups skills visually. Verb describes what the skill does. Names are short, scannable, and sort alphabetically by domain.

## Prefix Registry

Each skill gets a unique 2-letter prefix used in run IDs and execution logs.

| Domain | Skill Name | Prefix | What it does |
|---|---|---|---|
| **product** | product-discover | PD- | Finds and researches products (BATCH/SINGLE/TRENDS) |
| **product** | product-screen | PS- | Scores, filters, ranks batches (SCORE/REPORT/BRIEF) |
| **product** | product-evaluate | PE- | Deep-evals singles, gate-checks, ideates (DEEP-EVAL/GATE-CHECK/IDEATE) |
| **product** | product-monitor | PM- | Post-launch monitoring and feedback loop (MONITOR/CLASSIFY/FEEDBACK) |
| **vendor** | vendor-discover | VD- | Multi-source supplier discovery and verification |
| **vendor** | vendor-qualify | VQ- | Vendor scoring, RFQ generation |
| **revenue** | revenue-report | RR- | Sales, reconciliation, returns, forecasts, P&L |
| **revenue** | revenue-margin | RM- | Per-unit profitability and channel comparison |
| **revenue** | revenue-plan | RP- | Inventory, cashflow, budget, launch capital planning |
| **content** | content-write | CW- | Articles, listings, blog posts, social, newsletters |
| **ads** | ads-manage | AM- | Ad extraction, campaign planning, performance analysis |
| **zoho** | zoho-architect | ZA- | HLD, LLD, workflow design across Zoho apps |
| **zoho** | zoho-develop | ZD- | Deluge, Flow, Creator, REST API code |
| **zoho** | zoho-automate | ZU- | Workflow and alert specification design |
| **gov** | gov-audit | GA- | Skill standards, maturity, architecture compliance |
| **gov** | gov-learn | GL- | Exception capture, CRM persistence, query learnings |
| **gov** | gov-authority | GB- | Business domain authority, GO FEARLESS standard |
| **gov** | gov-okr | GO- | OKR/KPI definitions, benchmarks, forecasts |
| **ops** | ops-ecosystem | OE- | Skill health, Drive/Confluence publishing, artifact lifecycle |
| **ops** | ops-gaps | OG- | Process and workflow gap detection |
| **ops** | ops-sop | OS- | SOP creation and documentation |
| **ops** | ops-sprint | OT- | Scrum ceremonies, sprint management |
| **founder** | founder-os | FO- | Founder-level strategy across both tracks |
| **skill** | skill-command | SC- | Skill triggering, search, enable/disable |
| **skill** | skill-build | SB- | Skill creation, modification, governance application |
| **market** | market-research | MR- | Competitive landscape, SWOT, SaaS market intelligence |
| **keyword** | keyword-generate | KG- | Daily keyword intelligence for product research |

## Rules

1. Domain is always a noun (product, vendor, revenue, content, ads, zoho, gov, ops, founder, skill, market, keyword).
2. Verb is always an action (discover, screen, evaluate, monitor, write, manage, architect, develop, automate, audit, learn, plan, build, command, research, generate).
3. No company prefix (ism-, ikraft-) in skill names. The repo itself is ismokraft-system.
4. Prefix is unique across all skills. Two letters, uppercase, followed by hyphen.
5. When creating a new skill, check this registry for prefix conflicts before assigning.
