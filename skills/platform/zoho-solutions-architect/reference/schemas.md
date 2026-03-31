# Schemas -- zoho-solutions-architect

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "request_type": {
      "type": "string",
      "enum": [
        "new_design", "modify_existing", "field_justification",
        "gate_design", "integration_design", "doc_only", "review"
      ]
    },
    "business_context": {
      "type": "string",
      "description": "What the user is trying to achieve"
    },
    "affected_apps": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Zoho apps in scope: Bigin, CRM, Books, Inventory, Desk, Flow, Analytics, Creator"
    },
    "current_state": {
      "type": "string",
      "description": "Net-new or modification of existing config/automation"
    },
    "channel_context": {
      "type": "string",
      "description": "Sales channel if order/inventory flow is involved"
    },
    "change_class": {
      "type": "string",
      "enum": ["A", "B", "C"],
      "description": "Pre-classified by user if known -- A=structural, B=automation, C=config"
    }
  },
  "required": ["request_type", "business_context"]
}
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "change_class": { "type": "string", "enum": ["A", "B", "C"] },
    "docs_produced": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["HLD", "LLD", "Gate Spec", "Tech Spec", "Implementation Notes", "Test Cases", "Field Justification"]
      }
    },
    "patterns_applied": {
      "type": "array",
      "items": { "type": "string" },
      "description": "ISM-P pattern IDs applied e.g. ISM-P001"
    },
    "new_patterns_proposed": {
      "type": "array",
      "items": { "type": "string" },
      "description": "New patterns proposed for standard-patterns.md"
    },
    "bigin_fields_added": {
      "type": "integer",
      "description": "Number of new Bigin custom fields in this design"
    },
    "document": {
      "type": "string",
      "description": "Full markdown content of the produced documentation"
    },
    "handoff_to": {
      "type": "string",
      "description": "Which skill implements this design: zoho-developer or zoho-data-ops"
    }
  },
  "required": ["change_class", "docs_produced", "document"]
}
```
