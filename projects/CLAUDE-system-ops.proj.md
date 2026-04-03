# System Ops -- Project Instruction

## What This Project Is

Ismokraft's system governance, architecture, and internal tooling project. Covers skill quality, plugin management, build infrastructure, Zoho platform design, and organizational standards. Not a product pipeline -- this is the system that builds and maintains the system.

## Scope

- Skill writing, auditing, and lifecycle management
- Plugin build pipeline and marketplace publishing
- Architecture governance (7-Law enforcement, pattern synthesis)
- Business authority (OKR/KPI, GO FEARLESS standards)
- Zoho platform design and development
- Slack message formatting (shared across all projects)
- Artifact building and testing

## Skills Available

| Prefix | Skill | Capability | Modes |
|--------|-------|------------|-------|
| -- | skill-creator | core | *(Anthropic official + ismokraft-standards addendum)* |
| SA | ikraft-skill-auditor | governance | AUDIT, REGISTRY |
| AG | ikraft-architecture-governance | governance | ARCHITECTURE, SYNTHESIZE |
| GA | ism-gap-auditor | governance | AUDIT, ROUTE |
| BA | ism-business-authority | governance | DECIDE, REVIEW |
| OK | okr-kpi-governance | governance | DEFINE, TRACK, REVIEW |
| ZO | zoho-data-ops | platform | *(disable-model-invocation: true)* |
| ZA | zoho-solutions-architect | platform | DESIGN |
| ZD | zoho-developer | platform | BUILD |
| AD | automation-designer | platform | DESIGN |
| SM | slack-messaging | platform | *(auto-trigger on Slack compose)* |

## Plugins

| Plugin | Skills | Domain |
|--------|--------|--------|
| governance-audit | ikraft-skill-auditor | Standards compliance |
| governance-architecture | ikraft-architecture-governance, ism-gap-auditor, slack-messaging | Architecture health |
| governance-business | ism-business-authority, okr-kpi-governance | Business decisions |

## Data Integrity Rules

1. Never invent data. Same rules as Product Pipeline and Launch & Ops.
2. CRM modules: `ISM_Learnings`, `ISM_ExecutionLogs` for system telemetry.
3. All Slack messages route through `slack-messaging` skill for mrkdwn formatting.
4. Decision log (`docs/decision-log.md`) records all architectural decisions with rationale.

## Context Files

- `context/system-ops/resolutions.ctx.md` -- Architecture resolution registry
- `context/system-ops/go-fearless.ctx.md` -- GO FEARLESS quality framework
- `context/system-ops/financial-formulas.ctx.md` -- Shared financial formula reference

## Build Pipeline

```
plugins.yaml -> generate-registry.py -> plugin-registry.json -> build-plugin.py
```

- All plugins defined in `plugins.yaml` (repo root)
- Plugin size limit: 70KB uncompressed
- SKILL.md target: <=5KB
- Build output: `dist/build/{name}/` (marketplace), `dist/{name}.zip` (upload)

## Integrations

- GitHub: skill-share repo, CI/CD via GitHub Actions
- Claude Desktop: plugin upload (.zip format)
- Claude Marketplace: marketplace.json distribution
