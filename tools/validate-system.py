#!/usr/bin/env python3
"""
validate-system.py -- Cross-cutting validation for the skill-share repo.

Validates I/O contracts, cross-plugin references, task-skill dependencies,
reference file integrity, and context budget. Generates dist/skill-manifest.json
as a machine-readable system map.

Usage:
    python tools/validate-system.py                    # Full validation + generate manifest
    python tools/validate-system.py --check-only       # Validation only, no file generation
    python tools/validate-system.py --manifest-only    # Generate manifest, skip validation
    python tools/validate-system.py --update-marketplace  # Regenerate marketplace.json
    python tools/validate-system.py --fix-suggestions  # Include fix suggestions for failures

Cross-platform: runs on Mac, Linux, and Windows. No external dependencies.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

MAX_PLUGIN_SIZE = 70000   # 70 KB uncompressed plugin limit
WARN_PLUGIN_SIZE = 60000  # Warn at 60 KB
MAX_CONTEXT_SIZE = 50000  # 50 KB project knowledge limit
WARN_CONTEXT_SIZE = 40000 # Warn at 40 KB


# ── YAML frontmatter parsing (regex, no PyYAML dependency) ──────────────

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
                # Inline array
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


# ── Mode table parsing ──────────────────────────────────────────────────

def parse_mode_table(content):
    """Extract mode table from SKILL.md. Returns dict of mode -> {input_types, output_types, downstream}."""
    modes = {}

    # Find tables with Mode/Input/Output headers
    # Pattern: lines with | delimiters, header row contains Mode
    lines = content.split("\n")
    in_table = False
    header_cols = []

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped.startswith("|"):
            in_table = False
            header_cols = []
            continue

        cells = [c.strip() for c in stripped.split("|")]
        # Remove empty first/last from leading/trailing |
        cells = [c for c in cells if c or cells.index(c) not in (0, len(cells)-1)]
        if not cells:
            continue

        # Check if this is a header row with Mode
        if any("mode" in c.lower() for c in cells) and any("input" in c.lower() or "output" in c.lower() for c in cells):
            header_cols = [c.lower().replace("*", "").strip() for c in cells]
            in_table = True
            continue

        # Skip separator row
        if in_table and all(re.match(r'^[-:]+$', c) or c == "" for c in cells):
            continue

        if in_table and header_cols:
            if len(cells) < len(header_cols):
                cells.extend([""] * (len(header_cols) - len(cells)))

            row = dict(zip(header_cols, cells))

            # Extract mode name (strip ** bold markers)
            mode_name = row.get("mode", "")
            mode_name = re.sub(r'\*\*', '', mode_name).strip()
            if not mode_name:
                continue

            # Extract output types (backtick-wrapped types)
            output_text = row.get("output", "")
            output_types = re.findall(r'`([^`]+)`', output_text)
            if not output_types:
                # Try plain text extraction
                output_types = [t.strip() for t in output_text.split(",") if t.strip()]

            # Extract input types
            input_text = row.get("input", "")
            input_types = re.findall(r'`([^`]+)`', input_text)
            if not input_types:
                input_types = [t.strip() for t in input_text.split(",") if t.strip() and t.strip() != "+"]

            # Extract downstream -- skip "when to use" columns (descriptions, not skill refs)
            if "when to use" in header_cols:
                downstream = []
            else:
                downstream_text = row.get("downstream", row.get("feeds", ""))
                downstream = [d.strip() for d in re.split(r'[,;]', downstream_text) if d.strip()]

            modes[mode_name] = {
                "input_types": input_types,
                "output_types": output_types,
                "downstream": downstream,
            }

    return modes


# ── Related skills parsing ──────────────────────────────────────────────

def parse_related_skills(content):
    """Extract related skills from Related Skills table."""
    related = []
    lines = content.split("\n")
    in_table = False

    for line in lines:
        stripped = line.strip()

        # Detect Related Skills section
        if re.match(r'^##\s+Related Skills', stripped):
            in_table = True
            continue

        if in_table and stripped.startswith("##"):
            break

        if not in_table or not stripped.startswith("|"):
            continue

        # Skip header and separator
        if "Skill" in stripped and "Relationship" in stripped:
            continue
        if re.match(r'^\|[-\s|:]+\|$', stripped):
            continue

        # Extract skill name from backticks
        skill_match = re.search(r'`([a-z][a-z0-9-]+)`', stripped)
        if skill_match:
            related.append(skill_match.group(1))

    return related


# ── Reference file extraction ───────────────────────────────────────────

def extract_reference_paths(content):
    """Extract all reference/ file paths from SKILL.md content."""
    paths = []

    # Cross-skill references first: other-skill/reference/file.md
    cross_refs = set()
    for m in re.finditer(r'([a-z][a-z0-9-]+/reference/[\w./-]+\.(?:md|json|py|sh))', content):
        full = m.group(1)
        paths.append(full)
        # Track the reference/ part so we don't add it as a local ref
        cross_refs.add(full.split("/", 1)[1])

    # Local reference: reference/filename.ext (not part of a cross-skill path)
    for m in re.finditer(r'(?<![a-z0-9-]/)(reference/[\w./-]+\.(?:md|json|py|sh|txt|yaml|yml))', content):
        ref = m.group(0)
        if ref not in cross_refs and ref not in paths:
            paths.append(ref)

    # Pattern: [text](reference/filename.ext)
    for m in re.finditer(r'\[([^\]]*)\]\((reference/[^)]+)\)', content):
        ref = m.group(2)
        if ref not in cross_refs and ref not in paths:
            paths.append(ref)

    return list(set(paths))


# ── Task parsing ────────────────────────────────────────────────────────

def parse_task_file(filepath):
    """Parse a task .md file. Returns dict with frontmatter and skill invocations."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    meta = parse_frontmatter(content) or {}

    # Extract skill invocations from content
    invocations = []

    # Pattern: **XX- skill-name MODE mode**
    for m in re.finditer(r'\*\*([A-Z]{2})-?\s+([a-z][a-z0-9-]+)\s+(\w+)\s+mode\*\*', content):
        prefix, skill, mode = m.group(1), m.group(2), m.group(3).upper()
        invocations.append({"prefix": prefix, "skill": skill, "mode": mode})

    # Pattern: Invoke **XX- skill-name MODE mode**
    for m in re.finditer(r'[Ii]nvoke\s+\*\*([A-Z]{2})-?\s+([a-z][a-z0-9-]+)\s+(\w+)\s+mode\*\*', content):
        prefix, skill, mode = m.group(1), m.group(2), m.group(3).upper()
        inv = {"prefix": prefix, "skill": skill, "mode": mode}
        if inv not in invocations:
            invocations.append(inv)

    # Also get from frontmatter skills_invoked array
    fm_skills = meta.get("skills_invoked", [])
    if isinstance(fm_skills, str):
        fm_skills = [s.strip() for s in fm_skills.strip("[]").split(",")]

    return {
        "name": meta.get("name", Path(filepath).stem.replace(".task", "")),
        "schedule": meta.get("schedule", ""),
        "skills_invoked_fm": fm_skills,
        "skills_invoked_content": invocations,
        "meta": meta,
    }


