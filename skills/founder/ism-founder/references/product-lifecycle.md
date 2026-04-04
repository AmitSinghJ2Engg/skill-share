# Track 2 Product Lifecycle

**Used by:** PRODUCT mode
**Purpose:** 7-stage framework for taking the SaaS product from idea to launch.
**Constraint:** Solo founder + AI. No team. Self-funded from Track 1.

---

## Overview

```
IDEATE → VALIDATE → SCOPE → PLAN → BUILD → BETA → LAUNCH
```

Each stage has:
- **Entry criteria** — what must be true to start this stage
- **Activities** — what happens in this stage
- **Exit criteria** — what must be true to advance
- **Evidence base** — what data supports decisions

No stage can be skipped. If the operator attempts to jump ahead, flag what's missing.

---

## Stage 1: IDEATE

**Goal:** Generate 3–5 concrete product concepts grounded in MI-001 evidence.

**Entry criteria:** Operator has decided to explore Track 2. MI-001 report available.

**Activities:**
1. Review MI-001 differentiation opportunities (ranked 1–5)
2. Review MI-001 competitive gaps and key insights
3. For each opportunity, generate a concept that meets solo-founder constraints:
   - Buildable by one person + AI + no-code tools
   - Addressable market within ₹2,000–5,000/month price range
   - Leverages Track 1 domain expertise
   - Does not require team, enterprise sales, or heavy capital
4. Score each concept on 5 dimensions (1–5 scale):

| Dimension | What it measures |
|---|---|
| Problem clarity | Is the pain point specific, validated, and quantifiable? |
| Solo buildability | Can one person + AI build an MVP in 90 days? |
| T1 synergy | Does Track 1 experience give unfair insight or testing ground? |
| Revenue path | Is there a clear path to first 10 paying customers? |
| Defensibility | Can this become hard to replicate over time? |

5. Present scored concepts to operator for selection

**Exit criteria:** Operator selects 1 concept to validate (or asks for more ideation).

**Output:** ConceptCard[] — each with name, one-liner, target user, problem, solution,
MI-001 evidence, scores, and risks.

---

## Stage 2: VALIDATE

**Goal:** Test whether the chosen concept solves a real problem people will pay for.

**Entry criteria:** One concept selected from IDEATE.

**Activities:**
1. **Problem validation:**
   - Does Track 1 experience confirm this problem exists?
   - Search for evidence: Reddit, Twitter/X, Amazon seller forums, IndiaMART forums
   - Count: how many sellers mention this pain? How often?
   - Severity: is it a "nice to have" or "losing money without it"?

2. **Solution validation:**
   - Does the proposed solution actually address the problem?
   - Are there workarounds sellers currently use? (Spreadsheets, manual processes, existing tools)
   - What would make them switch from their workaround?

3. **Willingness-to-pay validation:**
   - Price point: ₹999, ₹1,999, ₹2,999, ₹4,999/month — which tier?
   - Value metric: per user, per order, per feature, flat?
   - Evidence: what do sellers currently pay for adjacent tools?

4. **Build feasibility validation:**
   - Can the core feature be built with: Claude API + Vercel/Supabase + React + integrations?
   - What APIs are needed? Are they publicly available?
   - What's the hardest technical risk? Can it be prototyped in 1 week?

5. **Competitive response risk:**
   - If this works, can Unicommerce/Shiprocket/Zoho copy it in 3 months?
   - What's the moat? (Data network effects, cross-functional intelligence, community)

**Exit criteria:** All 5 validations completed. Operator reviews and decides go/no-go.

**Output:** ValidationReport — structured assessment of each validation dimension
with evidence links, confidence level (HIGH/MEDIUM/LOW), and go/no-go recommendation.

---

## Stage 3: SCOPE

**Goal:** Define exactly what the MVP does and doesn't do.

**Entry criteria:** VALIDATE completed with go decision.

**Activities:**
1. **User persona:** One primary persona (be specific — not "Indian seller" but
   "solo seller on Amazon India, 50–200 orders/month, Tier-2 city, uses Shiprocket + Tally manually")

2. **Core workflow:** The ONE workflow the MVP nails. Not five features — one flow, end to end.
   Map it: trigger → steps → output → value delivered.

3. **Feature list — ruthless cut:**
   - Must-have (MVP ships without these = useless)
   - Nice-to-have (V1.1, not MVP)
   - Never (out of scope, prevents scope creep)

4. **Tech stack decision:**
   - Frontend: React + Tailwind (Claude can build this)
   - Backend: Supabase or Vercel serverless (no DevOps needed)
   - AI layer: Claude API (for intelligence features)
   - Integrations: Which APIs? (Razorpay, Shiprocket, Amazon SP-API, Zoho Books)
   - Hosting: Vercel (free tier to start)

