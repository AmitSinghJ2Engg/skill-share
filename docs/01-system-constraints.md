# System Constraints and Platform Limits

**Version:** 1.0
**Date:** 2026-03-27
**Purpose:** Every new chat session reads this first. It defines the hard boundaries that all design decisions must respect.

---

## 1. Claude Plugin Constraints

### Size Limit
- **Total uncompressed plugin content must stay under ~70 KB.**
- This is an undocumented client-side limit discovered through binary search testing (2026-03-27).
- Anthropic's own "engineering" plugin: 10 skills, 35 KB total, average 3.5 KB per skill.
- Ismokraft's original 14-skill plugin: 314 KB total — failed validation silently.
- Verified: 3 real skills at 69 KB = PASS. 4 real skills at 76 KB = FAIL.

### Skill Size Target
- Each SKILL.md body: **under 5 KB** (aim for 3 KB).
- Each skill directory (SKILL.md + supporting files): keep total reasonable against 70 KB plugin limit.
- Business logic, thresholds, formulas, picklists, environment-dependent config go in project context files, not SKILL.md.
- SKILL.md contains: purpose, modes, I/O contracts, execution steps, trigger phrases. Detailed methodology goes in supporting files (reference/).

### SKILL.md Frontmatter (Claude official spec)

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name. If omitted, uses directory name. Lowercase + hyphens, max 64 chars. |
| `description` | Recommended | What the skill does and when to use it. Claude uses this to decide when to invoke. Max 250 chars shown. |
| `disable-model-invocation` | No | `true` = user-only trigger (manual /skill-name). Default: false. |
| `user-invocable` | No | `false` = model-only, hidden from / menu. Default: true. |
| `allowed-tools` | No | Tools Claude can use without permission when skill is active. |
| `model` | No | Model override for this skill. |
| `effort` | No | Effort level override (low/medium/high/max). |
| `context` | No | `fork` = run in isolated subagent context. |
| `agent` | No | Subagent type when context: fork (Explore, Plan, general-purpose, or custom). |
| `paths` | No | Glob patterns limiting when skill activates automatically. |

Our custom fields (`version`, `lifecycle`) are ignored by Claude but kept for internal tracking.

String substitutions available in SKILL.md content: `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`.

### Plugin Structure
- `.claude-plugin/plugin.json` manifest with `name`, `description`, `version`, optional `author`.
- `skills/{skill-name}/SKILL.md` with YAML frontmatter.
- `skills/{skill-name}/reference/`, `scripts/`, etc. -- supporting files packaged into plugin.
- All content counts toward 70 KB limit.
- Package as zip renamed to `.plugin` for Cowork upload.
- Test locally with `claude --plugin-dir ./plugin-directory`.

### Marketplace Distribution
- GitHub repo can serve as a plugin marketplace via `.claude-plugin/marketplace.json`.
- Users install with `/plugin install plugin-name@owner/repo`.
- Repo: `AmitSinghJ2Engg/skill-share`.

### Splitting Strategy
- A domain with more than 4-5 skills needs multiple plugins.
- Split by business phase/workflow, not by skill type. Aligns with Cowork task orchestration.
- Each plugin should be independently useful -- no cross-plugin dependencies.
- Portable: things that change stay in project context. JSON format for structured data, MD for narrative.

---

## 2. Claude Artifact Constraints

### Sandbox Isolation (ISM-F005)
- Artifacts within the same Claude.ai conversation share `window.storage`, but artifacts in different conversations or projects are isolated.
- Hub and spoke artifacts in the same session CAN share data via `window.storage` keys.
- For cross-session or cross-project data transfer: **clipboard bridge** (export JSON → import in other artifact) : <<Depending on data lifecycle requirement, Zoho CRM persistence via mcp, for record keeping, triggered by human in loop via button clicks>>.
- This means a Hub artifact and a Spoke artifact use clipboard import/export <<for short life data or zoho CRM persistence for long term data>>.

### Network Restrictions (ISM-P004)
- Artifacts cannot make HTTP requests to external APIs (Zoho, Slack, etc.).
- Artifacts can call the Anthropic API for AI analysis (using the API key configured in the artifact).
- For Zoho/Slack writes: artifact builds a payload → ~~user copies → pastes into MCP tool or Zoho directly.~~ <<claude use Zoho CRM mcp to make right api call>>
- Future: MCP integration may provide a direct path, but today it's manual. <<MCP integration is available>>

### Download Restriction (ISM-F003)
- `URL.createObjectURL` + `a.click()` does not work in the Claude.ai sandbox.
- Export mechanism: clipboard copy with a "Copy" button. Show JSON inline if needed.
- Never rely on file download as the primary export path.

