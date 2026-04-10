# register-scheduled-task.ps1 -- Windows Task Scheduler registration helper (DL-020)
#
# Registers a daily scheduled task that invokes run-task.ps1 for a given
# skill-share task bundle. Idempotent: re-running with the same -SchedName
# replaces the existing scheduled task.
#
# Usage:
#   .\tools\register-scheduled-task.ps1 -TaskName daily-discovery -Time "07:00"
#   .\tools\register-scheduled-task.ps1 -TaskName daily-discovery -Time "07:00" -SchedName "skill-share-daily-discovery"
#   .\tools\register-scheduled-task.ps1 -TaskName daily-discovery -Time "07:00" -DryRun
#
# To remove a registered task:
#   Unregister-ScheduledTask -TaskName "skill-share-daily-discovery" -Confirm:$false
#
# Requires running PowerShell as Administrator (Task Scheduler requires elevation
# to register tasks at the machine level).

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$TaskName,

    [Parameter(Mandatory = $true)]
    [string]$Time,

    [string]$Workflow,

    [string]$SchedName,

    [ValidateSet('opus', 'sonnet', 'haiku')]
    [string]$Model = 'sonnet',

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Validate -Time format (HH:mm)
if ($Time -notmatch '^\d{2}:\d{2}$') {
    Write-Error "-Time must be in HH:mm format (e.g., '07:00', '14:30')"
    exit 2
}

# Default scheduled-task name if not given
if (-not $SchedName) {
    $SchedName = "skill-share-$TaskName"
}

# Resolve repo root and run-task.ps1 path
$RepoRoot = Split-Path -Parent $PSScriptRoot
$RunTaskScript = Join-Path $PSScriptRoot 'run-task.ps1'
if (-not (Test-Path $RunTaskScript)) {
    Write-Error "run-task.ps1 not found at $RunTaskScript -- expected sibling script."
    exit 3
}

# Build the action: pwsh.exe (PowerShell 7+) or powershell.exe (Windows PowerShell 5).
# Prefer pwsh if available, fall back to powershell. Avoid the ?. null-conditional
# operator -- it's PowerShell 7+ only and this script must run on Windows PowerShell 5.1.
$PwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
if (-not $PwshCmd) {
    $PwshCmd = Get-Command powershell -ErrorAction SilentlyContinue
}
if (-not $PwshCmd) {
    Write-Error "Neither pwsh nor powershell found on PATH."
    exit 4
}
$PwshExe = $PwshCmd.Source

$ActionArgs = @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', "`"$RunTaskScript`"",
    '-TaskName', $TaskName,
    '-Model', $Model
)
if ($Workflow) {
    $ActionArgs += @('-Workflow', $Workflow)
}

# Print the plan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Scheduled-task registration plan" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Scheduled-task name : $SchedName"
Write-Host "Skill-share task    : $TaskName"
if ($Workflow) { Write-Host "Workflow            : $Workflow" }
Write-Host "Daily trigger time  : $Time"
Write-Host "Model               : $Model"
Write-Host "Repo root           : $RepoRoot"
Write-Host "Action              : $PwshExe $($ActionArgs -join ' ')"
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN -- no scheduled task registered." -ForegroundColor Yellow
    exit 0
}

# Build the scheduled task
$Action = New-ScheduledTaskAction -Execute $PwshExe -Argument ($ActionArgs -join ' ') -WorkingDirectory $RepoRoot
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Idempotent: if a task with this name exists, replace it
$existing = Get-ScheduledTask -TaskName $SchedName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Existing scheduled task '$SchedName' found -- replacing." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $SchedName -Confirm:$false
}

try {
    Register-ScheduledTask `
        -TaskName $SchedName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Principal $Principal `
        -Description "skill-share headless task runner: $TaskName (DL-020)" | Out-Null

    Write-Host "Scheduled task '$SchedName' registered. Daily at $Time." -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify with:"
    Write-Host "  Get-ScheduledTask -TaskName '$SchedName'"
    Write-Host ""
    Write-Host "Test-run immediately with:"
    Write-Host "  Start-ScheduledTask -TaskName '$SchedName'"
    Write-Host ""
    Write-Host "Remove with:"
    Write-Host "  Unregister-ScheduledTask -TaskName '$SchedName' -Confirm:`$false"
}
catch {
    Write-Error "Failed to register scheduled task: $_"
    Write-Error "Note: registering scheduled tasks may require running PowerShell as Administrator."
    exit 5
}