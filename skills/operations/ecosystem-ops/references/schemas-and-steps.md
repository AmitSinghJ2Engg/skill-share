# ecosystem-ops — Offloaded Schemas & Execution Steps
# Extracted from SKILL.md on 2026-03-15 to reduce SKILL.md to <500 lines.
# This file is the authoritative source for these sections.

---

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "function": {
      "type": "string",
      "enum": ["skill_health","integrity_check","claims_audit","drive_export","confluence_publish","confluence_organize","artifact_check_readiness","artifact_promote","artifact_retire","artifact_version_bump","artifact_registry_query","artifact_go_fearless_check"]
    },
    "target": {
      "type": "string",
      "description": "Skill name, artifact name, Drive path, or Confluence page ID depending on function"
    },
    "integrity_check_type": {
      "type": "string",
      "enum": ["A", "B", "C", "D", "E", "F", "all"],
      "description": "Required when function=integrity_check"
    },
    "publish_path": {
      "type": "string",
      "enum": ["A", "B", "C"],
      "description": "Required when function=confluence_publish"
    },
    "content": {
      "type": "string",
      "description": "Markdown content to publish (Path A) or file reference (Path B)"
    },
    "confluence_parent_page_id": {
      "type": "string",
      "description": "Parent page ID for new Confluence pages"
    },
    "export_type": {
      "type": "string",
      "enum": ["full", "incremental", "selective"],
      "description": "Required when function=drive_export"
    }
  },
  "required": ["function"]
}
```

---


## Output Schema

```json
{
  "type": "object",
  "properties": {
    "function": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["complete", "partial", "failed", "needs_confirmation"]
    },
    "findings": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Issues found during health check or claims audit"
    },
    "actions_taken": {
      "type": "array",
      "items": { "type": "string" }
    },
    "confluence_url": {
      "type": ["string", "null"],
      "description": "URL of published or updated Confluence page"
    },
    "drive_path": {
      "type": ["string", "null"],
      "description": "Drive path of exported file"
    },
    "artifact_name": { "type": ["string", "null"] },
    "previous_state": { "type": ["string", "null"] },
    "new_state": { "type": ["string", "null"] },
    "version": { "type": ["string", "null"] },
    "go_fearless_result": {
      "type": ["object", "null"],
      "properties": {
        "score": { "type": "integer", "minimum": 0, "maximum": 9 },
        "verdict": { "type": "string", "enum": ["Ready","Conditional","Not ready"] },
        "gaps": { "type": "array", "items": { "type": "string" } }
      }
    },
    "slack_notified": { "type": "boolean" },
    "registry_updated": { "type": "boolean" },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["function", "status", "actions_taken", "timestamp"]
}
```

---


