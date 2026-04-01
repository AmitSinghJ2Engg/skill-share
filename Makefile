# Skill-Share Makefile
# Wraps Python toolchain for skill creation, validation, and plugin builds.
#
# Prerequisites: Python 3.10+, pyyaml (pip install pyyaml)
#
# Usage:
#   make create PACKAGE=product-sourcing SKILL=supplier-intelligence PREFIX=SI
#   make validate
#   make build
#   make build-plugin PLUGIN=product-discovery
#   make all

PYTHON ?= python
TOOLS  := tools
SKILLS := skills

.PHONY: help create registry validate build build-plugin build-confirm \
        manifest marketplace check list-plugins clean all

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Skill Creation ──────────────────────────────────────────

create: ## Create new skill scaffold (PACKAGE=x SKILL=y [PREFIX=XX] [DESC="..."])
ifndef PACKAGE
	$(error PACKAGE is required. Usage: make create PACKAGE=product-ops SKILL=revenue-ops)
endif
ifndef SKILL
	$(error SKILL is required. Usage: make create PACKAGE=product-ops SKILL=revenue-ops)
endif
	$(PYTHON) $(TOOLS)/create-skill.py $(PACKAGE) $(SKILL) \
		$(if $(PREFIX),--prefix $(PREFIX)) \
		$(if $(DESC),--description "$(DESC)")

# ── Registry & Validation ──────────────────────────────────

registry: ## Generate plugin-registry.json from plugin.json files
	$(PYTHON) $(TOOLS)/generate-registry.py

registry-check: ## Validate plugin.json files without generating registry
	$(PYTHON) $(TOOLS)/generate-registry.py --check

validate: ## Run cross-cutting validation (I/O contracts, references, budgets)
	$(PYTHON) $(TOOLS)/validate-system.py --check-only

validate-fix: ## Run validation with fix suggestions
	$(PYTHON) $(TOOLS)/validate-system.py --check-only --fix-suggestions

# ── Build Pipeline ─────────────────────────────────────────

build: ## Full build pipeline for all plugins (registry + validate + build)
	$(PYTHON) $(TOOLS)/build.py --all

build-plugin: ## Build a single plugin (PLUGIN=name)
ifndef PLUGIN
	$(error PLUGIN is required. Usage: make build-plugin PLUGIN=product-discovery)
endif
	$(PYTHON) $(TOOLS)/build.py --plugin $(PLUGIN)

build-confirm: ## Build all plugins and package to .zip (no review step)
	$(PYTHON) $(TOOLS)/build.py --all --confirm

package: ## Package a single plugin to .zip (PLUGIN=name)
ifndef PLUGIN
	$(error PLUGIN is required. Usage: make package PLUGIN=product-discovery)
endif
	$(PYTHON) $(TOOLS)/build.py --plugin $(PLUGIN) --confirm

# ── Manifest & Marketplace ─────────────────────────────────

manifest: ## Generate dist/skill-manifest.json
	$(PYTHON) $(TOOLS)/validate-system.py --manifest-only

marketplace: ## Update .claude-plugin/marketplace.json
	$(PYTHON) $(TOOLS)/validate-system.py --update-marketplace

# ── Queries ────────────────────────────────────────────────

list-plugins: ## List all available plugins and their skills
	$(PYTHON) $(TOOLS)/build-plugin.py --list-plugins

check: ## Validate a single plugin without building (PLUGIN=name)
ifndef PLUGIN
	$(error PLUGIN is required. Usage: make check PLUGIN=product-discovery)
endif
	$(PYTHON) $(TOOLS)/build-plugin.py --check $(PLUGIN)

# ── Housekeeping ───────────────────────────────────────────

clean: ## Remove intermediate build directories (keeps .zip files)
	rm -rf dist/build/*/

clean-all: ## Remove all build output (build dirs + .zip files + manifest)
	rm -rf dist/build/
	rm -f dist/*.zip
	rm -f dist/skill-manifest.json

# ── Composite Targets ─────────────────────────────────────

all: registry validate build manifest marketplace ## Full pipeline: registry -> validate -> build -> manifest -> marketplace
	@echo ""
	@echo "Full pipeline complete."

ci: registry-check validate ## CI checks: registry validation + system validation
	@echo ""
	@echo "CI checks passed."
