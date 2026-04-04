# India Supplier Clusters & Platform Intelligence
# supplier-intelligence canonical reference
# Migrated and expanded from vendor-ops/references/sourcing-intelligence.md §1 and §2

---

## §1 India Sourcing Clusters by Category

Target these clusters first — manufacturer density is highest here.

| Category | Primary Cluster | Secondary Cluster | Key Search Terms |
|---|---|---|---|
| Home Décor / Wooden products | Jodhpur, Rajasthan | Saharanpur, UP | "wooden handicraft", "sheesham wood", "mango wood", "solid wood decor" |
| Metal / Steel home products | Moradabad, UP | Aligarh, UP | "metal handicraft", "brass items", "stainless steel", "iron handicraft" |
| Puja items / Religious | Vrindavan, UP | Nathdwara, Rajasthan | "puja accessories", "mandir furniture", "brass puja", "wooden temple" |
| Plastic / Utility products | Ahmedabad, Gujarat | Delhi NCR | "plastic moulding", "injection moulded", "ABS plastic" |
| Ceramics / Pottery | Khurja, UP | Jaipur, Rajasthan | "ceramic", "pottery", "terracotta", "earthenware" |
| Textile / Home linen | Panipat, Haryana | Surat, Gujarat | "home textile", "bed linen", "cotton fabric", "woven" |
| Bamboo / Eco products | Assam | Karnataka | "bamboo products", "eco-friendly", "sustainable", "natural fibre" |
| Stationery / Paper | Delhi NCR | Mumbai | "stationery", "paper products", "office supplies", "notebook" |
| Sports / Fitness | Jalandhar, Punjab | Meerut, UP | "sports equipment", "fitness accessories", "gym equipment" |
| Electronic accessories | Delhi NCR | Shenzhen (via importers) | "electronics accessories", "mobile accessories", "USB" |
| Baby products | Mumbai | Delhi NCR | "baby products", "kids accessories", "child safe" |
| Packaging materials | Delhi NCR | Mumbai | "corrugated box", "packaging", "carton manufacturer" |
| Gift & Novelty | Jodhpur, Rajasthan | Delhi NCR | "gift items", "corporate gifts", "novelty", "souvenir" |
| Candles & Fragrance | Delhi NCR | Bangalore | "candle manufacturer", "fragrance", "aroma" |

**Usage rule:** Select cluster by product category before running DISCOVER. Search cluster first, then fall back to national search only if cluster yields < 5 candidates.

---

## §2 Platform Intelligence

### IndiaMart (indiamart.com)
- **Coverage:** Widest — 7M+ suppliers, strongest in manufacturing
- **Best for:** Factory PL, white label, industrial suppliers
- **Trust signals:** "Verified Supplier" badge, "TrustSEAL" certification, Member Since year, Response Rate %, GST on profile
- **Watch for:** Traders posing as manufacturers, recent listings < 1 year with no history
- **Search approach:** Filter by "Manufacturer" supplier type; check "Member Since" date; look for physical address
- **Price visibility:** Usually shows a price range — treat as indicative only, never as a COGS target
- **Mode A:** Direct search + filter. Slow navigation — 1 keyword per session, avoid rapid page loads
- **Mode B:** web_search `site:indiamart.com {product} manufacturer {city}`

### TradeIndia (tradeindia.com)
- **Coverage:** Smaller than IndiaMart but strong in B2B industrial and niche categories
- **Best for:** Niche manufacturers not on IndiaMart, older family businesses
- **Trust signals:** "Verified" badge, years listed, physical address visible, product catalog breadth
- **Search approach:** Category browse + keyword; check "Member Since" and address
- **Mode B:** web_search or web_fetch acceptable

### Alibaba India suppliers (alibaba.com)
- **Coverage:** Good for export-ready manufacturers
- **Best for:** Manufacturers already exporting, ISO-certified factories
- **Trust signals:** Gold Supplier, Trade Assurance, Verified, factory audit reports, product photos quality
- **Watch for:** Many listings are traders or sourcing agents, not manufacturers
- **Search approach:** Add filter `Supplier Country/Region: India`; look for "Manufacturer" in company profile
- **Mode A preferred** (JS-heavy platform)

### ExportersIndia (exportersindia.com)
- **Coverage:** Medium — useful secondary source for export-focused manufacturers
- **Best for:** Finding exporters not listed on IndiaMart
- **Trust signals:** Verified badge, Export Years count, certifications
- **Mode B:** web_search `site:exportersindia.com {product} manufacturer` acceptable

