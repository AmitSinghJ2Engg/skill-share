# Daily Product Discovery Pipeline

Runs the Ismokraft daily product discovery pipeline: determines today's zone, generates keywords, crawls marketplaces, scores candidates, captures learning signals, and posts a summary to Slack.

This is the primary feed for the pipeline's Idea Intake stage. The task is an orchestrator -- it invokes skills by mode and handles flow control, error recovery, and telemetry. It does NOT implement skill logic directly.

**Schedule:** Daily, 7:00 AM IST
**Skills:** KI-GENERATE, PD-BATCH, ZO-WRITE, PS-SCORE, PS-REPORT
