# Skill Standards -- S1-S21
# ikraft-skill-auditor -- references/skill-standards.md
# Version: 3.0.0
# Purpose: 21-standard evaluation rubric for Ismokraft skills. STEP 2 of full audit.

---

## Overview

Score against 21 standards. Cumulative deduction from 10. Floor is 1.
CRITICAL violations (V-016, V-020, V-022, V-024, V-038, V-039, V-040, V-044) block execution regardless of score.

---

## S1-S10 -- Primary Standards

| Std | Rule | Violation | Ded. |
|---|---|---|---|
| S1 | Single responsibility -- one purpose, no "and" joining distinct domains | V-001 | -2/-1 |
| S2 | Input schema defined with types, required fields, constraints | V-002 | -2/-1 |
| S3 | Output schema defined for structured-output skills | V-003 | -2/-1 |
| S4 | Business rules in reference files, not inline in SKILL.md | V-006 | -1 each (max -3) |
| S5 | No duplicate responsibility (>=80% overlap with another skill) | V-004 | -2/-1 |
| S6 | Single domain assignment from approved 10 | V-005 | -2/-1 |
| S7 | Session protocol for stateful/multi-step workflows | V-007 | -1 |
| S8 | Exception capture via ism-learning-engine (no inline ISM-LEARN) | V-008 | -1/-2 |
| S9 | Pushy description with "ALWAYS trigger for" + 8 scenarios + "If unsure" | V-009 | -1/-2 |
| S10 | Related Skills section with upstream/downstream/adjacent | V-010 | -1/-0.5 |

## S11-S15 -- Extended Primary Standards

| Std | Rule | Violation | Ded. |
|---|---|---|---|
| S11 | Dependency metadata declared (upstream/downstream) | V-013 | -1 |
| S12 | Maturity level set in registry (L0-L3) | V-015/V-016 | -1/-2 |
| S13 | Quality score >= 7 for L2+ skills | V-016 | Blocking |
| S14 | No deprecated skills in active workflows (remove within 1 sprint) | V-020/V-004 | -2 each |
| S15 | Fallback skill declared or exemption documented for L2+ | V-021 | -1 |

## S16-S21 -- v3.0 Additions

| Std | Rule | Violation | Ded. |
|---|---|---|---|
| S16 | Governance contract with all required fields | V-037 | -2/-1 |
| S17 | Write permissions explicit; read-only declares [] | V-038 | -2 (CRITICAL) |
| S18 | Semantic version declared (x.y.z) | V-043 | -1/-2 |
| S19 | Pre-execution validation documented | V-041 | -1/-2 |
| S20 | Execution log specified for L2+ data-writing skills | V-042 | -2/-1 |
| S21 | Measurable KPIs declared (2+ with id, name, definition, target, signal_to) | V-046 | -1/-0.5 |

---

## Scoring

S1-S10: max -17 | S11-S15: max -5 | S16-S21: max -10 | Total possible: -32. Floor: 1.

| Score | Grade | Action |
|---|---|---|
| 9-10 | Compliant | None |
| 7-8 | Minor Issues | Address next sprint |
| 5-6 | Significant | Block L2 promotion; schedule refactor |
| 3-4 | Major | Block from production immediately |
| 1-2 | Non-Compliant | Immediate rebuild |

CRITICAL violations override grade -- skill blocked from execution regardless of score.

---

## Audit Application

1. Read this file for S1-S21 rubric
2. Score each skill against all 21 standards
3. Record violated_standards in skill_audit_row
4. Calculate: start at 10, apply deductions, floor at 1
5. Record CRITICAL violations separately -- they block execution
