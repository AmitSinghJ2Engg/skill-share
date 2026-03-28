#!/usr/bin/env python3
"""
build-plugin.py — Build an ismokraft-product-ops.plugin file from the git repo.

Usage:
    python build-plugin.py [--repo <repo-root>] [--output <output-dir>] [--version <version>]

Example:
    python build-plugin.py --repo ./skill-share --output ./packages
    python build-plugin.py  # uses defaults

Cross-platform: runs on Mac, Linux, and Windows.
Uses Python zipfile (not PowerShell Compress-Archive — backslash path issue).

The script:
1. Reads skill folders from the repo modules
2. Validates each SKILL.md frontmatter
3. Builds a plugin.json manifest
4. Packages everything into a .plugin zip with correct structure
"""

import argparse
import json
import os
import sys
import zipfile

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is required. Install with: pip install pyyaml")
    sys.exit(1)

# Skill locations in the repo (module → skill folders)
SKILL_MAP = {
    "product-system": [
        "product-discover",
        "product-screen",
        "product-evaluate",
        "product-monitor",
        "product-spec",
        "product-ops-config",
        "ikraft-keyword-intelligence",
    ],
    "vendor-sourcing": [
        "vendor-ops",
        "supplier-intelligence",
    ],
    "revenue-finance": [
        "margin-calculator",
        "capital-planner",
        "revenue-ops",
    ],
    "marketing-content": [
        "content-writer",
        "ads-ops",
    ],
}

PLUGIN_META = {
    "name": "ismokraft-product-ops",
    "description": (
        "End-to-end product launch operations for Ismokraft — discovery, evaluation, "
        "specification, sourcing, listing, launch, and post-launch monitoring. "
        "Integrates with Zoho CRM, Bigin, Slack, and marketplace channels."
    ),
    "author": {"name": "Ismokraft"},
    "keywords": [
        "ecommerce",
        "product-launch",
        "amazon-india",
        "shopify",
        "zoho",
        "d2c",
        "wooden-products",
    ],
}


def validate_frontmatter(skill_md_path):
    """Parse and validate SKILL.md frontmatter. Returns meta dict or None."""
    with open(skill_md_path, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.startswith("---"):
        return None

    parts = content.split("---", 2)
    if len(parts) < 3:
        return None

    try:
        meta = yaml.safe_load(parts[1])
    except yaml.YAMLError:
        return None

    if not meta or not meta.get("name") or not meta.get("description"):
        return None

    return meta


def find_skill_dir(repo_root, module, skill_name):
    """Find the skill directory in the repo."""
    path = os.path.join(repo_root, module, "skills", skill_name)
    if os.path.isdir(path) and os.path.isfile(os.path.join(path, "SKILL.md")):
        return path
    return None


def build_plugin(repo_root, output_dir, version):
    """Build the plugin zip file."""
    repo_root = os.path.abspath(repo_root)
    if not os.path.isdir(repo_root):
        print(f"ERROR: Repo root not found: {repo_root}")
        return False

    os.makedirs(output_dir, exist_ok=True)

    plugin_name = PLUGIN_META["name"]
    output_file = os.path.join(output_dir, f"{plugin_name}.plugin")

    # Collect all skill directories
    skills_found = []
    skills_missing = []
    validation_errors = []

    for module, skill_names in SKILL_MAP.items():
        for skill_name in skill_names:
            skill_dir = find_skill_dir(repo_root, module, skill_name)
            if skill_dir is None:
                skills_missing.append(f"{module}/skills/{skill_name}")
                continue

            meta = validate_frontmatter(os.path.join(skill_dir, "SKILL.md"))
            if meta is None:
                validation_errors.append(f"{module}/skills/{skill_name}/SKILL.md — invalid frontmatter")
                continue

            if meta["name"] != skill_name:
                validation_errors.append(
                    f"{module}/skills/{skill_name}/SKILL.md — name '{meta['name']}' != directory '{skill_name}'"
                )
                continue

            skills_found.append({
                "name": skill_name,
                "module": module,
                "dir": skill_dir,
                "meta": meta,
            })

    # Report
    print(f"Skills found: {len(skills_found)}")
    if skills_missing:
        print(f"Skills missing ({len(skills_missing)}):")
        for s in skills_missing:
            print(f"  MISSING: {s}")
    if validation_errors:
        print(f"Validation errors ({len(validation_errors)}):")
        for e in validation_errors:
            print(f"  ERROR: {e}")

    if not skills_found:
        print("ERROR: No valid skills found. Cannot build plugin.")
        return False

    # Build plugin.json
    plugin_json = {**PLUGIN_META, "version": version}

    # Build zip
    file_count = 0
    with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zf:
        # Write plugin.json at .claude-plugin/plugin.json
        plugin_json_str = json.dumps(plugin_json, indent=2, ensure_ascii=False)
        zf.writestr(".claude-plugin/plugin.json", plugin_json_str)
        file_count += 1

        # Write README.md at root
        readme_path = os.path.join(repo_root, "product-system", "packages", "ismokraft-product-ops-README.md")
        if os.path.isfile(readme_path):
            zf.write(readme_path, "README.md")
            file_count += 1

        # Write each skill
        for skill in skills_found:
            skill_dir = skill["dir"]
            skill_name = skill["name"]

            for root, dirs, files in os.walk(skill_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, skill_dir)
                    # Plugin structure: skills/<skill-name>/<file>
                    arcname = f"skills/{skill_name}/{rel_path}"
                    arcname = arcname.replace("\\", "/")
                    zf.write(file_path, arcname)
                    file_count += 1

    size_kb = os.path.getsize(output_file) / 1024
    print(f"\nPlugin built: {output_file}")
    print(f"  Version: {version}")
    print(f"  Skills: {len(skills_found)}")
    print(f"  Files: {file_count}")
    print(f"  Size: {size_kb:.0f}KB")

    if skills_missing or validation_errors:
        print(f"\nWARNING: {len(skills_missing)} missing, {len(validation_errors)} errors — plugin is partial")

    return True


def main():
    parser = argparse.ArgumentParser(description="Build ismokraft-product-ops.plugin from git repo")
    parser.add_argument(
        "--repo", "-r",
        default=".",
        help="Path to skill-share git repo root (default: current dir)"
    )
    parser.add_argument(
        "--output", "-o",
        default=".",
        help="Output directory for .plugin file (default: current dir)"
    )
    parser.add_argument(
        "--version", "-v",
        default="1.0.0",
        help="Plugin version (default: 1.0.0)"
    )
    args = parser.parse_args()

    success = build_plugin(args.repo, args.output, args.version)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
