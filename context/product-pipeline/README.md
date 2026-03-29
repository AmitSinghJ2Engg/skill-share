# Context Files — Product Pipeline

These files are loaded into Claude.ai Project Knowledge for "Product Pipeline" project.
They cover Domains 1, 1.5, 2, and 2.5. Total target: under 26 KB.

**Generate these files during Build Order Phase 1, Step 2** using Claude in a Cowork session with workspace set to the repo. See `docs/02-business-domain-map.md` → Build Order for detailed generation instructions.

| File | Format | What it contains | Est. KB |
|---|---|---|---|
| `crm-field-mappings.json` | JSON | Product_Launches field API names, Vendors module fields, Vendor_Evaluations fields, ISM Execution Logs fields, ISM Learnings fields, Bigin pipeline ID + stage IDs | ~8 KB |
| `financial-constants.json` | JSON | CBFA formula, break-even ACoS formula, target margins, GST rate, price sweet spot, price floor, weight ceiling, ACoS targets per phase | ~3 KB |
| `gate-criteria.json` | JSON | Gate 1 thresholds (CBFA min, ACoS max, compliance rules), Gate 2 thresholds (CVR/CTR paths A+B), Gate 3 checklist | ~4 KB |
| `zone-rotation.json` | JSON | Zone definitions, rotation schedule, marketplace rotation, scoring weights per zone | ~3 KB |
| `brand-rules.md` | MD | Brand name, brand story, values, price floor rule, target customer profiles, positioning guardrails, tone of voice | ~3 KB |
| `testing-config.json` | JSON | Default test budgets per mode, duration range, mode decision criteria, scaling thresholds, bid strategy defaults | ~3 KB |
| `pipeline-config.json` | JSON | Bigin pipeline IDs, stage IDs, Source to Pay pipeline ID, Slack channel IDs, ISM Learnings module ID, Vendors module ID, Confluence space key, Jira project key | ~2 KB |

See `docs/02-business-domain-map.md` → Context File Inventory for full content spec.
See `docs/03-implementation-standards.md` §4 for format rules.