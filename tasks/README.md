# Tasks

Task bundles define orchestration workflows that invoke skills to accomplish business goals.

## Structure

```
tasks/
  {workflow}/
    {task-name}/
      config.yaml       # Metadata: name, version, type, schedule, skills, working dirs
      description.md    # 5-10 line summary for humans and Claude triggering
      prompt.md         # Full orchestration steps (the "body" of the task)
      references/
        README.md       # Links to context files, plugins, CRM modules
```

## Conventions

- **config.yaml** is the machine-readable metadata. Build tools parse this for validation.
- **description.md** is a short summary. Used for task discovery and Claude context.
- **prompt.md** contains the full step-by-step orchestration instructions.
- **references/README.md** links to external dependencies (context files, plugins, CRM modules).
- Paths in config.yaml are relative to the repo root.
- Tasks are orchestrators — they invoke skills by mode, they do not implement skill logic.
- All CRM writes go through `zoho-data-ops`. All Slack messages go through `slack-messaging`.

## Task Types

| Type | Trigger | Example |
|------|---------|---------|
| `scheduled` | Cron / time-based | Daily discovery at 7 AM IST |
| `event` | CRM state change / manual | Test campaign after FBA confirmation |

## Current Tasks

| Task | Workflow | Type |
|------|----------|------|
| daily-discovery | product-pipeline | scheduled |
| test-campaign | product-pipeline | event |
