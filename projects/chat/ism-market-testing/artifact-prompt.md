# Artifact Prompt — ISM Market Testing

> Base template: see `artifact-prompt-template.md` in this directory's parent.

## Domain Instructions

Build a unified Market Testing artifact for Ismokraft covering Domain 2.5 (Test Listing through Scale Decision). This artifact is the primary workflow interface — users see business actions, not task names or CRM field mappings.

**MCP-powered:** All action buttons call MCP tools directly (Zoho CRM, Bigin, Inventory, Slack). No clipboard bridge — buttons do the job.

### MCP Connections (available in this Chat project)

| Server | Operations |
|---|---|
| Zoho CRM | Read/write: Product_Launches, Campaigns, Amazon_Ad_Campaigns, ISM_ExecutionLogs, ISM_Learnings |
| Zoho Bigin | Read: Product Launch Factory pipeline (stages 4-6) |
| Zoho Inventory | Read: Package records (FBA dispatch verification) |
| Zoho Books | Read: financial reference |
| Slack | Post to: #ism-launch-alerts (C0AKNEW3V6H), #marketing-ops-alerts (C081MG4HXK6) |

### Pipeline State Component (cross-view, always visible)

A sidebar or header component showing the current product's pipeline position:

- **Product selector** — dropdown or card for switching between active products (from CRM Product_Launches records)
- **Pipeline progress** — visual indicators for completed stages:
  - Product Intake (listing parsed, keywords imported)
  - Campaign Setup (scenarios generated, CRM records created)
  - Phase 1 Discovery (campaign planned, running, analyzed)
  - Phase 2 Validation (campaign planned, running, analyzed)
  - Scale Decision (Gate 2 verdict rendered)
- **Next action** — contextual button showing the next logical step based on CRM state. Examples:
  - If no Campaigns record exists → "Prepare Test Launch"
  - If Campaigns.Status = "Active" but no Phase 1 TestResults → "Analyze Campaign Results"
  - If Phase 2 TestResults exist but no Gate 2 verdict → "Make Scale Decision"
- **Status badges** — PASS/WARNING/BLOCK/PENDING color indicators for gate criteria

The pipeline state reads from CRM via MCP on load and refreshes when actions complete.

### Views

1. **Product Intake** — Input Amazon listing URL or paste product data. Preview extracted ListingRecord fields (ASIN, title, bullets, price, BSR, rating, implicit keywords). Import Helium10/Jungle Scout CSV — preview parsed KeywordSet with intent classification and dedup stats. Validate data completeness before proceeding.

   **Action: "Prepare Test Launch"** — MCP-powered:
   - Read Product_Launches record (MarginRecord, CostEstimate, USPStatement, ProductSpec, ComplianceRecord)
   - Verify FBA dispatch readiness (read Zoho Inventory Package record)
   - Generate 3-5 campaign scenarios (Conservative, Balanced, Aggressive, Keyword-focused, Custom)
   - Present scenario comparison table for user selection
   - On selection: write Campaigns record (strategy) + N Amazon_Ad_Campaigns records (individual campaigns) to CRM via MCP
   - Post setup summary to Slack #ism-launch-alerts via MCP

2. **Campaign Planner** — Configure campaigns using Amazon Ads-aligned fields (from `amazon-ads-campaign-fields.ctx.json`). Scenario comparison table showing: total budget, duration, risk level, data quality potential, forecast. Select scenario, review full CampaignPlan details, approve.

   **Action: "Plan Discovery Campaign"** / **"Plan Validation Campaign"** — MCP-powered:
   - Read Campaigns record + approved Amazon_Ad_Campaigns from CRM
   - Generate TestPlan for the selected phase (discovery = auto campaign; validation = manual exact-match campaigns from harvested keywords)
   - Present TestPlan for human approval
   - On approval: write TestPlan status to CRM via MCP

