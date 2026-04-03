# ISM Business Authority — Schemas, Vocabulary, and Templates

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "mode": { "type": "string", "enum": ["consult", "review", "guide"] },
    "context": { "type": "string", "description": "What is being evaluated/decided/reviewed" },
    "deliverable_type": {
      "type": "string",
      "enum": ["product_idea", "vendor", "artifact", "campaign", "channel_decision", "skill", "sop", "zoho_config", "strategy", "roadmap", "other"],
      "description": "Required when mode=review"
    },
    "requesting_skill": { "type": "string", "description": "Name of skill requesting consultation (Mode 1)" }
  },
  "required": ["mode", "context"]
}
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "mode": { "type": "string" },
    "alignment": { "type": "string", "enum": ["aligned", "partially_aligned", "misaligned"] },
    "go_fearless_score": { "type": "integer", "minimum": 0, "maximum": 9 },
    "go_fearless_gaps": { "type": "array", "items": { "type": "string" } },
    "strengths": { "type": "array", "items": { "type": "string" } },
    "concerns": { "type": "array", "items": { "type": "string" } },
    "recommendation": { "type": "string" },
    "business_context_used": { "type": "array", "items": { "type": "string" } },
    "context_update_needed": { "type": "boolean" },
    "context_update_note": { "type": "string" }
  },
  "required": ["mode", "recommendation"]
}
```

## Review Output Format

```
ALIGNMENT: Aligned / Partially aligned / Misaligned

WHAT'S GOOD:
- [specific strength]

CONCERNS:
- [specific concern + why it matters]

GO FEARLESS: [N]/9 qualities met — gaps: [list]

RECOMMENDATION:
- [what to do about it]
```

## Business Alignment Checklist (7 checks)

1. Does this support a current strategic priority?
2. Are margin/profitability assumptions realistic?
3. Is this targeting a channel we are actually active on?
4. Does this match our current sourcing capability?
5. Is the timeline realistic given our current stage?
6. Would this distract from the #1 priority?
7. Does the brand positioning feel right?

## CONSULT Mode — What This Skill Provides

| Skill is doing | This skill provides |
|---|---|
| Launch suite evaluating go/no-go | Product eval criteria, margin thresholds |
| Artifacts builder creating calculator | Formula chains from financial-formulas.ctx.md |
| Vendor scorer building evaluation | Tier weights, grade thresholds — consult `vendor-ops` skill |
| Content writer drafting listing | Brand positioning, target customer, value propositions |
| Zoho architect designing pipeline | Business rules: approval gates, margin thresholds |

## Natural Language Vocabulary

| Operator says | Means | Mode |
|---|---|---|
| "does this make sense" | Business alignment check | REVIEW |
| "what should we focus on" | Priority guidance | GUIDE |
| "is this profitable" | Margin/unit economics check | CONSULT |
| "which product should we launch" | Category + sourcing decision | GUIDE + CONSULT |
| "review this from the business side" | Alignment review | REVIEW |
| "what's our strategy" | Current priorities + roadmap | GUIDE |
| "should we try Flipkart" | Channel expansion decision | CONSULT + GUIDE |
| "score this product" | Product evaluation | CONSULT — consult `product-evaluate` skill |
| "how do we evaluate vendors" | Vendor scoring model | CONSULT — consult `vendor-ops` skill |
| "what margin do we need" | Financial thresholds | CONSULT (financial-formulas.ctx.md) |

## Dependency Metadata

```yaml
skill_name: ism-business-authority
upstream_skills: []
downstream_skills:
  - product-lab: evaluation model + GO FEARLESS
  - vendor-ops: vendor evaluation model
  - margin-calculator: financial formula references
  - ism-learning-engine: governance decisions
fallback_skill: null
```
