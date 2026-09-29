# Hook Spec: `useReservationFormControls`

## Purpose

식당 예약과 어디든 예약 화면에서 공통으로 사용하는 예약자명, 요청사항, 인원, 날짜, 시간 선택 상태와 UI controller를 제공합니다.

## Hook Type

- [x] feature hook
- [x] form or interaction hook

## Spec Location

- spec path: `apps/client/src/features/reservation/hooks/useReservationFormControls.spec.md`
- implementation path: `apps/client/src/features/reservation/hooks/useReservationFormControls.ts`

## Usage

- `apps/client/src/pages/restaurantReservationNew/hooks/useRestaurantReservationForm.ts`
- `apps/client/src/pages/anywhereReservation/hooks/useAnywhereReservationForm.ts`

호출하는 page hook은 예약 가능 날짜·시간 슬롯 정책, 추가 입력값, reservation draft 생성을 담당합니다.

## Inputs

### `checkIsDateReservable`

- type: `(date: Date) => boolean`
- required: `true`
- description: 오늘 이후 날짜 중 page 정책상 예약 가능한 날짜인지 판단합니다. 식당 예약은 영업시간·휴무를, 어디든 예약은 항상 예약 가능을 전달합니다.

### `getTimeSlots`

- type: `(selectedDate: Date | undefined) => readonly string[]`
- required: `true`
- description: 현재 선택 날짜에 표시할 시간 슬롯을 반환합니다. 날짜가 선택되지 않은 경우에도 기존 화면의 초기 시간 슬롯을 반환할 수 있습니다.

## Return Shape

```ts
const { fields, guestCounters, validity, values, calendar, timeSelector } =
  useReservationFormControls(params)
```

- `fields`: 예약자명·요청사항 input value 및 change action
- `guestCounters`: 인원별 증감 controller
- `validity`: 인원 합계, 예약자명, 선택 날짜, 선택 시간의 기본 유효성
- `values`: page-local draft 생성에 필요한 guest count·선택 날짜·선택 시간
- `calendar`: visible month, selected date, disabled 판단 및 변경 action
- `timeSelector`: 표시 시간 슬롯, 선택 시간, disabled 상태 및 선택 action

## Behavior

1. 초기 인원은 모든 유형이 0명이며, 현재 월을 visible month로 설정합니다.
2. 인원 감소는 0명 미만으로 내려가지 않습니다.
3. 오늘과 과거 날짜, 또는 `checkIsDateReservable`이 false인 날짜를 비활성화합니다.
4. 유효 날짜를 선택하기 전 시간 선택은 반영하지 않습니다.
5. 다른 날짜를 선택하면 선택된 시간을 초기화합니다. 같은 날짜를 다시 선택하면 시간을 유지합니다.
6. `getTimeSlots` 결과를 현재 선택 날짜에 맞춰 `timeSelector`에 전달합니다.

## Validation

- `isGuestNameValid`: 예약자명 trim 결과가 비어 있지 않은지
- `totalGuestCount`: 어른·청소년·어린이 합계
- `isSelectedDateValid`: 선택 날짜가 있고 비활성 날짜가 아닌지
- `hasSelectedTime`: 시간 선택 여부

페이지별 추가 validation은 이 hook이 소유하지 않습니다.

## Side Effects

- API 호출, cache update, storage, navigation, toast는 수행하지 않습니다.

## Non-Goals

- 식당 영업시간·휴무·break time 정책
- 어디든 예약의 고정 슬롯 정책
- 식당명·주소 입력 및 validation
- reservation draft·API payload 생성
- UI markup·스타일·제품 copy

## Verification

- [x] 시간 선택 전 유효 날짜 필요 여부
- [x] 날짜 변경 시 선택 시간 초기화
- [x] 인원 수 0명 하한
- [x] 공통 text field 및 기본 validity
- [x] `pnpm --filter @hashi/client test`
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client lint`
