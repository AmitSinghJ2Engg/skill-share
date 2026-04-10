# Ismokraft Skill Standards

Project-specific conventions that supplement the general skill-writing guide.
Apply these when creating or modifying skills for the Ismokraft system.

## Architecture Reference

For deeper context on system constraints, business domains, and implementation
standards, consult these repo docs before authoring skills:

- `docs/01-system-constraints.md` — platform limits (plugin 70KB, artifact sandbox, MCP list)
- `docs/02-business-domain-map.md` — domain definitions, skill-to-domain mapping, CRM architecture
- `docs/03-implementation-standards.md` — build standards for skills, plugins, artifacts, projects, tasks
- `docs/decision-log.md` — architectural decisions with rationale (DL-001 through DL-019)

These files live in the repo root and are NOT bundled into the skill-creator plugin.
Read them from the working directory when authoring or auditing skills.

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

## Pre-Flight Check Before Creating a New Skill (DL-019 Rule B)

A new skill is the heaviest unit of capability in this repo — it gets a SKILL.md, a `references/` folder, plugin slot(s), governance audit coverage, lifecycle metadata, and prefix routing. Creating one when an existing skill could absorb the work is the most common form of duplication in this system.

Before creating a new skill, run this pre-flight check:

1. **Identify the capability group** the new skill would live in (research, evaluation, marketing, etc.).
2. **List the existing skills in that group.** `ls skills/{capability}/`. For each, read the `description` field in its SKILL.md frontmatter and the mode table at the top of the body.
3. **Compare trigger surface and rules.** Ask: would the new skill share most of its rules, schemas, references, or trigger phrases with an existing skill? If ~70%+ overlap, it is a sub-mode of an existing skill, not a new skill.
4. **Decide and document.**

| Situation | Right answer |
|---|---|
| Same capability group, same domain, ~70%+ overlap in rules/schemas/triggers | Add a new **mode or sub-mode** to the existing skill. Extend its `description` triggers. Add to `references/`. Do NOT create a new skill directory. |
| Same capability group, but distinct trigger surface, distinct lifecycle, or significantly different references | Create a new skill. Justify the split in the decision log if it's a non-obvious call. |
| Different capability group | Create a new skill in its own group. |
| The "skill" is really an execution pattern (parallel fan-out, context isolation, independent grading) | Not a skill at all — write it inline in a task's `prompt.md`. See "Subagents Are Not a Primitive" below. |

**The listing-optimizer episode (DL-019) is the precedent.** A would-be new skill turned out to overlap ~80% with `content-writer` LISTING mode. The right move was a new AUDIT sub-mode + Shopify rules in the existing skill, not a parallel `skills/marketing/listing-optimizer/` directory.

## Subagents Are Not a Primitive (DL-019 Rule A)

Claude Code subagents (`.claude/agents/*.md`) are NOT a primitive in the Chat → Cowork → Task → Plugin → Skill hierarchy. They are an *execution mode* available inside tasks, with exactly three legitimate uses:

1. **Context isolation** — heavy reads (large CRM pulls, big context files) that should not pollute the parent task's context window.
2. **Parallel fan-out** — independent operations the parent could run sequentially but would benefit from running in parallel (e.g., one subagent per product zone in `daily-discovery`).
3. **Independent grading** — a reviewer that hasn't seen the parent's reasoning, used for genuinely independent QA passes.

**Domain expertise — workflow + output format + rules + system prompt content — must live in a skill, not in `.claude/agents/`.** Hosting expertise as an agent puts it outside the build pipeline, plugin registry, size budgets, lifecycle metadata, prefix routing, governance audit, and the central `MEMORY.md` system. It also makes the capability invisible to Chat projects (claude.ai has no subagents).

If a task genuinely needs subagent-style execution, write the spawn inline in the task's `prompt.md` ("spawn a subagent that loads skill X and does Y") rather than creating a standalone agent file. The subagent is anonymous; the expertise stays in the skill.

`.claude/agents/` is empty by default and should remain empty unless a new agent file carries an explicit decision-log justification that it is *not* domain expertise belonging in a skill.

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
Plugin builds must stay under 70KB uncompressed. Currently 12 plugins:
- Pipeline: product-discovery, product-evaluation, product-sourcing, product-testing, product-launch, product-ops
- Standalone: supplier-research, revenue-analytics
- Platform: platform-io
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
- **dist/build/ tracked:** Plugin build directories (`dist/build/*.plugin/`) are tracked in git for marketplace. Zips and standalone skill output are gitignored.