3. **Performance Monitor** — Daily metrics import (paste CSV or enter manually). Trend charts: ACoS, CTR, CVR, CPC over time (Recharts line charts). Day-over-day and cumulative comparisons. Anomaly flags with visual indicators (spend spike, ACoS jump, CTR drop, zero-order days). Budget pacing bar (spent vs remaining vs total). Per-campaign breakdown for multi-campaign scenarios.

   **Action: "Analyze Campaign Results"** — MCP-powered:
   - Process uploaded Search Term Report CSV
   - Read MarginRecord from CRM (breakeven_acos_pct for keyword classification)
   - Monitor product-side signals: BSR, reviews, returns, listing health
   - Classify keywords into 4 buckets (winner/learner/loser/no_data)
   - Assess data quality (HIGH/MEDIUM/LOW)
   - Write TestResults to CRM ISM_ExecutionLogs via MCP
   - Post analysis summary to Slack #ism-launch-alerts via MCP
   - Present data quality verdict and next-step recommendation

4. **Keyword Analyzer** — Per-keyword performance breakdown table with sortable columns. 4-bucket classification (winner/learner/loser/no_data) with color coding. Bid recommendation per keyword based on ACoS vs target. Intent class filter (brand/competitor/generic/long_tail). Negative keyword list builder. Export keyword report for Seller Central actions.

5. **Scale Decision** — The highest-stakes view. Compiles all evidence for Gate 2:

   **Gate 2 Evidence Table (unified, from 4 audited skills):**

   | Source Skill | Contribution Block | Key Fields |
   |---|---|---|
   | ads-ops-plan | gate_2_readiness | forecast vs actual, recommendation |
   | product-monitor | gate_2_contribution | BSR trend, review velocity, return rate |
   | margin-calculator | gate_2_margin_contribution | actual_vs_estimate_delta_pct, blended_acos_threshold_met, scale_feasibility (PROCEED/REVISIT_COGS/ABORT) |
   | compliance-ops | gate_2_compliance_contribution | timeline_verdict (PASS/WARNING/BLOCK), all_certs_expected_before_launch, at_risk_certs[], critical_certs_blocked[], gate_2_compliance_met |

   **Compliance Timeline Panel:**
   - ComplianceTimelineCheck verdict badge (PASS = green, WARNING = amber, BLOCK = red)
   - Per-cert status table: cert_code, cert_name, mandatory flag, expected_date, buffer_days, status (on_track / at_risk / blocking)
   - gate_2_compliance_contribution.rationale text

   **Cost Comparison Panel:**
   - CostComparison: estimate vs actual vs test economics (side-by-side table)
   - CostingScenarios: 3-5 bulk scenarios at different MOQ/price points (Recharts bar chart)
   - gate_2_margin_contribution.scale_feasibility recommendation

   **Gate 2 Pass Criteria** (from `gate-criteria.ctx.json`):
   - Keyword-level margin positive on >= 3 keywords with sufficient volume
   - Blended ACoS <= breakeven ACoS
   - Data quality HIGH or MEDIUM
   - ComplianceTimelineCheck PASS or human-accepted WARNING

   **Action: "Make Scale Decision"** — MCP-powered:
   - Read all evidence from CRM (CostEstimate, MarginRecord, TestResults, ComplianceRecord)
   - Run cost comparison (margin-calculator COMPARISON logic)
   - Run compliance timeline check (compliance-ops TIMELINE_CHECK logic)
   - Present Gate 2 evidence table with recommendation
   - Human selects PASS / FAIL / CONDITIONAL
   - On verdict: dual-write to BOTH Campaigns.Gate_2_Verdict AND Product_Launches.Scale_Verdict via MCP
   - Write execution log to ISM_ExecutionLogs via MCP
   - Write learning signal to ISM_Learnings via MCP
   - Post verdict alert to Slack #ism-launch-alerts via MCP

   **Action: "Approve Scale"** / **"Kill Product"** — explicit verdict buttons:
   - PASS: write ScaleDecision with quantity, target landed cost, launch timeline
   - FAIL: write kill/park rationale

### AI Insights Panel

- Summarize keyword performance patterns (which intent classes convert best)
- Suggest bid adjustments based on ACoS trends
- Predict Gate 2 outcome likelihood from current data trajectory
- Flag data quality risks (insufficient volume, too few keywords)
- Flag compliance risks from gate_2_compliance_contribution (at_risk_certs, critical_certs_blocked)

### Action Buttons (MCP-powered)

All buttons call MCP tools directly. No clipboard bridge.

