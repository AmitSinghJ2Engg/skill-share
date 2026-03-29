#!/usr/bin/env python3
"""
.build-plugin.py — Build .plugin files from the skill-share git repo.

Supports the 6-plugin architecture. Reads plugin definitions from
tools/plugin-registry.json. Reports shared skill dependencies from
tools/plugin-skill-map.json.

Usage:
    python build-plugin.py --plugin <name>           # build one plugin
    python build-plugin.py --all                      # build all plugins
    python build-plugin.py --list name1,name2         # build specific plugins
    python build-plugin.py --check <name>             # validate without building
    python build-plugin.py --list-plugins             # show available plugins

Options:
    --repo <path>       Path to skill-share repo root (default: parent of tools/)
    --output <path>     Output directory for .plugin files (default: dist/)
    --confirm           Skip intermediate review, zip directly

Cross-platform: runs on Mac, Linux, and Windows.
"""

import argparse
import json
import os
import shutil
import sys
import zipfile

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is required. Install with: pip install pyyaml")
    sys.exit(1)

MAX_PLUGIN_SIZE = 70000  # 70 KB uncompressed limit
MAX_SKILL_SIZE = 5120    # 5 KB target per SKILL.md


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_registry(repo_root):
    path = os.path.join(repo_root, "tools", "plugin-registry.json")
    if not os.path.isfile(path):
        print(f"ERROR: Plugin registry not found: {path}")
        sys.exit(1)
    return load_json(path)


def load_skill_map(repo_root):
    path = os.path.join(repo_root, "tools", "plugin-skill-map.json")
    if not os.path.isfile(path):
        return {"shared_skills": {}}
    return load_json(path)


def validate_frontmatter(skill_md_path):
    """Parse and validate SKILL.md frontmatter. Returns (meta, warnings) or (None, errors)."""
    with open(skill_md_path, "r", encoding="utf-8") as f:
        content = f.read()

    warnings = []

    if not content.startswith("---"):
        return None, ["No YAML frontmatter found (file must start with ---)"]

    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, ["Invalid frontmatter structure (missing closing ---)"]

    try:
        meta = yaml.safe_load(parts[1])
    except yaml.YAMLError as e:
        return None, [f"YAML parse error: {e}"]

    if not meta:
        return None, ["Empty frontmatter"]

    errors = []
    if not meta.get("name"):
        errors.append("Missing required field: name")
    if not meta.get("description"):
        errors.append("Missing required field: description")
    if not meta.get("version"):
        warnings.append("Missing recommended field: version")

    if errors:
        return None, errors

    # Check file size
    size = len(content.encode("utf-8"))
    if size > MAX_SKILL_SIZE:
        warnings.append(f"SKILL.md is {size:,} bytes ({size/1024:.1f} KB) — target is under {MAX_SKILL_SIZE/1024:.0f} KB")

    return meta, warnings


def find_skill_path(repo_root, module, skill_name):
    """Find the SKILL.md path for a skill in its module."""
    path = os.path.join(repo_root, module, "skills", skill_name, "SKILL.md")
    if os.path.isfile(path):
        return path
    return None


