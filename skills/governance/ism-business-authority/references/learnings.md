# Learnings — ISM Business Authority

Read at START of every session. Apply all active entries silently.

**Memory sync**: Check `memory_user_edits` for BA-* entries not in this file.

## Template
### BA-[P|F|D|I|B][NNN]: [Short title]
- **Class**: Pattern | Fix | Design | Integration | Business
- **Date**: YYYY-MM-DD
- **Context**: What prompted this
- **Learning**: The rule / pattern / insight
- **Apply when**: Trigger condition

## Learning Class Definitions

| Class | Prefix | Covers |
|---|---|---|
| Pattern | `-P` | Reusable business logic or decision pattern |
| Fix | `-F` | Wrong assumption corrected by real data |
| Design | `-D` | How to present business info or reviews |
| Integration | `-I` | How this skill connects to other skills |
| Business | `-B` | Market insight, category result, margin data, channel learning |

## Active Learnings

### BA-I001: CRM = strategic data, Bigin = execution
- **Class**: Integration
- **Date**: 2026-03-10
- **Context**: Zoho MCP probe confirmed both connectors have full CRUD
- **Learning**: Artifacts write to CRM (product data, test verdicts, go/no-go decisions). CRM Blueprint handles approval gates. Bigin receives data via Flow handoff for execution. This means business rules and gates should be designed as CRM Blueprint stages, not Bigin pipeline logic.
- **Apply when**: Making any recommendation about where business logic should live in Zoho.

### BA-B001: Community skill repos not useful for Ismokraft
- **Class**: Business
- **Date**: 2026-03-10
- **Context**: Assessed a GitHub skill repo (13 Composio/Rube Zoho skills + generic tools)
- **Learning**: 0 skills adopted. Ismokraft's custom skill ecosystem is more advanced for our use case. Generic tools are either Claude Code-only, wrong architecture (Rube intermediary vs direct MCP), or already superseded by our skills. Don't waste time evaluating community skills unless they're platform-specific.
- **Apply when**: Amit considers adopting external tools or skills.

## Changelog
| Date | Entry | Action |
|---|---|---|
| 2026-03-08 | — | Skill created |
| 2026-03-10 | BA-I001, BA-B001 | Zoho MCP probe + community skills assessment |
