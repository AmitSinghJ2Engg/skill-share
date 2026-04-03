# Zoho Custom Development Surfaces

## 1. Deluge Custom Functions

**What it is**: Server-side scripting running inside a Zoho app. The most common surface for Ismokraft automation.

**Trigger types**:
- Workflow rule (field change, record creation, date-based)
- Blueprint transition (before/after stage change in CRM or Desk)
- Button click (manual trigger from a record page)
- Schedule (time-based — use sparingly; only where event-driven is impossible)
- Zoho Flow custom action (Flow calls a Deluge function as a step)
- Webhook / REST API (external caller invokes function)

**Limits**:
- Max execution time: 60 seconds per function call
- Max script size: no hard line limit but keep under 1000 lines; extract reusable logic into shared functions
- API calls within function consume CRM API credits (see `api-limits.md`)
- Workflow throttle: 100 executions per IP per minute (Creator); CRM uses concurrency limits
- Max 6 actions per workflow rule (1 instant + 5 time-based)

**Deluge statement limits** (per execution):
| Statement type | Limit |
|---|---|
| fetch/search records | 500 per execution |
| create/update/delete | 500 per execution |
| invokeurl (external API) | 10 per execution |
| sendmail | 50 per execution |
| Loop iterations | 10,000 total |

**Where to write**: Setup → Automation → Actions → Custom Functions (CRM) | Setup → Automation → Custom Functions (Bigin) | Build tab (Creator)

---

## 2. Zoho Flow

**What it is**: Visual integration platform (iPaaS). Connects apps via trigger → steps → actions without code. Use Deluge custom actions inside Flow for logic that can't be expressed as native Flow steps.

**When to use Flow vs Deluge**:

| Use Flow | Use Deluge |
|---|---|
| Connecting two different apps | Complex conditional logic |
| Sequence of native app actions | Data transformation |
| No complex logic required | Multiple API calls in sequence |
| Error branch visibility matters | Within a single app |
| Non-technical team needs to edit | Performance-critical logic |

**Limits**:
- Enterprise plan: 750,000 tasks/month
- Webhook triggers: up to 10 active webhooks per flow
- Step timeout: 30 seconds per step
- Supported retry: 3 automatic retries on failure (configurable)

**Naming convention** (mandatory): `[Number]. [Brief purpose]` e.g. `14. Activity-to-Jira Bridge`

**Step naming** (mandatory): `[App] - [Action]` e.g. `Bigin - Create Activity`, `Jira - Create Issue`

---

## 3. Zoho Creator Custom Apps

**What it is**: Low-code application builder. Build custom forms, reports, dashboards, and approval UIs not available natively in CRM/Bigin/Books.

**When to use**:
- Internal data entry tool (e.g., supplier onboarding form)
- Custom approval workflow with complex multi-step UI
- Dashboard combining data from multiple Zoho apps
- Replacing a spreadsheet-based process with a structured app

**Key concepts**:
- **Forms**: Data entry UI + field-level Deluge logic (on load, on validate, on submit)
- **Reports**: Tabular / chart views of Creator data
- **Pages**: Dashboard-style layouts combining reports and forms
- **Workflows**: Automation triggered by form submission, field change, or schedule

**Deluge in Creator**:
- `input.*` to access form field values
- `zoho.creatorapp.*` system variables
- `report.fetch()` / `filter()` for querying Creator data
- Use `output.*` to set field values on form submit

**Creator API (v2.1)**: REST API for external systems to read/write Creator records. Requires OAuth 2.0.

**Limits**:
- 1,000 records per report API call
- 10 MB file upload limit per field
- 100 form submissions per minute

---

## 4. CRM Widget (Zoho CRM / Bigin)

**What it is**: Custom HTML/JS/CSS component embedded in a CRM record page, home page, or module list view. Uses the Widget SDK (JavaScript) to interact with CRM data.

**When to use**:
- Display enriched data from an external source alongside a CRM record
- Embed a custom pricing calculator or lookup tool
- Create a custom action button with rich UI feedback
- Show real-time channel data (e.g., Amazon listing status) on a CRM product record

**Setup**:
1. Zoho Developer Console → Create Extension → Widget
2. Write HTML + JS using Widget SDK
3. Call `ZOHO.CRM.API.*` methods to read/write CRM data
4. Deploy → install into your CRM org

**Key Widget SDK methods**:
```javascript
// Get current record data
ZOHO.CRM.API.getRecord({ Entity: "Leads", RecordID: recordId })
  .then(data => { /* use data */ });

// Update a field on the current record
ZOHO.CRM.API.updateRecord({ Entity: "Leads", APIData: { id: recordId, Field: "value" } });

// Call a Deluge function
ZOHO.CRM.FUNCTIONS.execute("function_api_name", { arguments: JSON.stringify(params) });
```

**Limits**:
- Widgets are sandboxed iframes — no direct DOM access to CRM page
- Widget API calls count against CRM API credits
- Load time should be < 2 seconds; keep external dependencies minimal

---

## 5. CRM Client Script

**What it is**: JavaScript that runs in the browser when a CRM record page loads. Unlike Widgets, Client Scripts can intercept and react to user actions on the CRM page itself (field changes, saves, etc.).

**When to use**:
- Validate a field value before save (client-side, instant feedback)
- Auto-populate a field based on another field's change
- Show/hide fields based on conditions
- Custom field-change reactions without server round-trip

**Key events**: `PageLoad`, `FieldChange`, `BeforeSave`, `AfterSave`

```javascript
// Example: auto-populate a field on field change
ZDKClient.Page.on('FieldChange', function(field) {
    if (field.apiName === 'Stage') {
        ZDKClient.Page.getField('Assigned_To').setValue('ops-team@ismokraft.com');
    }
});
```

**Limits**:
- Client Scripts only run in CRM browser UI — not in mobile app or API calls
- Cannot make server-side Zoho API calls directly; use `ZOHO.CRM.FUNCTIONS.execute()` to call a Deluge function

---

## 6. REST API (External Caller)

**What it is**: Standard Zoho REST APIs called from outside the Zoho ecosystem (e.g., Python script, n8n, custom server).

**When to use**:
- Bulk data migration / initial data load
- External system (ERP, WMS, custom tool) needs to push/pull data from Zoho
- Marketplace connector not available natively
- Scheduled data export for reporting

**Authentication**: OAuth 2.0 — always use a dedicated service account (not a named user's credentials). Store tokens securely; never in code.

**Key API versions**:
- CRM v8 (current, use this)
- Bigin v1
- Books v3
- Inventory v1
- Creator v2.1

> See `api-limits.md` for credits, rate limits, and bulk operation maximums per app.