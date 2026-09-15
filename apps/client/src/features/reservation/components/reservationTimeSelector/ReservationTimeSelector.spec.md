# Component Spec: `ReservationTimeSelector`

## Purpose And Public API

식당 예약과 어디든 예약에서 HDS `TimeSlotPicker`를 연결하는 앱 내부 adapter입니다. package public export는 없습니다.

- `timeSlots`: 화면에서 생성한 시간 문자열 목록.
- `selectedTime`: 현재 선택된 시간.
- `disabled`: 날짜 선택 전 등 호출부 정책에 따른 전체 비활성 상태.
- `onTimeSelect`: 선택한 문자열을 화면 상태로 반영하는 필수 callback.

## Responsibility

네 props를 `TimeSlotPicker`에 전달합니다. 시간 목록 생성, 날짜 변경 시 선택 초기화, 예약 가능 여부, submit 정책은 기존 page/hook에서 유지합니다.

표시·선택·disabled·키보드 동작과 반응형 배치는 HDS가 담당합니다. 비활성 색상은 Figma 기준인 Warm_Gray_100 배경·White 글자로 변경됩니다.

## Verification

- `RestaurantReservationNewPage.test.tsx`, `AnywhereReservationPage.test.tsx`에서 실제 adapter와 HDS 조합을 검증합니다.
- `useReservationFormControls.test.ts`에서 날짜 변경 후 시간 초기화와 비활성 규칙을 확인합니다.
