# Error Handling Patterns & Recipes

## Core Principle: Visible Failure

Every Ismokraft Zoho function must fail visibly. A function that silently fails — producing no output, no alert, no record of what went wrong — is worse than a function that throws an error. Silent failures become invisible technical debt.

**The four failure modes we design for every function:**
1. **Input invalid or missing** — validate before logic runs; fail fast with clear message
2. **Record not found** — null-check every fetch; alert before using the result
3. **External API call fails** — try-catch every `invokeurl`; never assume success
4. **Downstream write fails** — check response; alert if the record wasn't created/updated

---

## Severity Levels in Practice

### Level 1 — INFO (diagnostic log only)
```deluge
// Use: Non-critical diagnostic. Only keep during development/debugging.
// Remove or comment out before production unless specifically needed for audit.
info "ISM-FN-001: Processing record " + recordId + " | Stage: " + stage;
```

### Level 2 — WARNING (alert + continue)
```deluge
// Use: Unexpected situation that doesn't block the process, but someone should know.
// Example: Optional enrichment lookup returned no result — not blocking, but notable.
enrichResult = zoho.crm.searchRecords("Contacts", "(Email:equals:" + email + ")");
if (enrichResult.isEmpty()) {
    zoho.cliq.postToChannel("ops-alerts",
        "ISM-FN-001 ⚠️ | No matching contact for email: " + email + " | Deal: " + dealId +
        " | Process continues.");
    // continue with the rest of the function
}
```

### Level 3 — ERROR (alert + halt function)
```deluge
// Use: Critical required step failed. Process cannot complete. Halt immediately.
record = zoho.crm.getRecordById("Deals", dealId);
if (record == null || record.isEmpty()) {
    zoho.cliq.postToChannel("ops-alerts",
        "ISM-FN-001 🔴 | Deal not found: " + dealId +
        " | Function halted. Manual review required.");
    return;  // halt — do not run any more logic
}
```

### Level 4 — CRITICAL (alert + Desk ticket)
```deluge
// Use: Financial data affected, data integrity at risk, or customer-facing impact.
try {
    invoiceResp = zoho.books.createRecord("invoices", booksOrgId, invoiceData);
    invoiceId = invoiceResp.get("invoice").get("invoice_id");
    if (invoiceId == null) {
        throw "Invoice ID not returned: " + invoiceResp.toString();
    }
} catch (e) {
    // Level 4: financial record creation failed — escalate immediately
    alertMsg = "ISM-FN-003 🚨 CRITICAL | Invoice creation failed\n" +
               "Deal ID: " + dealId + "\n" +
               "Error: " + e.getMessage() + "\n" +
               "Action required: Manually create invoice in Books.";
    
    zoho.cliq.postToChannel("ops-alerts", alertMsg);
    
    ticketMap = Map();
    ticketMap.put("subject", "CRITICAL: Invoice creation failed — ISM-FN-003");
    ticketMap.put("description", alertMsg);
    ticketMap.put("priority", "High");
    ticketMap.put("departmentId", "ops-dept-id");  // replace with actual Desk dept ID
    zoho.desk.createRecord("tickets", deskOrgId, ticketMap);
    
    return;
}
```

---

## Shared Alert Utility Function

Create this as a shared reusable function (`ISM-FN-000`) that all other functions call:

