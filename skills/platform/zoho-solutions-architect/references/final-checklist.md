# Pre-Handoff Compliance Checklist

Run through every section before handing off any design. Mark as ✅ or N/A with rationale.

---

## Standard Patterns
- [ ] `references/standard-patterns.md` checked — all applicable patterns identified
- [ ] Entry point determined: Bigin-entry, CRM-entry, Inventory-entry, or mixed — stated explicitly in HLD/Tech Spec
- [ ] ISM-P001 applied where Bigin Activities and Jira are involved
- [ ] ISM-P002 applied where CRM is the primary entry point
- [ ] ISM-P003 applied where marketplace order intake → Inventory → Books is involved
- [ ] Any deviations from active patterns explicitly surfaced and justified
- [ ] Any new reusable decisions flagged as candidate patterns (auto-learn)

---

## Ecommerce Context (if applicable)
- [ ] Sales channel(s) identified
- [ ] Fulfillment model defined
- [ ] GST obligations confirmed (HSN codes, e-invoice if applicable)
- [ ] Return flow designed (not deferred)
- [ ] Payment reconciliation level defined (order-level vs settlement-level)
- [ ] Channel connector identified (native or third-party)

---

## Layer 1 — Principles
- [ ] Every field/step earns its place (P1)
- [ ] Each system used for its correct function (P2)
- [ ] Data entered once at source (P3)
- [ ] All gates system-enforced (P4)
- [ ] Correct path easier than workarounds (P5)
- [ ] Exceptions recorded and attributed (P10)

---

## Layer 2 — Fields
- [ ] Every field has a cited criterion number
- [ ] Tier 2 fields checked for lighter alternatives
- [ ] System assignment correct for each field
- [ ] Bigin field budget sequence applied if applicable

---

## Layer 3 — Data Flow
- [ ] Direction defined for every sync
- [ ] Sync field test applied — no unnecessary CRM duplication
- [ ] All triggers event-driven (no scheduled syncs)
- [ ] Cascade failure recovery defined
- [ ] Manual bridge tolerance applied

---

## Layer 4 — Gates (if applicable)
- [ ] Gate anatomy complete for every approval point
- [ ] Quantitative vs qualitative criteria classified
- [ ] Pre-conditions vs criteria distinguished
- [ ] Cascade fully defined
- [ ] Judgment work flagged as non-automatable

---

## Layer 5 — Roles
- [ ] One owner per field documented
- [ ] Primary system per role correct
- [ ] Delegate documented for every approval role

---

## Layer 6 — Governance
- [ ] Change class stated (A/B/C)
- [ ] Lead time and approver documented
- [ ] Buffer Draw block included if Bigin field added
- [ ] Rollback path documented