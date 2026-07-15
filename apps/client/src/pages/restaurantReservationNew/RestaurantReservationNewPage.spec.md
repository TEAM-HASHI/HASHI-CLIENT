# Page Spec: `RestaurantReservationNew`

Jira: HASHI-78

## Purpose

- 로그인한 사용자가 식당 상세 페이지에서 예약 정보를 입력하고 예약 요청 확인 화면으로 이동할 수 있게 한다.
- 식당 요약·매장 정보 API를 조회해 실제 식당 정보와 영업시간을 예약 입력에 사용한다.

## Route

- path: `/restaurants/:restaurantId/reservations/new`
- path constant:
  - `ROUTES.restaurantReservationNew`
- route owner: `apps/client/src/routes.ts`
- layout: `RootLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- route module:
  - `apps/client/src/app/routes/restaurant-reservation-new.tsx`
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
  - `apps/client/src/routes.ts`
  - `apps/client/src/app/routes/restaurant-reservation-new.tsx`

## Requirements

- [x] 상단에 `예약하기` 제목과 뒤로가기 버튼을 모바일 프레임 상단에 고정해 보여준다.
- [x] 뒤로가기 버튼은 `navigate(-1)`을 실행한다.
- [x] 식당 이미지 영역과 식당명을 보여주고, 이미지 URL이 없거나 로드에 실패하면 검은색 `HashiPlaceholderIcon`을 표시한다.
- [x] 예약자명 입력 필드를 보여준다.
- [x] 인원 선택은 어른, 청소년, 어린이 카운터를 보여준다.
- [x] 인원 수는 0명 아래로 내려가지 않는다.
- [x] 날짜 달력은 현재 월을 초기 표시 월로 사용한다.
- [x] 날짜 달력 헤더는 연도와 월을 2줄로 보여준다.
- [x] 오늘 및 오늘 이전 날짜는 선택할 수 없다.
- [x] 내일 이후 날짜를 선택하면 선택 상태를 표시한다.
- [x] 날짜를 변경하면 이전에 선택한 시간은 해제한다.
- [x] 시간 목록은 선택 날짜에 해당하는 식당 영업시간과 30분 예약 간격으로 생성한다.
- [x] 휴무이거나 영업시간이 없는 날짜는 선택할 수 없다.
- [x] 브레이크 타임에 포함되는 시간은 예약 시간 목록에서 제외한다.
- [x] 날짜가 선택되기 전에는 시간 버튼을 비활성화한다.
- [x] 선택한 시간만 선택 상태를 표시한다.
- [x] 요청사항은 HDS 박스형 textarea 기반의 선택 입력값으로 보여준다.
- [x] 요청사항은 최대 1000자까지 입력할 수 있고 현재 글자 수를 `0/1000` 형식으로 표시한다.
- [x] 빨간 오류 문구는 렌더링하지 않는다.
- [x] 필수값이 모두 확정되지 않으면 하단 `다음` CTA를 비활성화한다.
- [x] 활성화된 CTA 제출 시 `/reservations/request`로 이동한다.

## Data Dependencies

### Query

- query:
  - `GET /api/v1/restaurants/{restaurantId}/summary`
  - `GET /api/v1/restaurants/{restaurantId}/store-information`
- query key:
  - `restaurantDetailQueryKeys.main(restaurantId)`
  - `restaurantDetailQueryKeys.storeInformation(restaurantId)`
- request params: 양의 정수로 변환한 route `restaurantId`
- loading state: 두 query를 `useSuspenseQueries`로 병렬 실행하고 route Suspense fallback을 사용한다.
- error state: 공통 query 오류 정책과 route ErrorBoundary를 사용한다.
- empty state: 예약 필수 응답 필드가 없으면 잘못된 API 응답으로 실패 처리한다.
- refetch condition: 공통 TanStack Query stale 정책을 따른다.

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
  - 식당 요약: 이름, 주소, 이미지, 예약 수수료
  - 매장 정보: 요일별 영업시간, 브레이크 타임, 휴무 여부
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
  - rule: 내일 이후이며 해당 요일에 유효한 영업시간이 있는 날짜
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
    ReservationUnderlineTextField
    GuestCounter x 3
    Calendar
    ReservationTimeSelector
    ReservationRequestNoteField
  ReservationBottomBar
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Button`
  - `Calendar`
  - `Textarea` (`ReservationRequestNoteField` 내부)
- app shared component:
  - none
- feature component:
  - `GuestCounter`
  - `ReservationUnderlineTextField`
  - `ReservationRequestNoteField`
  - `ReservationTimeSelector`
  - `ReservationBottomBar`
- page-local component:
  - `ReservationRestaurantSummary`
- icon:
  - `BackIcon`
  - `HashiPlaceholderIcon`

## Error Handling

- API error:
  - 식당 조회의 5xx/network/timeout은 route ErrorBoundary에서 처리한다.
  - 404와 잘못된 응답은 공통 오류 정책에 따라 실패 상태로 처리한다.
- validation error:
  - visible error message 없음
  - CTA disabled 상태로만 표현
- exceptional case:
  - `restaurantId`가 양의 정수가 아니면 API를 호출하지 않고 오류로 처리한다.
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
  - Header wrapper는 `app-mobile-fixed-top z-fixed bg-white`로 모바일 프레임 상단에 고정한다.
  - 하단 CTA bar는 `app-mobile-fixed-bottom`
- scroll area:
  - 본문은 CTA에 가리지 않도록 하단 padding을 가진다.
- empty/loading/error layout:
  - route `AsyncBoundary`의 loading/error UI를 사용한다.

## Verification

- [ ] 요청사항을 1000자까지만 입력할 수 있고 글자 수 counter가 표시된다.
- [ ] 요청사항이 예약 확인 draft에 포함된다.
- [ ] 식당 요약 응답의 ID, 이름, 주소, 이미지, 예약 수수료가 draft에 포함된다.
- [ ] 선택 날짜의 영업시간으로 예약 시간 목록을 생성한다.
- [ ] 휴무일과 브레이크 타임에는 예약할 수 없다.
- [ ] `pnpm --filter @hashi/client lint`
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client build`
- [ ] `pnpm --filter @hashi/client test`
- [ ] 주요 사용자 흐름 수동 확인
- [ ] route path / params / search params 확인
- [ ] access guard / redirect 확인
- [ ] bottom navigation layout 미포함 확인
- [ ] disabled / selected / submit 이동 상태 확인
