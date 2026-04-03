# Implementation Standards

**Version:** 1.0
**Date:** 2026-03-27
**Purpose:** Defines how every component (skill, plugin, artifact, project, task) is built, structured, named, and maintained. Follow these standards exactly.

---

## 1. Skill Writing Standards

### SKILL.md Structure

```markdown
---
name: skill-name
description: >
  Up to 1024 characters total (first 250 visible in skill listing, rest truncated but still
  used for triggering). Front-load purpose + primary trigger in first 250 chars. Include WHAT,
  WHEN, and key trigger phrases. Be pushy. This is always in context — the body loads only when triggered.
version: "1.0.0"
lifecycle: prototype
---

# {Skill Name}

## Purpose
2-3 sentences. What this skill does and when to use it.

## Modes
List each mode with: name, what it takes as input, what it produces as output.

## Input Contract
What data this skill expects. Be explicit about required vs optional fields.

## Output Contract
What data this skill produces. Include the JSON shape or field list.

## Execution Steps
Numbered steps the skill follows. Keep to 5-10 steps per mode.

## Trigger Phrases
Comma-separated list of phrases that should activate this skill.
```

### Rules
- SKILL.md body: **under 5 KB** (under 3 KB preferred).
- No business thresholds, no formulas, no CRM field names, no picklists in SKILL.md.
- Those values come from project context files at runtime.
- The skill says "read gate criteria from project context" — it does not say "CBFA ≥ ₹150".
- No code blocks in SKILL.md unless they define input/output JSON shapes.
- Trigger description in frontmatter: include the skill's prefix code (e.g., "PD-", "PE-").
- Frontmatter `version` follows semver: MAJOR.MINOR.PATCH. Bump PATCH for content fixes, MINOR for new modes, MAJOR for breaking I/O contract changes. Version is quoted as a string (e.g., `"1.0.0"`).
- Frontmatter `lifecycle` tracks skill maturity: `prototype` (newly written, not validated), `active` (validated and in use), `stable` (proven across multiple products). New skills start as `prototype`. Promote after successful execution and human review.

### Trimming Checklist (for all skills)

When trimming an existing SKILL.md to meet the 5 KB target:

1. **Keep:** Frontmatter, purpose, mode table, execution steps (5-10 per mode), input validation, halt conditions, rules, trigger phrases.
2. **Move to project context:** Any business value (thresholds, CRM fields, rotation schedules, zone configs) — reference the JSON filename in the execution step.
3. **Move to references/:** Detailed methodology, scoring rubrics, protocol details, related skill maps — reference inline when the execution step needs it.
4. **Remove:** Redundant pointers to project knowledge, verbose phase descriptions that can be compressed, execution log templates, metadata already in frontmatter.
5. **Test:** Read only the trimmed SKILL.md + context file specs. Can you execute every mode? If any step is too vague, add specificity (not detail — specificity).

### Skill Directory Structure