# ── Core discovery functions ────────────────────────────────────────────

def load_registry(repo_root):
    path = os.path.join(repo_root, "tools", "plugin-registry.json")
    if not os.path.isfile(path):
        print("ERROR: Plugin registry not found:", path)
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def discover_skills(repo_root):
    """Find all SKILL.md files. Returns dict of skill_name -> {path, package, ...}."""
    skills = {}
    skills_dir = os.path.join(repo_root, "skills")
    if not os.path.isdir(skills_dir):
        return skills

    for package in sorted(os.listdir(skills_dir)):
        pkg_dir = os.path.join(skills_dir, package)
        if not os.path.isdir(pkg_dir):
            continue
        for skill_name in sorted(os.listdir(pkg_dir)):
            skill_dir = os.path.join(pkg_dir, skill_name)
            skill_md = os.path.join(skill_dir, "SKILL.md")
            if os.path.isfile(skill_md):
                with open(skill_md, "r", encoding="utf-8") as f:
                    content = f.read()
                meta = parse_frontmatter(content)
                modes = parse_mode_table(content)
                related = parse_related_skills(content)
                ref_paths = extract_reference_paths(content)

                skills[skill_name] = {
                    "path": skill_md,
                    "dir": skill_dir,
                    "package": package,
                    "content": content,
                    "meta": meta or {},
                    "modes": modes,
                    "related_skills": related,
                    "reference_paths": ref_paths,
                    "size_bytes": len(content.encode("utf-8")),
                }
            elif os.path.isdir(skill_dir):
                # Placeholder directory (no SKILL.md)
                has_gitkeep = os.path.isfile(os.path.join(skill_dir, ".gitkeep")) or \
                              os.path.isfile(os.path.join(skill_dir, "reference", ".gitkeep"))
                if has_gitkeep or os.listdir(skill_dir):
                    skills[skill_name] = {
                        "path": None,
                        "dir": skill_dir,
                        "package": package,
                        "content": None,
                        "meta": {},
                        "modes": {},
                        "related_skills": [],
                        "reference_paths": [],
                        "size_bytes": 0,
                        "placeholder": True,
                    }
    return skills


