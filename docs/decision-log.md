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