# Decision Log

Records architectural decisions and their rationale. Each entry captures the context, options considered, decision made, and consequences.

---

## DL-001: Gate Structure — 3 Formal Gates + Stage Checklists

**Date:** 2026-03-29
**Status:** Accepted
**Context:** The system had three conflicting gate definitions:
- `01-system-constraints.md` defined 11 pipeline stages with 3 gates (Gate 1: CBFA/ACoS, Gate 2: CVR/CTR, Gate 3: Compliance)
- `product-system/project-knowledge/gate-definitions.md` defined 8 gates (one per stage transition) with detailed criteria
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

**Decision:** Three-layer information architecture:

| Layer | Purpose | Location | Consumed By | Included in Plugin? |
|-------|---------|----------|-------------|---------------------|
| SKILL.md | Instructions (purpose, modes, I/O contracts, execution steps) | `{module}/skills/{skill}/SKILL.md` | Plugin users, Cowork sessions | Yes |
| Project Knowledge | Runtime values (thresholds, CRM fields, gate criteria, brand rules) | `context/{project}/` -> deployed to Claude.ai project knowledge | Everyone running the system | No (deployed separately) |
| Reference Material | Deep domain knowledge (full financial models, scoring rubrics) | `{module}/skills/{skill}/reference/` or `{module}/project-knowledge/` | Builders only (humans/Claude maintaining skills and context files) | No |

**Rationale:**
- Reference files are a BUILD-TIME dependency, not a RUNTIME dependency. Like design docs next to source code.
- Plugin users (team members who install .plugin + project knowledge) have everything needed to RUN the system without reference files.
- Builders (who write/maintain skills in Cowork) set workspace to the repo and can read reference files.
- SKILL.md never contains file paths to reference files — it says "read from project context." This ensures portability.
- If someone forks the repo, internal relative structure is identical.

**Consequences:**
- Reference files stay in repo, never bundled in plugins.
- Context files are the sole runtime configuration mechanism.
- `03-implementation-standards.md` updated to document this architecture explicitly.