def parse_task_bundle(task_dir):
    """Parse a task bundle directory (config.yaml + prompt.md). Returns dict."""
    config_path = os.path.join(task_dir, "config.yaml")
    prompt_path = os.path.join(task_dir, "prompt.md")

    if not os.path.isfile(config_path) or not os.path.isfile(prompt_path):
        return None

    # Parse config.yaml with regex (no PyYAML dependency)
    with open(config_path, "r", encoding="utf-8") as f:
        config_content = f.read()

    meta = {}
    for line in config_content.split("\n"):
        m = re.match(r'^(\w[\w-]*)\s*:\s*"?([^"#\n]*)"?\s*$', line)
        if m:
            meta[m.group(1)] = m.group(2).strip().strip('"').strip("'")

    # Parse skill invocations from prompt.md
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_content = f.read()

    invocations = []
    for m in re.finditer(r'\*\*([A-Z]{2})-?\s+([a-z][a-z0-9-]+)\s+(\w+)\s+mode\*\*', prompt_content):
        prefix, skill, mode = m.group(1), m.group(2), m.group(3).upper()
        inv = {"prefix": prefix, "skill": skill, "mode": mode}
        if inv not in invocations:
            invocations.append(inv)

    # Extract skills_invoked from config
    fm_skills = []
    for m in re.finditer(r'skill:\s+([a-z][a-z0-9-]+)', config_content):
        fm_skills.append(m.group(1))

    return {
        "name": meta.get("name", os.path.basename(task_dir)),
        "schedule": meta.get("schedule", meta.get("trigger", "")),
        "skills_invoked_fm": fm_skills,
        "skills_invoked_content": invocations,
        "meta": meta,
    }


def discover_tasks(repo_root):
    """Find all task files. Supports both bundle format and flat .task.md files."""
    tasks = {}
    tasks_dir = os.path.join(repo_root, "tasks")
    if not os.path.isdir(tasks_dir):
        return tasks

    # Bundle format: tasks/{workflow}/{task-name}/prompt.md
    for workflow in sorted(os.listdir(tasks_dir)):
        workflow_dir = os.path.join(tasks_dir, workflow)
        if not os.path.isdir(workflow_dir):
            continue
        for task_name in sorted(os.listdir(workflow_dir)):
            task_dir = os.path.join(workflow_dir, task_name)
            if not os.path.isdir(task_dir):
                continue
            task = parse_task_bundle(task_dir)
            if task:
                tasks[task["name"]] = task

    # Backward-compatible: flat .task.md files in tasks/
    for fname in sorted(os.listdir(tasks_dir)):
        fpath = os.path.join(tasks_dir, fname)
        if not os.path.isfile(fpath) or not fname.endswith(".md"):
            continue
        if fname == "README.md":
            continue
        task = parse_task_file(fpath)
        if task["name"] not in tasks:
            tasks[task["name"]] = task

    return tasks


def get_dir_size(dirpath, exclude_dirs=None):
    """Get total file size of directory, excluding .gitkeep.

    exclude_dirs: iterable of directory names to prune from the walk (not
    counted toward size). Used to exclude dev-time dirs like `evals/` that
    the plugin builder also excludes — keeps validator and builder in sync.
    """
    exclude = set(exclude_dirs or [])
    total = 0
    count = 0
    for dp, dnames, fnames in os.walk(dirpath):
        # Prune excluded dirs in-place so os.walk doesn't descend into them
        dnames[:] = [d for d in dnames if d not in exclude]
        for f in fnames:
            if f == ".gitkeep":
                continue
            total += os.path.getsize(os.path.join(dp, f))
            count += 1
    return total, count


def get_reference_files(skill_dir):
    """List reference files in a skill directory."""
    ref_dir = os.path.join(skill_dir, "reference")
    files = []
    if os.path.isdir(ref_dir):
        for f in sorted(os.listdir(ref_dir)):
            if f == ".gitkeep":
                continue
            fpath = os.path.join(ref_dir, f)
            if os.path.isfile(fpath):
                files.append({"name": f, "size": os.path.getsize(fpath)})
    return files


def build_skill_to_plugin_map(registry):
    """Build a map of skill_name -> [plugin_names]."""
    s2p = {}
    for plugin_name, plugin_def in registry.get("plugins", {}).items():
        for skill_entry in plugin_def.get("skills", []):
            name = skill_entry["name"]
            if name not in s2p:
                s2p[name] = []
            s2p[name].append(plugin_name)
    return s2p


