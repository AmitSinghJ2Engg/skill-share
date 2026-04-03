# Changelog — vendor-ops

## patch — 2026-03-15
**Type:** patch
**Sprint:** Ecosystem Audit Sprint
**Summary:** vendor-evaluation-model.md path → ism-business-authority canonical (S5).
**Version note:** 1.1.0→1.1.1
**Standards impacted:** S2, S5, S7, S8, S9, S10, S11, S16, S17, S18, S19, S20, S21 (as applicable per summary)

---

## v1.2.0 — 2026-03-15
**Type:** minor
**Sprint:** Supplier Intelligence Engine build
**Summary:** DISCOVER mode replaced with delegation to supplier-intelligence. SCORE and RFQ modes unchanged.
**Changes:**
- DISCOVER mode body replaced with routing note to supplier-intelligence
- Description updated
- supplier-intelligence added to Related Skills
- vendor-ops is now post-qualification only (SCORE, RFQ)
**Standards impacted:** S1, S10, S21

---

## v1.1.0 — 2026-03-15
**Type:** minor
**Sprint:** Consolidation Sprint
**Summary:** Governance standards remediation. Added S8, S10, S11, S16, S19. Updated CRM write path from ism-crm-gateway to ism-learning-engine PERSIST mode.
**Changes:**
- write_permissions: "via ism-crm-gateway" → "via ism-learning-engine PERSIST mode"
- Exception Capture block added (S8)
- Related Skills table added (S10)
- Dependency Metadata section added (S11)
- Governance Contract section added (S16)
- Pre-Execution Validation section added (S19)
**Standards impacted:** S8, S10, S11, S16, S17, S19, S21

---

## v1.0.0 — 2026-03-14
**Type:** create
**Sprint:** Sprint 4
**Summary:** Initial build — vendor-ops consolidating vendor-discovery, vendor-scorer, rfq-generator.
**Standards impacted:** S1–S10, S16–S21
