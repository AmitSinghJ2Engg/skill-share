# Skill Maturity Lifecycle Model
# ikraft-skill-auditor -- references/skill-maturity-model.md
# Version: 2.0.0
# Purpose: Maturity levels, entry criteria, transition rules, and governance actions.

---

## L0-L3 Maturity Model

| L-Level | Registry Label | Write to External Systems? |
|---|---|---|
| L0 | L0_experimental | NO -- blocked |
| L1 | L1_assisted | NO -- blocked |
| L2 | L2_operational | YES -- permitted |
| L3 | L3_autonomous | YES -- permitted + governance approval required |
| -- | deprecated | N/A -- lifecycle exit state |

**Critical rule**: Only L2/L3 may write to external systems. L0/L1 writing externally = V-039 (CRITICAL).

---

## Level Definitions and Entry Criteria

### L0 -- Experimental
New skill under development. No external writes (V-039). May not appear in production contracts (V-016). Quality score not evaluated.

### L1 -- Assisted
Passed governance evaluation. Requires human confirmation. No external writes (V-039).
**Entry**: Quality >= 7, input/output schemas present, no CRITICAL/HIGH, domain confirmed, governance contract declared.

### L2 -- Operational
Fully approved for production. May write to declared systems only (undeclared = V-038 CRITICAL).
**Entry**: All L1 + quality >= 7, Defined schemas, auto-learn present, fallback declared, no CRITICAL/HIGH, complete governance contract, write_permissions declared, validation_rules non-empty, logging_level declared, exec log spec if writing.

### L3 -- Autonomous
Highest trust. Executes multi-system actions without per-step confirmation.
**Entry**: All L2 + quality >= 9, zero violations, 10+ documented L2 executions, explicit governance approval (approved_by, date, scope, review <= 90 days), fallback required, logging_level = full.
**Re-approval**: Every 90 days. Expired = V-040 (CRITICAL) -> downgrade to L2.

### Deprecated
Lifecycle exit state. Replacement identified, all contracts updated. Must not be promoted back without re-entry at L0.

---

## Transition Table

| From | To | Allowed | Requirements |
|---|---|---|---|
| L0 | L1 | YES | Quality >= 7, schemas, no CRITICAL/HIGH, contract |
| L1 | L2 | YES | L1 + Defined schemas + auto-learn + fallback + exec log |
| L2 | L3 | YES | Zero violations + 10 executions + approval + full logging |
| L2 | deprecated | YES | Replacement identified, contracts updated |
| L1 | deprecated | YES | Governance decision |
| L0 | deprecated | YES | Governance decision |
| deprecated | L0 | YES | Re-entry from scratch |
| L3 | L2 | YES | Voluntary demotion or expired approval |
| deprecated | L1/L2/L3 | NO | Must re-enter as L0 |
| L2 | L1 | NO | Use deprecated path |
| L2/L3 | L0 | NO | Use deprecated path |

---

## Maturity Distribution Targets

| Level | Target % | Action if exceeded |
|---|---|---|
| L0 | < 20% | Accelerate promotion or deprecate |
| L1 | 20-40% | Normal pipeline |
| L2 | 40-60% | Core operating layer |
| L3 | < 10% | Review scope |
| deprecated | < 20% | Remove archived skills |
