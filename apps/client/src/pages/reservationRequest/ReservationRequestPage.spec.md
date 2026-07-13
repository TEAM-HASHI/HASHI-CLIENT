# ReservationRequestPage Spec

## Purpose

`/reservations/request`에서 예약자가 입력한 예약 정보를 확인하고, 보유 포인트를 적용한 뒤 최종 예약 진행 전 확인 모달을 보여준다.

예약 확인 모달에서 일반 예약 또는 어디든 예약 생성 API를 호출하고, 성공 응답의 예약 ID로 상세 화면에 이동한다.

보유 포인트 조회 API를 사용하고, 예약 생성 성공 후 포인트 잔액 query를 무효화한다.

## Route

- path: `/reservations/request`
- path constant: `ROUTES.reservationRequest`
- access: `authOnly`
- guard: `AuthOnlyRoute`
- bottom navigation: 없음
- route/lazy/routes 등록은 이미 존재하므로 변경하지 않는다.

## Source Design

- Figma node `2088:37445`: 포인트 미적용 상태
- Figma node `2094:63123`: 포인트 적용 상태
- Figma node `1735:37425`: 예약 진행 확인 모달
- Figma node `3313:74992`: 어디든 예약 식당 이미지 placeholder

## Data Dependencies

이전 예약하기 화면에서 `location.state`로 전달한 예약 draft를 사용한다.

```ts
type ReservationRequestDraft =
  | RestaurantReservationRequestDraft
  | AnywhereReservationRequestDraft

interface ReservationRequestDraftBase {
  restaurantName: string
  guestName: string
  guests: {
    adult: number
    teen: number
    child: number
  }
  date: string
  time: string
  requestNote: string
}

interface RestaurantReservationRequestDraft extends ReservationRequestDraftBase {
  source?: 'restaurant'
  restaurantId: string
  restaurantAddress: string
  restaurantImageUrl: string | null
  reservationFee: number
}

interface AnywhereReservationRequestDraft extends ReservationRequestDraftBase {
  source: 'anywhere'
  restaurantId: null
  restaurantAddress: string
  restaurantImageUrl: null
}
```

직접 URL 진입처럼 `location.state`가 없거나 draft shape이 맞지 않으면 mock 예약을 표시하지 않고 홈으로 replace 이동한다.

보유 포인트는 `GET /api/v1/points/me`를 `pointQueryKeys.myBalance()`로 조회한다. 일반 예약의 결제 기준 금액은 식당 요약 API에서 draft로 전달한 `reservationFee`를 사용하고, 어디든 예약은 기본 수수료 4,000원을 사용한다.

- query mode: 페이지 렌더링에 필요한 값이므로 `useSuspenseQuery`를 사용한다.
- loading state: route Suspense fallback을 사용한다.
- error state: 공통 query 오류 정책과 route ErrorBoundary를 사용한다.
- empty state: 응답 data 또는 `balance`가 없으면 보유 포인트 0으로 표시한다.

예약 확인 모달에서 `예약`을 누르면 draft 유형에 맞는 API를 호출한다.

```http
POST /api/v1/reservations
POST /api/v1/reservations/anywhere
```

- `reservedAt`: draft의 `date`와 `time`을 `YYYY-MM-DDTHH:mm:ss`로 결합한다.
- `usedPoint`: 현재 화면에서 선택한 사용 포인트다.
- `amount`: 일반 예약은 `reservationFee - usedPoint`, 어디든 예약은 `4000 - usedPoint`다.
- 일반 예약은 문자열 route param을 양의 정수 `restaurantId`로 변환한다.
- 어디든 예약은 draft의 `restaurantName`, `restaurantAddress`를 전송한다.
- 빈 요청사항은 생략한다.
- 성공 응답에 `reservationId`가 없으면 실패로 처리한다.
- 생성 응답은 `reservationId`만 보장하고 최신 포인트 잔액이나 완전한 예약 상세 객체를 제공하지 않는다.
- 같은 화면에 즉시 반영할 완전한 객체가 없고 성공 후 상세 화면으로 이동하므로 `setQueryData`는 사용하지 않는다.
- 생성 성공 시 `pointQueryKeys.myBalance()`를 무효화한 뒤 예약 상세 화면으로 이동한다.
- 예약 상세/목록 API query는 아직 없으므로 speculative cache key나 cache write를 추가하지 않는다.

