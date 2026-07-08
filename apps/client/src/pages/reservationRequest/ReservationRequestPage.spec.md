# ReservationRequestPage Spec

## Purpose

`/reservations/request`에서 예약자가 입력한 예약 정보를 확인하고, 보유 포인트를 적용한 뒤 최종 예약 진행 전 확인 모달을 보여준다.

이번 범위는 API 없이 퍼블리싱, page-local 입력 상태, 포인트 계산, 확인 모달, 예약 상세 화면 이동까지다.

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

## Data Dependencies

API 호출은 없다.

이전 예약하기 화면에서 `location.state`로 전달한 예약 draft를 사용한다.

```ts
interface ReservationRequestDraft {
  restaurantId: string
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
```

직접 URL 진입처럼 `location.state`가 없거나 draft shape이 맞지 않으면 page-local fallback mock을 사용한다.

```ts
{
  restaurantId: 'default',
  restaurantName: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  guestName: '김하시',
  guests: {
    adult: 2,
    teen: 0,
    child: 0,
  },
  date: '2026-06-01',
  time: '11:00',
  requestNote: '',
}
```

페이지 전용 mock 데이터는 다음 값으로 둔다.

```ts
{
  restaurantImageUrl: null,
  restaurantAddress: '도쿄 키츠라멘 본점도쿄 키츠라멘 본점',
  availablePoint: 9000,
  paymentAmount: 4000,
}
```

예약 확인 모달에서 `예약`을 누르면 API 없이 mock reservation id를 사용해 예약 상세 화면으로 이동한다.

```ts
const MOCK_RESERVATION_ID = 'mock-reservation-id'
```

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

### 포인트

- 남은 보유 포인트를 표시한다.
- 사용 포인트 입력값은 숫자만 허용한다.
- 숫자가 아닌 문자는 제거한다.
- 빈 입력은 `0원`으로 처리한다.
- 최대 사용 가능 포인트는 `min(availablePoint, paymentAmount)`다.
- 한도 초과 입력 시 입력값을 즉시 최대 사용 가능 포인트로 보정한다.
- `전액사용` 클릭 시 최대 사용 가능 포인트를 적용한다.
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
- `예약` 클릭 시 `/reservations/mock-reservation-id`로 이동한다.

## State

- `location.state`: 이전 화면에서 전달한 예약 draft
- local state:
  - `usedPoint`
  - `isConfirmOpen`
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
- Shared:
  - `DefaultImage`
- Page-local:
  - `ReservationRequestInfoSection`
  - `ReservationPointSection`
  - `ReservationNoticeSection`
  - `ReservationConfirmDialog`
- Route/shared 영향:
  - 새 route 추가 없음
  - 새 shared 추가 없음
  - 식당 이미지 fallback은 기존 shared `DefaultImage` 사용
  - `@hashi/hds-icons`에 `HashiPointMarkIcon` 추가

## Verification

- 예약 정보가 fallback 또는 `location.state` 기반으로 렌더링된다.
- 숫자가 아닌 포인트 입력은 제거된다.
- 포인트 입력이 최대 사용 가능 금액을 넘으면 즉시 보정된다.
- `전액사용` 클릭 시 최대 사용 가능 포인트가 적용된다.
- 최종 결제 금액과 남은 포인트가 갱신된다.
- `예약 요청` 클릭 시 확인 모달이 열린다.
- `취소` 클릭 시 확인 모달이 닫힌다.
- `예약` 클릭 시 `/reservations/mock-reservation-id`로 이동한다.

검증 명령:

```bash
corepack pnpm --filter @hashi/client lint
corepack pnpm --filter @hashi/client typecheck
corepack pnpm --filter @hashi/client test -- ReservationRequestPage
corepack pnpm --filter @hashi/client build
```