### Size and Performance
- Artifacts are single JSX files. No multi-file bundling.
- Keep under 2,000 lines per artifact for maintainability. <<Divide views depending upon business logical operational flow.>>
- Use Tailwind CSS core utilities only (no compiler available).
- Available libraries: React 18, recharts, lucide-react, shadcn/ui, d3, lodash, papaparse, sheetjs.

### Storage
- `window.storage` API: `get(key)`, `set(key, value)`, `delete(key)`, `list(prefix)`.
- Values are strings (JSON.stringify for objects).
- No localStorage or sessionStorage — these are blocked in Claude.ai.
- Key namespace: `ism:` prefix for all Ismokraft data.

---

## 3. Cowork / Claude Desktop Constraints

### Session Isolation
- Each Cowork session runs in a fresh Linux VM.
- Session filesystem resets between tasks.
- Only the workspace folder (user-selected) persists on the user's computer.
- <<files requiring versioning should also be copied to git directory in respective places. path - "C:\Users\amits\ClaudeMain\Claude-Cowork\Git-Skill-Share\skill-share" like skill files, task instructions, project instructions, project context, knowledge. So team members can pull and start using the system>>

### MCP Connections Available
- Zoho Bigin (pipeline lifecycle — read/write deals<</ Bigin Pipeline records>>, fields, notes)
- Zoho CRM (<<default modules, >> custom modules — read/write <<example:>> Product_Launches, contacts)
- Zoho Books (invoices, items, purchase orders — read/write)
- Zoho Inventory (items, packages, sales orders — read/write)
- Zoho Analytics (workspaces, views, SQL queries — read)
- Zoho Desk (tickets, contacts — read/write)
- Slack (channels, messages, search, canvas — read/write)
- Jira + Confluence (issues, pages, comments, search — read/write)
- Google Drive (search, fetch — read)
- Razorpay (payments, settlements, refunds — read)
- Canva (designs, exports — read/write)
- Microsoft Clarity (analytics — read)

### Scheduled Tasks
- Cowork supports `create_scheduled_task` for recurring jobs.
- Tasks run in isolated sessions with their own context.
- Task instructions must be self-contained (no dependency on conversation state).

---

## 4. Project Context Constraints

### What Goes in Project Context (Claude.ai Project Knowledge)
- Business rules, thresholds, formulas that change over time.
- CRM field mappings and stage definitions.
- Financial constants (margins, fees, tax rates).
- Pipeline stage definitions and gate criteria.
- Zone rotation schedules.
- Vendor evaluation criteria and weights.
- Brand rules.
- Any data that a skill or artifact needs but should NOT be hardcoded into it.

### What Does NOT Go in Project Context
- Code templates (those go in skills or are derived per artifact).
- Conversation-specific state.
- Data that belongs in CRM (product records, vendor records, evaluations <<and other business models>>).

### Size Awareness
- Claude.ai Project Knowledge has a per-project context window impact.
- Every file added to project knowledge is loaded into every conversation in that project.
- Keep total project knowledge lean: aim for under 50 KB of text content.
- Large reference files (xlsx, jsx artifacts) count toward context. Be selective.

---

## 5. Git Repository Constraints

### Location
`C:\Users\amits\ClaudeMain\Claude-Cowork\Git-Skill-Share\skill-share`

### Structure
- `skills/` — all skill source files, organized by package (`skills/{package}/{name}/SKILL.md` + optional `reference/`). Each package aligns with a plugin.
- `context/` — runtime config files deployed to Claude.ai project knowledge
- `dist/` — built `.plugin` files (compiled artifacts)
- `docs/` — architecture docs, standards, decisions
- `artifacts/` — built JSX artifact files
- `tools/` — build scripts and plugin registry

### Workflow
- <<User CAN>> manually commits. <<On user demand, >> git push from Claude sessions.
- Session produces files → human reviews → claude copies to repo → commits(human/claude - human choice).
- Build scripts (build-plugin.py, build-skill.py) are generic tools,<< so team members can build skill and plugins suitable for claude installation using raw git commited files>>, not hardcoded to Ismokraft.

---

## 6. Data Integrity Rules (Non-Negotiable)

1. **No invented data.** Example - Never fabricate prices, BSR, reviews, dimensions, or market statistics.
2. **Source everything.** Every data point cites its source.
3. **Timestamp all outputs.** Every record includes `created_date` or `timestamp`.
4. **Confidence scoring.** Rate as HIGH / MEDIUM / LOW based on data completeness.
5. **CRM is truth.** If CRM data conflicts with session data, CRM wins unless operator explicitly overrides.
6. **No silent overrides.** If a gate threshold is not met, state it. Do not proceed silently.
7. **Audit trail.** Every CRM write logs what changed, who triggered it, and why. <<This goes in Zoho CRM custom module - "ISM Execution Logs". If new fields are needed claude creates it via mcp.>>

---

## 7. Separation of Concerns

