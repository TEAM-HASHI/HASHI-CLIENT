---
name: hds-component-creator
description: Create or update HASHI Design System components and icons in `packages/hds-ui` and `packages/hds-icons`. Use when adding, modifying, reviewing, or scaffolding HDS UI primitives, HDS icon components, component specs, public exports, Storybook coverage, or design-system package verification.
---

# HDS Component Creator

## Overview

Use this skill to keep HDS work aligned with repo docs, package boundaries, generator output, public exports, and verification commands.
Do not duplicate design-system rules in this skill; treat `docs/` as the source of truth.

## Read First

Read only the docs needed for the target package.

For HDS UI component work:

- `packages/AGENTS.md`
- `docs/rules/design-system-instructions.md`
- `docs/architecture/design-system.md`
- `docs/architecture/design-system-components.md`
- `docs/architecture/design-system-component-plan.md`
- `docs/architecture/styling-and-design-tokens.md`
- `.agents/recipes/hds-component.md`

For HDS icon work:

- `packages/AGENTS.md`
- `docs/rules/design-system-instructions.md`
- `docs/architecture/design-system.md`
- `docs/architecture/design-system-icons.md`

For component specs:

- `docs/workflows/spec-writing.md`
- `docs/workflows/spec-templates/component.spec.md`

## Workflow

1. Check whether an existing HDS component or icon already solves the request.
2. Decide placement before editing:
   - `packages/hds-ui` for product-agnostic UI primitives.
   - `packages/hds-icons` for reusable product-agnostic icons.
   - `apps/client` for product-specific copy, routing, API, query, mutation, tracking, or domain data.
3. For new HDS UI components, prefer `corepack pnpm gen:ds-component` unless the change is a small edit to an existing component. The scaffold creates the component, nearby spec, Storybook story, local index, and public exports.
4. Keep public APIs explicit: named component exports, exported props types only when useful, no internal helper exports.
5. Represent Figma variants, sizes, tones, and states as props; do not hard-code screen copy or API response shapes.
6. Check disabled, loading, invalid, selected, long text, overflow, and accessibility behavior when those states apply.
7. Fill the generated `*.spec.md` and Storybook story with the component's actual public API, states, and behavior.
8. Add additional Storybook cases when the component supports variants, disabled/loading/invalid states, long text, or overflow.
9. If a repo-scoped Storybook generation skill is added later, use it for detailed story authoring and keep this skill focused on HDS package boundaries, scaffold output, public exports, and verification selection.

## Quality Pass

Before finalizing an HDS component, check the API and implementation with these frontend quality principles:

- Cohesion: Keep the component, spec, story, local index, and small private helpers close together. Do not extract constants or helpers to shared files until at least two HDS components need them.
- Coupling: Prefer composition or slots over prop drilling and boolean-heavy APIs. Do not make HDS props depend on app domain data, API response shapes, routes, query/mutation state, or analytics.
- Predictability: Prop names should reveal behavior. Keep controlled/uncontrolled contracts explicit. Callbacks should not hide app-owned side effects.
- Readability: Avoid nested ternaries and dense conditional class logic. Name complex conditions and split mutually exclusive rendering paths when the component becomes hard to scan.
- API discipline: Avoid premature polymorphism such as `as`, generic element APIs, or broad escape-hatch props until a concrete HDS component needs them.
- Variant discipline: Prefer small, explicit variant props over flexible but unclear config objects.

## Verification

Run checks that match the touched package.

Documentation or harness only:

```bash
corepack pnpm format:check
git diff --check
bash .agents/scripts/check-harness.sh
```

HDS UI code:

```bash
corepack pnpm --filter @hashi/hds-ui lint
corepack pnpm --filter @hashi/hds-ui typecheck
corepack pnpm --filter @hashi/hds-ui build
corepack pnpm --filter @hashi/hds-ui test
```

HDS icon code:

```bash
corepack pnpm --filter @hashi/hds-icons lint
corepack pnpm --filter @hashi/hds-icons typecheck
corepack pnpm --filter @hashi/hds-icons build
```

If Storybook files or package Storybook config changed, also run the Storybook command documented for the current package.

## Report

In the final summary, include:

- Jira key.
- Components or icons added or changed.
- Public export and spec/story impact.
- Docs impact.
- Verification commands and results.
