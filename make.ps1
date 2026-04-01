# Skill-Share Build Tool
# PowerShell equivalent of the Makefile. Works natively on Windows.
#
# Prerequisites: Python 3.10+, pyyaml (pip install pyyaml)
#
# Usage:
#   .\make.ps1 help
#   .\make.ps1 create -Package product-sourcing -Skill supplier-intelligence -Prefix SI
#   .\make.ps1 validate
#   .\make.ps1 build
#   .\make.ps1 build-plugin -Plugin product-discovery
#   .\make.ps1 all

param(
    [Parameter(Position=0)]
    [string]$Target = "help",

    [string]$Package,
    [string]$Skill,
    [string]$Prefix,
    [string]$Desc,
    [string]$Plugin
)

$ErrorActionPreference = "Stop"
$Python = "python"
$Tools = "tools"
$RepoRoot = $PSScriptRoot

function Write-Header($text) {
    Write-Host "`n--- $text ---" -ForegroundColor Cyan
}

function Invoke-Step($name, [scriptblock]$cmd) {
    Write-Header $name
    & $cmd
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $name" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

switch ($Target) {

    "help" {
        Write-Host ""
        Write-Host "  Skill-Share Build Tool" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Skill Creation:"
        Write-Host "    create            Create new skill scaffold (-Package x -Skill y [-Prefix XX] [-Desc '...'])"
        Write-Host ""
        Write-Host "  Registry & Validation:"
        Write-Host "    registry          Generate plugin-registry.json from plugin.json files"
        Write-Host "    registry-check    Validate plugin.json files without generating registry"
        Write-Host "    validate          Run cross-cutting validation (I/O contracts, references, budgets)"
        Write-Host "    validate-fix      Run validation with fix suggestions"
        Write-Host ""
        Write-Host "  Build Pipeline:"
        Write-Host "    build             Full build pipeline for all plugins (registry + validate + build)"
        Write-Host "    build-plugin      Build a single plugin (-Plugin name)"
        Write-Host "    build-confirm     Build all plugins and package to .zip (no review step)"
        Write-Host "    package           Package a single plugin to .zip (-Plugin name)"
        Write-Host ""
        Write-Host "  Manifest & Marketplace:"
        Write-Host "    manifest          Generate dist/skill-manifest.json"
        Write-Host "    marketplace       Update .claude-plugin/marketplace.json"
        Write-Host ""
        Write-Host "  Queries:"
        Write-Host "    list-plugins      List all available plugins and their skills"
        Write-Host "    check             Validate a single plugin without building (-Plugin name)"
        Write-Host ""
        Write-Host "  Housekeeping:"
        Write-Host "    clean             Remove intermediate build directories (keeps .zip files)"
        Write-Host "    clean-all         Remove all build output (build dirs + .zip files + manifest)"
        Write-Host ""
        Write-Host "  Composite:"
        Write-Host "    all               Full pipeline: registry -> validate -> build -> manifest -> marketplace"
        Write-Host "    ci                CI checks: registry validation + system validation"
        Write-Host ""
    }

    # ── Skill Creation ──────────────────────────────────────

    "create" {
        if (-not $Package) { Write-Host "ERROR: -Package is required. Usage: .\make.ps1 create -Package product-ops -Skill revenue-ops" -ForegroundColor Red; exit 1 }
        if (-not $Skill)   { Write-Host "ERROR: -Skill is required. Usage: .\make.ps1 create -Package product-ops -Skill revenue-ops" -ForegroundColor Red; exit 1 }
        $args_ = @($Package, $Skill)
        if ($Prefix) { $args_ += "--prefix", $Prefix }
        if ($Desc)   { $args_ += "--description", $Desc }
        & $Python "$Tools/create-skill.py" @args_
    }

    # ── Registry & Validation ──────────────────────────────

    "registry" {
        Invoke-Step "Generate Registry" { & $Python "$Tools/generate-registry.py" }
    }

    "registry-check" {
        Invoke-Step "Validate plugin.json" { & $Python "$Tools/generate-registry.py" --check }
    }

    "validate" {
        Invoke-Step "System Validation" { & $Python "$Tools/validate-system.py" --check-only }
    }

    "validate-fix" {
        Invoke-Step "System Validation (with fixes)" { & $Python "$Tools/validate-system.py" --check-only --fix-suggestions }
    }

    # ── Build Pipeline ─────────────────────────────────────

    "build" {
        Invoke-Step "Build All Plugins" { & $Python "$Tools/build.py" --all }
    }

    "build-plugin" {
        if (-not $Plugin) { Write-Host "ERROR: -Plugin is required. Usage: .\make.ps1 build-plugin -Plugin product-discovery" -ForegroundColor Red; exit 1 }
        Invoke-Step "Build $Plugin" { & $Python "$Tools/build.py" --plugin $Plugin }
    }

    "build-confirm" {
        Invoke-Step "Build & Package All" { & $Python "$Tools/build.py" --all --confirm }
    }

    "package" {
        if (-not $Plugin) { Write-Host "ERROR: -Plugin is required. Usage: .\make.ps1 package -Plugin product-discovery" -ForegroundColor Red; exit 1 }
        Invoke-Step "Package $Plugin" { & $Python "$Tools/build.py" --plugin $Plugin --confirm }
    }

    # ── Manifest & Marketplace ─────────────────────────────

    "manifest" {
        Invoke-Step "Generate Manifest" { & $Python "$Tools/validate-system.py" --manifest-only }
    }

    "marketplace" {
        Invoke-Step "Update Marketplace" { & $Python "$Tools/validate-system.py" --update-marketplace }
    }

    # ── Queries ────────────────────────────────────────────

    "list-plugins" {
        & $Python "$Tools/build-plugin.py" --list-plugins
    }

    "check" {
        if (-not $Plugin) { Write-Host "ERROR: -Plugin is required. Usage: .\make.ps1 check -Plugin product-discovery" -ForegroundColor Red; exit 1 }
        & $Python "$Tools/build-plugin.py" --check $Plugin
    }

    # ── Housekeeping ───────────────────────────────────────

    "clean" {
        Write-Header "Clean build directories"
        if (Test-Path "dist/build") {
            Get-ChildItem "dist/build" -Directory | Remove-Item -Recurse -Force
            Write-Host "  Removed dist/build/*/"
        } else {
            Write-Host "  Nothing to clean."
        }
    }

    "clean-all" {
        Write-Header "Clean all build output"
        if (Test-Path "dist/build")  { Remove-Item "dist/build" -Recurse -Force; Write-Host "  Removed dist/build/" }
        Get-ChildItem "dist/*.zip" -ErrorAction SilentlyContinue | Remove-Item -Force
        if (Test-Path "dist/skill-manifest.json") { Remove-Item "dist/skill-manifest.json" -Force }
        Write-Host "  Cleaned."
    }

    # ── Composite Targets ─────────────────────────────────

    "all" {
        Invoke-Step "Generate Registry"    { & $Python "$Tools/generate-registry.py" }
        Invoke-Step "System Validation"    { & $Python "$Tools/validate-system.py" --check-only }
        Invoke-Step "Build All Plugins"    { & $Python "$Tools/build.py" --all }
        Invoke-Step "Generate Manifest"    { & $Python "$Tools/validate-system.py" --manifest-only }
        Invoke-Step "Update Marketplace"   { & $Python "$Tools/validate-system.py" --update-marketplace }
        Write-Host "`nFull pipeline complete." -ForegroundColor Green
    }

    "ci" {
        Invoke-Step "Validate plugin.json" { & $Python "$Tools/generate-registry.py" --check }
        Invoke-Step "System Validation"    { & $Python "$Tools/validate-system.py" --check-only }
        Write-Host "`nCI checks passed." -ForegroundColor Green
    }

    default {
        Write-Host "Unknown target: $Target" -ForegroundColor Red
        Write-Host "Run '.\make.ps1 help' for available targets."
        exit 1
    }
}
