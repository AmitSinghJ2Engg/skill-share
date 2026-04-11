# compliance-ops — Planned Modes Design (FEASIBILITY, INITIATION, COMPLETION)

**Status:** Planned. Not currently wired to any consumer task. **Do not invoke from runtime skill.** If invoked, the skill returns a stub error pointing to this file.

**Why this file exists:** FEASIBILITY, INITIATION, and COMPLETION are designed-but-unbuilt modes of `skills/evaluation/compliance-ops/`. The DL-024 compliance-ops audit (2026-04-12) found that **no task in `tasks/` invokes any compliance-ops mode** — grep for `compliance-ops`, `CO-`, or any of the mode names returns empty. The only live consumer is a new `TIMELINE_CHECK` mode (added in the audit) that test-campaign Step 8 invokes at Gate 2.

Per the DL-022 postscript policy — "design intent for planned-but-unwired modes belongs in `docs/skills/{skill}-planned-modes.md`, not in runtime references" — the design for the three dead-code modes was moved here so the skill's runtime stays lean. When these modes get wired to consumer tasks in the future, restore the full sections to the runtime SKILL.md by reading this doc.

**When to build each mode:**
- **FEASIBILITY** unblocks when a Gate 1 task exists (probably `product-evaluate` calling FEASIBILITY inline, or a new `compliance-kickoff` task per DL-020 execution modes).
- **INITIATION** unblocks when (a) a vendor-selection task triggers it after D2 vendor onboarding, AND (b) the CRM→Bigin→Jira automation (see `references/jira-integration.md`) is verified functional.
- **COMPLETION** unblocks when (a) a pre-launch readiness task exists for Gate 3, AND (b) Jira cert tickets are being tracked.

---

## Mode: FEASIBILITY (planned)

**Purpose:** Category-level compliance check for Gate 1 investment decisions. No product spec needed — just the category. Fast, cheap, informational.

**Consumer (when built):** `product-evaluate` at Gate 1 (D1), OR a new `compliance-kickoff` task that runs alongside pipeline entry.

### Input
```
{
  "mode": "FEASIBILITY",
  "product_category": "string (required) — e.g., 'Office Products > Office Supplies > Desk Organizers'",
  "product_name": "string (optional, for tracing)"
}
```

### Logic
1. Read product category.
2. Look up applicable certifications per category from `references/cert-catalog.md` (India marketplace).
3. For each applicable cert: read the estimated timeline in weeks.
4. Assign risk level:
   - **LOW** — no mandatory certs (e.g., generic wood home décor, no food contact)
   - **MEDIUM** — optional/recommended certs, or a single short-timeline mandatory cert
   - **HIGH** — multiple mandatory certs, long-timeline certs, or restricted category

### Output — `ComplianceFeasibility`
```
{
  "run_id": "CO-F-{YYYYMMDD}-{NNN}",
  "product_category": "string",
  "applicable_certs": [
    {
      "cert_code": "BIS IS-9873" | "FSSAI" | "CDSCO" | "TEC" | "WPC" | "BIS-generic" | ...,
      "cert_name": "string",
      "mandatory": bool,
      "estimated_weeks": int,
      "governing_rule": "string (e.g., 'Toys (Quality Control) Order 2020')"
    }
  ],
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "risk_rationale": "string",
  "gate_1_compliance_feasibility": {
    "risk_level": "LOW|MEDIUM|HIGH",
    "meets_gate_1_threshold": bool,    // per gc.gate_1.criteria.compliance_feasibility_max_risk (MEDIUM)
    "context_path_cited": "gc.gate_1.criteria.compliance_feasibility_max_risk"
  },
  "gaps": [string],
  "execution_trace": { ... }
}
```

### Halt conditions
- Category not in `cert-catalog.md` → flag unknown category, return `risk_level: "HIGH"` with note, recommend manual review.

---

## Mode: INITIATION (planned)

**Purpose:** Generate compliance brief and trigger Jira ticket creation after vendor selection. Mid-pipeline (between D2 vendor onboarding and D2.5 test launch).

**Consumer (when built):** A `compliance-initiation` task triggered by vendor selection in CRM (Bigin task or CRM stage automation).

**Dependency:** CRM→Bigin→Jira automation must be verified functional. Per Amit's DL-024 audit answer: "The automation exists currently or may need testing. Bigin is responsible for Jira ticket creation. CRM syncs with Bigin and on stage automation Jira task may be created." See `references/jira-integration.md` for the flow.

### Input
```
{
  "mode": "INITIATION",
  "product_id": "string (required, CRM Product_Launches ID)",
  "product_category": "string (required)",
  "product_spec": {
    "materials": ["string"],
    "dimensions_cm": "object",
    "finish": "string",
    "packaging": "string",
    "weight_grams": int,
    "country_of_origin": "string"
  },
  "owner_crm_id": "string (required, person responsible)"
}
```

