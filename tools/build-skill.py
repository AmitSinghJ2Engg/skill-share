#!/usr/bin/env python3
"""
build-skill.py — Package a skill folder into a .skill zip file.

Usage:
    python build-skill.py <skill-folder> [--output <output-dir>]

Example:
    python build-skill.py product-system/skills/product-spec
    python build-skill.py product-system/skills/product-spec --output ./packages

Cross-platform: runs on Mac, Linux, and Windows.
Uses Python zipfile (not PowerShell Compress-Archive — backslash path issue).
"""

import argparse
import os
import sys
import zipfile
import yaml


def validate_skill(skill_dir):
    """Validate that a skill folder has a SKILL.md with valid frontmatter."""
    skill_md = os.path.join(skill_dir, "SKILL.md")
    if not os.path.isfile(skill_md):
        print(f"ERROR: No SKILL.md found in {skill_dir}")
        return None
    with open(skill_md, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.startswith("---"):
        print(f"ERROR: SKILL.md in {skill_dir} has no YAML frontmatter")
        return None

    parts = content.split("---", 2)
    if len(parts) < 3:
        print(f"ERROR: SKILL.md in {skill_dir} has malformed frontmatter")
        return None

    try:
        meta = yaml.safe_load(parts[1])
    except yaml.YAMLError as e:
        print(f"ERROR: YAML parse error in {skill_dir}/SKILL.md: {e}")
        return None

    if not meta.get("name"):
        print(f"ERROR: SKILL.md in {skill_dir} missing 'name' field")
        return None

    if not meta.get("description"):
        print(f"ERROR: SKILL.md in {skill_dir} missing 'description' field")
        return None

    return meta


def build_skill(skill_dir, output_dir):    """Package a skill folder into a .skill zip file."""
    skill_dir = os.path.abspath(skill_dir)
    if not os.path.isdir(skill_dir):
        print(f"ERROR: {skill_dir} is not a directory")
        return False

    meta = validate_skill(skill_dir)
    if meta is None:
        return False

    skill_name = meta["name"]
    version = meta.get("metadata", {}).get("version", "0.0.0") if isinstance(meta.get("metadata"), dict) else "0.0.0"
    output_file = os.path.join(output_dir, f"{skill_name}.skill")

    os.makedirs(output_dir, exist_ok=True)

    file_count = 0
    with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(skill_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(skill_dir))
                arcname = arcname.replace("\\", "/")
                zf.write(file_path, arcname)
                file_count += 1

    size_kb = os.path.getsize(output_file) / 1024
    print(f"OK: {skill_name} v{version} → {output_file} ({file_count} files, {size_kb:.0f}KB)")
    return True

def main():
    parser = argparse.ArgumentParser(description="Package a skill folder into a .skill zip file")
    parser.add_argument("skill_dir", help="Path to the skill folder (must contain SKILL.md)")
    parser.add_argument("--output", "-o", default=".", help="Output directory for .skill file (default: current dir)")
    args = parser.parse_args()

    try:
        import yaml
    except ImportError:
        print("ERROR: pyyaml is required. Install with: pip install pyyaml")
        sys.exit(1)

    success = build_skill(args.skill_dir, args.output)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()