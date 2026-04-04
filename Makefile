# Makefile -- Skill-Share build tool
# Wraps Python toolchain for convenience. Requires Python 3.9+.
# On Windows: use `make` from Git Bash, WSL, or run `python make.py <target>` directly.

PYTHON ?= python
REPO_ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
TOOLS := $(REPO_ROOT)tools

.PHONY: help registry validate build build-skills build-plugin clean all ci create

help: ## Show available targets
	@echo ""
	@echo "  Skill-Share Build Targets"
	@echo "  ========================="
	@echo ""
	@echo "  make registry       Generate plugin-registry.json from plugins.yaml"
	@echo "  make validate       Run cross-cutting validation checks"
	@echo "  make build          Full pipeline: registry + validate + build all plugins"
	@echo "  make build-skills   Build all skills to dist/.claude/skills/"
	@echo "  make build-plugin P=name  Build a single plugin (e.g. make build-plugin P=product-ops)"
	@echo "  make clean          Remove dist/ build artifacts"
	@echo "  make all            registry + validate + build + manifest + marketplace"
	@echo "  make ci             CI mode: registry + validate (no build)"
	@echo "  make create         Scaffold new skill (make create PKG=research NAME=my-skill PREFIX=XX)"
	@echo ""

registry: ## Generate plugin-registry.json from plugins.yaml
	$(PYTHON) $(TOOLS)/generate-registry.py

validate: ## Run system validation checks (advisory — does not block)
	$(PYTHON) make.py validate

build: ## Full build pipeline: registry + validate + build all
	$(PYTHON) make.py build

build-skills: ## Build all skills to dist/.claude/skills/
	$(PYTHON) $(TOOLS)/build-skill.py --all

build-plugin: ## Build single plugin (P=name)
	$(PYTHON) $(TOOLS)/build-plugin.py --plugin $(P)

clean: ## Remove dist/ build artifacts
	$(PYTHON) make.py clean

all: ## Full pipeline: registry + validate + build + manifest + marketplace
	$(PYTHON) make.py all

ci: ## CI mode: registry + validate (no build)
	$(PYTHON) make.py ci

create: ## Scaffold new skill (PKG=capability NAME=skill-name PREFIX=XX)
	$(PYTHON) $(TOOLS)/create-skill.py $(PKG) $(NAME) --prefix $(PREFIX)
