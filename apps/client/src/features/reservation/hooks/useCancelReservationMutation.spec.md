# Hook Spec: `useCancelReservationMutation`

## Purpose

예약 취소 API 호출 뒤 모든 예약 화면에 공통인 목록 cache 동기화와 성공 toast를 수행합니다. 화면별 detail cache, dialog, navigation은 page hook에 남깁니다.

## Hook Type

- [x] feature mutation hook
- [x] server state synchronization hook

## Inputs

```ts
useCancelReservationMutation({
  onCanceled?: (result) => void | Promise<void>,
})
```

| Input        | Required | Description                                                                                                                                                                                        |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onCanceled` | no       | 공통 목록 cache 동기화 전에 실행할 page-local best-effort 처리. 예약 상세의 detail cache 갱신처럼 feature가 알면 안 되는 query/UI 정책을 처리하며, 실패해도 서버 취소 성공 흐름을 중단하지 않는다. |

## Owned Behavior

1. `cancelReservation(reservationId)` mutation을 실행합니다.
2. API 성공 시 `onCanceled`을 먼저 실행합니다. callback 실패는 Sentry에 보고하고 이후 성공 흐름을 계속합니다.
3. UPCOMING / CANCELED 목록 cache를 `syncCanceledReservationCache`로 동기화합니다.
4. 서버 성공 message를 toast로 한 번 노출합니다.
5. API 실패 시 성공 callback, 목록 cache sync, 성공 toast를 실행하지 않습니다. 실패 toast는 QueryClient mutation 기본 `onError`가 담당합니다.

## Non-Owned Behavior

- 취소 dialog open/close state
- 중복 confirm 방지 lock
- 상세 query key와 detail cache 갱신 정책
- 성공 뒤 tab 전환, scroll top, navigate
- cancel API endpoint와 response contract
- optimistic update

## Ordering

```text
cancel API success
  → onCanceled (page-local pre-processing)
  → UPCOMING/CANCELED list cache synchronization
  → success toast
  → mutateAsync resolve
  → page-local dialog close / tab switch / navigation
```

`syncCanceledReservationCache` 내부의 CANCELED 목록 prefetch가 실패해도 local cache 보정과 이후 success UI flow는 계속됩니다.
`onCanceled`이 실패해도 서버 취소 결과를 실패로 바꾸지 않고 공통 cache 동기화와 성공 toast를 계속 실행합니다.

## Verification

- `useCancelReservationMutation.test.tsx`
  - page-local callback → list cache sync → success toast 순서를 검증한다.
  - page-local callback 실패 후에도 list cache sync, 성공 toast, mutation resolve가 유지되는지 검증한다.
- `syncCanceledReservationCache.test.ts`
  - UPCOMING 제거, CANCELED 추가, prefetch 실패 내성, 중복 삽입 방지를 검증한다.
- `MyReservationsPage.test.tsx`
  - 성공 toast가 한 번만 노출되고 CANCELED 탭으로 전환되는지 검증한다.
- `ReservationDetailPage.test.tsx`
  - detail cache 갱신, 성공 toast 한 번, CANCELED 목록 navigation을 검증한다.
