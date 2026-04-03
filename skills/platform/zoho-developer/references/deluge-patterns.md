# Deluge Patterns & Recipes

## Table of Contents
- [Data Types & Variables](#data-types)
- [Record Operations](#record-ops)
- [Cross-App Integration Tasks](#integration-tasks)
- [External API Calls](#external-api)
- [String & Data Manipulation](#data-manipulation)
- [Date & Time](#dates)
- [Performance Patterns](#performance)
- [Common Pitfalls](#pitfalls)

---

## Data Types & Variables {#data-types}

```deluge
// String
name = "Ismokraft";

// Number
price = 499.99;

// Boolean
isActive = true;

// List
channels = List();
channels.add("Amazon");
channels.add("Shopify");

// Map
orderData = Map();
orderData.put("sku", "ISM-001");
orderData.put("qty", 5);

// Type checking before use
if (value.getDataType() == "string") { ... }
if (value == null || value.isEmpty()) { ... }  // null + empty string check
if (value.isBlank()) { ... }                   // null + empty + whitespace check
```

**Comparison — use these, not ==**
```deluge
// String comparison (case-insensitive)
if (status.equalsIgnoreCase("Active")) { ... }

// String contains
if (tags.contains("priority")) { ... }

// Numeric comparison — == is fine for numbers
if (qty > 0) { ... }
```

---

## Record Operations {#record-ops}

### Fetch a single record by ID
```deluge
record = zoho.crm.getRecordById("Deals", dealId);
if (record == null || record.isEmpty()) {
    zoho.cliq.postToChannel("ops-alerts", "ISM-FN-XXX: Deal not found: " + dealId);
    return;
}
fieldValue = record.get("Field_API_Name");
```

### Search records (returns a list)
```deluge
// Search by field value
results = zoho.crm.searchRecords("Deals", "(Stage:equals:Proposal)");
// results is a List of Maps

for each deal in results {
    id = deal.get("id");
    name = deal.get("Deal_Name");
}
```

### COQL query (SQL-style, preferred for complex queries)
```deluge
query = "SELECT id, Deal_Name, Amount FROM Deals WHERE Stage = 'Proposal' LIMIT 50";
response = invokeurl [
    url: "https://www.zohoapis.com/crm/v8/coql"
    type: POST
    parameters: {"select_query": query}.toString()
    connection: "ism_crm_conn"
];
records = response.get("data");
```

### Create a record
```deluge
newRecord = Map();
newRecord.put("Subject", "Review sourcing proposal");
newRecord.put("Due_Date", zoho.currentdate.addDay(3).toString("yyyy-MM-dd"));
newRecord.put("Status", "Open");
newRecord.put("What_Id", dealId);   // link to parent record

createResp = zoho.crm.createRecord("Tasks", newRecord);
newId = createResp.get("id");
if (newId == null) {
    zoho.cliq.postToChannel("ops-alerts", "ISM-FN-XXX: Task creation failed: " + createResp.toString());
}
```

### Update a record
```deluge
updateMap = Map();
updateMap.put("Stage", "Negotiation");
updateMap.put("Custom_Field_API_Name__c", "value");

updateResp = zoho.crm.updateRecord("Deals", dealId, updateMap);
```

### Bulk update (up to 100 records — use this over looping)
```deluge
updateList = List();
for each record in recordsToUpdate {
    updateItem = Map();
    updateItem.put("id", record.get("id"));
    updateItem.put("Status", "Processed");
    updateList.add(updateItem);
}
bulkResp = zoho.crm.bulkUpdate("Deals", updateList);
```

### Bigin-specific operations
```deluge
// Bigin uses the same Deluge tasks but with bigin module names
record = zoho.bigin.getRecordById("Contacts", contactId);
zoho.bigin.updateRecord("Deals", dealId, updateMap);
zoho.bigin.createRecord("Activities", activityMap);
```

---

## Cross-App Integration Tasks {#integration-tasks}

### CRM ↔ Bigin
```deluge
// From Bigin function: push data to CRM
crmRecord = Map();
crmRecord.put("Lead_Source", "Bigin Pipeline");
crmRecord.put("Custom_Field", value);
zoho.crm.updateRecord("Leads", crmLeadId, crmRecord);
```

### Bigin / CRM → Books
```deluge
// Create an invoice in Books
invoiceData = Map();
invoiceData.put("customer_id", booksCustomerId);
invoiceData.put("date", zoho.currentdate.toString("yyyy-MM-dd"));

lineItem = Map();
lineItem.put("item_id", booksItemId);
lineItem.put("quantity", 1);
lineItem.put("rate", amount);

lineItems = List();
lineItems.add(lineItem);
invoiceData.put("line_items", lineItems);

response = zoho.books.createRecord("invoices", booksOrgId, invoiceData);
invoiceId = response.get("invoice").get("invoice_id");
```

### CRM / Bigin → Inventory
```deluge
// Create a Sales Order in Inventory
soData = Map();
soData.put("customer_id", inventoryCustomerId);
soData.put("salesorder_number", "SO-" + dealId);

// Add line items
lineItem = Map();
lineItem.put("item_id", inventoryItemId);
lineItem.put("quantity", qty);
lineItem.put("rate", unitPrice);
soData.put("line_items", List(lineItem));

response = zoho.inventory.createRecord("salesorders", orgId, soData);
soId = response.get("salesorder").get("salesorder_id");
```

### Send Cliq notification
```deluge
// Simple channel message
zoho.cliq.postToChannel("ops-alerts", "ISM-FN-001: Order #" + orderId + " processed successfully.");

// With formatting
msg = "*ISM-FN-001 Alert*\n" +
      "Order: " + orderId + "\n" +
      "Status: " + status + "\n" +
      "Time: " + zoho.currenttime.toString();
zoho.cliq.postToChannel("ops-alerts", msg);
```

### Create a Desk ticket (for Level 4 / critical errors)
```deluge
ticketMap = Map();
ticketMap.put("subject", "Critical: ISM-FN-001 failed — financial data at risk");
ticketMap.put("description", "Function: ISM-FN-001\nError: " + errorMsg + "\nRecord ID: " + recordId);
ticketMap.put("priority", "High");
ticketMap.put("departmentId", deskDepartmentId);
zoho.desk.createRecord("tickets", deskOrgId, ticketMap);
```

---

## External API Calls {#external-api}

```deluge
// GET request
headers = Map();
headers.put("Content-Type", "application/json");

try {
    response = invokeurl [
        url: "https://api.external.com/v1/resource/" + resourceId
        type: GET
        headers: headers
        connection: "ism_external_conn"
    ];
    
    // Always validate response structure
    if (response == null || !response.containsKey("data")) {
        throw "Unexpected API response: " + response.toString();
    }
    
    data = response.get("data");
    
} catch (e) {
    zoho.cliq.postToChannel("ops-alerts", 
        "ISM-FN-XXX | External API failure | " + e.getMessage());
    return;
}
```

```deluge
// POST request with JSON body
payload = Map();
payload.put("key1", "value1");
payload.put("key2", 42);

try {
    response = invokeurl [
        url: "https://api.external.com/v1/endpoint"
        type: POST
        parameters: payload.toString()
        headers: headers
        connection: "ism_external_conn"
    ];
} catch (e) {
    // error handling
}
```

**Retry pattern for transient failures**
```deluge
maxRetries = 3;
retryCount = 0;
success = false;

while (retryCount < maxRetries && !success) {
    try {
        response = invokeurl [ url: apiUrl type: POST parameters: payload.toString() connection: "ism_conn" ];
        if (response.containsKey("id")) {
            success = true;
        } else {
            retryCount = retryCount + 1;
        }
    } catch (e) {
        retryCount = retryCount + 1;
        if (retryCount == maxRetries) {
            zoho.cliq.postToChannel("ops-alerts", "ISM-FN-XXX: All retries exhausted. " + e.getMessage());
            return;
        }
    }
}
```

---

## String & Data Manipulation {#data-manipulation}

```deluge
// String operations
upper = name.toUpperCase();
lower = name.toLowerCase();
trimmed = name.trim();
replaced = name.replaceAll("old", "new");
contains = name.contains("keyword");      // boolean
startsWith = name.startsWith("ISM-");     // boolean
length = name.length();
substring = name.subString(0, 5);        // chars 0-4

// Number formatting
formatted = amount.toDecimalFormat("#,##0.00");  // "1,234.56"
rounded = amount.round(2);

// Map to JSON string
jsonStr = myMap.toString();   // Deluge Map.toString() produces JSON-compatible output

// Parse a JSON string response into a Map
parsedMap = jsonStr.toMap();

// List operations
myList.add(item);
myList.remove(item);
size = myList.size();
contains = myList.contains(item);
sorted = myList.sort();

// Convert a comma-separated string to a list
csvString = "Amazon,Shopify,Flipkart";
channelList = csvString.toList(",");
```

---

## Date & Time {#dates}

```deluge
// Current date and time
today = zoho.currentdate;                        // date type
now = zoho.currenttime;                          // datetime type

// Date formatting
dateStr = today.toString("yyyy-MM-dd");          // "2026-03-07"
isoStr = now.toString("yyyy-MM-dd'T'HH:mm:ss"); // ISO 8601

// Date arithmetic
tomorrow = today.addDay(1);
nextWeek = today.addDay(7);
lastMonth = today.addMonth(-1);

// Date comparison
isLate = dueDate < zoho.currentdate;             // boolean

// Parse a date string into a date type
parsedDate = "2026-03-07".toDate("yyyy-MM-dd");
```

---

## Performance Patterns {#performance}

**1. Avoid N+1 queries — bulk fetch, then process**
```deluge
// WRONG: fetch inside loop = N API calls
for each id in idList {
    record = zoho.crm.getRecordById("Deals", id);  // 1 call per iteration
}

// RIGHT: search by IDs, then process in memory
// Use COQL with IN clause, or bulk fetch if API supports it
idCsv = idList.toString(",");  // "id1,id2,id3"
results = zoho.crm.searchRecords("Deals", "(id:in:" + idCsv + ")");
```

**2. Guard conditions — prevent re-processing**
```deluge
// Prevent a function from running twice on the same record
alreadyProcessed = record.get("ISM_Processed_Flag__c");
if (alreadyProcessed == "true") {
    info "ISM-FN-001: Record already processed, skipping: " + recordId;
    return;
}
```

**3. Use aggregate tasks over looping**
```deluge
// Instead of loop + sum, use aggregate:
totalRevenue = zoho.crm.getRelatedRecords("Deals", accountId)
                   .toList("Amount").sum();
```

**4. Limit list sizes in loops**
```deluge
// Add a safety limit when processing potentially large lists
MAX_RECORDS = 200;
count = 0;
for each record in results {
    if (count >= MAX_RECORDS) {
        zoho.cliq.postToChannel("ops-alerts", "ISM-FN-XXX: Hit 200-record limit. Review batch design.");
        break;
    }
    // process record
    count = count + 1;
}
```

**5. Info statements for debugging — remove before production**
```deluge
info "ISM-FN-001 debug: dealId = " + dealId;       // visible in function execution log
// Remove info statements before production deploy — they add latency
```

---

## Common Pitfalls {#pitfalls}

| Pitfall | Problem | Fix |
|---|---|---|
| `record.get("FieldName")` returns null | Field doesn't exist, is empty, or API name is wrong | Always null-check; verify exact API name (not display name) in field settings |
| Workflow fires but function doesn't run | Workflow criteria not met, or function not saved as active | Check criteria match; check function status |
| `invokeurl` returns HTML error page | API endpoint wrong, auth failed, or SSL issue | Check connection credentials; test endpoint with Postman first |
| Loop hits 10,000 iteration limit | Recursive or unexpectedly large dataset | Add `break` after MAX_RECORDS; review data size assumption |
| `zoho.crm.createRecord` fails silently | API validation rejected the record; required fields missing | Check response map for error key; log full response on failure |
| Function triggers itself | Workflow fires on field it updates | Add a "processed" flag guard condition |
| Date field comparison fails | Date stored as string vs date type mismatch | Parse to date type before comparing: `value.toDate("yyyy-MM-dd")` |
| API credits depleted | Too many calls in function; called too frequently | Audit credit usage in CRM API Dashboard; use bulk operations |