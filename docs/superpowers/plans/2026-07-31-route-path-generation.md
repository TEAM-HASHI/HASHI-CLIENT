# Route Path Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual dynamic route placeholder substitution with React Router `generatePath` while preserving existing URL, query string, and navigation state behavior.

**Architecture:** Keep `ROUTES` as the single route-pattern source and call `generatePath` at existing route-specific helpers or navigation boundaries. Keep `URLSearchParams` responsible for query strings and `navigate` options responsible for location state; do not introduce a wrapper abstraction.

**Tech Stack:** React 19, TypeScript, React Router DOM, Vitest, Testing Library, pnpm

## Global Constraints

- Use pnpm only.
- Preserve all current public URL structures and navigation state.
- Pass raw path parameters to `generatePath`; do not pre-encode them.
- Do not modify lazy route or AsyncBoundary behavior.
- Preserve unrelated untracked files.
- Do not create commits unless the user explicitly requests them.

---

### Task 1: Specify route helper encoding behavior

**Files:**

- Create: `apps/client/src/features/restaurantDetail/utils/restaurantDetailRoutes.test.ts`
- Modify: `apps/client/src/features/restaurantDetail/utils/restaurantDetailRoutes.ts`

**Interfaces:**

- Consumes: `ROUTES.restaurantDetail`, `ROUTES.restaurantMenuDetail`, `ROUTES.restaurantReservationNew`, `ROUTES.reviewNew`
- Produces: unchanged `getRestaurantDetailPath`, `getRestaurantMenuDetailPath`, `getRestaurantReservationNewPath`, `getRestaurantReviewNewPath` signatures

- [x] **Step 1: Write failing raw-parameter encoding tests**

```ts
import { describe, expect, it } from 'vitest'

import {
  getRestaurantDetailPath,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  getRestaurantReviewNewPath,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'

describe('restaurantDetailRoutes', () => {
  it('encodes a raw restaurant id as a path parameter', () => {
    expect(getRestaurantDetailPath('tokyo/sushi 한글')).toBe(
      '/restaurants/tokyo%2Fsushi%20%ED%95%9C%EA%B8%80',
    )
  })

  it('encodes every parameter in a menu detail path', () => {
    expect(getRestaurantMenuDetailPath('tokyo/sushi', 'menu?1')).toBe(
      '/restaurants/tokyo%2Fsushi/menus/menu%3F1',
    )
  })

  it('keeps reservation and review query path generation consistent', () => {
    expect(getRestaurantReservationNewPath('tokyo/sushi')).toBe(
      '/restaurants/tokyo%2Fsushi/reservations/new',
    )
    expect(getRestaurantReviewNewPath('tokyo/sushi', 'reservation/1')).toBe(
      '/restaurants/tokyo%2Fsushi/reviews/new?reservationId=reservation%2F1',
    )
  })
})
```

- [x] **Step 2: Run the focused test and confirm RED**

Run: `pnpm --filter @hashi/client exec vitest run src/features/restaurantDetail/utils/restaurantDetailRoutes.test.ts`

Expected: FAIL because manual `replace` leaves raw `/`, spaces, `?`, and Korean characters unencoded.

- [x] **Step 3: Replace helper string substitution with `generatePath`**

```ts
import { generatePath, type NavigateFunction } from 'react-router-dom'

export const getRestaurantDetailPath = (restaurantId: string) =>
  generatePath(ROUTES.restaurantDetail, { restaurantId })

export const getRestaurantMenuDetailPath = (
  restaurantId: string,
  menuId: string,
) => generatePath(ROUTES.restaurantMenuDetail, { restaurantId, menuId })

export const getRestaurantReservationNewPath = (restaurantId: string) =>
  generatePath(ROUTES.restaurantReservationNew, { restaurantId })
```

Use `generatePath(ROUTES.reviewNew, { restaurantId })` before appending the existing `URLSearchParams` result.

- [x] **Step 4: Run the focused test and confirm GREEN**

Run: `pnpm --filter @hashi/client exec vitest run src/features/restaurantDetail/utils/restaurantDetailRoutes.test.ts`

Expected: PASS.

### Task 2: Migrate direct route creation at navigation boundaries

**Files:**

