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

---

## DL-017: CRM Architecture — Two-Module Campaign System

**Date:** 2026-04-06
**Implemented:** 2026-04-06 through 2026-04-08
**Status:** Implemented
**Context:** DL-016 review found no standards violations, but the `Campaign_Plans` single-module design has a structural gap: AO SCENARIO produces 1-3 campaigns per test round (Conservative=1, Balanced=2, Aggressive=3, future SB/SD=5-6). Gate 2 decisions aggregate across all campaigns, but the single-table design has no natural place for this aggregation. One record does not equal one test.

**Options considered:**
1. **Single Campaign_Plans module** (DL-016 design) — one record per campaign. Gate 2 aggregation done in application logic. Simple but requires querying multiple records and computing aggregates every time.
2. **Built-in Campaigns + custom Amazon_Ad_Campaigns** — Campaigns module (strategy/round level) aggregates metrics and holds Gate 2 verdict; Amazon_Ad_Campaigns (individual campaign level) maps 1:1 to Seller Central campaigns. Two-level hierarchy.
3. **Two custom modules (Amazon_Ad_Strategies + Amazon_Ad_Campaigns)** — same as Option 2 but using a custom module instead of built-in Campaigns. Fallback if Campaigns module can't support custom lookups.

**Decision:** Option 2 — built-in Campaigns + custom Amazon_Ad_Campaigns.

**Rationale:**
- Built-in Campaigns module already exists (ID: 645926000004114076) with standard CRM fields (name, type, status, dates). Reusing it avoids creating unnecessary custom modules.
- Strategy/round level (Campaigns) naturally aggregates across individual campaigns. Gate 2 reads one record, not N.
- Individual campaign level (Amazon_Ad_Campaigns) maps 1:1 to Seller Central, preserving the Amazon Ads field structure from DL-016.
- Daily data preservation: actuals are cumulative (campaign-to-date), daily snapshots stored in ISM_ExecutionLogs for trend analysis. No data loss on daily updates.
- Bigin sync simplified: one-way CRM -> Bigin only. Bigin is a read-only visibility layer with 5 fields.
- If MCP inspection shows Campaigns can't support custom lookups, fall back to Option 3.

**Consequences:**
- `Campaign_Plans` module design replaced by two-module design (Campaigns + Amazon_Ad_Campaigns)
- `crm-field-mappings.ctx.json` restructured: Campaign_Plans removed, Campaigns (with custom fields) and Amazon_Ad_Campaigns added
- `campaign-plans-module-design.json` rewritten for two-module spec
- `zoho-campaign-plans-implementation.md` rewritten for two-module implementation plan
- All task prompts, project instructions, and artifact prompts updated to reference both modules
- Bigin sync changed from bidirectional to one-way (CRM -> Bigin)
- `.mcp.json` added to project root for Zoho CRM and Bigin MCP server configuration (gitignored)

**Files modified:**
- `.mcp.json` (new, gitignored) — Zoho CRM + Bigin MCP server endpoints
- `.gitignore` — added .mcp.json
- `context/product-pipeline/crm-field-mappings.ctx.json` — Campaign_Plans replaced with Campaigns + Amazon_Ad_Campaigns, Bigin sync fields added
- `docs/campaign-plans-module-design.json` — rewritten for two-module spec
- `docs/zoho-campaign-plans-implementation.md` — rewritten for two-module design + daily data preservation + one-way Bigin sync
- `skills/marketing/ads-ops/SKILL.md` — SCENARIO output writes to both modules
- `skills/marketing/ads-ops/references/schemas-and-steps.md` — CRM mapping updated
- `context/product-pipeline/ppc-test-campaign-config.ctx.json` — source note updated
- `tasks/product-pipeline/test-campaign/prompt.md` — Step 1.6 creates Campaigns + N Amazon_Ad_Campaigns
- `tasks/product-pipeline/test-campaign/config.yaml` — added crm-field-mappings.ctx.json to runtime_context
- `tasks/product-pipeline/daily-ads-analysis/prompt.md` — query Amazon_Ad_Campaigns, aggregate to Campaigns, log daily snapshots
- `tasks/product-pipeline/daily-ads-analysis/config.yaml` — trigger updated
- `projects/chat/ism-market-testing/artifact-prompt.md` — CRM module refs, storage keys updated
- `projects/chat/ism-market-testing/instructions.md` — two-module CRM config, integrations
- `projects/cowork/test-campaign/instructions.md` — two-module CRM config, integrations

**Implementation summary (2026-04-06 to 2026-04-08):**

Executed via direct HTTP JSON-RPC to Zoho MCP endpoints (zoho-crm, zoho-crm-workflow, crm-module-admin-ops, zoho-bigin). Native MCP client tools didn't load — direct curl approach documented in `docs/zoho-mcp-connection.md`.

*Step 1 — Inspect Campaigns module:* Confirmed built-in module (ID: 645926000000000055) supports all required field types. 37 existing fields, 10+ existing records. No blockers — proceeded with Option 2.

