# Governance Checks -- C1-C18
# ikraft-skill-auditor -- references/governance-checks.md
# Version: 3.0.0
# Purpose: 18 governance check categories for STEP 11 of full audit. Each: PASS | WARN | FAIL.

---

## Extended Checks (C1-C8) -- Business Value, Safety, Resilience

| ID | Name | Violation | Sev. | Ded. | Rule |
|---|---|---|---|---|---|
| C1 | Business Intelligence | V-023 | MED | -1 | Must produce actionable insight, not just data reformatting |
| C2 | Domain Expertise | V-005/V-001 | MED | -1/-2 | Must use Ismokraft-specific context, not generic logic |
| C3 | Gap Exploration | V-023 | MED | -1 | Must proactively identify gaps/anomalies beyond literal question |
| C4 | Validation Mechanism | V-025 | HIGH | -2 | Must validate inputs before execution |
| C5 | Alerting Mechanism | V-028 | MED | -1 | L2+ must define alert channels and conditions |
| C6 | Fallback Mechanism | V-021 | MED | -1 | L2+ must have fallback path or documented exemption |
| C7 | Safety and Security | V-024 | CRIT | -2 | No unconditional delete/overwrite, no hardcoded creds |
| C8 | GenAI Insight | V-030 | MED | -1 | AI insight documented, validated, aligned with models |

## Operational Checks (C9-C18) -- Runtime Data Quality, Observability

| ID | Name | Violation | Sev. | Ded. | Rule |
|---|---|---|---|---|---|
| C9 | Data Validation | V-025/V-026 | HIGH | -2 | Validate data quality before writing to external systems |
| C10 | Data Monitoring | V-026 | HIGH | -2 | Detect/handle stale, null, or anomalous external data |
| C11 | Exception Handling | V-027 | HIGH | -2 | Document behavior when external calls fail |
| C12 | Notification Handling | V-028 | MED | -1 | Specify Slack channels and conditions for L2+ |
| C13 | Enrichment Provenance | V-029 | MED | -1 | CRM records must include provenance metadata |
| C14 | AI Insight Docs | V-030 | MED | -1 | AI reasoning chain documented and aligned |
| C15 | GenAI Measurement | V-031 | MED | -1 | Feedback loop measuring AI output accuracy |
| C16 | Process Measurement | V-032 | LOW | -1 | Measure contribution to overall workflow |
| C17 | Observability | V-033 | HIGH | -2 | Runtime behavior visible from output for L2+ |
| C18 | Prompt Quality | V-034 | MED | -1 | Prompts well-structured, versioned, and tested |

---

## Quick Reference

| Check | Violation | Severity | Ded. |
|---|---|---|---|
| C1 Business Intelligence | V-023 | MEDIUM | -1 |
| C2 Domain Expertise | V-005/V-001 | MEDIUM | -1/-2 |
| C3 Gap Exploration | V-023 | MEDIUM | -1 |
| C4 Validation Mechanism | V-025 | HIGH | -2 |
| C5 Alerting Mechanism | V-028 | MEDIUM | -1 |
| C6 Fallback Mechanism | V-021 | MEDIUM | -1 |
| C7 Safety and Security | V-024 | CRITICAL | -2 |
| C8 GenAI Insight | V-030 | MEDIUM | -1 |
| C9 Data Validation | V-025/V-026 | HIGH | -2 |
| C10 Data Monitoring | V-026 | HIGH | -2 |
| C11 Exception Handling | V-027 | HIGH | -2 |
| C12 Notification Handling | V-028 | MEDIUM | -1 |
| C13 Enrichment Provenance | V-029 | MEDIUM | -1 |
| C14 AI Insight Docs | V-030 | MEDIUM | -1 |
| C15 GenAI Measurement | V-031 | MEDIUM | -1 |
| C16 Process Measurement | V-032 | LOW | -1 |
| C17 Observability | V-033 | HIGH | -2 |
| C18 Prompt Quality | V-034 | MEDIUM | -1 |