# ── Validation checks ──────────────────────────────────────────────────

def check_io_contracts(skills, fix_suggestions=False):
    """Check 1: I/O contract validation between skills."""
    results = []

    for skill_name, skill in skills.items():
        if skill.get("placeholder"):
            continue

        for mode_name, mode in skill["modes"].items():
            for downstream_ref in mode.get("downstream", []):
                # Parse downstream: "skill-name" or "skill-name MODE"
                parts = downstream_ref.strip().split()
                ds_skill = parts[0].lower().strip()
                ds_mode = parts[1].upper() if len(parts) > 1 else None

                # Skip self-references, non-skill references, and mode names within same skill
                if ds_skill == skill_name or ds_skill in ("crm", "slack", "confluence"):
                    continue
                # If downstream looks like a mode name of this skill, skip it
                if ds_skill.upper() in skill["modes"]:
                    continue
                # Skip downstream entries that are clearly descriptions (contain spaces or common words)
                if " " in ds_skill or ds_skill in ("upstream", "downstream", "launch", "team", "reference"):
                    continue

                # Check if downstream skill exists
                if ds_skill not in skills:
                    results.append({
                        "severity": "WARN",
                        "check": "io_contract",
                        "message": f"{skill_name} {mode_name} -> downstream '{ds_skill}' not found (may be unbuilt)",
                    })
                    continue

                ds_data = skills[ds_skill]
                if ds_data.get("placeholder"):
                    results.append({
                        "severity": "WARN",
                        "check": "io_contract",
                        "message": f"{skill_name} {mode_name} -> downstream '{ds_skill}' has no SKILL.md (placeholder only)",
                    })
                    continue

                # Check output type compatibility
                output_types = mode.get("output_types", [])
                if output_types and ds_data["modes"]:
                    # Check if any downstream mode accepts these output types
                    found_match = False
                    for ds_mode_name, ds_mode_data in ds_data["modes"].items():
                        ds_inputs = ds_mode_data.get("input_types", [])
                        for ot in output_types:
                            ot_base = re.sub(r'\[\]$', '', ot)
                            for di in ds_inputs:
                                di_base = re.sub(r'\[\]$', '', di)
                                if ot_base.lower() == di_base.lower() or ot_base in di or di in ot_base:
                                    found_match = True
                                    break
                            if found_match:
                                break
                        if found_match:
                            break

                    if not found_match and output_types[0] not in ("", "+"):
                        msg = f"{skill_name} {mode_name} outputs {output_types} but {ds_skill} inputs don't match"
                        if fix_suggestions:
                            msg += f" (check mode tables in both SKILL.md files)"
                        results.append({
                            "severity": "WARN",
                            "check": "io_contract",
                            "message": msg,
                        })

    return results


def check_cross_plugin(skills, registry):
    """Check 2: Cross-plugin dependency check."""
    results = []
    s2p = build_skill_to_plugin_map(registry)

    for skill_name, skill in skills.items():
        if skill.get("placeholder"):
            continue

        skill_plugins = s2p.get(skill_name, [])

        for related in skill["related_skills"]:
            related_plugins = s2p.get(related, [])

            if not related_plugins:
                results.append({
                    "severity": "INFO",
                    "check": "cross_plugin",
                    "message": f"{skill_name} references '{related}' which is not in any plugin",
                })
                continue

            # Check if they share any plugin
            shared = set(skill_plugins) & set(related_plugins)
            if not shared and skill_plugins and related_plugins:
                results.append({
                    "severity": "WARN",
                    "check": "cross_plugin",
                    "message": f"{skill_name} ({', '.join(skill_plugins)}) references {related} ({', '.join(related_plugins)}) -- cross-plugin dependency",
                })

    return results


def check_task_skills(tasks, skills):
    """Check 3: Task-skill dependency validation."""
    results = []

    for task_name, task in tasks.items():
        for inv in task["skills_invoked_content"]:
            skill = inv["skill"]
            mode = inv["mode"]

            if skill not in skills:
                results.append({
                    "severity": "FAIL",
                    "check": "task_skill",
                    "message": f"Task '{task_name}' invokes skill '{skill}' which doesn't exist",
                })
                continue

            skill_data = skills[skill]
            if skill_data.get("placeholder"):
                results.append({
                    "severity": "WARN",
                    "check": "task_skill",
                    "message": f"Task '{task_name}' invokes '{skill}' which has no SKILL.md (placeholder)",
                })
                continue

            # Check mode exists
            if skill_data["modes"] and mode not in skill_data["modes"]:
                results.append({
                    "severity": "FAIL",
                    "check": "task_skill",
                    "message": f"Task '{task_name}' invokes '{skill}' mode '{mode}' which doesn't exist in mode table (has: {', '.join(skill_data['modes'].keys())})",
                })

    return results


