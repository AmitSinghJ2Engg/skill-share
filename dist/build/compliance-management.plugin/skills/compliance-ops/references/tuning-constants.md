# compliance-ops — Tuning Constants

Skill-local values used by TIMELINE_CHECK mode (and planned modes when they're built). Named, not hardcoded, so values can be tuned without editing skill prose. Same convention as ads-ops-plan, product-monitor, margin-calculator per DL-021 / DL-022 / DL-023.

**Why not in `context/product-pipeline/`?** These values are consumed only by compliance-ops. Other skills don't read compliance buffers. If a value later needs to be shared, promote it to `context/`.

---

## §1. TIMELINE_CHECK Verdict Thresholds

Used by `schemas-and-steps.md` TIMELINE_CHECK mode verdict rules.

| Name | Value | Meaning |
|---|---|---|
| `timeline_buffer_days` | 14 | Minimum days between `expected_completion_date` and `launch_timeline_date` for a cert to be classified "on track". Below this (and before launch), cert is "at risk" → verdict at least WARNING. After launch → "blocking" for mandatory certs → verdict BLOCK. |
| `critical_buffer_days` | 7 | Hard floor: any cert landing within this many days of launch is always flagged `critical_at_risk` regardless of mandatory status (too little operational slack to handle a slip). |
| `warning_buffer_days` | 21 | Optional wider window for surfacing advisory warnings on otherwise-fine certs. Not used for verdict decisions (still PASS), but surfaced in the cert_details output. |

**Verdict rule summary:**
- `buffer_days <= -timeline_buffer_days` (at least 14 days before launch) → **on track**
- `-timeline_buffer_days < buffer_days <= 0` → **at risk** (WARNING trigger)
- `buffer_days > 0` AND `mandatory = true` → **blocking** (BLOCK trigger)
- `buffer_days > 0` AND `mandatory = false` → **at risk** (WARNING trigger, not BLOCK)

(buffer_days is computed as `expected_completion_date - launch_timeline_date` in days, so negative values mean "before launch", positive means "after launch")

---

## §2. Risk Level Thresholds (FEASIBILITY planned stub)

Used by FEASIBILITY mode (currently a stub per DL-024 CO3) when wired up. Risk level assignment rules are documented in `cert-catalog.md §3`; this section holds the numeric thresholds.

| Name | Value | Meaning |
|---|---|---|
| `risk.high_timeline_weeks_min` | 16 | Single cert with estimated timeline ≥ N weeks triggers HIGH risk |
| `risk.high_mandatory_cert_count_min` | 2 | Having N or more mandatory certs triggers HIGH risk |
| `risk.medium_timeline_weeks_max` | 16 | Single mandatory cert with timeline ≤ N weeks is MEDIUM (not HIGH) |

---

## §3. Cert Expiry Alerting (COMPLETION planned stub)

Used by COMPLETION mode (planned stub) when checking Gate 3 readiness and flagging certs approaching expiry.

| Name | Value | Meaning |
|---|---|---|
| `expiry.alert_days_before` | 90 | Certs expiring within N days of launch are flagged in `certs_expiring_soon[]` |
| `expiry.block_days_before` | 0 | Certs expiring before launch date always BLOCK Gate 3 |

---

## §4. Defaults (iteration-1)

**All values above are v1.0 starting points.** Revisit when:
- Ismokraft has 5+ completed certification cycles to calibrate actual timeline variance
- Historical data shows which buffer values produced accurate "on track" vs "at risk" classifications
- A product fails launch due to a cert slip — the tuning-constants values are the first thing to adjust
