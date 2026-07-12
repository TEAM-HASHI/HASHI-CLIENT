# Admin Live API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin OpenAPI의 11개 operation을 실제 관리자 UI에 연결하고 API에 없는 mock UI를 제거한다.

**Architecture:** Admin generated OpenAPI types가 endpoint boundary의 유일한 server contract가 된다. 인증은 response `Authorization` header와 credential cookie를 사용하며, 예약은 query 기반 UI, 식당과 매거진은 조회 API가 없으므로 command form 기반 UI로 구성한다.

**Tech Stack:** React 19, TypeScript, Vite, ky, TanStack Query, Vitest, Testing Library, openapi-typescript

**Status:** Implemented and verified on 2026-07-12. The checklists below preserve the execution recipe; verification results are recorded in the task handoff.

## Global Constraints

- 사용자가 요청하기 전까지 `git commit`, push, PR을 수행하지 않는다.
- 현재 merge-in-progress 상태를 유지한다.
- generated `openapi.ts`는 직접 수정하지 않는다.
- 실제 관리자 credential과 schema URL은 repository에 기록하지 않는다.
- Swagger에 없는 query나 field를 mock으로 대체하지 않는다.
- optimistic update를 사용하지 않는다.

---

### Task 1: Auth API와 테스트 환경

**Files:**

- Modify: `apps/admin/package.json`
- Modify: `apps/admin/vite.config.ts`
- Create: `apps/admin/test/setup.ts`
- Create: `apps/admin/src/shared/api/authApi.test.ts`
- Create: `apps/admin/src/shared/api/authApi.ts`
- Modify: `apps/admin/src/shared/api/apiClient.ts`
- Modify: `apps/admin/src/shared/auth/adminSession.ts`

**Interfaces:**

- Produces: `authApi.login(body): Promise<AdminSession>`, `authApi.logout(): Promise<void>`
- Produces: `AdminSession = { accessToken: string; loginId: string; issuedAt: string }`

- [ ] Write tests asserting login sends `{ loginId, password }`, uses credential cookies, strips `Bearer ` from the response `Authorization` header, and rejects a successful body without that header.
- [ ] Run `pnpm --filter @hashi/admin test -- authApi.test.ts` and verify failure because `authApi` does not exist.
- [ ] Add jsdom/Testing Library test dependencies and setup.
- [ ] Implement `authApi` using `apiClient` raw response, `credentials: 'include'`, and `AdminApiRequestError` normalization.
- [ ] Set `credentials: 'include'` on `apiClient` and preserve bearer injection from `getAdminAccessToken`.
- [ ] Run focused auth tests and typecheck until green.

### Task 2: Live query keys, hooks, and reservation view models

**Files:**

- Create: `apps/admin/src/shared/api/reservationViewModel.test.ts`
- Create: `apps/admin/src/shared/api/reservationViewModel.ts`
- Modify: `apps/admin/src/shared/api/queryKeys.ts`
- Modify: `apps/admin/src/shared/api/adminHooks.ts`
- Modify: `apps/admin/src/shared/lib/queryClient.ts`

**Interfaces:**

- Produces: `toReservationView(data): AdminReservationView`
- Produces: `useReservationsQuery(params)`, `useReservationUserQuery(id)`, `useUpdateReservationStatusMutation()`
- Produces: restaurant/magazine mutation hooks backed by live endpoint functions

- [ ] Write failing tests for optional-field fallback, `CANCELED` status preservation, query key params, and reservation-list invalidation.
- [ ] Implement reservation view models with display-safe strings and numeric defaults.
- [ ] Replace `adminService` calls in hooks with `reservationApi`, `restaurantApi`, and `magazineApi`.
- [ ] Use `adminQueryKeys.reservations.list(params)` and invalidate `adminQueryKeys.reservations.lists()` after status mutation.
- [ ] Disable mutation retry and retry only network/5xx queries once.
- [ ] Run focused tests and typecheck until green.

### Task 3: Login, logout, and dashboard UI

**Files:**

- Create: `apps/admin/src/pages/login/LoginPage.test.tsx`
- Modify: `apps/admin/src/pages/login/LoginPage.tsx`
- Modify: `apps/admin/src/app/layout/AdminLayout.tsx`
- Create: `apps/admin/src/pages/dashboard/DashboardPage.test.tsx`
- Modify: `apps/admin/src/pages/dashboard/DashboardPage.tsx`

**Interfaces:**

- Login consumes `authApi.login` and stores `AdminSession`.
- Dashboard consumes reservation list hooks with `{ page: 0, size: 5 }` and metric queries with `{ page: 0, size: 1, status }`.

