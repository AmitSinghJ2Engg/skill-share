# tools -- Generic Build & Validation Scripts

These scripts are generic -- not hardcoded to Ismokraft. They work with any plugin or skill directory.

| Script | Purpose |
|---|---|
| `build-plugin.py` | Packages skills into `.plugin` zip files |
| `build-skill.py` | Validates and prepares a SKILL.md for plugin inclusion |
| `build.py` | Unified pipeline: registry + validate + build all plugins |
| `validate-system.py` | Cross-cutting validation + manifest generation |
| `generate-registry.py` | Scans `skills/*/plugin.json` -> `plugin-registry.json` |
| `create-skill.py` | Scaffolds new skill directory + eval test directory |
| `plugin-registry.json` | Generated registry mapping plugins to skills (do not hand-edit) |

See `docs/03-implementation-standards.md` section 2 (Plugin Building Standards) for the full build process.

---

## build-plugin.py

Builds plugins from the skill-share repo. Reads plugin definitions from `plugin-registry.json`.

```
python build-plugin.py --plugin <name>           # build one plugin
python build-plugin.py --all                      # build all plugins
python build-plugin.py --list name1,name2         # build specific plugins
python build-plugin.py --check <name>             # validate without building
python build-plugin.py --list-plugins             # show available plugins
```

Requires `pyyaml` (`pip install pyyaml`).

---

## validate-system.py

Cross-cutting validation for the entire repo. Checks I/O contracts between skills, cross-plugin dependencies, task-skill references, reference file integrity, and context size budgets. Generates `dist/skill-manifest.json` as a machine-readable system map.

```
python validate-system.py                         # Full validation + generate manifest
python validate-system.py --check-only            # Validation only, no file generation
python validate-system.py --manifest-only         # Generate manifest, skip validation
python validate-system.py --update-marketplace    # Regenerate .claude-plugin/marketplace.json
python validate-system.py --fix-suggestions       # Include fix suggestions for failures
```

No external dependencies (stdlib only).

### 5 Validation Checks

1. **I/O Contract Validation** -- Parses mode tables, checks output types match downstream skill inputs.
2. **Cross-Plugin Dependencies** -- Flags when a skill references another skill in a different plugin.
3. **Task-Skill Dependencies** -- Verifies task files reference existing skills and modes.
4. **Reference File Integrity** -- Checks that every `references/` path in SKILL.md exists on disk.
5. **Context Budget** -- Calculates plugin sizes vs 70KB limit and context sizes vs 50KB limit.

### Generation Tasks

- **Registry drift detection** -- Reports when SKILL.md frontmatter differs from plugin-registry.json.
- **Coverage detection** -- Reports skills with/without SKILL.md, skills not in any plugin.
- **Marketplace update** (`--update-marketplace`) -- Regenerates `.claude-plugin/marketplace.json` from registry for all built plugins.