### Logic
1. Read product category + ProductSpec.
2. Determine applicable certifications based on category + spec combination. (Spec may narrow or expand the FEASIBILITY result — e.g., a wooden product with metal electrical contacts triggers both BIS wood + BIS electrical.)
3. Generate compliance brief document: cert type, requirements, estimated cost, timeline, responsible party (internal/external).
4. Trigger Jira ticket creation via the CRM→Bigin→Jira flow:
   - Update the CRM Product_Launches record's stage field to a value that triggers Bigin sync
   - Bigin task activity is created
   - On stage automation, Jira "ismo scrum" board ticket is created (one per certification)
5. Return `ComplianceRecord`. CRM writes, Confluence page creation, and Jira ID retrieval are handled by zoho-data-ops (or the CRM-Bigin-Jira automation, depending on which step).

### Output — `ComplianceRecord`
```
{
  "run_id": "CO-I-{YYYYMMDD}-{NNN}",
  "product_id": "string",
  "certs_applicable": [
    {
      "cert_code": "string",
      "cert_name": "string",
      "mandatory": bool,
      "estimated_weeks": int,
      "expected_completion_date": "YYYY-MM-DD",
      "jira_ticket_id": "string (from CRM-Bigin-Jira automation)",
      "jira_board": "ismo scrum",
      "responsible_party": "internal" | "external_lab" | "vendor",
      "estimated_cost_inr": number
    }
  ],
  "owner": "string (CRM person ID)",
  "initiated_date": "YYYY-MM-DD",
  "expected_completion_dates": ["YYYY-MM-DD", ...],
  "confluence_page_url": "string | null",
  "gaps": [string],
  "execution_trace": { ... }
}
```

### Halt conditions
- Jira automation not responding → log failure, return `ComplianceRecord` with `jira_ticket_id: null` per cert and add "Jira automation unresponsive — create tickets manually" to `gaps[]`. Don't block.
- Spec missing required field → block and ask.

---

## Mode: COMPLETION (planned)

**Purpose:** Monitor Jira cert tickets to completion for Gate 3 decision. Pre-launch readiness check.

**Consumer (when built):** A `pre-launch-readiness` task run ~30 days before launch, or on-demand by operator checking Gate 3 status.

### Input
```
{
  "mode": "COMPLETION",
  "product_id": "string (required)",
  "existing_compliance_record": "ComplianceRecord (from INITIATION, stored in CRM)"
}
```

### Logic
1. Read existing ComplianceRecord from CRM Product_Launches record.
2. For each certification:
   - Check Jira ticket status (via CRM activity sync from Bigin).
   - If the Jira ticket is Done:
     - Collect certificate number, issuing body, issue date, expiry date from the ticket's comments/attachments.
   - If still In Progress: note the current state and estimated remaining time.
3. Generate Gate 3 compliance checklist:
   - All mandatory certs obtained? (yes/no)
   - All certs valid (not expired)? (yes/no)
   - Any certs expiring within 90 days post-launch? (list)
4. Return `ComplianceCompletionRecord`.

### Output — `ComplianceCompletionRecord`
```
{
  "run_id": "CO-C-{YYYYMMDD}-{NNN}",
  "product_id": "string",
  "certs_completed": [
    {
      "cert_code": "string",
      "cert_number": "string",
      "issuing_body": "string (e.g., 'Bureau of Indian Standards')",
      "issue_date": "YYYY-MM-DD",
      "expiry_date": "YYYY-MM-DD",
      "days_until_expiry": int
    }
  ],
  "certs_pending": [
    {
      "cert_code": "string",
      "current_status": "string (from Jira)",
      "estimated_remaining_days": int
    }
  ],
  "gate_3_result": "PASS" | "FAIL" | "PARTIAL",
  "gate_3_rationale": "string",
  "certs_expiring_soon": [string],
  "gaps": [string],
  "execution_trace": { ... }
}
```

### Halt conditions
- Any mandatory cert expired before launch → `gate_3_result: FAIL`, flag expired cert with high urgency.
- Any cert issued but unverifiable (no ticket history, missing certificate number) → mark as `[VERIFY]`, add to `gaps[]`, do not fabricate data.

---

## Shared: Execution trace (all planned modes)

Same structure as the live TIMELINE_CHECK mode. See `skills/evaluation/compliance-ops/references/schemas-and-steps.md` for the exact format.

---

## Changelog

- **2026-04-12:** Initial extraction from `skills/evaluation/compliance-ops/SKILL.md` as part of the DL-024 compliance-ops audit (CO3 option (a)). Design intent preserved verbatim from v1.0.0 SKILL.md with audit notes (cert codes corrected per CO5 — CPSC → BIS IS-9873 for India children's products).
