# Zoho App Quick Reference

## Table of Contents
- [Zoho Bigin](#bigin)
- [Zoho CRM](#crm)
- [Zoho Books](#books)
- [Zoho Inventory](#inventory)
- [Zoho Desk](#desk)
- [Zoho Flow](#flow)
- [Zoho Marketing Automation (Campaigns/MarketingHub)](#marketing)
- [Zoho Social](#social)
- [Zoho Analytics](#analytics)
- [Cross-App Patterns](#patterns)

---

## Zoho Bigin {#bigin}

**What it is**: Lightweight pipeline CRM designed for small teams. Used to track deals, contacts, companies, and activities.

**Key concepts**:
- Pipelines and Stages (like Kanban boards for deals)
- Teams Pipelines (multiple pipelines for different workflows)
- Products can be associated with deals
- Activities: Calls, Tasks, Events

**Native automation**:
- Workflows (trigger on field change, record creation, date-based)
- Journeys (multi-step sequences with conditions)
- Functions (Deluge scripts triggered by workflows)

**Common integration patterns**:
- Bigin → Zoho Books: Convert won deal into a Sales Order or Invoice
- Bigin → Zoho Desk: Create support ticket when deal is won (onboarding)
- Bigin → Zoho Flow: Push data to external apps (Shopify, etc.)
- Bigin → Zoho Marketing Automation: Sync contacts for nurture sequences

**Limitations**:
- Less customizable than full CRM (fewer modules, no Canvas views)
- Blueprint (advanced stage gating) not available — use Journeys instead
- API rate limit: 5,000 calls/day (free tier), 25,000/day (paid)

**API name**: `bigin.com` (separate from CRM in API context)

---

## Zoho CRM {#crm}

**What it is**: Full-featured CRM for managing leads, contacts, accounts, deals, and complex sales processes.

**Key concepts**:
- Modules: Leads, Contacts, Accounts, Deals, Activities, custom modules
- Blueprint: Stage-gated approval process with mandatory fields per stage
- Canvas: Custom record detail views
- CommandCenter: Cross-module journey orchestration

**Native automation**:
- Workflow Rules (field-based, time-based, record creation)
- Blueprint (stage transitions with conditions and mandatory actions)
- Functions (Deluge)
- Schedules (run Deluge on a timer)
- CommandCenter (visual journey builder across modules)

**Common integration patterns**:
- CRM → Books: Deal won → create Invoice
- CRM → Desk: New customer → create Account in Desk
- CRM → Analytics: Real-time dashboards on pipeline health
- CRM → Marketing Automation: Lead score sync, campaign enrollment

**Limitations**:
- Full API: 100,000 calls/day (Enterprise tier)
- Some Blueprint constraints can block automation if not designed carefully

---

## Zoho Books {#books}

**What it is**: Accounting software. Manages invoices, bills, payments, expenses, bank reconciliation.

**Key concepts**:
- Customers and Vendors
- Invoices, Sales Orders, Purchase Orders, Bills, Credit Notes
- Chart of Accounts
- Tax configuration (GST-ready for India)
- Payment gateways

**Native automation**:
- Workflow automations (on invoice status change, payment received, etc.)
- Custom functions (Deluge)
- Recurring invoices
- Payment reminders

**Common integration patterns**:
- CRM/Bigin → Books: Auto-create invoice on deal won
- Books → Inventory: Sync stock on sales order creation
- Books → Analytics: Financial reporting and dashboards

**Audit requirements**:
- All financial transactions must be traceable
- Never delete records — use credit notes or voids
- Ensure double-entry is maintained when writing custom logic

**India GST specifics**:
- GST-native: GSTIN, HSN/SAC codes, CGST/SGST/IGST auto-calculation
- E-invoicing: Built-in IRN generation via NIC API (mandatory for turnover > ₹5Cr)
- TCS: Marketplace TCS (1%) must be recorded as advance tax credit — not an expense
- Settlement reconciliation: Design at settlement level, not per-order (see `references/ecommerce-india.md`)
- GSTR-1 / GSTR-3B: Generated from Books; reconcile before filing

**API name**: `books.zoho.com` — requires separate OAuth scope from CRM

---

## Zoho Inventory {#inventory}

**What it is**: Inventory and order management. Tracks stock, sales orders, purchase orders, warehouses.

**Key concepts**:
- Items and Item Groups (variants)
- Sales Orders, Purchase Orders, Shipments, Returns
- Warehouses (multi-location)
- Composite Items (bundles/kits)
- Integrations with Amazon, Shopify, Etsy (native connectors)

**Native automation**:
- Workflow automations
- Custom functions
- Auto-reorder points

**Common integration patterns**:
- Inventory → Books: Auto-sync financials on order fulfillment
- Inventory → CRM: Stock availability visible in deals
- Amazon/Shopify → Inventory: Order ingestion (native connector)
- Inventory → Analytics: Stock level and turnover dashboards

**Key considerations**:
- SKU naming conventions must be consistent across platforms
- Multi-warehouse logic must be explicitly specified in every design
- Fulfillment status changes trigger downstream (shipping, invoicing) — design these chains carefully

**India marketplace connectors**:
- Amazon IN: Native connector; auto-sync every 4 hours (adjustable); FBA warehouse tracking supported
- Shopify: Native; real-time webhook; Razorpay/Cashfree reconciliation handled via Flow
- Flipkart / Meesho: No native connector — use Commercium, Eshopbox, or Unicommerce as middleware; sync via webhook bridge
- Full channel integration patterns → see `references/ecommerce-india.md`

---

## Zoho Desk {#desk}

**What it is**: Customer support helpdesk. Manages tickets, agents, SLAs, and knowledge bases.

**Key concepts**:
- Tickets (support requests)
- Departments (separate queues/teams)
- SLA policies
- Blueprints (stage-gated resolution workflows)
- Portals (customer self-service)

**Native automation**:
- Workflow Rules
- Blueprint
- Macros (manual bulk actions)
- Schedules
- Custom Functions (Deluge)

**Common integration patterns**:
- Desk ↔ CRM: Shared customer view (native integration available)
- Desk → Books: Credit notes or refunds triggered by resolved tickets
- Desk → Marketing Automation: Remove customer from campaigns while ticket open

---

## Zoho Flow {#flow}

**What it is**: Integration platform (iPaaS). Connect Zoho apps to each other and to external services without code.

**Key concepts**:
- Flows: Trigger → Steps → Actions
- Triggers: Webhook, scheduled, app event
- Steps: Conditions, loops, delays, data formatters
- Connections: OAuth-based app credentials

**Best practices**:
- Name every step clearly: `[App] - [Action]` (e.g., "Bigin - Create Deal")
- Always add error branches on critical steps
- Use Flow for cross-app orchestration; use Deluge for within-app logic
- Test flows with sample data before enabling

**Rate limits**: Depends on plan. Enterprise: 750,000 tasks/month.

**When to use Flow vs Deluge**:
- Flow: Connecting two or more different apps, no complex logic
- Deluge: Complex conditional logic, data transformations, within a single app
- Both: Complex cross-app flows where logic must run inside one app first

---

## Zoho Marketing Automation {#marketing}

**What it is**: Marketing automation platform (formerly Zoho MarketingHub). Manages leads, email journeys, scoring, and campaigns.

**Key concepts**:
- Leads (separate from CRM Leads — require sync)
- Journeys (visual automation builder)
- Lead Scoring
- Segments
- Forms and Landing Pages

**Common integration patterns**:
- CRM ↔ Marketing Automation: Sync leads and contacts bidirectionally
- Marketing Automation → CRM: Push hot leads when score threshold hit
- Bigin ↔ Marketing Automation: Contacts sync for nurture

**Key considerations**:
- Lead sync between CRM and Marketing Automation requires explicit field mapping
- Unsubscribes must propagate back to CRM — design this explicitly
- GDPR/consent flags must be respected in all flows

---

## Zoho Social {#social}

**What it is**: Social media management. Schedule posts, monitor mentions, respond to DMs.

**Key concepts**:
- Brands (one brand = one set of social profiles)
- Posts, Scheduled Posts
- Monitoring streams
- Reports

**Common integration patterns**:
- Social → CRM: Convert social lead/DM into CRM Lead
- Social → Desk: Escalate social mention into support ticket
- Social → Analytics: Engagement reporting

---

## Zoho Analytics {#analytics}

**What it is**: Business intelligence and reporting. Connect data sources, build dashboards, create reports.

**Key concepts**:
- Workspaces (collections of tables/reports)
- Data Sync (from Zoho apps, databases, spreadsheets)
- Reports: Tables, Charts, Pivot, KPI widgets, Dashboards
- Sharing and embedding

**Common integration patterns**:
- All Zoho apps → Analytics: Native connectors for CRM, Books, Inventory, Desk
- Analytics → Dashboards: Embedded in Zoho CRM home page or external portals
- Custom data → Analytics: Upload via API or spreadsheet sync

**Best practices**:
- Create a dedicated workspace per functional area (Sales, Finance, Operations)
- Never use Analytics as the primary data store — it's read-only reporting
- Schedule data syncs to refresh at appropriate frequency (hourly, daily)

---

## Cross-App Integration Patterns {#patterns}

### Deal-to-Cash (Bigin/CRM → Books → Inventory)
```
Deal Won (Bigin/CRM)
  → Create Sales Order (Books)
  → Reserve Stock (Inventory)
  → Generate Invoice (Books)
  → Update Deal Status (Bigin/CRM)
  → Create Onboarding Ticket (Desk)
```

### Lead-to-Deal (Marketing Automation → CRM/Bigin)
```
Form Submit / Campaign Response
  → Create/Update Lead (Marketing Automation)
  → Score Lead
  → If score > threshold: Sync to CRM as Lead
  → Sales rep assigns
  → Convert to Deal
```

### Support-to-Refund (Desk → Books)
```
Ticket Resolved (Desk)
  → If resolution = refund: Trigger Function
  → Create Credit Note (Books)
  → Log action in Ticket Notes (Desk)
  → Notify customer
```

### Ecommerce-to-CRM (Shopify/Amazon → Inventory → CRM)
```
New Order (Shopify/Amazon)
  → Sales Order (Inventory)
  → Sync Customer to CRM Contact
  → Fulfillment updates back to platform
  → Trigger post-purchase journey (Marketing Automation)
```