| Button | View | MCP Operations |
|---|---|---|
| Prepare Test Launch | Product Intake | CRM read Product_Launches, Inventory read Package, CRM write Campaigns + Amazon_Ad_Campaigns, Slack post |
| Plan Discovery Campaign | Campaign Planner | CRM read Campaigns, CRM write TestPlan status |
| Plan Validation Campaign | Campaign Planner | CRM read TestResults, CRM write TestPlan status |
| Analyze Campaign Results | Performance Monitor | CRM read MarginRecord, CRM write ISM_ExecutionLogs, Slack post |
| Make Scale Decision | Scale Decision | CRM read all evidence, CRM dual-write Gate 2 verdict, CRM write ISM_ExecutionLogs + ISM_Learnings, Slack post |
| Approve Scale | Scale Decision | CRM write ScaleDecision + stage advance |
| Kill Product | Scale Decision | CRM write kill rationale, Slack post alert |
| Export JSON | Any | Clipboard fallback (debug/backup only) |

### Storage Keys

- `ism:config:market-testing` — PPC thresholds, Gate 2 criteria, phase config, scenario template defaults
- `ism:market-testing:state` — full artifact state (active view, all form data)
- `ism4_p:{productId}:listing` — ListingRecord per product
- `ism4_p:{productId}:keywords` — imported KeywordSet per product
- `ism4_p:{productId}:scenarios` — generated CampaignScenario[] per product
- `ism4_p:{productId}:strategy` — selected Campaigns record (strategy) + aggregate metrics
- `ism4_p:{productId}:campaigns` — Amazon_Ad_Campaigns records + daily metrics per campaign
- `ism4_p:{productId}:compliance` — ComplianceTimelineCheck + gate_2_compliance_contribution
- `ism4_p:{productId}:scale-decision` — Gate 2 analysis data + verdict

### Config Loading

Load configuration from `ism:config:market-testing` storage key (seeded from project context files). Authoritative sources:
- Gate 2 criteria: `gate-criteria.ctx.json`
- PPC config, scenario templates, thresholds: `ppc-test-campaign-config.ctx.json`
- Financial constants: `financial-constants.ctx.json`
- Compliance timeline thresholds: compliance-ops `tuning-constants.md` §1

If storage key is empty (first load), use these **fallback defaults** until context is seeded:

```json
{
  "gate2_path_a": { "min_orders": 10, "min_cvr": 0.05 },
  "gate2_path_b": { "min_impressions": 500, "min_ctr": 0.003 },
  "target_acos_test": 0.40,
  "phases": ["Discovery", "Validation", "Scale"],
  "keyword_thresholds": {
    "scale_acos_max": 0.30,
    "pause_acos_min": 0.50,
    "kill_spend_no_sales": 500
  },
  "scenario_defaults": {
    "conservative": { "daily_budget": 400, "duration": 10 },
    "balanced": { "daily_budget": 750, "duration": 12 },
    "aggressive": { "daily_budget": 1500, "duration": 14 },
    "keyword_focused": { "daily_budget": 1000, "duration": 12 }
  },
  "anomaly_thresholds": {
    "spend_spike_pct": 1.5,
    "acos_jump_pp": 20,
    "ctr_drop_pct": 0.5
  },
  "compliance": {
    "timeline_buffer_days": 14,
    "critical_buffer_days": 7,
    "warning_buffer_days": 21
  }
}
```

These are fallback values only. Always prefer context-seeded storage when available.

### CRM Module Reference

Two-module campaign system (DL-017):
- **Product_Launches** (ID: 645926000008511067) — product record with MarginRecord, CostEstimate, ComplianceRecord, USPStatement, ProductSpec
- **Campaigns** (ID: 645926000000000055, built-in) — strategy/round level, Gate 2 verdict, aggregate metrics. Lookup to Product_Launches.
- **Amazon_Ad_Campaigns** (custom) — individual campaign level, 1:1 with Seller Central campaigns. Lookups to Campaigns + Product_Launches.
- **ISM_ExecutionLogs** — per-task execution logs with Output_Summary JSON
- **ISM_Learnings** — learning signals for the ism-learning-engine
- Field mappings: see `crm-field-mappings.ctx.json`

### Generate

`market-testing-v1.0.artifact.tsx`
