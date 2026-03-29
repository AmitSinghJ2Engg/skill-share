#!/usr/bin/env python3
"""
.build-plugin.py — Build .plugin files from the skill-share git repo.

Supports the 6-plugin architecture. Reads plugin definitions from
tools/plugin-registry.json. Derives shared skill dependencies automatically
from the registry (no separate dependency file needed).

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


def derive_shared_skills(plugins):
    """Derive shared skill map from plugin registry. No separate file needed."""
    skill_to_plugins = {}
    for plugin_name, plugin_def in plugins.items():
        for skill_entry in plugin_def["skills"]:
            name = skill_entry["name"]
            if name not in skill_to_plugins:
                skill_to_plugins[name] = []
            skill_to_plugins[name].append(plugin_name)
    return {name: plist for name, plist in skill_to_plugins.items() if len(plist) > 1}


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


def find_skill_path(repo_root, skill_name, package):
    """Find the SKILL.md path for a skill. Skills live in skills/{package}/{name}/."""
    path = os.path.join(repo_root, "skills", package, skill_name, "SKILL.md")
    if os.path.isfile(path):
        return path
    return None


def get_skill_dir_size(repo_root, skill_name, package):
    """Get total size of skill directory (SKILL.md + supporting files), excluding .gitkeep."""
    skill_dir = os.path.join(repo_root, "skills", package, skill_name)
    total = 0
    file_count = 0
    for dirpath, dirnames, filenames in os.walk(skill_dir):
        for f in filenames:
            if f == ".gitkeep":
                continue
            total += os.path.getsize(os.path.join(dirpath, f))
            file_count += 1
    return total, file_count


def check_plugin(repo_root, plugin_name, plugin_def, shared_skills):
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
        package = skill_entry.get("package", plugin_name)

        skill_path = find_skill_path(repo_root, skill_name, package)
        if skill_path is None:
            report["skills_missing"].append(f"skills/{package}/{skill_name}/SKILL.md")
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

        skill_md_size = os.path.getsize(skill_path)
        dir_size, file_count = get_skill_dir_size(repo_root, skill_name, package)
        support_size = dir_size - skill_md_size
        report["total_size"] += dir_size
        report["skills_found"].append({
            "name": skill_name,
            "package": package,
            "version": meta.get("version", "unknown"),
            "size": skill_md_size,
            "support_size": support_size,
            "total_size": dir_size,
            "file_count": file_count,
        })
        report["warnings"].extend([f"{skill_name}: {w}" for w in issues])

    # Check shared skill impact (derived from registry)
    for skill_entry in plugin_def["skills"]:
        skill_name = skill_entry["name"]
        if skill_name in shared_skills:
            other_plugins = [p for p in shared_skills[skill_name] if p != plugin_name]
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
    elif estimated_total > 60000:
        report["warnings"].append(
            f"Approaching size limit: {estimated_total:,} bytes (limit: {MAX_PLUGIN_SIZE:,})"
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
            skill_kb = s["size"] / 1024
            total_kb = s["total_size"] / 1024
            flag = " [OVER 5KB]" if s["size"] > MAX_SKILL_SIZE else ""
            support = f" + {s['support_size']/1024:.1f} KB support" if s["support_size"] > 0 else ""
            files = f" ({s['file_count']} files)" if s["file_count"] > 1 else ""
            print(f"    {s['name']} v{s['version']} ({skill_kb:.1f} KB{support} = {total_kb:.1f} KB total){files}{flag}")

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


def build_plugin(repo_root, plugin_name, plugin_def, shared_skills, output_dir, confirm=False):
    """Build a single plugin. Returns True on success."""
    is_valid, report = check_plugin(repo_root, plugin_name, plugin_def, shared_skills)
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
        "author": plugin_def.get("author", {"name": "Ismokraft"}),
    }
    plugin_dir = os.path.join(build_dir, ".claude-plugin")
    os.makedirs(plugin_dir, exist_ok=True)
    with open(os.path.join(plugin_dir, "plugin.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(plugin_json, f, indent=2, ensure_ascii=True)
        f.write("\n")

    # Copy entire skill directories (SKILL.md + supporting files)
    # Normalize line endings to LF for cross-platform compatibility
    for skill_info in report["skills_found"]:
        skill_name = skill_info["name"]
        package = skill_info["package"]
        src_dir = os.path.join(repo_root, "skills", package, skill_name)
        dest_dir = os.path.join(build_dir, "skills", skill_name)
        os.makedirs(dest_dir, exist_ok=True)

        for dirpath, dirnames, filenames in os.walk(src_dir):
            for f in filenames:
                if f == ".gitkeep":
                    continue
                src_file = os.path.join(dirpath, f)
                rel_path = os.path.relpath(src_file, src_dir)
                dest_file = os.path.join(dest_dir, rel_path)
                os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                # Normalize text files to LF
                if f.endswith((".md", ".json", ".yaml", ".yml", ".txt", ".py", ".sh")):
                    with open(src_file, "r", encoding="utf-8") as sf:
                        content = sf.read()
                    with open(dest_file, "w", encoding="utf-8", newline="\n") as df:
                        df.write(content)
                else:
                    shutil.copy2(src_file, dest_file)

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

    # Load registry and derive shared skills
    registry = load_registry(repo_root)
    plugins = registry.get("plugins", {})
    shared_skills = derive_shared_skills(plugins)

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
        is_valid, report = check_plugin(repo_root, args.check, plugins[args.check], shared_skills)
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
        success = build_plugin(repo_root, name, plugins[name], shared_skills, output_dir, confirm=args.confirm)
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