*Step 2 — Customize Campaigns:* 17 custom fields created (strategy: Product_Launch lookup, Scenario_Type, Test_Phase, Total_Budget_INR; aggregates: Agg_Impressions/Clicks/Orders/Spend/Revenue/ACoS/CVR/CTR; gate_2: Verdict, Date, Rationale, Risk_Level, Data_Quality). "Amazon PPC Test" accepted as Type value via API.

*Step 3 — Create Amazon_Ad_Campaigns:* Custom module created (ID: 645926000009971002) with 43 fields across 6 groups (identity, settings, ad_group_keywords, forecast, actuals, meta). Both lookups (→Campaigns, →Product_Launches) verified. Notes field renamed to Campaign_Notes (Notes is Zoho reserved keyword).

*Step 4 — Workflow rules:*
- 4.1 Strategy Activated → Slack: Created via MCP `postWorkflowRule` (ID: 645926000010000003). Slack action configured in UI to `#marketing-ops-alerts`.
- 4.2 Auto-Set Start Date: Removed — caller sets Start_Date in same API call.
- 4.3 ACoS Update Alert → Slack: Created via MCP, trigger fixed from `field_update` to `edit` with `repeat:true` (ID: 645926000010005165). Native Slack instant action shows actual + breakeven ACoS side-by-side.
- 4.4 Strategy Auto-Complete: Deluge custom function (ID: 645926000010005071). Tested — both campaigns → Completed triggers strategy → Complete.
- 4.5 Aggregate Rollup (new): Deluge function auto-sums actuals from child campaigns, computes ACoS/CVR/CTR, updates parent Campaigns record. All 8 aggregate fields verified correct.

*Step 5 — Bigin sync:* Replaced Zoho Flow approach with MCP-based pattern. 5 fields confirmed created on Bigin Product Launch Factory pipeline. Lookup chain verified: Campaign.Product_Launch → CRM_Record_ID → Bigin search → update. CRM → Bigin sync to be implemented as dedicated sync task (not embedded in daily-ads-analysis).

*Validation rules:*
- Rule 1 (Budget Required Before Approval): Created via MCP `crm-module-admin-ops` endpoint (ID: 645926000010011018). Sub-conditions added via update call.
- Rule 2 (End Date After Start Date): Deferred — neither API, UI, nor field-picker supports field-to-field date comparison. Deluge validation function template documented for future.

*Step 7 — Verification:* Test strategy + 2 linked ad campaigns created, actuals set, aggregates verified, ISM_ExecutionLogs snapshot created, all 3 Slack workflows fired, Bigin record updated. Campaigns module ID corrected from 645926000004114076 to 645926000000000055.

**Remaining TODOs:**
- Validation Rule 2: Date sequence check (Deluge validation function — template in §3)
- §5.2: CRM → Bigin sync as dedicated sync task

---

## DL-018: Test Campaign Workflow Review — Findings & Remediation

**Date:** 2026-04-08
**Status:** Accepted

**Context:** Full review of Domain 2.5 product market testing capabilities built in DL-016 and DL-017. Review scope: 8 skills, 2 plugins, 2 tasks, 1 chat project, 1 cowork project, 9 context files, 5 CRM modules, 4 MCP servers, 2 existing artifacts.

**Critical findings (3):**
1. Plugin skill gaps — `margin-calculator` not in installed plugins; `zoho-data-ops` not in ANY plugin. Steps 1.6, 7, 10, 11 could not function.
2. Slack channel mismatch — Zoho workflow rules target `#marketing-ops-alerts`, all docs reference `#ism-launch-alerts`. Channel IDs unfilled in pipeline-config.
3. Missing artifact — `market-testing-v1.0.artifact.tsx` specified but never generated.

**Standards violations (4):**
- Campaigns module ID wrong in 2 instruction files (645926000004114076 vs correct 645926000000000055)
- Hardcoded business values in artifact-prompt.md
- Gate 2 criteria inconsistency between task prompt and gate-criteria.ctx.json
- Existing artifacts are JSX not TSX (deprecated, superseded)

**Data integrity gaps (3):**
- Gate 2 verdict stored in two places (Campaigns + Product_Launches) with no sync rule
- TestResults from Steps 4/6 not persisted to CRM
- No CRM-to-Bigin sync (DL-017 §5.2 still deferred)

**Decision: Plugin architecture**
- Created `platform-io` plugin (zoho-data-ops, ~10KB) — shared I/O layer for all cowork projects
- Added `product-evaluation` (has margin-calculator) as 3rd plugin to test-campaign cowork
- 4 plugins total: product-testing (50KB), product-discovery (68KB), product-evaluation (55KB), platform-io (10KB)
- Rationale: ZO is platform infrastructure used by every workflow; jamming it into a domain plugin locks it in. platform-io has room for future platform skills (confluence-ops, jira-ops).

