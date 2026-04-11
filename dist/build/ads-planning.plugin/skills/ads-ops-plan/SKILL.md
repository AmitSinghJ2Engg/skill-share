---
name: ads-ops-plan
description: >
  AO- Amazon PPC campaign planning, scenario generation, market validation test
  analysis, and mid-test monitoring for Domain 2.5. SCENARIO mode: generate 3-5
  Amazon-Ads-compliant campaign flavors from listing + keywords + budget with
  traceable forecast math. TEST mode: structured auto→manual market validation
  with discovery/validation phase planning, phase-end analysis, daily in-progress
  snapshots (daily_check), and Gate 2 readiness evaluation. ANOMALY sub-mode:
  spend spike, ACoS jump, CTR drop, zero-order, budget overpacing detection
  during in-progress test campaigns.
  Scope: Domain 2.5 market testing only. For post-Gate-2 ongoing campaign
  management, use `ads-ops-live`.
  ALWAYS trigger for: "PPC campaign", "test campaign", "auto campaign",
  "manual campaign", "campaign scenarios", "plan campaign flavors", "keyword
  harvesting", "search term report", "ACoS", "ROAS", "test analysis",
  "scale or kill decision", "gate 2 readiness", "campaign anomaly",
  "daily ads check", "sponsored products test", "AO-".
metadata:
  version: 3.0.0
  domain: marketing
  prefix: AO-
---

# Ads Ops — Plan (D2.5)

Amazon PPC campaign planning and market validation for Domain 2.5 product testing.
Three modes: **SCENARIO** (plan flavors), **TEST** (structured validation), plus **ANOMALY** sub-mode for in-progress monitoring.

**Single responsibility:** Plan, analyze, and recommend on D2.5 test campaigns. Does not execute Seller Central actions. Does not calculate margins (margin-calculator's job). Does not manage post-Gate-2 live campaigns (`ads-ops-live`'s job).

---

## Mode Selection

| User has... | Needs... | Run mode |
|---|---|---|
| Product + keywords + budget, needs plan | Scenario comparison + plan selection | **SCENARIO** |
| New product at FBA, scenario selected | Test campaign plan / phase-end analysis | **TEST** (`plan_*` / `analyze_*`) |
| In-progress test, daily check | Status snapshot + anomaly flags | **TEST** `phase=daily_check` |
| Just anomaly check on daily metrics | Anomaly list | **ANOMALY** sub-mode |

**When does a campaign leave this skill's scope?** When `Campaigns.Status` transitions from `Active` (D2.5 testing) to `Scale` (post-Gate-2 PASS). After that, use `ads-ops-live` for health_check and ongoing optimization.

---

## Mode: SCENARIO

Generate 3-5 Amazon-Ads-compliant campaign flavors with traceable forecast math and explicit ranking. Output: `CampaignScenario[]` ranked by the formula in `references/tuning-constants.md §6`. Every forecast cites `references/forecast-model.md` via `computed_via`.

After user selects, persist to CRM as 1 Campaigns + N Amazon_Ad_Campaigns records per the field mapping in `references/schemas-and-steps.md`. The selected scenario's values then take precedence over config defaults in TEST planning (see handoff rule below).

Full input/output schemas, ranking formula, CRM field mapping → `references/schemas-and-steps.md`.

---

## Mode: TEST

Two-phase structured test (Discovery auto → Validation manual exact) per `ppc-test-campaign-config.ctx.json`. Each phase has three sub-phases: `plan_*`, `analyze_*` (one-shot at phase end), and `daily_check` (mid-test snapshot).

**SCENARIO → TEST handoff:** In `plan_discovery` / `plan_validation`, if `selected_scenario_id` is provided, read the linked Campaigns + Amazon_Ad_Campaigns CRM records and **use those values** — the human already approved that scenario, don't silently override. If no scenario_id, fall back to config defaults.

**`daily_check` sub-phase** exists because `daily-ads-analysis` calls this skill every day during an in-progress test. Uses **cumulative** metrics for keyword classification (a keyword with 0 orders today but 5 cumulative is a winner, not a loser). Delta metrics feed anomaly detection. Outputs `MID_TEST_ON_TRACK` when clean, `MID_TEST_ANOMALY` when anomalies[] is populated. Never emits phase-end recommendations — those come from `analyze_*`.

