# Test Campaign Workflow (Domain 2.5)

Orchestrates the full Domain 2.5 market testing workflow: FBA dispatch tracking, test listing preparation, PPC campaign planning, performance analysis, cost comparison, and Gate 2 scale decision.

This is the critical path between "sample at FBA" and "commit to bulk order." The task is an orchestrator -- it invokes skills by mode and handles flow control. It does NOT implement campaign logic, margin calculations, or Seller Central actions directly.

**Trigger:** Event-based — activated when a product has been dispatched to Amazon FBA and a SampleConfirmation record exists in CRM with status PASS or WAIVED.
**Skills:** FO-SAMPLE, AO-TEST, MC-COMPARISON, PM-MONITOR
