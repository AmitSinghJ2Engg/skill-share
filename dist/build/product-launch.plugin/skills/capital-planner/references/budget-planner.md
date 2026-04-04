# Budget Planner & Scenario Models — capital-planner
# Owner: capital-planner
# Covers: budget planning, scenario cashflow, launch capital, marketing float, sustainability
# Last updated: 2026-03-15

---

## §1 — Budget Planning Structure (Startup Phase)

Seven budget categories for a pre-revenue / early-stage India ecommerce startup.

### Category Definitions

| Category | What it covers | Frequency |
|---|---|---|
| **Inventory** | COGS × order_qty per SKU, FBA inbound freight | Per order cycle |
| **Marketing** | Meta Ads, Google Ads, Amazon Ads, influencer, organic | Monthly |
| **Platform & Tools** | Shopify plan, Amazon Professional account, design tools, analytics | Monthly |
| **Operations** | Packaging materials, label printing, quality check, returns processing | Monthly |
| **Logistics** | FBA inbound shipping, self-ship costs, 3PL if applicable | Per shipment |
| **Team** | Freelancers, VAs, part-time help (pre-full-time hire) | Monthly |
| **Contingency** | Unexpected costs, price increases, returns spike | Monthly (% of total) |

### Budget Formula

```
monthly_budget_total = inventory_monthly_equiv
                     + marketing_budget
                     + platform_tools_monthly
                     + operations_monthly
                     + logistics_monthly
                     + team_monthly
                     + contingency_pct × subtotal

where:
  inventory_monthly_equiv = (order_qty × cogs) / restock_frequency_months
  contingency_pct         = 0.10 (default 10% of subtotal)
```

### Marketing Budget Sizing Rules

```
marketing_budget_pct_of_revenue:
  Pre-revenue / launch phase:   25–40% of target revenue (invest to build)
  Early revenue (0–3 months):   20–30% of actual revenue
  Growth phase (3–12 months):   15–20% of revenue
  Mature (12+ months):          10–15% of revenue

marketing_budget_floor = max(cpa_target × min_daily_orders × 30, 5000)
  where min_daily_orders = 1 (minimum viable campaign)
```

**Pre-revenue rule:** When there is no revenue history, budget from target:
```
marketing_budget = target_monthly_orders × target_cpa_inr × 1.3
  (1.3 = 30% buffer for learning phase inefficiency)
```

### Ad Float: Why 1.5× is Required

Meta Ads and Google Ads charge on a prepay / threshold billing cycle:
- Meta: charges when account balance hits threshold (₹0 → auto-charge ₹2,000 → ₹5,000 → ₹10,000 as limit increases)
- Google: similar threshold billing, may charge 2–3× per week if spend is high
- Amazon Ads: charges from Amazon seller account balance — need to pre-fund

```
ad_float_required = monthly_ad_budget × 1.5
  (covers 2 billing cycles ahead + threshold charges)
```

---

## §2 — Scenario Cash Flow Multipliers

Three scenarios applied to the base weekly revenue estimate.

| Scenario | Revenue Mult | CAC Mult | Return Rate | Ad Spend % | Description |
|---|---|---|---|---|---|
| Conservative | 0.70 | 1.30 | 10% | 15% | Slower growth, higher acquisition costs, more returns |
| Realistic | 1.00 | 1.00 | 5% | 12% | Base case using trending velocity |
| Aggressive | 1.40 | 0.85 | 3% | 18% | Scaling fast with higher spend, better CAC efficiency |

**Application:**
```
scenario_revenue_week = base_weekly_revenue × revenue_mult
scenario_ad_spend     = scenario_revenue_week × ad_spend_pct × cac_mult
scenario_returns      = scenario_revenue_week × return_rate
scenario_net_revenue  = scenario_revenue_week × (1 - return_rate)
```

**Conservative rationale:** 30% below base — accounts for listing not ranking, PPC learning phase,
supply delays. Use for: minimum runway calculation, raising capital conversations.

**Aggressive rationale:** 40% above base — assumes paid scaling works, repeat purchases begin.
Use for: maximum potential assessment, not for capital planning (too optimistic as floor).

