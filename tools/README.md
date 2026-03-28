# tools — Generic Build Scripts

These scripts are generic — not hardcoded to Ismokraft. They work with any plugin or skill directory.

| Script | Purpose | Usage |
|---|---|---|
| `build-plugin.py` | Packages a skill directory into a `.plugin` zip file | `python tools/build-plugin.py <source-dir> <output-path>` |
| `build-skill.py` | Validates and prepares a SKILL.md for plugin inclusion | `python tools/build-skill.py <skill-dir>` |

See `docs/03-implementation-standards.md` §2 (Plugin Building Standards) for the full build process.