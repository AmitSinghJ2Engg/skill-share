#!/usr/bin/env python3
"""
build-skill.py — Package skill folders for standalone deployment.

Modes:
    python build-skill.py <skill-folder>           # Package one skill as .skill zip
    python build-skill.py --all                     # Copy all skills to dist/.claude/skills/
    python build-skill.py <skill-folder> --output <dir>

The --all mode discovers every skill with a SKILL.md under skills/{capability}/
and copies them to dist/.claude/skills/{skill-name}/ for deployment to
~/.claude/skills/ or .claude/skills/.

Cross-platform: runs on Mac, Linux, and Windows.
"""

import argparse
import os
import shutil
import sys
import zipfile

try:
    import yaml
except ImportError:
    yaml = None


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

    if yaml:
        try:
            meta = yaml.safe_load(parts[1])
        except yaml.YAMLError as e:
            print(f"ERROR: YAML parse error in {skill_dir}/SKILL.md: {e}")
            return None
    else:
        # Minimal parse without PyYAML
        meta = {}
        for line in parts[1].strip().split("\n"):
            if ":" in line:
                key, _, val = line.partition(":")
                meta[key.strip()] = val.strip().strip('"').strip("'")

    if not meta.get("name"):
        print(f"ERROR: SKILL.md in {skill_dir} missing 'name' field")
        return None

    if not meta.get("description"):
        print(f"ERROR: SKILL.md in {skill_dir} missing 'description' field")
        return None

    return meta


def build_skill(skill_dir, output_dir):
    """Package a skill folder into a .skill zip file."""
    skill_dir = os.path.abspath(skill_dir)
    if not os.path.isdir(skill_dir):
        print(f"ERROR: {skill_dir} is not a directory")
        return False

    meta = validate_skill(skill_dir)
    if meta is None:
        return False

    skill_name = meta["name"]
    version = meta.get("version", "0.0.0")
    if version == "0.0.0" and isinstance(meta.get("metadata"), dict):
        version = meta["metadata"].get("version", "0.0.0")
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
    print(f"OK: {skill_name} v{version} -> {output_file} ({file_count} files, {size_kb:.0f}KB)")
    return True


def build_all_skills(repo_root, output_dir):
    """Discover all skills with SKILL.md and copy to dist/.claude/skills/."""
    skills_root = os.path.join(repo_root, "skills")
    if not os.path.isdir(skills_root):
        print("ERROR: skills/ directory not found")
        return False

    dest_base = os.path.join(output_dir, ".claude", "skills")

    # Clean previous output
    if os.path.isdir(dest_base):
        shutil.rmtree(dest_base)

    found = 0
    copied = 0
    total_size = 0
    errors = []

    for capability in sorted(os.listdir(skills_root)):
        cap_dir = os.path.join(skills_root, capability)
        if not os.path.isdir(cap_dir):
            continue
        for skill_name in sorted(os.listdir(cap_dir)):
            skill_dir = os.path.join(cap_dir, skill_name)
            skill_md = os.path.join(skill_dir, "SKILL.md")
            if not os.path.isfile(skill_md):
                continue

            found += 1
            meta = validate_skill(skill_dir)
            if meta is None:
                errors.append(skill_name)
                continue

            # Flat output: dist/.claude/skills/{skill-name}/
            dest_dir = os.path.join(dest_base, skill_name)
            os.makedirs(dest_dir, exist_ok=True)

            skill_size = 0
            for dirpath, dirnames, filenames in os.walk(skill_dir):
                for f in filenames:
                    if f == ".gitkeep":
                        continue
                    src_file = os.path.join(dirpath, f)
                    rel_path = os.path.relpath(src_file, skill_dir)
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
                    skill_size += os.path.getsize(dest_file)

            total_size += skill_size
            copied += 1
            print(f"  {skill_name} ({skill_size/1024:.1f} KB)")

    print(f"\n{'='*50}")
    print(f"SKILLS BUILD SUMMARY")
    print(f"{'='*50}")
    print(f"  Found: {found} skills with SKILL.md")
    print(f"  Copied: {copied} skills to {dest_base}")
    print(f"  Total size: {total_size/1024:.1f} KB")
    if errors:
        print(f"  Errors: {len(errors)} — {', '.join(errors)}")
        return False

    return True


def main():
    parser = argparse.ArgumentParser(description="Package skill folders for standalone deployment")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("skill_dir", nargs="?", help="Path to the skill folder (must contain SKILL.md)")
    group.add_argument("--all", "-a", action="store_true", help="Build all skills to dist/.claude/skills/")

    parser.add_argument("--output", "-o", default=None, help="Output directory (default: dist/ or current dir)")
    parser.add_argument("--repo", "-r", default=None, help="Path to repo root (default: parent of tools/)")

    args = parser.parse_args()

    if args.all:
        if args.repo:
            repo_root = os.path.abspath(args.repo)
        else:
            repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        output_dir = args.output or os.path.join(repo_root, "dist")
        success = build_all_skills(repo_root, output_dir)
        sys.exit(0 if success else 1)
    else:
        if not args.skill_dir:
            parser.error("skill_dir is required when not using --all")
        output_dir = args.output or "."
        success = build_skill(args.skill_dir, output_dir)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
