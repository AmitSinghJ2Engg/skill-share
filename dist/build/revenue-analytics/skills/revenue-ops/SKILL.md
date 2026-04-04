---
name: revenue-ops
description: >
  RO- Revenue analytics in six modes. SALES: sales by ASIN/channel. RECONCILE: Amazon
  settlement vs Zoho Books. RETURNS: return rates, ODR, root cause. FORECAST: pre-revenue
  scenario projections. P&L: simplified income statement. MARKETING: channel ROAS/CAC/ACoS.
  Read-only. ALWAYS trigger for: "sales report", "revenue", "units sold", "reconcile
  settlement", "fee check", "returns analysis", "ODR", "forecast revenue", "P&L",
  "profit and loss", "marketing efficiency", "ROAS", "CAC", "RO-". If the task involves
  revenue, settlement, returns, or financial projections — trigger.
version: "1.2.0"
lifecycle: prototype
metadata:
  domain: analytics
  prefix: RO-
---

# Revenue Ops

Revenue health analytics. Six modes: what sold, did we get paid, what came back, what will sell, overall P&L, and marketing efficiency.

**Read-only skill. No writes to CRM, Bigin, Books, or any external system.**

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent sales figures, settlement amounts, return counts, or fee breakdowns.
- If required data (settlement CSV, date range, ASIN) is missing, block and state the gap.
- All outputs labelled with data source and date range. Never present estimates as actuals.

---

## Session Protocol

1. Read this SKILL.md
2. If RECONCILE → read project context `amazon-fee-table.ctx.md` for fee verification
3. If FORECAST, P&L, or MARKETING → read `references/forecast-model.md`
4. For mode-specific schemas → read `references/schemas-and-steps.md`

---

## Mode Selection

| User provides... | Run mode |
|---|---|
| Sales data (CSV, pasted, date range) | SALES |
| Amazon settlement CSV / period | RECONCILE |
| Return data (CSV, seller central report) | RETURNS |
| Traffic estimate, CVR, AOV — no sales history | FORECAST |
| Request for P&L or income statement | P&L |
| Marketing spend by channel + revenue | MARKETING |

---

## Mode: SALES

**Trigger:** "sales report", "revenue", "units sold" | **Prefix:** RO-SA-

1. Accept input: CSV, pasted data, or date range (MCP query if available).
2. Compute per-SKU: revenue, net margin (requires COGS from user/memory), WoW/MoM trend.
3. Compute channel breakdown. Rank by revenue (top 5 and bottom 5).
4. Flag margin below threshold and declining trends per `references/metrics-reference.md`.
5. Output SalesReport. See `references/schemas-and-steps.md` for full schema.
6. Format summary using `slack-messaging` skill before posting to Slack.

---

## Mode: RECONCILE

**Trigger:** "settlement report", "fee check", "reconcile" | **Prefix:** RO-RC-

1. Accept Amazon settlement CSV.
2. Parse line items. Apply fee rates from project context `amazon-fee-table.ctx.md`.
3. For each order: compute expected payout = SP - fees. Compare to actual. Flag discrepancies per `references/reconciliation-rules.md`.
4. Map to Zoho Books invoices by order_id. Flag missing invoices.
5. Output ReconciliationReport. See `references/schemas-and-steps.md` for schema. See `references/settlement-schema.md` for CSV column definitions.

---

## Mode: RETURNS

**Trigger:** "return rate", "ODR", "returns report" | **Prefix:** RO-RT-

1. Accept returns data from Seller Central or FBA Returns CSV.
2. Compute return_rate per SKU. Classify reasons per Amazon taxonomy in `references/returns-intelligence.md`.
3. Assess ODR impact. Compute margin loss per SKU.
4. Generate root cause hypothesis and corrective action per `references/returns-intelligence.md`.
5. Output ReturnsReport. See `references/schemas-and-steps.md` for schema.

---

## Mode: FORECAST

**Trigger:** "forecast revenue", "scenario forecast" | **Prefix:** RO-F-

1. Require base_monthly_traffic from operator. **If not provided → block.** Do not invent traffic estimates.
2. Apply 3-scenario model (conservative/realistic/aggressive) per `references/forecast-model.md`.
3. Project 12 months with MoM growth.
4. Declare all defaults used with confidence=LOW. Output ForecastRecord per `references/forecast-model.md`.

---

## Mode: P&L

**Trigger:** "P&L", "profit and loss", "income statement" | **Prefix:** RO-PL-

1. Map available data (actuals or forecast) to P&L line items per `references/forecast-model.md`.
2. For any line without data → null with data_gaps declared. Never fill with estimates.
3. Compute margins: gross, contribution, post-marketing, EBITDA.
4. Output PLStatement. Minimum viable P&L with nulls is valid — declare gaps.

---

## Mode: MARKETING

**Trigger:** "marketing efficiency", "ROAS", "CAC report" | **Prefix:** RO-ME-

1. Require: ad spend, revenue, and orders per channel.
2. Compute ROAS, ACoS, CAC per channel and blended per `references/forecast-model.md`.
3. Flag channels exceeding thresholds from margin-calculator output (breakeven_roas, max_cac).
4. Declare attribution window per channel. Output MarketingEfficiencyReport.

---

## Exception Handling

- Settlement CSV format mismatch → ask user to confirm export format, provide export path
- COGS not available → compute revenue only, flag margin as "requires COGS input"
- Return rate exceeds threshold on any SKU → flag for investigation
- FORECAST with no traffic data → block with specific message
- P&L with all lines null → block, state which 3 inputs unlock the most lines

---

## Reference Files

| File | Read When |
|---|---|
| `references/metrics-reference.md` | SALES — KPI definitions, margin thresholds |
| `references/reconciliation-rules.md` | RECONCILE — fee mapping, discrepancy thresholds |
| `references/settlement-schema.md` | RECONCILE — Amazon India CSV column definitions |
| `references/returns-intelligence.md` | RETURNS — reason codes, ODR rules, corrective actions |
| `references/forecast-model.md` | FORECAST, P&L, MARKETING — scenario model, P&L structure |
| `references/schemas-and-steps.md` | All modes — full I/O schemas and execution steps |