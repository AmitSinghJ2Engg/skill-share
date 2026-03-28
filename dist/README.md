# dist — Compiled Plugins

Built `.plugin` files ready for installation in Claude Desktop.

**Build using:** `tools/build-plugin.py {source-dir} {output-path}`

**Plugins to be built (see docs/02-business-domain-map.md → Plugin Splitting Plan):**

| File | Covers | Skills | Status |
|---|---|---|---|
| `product-discovery.plugin` | Plugin 1a — Domain 1 early stages | KI, PD, PS, MI | ⚠ Not built |
| `product-evaluation.plugin` | Plugin 1b — Domains 1+1.5 | PE, MC, CO | ⚠ Not built |
| `product-sourcing.plugin` | Plugin 2a — Domain 2 | PC, SI, VO, MC | ⚠ Not built |
| `product-testing.plugin` | Plugin 2b — Domain 2.5 | AO, MO, FO, CO | ⚠ Not built |
| `product-launch.plugin` | Plugin 3 — Domain 3 | CW, CP, CO, FO | ⚠ Not built (future) |
| `product-ops.plugin` | Plugin 4 — Domain 4 | MO, AO, RO, LE | ⚠ Not built (future) |

**Size limit:** Each plugin must be under 70 KB uncompressed. Verify with `du -sb` before packaging.
See `docs/03-implementation-standards.md` §2 for build process and rules.