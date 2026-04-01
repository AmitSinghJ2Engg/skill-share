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
| [decision-log.md](decision-log.md) | Architectural decisions with rationale (DL-001 through DL-005) |
| [build-status.md](build-status.md) | Phase-based progress tracker (Phase 0-4 + Claude Desktop Setup) |

## Project Instructions (for Claude.ai Desktop / Cowork)

| File | Project | Domains |
|------|---------|---------|
| [projects/CLAUDE-product-pipeline.proj.md](projects/CLAUDE-product-pipeline.proj.md) | Product Pipeline | D1-D2.5 (discovery through testing) |
| [projects/CLAUDE-launch-ops.proj.md](projects/CLAUDE-launch-ops.proj.md) | Launch & Ops | D3-D4 (launch through live operations) |

## Task Instructions (for Claude Desktop scheduler)

Naming: `{project}-{type}-{trigger}-{action}.task.md` (type = scheduled/manual)

| File | Schedule | Skills |
|------|----------|--------|
| [tasks/product-pipeline-scheduled-daily-discovery.task.md](tasks/product-pipeline-scheduled-daily-discovery.task.md) | Daily 7 AM IST | KI, PD, PS |

Pending: stage2-intelligence, stage3-vendor-search, daily-learning (see build-status.md)

## Archive (superseded, keep for reference)

| File | Why archived |
|------|-------------|
| [archive/CLAUDE-deprecated.md](archive/CLAUDE-deprecated.md) | Old single-plugin CLAUDE.md, replaced by project-specific instructions |
| [archive/gate-definitions-superseded.md](archive/gate-definitions-superseded.md) | Old 8-gate model, replaced by 3 gates + stage checklists (DL-001) |
| [archive/architecture-v5-old.md](archive/architecture-v5-old.md) | Old architecture doc, superseded by 01-03 series |
