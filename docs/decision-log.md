# Decision Log

Records architectural decisions and their rationale. Each entry captures the context, options considered, decision made, and consequences.

---

## DL-001: Gate Structure — 3 Formal Gates + Stage Checklists

**Date:** 2026-03-29
**Status:** Accepted
**Context:** The system had three conflicting gate definitions:
- `01-system-constraints.md` defined 11 pipeline stages with 3 gates (Gate 1: CBFA/ACoS, Gate 2: CVR/CTR, Gate 3: Compliance)
- `gate-definitions.md` (originally in product-system/project-knowledge/, now at docs/archive/gate-definitions-superseded.md) defined 8 gates (one per stage transition) with detailed criteria
- `02-business-domain-map.md` defined 3 gates aligned with investment decisions

**Options considered:**
1. **8 formal gates** (gate-definitions.md model) — every stage transition requires human approval with hard criteria. Maximum rigor.
2. **3 formal gates** (02 model) — only investment decisions require human approval. Lighter process.
3. **3 formal gates + stage checklists** (hybrid) — investment decisions are formal human gates; all other gate-definitions.md criteria become automated checklists enforced by artifacts.

**Decision:** Option 3 — 3 formal gates + stage checklists.

**Rationale:**
- Ismokraft is pre-revenue with 1-2 people. 8 formal approval ceremonies is overhead that slows the pipeline without proportional risk reduction.
- The 3 gates map to the 3 actual money decisions: (1) invest research/sourcing effort, (2) commit bulk capital, (3) go live.
- The quality criteria from gates 3, 4, 5, 7, 8 in gate-definitions.md are valuable but should be enforced automatically by artifacts (disable "advance" button until criteria met) rather than requiring a human approval ceremony each time.
- No criteria are lost — they are reclassified from "formal gate" to "stage checklist."

**Consequences:**
- `gate-definitions.md` marked as SUPERSEDED. Criteria absorbed into `02-business-domain-map.md` as stage exit checklists.
- `gate-criteria.ctx.json` (context file) contains Gate 1, 2, 3 thresholds. Stage checklists are defined per-domain in `02`.
- Artifacts enforce stage checklists at the UI level — buttons disabled until criteria met, missing items displayed.
- If the team grows and needs more formal control, any stage checklist can be promoted to a formal gate by adding human approval.

---

## DL-002: Reference File Architecture — Three Information Layers

**Date:** 2026-03-29
**Status:** Accepted
**Context:** Confusion about where reference material (financial models, scoring rubrics, evaluation frameworks) should live relative to skills, plugins, and project knowledge.

**Decision:** Three-layer information architecture (revised by DL-005):

| Layer | Purpose | Location | In Plugin? |
|-------|---------|----------|-----------|
| SKILL.md | Instructions + navigation to supporting files | `skills/{pkg}/{skill}/SKILL.md` | Yes |
| Supporting files | Detailed methodology, rubrics, scripts, templates | `skills/{pkg}/{skill}/reference/`, `scripts/` | Yes (counts toward 70 KB) |
| Project Knowledge | Runtime values (thresholds, CRM fields, gate criteria) | `context/{project}/` | No (deployed separately) |

**Rationale:**
- Claude's official skill spec (code.claude.com/docs/en/skills) supports multi-file skill directories with reference files loaded on demand at runtime.
- SKILL.md references supporting files inline when execution steps need detailed methodology.
- Business values that change independently (thresholds, CRM fields) stay in project context.

**Consequences:**
- Supporting files packaged into plugins alongside SKILL.md.
- Build script packages entire skill directory (minus .gitkeep).
- `03-implementation-standards.md` updated to document this architecture.
- **Revised by DL-005** (2026-03-30): aligned with Claude's official plugin/skill specification.

---

## DL-003: Centralized skills/ Directory

**Date:** 2026-03-29
**Status:** Accepted
**Context:** Skills were scattered across 10 module directories (`product-system/skills/`, `vendor-sourcing/skills/`, etc.). The build script needed module-to-skill mappings to find SKILL.md files. The "compilable project" metaphor called for a `src/`-like structure.

**Decision:** Move all skills to a centralized `skills/` directory at the repo root. Remove the 10 module directories.

**Rationale:**
- Mirrors the compilable project analogy: `skills/` = source code, `context/` = config, `dist/` = built artifacts
- Build script simplifies — just scans `skills/{name}/SKILL.md`, no module mapping needed
- Plugin registry simplifies — no `module` field, just skill names
- Finding any skill is trivial — one flat directory
- Business domain grouping is preserved in `plugin-registry.json` (which plugin = which domain)

