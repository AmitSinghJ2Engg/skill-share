# tools -- Generic Build & Validation Scripts

These scripts are generic -- not hardcoded to Ismokraft. They work with any plugin or skill directory.

| Script | Purpose |
|---|---|
| `build-plugin.py` | Packages skills into `.plugin` zip files |
| `build-skill.py` | Validates and prepares a SKILL.md for plugin inclusion |
| `build.py` | Unified pipeline: registry + validate + build all plugins |
| `validate-system.py` | Cross-cutting validation + manifest generation |
| `generate-registry.py` | Scans `skills/*/plugin.json` -> `plugin-registry.json` |
| `create-skill.py` | Scaffolds new skill directory + eval test directory |
| `plugin-registry.json` | Generated registry mapping plugins to skills (do not hand-edit) |
| `run-task.ps1` | Headless task runner — invokes `claude -p` on a task bundle (DL-020) |
| `register-scheduled-task.ps1` | Registers a daily Windows Scheduled Task that calls `run-task.ps1` (DL-020) |

See `docs/03-implementation-standards.md` section 2 (Plugin Building Standards) for the full build process.

---

## build-plugin.py

Builds plugins from the skill-share repo. Reads plugin definitions from `plugin-registry.json`.

```
python build-plugin.py --plugin <name>           # build one plugin
python build-plugin.py --all                      # build all plugins
python build-plugin.py --list name1,name2         # build specific plugins
python build-plugin.py --check <name>             # validate without building
python build-plugin.py --list-plugins             # show available plugins
```

Requires `pyyaml` (`pip install pyyaml`).

---

## validate-system.py

Cross-cutting validation for the entire repo. Checks I/O contracts between skills, cross-plugin dependencies, task-skill references, reference file integrity, and context size budgets. Generates `dist/skill-manifest.json` as a machine-readable system map.

```
python validate-system.py                         # Full validation + generate manifest
python validate-system.py --check-only            # Validation only, no file generation
python validate-system.py --manifest-only         # Generate manifest, skip validation
python validate-system.py --update-marketplace    # Regenerate .claude-plugin/marketplace.json
python validate-system.py --fix-suggestions       # Include fix suggestions for failures
```

No external dependencies (stdlib only).

### 5 Validation Checks

1. **I/O Contract Validation** -- Parses mode tables, checks output types match downstream skill inputs.
2. **Cross-Plugin Dependencies** -- Flags when a skill references another skill in a different plugin.
3. **Task-Skill Dependencies** -- Verifies task files reference existing skills and modes.
4. **Reference File Integrity** -- Checks that every `references/` path in SKILL.md exists on disk.
5. **Context Budget** -- Calculates plugin sizes vs 70KB limit and context sizes vs 50KB limit.

### Generation Tasks

- **Registry drift detection** -- Reports when SKILL.md frontmatter differs from plugin-registry.json.
- **Coverage detection** -- Reports skills with/without SKILL.md, skills not in any plugin.
- **Marketplace update** (`--update-marketplace`) -- Regenerates `.claude-plugin/marketplace.json` from registry for all built plugins.

---

## Task Execution (DL-020)

A skill-share **task bundle** (under `tasks/{workflow}/{name}/`) is the unit of work. The same `prompt.md` can be triggered by:

1. **Interactive** -- human opens Cowork project in Claude Desktop, runs the task
2. **Artifact button** -- human clicks a button in a TSX artifact
3. **Scheduled / cron** -- this section
4. **Webhook** (future)
5. **Hook** (future)

The two PowerShell scripts below implement scheduled / headless execution. Same task bundle, different trigger.

### `run-task.ps1` -- generic headless task runner

Invokes `claude -p` on a task bundle's `prompt.md` from the repo root, so `.mcp.json` is discovered. Logs every run to `logs/scheduled/{date}-{taskname}.log`.

```powershell
# Run interactively to test
.\tools\run-task.ps1 -TaskName daily-discovery

# Dry run -- prints what it would do, no claude invocation
.\tools\run-task.ps1 -TaskName daily-discovery -DryRun

# Disambiguate when a task name is shared across workflows
.\tools\run-task.ps1 -TaskName daily-discovery -Workflow product-pipeline

# Override model (default sonnet)
.\tools\run-task.ps1 -TaskName daily-discovery -Model opus
```

The script does NOT rewrite the task prompt -- it tells Claude to read `prompt.md` and execute. The wrapper adds a thin headless preamble: "no interactive user is present, exit cleanly if human input is required, honor Step 0 dedup, write Slack-bound output to `context/pending-updates/`."

**Per-task headless compatibility (initial assessment, see DL-020):**

| Task | Headless-ready? | Notes |
|---|---|---|
| `daily-discovery` | Yes | No human input needed, dedup at Step 0, schedule already declared |
| `daily-ads-analysis` | Not yet | Step 2 needs CSV from human -- needs watch folder or Amazon Ads MCP |
| `test-campaign` | No | Multi-day workflow with gate decisions; stays interactive |

### `register-scheduled-task.ps1` -- Windows Task Scheduler registration

Registers a daily Windows Scheduled Task that runs `run-task.ps1` for a given task bundle. Idempotent (safe to re-run; replaces existing).

```powershell
# Register daily-discovery to run at 7:00 AM IST every day
.\tools\register-scheduled-task.ps1 -TaskName daily-discovery -Time "07:00"

# Custom scheduled-task name (default: skill-share-{TaskName})
.\tools\register-scheduled-task.ps1 -TaskName daily-discovery -Time "07:00" -SchedName "ism-morning-pipeline"

# Dry run -- prints the registration plan, no scheduled task created
.\tools\register-scheduled-task.ps1 -TaskName daily-discovery -Time "07:00" -DryRun
```

**Verify / test / remove:**

```powershell
# View the registered task
Get-ScheduledTask -TaskName "skill-share-daily-discovery"

# Trigger immediately for a smoke test (does not wait for the schedule)
Start-ScheduledTask -TaskName "skill-share-daily-discovery"

# Tail today's log
Get-Content -Wait -Tail 50 (Resolve-Path "logs/scheduled/$(Get-Date -Format 'yyyy-MM-dd')-daily-discovery.log")

# Remove the scheduled task
Unregister-ScheduledTask -TaskName "skill-share-daily-discovery" -Confirm:$false
```

Registering scheduled tasks at the user level usually does not require Administrator. If `Register-ScheduledTask` errors with an access denied, run PowerShell as Administrator.

### Honest limits today

- **No Slack MCP.** Cron-triggered tasks can format Slack messages via the `slack-messaging` skill but cannot post them. Output stages to `context/pending-updates/` until Slack MCP is added.
- **Step 0 dedup is mandatory.** Cron may fire while the operator is also running the task interactively. Every task should query `ISM_ExecutionLogs` for today's run and exit cleanly if found.
- **Tasks needing live human input cannot be cron-triggered.** Either source the input from a watch folder / MCP / upstream automated step, or keep the task interactive-only.

Add `logs/scheduled/*.log` to `.gitignore` (the `logs/` directory itself can stay tracked via a `.gitkeep` if you want the path to exist after `git clean`).
