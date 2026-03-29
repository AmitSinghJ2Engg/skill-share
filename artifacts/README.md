# Artifacts

JSX artifact files for Claude.ai conversations. One file per artifact, versioned.

**Naming convention:** `{domain}-{function}-v{MAJOR}.{MINOR}.jsx`

**Artifacts to be built (see docs/02-business-domain-map.md -> Artifact Architecture Standards):**

| File | Project | Domain | Status |
|---|---|---|---|
| `discovery-dashboard-v1.0.jsx` | Product Pipeline | Domain 1 | Not built |
| `positioning-workbench-v1.0.jsx` | Product Pipeline | Domain 1.5 | Not built |
| `sourcing-workbench-v1.0.jsx` | Product Pipeline | Domain 2 | Not built |
| `test-lab-a-v1.0.jsx` | Product Pipeline | Domain 2.5 (Plan + Run) | Not built |
| `test-lab-b-v1.0.jsx` | Product Pipeline | Domain 2.5 (Analyze + Decide) | Not built |
| `portfolio-dashboard-v1.0.jsx` | Product Pipeline | Cross-domain (strategic) | Not built |
| `launch-control-v1.0.jsx` | Launch & Ops | Domain 3 | Not built |
| `ops-dashboard-v1.0.jsx` | Launch & Ops | Domain 4 | Not built |
| `seller-central-ops-v1.0.jsx` | Launch & Ops | Domain 2.5 + 3 (manual ops) | Not built |
| `source-to-pay-tracker-v1.0.jsx` | Launch & Ops | Source to Pay pipeline | Not built |

Build using `artifacts-builder-v2` or `web-artifacts-builder` skills in "System Ops" project.
See `docs/03-implementation-standards.md` section 3 for artifact standards.