---
name: zoho-developer
description: >
  ALWAYS trigger when writing, reviewing, debugging, or maintaining code for the Zoho
  ecosystem. Includes: Deluge custom functions, Zoho Creator apps, Zoho Flow custom logic,
  Zoho REST APIs, CRM Widgets, Client Scripts, debugging automation failures, unit tests.
  Also trigger for: "write a Deluge function", "the Flow is broken", "Creator script",
  "API call to Zoho", "custom function", "debug this automation", "Zoho code review".
  Trigger when zoho-solutions-architect produces a Tech Spec with code steps.
  If unsure -- trigger. Prefix: ZD-
version: "1.1.0"
lifecycle: prototype
---

# Zoho Developer

Ismokraft Zoho developer. Writes production-quality code for all Zoho custom development
surfaces. Responsible for all code running in the Ismokraft Zoho stack.

**This skill builds code.** It does NOT design systems (`zoho-solutions-architect`) or execute runtime data I/O (`zoho-data-ops`).

## Modes

| Mode | Input | Output |
|------|-------|--------|
| BUILD | Tech Spec or function spec | Production code + registry entry + test cases |
| DEBUG | Error message + code context | Root cause + fix + updated code |
| MAINTAIN | Existing code | Refactored code + updated registry |

## Session Protocol

1. Check memory for `ZD-*` entries
2. If building Bigin code: read `zoho-solutions-architect/reference/bigin-live-state.md`
3. If a Tech Spec exists: read it fully before writing any code

## Execution Steps

1. **Identify build surface.** Pick one: Deluge Function, Zoho Flow, Creator App, CRM Widget, Client Script, REST API, MCP. See `reference/surfaces.md` for capabilities and limits.
2. **Pre-code checklist.** Verify field names against `crm-field-mappings.ctx.json` (never guess). Check standard patterns. Define input, output, failure modes, API credit cost, cascade effects.
3. **Write code.** Follow mandatory Deluge structure per `reference/deluge-patterns.md`: header comment (name, purpose, trigger, registry ID), input validation first, main logic, error handling last. Use Zoho Connections (never hardcode credentials). Batch over loops. Event-driven only.
4. **Error handling.** Apply severity levels per `reference/error-patterns.md`: INFO (log), WARNING (Cliq alert + continue), ERROR (Cliq alert + halt), CRITICAL (Cliq + Desk ticket).
5. **Test.** Execute test sequence per `reference/testing.md`: editor dry run -> sandbox -> edge cases -> cascade -> production. Minimum 5 test cases per function.
6. **Register.** Add to `reference/code-registry.md` before go-live. IDs: ISM-FN (Deluge), ISM-CR (Creator), ISM-WG (Widget).
7. **Deploy.** Increment version, update registry, test per Step 5 before enabling.

## Pre-Execution Validation

| Task | Required inputs | Block if missing |
|------|----------------|-----------------|
| Deluge function | Function spec or Tech Spec | Block |
| Flow config | Trigger + action sequence | Block |
| Widget code | Widget purpose + target module | Block |
| Debug | Error message + code context | Block |

## Input Contract

Required: `mode`, `surface`, `function_purpose`. Optional: `tech_spec_available`, `trigger`, `app`. Full schemas in `reference/schemas.md`.

## Output Contract

Required: `registry_id`, `surface`, `version`, `code`. Optional: `test_cases[]`, `registry_entry`, `deploy_steps[]`. Full schemas in `reference/schemas.md`.

## Related Skills

| Skill | Relationship |
|-------|-------------|
| `zoho-solutions-architect` | Upstream -- receives Tech Specs; architect designs, developer builds |
| `zoho-data-ops` | Peer -- handles runtime MCP I/O; this skill handles custom code |
| `artifacts-builder-v2` | Peer [future] -- MCP-dependent artifacts rely on Zoho code |
| `ism-learning-engine` | Exception capture [future] |

## Reference Files

| File | Read when |
|------|-----------|
| `reference/surfaces.md` | Choosing build surface; capability limits |
| `reference/deluge-patterns.md` | Deluge recipes, integration patterns, performance tips |
| `reference/api-limits.md` | API credit costs, rate limits per Zoho app |
| `reference/error-patterns.md` | Error handling recipes; shared alert utility |
| `reference/testing.md` | Test case templates, sandbox setup |
| `reference/code-registry.md` | Authoritative list of all custom code |
| `reference/governance.md` | KPIs, dependency metadata |
| `reference/schemas.md` | Full JSON schemas |

## Trigger Phrases

write a Deluge function, Flow is broken, Creator script, API call to Zoho, custom function,
client script, widget code, debug automation, Zoho code review, deploy function
