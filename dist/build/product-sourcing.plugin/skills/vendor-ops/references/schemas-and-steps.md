# vendor-ops — Offloaded Schemas & Execution Steps
# Extracted from SKILL.md on 2026-03-15 to reduce SKILL.md to <500 lines.
# This file is the authoritative source for these sections.

---

## Input Schema (DISCOVER mode)

```json
{
  "type": "object",
  "properties": {
    "product_name": { "type": "string" },
    "category": { "type": "string" },
    "vendor_type_preference": {
      "type": "string",
      "enum": ["factory_pl", "white_label", "dropship_rts", "any"],
      "default": "any"
    },
    "target_moq": { "type": "integer" },
    "target_unit_price_inr": {
      "type": "number",
      "description": "Must come from margin-calculator COGS target — not guessed"
    },
    "required_certifications": {
      "type": "array",
      "items": { "type": "string" },
      "description": "e.g. BIS, ISO"
    },
    "geographic_preference": {
      "type": "string",
      "description": "e.g. Rajasthan, Gujarat — default: any India"
    },
    "max_candidates": {
      "type": "integer",
      "default": 5
    }
  },
  "required": ["product_name", "category", "target_moq", "target_unit_price_inr"]
}
```

`target_unit_price_inr` must come from margin-calculator COGS target, not guessed.
If not provided, ask before searching — price filters determine which suppliers are worth profiling.

---

---


## Output Schema — VendorProfile JSON

```json
{
  "type": "object",
  "properties": {
    "discovery_run_id": { "type": "string", "pattern": "VD-[0-9]{8}-[0-9]{3}" },
    "product_name": { "type": "string" },
    "search_date": { "type": "string", "format": "date" },
    "candidates_found": { "type": "integer" },
    "candidates_qualified": { "type": "integer" },
    "vendors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "vendor_id": { "type": "string" },
          "vendor_name": { "type": "string" },
          "vendor_type": {
            "type": "string",
            "enum": ["factory_pl", "white_label", "dropship_rts", "importer", "unknown"]
          },
          "location": { "type": "string" },
          "platform_found": {
            "type": "string",
            "enum": ["indiamart", "tradeindia", "justdial", "web_search", "directory"]
          },
          "source_url": { "type": "string" },
          "profile": {
            "type": "object",
            "properties": {
              "years_in_business": { "type": ["integer", "null"] },
              "products_specialisation": { "type": "string" },
              "stated_moq": { "type": ["integer", "null"] },
              "quoted_price_range": { "type": ["string", "null"] },
              "certifications_claimed": { "type": "array", "items": { "type": "string" } },
              "gstin_visible": { "type": "boolean" },
              "website_present": { "type": "boolean" },
              "indiamart_rating": { "type": ["number", "null"] },
              "indiamart_verified": { "type": "boolean" },
              "response_rate": { "type": ["string", "null"] }
            }
          },
          "quick_screen": {
            "type": "object",
            "properties": {
              "moq_feasible": { "type": "boolean" },
              "price_in_range": { "type": "boolean" },
              "gstin_present": { "type": "boolean" },
              "specialised_not_generic": { "type": "boolean" },
              "red_flags": { "type": "array", "items": { "type": "string" } },
              "screen_verdict": {
                "type": "string",
                "enum": ["PASS", "FAIL", "INSUFFICIENT_DATA"]
              }
            }
          },
          "status": {
            "type": "string",
            "enum": ["discovered", "qualified", "disqualified", "rfq_sent"]
          }
        }
      }
    },
    "search_summary": {
      "type": "object",
      "properties": {
        "platforms_searched": { "type": "array", "items": { "type": "string" } },
        "clusters_searched": { "type": "array", "items": { "type": "string" } },
        "total_results_reviewed": { "type": "integer" },
        "qualification_rate_pct": { "type": "number" },
        "top_recommendation": { "type": "string" }
      }
    },
    "data_gaps": { "type": "array", "items": { "type": "string" } },
    "next_action": { "type": "string" }
  },
  "required": ["discovery_run_id", "product_name", "search_date", "vendors", "search_summary"]
}
```

---

---


## Execution Steps (DISCOVER mode)

### Step 1 — Validate Inputs
Confirm `target_unit_price_inr` is from margin-calculator or the operator's actuals.
Check `references/sourcing-intelligence.md` §1 for the known sourcing cluster for this
category — search there first before generic web queries.

### Step 2 — Platform Search
Search platforms in priority order (see `references/sourcing-intelligence.md` §2):
1. IndiaMart — highest coverage for Indian manufacturers
2. TradeIndia — second source, especially for smaller manufacturers
3. Google (site:indiamart.com + site:tradeindia.com + category keywords)
4. Direct web search for category + "manufacturer India" + state/cluster

Queries:
- `"{product_name}" manufacturer India`
- `"{product_name}" supplier IndiaMART`
- `"{category}" factory {geographic_preference}`
- `"{product_name}" wholesale {target_moq} MOQ`

Collect raw results. Target 2-3× `max_candidates` before filtering.

### Step 3 — Quick Screen Each Candidate
For each candidate, run the 5-point quick screen from `references/sourcing-intelligence.md` §3:
1. MOQ feasibility — stated MOQ ≤ target_moq?
2. Price range plausibility — stated price near target_unit_price?
3. GSTIN visible — required for our model
4. Specialisation — focused on this category, not a generic aggregator?
5. Red flags — complaints, no reviews, unverifiable claims, recently created listing

SCREEN_VERDICT = PASS if criteria 1+3+4 pass and no red flags.
SCREEN_VERDICT = FAIL if criteria 1 or 3 fail, or red flags present.
SCREEN_VERDICT = INSUFFICIENT_DATA if key data is not visible in listing.

FAIL or INSUFFICIENT_DATA vendors are logged but not pushed to Bigin.

### Step 4 — Profile Qualified Vendors
For PASS vendors only: expand the profile using all publicly visible listing data.
Do not contact vendors. Public profile only.

### Step 5 — Output
Return full VendorProfile JSON. Bigin Contacts creation is handled by the artifact layer — not by this skill.

Show summary table:

```
VENDOR DISCOVERY: {product_name}
══════════════════════════════════
Searched:    {platforms_searched} | {clusters_searched}
Found:       {candidates_found} candidates reviewed
Qualified:   {candidates_qualified} passed quick screen

QUALIFIED VENDORS:
  {vendor_id} {vendor_name} — {location} — MOQ: {moq} — ₹{price_range}

TOP PICK: {top_recommendation}
NEXT ACTION: {next_action}
```

---

---


## Input Schema (SCORE mode)

```json
{
  "type": "object",
  "properties": {
    "vendor_name": { "type": "string" },
    "vendor_type": {
      "type": "string",
      "enum": ["factory_pl", "white_label", "dropship_rts"],
      "description": "Determines which scoring model to use"
    },
    "tier": {
      "type": "string",
      "enum": ["1", "2", "3", "comms"],
      "description": "Which tier to score — comms for dropship/RTS vendors"
    },
    "data": {
      "type": "object",
      "description": "Vendor data available: responses, quotes, sample results, communication history"
    }
  },
  "required": ["vendor_name", "vendor_type"]
}
```

If `vendor_type` is unclear, ask. Do not guess.

---

---


