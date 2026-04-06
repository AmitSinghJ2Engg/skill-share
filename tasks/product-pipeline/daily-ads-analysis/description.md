# Daily Ads Analysis (Domain 2.5 / 4)

Daily analysis of active PPC test campaigns. Pulls today's metrics, compares against yesterday and cumulative trends, updates Campaign_Plans actuals in CRM, flags anomalies, and posts a daily digest to Slack.

Runs for any product with an active Campaign_Plans record (Plan_Status = Active) in stages 5-6 (Paid Testing, Scale Decision).

**Trigger:** Scheduled daily at 10:00 AM IST after Seller Central data refreshes.
**Skills:** AO-TEST (analyze), AO-LIVE (health_check), PM-MONITOR, ZO-WRITE, SM
