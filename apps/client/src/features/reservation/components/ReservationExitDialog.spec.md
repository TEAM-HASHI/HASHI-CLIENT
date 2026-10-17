# ReservationExitDialog Spec

## Purpose

일반·어디든 예약 작성 화면에서 입력을 버리고 나갈지 확인한다.

## Behavior

- `open`, `onOpenChange`, `onExit`를 받는 앱 예약 기능 컴포넌트다.
- HDS `AlertDialog`를 사용해 제목, 입력 소실 안내, 계속 예약하기·그만두기 액션을 표시한다.
- 계속 예약하기은 모달만 닫고 입력을 유지한다.
- 그만두기는 호출 페이지에서 history draft를 제거하고 이전 화면으로 이동한다.
- API, 저장소, navigation을 직접 소유하지 않는다.

## Verification

- `AnywhereReservationPage.test.tsx`: 모달 진입·계속 예약하기·그만두기.
- `AnywhereReservationFlow.test.tsx`: 입력 복원과 확정 그만두기 후 제거.

## Design

- 2026-10-17 Figma 원본 `UHaom01PvoRx2wRCYa1kS1`, `9429:73729`의 `modal_dual`을 직접 확인했다.
- 모달은 폭 327px, 높이 220px, 모서리 20px이며 작은 화면에서는 좌우 최소 24px 여백을 유지한다.
- 원형 X 아이콘, 제목 “예약을 그만두시겠어요?”, 설명 “지금 나가면 입력한 / 예약 정보가 사라져요.”를 두 줄로 표시한다.
- 제목은 Header 3, 줄 높이 30px이다. 설명은 Body 6, Cool Gray 500, 줄 높이 19px이다. 버튼은 높이 36px, 간격 8px이며 계속 예약하기는 Secondary 200, 그만두기는 Cool Gray 800이다.
- HDS의 Dialog, OrderCancelIcon, Button을 앱에서 조합한다. 공용 컴포넌트에 예약 문구를 넣지 않는다.
