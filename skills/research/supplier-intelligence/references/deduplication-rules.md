# Deduplication Rules
# supplier-intelligence ENRICH mode

---

## Purpose

Suppliers discovered across multiple platforms must be identified as the same entity and merged.

Example:
- "Shree Wood Crafts" (IndiaMart)
- "Shree Woodcraft Pvt Ltd" (TradeIndia)
- "Shree Wood Crafts Private Limited" (MCA registry)
→ These are the same company. Merge into one record.

---

## Primary Key: GSTIN

If two records share the same GSTIN (15-char code) → definitive match. Always merge.
GSTIN is the single most reliable deduplication key in India.

---

## Secondary Key: Phone Number

If two records share an exact mobile or landline number → strong match. Merge.
(Phone spoofing is rare in B2B sourcing context.)

---

## Tertiary: Fuzzy Name Matching

### Step 1 — Normalize company name
Apply these strippings before comparison:
```
Remove (case-insensitive): " Pvt Ltd", " Private Limited", " Pvt. Ltd.", " Ltd", " LLP", 
                            " & Co", " Traders", " Trading", " Enterprises", " Industries",
                            " Manufacturing", " Works", " Exports", " International"
Normalize whitespace: multiple spaces → single space
Lowercase everything
```

### Step 2 — Fuzzy comparison
Compute Levenshtein distance on normalized names.

| Distance | Same city? | Action |
|---|---|---|
| 0 (exact) | — | Definitive match. Merge. |
| 1–2 chars | Yes | Strong match. Merge. |
| 1–2 chars | No | Probable match. Flag for operator review. |
| 3–4 chars | Yes | Possible match. Flag for operator review. |
| > 4 chars | — | Do not merge. Keep as separate records. |

### Step 3 — Address cross-check (for flagged probable matches)
If pin_code matches exactly → treat as confirmed match.
If full_address shares street name → treat as confirmed match.

---

## Merge Rules

When merging two records (A = higher data_completeness_pct, B = lower):

1. **Keep A as base record** — all A's non-null fields are authoritative.
2. **Fill from B** — for any field null in A but non-null in B → fill from B, mark `source_filled_from_merge: true`.
3. **Union lists:**
   - `sources_found_on[]` — union of both arrays
   - `source_urls[]` — union of both arrays
   - `certifications[]` — union, deduplicate
   - `products_offered[]` — union, deduplicate
4. **Log merge:** Add B's `supplier_id` to `merged_from[]` in the surviving record.
5. **Conflicts:** If A and B have different non-null values for the same field (e.g., different phone numbers) → keep A's value, add B's value to a `conflicts[]` field for operator review.

---

## Merge Integrity

Every merge must be logged:
```
merge_log: [
  {
    "merged_record_id": "SI-20260315-0024",
    "surviving_record_id": "SI-20260315-0003",
    "match_reason": "GSTIN match: 08XXXXXXXXXXXXX",
    "fields_filled_from_merge": ["contact_email", "linkedin_url"],
    "conflicts": []
  }
]
```

---

## Do Not Merge

- Different GSTIN (different legal entities — even if same owner)
- Different cities + distance > 3 on fuzzy name (likely different companies with similar names)
- One record = Manufacturer, other = Trader with same name (flag for operator review — possible reseller relationship)
