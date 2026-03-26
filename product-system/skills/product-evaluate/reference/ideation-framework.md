# Ideation Framework — IDEATE Mode

Rules and structure for generating product concepts. Every concept must satisfy the hard rules below.

## Input Paths

Zone only → generate 5 concepts across the zone's sub-categories.
Zone + product type → generate 3 concept variants (premium, personalized, gifting angle).
Evaluated product → generate 3 improvement concepts addressing scoring gaps.

## Hard Rules (every concept must satisfy ALL)

1. **Price floor**: Target price must be at least 1,000 INR (Amazon zero-referral fee threshold).
2. **Weight ceiling**: Estimated weight must not exceed 2.0 kg.
3. **Wood dominance**: Minimum 70% wood by volume. This is Ismokraft's brand constraint.
4. **India manufacture**: Concept must be producible in Jodhpur, Moradabad, or Vrindavan cluster.
5. **Differentiation hooks cited**: Every hook must reference a real signal — review gap, trend score, price gap, or feature gap.
6. **No generics**: "Focus on quality" is not a valid hook. "Address 47% of 1-star reviews citing 'wobble'" is.
7. **Gaps declared**: Unknown manufacturing feasibility must be declared, not assumed.

Violating any rule invalidates the concept. Adjust or discard — never ship a non-compliant concept.

## Concept Output Structure

Each concept must include:

- **concept_id**: IDEA-{YYYYMMDD}-{NNN}
- **zone**: From opportunity map (in project knowledge)
- **working_title**: Descriptive, not a brand name
- **core_form**: What the physical object is
- **wood_spec**: Species, finish, technique — must be India-cluster manufacturable (see clusters below)
- **price_band**: INR range, must be at least 1,000
- **differentiation_hooks**: List of hooks, each citing a signal
- **personalization_fit**: HIGH / MEDIUM / LOW + rationale
- **amazon_fit**: YES / NO / CONDITIONAL — with fee tier note
- **manufacturing_difficulty**: LOW / MEDIUM / HIGH + specific wooden product rationale
- **confidence**: HIGH / MEDIUM / LOW — based on quality of input signals
- **signal_sources**: List of sources with dates
- **gaps_declared**: List of unknowns
- **next_step**: Most logical immediate action (usually product-intelligence SINGLE)

## Manufacturing Clusters

Refer to the opportunity map (in project knowledge) for full cluster details. Summary:

**Jodhpur**: Sheesham, mango wood furniture and decor. Capabilities: carving, inlay, CNC, basic finishing.

**Moradabad**: Metal work, brass accents. Capabilities: metal casting, brass finishing, wood-metal combos.

**Vrindavan**: Religious and cultural wooden items. Capabilities: temple miniatures, deity frames, traditional carving.

When specifying wood_spec, ensure the chosen species and technique are available at the assigned cluster. If uncertain, declare the gap.

## Viability Scoring

Rate each concept: HIGH (strong signals, clear path), MEDIUM (some signals, needs validation), LOW (weak signals, speculative).

Basis: zone trend strength, review gap evidence, price cluster fit, manufacturing complexity.
