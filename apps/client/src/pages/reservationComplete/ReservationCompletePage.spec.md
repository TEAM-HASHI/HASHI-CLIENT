# Page Spec: `ReservationComplete`

Jira: HASHI-203

## Purpose

- 예약 요청이 정상 접수되었음을 안내하고, 접수 정보와 예약 진행 단계를 확인한 뒤 예약 상세로 이동할 수 있게 한다.
- 기획 명세: HASHI-PLAN `02_PRODUCT_SPEC/RESERVATION/RESERVATION_REQUEST_COMPLETE` (RSV-004)
- 디자인: Figma `Hashi.kr` node `1735-37371` (예약하기 - 최종 확인 모달 화면)

## Route

- path: `/reservations/:reservationId/complete`
- path constant:
  - `ROUTES.reservationComplete`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.reservationComplete`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `ROUTES.loginRequired`
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no, guard owns auth status

## Location

- page path:
  - `apps/client/src/pages/reservationComplete/ReservationCompletePage.tsx`
- spec path:
  - `apps/client/src/pages/reservationComplete/ReservationCompletePage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`
  - URL helper: `getReservationCompletePath` in `apps/client/src/app/router/routePaths.ts`

## Requirements

- [x] 상단 Header와 뒤로가기 버튼은 두지 않는다.
- [x] Hashi 마크, `식당 예약 요청 완료!` 제목, 접수 순서 안내 문구를 가운데 정렬로 표시한다.
- [x] 예약 진행 단계는 `예약 접수(완료) → Hashi에서 검토(현재) → 예약 확정(예정)`을 가로 순서로 고정 표시한다.
- [x] 예약 접수 정보 카드는 예약자, 인원, 식당 주소, 식당 방문 일정을 예약 상세 조회값으로 표시한다.
- [x] 하단 고정 `확인 완료` CTA는 항상 활성화한다.
- [x] `확인 완료` 선택 시 `/reservations/{reservationId}` 예약 상세로 replace 이동하며, 예약 상세가 뒤로가기 버튼을 숨길 수 있도록 `{ fromReservationRequest: true }` route state를 전달한다.
- [x] 예약 요청 페이지는 예약 생성 성공 시 이 페이지로 replace 이동하므로, 뒤로가기로 예약 요청 화면에 다시 진입하지 않는다.

## Data Dependencies

### Query

- query:
  - `GET /api/v1/reservations/{reservationId}`
  - `features/reservation/useReservationDetailQuery` (예약 상세 페이지와 같은 query key 공유)
- enabled condition:
  - `reservationId` route param이 양의 정수로 파싱될 때
- request params:
  - `reservationId`
- loading state:
  - `LoadingScreen`
- error state:
  - 404: `Empty`로 `예약 정보를 찾을 수 없습니다.`와 `홈으로 돌아가기` 액션을 표시한다.
  - 그 외 오류: route `AsyncBoundary`로 throw해 공통 오류 안내와 재시도를 사용한다.
- empty state:
  - 응답 `data`가 없으면 API 계약 오류로 처리한다.
- refetch condition:
  - React Query 기본 정책을 따른다.

### Mutation

- mutation: none

## User Flow

1. 예약 요청 확인 모달에서 예약 생성에 성공하면 `/reservations/{reservationId}/complete`로 replace 이동한다.
2. 예약 상세 조회값으로 완료 안내, 진행 단계, 접수 정보를 표시한다.
3. `확인 완료`를 누르면 예약 상세로 replace 이동한다.

## State

- local state: none
- form state: none
- URL state:
  - `reservationId`
- server state:
  - 예약 상세 API 응답
- derived state:
  - 접수 정보 항목: `features/reservation/createReservationReceiptInfoItems`

## Validation

- route param:
  - `reservationId`가 양의 정수가 아니면 query를 실행하지 않고 `NotFoundPage`를 표시한다.

## UI Structure

```text
ReservationCompletePage
  CompleteMessage (HashiPointMarkIcon, h1, description)
  ReservationCompleteProgress
  Divider
  ReceiptInfoCard (dl)
  Fixed bottom CTA (Button)
```

## Component Mapping

- HDS component:
  - `Button`
- app shared component:
  - `Empty`
  - `LoadingScreen`
- feature hook/util:
  - `useReservationDetailQuery`
  - `parseReservationId`
  - `createReservationReceiptInfoItems`
- page-local component:
  - `ReservationCompleteProgress`
- icon:
  - `HashiPointMarkIcon`
  - `CheckIcon`

## Error Handling

- API error:
  - 404는 페이지 내부 `Empty` 상태로 처리한다.
  - 5xx/network/timeout은 route ErrorBoundary에서 처리한다.
- validation error: none
- exceptional case:
  - `reservationId`가 유효하지 않으면 `NotFoundPage`
- user-facing message:
  - `예약 정보를 찾을 수 없습니다.`
- retry or fallback:
  - 공통 `AsyncBoundary` 재시도

## Navigation

- entry:
  - 예약 요청 확인 모달의 예약 생성 성공 (`replace`)
- links:
  - 예약 상세: `getReservationDetailPath(reservationId)`
  - 예약 없음 상태의 홈: `ROUTES.home`
- route params:
  - `reservationId`
- search params: none
- success redirect:
  - `확인 완료` → 예약 상세 (`replace`, `{ fromReservationRequest: true }`)
- failure redirect: none
- back behavior:
  - 브라우저 뒤로가기는 예약 요청 페이지가 replace되어 있으므로 요청 화면으로 돌아가지 않는다.
- auth redirect:
  - `AuthOnlyRoute`가 처리

## Styling

- Tailwind layout:
  - 모바일 단일 컬럼, 완료 메시지 좌우 40px, 접수 정보 카드 좌우 20px
  - 진행 단계 그래픽 300px 가운데 정렬
  - 8px `cool-gray-50` 구분 띠
- responsive:
  - 앱 모바일 프레임 기준
- fixed area:
  - 하단 CTA: `app-mobile-fixed-bottom`, padding 16/20/49 + safe area
- scroll area:
  - 본문은 CTA에 가리지 않도록 하단 여백을 가진다.
- empty/loading/error layout:
  - loading: `LoadingScreen`
  - not found: `Empty`
  - invalid id: `NotFoundPage`

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 예약 생성 성공 → 완료 화면 → 확인 완료 → 예약 상세 이동 확인
- [x] 잘못된 `reservationId`, 404, loading 상태 확인
- [x] bottom navigation layout 미포함 확인
