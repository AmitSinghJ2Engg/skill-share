# Bigin Live State -- Zoho Solutions Architect

Snapshot of live Bigin configuration. **Always read this before designing.**
Prevents designing fields that already exist, or assumptions about fields that don't.

**Source:** Bigin MCP `getFieldsMetadata` for Pipelines and Contacts modules.
**Last verified:** 2026-03-11
**For exact field API names:** Read `crm-field-mappings.json` from project context.
**For pipeline stage API names:** Read `pipeline-config.json` from project context.

---

## Pipelines Module (Shared)

Bigin uses ONE Pipelines module shared across all 13 pipelines. All custom fields exist in the
same pool. Pipeline-specific behavior is achieved via layouts and sub-pipelines.

### 13 Pipelines

| Pipeline | Sub-Pipeline Value | Function |
|---|---|---|
| Product Launches | Product Launch Factory | Product launch lifecycle |
| Content Planner | Content Planner Standard | Content creation workflow |
| Creative Asset | *(not in Sub_Pipeline)* | Creative asset management |
| Marketing Campaign Manager | Marketing Campaign Manager Standard | Campaign tracking |
| Marketing Activities Hub | Marketing Activities Hub Standard | Marketing request hub |
| Product / Website Update | Product / Website Update Standard | Shopify product maintenance |
| Order Fulfillment | Order Fulfillment Standard | Order processing |
| Customer Support | Customer Support Standard | Ticket management |
| Refund Processing | Refund Processing Standard | Refund workflow |
| Customer Testimonials | Customer Testimonials Standard | Review collection |
| Shopify E-commerce Pipeline | Shopify E-commerce Pipeline Standard | Shopify order integration |
| Procure To Pay | *(not in Sub_Pipeline)* | Procurement |
| Influencer Collaboration | *(not in Sub_Pipeline)* | Influencer management |

---

## Field Budget

**82 custom fields used out of ~100 limit. ~82% consumed. ~18 fields remaining.**

Field distribution by function:
- Product Launch: 29 fields
- Content/Marketing: 20 fields
- Influencer: 5 fields
- Product/Website: 8 fields
- Integration: 6 fields
- Shared: 7 fields
- Subforms: 1 field
- Email: 3 fields

For the complete field list with API names, types, and labels, read `crm-field-mappings.json` from project context (sections: `bigin.product_launch_fields` for key Bigin fields, `modules.Product_Launches.fields` for CRM-side mappings).

---

## ZA-I001 Resolution: Dual-Track Stage Tracking

**Decision:** Track Product Launch stages via BOTH Bigin pipeline stages AND artifact booleans.

**Bigin side:** The Product Launches pipeline needs its stages configured in Bigin admin:
1. Go to Bigin > Settings > Pipelines > Product Launches
2. Replace default stages with: New Request, Validated, Research & Profitability, Test Sourcing,
   Test Listing, Paid Testing, Scale Decision Data, Sourcing Model Selection, Final Listing
3. Each stage should map to the existing boolean fields as completion markers:
    - Test Sourcing > `Test_Sourcing_Complete`
    - Test Listing > `Test_Listing_Complete`
    - Scale Decision Data > `Scale_Decision_Complete`

**Artifact side:** The Hub artifact tracks product status independently using its own state.
The Hub's gate calculation reads from its storage, not from Bigin stages. Bigin stages are
synced FROM artifact decisions, not the other way around.

**Data flow:** Artifact (source of truth for evaluation) > Bigin (record of lifecycle state).
Never: Bigin > Artifact (avoids coupling artifact logic to CRM configuration).

---

## Vendor Fields Decision: Artifact-First + Summary Push

**Decision:** Keep detailed vendor evaluation data in artifacts. Push only summary to Bigin.

**Rationale:**
- Contacts module field budget is healthier than Pipelines (~30 fields used vs ~100 limit)
- BUT vendor evaluation has 50+ data points per vendor across 9 categories -- storing all in Bigin wastes fields
- The evaluation workflow happens in the artifact (Spoke 2), not in Bigin
- Bigin's role for vendors: contact management, relationship tracking, supplier lookup

**What stays in artifacts (`ism:vendors` storage):**
- Full 9-category evaluation with all 50+ scores
- Price comparison, quality checklist, quote history

