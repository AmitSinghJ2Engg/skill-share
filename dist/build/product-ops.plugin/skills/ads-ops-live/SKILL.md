---
name: ads-ops-live
description: >
  AO- Ongoing Amazon PPC campaign health, bid optimization, budget scaling, and
  scale management for Domain 4. LIVE mode: health_check across all campaigns
  (profitable / at_target / above_target / loss_making / no_data classification
  per ads-metrics.md §2), bid recommendations with specific magnitudes (not just
  "bid_up" — always emits recommended_bid_inr), budget scaling guardrails,
  keyword expansion from auto to manual, negative management, and overall health
  verdict (healthy / needs_optimisation / critical / insufficient_data).
  Scope: Domain 4 ongoing management, post-Gate-2 PASS only. For Domain 2.5
  market testing and campaign planning, use `ads-ops-plan`.
  ALWAYS trigger for: "optimize campaigns", "ad performance review",
  "scale budget", "reduce ACoS", "campaign health", "bid optimization",
  "health check campaigns", "ongoing PPC", "live campaign review",
  "wasted spend", "scale decision", "budget scaling", "keyword expansion",
  "negative keywords", "live mode ads", "AO-".
metadata:
  version: 1.0.0
  domain: marketing
  prefix: AO-
---

# Ads Ops — Live (D4)

Ongoing Amazon PPC campaign management for Domain 4. Post-Gate-2 PASS.
One mode: **LIVE** (health_check + bid/budget/keyword optimization).

**Single responsibility:** Health-check, optimize, and scale live PPC campaigns. Does not execute Seller Central actions (team does that manually). Does not calculate margins (margin-calculator's job). Does not plan test campaigns (`ads-ops-plan`'s job).

---

## Mode: LIVE

Ongoing optimization of active campaigns past Gate 2. Operates on cumulative + period metrics, not incremental daily snapshots.

**TEST → LIVE transition:** Use this skill when `Campaigns.Status = Scale` (post-Gate-2 PASS). For campaigns still in `Active` (D2.5 testing), use `ads-ops-plan` instead.

**Five operations:**

1. **Health check** — classify each campaign/keyword using thresholds in `references/ads-metrics.md §2`. Categories: profitable, at_target, above_target, loss_making, no_data.
2. **Bid optimization** — recommend bid adjustments per keyword action rules in `ads-metrics.md §6`. Every bid action output includes the exact `recommended_bid_inr` value, not just an action label. Magnitudes from `tuning-constants.md §3`.
3. **Budget scaling** — if blended ACoS ≤ target, recommend budget increase with guardrails (max +25% per scale action, require 7+ days at target before scaling again).
4. **Keyword expansion** — periodically harvest new winners from auto campaigns (orders ≥ `promote_min_orders` AND acos ≤ target) and promote to manual exact match.
5. **Negative management** — identify and flag wasteful search terms per §6 negate rules.

**Overall health verdict** per `ads-metrics.md §7`: healthy / needs_optimisation / critical / insufficient_data.

**Max 5 recommendations per run** — specific to campaigns/keywords, no generic advice.

Full schemas and execution steps → `references/schemas-and-steps.md`.

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/ads-metrics.md` — metric formulas, health classification, keyword action rules, verdict rules
3. Read `references/tuning-constants.md` — named tunable values (§1-§4, D4 subset)
4. Read `financial-constants.ctx.json` — target and breakeven ACoS references
5. If analyzing data: request bulk report CSV or manual summary

---

## Rules

1. **Never execute Seller Central actions.** Output plans and recommendations; team executes manually.
2. **Never auto-pause or modify campaigns.** Bid changes, negatives, pauses are recommendations only.
3. **Always reference named tunables.** Thresholds and magnitudes come from `references/tuning-constants.md`, never hardcoded.
4. **Show the math.** Every ACoS, ROAS, TACoS, CPC calculation must trace to inputs.
5. **Margin decisions go to margin-calculator.** This skill analyzes ad metrics; margin-calculator determines profitability.
6. **Bid recommendations include magnitudes.** "bid_up" alone is incomplete — always emit `recommended_bid_inr` per `references/ads-metrics.md §6`.
7. **Stay in scope.** If a user asks for SCENARIO planning or TEST validation, redirect to `ads-ops-plan`.
8. **Budget scaling needs stability.** Only recommend budget increases after the campaign has been at-target or profitable for ≥ 7 days. One-off good days don't justify scaling.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `ads-ops-plan` | Sibling — handles D2.5 market testing and campaign planning before Gate 2 |
| `margin-calculator` | Upstream — provides target/breakeven ACoS thresholds for classification |
| `product-monitor` | Complement — tracks BSR, reviews, returns alongside campaign metrics |
| `zoho-data-ops` | Downstream — updates Amazon_Ad_Campaigns cumulative actuals, writes CampaignHealthReport to ISM_ExecutionLogs |
| `slack-messaging` | Downstream — formats any Slack-bound alerts before the task posts |

---

## Reference Files

| File | Purpose |
|---|---|
| `references/ads-metrics.md` | Metric formulas (§1), health classification (§2), campaign taxonomy (§3), CSV field mapping (§4/§5), keyword action rules with bid magnitudes (§6), verdict rules (§7) |
| `references/schemas-and-steps.md` | LIVE input schema, CampaignHealthReport output schema, execution steps |
| `references/tuning-constants.md` | Named tunable values: health thresholds (§1), keyword action thresholds (§2), bid adjustment magnitudes (§3), verdict thresholds (§4) |
| `financial-constants.ctx.json` (project) | target_acos_pct, breakeven_acos_pct references |
| `amazon-fee-table.ctx.md` (project) | Fee reference for margin-context sanity checks |