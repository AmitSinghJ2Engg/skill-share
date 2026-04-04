# Claude Code Specs — Index

Routing table for reference documentation. These files are sourced from official Claude Code documentation and stored locally for offline reference.

> The spec files themselves are gitignored. Only this INDEX.md is tracked.

## Core

| File | Topic | When to Read |
|------|-------|-------------|
| `core/features-overview.md` | Feature summary and capabilities | Starting a new project, understanding what Claude Code can do |
| `core/context-window.md` | Context window management, compression | Debugging token limits, optimizing skill/plugin size |
| `core/claude-directory.md` | `.claude/` directory structure, CLAUDE.md | Setting up project instructions, configuring settings |

## Build with Claude Code

| File | Topic | When to Read |
|------|-------|-------------|
| `build-with-claude-code/skills.md` | Skill authoring spec (SKILL.md format, frontmatter) | Writing or auditing any skill |
| `build-with-claude-code/plugins.md` | Plugin packaging, marketplace, plugin.json | Building or debugging plugins |
| `build-with-claude-code/hooks-guide.md` | Event hooks (pre/post commit, file change) | Adding automation triggers |
| `build-with-claude-code/mcp.md` | MCP server configuration, .mcp.json | Connecting external tools (Zoho, Slack, etc.) |
| `build-with-claude-code/scheduled-tasks.md` | Scheduled and event-driven tasks | Creating or modifying task bundles |
| `build-with-claude-code/channels.md` | Communication channels (Slack, email) | Configuring notification routing |
| `build-with-claude-code/headless.md` | Headless/CLI mode operation | Running Claude Code in CI or automation |
| `build-with-claude-code/sub-agents.md` | Sub-agent architecture and delegation | Designing multi-agent workflows |
| `build-with-claude-code/agent-teams.md` | Agent team coordination | Complex orchestration across agents |

## Reference

| File | Topic | When to Read |
|------|-------|-------------|
| `cli-reference.md` | CLI flags and commands | Running Claude Code from terminal |
| `commands.md` | Slash commands reference | Using interactive commands |
| `tools-reference.md` | Available tools (Read, Edit, Bash, etc.) | Understanding tool capabilities |
| `env-vars.md` | Environment variables | Configuring Claude Code behavior |
| `hooks.md` | Hooks technical reference | Implementing hook scripts |
| `interactive-mode.md` | Interactive mode features | Using Claude Code interactively |
| `plugins-reference.md` | Plugin technical reference | Plugin.json schema, installation |
| `channels-reference.md` | Channels technical reference | Channel configuration details |
| `checkpointing.md` | Conversation checkpointing | Understanding state persistence |

## Admin

| File | Topic | When to Read |
|------|-------|-------------|
| `admin/monitoring-usage.md` | Usage monitoring and limits | Tracking API usage, cost management |
| `admin/plugin-marketplaces.md` | Marketplace hosting and distribution | Publishing plugins, marketplace.json |
