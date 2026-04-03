#!/usr/bin/env python3
"""
generate-registry.py -- Generate tools/plugin-registry.json from plugins.yaml.

Reads the central plugins.yaml, resolves skill metadata from SKILL.md
frontmatter, validates descriptions, and outputs the registry used by
build-plugin.py and validate-system.py.

Usage:
    python tools/generate-registry.py              # Generate registry
    python tools/generate-registry.py --dry-run    # Print to stdout, don't write
    python tools/generate-registry.py --check      # Validate plugins.yaml only

No external dependencies (regex YAML parser, no PyYAML).
"""

import argparse
import json
import os
import re
import sys


# ── Constants ───────────────────────────────────────────────────────

MAX_DESCRIPTION_CHARS = 1024
SKILL_SIZE_WARN_BYTES = 5120  # 5 KB
EXEMPT_SKILLS = {"skill-creator"}  # Anthropic-provided, exempt from size checks


# ── YAML frontmatter parsing (shared with validate-system.py) ──────

def parse_frontmatter(content):
    """Parse YAML frontmatter from --- delimited block. Returns dict or None."""
    if not content.startswith("---"):
        return None
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None
    raw = parts[1].strip()
    if not raw:
        return None

    meta = {}
    current_key = None
    current_val_lines = []

    for line in raw.split("\n"):
        # Multi-line value continuation (folded scalar >)
        if current_key and (line.startswith("  ") or line.startswith("\t")):
            current_val_lines.append(line.strip())
            continue

        # Flush previous key
        if current_key:
            meta[current_key] = " ".join(current_val_lines).strip()
            current_key = None
            current_val_lines = []

        # Key: value
        m = re.match(r'^(\S+)\s*:\s*(.*)', line)
        if m:
            key = m.group(1)
            val = m.group(2).strip()
            if val == ">" or val == "|":
                current_key = key
                current_val_lines = []
            elif val.startswith("[") and val.endswith("]"):
                items = [x.strip().strip("'\"") for x in val[1:-1].split(",") if x.strip()]
                meta[key] = items
            elif val.startswith('"') and val.endswith('"'):
                meta[key] = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                meta[key] = val[1:-1]
            else:
                meta[key] = val

    # Flush last key
    if current_key:
        meta[current_key] = " ".join(current_val_lines).strip()

    return meta


def extract_prefix(description):
    """Extract 2-3 letter prefix from description (e.g. 'PD- Discovers...' -> 'PD')."""
    if not description:
        return ""
    m = re.match(r'^([A-Z]{2,3})-\s', description)
    return m.group(1) if m else ""


def extract_prefix_from_raw(content):
    """Fallback: extract prefix from 'prefix: XX-' in raw frontmatter text."""
    parts = content.split("---", 2)
    if len(parts) < 3:
        return ""
    raw = parts[1]
    m = re.search(r'prefix:\s*([A-Z]{2,3})-?', raw)
    return m.group(1) if m else ""


def read_skill_meta(skill_md_path):
    """Read SKILL.md and return (name, prefix) or None on failure."""
    with open(skill_md_path, "r", encoding="utf-8") as f:
        content = f.read()
    meta = parse_frontmatter(content)
    if not meta or not meta.get("name"):
        return None
    desc = meta.get("description", "")
    prefix = extract_prefix(desc)
    if not prefix:
        prefix = extract_prefix_from_raw(content)
    return {"name": meta["name"], "prefix": prefix}


# ── plugins.yaml parser (simple, no PyYAML) ────────────────────────

