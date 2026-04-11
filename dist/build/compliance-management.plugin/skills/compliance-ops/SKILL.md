---
name: compliance-ops
description: >
  CO- Product compliance authority for Ismokraft (Amazon India focus). Live
  mode TIMELINE_CHECK: given a ComplianceRecord and a proposed launch timeline,
  compares expected cert completion dates against launch date, produces a
  PASS/WARNING/BLOCK verdict, and emits a gate_2_compliance_contribution block
  for the test-campaign task's Gate 2 decision. Planned stubs FEASIBILITY,
  INITIATION, COMPLETION — design preserved in docs/skills/compliance-ops-
  planned-modes.md, not wired to any consumer task today.
  Reads cert-catalog.md (India cert types: BIS, FSSAI, CDSCO, TEC, WPC),
  tuning-constants.md (timeline buffers), gate-criteria.ctx.json (gate_1/2/3
  criteria). Never invents cert timelines or certificate numbers.
  ALWAYS trigger for: "check compliance feasibility", "what certs do we need",
  "compliance timeline check", "Gate 2 compliance", "will certs be ready",
  "cert deadline check", "compliance PASS WARNING BLOCK", "initiate compliance",
  "compliance brief", "compliance status", "Gate 3 compliance check",
  "are certifications done", "CO-".
metadata:
  domain: evaluation
  prefix: CO-
  version: 2.0.0
  lifecycle: L1_stable
---

# Compliance Ops

Product compliance authority for Ismokraft. Current focus: **Amazon India marketplace**. Multi-marketplace (US/EU/AU) is future work — see `references/cert-catalog.md`.

**Live mode:** `TIMELINE_CHECK` (Gate 2 consumer via test-campaign Step 8).

**Planned stubs** (design in `docs/skills/compliance-ops-planned-modes.md`, not wired to any task): `FEASIBILITY`, `INITIATION`, `COMPLETION`.

**Single responsibility:** Check compliance timelines against launch plans, generate compliance briefs, track cert completion. Does NOT evaluate products (`product-evaluate`), source vendors (`vendor-ops`), calculate margins (`margin-calculator`), post to Slack (`slack-messaging` via task), or write CRM directly (`zoho-data-ops` via task).

---

## Mode Selection

| User has... | Needs... | Run mode |
|---|---|---|
| ComplianceRecord + launch timeline | Gate 2 timeline verdict (PASS/WARNING/BLOCK) + gate_2_compliance_contribution | **TIMELINE_CHECK** |
| Product category, wants Gate 1 feasibility | Applicable certs + risk level | **FEASIBILITY** (planned stub — see docs/skills/) |
| Vendor selected, want to start compliance | Compliance brief + Jira tickets | **INITIATION** (planned stub) |
| Pre-launch, need Gate 3 compliance result | Cert completion status + Gate 3 verdict | **COMPLETION** (planned stub) |

Trigger phrases for TIMELINE_CHECK: "will certs be ready by launch", "compliance timeline check", "Gate 2 compliance", "cert deadline check".

---

## Session Protocol

1. Read this SKILL.md
2. Read `references/schemas-and-steps.md` — TIMELINE_CHECK I/O, gate_2_compliance_contribution block, CRM field mapping
3. Read `references/cert-catalog.md` — India cert types (BIS, FSSAI, CDSCO, TEC, WPC, etc.), category-to-cert mapping, typical timelines
4. Read `references/tuning-constants.md` — timeline buffers, urgency thresholds, risk tier definitions
5. Read `references/jira-integration.md` — CRM→Bigin→Jira flow (consumed by INITIATION stub; documented for when that mode is wired up)
6. Read `context/product-pipeline/gate-criteria.ctx.json` — **authoritative** gate_1 / gate_2 / gate_3 compliance criteria. gate_1 uses `compliance_feasibility_max_risk`; gate_2 uses `compliance: "PASS or WARNING"`; gate_3 uses `all_certifications_obtained: true`.
7. Read `context/product-pipeline/crm-field-mappings.ctx.json` — `Product_Compliance_Status`, `Compliance_Notes`, `Compliance_Lead_Approver`, `Certifications_Required`, `Compliance_Track_Record` fields
8. Read `context/system-ops/resolutions.ctx.md` — filter by domain `compliance-ops`

---

## Mode: TIMELINE_CHECK (live, D2.5 Gate 2 feeder)

Consumes an existing `ComplianceRecord` from CRM and a proposed launch timeline date. Compares expected certification completion dates against the launch date. Produces a verdict (PASS / WARNING / BLOCK) plus a structured `gate_2_compliance_contribution` block that the `test-campaign` task reads at Gate 2 alongside `ads-ops-plan`'s `gate_2_readiness` and `product-monitor`'s `gate_2_contribution` (DL-022/023 pattern).

### Verdict rules

Named thresholds from `references/tuning-constants.md §1`:

- **PASS** — every cert's `expected_completion_date` is at least `timeline_buffer_days` (default 14) before `launch_timeline_date`
- **WARNING** — at least one cert's `expected_completion_date` is within the `timeline_buffer_days` window (cutting it close but not definitely late) AND no cert is fully past launch
- **BLOCK** — at least one **mandatory** cert's `expected_completion_date` is AFTER `launch_timeline_date`, OR a mandatory cert is missing from the ComplianceRecord entirely

Operator can accept WARNING and proceed; BLOCK requires escalation or a launch date shift.

### gate_2_compliance_contribution block

Always populated in TIMELINE_CHECK output. Structure aligned with DL-018 gate_2 full_criteria (`compliance: "PASS or WARNING"`):

