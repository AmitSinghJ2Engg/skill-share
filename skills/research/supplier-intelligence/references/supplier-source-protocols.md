# Supplier Source Protocols
# supplier-intelligence skill — per-platform extraction rules

---

## General Parsing Rules (all sources)
1. Strip whitespace from all string values before processing.
2. Remove ₹ symbol and commas before parsing price to number.
3. If parsing produces ambiguous result → field = null + parse_failure[] entry.
4. Never interpret presence of a badge or mark without direct observation — record `null` if not visible.
5. `crawl_record_id` must be carried to every extracted record. No exceptions.

---

## IndiaMart (indiamart.com)

| Field | Location | Rule | Failure |
|---|---|---|---|
| company_name | Supplier name on listing card | Trim. As shown. | null |
| city | City shown on listing | Extract city only (not full address) | null |
| state | State shown after city | As shown. | null |
| gstin | "GST No." field on profile | Extract 15-char code | Not visible → null |
| gst_status | GST field presence | If GSTIN visible → Active assumed | Not shown → null |
| moq | "Minimum Order Quantity" field | Number only. Remove "Piece/Pieces/Units". | Not shown → null |
| price_range_inr | Price range on listing | Lower bound as min, upper as max. Remove ₹ and commas. | Range not shown → null |
| contact_phone | Contact section | As shown. | null |
| contact_name | Contact person name | Trim. | null |
| products_offered | Product listing text | First 3 product names listed | null |
| platform_url | Listing URL | Full URL | null |
| member_since_year | "Member Since" text | Extract year as integer | Not shown → null |
| response_rate_pct | "Response Rate" text | Extract integer | Not shown → null |
| verified_badge | Badge presence | "TrustSEAL" or "Verified Supplier" → true. Neither → false. | Not determinable → null |
| website | Website field on profile | URL as shown | Not listed → null |

---

## TradeIndia (tradeindia.com)

| Field | Location | Rule | Failure |
|---|---|---|---|
| company_name | Supplier name | Trim. | null |
| city | Address field | Extract city | null |
| verified_badge | "Verified" flag | Present → true | Absent → false |
| member_since_year | Profile text | Extract year | null |
| products_offered | Product categories listed | First 3 categories | null |
| platform_url | Listing URL | Full URL | null |

---

## JustDial (justdial.com)

| Field | Location | Rule | Failure |
|---|---|---|---|
| company_name | Business name | Trim. | null |
| city | Location shown | Extract city | null |
| full_address | Address field | As shown | null |
| contact_phone | Phone number | As shown (may be masked — note if click-to-reveal required) | null |
| google_rating | JustDial rating | Extract decimal (JustDial uses own scale — note: `source: justdial_rating` not Google rating) | null |
| years_in_business | "X Years in Business" | Extract integer | null |

---

## Google Maps

| Field | Location | Rule | Failure |
|---|---|---|---|
| company_name | Business name on map listing | Trim. | null |
| full_address | Address shown | As shown | null |
| google_rating | Star rating | Extract decimal (out of 5) | null |
| google_review_count | Review count | Extract integer, remove commas | null |
| website | Website link on listing | URL as shown | null |
| contact_phone | Phone on listing | As shown | null |
| factory_photos_present | Photos tab | Photos of factory/production → true. Only product photos → note. No photos → false. | null |
| years_in_business | "X years in business" tag | Extract integer | null |

---

## LinkedIn (company pages — Mode A only)

| Field | Location | Rule | Failure |
|---|---|---|---|
| linkedin_url | Company page URL | Full URL | null |
| linkedin_employee_count | "X employees on LinkedIn" | Extract integer. Note: LinkedIn shows range — use lower bound. | null |
| year_established | "Founded" field | Extract integer | null |
| industry | Industry tag | As shown | null |
| hiring_signal | "X open jobs" | > 0 jobs → true | No jobs listed → false. Not visible → null |

---

## Website Crawl (company domain)

Parse homepage + /about + /products pages:

| Signal | Detection rule | Value |
|---|---|---|
| factory_photos_present | Text/alt-text contains: "factory", "plant", "production unit", "manufacturing unit"; OR image filename contains "factory", "plant", "workshop" | true / false / null |
| machinery_mentioned | Text contains any: "CNC", "lathe", "band saw", "moulding machine", "router", "press", "spindle", "engraving machine", "laser cutter" | true / false / null |
| certifications_visible | Text or image alt: "ISO", "BIS", "MSME", "export award", "quality certification" | List of terms found, or [] |
| client_list_present | Section heading: "Our Clients", "Trusted By", "Clients", "Our Partners" | true / false / null |
| export_mentioned | Text: "exporting to", "international clients", country names (USA, UK, Germany, UAE, Australia) | true / false / null |
| catalog_present | Link text: "Download Catalog", "Product Catalog", "Specification Sheet" | true / false / null |

**Rule:** Only record what is directly observed. Do not infer factory_photos_present = true from product photos alone.