def parse_plugins_yaml(yaml_path):
    """Parse plugins.yaml into a dict of plugin definitions.

    Returns: {plugin_name: {description, version, project, skills: [{skill, from}]}}
    """
    with open(yaml_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    plugins = {}
    current_plugin = None
    current_field = None
    current_skill = {}

    for line in lines:
        stripped = line.rstrip()

        # Skip empty lines and comments
        if not stripped or stripped.lstrip().startswith("#"):
            continue

        # Top-level "plugins:" header
        if stripped == "plugins:":
            continue

        # Plugin name (2-space indent, ends with colon)
        m = re.match(r'^  (\S[\w-]+):$', stripped)
        if m:
            # Flush previous skill entry
            if current_skill and current_plugin:
                plugins[current_plugin]["skills"].append(dict(current_skill))
                current_skill = {}

            current_plugin = m.group(1)
            plugins[current_plugin] = {
                "description": "",
                "version": "",
                "project": "",
                "skills": [],
            }
            current_field = None
            continue

        if not current_plugin:
            continue

        # Plugin field (4-space indent)
        fm = re.match(r'^    (\w[\w-]*):\s*(.*)', stripped)
        if fm:
            key = fm.group(1)
            val = fm.group(2).strip().strip('"').strip("'")

            if key == "skills":
                current_field = "skills"
                continue

            plugins[current_plugin][key] = val
            current_field = key
            continue

        # Skill list entry: "- skill: xxx" (6-space indent)
        sm = re.match(r'^      - skill:\s*(.+)', stripped)
        if sm:
            # Flush previous skill
            if current_skill:
                plugins[current_plugin]["skills"].append(dict(current_skill))
            current_skill = {"skill": sm.group(1).strip()}
            continue

        # Skill field continuation: "from: xxx" (8-space indent)
        fm2 = re.match(r'^        from:\s*(.+)', stripped)
        if fm2:
            current_skill["from"] = fm2.group(1).strip()
            continue

    # Flush last skill
    if current_skill and current_plugin:
        plugins[current_plugin]["skills"].append(dict(current_skill))

    return plugins


# ── Validation helpers ──────────────────────────────────────────────

def validate_description(plugin_name, description, warnings):
    """Validate description length and content."""
    if len(description) > MAX_DESCRIPTION_CHARS:
        warnings.append(f"{plugin_name}: description exceeds {MAX_DESCRIPTION_CHARS} chars ({len(description)})")


def check_skill_size(skill_md_path, skill_name, warnings):
    """Warn if SKILL.md exceeds size target."""
    if skill_name in EXEMPT_SKILLS:
        return
    try:
        size = os.path.getsize(skill_md_path)
        if size > SKILL_SIZE_WARN_BYTES:
            warnings.append(f"{skill_name}: SKILL.md is {size} bytes (target: {SKILL_SIZE_WARN_BYTES})")
    except OSError:
        pass


def check_reference_dirs(skill_dir, skill_name, warnings):
    """Warn if singular reference/ exists alongside references/."""
    singular = os.path.join(skill_dir, "reference")
    plural = os.path.join(skill_dir, "references")
    if os.path.isdir(singular) and os.path.isdir(plural):
        warnings.append(f"{skill_name}: both reference/ and references/ exist (remove singular)")


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate plugin-registry.json from plugins.yaml")
    parser.add_argument("--dry-run", action="store_true", help="Print to stdout, don't write")
    parser.add_argument("--check", action="store_true", help="Validate plugins.yaml only")
    parser.add_argument("--repo", "-r", default=None, help="Path to repo root (default: parent of tools/)")
    args = parser.parse_args()

    # Resolve repo root
    if args.repo:
        repo_root = os.path.abspath(args.repo)
    else:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    skills_root = os.path.join(repo_root, "skills")
    yaml_path = os.path.join(repo_root, "plugins.yaml")

    if not os.path.isdir(skills_root):
        print(f"ERROR: skills/ directory not found at {skills_root}")
        sys.exit(1)

    if not os.path.isfile(yaml_path):
        print(f"ERROR: plugins.yaml not found at {yaml_path}")
        sys.exit(1)

    errors = []
    warnings = []
    registry = {
        "_comment": "GENERATED by generate-registry.py from plugins.yaml. Do not edit.",
        "plugins": {},
    }

    # Parse plugins.yaml
    plugins = parse_plugins_yaml(yaml_path)

    if not plugins:
        print("ERROR: No plugins found in plugins.yaml")
        sys.exit(1)

    print(f"Found {len(plugins)} plugin definition(s) in plugins.yaml")

    for plugin_name, pdef in sorted(plugins.items()):
        # Validate required fields
        missing = [f for f in ("description", "version") if not pdef.get(f)]
        if missing:
            errors.append(f"{plugin_name}: missing required fields: {', '.join(missing)}")
            continue

        validate_description(plugin_name, pdef["description"], warnings)

        # Resolve skills
        skill_entries = []
        seen_names = set()

        for inc in pdef.get("skills", []):
            skill_dir_name = inc.get("skill", "")
            from_pkg = inc.get("from", "")
            if not skill_dir_name or not from_pkg:
                errors.append(f"{plugin_name}: skill entry missing 'skill' or 'from'")
                continue

            skill_dir = os.path.join(skills_root, from_pkg, skill_dir_name)
            skill_md = os.path.join(skill_dir, "SKILL.md")
            if not os.path.isfile(skill_md):
                print(f"  WARN: {plugin_name}: skill '{skill_dir_name}' from '{from_pkg}' -> SKILL.md not found (placeholder, skipped)")
                continue

            meta = read_skill_meta(skill_md)
            if meta is None:
                errors.append(f"{skill_md}: could not parse frontmatter (in {plugin_name})")
                continue

            if meta["name"] in seen_names:
                errors.append(f"{plugin_name}: duplicate skill name '{meta['name']}'")
                continue
            seen_names.add(meta["name"])

            check_skill_size(skill_md, meta["name"], warnings)
            check_reference_dirs(skill_dir, meta["name"], warnings)

            skill_entries.append({
                "name": meta["name"],
                "package": from_pkg,
                "prefix": meta["prefix"],
            })

        plugin_entry = {
            "description": pdef["description"],
            "version": pdef["version"],
        }
        if pdef.get("project"):
            plugin_entry["project"] = pdef["project"]
        plugin_entry["skills"] = skill_entries

        registry["plugins"][plugin_name] = plugin_entry
        print(f"  {plugin_name}: {len(skill_entries)} skills")

    # Report warnings
    if warnings:
        print(f"\nWARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  WARN: {w}")

    # Report errors
    if errors:
        print(f"\nERRORS ({len(errors)}):")
        for e in errors:
            print(f"  {e}")
        print("\nAborting: fix errors above before generating registry.")
        sys.exit(1)

    if args.check:
        print("\nplugins.yaml is valid.")
        sys.exit(0)

    # Output
    output = json.dumps(registry, indent=2, ensure_ascii=False) + "\n"

    if args.dry_run:
        print("\n--- Generated registry (dry-run) ---")
        print(output)
    else:
        out_path = os.path.join(repo_root, "tools", "plugin-registry.json")
        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(output)
        print(f"\nRegistry written: {out_path}")
        total = sum(len(p["skills"]) for p in registry["plugins"].values())
        print(f"Total: {len(registry['plugins'])} plugins, {total} skill entries")

    sys.exit(0)


if __name__ == "__main__":
    main()
