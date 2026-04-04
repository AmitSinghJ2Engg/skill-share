# Classification Model — Supplier Type Assignment
# supplier-intelligence CLASSIFY mode

---

## Supplier Types

| Type | Description |
|---|---|
| Manufacturer | Owns manufacturing equipment. Produces to specification. Custom production possible. |
| OEM-ODM | Manufactures standard products. Can apply customer brand or minor spec changes. |
| Trader | Aggregator. Buys from factory, resells. No manufacturing. |
| Distributor | Holds ready stock for a brand or region. Ships on order. |

---

## Signal Matrix

Score each supplier per signal. Assign the type with the highest total.

| Signal | Manufacturer | OEM-ODM | Trader | Distributor |
|---|---|---|---|---|
| Factory photos confirmed | +3 | +2 | 0 | 0 |
| Machinery references on website | +3 | +2 | 0 | 0 |
| Udyam NIC code = manufacturing (NIC 10–33) | +3 | +3 | 0 | 0 |
| MCA industry = production / manufacturing | +2 | +2 | 0 | 0 |
| Export shipment record found | +2 | +2 | +1 | +1 |
| LinkedIn employees ≥ 20 | +2 | +2 | +1 | +1 |
| Product range narrow (1–3 categories) | +2 | +1 | 0 | 0 |
| "Custom production / to spec" language | +2 | +3 | 0 | 0 |
| Product range very wide (10+ unrelated) | 0 | 0 | +3 | +2 |
| "We supply all categories" language | 0 | 0 | +3 | +2 |
| Generic stock images, no factory photos | 0 | 0 | +2 | +2 |
| MOQ ≥ 100 units consistent | +2 | +2 | +1 | 0 |
| MOQ 1–10 units | 0 | 0 | +2 | +3 |
| Catalog = 1 core product type | +2 | +1 | 0 | 0 |
| "Ready stock available" prominent language | 0 | 0 | +1 | +3 |
| "We manufacture" explicit statement | +3 | +2 | 0 | 0 |

---

## Decision Logic

1. Sum scores per type for each signal present.
2. Assign type with highest total.
3. If top two types within 2 points → classify as `Ambiguous: {Type1}/{Type2}`.

**Confidence levels:**
- High: winning type leads by ≥ 5 points
- Medium: winning type leads by 3–4 points
- Low: winning type leads by ≤ 2 points (or Ambiguous)

---

## Minimum Signal Requirement

If fewer than 3 signals have data → classify as `null` with note: "insufficient signals for classification".
Do not classify from 1–2 signals alone.

---

## Classification Integrity

All classification signals must be cited:
```
classification_signals: {
  "factory_photos_confirmed": {"present": true, "source": "website: rajwoodcrafts.com/factory"},
  "machinery_mentioned": {"present": true, "source": "website text: 'CNC routing machines'"},
  "product_range_narrow": {"present": true, "source": "indiamart profile: 3 product categories"}
}
```
Never assign classification without recording which signals contributed.
