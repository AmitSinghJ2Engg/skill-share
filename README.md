# Ismokraft System

Multi-module skill repository for Ismokraft's AI-assisted business operations.

## Structure

Each module follows the same layout:

```
module-name/
├── project-knowledge/    # Files to attach in Claude Desktop project
│   └── *.md              # Always-in-context domain knowledge
├── skills/
│   └── skill-name/
│       ├── SKILL.md      # Skill entrypoint (under 500 lines)
│       └── reference/    # On-demand reference files (loaded when needed)
└── packages/
    └── *.skill           # Built skill packages (zip of skill directory)
```

**Rule: No duplication between project-knowledge/ and skill reference/ files.** Project knowledge = shared context always loaded. Skill reference/ = skill-specific details loaded on demand.

## Modules

| Module | Status | Skills | Domain |
|--------|--------|--------|--------|
| product-system | Active | product-intelligence, product-pipeline, product-lab, launch-tracker, ikraft-keyword-intelligence | Product discovery → evaluation → pipeline → launch → monitoring |
| vendor-sourcing | Planned | vendor-ops, supplier-intelligence | Supplier discovery, verification, RFQ |
| revenue-finance | Planned | revenue-ops, margin-calculator, capital-planner | Sales reports, unit economics, cash flow |
| marketing-content | Planned | content-writer, ads-ops | Listings, blog posts, PPC campaigns |
| zoho-platform | Planned | zoho-solutions-architect, zoho-developer, automation-designer | Zoho design, Deluge code, workflows |
| governance | Planned | ikraft-skill-governance, ism-learning-engine, ism-business-authority, okr-kpi-governance | Standards, learnings, business judgment |
| operations | Planned | ecosystem-ops, ism-gap-auditor, ism-sop-builder, ism-scrum-master | System health, SOPs, sprints |
| founder-os | Planned | ism-founder | Cross-track strategy |
| skill-management | Planned | skill-commander, ism-skill-factory | Skill creation and control |
| market-research | Planned | market-intelligence-research | Competitive landscape analysis |

## How to use

1. **Project knowledge**: Attach files from `module/project-knowledge/` to your Claude Desktop project
2. **Skills**: Install `.skill` packages from `module/packages/` or copy skill directories to `.claude/skills/`
3. **Updates**: Edit canonical files here, rebuild .skill packages, re-attach project knowledge

## Conventions

- All reference files are markdown (.md) — not JSON
- SKILL.md stays under 500 lines; overflow goes to reference/ files
- Reference files are one level deep from SKILL.md (no nested references)
- Skills reference project-knowledge content by saying "available in project knowledge" — no file reads needed for shared context
- Memory/learnings use Cowork auto-memory, not custom files