**Decision: Slack dual-channel routing**
- Zoho workflow rules stay on `#marketing-ops-alerts` (CRM-native automated alerts)
- Task-level Slack posts go to `#ism-launch-alerts` (system standard via slack-messaging skill)
- Documented in both chat and cowork project instructions

**Remediation applied:**
- plugins.yaml: platform-io plugin created
- Cowork project: 4 plugins, fixed Campaigns ID, dual-channel Slack docs
- Chat project: fixed Campaigns ID, dual-channel Slack docs
- artifact-prompt.md: Config Defaults reframed as fallbacks with authoritative source note
- gate-criteria.ctx.json: full_criteria section added (keyword margin, blended ACoS, data quality, compliance)
- test-campaign prompt: Gate 2 dual-write (Campaigns + Product_Launches), TestResults persistence (Steps 4, 6)
- daily-ads-analysis prompt: Bigin sync (Step 5.6), Gate 2 readiness check (Step 5.55), budget pacing anomaly
- artifacts/README.md: deprecation note for campaign-planner and scale-decision-workbench
- All 12 plugins build successfully

**Intelligence roadmap (future, not implemented):**
- ISM_Learnings consumer task — read past gate decisions to calibrate scenario ranking and threshold adjustments
- Cross-product pattern detection — compare keyword profiles and campaign outcomes across products
- Scenario performance feedback loop — track which scenario types (Conservative/Balanced/Aggressive) lead to Gate 2 passes
- Automated gate outcome prediction from historical ISM_ExecutionLogs data

**Consequences:**
- 12 plugins (was 11) — all build under 70KB
- Test-campaign cowork project installs 4 plugins (was 2)
- DL-017 §5.2 (Bigin sync) resolved — embedded in daily-ads-analysis Step 5.6
- Slack channel IDs still need retrieval via MCP (pipeline-config.ctx.json)

---

## DL-019: Subagents Are Not a Primitive — Domain Expertise Belongs in Skills

**Date:** 2026-04-10
**Status:** Accepted

**Context:** A `listing-optimizer` subagent was created in `.claude/agents/` with a 250-line system prompt covering Amazon and Shopify listing optimization, including its own workflow, output format, guardrails, and a parallel `agent-memory/listing-optimizer/` directory. This raised the architectural question of whether subagents (Claude Code feature) should be treated as a sixth primitive in the Chat → Cowork → Task → Plugin → Skill hierarchy or as something more constrained.

**Investigation found two issues:**
1. **The agent duplicated `.claude/agents/` content with skill content.** The agent's system prompt (Amazon/Shopify rules, workflow, output format) is exactly what a SKILL.md contains. Hosting it as an agent put it outside the build pipeline, the plugin registry, the size budgets, the lifecycle metadata, the prefix routing, and the central `MEMORY.md` system. It would not be loaded by any Cowork project's plugins and would not be available in Chat projects (claude.ai has no subagents).
2. **The agent also duplicated an existing skill.** `skills/marketing/content-writer` already had a LISTING mode handling Amazon India and Shopify. The "new" agent was reinventing a capability that lived in the system already, with marginal additions (audit-vs-create distinction, deeper Shopify rules, explicit banned-term list, change-list output).

**Decision:** Two rules, applied retroactively to listing-optimizer.

**Rule A — Subagents are an execution mode inside tasks, not a primitive.**
- Subagents do exactly one thing skills cannot: provide an isolated Claude instance with its own context window. That niche has three legitimate uses inside tasks: **context isolation** (heavy reads that should not pollute parent context), **parallel fan-out** (e.g., one subagent per product zone in daily-discovery), and **independent grading** (a reviewer that hasn't seen the parent's reasoning).
- All three are *task-internal implementation choices*, not user-facing capabilities. The expertise being applied still lives in a skill that the subagent loads.
- Domain expertise — the kind of content that ends up in a system prompt with workflow, output format, and rules — must live in a skill, not a `.claude/agents/` file. This preserves the build pipeline, plugin distribution, size budgets, governance audit, lifecycle metadata, and Chat-project compatibility.
- If a future task genuinely needs subagent-style execution, write it inline in the task's `prompt.md` ("spawn a subagent that loads skill X and does Y") rather than creating a standalone agent file.

**Rule B — Before creating any new skill or agent, search for existing capability overlap.**
- The listing-optimizer / content-writer overlap was caught only because the conversation paused to look. Standard practice when adding a skill: grep `skills/{capability}/` for the domain, read the closest existing SKILL.md, and ask "does this fit as a new mode or sub-mode of an existing skill?" before creating a parallel one.
- A new skill is justified when it has a genuinely distinct trigger surface, a different lifecycle, or significantly different references. A new *mode* on an existing skill is justified when it shares ~70%+ of the rules, schemas, and references.