**Consequences:**
- All `{module}/skills/{name}/` directories moved to `skills/{name}/`
- `reference/` folders stay with their skills at `skills/{name}/reference/`
- `project-knowledge/` files redistributed: skill-specific ones moved to `skills/{name}/reference/`, system-wide ones moved to `docs/`
- Empty module directories (`packages/`, `project-knowledge/`) deleted
- Plugin registry simplified: `module` field removed from skill entries
- Build script simplified: `find_skill_path()` now checks `skills/{name}/SKILL.md` directly

**Update (same session):** Further organized into packages — see DL-004.

---

## DL-004: Skills Organized by Package (Package = Plugin)

**Date:** 2026-03-29
**Status:** Accepted
**Context:** With 32 skills in a flat `skills/` directory, navigation becomes difficult as the list grows. No visual connection between a skill and its plugin.

**Decision:** Organize skills into packages within `skills/`. Each package aligns with a plugin for pipeline skills. Non-pipeline skills grouped by function.

**Structure:**
```
skills/{package}/{skill-name}/SKILL.md
```

Pipeline packages: `product-discovery`, `product-evaluation`, `product-sourcing`, `product-testing`, `product-launch`, `product-ops`
Non-pipeline packages: `governance`, `platform`, `operations`, `founder`, `research`

**Shared skills** have one primary package. The `plugin-registry.json` records which package a skill lives in via the `package` field. The build script resolves `skills/{package}/{skill}/SKILL.md` for any plugin.

**Rationale:**
- Opening a package directory shows exactly what goes into that plugin
- Build script resolves paths via registry `package` field
- Scalable: new domains add new packages
- Shared skills have single source of truth in their primary package

**Also in this change:** Deleted `product-ops-config` skill (deprecated -- content moved to context files).

---

## DL-005: Foundation Aligned with Claude Official Plugin/Skill Spec

**Date:** 2026-03-30
**Status:** Accepted
**Context:** Plugin 1a upload to Claude Cowork failed. Investigation of Claude's official plugin documentation (code.claude.com/docs/en/plugins, /skills) revealed misalignments in our foundation:

1. Our rule "SKILL.md never contains file paths to reference files" contradicts Claude's official guidance: "Skills can include multiple files in their directory... Reference these files from SKILL.md."
2. Our DL-002 classified reference files as "build-time only, not in plugin" -- but Claude's spec says supporting files are part of the skill and loaded on demand at runtime.
3. Our build script only packaged SKILL.md, missing supporting files.
4. Our SKILL.md frontmatter used non-standard fields (version, lifecycle) and missed standard ones (disable-model-invocation, allowed-tools, context, etc.).
5. No marketplace distribution mechanism existed.

**Decision:** Align all foundation documents with Claude's official spec:
- Supporting files (reference/, scripts/, templates/) ARE part of the plugin
- SKILL.md SHOULD reference supporting files for detailed methodology
- Build script packages entire skill directory
- Add marketplace.json for GitHub distribution
- Document official SKILL.md frontmatter fields

**Revises:** DL-002 (three-layer architecture table updated)

**Consequences:**
- `03-implementation-standards.md` rewritten for skill directory structure, plugin rules
- `01-system-constraints.md` updated with frontmatter spec and marketplace section
- `build-plugin.py` updated to package supporting files
- TODOs in PD/PS about reference paths removed (those paths are correct per official spec)
- Plugin 1a rebuilt with supporting files included

**Sources:**
- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/skills
- https://github.com/anthropics/claude-plugins-official

---

## DL-006: Skill Directory Reorganization — Business Capability Groups

**Date:** 2026-04-03
**Status:** Accepted
**Context:** DL-004 organized skills by plugin name (product-discovery, product-evaluation, etc.). As the system grew, shared skills like compliance-ops (used by 4 plugins) and margin-calculator (used by 3 plugins) didn't belong in any single plugin's directory. The question: "where does ads-ops live?" had no good answer under the old system.

**Options considered:**
1. **Keep plugin = package** (DL-004) — shared skills stay in their "primary" plugin. Cross-include via `"from"`.
2. **Business capability groups** — organize all skills by what they do (research, evaluation, finance, marketing, etc.). Plugins become pure include-lists that pull from capability packages.

**Decision:** Option 2 — Business capability groups.

