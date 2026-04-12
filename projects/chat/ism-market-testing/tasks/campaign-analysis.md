# Analyze Campaign Results

Ingest a Search Term Report from Seller Central, monitor product-side signals, classify keywords, assess data quality, and write TestResults to CRM. This task is reusable: the artifact calls it for both Phase 1 (discovery) and Phase 2 (validation) analysis with different parameters.

## Input

The user (or artifact) specifies which phase to analyze:
- **phase = discovery** — Analyze Phase 1 auto campaign results
- **phase = validation** — Analyze Phase 2 manual campaign results (includes Phase 1 context)

The user provides:
- **Search Term Report CSV** from Seller Central (file upload or paste)
- **Product name and ASIN** (or the artifact passes this from CRM context)

## Prerequisites

Invoke **ZO- zoho-data-ops READ mode** on the Product_Launches and Campaigns records:

| Check | Source | Required |
|---|---|---|
| Campaigns record with Status = "Active" | CRM Campaigns | Yes |
| MarginRecord (breakeven_acos_pct) | CRM Product_Launches | Yes |
| Search Term Report CSV | User provides (exported from Seller Central) | Yes |

**For validation phase only:**

| Check | Source | Required |
|---|---|---|
| Phase 1 TestResults (keyword buckets, harvested keywords) | CRM ISM_ExecutionLogs | Yes |

## Context files to read

- `ppc-test-campaign-config.ctx.json` — data quality thresholds, extension parameters
- `financial-constants.ctx.json` — margin thresholds for viability assessment
- `gate-criteria.ctx.json` — Gate 2 keyword and ACoS criteria (for preview reference)

## Steps

### 1. Monitor product-side signals

Invoke **PM- product-monitor COLLECT mode** to track:
- BSR movement, review velocity, return rate
- Basic listing health (suppression, buybox status)

Report any anomalies (BSR spike, review drop, listing suppression) as flags in the analysis output.

### 2. Analyze campaign performance

**Discovery phase (phase = discovery):**

Invoke **AO- ads-ops-plan TEST mode** with phase = `analyze_discovery`:
- Provide Search Term Report CSV or manual metrics summary
- breakeven_acos_pct from MarginRecord

The skill analyzes keyword performance, classifies into 4 buckets (winner/learner/loser/no_data), rates data quality, and outputs **TestResults** with harvested keywords and negative keywords.

**Validation phase (phase = validation):**

Invoke **AO- ads-ops-plan TEST mode** with phase = `analyze_validation`:
- Phase 2 Search Term Report CSV
- Phase 1 TestResults for context

The skill outputs TestResults with per-keyword margin viability assessment and blended metrics.

### 3. Persist TestResults

Invoke **ZO- zoho-data-ops WRITE mode** to write an ISM_ExecutionLogs entry:
- Skill_Name: "campaign-analysis-{phase}"
- Output_Summary: full TestResults JSON (keyword buckets, harvested keywords, data quality rating, blended metrics, margin viability for validation)
- Input_Fingerprint: "product={product_name},asin={asin},phase={discovery|validation}"

### 4. Post analysis summary to Slack

Invoke **SM- slack-messaging** to post analysis results to **#ism-launch-alerts** including: product name, phase analyzed, data quality rating, keyword bucket counts (winners/learners/losers), blended ACoS, and recommended next action.

### 5. Decision point (discovery phase only)

If phase = discovery, assess data quality and recommend next step:

- **HIGH or MEDIUM data quality** — recommend proceeding to "Plan Validation Campaign"
- **LOW data quality + extension recommended** — present extension option to user. If approved, extend Phase 1 by `max_extension_days` from config. If rejected, proceed with available data.
- **LOW data quality + no extension possible** — recommend proceeding with caveats, noting reduced confidence in Gate 2 decision

## Completion criteria

This task is done when:
- [x] Product-side signals monitored (BSR, reviews, returns, listing health)
- [x] Search Term Report analyzed and keywords classified
- [x] TestResults written to CRM ISM_ExecutionLogs
- [x] Analysis summary posted to Slack
- [x] Next-step recommendation presented

**After discovery analysis:** Come back for "Plan Validation Campaign" (or extend Phase 1 if LOW data quality).
**After validation analysis:** Come back for "Make Scale Decision" — all evidence is now available for Gate 2.

## Constraints

- **Never estimate test results.** Analyze actual data only.
- **Never invent data.** If a field is null, report null.
- All CRM writes go through `zoho-data-ops` skill.
- All Slack messages go through `slack-messaging` skill for mrkdwn formatting.
