# Data Authority Rules
# ikraft-skill-auditor -- references/data-authority-rules.md
# Version: 2.0.0 (merged with governance-data-source-standards.md)
# Purpose: SOR ownership per entity, conflict detection, and UI artifact data source standards.

---

## Data Authority Model

```
entity -> authoritative_system -> allowed_writers -> sync_targets
```

- **Authoritative system**: Only this system holds the master copy.
- **Allowed writers**: Skills permitted to write this entity to the SOR.
- **Sync targets**: Non-SOR systems receiving a copy via approved sync.

---

## System of Record Table

### Product Entities

| Entity | Authoritative System | Allowed Writers | Sync Targets |
|---|---|---|---|
| Product master record | Zoho CRM Products | product-scorer, launch-gate-checker | Bigin Pipelines (via zoho-solutions-architect) |
| Product_Attractiveness_Score | Zoho CRM Products | product-scorer | None |
| Product_Lifecycle_Stage | Zoho CRM Products | launch-gate-checker | None |
| Opportunity_Score | Zoho Bigin Pipelines | product-scorer | None |
| Financial_Viability | Zoho Bigin Pipelines | margin-calculator | None |
| Scale_Verdict | Zoho Bigin Pipelines | launch-gate-checker | None |
| Product_Category | Zoho CRM Products | product-scorer, market-researcher | None |

### Vendor / Supplier Entities

| Entity | Authoritative System | Allowed Writers | Sync Targets |
|---|---|---|---|
| Vendor contact record | Zoho Bigin Contacts | vendor-discovery | None |
| Vendor_Score (0-100) | Zoho Bigin Contacts | vendor-scorer | None |
| Vendor_Grade (A-F) | Zoho Bigin Contacts | vendor-scorer | None |
| RFQ record | Zoho Bigin Contacts | rfq-generator | None |

### Financial Entities

| Entity | Authoritative System | Allowed Writers | Sync Targets |
|---|---|---|---|
| Unit margin calculation | Conversation output | margin-calculator | CRM Products (Financial_Viability only) |
| Amazon fee data | Conversation output | margin-calculator | None |
| Financial projection | Google Drive | cash-flow-planner | None |

### Campaign / Marketing Entities

| Entity | Authoritative System | Allowed Writers | Sync Targets |
|---|---|---|---|
| Campaign plan | Conversation output / Google Drive | campaign-planner | None |
| Ad performance data | Amazon Seller Central / Meta Ads | ads-performance-reporter (read only) | Zoho Analytics |
| KPI definition | Zoho CRM (custom module) | okr-kpi-governance | None |
| KPI actuals | Zoho CRM (custom module) | sales-analytics, ads-performance-reporter | None |

### Operations Entities

| Entity | Authoritative System | Allowed Writers | Sync Targets |
|---|---|---|---|
| Pipeline stage record | Zoho Bigin Pipelines | launch-gate-checker | None |
| Jira issue | Jira (ISK project) | ism-gap-auditor, ism-scrum-master | Confluence |
| Sprint record | Jira (ISK project) | ism-scrum-master | None |

### Governance Entities

| Entity | Authoritative System | Allowed Writers | Sync Targets |
|---|---|---|---|
| Skill registry | ikraft-skill-governance refs | ikraft-skill-governance | Confluence |
| Audit report | Confluence | ikraft-skill-governance, ecosystem-ops | None |
| SOP documents | Confluence | ism-sop-builder | Google Drive |
| Execution logs | Conversation output | Individual skills | Confluence (if persisted) |

---

## Data Authority Rules

1. **Single Write Ownership**: Each entity field has one SOR. Mismatch = V-044.
2. **Sync Must Be Documented**: Non-SOR writes must be in write_permissions and SOR table. Undocumented = V-044.
3. **No Dual-Write Without Sync Skill**: Same entity to two systems independently = V-044.
4. **Read Always Permitted**: No read restrictions. Authority applies to writes only.
5. **Override Protocol**: SOR override requires documentation here, skill-change-log entry, and next audit review.

---

## Conflict Detection Algorithm

```
For each skill with non-empty write_permissions:
  For each (entity, system) pair the skill writes:
    Look up entity in SOR table
    If system != authoritative_system:
      If system is approved sync_target -> PASS
      Else -> FLAG V-044
```

---

## Cross-System Inconsistency Patterns

| Pattern | Action |
|---|---|
| Two skills claim write authority over same entity in same SOR | Flag SOR conflict |
| write_permissions lists system not in systems_accessed | Flag V-038 |
| Entity in SOR table with no allowed_writer | Flag orphan entity |
| Sync target skill is deprecated | Flag V-020 equivalent |

---

## UI Artifact Data Source Standards (V-035, V-036)

### V-035 -- Data Source Declaration
Every data field in a UI artifact must have a declared source label or a `## Data Sources` section. AI-generated content must be labelled. Missing = V-035 (MEDIUM, -1).

### V-036 -- Durable Storage Target
Save/create/update flows must write to a durable system (Zoho, Drive, Jira, etc.). In-memory only = V-036 (HIGH, -2). window.storage acceptable if documented.

### UI Artifact Audit Checklist

| Check | Pass Criteria | Violation |
|---|---|---|
| Data source labels | All displayed data has source declaration | V-035 |
| AI-generated content labelled | "AI-generated" label present | V-035 |
| Calculated data labelled | Formula or reference cited | V-035 |
| Save flows write durably | MCP write or explicit export | V-036 |
| CRM field names canonical | Match bigin-live-state.md | V-006 |
| Artifact version displayed | Version in header/footer | V-043 |
| ArtifactFooter present | Per AB-P002 standard | V-043 |
| Error states handled | Network/empty/MCP errors | V-027 |
| Storage API restrictions | No localStorage/sessionStorage | V-024 |
| Copy buttons use execCommand | Per AB-F003 learning | V-027 |

---

## Approved System Aliases

| System | Canonical Name |
|---|---|
| Zoho Bigin | Zoho Bigin |
| Zoho CRM | Zoho CRM |
| Zoho Books | Zoho Books |
| Zoho Analytics | Zoho Analytics |
| Zoho Desk | Zoho Desk |
| Jira (Ismokraft) | Jira |
| Confluence (Ismokraft) | Confluence |
| Slack (Ismokraft) | Slack |
| Google Drive | Google Drive |
| Amazon Seller Central | Amazon Seller Central |
| Anthropic API | Anthropic API |
| Web Search | Web Search |
