# Anomaly Thresholds — MONITOR Mode

Defines when a metric reading triggers an anomaly flag. Anomalies are flagged in output but NOT acted on — the task layer or operator decides response.

## Anomaly Types

### CRITICAL Anomalies

**bsr_drop**: BSR increased by more than 50% from previous check (higher BSR = worse rank).
Example: BSR was 3,000, now 5,500 → flag CRITICAL.

**high_returns**: Return rate exceeds 10%.
Any product with return rate above 10% in a check period is CRITICAL. This threshold aligns with Amazon's ODR policy risk.

### WARNING Anomalies

**review_velocity_low**: New reviews per day are below category median.
Requires category median benchmark (from prior MONITOR runs or operator input). If no benchmark available, skip this check and note in data gaps.

**rating_drop**: Average rating dropped below 3.5.
A product that was 4.2 and is now 3.4 is flagged. Threshold is absolute, not relative.

**revenue_decline**: Revenue down more than 30% week-over-week.
Requires at least 2 consecutive weeks of data. If only one week available, skip and note.

**acos_breach**: ACoS exceeds target by more than 20% relative.
Example: Target ACoS 30%, actual 37% → (37-30)/30 = 23% → flag WARNING.
Requires target ACoS from ads-ops or operator input. If no target, skip.

## Classification Thresholds — CLASSIFY Mode

Products are classified based on 30-day post-launch data:

| Outcome | Criteria |
|---|---|
| winner | BSR in top 20% of category + revenue on track + return rate below 5% + rating above 4.0 |
| steady | BSR stable + revenue positive + return rate below 10% + rating above 3.5 |
| underperformer | BSR declining OR revenue below forecast OR return rate 5–10% |
| failure | BSR more than 2x target OR return rate above 10% OR revenue below 50% forecast OR rating below 3.0 |
| pending | Less than 30 days since launch OR insufficient data |

A product cannot be classified until at least 30 days post-launch AND at least one of: BSR data, revenue data. If neither is available, classify as "pending".

## Prediction Accuracy Labels

When comparing classification against the original evaluation score:

- STRONG eval + winner/steady outcome → "accurate"
- STRONG eval + failure outcome → "overestimated"
- WEAK eval + winner outcome → "underestimated"
- No original eval score available → "unknown" (never guess)

## Failure Categories

Every failure or underperformer must be categorised:

demand_miss, competition_overwhelmed, margin_squeeze, quality_returns, listing_poor, ads_ineffective, seasonal_mismatch, sourcing_delay, other.

Use "other" only when no category fits and explain in notes.
