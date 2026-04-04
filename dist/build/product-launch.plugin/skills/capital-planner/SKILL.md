---
name: capital-planner
description: >
  CAP- Capital planning in four modes. INVENTORY: reorder points, safety stock, order
  quantities. CASHFLOW: cash position projection with 3 scenarios. BUDGET: monthly budget
  plan across categories. LAUNCH: full capital estimate from order to first payout.
  ALWAYS trigger for: "reorder point", "safety stock", "how many units", "EOQ", "FBA
  stock planning", "cash flow", "cash runway", "working capital", "budget plan",
  "marketing budget", "launch capital", "runway", "CAP-". If the task involves stock
  levels, capital, budgets, or runway — trigger.
version: "1.2.0"
lifecycle: prototype
metadata:
  domain: costing
  prefix: CAP-
---

# Capital Planner

Calculates inventory requirements, projects cash flows, plans budgets, and estimates launch capital.
Four modes — run independently or in sequence. **No writes. Calculation skill only.**

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent stock levels, cash positions, costs, or capital figures not provided as input.
- Do not fabricate Amazon settlement data, payout cycles, or fee amounts.
- If a required input (COGS, daily_units, lead_time) is missing, block and state the gap.
- All outputs are projections/estimates based on stated inputs, not verified actuals.

---

## Session Protocol

1. Read this SKILL.md
2. If INVENTORY → read `references/inventory-formulas.md`
3. If CASHFLOW → read `references/cashflow-model.md`
4. If BUDGET or LAUNCH → read `references/budget-planner.md`
5. For full schemas → read `references/schemas-and-steps.md`

---

## Mode Selection

| User needs... | Run mode |
|---|---|
| Reorder point, safety stock, order quantity | INVENTORY |
| Weekly cash projection, runway, settlement timing | CASHFLOW |
| Marketing, inventory, ops, tools, team budget | BUDGET |
| Capital to launch a new product from zero | LAUNCH |

---

## Mode: INVENTORY

**Trigger:** "reorder point", "safety stock", "how much to order" | **Prefix:** CAP-I-

1. Require: SKU, current stock, daily velocity, lead time, unit COGS. Block if missing.
2. Apply formulas from `references/inventory-formulas.md`: safety stock, reorder point, EOQ.
3. Flag REORDER_NOW if days_remaining < lead_time + safety_days.
4. Output InventoryPlan. See `references/schemas-and-steps.md` for full schema.

**Rules:** Never estimate avg_daily_sales. COGS from margin-calculator or actuals only. FBA lead time includes Amazon check-in (~7 days added).

---

## Mode: CASHFLOW

**Trigger:** "cash flow", "cash runway", "can we afford this" | **Prefix:** CAP-CF-

1. Require: current cash balance, monthly revenue, ad spend, pending orders, COGS.
2. Apply cash flow model from `references/cashflow-model.md`: settlement timing, weekly projections.
3. Compute runway (weeks until net_cash < 0). Flag capital stress per thresholds in `references/cashflow-model.md`.
4. Output CashFlowPlan. See `references/schemas-and-steps.md` for schema.

**Scenario extension (v1.2.0):** When operator asks for scenarios, run CASHFLOW three times with conservative/realistic/aggressive multipliers from `references/budget-planner.md`. Always use conservative for capital planning decisions.

**Rules:** Never estimate COGS. Settlement timing fixed per channel. Ad spend from ads-ops actuals. No MCP writes.

---

## Mode: BUDGET

**Trigger:** "budget plan", "marketing budget", "monthly budget" | **Prefix:** CAP-B-

1. Require: ad budget, fixed costs, order qty, unit COGS.
2. Compute budget categories per `references/budget-planner.md`.
3. Apply contingency. Declare all defaults used — S22.
4. Output BudgetPlan. See `references/schemas-and-steps.md` for schema.

**Pre-revenue rule:** If no revenue actuals, size marketing from target orders x target CPA x 1.3 buffer. Declare assumption.

---

## Mode: LAUNCH

**Trigger:** "launch capital", "how much to launch", "first product capital" | **Prefix:** CAP-L-

1. Require: order qty, unit COGS, packaging cost, PPC daily budget.
2. Compute each launch phase per `references/budget-planner.md`.
3. Project sustainability month. Declare ALL defaults with confidence label.
4. Output LaunchCapitalPlan. See `references/schemas-and-steps.md` for schema.

---

## Exception Handling

- Daily velocity 0 or missing → ask for 30-day sales data
- Settlement cycle varies → note Amazon India standard is biweekly; flag if different
- COGS unavailable → run margin-calculator first, then return
- Opening balance not provided → ask explicitly; do not estimate
- BUDGET: fixed costs not provided → compute variable costs only, declare fixed as null
- LAUNCH: PPC budget not provided → use target_cpa x min_daily_orders as estimate, declare assumption

---

## Reference Files

| File | Read When |
|---|---|
| `references/inventory-formulas.md` | INVENTORY — EOQ, safety stock variants, FBA rules |
| `references/cashflow-model.md` | CASHFLOW — settlement timing, stress thresholds |
| `references/budget-planner.md` | BUDGET + LAUNCH — budget structure, scenarios, launch phases |
| `references/schemas-and-steps.md` | All modes — full I/O schemas and execution steps |