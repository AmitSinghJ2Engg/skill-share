# Founder Resource Model

**Used by:** ALLOCATE mode
**Purpose:** Framework for splitting time, money, and attention between Track 1 and Track 2.
**Constraint:** Solo founder. No delegation to humans (except ops person on Zoho Desk).

---

## Three Resources

| Resource | Unit | Operator must provide |
|---|---|---|
| Time | Hours per week available for focused work | Yes — ask if not stated |
| Capital | Monthly disposable capital (after personal expenses) | Yes — ask if not stated |
| Attention | Cognitive bandwidth — which track gets strategic thinking | Inferred from stage |

---

## Allocation Principles

### Principle 1: T1 Survival Floor

Track 1 must never drop below the minimum attention needed to keep revenue stable.
This means:

- Existing product listings stay active and monitored
- Customer issues get resolved within SLA
- Inventory doesn't stock out
- No new product launches paused mid-execution

**Survival floor estimate:** ~30% of time, ~60% of capital (inventory, ads, ops).
This is a starting point — actual floor depends on T1 maturity and automation level.

### Principle 2: T2 Gets Surplus, Not Core

Until Track 2 generates its own revenue, it runs on whatever Track 1 doesn't need.
This prevents the common solo-founder failure of neglecting the revenue-generating
business for the exciting new idea.

### Principle 3: Stage-Based Allocation

The right split changes as each track matures:

| T1 Stage | T2 Stage | Suggested Time Split | Suggested Capital Split |
|---|---|---|---|
| Pre-revenue | — | 100% T1 / 0% T2 | 100% T1 |
| Early revenue (<₹1L/month) | IDEATE/VALIDATE | 80% T1 / 20% T2 | 90% T1 / 10% T2 |
| Growing (₹1–5L/month) | SCOPE/PLAN | 70% T1 / 30% T2 | 80% T1 / 20% T2 |
| Stable (₹5L+/month, automated) | BUILD | 50% T1 / 50% T2 | 70% T1 / 30% T2 |
| Stable + automated | BETA/LAUNCH | 40% T1 / 60% T2 | 60% T1 / 40% T2 |
| T2 has revenue | POST-LAUNCH | Rebalance based on growth rates | Rebalance based on margins |

### Principle 4: Rebalance Triggers

Reassess allocation when any of these occur:
- T1 revenue changes by ±20% in a month
- T1 product launch enters critical phase
- T2 reaches a new lifecycle stage
- Capital runway drops below 3 months
- Operator feels burned out on one track

### Principle 5: AI Multiplier

Claude and AI tools act as a force multiplier — effectively adding capacity.
Account for this when planning:

| Activity | Without AI | With AI (Claude) | Savings |
|---|---|---|---|
| Market research | 8–12 hrs | 1–2 hrs | ~80% |
| Content writing (listing, blog) | 4–6 hrs | 0.5–1 hr | ~85% |
| Financial modelling | 3–4 hrs | 0.5–1 hr | ~75% |
| Code/prototype building | 20–40 hrs | 5–10 hrs | ~70% |
| Vendor communication drafts | 2–3 hrs | 0.5 hr | ~80% |
| System design (Zoho) | 4–8 hrs | 1–2 hrs | ~75% |

These estimates are directional. Actual savings depend on task complexity.

---

## Allocation Output Format

```json
{
  "allocation_id": "FO-ALC-{NNN}",
  "date": "YYYY-MM-DD",
  "inputs": {
    "hours_per_week": null,
    "monthly_capital_inr": null,
    "t1_monthly_revenue_inr": null,
    "t1_stage": "pre-revenue | early | growing | stable",
    "t2_stage": "IDEATE | VALIDATE | SCOPE | PLAN | BUILD | BETA | LAUNCH",
    "runway_months": null
  },
  "t1_allocation": {
    "hours_per_week": null,
    "hours_pct": null,
    "capital_per_month_inr": null,
    "capital_pct": null,
    "focus_areas": ["..."],
    "rationale": "..."
  },
  "t2_allocation": {
    "hours_per_week": null,
    "hours_pct": null,
    "capital_per_month_inr": null,
    "capital_pct": null,
    "focus_areas": ["..."],
    "rationale": "..."
  },
  "guardrails": [
    "T1 must not drop below X hrs/week for {reason}",
    "T2 capital capped at ₹X until {milestone}"
  ],
  "review_trigger": "Reassess when {condition}",
  "next_review_date": "YYYY-MM-DD"
}
```

---

## Weekly Time Block Template

For a 40-hour week at 70/30 split (example):

| Day | T1 (28 hrs) | T2 (12 hrs) |
|---|---|---|
| Monday | Product ops, inventory check (4h) | — |
| Tuesday | Vendor comms, sourcing (4h) | Product thinking (2h) |
| Wednesday | Amazon account, ads review (4h) | Build/research (4h) |
| Thursday | Content, listings (4h) | Build/research (4h) |
| Friday | Finance, reconciliation (4h) | Review + plan next week (2h) |
| Saturday | Customer issues, Zoho Desk review (4h) | — |
| Sunday | Strategic thinking, planning (4h) | — |

This is a template. Operator should adapt to their actual rhythm.

---

## Capital Allocation Categories

### Track 1
| Category | Typical % | What it covers |
|---|---|---|
| Inventory | 40–50% | Product purchase, FBA replenishment |
| Advertising | 20–30% | Amazon PPC, social ads |
| Operations | 10–15% | Shipping, packaging, returns |
| Tools | 5–10% | Zoho, Shiprocket, other SaaS |
| Contingency | 5–10% | Unexpected costs |

### Track 2
| Category | Typical % | What it covers |
|---|---|---|
| Tools & infra | 30–40% | Hosting, API costs, domains |
| Research | 20–30% | User interviews, market validation |
| Marketing | 20–30% | Landing page, content, community |
| Contingency | 10–20% | Unexpected costs |

T2 capital should be minimal until BUILD stage. IDEATE and VALIDATE cost nearly
nothing when done with AI.

---

## Burnout Detection

Signs that allocation needs immediate rebalancing:
- Operator consistently works 50+ hours but feels behind on both tracks
- One track hasn't received attention for 2+ weeks
- Quality of T1 operations visibly declining (late shipments, unresolved tickets)
- T2 build stalls for 3+ weeks without progress
- Operator explicitly says they're overwhelmed

**Response:** ALLOCATE mode should proactively flag these signals and recommend
either: narrowing T2 scope, pausing T2 temporarily, or automating more T1 tasks.
