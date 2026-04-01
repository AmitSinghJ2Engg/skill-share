#!/usr/bin/env python3
"""
create-skill.py -- Scaffold a new skill with validated structure and eval directory.

Enforces skill-creator governance: every new skill gets proper frontmatter,
validated directory structure, and a test suite skeleton.

Usage:
    python tools/create-skill.py {package} {skill-name}
    python tools/create-skill.py {package} {skill-name} --prefix XX --description "..."

Examples:
    python tools/create-skill.py product-sourcing supplier-intelligence
    python tools/create-skill.py product-ops revenue-ops --prefix RO --description "RO- Revenue tracking and reconciliation"
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

SKILL_TEMPLATE = """---
name: {skill_name}
description: >
  {description}
version: "1.0.0"
lifecycle: prototype
---

# {title}

## Purpose
[TODO: 2-3 sentences describing what this skill does and when to use it]

## Modes

| Mode | Input | Output | When to use |
|------|-------|--------|-------------|
| **MODE-1** | [TODO] | [TODO] | [TODO] |

## Execution Steps

### MODE-1

1. [TODO: step 1]
2. [TODO: step 2]
3. [TODO: step 3]

## Trigger Phrases
[TODO: comma-separated trigger phrases]
"""

EVALS_TEMPLATE = {
    "skill": "",
    "version": "1.0.0",
    "test_cases": [
        {
            "name": "test-case-1",
            "mode": "MODE-1",
            "input": {},
            "expected_output": {},
            "rubric": "TODO: evaluation criteria",
        },
        {
            "name": "test-case-2",
            "mode": "MODE-1",
            "input": {},
            "expected_output": {},
            "rubric": "TODO: evaluation criteria",
        },
    ],
}


def to_title(skill_name):
    """Convert kebab-case to Title Case."""
    return " ".join(w.capitalize() for w in skill_name.split("-"))


def main():
    parser = argparse.ArgumentParser(description="Scaffold a new skill with governance")
    parser.add_argument("package", help="Package name (e.g., product-sourcing)")
    parser.add_argument("skill_name", help="Skill name in kebab-case (e.g., supplier-intelligence)")
    parser.add_argument("--prefix", default="XX", help="2-letter skill prefix (e.g., SI)")
    parser.add_argument("--description", default=None, help="Skill description for frontmatter")
    args = parser.parse_args()

    skill_dir = REPO_ROOT / "skills" / args.package / args.skill_name
    test_dir = REPO_ROOT / "tests" / args.skill_name
    ref_dir = skill_dir / "reference"
    skill_md = skill_dir / "SKILL.md"

    # Check if skill already exists
    if skill_md.exists():
        print(f"ERROR: SKILL.md already exists at {skill_md.relative_to(REPO_ROOT)}")
        sys.exit(1)

    # Build description
    description = args.description or f"{args.prefix}- [TODO: describe what this skill does and when to trigger it]"

    # Create skill directory + reference/
    ref_dir.mkdir(parents=True, exist_ok=True)
    (ref_dir / ".gitkeep").touch()
    print(f"  Created {skill_dir.relative_to(REPO_ROOT)}/")

    # Write SKILL.md
    content = SKILL_TEMPLATE.format(
        skill_name=args.skill_name,
        description=description,
        title=to_title(args.skill_name),
    )
    skill_md.write_text(content, encoding="utf-8", newline="\n")
    print(f"  Created {skill_md.relative_to(REPO_ROOT)}")

    # Create test directory + evals.json
    test_dir.mkdir(parents=True, exist_ok=True)
    evals = EVALS_TEMPLATE.copy()
    evals["skill"] = args.skill_name
    evals_path = test_dir / "evals.json"
    evals_path.write_text(
        json.dumps(evals, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"  Created {evals_path.relative_to(REPO_ROOT)}")

    # Run quick_validate if available
    validator = REPO_ROOT / "skills" / "core" / "skill-creator" / "scripts" / "quick_validate.py"
    if validator.exists():
        print("\nRunning quick_validate...")
        result = subprocess.run(
            [sys.executable, str(validator), str(skill_md)],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            print("  Validation passed")
        else:
            print(f"  Validation output:\n{result.stdout}{result.stderr}")

    # Print next steps
    print(f"""
Next steps:
  1. Edit {skill_md.relative_to(REPO_ROOT)} -- fill in Purpose, Modes, Execution Steps
  2. Read docs/02-business-domain-map.md for domain context
  3. Keep SKILL.md under 5 KB; move detail to reference/ files
  4. Add eval test cases to {evals_path.relative_to(REPO_ROOT)}
  5. Run: python tools/generate-registry.py  (to pick up the new skill)
  6. Run: python tools/validate-system.py    (to validate the full system)
""")


if __name__ == "__main__":
    main()
