# India Cert Catalog — compliance-ops

Comprehensive catalog of India marketplace certifications used by compliance-ops. Covers BIS, FSSAI, CDSCO, TEC, WPC, Export Inspection, and other regulators relevant to Ismokraft's product range and reasonable future expansion.

**Marketplace focus:** Amazon India (`amazon.in`). US/EU/AU cert systems are future work — documented in this file header only:
- **US:** CPSC (Consumer Product Safety Commission), FCC (telecom/wireless), FDA (food-contact), UL (electrical safety).
- **EU:** CE marking, RoHS, REACH, EN standards.
- **AU:** RCM (Regulatory Compliance Mark), ACMA (telecom).

Those systems are NOT in scope for the current cert catalog. If a future audit adds them, create a new `cert-catalog-us.md` / `cert-catalog-eu.md` / etc.

**Authoritative source:** each cert entry below cites a governing rule (Act, Order, or Standard) — the skill uses these citations to justify risk levels per S22 rule 3.

---

## §1. Category → Certification Mapping

When FEASIBILITY mode (planned) looks up "what certs does this category need", this is the table it reads. TIMELINE_CHECK mode uses this indirectly — it expects the ComplianceRecord to already know which certs apply; this catalog just explains why.

| Category pattern | Applicable certs | Mandatory | Est. weeks | Governing rule |
|---|---|---|---|---|
| **Wood** home décor (non food-contact) — pen holders, photo frames, trays | — | — | 0 | No mandatory certs for decorative wood items |
| **Wood** food-contact — cutting boards, serving platters, utensils | FSSAI | Yes | 8-12 | Food Safety and Standards Act 2006 |
| **Wood** toys / children's items | BIS IS 9873 | Yes | 12-16 | Toys (Quality Control) Order 2020 |
| **Wood** mandir / puja items | — | — | 0 | No mandatory certs (exempt religious articles) |
| **Wood** furniture (non-children, non food-contact) | — | — | 0 | No mandatory certs for decorative furniture |
| **Metal** food-contact — steel utensils, copper mugs, brass diyas | FSSAI | Yes | 8-12 | Food Safety and Standards Act 2006 |
| **Metal** decorative / non-food — wall art, sculptures | — | — | 0 | No mandatory certs |
| **Metal** electrical components — wires, plugs, switches | BIS (electrical) | Yes | 16-24 | BIS Act 2016, various IS standards |
| **Ceramic / terracotta** food-contact — pots, cups, serving dishes | FSSAI | Yes | 8-12 | Food Safety and Standards Act 2006 |
| **Ceramic** decorative — vases, figurines | — | — | 0 | No mandatory certs |
| **Textile** clothing | — (opt: GOTS for organic cotton) | No | 0-12 | Optional eco cert |
| **Textile** baby items | BIS IS 9873 (if toy-like) | Yes | 12-16 | Toys (Quality Control) Order 2020 |
| **Cosmetics** (skincare, haircare) | CDSCO | Yes | 20-30 | Drugs and Cosmetics Act 1940 |
| **Dietary supplements / food** | FSSAI | Yes | 8-12 | FSS Act 2006 |
| **Medical devices / health tech** | CDSCO | Yes | 24-36 | Drugs and Cosmetics Act + Medical Device Rules 2017 |
| **Electrical appliances** — heaters, fans, lamps, toasters | BIS | Yes | 16-24 | Electronics and IT Goods (Compulsory Registration Order) 2012 + various IS standards |
| **Electronic equipment** — LED lights, adapters, batteries | BIS (CRS) | Yes | 16-24 | Compulsory Registration Scheme (CRS) |
| **Telecom equipment** — network cards, modems, telephones | TEC | Yes | 12-20 | Indian Telegraph Act 1885 + TEC procedures |
| **Wireless products** — WiFi devices, Bluetooth peripherals, RF modules | WPC | Yes | 8-16 | Wireless Planning & Coordination Wing, DoT |
| **Packaging materials / food wrap** | FSSAI | Yes | 8-12 | FSS Act 2006 |

**Unknown or ambiguous categories:** FEASIBILITY mode should assign `risk_level: HIGH` with a "category not in catalog — manual review required" note. Never fabricate a cert mapping.

---

## §2. Cert Types — Details

### BIS — Bureau of Indian Standards

**Scope:** Broadest regulator. Product safety, electrical, mechanical, toys, food equipment.

**Sub-schemes Ismokraft may encounter:**
- **ISI Mark** (mandatory for some categories under the BIS Act) — products that carry IS standards
- **CRS (Compulsory Registration Scheme)** — electronics and IT goods, LED lights, adapters, batteries
- **IS 9873 (Toys)** — children's products safety, mandatory under Toys (Quality Control) Order 2020

