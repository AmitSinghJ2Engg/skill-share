# Sourcing Intelligence — Vendor Discovery

**Purpose:** India sourcing clusters by category, platform intel, quick screen criteria,
and supplier type definitions. Read at Steps 1 and 2.

---

## §1 India Sourcing Clusters by Category

Target these clusters first before generic search — manufacturer density is higher.

| Category | Primary Cluster | Secondary Cluster | Key Search Terms |
|---|---|---|---|
| Home Décor / Wood products | Jodhpur, Rajasthan | Saharanpur, UP | "wooden handicraft", "sheesham wood", "mango wood" |
| Metal / Steel home products | Moradabad, UP | Aligarh, UP | "metal handicraft", "brass items", "stainless steel" |
| Puja items / Religious | Vrindavan, UP | Nathdwara, Rajasthan | "puja accessories", "mandir furniture", "brass puja" |
| Plastic / Utility products | Ahmedabad, Gujarat | Delhi NCR | "plastic moulding", "injection moulded" |
| Ceramics / Pottery | Khurja, UP | Jaipur, Rajasthan | "ceramic", "pottery", "terracotta" |
| Textile / Home linen | Panipat, Haryana | Surat, Gujarat | "home textile", "bed linen", "cotton fabric" |
| Bamboo / Eco products | Assam | Karnataka | "bamboo products", "eco-friendly", "sustainable" |
| Stationery / Paper | Delhi NCR | Mumbai | "stationery", "paper products", "office supplies" |
| Sports / Fitness | Jalandhar, Punjab | Meerut, UP | "sports equipment", "fitness accessories" |
| Electronic accessories | Delhi NCR | Shenzhen (via importers) | "electronics accessories", "mobile accessories" |
| Baby products | Mumbai | Delhi NCR | "baby products", "kids accessories" |
| Packaging materials | Delhi NCR | Mumbai | "corrugated box", "packaging" |

---

## §2 Platform Intelligence

### IndiaMart (indiamart.com)
- **Coverage:** Widest — 7M+ suppliers, strongest in manufacturing
- **Best for:** Factory PL, white label, industrial suppliers
- **Trust signals:** "Verified Supplier" badge, "TrustSEAL" certification, years on platform, response rate
- **Watch for:** Traders posing as manufacturers, recent listings with no history
- **Search approach:** Filter by "Manufacturer" type; check "Member Since" date
- **Price visibility:** Usually shows a price range — treat as indicative only

### TradeIndia (tradeindia.com)
- **Coverage:** Smaller than IndiaMart but strong in B2B industrial
- **Best for:** Niche manufacturers not on IndiaMart, older family businesses
- **Trust signals:** "Verified" badge, years listed, physical address visible
- **Search approach:** Category browse + keyword search

### JustDial (justdial.com)
- **Coverage:** Good for local/regional suppliers
- **Best for:** Small manufacturers open to local visits, quick-response suppliers
- **Trust signals:** User reviews, years in business, response time
- **Limitation:** Limited product catalog info — better for contact-finding than product research

### Direct Web Search
- **When to use:** Category + cluster city search often finds factory websites not on platforms
- **Patterns:** `"{product}" manufacturer Jodhpur`, `"{category}" factory export India`
- **Quality signal:** Own website with product catalog, export history mentioned, GST mentioned

### Sourcing Agents / Aggregators (use with caution)
- Sites like ExportHub, Alibaba India listings — often traders, not manufacturers
- Higher risk of inconsistent quality; only use if platform search yields no results
- Always request factory visit capability to verify manufacturing claims

---

## §3 Quick Screen Criteria — 5-Point Checklist

Apply to every candidate before deep profiling.

### Criterion 1 — MOQ Feasibility
- **PASS:** Stated MOQ ≤ target_moq OR vendor indicates flexibility
- **FAIL:** Stated MOQ > 2× target_moq AND no mention of negotiation
- **INSUFFICIENT:** No MOQ stated — note it, do not disqualify automatically

### Criterion 2 — Price Range Plausibility
- **PASS:** Stated price range overlaps with or is below target_unit_price_inr
- **FAIL:** Lowest stated price is > 1.5× target_unit_price — margin becomes impossible
- **INSUFFICIENT:** No price stated — note it
- **Note:** Stated prices are always pre-negotiation. Actual price 10-20% below stated is normal.

### Criterion 3 — GSTIN Visible
- **PASS:** GSTIN visible on listing page, IndiaMart profile, or website
- **FAIL:** No GSTIN found AND no mention of GST invoices
- **INSUFFICIENT:** Cannot determine — request GSTIN at RFQ stage, flag for follow-up
- **Why this matters:** Ismokraft requires GST invoices for input tax credit. Unregistered vendors are a tax compliance risk.

### Criterion 4 — Category Specialisation
- **PASS:** Vendor lists this product type as primary category, has dedicated product catalog
- **FAIL:** Vendor is a generic aggregator (hundreds of unrelated categories, "we supply everything")
- **INSUFFICIENT:** Limited catalog visible — note it
- **Why this matters:** Generic aggregators often source from third parties. No quality control, unpredictable supply.

### Criterion 5 — Red Flags
Auto-FAIL if any present:
- Negative reviews mentioning fraud, non-delivery, or quality deception
- "Member Since < 1 year" on IndiaMart AND no other verifiable history
- No physical address visible anywhere
- Profile recently created (< 6 months) with unusually low prices
- Claims international certifications (ISO, CE) but cannot show them

---

## §4 Supplier Type Definitions

| Type | Description | Ismokraft Use Case | Typical MOQ |
|---|---|---|---|
| factory_pl | Owns manufacturing equipment, does custom production, can produce to spec | Private label with custom design | 100-500 units |
| white_label | Manufactures standard products, applies your brand/label | Fast entry, low design risk | 50-200 units |
| dropship_rts | Holds ready stock, ships per order to end customer | Testing demand without inventory investment | 1-10 units |
| importer | Sources from China/overseas, resells in India | Not preferred — margin too thin for our model |  varies |
| trader | Aggregator — buys from factory, resells | Avoid — no quality control, margin compression | varies |

**Ismokraft preference order (from ism-business-authority):**
1. factory_pl for products with design differentiation opportunity
2. white_label for fast-entry standard products
3. dropship_rts for demand testing before committing inventory
4. importers only if domestic sourcing is impossible

---

## §5 Price Benchmark by Category (India domestic sourcing, indicative)

These are typical factory-gate prices (per unit, ex-factory, pre-negotiation).
Use only as sanity check — not as targets. Get actuals from market-researcher.

| Category | ₹ Range (Factory Gate) | Notes |
|---|---|---|
| Small wooden décor items | ₹80-250 | Jodhpur cluster; sheesham wood premium |
| Ceramic/pottery items | ₹60-180 | Khurja cluster |
| Puja accessories (brass) | ₹150-500 | Moradabad / Vrindavan |
| Plastic utility products | ₹30-120 | Ahmedabad |
| Stationery / desk items | ₹40-150 | Delhi NCR |
| Cotton home textile | ₹100-400 per piece | Panipat |
| Bamboo products | ₹60-200 | Varies by state |
| Sports equipment (small) | ₹200-600 | Jalandhar |