| Layer | Contains | Does NOT Contain |
|---|---|---|
| **Skills** (SKILL.md) | Purpose, modes, input/output contracts, trigger phrases, execution steps | Business thresholds, formulas, CRM field names, picklists |
| **Plugins** (.plugin) | Bundled skills for a domain. Manifest metadata. | Reference data, knowledge files, large context |
| **Artifacts** (.jsx) | UI components, user interactions, display logic, Anthropic API calls | Business rules, scoring weights, gate criteria (pull from storage/context) |
| **Project Context** | Business rules, thresholds, CRM mappings, financial constants, brand rules | Code, UI templates, conversation state |
| **CRM** (Zoho) | Persistent product/vendor records, pipeline state, evaluation scores | UI logic, skill execution state |
| **Git Repo** | Source of truth for skill/plugin source code, build scripts, architecture docs | Runtime data, CRM records, session artifacts |

---

## 8. Zoho Stack Configuration

| App | Module/Entity | Role                                                     |
|---|---|----------------------------------------------------------|
| Zoho CRM | Product_Launches (custom module, 100+ fields) | System of record for all product <<laucnh related>> data |
| Zoho Bigin | Product Launch Factory pipeline (ID: 677677000003294514) | Process execution — 11 stages + Rejected + Published     |
| Zoho Books | Items, Invoices | Financial record-keeping (future)                        |
| Zoho Inventory | Items, Packages | Stock management (future)                                |
| Zoho Desk | Tickets | Customer support (future)                                |
| Zoho Analytics | Custom views | Reporting (future)                                       |

### Pipeline Stages (Bigin) — Canonical Stage Names

These are the authoritative Bigin API stage names. Other documents describe activities within these stages but must not rename them. See `02-business-domain-map.md` for detailed activity descriptions per stage.

**Gate structure:** 3 formal gates (human approval, investment decisions) + stage exit checklists (automated, enforced by artifacts). See `docs/decision-log.md` DL-001 for rationale.

| # | Stage | Gate / Checklist Before Exit |
|---|---|---|
| 1 | Idea Intake | — |
| 2 | Market Research | **Gate 1:** CBFA ≥ ₹150, Break-even ACoS ≤ 50%, Compliance feasibility ≤ MEDIUM risk |
| 3 | Test Sourcing | Checklist: ≥ 2 suppliers identified, lead time ≤ 45 days |
| 4 | Test Listing | Checklist: Vendor Grade ≥ C, sample approved, COGS confirmed |
| 5 | Paid Testing | Checklist: Title + bullets + description complete, main image + 6 lifestyle images ready |
| 6 | Scale Decision | **Gate 2:** Path A (≥10 orders, CVR ≥5%) or Path B (≥500 impressions, CTR ≥0.3%), keyword-level bottom-line validation |
| 7 | Sourcing Model Selection | Checklist: Sourcing model selected (PL/RTS/DS/POD), unit economics validated at scale |
| 8 | Final Listing | Checklist: Final listing live and indexed, inventory at FBA warehouse |
| 9 | Compliance | **Gate 3:** All certifications obtained |
| 10 | Platform Setup | Checklist: Seller Central configured, tax/shipping/returns set |
| 11 | Product Live | — |
| — | Rejected | Closed-Lost (any gate failure or kill decision) |
| — | Published | Closed-Won (graduated from pipeline) |

---

## 9. Financial Constants

**Transitional source.** These hardcoded values are the operating reality until `context/product-pipeline/financial-constants.json` is generated and deployed to Project Knowledge. Once that file exists, it is the **authoritative source** for all financial constants. Skills and artifacts must read from project context, never from this table.

| Constant | Value | Notes |
|---|---|---|
| Target Gross Margin | ≥ 44% | |
| Target Net Margin | ≥ 15% | |
| GST Rate | 12% | Wooden products |
| Price Sweet Spot | ₹800 – ₹2,000 | |
| Price Floor | ₹1,000 | Brand rule |
| Target ACoS (test phase) | ≤ 40% | |
| Target ACoS (scale phase) | ≤ 30% | |
| Weight Ceiling | ≤ 2.0 kg | FBA optimization |
| CBFA Formula | Price - Cost - (Price × 20%) - ₹60 | Gate 1 |
| Break-even ACoS | (CBFA / Price) × 100 | Gate 1 |

---

## 10. Known Gaps (Unfilled)

These items exist as placeholders. Do not assume values for them.

- Zoho Flow IDs for all 6 registered flows (automation-registry.md has ⚠ FILL markers)
- Slack channel IDs for #ism-launch-alerts, #ism-launch-reports
- Jira project key for Flow 14 (Activity-to-Jira bridge)
- Bigin custom field API names (need `GET /bigin/v1/settings/fields?module=Deals` to confirm)
- CRM Product_Launches field API names (need `GET /crm/v7/settings/fields?module=Product_Launches`)
- Zoho Books, Inventory, Desk — not yet integrated into any skill or artifact
