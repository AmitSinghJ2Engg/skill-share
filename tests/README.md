# Skill Evaluations

Per-skill evaluation test suites using the skill-creator eval framework.

## Structure

```
tests/
  {skill-name}/
    evals.json        # Test cases (per skill-creator schema)
    iteration-N/      # Eval run outputs
    benchmark.json    # Aggregated results
    feedback.json     # Human review feedback
```

## How to Run

Evaluations use the skill-creator toolchain in `skills/core/skill-creator/`:

```bash
# Quick validation (frontmatter, structure)
python skills/core/skill-creator/scripts/quick_validate.py skills/{package}/{skill-name}/SKILL.md

# Run eval suite
python skills/core/skill-creator/scripts/run_eval.py tests/{skill-name}/evals.json

# Aggregate benchmark
python skills/core/skill-creator/scripts/aggregate_benchmark.py tests/{skill-name}/

# Generate review report
python skills/core/skill-creator/scripts/generate_report.py tests/{skill-name}/
```

## Creating Test Cases

Use `python tools/create-skill.py` to scaffold a new skill with a starter `evals.json`. Then populate the test cases with realistic inputs and expected outputs for each skill mode.

Each test case in `evals.json` should have:
- `name`: descriptive test name
- `mode`: which skill mode to test
- `input`: test input data
- `expected_output`: expected output shape/content
- `rubric`: evaluation criteria
