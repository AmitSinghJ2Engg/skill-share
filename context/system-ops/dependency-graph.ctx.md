# Dependency Graph
# ikraft-skill-governance — references/dependency-graph.md
# Version: 2.0.0-rebuilt
# Rebuilt: 2026-03-15 from workspace ground truth (26 active skills)
# Previous version 1.0.0-baseline had 24 ghost nodes + 11 missing nodes.

---

## Graph Metadata

```
rebuild_date: 2026-03-15
previous_version: 1.0.0-baseline
total_skills: 26
total_edges: 42
orphan_skills: [capital-planner, margin-calculator, revenue-ops]
circular_dependencies: []
note: >
  Rebuilt from upstream/downstream declarations in each SKILL.md.
  capital-planner, margin-calculator, revenue-ops lack formal dep declarations.
  ikraft-skill-governance is root governance — no upstream by design.
```

---

## Adjacency List

### Governance Domain

```yaml
ikraft-skill-governance:
  upstream: []
  downstream: [ism-skill-factory, ecosystem-ops]
  status: inferred

ism-skill-factory:
  upstream: [ikraft-skill-governance]
  downstream: [ecosystem-ops, ism-scrum-master]
  status: inferred

ism-business-authority:
  upstream: [ism-gap-auditor]
  downstream: [zoho-developer, zoho-solutions-architect]
  status: inferred

ism-scrum-master:
  upstream: [ism-skill-factory, ism-gap-auditor, ads-ops, content-writer, vendor-ops, webapp-testing, zoho-developer, zoho-solutions-architect, artifacts-builder-v2, automation-designer, ecosystem-ops]
  downstream: [ecosystem-ops]
  status: inferred

ism-sop-builder:
  upstream: [zoho-solutions-architect]
  downstream: [ecosystem-ops]
  status: inferred

ecosystem-ops:
  upstream: [artifacts-builder-v2, ism-skill-factory, ism-sop-builder, zoho-solutions-architect, ism-learning-engine, ism-scrum-master]
  downstream: []
  status: inferred

ism-learning-engine:
  upstream: []
  downstream: [ecosystem-ops, ism-scrum-master, ism-skill-factory]
  status: inferred

ism-gap-auditor:
  upstream: [ism-business-authority]
  downstream: [automation-designer, ecosystem-ops, ism-scrum-master, ism-sop-builder, zoho-developer, zoho-solutions-architect]
  status: inferred

skill-commander:
  upstream: [ism-skill-factory]
  downstream: [margin-calculator, product-lab]
  status: inferred

mcp-guide:
  upstream: [zoho-solutions-architect]
  downstream: []
  status: inferred
```

### Product Domain

```yaml
product-intelligence:
  upstream: []
  downstream: [product-lab, product-pipeline, vendor-ops]
  status: inferred

product-lab:
  upstream: [product-intelligence]
  downstream: [product-pipeline, supplier-intelligence, vendor-ops]
  status: inferred

product-pipeline:
  upstream: [product-intelligence, product-lab]
  downstream: [content-writer, vendor-ops]
  status: inferred
```

### Supply Domain

```yaml
supplier-intelligence:
  upstream: [product-lab, product-pipeline]
  downstream: [vendor-ops]
  status: inferred

vendor-ops:
  upstream: [product-lab, product-pipeline, supplier-intelligence]
  downstream: [ism-scrum-master]
  status: inferred
```

### Costing Domain

```yaml
margin-calculator:
  upstream: []
  downstream: []
  status: inferred
  note: orphan — called directly, no formal deps declared

capital-planner:
  upstream: []
  downstream: []
  status: inferred
  note: orphan — no formal deps; missing governance contract + exception capture
```

### Marketing Domain

```yaml
ads-ops:
  upstream: [margin-calculator, okr-kpi-governance, revenue-ops]
  downstream: [ism-scrum-master]
  status: inferred

content-writer:
  upstream: [product-intelligence, product-pipeline]
  downstream: [ism-scrum-master]
  status: inferred
```

### Analytics Domain

```yaml
okr-kpi-governance:
  upstream: []
  downstream: [ads-ops, ism-learning-engine, revenue-ops]
  status: inferred

revenue-ops:
  upstream: []
  downstream: []
  status: inferred
  note: orphan — needs governance contract + maturity
```

### Engineering Domain

```yaml
zoho-solutions-architect:
  upstream: [ism-business-authority, ism-gap-auditor]
  downstream: [ecosystem-ops, ism-scrum-master, zoho-developer, ism-sop-builder, mcp-guide]
  status: inferred

zoho-developer:
  upstream: [ism-business-authority, zoho-solutions-architect]
  downstream: [ism-scrum-master]
  status: inferred

webapp-testing:
  upstream: []
  downstream: [ism-scrum-master]
  status: inferred
```

### Platform Domain

```yaml
artifacts-builder-v2:
  upstream: []
  downstream: [ecosystem-ops, ism-scrum-master]
  status: inferred
```

### Operations Domain

```yaml
automation-designer:
  upstream: [ism-gap-auditor]
  downstream: [ism-scrum-master, zoho-developer]
  status: inferred
```

---

No circular dependencies detected. DFS traversal confirmed acyclic.