- Modify: `apps/client/src/pages/home/hooks/useHomePage.ts`
- Modify: `apps/client/src/features/restaurantList/hooks/useRestaurantListPage.ts`
- Modify: `apps/client/src/pages/search/components/RestaurantResultItem.tsx`
- Modify: `apps/client/src/pages/myReservations/hooks/useMyReservationsPage.ts`
- Test: `apps/client/src/pages/home/HomePage.test.tsx`
- Test: `apps/client/src/pages/search/SearchPage.test.tsx`
- Test: `apps/client/src/pages/hashiPick/HashiPickPage.test.tsx`
- Test: `apps/client/src/pages/popularRestaurants/PopularRestaurantsPage.test.tsx`
- Test: `apps/client/src/pages/myReservations/MyReservationsPage.test.tsx`

**Interfaces:**

- Consumes: existing route patterns and raw API IDs
- Produces: the same concrete pathnames, query strings, and navigation state for ordinary IDs, with consistent encoding for special characters

- [x] **Step 1: Add or tighten navigation assertions**

Cover a restaurant ID containing a reserved character at the shared path-generation boundary and in at least one Link-based flow. Preserve existing navigation assertions for review `returnTo` state and review-new `reservationId` query string.

- [x] **Step 2: Run the affected tests before implementation**

Run: `pnpm --filter @hashi/client exec vitest run src/pages/home/HomePage.test.tsx src/pages/search/SearchPage.test.tsx src/pages/hashiPick/HashiPickPage.test.tsx src/pages/popularRestaurants/PopularRestaurantsPage.test.tsx src/pages/myReservations/MyReservationsPage.test.tsx`

Expected: characterization assertions pass because caller-side encoding already exists; the helper-level RED test from Task 1 proves the behavior change.

- [x] **Step 3: Replace direct route construction**

Import `generatePath` from `react-router-dom` in each affected file and replace every dynamic `ROUTES.*.replace` call with `generatePath`. Remove caller-side `encodeURIComponent`. Build review-new query strings with `generatePath` plus the existing `URLSearchParams` logic. Preserve navigate options unchanged.

- [x] **Step 4: Run affected tests and confirm GREEN**

Run the same five-file test command from Step 2.

Expected: PASS.

- [x] **Step 5: Audit remaining dynamic route replacements**

Run: `rg -n "ROUTES\\.[A-Za-z0-9_]+\\.replace|\\.replace\\(['\"]:[A-Za-z0-9_]+" apps/client/src -g '*.ts' -g '*.tsx'`

Expected: no output.

### Task 3: Record the route-generation rule and verify folder cleanup

**Files:**

- Modify: `docs/architecture/app-structure.md`
- Verify only: `apps/client/src/features/point/types`

**Interfaces:**

- Consumes: the implemented `generatePath` convention
- Produces: a human-readable routing rule for future client changes

- [x] **Step 1: Add the routing rule**

Add this bullet under `## Routing Rules`:

```markdown
- 동적 route URL은 수동 문자열 치환 대신 React Router의 `generatePath`를 사용하고, path parameter는 사전 인코딩하지 않은 원본 값을 전달합니다.
```

- [x] **Step 2: Verify the empty folder is absent from filesystem and Git**

Run: `find apps/client/src/features/point/types -maxdepth 1 -print 2>/dev/null`

Run: `git ls-files apps/client/src/features/point/types`

Expected: both commands produce no output. If a tracked placeholder appears, remove only that placeholder and the resulting empty directory.

### Task 4: Full verification

**Files:**

- Verify all files changed by Tasks 1-3

**Interfaces:**

- Consumes: completed route migration, tests, and documentation
- Produces: verified HASHI-146 implementation ready for review

- [x] **Step 1: Run client tests**

Run: `pnpm --filter @hashi/client test`

Expected: PASS.

- [x] **Step 2: Run static checks and build**

Run: `pnpm --filter @hashi/client lint`

Run: `pnpm --filter @hashi/client typecheck`

Run: `pnpm --filter @hashi/client build`

Run: `pnpm format:check`

Expected: all commands exit successfully.

- [x] **Step 3: Inspect the final diff**

Run: `git diff --check`

Run: `git status --short --branch --untracked-files=all`

Expected: no whitespace errors, only HASHI-146 files plus the pre-existing untracked PDF.