공통 API 클라이언트는 `localStorage`의 `accessToken`을 우선 사용한다. 로그인 연동 전 로컬 개발에서는 ignored `.env.local`의 `VITE_DEV_USER_ACCESS_TOKEN`을 fallback으로 사용할 수 있으며 운영 빌드에서는 이 fallback을 사용하지 않는다.

## Requirements

### 상단 네비게이션

- HDS `Header`, `IconButton`, `BackIcon`을 사용한다.
- 상단 네비게이션은 `app-mobile-fixed-top`, `z-fixed`로 화면 상단에 고정한다.
- 본문은 고정 헤더 높이만큼 상단 여백을 둔다.
- title은 `예약하기`다.
- 뒤로가기 클릭 시 `navigate(-1)`을 호출한다.

### 예약 정보 확인

다음 항목을 표시한다.

- 식당 이미지
- 식당명
- 예약자
- 인원
- 식당 주소
- 식당 방문 일정

인원은 0명인 타입을 제외하고 `어른`, `청소년`, `어린이` 순서로 표시한다.

방문 일정은 `YYYY.M.D. HH:mm` 형식으로 표시한다.

식당 주소는 `location.state.restaurantAddress`를 표시한다. 일반 예약은 식당 요약 API 값, 어디든 예약은 사용자가 입력한 값을 이전 단계에서 전달한다.

식당 이미지는 다음 우선순위로 표시한다.

1. `restaurantImageUrl`이 있으면 해당 이미지 표시
2. 어디든 예약(`source: 'anywhere'`)에서 넘어왔고 이미지가 없으면 Figma `2-a` placeholder 표시
3. 일반 예약에서 이미지가 없으면 shared `DefaultImage` 표시

### 포인트

- `GET /api/v1/points/me` 응답의 보유 포인트를 사용한다.
- 남은 보유 포인트를 표시한다.
- 사용 포인트 입력값은 숫자만 허용한다.
- 숫자가 아닌 문자는 제거한다.
- 빈 입력은 `0원`으로 처리한다.
- 최대 사용 가능 포인트는 `min(availablePoint, paymentAmount)`다.
- 한도 초과 입력 시 입력값을 즉시 최대 사용 가능 포인트로 보정한다.
- `전액사용` 클릭 시 최대 사용 가능 포인트를 적용한다.
- `전액사용` 버튼 typography는 `typo-body-6`을 사용한다.
- 남은 포인트는 `availablePoint - usedPoint`다.
- 최종 결제 금액은 `paymentAmount - usedPoint`이며 0원 미만으로 내려가지 않는다.

### 예약 안내

Figma의 예약 안내 문구를 page copy로 노출한다.

### 예약 요청 CTA

- HDS `Button`을 사용한다.
- 항상 활성화한다.
- 클릭 시 `/reservations/request` 안에서 예약 확인 모달을 연다.

### 예약 확인 모달

- HDS `Dialog`를 사용한다.
- route를 추가하지 않는다.
- 모달은 예약자, 인원, 식당 주소, 식당 방문 일정, 최종 결제 금액을 표시한다.
- `취소` 클릭 시 모달을 닫는다.
- `예약` 클릭 시 draft 종류에 맞는 예약 생성 mutation을 실행한다.
- mutation 진행 중에는 `예약`, `취소` 버튼을 비활성화하고 모달 닫기를 막는다.
- mutation 상태가 다시 렌더링되기 전에도 동기 잠금으로 중복 예약 생성을 막는다.
- 성공 시 모달을 닫고 `/reservations/{reservationId}`로 이동한다.
- 실패 시 공통 mutation 오류 토스트를 표시하고 모달을 유지한다.
- 모달 하단의 `취소`, `예약` 버튼 typography는 `typo-sub-header-2`를 사용한다.

