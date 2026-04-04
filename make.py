#!/usr/bin/env python3
"""
make.py -- Skill-Share build tool.

Cross-platform task runner wrapping the Python toolchain.
Works on Windows, Mac, Linux with no extra dependencies.

Usage:
    python make.py help
    python make.py create product-sourcing supplier-intelligence --prefix SI
    python make.py validate
    python make.py build
    python make.py build-plugin product-discovery
    python make.py all
"""

import os
import shutil
import subprocess
import sys

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(REPO_ROOT, "tools")
PYTHON = sys.executable


def run(name, cmd):
    """Run a build step. Exits on failure."""
    print(f"\n--- {name} ---")
    result = subprocess.run(cmd, cwd=REPO_ROOT)
    if result.returncode != 0:
        print(f"FAILED: {name}")
        sys.exit(result.returncode)


def run_advisory(name, cmd):
    """Run a build step. Prints output but does not exit on failure (advisory)."""
    print(f"\n--- {name} ---")
    result = subprocess.run(cmd, cwd=REPO_ROOT)
    if result.returncode != 0:
        print(f"ADVISORY: {name} reported issues (non-blocking)")
    return result.returncode == 0


def cmd_help():
    """Show available targets."""
    print("""
  Skill-Share Build Tool

  Usage: python make.py <target> [args]

  Skill Creation:
    create <package> <skill> [--prefix XX] [--desc "..."]
                          Create new skill scaffold

  Registry & Validation:
    registry              Generate plugin-registry.json from plugin.json files
    registry-check        Validate plugin.json files without generating registry
    validate              Run cross-cutting validation (I/O contracts, references, budgets)
    validate-fix          Run validation with fix suggestions

  Build Pipeline:
    build                 Full build pipeline for all plugins (registry + validate + build)
    build-skills          Build all skills to dist/.claude/skills/ (standalone deployment)
    build-plugin <name>   Build a single plugin
    build-confirm         Build all plugins and package to .zip (no review step)
    package <name>        Package a single plugin to .zip

  Manifest & Marketplace:
    manifest              Generate dist/skill-manifest.json
    marketplace           Update .claude-plugin/marketplace.json

  Queries:
    list-plugins          List all available plugins and their skills
    check <name>          Validate a single plugin without building

  Housekeeping:
    clean                 Remove intermediate build directories (keeps .zip files)
    clean-all             Remove all build output (build dirs + .zip files + manifest)

  Composite:
    all                   Full pipeline: registry -> validate -> build -> manifest -> marketplace
    ci                    CI checks: registry validation + system validation
""")


def cmd_create(args):
    if len(args) < 2:
        print("ERROR: Usage: python make.py create <package> <skill> [--prefix XX] [--desc '...']")
        sys.exit(1)
    subprocess.run([PYTHON, os.path.join(TOOLS, "create-skill.py")] + args, cwd=REPO_ROOT)


def cmd_registry():
    run("Generate Registry", [PYTHON, os.path.join(TOOLS, "generate-registry.py")])


def cmd_registry_check():
    run("Validate plugin.json", [PYTHON, os.path.join(TOOLS, "generate-registry.py"), "--check"])


def cmd_validate():
    # Validation is advisory per DL-014 — reports issues but does not block
    run_advisory("System Validation", [PYTHON, os.path.join(TOOLS, "validate-system.py"), "--check-only"])


def cmd_validate_fix():
    run("System Validation (with fixes)", [PYTHON, os.path.join(TOOLS, "validate-system.py"), "--check-only", "--fix-suggestions"])


def cmd_build():
    run("Build All Plugins", [PYTHON, os.path.join(TOOLS, "build.py"), "--all"])


def cmd_build_plugin(args):
    if not args:
        print("ERROR: Usage: python make.py build-plugin <plugin-name>")
        sys.exit(1)
    run(f"Build {args[0]}", [PYTHON, os.path.join(TOOLS, "build.py"), "--plugin", args[0]])


def cmd_build_skills():
    run("Build All Skills", [PYTHON, os.path.join(TOOLS, "build-skill.py"), "--all"])


def cmd_build_confirm():
    run("Build & Package All", [PYTHON, os.path.join(TOOLS, "build.py"), "--all", "--confirm"])


def cmd_package(args):
    if not args:
        print("ERROR: Usage: python make.py package <plugin-name>")
        sys.exit(1)
    run(f"Package {args[0]}", [PYTHON, os.path.join(TOOLS, "build.py"), "--plugin", args[0], "--confirm"])