def check_reference_files(skills, repo_root):
    """Check 4: Reference file integrity."""
    results = []

    for skill_name, skill in skills.items():
        if skill.get("placeholder"):
            continue

        for ref_path in skill["reference_paths"]:
            # Determine if it's a cross-skill reference
            if "/" in ref_path and not ref_path.startswith("reference/"):
                # Cross-skill reference like zoho-solutions-architect/reference/bigin-live-state.md
                parts = ref_path.split("/", 1)
                other_skill = parts[0]
                if other_skill in skills and not skills[other_skill].get("placeholder"):
                    full_path = os.path.join(skills[other_skill]["dir"], parts[1])
                    if os.path.isfile(full_path):
                        results.append({
                            "severity": "INFO",
                            "check": "reference_file",
                            "message": f"{skill_name} cross-references {ref_path} (exists, cross-skill)",
                        })
                    else:
                        results.append({
                            "severity": "FAIL",
                            "check": "reference_file",
                            "message": f"{skill_name} references {ref_path} but file not found",
                        })
                else:
                    results.append({
                        "severity": "WARN",
                        "check": "reference_file",
                        "message": f"{skill_name} references {ref_path} but skill '{other_skill}' not found",
                    })
            else:
                # Local reference: reference/file.md
                full_path = os.path.join(skill["dir"], ref_path)
                if not os.path.isfile(full_path):
                    results.append({
                        "severity": "FAIL",
                        "check": "reference_file",
                        "message": f"{skill_name} references {ref_path} but file not found at {os.path.relpath(full_path, repo_root)}",
                    })

    return results


def check_context_budget(repo_root, registry, skills):
    """Check 5: Context budget calculator."""
    results = []

    # Per plugin: sum all skill directories
    s2p = build_skill_to_plugin_map(registry)
    plugin_sizes = {}

    for plugin_name, plugin_def in registry.get("plugins", {}).items():
        total = 200  # plugin.json overhead
        skill_details = []
        for skill_entry in plugin_def.get("skills", []):
            sname = skill_entry["name"]
            pkg = skill_entry.get("package", plugin_name)
            skill_dir = os.path.join(repo_root, "skills", pkg, sname)
            if os.path.isdir(skill_dir):
                # Exclude evals/ — dev-time test scaffolding, not packaged by build-plugin.py
                size, count = get_dir_size(skill_dir, exclude_dirs={"evals"})
                total += size
                skill_details.append({"name": sname, "size": size, "files": count})

        plugin_sizes[plugin_name] = {
            "total": total,
            "skills": skill_details,
        }

        if total > MAX_PLUGIN_SIZE:
            results.append({
                "severity": "FAIL",
                "check": "context_budget",
                "message": f"Plugin '{plugin_name}': {total:,} bytes exceeds {MAX_PLUGIN_SIZE:,} byte limit",
            })
        elif total > WARN_PLUGIN_SIZE:
            results.append({
                "severity": "WARN",
                "check": "context_budget",
                "message": f"Plugin '{plugin_name}': {total:,} bytes approaching {MAX_PLUGIN_SIZE:,} byte limit ({total*100//MAX_PLUGIN_SIZE}%)",
            })
        else:
            results.append({
                "severity": "INFO",
                "check": "context_budget",
                "message": f"Plugin '{plugin_name}': {total:,} bytes ({total*100//MAX_PLUGIN_SIZE}% of {MAX_PLUGIN_SIZE:,} limit)",
            })

    # Per context directory
    context_dir = os.path.join(repo_root, "context")
    if os.path.isdir(context_dir):
        for project in sorted(os.listdir(context_dir)):
            proj_dir = os.path.join(context_dir, project)
            if not os.path.isdir(proj_dir) or project == "pending-updates":
                continue
            size, count = get_dir_size(proj_dir)
            if size > MAX_CONTEXT_SIZE:
                results.append({
                    "severity": "FAIL",
                    "check": "context_budget",
                    "message": f"Context '{project}': {size:,} bytes exceeds {MAX_CONTEXT_SIZE:,} byte limit",
                })
            elif size > WARN_CONTEXT_SIZE:
                results.append({
                    "severity": "WARN",
                    "check": "context_budget",
                    "message": f"Context '{project}': {size:,} bytes approaching {MAX_CONTEXT_SIZE:,} byte limit",
                })
            else:
                results.append({
                    "severity": "INFO",
                    "check": "context_budget",
                    "message": f"Context '{project}': {size:,} bytes ({size*100//MAX_CONTEXT_SIZE}% of {MAX_CONTEXT_SIZE:,} limit)",
                })

    return results, plugin_sizes


