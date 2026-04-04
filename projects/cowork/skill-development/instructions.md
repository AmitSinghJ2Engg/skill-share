# Skill Development — Cowork Project Instructions

## What This Project Is

Execution context for writing, testing, and publishing new skills. Uses skill-creator (Anthropic official + ismokraft-standards addendum) for authoring and ikraft-skill-auditor for validation. No parent Chat project — this is a development environment.

## Plugins

Install these plugins in Claude Desktop:
- **governance-audit** — SA (skill auditor)

## Active Skills

| Prefix | Skill | Modes Used |
|--------|-------|------------|
| -- | skill-creator | (Anthropic official + ismokraft-standards) |
| SA | ikraft-skill-auditor | AUDIT |
| ZO | zoho-data-ops | (operational writes) |
| SM | slack-messaging | (auto) |

## Workflow

1. Read `docs/02-business-domain-map.md` for skill spec
2. Read `skills/core/skill-creator/references/ismokraft-standards.md` for conventions
3. Use skill-creator to author SKILL.md
4. Run `SA AUDIT` to validate against standards
5. Build plugin: `python make.py build --plugin {name}`
6. Test locally: `claude --plugin-dir dist/build/{name}.plugin`

## Standards Reference

- `docs/01-system-constraints.md` — platform limits
- `docs/02-business-domain-map.md` — domain definitions, skill mapping
- `docs/03-implementation-standards.md` — build standards
- `skills/core/skill-creator/references/ismokraft-standards.md` — project conventions

## Context Files

Read from `context/system-ops/`:
- resolutions.ctx.md — architecture resolution registry
- go-fearless.ctx.md — GO FEARLESS quality framework

## Build Commands

- `python make.py validate` — validate all plugins
- `python make.py build` — build all plugins
- `python make.py build --plugin {name}` — build one plugin
- `python make.py build-skills` — build standalone skills

## Integrations

- GitHub: skill-share repo
- Claude Desktop: plugin testing
