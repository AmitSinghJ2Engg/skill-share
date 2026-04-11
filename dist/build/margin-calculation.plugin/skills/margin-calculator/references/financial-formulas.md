# Financial Formulas Reference

Unit economics chain for margin calculation and gate checks. **All thresholds cite `context/product-pipeline/financial-constants.ctx.json` (abbreviated `fc.*` below) and `context/product-pipeline/gate-criteria.ctx.json` (`gc.*`) — no hardcoding in this file.**

---

## §1 — Glossary

| Term | Definition |
|---|---|
| `list_price_inr` | MRP / listed price on the platform (pre-discount). Previously called "AOV" in v2.x — renamed for clarity. |
| `net_sp_inr` | `list_price_inr × (1 - discount_pct)`. The price after discount. |
| `cogs_inr` | Cost of goods sold per unit = `purchase_cost + transportation_cost`. **Never estimate** — operator provides or ask. |
| `gross_margin_inr` | `net_sp_inr - cogs_inr` |
| `gross_margin_pct` | `gross_margin_inr / net_sp_inr × 100`. Target: `fc.margins.target_gross_margin_pct` (44%). |
| `total_deductions_inr` | Sum of marketplace fees, packaging/shipping, COD/gateway, returns cost, GST on fees. **Does NOT include GST on the product** — that's pass-through (see `channel-fee-models.md §2`). |
| `net_profit_inr` | `gross_margin_inr - total_deductions_inr`. Per-unit profit before ad spend. |
| `net_margin_pct` | `net_profit_inr / net_sp_inr × 100`. Target: `fc.margins.target_net_margin_pct` (15%). |
| `cpu_inr` | Contribution per unit = `net_sp_inr - cogs_inr - total_deductions_inr` (same as net_profit_inr; alternate name used in break-even). |
| `cpa_inr` | Cost per acquisition (ad spend per order). Derived from ads-ops-plan: `cpa = ad_spend / orders = (acos_pct / 100) × revenue / orders`. |

---

## §2 — Unit Economics Chain

```
net_sp_inr = list_price_inr × (1 - discount_pct)

cogs_inr = purchase_cost + transportation_cost     # operator-provided, never estimated

gross_margin_inr = net_sp_inr - cogs_inr
gross_margin_pct = gross_margin_inr / net_sp_inr × 100

total_deductions_inr =
    referral_fee_inr                # from amazon-fee-table.ctx.md, category-dependent
  + closing_fee_inr                 # from amazon-fee-table.ctx.md
  + weight_handling_fee_inr         # from amazon-fee-table.ctx.md, weight-dependent
  + packaging_shipping_inr          # operator-provided or tuning-constants default
  + cod_gateway_fee_inr             # net_sp × cod_gateway_pct (default 2%)
  + gst_on_fees_inr                 # sum(fees) × 0.18 (ITC — see note below)
  + returns_cost_inr                # channel-fee-models.md §3

net_profit_inr = gross_margin_inr - total_deductions_inr
net_margin_pct = net_profit_inr / net_sp_inr × 100
```

**NOT in the deduction chain (deliberately):**
- **GST on product (12%)** — pass-through. Collected from buyer at SP, remitted to GSTN, offset by input tax credit. Does not erode margin. See `channel-fee-models.md §2` for the full rule.
- **Shipping paid by customer** — pass-through revenue, neutral.

**GST on fees (18%):** This IS in the deduction chain (`gst_on_fees_inr`), but it's technically input tax credit too — the seller can claim it. Treating it as a deduction is a conservative margin view. For cash-basis margin (what actually hits the bank account), leave it in; for accrual-basis, subtract it back out. Default: keep in (conservative).

---

## §3 — Advertising Economics

```
breakeven_acos_pct = net_margin_pct
    # Maximum ACoS the product can sustain before the ad stops being profitable.
    # Equals net margin by definition: at ACoS = net_margin_pct, ad cost = net profit.

target_acos_pct = breakeven_acos_pct - goal_profit_pct
    # ACoS that leaves room for goal profit above breakeven.
    # goal_profit_pct from tuning-constants.md (default 10%).

cpa_max_inr = (target_acos_pct / 100) × net_sp_inr
    # Maximum per-order ad cost that hits the target ACoS at current net_sp.

breakeven_roas = 1 / (breakeven_acos_pct / 100) = 100 / breakeven_acos_pct
    # ROAS corresponding to breakeven ACoS.

cbfa_inr = net_profit_inr - ad_spend_per_unit
    # Contribution Before Fixed Allocation — per-unit contribution after ads, before fixed costs.
    # Used for Gate 1 decision (see §5).
```

**CPA derivation from ads-ops-plan outputs:**
```
if ads-ops-plan provides total spend and total orders:
    cpa_inr = total_ad_spend / total_orders

if ads-ops-plan provides ACoS and revenue:
    cpa_inr = (acos_pct / 100) × revenue_per_order
    where revenue_per_order ≈ net_sp_inr (single-unit baskets) or AOV (multi-unit)
```

---

## §4 — Lifetime Value (LTV)

Standard D2C definition: LTV = profit contribution across all orders from one customer over their lifetime.

