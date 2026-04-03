# Artifact Audit Rules
# ikraft-skill-governance v5.0 | Last updated: 2026-03-15
# Trimmed 2026-04-03. Verbose explanations removed; scan patterns and schema retained.

Used by ARCHITECTURE mode Step A3. Operator provides artifact code (JSX/HTML).
One finding per instance. Each hardcoded formula/threshold is a separate finding.

---

## Pattern Categories

### Cat 1 -- Hardcoded Business Constants (V-047 CRITICAL)

Scan for: `const [CAPS_NAME] = [numeric literal]` where name contains TARGET, THRESHOLD, RATE, FEE, MARGIN, PRICE, ROAS, ACOS, SCORE, LIMIT, CAP, MIN, MAX.

Remediation: extract to context registry -> skill reads context -> passes as prop to artifact.

### Cat 2 -- Inline Fee Calculations (V-047 CRITICAL)

Scan for: arithmetic on variables named referralFee, closingFee, weightHandling, pickPack, gstOnFees, totalFees, fbaFee, amazonFees, platformFee, sellerFee, netFee, netProfit, breakeven.

Compliant: `const { netProfit, totalFees } = marginData; // from skill output`

### Cat 3 -- Embedded Scoring/Ranking Logic (V-047 CRITICAL)

Scan for: scoring arrays with weights, `reduce()` over criteria, grade functions with threshold branches, gate-check functions combining multiple conditions.

Belongs in: product-lab (CTX-003/CTX-007), vendor-ops (CTX-004).

### Cat 4 -- Independent Strategic Decisions (V-051 CRITICAL)

Scan for: if/else or switch trees that determine *what action to take* (not how to display). Includes: status assignment based on thresholds, sourcing model selection, scaling verdicts.

Compliant: artifact receives `{ status, recommendation }` from skill and displays it.

### Cat 5 -- Artifact Self-Configuration (V-051 CRITICAL)

Scan for: hardcoded pipeline stages, CRM field lists, Slack channel IDs, priority rules.

Exception: purely UI config (colors, animation, layout breakpoints) is allowed.

### Cat 6 -- Stale Data Without Source Label (V-035 MEDIUM)

Scan for: data in cards/tables/charts with no source label or freshness indicator.

---

## Audit Output Schema

```json
{
  "artifact_name": "string",
  "audit_date": "ISO date",
  "findings": [{
    "finding_id": "AF-NNN",
    "category": "1-6",
    "violation_code": "V-047 | V-051 | V-035",
    "severity": "CRITICAL | HIGH | MEDIUM",
    "law_violated": "LAW-2 | LAW-4 | LAW-5",
    "location": "component or line ref",
    "pattern_found": "code pattern",
    "remediation": "extract to which skill/context"
  }],
  "summary": {
    "total_findings": 0,
    "critical": 0, "high": 0, "medium": 0,
    "by_law": { "LAW-2": 0, "LAW-4": 0, "LAW-5": 0 }
  },
  "verdict": "COMPLIANT | AT_RISK | NON_COMPLIANT"
}
```

Verdict rule: 0 findings = COMPLIANT, medium only = AT_RISK, any CRITICAL/HIGH = NON_COMPLIANT.

---

## Remediation Routing

| Violation | Route to |
|---|---|
| Fee constants (Cat 1/2) | margin-calculator + CTX-001/002 |
| Scoring logic (Cat 3) | product-lab/vendor-ops + CTX-003/004/007 |
| Strategic decisions (Cat 4) | ism-business-authority or domain skill |
| Self-config (Cat 5) | zoho-solutions-architect (CRM/Bigin), ism-scrum-master (channels) |
| Stale data (Cat 6) | artifacts-builder-v2 (add source label) |

Skill updates -> ism-skill-factory. Artifact rebuilds -> artifacts-builder-v2.
