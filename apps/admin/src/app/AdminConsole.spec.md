# Page Spec: `AdminConsole`

## Purpose

- HASHI-91 범위에서 관리자 콘솔을 제공하고, 확정된 admin OpenAPI 계약부터 mock 구현을 실제 API로 전환합니다.
- 운영자가 식당, 예약, 매거진 데이터를 desktop dashboard 형태로 확인하고 관리할 수 있게 합니다.
- Swagger에 조회 또는 인증 계약이 없는 기능은 mock 상태를 유지하되 실제 연동 상태처럼 표시하지 않습니다.

## Route

- path:
  - `/admin/login`
  - `/admin`
  - `/admin/dashboard`
  - `/admin/restaurants`
  - `/admin/reservations`
  - `/admin/magazines`
- path constant:
  - `ROUTES.login`
  - `ROUTES.adminRoot`
  - `ROUTES.dashboard`
  - `ROUTES.restaurants`
  - `ROUTES.reservations`
  - `ROUTES.magazines`
- route owner:
  - `apps/admin`
- layout:
  - `AdminLayout`: left navigation, mobile menu overlay, content outlet
- access type:
  - `/admin/login`: guestOnly
  - `/admin/*`: authOnly
- guard:
  - `GuestOnlyRoute`
  - `AdminOnlyRoute`
- lazy loading:
  - route pages use `lazyPages`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `/admin/login`
  - authenticated guest: `/admin/dashboard`
  - `/admin`: `/admin/dashboard`
- auth status:
  - uses `getAdminSession`: yes

## Location

- app path:
  - `apps/admin`
- spec path:
  - `apps/admin/src/app/AdminConsole.spec.md`
- route registration:
  - `apps/admin/src/app/router/path.ts`
  - `apps/admin/src/app/router/lazy.ts`
  - `apps/admin/src/app/router/routes.tsx`
  - `apps/admin/src/app/router/router.tsx`

## Requirements

- [x] `@hashi/admin` workspace app is runnable through pnpm filter.
- [x] Login form supports success, disabled submit, and failure state.
- [x] Admin-only routes redirect unauthenticated users to login.
- [x] Left navigation shows dashboard, restaurant, reservation, and magazine entries.
- [x] Dashboard shows metrics, recent reservations, recent restaurants, and quick actions.
- [x] Restaurant page supports search, status/genre filters, sorting, create, update, delete, loading, empty, and error states.
- [x] Restaurant create/update drawer uses a step flow for basic info, media/price, business hours, and menu/exposure fields.
- [x] Reservation page supports search, status/date filters, status change dialog, user drawer, loading, empty, and error states.
- [x] Magazine page supports search, region/series/genre filters, create, update, delete, banner preview, card news entries, related restaurants, loading, empty, and error states.
- [x] Desktop layout prioritizes dense table workflows over marketing composition.
- [x] Mobile layout exposes the LNB through a menu overlay.
- [x] Icon buttons and non-text controls expose accessible labels.
- [ ] Admin OpenAPI 타입은 client 타입과 분리해 생성합니다.
- [ ] 예약 목록, 상태 변경, 예약자 조회 API boundary는 admin OpenAPI 타입과 일치시킵니다.
- [ ] 실제 reservation UI 전환은 backend 인증 전달 방식이 확정된 뒤 수행합니다.
- [ ] 인증 전달 방식과 조회 endpoint가 없는 기능은 backend 계약 확정 전 mock 상태를 유지합니다.

## Data Dependencies

### OpenAPI Type Generation

- schema input:
  - Swagger UI HTML이 아닌 admin raw OpenAPI JSON/YAML을 `OPENAPI_SCHEMA_URL`로 주입합니다.
  - 실제 dev/staging schema URL은 repository 파일에 기록하지 않습니다.
- command:
  - root: `pnpm gen:admin-api-types`
  - app: `pnpm --filter @hashi/admin gen:api-types`
- output:
  - `apps/admin/src/shared/api/generated/openapi.ts`
- boundary:
  - `apps/client/src/shared/api/generated/openapi.ts`를 덮어쓰거나 admin에서 import하지 않습니다.
  - generated type은 API boundary에서 local alias로 좁혀 사용하고 page/component에서 `paths`를 직접 참조하지 않습니다.

### Integration Status

