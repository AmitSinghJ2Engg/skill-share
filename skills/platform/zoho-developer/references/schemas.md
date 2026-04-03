# Schemas & Execution Steps -- zoho-developer

Extracted from SKILL.md to reduce size. This file is the authoritative source for these sections.

---

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "enum": ["build", "debug", "maintain"],
      "description": "Which developer mode is being invoked"
    },
    "surface": {
      "type": "string",
      "enum": [
        "deluge_function", "zoho_flow", "creator_app",
        "crm_widget", "client_script", "rest_api", "mcp"
      ],
      "description": "Which Zoho build surface is targeted"
    },
    "tech_spec_available": {
      "type": "boolean",
      "description": "True if a Tech Spec from zoho-solutions-architect is available"
    },
    "function_purpose": {
      "type": "string",
      "description": "One sentence: what this function must do"
    },
    "trigger": {
      "type": "string",
      "description": "What fires this function or flow"
    },
    "app": {
      "type": "string",
      "description": "Which Zoho app this runs in"
    }
  },
  "required": ["mode", "surface", "function_purpose"]
}
```

---

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "registry_id": {
      "type": "string",
      "description": "ISM-FN-NNN, ISM-CR-NNN, or ISM-WG-NNN"
    },
    "surface": { "type": "string" },
    "version": { "type": "string" },
    "code": {
      "type": "string",
      "description": "Full production-ready code following mandatory structure"
    },
    "test_cases": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "test": { "type": "string" },
          "expected": { "type": "string" }
        }
      }
    },
    "registry_entry": {
      "type": "string",
      "description": "Formatted row to add to code-registry.md"
    },
    "deploy_steps": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["registry_id", "surface", "version", "code"]
}
```
