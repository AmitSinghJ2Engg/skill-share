---
name: vendor-ops
description: >
  End-to-end vendor qualification in three modes. DISCOVER: delegates to
  supplier-intelligence for ranked multi-source discovery. SCORE: 3-tier
  evaluation (quick screen, quote, sample) or dropship comms scoring —
  returns VendorScore + grade A-F. RFQ: generates Request for Quotation.
  ALWAYS trigger for: "find suppliers", "find vendors", "source this product",
  "who makes this", "IndiaMart search", "supplier search", "manufacturer search",
  "vendor shortlist", "score this vendor", "evaluate this supplier", "vendor grade",
  "quick screen vendor", "communication score", "generate RFQ", "write to supplier",
  "sourcing email", "RFQ for product", "VO-".
  If the task involves finding, evaluating, or contacting a vendor — trigger.
metadata:
  version: "1.2.0"
  domain: supply
  prefix: VO-
  absorbs: [vendor-discovery, vendor-scorer, rfq-generator]
---

# Vendor Ops

Three-mode vendor qualification: find, score, contact.

| Mode | Purpose | Trigger |
|---|---|---|
| **DISCOVER** | Find suppliers (delegates to supplier-intelligence) | "find vendors", "source this" |
| **SCORE** | Evaluate vendor — 3-tier or comms scoring | "score vendor", "vendor grade" |
| **RFQ** | Generate quotation request document | "generate RFQ", "write to supplier" |

**Writes only Vendor_Score and Vendor_Grade to CRM Contacts via zoho-data-ops WRITE mode.**

---

## Session Protocol

### At Session START
1. Read this SKILL.md
2. Read `context/system-ops/resolutions.ctx.md` — filter by domain `vendor-ops`, `cross-skill` — apply active entries
3. Check memory for `VO-*` entries — apply active entries
4. Read `references/vendor-evaluation-model.md` — for SCORE mode 3-tier model
5. Read `references/vendor-comms-scoring.md` — for dropship comms scoring

---

## Exception Capture

If an exception or unexpected pattern occurs:
1. Pause, invoke `ism-learning-engine` with details
2. Await user confirmation, then resume

---

## Mode: DISCOVER

Delegates to `supplier-intelligence` FULL mode. Returns SupplierIntelligenceReport (ranked, verified). Top candidates flow to SCORE mode.

Skip supplier-intelligence when: you already have a named supplier, re-evaluating a prior vendor, or supplier-intelligence already ran.

---

## Mode: SCORE

**Vendor type determines model:**

| Vendor Type | Model | Reference |
|---|---|---|
| Factory / Private Label | 3-Tier (screen → quote → sample) | `references/vendor-evaluation-model.md` |
| Dropship / RTS | Communication scoring (8 categories, 22 questions) | `references/vendor-comms-scoring.md` |

**Grade scale:** A (85-100) proceed | B (70-84) proceed with note | C (55-69) negotiate | D (40-54) last resort | F (<40) reject.

After confirmation, route CRM write payload to `zoho-data-ops` WRITE mode.

See `references/schemas-and-steps.md` for full I/O schemas, VendorScoreRecord JSON, and scoring algorithms.

---

## Mode: RFQ

Generates professional RFQ for shortlisted vendors. Includes product specs, quotation requirements, and terms.

**Do NOT auto-send.** Mark status DRAFT. Operator sends manually.

See `references/rfq-templates.md` for RFQ document template and `references/schemas-and-steps.md` for RFQRecord JSON.

---

## Rules

1. **Never invent vendor data.** Missing data = gap. Document in `gaps[]`.
2. **Tier 1 is binary.** All 5 pass or skip the vendor.
3. **Don't mix models.** Factory → 3-tier. Dropship → comms scoring.
4. **Always state the tier.** A Tier 2 score means no sample received yet.

---

## Governance Contract

```yaml
skill_name: vendor-ops
version: "1.2.0"
owner: Ismokraft
domain: supply
maturity_level: L2_operational
systems_accessed:
  - Zoho CRM Contacts (read + write via zoho-data-ops)
write_permissions:
  - Zoho CRM Contacts: Vendor_Score, Vendor_Grade — via zoho-data-ops WRITE mode
measurable_kpis:
  - KPI-SKILL-VO-01: Vendor Qualification Rate (target >70%)
  - KPI-SKILL-VO-02: Score Accuracy (target >80%)
```

---

## Reference Files

| File | Read when |
|---|---|
| `references/vendor-evaluation-model.md` | SCORE mode — 3-tier model, weights, thresholds |
| `references/vendor-comms-scoring.md` | SCORE mode (dropship) — communication scoring |
| `references/rfq-templates.md` | RFQ mode — document templates |
| `references/sourcing-intelligence.md` | DISCOVER mode — platform search rules |
| `references/vendor-tracker-extras.md` | All modes — active vendor context |
| `references/schemas-and-steps.md` | I/O schemas, VendorScoreRecord, RFQRecord |
| `references/learnings.md` | Session start — active VO- learnings |

---

## Related Skills

| Skill | Relationship |
|---|---|
| `supplier-intelligence` | Upstream — DISCOVER delegates here |
| `product-spec` | Upstream — SupplierBrief triggers DISCOVER/RFQ |
| `zoho-data-ops` | Write gate — CRM Vendor_Score, Vendor_Grade |
| `margin-calculator` | Peer — margin informs COGS target |
| `ism-business-authority` | Consulted by — vendor evaluation criteria |

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Do not invent vendor capabilities, certifications, prices, or scores
- If vendor data is incomplete, flag missing fields — do not assume
- All VendorScore results must trace to input evidence
