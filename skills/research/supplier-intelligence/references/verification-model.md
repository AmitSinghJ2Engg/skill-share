# Verification Model — Supplier Credibility Scoring
# supplier-intelligence VERIFY mode

---

## Overview

Credibility score: 0–100. Six signal groups. Each signal is binary (present = points, absent = 0).
**Never award points on assumption. Every point must cite its source.**

---

## Group 1 — Government Registration (max 30 points)

| Signal | Points | Source required |
|---|---|---|
| GST registered + status Active | 15 | GST portal or profile listing |
| MCA incorporated (company exists in registry) | 10 | MCA portal |
| Udyam registered | 5 | Udyam portal or profile listing |

**Partial credit:**
- GST visible on profile but portal not verified → 8 points (marked MEDIUM confidence)
- Udyam mentioned in listing but not portal-verified → 2 points (marked LOW confidence)

---

## Group 2 — Manufacturing Evidence (max 25 points)

| Signal | Points | Source required |
|---|---|---|
| Factory photos confirmed — observed in website crawl or Maps | 10 | Website URL or Google Maps |
| Machinery references found in website crawl | 8 | Website URL + specific machine term found |
| Export shipment record (Zauba/IEC) | 7 | web_search result URL or operator paste |

**Important:** Factory photos on marketplace listing alone (not on own website or Maps) = 5 points (MEDIUM confidence, source = marketplace listing).

---

## Group 3 — Platform Presence (max 20 points)

| Signal | Points | Source required |
|---|---|---|
| IndiaMart Verified Supplier or TrustSEAL badge | 8 | IndiaMart profile URL |
| Platform membership ≥ 3 years (any major platform) | 7 | Member Since year on any platform |
| Response rate ≥ 80% (IndiaMart shown rate) | 5 | IndiaMart profile |

---

## Group 4 — Online Footprint (max 15 points)

| Signal | Points | Source required |
|---|---|---|
| Own website (not just marketplace profile) | 5 | Domain URL different from marketplace |
| Google Maps listing with verified address | 5 | Google Maps URL |
| LinkedIn company page present | 5 | LinkedIn URL |

---

## Group 5 — Social Proof (max 7 points)

| Signal | Points | Source required |
|---|---|---|
| Google rating ≥ 4.0 with ≥ 5 reviews | 4 | Google Maps URL |
| LinkedIn employees ≥ 10 | 3 | LinkedIn company page |

---

## Group 6 — Export Capability (max 3 points)

| Signal | Points | Source required |
|---|---|---|
| Confirmed export shipment or IEC code found | 3 | Zauba/Volza web_search or DGFT |

---

## Score Bands

| Score | Band | Recommended Action |
|---|---|---|
| 75–100 | Verified | Pass to vendor-ops SCORE |
| 50–74 | Partial | Note specific gaps. Proceed with documented gaps. |
| 25–49 | Unverified | Request GSTIN + MCA verification before proceeding |
| 0–24 | Red Flag | Do not engage without in-person factory visit. Flag for operator review. |

---

## Red Flag Auto-Triggers (override score)

Regardless of score, mark credibility_band = Red Flag if ANY of:
- GST status = Cancelled or Suspended (verified from portal)
- MCA status = Struck Off or Dormant (verified from portal)
- Negative reviews mentioning fraud, non-delivery, or quality deception (Google/JustDial)
- Platform membership < 6 months AND unusually low prices
- No physical address discoverable on any source
- Claims certifications (ISO, BIS) but cannot be verified via web_search
