#!/usr/bin/env python3
"""
build.py -- Unified build entry point for skill-share repo.

Chains: registry generation -> validation -> plugin build -> manifest -> marketplace.

Usage:
    python tools/build.py --all                    # Full pipeline for all plugins
    python tools/build.py --plugin <name>          # Full pipeline for one plugin
    python tools/build.py --validate-only          # Generate registry + validate (no build)
    python tools/build.py --skip-registry          # Use existing registry
    python tools/build.py --confirm                # Package directly (no intermediate review)

Cross-platform: runs on Mac, Linux, and Windows. No external dependencies.
"""

import argparse
import os
import subprocess
import sys


def run_step(name, cmd, repo_root):
    """Run a build step. Returns (success, output)."""
    print(f"\n{'-' * 50}")
    print(f"  STAGE: {name}")
    print(f"{'-' * 50}")
    result = subprocess.run(
        cmd,
        cwd=repo_root,
        capture_output=True,
        text=True,
    )
    # Print stdout/stderr
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description="Unified build pipeline for skill-share repo")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--all", "-a", action="store_true", help="Full pipeline for all plugins")
    group.add_argument("--plugin", "-p", help="Full pipeline for one plugin")
    group.add_argument("--validate-only", action="store_true", help="Generate registry + validate only")

    parser.add_argument("--skip-registry", action="store_true", help="Use existing registry (skip generation)")
    parser.add_argument("--confirm", action="store_true", help="Package directly (no intermediate review)")
    parser.add_argument("--repo", "-r", default=None, help="Path to repo root (default: parent of tools/)")
    args = parser.parse_args()

    # Resolve repo root
    if args.repo:
        repo_root = os.path.abspath(args.repo)
    else:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    tools_dir = os.path.join(repo_root, "tools")
    python = sys.executable
    results = {}

    print("=" * 50)
    print("  SKILL-SHARE BUILD PIPELINE")
    print("=" * 50)

    # Stage 1: REGISTRY
    if not args.skip_registry:
        ok = run_step("REGISTRY", [python, os.path.join(tools_dir, "generate-registry.py")], repo_root)
        results["Registry"] = ok
        if not ok:
            print("\nRegistry generation failed. Aborting.")
            sys.exit(1)
    else:
        print("\n  Skipping registry generation (--skip-registry)")
        results["Registry"] = "skipped"

    # Stage 2: VALIDATE
    ok = run_step("VALIDATE", [python, os.path.join(tools_dir, "validate-system.py"), "--check-only"], repo_root)
    results["Validate"] = ok
    # Continue even if validation has warnings (non-zero exit = failures exist)

    if args.validate_only:
        print_summary(results)
        sys.exit(0 if all(v in (True, "skipped") for v in results.values()) else 1)

    # Stage 2.5: SKILLS
    ok = run_step("SKILLS", [python, os.path.join(tools_dir, "build-skill.py"), "--all"], repo_root)
    results["Skills"] = ok

    # Stage 3: BUILD
    build_cmd = [python, os.path.join(tools_dir, "build-plugin.py")]
    if args.all:
        build_cmd.append("--all")
    elif args.plugin:
        build_cmd.extend(["--plugin", args.plugin])
    if args.confirm:
        build_cmd.append("--confirm")

    ok = run_step("BUILD", build_cmd, repo_root)
    results["Build"] = ok

    # Stage 4: MANIFEST
    ok = run_step("MANIFEST", [python, os.path.join(tools_dir, "validate-system.py"), "--manifest-only"], repo_root)
    results["Manifest"] = ok

    # Stage 5: MARKETPLACE
    ok = run_step("MARKETPLACE", [python, os.path.join(tools_dir, "validate-system.py"), "--update-marketplace"], repo_root)
    results["Marketplace"] = ok

    # Stage 6: SUMMARY
    print_summary(results)
    has_failure = any(v is False for v in results.values())
    sys.exit(1 if has_failure else 0)


def print_summary(results):
    """Print build pipeline summary table."""
    print(f"\n{'=' * 50}")
    print("  BUILD SUMMARY")
    print(f"{'=' * 50}")
    for stage, status in results.items():
        if status is True:
            label = "OK"
        elif status == "skipped":
            label = "SKIPPED"
        else:
            label = "FAILED"
        print(f"  {stage:<15} {label}")

    passed = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v == "skipped")
    print(f"\n  {passed} passed, {failed} failed, {skipped} skipped")


if __name__ == "__main__":
    main()
