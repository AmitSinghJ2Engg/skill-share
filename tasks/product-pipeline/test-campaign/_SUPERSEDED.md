# SUPERSEDED by DL-025 Task Decomposition

The `test-campaign` monolith has been decomposed into 4 session-sized tasks per DL-025.

## New task locations

These live in the Chat project as project knowledge, not in `tasks/product-pipeline/`:

| Task | Chat project file | Replaces |
|---|---|---|
| test-launch-prep | `projects/chat/ism-market-testing/tasks/test-launch-prep.md` | Steps 0, 0.5, 1, 1.5, 1.6 |
| campaign-plan | `projects/chat/ism-market-testing/tasks/campaign-plan.md` | Steps 2, 5 |
| campaign-analysis | `projects/chat/ism-market-testing/tasks/campaign-analysis.md` | Steps 3-4, 6 |
| scale-decision | `projects/chat/ism-market-testing/tasks/scale-decision.md` | Steps 7-12 |

## Why

- Tasks should not live beyond a single session (DL-025 principle)
- The original 10-step monolith spanned weeks of real-time execution
- Claude conversations are ephemeral — multi-session resume is fragile
- Workflows live at the project/artifact layer; tasks are disposable workers
- Web artifacts (claude.ai Chat projects) are the primary operating mode

## Original files (kept for reference)

- `prompt.md` — the original 285-line orchestration prompt
- `config.yaml` — skill invocation manifest
- `description.md` — original description