```
gate_2_compliance_contribution: {
  timeline_verdict: "PASS" | "WARNING" | "BLOCK",
  all_certs_expected_before_launch: bool,
  at_risk_certs: [{cert_code, cert_name, expected_date, launch_date, buffer_days, mandatory}],
  critical_certs_blocked: [cert_code],
  gate_2_compliance_met: bool,    # (verdict == PASS) OR (verdict == WARNING) per gc.gate_2.full_criteria.compliance
  rationale: string
}
```

Full TIMELINE_CHECK I/O schema → `references/schemas-and-steps.md`.

---

## Modes: FEASIBILITY / INITIATION / COMPLETION (planned stubs — do not invoke)

All three are designed but **not wired to any consumer task**. Grep `tasks/` for any mode name returns empty. If invoked, return:

```
{ "error": "FEASIBILITY / INITIATION / COMPLETION are planned stubs. Full design at docs/skills/compliance-ops-planned-modes.md. Blocks on consumer tasks (Gate 1 compliance-kickoff, mid-pipeline compliance-initiation, Gate 3 pre-launch-readiness). For the Gate 2 timeline check used by test-campaign, use TIMELINE_CHECK mode." }
```

**Design intent is preserved in `docs/skills/compliance-ops-planned-modes.md`** — full I/O schemas for ComplianceFeasibility / ComplianceRecord / ComplianceCompletionRecord, per-mode logic, halt conditions, and consumer-task pseudocode. That doc is outside the plugin runtime but tracked in git. When these modes get wired up, restore the full sections here.

**Dependencies for when they're built:**
- **FEASIBILITY:** needs a Gate 1 task consumer (probably `product-evaluate` inline call or new `compliance-kickoff` task). Reads `cert-catalog.md` for category → cert mapping.
- **INITIATION:** needs a vendor-selection task trigger + verified CRM→Bigin→Jira automation (see `references/jira-integration.md`).
- **COMPLETION:** needs a pre-launch-readiness task + Jira ticket tracking pipeline.

---

## Rules

1. **Never invent certification timelines.** Read from `cert-catalog.md` — timelines are named constants per cert type.
2. **Never fabricate certificate numbers, issuing bodies, or expiry dates.** If unknown, mark `[VERIFY]` in `gaps[]` and do not proceed.
3. **Always read gate criteria from `gate-criteria.ctx.json`**, never hardcode. Cite the path in context_paths_cited.
4. **TIMELINE_CHECK verdict thresholds cite `tuning-constants.md §1`** — never hardcode day buffers in output prose.
5. **All dates must be specific** (YYYY-MM-DD format). No "soon", "eventually", "TBD" in outputs.
6. **Returns structured data only.** Task orchestrator handles CRM writes via `zoho-data-ops` and Slack posts via `slack-messaging`.
7. **Stay in scope.** FEASIBILITY/INITIATION/COMPLETION are planned stubs — always return the stub error. Never fabricate a ComplianceFeasibility / ComplianceRecord / ComplianceCompletionRecord.
8. **Jira tickets** are created via the existing CRM→Bigin→Jira stage automation (see `references/jira-integration.md`). INITIATION (when built) uses the automation, not direct Jira MCP calls. Automation status: exists per DL-024 Amit Q3, may need testing.

---

## S22 — Data Integrity (NO-FAKE-DATA)

- Never invent certification timelines. Use `cert-catalog.md` named values.
- Never fabricate certificate numbers, issuing bodies, or expiry dates. If unknown, add `[VERIFY]` to `gaps[]`.
- Risk levels (LOW/MEDIUM/HIGH) must be evidenced by applicable regulations cited in `cert-catalog.md`.
- All dates must be specific (YYYY-MM-DD). No vague time references.
- TIMELINE_CHECK thresholds must be cited by named tunable, not hardcoded in output prose.

---

## Related Skills

| Skill | Relationship |
|---|---|
| `margin-calculator` | Sibling at Gate 2 — produces `gate_2_margin_contribution` block; compliance-ops produces `gate_2_compliance_contribution` block. Both read at test-campaign Step 9. |
| `product-monitor` | Sibling at Gate 2 — produces `gate_2_contribution` block for product-side signals. All three feed the same Gate 2 decision. |
| `ads-ops-plan` | Sibling at Gate 2 — produces `gate_2_readiness` block for ad-side signals. |
| `product-evaluate` | Upstream (when FEASIBILITY is wired) — Gate 1 consumer. |
| `vendor-ops` | Upstream (when INITIATION is wired) — vendor-selection trigger. |
| `fulfillment-ops` | Aspirational downstream (when INITIATION is wired) — consumes ComplianceRecord for FBA dispatch readiness. Currently unverified. |
| `zoho-data-ops` | Downstream — task uses it to persist records + retrieve compliance fields from CRM. |
| `slack-messaging` | Downstream — task formats compliance alerts (WARNING/BLOCK) before posting. |

---

## Reference Files

| File | Purpose |
|---|---|
| `references/schemas-and-steps.md` | TIMELINE_CHECK I/O schema, gate_2_compliance_contribution block, CRM field mapping |
| `references/cert-catalog.md` | India cert types (BIS, FSSAI, CDSCO, TEC, WPC, Export Inspection, etc.), category → cert mapping, typical timelines and costs |
| `references/tuning-constants.md` | Timeline buffers, urgency thresholds, risk tier definitions |
| `references/jira-integration.md` | CRM → Bigin → Jira stage automation flow for INITIATION mode (planned) |
| `docs/skills/compliance-ops-planned-modes.md` | **Not a runtime file** — design intent for FEASIBILITY / INITIATION / COMPLETION stubs. Tracked in git, outside plugin build. |
| `context/product-pipeline/gate-criteria.ctx.json` (project) | Authoritative Gate 1 / 2 / 3 compliance criteria |
| `context/product-pipeline/crm-field-mappings.ctx.json` (project) | Compliance CRM field definitions |
