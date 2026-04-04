# Ranking Model — Supplier Ranking
# supplier-intelligence RANK mode

---

## Overview

Final rank = weighted composite score across 5 dimensions. Range: 0–10.
Rank suppliers descending by rank_score. Ties broken by credibility_score, then data_completeness_pct.

---

## Dimension 1 — Product Relevance (weight: 30%)

How closely does this supplier's products match the search request?

| Score | Criteria |
|---|---|
| 10 | Primary product exactly matches product_name and material |
| 8 | Primary product matches category and material but different variant |
| 6 | Category match but different material |
| 4 | Adjacent category — related but not exact |
| 2 | Loose match — supplier could potentially make it |
| 0 | No clear match |

**Source:** Product list in supplier record. Cite which products triggered the score.

---

## Dimension 2 — Verification Score (weight: 25%)

credibility_score (0–100) / 10 = D2 score (0–10).

---

## Dimension 3 — Manufacturing Capability (weight: 25%)

Base score by supplier_type:
- Manufacturer: 8
- OEM-ODM: 6
- Trader: 2
- Distributor: 1
- Ambiguous: average of the two types

Bonus (add to base, max total 10):
- +1 if Udyam registered (confirmed manufacturing NIC)
- +1 if factory photos confirmed

Cap at 10.

---

## Dimension 4 — Export Capability (weight: 10%)

| Score | Criteria |
|---|---|
| 10 | Confirmed export shipment record or IEC found |
| 5 | Export mentioned on website or profile (not verified) |
| 0 | No export data found |

---

## Dimension 5 — Online Presence Quality (weight: 10%)

Start at 10. Deduct 3 per missing element:
- Own website present: −0 (present) / −3 (absent)
- Google Maps listing: −0 (present) / −3 (absent)
- LinkedIn company page: −0 (present) / −3 (absent)

Minimum: 0.

---

## Final Score Formula

```
rank_score = (D1 × 0.30) + (D2 × 0.25) + (D3 × 0.25) + (D4 × 0.10) + (D5 × 0.10)
```

Round to 2 decimal places.

---

## Score Integrity

Every dimension score must cite its basis:
```
dimension_scores: {
  "product_relevance": {"score": 10, "basis": "Products listed: 'wooden corner mandir' exact match"},
  "verification": {"score": 7.5, "basis": "credibility_score: 75"},
  "manufacturing": {"score": 9, "basis": "Manufacturer + Udyam registered + factory photos confirmed"},
  "export": {"score": 5, "basis": "Website mentions 'exporting to USA' — not portal-verified"},
  "online_presence": {"score": 7, "basis": "Website: present, Maps: present, LinkedIn: absent (-3)"}
}
```

Never assign a score without recording the basis.

---

## Disqualification Rules

Regardless of rank_score, suppliers with credibility_band = Red Flag must:
- Appear at the bottom of the ranked list, separated in a "Flagged" section
- Not appear in the top 10 profiles
- Have a clear note: "Red Flag — do not engage without in-person verification"
