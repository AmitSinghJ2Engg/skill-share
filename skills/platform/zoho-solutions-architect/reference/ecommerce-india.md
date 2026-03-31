# Ismokraft — India Ecommerce Architecture Reference

**Scope:** Channel integration patterns, fulfillment models, GST compliance, logistics, and payment reconciliation for Indian ecommerce operations.

---

## Table of Contents
- [Sales Channels](#channels)
- [Zoho Inventory Channel Connectors](#connectors)
- [Fulfillment Models](#fulfillment)
- [Logistics Providers](#logistics)
- [GST & Compliance Architecture](#gst)
- [Payment Reconciliation](#payments)
- [Returns Architecture](#returns)
- [Channel → Zoho Flow Patterns](#flows)

---

## Sales Channels {#channels}

| Channel | Type | Key Characteristics |
|---|---|---|
| **Amazon IN** | Marketplace | FBA / FBM / Easy Ship; SP-API for order data; settlement every 7–14 days |
| **Flipkart** | Marketplace | FBF / Seller Flex / Self-Ship; Seller Hub API; 7-day settlement |
| **Shopify** | Own storefront | Full API access; Razorpay/Cashfree as payment gateway |
| **Meesho** | Social marketplace | No self-ship option; courier assigned by Meesho; weekly payouts |
| **Myntra / Nykaa** | Fashion/Beauty marketplace | Vendor portal; B2B invoice model (brand invoices Myntra, not end customer) |
| **ONDC** | Open protocol network | Buyer app agnostic; requires ONDC-compliant seller app |
| **Jiomart / TataCliq** | Marketplace | Seller API or manual portal; growing in Tier-2/3 |

**Architecture rule:** Zoho Inventory is the **single source of truth for stock levels** across all channels. No channel holds authoritative inventory data. Inventory updates flow: Zoho Inventory → channel (not the reverse).

---

## Zoho Inventory Channel Connectors {#connectors}

### Native Connectors (built-in, no third-party)
| Channel | Connector | Order Sync | Inventory Sync | Tracking Sync |
|---|---|---|---|---|
| Amazon IN | Native | ✅ Auto (4-hour default, adjustable) | ✅ | ✅ |
| Shopify | Native | ✅ Real-time webhook | ✅ | ✅ |
| eBay | Native | ✅ | ✅ | ✅ |
| Etsy | Native | ✅ | ✅ | ✅ |

### Third-Party Connectors Required
| Channel | Recommended Connector | Notes |
|---|---|---|
| Flipkart | Commercium / Eshopbox / Unicommerce | Inventory sync + order pull; Zoho Flow webhook bridge possible |
| Meesho | Unicommerce / Eshopbox | No native Zoho connector; use 3PL aggregator or webhook |
| Myntra / Nykaa | Unicommerce / Vinculum | B2B invoice model — different flow from marketplace |
| ONDC | Seller app (Bikayi, Mystore, etc.) | ONDC app connects to Inventory via API/webhook |

**Integration boundary rule (ISM-P003):** All channel integrations funnel orders into Zoho Inventory. Zoho Inventory → Zoho Books for invoicing. No channel writes directly to Books.

---

## Fulfillment Models {#fulfillment}

| Model | Who Ships | Inventory Location | Zoho Inventory Role |
|---|---|---|---|
| **FBA** (Amazon) | Amazon | Amazon FC | Track committed stock in FBA warehouse; auto-reserve on order receipt |
| **FBF** (Flipkart) | Flipkart | Flipkart FC | Same as FBA |
| **Seller Flex** (Flipkart) | Flipkart picks from your WH | Your warehouse | Full warehouse management in Inventory |
| **Easy Ship** (Amazon) | Amazon picks up from you | Your warehouse | Generate packing slips; trigger shipment confirmation |
| **Self-Ship** | You / 3PL | Your warehouse | Full OMS; carrier label via Inventory shipping module |
| **Dropship** | Supplier ships directly | Supplier warehouse | PO to supplier; mark shipped on supplier confirmation |
| **Print-on-Demand** | Print partner ships | No pre-stock | PO generated on order; no inventory held |

**Multi-warehouse rule:** If stock is split across FBA, FBF, and own warehouse, each location must be a separate Inventory warehouse. Allocation logic (which warehouse fulfills which channel order) must be defined at design time and enforced via Flow/Deluge — never manual judgment.

---

## Logistics Providers {#logistics}

### Self-Ship Carrier Integrations (Zoho Inventory native)
Zoho Inventory integrates with ~30 carriers. Key India carriers:
- **Delhivery** — broad pin coverage; API-based label + tracking
- **Shiprocket** — aggregator (Delhivery, Blue Dart, Ekart, etc.); Zoho Inventory native connector
- **Amazon Logistics (AFN)** — for Easy Ship orders only; initiated via SP-API
- **BlueDart / FedEx** — premium; useful for high-value or fragile items
- **DTDC / XpressBees** — mid-tier; good Tier-2/3 coverage

**Design rule:** Carrier selection logic (based on pin code, weight, SLA) should be documented in Tech Spec. Manual carrier selection is permitted only if encoded as a required field with a validation rule — not a free-text workaround.

---

## GST & Compliance Architecture {#gst}

### Key GST concepts for Ismokraft
| Concept | Implication for Zoho |
|---|---|
| **GSTIN on invoices** | Zoho Books: GSTIN configured per organization; auto-applied to B2B invoices |
| **HSN/SAC codes** | Every SKU must have HSN code in Inventory item record; flows to Books invoice |
| **Tax rates** | Configured in Books Tax module; applied at line item level |
| **Place of Supply** | Determines IGST vs CGST+SGST; Zoho Books handles automatically if state codes correct |
| **E-invoicing mandate** | Applies when annual turnover > ₹5Cr; Zoho Books generates IRN + QR via NIC portal (API-based) |
| **GSTR-1** | Outward supply return; Zoho Books generates this from invoices |
| **GSTR-3B** | Summary return; reconcile Books data before filing |
| **TCS by marketplace** | Amazon/Flipkart deduct 1% TCS on payments; must be recorded as a tax credit in Books |

### Amazon TCS Reconciliation Pattern
```
Amazon Settlement File (received every 7–14 days)
  ├── Order payments (net of commissions + returns)
  ├── TCS deducted (1% of gross)
  └── Fee breakdown (referral, fulfillment, storage)

Zoho Books:
  ├── Invoice: created per order (auto via Inventory → Books flow)
  ├── Payment receipt: recorded on settlement date
  ├── TCS credit: recorded as advance tax in Books
  └── Commission expense: recorded as vendor bill or journal entry
```

### E-Invoice Setup Checklist (if applicable)
1. Enable e-invoicing in Zoho Books (Settings → GST → e-invoicing)
2. Configure NIC API credentials (Books handles IRN generation automatically)
3. Test with a sample invoice before go-live
4. IRN is auto-populated in invoice PDF; QR code embedded
5. Cancellation window: 24 hours from IRN generation

---

## Payment Reconciliation {#payments}

### Shopify (Razorpay / Cashfree)
```
Customer pays on Shopify
  → Gateway settles to bank (T+2 or T+3 days, net of gateway fee)
  → Settlement report (CSV) from Razorpay/Cashfree

Zoho Books:
  ├── Invoice: auto-created via Shopify → Inventory → Books flow
  ├── Payment: match settlement date + amount
  └── Gateway fee: record as bank charge or vendor bill (Razorpay as vendor)
```

### Amazon Marketplace Settlement
- Settlement every 7 or 14 days (configurable in Seller Central)
- Settlement file contains: order payments, refunds, FBA fees, ad charges, TCS
- Design rule: Do not attempt line-by-line Books matching for every order — match at settlement level. Individual order invoices exist in Books; settlement payment matches the net total.

### Flipkart Settlement
- Weekly settlement; Flipkart payment advice available in Seller Hub
- Pattern similar to Amazon; commission deducted at source

**Reconciliation rule:** Manual settlement matching is a Class B process — it requires a structured Books reconciliation workflow, not ad-hoc journal entries. Design this explicitly if implementing.

---

## Returns Architecture {#returns}

### Return Flow Types
| Return Type | Initiator | Zoho Books Action | Inventory Action |
|---|---|---|---|
| Marketplace-initiated (customer return via Amazon/Flipkart) | Marketplace | Credit Note against original invoice | Stock return to warehouse (if sellable) or write-off |
| Self-ship return (customer ships back directly) | Customer / Ops team | Credit Note | Stock receipt |
| RTO (Return to Origin — courier couldn't deliver) | Logistics | No credit note (customer never paid/charged) | Stock received back; re-list or write-off |
| Replacement (exchange) | Customer | Credit Note + New Invoice | Return receipt + new shipment |

**Design rule:** Never delete an invoice for a return. Use Credit Notes in Books. RTO vs customer return must be distinguished in Inventory (different reason codes) — this feeds Books differently.

---

## Channel → Zoho Automation Flow Patterns {#flows}

### ISM-P003: Multi-Channel Order Intake (see standard-patterns.md for full spec)
```
Channel (Amazon/Shopify/Flipkart)
  │  [Order placed]
  ▼
Zoho Inventory
  ├── Sales Order created
  ├── Stock allocated (warehouse-specific)
  ├── Packing slip / shipping label generated
  │
  ▼
Zoho Flow (trigger: Sales Order status = Confirmed)
  ├── → Zoho Books: Create Invoice (auto-linked to Sales Order)
  ├── → Zoho CRM: Update Customer LTV / order count (if Sync Field Test passes)
  └── → Zoho Cliq: Notify ops team (high-value orders or exceptions only)

Return Flow:
Channel return initiated
  → Inventory: Receive return, update stock
  → Flow: Create Credit Note in Books
  → CRM: Update customer return history (if Sync Field Test passes)
```

### Product Launch → Listing Flow (Bigin-origin)
```
Bigin (Product Launch Pipeline)
  │  Stage: "Ready to List"
  ├── ISM-P001: Activity "Create Channel Listing"
  │   → Jira ticket: content team creates listing content
  │
  ▼  [Listing approved in Bigin]
Zoho Inventory
  ├── Item created / activated in Inventory
  ├── HSN code, MRP, selling price set per channel
  └── Channel integration pushes listing to Amazon/Shopify/Flipkart
```

---

## India Ecommerce — Design Principles Addendum

These supplement the core Design Authority principles for ecommerce-specific scenarios:

**EC-P1 — Channel SKU parity**: Every item in Zoho Inventory has a canonical SKU. Channel-specific ASINs/FSN/URLs are stored as item-level fields — never as separate records.

**EC-P2 — Single inventory truth**: Stock reservation and release happen in Zoho Inventory only. No channel writes inventory levels. Oversell prevention is an Inventory responsibility.

**EC-P3 — GST-first design**: Every transaction that produces an invoice must have HSN code, tax rate, and place of supply resolvable at the time of invoice creation. Design upstream data collection to guarantee this.

**EC-P4 — Settlement, not order, is the financial event**: Books records invoices per order, but the financial reconciliation unit is the marketplace settlement. Design reconciliation workflows at settlement level.

**EC-P5 — Returns are first-class citizens**: Design return flows at the same time as forward flows. A fulfillment design without a defined return path is incomplete.