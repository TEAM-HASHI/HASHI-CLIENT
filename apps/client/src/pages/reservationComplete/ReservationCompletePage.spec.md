# Page Spec: `ReservationComplete`

Jira: HASHI-203

## Purpose

- 예약 요청이 정상 접수되었음을 안내하고, 접수 정보와 예약 진행 단계를 확인한 뒤 홈으로 이동할 수 있게 한다.
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
- [x] 예약 접수 정보 카드는 예약자, 인원, 식당 주소, 식당 방문 일정을 예약 생성 성공 응답으로 표시한다.
- [x] 하단 고정 `확인 완료` CTA는 항상 활성화한다.
- [x] `확인 완료`와 브라우저·디바이스 뒤로가기는 완료 응답을 제거하고 홈으로 replace 이동한다.
- [x] 예약 생성 성공 후에만 접근한다. 직접 접근·새로고침·필수 응답 누락은 홈으로 replace 이동하며 예약 상세를 재조회하지 않는다.

## Data Dependencies

### Query

- 네트워크 query: 없음.
- 생성 성공 응답을 `reservationCompletionQueryKeys.detail(reservationId)`에 메모리로 보관한다.
- `history.state`, localStorage, sessionStorage에 생성 응답을 저장하지 않는다.
- 완료 페이지는 `QueryClient.getQueryData`로 해당 응답만 읽는다.
- 응답의 ID 일치, 예약자명, 주소, 방문 일정, 상태, 유효 인원 수를 확인한다.
- 응답 부재·필수 값 누락·잘못된 route param은 홈으로 replace 이동한다.

### Mutation

- mutation: none

## User Flow

1. 예약 요청 확인 모달에서 예약 생성에 성공하면 `/reservations/{reservationId}/complete`로 replace 이동한다.
2. 생성 응답으로 완료 안내, 진행 단계, 접수 정보를 표시한다.
3. `확인 완료` 또는 브라우저 뒤로가기는 완료 응답을 제거하고 홈으로 replace 이동한다.

## State

- local state: none
- form state: none
- URL state:
  - `reservationId`
- server state:
  - 예약 생성 성공 응답 (메모리)
- derived state:
  - 접수 정보 항목: `features/reservation/createReservationReceiptInfoItems`

## Validation

- route param:
  - `reservationId`가 양의 정수가 아니거나 해당 생성 응답이 없으면 홈으로 replace 이동한다.

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
- feature hook/util:
  - `reservationCompletionQueryKeys`
  - `checkIsReservationCompletionResponse`
  - `parseReservationId`
  - `createReservationReceiptInfoItems`
- page-local component:
  - `ReservationCompleteProgress`
- icon:
  - `HashiPointMarkIcon`
  - `CheckIcon`

## Error Handling

- 완료 페이지에서 API 요청·조회 오류·재시도 UI는 없다.
- 응답이 유효하지 않으면 홈으로 이동한다.

## Navigation

- entry: 예약 생성 성공 후 `/reservations/{reservationId}/complete`로 replace 이동.
- success redirect: `확인 완료` → `ROUTES.home` (`replace`).
- back behavior: `useBlocker`로 POP을 감지하고 `ROUTES.home`으로 replace 이동.
- 완료 응답은 확인 또는 뒤로가기 때 제거하여 같은 URL 재진입을 막는다.
- auth redirect: `AuthOnlyRoute`가 처리한다.

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
  - 별도 loading·오류 화면 없이 유효하지 않은 생성 응답은 홈으로 이동한다.

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 예약 생성 성공 → 완료 화면 → 확인 완료 → 홈 이동 확인
- [x] 추가 상세 API 없이 생성 응답 표시, 확인·브라우저 뒤로가기 홈 이동, 완료 재진입 차단, 직접 진입·새로고침·필수 응답 누락 홈 이동 테스트
- [x] bottom navigation layout 미포함 확인