5. **Data model:** What entities? What relationships? Keep it minimal.

6. **Pricing model:** Tier structure, value metric, free tier (yes/no).

**Exit criteria:** Scope document approved by operator. Tech stack decided. Data model defined.

**Output:** MVPScopeDoc — persona, core workflow, feature list (must/nice/never),
tech stack, data model, pricing.

---

## Stage 4: PLAN

**Goal:** Turn scope into a week-by-week build plan for solo execution.

**Entry criteria:** SCOPE completed and approved.

**Activities:**
1. Break MVP into buildable chunks (max 1 week each)
2. Sequence by dependency (auth → data model → core flow → integrations → UI polish)
3. Identify technical risks and plan spikes (1-day investigations) for each
4. Set weekly milestones with specific deliverables
5. Plan parallel activities (landing page, waitlist, content while building)
6. Define "done" — what does a shippable MVP look like?

**Build plan constraints:**
- Total build time: 60–90 days (not full-time — shared with T1)
- Each week has 1 clear deliverable
- No week depends on external approvals or third-party timelines
- Every 2 weeks: demo to 1–2 potential users for feedback

**Exit criteria:** Build plan approved. Week 1 task clear.

**Output:** BuildPlan — weekly milestones, dependencies, risk spikes, parallel activities,
definition of done.

---

## Stage 5: BUILD

**Goal:** Execute the build plan. Ship the MVP.

**Entry criteria:** PLAN completed and approved. Week 1 started.

**Activities:**
1. Execute weekly milestones
2. Track progress against plan
3. Adjust scope if behind (cut nice-to-haves, not must-haves)
4. Demo to potential users every 2 weeks
5. Capture learnings — what's harder than expected? What's easier?
6. Build landing page and waitlist in parallel

**Founder skill role during BUILD:**
- COMPASS mode: weekly check-in on build progress
- TRACK mode: milestone tracking
- ALLOCATE mode: if T1 demands threaten build schedule

**Exit criteria:** MVP functional. Core workflow works end-to-end. Ready for real users.

**Output:** Weekly status updates. Scope adjustment log. User feedback from demos.

---

## Stage 6: BETA

**Goal:** Get 5–20 real users. Validate the product works in practice.

**Entry criteria:** BUILD complete. MVP functional.

**Activities:**
1. **Recruit beta users:**
   - Start with Track 1 network (other Amazon sellers known through business)
   - Amazon seller communities, Reddit r/IndiaInvestments, Twitter/X
   - Personal outreach — not ads
   - Target: 5 users minimum, 20 maximum

2. **Onboarding:**
   - White-glove setup for each beta user
   - Document every friction point
   - Daily check-ins for first week

3. **Measure:**
   - Activation: do they complete the core workflow?
   - Retention: do they come back after day 1? Day 7?
   - Value: does it actually save them time/money? How much?
   - Willingness to pay: would they pay ₹X/month? What's the number?

4. **Iterate:**
   - Fix top 3 friction points
   - Add the most-requested nice-to-have (if easy)
   - Cut anything no one uses

**Exit criteria:** 5+ active users. Retention signal (>50% come back after week 1).
At least 3 users willing to pay.

**Output:** BetaReport — user count, activation rate, retention, NPS,
willingness-to-pay data, top feedback themes, iteration log.

---

## Stage 7: LAUNCH

**Goal:** Go live with paid plan. Get first 10 paying customers.

**Entry criteria:** BETA complete with positive signals.

**Activities:**
1. **Pricing go-live:** Set price based on beta WTP data
2. **Payment integration:** Razorpay subscription billing
3. **Landing page:** Final version with social proof from beta
4. **Launch channels:**
   - Personal network and beta users
   - Amazon seller communities
   - LinkedIn content (founder story)
   - ProductHunt India / equivalent
5. **Support setup:** Direct WhatsApp or Zoho Desk
6. **Metrics dashboard:** MRR, churn, activation, support tickets

**Exit criteria:** 10 paying customers. Positive unit economics (revenue > variable costs).

**Output:** LaunchReport — MRR, customer count, churn rate, CAC, LTV projection,
next priorities.

---

## Stage Tracking Format

Used by TRACK mode to show T2 progress:

```
TRACK 2 — SaaS Product
  Stage: {current stage}
  Started: {date}
  Status: {on-track / at-risk / blocked}

  Completed stages:
    [x] IDEATE — {date} — {concept chosen}
    [x] VALIDATE — {date} — {go/no-go}
  
  Current stage:
    [→] SCOPE — started {date}
        Next deliverable: {what}
        Blockers: {list or "none"}
  
  Upcoming:
    [ ] PLAN
    [ ] BUILD
    [ ] BETA
    [ ] LAUNCH
```
