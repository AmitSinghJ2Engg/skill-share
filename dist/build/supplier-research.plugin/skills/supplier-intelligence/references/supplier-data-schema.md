# Supplier Data Schema — Canonical Field Definitions
# supplier-intelligence skill

---

## SupplierRecord (canonical schema)

All fields: declare as null if not observed. Never substitute with estimates.

| Field | Type | Source | Notes |
|---|---|---|---|
| supplier_id | string | assigned | SI-{YYYYMMDD}-{NNN} |
| company_name | string | platform/portal | Legal name preferred. Trade name if legal not found. |
| trade_name | string or null | platform | Common/brand name if different from legal |
| website | string or null | any source | First own-domain URL found |
| city | string or null | any source | City of manufacturing/registered address |
| state | string or null | any source | State |
| pin_code | string or null | portal/address | 6-digit India PIN |
| full_address | string or null | portal | Complete address as shown |
| gstin | string or null | portal/profile | 15-character GST number |
| gst_status | enum or null | GST portal | Active / Cancelled / Suspended / Not Found |
| mca_cin | string or null | MCA portal | Corporate Identification Number |
| mca_status | enum or null | MCA portal | Active / Struck Off / Dormant |
| udyam_number | string or null | Udyam portal | Udyam registration number |
| msme_category | enum or null | Udyam portal | Micro / Small / Medium |
| manufacturing_nic_code | string or null | Udyam portal | NIC code — 10–33 = manufacturing |
| year_established | integer or null | portal/profile | Year as integer |
| supplier_type | enum or null | classification | Manufacturer / OEM-ODM / Trader / Distributor / Ambiguous |
| classification_confidence | enum or null | classification | High / Medium / Low |
| classification_signals | object or null | classification | Dict of signal → {present, source} |
| products_offered | array of string | platform | As listed — do not interpret or expand |
| primary_material | string or null | profile | Main material (wood, metal, ceramic, etc.) |
| moq | integer or null | profile | Minimum order quantity in units |
| price_range_inr | object or null | profile | {min: number, max: number} — indicative only |
| contact_phone | string or null | profile | Mobile preferred |
| contact_email | string or null | profile | As shown |
| contact_name | string or null | profile | Contact person name |
| whatsapp_available | boolean or null | profile | WhatsApp number indicated |
| google_rating | number or null | Google Maps | Out of 5.0 |
| google_review_count | integer or null | Google Maps | Total review count |
| linkedin_employee_count | integer or null | LinkedIn | Lower bound of LinkedIn range |
| linkedin_url | string or null | LinkedIn | Company page URL |
| export_capability | boolean or null | export data / profile | true if confirmed, false if contradicted, null if unknown |
| export_countries | array of string | website / export data | Countries mentioned |
| factory_photos_confirmed | boolean or null | website / Maps | true only if photos show factory/machinery |
| machinery_mentioned | boolean or null | website | true if specific machine names found |
| certifications | array of string | website / profile | ISO, BIS, etc. as listed |
| client_list_present | boolean or null | website | |
| credibility_score | integer or null | VERIFY mode | 0–100 |
| credibility_band | enum or null | VERIFY mode | Verified / Partial / Unverified / Red Flag |
| verification_signals | object or null | VERIFY mode | Dict of signal group → {score, source} |
| rank_score | number or null | RANK mode | 0–10 composite |
| rank_position | integer or null | RANK mode | 1-based position |
| dimension_scores | object or null | RANK mode | Dict of dimension → {score, basis} |
| sources_found_on | array of string | all sources | Platform names |
| source_urls | array of string | all sources | URLs where found |
| merged_from | array of string | ENRICH dedup | Other supplier_ids merged into this record |
| data_completeness_pct | integer | ENRICH mode | (non-null fields / total fields) × 100 |
| null_fields | array of string | ENRICH mode | List of field names with null values |
| crawl_timestamp | ISO datetime | DISCOVER mode | When data was gathered |
| confidence | enum | all modes | HIGH / MEDIUM / LOW |

---

## Confidence Assignment Rules

| Confidence | Criteria |
|---|---|
| HIGH | Value directly observed from a source (URL cited, timestamp present) |
| MEDIUM | Value derived from observed data with stated formula or inference from clear signals |
| LOW | Value inferred or estimated — source = "claude_inference: [basis described]" |

**S22 Rule: Every output record must carry a top-level `confidence` field. No exceptions.**
