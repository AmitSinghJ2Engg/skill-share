---
name: campaign-plan
description: >
  Create a TestPlan for a PPC campaign phase — discovery (auto campaign) or
  validation (manual exact-match from harvested keywords). Reusable: called
  twice in the market-testing workflow with different phase parameters.
  Invoke with /campaign-plan. ALWAYS trigger for: "plan discovery campaign",
  "plan validation campaign", "create test plan", "campaign planning".
disable-model-invocation: true
metadata:
  domain: workflow
  prefix: WF-
  version: 1.0.0
  lifecycle: L1_stable
  type: interactive
  schedule: null
  trigger: "Approved scenario exists in CRM (Campaigns.Status = Active)"
  skills_invoked:
    - ads-ops-plan:TEST
    - zoho-data-ops:WRITE
  runtime_context:
    - ppc-test-campaign-config.ctx.json
    - amazon-ads-campaign-fields.ctx.json
---

# Plan Campaign

Create a TestPlan for a PPC campaign phase — either discovery (Phase 1 auto campaign) or validation (Phase 2 manual exact-match campaigns). This workflow is reusable: the artifact calls it twice with different phase parameters.

## Input

The user (or artifact) specifies which phase to plan:
- **phase = discovery** — Plan Phase 1 auto campaign from the approved scenario
- **phase = validation** — Plan Phase 2 validation campaigns from Phase 1's harvested keywords

## Prerequisites

Invoke **ZO- zoho-data-ops READ mode** on the Product_Launches and Campaigns records:

**For discovery (Phase 1):**

| Check | Source | Required |
|---|---|---|
| Campaigns record exists with Status = "Active" | CRM Campaigns | Yes |
| Amazon_Ad_Campaigns records exist with Status = "Approved" | CRM Amazon_Ad_Campaigns | Yes |
| MarginRecord (breakeven_acos_pct, target_acos_pct) | CRM Product_Launches | Yes |

**For validation (Phase 2):**

| Check | Source | Required |
|---|---|---|
| Phase 1 TestResults with harvested + negative keywords | CRM ISM_ExecutionLogs | Yes |
| Phase 1 data quality = HIGH or MEDIUM (or LOW with explicit user override) | ISM_ExecutionLogs | Yes |

## Steps

### Discovery phase (phase = discovery)

Invoke **AO- ads-ops-plan TEST mode** with phase = `plan_discovery`:
- Product name, ASIN, selling price, category from CRM record
- breakeven_acos_pct and target_acos_pct from MarginRecord
- Campaign parameters from the approved Amazon_Ad_Campaigns record (budget, bid strategy, duration)

The skill reads `ppc-test-campaign-config.ctx.json` for defaults and the Amazon_Ad_Campaigns record for approved overrides. It outputs a **TestPlan** aligned with the selected scenario.

### Validation phase (phase = validation)

Invoke **AO- ads-ops-plan TEST mode** with phase = `plan_validation`:
- Harvested keywords from Phase 1 TestResults
- Negative keywords from Phase 1 TestResults

The skill outputs a TestPlan for manual exact-match campaigns targeting Phase 1 winners. Auto campaign continues in parallel with negatives applied.

### Human decision

**TestPlan requires explicit approval before any ad spend is committed.** Present the plan clearly and wait for approval.

### Save to CRM

After approval, invoke **ZO- zoho-data-ops WRITE mode** to update:
- Campaigns record: Test_Phase = "Phase1_Planned" or "Phase2_Planned"
- Amazon_Ad_Campaigns: Status = "Plan_Approved"

## Completion criteria

This workflow is done when:
- [x] TestPlan generated for the requested phase
- [x] Plan approved by human
- [x] CRM records updated with plan status

**Next action (human, outside Claude):** Create the campaigns in Seller Central per the approved TestPlan. After the campaign runs for the configured duration, export the Search Term Report CSV and come back for "Analyze Campaign Results".

## Constraints

- **Never execute Seller Central actions.** Campaign creation is done by team manually.
- **Never auto-approve a TestPlan.** Human always decides.
- All CRM writes go through `zoho-data-ops` skill.
