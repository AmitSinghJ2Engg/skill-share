# Build Status

Tracks completion of build phases defined in `02-business-domain-map.md`. Update checkboxes as items are completed.

---

## Phase 0: Prerequisites

- [x] **0:** Retrieve CRM Product_Launches field API names via MCP -> populate `crm-field-mappings.ctx.json` (141 fields, module API: Product_Launches)
- [x] **0a:** Retrieve Vendors module fields via MCP; add missing VendorScore fields (47 fields, Vendor_Grade + Evaluation_Score exist)
- [x] **0b:** Audit ISM_Learnings module fields via MCP; add missing feedback loop fields (29 fields, module API: ISM_Learnings, also found ISM_ExecutionLogs, ISM_SkillFeedback, ISM_SkillHealth)
- [x] **0c:** Document Bigin pipeline structure -> populate `pipeline-config.ctx.json` (Product Launch Factory: 13 stages, Procure To Pay: 5 stages exist)
- [x] **0d:** Verify Confluence space ISM exists (space: iscom, ID: 443809796, root folder: 452788225, 3 existing pages)
- [x] **0e:** Probe Zoho Books/Inventory MCP operations (Books: 12 tools read-only, org: 60018085540; Inventory: 26 tools read/write)
- [x] **0f:** Verify Confluence page creation works (test page ID: 590446593, write access confirmed)

**Gate: Do NOT proceed to Phase 1 until all Phase 0 items are confirmed and outputs are in pipeline-config.ctx.json.**

---

## Phase 1: Foundation

- [x] **1:** Write SKILL.md for `compliance-ops` (skills/evaluation/compliance-ops/) — 4.8 KB, 3 modes
- [x] **1a:** Write SKILL.md for `fulfillment-ops` (skills/operations/fulfillment-ops/) — 4.4 KB, 2 modes
- [x] **2:** Generate all 7 `context/product-pipeline/` files (crm-field-mappings.ctx.json, financial-constants.ctx.json, gate-criteria.ctx.json, zone-rotation.ctx.json, brand-rules.ctx.md, ppc-test-campaign-config.ctx.json, pipeline-config.ctx.json)
- [x] **2a:** Create `projects/CLAUDE-product-pipeline.proj.md` (project instructions for "Product Pipeline")
- [x] **2b:** Create `projects/CLAUDE-launch-ops.proj.md` (project instructions for "Launch & Ops")

---

## Claude Desktop / Chat Setup

Tracks readiness of project instructions, workflow skills, and plugin deployment.

**Workflow skills (DL-025: tasks are skills):**
- [x] daily-discovery workflow skill written (`skills/workflow/daily-discovery/SKILL.md`)
- [x] daily-ads-analysis workflow skill written (`skills/workflow/daily-ads-analysis/SKILL.md`)
- [x] test-launch-prep workflow skill written (`skills/workflow/test-launch-prep/SKILL.md`)
- [x] campaign-plan workflow skill written (`skills/workflow/campaign-plan/SKILL.md`)
- [x] campaign-analysis workflow skill written (`skills/workflow/campaign-analysis/SKILL.md`)
- [x] scale-decision workflow skill written (`skills/workflow/scale-decision/SKILL.md`)
- [ ] ism-stage2-intelligence workflow skill (not yet needed)
- [ ] ism-stage3-vendor-search workflow skill (not yet needed)
- [ ] ism-daily-learning workflow skill (not yet needed)

**Project instructions:**
- [x] test-campaign cowork instructions (`projects/cowork/test-campaign/instructions.md`)
- [x] daily-discovery cowork instructions (`projects/cowork/daily-discovery/instructions.md`)
- [x] ism-market-testing Chat instructions (`projects/chat/ism-market-testing/instructions.md`)
- [x] ism-market-testing artifact prompt (`projects/chat/ism-market-testing/artifact-prompt.md`)

**Plugin deployment:**
- [x] Marketplace.json created (AmitSinghJ2Engg/skill-share)
- [x] 16 plugins build clean (`python tools/build.py --all --confirm`)
- [x] workflow-ops plugin built (47 KB, 6 workflow skills)
- [ ] CLI marketplace install tested

