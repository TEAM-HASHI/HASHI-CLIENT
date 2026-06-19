# Agent Skills

Repo-scoped Codex skills live in `.agents/skills`.

## Registered Skills

| Skill                   | Purpose                                                                                           | Status |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| `manage-skills`         | Audits changed files for verify-skill coverage gaps and keeps verify skill metadata synchronized. | Active |
| `verify-implementation` | Runs registered `verify-*` skills and produces an integrated verification report.                 | Active |

## Verify Skills

No `verify-*` skills are registered yet.

When a verify skill is added, update:

- `.agents/skills/manage-skills/SKILL.md`
- `.agents/skills/verify-implementation/SKILL.md`
- this document

## Notes

- Skills must use lowercase kebab-case names.
- Skill frontmatter should only include `name` and `description`.
- SIKSA repo skills should use `.agents/skills`.
