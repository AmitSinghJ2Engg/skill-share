# Testing Guide — Zoho Custom Code

## Test Environments

| Environment | Use for | Risk |
|---|---|---|
| **Deluge Script Editor** ("Save & Execute") | Quick syntax + logic check; pass a known record ID | Low — runs against live data, but you choose which record |
| **CRM Developer Edition** (free Zoho org) | Isolated testing with no live data risk; good for new functions | None — fully isolated |
| **Production with test record** | Integration testing with real Flows and connected apps | Medium — test record may trigger real downstream effects |
| **Production with guard condition** | Gradual rollout using a flag field to limit which records run | Low — tightly controlled |

**Recommended workflow**: Developer Edition → test record in production → production guard rollout

---

## Standard Test Case Template

```markdown
## Test: [Function / Flow name] — [Test case name]

**Registry ID**: ISM-FN-XXX
**Test type**: Happy path / Edge case / Error case
**Environment**: Developer Edition / Test record

### Setup
- [ ] Record created: [describe what record to create]
- [ ] Field values set: [list the specific field values]
- [ ] Connected app state: [e.g., Books account has customer X]

### Action
[Exactly what to do to trigger the function]
e.g., "Change Stage field on Deal ISM-TEST-001 to 'Won'"

### Expected result
- [ ] [Primary outcome]: e.g., "Invoice #INV-001 appears in Books within 30 seconds"
- [ ] [Secondary outcome]: e.g., "Deal field 'Books_Invoice_ID' is populated"
- [ ] [No side effect]: e.g., "No duplicate invoice created on re-trigger"

### Pass criteria
[Specific, measurable, binary — not subjective]

### Fail procedure
[If it fails, what to check first: execution log, Flow history, Books error, etc.]
```

---

## Minimum Test Cases per Function

Every function must have these five tests documented before production deploy:

### 1. Happy Path
Standard trigger with valid, complete input data. Verify all outputs.

### 2. Null / Missing Required Input
Trigger the function with a key required field empty. Verify:
- Function exits without error
- Cliq alert is sent to ops-alerts
- No partial updates to any record

### 3. Record Not Found
Pass an ID that doesn't exist (use a deleted record ID or "99999999"). Verify:
- Null-check catches it
- Alert fired
- Function halts cleanly

### 4. External API Failure (if invokeurl used)
Simulate by temporarily passing an invalid API endpoint. Verify:
- Try-catch fires
- Alert fires with error detail
- Function halts; no partial write

### 5. Duplicate Trigger / Idempotency
Trigger the same function twice on the same record within 60 seconds. Verify:
- Second trigger is caught by idempotency guard
- No duplicate records created in downstream apps
- No duplicate alerts

---

## Testing in the Deluge Editor

**How to run**:
1. Open the function: Setup → Automation → Actions → Custom Functions → [function name]
2. Click **Save & Execute Script**
3. In the dialog, enter a **test record ID** (use a real but non-critical record)
4. Click **Execute**
5. View output in the execution log below the editor

**Debug trick**: Use `info` statements liberally during testing. They appear in the execution log.
```deluge
info "DEBUG: dealId = " + dealId;
info "DEBUG: record = " + record.toString();
info "DEBUG: response = " + response.toString();
```
Remove `info` statements before production deploy.

---

## Testing Zoho Flows

1. Open the Flow in Zoho Flow editor
2. Click **Test** (top right) — this lets you simulate a trigger with sample data
3. Review each step's execution result in the test run history
4. Check error branch execution — deliberately fail a step to verify the error branch fires
5. Verify the Cliq alert is sent on failure

**Flow execution history**: Zoho Flow → [Flow name] → History tab — shows every run with step-level status

---

## Checking API Credit Usage

After running any test that involves API calls:
1. Setup → Developer Space → APIs → API Dashboard
2. Check **Credits by Application/Functions** — see which function consumed what
3. If a function consumed unexpectedly high credits, review for N+1 query patterns

---

## Regression Testing

When modifying an existing function:
1. Re-run all existing test cases — not just the new behavior
2. Specifically test: idempotency still works, error handling still fires, downstream cascade unchanged
3. Run with production data (guard condition) for one day before full rollout
4. Monitor execution log for first 10 production runs after deploy