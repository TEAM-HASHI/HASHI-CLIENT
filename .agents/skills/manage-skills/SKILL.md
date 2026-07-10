---
name: manage-skills
description: Audit changed files for verify-skill coverage gaps, stale skill references, missing checks, and outdated commands. Use after introducing new patterns, before PRs, after verify-skill changes, or when a previous verification missed an expected issue.
---

# Manage Skills

## Purpose

Maintain repo-scoped verification skills under `.agents/skills`.

Use this skill to detect and fix:

1. Coverage gaps: changed files not covered by any `verify-*` skill.
2. Invalid references: skill files pointing to deleted or moved files.
3. Missing checks: new project patterns not covered by existing workflows.
4. Stale values: commands, paths, package names, or status labels that no longer match the repository.

## Registered Verify Skills

| Skill                    | Description                                                                                      | Covered file patterns                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `verify-api-integration` | Checks HASHI client API query, mutation, query key, invalidation, UI state, and docs sync rules. | `apps/client/src/pages/**`, `apps/client/src/features/**`, `apps/client/src/shared/api/**`, `docs/architecture/data-layer.md` |

## Workflow

### Step 1: Collect Changed Files

Collect session and branch changes.

```bash
git status --short --untracked-files=all
git diff HEAD --name-only
git diff develop...HEAD --name-only 2>/dev/null || git diff origin/develop...HEAD --name-only 2>/dev/null
```

If `develop` and `origin/develop` are both unavailable, use `HEAD` and report that the branch comparison base was unavailable.

Group files by top-level or two-level directory.

```markdown
## Changed Files Detected

| Directory           | Files             |
| ------------------- | ----------------- |
| `apps/client`       | `src/app/App.tsx` |
| `docs/architecture` | `tech-stack.md`   |
| root                | `package.json`    |
```

### Step 2: Map Files To Verify Skills

Read the table in **Registered Verify Skills**.

If no verify skills are registered, mark all changed file groups as `UNCOVERED` and continue to Step 4.

For each registered skill, read `.agents/skills/verify-<name>/SKILL.md` and extract:

- `Related Files` paths and glob-like patterns.
- `Workflow` commands and paths.
- `Exceptions` that should suppress false positives.

Produce a mapping.

```markdown
### File To Skill Mapping

| Skill               | Trigger files                         | Action    |
| ------------------- | ------------------------------------- | --------- |
| `verify-tech-stack` | `package.json`, `pnpm-workspace.yaml` | CHECK     |
| none                | `docs/architecture/new-doc.md`        | UNCOVERED |
```

### Step 3: Analyze Affected Skills

For each affected `verify-*` skill:

1. Check whether changed files in that domain are missing from `Related Files`.
2. Run or dry-run path discovery commands from `Workflow`.
3. Check whether the workflow still matches current file paths and package names.
4. Read changed files only as needed to identify new patterns, exported symbols, settings, scripts, or status labels.
5. Remove references only when the file is confirmed deleted or moved.

Summarize gaps.

```markdown
| Skill               | Gap type      | Detail                                               |
| ------------------- | ------------- | ---------------------------------------------------- |
| `verify-tech-stack` | missing file  | `pnpm-workspace.yaml` is not listed in Related Files |
| `verify-docs-sync`  | stale command | command still uses `npm`, but this repo uses `pnpm`  |
```

### Step 4: Decide Create, Update, Or Exempt

Use this decision tree.

```text
For each uncovered file group:
  If it belongs to an existing verify skill domain:
    propose UPDATE
  Else if three or more related files share one recurring rule/pattern:
    propose CREATE
  Else:
    mark EXEMPT
```

Ask the user before creating a new skill or updating an existing skill.

Report proposed actions.

```markdown
### Proposed Actions

Update existing skills:

- `verify-tech-stack`: add package/version checks for `pnpm-workspace.yaml`

Create new skills:

- `verify-docs-sync`: cover documentation sync rules for config and architecture changes

No action:

- `README.md`: documentation-only change, no verify skill needed
```

### Step 5: Update Existing Verify Skills

Only update skills after user approval.

Rules:

- Preserve working checks.
- Add new files to `Related Files`.
- Add checks for newly introduced patterns.
- Update stale paths, package names, commands, and identifiers to match current repository state.
- Remove references only after confirming the file no longer exists.
- Keep fixes scoped to `.agents/skills/verify-*/SKILL.md` unless the user approves related docs updates.

### Step 6: Create New Verify Skills

Only create a new skill after user approval and a confirmed skill name.

Naming rules:

- Must start with `verify-`.
- Use kebab-case.
- If the user provides a name without `verify-`, add the prefix and mention it.

Create the skill at:

```text
.agents/skills/verify-<name>/SKILL.md
```

Required sections:

- `Purpose`
- `When To Run`
- `Related Files`
- `Workflow`
- `Output Format`
- `Exceptions`

After creating a verify skill, update:

- This file's **Registered Verify Skills** table.
- `.agents/skills/verify-implementation/SKILL.md` **Execution Targets** table.
- `docs/agent/skills.md` if the skill index exists.

### Step 7: Validate Skill Files

After edits, run:

```bash
find .agents/skills -maxdepth 3 -name SKILL.md -print
git diff --check
pnpm exec prettier README.md AGENTS.md docs/**/*.md .agents/skills/*/SKILL.md --check
```

For each `Related Files` entry that is an exact path, confirm it exists. For glob patterns, run a lightweight `rg --files -g '<pattern>'` or `find` dry run.

### Step 8: Report

```markdown
## Skill Maintenance Report

### Changed files analyzed

- N files

### Updated skills

- `verify-<name>`: summary

### Created skills

- `verify-<name>`: summary

### Unchanged skills

- `verify-<name>`: no related changes

### Uncovered or exempt changes

- `path/to/file`: reason

### Verification

- command: PASS/FAIL
```

## Quality Rules

- Use real paths from this repository. Do not leave placeholders in verify skills.
- Use repository commands: `pnpm`, `turbo`, `rg`, `find`, `git`.
- Prefer `develop` as the branch comparison base.
- Every check needs a PASS/FAIL criterion and a remediation hint.
- Include realistic exceptions to avoid false positives.
- Keep `manage-skills`, `verify-implementation`, and `docs/agent/skills.md` synchronized.

## Exceptions

These are usually not reasons to create a new verify skill:

- Lockfiles and generated output.
- One-off package version bumps.
- Documentation-only changes without a recurring rule.
- Test fixtures under `fixtures/`, `__fixtures__/`, or `test-data/`.
- Vendor or third-party code.
- CI/CD or deployment config unless the repo has a recurring verification rule for it.

## Related Files

| File                                            | Purpose                        |
| ----------------------------------------------- | ------------------------------ |
| `.agents/skills/manage-skills/SKILL.md`         | This skill                     |
| `.agents/skills/verify-implementation/SKILL.md` | Integrated verify-skill runner |
| `.agents/skills/verify-*/SKILL.md`              | Managed verify skills          |
| `docs/agent/skills.md`                          | Repo skill index               |
