# Reservation First QA Design

## Goal

예약 흐름의 일반 식당 이미지가 로드되지 않을 때 화면별 지정 기본 이미지를 표시하고, 요청사항 입력창의 포커스 border와 긴 식당 주소의 줄바꿈을 보정한다.

## Scope

- 일반 식당 예약 입력 화면의 식당 이미지 URL이 없거나 로드에 실패하면 기존 검은색 `HashiPlaceholderIcon`을 표시한다.
- 예약 확인 화면의 일반 식당 이미지에 `ImageWithDefaultFallback`을 적용한다.
- 예약 확인 화면에서 이미지 URL이 없거나 이미지 로드가 실패하면 기존 `DefaultImage`를 같은 크기와 radius로 표시한다.
- 어디든 예약의 `HashiPlaceholderIcon`은 그대로 유지한다.
- 일반 예약과 어디든 예약이 공유하는 `ReservationRequestNoteField`의 기본 border는 회색, 포커스 border는 검정색으로 표시한다.
- 요청사항은 계속 선택 입력이며 최대 1000자 제한과 counter를 유지한다.
- 예약 정보 영역과 최종 확인 모달의 식당 주소는 남은 가로폭을 모두 사용하고, 공간이 부족할 때만 자연스럽게 줄바꿈한다.
- 긴 식당 주소는 말줄임이나 한 줄 고정으로 숨기지 않는다.

## Non-goals

- `10자 이상` 안내 문구를 추가하지 않는다.
- 요청사항 최소 길이 검증을 추가하지 않는다.
- 요청사항 값에 따라 CTA 활성 조건을 변경하지 않는다.
- HDS `Textarea`의 전역 기본 스타일을 변경하지 않는다.
- 주소 행을 세로형 레이아웃으로 변경하지 않는다.

## Implementation

- `ReservationRestaurantSummary`는 이미지 URL별 실패 상태를 추적해 `HashiPlaceholderIcon`으로 대체하고, `ReservationRequestInfoSection`은 앱 공통 `ImageWithDefaultFallback`을 재사용한다.
- `ReservationRequestNoteField`는 HDS 기본 회색 border를 유지하고 `textareaClassName`으로 포커스 border만 검정색으로 지정한다.
- `ReservationInfoRow`와 `ReservationConfirmRow`의 주소 값은 고정 `max-width`를 제거하고 `flex-1 min-w-0 text-pretty`를 사용한다.
- 새 추상화는 추가하지 않는다.

## Verification

- 예약 입력 화면은 `error` 이벤트 후 검은색 `HashiPlaceholderIcon`, 예약 확인 화면은 `DefaultImage`가 렌더링되는지 테스트한다.
- 요청사항 textarea가 기본 회색·포커스 검정 border class를 가지는지 테스트한다.
- 예약 정보 영역과 최종 확인 모달의 주소 값이 고정 너비 없이 남은 폭을 사용하는지 테스트한다.
- 요청사항의 선택 입력, 1000자 제한, counter, CTA 활성 조건이 유지되는지 기존 테스트로 확인한다.
- client 테스트, lint, typecheck와 `git diff --check`를 실행한다.
