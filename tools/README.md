# tools -- Generic Build Scripts

These scripts are generic -- not hardcoded to Ismokraft. They work with any plugin or skill directory.

| Script | Purpose | Status |
|---|---|---|
| `build-plugin.py` | Packages skills into `.plugin` zip files | NEEDS REWRITE -- see below |
| `build-skill.py` | Validates and prepares a SKILL.md for plugin inclusion | Operational |
| `plugin-registry.json` | Maps each plugin to its skill list and metadata | Created |

See `docs/03-implementation-standards.md` section 2 (Plugin Building Standards) for the full build process.

---

## build-plugin.py Rewrite Specification

**Current state:** The script is hardcoded to the old single-plugin architecture (`ismokraft-product-ops`). It:
- References a deleted README file (`product-system/packages/ismokraft-product-ops-README.md`)
- Includes `product-ops-config` (removed from plan)
- Builds one monolithic plugin instead of 6
- Has no concept of the 6-plugin split

**Running it now produces a broken plugin.**

### Required Changes

1. **Plugin registry (`plugin-registry.json`):** Define all 6 plugins with their metadata and skill lists:
   - `product-discovery` (Plugin 1a): KI, PD, PS, MI
   - `product-evaluation` (Plugin 1b): PE, MC, CO
   - `product-sourcing` (Plugin 2a): SP, SI, VO, MC
   - `product-testing` (Plugin 2b): AO, MO, FO, CO
   - `product-launch` (Plugin 3): CW, CP, CO, FO
   - `product-ops` (Plugin 4): MO, AO, RO, LE

2. **Build modes:**
   - `python build-plugin.py --plugin product-discovery` (build one)
   - `python build-plugin.py --all` (build all)
   - `python build-plugin.py --list product-discovery,product-evaluation` (build multiple)

3. **Skill location resolution:** All skills live at `skills/{skill-name}/SKILL.md`. No module mapping needed.

4. **Intermediate build directory:** Assemble to `dist/build/{plugin-name}/` before zipping. This allows inspection. Zip only after `--confirm` flag or when using `--all`.

5. **Dependency reporting:** When building, report:
   - Which shared skills are included (margin-calculator in 2 plugins, etc.)
   - If a shared skill's version has changed since last build, warn about other plugins needing rebuild

6. **Validation:**
   - SKILL.md frontmatter must have `name`, `description`, `version`
   - Total uncompressed size must be under 70,000 bytes
   - Skill name in frontmatter must match directory name

7. **Shared skill detection:** Derived automatically from `plugin-registry.json` at build time. Any skill appearing in 2+ plugins is reported as shared. No separate file needed.

### Migration Path

The rewrite should be done during a Cowork build session. Steps:
1. Create `plugin-registry.json`
2. Rewrite `build-plugin.py` to read from registry
3. Test with one plugin that has all skills ready (likely Plugin 1b: PE, MC, CO -- once CO is written)
4. Validate output by installing in Claude Desktop