- [ ] Write failing LoginPage tests for login ID copy, disabled pending submit, success navigation, and inline auth error.
- [ ] Replace mock login with live login and store the returned session.
- [ ] Replace layout mock logout with live logout, clear session/query cache, and navigate to login.
- [ ] Write failing DashboardPage tests showing reservation-only metrics and no mock restaurant/magazine sections.
- [ ] Render total, requested, contacting, confirmed counts and recent reservations from live queries.
- [ ] Run page tests and typecheck until green.

### Task 4: Reservation page live integration

**Files:**

- Create: `apps/admin/src/pages/reservations/ReservationsPage.test.tsx`
- Modify: `apps/admin/src/pages/reservations/ReservationsPage.tsx`
- Modify: `apps/admin/src/shared/components/StatusBadge.tsx`

**Interfaces:**

- Consumes: `AdminReservationView`, live reservation hooks, API status union.
- Produces: status filter and zero-based server pagination controls.

- [ ] Write failing tests that reject mock scenario/search/date controls and assert status filter, live rows, pagination, user drawer, and status mutation.
- [ ] Remove `MockScenario`, search, and date filters.
- [ ] Render flat API fields and all documented reservation/payment statuses.
- [ ] Add previous/next server pagination using `page`, `totalPages`, and `totalCount`.
- [ ] Connect user drawer and status dialog to live hooks with pending/error states.
- [ ] Run reservation page tests and typecheck until green.

### Task 5: Restaurant command UI

**Files:**

- Create: `apps/admin/src/pages/restaurants/restaurantForm.test.ts`
- Create: `apps/admin/src/pages/restaurants/restaurantForm.ts`
- Create: `apps/admin/src/pages/restaurants/RestaurantsPage.test.tsx`
- Modify: `apps/admin/src/pages/restaurants/RestaurantsPage.tsx`

**Interfaces:**

- Produces: `toCreateRestaurantBody(state): CreateRestaurantBody`
- Produces: `toUpdateRestaurantBody(state): UpdateRestaurantBody`

- [ ] Write failing serializer tests for flat currency/prices, object keys, seven business-hour rows, optional patch omission, menu and curation arrays.
- [ ] Implement create/update serializers using generated endpoint aliases.
- [ ] Write failing page tests asserting no mock table/filter and presence of create, ID-based update, and ID-based delete actions.
- [ ] Replace the mock list page with API-aligned command forms.
- [ ] Remove file pickers, generated fake keys, `active`, nested price range, and unsupported status fields.
- [ ] Display the latest create/update response and delete success without presenting it as a persistent list.
- [ ] Run restaurant tests and typecheck until green.

### Task 6: Magazine command UI

**Files:**

- Create: `apps/admin/src/pages/magazines/magazineForm.test.ts`
- Create: `apps/admin/src/pages/magazines/magazineForm.ts`
- Create: `apps/admin/src/pages/magazines/MagazinesPage.test.tsx`
- Modify: `apps/admin/src/pages/magazines/MagazinesPage.tsx`

**Interfaces:**

- Produces: `toCreateMagazineBody(state): CreateMagazineBody`
- Produces: `toUpdateMagazineBody(state): UpdateMagazineBody`

- [ ] Write failing serializer tests for required create fields and omitted empty patch fields.
- [ ] Implement magazine create/update serializers.
- [ ] Write failing page tests asserting the removal of list/filter/card/restaurant fields and presence of create, ID-based update, and delete actions.
- [ ] Replace the mock page with title, banner key, Instagram redirect URL command forms.
- [ ] Display latest mutation response and inline errors.
- [ ] Run magazine tests and typecheck until green.

### Task 7: Mock removal, docs, and verification

**Files:**

- Delete: `apps/admin/src/shared/api/adminService.ts`
- Delete: `apps/admin/src/shared/api/mock/mockStore.ts`
- Modify or delete: `apps/admin/src/shared/api/adminTypes.ts`
- Modify: `apps/admin/src/app/AdminConsole.spec.md`
- Modify: `apps/admin/src/app/AdminApiIntegration.spec.md`
- Modify: `docs/architecture/app-structure.md`
- Modify: `docs/architecture/data-layer.md`

- [ ] Verify `rg "adminService|mockStore|MockScenario" apps/admin/src` returns no production matches.
- [ ] Remove orphan mock files and manual types superseded by generated aliases.
- [ ] Update specs and architecture docs to describe live API behavior and missing backend queries.
- [ ] Regenerate admin OpenAPI types from the injected raw schema.
- [ ] Run `pnpm --filter @hashi/admin test`, lint, typecheck, and build.
- [ ] Run repository test, lint, typecheck, build, Prettier check, staged/unstaged diff checks, and unresolved-conflict check.