**Typical timeline:** 12-24 weeks depending on sub-scheme. Testing labs are BIS-recognized; expect 4-8 weeks for lab testing alone.

**Typical cost:** ₹30,000 - ₹2,00,000 depending on product type and sub-scheme.

**Governing:** BIS Act 2016, various Quality Control Orders.

**Renewal:** Most certs valid 2-5 years, requires renewal with fresh testing.

### FSSAI — Food Safety and Standards Authority of India

**Scope:** Food products AND food-contact materials (anything touching food — wood cutting boards, metal utensils, ceramic plates, packaging materials).

**Timeline:** 8-12 weeks for food-contact materials. Longer for food products themselves.

**Cost:** ₹7,500 - ₹50,000 depending on category.

**Governing:** Food Safety and Standards Act 2006, Food Safety and Standards (Packaging and Labelling) Regulations 2011.

**Renewal:** Annual renewal required.

### CDSCO — Central Drugs Standard Control Organization

**Scope:** Cosmetics, medical devices, drugs, some health products.

**Timeline:** 20-36 weeks (cosmetics on the shorter end, medical devices longer).

**Cost:** ₹50,000 - ₹10,00,000+ depending on device class.

**Governing:** Drugs and Cosmetics Act 1940 + Medical Device Rules 2017.

### TEC — Telecommunication Engineering Centre

**Scope:** Telecom equipment certification (Mandatory Testing and Certification of Telecom Equipment scheme — MTCTE).

**Timeline:** 12-20 weeks.

**Cost:** ₹50,000 - ₹5,00,000 depending on equipment complexity.

**Governing:** Indian Telegraph Act 1885 + DoT notifications.

### WPC — Wireless Planning & Coordination Wing

**Scope:** Wireless and RF products (WiFi, Bluetooth, RF modules, IoT devices with wireless).

**Timeline:** 8-16 weeks.

**Cost:** ₹25,000 - ₹2,00,000.

**Governing:** Indian Wireless Telegraphy Act 1933 + DoT notifications.

### EIC / Export Inspection Council

**Scope:** Export quality certification for certain food and non-food products being exported FROM India. Not typically relevant for D2C India-marketplace sellers.

**Note:** Not used by current Ismokraft scope. Listed for completeness.

---

## §3. Risk Level Assignment Rules

When FEASIBILITY (planned) reports a `risk_level`, use these rules:

| risk_level | Criteria |
|---|---|
| **LOW** | No mandatory certs apply. Category has a clean "no certs required" row in §1. |
| **MEDIUM** | Single mandatory cert with ≤16 week timeline, established pathway (e.g., wooden cutting board → FSSAI 8-12 weeks) |
| **HIGH** | Multiple mandatory certs OR timeline > 16 weeks OR restricted category (medical, cosmetics, children's with certification complexity) OR category not in §1 table (unknown) |

**S22 constraint:** Risk level MUST cite the specific cert(s) and the governing rule that justify it. No hand-waving.

---

## §4. Typical Timeline Ranges (for TIMELINE_CHECK)

When TIMELINE_CHECK receives a ComplianceRecord with `expected_completion_date: null` for a cert, it can estimate using these ranges as a fallback — but **must flag in `gaps[]`** that an estimate was used.

| Cert | Best case | Typical | Worst case |
|---|---|---|---|
| FSSAI (food-contact) | 6 weeks | 10 weeks | 14 weeks |
| BIS IS 9873 (toys) | 10 weeks | 14 weeks | 20 weeks |
| BIS CRS (electronics) | 14 weeks | 20 weeks | 30 weeks |
| BIS electrical | 14 weeks | 20 weeks | 30 weeks |
| CDSCO (cosmetics) | 18 weeks | 25 weeks | 36 weeks |
| CDSCO (medical) | 24 weeks | 32 weeks | 52 weeks |
| TEC (telecom) | 10 weeks | 16 weeks | 24 weeks |
| WPC (wireless) | 6 weeks | 12 weeks | 20 weeks |

**TIMELINE_CHECK default:** use "typical" values as the estimate when an explicit expected_completion_date is absent, and add a `[VERIFY]` note.

---

## §5. Changelog

- **2026-04-12:** Initial comprehensive India cert catalog created as part of DL-024 compliance-ops audit (CO5, CO12). Scope: all India cert types (BIS, FSSAI, CDSCO, TEC, WPC) per Amit Q6 answer. Fixed the pre-audit CPSC/India factual error (CPSC is US-based; India children's products go through BIS IS 9873).
