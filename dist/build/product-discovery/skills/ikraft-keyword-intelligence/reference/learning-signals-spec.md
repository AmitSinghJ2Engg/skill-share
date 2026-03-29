# Learning Signals Specification — ikraft-keyword-intelligence
# How the skill reads and applies keyword performance data from past task runs.

---

## Overview

The daily product research task writes a `keyword-learning-signals.json` file after each run.
This skill reads that file (when provided) to make better keyword choices over time.

The skill is READ-ONLY on this file. The task owns writing.

---

## File Structure (Written by Task)

The task appends one entry per run to the learning signals file:

```json
{
  "run_date": "YYYY-MM-DD",
  "zone": 1,
  "signals": {
    "top_performing_keywords": [
      {
        "keyword": "wooden desk organizer for office",
        "layer": 2,
        "layer_name": "dynamic_expansion",
        "candidates_surfaced": 5,
        "avg_adjusted_score": 58.2,
        "strong_or_promising_count": 2
      }
    ],
    "zero_yield_keywords": ["bamboo laptop stand", "wooden cable organizer"],
    "high_score_patterns": {
      "common_title_words": ["organizer", "handcrafted", "premium"],
      "price_cluster": "1200-1800",
      "competition_profile": "moderate — avg 150-300 reviews on page 1"
    },
    "reprocessed_candidates": [
      {
        "candidate_id": "PI-20260324-0003",
        "original_verdict": "NEEDS_DATA",
        "new_verdict": "PROMISING",
        "data_quality_change": "D→B",
        "improvement_source": "BSR + reviews found on reprocessing"
      }
    ]
  }
}
```

The file accumulates entries over time (one per daily run). The skill reads ALL entries, not just the latest.

---

## How the Skill Reads Learning Signals

### Step 1: Load and Parse
- Read the file from `learning_signals_path` provided in input
- Parse as JSON array (each element is one run's signals)
- If file doesn't exist or is malformed → set `learning_signals_applied: false` in output, proceed without learning

### Step 2: Identify Top Performers
- Scan `top_performing_keywords` across all entries for today's zone
- Rank by `strong_or_promising_count` descending, then `avg_adjusted_score`
- Keywords appearing as top performers in 2+ runs are "proven winners"

**Action:** Include proven winners as Layer 1 anchors alongside zone defaults. If a proven winner is not in the opportunity map's default seeds, add it with `source: learning_signals` and `confidence: HIGH`.

### Step 3: Identify Zero-Yield Keywords
- Scan `zero_yield_keywords` across all entries for today's zone
- Count consecutive runs where a keyword appears in zero_yield

**Suppression rules:**
| Consecutive zero-yield runs | Action |
|---|---|
| 1 | Keep — could be a one-off (CAPTCHA, timing) |
| 2 | Keep but lower its priority (move to end of expansion queue) |
| 3+ | Suppress — exclude from this run. Add to `suppressed_keywords` in output metadata |

**Reinstatement:** A suppressed keyword is reinstated if:
- Zone priority changes (e.g., season boost promotes the zone)
- 10+ runs have passed since last attempt
- The operator manually overrides via next_zone_override or learning signal edit

### Step 4: Extract High Score Patterns
- Read `high_score_patterns.common_title_words` from recent runs
- Use these as inputs for Layer 3 intent keyword generation
- Example: if "handcrafted" appears repeatedly in top candidates, generate "handcrafted wooden [product type]" as a Layer 3 keyword

### Step 5: Note Reprocessing Patterns
- If a keyword's candidates frequently improve on reprocessing (verdict upgrades), that keyword surfaces products with potential but initial data gaps
- This is a signal to keep using the keyword AND to allocate more browser time to its candidates in Pass 2

---

## Novelty Calculation

The skill calculates novelty for each keyword based on learning signals history:

```
recent_uses = count of runs in last 3 entries where this keyword appears in keywords_used
historical_uses = count of ALL entries where this keyword appears

if recent_uses == 0 and historical_uses == 0 → novelty = HIGH (never used)
if recent_uses == 0 and historical_uses > 0 → novelty = HIGH (used long ago)
if recent_uses >= 1 and recent_uses <= 2 → novelty = MEDIUM
if recent_uses >= 3 → novelty = LOW (used every recent run)
```

**Target:** At least 30% of the output keywords should have `novelty: HIGH`.
If the initial keyword set has < 30% HIGH novelty, the skill should:
1. Add more Layer 3 intent variants (these tend to be novel)
2. Use less common modifiers from the intent pattern list
3. If still below 30%, note it in metadata but do not force — quality over arbitrary ratios

---

## What the Skill Does NOT Do with Learning Signals

- Does NOT write to the learning signals file (the task does that)
- Does NOT modify the file in any way
- Does NOT use learning signals from OTHER zones — only today's zone
- Does NOT treat learning signals as ground truth — they are hints, not commands
- Does NOT skip a zone's default seeds just because learning signals suggest different keywords

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Learning signals file doesn't exist | Proceed without learning. Note in metadata. |
| File exists but is empty | Same as doesn't exist. |
| File has entries but none for today's zone | Proceed without learning for this zone. |
| All 5 default seeds are suppressed | Raise exception — something is wrong with this zone. Alert operator. |
| File is very large (100+ entries) | Read only the last 30 entries to keep processing fast. |
| Conflicting signals (keyword is both top performer AND zero-yield in different runs) | Most recent signal wins. If latest run = zero-yield, treat as zero-yield. |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-03-26 | Initial specification |