```deluge
// ISM-FN-000: sendAlert
// Purpose: Standardised alert sender. Call from any function.
// Inputs: fnRef (string), level (string), message (string), recordId (string)

void sendAlert(string fnRef, string level, string message, string recordId) {
    
    levelIcon = "";
    if (level.equalsIgnoreCase("warning")) { levelIcon = "⚠️"; }
    if (level.equalsIgnoreCase("error"))   { levelIcon = "🔴"; }
    if (level.equalsIgnoreCase("critical")) { levelIcon = "🚨 CRITICAL"; }
    
    fullMsg = fnRef + " " + levelIcon + " | " + message +
              if(recordId != null && !recordId.isEmpty(), " | Record: " + recordId, "") +
              " | " + zoho.currenttime.toString("yyyy-MM-dd HH:mm");
    
    zoho.cliq.postToChannel("ops-alerts", fullMsg);
    
    // Escalate to Desk for critical
    if (level.equalsIgnoreCase("critical")) {
        ticketMap = Map();
        ticketMap.put("subject", fnRef + " CRITICAL failure — manual action required");
        ticketMap.put("description", fullMsg);
        ticketMap.put("priority", "High");
        zoho.desk.createRecord("tickets", deskOrgId, ticketMap);
    }
}

// Usage in other functions:
callfunction sendAlert(fnRef:"ISM-FN-003", level:"error", message:"Deal not found", recordId:dealId);
```

---

## Standard Try-Catch Wrapper

Use this pattern for every `invokeurl` and every cross-app Zoho integration task that writes data:

```deluge
// Standard wrapper: external API call with full error context
try {
    response = invokeurl [
        url: targetUrl
        type: POST
        parameters: payload.toString()
        headers: headers
        connection: "ism_conn_name"
    ];
    
    // Validate response structure — not just that it returned something
    if (response == null) {
        throw "Null response from API";
    }
    if (response.containsKey("error") || response.containsKey("errorCode")) {
        throw "API error: " + response.toString();
    }
    if (!response.containsKey("expectedKey")) {
        throw "Unexpected response structure: " + response.toString();
    }
    
    resultId = response.get("expectedKey");
    
} catch (e) {
    errDetail = "ISM-FN-XXX | URL: " + targetUrl +
                " | Error: " + e.getMessage() +
                " | Line: " + e.getLineNumber() +
                " | Payload: " + payload.toString().subString(0, 200);  // truncate large payloads
    
    zoho.cliq.postToChannel("ops-alerts", errDetail);
    return;  // halt
}
```

---

## Input Validation Template

Put this at the top of every function before any logic:

```deluge
// --- INPUT VALIDATION ---
errors = List();

if (dealId == null || dealId.isEmpty()) { errors.add("dealId is missing"); }
if (amount == null || amount <= 0)      { errors.add("amount must be positive"); }
if (stage == null || stage.isEmpty())   { errors.add("stage is missing"); }

if (!errors.isEmpty()) {
    zoho.cliq.postToChannel("ops-alerts",
        "ISM-FN-XXX 🔴 | Invalid inputs: " + errors.toString() + " | Trigger record: " + recordId);
    return;
}
// --- END VALIDATION — proceed with confidence inputs are valid ---
```

---

## Idempotency Guard

Prevent a function from processing the same record twice (e.g., if a workflow fires twice):

```deluge
// Check a "processed" flag field — set it after successful completion
processedFlag = record.get("ISM_FN001_Processed__c");  // custom checkbox/text field
if (processedFlag == "true" || processedFlag == true) {
    info "ISM-FN-001: Already processed, skipping: " + recordId;
    return;
}

// ... run function logic ...

// At the end, mark as processed
updateMap = Map();
updateMap.put("ISM_FN001_Processed__c", "true");
updateMap.put("ISM_FN001_ProcessedAt__c", zoho.currenttime.toString());
zoho.crm.updateRecord("Deals", dealId, updateMap);
```

---

## Function Execution Log Pattern

For critical functions, maintain a lightweight execution log as a Zoho CRM or Creator record:

```deluge
// Log execution result to a Creator app (ISM-CR-LOG or similar)
logEntry = Map();
logEntry.put("Function_Ref", "ISM-FN-003");
logEntry.put("Record_ID", dealId);
logEntry.put("Status", "Success");  // or "Failed"
logEntry.put("Message", "Invoice " + invoiceId + " created");
logEntry.put("Executed_At", zoho.currenttime.toString());

zoho.creator.createRecord("ismokraft", "zoho-automation-log", "Add_Log_Entry", logEntry);
// Replace app_name and form_link_name with actual Creator app details
```