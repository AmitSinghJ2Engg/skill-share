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

## config.yaml Fields

### working_directories

Describes the directories the task reads from and writes to, with human-readable descriptions:

```yaml
working_directories:
  context:
    path: "context/product-pipeline/"
    description: "Runtime business config — thresholds, CRM field mappings, gate criteria"
  output:
    path: "context/pending-updates/"
    description: "Staged outputs for human review before git commit"
```

### runtime_paths

Resolves skill locations across development, standalone deployment, and plugin invocation:

```yaml
runtime_paths:
  dev: "skills/{capability}/{skill}/"          # During development (repo-relative)
  deployed: "~/.claude/skills/{skill}/"        # Claude runtime (standalone install)
  plugin: "{plugin-name}:{skill-name}"         # Plugin invocation syntax
```

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