def check_plugin(repo_root, plugin_name, plugin_def, skill_map):
    """Validate a plugin without building. Returns (is_valid, report)."""
    report = {
        "plugin": plugin_name,
        "description": plugin_def["description"],
        "version": plugin_def.get("version", "1.0.0"),
        "skills_found": [],
        "skills_missing": [],
        "validation_errors": [],
        "warnings": [],
        "total_size": 0,
    }

    for skill_entry in plugin_def["skills"]:
        skill_name = skill_entry["name"]
        module = skill_entry["module"]

        skill_path = find_skill_path(repo_root, module, skill_name)
        if skill_path is None:
            report["skills_missing"].append(f"{module}/skills/{skill_name}/SKILL.md")
            continue

        meta, issues = validate_frontmatter(skill_path)
        if meta is None:
            report["validation_errors"].append(f"{skill_name}: {'; '.join(issues)}")
            continue

        # Check name matches directory
        if meta["name"] != skill_name:
            report["validation_errors"].append(
                f"{skill_name}: frontmatter name '{meta['name']}' != directory '{skill_name}'"
            )
            continue

        size = os.path.getsize(skill_path)
        report["total_size"] += size
        report["skills_found"].append({
            "name": skill_name,
            "module": module,
            "version": meta.get("version", "unknown"),
            "size": size,
        })
        report["warnings"].extend([f"{skill_name}: {w}" for w in issues])

    # Check shared skill impact
    shared = skill_map.get("shared_skills", {})
    for skill_entry in plugin_def["skills"]:
        skill_name = skill_entry["name"]
        if skill_name in shared:
            other_plugins = [p for p in shared[skill_name]["plugins"] if p != plugin_name]
            if other_plugins:
                report["warnings"].append(
                    f"{skill_name} is shared — also in: {', '.join(other_plugins)}"
                )

    # Size check (estimate with plugin.json overhead)
    estimated_total = report["total_size"] + 200  # plugin.json ~200 bytes
    if estimated_total > MAX_PLUGIN_SIZE:
        report["validation_errors"].append(
            f"Estimated size {estimated_total:,} bytes exceeds {MAX_PLUGIN_SIZE:,} byte limit"
        )

    is_valid = len(report["validation_errors"]) == 0 and len(report["skills_missing"]) == 0
    return is_valid, report


def print_report(report, verbose=True):
    """Print a validation/build report."""
    plugin = report["plugin"]
    print(f"\n{'='*60}")
    print(f"Plugin: {plugin} v{report['version']}")
    print(f"  {report['description']}")
    print(f"{'='*60}")

    if report["skills_found"]:
        print(f"\n  Skills found ({len(report['skills_found'])}):")
        for s in report["skills_found"]:
            size_kb = s["size"] / 1024
            flag = " [OVER 5KB]" if s["size"] > MAX_SKILL_SIZE else ""
            print(f"    {s['name']} v{s['version']} ({size_kb:.1f} KB){flag}")

    if report["skills_missing"]:
        print(f"\n  MISSING ({len(report['skills_missing'])}):")
        for s in report["skills_missing"]:
            print(f"    {s}")

    if report["validation_errors"]:
        print(f"\n  ERRORS ({len(report['validation_errors'])}):")
        for e in report["validation_errors"]:
            print(f"    {e}")

    if report["warnings"] and verbose:
        print(f"\n  Warnings ({len(report['warnings'])}):")
        for w in report["warnings"]:
            print(f"    {w}")

    total_kb = report["total_size"] / 1024
    print(f"\n  Total skill content: {total_kb:.1f} KB / {MAX_PLUGIN_SIZE/1024:.0f} KB limit")

    is_valid = len(report["validation_errors"]) == 0 and len(report["skills_missing"]) == 0
    status = "READY" if is_valid else "NOT READY"
    print(f"  Status: {status}")
    return is_valid


def build_plugin(repo_root, plugin_name, plugin_def, output_dir, confirm=False):
    """Build a single plugin. Returns True on success."""
    skill_map = load_skill_map(repo_root)
    is_valid, report = check_plugin(repo_root, plugin_name, plugin_def, skill_map)
    print_report(report)

    if not is_valid:
        print(f"\n  Cannot build {plugin_name} — fix errors above first.")
        return False

    # Build intermediate directory
    build_dir = os.path.join(output_dir, "build", plugin_name)
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir, exist_ok=True)

    # Write plugin.json
    plugin_json = {
        "name": plugin_name,
        "description": plugin_def["description"],
        "version": plugin_def.get("version", "1.0.0"),
    }
    plugin_dir = os.path.join(build_dir, ".claude-plugin")
    os.makedirs(plugin_dir, exist_ok=True)
    with open(os.path.join(plugin_dir, "plugin.json"), "w", encoding="utf-8") as f:
        json.dump(plugin_json, f, indent=2, ensure_ascii=False)

    # Copy SKILL.md files (only SKILL.md, not reference files)
    for skill_info in report["skills_found"]:
        skill_name = skill_info["name"]
        module = next(s["module"] for s in plugin_def["skills"] if s["name"] == skill_name)
        src_path = find_skill_path(repo_root, module, skill_name)

        dest_dir = os.path.join(build_dir, "skills", skill_name)
        os.makedirs(dest_dir, exist_ok=True)
        shutil.copy2(src_path, os.path.join(dest_dir, "SKILL.md"))

    # Calculate uncompressed size
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(build_dir):
        for f in filenames:
            total_size += os.path.getsize(os.path.join(dirpath, f))

    if total_size > MAX_PLUGIN_SIZE:
        print(f"\n  ERROR: Uncompressed size {total_size:,} bytes exceeds {MAX_PLUGIN_SIZE:,} limit.")
        print(f"  Intermediate build at: {build_dir}")
        return False

    print(f"\n  Intermediate build: {build_dir} ({total_size:,} bytes)")

    if not confirm:
        print(f"  Review the build directory above, then re-run with --confirm to package.")
        return True

    # Package as .plugin zip
    output_file = os.path.join(output_dir, f"{plugin_name}.plugin")
    with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(build_dir):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                arcname = os.path.relpath(file_path, build_dir).replace("\\", "/")
                zf.write(file_path, arcname)

    zip_size = os.path.getsize(output_file)
    print(f"  Plugin built: {output_file} ({zip_size/1024:.1f} KB compressed)")

    # Clean up intermediate
    shutil.rmtree(build_dir)

    return True


