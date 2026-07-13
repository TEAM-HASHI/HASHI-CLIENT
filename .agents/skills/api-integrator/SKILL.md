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
- `apps/client/src/shared/api/generated/openapi.ts`
- Target page or feature code and nearby `*.spec.md`
- Existing `apps/client/src/shared/api` and `apps/client/src/shared/lib/queryClient.ts`

## Workflow

1. Confirm the target page or feature owns the API flow. Keep one-page flows page-local.
2. Remove mock usage only where the API Integration Map covers real behavior.
3. Add endpoint functions that use `request`; endpoint functions must not import React or TanStack Query.
4. Add request/response/view types close to the page or feature. Prefer aliases derived from generated OpenAPI types at the API boundary.
5. Add query key factories before writing query hooks.
6. Add `queryOptions`, `useSuspenseQuery`, `useQuery`, `useInfiniteQuery`, or mutation hooks based on `references/query-mode-decision.md`.
7. Wire existing UI states without changing unrelated layout or copy.
8. Add mutation invalidation with query key factories.
9. Update the target `*.spec.md` `Data Dependencies` and `Verification` sections when behavior changes.
10. Add or update tests without depending on real API base URLs or local env values.
11. Run focused client verification.

## Reference Routing

- Placement and promotion: `references/folder-structure.md`
- Query hook choice: `references/query-mode-decision.md`
- Query keys: `references/query-key-factory.md`
- Query options: `references/query-options.md`
- Mutations and invalidation: `references/mutation-invalidation.md`
- Infinite queries: `references/infinite-query.md`
- UI states: `references/ui-state-mapping.md`

## File Placement

Use the smallest owning boundary first.

```text
apps/client/src/pages/{pageName}/
  api/{endpointName}.ts
  queries/{domain}QueryKeys.ts
  queries/use{Domain}Query.ts
  mutations/use{Action}Mutation.ts
  hooks/use{PageName}.ts
  types.ts
```

Promote to `apps/client/src/features/{featureName}` only when the same API flow is reused by multiple pages. Keep `apps/client/src/shared/api` limited to low-level `request`, client config, and generated OpenAPI types.

Naming rules:

- Endpoint files use network actions: `getRestaurants.ts`, `createReservation.ts`, `cancelReservation.ts`.
- Endpoint files may export OpenAPI-derived aliases such as `CreateReservationBody` and `CreateReservationData` when only that endpoint needs them.
- If multiple endpoint/query files share the aliases, move them to the same page/feature `types.ts`.
- Query key factories live in `queries/{domain}QueryKeys.ts`.
- Query hooks live in `queries/use{Domain}Query.ts` or `queries/use{Domain}InfiniteQuery.ts`.
- Mutation hooks live in `mutations/use{Action}Mutation.ts`.
- Page hooks may compose query/mutation hooks, but should not contain raw `request` calls.
- Components should receive view-ready props and should not import `paths` or `components` from generated OpenAPI types directly.

## Test Isolation

API integration tests must not depend on local `.env` values.

- Page and component tests should mock page/feature API modules with `vi.mock(...)`.
- API wrapper tests should mock `@/shared/api/request`, not the real `apiClient`.
- Avoid importing `@/shared/api` barrels in tests when a direct module import is enough, because the barrel can load `apiClient.ts`.
- Do not hardcode real origins such as `https://dev-api.hashi.kr` in tests unless the unit under test is explicitly URL construction.
- CI can fail with `VITE_API_BASE_URL 환경 변수가 필요합니다.` when a test import path reaches `apiClient.ts`.

Preferred page/component test pattern:

```ts
import { getReservationDetail } from '@/pages/reservationDetail/api/getReservationDetail'

vi.mock('@/pages/reservationDetail/api/getReservationDetail', () => ({
  getReservationDetail: vi.fn(),
}))

const mockedGetReservationDetail = vi.mocked(getReservationDetail)
```

Preferred API wrapper test pattern:

```ts
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)
```

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

For CI-only failures related to missing API env values, reproduce without local env leakage:

```bash
env -u VITE_API_BASE_URL pnpm --filter @hashi/client test -- <test-file>
```

For pure docs or harness edits, use `.agents/checklists/verification.md`.