**New structure:**
```
skills/research/        — keyword intelligence, product discovery, screening, market intelligence, supplier intelligence
skills/evaluation/      — product evaluation, compliance ops, product spec
skills/finance/         — margin calculator, capital planner, revenue ops
skills/marketing/       — ads ops, content writer
skills/sourcing/        — vendor ops
skills/operations/      — fulfillment ops, product monitor, ecosystem ops, scrum master, skill factory, sop builder, skill commander
skills/learning/        — learning engine
skills/platform/        — zoho data ops, zoho developer, zoho solutions architect, automation designer
skills/governance/      — skill governance, business authority, gap auditor, okr-kpi governance
skills/core/            — skill creator
skills/founder/         — ism founder
```

**Plugin directories** (product-discovery, product-evaluation, etc.) now contain only `plugin.json` with 100% include-based skill lists using `"from"` cross-package references.

**Rationale:**
- Matches how Amit thinks about the business: "research" skills, "finance" skills, not "product-evaluation plugin skills"
- Eliminates the arbitrary "primary package" problem for shared skills
- Plugin.json include lists make the domain-to-capability mapping explicit
- Build system (generate-registry.py) already supports cross-package includes — no code changes needed

**Supersedes:** DL-004 (Package = Plugin). Plugin directories remain for `plugin.json` definitions but no longer contain skill source code.

**Consequences:**
- 18 skills moved via git mv (preserves history)
- All 6 plugin.json files rewritten as 100% include-based
- Registry regeneration works immediately (tested)
- `03-implementation-standards.md` needs update to reflect new structure

---

## DL-007: Context File Naming — testing-config.ctx.json

**Date:** 2026-04-03
**Status:** Accepted
**Context:** The file `testing-config.ctx.json` was ambiguously named (could mean unit tests, QA, anything). Its content had redundancy between `test_modes` and `test_phases` sections (same data duplicated). Missing explicit success criteria for Gate 2 and platform specification.

**Decision:** Rename to `ppc-test-campaign-config.ctx.json`. Restructure content:
- Merge test_modes + test_phases into single `phases` object with all details per phase
- Add `platform` field (amazon_india)
- Add `success_criteria` section referencing Gate 2 thresholds
- Keep NEEDS_CONFIRMATION flags for team review

**Consequences:**
- File renamed in context/product-pipeline/
- All references in SKILL.md files and domain map updated
- Content reduced from redundant to single-source

---

## DL-008: amazon-fee-table.md Location and Naming

**Date:** 2026-04-03
**Status:** Accepted
**Context:** Amit added `context/product-pipeline/amazon-fee-table.md` with Amazon India 2026 fee tables. The file was missing the `.ctx.md` suffix per our naming convention. Question: should this be in context/ (project knowledge) or in margin-calculator's reference/ directory?

**Decision:** Keep in context/ as `amazon-fee-table.ctx.md`. Fee tables are runtime config that changes with Amazon policy updates and is used by multiple skills (margin-calculator, ads-ops, campaign planning). It's not specific to one skill.

**Consequences:**
- Renamed from `.md` to `.ctx.md`
- margin-calculator SKILL.md references it as project context (not local reference)
- Hardcoded fee table removed from margin-calculator SKILL.md (was 30 lines of duplication)

---

## DL-009: Financial Model Reference Consolidation