**What pushes to Bigin Contacts (2 fields):**
- `Vendor_Score` (integer 0-100)
- `Vendor_Grade` (picklist: A/B/C/D/F)

**Field budget impact:** +2 fields on Contacts module (well within budget).

---

## Stage-Gate Enforcement Design

### New Fields Required (5 total: 3 Pipelines + 2 Contacts)

**Pipelines module (+3 fields):**

| API Name | Type | Values | Purpose |
|---|---|---|---|
| `Opportunity_Score` | integer | 0-100 | Gate 2 output: market opportunity assessment from artifact |
| `Financial_Viability` | picklist | -None-, Pass, Marginal, Fail | Gate 3 output: unit economics verdict from artifact |
| `Scale_Verdict` | picklist | -None-, Scale, Pivot, Kill | Gate 7 output: test results verdict from artifact |

**Contacts module (+2 fields):**

| API Name | Type | Values | Purpose |
|---|---|---|---|
| `Vendor_Score` | integer | 0-100 | Vendor evaluation score from artifact |
| `Vendor_Grade` | picklist | -None-, A, B, C, D, F | Vendor grade from artifact. Gate 4 requires A/B/C. |

### Gate Enforcement Rules (8 workflow rules)

Each rule triggers when a record transitions INTO the target stage.
On fail: revert stage + create Activity noting the blocked gate.

| Gate | Target Stage | Checks |
|---|---|---|
| G1 | Validated | `Product_Category` not -None- AND `Target_Platform` not empty AND `Description` not empty |
| G2 | Research & Profitability | G1 fields + `Target_Selling_Price` > 0 AND `Target_Customer` not empty AND `USP` not empty AND `Opportunity_Score` >= 55 |
| G3 | Test Sourcing | `Opportunity_Score` >= 55 AND `Financial_Viability` in {Pass, Marginal} |
| G4 | Test Listing | `Supplier` not empty AND `Landed_Cost_Per_Unit` > 0 AND `Test_Sourcing_Complete` = true AND linked Contact `Vendor_Grade` in {A,B,C} |
| G5 | Paid Testing | `Test_Listing_URL` not empty AND `Test_Listing_Complete` = true AND `Product_Compliance_Status` = Compliant AND `Idea_Test_Mode` not -None- |
| G6 | Scale Decision Data | `Test_Start_Date` not empty AND `Test_End_Date` >= Test_Start_Date + 14d AND `Test_Impressions` >= 1000 |
| G7 | Sourcing Model Selection | `Scale_Decision_Complete` = true AND `Scale_Verdict` in {Scale, Pivot} |
| G8 | Final Listing | `Sourcing_Model_Selected` not -None- AND `Fulfillment_Method` not -None- AND `Production_MOQ` > 0 AND `Selling_Price_Confirmed` > 0 |

### Gate 4 Cross-Module Check

Bigin workflow rules cannot do cross-module lookups natively.
**Solution:** Zoho Flow rule: When `Supplier` field is updated on a Pipeline record, copy `Vendor_Grade` from the linked Contact to a text field on the Pipeline record.
**Alternative:** Skip Bigin enforcement for Gate 4. Artifact enforces it (shows warning if Vendor_Grade is D or F).

---

## Integration Points

| Source > Target | Method | Status |
|---|---|---|
| Bigin > Jira (ISK) | Activity > Flow 14 > Jira | Active (ISM-P001) |
| Shopify > Bigin | Shopify-Bigin connector | Active |
| IndiaMart > Bigin Contacts | IndiaMart Toppings | Active |
| Bigin > CRM Products | `CRM_Record_ID` manual link | Configured, not automated |
| Bigin > Zoho Inventory | `Zoho_Inventory_Item_ID` manual link | Configured, not automated |
| Artifacts > Bigin | MCP read/write | Active |

---

## Design Constraints

1. **Shared module** -- adding a Pipelines field affects all 13 pipelines
2. **Field budget ~82%** -- ~18 fields remaining. Adding 3 > ~85% used, 15 remaining.
3. **ISM-P001 active** -- task creation routes through Activity > Flow > Jira
4. **CRM Products minimal** -- defaults only, no custom fields