---

## Phase 2: Plugins + Skills

- [x] **3:** Trim product-discover SKILL.md as reference example (target: under 5 KB)
- [x] **3a:** Write missing SKILL.md files: ikraft-keyword-intelligence, product-market-intelligence
- [ ] **3b:** Trim existing SKILL.md files: product-screen (done), product-evaluate, product-spec, vendor-ops, content-writer
- [x] **3c:** Refactor margin-calculator SKILL.md (14KB→7KB, 5 modes) — audited in DL-023
- [x] **3d:** Build Plugin 1a "product-discovery" (KI, PD, PS, MI)
- [x] **3e:** Build product-evaluation plugin (PE, MI) — split from original 1b in DL-023
- [x] **3f:** Write ads-ops SKILL.md — split into ads-ops-plan + ads-ops-live in DL-021
- [x] **3g:** Build product-sourcing plugin (SP, VO) — CO + MC split out in DL-023/024
- [x] **3h:** Build product-testing plugin (FO, PM, SM) — AO + CO split out in DL-022/024
- [x] **3i:** Build ads-planning plugin (AO-plan) — DL-022 size-driven split
- [x] **3j:** Build margin-calculation plugin (MC) — DL-023 size-driven split
- [x] **3k:** Build compliance-management plugin (CO) — DL-024 size-driven split
- [x] **3l:** Build workflow-ops plugin (6 workflow skills) — DL-025
- [x] **Audit:** ads-ops-plan 100% vs 47% baseline (DL-021)
- [x] **Audit:** ads-ops-live 100% vs 60% baseline (DL-021)
- [x] **Audit:** product-monitor 100% vs 45% baseline (DL-022)
- [x] **Audit:** margin-calculator 100% vs 61% baseline (DL-023)
- [x] **Audit:** compliance-ops 100% vs 74% baseline (DL-024)

---

## Directory Reorganization (DL-006, 2026-04-03)

- [x] Reorganize skills/ from workflow packages to business capability groups (18 moves)
- [x] Update all 6 plugin.json files to 100% include-based
- [x] Rename testing-config.ctx.json → ppc-test-campaign-config.ctx.json (DL-007)
- [x] Rename amazon-fee-table.md → amazon-fee-table.ctx.md (DL-008)
- [x] Consolidate financial-model-reference.md (19KB→4KB, DL-009)
- [x] Registry regeneration verified
- [x] Decision log updated (DL-006 through DL-009)
- [x] 03-implementation-standards.md updated (description limit, directory structure)
- [x] 02-business-domain-map.md updated (artifact names, config file names)

---

## Phase 3: Automation + Artifacts

- [x] **5:** Workflow skills created (DL-025: daily-discovery, daily-ads-analysis as scheduled workflow skills)
- [ ] **5a:** Register daily-discovery schedule (Desktop/Cloud scheduled task)
- [ ] **5b:** Register daily-ads-analysis schedule (Desktop/Cloud scheduled task)
- [x] **7:** Market Testing artifact spec written (artifact-prompt.md, 5 views, MCP-powered)
- [ ] **7a:** Generate market-testing-v1.0.artifact.tsx in claude.ai Chat project
- [ ] **6:** Build Discovery Dashboard artifact (ism-product-research)
- [ ] **6a:** Build Positioning Workbench artifact (ism-sourcing)
- [ ] **6b:** Build Portfolio Dashboard artifact (ism-portfolio)

---

## Phase 4: Launch & Operations (when products go live)

- [ ] **8:** Generate `context/launch-ops/` files (listing-standards.json, compliance-requirements.json, launch-benchmarks.json, analytics-config.json)
- [x] **8a:** capital-planner and revenue-ops SKILL.md written. ism-learning-engine still placeholder.
- [x] **8b:** product-launch plugin built (CW, CP, FO) — CO split out in DL-024
- [x] **8c:** product-ops plugin built (PM, AO-live, LE placeholder, SM)
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
- [x] Skills reorganized by business capability (DL-006)
