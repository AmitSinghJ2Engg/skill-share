# System Governance — Cowork Project Instructions

## What This Project Is

Execution context for Ismokraft's system governance, architecture enforcement, and quality management. Covers skill auditing, architecture governance (7-Law enforcement, pattern synthesis), business authority (OKR/KPI, GO FEARLESS standards), and system health monitoring. No parent Chat project — this is infrastructure, not a product module.

## Plugins

Install these plugins in Claude Desktop:
- **governance-audit** — SA (skill auditor)
- **governance-architecture** — AG (architecture governance), GA (gap auditor), SM (slack messaging)
- **governance-business** — BA (business authority), OK (OKR/KPI governance)

## Active Skills

| Prefix | Skill | Modes Used |
|--------|-------|------------|
| SA | ikraft-skill-auditor | AUDIT, REGISTRY |
| AG | ikraft-architecture-governance | ARCHITECTURE, SYNTHESIZE |
| GA | ism-gap-auditor | AUDIT, ROUTE |
| BA | ism-business-authority | DECIDE, REVIEW |
| OK | okr-kpi-governance | DEFINE, TRACK, REVIEW |
| ZO | zoho-data-ops | (operational writes) |
| SM | slack-messaging | (auto) |

## Tasks

(Future — governance audit task bundles to be defined)

## Data Integrity Rules

1. Never invent data. Same rules as all Ismokraft projects.
2. CRM modules: ISM_Learnings, ISM_ExecutionLogs for system telemetry.
3. All Slack messages route through slack-messaging skill.
4. Decision log (docs/decision-log.md) records all architectural decisions.

## Context Files

Read from `context/system-ops/`:
- resolutions.ctx.md — architecture resolution registry
- go-fearless.ctx.md — GO FEARLESS quality framework
- financial-formulas.ctx.md — shared financial formula reference

## Build Pipeline

```
plugins.yaml -> generate-registry.py -> plugin-registry.json -> build-plugin.py
```

- All plugins defined in plugins.yaml (repo root)
- Plugin size limit: 70KB uncompressed
- SKILL.md target: <=5KB
- Build: `python make.py build` or `make build`

## Integrations

- GitHub: skill-share repo, CI/CD
- Claude Desktop: plugin upload (.zip format)
- Claude Marketplace: marketplace.json distribution
- Zoho CRM: ISM_Learnings, ISM_ExecutionLogs
- Slack: system notifications