| UI area                         | OpenAPI operations                                                | Current decision                               |
| ------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Login/logout                    | `POST /api/v1/auth/admin/login`, `POST /api/v1/auth/admin/logout` | 인증 전달 방식 확정 전 mock 유지               |
| Dashboard                       | 없음                                                              | mock 유지                                      |
| Restaurant list                 | 없음                                                              | mock 유지                                      |
| Restaurant create/update/delete | 제공됨                                                            | 목록 조회 계약과 form 정합성 확정 전 mock 유지 |
| Reservation list/status/user    | 모두 제공됨                                                       | API boundary 정합화, 인증 확정 후 UI 전환      |
| Magazine list                   | 없음                                                              | mock 유지                                      |
| Magazine create/update/delete   | 제공됨                                                            | 목록 조회 계약과 form 정합성 확정 전 mock 유지 |
| File upload                     | 없음                                                              | mock object key 생성 유지                      |

### Query

- query:
  - `useDashboardMetricsQuery`
  - `useRestaurantsQuery`
  - `useReservationsQuery`
  - `useReservationUserQuery`
  - `useMagazinesQuery`
- enabled condition:
  - reservation user query only runs when a reservation drawer target exists
- request params:
  - mock query: `success | empty | error`
  - reservation list: `status`, `page`, `size`
  - reservation user: `reservationId`
- loading state:
  - table skeleton rows
  - dashboard metric placeholder
  - reservation user drawer skeleton
- error state:
  - table error row with retry
  - reservation user drawer error message
- empty state:
  - table empty row with user-facing guidance
- refetch condition:
  - retry button
  - query invalidation after mutations

### Mutation

- mutation:
  - login / logout
  - create / update / delete restaurant
  - update reservation status
  - create / update / delete magazine
- request data:
  - 실제 연동 타입은 generated OpenAPI type에서 API-local alias로 추출합니다.
  - mock UI model은 `adminTypes.ts`에 유지하고 API response는 query boundary에서 UI model로 변환합니다.
- submit enabled condition:
  - login requires login ID and password after auth integration
  - forms rely on native required fields for required text inputs
- success handling:
  - login redirects to dashboard
  - logout clears session and redirects to login
  - create/update closes drawer
  - delete closes confirm dialog
  - status change closes confirm dialog
- failure handling:
  - login shows inline form error
  - table query failure shows retry state
  - restaurant delete conflict shows the API error message in the confirm dialog

### Authentication Contract

- endpoint:
  - login: `POST /api/v1/auth/admin/login`
  - logout: `POST /api/v1/auth/admin/logout`
- request DTO:
  - `AdminLoginRequest`: required `loginId`, `password`
- response DTO:
  - login/logout both return `SuccessResponseVoid`
- blocker:
  - OpenAPI defines `bearerAuth` but does not attach endpoint security requirements.
  - login response has no access token field.
  - frontend integration starts only after backend confirms bearer token delivery or cookie/session credentials behavior.

### Restaurant Admin API Contract

- endpoint:
  - create: `POST /api/v1/admin/restaurants`
  - update: `PATCH /api/v1/admin/restaurants/{restaurantId}`
  - delete: `DELETE /api/v1/admin/restaurants/{restaurantId}`
- request DTO:
  - `CreateRestaurantRequest`
  - `UpdateRestaurantRequest`
  - price fields are flat: `currency`, `minPrice`, `maxPrice`
  - images use `thumbnailKey` and `imageKeys`, not raw files
  - create required fields are `name`, `address`, `genre`, `reservationFee`, `currency`, and exactly seven `businessHours`
  - update sends only changed fields; omitted fields keep existing values
- response DTO:
  - all responses use `AdminApiResponse<TData>`
  - create/update return `AdminRestaurantResponse`
  - delete returns `SuccessResponseVoid`
- missing endpoint:
  - restaurant list/detail 조회가 admin OpenAPI에 없습니다.
- implementation boundary:
  - actual HTTP calls live in `apps/admin/src/shared/api/restaurantApi.ts`
  - create/update/delete를 실제 API로 전환하면 목록에도 결과가 반영되어야 하므로 조회 계약 확정 전 mock을 유지합니다.

### Reservation Admin API Contract

- endpoint:
  - list: `GET /api/v1/admin/reservations`
  - status update: `POST /api/v1/admin/reservations/{reservationId}/status`
  - user lookup: `GET /api/v1/admin/reservations/{reservationId}/user`
- request DTO:
  - list query uses optional `status`, `page`, `size`
  - status update uses `ChangeReservationStatusRequest`
  - user lookup has no request body