**Remediation applied:**
- `skills/marketing/content-writer/SKILL.md`: LISTING mode split into CREATE (existing behavior) and AUDIT (new — score, diff, rewrite). Description triggers extended with "audit listing", "improve listing", "rewrite listing", "audit my Amazon listing", "improve my Shopify PDP". Channel-selection mandate made explicit.
- `skills/marketing/content-writer/references/schemas-and-steps.md`: AUDIT input/output schemas added, AUDIT execution steps added, Amazon banned-terms list added, full Shopify listing rules section added (PDP body, meta description, FAQ, image-copy callouts, SEO lens), self-verification checklist added (covers both CREATE and AUDIT, both channels).
- `.claude/agents/listing-optimizer.md`: deleted.
- `.claude/agent-memory/listing-optimizer/`: deleted.
- `product-launch` plugin rebuilt: 53KB → 62KB. Under the 70KB budget. SKILL.md grew 4.6KB → 6.1KB (slightly over the 5KB soft target — accepted because the structural additions justify it).

**Consequences:**
- `.claude/agents/` is now empty and remains empty by default. Future agent files require an explicit decision-log justification that they are *not* domain expertise that belongs in a skill.
- content-writer is the single source of truth for all listing copy work — create or audit, Amazon or Shopify. Any cowork project loading the `product-launch` plugin gets both sub-modes.
- The "search before creating" rule (Rule B) should be added to ismokraft-standards as a soft pre-flight check for skill creation.
- `agent-memory/` directory exists but unused — kept in repo so the convention is documented if a legitimate subagent role appears later.

**Open questions / future work:**
- If a real "context isolation" or "parallel fan-out" use case appears (e.g., daily-discovery fanning out per zone), document the pattern as "task spawns subagent that loads skill X" — the subagent is anonymous, the expertise stays in the skill.
- ismokraft-standards.md should pick up Rule B as a pre-creation check.

---

## DL-020: Task Execution Modes — Tasks Are Reusable Across Triggers

**Date:** 2026-04-10
**Status:** Accepted

**Context:** A follow-up to DL-019. The conversation that led to DL-019 surfaced a deeper question: where does autonomous behavior live in the system? The instinct was to invent "autonomous agents" as a new primitive. On reflection, the cleaner framing is that **task bundles are already the right primitive — what's missing is execution modes for them beyond "human in Claude Desktop."**

Today, every task in `tasks/{workflow}/{name}/` has exactly one trigger: a human opens a Cowork project in Claude Desktop and runs the task interactively. There is no infrastructure for scheduled, headless, reactive, or hook-based execution. This means routine ops work that *could* be automated still requires Amit to be in front of Claude Desktop — daily ad analysis, daily discovery, compliance deadline checks, inventory watchers, morning briefings.

**Decision:** Formalize **task execution modes** as a first-class architectural concept. A task bundle is the unit of work; the execution mode is *how the task gets triggered*. The same `prompt.md` runs unchanged across modes — only the trigger changes.

**Five execution modes (initial set):**

| Mode | Who triggers | Infra | Status | Use when |
|---|---|---|---|---|
| **Interactive** | Human in Claude Desktop opens Cowork project, runs task | None — Claude Desktop | ✅ Today | Workbench/exploratory work, gate decisions, anything needing judgment |
| **Artifact button** | Human clicks button in TSX artifact | Artifact wired to invoke task/skill | ✅ Today (some artifacts) | Faster trigger when human is already in chat |
| **Scheduled / cron** | Cron / Windows Task Scheduler invokes `claude -p` headless with task prompt | Scheduler config + headless wrapper script | 🔶 New (this DL) | Routine work that should run on a clock — daily reports, watchers, briefings |
| **Webhook / event-driven** | Thin listener catches Bigin/Desk/Inventory webhook and runs the matching task | Hosted webhook listener (Cloudflare Worker, Vercel function, or local) | ⏳ Future | Reactive work — lead created, ticket arrived, stockout near |
| **Hook-based** | Claude Code hook fires on PreToolUse/PostToolUse/etc. inside a session | `.claude/settings.json` hooks | ⏳ Future | Inline guardrails, audit trails, side-effects on specific tool calls |

**Rationale:**

1. **No new primitive.** Tasks remain the unit of work. Skills remain the unit of expertise. The hierarchy doesn't grow a sixth layer. We're recognizing something that was already implicit — that "human in Claude Desktop" was just *one* of many possible triggers, not the only one.
2. **Task bundles are reusable across modes.** A task whose `prompt.md` is well-written runs identically whether triggered interactively or via cron. The headless wrapper just feeds the same prompt to `claude -p`. No task rewrite needed.
3. **Avoids the autonomous-agents-as-new-primitive trap.** DL-019's discussion almost led to creating "agents" as a sixth layer alongside skills/plugins/tasks. That would have been wrong — it was reinventing what tasks already do, with a worse boundary. The right framing is "tasks have multiple triggers", not "agents are a new thing."
4. **Aligns with the compilable-project metaphor.** Tasks are functions; execution modes are the call sites (REPL, cron, webhook, hook). Same function, multiple callers.

