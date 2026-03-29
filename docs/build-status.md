# Build Status

Tracks completion of build phases defined in `02-business-domain-map.md`. Update checkboxes as items are completed.

---

## Phase 0: Prerequisites

- [ ] **0:** Retrieve CRM Product_Launches field API names via MCP -> populate `crm-field-mappings.json`
- [ ] **0a:** Retrieve Vendors module fields via MCP; add missing VendorScore fields
- [ ] **0b:** Audit ISM_Learnings module (CustomModule17) fields via MCP; add missing feedback loop fields
- [ ] **0c:** Design Source to Pay Pipeline in Bigin (8 stages) -> populate `pipeline-config.json`
- [ ] **0d:** Set up Confluence space ISM with folder structure
- [ ] **0e:** Probe Zoho Books/Inventory available MCP operations -> document in `pipeline-config.json`
- [ ] **0f:** Verify Confluence MCP page creation works (test page in ISM space)

**Gate: Do NOT proceed to Phase 1 until all Phase 0 items are confirmed and outputs are in pipeline-config.json.**

---

## Phase 1: Foundation

- [ ] **1:** Write SKILL.md for `compliance-ops` (skills/product-evaluation/compliance-ops/)
- [ ] **1a:** Write SKILL.md for `fulfillment-ops` (skills/product-testing/fulfillment-ops/)
- [ ] **2:** Generate all 7 `context/product-pipeline/` files (crm-field-mappings.json, financial-constants.json, gate-criteria.json, zone-rotation.json, brand-rules.md, testing-config.json, pipeline-config.json)
- [ ] **2a:** Create `docs/CLAUDE-product-pipeline.md` (project instructions for "Product Pipeline")
- [ ] **2b:** Create `docs/CLAUDE-launch-ops.md` (project instructions for "Launch & Ops")

---

## Phase 2: Plugins

- [x] **3:** Trim product-discover SKILL.md as reference example (target: under 5 KB)
- [x] **3a:** Write missing SKILL.md files: ikraft-keyword-intelligence, product-market-intelligence
- [ ] **3b:** Trim existing SKILL.md files: product-screen (done), product-evaluate, product-spec, product-monitor, vendor-ops, content-writer
- [ ] **3c:** Write SKILL.md for margin-calculator
- [ ] **3d:** Build Plugin 1a "product-discovery" (KI, PD, PS, MI)
- [ ] **3e:** Build Plugin 1b "product-evaluation" (PE, MC, CO)
- [ ] **3f:** Write missing SKILL.md files: supplier-intelligence, ads-ops
- [ ] **3g:** Build Plugin 2a "product-sourcing" (SP, SI, VO, MC)
- [ ] **3h:** Build Plugin 2b "product-testing" (AO, MO, FO, CO)

---

## Phase 3: Automation + Artifacts

- [ ] **5:** Set up 4 Cowork scheduled tasks (ism-daily-discovery, ism-stage2-intelligence, ism-stage3-vendor-search, ism-daily-learning)
- [ ] **6:** Build Discovery Dashboard artifact
- [ ] **6a:** Build Positioning Workbench artifact
- [ ] **6b:** Build Portfolio Dashboard artifact
- [ ] **7:** Build Sourcing Workbench artifact
- [ ] **7a:** Build Test Lab A artifact (Plan + Run)
- [ ] **7b:** Build Test Lab B artifact (Analyze + Decide)

---

## Phase 4: Launch & Operations (when products go live)

- [ ] **8:** Generate `context/launch-ops/` files (listing-standards.json, compliance-requirements.json, launch-benchmarks.json, analytics-config.json)
- [ ] **8a:** Write remaining SKILL.md files: capital-planner, revenue-ops, ism-learning-engine
- [ ] **8b:** Build Plugin 3 "product-launch" (CW, CP, CO, FO)
- [ ] **8c:** Build Plugin 4 "product-ops" (MO, AO, RO, LE)
- [ ] **8d:** Build Launch Control, Operations Dashboard, Source to Pay Tracker, Seller Central Operations artifacts

---

## Infrastructure (completed)

- [x] Architecture docs (01, 02, 03) — consistent and aligned
- [x] Decision log created (docs/decision-log.md)
- [x] Gate structure resolved (3 gates + stage checklists, DL-001)
- [x] Reference file architecture documented (DL-002)
- [x] CLAUDE.md deprecated with header
- [x] gate-definitions.md marked SUPERSEDED
- [x] Plugin registry created (tools/plugin-registry.json)
- [x] Shared skill dependencies derived from registry (no separate file needed)
- [x] Build script rewritten for 6-plugin architecture (tools/build-plugin.py)
- [x] Feedback loops designed (supplier, differentiation, cost, alert)
- [x] Stage 2 promotion criteria defined
- [x] Test execution framework designed
- [x] Portfolio Dashboard designed
- [x] Build order restructured with verification gates