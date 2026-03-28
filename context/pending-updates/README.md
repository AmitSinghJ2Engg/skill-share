# Pending Context Updates

This directory receives output from the `ism-daily-learning` scheduled task.

**Flow:**
1. `ism-daily-learning` task runs nightly at 11:00 PM IST
2. Reads ISM_Learnings CRM module (CustomModule17) for records from last 24 hours
3. Synthesizes learnings and writes updated context file content here as `[task-name]-[YYYY-MM-DD].md`
4. Operator reviews the file, manually copies updated values to the appropriate context file in `product-pipeline/` or `launch-ops/`
5. Operator commits both the updated context file and removes the pending file

**Rule:** Files in this directory are never auto-committed. Human review required before any context file is updated.

See `docs/03-implementation-standards.md` §5 (Scheduled Task Standards) for the no-auto-commit rule.