# margin-calculator — Tuning Constants

Skill-local values not stored in `context/product-pipeline/financial-constants.ctx.json`. These are margin-calculator-specific tuning knobs that don't apply globally across the system. Anything that's consumed by other skills should be promoted to `financial-constants.ctx.json`.

**Same convention as ads-ops-plan and product-monitor tuning-constants.md per DL-021 / DL-022.**

---

## §1. Defaults (skill-local)

Used by `financial-formulas.md` unit economics chain when the operator hasn't provided an override.

| Name | Value | Meaning |
|---|---|---|
| `defaults.discount_pct` | 10 | Default discount % applied to list_price_inr to get net_sp_inr when operator doesn't specify |
| `defaults.cod_gateway_pct` | 2 | COD / payment gateway fee as % of net_sp_inr |
| `defaults.packaging_shipping_inr` | 100 | Packaging + inbound shipping per unit when operator doesn't specify |
| `defaults.goal_profit_pct` | 10 | Target profit margin above breakeven ACoS, used to compute target_acos_pct |
| `defaults.closing_fee_inr` | 20 | Amazon closing fee per order (budget range, renamed from the ambiguous "marketplace fee" in v2.x) |

---

## §2. LTV Defaults (skill-local)

Used by `financial-formulas.md §4` Lifetime Value computation.

| Name | Value | Meaning |
|---|---|---|
| `ltv.default_lifetime_orders` | 2 | Generic D2C baseline: average customer places 2 orders over their lifetime. Used when no product-specific repeat-purchase data exists. Override with actual cohort data when available. |

**When to revisit:** Once Ismokraft has 6+ months of post-launch cohort data, replace this with category-specific repeat-purchase rates derived from revenue-ops / CRM.

---

## §3. Verdict Thresholds (skill-local quality check)

Used by the ACTUAL mode verdict logic in `SKILL.md`. **These are NOT gate criteria** — margin-calculator's verdict is a skill-internal quality check, independent of Gate 1 and Gate 2 decisions. The skill emits its own PASS / MARGINAL / FAIL to help operators spot unit economics problems early.

| Name | Value | Meaning |
|---|---|---|
| `verdict.ltv_cac_min` | 3 | Minimum LTV:CAC ratio for verdict PASS. Standard D2C benchmark — customer lifetime value should be at least 3× acquisition cost for unit economics to be sustainable at scale. |
| `verdict.marginal_net_margin_floor_pct` | 10 | If 1-2 of the 3 verdict checks fail but net margin is still above this floor, verdict is MARGINAL (not FAIL). Net margin below this floor is always FAIL. |
| `verdict.pass_net_margin_min_pct` | (cite `fc.margins.target_net_margin_pct`) | Minimum net margin for verdict PASS. Cites context file — not duplicated here. |

---

## §4. Mode Sub-Prefix Convention (dropped in v3.0.0)

v2.x documented mode-specific sub-prefixes: `MC-E-` (ESTIMATE), `MC-A-` (ACTUAL), `MC-X-` (COMPARISON), `MC-C-` (CHANNEL), `MC-B-` (BREAKEVEN).

**v3.0.0 dropped these** per DL-023 audit (finding MC15). No other skill in the repo uses mode-specific sub-prefixes, and plugins.yaml / task prompts only use the single `MC-` prefix. Mode selection happens by the `mode` input field, not by prefix. This entry is here for historical reference only — new invocations should use `MC- margin-calculator <MODE> mode`.
