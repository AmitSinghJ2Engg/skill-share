# run-task.ps1 -- Headless task runner (DL-020)
#
# Generic wrapper that invokes Claude in print mode (`claude -p`) on a task
# bundle from `tasks/{workflow}/{task-name}/`. Designed for cron / Windows
# Task Scheduler use, but works fine from a regular shell too.
#
# The wrapper does NOT rewrite task prompts -- it tells Claude to read the
# task's prompt.md and config.yaml, then execute. Same prompt that runs
# interactively in Claude Desktop runs unchanged here.
#
# Usage:
#   .\tools\run-task.ps1 -TaskName daily-discovery
#   .\tools\run-task.ps1 -TaskName daily-discovery -Model sonnet -DryRun
#   .\tools\run-task.ps1 -TaskName daily-discovery -Workflow product-pipeline
#
# Logs each run to logs/scheduled/{yyyy-MM-dd}-{TaskName}.log

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$TaskName,

    [string]$Workflow,

    [ValidateSet('opus', 'sonnet', 'haiku')]
    [string]$Model = 'sonnet',

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Resolve repo root from script location -- the script lives at <repo>/tools/run-task.ps1
$RepoRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $RepoRoot 'plugins.yaml'))) {
    Write-Error "Repo root not detected at $RepoRoot (no plugins.yaml found). Move this script back to <repo>/tools/."
    exit 2
}

# Resolve task bundle path. If -Workflow is given, look there directly.
# Otherwise, search across all workflows for a matching task name.
$TasksRoot = Join-Path $RepoRoot 'tasks'
if ($Workflow) {
    $TaskPath = Join-Path $TasksRoot (Join-Path $Workflow $TaskName)
}
else {
    $matches = Get-ChildItem -Path $TasksRoot -Directory -Recurse -Depth 2 |
        Where-Object { $_.Name -eq $TaskName -and (Test-Path (Join-Path $_.FullName 'prompt.md')) }
    if ($matches.Count -eq 0) {
        Write-Error "Task '$TaskName' not found under $TasksRoot. Pass -Workflow if the task lives in a non-standard location."
        exit 3
    }
    if ($matches.Count -gt 1) {
        Write-Error "Task name '$TaskName' is ambiguous: $($matches.FullName -join ', '). Pass -Workflow to disambiguate."
        exit 3
    }
    $TaskPath = $matches[0].FullName
}

$PromptFile = Join-Path $TaskPath 'prompt.md'
$ConfigFile = Join-Path $TaskPath 'config.yaml'
if (-not (Test-Path $PromptFile)) {
    Write-Error "Task bundle missing prompt.md at $PromptFile"
    exit 3
}

# Build relative paths for the headless prompt -- claude reads them via the Read tool.
# Use substring rather than [Path]::GetRelativePath -- the latter is .NET Core only
# and Windows PowerShell 5.1 (default on Win10/11) ships .NET Framework.
$RelTaskPath = $TaskPath.Substring($RepoRoot.Length).TrimStart('\', '/').Replace('\', '/')

# Headless invocation prompt. We tell Claude to read the task bundle and execute.
# This keeps the wrapper thin -- the entire task definition stays in prompt.md.
$HeadlessPrompt = @"
You are running a scheduled task in headless mode. No interactive user is present.

Working directory: repo root (current directory).
Task bundle: $RelTaskPath/

Steps:
1. Read $RelTaskPath/config.yaml to load task metadata (skills invoked, runtime context, working directories).
2. Read $RelTaskPath/prompt.md and execute its instructions in full.
3. If the task requires human input mid-run that cannot be sourced from CRM, MCP, watch folders, or context files, log "BLOCKED: requires human input" to the task's output directory and exit cleanly. Do not prompt.
4. Honor any Step 0 dedup check -- if today's run already exists in ISM_ExecutionLogs, exit cleanly with "duplicate run prevented".
5. All Slack-bound output must be formatted via the slack-messaging skill and written to context/pending-updates/ (Slack MCP is not configured -- formatted messages are staged for later posting).
6. Finish with a one-line summary of what ran, what was written, and whether any anomalies need human review.
"@

# Logging
$LogDir = Join-Path $RepoRoot 'logs/scheduled'
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}
$LogFile = Join-Path $LogDir ("{0:yyyy-MM-dd}-{1}.log" -f (Get-Date), $TaskName)

$Header = @"
==========================================================
Task: $TaskName
Workflow path: $RelTaskPath
Model: $Model
Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
Mode: $(if ($DryRun) { 'DRY RUN' } else { 'LIVE' })
==========================================================

"@
Add-Content -Path $LogFile -Value $Header

if ($DryRun) {
    $Header | Write-Host
    Write-Host "DRY RUN -- would invoke:`n  claude -p `"<headless prompt>`" --model $Model"
    Write-Host "`nHeadless prompt:`n$HeadlessPrompt`n"
    Add-Content -Path $LogFile -Value "DRY RUN -- no claude invocation"
    exit 0
}

# Verify claude CLI is available
$ClaudeCmd = Get-Command claude -ErrorAction SilentlyContinue
if (-not $ClaudeCmd) {
    $msg = "ERROR: 'claude' CLI not found on PATH. Install Claude Code or add it to PATH."
    Write-Error $msg
    Add-Content -Path $LogFile -Value $msg
    exit 4
}

# cd to repo root so .mcp.json is discovered by claude
Push-Location $RepoRoot
try {
    Add-Content -Path $LogFile -Value "Invoking claude -p ... (output below)"
    Add-Content -Path $LogFile -Value "----------------------------------------------------------"

    # Run claude headless. Capture stdout+stderr to the log, propagate exit code.
    $output = & claude -p $HeadlessPrompt --model $Model 2>&1
    $exitCode = $LASTEXITCODE

    $output | ForEach-Object { Add-Content -Path $LogFile -Value $_ }

    Add-Content -Path $LogFile -Value "----------------------------------------------------------"
    Add-Content -Path $LogFile -Value "Exit code: $exitCode"
    Add-Content -Path $LogFile -Value "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"

    if ($exitCode -ne 0) {
        Write-Error "Task '$TaskName' failed with exit code $exitCode. See log: $LogFile"
        exit $exitCode
    }

    Write-Host "Task '$TaskName' completed. Log: $LogFile"
    exit 0
}
finally {
    Pop-Location
}