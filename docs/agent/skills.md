# Agent Skills

Repo-scoped Codex skills live in `.agents/skills`.

## Harness Boundary

- `docs` contains human-readable source of truth.
- `.agents` contains agent-facing execution helpers: checklists, recipes, skills, and scripts.
- A skill should reference `docs` instead of duplicating full team rules.
- Repeated checklist items can be promoted to recipe, skill, script, and eventually CI when the rule becomes stable.

## Registered Skills

| Skill                   | Purpose                                                                                           | Status |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| `hds-component-creator` | Guides HDS component and icon creation through package boundaries, docs, exports, and checks.     | Active |
| `manage-skills`         | Audits changed files for verify-skill coverage gaps and keeps verify skill metadata synchronized. | Active |
| `verify-implementation` | Runs registered `verify-*` skills and produces an integrated verification report.                 | Active |

## Verify Skills

No `verify-*` skills are registered yet.

## Candidate Verify Skills

| Candidate                        | Purpose                                                                                         | Trigger                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------- |
| `verify-docs-sync`               | Checks whether code, config, dependency, script, or folder changes require `docs` updates.      | Broad repo changes before PR          |
| `verify-design-system-storybook` | Checks HDS component stories, public exports, interaction states, and Storybook build coverage. | `packages/hds-ui` changes             |
| `verify-workspace-boundaries`    | Checks app/package/config boundaries and prevents product logic from leaking into HDS packages. | `apps`, `packages`, `configs` changes |
| `verify-agent-harness`           | Checks `.agents`, `AGENTS.md`, and `docs/agent` links and required harness files.               | Agent harness changes                 |

## Future Skill Boundaries

- A future Storybook generation skill should own detailed story authoring, story variants, and interaction examples.
- `hds-component-creator` should continue to own HDS package boundaries, generator scaffold flow, public exports, and HDS verification selection.

When a verify skill is added, update:

- `.agents/skills/manage-skills/SKILL.md`
- `.agents/skills/verify-implementation/SKILL.md`
- this document

## Harness Files

| Path                                            | Purpose                                  |
| ----------------------------------------------- | ---------------------------------------- |
| `.agents/README.md`                             | Agent harness entry map                  |
| `.agents/checklists/pre-work.md`                | Pre-work routing and scope checklist     |
| `.agents/checklists/verification.md`            | Verification command selection           |
| `.agents/checklists/final-report.md`            | Final summary checklist                  |
| `.agents/recipes/*`                             | Repeatable frontend workflow recipes     |
| `.agents/skills/hds-component-creator/SKILL.md` | HDS component and icon creation workflow |
| `.agents/scripts/check-harness.sh`              | Lightweight harness path check           |

## Notes

- Skills must use lowercase kebab-case names.
- Skill frontmatter should only include `name` and `description`.
- HASHI repo skills should use `.agents/skills`.
- Use `allow_implicit_invocation: false` in `agents/openai.yaml` for skills that should run only when explicitly requested.
