# Data Crawling & Handling Rules

**Version:** 1.0
**Scope:** All skills that crawl, scrape, or ingest external data (product-discover, product-market-intelligence, supplier-intelligence, and any future data-ingestion skill).
**Relation to 01-system-constraints.md:** That document covers governance-level integrity rules (CRM is truth, audit trail, no silent overrides). This document covers operational rules — how individual data records are handled at the field level during crawling and data acquisition.

7 non-negotiable rules. Apply to every data record produced by a crawling skill.

## Rule 1 — NEVER INVENT DATA
Every field value must be read from a source or it does not exist. If not visible on the page → null. No estimation, no interpolation.

## Rule 2 — NULL IS CORRECT
Missing BSR, review count, price → null. Downstream skills handle nulls. Do not substitute zero. Do not write "approximately" and invent a number.

## Rule 3 — SOURCE AND CONFIDENCE
Every record must carry: source_platform, visited_url (if available), crawl_timestamp, runtime_used, confidence. Confidence levels: HIGH = direct observation, MEDIUM = derived, LOW = inferred, UNKNOWN = no data.

## Rule 4 — BLOCKED SOURCES DECLARED
Amazon block → crawl_status = captcha_blocked or robots_blocked. Do not silently retry with a different method. Declare the block. Escalate to Mode B (user paste) explicitly.

## Rule 5 — USER PASTE TRUSTED
Mode B data originates from the user's own browser session. Treat as verified. Record runtime_used = user_paste.

## Rule 6 — PARTIAL RECORDS VALID
A record with 6 null fields is valid — return it with null_fields[] declared. Do not drop thin records silently. Downstream normalisation decides.

## Rule 7 — INFERENCE LABELLED
If Claude estimates a value (last resort only) → confidence = LOW, source = "claude_inference". Never omit this label.
