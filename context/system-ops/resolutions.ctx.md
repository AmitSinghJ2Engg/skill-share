# Resolution Registry
# Canonical path: ikraft-skill-governance/references/resolutions.md
# Migrated from: ism-resolution-registry/references/resolutions.md (folder removed during absorption)
# Owner: ikraft-skill-governance REGISTRY mode
# Read by: ALL skills at session start — filter by your domain + cross-skill
#
# RECONSTRUCTION NOTE (2026-03-15):
# Original file contained 8 seed ResolutionRecords (RR-001 through RR-008).
# File was lost when ism-resolution-registry skill folder was removed.
# Only RR-008 is reconstructable from workspace evidence.
# RR-001 through RR-007 need reconstruction from CRM ISM_Learnings or operator memory.

---

## Active Resolutions

```yaml
- id: RR-008
  domain: ism-scrum-master
  title: Jira ticket creation must use claude-task label and named exception protocol
  problem: Jira tickets created without consistent labeling; no traceability to intelligence source
  solution: All Jira creates use claude-task label. Intelligence-triggered tasks follow named exception protocol with source skill reference.
  status: active
  resolved_date: 2026-03-12
  applies_to_skills: [ism-scrum-master, ism-gap-auditor]
```

---

## Pending Reconstruction

RR-001 through RR-007 content lost during skill absorption. Sources to recover from:
- Zoho CRM ISM_Learnings module (if persisted)
- Operator memory
- Past conversation transcripts

Until recovered, skills referencing these IDs will find no match — which is safe (no false positives), but means solved problems may re-surface (false negatives).

---

## Recently Added

```yaml
- id: RR-009
  domain: cross-skill
  title: Skill delivery must use .skill zip packages — never present scattered individual files
  problem: Presenting SKILL.md and reference files as individual files via present_files loses folder structure. User receives scattered files with no directory context. Files appear corrupted/unusable.
  solution: Always package skills using zipfile with arcname = file_path.relative_to(skill_path.parent). Output as {skill-name}.skill. Present single .skill file per skill. User downloads, renames to .zip if needed, extracts to /mnt/skills/user/. Never present individual .md files from a skill folder separately.
  status: active
  resolved_date: 2026-03-15
  applies_to_skills: [ism-skill-factory, ism-learning-engine, ecosystem-ops, all]
```