**Constraints and honest limits:**

- **Not every task is headless-ready.** Tasks that require live human input mid-run (e.g., `daily-ads-analysis` Step 2: "Request daily ad metrics from user") cannot be cron-triggered until the input is sourced from a watch folder, MCP, or upstream automated step. Each task should declare its execution-mode compatibility in its `config.yaml`.
- **No Slack MCP today.** Per DL-018, the system has zoho-crm, zoho-bigin, zoho-crm-workflow, and crm-module-admin-ops MCPs. No Slack transport. A cron-triggered task can format messages via `slack-messaging` skill but cannot post them. Output must go to a file (or pending-updates folder) until Slack MCP is added — at which point cron-triggered tasks will post to Slack natively.
- **Headless mode requires CRM-side dedup.** Step 0 of every existing task already does this via ISM_ExecutionLogs — good. Cron makes dedup non-optional, since the operator may also run the same task interactively.
- **MCP working directory matters.** The headless `claude -p` invocation must `cd` into the repo root before running so `.mcp.json` is discovered. The wrapper script handles this.

**Per-task compatibility (initial assessment):**

| Task | Headless-ready? | Notes |
|---|---|---|
| `daily-discovery` | ✅ Yes | No human input required. Has dedup. Already declares `schedule: Daily, 7:00 AM IST`. Best first cron candidate. |
| `daily-ads-analysis` | ❌ Not yet | Step 2 requires CSV from human. Needs watch-folder pattern or Amazon Ads MCP before cron is viable. |
| `test-campaign` | ❌ No | Multi-day workflow with gate decisions. Inherently human-in-the-loop. Stays interactive. |

**Remediation applied (this DL):**
- `tools/run-task.ps1` created — generic headless task runner. Resolves task name → bundle path → reads `prompt.md` → invokes `claude -p` from repo root with logging. Cross-platform-friendly (PowerShell Core works on Linux/Mac too if needed later).
- `tools/register-scheduled-task.ps1` created — Windows Task Scheduler registration helper. Registers a daily run of any task at a chosen time. Idempotent (safe to re-run).
- `tools/README.md` updated with a "Task Execution" section documenting both scripts.
- `logs/scheduled/` convention introduced — wrapper writes a per-run log here. Add to `.gitignore` (the log files, not the directory).
- `daily-discovery/config.yaml` should grow an `execution_modes:` field (deferred — not blocking; can be added when more tasks become headless-ready and the schema is worth formalizing).

**Consequences:**

- Tasks now have a documented execution-mode story. Any task that's headless-ready can be scheduled with two PowerShell commands.
- The "agents" door stays closed at the architectural level (DL-019 stands), but the autonomous-execution gap is addressed via execution modes — which is the right place for it.
- Webhook and hook modes are documented as future work but not built. They become worth building when there's a clear "event X → action Y" loop the operator can articulate.
- Future tasks should be authored with execution-mode compatibility in mind: avoid mid-run human input where possible, prefer file-drop or MCP-sourced inputs, always include CRM-side dedup at Step 0.

**Open questions / future work:**
- When Slack MCP is added (DL-018 follow-up), update `slack-messaging` skill so cron-triggered tasks can post natively. Currently they format-only.
- When the first webhook listener is built, it should reuse `tools/run-task.ps1` (or its equivalent) — same task bundle, different trigger.
- Decide whether `config.yaml` grows an `execution_modes:` enum (`interactive`, `scheduled`, `webhook`, `hook`) once 3+ tasks are headless-ready — too early to formalize today.

---

## DL-021: ads-ops Audit + Split — Domain-Boundary Decomposition + Lossless Compression

**Date:** 2026-04-10
**Status:** Accepted (fix-and-split phase complete; eval phase deferred to next session)

**Context:** First end-to-end pilot of the D2.5 portfolio audit (test-campaign workflow). Per the scoping conversation:
- **Q1** Scope = 4 core skills (ads-ops, product-monitor, margin-calculator, compliance-ops). Pilot = ads-ops only.
- **Q2** Depth = full (audit → fix → eval → benchmark)
- **Q3** Eval baseline = pre-fix version
- **Q4** Audit evidence = standards file + DL-018 patterns; eval evidence = synthesized realistic fixtures
- **Q5** Pilot ads-ops end-to-end before scaling to other 3 core skills