**For capital planning:** Always plan using Conservative scenario.
For opportunity sizing: present all three.

---

## §3 — Launch Capital Estimator

Step-by-step capital requirement for launching one FBA product.

```
Phase 1 — Supplier + Production (Week 0–4):
  production_capital = order_qty × unit_cogs
  packaging_capital  = order_qty × packaging_cost_per_unit
  phase1_total       = production_capital + packaging_capital

Phase 2 — Logistics (Week 4–5):
  inbound_freight    = operator-provided (₹3–8/unit for Jodhpur → Delhi FBA)
  fba_inbound_total  = order_qty × inbound_freight_per_unit
  phase2_total       = fba_inbound_total

Phase 3 — FBA Check-in + Listing Active (Week 5–6):
  listing_setup      = photography (₹5,000–15,000) + A+ content (₹3,000–8,000)
  phase3_total       = listing_setup  [operator-provided or use defaults with label]

Phase 4 — PPC Launch Spend (Week 6–10):
  ppc_launch_budget  = target_daily_spend × 30  [first month aggressive launch]
  phase4_total       = ppc_launch_budget

Phase 5 — First Settlement (Week 8–10):
  first_settlement_in = units_sold_month1 × net_sp × 0.85  [net of Amazon fees]
  cash_tied_up_days   = 56  [8 weeks from order to first payout — ASSUMPTION, declare this]

TOTAL LAUNCH CAPITAL = phase1 + phase2 + phase3 + phase4
CAPITAL LOCKED DURATION = 8 weeks (override with actual supplier lead time)

Cash self-sufficient by:
  month_of_sustainability = when monthly settlement_in > monthly cash_out (all expenses)
  typical_range = Month 3–5 for FBA products
```

**Assumption declaration (mandatory per S22):**
Always output:
```json
{
  "assumptions": [
    {"field": "capital_locked_weeks", "value": 8, "basis": "4w lead + 1w transit + 1w FBA check-in + 2w settlement cycle", "confidence": "MEDIUM", "override": "set actual lead_time_days + 7 + 14"},
    {"field": "listing_setup_cost", "value": 12000, "basis": "default estimate only — actual cost varies", "confidence": "LOW"}
  ]
}
```

---

## §4 — Self-Sustainability Milestone

The business is self-sustaining when monthly cash inflow ≥ monthly cash outflow consistently.

```
monthly_cash_in  = monthly_settlement_amazon + monthly_shopify_payout
monthly_cash_out = monthly_cogs_for_restock + monthly_ad_spend + monthly_fixed_costs

sustainability_gap = monthly_cash_in - monthly_cash_out

sustainability_month = first month where sustainability_gap > 0 for 2 consecutive months
```

**Runway calculation:**
```
runway_weeks = current_cash_balance / weekly_net_burn

where:
  weekly_net_burn = (monthly_cash_out - monthly_cash_in) / 4.33
  if weekly_net_burn <= 0: runway = "∞ (cash flow positive)"
  if cash_balance < 0: runway = "0 (already in deficit)"
```

**Runway alert thresholds:**
| Runway | Status | Action |
|---|---|---|
| > 12 weeks | Healthy | Continue plan |
| 8–12 weeks | Watch | Review spend, accelerate revenue |
| 4–8 weeks | Caution | Pause non-critical ad spend, defer inventory |
| < 4 weeks | Critical — G6 | Suspend new campaigns, emergency capital review |

---

## §5 — Working Capital Formula

```
working_capital_needed = inventory_capital
                        + ad_float_required
                        + ops_float
                        + safety_buffer

where:
  inventory_capital  = order_qty × cogs_per_unit
  ad_float_required  = monthly_ad_budget × 1.5  (see §1 Ad Float)
  ops_float          = monthly_fixed_costs × 2  (2-month operating buffer)
  safety_buffer      = (inventory_capital + ad_float + ops_float) × 0.20

total_capital_needed = working_capital_needed + launch_capital_phase3_4
  (listing setup + PPC launch — one-time)
```

---

## Revision History
| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-03-15 | Created — budget planner, scenario models, launch capital, sustainability milestone |