## State

- `location.state`: 이전 화면에서 전달한 예약 draft
- server state:
  - `pointQueryKeys.myBalance()`: 현재 사용자 포인트 잔액
- local state:
  - `usedPoint`
  - `isConfirmOpen`
  - reservation creation mutation state
- derived state:
  - `remainingPoint`
  - `finalPaymentAmount`
  - formatted guest text
  - formatted visit date/time

## Component Mapping

- HDS:
  - `Header`
  - `IconButton`
  - `Button`
  - `Dialog`
- HDS Icons:
  - `BackIcon`
  - `CheckIcon`
  - `HashiPointMarkIcon`
  - `HashiPlaceholderIcon`
- Shared:
  - `DefaultImage`
- Page-local:
  - `ReservationRequestInfoSection`
  - `ReservationPointSection`
  - `ReservationNoticeSection`
  - `ReservationConfirmDialog`
  - `useCreateReservationMutation`
  - `createReservation`
- Feature:
  - `myPointBalanceQueryOptions`
  - `pointQueryKeys`
- Route/shared 영향:
  - 새 route 추가 없음
  - shared API client의 액세스 토큰 주입 정책 갱신
  - 일반 예약 식당 이미지 fallback은 기존 shared `DefaultImage` 사용
  - 어디든 예약 식당 이미지 fallback은 HDS `HashiPlaceholderIcon` 사용
  - `@hashi/hds-icons`에 `HashiPointMarkIcon`, `HashiPlaceholderIcon` 추가

## Verification

- 유효한 `location.state` 기반으로 예약 정보가 렌더링된다.
- draft state가 없거나 잘못되면 홈으로 replace 이동한다.
- 어디든 예약 state는 사용자가 입력한 식당명/식당 주소를 렌더링한다.
- 어디든 예약 state에서 식당 이미지가 없으면 `2-a` placeholder를 렌더링한다.
- 숫자가 아닌 포인트 입력은 제거된다.
- 포인트 입력이 최대 사용 가능 금액을 넘으면 즉시 보정된다.
- `전액사용` 클릭 시 최대 사용 가능 포인트가 적용된다.
- 최종 결제 금액과 남은 포인트가 갱신된다.
- `예약 요청` 클릭 시 확인 모달이 열린다.
- `취소` 클릭 시 확인 모달이 닫힌다.
- `예약`을 대기 없이 연속 클릭해도 예약 생성 요청은 한 번만 실행된다.
- 예약 생성 요청 중에는 `취소`와 Escape로 확인 모달을 닫을 수 없다.
- 일반 예약 draft가 `/api/v1/reservations` 요청 스키마로 변환된다.
- 어디든 예약 draft가 `/api/v1/reservations/anywhere` 요청 스키마로 변환된다.
- 포인트 조회 응답이 보유 포인트와 최대 사용 가능 포인트 계산에 반영된다.
- 일반 예약은 식당 요약 응답의 `reservationFee`를 결제 기준으로 사용한다.
- 예약 생성 성공 시 포인트 잔액 query가 무효화된다.
- 예약 생성 성공 시 응답의 `reservationId` 상세 화면으로 이동한다.
- 예약 생성 실패 시 모달을 유지한다.
- 예약 생성 중 확인 버튼이 비활성화된다.

검증 명령:

```bash
corepack pnpm --filter @hashi/client lint
corepack pnpm --filter @hashi/client typecheck
corepack pnpm --filter @hashi/client test -- ReservationRequestPage
corepack pnpm --filter @hashi/client build
```
