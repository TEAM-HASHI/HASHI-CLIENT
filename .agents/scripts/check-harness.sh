#!/usr/bin/env bash
set -euo pipefail

missing=0

require_path() {
  if [ ! -e "$1" ]; then
    echo "missing: $1"
    missing=1
  fi
}

require_path "AGENTS.md"
require_path ".agents/README.md"
require_path ".agents/checklists/pre-work.md"
require_path ".agents/checklists/verification.md"
require_path ".agents/checklists/final-report.md"
require_path ".agents/recipes/page-feature.md"
require_path ".agents/recipes/sds-component.md"
require_path ".agents/recipes/api-integration.md"
require_path ".agents/recipes/form-flow.md"
require_path ".agents/recipes/jira-branch-pr.md"
require_path ".agents/skills/manage-skills/SKILL.md"
require_path ".agents/skills/verify-implementation/SKILL.md"
require_path "docs/agent/skills.md"
require_path "docs/workflows/pr-checklist.md"
require_path "docs/workflows/spec-writing.md"

find .agents/skills -maxdepth 2 -name SKILL.md -print | sort

exit "$missing"
