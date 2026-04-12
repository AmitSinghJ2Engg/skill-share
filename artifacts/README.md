# Artifacts

TSX artifact files for Claude.ai Chat projects. Built in claude.ai, committed here as versioned snapshots.

## Convention

```
artifact-prompt.md (source, in projects/chat/{module}/)
    → generate in claude.ai Chat project
    → commit built TSX here (snapshot)
```

- **Source of truth:** `projects/chat/{module}/artifact-prompt.md` — the generation spec
- **Built output:** `artifacts/{module}/{name}-v{M}.{m}.artifact.tsx` — committed after claude.ai generation
- **Naming:** `{name}-v{MAJOR}.{MINOR}.artifact.tsx`
- **Format:** TSX (TypeScript + React 18 + Tailwind + Lucide + Recharts)
- **MCP-powered:** Buttons call MCP tools directly (Zoho CRM, Bigin, Slack) — no clipboard bridge

## Workflow

1. Edit `artifact-prompt.md` in the repo (spec changes, new views, new actions)
2. Open the Chat project in claude.ai, upload updated project knowledge
3. Ask Claude to generate/update the artifact per the spec
4. Iterate in Chat until the artifact works with MCP-powered buttons
5. Copy final TSX → commit to `artifacts/{module}/`

**Do not manually edit committed TSX files.** Update the artifact-prompt.md spec and regenerate.

## Modules

| Module | Chat Project | Artifact | Status |
|--------|-------------|----------|--------|
| Market Testing | ism-market-testing | market-testing-v1.0.artifact.tsx | Building (DL-025 Phase 2) |
| Product Research | ism-product-research | product-research-v1.0.artifact.tsx | Not built |
| Sourcing | ism-sourcing | sourcing-workbench-v1.0.artifact.tsx | Not built |
| Portfolio | ism-portfolio | portfolio-dashboard-v1.0.artifact.tsx | Not built |
| Launch Control | ism-launch-control | launch-control-v1.0.artifact.tsx | Not built |
| Live Ops | ism-live-ops | ops-dashboard-v1.0.artifact.tsx | Not built |
| Procurement | ism-procurement | source-to-pay-v1.0.artifact.tsx | Not built |

## Distribution

Artifacts are Chat-project-specific. To share:
- Share the `artifact-prompt.md` spec — anyone regenerates in their own claude.ai project
- The committed TSX serves as a reference snapshot for version tracking and code review
- MCP connections must be configured per-user in their claude.ai project
