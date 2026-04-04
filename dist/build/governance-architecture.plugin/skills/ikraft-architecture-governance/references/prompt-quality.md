# Prompt Quality Reference

Consolidated scoring rubric and prompt registry for the prompt-quality-tracker skill.

---

## Scoring Dimensions

### D1: Conciseness (20% weight)

Token efficiency. Every sentence must earn its place.

| Score | Criteria |
|---|---|
| 9-10 | Minimal. Zero redundancy. Instructions imply rather than repeat. |
| 7-8 | Mostly concise. 1-2 sentences could be cut. |
| 5-6 | Moderate verbosity. Repetition present but not confusing. |
| 3-4 | Significant repetition or over-explanation. Inflates token count. |
| 1-2 | Padded with filler. Core instruction buried. |

Common failures: restating rules differently, unnecessary pleasantries, over-specifying Claude defaults, unneeded chain-of-thought instructions.

### D2: Precision (25% weight)

Whether output format is specified exactly.

| Score | Criteria |
|---|---|
| 9-10 | JSON schema inline. Every field named, typed, required/optional noted. |
| 7-8 | Output format clear. Minor ambiguity in edge cases. |
| 5-6 | Output shape implied but not specified. Some fields ambiguous. |
| 3-4 | Only vague output instruction ("return a structured response"). |
| 1-2 | No output format specified. |

Checklist: output format stated, required fields listed, enum values listed, numeric precision noted, date/time format specified.

### D3: Scope Clarity (20% weight)

Whether the prompt defines boundaries -- what's in AND out of scope.

| Score | Criteria |
|---|---|
| 9-10 | Both positive and negative scope explicit. |
| 7-8 | Positive scope clear. Negative scope implied. |
| 5-6 | Scope broadly stated. Edge cases not addressed. |
| 3-4 | Scope vague -- Claude likely to over- or under-produce. |
| 1-2 | No scope definition. Relies entirely on Claude defaults. |

Good: "Score ONLY vendor communication quality. Do NOT score pricing or product quality."
Bad: "Score the vendor." (over-broad)

### D4: Accuracy (25% weight)

Whether the prompt produces correct outputs on real test inputs.

| Score | Criteria |
|---|---|
| 9-10 | All test inputs produce correct outputs. Edge cases handled. |
| 7-8 | 80%+ correct. Minor edge case failures. |
| 5-6 | 60-79% correct. Systematic failure on a pattern. |
| 3-4 | < 60% correct. Frequent misunderstanding. |
| 1-2 | Consistently incorrect outputs. |

No test inputs provided -> score 5, mark `verified: false`. V-034 requires >= 3 test inputs for production.

### D5: Stability (10% weight)

Consistency of output structure across varied inputs.

| Score | Criteria |
|---|---|
| 9-10 | Structure identical across all tested inputs. |
| 7-8 | Mostly consistent. Minor field name variation in edge cases. |
| 5-6 | Moderate variation. Downstream consumers need defensive parsing. |
| 3-4 | Frequently varies. Unreliable for artifact consumption. |
| 1-2 | Unpredictable. Cannot use in automated workflows. |

Failures: field names that change, nested vs flat depending on input, array vs single item.

---

## Anti-Patterns (Automatic Deductions)

| Anti-Pattern | Deduction | Why |
|---|---|---|
| "be helpful" / "be a good assistant" | -1 | Unnecessary default |
| Output format repeated > once | -1 per extra | Token inflation |
| No output format spec | -3 | Hard Fail |
| "think step by step" without using it | -1 | Token waste |
| 2+ tasks in one prompt | -2 | Violates single responsibility |
| > 500 tokens, no compression opportunity | -1 | Review for conciseness |

---

## Hallucination Risk Reference

| Prompt Type | Risk | Mitigation |
|---|---|---|
| Scoring numeric inputs | Low | Grounding inherent |
| Classifying structured records | Low | Mapping, not generation |
| Generating listing copy | Medium | Grounding instruction required |
| Market analysis | Medium-High | "only use provided data" required |
| Factual Q&A | High | Must provide source data |
| Free-form advice | High | Scope narrowly; require citation |

Required grounding for High risk:
```
Respond based ONLY on the data and context provided in this message.
If you lack sufficient information, state what is missing rather than inferring.
```

---

## Prompt Registry

| skill_name | prompt_type | version | score | grade | last_scored | hallucination_risk | verified |
|---|---|---|---|---|---|---|---|

*(Populated as prompts are scored and registered via MODE 1.)*

### Changelog

| Date | Entry | Action |
|---|---|---|
| 2026-03-12 | -- | Registry initialized |