def main():
    parser = argparse.ArgumentParser(description="Build .plugin files from skill-share repo")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--plugin", "-p", help="Build a single plugin by name")
    group.add_argument("--all", "-a", action="store_true", help="Build all plugins")
    group.add_argument("--list", "-l", help="Build specific plugins (comma-separated)")
    group.add_argument("--check", "-c", help="Validate a plugin without building")
    group.add_argument("--list-plugins", action="store_true", help="List available plugins")

    parser.add_argument("--repo", "-r", default=None, help="Path to skill-share repo root")
    parser.add_argument("--output", "-o", default=None, help="Output directory (default: dist/)")
    parser.add_argument("--confirm", action="store_true", help="Skip intermediate review, package directly")

    args = parser.parse_args()

    # Resolve repo root
    if args.repo:
        repo_root = os.path.abspath(args.repo)
    else:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    if not os.path.isdir(repo_root):
        print(f"ERROR: Repo root not found: {repo_root}")
        sys.exit(1)

    # Resolve output directory
    output_dir = args.output or os.path.join(repo_root, "dist")
    os.makedirs(output_dir, exist_ok=True)

    # Load registry
    registry = load_registry(repo_root)
    plugins = registry.get("plugins", {})
    skill_map = load_skill_map(repo_root)

    if args.list_plugins:
        print("Available plugins:\n")
        for name, defn in plugins.items():
            skill_names = [s["name"] for s in defn["skills"]]
            print(f"  {name} ({defn.get('version', '?')})")
            print(f"    {defn['description']}")
            print(f"    Skills: {', '.join(skill_names)}")
            print()
        sys.exit(0)

    if args.check:
        if args.check not in plugins:
            print(f"ERROR: Unknown plugin '{args.check}'. Use --list-plugins to see available.")
            sys.exit(1)
        is_valid, report = check_plugin(repo_root, args.check, plugins[args.check], skill_map)
        print_report(report)
        sys.exit(0 if is_valid else 1)

    # Determine which plugins to build
    if args.plugin:
        target_plugins = [args.plugin]
    elif args.all:
        target_plugins = list(plugins.keys())
    else:
        target_plugins = [p.strip() for p in args.list.split(",")]

    # Validate plugin names
    for name in target_plugins:
        if name not in plugins:
            print(f"ERROR: Unknown plugin '{name}'. Use --list-plugins to see available.")
            sys.exit(1)

    # Build
    results = {}
    for name in target_plugins:
        success = build_plugin(repo_root, name, plugins[name], output_dir, confirm=args.confirm)
        results[name] = success

    # Summary
    print(f"\n{'='*60}")
    print("BUILD SUMMARY")
    print(f"{'='*60}")
    for name, success in results.items():
        status = "OK" if success else "FAILED"
        print(f"  {name}: {status}")

    failed = sum(1 for s in results.values() if not s)
    if failed:
        print(f"\n{failed} plugin(s) failed. Fix errors and retry.")
        sys.exit(1)
    else:
        print(f"\n{len(results)} plugin(s) processed successfully.")
        sys.exit(0)


if __name__ == "__main__":
    main()