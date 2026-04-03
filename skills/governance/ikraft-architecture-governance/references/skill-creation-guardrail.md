# Skill Creation Guardrail
# ikraft-skill-governance v5.0 | Last updated: 2026-03-15
# Trimmed 2026-04-03. Examples removed; protocol and decision tree retained.

Mandatory pre-creation protocol. Enforces LAW-7 (Ecosystem Minimalism).
Skipping = V-050 (HIGH). Redundant creation = V-053 (HIGH).

---

## 5-Step Protocol

### STEP 1 -- Domain Audit
- List all existing skills in proposed domain from `available_skills` + registry
- Assess responsibility overlap: none | partial (<50%) | significant (50-79%) | high (>=80%)

### STEP 2 -- Extension Check (if overlap >= 50%)

| Test | Question |
|---|---|
| New mode | Can capability be a new mode of existing skill? |
| New reference | Can knowledge be a new `references/` file? |
| Description extension | Would adding require changing <20% of existing SKILL.md? |

Any test passes -> BLOCK_CREATE -> recommend EXTEND with specific skill + mode/file name.

### STEP 3 -- Merge Check
Signals: two existing skills each cover ~50% of proposed capability, or proposed skill bridges two skills that should chain.
Merge signal -> BLOCK_CREATE -> recommend MERGE or add workflow contract.

### STEP 4 -- Uniqueness Confirmation
All must pass:
- [ ] Distinct responsibility, not expressible as mode of existing skill
- [ ] First/only skill with this precise focus in domain
- [ ] Not expressible as reference file addition
- [ ] At least 2 identifiable use cases
- [ ] Clear downstream consumer
- [ ] Clear upstream input source

Any fail -> ask for clarification before proceeding.

### STEP 5 -- Verdict

Output `SkillCreationVerdict`:
```json
{
  "proposed_skill": "string",
  "proposed_domain": "string",
  "verdict": "BLOCK_CREATE | ALLOW_CREATE",
  "reason": "string",
  "overlap_detected": ["skill_name"],
  "recommended_action": "EXTEND X as mode Y | MERGE A + B | ALLOW",
  "domain_assignment": "string (if ALLOW)",
  "prefix_suggestion": "string (if ALLOW)",
  "next_step": "ism-skill-factory (if ALLOW) | arch-gov confirm merge/extend"
}
```

BLOCK_CREATE -> state target skill + mode/file name, route to ism-skill-factory.
ALLOW_CREATE -> confirm domain + prefix, route to ism-skill-factory.

---

## Decision Tree

```
Proposed skill
  |-> STEP 1: Overlap >= 50%?
       No  ---------------------------------> STEP 4
       Yes -> STEP 2: Extendable?
                Yes -> BLOCK_CREATE (EXTEND)
                No  -> STEP 3: Merge signal?
                         Yes -> BLOCK_CREATE (MERGE)
                         No  -> STEP 4: Unique?
                                  No  -> Clarify
                                  Yes -> ALLOW_CREATE
```

---

## Ecosystem Minimalism Targets

| Metric | Target | Current (2026-03-15) |
|---|---|---|
| Total active skills | <= 30 | 18 |
| Skills per domain | <= 5 | Max 7 (governance) |
| Merge candidates (>=80%) | 0 | 0 |
| Orphan skills | 0 | TBC |
| Deprecated in contracts | 0 | TBC |

At 25+ active skills, mandatory LAW-7 scan before any new approval.
At 5 skills in a domain, require rigorous STEP 1-3 before ALLOW_CREATE.