### Udaan (udaan.com)
- **Coverage:** Strong for ready-to-ship B2B stock
- **Best for:** Distributors and traders with ready inventory — NOT for private label factories
- **Mode B only:** App-based platform; operator paste required for any data
- **Watch for:** Primarily RTS/distributor model — manufacturing verification needed separately

### JustDial (justdial.com)
- **Coverage:** Good for local/regional suppliers, especially small factories
- **Best for:** Small manufacturers open to local visits, finding contact numbers
- **Trust signals:** User reviews, years in business, verified phone
- **Limitation:** Limited product catalog info — better for contact-finding than product research
- **Mode A or web_search**

### Kompass (in.kompass.com)
- **Coverage:** Business directory with employee and revenue data
- **Best for:** Mid-to-large manufacturers with structured company profiles
- **Unique value:** Shows employee band and revenue band — useful for scale assessment
- **Mode B:** web_search `site:in.kompass.com {product} manufacturer {city}`

### Direct Web Search
- **When to use:** Category + cluster city search often finds factory websites not on any platform
- **Query patterns:** `"{product}" manufacturer {city} india`, `"{category}" factory export india`
- **Quality signals:** Own website with product catalog, export history mentioned, GSTIN on website, factory photos
- **Mode B:** web_search + web_fetch homepage

---

## §3 Government Portal Access Guide

### GST Portal (gst.gov.in/services/searchtp)
- **Access:** Public — no login required for basic GSTIN search
- **Query by:** GSTIN (15-char alphanumeric) or legal name + state
- **Returns:** Legal name, business type, registration date, status, address, taxpayer type (Regular/Composition/Casual)
- **Mode A:** Direct navigation
- **Mode B / operator paste:** Operator searches and pastes result page text

### MCA Company Registry (mca.gov.in/mcafoportal/viewCompanyMasterData.do)
- **Access:** Public — no login for basic search
- **Query by:** Company name (exact or partial)
- **Returns:** CIN, incorporation date, registered office address, authorized capital, director count, status
- **Mode A:** Direct navigation
- **Mode B / operator paste:** Operator searches and pastes result

### Udyam Registry (udyamregistration.gov.in)
- **Access:** Verification requires Udyam number + OTP to registered mobile — operator-provided only
- **Mode:** Operator paste only — Claude cannot complete OTP verification
- **Returns:** MSME category, NIC code, enterprise name, registration date, investment/turnover
- **NIC code interpretation:** 10–33 = Manufacturing sector (strong Manufacturer signal)

### IEC (Import Export Code) — DGFT
- **Access:** Public via web_search `{company name} IEC registration`
- **Returns:** IEC present = company is registered to import/export = confirmed export capability signal
- **Mode B:** web_search acceptable

---

## §4 Supplier Type Definitions (Ismokraft Context)

| Type | Description | Ismokraft Use Case | Typical MOQ |
|---|---|---|---|
| Manufacturer | Owns manufacturing equipment, does custom production, produces to spec | Private label with custom design | 100–500 units |
| OEM-ODM | Manufactures standard products, can customize to spec or brand | Faster entry with differentiation | 50–200 units |
| Trader | Aggregator — buys from factory, resells | Avoid — no quality control, margin compression | Varies |
| Distributor | Holds stock for brands/regions | For demand testing RTS only | 1–50 units |

**Ismokraft preference order:**
1. Manufacturer — for products with design differentiation opportunity
2. OEM-ODM — for fast-entry standard products with minor customization
3. Distributor — for pure demand testing before committing inventory
4. Trader — avoid for private label; acceptable only for RTS demand tests

---

## §5 Price Benchmarks by Category (Indicative Only)

**LABEL ALL USE AS `source: industry_estimate, confidence: LOW`.**
**Never use these in margin calculations. Get actuals from market research.**

| Category | Factory Gate Range (₹/unit ex-factory) | Notes |
|---|---|---|
| Small wooden décor items | ₹80–250 | Jodhpur cluster; sheesham wood premium |
| Corner puja mandir (wood) | ₹350–700 | Jodhpur; size and finish dependent |
| Metal handicraft items | ₹100–400 | Moradabad; brass vs iron pricing differs |
| Puja accessories (brass) | ₹150–500 | Moradabad / Vrindavan |
| Ceramic/pottery items | ₹60–180 | Khurja cluster |
| Plastic utility products | ₹30–120 | Ahmedabad |
| Stationery / desk items | ₹40–150 | Delhi NCR |
| Cotton home textile | ₹100–400 per piece | Panipat |
| Bamboo products | ₹60–200 | Varies by state |
| Sports equipment (small) | ₹200–600 | Jalandhar |
