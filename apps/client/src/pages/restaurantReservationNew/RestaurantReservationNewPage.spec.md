# Page Spec: `RestaurantReservationNew`

Jira: HASHI-78

## Purpose

- 로그인한 사용자가 식당 상세 페이지에서 예약 정보를 입력하고 예약 요청 확인 화면으로 이동할 수 있게 한다.
- 이번 범위는 API 연동 없이 화면 UI, 로컬 입력 상태, CTA 활성/비활성, 다음 화면 이동까지 포함한다.

## Route

- path: `/restaurants/:restaurantId/reservations/new`
- path constant:
  - `ROUTES.restaurantReservationNew`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.restaurantReservationNew`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `ROUTES.loginRequired`
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no, guard owns auth status

## Location

- page path:
  - `apps/client/src/pages/restaurantReservationNew/RestaurantReservationNewPage.tsx`
- spec path:
  - `apps/client/src/pages/restaurantReservationNew/RestaurantReservationNewPage.spec.md`
- route registration:
  - existing `apps/client/src/app/router/path.ts`
  - existing `apps/client/src/app/router/lazy.ts`
  - existing `apps/client/src/app/router/routes.ts`

## Requirements

- [x] 상단에 `예약하기` 제목과 뒤로가기 버튼을 보여준다.
- [x] 뒤로가기 버튼은 `navigate(-1)`을 실행한다.
- [x] 식당 이미지 영역과 식당명을 보여준다.
- [x] 예약자명 입력 필드를 보여준다.
- [x] 인원 선택은 어른, 청소년, 어린이 카운터를 보여준다.
- [x] 인원 수는 0명 아래로 내려가지 않는다.
- [x] 날짜 달력은 현재 월을 초기 표시 월로 사용한다.
- [x] 날짜 달력 헤더는 연도와 월을 2줄로 보여준다.
- [x] 오늘 및 오늘 이전 날짜는 선택할 수 없다.
- [x] 내일 이후 날짜를 선택하면 선택 상태를 표시한다.
- [x] 시간 목록은 식당 mock의 영업시간과 예약 간격으로 생성한다.
- [x] 날짜가 선택되기 전에는 시간 버튼을 비활성화한다.
- [x] 선택한 시간만 선택 상태를 표시한다.
- [x] 요청사항은 선택 입력값으로 보여준다.
- [x] 빨간 오류 문구는 렌더링하지 않는다.
- [x] 필수값이 모두 확정되지 않으면 하단 `예약하기` CTA를 비활성화한다.
- [x] 활성화된 CTA 제출 시 `/reservations/request`로 이동한다.

## Data Dependencies

### Query

- query: none
- enabled condition: none
- request params: none
- loading state: none
- error state: none
- empty state: none
- refetch condition: none

### Mutation

- mutation: none
- request data: none
- submit enabled condition:
  - 예약자명 `trim()` 결과가 1글자 이상
  - 총 인원 수가 1명 이상
  - 내일 이후 날짜 선택
  - 시간 선택
- success handling:
  - `navigate(ROUTES.reservationRequest, { state: reservationDraft })`
- failure handling:
  - none, disabled CTA prevents invalid submit

## State

- local state:
  - `guestName`
  - `guestCounts`
  - `visibleMonth`
  - `selectedDate`
  - `selectedTime`
  - `requestNote`
  - owner: `useRestaurantReservationForm`
- form state:
  - page-local React state
  - `react-hook-form`, `zod`는 이번 티켓에서 추가하지 않는다.
- URL state:
  - `restaurantId` route param
- server state:
  - none
- derived state:
  - `totalGuestCount`
  - `isGuestNameValid`
  - `isSelectedDateValid`
  - `isSubmitEnabled`
  - owner: `useRestaurantReservationForm`

## Validation

- `guestName`
  - rule: `trim()` 결과가 1글자 이상
  - error message: none
- `guestCounts`
  - rule: 총합 1명 이상
  - error message: none
- `selectedDate`
  - rule: 내일 이후 날짜
  - error message: none
- `selectedTime`
  - rule: 시간 선택됨
  - error message: none
- submit enabled condition:
  - 모든 필수 rule이 true

## UI Structure

```text
RestaurantReservationNewPage
  useReservationRestaurant
  useRestaurantReservationForm
  Header
  ReservationRestaurantSummary
  Form
    UnderlineTextField
    GuestCounter x 3
    Calendar
    ReservationTimeSelector
    UnderlineTextField
  ReservationBottomBar
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Button`
  - `Calendar`
- app shared component:
  - none
- feature component:
  - `GuestCounter`
- page-local component:
  - `ReservationRestaurantSummary`
  - `UnderlineTextField`
  - `ReservationTimeSelector`
  - `ReservationBottomBar`
- icon:
  - `BackIcon`

## Error Handling

- API error: none
- validation error:
  - visible error message 없음
  - CTA disabled 상태로만 표현
- exceptional case:
  - `restaurantId`가 mock에 없으면 기본 식당 데이터를 사용한다.
- user-facing message: none
- retry or fallback: none

## Navigation

- entry:
  - 식당 상세 페이지의 예약하기 버튼
- links:
  - none
- route params:
  - `restaurantId`
- search params:
  - none
- success redirect:
  - `ROUTES.reservationRequest`
- failure redirect:
  - none
- back behavior:
  - `navigate(-1)`
- auth redirect:
  - unauthenticated users redirect to `ROUTES.loginRequired` through `AuthOnlyRoute`

## Styling

- Tailwind layout:
  - mobile-first, `RootLayout` mobile frame 기준
  - 좌우 24px content padding
- responsive:
  - app mobile frame width를 따른다.
- fixed area:
  - 하단 CTA bar는 `app-mobile-fixed-bottom`
- scroll area:
  - 본문은 CTA에 가리지 않도록 하단 padding을 가진다.
- empty/loading/error layout:
  - API 연동이 없으므로 없음

## Verification

- [ ] `pnpm --filter @hashi/client lint`
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client build`
- [ ] `pnpm --filter @hashi/client test`
- [ ] 주요 사용자 흐름 수동 확인
- [ ] route path / params / search params 확인
- [ ] access guard / redirect 확인
- [ ] bottom navigation layout 미포함 확인
- [ ] disabled / selected / submit 이동 상태 확인