**Date:** 2026-04-03
**Status:** Accepted
**Context:** Two copies of financial model data existed: `context/product-pipeline/financial_model_reference.md` (new draft from Amit's spreadsheet, 19 KB) and `skills/product-evaluation/margin-calculator/reference/financial-model-reference.md` (detailed analysis, 19 KB). Redundancy and confusion about which is authoritative.

**Decision:** Consolidate into `skills/finance/margin-calculator/reference/financial-model-reference.md` (new path after DL-006 reorg). Trim from 19 KB to ~4 KB. Delete the context/ copy. This is skill reference (case study analysis), not runtime config.

**Trimming approach:**
- Keep: formula chain summary, key defaults table, bid optimizer logic, 16-month projection summary
- Keep: all 12 documented errors with corrections (valuable for accuracy)
- Remove: cell-by-cell spreadsheet walkthrough, raw formula tables, detailed cross-sheet maps
- Result: 91 lines, 4 KB (from 409 lines, 19 KB — 79% reduction)

**Consequences:**
- Single authoritative file in margin-calculator reference/
- Context/ copy deleted (was untracked anyway)
- financial-formulas.md remains the primary runtime formula reference (unchanged, 0.6 KB)

---

## DL-010: System Audit and Normalization

**Date:** 2026-04-03
**Status:** Accepted
**Context:** Full system audit against official Claude skill/plugin spec and The Complete Guide to Building Skills for Claude (PDF). Compared all 21 skills, 6 plugins, and 4 governance skills against official guidance and project docs. Found: 9 spec mismatches, 8 high-risk inconsistencies, 5 oversized SKILL.md files, 12 skills with hardcoded business values, inconsistent directory naming, and 4 governance skills (680KB total) built before current standards.

**Key decisions:**

1. **Directory naming: `references/` (plural)** — Adopt Claude official skill-creator convention. Rename all 14 skills using `reference/` (singular) to `references/` (plural). Update docs and build scripts.

2. **Description strategy: 250 visible + 1024 max** — Front-load core purpose in first 250 chars (visible in skill listing). Use chars 251-1024 for additional trigger phrases. Enforce via build validation: warn >250 visible, error >1024 total.

3. **Governance split into 3 plugins** — ikraft-skill-governance (408KB, 4 modes) split into:
   - `ikraft-skill-auditor` (AUDIT + REGISTRY modes) -> `governance-audit` plugin
   - `ikraft-architecture-governance` (ARCHITECTURE + SYNTHESIZE modes) -> `governance-architecture` plugin (with ism-gap-auditor)
   - `ism-business-authority` + `okr-kpi-governance` -> `governance-business` plugin

4. **Shared governance files to project context** — 8 files moved from individual skill `references/` to `context/system-ops/`: skill-registry, context-registry, workflow-contracts, dependency-graph, resolutions, skill-change-log, go-fearless, financial-formulas. These are ecosystem-wide resources, not skill-specific.

5. **Frontmatter compliance** — Add `allowed-tools` to script-using skills, `disable-model-invocation: true` to operational write skills. Document `argument-hint`, `hooks`, `shell` fields.

6. **Enforcement via skill-creator + build validation** — Update skill-creator to check description length, directory naming, hardcoded values, allowed-tools. Add description length validation to `make.py validate`.

**Consequences:**
- All SKILL.md files target <=5KB with no embedded business values
- Project instructions match actual skill modes
- Supporting file directory standardized as `references/` (plural)
- Custom frontmatter fields documented as "Ismokraft internal convention"
- Broken cross-skill references replaced with context file references
- 3 new governance plugins under 70KB each
- Stale files cleaned: data-integrity-rules.md (duplicate), market-intelligence-research (orphan), resources/explanation (covered by tools/README.md)

---

## DL-011: Plugin Centralization, Content Trimming & Context Cleanup (2026-04-03)

**Status:** Implemented
**Trigger:** Audit review identified plugin architecture overhead, build failures, stale content, and content bloat.

**Decisions:**

1. **Central `plugins.yaml` replaces 9 scattered `plugin.json` files** — Single source of truth at repo root. `generate-registry.py` reads from `plugins.yaml` instead of scanning `skills/*/plugin.json`. 9 plugin-only directories deleted from `skills/`. No plugin-creator skill needed — YAML is simple enough to edit by hand.

2. **Plugin composition changes** — `product-evaluate` removed from `product-discovery` plugin (already in `product-evaluation`). `margin-calculator` removed from `product-discovery` (available in `product-evaluation` and `product-sourcing`). Users install multiple plugins for cross-domain coverage.

3. **Reference content trimming** — 3 oversized skills trimmed to fit 70KB plugin limit:
   - `product-evaluate`: Deleted legacy spreadsheet dump (26.9KB `product-evaluation-toolkit-reference.md`). Trimmed Bigin implementation details from `product-evaluation-model.md`.
   - `vendor-ops`: Moved `vendor-evaluation-model.md` and `vendor-tracker-extras.md` to `context/product-pipeline/` (shared project knowledge). Deleted `changelog.md` and `learnings.md`.
   - `margin-calculator`: Trimmed SKILL.md from 7.1KB to 4.9KB. Deleted legacy `financial-model-reference.md`.

4. **5 stale context files deleted** from `context/system-ops/`: `context-registry.ctx.md` (100% stale), `skill-registry.ctx.md` (superseded by `plugin-registry.json`), `skill-change-log.ctx.md` (historical only), `workflow-contracts.ctx.md` (60% stale), `dependency-graph.ctx.md` (80% stale). 3 files kept: `resolutions.ctx.md` (trimmed), `go-fearless.ctx.md`, `financial-formulas.ctx.md`.

5. **10 stale `reference/` (singular) directories deleted** — All contained only `.gitkeep`. The correct `references/` (plural) directory already existed alongside each.

6. **Build validation enhanced** — `generate-registry.py` now warns on SKILL.md > 5KB, description > 1024 chars, and coexisting `reference/` + `references/` directories.

7. **Ismokraft standards codified** — `skills/core/skill-creator/references/ismokraft-standards.md` created as a project-specific addendum to the Anthropic skill-creator skill. Covers description format, size targets, directory conventions, and three-layer architecture.

**Consequences:**
- All 9 plugins build successfully (all under 70KB)
- `skills/` contains only capability directories (no plugin-only dirs)
- 22.7KB of stale context removed
- ~60KB of reference bloat removed
- Build pipeline: `plugins.yaml` → `generate-registry.py` → `plugin-registry.json` → `build-plugin.py`

---

## DL-012: System Audit Phase 2 — Artifact Refactoring, Slack Routing, Telemetry, System Ops Project

**Date:** 2026-04-04
**Status:** Implemented
**Trigger:** Full hierarchy audit (Project -> Tasks -> Plugins -> Skills) identified: business logic hardcoded in artifacts, orphaned slack-messaging skill, missing telemetry in tasks, no System Ops project instruction.

**Decisions:**

1. **Artifact config layer via `window.storage`** — Both JSX artifacts (`campaign-planner-v1.0`, `scale-decision-workbench-v1.0`) refactored to read business thresholds from `window.storage` keys (`ism:config:ppc`, `ism:config:scale-decision`) with fallback defaults. No hardcoded business values in UI logic. Config keys: phase parameters, DQ thresholds, fee deduction, keyword classification thresholds, costing scenarios, compliance items.

2. **Artifact state persistence** — Both artifacts now save/restore full state via `window.storage` (`ism:campaign-planner:state`, `ism:scale-decision-workbench:state`). State survives page refreshes within a Claude conversation.

3. **Export / Import / Send to Slack in artifacts** — Both artifacts gain 3 action buttons:
   - **Export JSON**: copies full state payload to clipboard
   - **Import JSON**: prompts for JSON paste, restores state
   - **Send to Slack**: builds mrkdwn-ready payload with `action: 'send_to_slack'` for the `slack-messaging` skill. User pastes to Claude, which routes through SM skill for formatting.

4. **Slack-messaging skill connected system-wide** — The `slack-messaging` skill (prefix SM, `skills/platform/slack-messaging/`) was orphaned (not in any plugin, not referenced in projects/tasks). Now:
   - Added to 3 plugins: `product-testing`, `product-ops`, `governance-architecture`
   - Added to both project instructions (Product Pipeline, Launch & Ops)
   - Both tasks updated to route Slack output through SM skill
   - `ismokraft-standards.md` codifies the rule: "All Slack output MUST route through slack-messaging skill"
   - SM description enhanced to 1024-char trigger description

5. **Task telemetry pattern** — `product-pipeline-event-test-campaign.task.md` updated with Steps 10-12 matching the daily-discovery telemetry pattern: ISM_ExecutionLogs record, ISM_Learnings record, Slack summary via slack-messaging.

6. **System Ops project created** — `projects/CLAUDE-system-ops.proj.md` defines the governance/architecture/tooling project covering: skill lifecycle, plugin builds, architecture governance, business authority, Zoho platform, and Slack formatting.

7. **Toast notifications** — Both artifacts gain a reusable `Toast` component for user feedback on export/import/slack actions. Auto-dismiss after 4 seconds.

**Consequences:**
- Business logic fully separated from artifact UI. Context files or `window.storage` config can override thresholds without editing JSX.
- All 9 plugins still build successfully under 70KB.
- Slack routing is now a codified, enforceable standard across the entire system.
- System Ops project provides a home for governance and tooling skills that didn't fit Product Pipeline or Launch & Ops.
- Artifacts are clipboard-bridge enabled: Export/Import for data portability, Send to Slack for team notifications.

---

## DL-013: System Audit — SKILL.md Trim, Plugin Restructure, Ghost Cleanup (2026-04-04)

**Context:** Full system audit against the Official Claude Skill Guide (authority), project docs (01-03), and existing repo. Identified: 3 build failures (plugins over 70KB), 5 oversized SKILL.md files (14-32KB), 10+ ghost skill references across 30+ files, Slack routing not enforced in reference files, and no Makefile for developers.

**Decision:** Seven-phase migration executed in a single session.

**Changes:**

1. **Plugin restructure — 2 new standalone plugins** — `supplier-intelligence` (40KB) and `revenue-ops` (56KB) were too large for their parent plugins. Created `supplier-research` and `revenue-analytics` as standalone plugins. Removed heavyweight skills from `product-sourcing` (128KB→69KB) and `product-ops` (98KB→28KB). **All 11 plugins now build under 70KB.**

2. **SKILL.md aggressive trim (5 files):**
   - `supplier-intelligence`: 22KB → 6.5KB. Moved scoring models, signal matrices, ranking weights to existing `references/`.
   - `revenue-ops`: 14KB → 5.9KB. Moved analysis steps, output schemas, thresholds to existing `references/`.
   - `capital-planner`: 14KB → 5.1KB. Removed duplicate session protocol, moved formulas to existing `references/`.
   - `ism-founder`: 25KB → 5KB. Created `references/modes-and-schemas.md` for output structures, JSON schemas, Confluence registry. Cleaned delegation map of ghost references.
   - `ecosystem-ops`: 32KB → 4.5KB. Created `references/session-sync-protocol.md` (signal taxonomy, 4-step protocol), `references/artifact-lifecycle.md` (lifecycle states, GO FEARLESS), `references/context-modules.md` (canonical locations).

3. **Ghost skill cleanup — 10 ghost skills removed from 30+ files:**
   - `product-intelligence` → `product-market-intelligence` or `product-discover`
   - `product-lab` → `product-evaluate`
   - `ism-skill-factory` → `skill-creator`
   - `ikraft-skill-governance` → `ikraft-skill-auditor`
   - Removed entirely: `artifacts-builder-v2`, `skill-commander`, `automation-designer`, `ism-sop-builder`, `ism-scrum-master`, `market-intelligence-research`
   - Fixed in: 6 SKILL.md files, 12 reference files, 3 docs files, 1 project file, 1 artifacts README

4. **Slack routing enforced in reference files** — Updated `content-writer`, `revenue-ops`, `capital-planner` reference files to say "format via slack-messaging skill" instead of direct Slack MCP calls with hardcoded channel IDs and message templates.

5. **Developer experience** — Created `Makefile` wrapping `make.py`. Updated `README.md` with prerequisites (Python 3.9+, PyYAML), all 11 plugins in install instructions, Windows troubleshooting section.

6. **ismokraft-standards.md updated** — Added: required frontmatter fields (`version`, `lifecycle`), sections to avoid in SKILL.md (governance contracts, dependency metadata, execution logs), ghost skill prevention list (28 confirmed skills, 10 retired/never-built).

7. **Prefix registry cleaned** — Removed 8 ghost prefixes from `docs/03-implementation-standards.md` (AD, SF, SC, SB, SM-scrum, AB, WB, DC).

**Consequences:**
- 11 plugins, all under 70KB, all build successfully.
- No SKILL.md exceeds 7KB (target 5KB, 12 warnings remain for minor overages).
- Zero ghost skill references in SKILL.md files and their reference files.
- Slack routing is enforced at both SKILL.md and reference file level.
- Developers can use `make build` or `python make.py build` on any platform.
- `ismokraft-standards.md` is the single source for project conventions used by skill-creator.

---

## DL-014: Build Output Reform, Task Bundles, Git Cleanup (2026-04-04)

**Context:** Audit of the skill-share repo against official Claude documentation (skills.md, plugins.md, The Complete Guide to Building Skills PDF) identified 6 areas needing normalization: dist/ tracked in git unnecessarily (132 files), no standalone skill build output, unclear plugin naming, monolithic task files, skill-creator standards gaps, and no index for Claude reference docs.

**Decisions:**

1. **dist/ partially removed from git tracking** — Regeneratable artifacts (zips, manifests, standalone skill output) are gitignored. However, `dist/build/*.plugin/` directories remain tracked because the marketplace `source` paths resolve relative to the repo — `git clone` must deliver them. `.gitignore` uses `/dist/*` with `!/dist/build/` carve-out. Marketplace `pluginRoot: "./dist/build"` added so source paths stay clean. Net: ~80% reduction in tracked dist/ files while preserving marketplace install chain.

2. **`.plugin` naming convention** — Plugin build directories now use `.plugin` suffix: `dist/build/{name}.plugin/`. Upload zips are `{name}.plugin.zip`. Makes plugin bundles visually distinct from regular directories and aligns with `.plugin.zip` upload convention. Changes in: `build-plugin.py` (3 lines), `validate-system.py` (2 lines), `make.py` (1 line), `03-implementation-standards.md`.

3. **Standalone skill build step** — `build-skill.py` extended with `--all` mode that discovers all skills with SKILL.md across `skills/{capability}/` and copies them to `dist/.claude/skills/{skill-name}/`. Flat output (no capability subdirectory) matches Claude Code's skill discovery. Added to build pipeline as stage 2.5 (after VALIDATE, before BUILD). New `build-skills` target in `make.py` and `Makefile`.

4. **Task bundle structure** — 2 monolithic `.task.md` files split into structured bundles at `tasks/{workflow}/{task-name}/` with 4 files each: `config.yaml` (metadata), `description.md` (summary), `prompt.md` (orchestration steps), `references/README.md` (external links). `validate-system.py` `discover_tasks()` updated to walk bundle directories and parse `config.yaml` + `prompt.md` (backward-compatible with flat `.task.md`). Old flat files deleted.

5. **Skill-creator standards updated** — `ismokraft-standards.md` extended with 5 new sections: Security Rules (no XML in frontmatter, no "claude"/"anthropic" in names, no README.md in skill dirs), Composability (independent skills, CRM-mediated data exchange), Description Structure (three-part PREFIX/WHAT/WHEN format), Task Bundles (bundle format reference), Build Conventions (`.plugin` naming, standalone output, dist/build/ tracked for marketplace).

6. **Claude Code specs index** — `docs/claude-code-specs/INDEX.md` created as a routing table for 14+ reference docs (~460KB) organized by Core, Build with Claude Code, Reference, and Admin categories. `.gitignore` updated with carve-out so INDEX.md is tracked while spec files remain gitignored.

**Consequences:**
- Tracked dist/ reduced to plugin build directories only (`dist/build/*.plugin/`). Zips, manifests, and standalone skill output are gitignored.
- Marketplace install chain works after `git clone`: marketplace.json → pluginRoot → `dist/build/{name}.plugin/` → plugin.json + skills/.
- Plugin bundles are visually distinct with `.plugin` suffix.
- Skills deployable standalone to `~/.claude/skills/` via `python make.py build-skills`.
- Build pipeline treats validation as advisory — context budget warnings don't block plugin builds.
- Tasks are scalable: new tasks add a directory, not a monolithic file.
- Skill-creator has complete standards coverage (security, composability, descriptions, tasks, build).
- Claude reference docs have a discoverable index without tracking 460KB of spec files.

---

## DL-015: Project Hierarchy, Chat/Cowork Distinction, Artifact Module Grouping

**Date:** 2026-04-04
**Status:** Implemented
**Trigger:** System audit identified no project type distinction, artifacts disconnected
from projects, JSX/TSX mismatch, no artifact creation workflow.

**Decisions:**

1. **Two project types** — Chat (claude.ai, owns artifact + context) and Cowork
   (Claude Desktop, owns execution context + tasks). Hierarchy:
   Chat Project -> Cowork Project(s) -> Task(s).

2. **7 Chat modules** — 10 planned artifacts consolidated into 7 business modules:
   Product Research (D1+D1.5), Sourcing (D2), Market Testing (D2.5),
   Portfolio (cross-domain), Launch Control (D3), Live Ops (D4), Procurement (S2P).

3. **1 artifact per Chat project** — separation of concerns per business module.
   Cross-module artifacts allowed as exceptions.

4. **TSX format** — artifacts move from JSX to TSX per Claude.ai standards.
   Versioned storage keys (e.g., ism4_*). Naming: {name}-v{M}.{m}.artifact.tsx.

5. **Artifact prompt per Chat project** — standardized prompt template enforcing
   TSX, window.storage, no hardcoded values, clipboard bridge, toast notifications.

6. **Cowork projects refactored** — 3 monolithic .proj.md files split into scoped
   Cowork projects, each linking to a parent Chat project.

7. **Task bundle enhancement** — folder_instructions (working_directories with
   descriptions) added to config.yaml, runtime_paths for dev/deployed/plugin resolution.

8. **skill-creator update** — ismokraft-standards.md gains pointer to architecture
   docs (01-03) without bundling them.

**Consequences:**
- `projects/chat/` contains 7 Chat project directories with project.yaml, instructions.md, artifact-prompt.md
- `projects/cowork/` contains 5 Cowork project directories with project.yaml, instructions.md
- 3 old .proj.md files deleted
- Artifact files renamed from .jsx to .tsx
- docs/03-implementation-standards.md updated with hierarchy, TSX format, enhanced task schema
- Shared artifact-prompt-template.md provides consistent artifact generation standards

---

## DL-016: Amazon PPC Campaign Planning System Expansion (2026-04-06)

**Status:** Implemented (Phase 1)
**Trigger:** Business needs richer campaign planning beyond the single linear auto->manual workflow: Amazon listing URL parsing, Helium10 keyword imports, multi-scenario campaign generation, structured CRM storage, and daily ads analysis.

**Decisions:**

1. **product-discover: LISTING_PARSE mode** (v2.2.0 -> v2.3.0) — New mode extracts structured product data from Amazon listing URLs into `ListingRecord` schema. Feeds into ads-ops SCENARIO mode for campaign planning. Rationale: reuses the existing product-discover skill (which already handles product data extraction) rather than creating a new skill. MINOR version bump — additive mode, no breaking changes.

2. **ikraft-keyword-intelligence: IMPORT mode** (v2.0.0 -> v3.0.0) — New mode intakes external keyword research CSV (Helium10 Cerebro, Jungle Scout), normalizes into KeywordSet[] schema with intent classification (brand/competitor/generic/long_tail) and deduplication. Column mappings stored in `ppc-test-campaign-config.ctx.json`. MAJOR version bump — new output field extensions (h10_score, organic_rank, sponsored_rank, intent_class).

3. **ads-ops: SCENARIO mode** (v1.0.0 -> v2.0.0) — New mode generates 3-5 Amazon Ads-compliant campaign plan flavors (Conservative, Balanced, Aggressive, Keyword-focused, Custom) from ListingRecord + KeywordSet[] + budget constraints. Each scenario outputs complete CampaignPlan objects with Amazon Ads field structure. Full schemas added to `references/schemas-and-steps.md`. MAJOR version bump — new mode + new output schemas.

4. **Campaign_Plans CRM module** — New Zoho CRM custom module designed with fields mirroring Amazon Create Campaign form + forecast + actuals tracking. Design spec in `campaign-plans-module-design.ctx.json`. CRM field mappings added to `crm-field-mappings.ctx.json`. Lookup to Product_Launches.

5. **Amazon Ads campaign field reference** — New context file `amazon-ads-campaign-fields.ctx.json` formalizes the Amazon Create Campaign form fields into a structured reference for skills and artifacts.

6. **Scenario templates in config** — `ppc-test-campaign-config.ctx.json` extended with scenario_templates (defaults per flavor), helium10_column_mapping (CSV -> internal field mapping), amazon_campaign_naming (naming patterns), and placement_defaults.

**Phase split rationale:** Phase 1 (skills + CRM design) establishes the data contracts and mode interfaces. Phase 2 (tasks + artifact + project updates) builds the orchestration and UI on top of these stable contracts. This prevents a brittle all-at-once change and allows verification of each layer independently.

**Files modified (Phase 1):**
- `skills/research/product-discover/SKILL.md` — LISTING_PARSE mode, v2.3.0
- `skills/research/ikraft-keyword-intelligence/SKILL.md` — IMPORT mode, v3.0.0
- `skills/marketing/ads-ops/SKILL.md` — SCENARIO mode, v2.0.0
- `skills/marketing/ads-ops/references/schemas-and-steps.md` — CampaignPlan + CampaignScenario schemas
- `context/product-pipeline/ppc-test-campaign-config.ctx.json` — scenario templates, column mappings
- `context/product-pipeline/amazon-ads-campaign-fields.ctx.json` (new) — Amazon Ads field reference
- `context/product-pipeline/campaign-plans-module-design.ctx.json` (new) — CRM module design spec
- `context/product-pipeline/crm-field-mappings.ctx.json` — Campaign_Plans module added
- `plugins.yaml` — product-discovery 1.1.0, product-testing 1.2.0

**Phase 2 (same session):**
- `tasks/product-pipeline/daily-ads-analysis/` (new) — daily campaign monitoring task (config.yaml, description.md, prompt.md, references/README.md)
- `tasks/product-pipeline/test-campaign/config.yaml` — v2.0.0, added PD LISTING_PARSE, KI IMPORT, AO SCENARIO skill invocations
- `tasks/product-pipeline/test-campaign/prompt.md` — added Steps 0, 0.5, 1.5, 1.6 (listing parse, keyword import, scenario generation, CRM save)
- `projects/chat/ism-market-testing/artifact-prompt.md` — rewritten with 5 views (Product Intake, Campaign Planner, Performance Monitor, Keyword Analyzer, Scale Decision), AI Insights panel, action buttons
- `projects/chat/ism-market-testing/instructions.md` — added PD, KI skill references, Campaign_Plans CRM module, daily-ads-analysis task
- `projects/cowork/test-campaign/project.yaml` — added product-discovery plugin, PD + KI skills, daily-ads-analysis task
- `projects/cowork/test-campaign/instructions.md` — added PD LISTING_PARSE, KI IMPORT, AO SCENARIO to active skills, Campaign_Plans CRM, daily-ads-analysis task
- `docs/zoho-campaign-plans-implementation.md` (new) — Zoho CRM module creation, workflow rules, Bigin sync, MCP integration, implementation checklist