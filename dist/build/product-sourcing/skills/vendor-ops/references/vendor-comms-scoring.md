# Vendor Communication Scoring — Dropship Partner Evaluation

**Source:** `Vendor_Communication_Scoring_Rules.xlsx` (TEMPLATE sheet)
**Purpose:** Score dropship/RTS vendor partners on 8 operational categories during the communication/negotiation phase. This model evaluates vendor OPERATIONS capability, not product quality or pricing competitiveness (those are in `vendor-eval-model.md`).
**When to use:** After initial vendor contact, before placing first order. Applies to dropship partners and RTS vendors — NOT factory/private-label vendors (use `vendor-eval-model.md` Tier 2/3 for those).
**Total weight:** 1.00 (all weights sum to 1.00)
**Score range:** 1–5 per question, weighted. Max weighted total = 5.00.

---

## Scoring Formula

```
Weighted_Score_per_question = Score(1-5) × Weight
Total_Score = SUM(all Weighted_Scores)
Max_possible = 5.00
```

Grade interpretation (not defined in sheet — proposed):
- 4.0–5.0: Strong partner — proceed
- 3.0–3.9: Acceptable — negotiate weak areas
- 2.0–2.9: Risky — proceed only if no alternatives
- Below 2.0: Reject

---

## Category 1: Product, Services & Catalog (5 questions, total weight 0.23)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 1 | Product Availability | Do you have ready-to-ship stock? | Ready Stock / On-Demand Production | 5 if ready stock; +3 if on-demand; 0 if none | 0.05 |
| 2 | Product Specifications & Variations | Do you provide product specs (weight, dimensions, images)? | Full specs + images/videos / Partial specs / No media | 5=Full, 3=Partial, 1=No | 0.03 |
| 3 | Marketing Materials (Images & Videos) | Do you provide any marketing materials? | Provided / Not Provided | 5=Provided, 1=Not | 0.05 |
| 4 | Inventory Updates Frequency | How do you share stock availability, and how frequently? | Daily / Weekly / Real-time API / Manual checks | 5=API, 3=Email, 1=Manual | 0.05 |
| 5 | Handling of Discontinued Products | How are discontinued items or stock shortages handled? | Prior notification + substitutes / No notification policy | 5=Substitutes, 1=No policy | 0.05 |

**Strategic notes:**
- Faster dropship capability = better (Q1)
- Avoid vendors with no inventory tracking (Q4)
- Substitutions prevent lost sales (Q5)

---

## Category 2: Order Processing (2 questions, total weight 0.08)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 6 | Order Transfer Process | How do we transfer orders to you? | Manual (email/WhatsApp) / Automated / API Integration | 5=API, 2=Manual | 0.03 |
| 7 | Dispatch Time | What is your order processing time and cut-off? | Same-day dispatch (if labels by 12 PM) / 24-48 hours | 5=Same-day, 3=24h | 0.05 |

**Strategic notes:**
- Automate to reduce errors (Q6)
- Align with customer delivery expectations (Q7)

---

## Category 3: Payment & Fees (2 questions, total weight 0.10)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 8 | Payment Terms | What are your payment terms? | Prepaid (Upfront) / Credit (Net-X Days) / Partial Advance / Pay-per-order | 5=Net-30, 3=Pay-per-order, 1=Upfront | 0.05 |
| 9 | Additional / Hidden Fees | Are there additional fees (packaging, restocking)? | Packaging Fees, Service Charges, Hidden Costs (e.g., ₹20/unit + GST) | 5=Transparent, 1=Hidden | 0.05 |

**Strategic notes:**
- Negotiate terms that ease cash flow (Q8)
- Penalize vendors with unclear pricing (Q9)

---

## Category 4: Shipping & Logistics (4 questions, total weight 0.16)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 10 | Shipping Label Responsibility | Who needs to provide shipping labels? | Vendor / Dropshipper | — | 0.05 |
| 11 | Shipping Policy | (no question text) | Standard / Expedited / Not Defined | — | 0.03 |
| 12 | Tracking & Order Updates | How are tracking details shared with customers? | Automated / Manual / Not provided | 5=Automated, 2=Manual | 0.03 |
| 13 | Shipping Liability | Who bears liability for lost/damaged shipments? | Vendor shares liability / Courier only | 5=Shared, 1=Courier | 0.05 |

**Strategic notes:**
- Automated tracking improves CX (Q12)
- Negotiate shared liability clauses (Q13)

---

## Category 5: Returns & Refunds (4 questions, total weight 0.20)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 14 | Refund Policy / Liability | Do you refund for vendor errors (wrong/damaged items)? | Full refund / Partial refund / No refunds | 5=Full refund, 1=No | 0.05 |
| 15 | Replacement Policy | (no question text) | Allowed / Not Allowed | — | 0.05 |
| 16 | Responsibility for Damaged/Lost Shipments | (no question text) | Vendor / Courier / Dropshipper | — | 0.05 |
| 17 | RTO Handling | Who handles Return-to-Origin (RTO) orders, and at what cost? | Resold by Dropshipper / Sent Back / Handled by Vendor / Vendor repackages (fee) | 5=Vendor absorbs cost, 1=No support | 0.05 |

**Strategic notes:**
- Never partner with vendors refusing accountability (Q14)
- Avoid vendors charging twice for repackaging (Q17)

---

## Category 6: Tech & Integration (2 questions, total weight 0.08)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 18 | Shopify Integration | Do you integrate with Shopify or automate order processing? | Shopify API / Zapier / Custom integration / None | 5=API, 3=Zapier, 1=None | 0.05 |
| 19 | Automated Order Processing | (no question text) | Yes / No | — | 0.03 |

**Strategic notes:**
- Prioritize tech-savvy vendors (Q18)

---

## Category 7: Support & Communication (2 questions, total weight 0.10)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 20 | Support Availability / Channels | How do we escalate order issues? | 24/7 / Business Hours / Dedicated manager / Email Only / Chat / No defined process | 5=24/7 chat, 1=No process | 0.05 |
| 21 | Escalation Process | (no question text) | Defined / Not Defined | — | 0.05 |

**Strategic notes:**
- Ensure timely resolution of issues (Q20)

---

## Category 8: Branding (1 question, total weight 0.05)

| # | Key Aspect | Question | Possible Responses | Scoring Rule | Weight |
|---|---|---|---|---|---|
| 22 | Custom Packaging | Can we use branded labels/packaging with your contact details? | Yes (no fee) / Yes (fee) / No | 5=Yes (free), 3=Yes (fee), 1=No | 0.05 |

**Strategic notes:**
- White-labeling strengthens brand identity (Q22)

---

## Relationship to Other Models

| Model | Covers | When |
|---|---|---|
| **This model** (vendor-comms-scoring) | Operational capability of dropship/RTS vendors | During communication, before first order |
| `vendor-eval-model.md` Tier 1 | Binary quick-screen (5 checks, all must pass) | First contact with ANY vendor type |
| `vendor-eval-model.md` Tier 2 | Quote & terms assessment (7 criteria, weighted) | After receiving quote, before sample |
| `vendor-eval-model.md` Tier 3 | Sample & capability (5 criteria, weighted) | After receiving sample |

**Usage in vendor-scorer skill:**
- For dropship/RTS vendors: Tier 1 quick-screen → this model (comms scoring) → decision
- For factory/PL vendors: Tier 1 → Tier 2 → Tier 3 → decision
- The two models cover different vendor types and evaluation moments

