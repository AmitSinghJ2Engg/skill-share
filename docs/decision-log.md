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
- `gate-criteria.json` (context file) contains Gate 1, 2, 3 thresholds. Stage checklists are defined per-domain in `02`.
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