# ── Generation tasks ────────────────────────────────────────────────────

def check_registry_drift(skills, registry):
    """Gen 1: Check registry metadata drift from SKILL.md frontmatter."""
    drift = []
    registry_skills = set()
    checked_skills = set()

    for plugin_name, plugin_def in registry.get("plugins", {}).items():
        for skill_entry in plugin_def.get("skills", []):
            sname = skill_entry["name"]
            registry_skills.add(sname)

            # Skip if already checked (shared skills appear in multiple plugins)
            if sname in checked_skills:
                continue
            checked_skills.add(sname)

            if sname not in skills or skills[sname].get("placeholder"):
                continue

            meta = skills[sname]["meta"]
            # Check prefix in description
            desc = meta.get("description", "")
            prefix = skill_entry.get("prefix", "")
            if prefix and prefix + "-" not in desc:
                drift.append({
                    "skill": sname,
                    "field": "prefix",
                    "registry": prefix,
                    "skillmd": f"not found in description",
                })

    return drift, registry_skills


def check_coverage(skills, registry_skills):
    """Gen 3: SKILL.md coverage detection."""
    with_skillmd = []
    placeholder_only = []
    not_in_registry = []

    all_disk_skills = set()

    for sname, sdata in skills.items():
        all_disk_skills.add(sname)
        if sdata.get("placeholder"):
            placeholder_only.append(sname)
        else:
            with_skillmd.append(sname)

    # Skills in registry but no file on disk
    in_registry_no_file = [s for s in registry_skills if s not in all_disk_skills]

    # Skills on disk not in registry
    not_in_registry = [s for s in all_disk_skills if s not in registry_skills]

    return {
        "skills_with_skillmd": sorted(with_skillmd),
        "skills_placeholder_only": sorted(placeholder_only),
        "skills_in_registry_no_file": sorted(in_registry_no_file),
        "skills_on_disk_not_in_registry": sorted(not_in_registry),
    }


