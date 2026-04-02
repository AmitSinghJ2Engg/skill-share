# Ismokraft Skill-Share

Multi-plugin skill repository for Ismokraft's AI-assisted business operations. Structured as a compilable project: skills are source code, tools are the toolchain, dist is compiled output.

## Directory Structure

```
skill-share/
  skills/             # Skill source (organized by package) -- THE source code
    {package}/
      plugin.json     # Plugin definition (auto-discovered by build)
      {skill-name}/
        SKILL.md      # Skill instructions (required)
        reference/    # Supporting files (methodology, rubrics, protocols)
        scripts/      # Executable logic (Python, shell)
  context/            # Runtime config (deployed to Claude.ai project knowledge)
    product-pipeline/ # .ctx.json and .ctx.md files
    launch-ops/
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

```bash
python make.py build                       # Cross-platform entry point: registry + validate + build all
python make.py ci                          # CI mode: registry check + validation (no build)
```

Or run individual scripts directly:

```bash
python tools/generate-registry.py          # Scan plugin.json -> plugin-registry.json
python tools/validate-system.py            # Cross-cutting validation + manifest
python tools/build-plugin.py --plugin NAME # Build plugin to dist/build/
python tools/build.py --all                # Unified: registry + validate + build all
```

## Creating New Skills

```bash
python tools/create-skill.py {package} {skill-name} [--prefix XX] [--description "..."]
```

This scaffolds the skill directory + eval test directory, then validates structure. See `skills/core/skill-creator/` for the full eval workflow.

## Installation

```
/plugin install product-discovery@AmitSinghJ2Engg/skill-share
```

Or upload `dist/{plugin-name}.zip` to Claude Desktop.

## Documentation

See `docs/README.md` for the full architecture doc index. Start with:
1. `docs/01-system-constraints.md` -- platform limits
2. `docs/02-business-domain-map.md` -- domains, skills, build order
3. `docs/03-implementation-standards.md` -- how to build everything
