# Page Spec: `AdminConsole`

## Purpose

- HASHI-91 범위에서 API 확정 전 임시 관리자 콘솔을 제공합니다.
- 운영자가 식당, 예약, 매거진 데이터를 desktop dashboard 형태로 확인하고 mock interaction을 검증할 수 있게 합니다.

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

## Data Dependencies

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
  - mock scenario: `success | empty | error`
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
  - API fields are represented by `adminTypes.ts`
- submit enabled condition:
  - login requires email and password
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

### Restaurant Admin API Contract

- endpoint:
  - create: `POST /api/v1/admin/restaurants`
  - update: `PATCH /api/v1/admin/restaurants/{restaurantId}`
  - delete: `DELETE /api/v1/admin/restaurants/{restaurantId}`
- auth:
  - `Authorization: Bearer {accessToken}`
  - `ROLE_ADMIN`
- request DTO:
  - `CreateRestaurantRequest`
  - `UpdateRestaurantRequest`
  - images use S3 uploaded `fileKey`, not raw files
  - update sends only changed fields; omitted fields keep existing values
- response DTO:
  - all responses use `AdminApiResponse<TData>`
  - create success returns `CreateRestaurantResponseData` with `restaurantId`
  - update/delete success returns `data: null`
- error handling:
  - validation errors may include `errors[]`
  - delete can fail with `RESTAURANT-006` when active reservations prevent deletion
- implementation boundary:
  - actual HTTP calls live in `apps/admin/src/shared/api/restaurantApi.ts`
  - current UI still uses `mockStore` through `adminService` until API integration is enabled

### Reservation Admin API Contract

- endpoint:
  - list: `GET /api/v1/admin/reservations`
  - status update: `POST /api/v1/admin/reservations/{reservationId}/status`
  - user lookup: `GET /api/v1/admin/reservations/{reservationId}/user`
- auth:
  - `Authorization: Bearer {accessToken}`
  - `ROLE_ADMIN`
- request DTO:
  - list uses `ListReservationsRequest`
  - status update uses `UpdateReservationStatusRequest` with uppercase API status values
  - user lookup has no request body
- response DTO:
  - all responses use `AdminApiResponse<TData>`
  - list success returns `ListReservationsResponseData`
  - status update success returns `UpdateReservationStatusResponseData`
  - user lookup success returns `ReservationUserResponseData`
- UI mapping:
  - reservation list renders API fields: `appliedAt`, `reservedAt`, `reservationStatus`, `paymentStatus`, `restaurant`, `user`, adult/teen/child counts, and `amount`
  - status filters and status mutation use uppercase API status values
  - user drawer renders `ReservationUserResponseData.user` fields only
- query params:
  - `status`
  - `reservedFrom`
  - `reservedTo`
  - `page`
  - `size`
- error handling:
  - validation errors may include `errors[]`
  - status update can fail with conflict when the requested transition is not allowed
  - reservation user lookup can fail when the reservation or linked user is missing
- no-show:
  - current contract has no no-show status, flag, count, or update endpoint
  - admin UI must not expose no-show action or confirmed no-show metrics until an API contract is added
- implementation boundary:
  - actual HTTP calls live in `apps/admin/src/shared/api/reservationApi.ts`
  - current UI uses API-shaped mock reservation data until API integration is enabled

### Magazine Admin API Contract

- endpoint:
  - create: `POST /api/v1/admin/magazines`
  - update: `PATCH /api/v1/admin/magazines/{magazineId}`
- auth:
  - `Authorization: Bearer {accessToken}`
  - `ROLE_ADMIN`
- request DTO:
  - create uses `CreateMagazineRequest`
  - update uses `UpdateMagazineRequest`
  - required create fields are `title`, `region`, `series`, `genre`, and `bannerImageKey`
  - `cards[]` uses `{ imageKey, displayOrder }`
  - `restaurants[]` uses `{ restaurantId, displayOrder }`
  - image fields use S3 object keys, not raw files
  - update replaces all cards/restaurants only when those arrays are sent
- response DTO:
  - all responses use `AdminApiResponse<TData>`
  - create success returns `CreateMagazineResponseData`
  - update success returns `UpdateMagazineResponseData`
  - response includes `bannerUrl`, `cardCount`, and `restaurantCount`
- UI mapping:
  - magazine list renders API-shaped fields: title, region, series, genre, banner URL, card count, restaurant count, and updated time
  - magazine form creates banner key, card image keys, and related restaurant IDs in the same shape as the request body
  - current allowed values for `region`, `series`, and `genre` are temporary UI assumptions until backend enum values are finalized
- error handling:
  - validation errors may include `errors[]`
  - create/update can fail when a related restaurant ID does not exist
- implementation boundary:
  - actual HTTP calls live in `apps/admin/src/shared/api/magazineApi.ts`
  - current UI uses API-shaped mock magazine data until API integration is enabled

## User Flow

1. User enters `/admin`.
2. Unauthenticated user is redirected to `/admin/login`.
3. User submits valid mock credentials.
4. User lands on `/admin/dashboard`.
5. User navigates through LNB to restaurants, reservations, and magazines.
6. User searches, filters, opens drawers/dialogs, and confirms mock mutations.
7. Mutation success invalidates the relevant query and refreshes the table.
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
  - TanStack Query backed by mock store
- derived state:
  - filtered and sorted table rows use render-time calculation or `useMemo`
  - search uses `useDeferredValue`

## Validation

- login email:
  - rule: non-empty, email input type
  - error message: browser validation or login failure message
- login password:
  - rule: non-empty
  - error message: `관리자 계정 정보를 확인해주세요.` when password is `fail`
- restaurant fields:
  - rule: required API fields for name, description, address, area, genre, thumbnail file key, reservation fee, price range, and business hours
  - rule: optional API fields for local name, extra image file keys, menus, curation types, and active exposure
  - business hours start with Monday through Sunday rows; operators mark closed days instead of adding one day at a time
  - business hour time fields use hour/minute selectors and serialize to `HH:mm`
  - submit condition: final save blocks when required fields are missing and moves the operator to the first incomplete step
- magazine fields:
  - rule: required API fields for title, region, series, genre, and banner image key
  - rule: optional API fields for content, card news image keys, and related restaurants
  - rule: card and restaurant `displayOrder` values are 0 or greater
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
