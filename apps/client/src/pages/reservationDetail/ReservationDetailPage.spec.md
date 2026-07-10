# Page Spec: `ReservationDetailPage`

## Purpose

- 사용자가 예약 상세 상태와 접수 정보를 확인할 수 있는 페이지입니다.
- 예약 진행 단계, 예약 접수 정보, 예약 안내 문구, 하단 액션을 한 화면에서 제공합니다.
- 현재는 API 연동 전 mock 데이터로 화면을 구성합니다.
- `useReservationDetailPage`에서 `reservationId` route param을 읽어두며, 추후 해당 값을 기반으로 예약 상세 API 조회로 교체합니다.

## Route

- path: `/reservations/:reservationId`
- path constant:
  - `ROUTES.reservationDetail`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - bottom navigation layout 없음
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.reservationDetail`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `/login-required`
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: route guard에서 처리

## Location

- page path:
  - `apps/client/src/pages/reservationDetail/ReservationDetailPage.tsx`
- spec path:
  - `apps/client/src/pages/reservationDetail/ReservationDetailPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [ ] 상단 Header는 스크롤해도 유지됩니다.
- [ ] Header의 뒤로가기 버튼은 이전 페이지로 이동합니다.
- [ ] 예약 신청일과 식당 요약 정보를 표시합니다.
- [ ] 예약 진행 상태는 `completed`, `current`, `pending` 상태를 구분해서 표시합니다.
- [ ] 예약 접수 정보 카드는 예약자, 인원, 식당 주소, 식당 방문 일정, 수수료를 표시합니다.
- [ ] 예약 안내 문구는 고정 정책 문구로 표시합니다.
- [ ] 하단 액션 영역은 스크롤해도 유지됩니다.
- [ ] 하단 액션에는 `예약 취소하기`, `문의하기` 버튼을 표시합니다.
- [ ] 식당 이미지가 없으면 공통 `DefaultImage`를 사용합니다.
- [ ] fixed Header와 fixed ActionBar는 z-index 토큰을 사용합니다.

## Data Dependencies

### Query

- query:
  - 현재 없음
  - 추후 예약 상세 조회 API로 교체 예정
- enabled condition:
  - `reservationId` route param이 존재할 때 API query를 활성화합니다.
- request params:
  - `reservationId`
- loading state:
  - API 연동 시 정의
- error state:
  - API 연동 시 정의
- empty state:
  - 예약 상세 데이터가 없는 경우 404 또는 에러 상태로 처리하는 방향을 API 연동 시 확정
- refetch condition:
  - API 연동 시 정의

### Mutation

- mutation:
  - 예약 취소 요청
- request data:
  - 예약 취소: `reservationId`
- submit enabled condition:
  - API 연동 시 예약 상태에 따라 정의
- success handling:
  - 예약 취소 확인 후 예약 정보 페이지의 진행 중 상태(`/my-reservations?status=IN_PROGRESS`)로 이동합니다.
  - API 연동 시 toast 또는 페이지 상태 갱신이 필요하면 함께 처리합니다.
- failure handling:
  - API 연동 시 toast 또는 user-facing error로 처리

## User Flow

1. 사용자가 예약 정보 페이지 또는 관련 진입점에서 예약 상세 페이지로 이동합니다.
2. 라우터가 `/reservations/:reservationId` route를 매칭합니다.
3. 비회원이면 `AuthOnlyRoute`에 의해 `/login-required`로 이동합니다.
4. 회원이면 예약 상세 페이지를 렌더링합니다.
5. 사용자는 예약 진행 상태, 예약 접수 정보, 안내 문구를 확인합니다.
6. 사용자가 뒤로가기 버튼을 누르면 이전 페이지로 이동합니다.
7. 사용자가 예약 취소 버튼을 누르면 예약 취소 확인 모달이 열립니다.
8. 사용자가 모달에서 취소하기를 누르면 예약 정보 페이지의 진행 중 상태로 이동합니다.
9. 사용자가 문의하기 버튼을 누르면 Hashi 카카오톡 문의 링크를 새 창으로 엽니다.

## State

- local state:
  - `isCancelDialogOpen`
- form state:
  - 없음
- URL state:
  - `reservationId`
  - 현재 hook에서 읽고 있으며, mock 단계에서는 API 요청에 사용하지 않습니다.