- response DTO:
  - all responses use `AdminApiResponse<TData>`
  - list success returns `AdminReservationListResponse`
  - status update success returns `AdminReservationResponse`
  - user lookup success returns `AdminReservationUserResponse`
- UI mapping:
  - list response의 flat restaurant/user fields를 기존 table UI model로 변환합니다.
  - reservation status values: `REQUESTED | CONTACTING | CONFIRMED | VISITED | CANCELED`
  - payment status values: `PENDING | PAID | CANCELED`
  - user drawer renders `userId`, `nickname`, `nameEng`, `birthDate`, `phone`, `email`.
- query params:
  - `status`
  - `page`
  - `size`
- omitted UI filters:
  - Swagger에 `reservedFrom`, `reservedTo`, 검색어 query parameter가 없으므로 서버 요청에 보내지 않습니다.
- no-show:
  - current contract has no no-show status, flag, count, or update endpoint
  - admin UI must not expose no-show action or confirmed no-show metrics until an API contract is added
- implementation boundary:
  - actual HTTP calls live in `apps/admin/src/shared/api/reservationApi.ts`
  - query key에는 `status`, `page`, `size`를 모두 포함합니다.
  - status mutation success invalidates reservation lists and reservation user/detail data only when affected.
  - auth transport가 확정되기 전에는 page hooks가 `adminService` mock을 계속 사용합니다.

### Magazine Admin API Contract

- endpoint:
  - create: `POST /api/v1/admin/magazines`
  - update: `PATCH /api/v1/admin/magazines/{magazineId}`
  - delete: `DELETE /api/v1/admin/magazines/{magazineId}`
- request DTO:
  - create uses `CreateMagazineRequest`
  - update uses `UpdateMagazineRequest`
  - create required fields are `title`, `bannerKey`, and `instagramRedirectUrl`
- response DTO:
  - all responses use `AdminApiResponse<TData>`
  - create/update return `AdminMagazineResponse`
  - delete returns `SuccessResponseVoid`
- missing endpoint:
  - magazine list/detail 조회가 admin OpenAPI에 없습니다.
- UI mismatch:
  - current `region`, `series`, `genre`, `content`, cards, related restaurants fields are not present in OpenAPI.
- implementation boundary:
  - actual HTTP calls live in `apps/admin/src/shared/api/magazineApi.ts`
  - backend/UI scope가 합의되고 목록 조회 계약이 추가될 때까지 current mock form과 list를 유지합니다.

## User Flow

1. User enters `/admin`.
2. Unauthenticated user is redirected to `/admin/login`.
3. User submits valid mock credentials until the backend auth transport is confirmed.
4. User lands on `/admin/dashboard`.
5. User navigates through LNB to restaurants, reservations, and magazines.
6. User searches, filters, opens drawers/dialogs, and confirms mutations.
7. Reservation mutation success invalidates the actual reservation query; unavailable domains keep mock invalidation behavior.
8. User logs out and returns to login.

## State

- local state:
  - sidebar mobile open state
  - search/filter/sort controls
  - drawer/dialog targets
  - form fields
  - mock scenario
- form state:
  - login
  - restaurant drawer
  - magazine drawer
  - reservation status dialog
- URL state:
  - route path only
- server state:
  - all page hooks: TanStack Query backed by mock store until auth transport is confirmed
  - reservation API boundary: admin OpenAPI contract에 맞춰 준비하되 page hook에서는 아직 활성화하지 않음
- derived state:
  - filtered and sorted table rows use render-time calculation or `useMemo`
  - search uses `useDeferredValue`

## Validation

- login ID:
  - rule: non-empty
  - error message: browser validation or login failure message
- login password:
  - rule: non-empty
  - error message: `관리자 계정 정보를 확인해주세요.` when password is `fail`
- restaurant fields:
  - API create required: name, address, genre, reservation fee, currency, and seven business-hour entries
  - API optional: local name, description, store description, thumbnail key, price bounds, image keys, menus, and curation types
  - business hours start with Monday through Sunday rows; operators mark closed days instead of adding one day at a time
  - business hour time fields use hour/minute selectors and serialize to `HH:mm`
  - submit condition: final save blocks when required fields are missing and moves the operator to the first incomplete step
- magazine fields:
  - API create required: title, banner key, and Instagram redirect URL
  - current region, series, genre, content, card, and related restaurant rules apply to mock UI only
  - rule: selected files generate mock S3 object keys until the presigned upload API is connected
