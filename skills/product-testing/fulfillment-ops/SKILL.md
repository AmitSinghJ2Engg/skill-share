---
name: fulfillment-ops
description: >
  FO- Manages FBA inbound fulfillment. SAMPLE: creates inventory package and
  FNSKU guide for test unit. BULK: creates inventory package and inbound
  checklist for production order.
version: "1.0.0"
lifecycle: prototype
---

# Fulfillment Ops

Manages FBA inbound fulfillment preparation for both sample units and bulk production orders. Creates Zoho Inventory packages, Books expense entries, FNSKU labeling guides, and inbound shipment checklists.

**Boundary:** This skill manages fulfillment logistics. It does not evaluate products (product-evaluate), source vendors (vendor-ops), or manage compliance (compliance-ops).

## Modes

| Mode | Input | Output | Downstream |
|---|---|---|---|
| **SAMPLE** | product_id + ConfirmedVendorRecord | `FulfillmentSamplePackage` -> Inventory + Books + CRM | ads-ops (test listing) |
| **BULK** | product_id + bulk_order_qty | `FulfillmentBulkPackage` -> Inventory + Books + CRM | product-monitor (live ops) |

## MODE: SAMPLE

Prepare a test unit for FBA inbound shipment after QC approval.

1. Read ProductSpec from CRM Product_Launches record (weight, dimensions, materials).
2. Read ConfirmedVendorRecord (supplier name, sample quantity = 1 unit typical).
3. Prepare Inventory Package data: item from `Zoho_Inventory_Item_ID`, quantity, weight, dimensions.
4. Prepare Books shipping expense data: inbound sample shipping cost, linked to product.
5. Generate FNSKU labeling guide: ASIN/FNSKU mapping, label placement instructions per Amazon FBA requirements, barcode specifications.
6. Generate inbound shipment checklist: step-by-step instructions for founder to prep sample -- box sizing, bubble wrap, FNSKU label, shipping label, carrier booking.
7. Return `FulfillmentSamplePackage` with all data. Zoho Inventory/Books/CRM writes and Confluence storage handled by zoho-data-ops.

**Output:** `FulfillmentSamplePackage` -- inventory_package_id, books_expense_id, fnsku_guide_url, checklist_url. Run ID: `FO-S-{YYYYMMDD}-{NNN}`.

## MODE: BULK

Prepare production order for FBA inbound after bulk arrival at warehouse.

1. Read ProductSpec from CRM Product_Launches record.
2. Read bulk order quantity, confirmed supplier, and Source to Pay pipeline status.
3. Prepare Inventory Package data: item, bulk quantity, total weight, carton count.
4. Prepare Books shipping expense data: inbound bulk shipping cost.
5. Generate FNSKU labeling guide: same format as SAMPLE but with bulk quantity instructions, carton-level labeling, pallet requirements if applicable.
6. Generate bulk inbound checklist: carton count verification, weight check vs. PO, FNSKU placement per unit, Amazon shipment plan creation steps, carrier pickup scheduling.
7. Return `FulfillmentBulkPackage` with all data. Zoho Inventory/Books/CRM/Bigin writes handled by zoho-data-ops.

**Output:** `FulfillmentBulkPackage` -- inventory_package_id, books_expense_id, fnsku_guide_url, checklist_url, carton_count. Run ID: `FO-B-{YYYYMMDD}-{NNN}`.

## Input Validation

| Mode | Required | Block if missing |
|---|---|---|
| SAMPLE | product_id + ConfirmedVendorRecord + QC status PASS or WAIVED | Cannot ship without QC approval |
| BULK | product_id + bulk_order_qty + supplier confirmed | Cannot prepare without confirmed order |

## Halt Conditions

- SAMPLE: `Zoho_Inventory_Item_ID` missing on CRM record -> halt, item must be created in Inventory first
- BULK: weight exceeds FBA single-unit limit (30 kg) -> flag, suggest multi-box shipment
- Either: Zoho Inventory/Books MCP call fails -> log failure, provide manual fallback steps

## Rules

1. Never invent Zoho IDs. Capture actual returned IDs from MCP calls.
2. FNSKU guide follows Amazon FBA labeling requirements (ASIN-to-FNSKU mapping).
3. Inbound checklist is step-by-step for founder execution, not automated.
4. All quantities must match confirmed order data from CRM.
5. Package records must link to ProductSpec for weight/dimension verification.
6. Data integrity rules from project context apply to all modes.

## Trigger Phrases

FO-, prepare sample for shipment, prepare bulk shipment, FBA inbound, create FNSKU guide, generate inbound checklist, set up inventory package, ship to FBA, bulk fulfillment.