- server state:
  - 현재 mock 데이터
  - 추후 예약 상세 API 응답
- derived state:
  - 예약 진행 단계별 상태 스타일
  - 예약 접수 정보 카드 item 배열
  - `식당 컨택 중` 단계가 current이면 현재 dot에 `animate-reservation-progress-dot`을 적용합니다.

## Validation

- route param:
  - `reservationId`
  - 현재 mock 단계에서는 읽기만 하고 검증하지 않음
  - API 연동 시 누락 또는 유효하지 않은 값에 대한 처리 기준을 추가합니다.
- submit enabled condition:
  - 현재 없음

## Route Param Policy

- `reservationId`는 예약 상세 조회를 위한 필수 route param입니다.
- 현재 mock 단계에서는 `useParams`로 `reservationId`를 읽어두지만, mock 데이터 조회에는 사용하지 않습니다.
- API 연동 시 `reservationId`를 예약 상세 조회 API의 request param으로 사용합니다.
- `reservationId`가 없거나 형식이 유효하지 않은 경우 404 페이지로 이동합니다.
- `reservationId`는 형식 검증을 먼저 수행하고, 실제 존재 여부와 접근 권한은 서버 응답을 기준으로 처리합니다.
- 서버에서 예약 없음 응답을 내려주면 404 페이지로 이동합니다.
- 서버에서 권한 없음 응답을 내려주면 인증/권한 정책에 맞는 화면으로 이동합니다.

## UI Structure

```text
ReservationDetailPage
  Header
    BackAction
    Title
  ReservationProgressSection
    ReservationRestaurantSummary
    ProgressSteps
  ReservationReceiptInfoCard
  ReservationNoticeSection
  ReservationDetailActionBar
    CancelButton
    ContactButton
  ReservationCancelDialog
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Button`
- app shared component:
  - `DefaultImage`
- feature component:
  - `ReservationCancelDialog`
- page-local component:
  - `ReservationProgressSection`
  - `ReservationRestaurantSummary`
  - `ReservationReceiptInfoCard`
  - `ReservationNoticeSection`
  - `ReservationDetailActionBar`
- page-local hook:
  - `useReservationDetailPage`
- page-local constants:
  - `reservationNotices`
- page-local mock:
  - `reservationDetail.mock.ts`
- icon:
  - `BackIcon`

## Error Handling

- API error:
  - API 연동 시 정의합니다.
- validation error:
  - 현재 없음
- exceptional case:
  - `reservationId`가 없거나 유효하지 않은 경우 API 연동 시 404 또는 에러 상태로 처리합니다.
- user-facing message:
  - API 연동 시 정의합니다.
- retry or fallback:
  - API 연동 시 정의합니다.

## Navigation

- entry:
  - 예약 정보 페이지의 상세보기 액션
  - 예약 관련 진입점
- links:
  - 문의하기: Hashi 카카오톡 문의 링크
- route params:
  - `reservationId`
- search params:
  - 없음
- success redirect:
  - 없음
- failure redirect:
  - 비회원 접근 시 `/login-required`
- back behavior:
  - `navigate(-1)`
- auth redirect:
  - `AuthOnlyRoute`가 처리

## Styling

- Tailwind layout:
  - 모바일 단일 컬럼 레이아웃
  - 본문 좌우 padding은 페이지 레벨에서 관리
- responsive:
  - 앱 모바일 프레임 기준을 따릅니다.
- fixed area:
  - Header: `app-mobile-fixed-top`
  - ActionBar: `app-mobile-fixed-bottom`
  - fixed 영역은 z-index 토큰을 사용합니다.
- scroll area:
  - Header와 ActionBar를 제외한 본문 영역이 스크롤됩니다.
  - fixed Header와 ActionBar에 가려지지 않도록 본문 상단/하단 여백을 둡니다.
- empty/loading/error layout:
  - API 연동 시 정의합니다.

## Verification

- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client lint`
- [ ] `/reservations/:reservationId` route 접근 확인
- [ ] 비회원 접근 시 `/login-required` redirect 확인
- [ ] Header fixed 동작 확인
- [ ] ActionBar fixed 동작 확인
- [ ] 예약 진행 상태별 UI 확인
- [ ] 식당 이미지 fallback 확인
- [ ] 뒤로가기 버튼 동작 확인
