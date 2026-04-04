# supplier-intelligence — Offloaded Schemas & Execution Steps
# Extracted from SKILL.md on 2026-03-15 to reduce SKILL.md to <500 lines.
# This file is the authoritative source for these sections.

---

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "enum": ["DISCOVER", "ENRICH", "VERIFY", "CLASSIFY", "RANK", "FULL"],
      "description": "FULL runs all 5 modes in sequence from a SupplierSearchRequest"
    },
    "search_request": {
      "type": "object",
      "description": "Required for DISCOVER and FULL modes",
      "properties": {
        "product_name": { "type": "string" },
        "category": { "type": "string" },
        "material": { "type": ["string", "null"] },
        "supplier_type_pref": { "type": "string", "enum": ["Manufacturer","OEM-ODM","Trader","Distributor","any"] },
        "moq_max": { "type": ["integer", "null"] },
        "target_price_max_inr": { "type": ["number", "null"] },
        "location_pref": { "type": ["string", "null"] },
        "export_required": { "type": ["boolean", "null"] }
      },
      "required": ["product_name", "category"]
    },
    "raw_records": {
      "type": "array",
      "description": "Required for ENRICH mode if skipping DISCOVER"
    },
    "enriched_suppliers": {
      "type": "array",
      "description": "Required for VERIFY mode if skipping earlier modes"
    },
    "verified_suppliers": {
      "type": "array",
      "description": "Required for CLASSIFY or RANK modes if skipping earlier modes"
    },
    "max_results": {
      "type": "integer",
      "default": 20,
      "description": "Maximum suppliers to return in ranked output"
    }
  },
  "required": ["mode"]
}
```

---


## Output Schema — SupplierRecord

```json
{
  "supplier_id": "SI-{YYYYMMDD}-{NNN}",
  "company_name": "string",
  "trade_name": "string | null",
  "website": "string | null",
  "city": "string | null",
  "state": "string | null",
  "pin_code": "string | null",
  "full_address": "string | null",
  "gstin": "string | null",
  "gst_status": "Active | Cancelled | Suspended | Not Found | null",
  "mca_cin": "string | null",
  "mca_status": "Active | Struck Off | Dormant | null",
  "udyam_number": "string | null",
  "msme_category": "Micro | Small | Medium | null",
  "manufacturing_nic_code": "string | null",
  "year_established": "integer | null",
  "supplier_type": "Manufacturer | OEM-ODM | Trader | Distributor | Ambiguous | null",
  "classification_confidence": "High | Medium | Low | null",
  "products_offered": ["string"],
  "primary_material": "string | null",
  "moq": "integer | null",
  "price_range_inr": { "min": "number | null", "max": "number | null" },
  "contact_phone": "string | null",
  "contact_email": "string | null",
  "contact_name": "string | null",
  "whatsapp_available": "boolean | null",
  "google_rating": "number | null",
  "google_review_count": "integer | null",
  "linkedin_employee_count": "integer | null",
  "linkedin_url": "string | null",
  "export_capability": "boolean | null",
  "export_countries": ["string"],
  "factory_photos_confirmed": "boolean | null",
  "machinery_mentioned": "boolean | null",
  "certifications": ["string"],
  "client_list_present": "boolean | null",
  "credibility_score": "integer | null",
  "credibility_band": "Verified | Partial | Unverified | Red Flag | null",
  "rank_score": "number | null",
  "rank_position": "integer | null",
  "sources_found_on": ["string"],
  "source_urls": ["string"],
  "merged_from": ["string"],
  "data_completeness_pct": "integer",
  "null_fields": ["string"],
  "crawl_timestamp": "string",
  "confidence": "HIGH | MEDIUM | LOW"
}
```

---