- submit enabled condition:
  - login button disabled while empty or pending

## UI Structure

```text
App
  QueryProvider
  RouterProvider
    GuestOnlyRoute
      LoginPage
    AdminOnlyRoute
      AdminLayout
        Sidebar / MobileSidebar
        Outlet
          DashboardPage
          RestaurantsPage
          ReservationsPage
          MagazinesPage
```

## Component Mapping

- HDS component:
  - `Button`
  - `Checkbox`
  - `InputField`
- app shared component:
  - `AdminTable`
  - `AdminSearchInput`
  - `AdminSelect`
  - `AdminToolbar`
  - `StatusBadge`
  - `Drawer`
  - `ConfirmDialog`
  - `MetricCard`
  - `ActionButton`
- page-local component:
  - restaurant form
  - magazine form
  - dashboard quick link
  - reservation info row
- icon:
  - `HashiPointMarkIcon`
  - `HomeIcon`
  - `TodayRestaurantIcon`
  - `ReservationIcon`
  - `MagazineIcon`
  - `SearchIcon`
  - `PlusIcon`
  - `PencilIcon`
  - `CameraIcon`
  - `ClockIcon`
  - `PeopleIcon`

## Error Handling

- API error:
  - mock scenario `error` rejects list queries
  - table renders retry state
- validation error:
  - login failure renders inline error
  - required fields rely on native form validation
- exceptional case:
  - invalid localStorage session is removed
  - missing root element throws during bootstrap
- user-facing message:
  - Korean admin copy only
- retry or fallback:
  - query retry button calls `refetch`

## Navigation

- entry:
  - `/admin`
- links:
  - LNB NavLink items
  - dashboard quick actions
- route params:
  - none in UI routes
- search params:
  - none in this phase
- success redirect:
  - login to `/admin/dashboard`
- failure redirect:
  - unauthenticated access to `/admin/login`
- back behavior:
  - browser default
- auth redirect:
  - `AdminOnlyRoute`, `GuestOnlyRoute`

## Styling

- Tailwind layout:
  - fixed desktop sidebar
  - table-first dense content
  - border-separated panels
- responsive:
  - mobile topbar and menu overlay
  - horizontal table scroll
- fixed area:
  - sidebar
- scroll area:
  - page body
  - drawer body
  - table overflow-x
  - select dropdowns render above drawer scroll/fixed footer areas and scroll internally when options overflow
- empty/loading/error layout:
  - table state rows preserve column width
  - drawer loading skeleton preserves layout

## QA Transition Notes

- P0 nodes:
  - `N:page:/admin/login`
  - `N:page:/admin/dashboard`
  - `N:guard:AdminOnlyRoute`
  - `N:guard:GuestOnlyRoute`
- P1 nodes:
  - `N:page:/admin/restaurants`
  - `N:page:/admin/reservations`
  - `N:page:/admin/magazines`
  - `N:drawer:RestaurantFormDrawer`
  - `N:drawer:MagazineFormDrawer`
  - `N:drawer:ReservationUserDrawer`
  - `N:modal:ConfirmDialog`
- Micro states:
  - `Loading`
  - `Error`
  - `Empty`
  - `Success`
  - `Filtered`
  - `DialogOpen`
  - `DrawerOpen`

## Verification

- [ ] `OPENAPI_SCHEMA_URL=<admin-raw-schema> pnpm gen:admin-api-types`
- [ ] `node --check apps/admin/scripts/generate-openapi-types.mjs`
- [ ] `git check-ignore -v apps/admin/.env.openapi.local`
- [ ] reservation API contract tests
- [ ] `corepack pnpm --filter @hashi/admin lint`
- [ ] `corepack pnpm --filter @hashi/admin typecheck`
- [ ] `corepack pnpm --filter @hashi/admin build`

- [x] `corepack pnpm format:check`
- [x] `git diff --check`
- [x] `corepack pnpm --filter @hashi/admin lint`
- [x] `corepack pnpm --filter @hashi/admin typecheck`
- [x] `corepack pnpm --filter @hashi/admin build`
- [x] `/admin/login` manual check
- [x] `/admin/dashboard` manual check
- [x] `/admin/restaurants` manual check
- [x] `/admin/reservations` manual check
- [x] `/admin/magazines` manual check
- [x] desktop, tablet, and mobile viewport check
