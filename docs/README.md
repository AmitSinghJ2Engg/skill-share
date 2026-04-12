# Documentation Index

## Architecture (read in order)

| File | What | Size |
|------|------|------|
| [01-system-constraints.md](01-system-constraints.md) | Platform limits, SKILL.md spec, plugin constraints, marketplace, financial constants | 14 KB |
| [02-business-domain-map.md](02-business-domain-map.md) | Domains, skills, artifacts, build order, CRM architecture, data flows | 72 KB |
| [03-implementation-standards.md](03-implementation-standards.md) | How to build skills, plugins, artifacts, projects, tasks | 32 KB |
| [04-data-schemas.md](04-data-schemas.md) | JSON schemas for data types (skeleton) | 2 KB |
| [05-data-crawling-rules.md](05-data-crawling-rules.md) | Web crawling and data collection rules | 2 KB |
| [data-integrity-rules.md](data-integrity-rules.md) | 7 non-negotiable data rules | 1 KB |

## Decisions & Tracking

| File | What |
|------|------|
| [decision-log.md](decision-log.md) | Architectural decisions with rationale (DL-001 through DL-025) |
| [build-status.md](build-status.md) | Phase-based progress tracker (Phase 0-4 + Claude Desktop Setup) |

## Project Definitions (DL-015)

Moved to `projects/chat/` and `projects/cowork/`. See `03-implementation-standards.md` section 4 for hierarchy.

**Chat Projects (claude.ai — 7 modules):**

| Directory | Module | Domains |
|-----------|--------|---------|
| `projects/chat/ism-product-research/` | Product Research | D1, D1.5 |
| `projects/chat/ism-sourcing/` | Sourcing | D2 |
| `projects/chat/ism-market-testing/` | Market Testing | D2.5 |
| `projects/chat/ism-portfolio/` | Portfolio | Cross-domain |
| `projects/chat/ism-launch-control/` | Launch Control | D3 |
| `projects/chat/ism-live-ops/` | Live Ops | D4 |
| `projects/chat/ism-procurement/` | Procurement | S2P |

**Cowork Projects (Claude Desktop — 5 execution contexts):**

| Directory | Chat Parent |
|-----------|-------------|
| `projects/cowork/daily-discovery/` | ism-product-research |
| `projects/cowork/product-evaluation/` | ism-product-research |
| `projects/cowork/test-campaign/` | ism-market-testing |
| `projects/cowork/system-governance/` | (none) |
| `projects/cowork/skill-development/` | (none) |

## Workflow Skills (DL-025: tasks are skills)

Per DL-025, tasks are skills with `disable-model-invocation: true` under `skills/workflow/`. The old `tasks/` directory is retired.

| Skill | Type | Schedule | Plugin |
|---|---|---|---|
| `/test-launch-prep` | interactive | — | workflow-ops |
| `/campaign-plan` | interactive | — | workflow-ops |
| `/campaign-analysis` | interactive | — | workflow-ops |
| `/scale-decision` | interactive | — | workflow-ops |
| `/daily-discovery` | scheduled | Daily 7:00 AM IST | workflow-ops |
| `/daily-ads-analysis` | scheduled | Daily 10:00 AM IST | workflow-ops |

Invoke via `/name` in Claude Code or load as project knowledge in claude.ai Chat projects.

## Archive (superseded, keep for reference)

| File | Why archived |
|------|-------------|
| [archive/CLAUDE-deprecated.md](archive/CLAUDE-deprecated.md) | Old single-plugin CLAUDE.md, replaced by project-specific instructions |
| [archive/gate-definitions-superseded.md](archive/gate-definitions-superseded.md) | Old 8-gate model, replaced by 3 gates + stage checklists (DL-001) |
| [archive/architecture-v5-old.md](archive/architecture-v5-old.md) | Old architecture doc, superseded by 01-03 series |
