# Context Files — Launch & Ops (Project B)

These files are loaded into Claude.ai Project Knowledge for Project B ("Launch & Ops").
They cover Domains 3 and 4. Total target: under 14 KB.

**Generate these files during Build Order step 8** using Claude in Project C (System Ops).

| File | Format | What it contains | Est. KB |
|---|---|---|---|
| `listing-standards.json` | JSON | Amazon India listing format rules (char limits, keyword density, prohibited terms), Shopify format rules, SEO guidelines | ~4 KB |
| `compliance-requirements.json` | JSON | BIS, FSSAI, MRP labeling, CoO, Brand Registry requirements per product category | ~5 KB |
| `launch-benchmarks.json` | JSON | ACoS targets by phase, BSR targets by category, review velocity benchmarks, CVR benchmarks | ~3 KB |
| `analytics-config.json` | JSON | Zoho Analytics workspace IDs, view names, KPI definitions for Domain 4 reporting | ~2 KB |

See `docs/02-business-domain-map.md` → Context File Inventory for full content spec.
See `docs/03-implementation-standards.md` §4 for format rules.