**Gate 2 readiness output:** Both `analyze_validation` and `daily_check` (from day_n ≥ ceil(day_k/2) onward) populate the `gate_2_readiness` block so the test-campaign task can present it at Gate 2 without recomputing. Structure matches `gate-criteria.ctx.json#gate_2` full_criteria + path_a/path_b.

Full schemas and execution steps per sub-phase → `references/schemas-and-steps.md`.

---

## ANOMALY Sub-Mode

5 anomaly types detected against cumulative metrics, daily budget, and test duration:

- `spend_spike` — daily spend above % of daily budget
- `acos_jump` — daily ACoS above breakeven + PP threshold
- `ctr_drop` — daily CTR below % of cumulative CTR
- `zero_orders` — daily clicks above threshold with 0 orders
- `budget_overpacing` — cumulative spend % ahead of elapsed days %

All thresholds in `references/tuning-constants.md §5`. Invoked automatically from TEST `daily_check`, or standalone from the `daily-ads-analysis` task when a campaign is in D2.5 phase. Output: `Anomaly[]`.

Schema + detection rules → `references/schemas-and-steps.md`.

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/ads-metrics.md` — metric formulas, health thresholds, keyword action rules (shared with ads-ops-live)
3. Read `references/tuning-constants.md` — named tunable values (§1-§7, D2.5-scoped)
4. In SCENARIO mode: also read `references/forecast-model.md`
5. Read `ppc-test-campaign-config.ctx.json` — phase config, budgets, data quality thresholds, scenario templates
6. Read `gate-criteria.ctx.json` — Gate 2 full_criteria + Path A/B (needed for gate_2_readiness)
7. Read `amazon-fee-table.ctx.md` — fee reference for margin-context sanity checks
8. If analyzing data: request Search Term Report CSV or summary

---

## Rules

1. **Never execute Seller Central actions.** Output plans and recommendations; team executes manually.
2. **Never estimate ad performance on the fly.** Use `references/forecast-model.md` for SCENARIO forecasts. Analyze actual data for everything else.
3. **Always reference named tunables.** Thresholds, weights, multipliers come from `ppc-test-campaign-config.ctx.json` and `references/tuning-constants.md`, never hardcoded.
4. **Show the math.** Every ACoS, ROAS, CPC, forecast, or ranking score must trace to inputs and formulas in references.
5. **Human approves spend.** TestPlans and budget changes require explicit approval before execution.
6. **Margin decisions go to margin-calculator.** This skill analyzes ad metrics; margin-calculator determines profitability.
7. **Bid recommendations include magnitudes.** "bid_up" alone is incomplete — always emit `recommended_bid_inr` per `references/ads-metrics.md §6`.
8. **Stay in scope.** If a user asks for LIVE health_check or post-Gate-2 scale management, redirect to `ads-ops-live`.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `ads-ops-live` | Sibling — handles D4 ongoing management after Gate 2 PASS |
| `margin-calculator` | Upstream — breakeven ACoS/ROAS targets; COMPARISON mode validates test economics |
| `product-monitor` | Complement — BSR, reviews, returns during test window |
| `fulfillment-ops` | Upstream — FBA dispatch must complete before campaigns start |
| `zoho-data-ops` | Downstream — persists CampaignPlan → Amazon_Ad_Campaigns; writes TestResults to ISM_ExecutionLogs |
| `slack-messaging` | Downstream — formats any Slack-bound output before the task posts |

---

## Reference Files

| File | Purpose |
|---|---|
| `references/ads-metrics.md` | Metric formulas, health thresholds, keyword actions with bid magnitudes (shared) |
| `references/schemas-and-steps.md` | I/O schemas + execution steps for TEST (incl. daily_check), SCENARIO, ANOMALY. CRM field mapping. |
| `references/tuning-constants.md` | All tunable values: health/keyword/bid/verdict thresholds, anomaly thresholds, ranking weights, forecast baselines |
| `references/forecast-model.md` | SCENARIO forecast formulas. Every forecast cites this via `computed_via`. |
| `ppc-test-campaign-config.ctx.json` (project) | Phase durations, budgets, bid defaults, data quality thresholds, scenario templates, campaign naming |
| `gate-criteria.ctx.json` (project) | Gate 2 full_criteria + Path A/B, consumed when populating gate_2_readiness |
| `amazon-ads-campaign-fields.ctx.json` (project) | Amazon Create Campaign field reference for SCENARIO mode |
| `amazon-fee-table.ctx.md` (project) | Fee reference for margin-context sanity checks |