```
ltv_orders = fc.ltv.default_lifetime_orders    # default 2 from tuning-constants.md (generic D2C baseline)

blended_profit_per_order_inr = net_profit_inr  # simple version: assume each order contributes the same
                                                # advanced: second-order profit can be higher (no re-acquisition cost)

ltv_inr = net_profit_inr × ltv_orders

ltv_cac_ratio =
    if cpa_inr > 0:
        ltv_inr / cpa_inr
    else:
        null    # undefined — no actual CAC to compare against yet
```

**Verdict threshold** (margin-calculator's skill-local quality check, not a gate): `ltv_cac_ratio > tuning-constants.md#verdict.ltv_cac_min` (default 3). A common D2C benchmark — customer lifetime value should be at least 3× acquisition cost for the unit economics to be healthy at scale.

**Data gap rule:** If `cpa_inr` is null (ads-ops-plan hasn't run yet, or operator hasn't provided CPA), set `ltv_cac_ratio: null` and add `"cpa_inr"` to the output's `gaps` array. **Never estimate CPA.**

---

## §5 — Gate Attribution (read `gate-criteria.ctx.json`)

**margin-calculator outputs feed two different gates at two different domains.** Do NOT conflate them.

### Gate 1 — Market Research Gate (D1 decision)

Triggered by ESTIMATE mode output (or ACTUAL if available early). Per `gc.gate_1.criteria`:
- `cbfa_inr >= gc.gate_1.criteria.cbfa_min_inr` (150)
- `breakeven_acos_pct <= gc.gate_1.criteria.break_even_acos_max_pct` (50)
- Compliance feasibility risk ≤ `gc.gate_1.criteria.compliance_feasibility_max_risk` (MEDIUM) — checked by compliance-ops, not margin-calculator

margin-calculator's contribution to Gate 1 is the first two bullets. Output these as top-level fields in CostEstimate / MarginRecord so a Gate 1 task can read them directly.

### Gate 2 — Scale Decision Gate (D2.5 decision, COMPARISON mode output)

Per `gc.gate_2.full_criteria`, Gate 2 has FOUR criteria, only ONE of which is margin-calculator's concern:
- `keyword_margin_min_positive: 3` — count of keywords where per-keyword net margin is positive at actual CVR/CPC. **This is margin-calculator × ads-ops-plan data joined.**
- `blended_acos_lte: "breakeven_acos_pct"` — blended campaign ACoS must be ≤ breakeven ACoS. **ads-ops-plan** owns the blended ACoS; **margin-calculator** owns the breakeven value.
- `data_quality_required: ["HIGH", "MEDIUM"]` — ads-ops-plan's domain
- `compliance: "PASS or WARNING"` — compliance-ops's domain

margin-calculator's COMPARISON mode populates a `gate_2_margin_contribution` block in its output to surface the first two criteria in a structured way. See `schemas-and-steps.md`.

---

## §6 — Defaults Cross-Reference

**Always prefer context-file values over skill defaults.** This table lists where each commonly-used value lives:

| Value | Source | Default |
|---|---|---|
| `target_gross_margin_pct` | `fc.margins.target_gross_margin_pct` | 44 |
| `target_net_margin_pct` | `fc.margins.target_net_margin_pct` | 15 |
| `gst_rate_pct` (on product, pass-through) | `fc.margins.gst_rate_pct` | 12 |
| `price_floor_inr` | `fc.pricing.price_floor_inr` | 1000 |
| `zero_referral_fee_threshold_inr` | `fc.pricing.zero_referral_fee_threshold_inr` | 1000 |
| `test_phase_acos_max_pct` | `fc.acos_targets.test_phase_max_pct` | 40 |
| `scale_phase_acos_max_pct` | `fc.acos_targets.scale_phase_max_pct` | 30 |
| `weight_ceiling_kg` | `fc.logistics.weight_ceiling_kg` | 2.0 |
| `cbfa.platform_fee_pct` | `fc.formulas.cbfa.platform_fee_pct` | 0.20 |
| `cbfa.fixed_fee_inr` | `fc.formulas.cbfa.fixed_fee_inr` | 60 |
| `cbfa_min_inr` (Gate 1) | `gc.gate_1.criteria.cbfa_min_inr` | 150 |
| `break_even_acos_max_pct` (Gate 1) | `gc.gate_1.criteria.break_even_acos_max_pct` | 50 |
| `discount_pct` (skill-local) | `tuning-constants.md#defaults.discount_pct` | 10 |
| `cod_gateway_pct` (skill-local) | `tuning-constants.md#defaults.cod_gateway_pct` | 2 |
| `packaging_shipping_inr` (skill-local) | `tuning-constants.md#defaults.packaging_shipping_inr` | 100 |
| `goal_profit_pct` (skill-local) | `tuning-constants.md#defaults.goal_profit_pct` | 10 |
| `ltv_orders` (skill-local) | `tuning-constants.md#ltv.default_lifetime_orders` | 2 |
| `ltv_cac_min` (skill-local verdict) | `tuning-constants.md#verdict.ltv_cac_min` | 3 |

**Skill-local values** (the bottom block) are margin-calculator-specific tuning knobs that don't apply globally across skills. They live in `references/tuning-constants.md`. If any starts being consumed by another skill, promote it to `financial-constants.ctx.json`.

---

## §7 — Zero Referral Fee (Amazon India policy)

Products priced at or below `fc.pricing.zero_referral_fee_threshold_inr` (₹1,000) qualify for zero referral fee on Amazon India, effective 2026-03-16. This is a material margin signal for budget-range products and should appear as a flag in the output: `zero_referral_fee_eligible: true/false`.
