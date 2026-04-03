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
  What it does. Trigger for: "phrase1", "phrase2", "PREFIX-".
metadata:
  version: "1.0.0"
  domain: capability-group
  prefix: XX-
---
```

Optional fields: `disable-model-invocation`, `allowed-tools`, `argument-hint`.

## Content Conventions

- **Mode table:** Every multi-mode skill needs `| Mode | Purpose | Trigger |` at the top.
- **Session protocol:** List reference files to read at session start.
- **Boundary statement:** State what the skill does NOT do (single responsibility).
- **S22 (no-fake-data):** Skills that write to CRM must declare S22 compliance.
- **No hardcoded business values.** Reference `context/` files for thresholds, fee tables, formulas.

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
Plugin builds must stay under 70KB uncompressed.
