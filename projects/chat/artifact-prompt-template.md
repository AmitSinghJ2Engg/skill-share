# Artifact Prompt Template

Standard prompt template for generating or updating Claude.ai artifacts.
Each Chat project's `artifact-prompt.md` customizes this for its domain.

---

## Prompt

You are building a single-page React artifact for Ismokraft's {MODULE_NAME} module.

### Format Requirements

- **TSX** with `export default function App()`
- React 18 functional components with hooks
- Tailwind CSS core utilities only (no compiler)
- Lucide React icons for UI elements
- Recharts for any charts/graphs
- Under 2,000 lines total

### File Header

```tsx
// {Artifact Name} v{MAJOR}.{MINOR}
// Ismokraft — {Domain}
// Last updated: {YYYY-MM-DD}
```

### Storage

- Use `window.storage` API: `get(key)`, `set(key, value)`, `delete(key)`, `list(prefix)`
- All keys use `ism:` namespace prefix
- Use versioned storage keys (e.g., `ism4_p` pattern)
- Values are strings — use `JSON.stringify` for objects
- NO `localStorage` or `sessionStorage` (blocked in Claude.ai sandbox)

### Config Layer

- No hardcoded business values (thresholds, formulas, CRM fields)
- Read config from `window.storage` keys (`ism:config:{module}`)
- Provide sensible fallback defaults when config keys are missing
- Config is seeded by project context or user input

### Data Exchange

- **Primary:** CRM-first via MCP — artifact approval buttons generate structured payloads
- **Clipboard bridge (required fallback):**
  - "Export JSON" button — copies full state payload to clipboard
  - "Import JSON" button — prompts for JSON paste, restores state
- No `URL.createObjectURL` + `a.click()` for downloads
- No HTTP requests to external APIs

### UI Patterns

- Toast notifications for user feedback (save, export, import, errors)
- Auto-dismiss toasts after 4 seconds
- Copy-to-clipboard with sandbox fallback
- Disable action buttons until preconditions met (stage checklists)

### State Persistence

- Save full component state to `window.storage` on meaningful actions
- Restore state on mount from `window.storage`
- State survives page refreshes within a Claude conversation

### ISM Execution Logs

- Every CRM write triggered by the artifact must produce a corresponding ISM_ExecutionLogs entry
- Entry includes: field changed, old value, new value, who triggered, ISO timestamp, domain/stage context

### Prohibited

- No `localStorage` / `sessionStorage`
- No external HTTP requests (except Anthropic API if explicitly needed)
- No file downloads via `URL.createObjectURL`
- No hardcoded business thresholds, formulas, or CRM field names
- No multi-file bundling

### Structure

```tsx
import { useState, useEffect, useCallback } from "react"

// -- Constants (UI only: colors, labels) --
// -- Storage Helpers (storageLoad/storageSave/storageDelete) --
// -- Config Loader (read ism:config:{module} with fallbacks) --
// -- Types (TypeScript interfaces for state and data) --
// -- Components (modular sub-components) --
// -- Main App --
export default function App() {
  // State, effects, handlers, render
}
```

### Domain-Specific Instructions

{DOMAIN_INSTRUCTIONS — customize per Chat project}

### Artifact Name and Version

Generate: `{ARTIFACT_NAME}-v{VERSION}.artifact.tsx`
