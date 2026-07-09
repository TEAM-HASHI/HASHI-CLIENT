---
name: api-integrator
description: Use when implementing HASHI client API integration from Swagger, API specs, or an API Integration Map, including ky endpoint functions, TanStack Query hooks, query keys, mutations, invalidation, loading, error, empty, and infinite list behavior.
---

# API Integrator

## Overview

Connect already-published HASHI client UI to backend APIs with small, colocated, predictable data code.
Use this after `api-spec-intake` when API docs are available or when the API Integration Map is already clear.

## Read First

- `docs/architecture/data-layer.md`
- `docs/architecture/app-structure.md`
- `docs/workflows/api-integration.md`
- `.agents/recipes/api-integration.md`
- Target page or feature code and nearby `*.spec.md`
- Existing `apps/client/src/shared/api` and `apps/client/src/shared/lib/queryClient.ts`

## Workflow

1. Confirm the target page or feature owns the API flow. Keep one-page flows page-local.
2. Remove mock usage only where the API Integration Map covers real behavior.
3. Add endpoint functions that use `request`; endpoint functions must not import React or TanStack Query.
4. Add request/response/view types close to the page or feature.
5. Add query key factories before writing query hooks.
6. Add `queryOptions`, `useSuspenseQuery`, `useQuery`, `useInfiniteQuery`, or mutation hooks based on `references/query-mode-decision.md`.
7. Wire existing UI states without changing unrelated layout or copy.
8. Add mutation invalidation with query key factories.
9. Update the target `*.spec.md` `Data Dependencies` and `Verification` sections when behavior changes.
10. Run focused client verification.

## Reference Routing

- Placement and promotion: `references/folder-structure.md`
- Query hook choice: `references/query-mode-decision.md`
- Query keys: `references/query-key-factory.md`
- Query options: `references/query-options.md`
- Mutations and invalidation: `references/mutation-invalidation.md`
- Infinite queries: `references/infinite-query.md`
- UI states: `references/ui-state-mapping.md`

## Frontend Fundamentals Pass

- Cohesion: keep endpoint, query key, options, hook, and types in the same page or feature until reuse exists.
- Coupling: do not push server-state details into HDS components or deep prop chains.
- Predictability: fetchers fetch; mutations mutate; names must reveal network side effects.
- Readability: name derived booleans and split complex loading/error/empty branches.

## Verification

Run checks that match the touched surface:

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client test
pnpm --filter @hashi/client build
```

For pure docs or harness edits, use `.agents/checklists/verification.md`.
