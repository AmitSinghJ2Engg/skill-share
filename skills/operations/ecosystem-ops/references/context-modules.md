# Context Module Registry

Canonical business knowledge locations. Skills reference these — never duplicate logic.
When a module is updated: update canonical location FIRST, then propagate to consumers.

---

## Module Locations

| Module | Canonical Location | Notes |
|---|---|---|
| Product Evaluation | `ism-business-authority/refs/product-evaluation-model.md` | Scoring model, gates |
| Vendor Evaluation | `context/product-pipeline/vendor-evaluation-model.ctx.md` | Vendor scoring rubric |
| Financial Formulas | `context/system-ops/financial-formulas.ctx.md` | Margin, ROI, breakeven |
| GO FEARLESS | `context/system-ops/go-fearless.ctx.md` | Quality gate framework |
| Business Context | `ism-business-authority/refs/business-context.md` | Company config, targets |
| Resolutions | `context/system-ops/resolutions.ctx.md` | Cross-skill resolution registry |

> **Note:** Module paths prefixed with a skill name (e.g. `ism-business-authority/refs/`) are
> runtime paths in the Claude Desktop project context, not repo paths. Paths prefixed with
> `context/` are repo paths available as project knowledge files.