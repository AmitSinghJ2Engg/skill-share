# Data Schemas — Ismokraft

**Version:** 0.1 (placeholder)
**Status:** ⚠ TO BE CREATED
**Purpose:** Full JSON schemas for all 25+ data types produced by skills across Domains 1–4. Referenced by 02-business-domain-map.md (Data Type Conventions section).

---

## How to Use This File

Every data type listed in `02-business-domain-map.md` under the Data Type Conventions table must have a full JSON schema defined here before the corresponding skill is built. Skills reference this file to know the exact field names and types to produce when writing to CRM.

**Build rule:** Do not build a skill's CRM-write logic until the schema for its output data types is defined in this file.

---

## Schema Standard

Every schema must include these base fields in addition to domain-specific fields:

```json
{
  "created_at": "ISO 8601 timestamp — e.g. 2026-03-28T07:30:00+05:30",
  "confidence": "HIGH | MEDIUM | LOW",
  "source": ["array of data sources cited — e.g. Amazon BSR, IndiaMART quote"]
}
```

---

## Schemas To Be Defined

The following data types need full schemas. Create one `## {DataType}` section per type below.

**Domain 1:** TrendSignal, ProductCandidate, CompetitorProfile, ResearchRecord, CostEstimate, ComplianceFeasibility

**Domain 1.5:** DifferentiationScenario, SelectedScenario, USPStatement, PositioningBrief

**Domain 2:** ProductSpec, MarginRecord, ConfirmedVendorRecord, RFQDocument, SampleConfirmation, ComplianceRecord, PricingStrategy

**Domain 2.5:** TestPlan, TestListingDraft, TestResults, CostComparison, CostingScenario, ComplianceTimelineCheck, ScaleDecision

**Domain 3:** AmazonListingCopy, ShopifyListingCopy, CanvaBrief, ReviewStrategy, ComplianceCompletionRecord, LaunchCapitalPlan

**Domain 4:** PerformanceRecord, CampaignVerdict, SalesReport, HandoffPackage, FeedbackSignals

**Audit:** KillRecord (ISM Execution Logs), LearningRecord (ISM_Learnings module)

---

<!-- Add schemas below as they are designed -->