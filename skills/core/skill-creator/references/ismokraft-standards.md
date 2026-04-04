# Ismokraft Skill Standards

Project-specific conventions that supplement the general skill-writing guide.
Apply these when creating or modifying skills for the Ismokraft system.

## SKILL.md Structure

- **Size target:** <=5KB. Move detailed schemas, step sequences, and scoring rubrics to `references/`.
- **Description:** First 250 chars = core purpose (visible in listing). Up to 1024 chars total. Must include WHAT (action verb) and WHEN (trigger phrases).
- **Directory:** `references/` (plural). Never `reference/` (singular).
- **Naming:** kebab-case only. Must match folder name.

## Required Frontmatter

```yaml
---
name: skill-name
description: >
  PREFIX- What it does. Trigger for: "phrase1", "phrase2", "PREFIX-".
version: "1.0.0"
lifecycle: prototype
metadata:
  domain: capability-group
  prefix: XX-
---
```

Optional fields: `disable-model-invocation`, `allowed-tools`, `argument-hint`.

## Content Conventions

- **Mode table:** Every multi-mode skill needs `| Mode | Purpose | Trigger |` at the top.
- **Session protocol:** List reference files to read at session start.
- **Boundary statement:** State what the skill does NOT do (single responsibility).
- **S22 (no-fake-data):** Every skill that touches data must declare S22 compliance.
- **No hardcoded business values.** Reference `context/` files for thresholds, fee tables, formulas.
- **Exception handling section:** List what to do when inputs are missing or edge cases occur.
- **Reference files table:** Always end SKILL.md with a table of reference files and when to read them.

## Sections to Avoid in SKILL.md

These belong in `references/` files, NOT in SKILL.md:
- Full JSON schemas (input/output) — move to `references/schemas-and-steps.md`
- Detailed scoring rubrics, formulas, weights — move to dedicated reference files
- Governance contracts (`skill_name`, `write_permissions`, `measurable_kpis`) — non-standard, remove
- Dependency metadata (`upstream_skills`, `downstream_skills`) — non-standard, remove
- Execution log templates — non-standard, remove
- Session learnings logs — belongs in CRM/learning engine
- Related skills table — only if pointing to real, existing skills (never ghost references)

## Three-Layer Architecture

| Layer | Location | Packaged in plugin? |
|---|---|---|
| SKILL.md | `skills/{capability}/{name}/SKILL.md` | Yes |
| References | `skills/{capability}/{name}/references/` | Yes |
| Project context | `context/{domain}/` | No (loaded via project knowledge) |

Move shared models and large reference data to `context/` to keep plugin size under 70KB.

## Capability Groups

Skills are organized by business capability, not by plugin:
research, evaluation, finance, marketing, sourcing, operations, learning, platform, governance, core, founder.

## Slack Messaging Rule

All Slack output in the Ismokraft system MUST route through the `slack-messaging` skill (prefix SM-). This applies to:
- Automated task summaries and alerts
- Gate decision notifications
- Kill/park alerts
- Artifact "Send to Slack" payloads
- Any manual Slack compose

Skills and tasks that produce Slack output must include a step: "Format message using `slack-messaging` skill before posting." Never call `slack_send_message` directly without first applying mrkdwn formatting via this skill.

## Plugin Definitions

Plugins are defined in `plugins.yaml` (repo root). Skills can appear in multiple plugins.
Plugin builds must stay under 70KB uncompressed. Currently 11 plugins:
- Pipeline: product-discovery, product-evaluation, product-sourcing, product-testing, product-launch, product-ops
- Standalone: supplier-research, revenue-analytics
- Governance: governance-audit, governance-architecture, governance-business

## Ghost Skill Prevention

Only reference skills that have a SKILL.md in this repo. Current confirmed skills (28):
- research: ikraft-keyword-intelligence, product-discover, product-screen, product-market-intelligence, supplier-intelligence
- evaluation: product-evaluate, product-spec, compliance-ops
- finance: margin-calculator, capital-planner, revenue-ops
- marketing: content-writer, ads-ops
- sourcing: vendor-ops
- operations: fulfillment-ops, product-monitor, ecosystem-ops
- learning: ism-learning-engine (placeholder)
- platform: zoho-solutions-architect, zoho-developer, zoho-data-ops, slack-messaging
- governance: ikraft-skill-auditor, ikraft-architecture-governance, ism-gap-auditor, ism-business-authority, okr-kpi-governance
- core: skill-creator
- founder: ism-founder

Do NOT reference: ism-skill-factory, ism-scrum-master, ism-sop-builder, automation-designer, artifacts-builder-v2, skill-commander, product-intelligence, product-pipeline, product-lab, market-intelligence-research. These are retired/never-built.

## Security Rules

- **No XML angle brackets** (`<`, `>`) in frontmatter values. Use plain text or quotes.
- **No "claude" or "anthropic"** in skill names. These are reserved by the platform.
- **No README.md** inside skill directories. SKILL.md is the entry point; README.md would conflict with Claude's file discovery.

## Composability

- Skills must function independently. No hard cross-skill dependencies (no `import` or `require` of another skill).
- A skill may reference another skill in its "Related Skills" table for informational purposes, but must never block execution if that skill is absent.
- Cross-skill data exchange happens through CRM or task orchestration, not direct skill-to-skill calls.

## Description Structure

Three-part format for the `description` frontmatter field:

```
PREFIX- What it does (verb phrase). When to use: "trigger phrase 1", "trigger phrase 2".
Capabilities: mode1 (does X), mode2 (does Y).
```

- First 250 chars: PREFIX + WHAT + WHEN. This is visible in skill listings.
- Chars 251-1024: Capabilities, additional triggers. Still used for matching but truncated in UI.

## Task Bundles

Tasks are organized as bundles under `tasks/{workflow}/{task-name}/`:
- `config.yaml` — metadata: name, version, type, schedule, skills invoked, working dirs
- `description.md` — 5-10 line summary
- `prompt.md` — full orchestration steps
- `references/README.md` — links to context files, plugins, CRM modules

Tasks invoke skills by mode. They do not reference skill-internal files (references/, scripts/).

## Build Conventions

- **Plugin naming:** Build output uses `.plugin` suffix: `dist/build/{name}.plugin/`
- **Upload format:** `.plugin.zip` wrapping contents in `{name}.plugin/` top-level folder
- **Standalone skills:** `dist/.claude/skills/{skill-name}/` for `~/.claude/skills/` deployment
- **dist/ not tracked:** All build output is gitignored. Rebuild with `python make.py build`.
