# Artifact Lifecycle

Manages every Ismokraft artifact from first build through production to retirement.
Enforces GO FEARLESS quality gates, maintains the Artifact Registry, controls versioning.

---

## Lifecycle States

```
Draft → Review → Production → Retired
```

| State | Meaning |
|---|---|
| Draft | Being built. Not usable by team. |
| Review | Complete. Under quality check + approval. |
| Production | Approved. Live. Team can use. |
| Retired | Replaced or decommissioned. Never deleted. |

---

## Draft → Review

1. Verify: version in filename AND footer; ArtifactFooter component present; changelog populated; schemas match implementation.
2. Run GO FEARLESS Artifact Check (below).
3. Pass → move to Review, notify via `slack-messaging`.
4. Fail → list specific gaps, return to builder.

## Review → Production

1. Update `artifact-registry.md`: state=Production, version, approval date.
2. Update Confluence Central Artifact Directory (page 585826305).
3. Notify via `slack-messaging`.
4. Mark replaced version state=Retired.

## Production → Retired

1. Confirm no active dependencies.
2. Set state=Retired in `artifact-registry.md`.
3. Archive Confluence page — never delete.
4. Notify via `slack-messaging` with replacement artifact name.

---

## Version Bump Rules

| Change | Bump | Review |
|---|---|---|
| Bug fix, typo | PATCH v1.0.x | Fast-track (Slack) |
| New feature, new tab | MINOR v1.x.0 | Full review |
| Breaking change, schema change, MCP rewire | MAJOR vX.0.0 | Full review + migration plan |

Version must match identically: filename, ArtifactFooter, registry entry, Confluence page title.

---

## GO FEARLESS Artifact Check

Run before every Review → Production transition.

```
GO FEARLESS CHECK: [Artifact Name] v[X.Y.Z]
══════════════════════════════════════════════
G Governed:    [pass/fail] Owner assigned? Version in filename + footer? Change process defined?
O Observable:  [pass/fail] Status visible in UI? Health indicators present?
F Feasible:    [pass/fail] Works with current MCP connections? No missing dependencies?
E Enabler:     [pass/fail] Team can use without asking Claude? Low friction?
A Auditable:   [pass/fail] Changelog present? Actions logged? Exportable?
R Resilient:   [pass/fail] Error states handled? Graceful fallback for MCP failures?
L reLiable:    [pass/fail] Consistent output? No random failures or stale data?
S Secure:      [pass/fail] No exposed keys? Data scoped to user only unless shared=true?
S Scalable:    [pass/fail] Performs at 10x data volume? No hardcoded limits?

Score: [N]/9
Verdict: Ready (9/9) | Conditional (7-8/9, gaps documented) | Not ready (<7/9)
```

Conditional is acceptable if gaps are documented, a Jira ISK fix ticket exists, and operator approves.

---

## Artifact Registry (Current State)

| Artifact | Version | Status | Domain |
|---|---|---|---|
| Unit Economics Calculator | v1.0.0 | Production | costing |
| Prompt Library | v1.1.0 | Production | governance |
| Test Campaign Validator | v1 | Production | marketing |
| Product Launch Control Hub | — | Planned | product |
| Vendor Evaluation Spoke | — | Planned | vendor |
| Campaign Manager | — | Planned | marketing |
| Launch Ops Dashboard | — | Planned | operations |
| Ops Command Center | — | Planned | governance |