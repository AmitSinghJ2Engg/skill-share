# Ismokraft Skill-Share

Multi-plugin skill repository for Ismokraft's AI-assisted business operations. Structured as a compilable project: skills are source code, tools are the toolchain, dist is compiled output.

## Prerequisites

- **Python 3.9+** — verify: `python --version`
- **PyYAML** — install: `pip install pyyaml`
- **make** (optional) — available via Git Bash on Windows, or use `python make.py` directly

## Directory Structure

```
skill-share/
  plugins.yaml        # Central plugin definitions (all 11 plugins)
  Makefile            # GNU Make wrapper (optional, uses make.py)
  make.py             # Cross-platform Python build tool
  skills/             # Skill source (organized by capability) -- THE source code
    {capability}/
      {skill-name}/
        SKILL.md      # Skill instructions (required)
        references/   # Supporting files (methodology, rubrics, protocols)
        scripts/      # Executable logic (Python, shell)
  context/            # Runtime config (deployed to Claude.ai project knowledge)
    product-pipeline/ # .ctx.json and .ctx.md files
    system-ops/       # Shared governance context
  tasks/              # Task instructions (orchestration definitions)
  projects/           # Project instructions / CLAUDE.md files
  resources/          # Reference PDFs, external guides
  tests/              # Skill evaluations and test suites (per skill-creator)
  artifacts/          # Built JSX artifacts (dashboards, workbenches)
  tools/              # Build scripts + generated registry
  dist/               # Built plugins (.zip + build/ intermediate)
  docs/               # Architecture docs, standards, decisions only
    archive/          # Superseded docs (design history)
  .claude-plugin/     # Marketplace index
```

## Build Pipeline

### Using make.py (recommended, all platforms)

```bash
python make.py help                        # Show all targets
python make.py build                       # Full pipeline: registry + validate + build all
python make.py ci                          # CI mode: registry + validate (no build)
python make.py build-plugin product-ops    # Build single plugin
python make.py clean                       # Remove dist/ artifacts
python make.py all                         # registry + validate + build + manifest + marketplace
```

### Using Makefile (Git Bash / Linux / Mac)

```bash
make help                                  # Show all targets
make build                                 # Full pipeline
make build-plugin P=product-ops            # Single plugin
make ci                                    # CI mode
```

### Individual scripts

```bash
python tools/generate-registry.py          # Read plugins.yaml -> plugin-registry.json
python tools/validate-system.py            # Cross-cutting validation + manifest
python tools/build-plugin.py --all         # Build all plugins to dist/build/
python tools/build-plugin.py --plugin NAME # Build one plugin
```

### Windows troubleshooting

- If `make` is not found: use `python make.py <target>` instead
- If `python` is not found: try `python3` or `py -3`
- If PyYAML is missing: `pip install pyyaml` (or `pip3 install pyyaml`)
- Build runs from repo root — do not `cd` into tools/

## Creating New Skills

```bash
python tools/create-skill.py {capability} {skill-name} [--prefix XX] [--description "..."]
```

This scaffolds the skill directory + eval test directory, then validates structure. See `skills/core/skill-creator/` for the full eval workflow.

## Installation (11 plugins)

**Step 1: Add the marketplace (once per machine)**
```
/plugin marketplace add AmitSinghJ2Engg/skill-share
```

**Step 2: Install plugins**
```
/plugin install product-discovery@skill-share
/plugin install product-evaluation@skill-share
/plugin install product-sourcing@skill-share
/plugin install product-testing@skill-share
/plugin install product-launch@skill-share
/plugin install product-ops@skill-share
/plugin install supplier-research@skill-share
/plugin install revenue-analytics@skill-share
/plugin install governance-audit@skill-share
/plugin install governance-architecture@skill-share
/plugin install governance-business@skill-share
```

**Step 3: Reload**
```
/reload-plugins
```

Or upload `dist/{plugin-name}.zip` to Claude Desktop.

## Documentation

See `docs/README.md` for the full architecture doc index. Start with:
1. `docs/01-system-constraints.md` -- platform limits
2. `docs/02-business-domain-map.md` -- domains, skills, build order
3. `docs/03-implementation-standards.md` -- how to build everything
4. `docs/decision-log.md` -- architecture decisions (DL-001 through DL-013)