def cmd_manifest():
    run("Generate Manifest", [PYTHON, os.path.join(TOOLS, "validate-system.py"), "--manifest-only"])


def cmd_marketplace():
    run("Update Marketplace", [PYTHON, os.path.join(TOOLS, "validate-system.py"), "--update-marketplace"])


def cmd_list_plugins():
    subprocess.run([PYTHON, os.path.join(TOOLS, "build-plugin.py"), "--list-plugins"], cwd=REPO_ROOT)


def cmd_check(args):
    if not args:
        print("ERROR: Usage: python make.py check <plugin-name>")
        sys.exit(1)
    subprocess.run([PYTHON, os.path.join(TOOLS, "build-plugin.py"), "--check", args[0]], cwd=REPO_ROOT)


def cmd_clean():
    print("\n--- Clean build directories ---")
    cleaned = False
    dist_dir = os.path.join(REPO_ROOT, "dist")
    build_dir = os.path.join(dist_dir, "build")
    claude_dir = os.path.join(dist_dir, ".claude")

    # Clean dist/build/ subdirectories
    if os.path.isdir(build_dir):
        for item in os.listdir(build_dir):
            path = os.path.join(build_dir, item)
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"  Removed dist/build/{item}/")
                cleaned = True

    # Clean dist/.claude/ (standalone skill output)
    if os.path.isdir(claude_dir):
        shutil.rmtree(claude_dir)
        print("  Removed dist/.claude/")
        cleaned = True

    # Clean dist/skill-manifest.json
    manifest = os.path.join(dist_dir, "skill-manifest.json")
    if os.path.isfile(manifest):
        os.remove(manifest)
        print("  Removed dist/skill-manifest.json")
        cleaned = True

    if not cleaned:
        print("  Nothing to clean.")


def cmd_clean_all():
    print("\n--- Clean all build output ---")
    build_dir = os.path.join(REPO_ROOT, "dist", "build")
    if os.path.isdir(build_dir):
        shutil.rmtree(build_dir)
        print("  Removed dist/build/")
    dist_dir = os.path.join(REPO_ROOT, "dist")
    if os.path.isdir(dist_dir):
        for f in os.listdir(dist_dir):
            if f.endswith(".plugin.zip") or f == "skill-manifest.json":
                os.remove(os.path.join(dist_dir, f))
                print(f"  Removed dist/{f}")
    print("  Cleaned.")


def cmd_all():
    run("Full Pipeline", [PYTHON, os.path.join(TOOLS, "build.py"), "--all"])


def cmd_ci():
    cmd_registry_check()
    cmd_registry()
    # Validation is advisory per DL-014 — context budget warnings don't block CI
    ok = run_advisory("System Validation", [PYTHON, os.path.join(TOOLS, "validate-system.py"), "--check-only"])
    if ok:
        print("\nCI checks passed.")
    else:
        print("\nCI checks completed with advisory warnings (see above).")


TARGETS = {
    "help":           (cmd_help, False),
    "create":         (cmd_create, True),
    "registry":       (cmd_registry, False),
    "registry-check": (cmd_registry_check, False),
    "validate":       (cmd_validate, False),
    "validate-fix":   (cmd_validate_fix, False),
    "build":          (cmd_build, False),
    "build-skills":   (cmd_build_skills, False),
    "build-plugin":   (cmd_build_plugin, True),
    "build-confirm":  (cmd_build_confirm, False),
    "package":        (cmd_package, True),
    "manifest":       (cmd_manifest, False),
    "marketplace":    (cmd_marketplace, False),
    "list-plugins":   (cmd_list_plugins, False),
    "check":          (cmd_check, True),
    "clean":          (cmd_clean, False),
    "clean-all":      (cmd_clean_all, False),
    "all":            (cmd_all, False),
    "ci":             (cmd_ci, False),
}


def main():
    args = sys.argv[1:]
    if not args:
        cmd_help()
        return

    target = args[0]
    rest = args[1:]

    if target not in TARGETS:
        print(f"Unknown target: {target}")
        print("Run 'python make.py help' for available targets.")
        sys.exit(1)

    func, takes_args = TARGETS[target]
    if takes_args:
        func(rest)
    else:
        func()


if __name__ == "__main__":
    main()
