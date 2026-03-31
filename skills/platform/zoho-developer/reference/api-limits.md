# Zoho API Limits — Quick Reference

## Zoho CRM (v8)

**Credit system** — daily rolling 24-hour window

| Tier | Users | Credits/day |
|---|---|---|
| Standard | 10 users | 52,500 |
| Professional | 10 users | 90,000 |
| Enterprise | 10 users | 115,000 |
| +per user | each | +250 |

**Credit cost per operation**

| Operation | Credits |
|---|---|
| Standard GET/POST/PUT/DELETE | 1 |
| Convert Lead | 5 |
| Bulk create/update (up to 100 records) | 10 max |
| Search records | 1 |
| COQL query | 1 |

**Concurrency limits** (simultaneous calls per org per app)

| Edition | Concurrent calls |
|---|---|
| Enterprise | 25 |
| Standard/Pro | 10 |

**Sub-concurrency limit** (for expensive ops): 10 simultaneous across all editions
Expensive ops: Convert Lead, Bulk insert/update/upsert, Search records

**Bulk operation limits**
- Insert/Update/Upsert: max 100 records per call
- Add/Remove Tags: max 500 records per call
- Delete: max 100 records per call
- Fetch records: max 200 records per call

**Monitor usage**: Setup → Developer Space → APIs → API Dashboard

---

## Zoho Bigin

| Limit | Value |
|---|---|
| API calls/day (free) | 5,000 |
| API calls/day (paid) | 25,000 |
| Records per GET | 200 |
| Records per bulk operation | 100 |
| API version | v1 |

---

## Zoho Books (v3)

| Limit | Value |
|---|---|
| API calls/day | 2,500 (Standard) → 10,000+ (Enterprise) |
| Records per GET | 200 |
| OAuth scopes required | `ZohoBooks.invoices.CREATE`, `.READ`, `.UPDATE` etc. per resource |
| Org ID | Required in every request URL |

**Key endpoints**:
```
POST /books/v3/invoices?organization_id={orgId}          Create invoice
POST /books/v3/salesorders?organization_id={orgId}       Create sales order
POST /books/v3/creditnotes?organization_id={orgId}       Create credit note
GET  /books/v3/invoices/{invoice_id}?organization_id={orgId}  Fetch invoice
```

---

## Zoho Inventory (v1)

| Limit | Value |
|---|---|
| API calls/day | Shared with Books (same subscription) |
| Records per GET | 200 |
| Org ID | Required in every request URL |

**Key endpoints**:
```
POST /inventory/v1/salesorders?organization_id={orgId}   Create sales order
PUT  /inventory/v1/salesorders/{so_id}?organization_id={orgId}  Update SO
POST /inventory/v1/items?organization_id={orgId}         Create item/SKU
GET  /inventory/v1/items?organization_id={orgId}         List items
```

---

## Zoho Creator (v2.1)

| Limit | Value |
|---|---|
| Records per GET | 1,000 |
| Form submissions/minute | 100 |
| File upload per field | 10 MB |
| API version | v2.1 |

**Request URL structure**:
```
https://creator.zoho.com/api/v2.1/{owner_name}/{app_name}/report/{report_link_name}
```

---

## Zoho Desk

| Limit | Value |
|---|---|
| API calls/hour | 500 (Standard) → 5,000 (Enterprise) |
| Records per GET | 100 |

---

## Zoho Flow

| Limit | Value |
|---|---|
| Tasks/month (Enterprise) | 750,000 |
| Webhook triggers/flow | 10 |
| Step timeout | 30 seconds |
| Auto-retry on failure | 3 times |

---

## Deluge Integration Task Limits (per function execution)

| Task | Limit |
|---|---|
| fetch/search records | 500 |
| create/update/delete records | 500 |
| invokeurl (external HTTP calls) | 10 |
| sendmail | 50 |
| Total loop iterations | 10,000 |
| Max execution time | 60 seconds |

**Note**: Deluge integration tasks (e.g., `zoho.crm.searchRecords()`) consume CRM API credits just like direct API calls.

---

## OAuth 2.0 — Connections Best Practices

- **Always use Zoho Connections** for Deluge functions — never hardcode tokens
- Create a dedicated OAuth Connection per app-to-app integration (e.g., `ism_books_conn`, `ism_crm_conn`)
- Use a **service account** (not a named user) for connections where possible
- Connections auto-refresh tokens — no manual token management needed
- Required scope must be granted at connection setup time; adding scope later requires re-authentication

**Setting up a connection**: Setup → Developer Space → Connections → Add Connection
**Using in Deluge**: `connection: "connection_name"` parameter in `invokeurl`