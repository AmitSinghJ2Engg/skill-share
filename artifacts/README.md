# Artifacts

TSX artifact files for Claude.ai conversations. One file per artifact, versioned.

**Naming convention:** `{name}-v{MAJOR}.{MINOR}.artifact.tsx`

**7-module grouping (see DL-015):**

| Module | Chat Project | Artifact | Domains | Status |
|--------|-------------|----------|---------|--------|
| Product Research | ism-product-research | product-research-v1.0.artifact.tsx | D1, D1.5 | Not built |
| Sourcing | ism-sourcing | sourcing-workbench-v1.0.artifact.tsx | D2 | Not built |
| Market Testing | ism-market-testing | market-testing-v1.0.artifact.tsx | D2.5 | Partial (campaign-planner + scale-decision built, merge pending) |
| Portfolio | ism-portfolio | portfolio-dashboard-v1.0.artifact.tsx | Cross-domain | Not built |
| Launch Control | ism-launch-control | launch-control-v1.0.artifact.tsx | D3 | Not built |
| Live Ops | ism-live-ops | ops-dashboard-v1.0.artifact.tsx | D4 | Not built |
| Procurement | ism-procurement | source-to-pay-v1.0.artifact.tsx | S2P | Not built |

**Existing artifacts (pre-merge, to be consolidated into Market Testing module):**

| File | Domain | Status |
|------|--------|--------|
| `campaign-planner-v1.0.artifact.tsx` | D2.5 (Plan + Run) | Built |
| `scale-decision-workbench-v1.0.artifact.tsx` | D2.5 (Analyze + Decide) | Built |

Build artifacts using the artifact prompt in the corresponding Chat project directory.
See `docs/03-implementation-standards.md` section 3 for artifact standards.
See `projects/chat/artifact-prompt-template.md` for the shared artifact generation template.
