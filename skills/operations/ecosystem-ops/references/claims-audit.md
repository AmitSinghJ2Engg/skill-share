# Claims Audit — Content Accuracy Validation (§7)

Goes beyond structural and semantic checks to verify whether skills make **true statements**.
Skills can be well-structured and internally consistent but still contain false claims —
outdated field names, wrong Jira project keys, nonexistent Slack channels, incorrect API URLs.

---

## What This Checks

### Check G: Zoho Field Verification
- Extract all Zoho field API names referenced in skills
- Verify against live Zoho MCP (Bigin + CRM) that fields actually exist
- Flag: fields referenced in skills that don't exist in the system

### Check H: Slack Channel Verification
- Extract all Slack channel names/IDs referenced in skills
- Verify via Slack MCP that channels exist and are not archived
- Flag: channels referenced that don't exist or are archived

### Check I: Jira Project Verification
- Extract Jira project keys referenced in skills
- Verify via Atlassian MCP that projects exist
- Flag: project keys that don't resolve

### Check J: Confluence Page/Space Verification
- Extract Confluence space keys and page IDs referenced in skills
- Verify via Atlassian MCP that they exist and are current
- Flag: broken Confluence references

### Check K: Cross-Skill Statement Consistency
- Extract factual statements from skills (channel names, field names, URLs, thresholds, rules)
- Compare: does skill A say "channel is #foo" while skill B says "channel is #bar" for the same purpose?
- Flag: contradictory facts

### Check L: Reference File Existence
- For every `references/` file mentioned in any SKILL.md, verify the file actually exists
- This extends ISM-F001 (ghost references) as a recurring check, not just a one-time fix
- Flag: SKILL.md references files that don't exist

---

## Claims Audit Output Format

```
CLAIMS AUDIT REPORT
═══════════════════

SKILLS CHECKED: [N]
CLAIMS VERIFIED: [N]
FALSE CLAIMS: [N]
UNVERIFIABLE: [N]

VERIFIED FALSE:
  [F1] [skill]: Claims field "X_Field" exists in Bigin → NOT FOUND
  [F2] [skill]: References #channel-name → ARCHIVED
  ...

UNVERIFIABLE (needs manual check):
  [U1] [skill]: Claims margin threshold is 30% → Cannot verify via MCP
  ...

VERIFIED TRUE: [N] claims checked and confirmed
```

---

## When to Run Claims Audit

- Quarterly (alongside ecosystem audit)
- After any major Zoho configuration change
- After Slack channel reorganization
- When Amit says "are my skills telling the truth" or "is this still accurate"