Each skill is a directory containing SKILL.md plus optional supporting files. Claude loads supporting files on demand when SKILL.md references them. This follows the [Agent Skills](https://agentskills.io) open standard.

```
my-skill/
  SKILL.md              # Main instructions (required)
  references/           # Detailed methodology, rubrics, protocols (plural, per Claude skill-creator convention)
    scoring-rubric.md
    source-protocols.md
  scripts/              # Executable logic (Python, shell)
    calculate.py
  templates/            # Templates for Claude to fill in
    report-template.md
  examples/             # Example outputs showing expected format
    sample-output.md
```

Reference supporting files from SKILL.md so Claude knows what they contain and when to load them:
```markdown
For full scoring tiers, see [references/scoring-rubric.md](references/scoring-rubric.md).
```

Use `${CLAUDE_SKILL_DIR}` in bash commands to reference bundled scripts regardless of working directory.

### Three-Layer Information Architecture

Skills, project knowledge, and supporting files serve different purposes. See `docs/decision-log.md` DL-002 (revised DL-005).

| Layer | What | Where | In Plugin? |
|-------|------|-------|-----------|
| **SKILL.md** | Instructions + navigation to supporting files | `skills/{package}/{skill}/SKILL.md` | Yes |
| **Supporting files** | Methodology, rubrics, scripts, templates | `skills/{capability}/{skill}/references/`, `scripts/`, etc. | Yes (counts toward 70 KB) |
| **Project Knowledge** | Runtime values: thresholds, CRM fields, gate criteria | `context/{project}/` -> deployed to Claude.ai | No (deployed separately) |

- SKILL.md references supporting files inline when the execution step needs detailed methodology.
- Supporting files are packaged into the plugin and loaded on demand at runtime.
- Project context supplies business values that change independently (thresholds, CRM fields, rotation schedules).
- Keep SKILL.md under 500 lines. Move detailed reference material to supporting files.
- Total skill directory (SKILL.md + supporting files) counts toward the 70 KB plugin limit.

### When to use scripts/

Use `scripts/` when a skill needs deterministic computation, file generation, or external tool orchestration that is better expressed as executable code than as Claude instructions.

Examples: margin-calculator (financial formulas), compliance-ops (checklist PDF generation), ads-ops (bid calculation), codebase visualization.

SKILL.md provides the orchestration instructions; scripts/ provides the executable logic. The skill's `allowed-tools` frontmatter should include `Bash(python *)` or similar to permit script execution.

### Frontmatter: allowed-tools

Skills with `scripts/` MUST declare `allowed-tools` in frontmatter to permit script execution without permission prompts. Example: `allowed-tools: ["Bash(python *)"]`. Only list tools the skill actually needs.

### Frontmatter: disable-model-invocation

Operational skills that perform writes to external systems (CRM, inventory, Slack) SHOULD use `disable-model-invocation: true` to prevent accidental auto-invocation. These skills should only be triggered deliberately by the user or by a task instruction.

### Interactive context gathering

Skills can gather context by asking clarifying questions before executing. This mimics Anthropic's marketplace plugins (e.g., Finance plugin asks for account details before generating journal entries). Design skills to:
- Use `description` frontmatter to tell Claude when to auto-invoke
- Include structured prompts in SKILL.md for gathering missing inputs (e.g., "If zone_id not provided, ask user which zone to target")
- For complex multi-step input, consider a SETUP.md skill that guides initial configuration

### Naming Convention
`{domain}-{verb}` or `{domain}-{noun}` in kebab-case.
Examples: product-discover, product-evaluate, vendor-ops, margin-calculator.

### Skill Prefix Registry

Every skill has a 2-letter prefix code. This prefix appears at the start of the SKILL.md frontmatter `description` field (e.g., `"PD- Crawls Amazon marketplace..."`). Used in ISM Execution Logs, trigger tracing, and session audit trails.

**Product Pipeline (17 skills):**

| Prefix | Skill | Domain |
|---|---|---|
| KI | ikraft-keyword-intelligence | D1 |
| PD | product-discover | D1 |
| PS | product-screen | D1 |
| MI | product-market-intelligence | D1 |
| PE | product-evaluate | D1 + D1.5 |
| MC | margin-calculator | D1, D2, D2.5 |
| CO | compliance-ops | D1, D2, D3 |
| SP | product-spec | D2 |
| SI | supplier-intelligence | D2 |
| VO | vendor-ops | D2 |
| FO | fulfillment-ops | D2.5, D3 |
| AO | ads-ops | D2.5, D4 |
| MO | product-monitor | D2.5, D4 |
| CW | content-writer | D3 |
| CP | capital-planner | D3 |
| RO | revenue-ops | D4 |
| LE | ism-learning-engine | D4 |

**Zoho Platform (4):** ZA zoho-solutions-architect, ZD zoho-developer, ZO zoho-data-ops, AD automation-designer

**Governance & System (8):** EO ecosystem-ops, SF ism-skill-factory, IG ikraft-skill-auditor, AG ikraft-architecture-governance, AU ism-gap-auditor, SC skill-commander, SB ism-sop-builder, OG okr-kpi-governance

**Founder & Ops (3):** IF ism-founder, SM ism-scrum-master, BA ism-business-authority

**Content (1):** DC doc-coauthoring

**Artifact Builders (2):** AB artifacts-builder-v2, WB web-artifacts-builder

**File Format (4):** DX docx, XL xlsx, PT pptx, PF pdf

**Utility (6):** MB mcp-builder, MG mcp-guide, IC internal-comms, GC slack-gif-creator, WT webapp-testing, SM slack-messaging

---

## 2. Plugin Building Standards

### Hierarchy

```
Project -> Tasks -> Plugins -> Skills
```

Each level is isolated and owns its own definition. Composition happens at the parent level — skills don't know about plugins, plugins don't know about other plugins. The central registry (`tools/plugin-registry.json`) is a **generated build artifact**, not a source file.

### Plugin Definition (plugins.yaml)

All plugin definitions live in a single `plugins.yaml` at the repo root (see DL-011). Skills are organized by business capability (research, evaluation, finance, marketing, etc.), not by plugin.

```yaml
plugins:
  plugin-name:
    description: "What this plugin provides. Up to 1024 characters."
    version: "1.0.0"
    project: "Product Pipeline"
    skills:
      - skill: skill-dir-name
        from: capability-group
```

Each skill entry specifies the skill directory name and the capability group it lives in.

### Built Plugin Layout

The build script assembles the following structure at `dist/build/{plugin-name}/`:

```
.claude-plugin/
  plugin.json               # Generated by build-plugin.py (author metadata)
skills/
  skill-a/
    SKILL.md
    reference/              # Supporting files -- packaged into plugin
      methodology.md
    scripts/                # Executable scripts -- packaged into plugin
      compute.py
  skill-b/
    SKILL.md
.mcp.json                   # MCP server/connector definitions (optional)
agents/                     # Custom agent definitions (optional)
hooks/                      # Event handlers (optional)
  hooks.json
settings.json               # Default settings (optional)
```

Supporting files (reference/, scripts/, templates/, examples/) are packaged into the plugin alongside SKILL.md. They count toward the 70 KB limit.

### Connectors (.mcp.json)

Plugins can declare which MCP servers they need to function. Place `.mcp.json` at the package root (`skills/{package}/.mcp.json`) and the build script copies it into the plugin.

```json
{
  "mcpServers": {
    "zoho-crm": {
      "command": "npx",
      "args": ["@anthropic/zoho-crm-mcp"],
      "env": {
        "ZOHO_CLIENT_ID": "${user_config.zoho_client_id}"
      }
    }
  }
}
```

Use `${CLAUDE_PLUGIN_ROOT}` to reference scripts bundled with the plugin. Use `userConfig` in plugin.json to prompt for credentials at install time.

The build script also picks up `agents/`, `hooks/hooks.json`, and `settings.json` from the package root if present.

### Plugin-to-Task Relationship

One plugin serves multiple business tasks. Example: product-discovery plugin contains 4 skills (KI, PD, PS, MI) that are used by daily discovery tasks, single research tasks, trend scanning, screening, and competitive profiling. The plugin provides capabilities; tasks orchestrate when and how those capabilities run.

### Rules
- Total uncompressed content (SKILL.md + supporting files + plugin.json): **under 70 KB**.
- Supporting files (reference/, scripts/) ARE included in the plugin. They provide detailed methodology and executable logic that skills need at runtime.
- Business values (thresholds, CRM fields, rotation schedules) belong in project context -- NOT in the plugin.
- **Maximum 5 skills per plugin.** If a domain needs more, split into sibling plugins.
- The **same skill directory may appear in multiple plugins** where a skill serves multiple domains. Each SKILL.md covers all modes; project context supplies mode-specific data.
- Plugin is independently useful -- no dependency on another plugin being installed.
- Plugin name: kebab-case, descriptive of the domain it covers.
- Version: semver. MAJOR = breaking change, MINOR = new skill added, PATCH = skill content fix.
- "Related Skills" sections in SKILL.md are informational only — they do not drive the build.

### Build Process
1. **Define** the plugin: add an entry to `plugins.yaml` with name, description, version, and skill includes.
2. Each skill entry specifies the capability group and skill directory name.
3. **Generate registry:** `python tools/generate-registry.py` reads `plugins.yaml` and produces `tools/plugin-registry.json`.
4. **Validate:** `python tools/validate-system.py --check-only` checks I/O contracts, references, budgets.
5. **Build:** `python tools/build-plugin.py --plugin <name>` assembles to `dist/build/{plugin-name}/`.
6. **Review** the intermediate build directory.
7. **Package:** re-run with `--confirm` to zip to `dist/{plugin-name}.zip`.
8. Test locally: `claude --plugin-dir dist/build/{plugin-name}` to verify skills load.
9. Test upload: install in Claude Desktop Cowork.

Or use the unified entry point: `python tools/build.py --all` (or `--plugin <name>`).

### Skill-to-Plugin Dependency Map

Skills that appear in multiple plugins require all affected plugins to be rebuilt when the skill changes. The build script derives shared skill dependencies automatically from `tools/plugin-registry.json` — any skill appearing in 2+ plugins is detected and reported. No separate dependency file is needed.

When building a specific plugin, the script reports which shared skills are included. When a skill version changes, it reports which other plugins need rebuilding.

### Build Tools

| Script | Purpose |
|--------|---------|
| `tools/generate-registry.py` | Reads `plugins.yaml` -> generates `tools/plugin-registry.json` |
| `tools/build-plugin.py` | Builds one or all plugins from the registry |
| `tools/validate-system.py` | Cross-cutting validation, manifest + marketplace generation |
| `tools/build.py` | Unified entry point that chains all the above |
| `tools/build-skill.py` | Packages a single skill folder into a .skill zip (standalone) |

`plugin-registry.json` is generated — do not edit it manually. To add/change skills in a plugin, edit `plugins.yaml` and re-run `generate-registry.py`.

---

## 3. Artifact Standards

### File Format
- Single `.jsx` file.
- React 18 functional components with hooks.
- Tailwind CSS core utilities for styling.
- No TypeScript. No external imports beyond: recharts, lucide-react, shadcn/ui, d3, lodash, papaparse, sheetjs. Artifacts using real-time AI analysis (Positioning Workbench and Test Lab B only) may additionally import the Anthropic API client.

### Structure Template

```jsx
// {Artifact Name} v{MAJOR}.{MINOR}
// Ismokraft — {Domain}
// Last updated: {date}

import { useState, useEffect, useCallback } from "react"

// ── Constants ────────────────────────────────────
// Only UI constants (colors, labels). No business thresholds.

// ── Storage Helpers ──────────────────────────────
// Standard storageLoad/storageSave/storageDelete pattern.

// ── Main App ─────────────────────────────────────
export default function App() {
  // State, effects, handlers
  // Render
}
```

### Rules
- Under 2,000 lines per artifact.
- No business thresholds hardcoded. Pull from storage (seeded by project context or user input).
- Clipboard bridge: every artifact that produces data must have an "Export JSON" button. Every artifact that consumes data must have an "Import JSON" button. These are **required fallback mechanisms** for when CRM is unavailable. The **primary data exchange mechanism is CRM-first via MCP** — artifact approval buttons generate a structured payload that Claude reads and uses to call MCP automatically. Clipboard is the resilience layer, not the default.
- ISM Execution Logs: every CRM write triggered by an artifact must produce a corresponding entry in the ISM Execution Logs custom module via MCP. Entry must include: field changed, old value, new value, who triggered, ISO timestamp, domain and stage context. This is non-negotiable.
- Version in filename: `{name}-v{MAJOR}.{MINOR}.jsx` (ISM-P009).
- Version also in the file's top comment line.
- Toast notifications for user feedback on actions (save, export, import, errors).
- Copy-to-clipboard with sandbox fallback (ISM-F003).
- No `URL.createObjectURL` + `a.click()` for downloads.
- No localStorage or sessionStorage. Use `window.storage` only.
- Key namespace: `ism:` prefix.

### Naming
`{domain}-{function}` in kebab-case.
Examples: discovery-dashboard, sourcing-workbench, launch-control, ops-dashboard.

---

## 4. Project Setup Standards

### CLAUDE.md (Project Instructions)

Each Claude.ai project gets a CLAUDE.md that tells every new session what the project is and how to behave. Structure:

```markdown
# {Project Name} — Project Instruction

## What This Project Is
2-3 sentences. Business context, what domain it covers.

## Architecture
Pipeline flow diagram. Which skills and plugins are active.
Pipeline stages this project covers. Gates and their criteria.

## Skills in This System
List each skill with its prefix code and modes.

## Data Integrity Rules
The 7 rules (always include — non-negotiable).

## Key Constants
Financial thresholds, brand rules, etc. — values that skills reference.

## CRM Configuration
Module names, pipeline ID, field mappings relevant to this project.

## Slack Channels
Which channels this project posts to.

## Git Repository
Location and relevant module directories.

## Integrations Active
Confluence space key, Jira project key, Canva workspace ID, Zoho Analytics workspace IDs. List which integrations are active for this project and which are future/placeholder.

## Artifact Registry
List of artifacts in this project: name, current version (vMAJOR.MINOR), and which domain they serve.
```

### Context Files (Project Knowledge)

Each project has a set of reference files loaded into every conversation:

**Required for every project:**
- CRM field mappings relevant to that project's domain
- Financial constants
- Gate criteria

**Optional:**
- Automation registry (if project triggers Zoho Flows)
- Artifact registry (if project manages multiple artifacts)

**File formats:** Structured data (thresholds, field mappings, IDs) in `.ctx.json`. Narrative content (brand rules, customer profiles) in `.ctx.md`. JSON is preferred for exact-value lookups by skills and artifacts.

### File Type Suffix Convention

| File type | Suffix | Example |
|-----------|--------|---------|
| Task instruction | `.task.md` | `product-pipeline-scheduled-daily-discovery.task.md` |
| Context JSON | `.ctx.json` | `crm-field-mappings.ctx.json` |
| Context MD | `.ctx.md` | `brand-rules.ctx.md` |
| Project instruction | `.proj.md` | `CLAUDE-product-pipeline.proj.md` |
| Artifact | `.artifact.jsx` | `discovery-dashboard-v1.0.artifact.jsx` |

**Not renamed:** SKILL.md (Claude spec), reference/ files (already in typed directory), architecture docs (01-03 series), decision-log, build-status, README files.

**Size rule:** Total text content in project knowledge should be under 50 KB. Do not add large files (xlsx, jsx artifacts) unless they are actively referenced in every conversation.

---

## 5. Scheduled Task Standards

### Task Instruction Format

```markdown
# Task: {Name}

## Schedule
{cron expression or description}

## What This Task Does
{2-3 sentences}

## Steps
1. {Step 1 — be explicit about which MCP tools to call}
2. {Step 2}
3. {Step 3}

## Inputs
{What data the task needs — CRM records, project context, etc.}

## Outputs
{What the task produces — CRM updates, Slack messages, files}

## Error Handling
{What to do if a step fails}
```

### Rules
- Task instructions are self-contained. No dependency on conversation history.
- Task references project context by file path, not by "the context we discussed."
- **Tasks are orchestrators, not executors.** A task invokes skills by mode (e.g., "Invoke PD- product-discover BATCH mode"). It does NOT reference skill-internal files (reference/, scripts/). The skill handles its own internals. The task handles flow control, error recovery, and telemetry.
- **Tasks must NOT reference `reference/` files.** If a task says "follow reference/source-protocols.md", that's a boundary violation. The skill knows its own protocols. The task just invokes the skill.
- Each task produces an observable output (Slack message, CRM update, file) so Amit can verify it ran.
- Every task writes to ISM_ExecutionLogs (telemetry) and ISM_Learnings (feedback signals) at the end of each run.
- Every task starts with a dedup check (query ISM_ExecutionLogs for today's run) to prevent duplicate execution.
- Tasks do not chain to other tasks. If Task A needs Task B's output, design Task A to read from CRM where Task B writes.
- Tasks skip CRM records tagged `Parked: true` unless the task is explicitly designed to process parked records. State this explicitly in the task's "What This Task Does" section.
- Tasks do not auto-commit to Git. Tasks that generate context file content write output to `skill-share/context/pending-updates/[task-name]-[YYYY-MM-DD].md` for human review and manual commit. Reference this path in the task's Outputs section.

---

## 6. Git Workflow Standards

### Commit Convention
- Message format: `{domain}: {what changed}` (e.g., `product-system: trim product-discover SKILL.md to 4KB`)
- One commit per logical change. Don't batch unrelated changes.

### Directory Structure
```
skill-share/
  skills/                         (all skill source files — like src/ in a coding project)
    product-discovery/            (package = Plugin 1a, Domain 1 early)
      product-discover/
        SKILL.md
        reference/                (supporting files -- included in plugin)
      product-screen/
      ikraft-keyword-intelligence/
      product-market-intelligence/
    product-evaluation/           (package = Plugin 1b, Domains 1+1.5)
      product-evaluate/
      margin-calculator/          (primary home — shared with product-sourcing)
      compliance-ops/             (primary home — shared with product-testing, product-launch)
    product-sourcing/             (package = Plugin 2a, Domain 2)
      product-spec/
      supplier-intelligence/
      vendor-ops/
    product-testing/              (package = Plugin 2b, Domain 2.5)
      ads-ops/                    (primary home — shared with product-ops)
      product-monitor/            (primary home — shared with product-ops)
      fulfillment-ops/            (primary home — shared with product-launch)
    product-launch/               (package = Plugin 3, Domain 3)
      content-writer/
      capital-planner/
    product-ops/                  (package = Plugin 4, Domain 4)
      revenue-ops/
      ism-learning-engine/
    governance/                   (future plugins)
    platform/                     (future plugins)
    operations/                   (future plugins)
    founder/                      (future)
    research/                     (future)
  context/                        (runtime config — deployed to Claude.ai project knowledge)
    product-pipeline/
      crm-field-mappings.ctx.json
      financial-constants.ctx.json
      gate-criteria.ctx.json
      zone-rotation.ctx.json
      brand-rules.ctx.md
      ppc-test-campaign-config.ctx.json
      pipeline-config.ctx.json
    launch-ops/
      listing-standards.json
      compliance-requirements.json
      launch-benchmarks.json
      analytics-config.json
    pending-updates/              (staged learning synthesis — human reviews before committing)
  dist/                           (built plugins — compiled artifacts)
    build/                        (intermediate build directory — reviewable before zipping)
    product-discovery.plugin      (Plugin 1a)
    product-evaluation.plugin     (Plugin 1b)
    product-sourcing.plugin       (Plugin 2a)
    product-testing.plugin        (Plugin 2b)
    product-launch.plugin         (Plugin 3)
    product-ops.plugin            (Plugin 4)
  artifacts/                      (built JSX artifacts)
    discovery-dashboard-v1.0.jsx
    positioning-workbench-v1.0.jsx
    sourcing-workbench-v1.0.jsx
    test-lab-a-v1.0.jsx
    test-lab-b-v1.0.jsx
    portfolio-dashboard-v1.0.jsx
    launch-control-v1.0.jsx
    ops-dashboard-v1.0.jsx
    seller-central-ops-v1.0.jsx
    source-to-pay-tracker-v1.0.jsx
  tools/                          (build scripts + generated registry)
    build.py                      (unified build entry point)
    generate-registry.py          (generates plugin-registry.json from plugins.yaml)
    build-plugin.py               (builds plugins from registry)
    build-skill.py                (packages single skill)
    validate-system.py            (cross-cutting validation + manifest)
    plugin-registry.json          (GENERATED — do not edit manually)
  tasks/                          (task instructions — orchestration definitions)
    {project}-{type}-{trigger}-{action}.task.md
  projects/                       (project instructions / CLAUDE.md files)
    CLAUDE-product-pipeline.proj.md
    CLAUDE-launch-ops.proj.md
  resources/                      (reference PDFs, external guides)
  tests/                          (skill evaluations and test suites per skill-creator)
    {skill-name}/
      evals.json
  docs/                           (architecture docs, standards, decisions ONLY)
    01-system-constraints.md
    02-business-domain-map.md
    03-implementation-standards.md
    04-data-schemas.md            (to be created — full JSON schemas for all data types)
    05-data-crawling-rules.md
    decision-log.md               (architectural decisions with rationale)
    build-status.md               (phase-based progress tracker)
    archive/                        (superseded docs — reference only)
```

### Rules
- All skills live in `skills/{capability}/{name}/` at the repo root. Capability groups: research, evaluation, finance, marketing, sourcing, operations, learning, platform, governance, core, founder (see DL-006). Each skill has a `SKILL.md` and optional supporting files (references/, scripts/, templates/). Plugins are defined in `plugins.yaml` and pull skills from any capability group (see DL-011).
- Supporting files (reference/, scripts/) are packaged into the plugin alongside SKILL.md. They count toward the 70 KB plugin limit.
- The plugin contains the complete skill directory (SKILL.md + supporting files) per skill.
- The repo is the source of truth for skill source code. Plugins are built artifacts.
- Build scripts are generic tools at `tools/`. They are not hardcoded to any specific business.

---

## 7. Naming Conventions Summary

| Component | Convention | Example |
|---|---|---|
| Skill | `{domain}-{verb/noun}` kebab-case | product-discover |
| Plugin | `{domain}-{scope}` kebab-case | product-discovery |
| Artifact | `{domain}-{function}` kebab-case | discovery-dashboard |
| Project | Title case, descriptive | "Product Pipeline" |
| CRM module | PascalCase with underscores (Zoho convention) | Product_Launches |
| Storage key | `ism:{entity}:{id}:{sub}` | ism:p:p123:out:scout |
| Slack channel | `#ism-{purpose}` | #ism-launch-alerts |
| Git branch | `{domain}/{change}` | product-system/trim-skills |
| Scheduled task | `{project}-{type}-{trigger}-{action}.task.md` | product-pipeline-scheduled-daily-discovery.task.md |

---

## 8. Skills Awaiting SKILL.md

The following skills are defined in the architecture (`02-business-domain-map.md`) but do not yet have a SKILL.md file. They must be written during Cowork build sessions following the standards in §1.

| Skill | Capability Group | Priority | Needed For |
|-------|-----------------|----------|------------|
| `supplier-intelligence` | `skills/research/` | Medium | Plugin 2a |
| `capital-planner` | `skills/finance/` | Medium | Plugin 3 |
| `revenue-ops` | `skills/finance/` | Low | Plugin 4 |
| `ism-learning-engine` | `skills/learning/` | Low | Plugin 4 |

Previously missing, now written: `compliance-ops` (evaluation/), `fulfillment-ops` (operations/), `ads-ops` (marketing/), `margin-calculator` (finance/).

**Build session instructions:** Use `python tools/create-skill.py {capability} {skill-name}` to scaffold a new skill. This creates the skill directory, a minimal SKILL.md with valid frontmatter, and a test directory under `tests/`. Then:
1. Read `02-business-domain-map.md` for the skill's domain, modes, data produced/consumed.
2. Read existing reference files in `skills/{capability}/{name}/reference/` (if any) for domain knowledge.
3. Follow §1 structure exactly: frontmatter, purpose, modes, input/output contracts, execution steps, trigger phrases.
4. Ensure the file stays under 5 KB. Move detailed rubrics/thresholds to reference files or project context.
5. Write the completed SKILL.md to `skills/{capability}/{name}/SKILL.md`.
6. Write eval test cases to `tests/{skill-name}/evals.json` (see skill-creator eval workflow).

---

## 9. Skill Trimming Guide

When trimming a skill from its current size (15-58 KB) to plugin-ready size (~3-5 KB), apply the following checklist. Validated against the product-discover trim (13.6 KB → 4.7 KB).

### Step 1 — Keep

These elements stay in the trimmed SKILL.md:
- Frontmatter (name, description, version, lifecycle)
- Purpose statement (2-3 sentences)
- Mode table (mode, input, output, downstream — one row each)
- Execution steps (5-10 numbered steps per mode)
- Input validation table
- Halt conditions
- Rules (data integrity, boundary statements)
- Trigger phrases

### Step 2 — Move to Project Context

Any business value that could change independently of the skill logic. Move to a JSON file in `context/{project}/` and reference the filename in the execution step.

Examples: thresholds, CRM field mappings, picklist values, rotation schedules, zone configs, gate criteria, scoring weights, marketplace URL patterns.

The skill says `"per rotation formula in project context (pipeline-config.ctx.json)"` — it does not embed the formula.

### Step 3 — Move to Reference

Detailed methodology, scoring rubrics, protocol details, related-skill maps. Move to `skills/{package}/{skill}/reference/` and reference inline when the execution step needs it.

Examples: source crawling protocols, scoring band definitions, evaluation frameworks, financial model detail.

The skill says `"per scoring model in reference/scoring-bands.md"` — it does not embed the rubric.

### Step 4 — Remove

- Redundant pointers to project knowledge (one reference per context file is enough)
- Verbose phase descriptions that can be compressed into a numbered step
- Execution log templates (owned by the logging system, not the skill)
- Metadata already captured in frontmatter
- "Why" explanations (move to docs/ or reference/ if valuable, otherwise delete)

### Step 5 — Test

Read only the trimmed SKILL.md plus the context file specs. Can you execute every mode? If any step is too vague to act on, add **specificity** (not detail). A step is specific enough when it names the action, the data source, and the output shape.

---

## 10. Cross-Domain Data Handoff Protocol

When a product moves from one domain to another:

1. **Source domain** writes all relevant data to CRM (Product_Launches record).
2. **Source domain** posts a Slack notification to `#ism-launch-alerts`: "{Product Name} passed Gate {N}. Ready for {next domain}."
3. **Destination domain** reads from CRM. It does NOT import data from the source domain's artifact.
4. If the CRM record is incomplete, the destination domain flags missing fields and halts. It does not guess.

This ensures:
- CRM remains the single source of truth.
- No artifact-to-artifact data dependency (sandbox isolation respected).
- Any team member can pick up a product at any stage by reading its CRM record.

---

## 11. Change Management

When updating a skill, plugin, artifact, or project context file:

1. **Document the change** in a changelog entry (what changed, why, date).
2. **Bump the version** (MAJOR for breaking changes, MINOR for additions, PATCH for fixes).
3. **Test locally** before committing to git or uploading to Claude project.
4. **Update CLAUDE.md** if the change affects project instructions.
5. **Rebuild the plugin** if a skill was modified.
6. **Notify via Slack** if the change affects team members' workflows.

---

## 12. Confluence & Jira Integration Standards

### Confluence

**Purpose:** Stores large documents that are too big for CRM fields (ResearchRecord, PositioningBrief, TestResults, listing copy, supplier briefs). Every Confluence page is linked from its corresponding CRM record.

**Root folder URL:** https://ismokraft.atlassian.net/wiki/spaces/iscom/folder/452788225

**Page creation rules:**
- Claude creates Confluence pages via Confluence MCP — never manually unless overriding
- All pages go under the root folder URL above. Check for existing folder before creating.
- Naming convention: `[ProductName]-[DataType]-[YYYY-MM-DD]`
- If a page already exists for that product + data type, Claude **updates** the existing page (do not create duplicates)
- If a page has been manually edited by a human (`human_edited: true` in CRM record field), Claude does not overwrite — flag for human review instead

**Folder structure:** All pages go into the ISM Confluence space under the following path (create folders if they don't exist):
- Research Records: `ISM/Product Launch Factory/Research Records/`
- Positioning Briefs: `ISM/Product Launch Factory/Positioning Briefs/`
- Test Results: `ISM/Product Launch Factory/Test Results/`
- Supplier Research: `ISM/Vendor Intelligence/Supplier Research/`
- Compliance Tracking: `ISM/Compliance & Regulatory/Certification Tracking/`
- SOP Documents: `ISM/SOP Documents/`
- Learning Archive: `ISM/Product Launch Factory/Learning Archive/`

**CRM linkage:** After creating a Confluence page, Claude writes the page URL to the corresponding CRM record field (`[data_type]_confluence_url`). This is how skills and artifacts find the page in future sessions.

### Jira

**Purpose:** Tracks compliance certification work as actionable tickets — one ticket per certification, with assignee, due date, and status.

**Ticket creation flow:** No skill or artifact creates Jira tickets directly. The flow is:
1. Artifact approval button → CRM update (ComplianceRecord with cert details)
2. CRM update triggers a 'task' type activity in Bigin (via CRM activity creation)
3. Bigin activity task creation triggers Jira ticket creation in "ismo scrum" board (via existing Bigin workflow automation)
4. Team picks up tickets in coming sprints

This Bigin-to-Jira workflow automation already exists and is operational.

**Ticket fields:** Project: "ismo scrum", summary: `[ProductName] — [CertType] certification`, due date from `ComplianceRecord.expectedCompletionDate`, assignee from `ComplianceRecord.owner_name`.

**Status sync:** When a Jira ticket is closed (cert obtained), the corresponding CRM ComplianceRecord field is updated and Gate 3 compliance checklist advances. This sync must be confirmed during Jira integration build.

---

## 13. What NOT To Do

- Do not hardcode business values in skills, plugins, or artifacts. They change.
- Do not create skills with overlapping functions. One function, one skill.
- Do not assume data exists. Check and flag gaps.
- Do not create a skill for something CRM already does natively.
- Do not add files to project knowledge "just in case." Every file costs context.
- Do not build domains that aren't active yet. Design for extensibility, build for today.
- Do not use automated git commits from Claude sessions. Amit reviews and commits manually.