def generate_marketplace(repo_root, registry):
    """Gen 2: Update marketplace.json from registry + built plugins."""
    marketplace_path = os.path.join(repo_root, ".claude-plugin", "marketplace.json")

    plugins_list = []
    for plugin_name, plugin_def in registry.get("plugins", {}).items():
        build_dir = os.path.join(repo_root, "dist", "build", f"{plugin_name}.plugin")
        if not os.path.isdir(build_dir):
            continue

        plugins_list.append({
            "name": plugin_name,
            "description": plugin_def.get("description", ""),
            "version": plugin_def.get("version", "1.0.0"),
            "author": plugin_def.get("author", {"name": "Ismokraft"}),
            "source": f"./dist/build/{plugin_name}.plugin",
            "category": "productivity",
            "keywords": ["ismokraft", plugin_name.replace("-", " ")],
        })

    marketplace = {
        "name": "skill-share",
        "owner": {
            "name": "Ismokraft",
            "email": "amit.singh@ismokraft.com",
        },
        "metadata": {
            "description": "Ismokraft business operating system plugins for product discovery, evaluation, sourcing, testing, launch, and operations.",
        },
        "plugins": plugins_list,
    }

    os.makedirs(os.path.dirname(marketplace_path), exist_ok=True)
    with open(marketplace_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(marketplace, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return len(plugins_list)


# ── Manifest generation ─────────────────────────────────────────────────

def generate_manifest(repo_root, skills, tasks, registry, plugin_sizes, coverage, drift, cross_plugin_refs, validation_results):
    """Generate dist/skill-manifest.json."""
    manifest = {
        "_generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "_generator": "validate-system.py",
        "_repo": "skill-share",
    }

    # Skills section
    skills_section = {}
    s2p = build_skill_to_plugin_map(registry)

    for sname, sdata in skills.items():
        if sdata.get("placeholder"):
            continue

        ref_files = get_reference_files(sdata["dir"])
        ref_total = sum(rf["size"] for rf in ref_files)

        modes_section = {}
        for mode_name, mode in sdata["modes"].items():
            modes_section[mode_name] = {
                "input_types": mode.get("input_types", []),
                "output_types": mode.get("output_types", []),
                "downstream": mode.get("downstream", []),
            }

        skills_section[sname] = {
            "package": sdata["package"],
            "prefix": sdata["meta"].get("prefix", ""),
            "version": sdata["meta"].get("version", "unknown"),
            "lifecycle": sdata["meta"].get("lifecycle", "unknown"),
            "size_bytes": sdata["size_bytes"],
            "reference_files": [rf["name"] for rf in ref_files],
            "reference_total_bytes": ref_total,
            "modes": modes_section,
            "related_skills": sdata["related_skills"],
            "plugins": s2p.get(sname, []),
        }

    manifest["skills"] = skills_section

    # Plugins section
    plugins_section = {}
    for plugin_name, plugin_def in registry.get("plugins", {}).items():
        skill_names = [s["name"] for s in plugin_def.get("skills", [])]
        ps = plugin_sizes.get(plugin_name, {"total": 0})
        plugins_section[plugin_name] = {
            "version": plugin_def.get("version", "1.0.0"),
            "skills": skill_names,
            "total_size_bytes": ps["total"],
            "size_limit_bytes": MAX_PLUGIN_SIZE,
            "budget_pct": round(ps["total"] * 100 / MAX_PLUGIN_SIZE, 1) if ps["total"] else 0,
        }

    manifest["plugins"] = plugins_section

    # Tasks section
    tasks_section = {}
    for tname, tdata in tasks.items():
        tasks_section[tname] = {
            "skills_invoked": tdata.get("skills_invoked_fm", []),
            "schedule": tdata.get("schedule", ""),
        }

    manifest["tasks"] = tasks_section

    # Context section
    context_section = {}
    context_dir = os.path.join(repo_root, "context")
    if os.path.isdir(context_dir):
        for project in sorted(os.listdir(context_dir)):
            proj_dir = os.path.join(context_dir, project)
            if not os.path.isdir(proj_dir) or project == "pending-updates":
                continue
            files = []
            total = 0
            for f in sorted(os.listdir(proj_dir)):
                fpath = os.path.join(proj_dir, f)
                if os.path.isfile(fpath) and f != ".gitkeep":
                    fsize = os.path.getsize(fpath)
                    files.append(f)
                    total += fsize
            context_section[project] = {
                "files": files,
                "total_size_bytes": total,
                "size_limit_bytes": MAX_CONTEXT_SIZE,
                "budget_pct": round(total * 100 / MAX_CONTEXT_SIZE, 1) if total else 0,
            }

    manifest["context"] = context_section

    # Coverage
    manifest["coverage"] = coverage

    # Registry drift
    manifest["registry_drift"] = drift

    # Cross-plugin references
    manifest["cross_plugin_references"] = cross_plugin_refs

    # Validation summary
    fails = sum(1 for r in validation_results if r["severity"] == "FAIL")
    warns = sum(1 for r in validation_results if r["severity"] == "WARN")
    infos = sum(1 for r in validation_results if r["severity"] == "INFO")

    manifest["validation"] = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "checks_passed": len(validation_results) - fails,
        "checks_failed": fails,
        "warnings": warns,
        "details": validation_results,
    }

    # Write manifest
    dist_dir = os.path.join(repo_root, "dist")
    os.makedirs(dist_dir, exist_ok=True)
    manifest_path = os.path.join(dist_dir, "skill-manifest.json")
    with open(manifest_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return manifest_path


# ── Report printing ─────────────────────────────────────────────────────

def print_report(results, coverage, drift, plugin_sizes):
    """Print validation report to console."""
    print("\n" + "=" * 60)
    print("SYSTEM VALIDATION REPORT")
    print("=" * 60)

    # Group by check
    by_check = {}
    for r in results:
        check = r["check"]
        if check not in by_check:
            by_check[check] = []
        by_check[check].append(r)

    check_labels = {
        "io_contract": "Check 1: I/O Contract Validation",
        "cross_plugin": "Check 2: Cross-Plugin Dependencies",
        "task_skill": "Check 3: Task-Skill Dependencies",
        "reference_file": "Check 4: Reference File Integrity",
        "context_budget": "Check 5: Context Budget",
    }

    for check_id in ["io_contract", "cross_plugin", "task_skill", "reference_file", "context_budget"]:
        items = by_check.get(check_id, [])
        label = check_labels.get(check_id, check_id)
        fails = [r for r in items if r["severity"] == "FAIL"]
        warns = [r for r in items if r["severity"] == "WARN"]
        infos = [r for r in items if r["severity"] == "INFO"]

        status = "PASS" if not fails else "FAIL"
        if not fails and warns:
            status = "WARN"

        print(f"\n  {label}: {status}")
        for r in fails:
            print(f"    FAIL: {r['message']}")
        for r in warns:
            print(f"    WARN: {r['message']}")
        if len(infos) <= 5:
            for r in infos:
                print(f"    INFO: {r['message']}")
        elif infos:
            print(f"    INFO: {len(infos)} items (see manifest for details)")

    # Coverage summary
    print(f"\n  Coverage:")
    print(f"    Skills with SKILL.md: {len(coverage['skills_with_skillmd'])}")
    print(f"    Placeholder only:     {len(coverage['skills_placeholder_only'])}")
    if coverage["skills_on_disk_not_in_registry"]:
        print(f"    Not in any plugin:    {', '.join(coverage['skills_on_disk_not_in_registry'])}")
    if coverage["skills_in_registry_no_file"]:
        print(f"    In registry, no file: {', '.join(coverage['skills_in_registry_no_file'])}")

    # Drift
    if drift:
        print(f"\n  Registry Drift ({len(drift)}):")
        for d in drift:
            print(f"    {d['skill']}: {d['field']} -- registry={d['registry']}, SKILL.md={d['skillmd']}")

    # Summary
    total_fails = sum(1 for r in results if r["severity"] == "FAIL")
    total_warns = sum(1 for r in results if r["severity"] == "WARN")
    print(f"\n{'=' * 60}")
    print(f"SUMMARY: {total_fails} failures, {total_warns} warnings")
    if total_fails == 0:
        print("Status: PASS (no blocking failures)")
    else:
        print("Status: FAIL (fix failures above)")
    print("=" * 60)


# ── Main ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Cross-cutting validation for skill-share repo")
    parser.add_argument("--check-only", action="store_true", help="Validation only, no file generation")
    parser.add_argument("--manifest-only", action="store_true", help="Generate manifest, skip validation")
    parser.add_argument("--update-marketplace", action="store_true", help="Regenerate marketplace.json")
    parser.add_argument("--fix-suggestions", action="store_true", help="Include fix suggestions for failures")
    parser.add_argument("--repo", "-r", default=None, help="Path to repo root (default: parent of tools/)")

    args = parser.parse_args()

    # Resolve repo root
    if args.repo:
        repo_root = os.path.abspath(args.repo)
    else:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    if not os.path.isdir(repo_root):
        print(f"ERROR: Repo root not found: {repo_root}")
        sys.exit(1)

    print(f"Repo root: {repo_root}")

    # Load data
    registry = load_registry(repo_root)
    skills = discover_skills(repo_root)
    tasks = discover_tasks(repo_root)

    print(f"Found {len([s for s in skills.values() if not s.get('placeholder')])} skills with SKILL.md, "
          f"{len([s for s in skills.values() if s.get('placeholder')])} placeholders, "
          f"{len(tasks)} tasks")

    # Marketplace update
    if args.update_marketplace:
        count = generate_marketplace(repo_root, registry)
        print(f"\nMarketplace updated: {count} built plugin(s) listed in .claude-plugin/marketplace.json")
        if not args.check_only and not args.manifest_only:
            return

    # Run validation
    all_results = []
    cross_plugin_refs = []

    if not args.manifest_only:
        print("\nRunning validation checks...")

        # Check 1: I/O contracts
        io_results = check_io_contracts(skills, args.fix_suggestions)
        all_results.extend(io_results)

        # Check 2: Cross-plugin dependencies
        cp_results = check_cross_plugin(skills, registry)
        all_results.extend(cp_results)
        cross_plugin_refs = [
            {"from_skill": r["message"].split(" (")[0], "detail": r["message"]}
            for r in cp_results if r["severity"] == "WARN"
        ]

        # Check 3: Task-skill dependencies
        ts_results = check_task_skills(tasks, skills)
        all_results.extend(ts_results)

        # Check 4: Reference file integrity
        rf_results = check_reference_files(skills, repo_root)
        all_results.extend(rf_results)

    # Check 5: Context budget (always, needed for manifest)
    cb_results, plugin_sizes = check_context_budget(repo_root, registry, skills)
    all_results.extend(cb_results)

    # Coverage + drift detection (always)
    drift, registry_skills = check_registry_drift(skills, registry)
    coverage = check_coverage(skills, registry_skills)

    # Print report
    if not args.manifest_only:
        print_report(all_results, coverage, drift, plugin_sizes)

    # Generate manifest
    if not args.check_only:
        manifest_path = generate_manifest(
            repo_root, skills, tasks, registry, plugin_sizes,
            coverage, drift, cross_plugin_refs, all_results
        )
        print(f"\nManifest written: {manifest_path}")

    # Exit code
    fails = sum(1 for r in all_results if r["severity"] == "FAIL")
    if args.manifest_only:
        sys.exit(0)  # manifest written; validation pass/fail handled by --check-only
    sys.exit(1 if fails > 0 else 0)


if __name__ == "__main__":
    main()