**Audit findings (full detail in `extra files no commit/jobs/audit-skill-ads-ops.md`):** 26 findings across 5 categories. Top three problem classes:
1. Forecast and ranking math missing (SCENARIO mode produces forecasts and ranks scenarios but never says how — violates skill's own Rule 4)
2. Daily incremental analysis isn't a documented pattern, but `daily-ads-analysis` task uses it that way (skill assumes one-shot phase-end analysis; task calls it daily; no `MID_TEST_ON_TRACK` recommendation existed)
3. Hardcoded magic numbers in `ads-metrics.md` (₹500, ₹100, ×1.5, ×2, "5 orders", 10%, 25%) violating Rule 3

**Fixes applied (the intelligence gains):**
- New `references/forecast-model.md` with explicit formulas for `estimated_impressions/clicks/orders_low/high/total_spend_inr/acos_low/high_pct` plus `forecast_confidence` and a `computed_via` traceability field. Generic Amazon India SP baselines per Q1 (no Ismokraft historical data yet).
- New `references/tuning-constants.md` with all named tunable values: §1 health thresholds, §2 keyword action thresholds, §3 bid adjustment magnitudes, §4 verdict thresholds, §5 anomaly thresholds, §6 SCENARIO ranking weights + competition adjustments, §7 forecast baselines.
- `references/ads-metrics.md` rewritten to reference named constants instead of hardcoded magic numbers.
- New `daily_check` sub-phase in TEST mode for mid-test status snapshots — uses cumulative metrics for keyword classification (a keyword with 0 orders today but 5 cumulative is a winner, not a loser). Outputs `MID_TEST_ON_TRACK` or `MID_TEST_ANOMALY`, never phase-end recommendations.
- New `gate_2_readiness` block in TestResults output schema — populated by `analyze_validation` always and `daily_check` from `day_n >= ceil(day_k/2)`. Matches `gate-criteria.ctx.json#gate_2` full_criteria + Path A/B exactly so the test-campaign task can present it at Gate 2 without recomputing.
- New ANOMALY sub-mode (5 detection types: spend_spike, acos_jump, ctr_drop, zero_orders, budget_overpacing) — was previously hardcoded in `daily-ads-analysis` task prompt, now in the skill where it belongs (architecture: tasks orchestrate, skills compute).
- Explicit SCENARIO ranking formula with weights (0.4 budget_efficiency + 0.3 data_quality + 0.2 risk_inverse + 0.1 keyword_coverage) plus competition adjustment plus tiebreaker rule.
- Bid recommendations now include explicit `recommended_bid_inr` magnitudes — "bid_up" alone was incomplete advice the team couldn't act on.
- CRM field mapping (CampaignPlan → Amazon_Ad_Campaigns) documented inline in references.
- SCENARIO → TEST handoff precedence rule (if `selected_scenario_id` provided, use CRM-stored values over config defaults).
- TEST → LIVE transition rule (when `Campaigns.Status` flips from Active to Scale, switch from ads-ops-plan to ads-ops-live).
- Ghost reference to `ism-learning-engine` removed.
- Fixed CampaignPlan schema: `keywords` and `negative_keywords` now nest **inside** `ad_groups[]` per real Amazon Ads structure (was flat).

**Key architectural decision: SPLIT, not trim.** The audit additions grew ads-ops from 28.8 KB (pre-audit) to 66.3 KB (post-additions), pushing both `product-testing` plugin (88,632 bytes) and `product-ops` plugin (79,774 bytes) over the 70 KB budget. Two paths:

1. **Trim ads-ops back to fit one plugin** — would lose ~20 KB of the audit's intelligence gains, defeating the purpose of the audit
2. **Split ads-ops along the natural domain boundary** — D2.5 (market testing) vs D4 (ongoing management), mirroring the plugin split (product-testing = D2.5, product-ops = D4)

**Decision: option 2 — split.** Per Amit's guidance: "trimming can lead to loss of info." The split is the correct architectural move because:
- The seam was always there — D2.5 market validation and D4 ongoing management are different domains glued together in one skill
- Plugin boundaries already encode the same split (product-testing vs product-ops), so the skill split mirrors infrastructure
- Rule B from DL-019 applies: search for capability overlap before *creating* a new skill — but splitting an *overloaded* skill across domain boundaries is the inverse pattern, and is correct
- Each split skill has a single-domain focus; the original ads-ops was two responsibilities glued together

**Split structure:**
- **`ads-ops-plan` (D2.5):** SCENARIO + TEST (plan/analyze/daily_check) + ANOMALY. Ships in `product-testing` plugin. Used by `test-campaign` task and `daily-ads-analysis` task when campaign is in Discovery/Validation phase.
- **`ads-ops-live` (D4):** LIVE (health_check, bid optimization, scale guardrails, keyword expansion, negative management). Ships in `product-ops` plugin. Used by `daily-ads-analysis` task when campaign is in Scale phase.

**Shared content (duplicated):** `ads-metrics.md` (~6 KB metric formulas, health classification, CSV mapping, keyword action rules) and §1-§4 of `tuning-constants.md` (~4 KB health/keyword/bid/verdict thresholds). Total duplication ~10 KB. Acceptable cost — the duplicated content is stable and the alternative (gutting one skill) was worse. If a future change needs to propagate, it must go to both; the file headers note this.

**Lossless compression decision:** After the split, `product-ops` fit comfortably (36,640 bytes) but `product-testing` was still 6 KB over (76,151 bytes). Two options:
1. Split ads-ops-plan again (into ads-ops-scenario + ads-ops-test) — more duplication, more plugins
2. Lossless compression — convert verbose JSON Schema blocks to compact pseudo-schema notation

**Decision: lossless compression.** Per Amit's question "trim vs divide?", the right answer was: compression is not info loss when it's converting JSON Schema boilerplate (`{"type": "object", "properties": {...}, "description": "..."}`) to compact pseudo-schema notation (`field: type | "enum1" | "enum2"`). Both convey the same type info; the compact form is just byte-efficient. Applied to `schemas-and-steps.md`: 24,663 → 15,385 bytes (saved ~9 KB). Zero information loss.

**If lossless compression had not been enough,** the fallback was option 1 (further split). It wasn't needed.

**Final sizes:**

| Plugin | Before audit | After audit, before split | After split + compression | Budget | Status |
|---|---|---|---|---|---|
| product-testing | ~51 KB | 88,632 (FAIL) | **66,166 (95%)** | 70 KB | ✅ |
| product-ops | ~43 KB | 79,774 (FAIL) | **36,640 (52%)** | 70 KB | ✅ |

| Skill | Before | After |
|---|---|---|
| ads-ops (single) | 28.8 KB | (deleted) |
| ads-ops-plan | — | 44.6 KB |
| ads-ops-live | — | 23.6 KB |

**Tunable values: in references/, not context/.** New tuning values (forecast baselines, anomaly thresholds, ranking weights, bid magnitudes) live in `skills/marketing/ads-ops-plan/references/tuning-constants.md` and `skills/marketing/ads-ops-live/references/tuning-constants.md`, NOT in `context/product-pipeline/`. Rationale: the product-pipeline context budget is at 49,992 / 50,000 bytes (per DL-018 note) — adding new keys would have broken Validate. The DL-005 architectural rule for "thresholds in `context/`" assumes shared values across skills; ads-ops-specific tuning knobs legitimately live in the skill's own references because no other skill consumes them. If a value later needs to be shared (e.g., margin-calculator starts reading ad bid thresholds), promote it to context at that point. The context-budget pressure is a known systemic issue; solving it is a separate project.

**Tasks updated:**
- `test-campaign/prompt.md` + `config.yaml`: `AO- ads-ops` → `AO- ads-ops-plan`
- `daily-ads-analysis/prompt.md` + `config.yaml`: split conditional — D2.5 phase campaigns invoke `ads-ops-plan TEST mode daily_check`, Scale phase campaigns invoke `ads-ops-live LIVE mode health_check`. Task config carries both skills.

**What's NOT done in this DL (deferred to next session):**
- Wooden pen holder test fixtures (per Q5 product choice)
- 5 eval test cases per §8 of the audit file (SCENARIO traceable forecast, daily_check MID_TEST_ON_TRACK correctness, gate_2_readiness population, anomaly detection in skill output, bid magnitude in keyword recommendations)
- Subagent fan-out: baseline (pre-fix snapshot at `skills/marketing/ads-ops-workspace/skill-snapshot/`) vs with-fixes (`ads-ops-plan`)
- Static eval viewer via `generate_review.py --static`
- Benchmark aggregation and §8 success-target verification
- Eventually: scale audit pattern to product-monitor, margin-calculator, compliance-ops (the other 3 core D2.5 skills)

**Consequences:**
- 29 skills with SKILL.md (was 28). 12 plugins still. All 12 build clean under 70 KB.
- ads-ops-plan and ads-ops-live each have a single-domain focus. Future changes to D4 management don't touch D2.5 testing logic and vice versa.
- Shared `ads-metrics.md` content lives in two places. Any future change to metric formulas, health classification, or keyword action rules must be propagated to both files. File headers note this.
- The "Sibling — handles D[X] ..." note in each Related Skills table is the discoverability link between them.
- DL-019 Rule B unchanged: still applies to *creating new* skills. Splitting an overloaded skill across domain boundaries is the inverse pattern (not duplication, decomposition) and is correct when the original was carrying two responsibilities.
- The pre-fix snapshot at `skills/marketing/ads-ops-workspace/skill-snapshot/` is preserved (gitignored) for the eval baseline in the next session.

**Open questions / future work:**
- Eval phase (next session) will validate whether the audit fixes actually move the needle. If they do, scale the audit-fix-eval pattern to product-monitor, margin-calculator, compliance-ops.
- Once 5+ Ismokraft test campaigns provide real data via ISM_ExecutionLogs, replace generic Amazon India baselines in `forecast-model.md` and `tuning-constants.md §7` with category-specific calibrated values (forecast model v2.0).
- Context budget pressure (49,992 / 50,000 bytes) is a systemic issue that will eventually force a decision (split context, raise limit, or aggressive trim of `crm-field-mappings.ctx.json` which is 21.6 KB). Not blocking ads-ops work today.

### DL-021 Postscript: Iteration 1 Eval Results + Structural Cleanup

**Date:** 2026-04-11

**Eval phase (iteration 1) — complete.** 5 subagent runs per configuration (with_skill vs without_skill baseline using the pre-split snapshot). Results:

| Workspace | Pass rate (with_skill) | Pass rate (baseline) | Delta |
|---|---|---|---|
| ads-ops-plan-workspace | 22/22 (100.0%) | 9/19 (47.4%) | **+52.6 pp** |
| ads-ops-live-workspace | 5/5 (100.0%) | 3/5 (60.0%) | **+40.0 pp** |

**Time:** with_skill averaged 142 s, baseline 161 s. **Faster despite doing more structural work** — the audit's explicit references eliminated the baseline's need to invent missing structure on the fly.

**Every audit finding validated independently by the subagents.** Most notable: the eval-5 baseline subagent explicitly *refused* to fabricate bid magnitudes, citing Rule 4 ("Show the math"). That's the strongest possible validation of finding A16 — the old schema made it impossible to give complete advice without violating the skill's own rule.

**Structural cleanup applied (strict per-skill convention enforced):**

Per Amit's direction — "lets not share skill workspace, we remain strict" — the shared `ads-ops-workspace/` was split into two per-skill workspaces:

- `skills/marketing/ads-ops-plan-workspace/` — fixtures 1-5 (listing record, keyword sets, phase 2 STR, day-5-clean, day-6-anomaly), 4 evals, iteration-1, grade.py, build_benchmark.py, README.md
- `skills/marketing/ads-ops-live-workspace/` — live-health-check.json fixture, 1 eval, iteration-1, grade.py, build_benchmark.py, README.md

Both workspaces contain their own copy of `skill-snapshot/` (pre-split monolithic ads-ops v2.0.0) as the eval baseline. The ~28 KB of duplication is an acceptable cost for strict convention compliance — workspaces are gitignored anyway.

**evals/ inside skill dir: now excluded from plugin build AND budget calculation.**

Per the skill-creator spec, `evals/evals.json` lives inside the skill directory alongside SKILL.md and references/. But evals are **dev-time test scaffolding**, not runtime content — they contain assertions and test prompts the model doesn't need at invocation time.

Before this postscript, the builder AND validator both counted `evals/` toward the 70 KB plugin budget. This meant adding test coverage to a skill consumed its plugin budget, penalizing the very behavior we want to encourage.

**Fix applied to both tools:**
- `tools/build-plugin.py` — `get_skill_dir_size()` and the file-copy walk both prune `evals` from `dirnames[:]` so it's neither counted nor packaged
- `tools/validate-system.py` — `get_dir_size()` now takes an `exclude_dirs` parameter; `check_context_budget()` passes `{"evals"}` for plugin size calculations
- Both changes land in the same commit so builder and validator stay in sync

**Consequence:** evals can now grow without affecting plugin budgets. Every future audit-fix-eval cycle gets this as free infrastructure — adding test coverage no longer pressures the 70 KB ceiling.

**Per-eval `eval_metadata.json` added.** The skill-creator spec says each eval run directory should contain an `eval_metadata.json` with id, name, prompt, tests, fixtures, and assertions. The iteration-1 eval dirs now have these files so the workflow is reproducible and self-describing.

**Grader and benchmark scripts are iteration-aware.** `grade.py` and `build_benchmark.py` moved from `iteration-1/` to workspace root and accept `--iteration N` so future iterations (iteration-2, iteration-3...) reuse the same scripts unchanged.

**README per workspace.** Documents the structure, how to run the grader + benchmark builder + static viewer, iteration history with pass-rate progression, and the context of the DL-021 audit pilot.

**Final plugin sizes (re-verified post-cleanup):**

| Plugin | Built size | Budget | % |
|---|---|---|---|
| product-testing | 66,166 | 70,000 | 95% |
| product-ops | 36,640 | 70,000 | 52% |

All 12 plugins build clean.

**Still pending (deferred to the next commit):** 4 skill content findings surfaced by reading subagent transcripts — forecast-model.md §3 clarity, competition factor in expected_cpc (v1.1 enhancement), daily_check fallback when per-keyword data is absent (schemas-and-steps.md doc update), fixture enrichment (per-keyword cumulative data). None of them broke the 100% pass rate; they're quality-of-life improvements for reproducibility and forecast precision. They'll land as a separate commit so the structural + infra work reviewable standalone.

**Open question resolved:** Q3 from the scoping conversation ("since ads-ops-workspace itself is not a skill, how does claude would recommend the directory structure?") — answer is **strict per-skill**, no shared workspaces, duplication of snapshot + fixtures is acceptable because workspaces are gitignored. The shared-workspace path was briefly defensible as a "joint audit" exception but the user (correctly) rejected it for consistency. Future skill audits should follow the same per-skill convention.