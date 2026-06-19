---
name: verify-implementation
description: Run all registered verify skills sequentially and produce one implementation verification report. Use after feature implementation, before PRs, during code review, or when auditing project-rule compliance.
---

# Verify Implementation

## Purpose

Run registered `verify-*` skills and combine their results into one report.

This skill:

- Reads each verify skill's workflow.
- Runs checks in sequence.
- Applies each skill's exceptions to reduce false positives.
- Reports issues with file paths, line references when available, causes, and remediation suggestions.
- Applies fixes only after user approval.

## Execution Targets

No verify skills are registered yet.

<!-- When verify skills are added, replace this block with:
| # | Skill | Description |
| --- | --- | --- |
| 1 | `verify-example` | Example verification |
-->

## Workflow

### Step 1: Resolve Targets

Read the **Execution Targets** table above.

If the user provides a specific verify skill name, filter to that skill only. Accept both `verify-name` and `name`; normalize to `verify-name`.

If no skills are registered, stop with:

```markdown
## Implementation Verification

No verify skills are registered. Run `manage-skills` to create project-specific verification skills.
```

If one or more skills are registered, show the target list.

```markdown
## Implementation Verification

Running these verify skills sequentially:

| #   | Skill           | Description   |
| --- | --------------- | ------------- |
| 1   | `verify-<name>` | <description> |

Starting verification...
```

### Step 2: Run Each Verify Skill

For each target skill:

1. Read `.agents/skills/verify-<name>/SKILL.md`.
2. Parse these sections:
   - `Workflow`: checks and commands to run.
   - `Exceptions`: patterns that should not be reported.
   - `Related Files`: files and paths in scope.
3. Execute each workflow step in order.
4. Compare findings against the skill's PASS/FAIL criteria.
5. Apply exceptions.
6. Record issues with:
   - file path and line number when available
   - problem
   - why it matters
   - suggested fix

After each skill, summarize progress.

```markdown
### verify-<name> complete

- Checks: N
- Passed: X
- Issues: Y
- Exempted: Z
```

### Step 3: Build Integrated Report

Combine all results.

```markdown
## Implementation Verification Report

### Summary

| Verify skill    | Status | Issues | Detail            |
| --------------- | ------ | ------ | ----------------- |
| `verify-<name>` | PASS   | 0      | All checks passed |

Total issues found: 0
```

If every check passes:

```markdown
All registered verification skills passed.

- `verify-<name>`: summary

The implementation is ready for review from the registered-rule perspective.
```

If issues are found:

```markdown
### Issues Found

| #   | Skill           | File                 | Problem         | Suggested fix |
| --- | --------------- | -------------------- | --------------- | ------------- |
| 1   | `verify-<name>` | `path/to/file.ts:42` | Problem summary | Fix summary   |
```

### Step 4: Ask Before Applying Fixes

If issues are found, ask the user how to proceed:

```markdown
### Fix Options

X issues were found. How should I proceed?

1. Apply all fixes.
2. Review fixes one by one.
3. Stop without changes.
```

Do not edit files until the user chooses a fix option.

### Step 5: Apply Approved Fixes

If the user approves fixes:

- Keep edits scoped to files affected by the reported issues.
- Do not change unrelated code.
- Do not create commits, push, or open PRs unless explicitly asked.
- Preserve user changes that are unrelated to the fix.

Report progress.

```markdown
## Applying Fixes

- [1/X] `path/to/file.ts`: fixed issue from `verify-<name>`
```

### Step 6: Re-run Failed Skills

After applying fixes, re-run only the skills that had issues.

```markdown
## Re-verification

| Verify skill    | Before   | After |
| --------------- | -------- | ----- |
| `verify-<name>` | 2 issues | PASS  |
```

If issues remain, report them as residual risks and explain whether they need manual review.

## Output Requirements

Final output must include:

- Target verify skills.
- PASS/FAIL status for each skill.
- Total issue count.
- Fixes applied, if any.
- Re-verification result, if fixes were applied.
- Residual risks or manual checks.
- Commands that were run.

## Exceptions

These are not errors:

1. No registered verify skills: report and stop.
2. Exceptions defined by each verify skill.
3. `verify-implementation` itself is not a target.
4. `manage-skills` is not a target because it does not start with `verify-`.

## Related Files

| File                                            | Purpose                                          |
| ----------------------------------------------- | ------------------------------------------------ |
| `.agents/skills/manage-skills/SKILL.md`         | Maintains verify skill coverage and target lists |
| `.agents/skills/verify-implementation/SKILL.md` | This skill                                       |
| `.agents/skills/verify-*/SKILL.md`              | Verification skills executed by this skill       |
| `docs/agent/skills.md`                          | Repo skill index                                 |
