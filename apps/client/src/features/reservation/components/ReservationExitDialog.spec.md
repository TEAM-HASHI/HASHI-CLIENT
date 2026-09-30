# ReservationExitDialog Spec

## Purpose

일반·어디든 예약 작성 화면에서 입력을 버리고 나갈지 확인한다.

## Behavior

- `open`, `onOpenChange`, `onExit`를 받는 앱 예약 기능 컴포넌트다.
- HDS `AlertDialog`를 사용해 제목, 입력 소실 안내, 계속 작성·나가기 액션을 표시한다.
- 계속 작성은 모달만 닫고 입력을 유지한다.
- 나가기는 호출 페이지에서 history draft를 제거하고 이전 화면으로 이동한다.
- API, 저장소, navigation을 직접 소유하지 않는다.

## Verification

- `AnywhereReservationPage.test.tsx`: 모달 진입·계속 작성·나가기.
- `AnywhereReservationFlow.test.tsx`: 입력 복원과 확정 나가기 후 제거.
