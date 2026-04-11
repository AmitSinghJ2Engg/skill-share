# compliance-ops — Schemas & Execution Steps

**Authoritative I/O schema for the live TIMELINE_CHECK mode.** Planned modes (FEASIBILITY / INITIATION / COMPLETION) have their schemas in `docs/skills/compliance-ops-planned-modes.md` — not loaded at runtime.

**Shorthand notation** — same pseudo-schema compression as DL-021/023. All field names and types preserved; JSON Schema boilerplate compressed.

---

## Mode: TIMELINE_CHECK

### Input

```
product_name: string (required)
product_id: string (CRM Product_Launches ID, required)
launch_timeline_date: "YYYY-MM-DD" (required — proposed launch/scale date from CostingScenarios or operator)
compliance_record: ComplianceRecord (required — previously produced by INITIATION, read from CRM by the task)
critical_cert_list: [cert_code] (optional — certs that MUST land before launch; if absent, all mandatory certs from compliance_record are treated as critical)
```

### Input sub-type: `ComplianceRecord`

Read from CRM Product_Launches record. Produced by INITIATION (planned mode) or entered manually:

```
product_id: string
certs_applicable: [
  {
    cert_code: "BIS IS-9873" | "FSSAI" | "CDSCO" | "TEC" | "WPC" | "BIS-electrical" | "BIS-generic" | ...,
    cert_name: string,
    mandatory: bool,
    estimated_weeks: int,
    initiated_date: "YYYY-MM-DD" | null,
    expected_completion_date: "YYYY-MM-DD" | null,   # null if not yet initiated
    current_status: "not_initiated" | "in_progress" | "completed" | "failed",
    jira_ticket_id: string | null,
    responsible_party: "internal" | "external_lab" | "vendor"
  }
]
owner: string (CRM person ID)
last_updated: "YYYY-MM-DD"
```

### Execution Steps

1. **Load the ComplianceRecord** from input (task already read it from CRM).
2. **For each cert in `certs_applicable`:**
   - Compute `buffer_days = (expected_completion_date - launch_timeline_date).days`. Negative = before launch (good), positive = after launch (bad).
   - Classify:
     - `buffer_days <= -timeline_buffer_days` → **on track** (completes comfortably before launch)
     - `-timeline_buffer_days < buffer_days <= 0` → **at risk** (in the warning window)
     - `buffer_days > 0` AND `mandatory == true` → **blocking** (mandatory cert lands after launch)
     - `buffer_days > 0` AND `mandatory == false` → **at risk** (optional cert late — warning only)
3. **Apply verdict rules** from `tuning-constants.md §1`:
   - If any cert is **blocking** → `timeline_verdict: BLOCK`
   - Else if any cert is **at risk** → `timeline_verdict: WARNING`
   - Else (all on track) → `timeline_verdict: PASS`
4. **Populate `gate_2_compliance_contribution`** (see below).
5. **Cite context paths:** `gc.gate_2.full_criteria.compliance`, `tuning-constants.md §1 timeline_buffer_days`.
6. **Return output**.

### Output — `ComplianceTimelineCheck`

```
run_id: "CO-T-{YYYYMMDD}-{NNN}"
product_name: string
product_id: string
launch_timeline_date: "YYYY-MM-DD"
timeline_verdict: "PASS" | "WARNING" | "BLOCK"
cert_details: [
  {
    cert_code: string,
    cert_name: string,
    mandatory: bool,
    expected_completion_date: "YYYY-MM-DD" | null,
    buffer_days: int,                   # negative = before launch
    status: "on_track" | "at_risk" | "blocking" | "not_initiated",
    notes: string
  }
]
at_risk_certs: [cert_code]              # convenience list of certs with status != "on_track"
critical_certs_blocked: [cert_code]     # mandatory certs with status "blocking"
gate_2_compliance_contribution: {       # NEW v2.0.0 — DL-024 MC16/PM12-style handoff
  timeline_verdict: "PASS" | "WARNING" | "BLOCK",
  all_certs_expected_before_launch: bool,
  at_risk_certs: [{cert_code, cert_name, expected_date, launch_date, buffer_days, mandatory}],
  critical_certs_blocked: [cert_code],
  gate_2_compliance_met: bool,          # (verdict == PASS) OR (verdict == WARNING) per gc.gate_2.full_criteria.compliance
  rationale: string
}
rationale: string                        # human-readable explanation of the verdict
gaps: [string]                           # any missing inputs (e.g., ["cert B-123 expected_completion_date is null"])
context_paths_cited: [string]            # e.g., ["gc.gate_2.full_criteria.compliance", "tuning-constants §1 timeline_buffer_days"]
execution_trace: {
  skill: "compliance-ops",
  version: "2.0.0",
  mode: "TIMELINE_CHECK",
  fingerprint: "compliance-ops:TIMELINE_CHECK:{product_id}:{YYYY-MM-DD}",
  steps_executed: ["load_compliance_record", "classify_certs", "apply_verdict", "populate_gate_2_contribution"],
  systems_read: ["context.gate-criteria", "context.tuning-constants"],
  systems_written: [],                  # skill never writes directly — task handles CRM/Slack per DL-013/018
  status: "success" | "partial" | "error"
}
```

---

## gate_2_compliance_contribution ↔ test-campaign Step 9 alignment

The `test-campaign` task at Step 9 presents Gate 2 evidence. `gate_2_compliance_contribution` is one of the four structured blocks:

| Source skill | Block name | Gate 2 criterion |
|---|---|---|
| `ads-ops-plan` | `gate_2_readiness` | `blended_acos_lte`, `data_quality_required`, `path_a` or `path_b` |
| `margin-calculator` | `gate_2_margin_contribution` | `keyword_margin_positive_count` (via test join) |
| `product-monitor` | `gate_2_contribution` | product-side signals (return rate, BSR collapse, listing health) |
| **`compliance-ops`** | **`gate_2_compliance_contribution`** | **`compliance: PASS or WARNING`** |

The task aggregates all four and the human makes the decision.

---

## CRM Field Mapping — ComplianceTimelineCheck → Product_Launches

When the task persists TIMELINE_CHECK output via `zoho-data-ops WRITE mode`, field mapping:

- `timeline_verdict` → `Product_Compliance_Status` (picklist: PASS/WARNING/BLOCK — already defined in `crm-field-mappings.ctx.json`)
- `rationale` → `Compliance_Notes` (textarea)
- `gate_2_compliance_contribution.gate_2_compliance_met` → `Gate_2_Compliance_Met` (bool, may need new field)
- `at_risk_certs` → stored as JSON blob in `Compliance_Notes` appended, OR in a new `At_Risk_Certs_JSON` field if/when added
- `owner` (from input ComplianceRecord) → `Compliance_Lead_Approver` (text, already defined)

Fields that exist in `crm-field-mappings.ctx.json` today: `Product_Compliance_Status`, `Certifications_Required`, `Compliance_Notes`, `Compliance_Lead_Approver`, `Compliance_Track_Record`. TIMELINE_CHECK does NOT add new CRM fields in iteration-1 — it uses the existing ones where possible and leaves detailed data in a JSON blob in `Compliance_Notes`.

---

## Halt Conditions (TIMELINE_CHECK)

- `launch_timeline_date` missing → ask operator for target launch date, do not proceed.
- `compliance_record` missing or empty → block, report "no ComplianceRecord in CRM — INITIATION mode (or manual entry) required first".
- `expected_completion_date` null for a mandatory cert → treat as `blocking`, add to `gaps[]`, verdict = BLOCK.
- `launch_timeline_date` is in the past → flag as data error, block, don't emit a verdict.
