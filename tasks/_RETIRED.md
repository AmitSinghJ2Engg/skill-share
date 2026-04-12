# tasks/ directory — RETIRED (DL-025)

Per DL-025: **tasks are skills**. Claude Code has no "task" primitive — task-type content is a skill with `disable-model-invocation: true` (per `docs/claude-code-specs/build-with-claude-code/skills.md`).

All task content has been migrated to `skills/workflow/`:

| Old location | New location |
|---|---|
| `tasks/product-pipeline/daily-discovery/` | `skills/workflow/daily-discovery/SKILL.md` |
| `tasks/product-pipeline/daily-ads-analysis/` | `skills/workflow/daily-ads-analysis/SKILL.md` |
| `tasks/product-pipeline/test-campaign/` | Decomposed into 4 workflow skills: `test-launch-prep`, `campaign-plan`, `campaign-analysis`, `scale-decision` |

Workflow skills ship via the `workflow-ops` plugin and work in both Claude Code (Cowork) and claude.ai (Chat) environments.

**Schedule config** (e.g., "Daily, 7:00 AM IST") lives in the SKILL.md `metadata.schedule` field as documentation. Actual schedule registration happens via Desktop/Cloud scheduled tasks or `tools/register-scheduled-task.ps1`.

The old task files under `product-pipeline/` are kept temporarily for reference but are no longer the source of truth.
