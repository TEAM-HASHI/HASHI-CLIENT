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
require_path ".agents/recipes/hds-component.md"
require_path ".agents/recipes/api-integration.md"
require_path ".agents/recipes/form-flow.md"
require_path ".agents/recipes/jira-branch-pr.md"
require_path ".agents/skills/page-creator/SKILL.md"
require_path ".agents/skills/page-creator/agents/openai.yaml"
require_path ".agents/skills/hds-storybook-creator/SKILL.md"
require_path ".agents/skills/hds-storybook-creator/agents/openai.yaml"
require_path "packages/AGENTS.md"
require_path ".agents/skills/hds-component-creator/SKILL.md"
require_path ".agents/skills/hds-component-creator/agents/openai.yaml"
require_path ".agents/skills/manage-skills/SKILL.md"
require_path ".agents/skills/verify-implementation/SKILL.md"
require_path ".agents/skills/api-spec-intake/SKILL.md"
require_path ".agents/skills/api-spec-intake/agents/openai.yaml"
require_path ".agents/skills/api-integrator/SKILL.md"
require_path ".agents/skills/api-integrator/agents/openai.yaml"
require_path ".agents/skills/verify-api-integration/SKILL.md"
require_path ".agents/skills/verify-api-integration/agents/openai.yaml"
require_path "docs/agent/skills.md"
require_path "docs/workflows/api-integration.md"
require_path "docs/architecture/routing-and-access-policy.md"
require_path "docs/workflows/pr-checklist.md"
require_path "docs/workflows/spec-writing.md"
require_path ".agents/scripts/summarize-openapi.mjs"
require_path "turbo/generators/templates/page/page.spec.md.hbs"

find .agents/skills -maxdepth 2 -name SKILL.md -print | sort

exit "$missing"
