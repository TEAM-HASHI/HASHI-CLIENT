---
name: page-creator
description: Create or update HASHI client pages and route-level screens in `apps/client/src/pages`. Use when scaffolding a page with `gen:page`, writing or filling a page `*.spec.md`, deciding page-local versus shared/HDS components, wiring route/query/mutation/state responsibilities, or reviewing page implementation with Toss Frontend Fundamentals principles.
---

# Page Creator

## Overview

Use this skill to turn a page request into a small, spec-first HASHI client implementation.
Keep this skill procedural; `docs/` remains the source of truth.

## Read First

Read only the documents needed for the current page.

Always read:

- `docs/architecture/app-structure.md`
- `docs/workflows/spec-writing.md`
- `docs/conventions/coding.md`
- `.agents/recipes/page-feature.md`

When the page fetches, submits, or caches server data:

- `docs/architecture/data-layer.md`
- `.agents/recipes/api-integration.md`

When the page includes form validation or step/state flow:

- `.agents/recipes/form-flow.md`

When mapping Figma or shared UI:

- `docs/rules/design-system-instructions.md`
- `docs/architecture/design-system.md`
- `docs/architecture/design-system-components.md`

## Workflow

1. Confirm the Jira key, page goal, route path, entry point, and source design/spec if available.
2. Check existing pages and HDS components before creating new files.
3. For a new page, prefer `corepack pnpm gen:page`; it creates `Page.tsx`, `Page.spec.md`, and `index.ts`.
4. Fill the generated `*.spec.md` before implementation. Keep it concrete enough to guide code, not more complex than the page.
5. Classify responsibilities:
   - page: route composition, layout, page copy, navigation, data orchestration
   - page-local component: one-page UI detail with no stable external API
   - `features`: repeated feature flow across pages or sections
   - `apps/client/src/shared`: app-specific component or hook reused by multiple screens
   - `packages/hds-ui`: product-agnostic primitive with stable public API and accessibility contract
6. Implement the smallest page structure that satisfies the spec.
7. Update the spec if implementation decisions change.
8. Run verification that matches the touched surfaces.

## Spec Rules

Write or update a page spec for:

- new page or route
- route params or search params
- loading, empty, error, disabled, or success states
- query, mutation, form, validation, or navigation behavior
- component mapping that affects HDS/shared/page-local placement

In the page spec, make these sections useful before coding:

- `Purpose`: the user goal, not implementation detail
- `Route`: path, owner, access, redirect
- `Requirements`: visible UI, actions, success/failure, responsive, accessibility
- `Data Dependencies`: query/mutation names, params, enabled condition, states
- `State`: local, form, URL, server, derived
- `Component Mapping`: HDS, app shared, page-local, icon
- `Verification`: commands and manual states to check

Do not create separate component specs for every page-local component. Prefer the page spec unless the component has its own stable props, complex states, or is likely to move to shared/HDS.

## Component Boundary

Use this decision order when a page needs UI pieces:

1. Reuse existing `@hashi/hds-ui` component or `@hashi/hds-icons` icon.
2. Keep one-page UI inside the page folder.
3. Promote to app shared only after at least two app screens need the same API and behavior.
4. Promote to HDS only when it is product-agnostic, design-system aligned, and has a reusable public API.

Do not put route, query, mutation, tracking, product copy, domain data, or submit behavior inside HDS components.

## Frontend Fundamentals Pass

Before finalizing page code, check the implementation against these principles.

- Cohesion: Keep page, spec, page-local components, hooks, and helpers close together. Do not scatter one page flow across shared folders before reuse exists.
- Coupling: Avoid passing props through three or more layers. Prefer composition and page-owned orchestration over broad context or boolean-heavy APIs.
- Predictability: Keep fetch/query helpers, mutation actions, validation helpers, and event handlers named for what they actually do. Do not hide navigation, logging, or mutation inside getter-like functions.
- Readability: Name complex conditions, split mutually exclusive UI states, and avoid nested ternaries in page composition.

Raise the bar only where the page is becoming hard to change. Do not introduce abstractions for a single simple case.

## Verification

For page scaffold or harness/docs-only changes:

```bash
corepack pnpm format:check
git diff --check
bash .agents/scripts/check-harness.sh
```

For client page implementation:

```bash
corepack pnpm --filter @hashi/client lint
corepack pnpm --filter @hashi/client typecheck
corepack pnpm --filter @hashi/client build
corepack pnpm --filter @hashi/client test
```

If route-level behavior or browser interaction changed, add the relevant manual checks or E2E command from `.agents/checklists/verification.md`.

## Report

In the final summary, include:

- Jira key and route/page name.
- Page spec path and whether it was created or updated.
- Component boundary decisions: HDS, app shared, page-local.
- Docs and `.agents` impact.
- Verification commands and results.
- Skipped checks and remaining risks.
