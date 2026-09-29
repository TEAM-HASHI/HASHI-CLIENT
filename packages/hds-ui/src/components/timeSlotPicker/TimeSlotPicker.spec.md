# Component Spec: `TimeSlotPicker`

## Purpose

호출부가 전달한 시간 문자열을 4열 버튼 목록으로 표시하는 HDS primitive입니다. 기존 앱의 `ReservationTimeSelector`에서 표시와 선택 UI를 분리합니다.

시간 목록 생성, 날짜·타임존 계산, 예약 가능 여부, API, 제품 문구, 제출은 호출부 책임입니다. 기존 예약 화면 두 곳이 같은 API로 사용합니다.

## Figma Reference

- [TimeSlotPicker](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7945-92731&m=dev)
- 기본 variant: `7945:92838`, 버튼: `7945:92840`, 글꼴: `7945:92841`
- 선택 variant: `7945:92792`, 선택 글꼴: `7945:92795`
- 비활성 variant: `7945:92746`, 버튼: `7945:92748`
- 2026-09-08 ego-browser에서 Dev Mode 화면과 속성 패널을 확인했습니다.

## Public API

```tsx
<TimeSlotPicker
  timeSlots={['11:00', '11:30', '12:00']}
  selectedTime={selectedTime}
  onTimeSelect={setSelectedTime}
  disabled={disabled}
/>
```

- Export: `TimeSlotPicker`, `TimeSlotPickerProps`.
- `timeSlots`: 필수 `readonly string[]`. 표시값과 선택값이 같은 고유 문자열 목록이며, 전달받은 순서를 유지합니다. 시간 파싱·포맷·생성을 하지 않습니다.
- `selectedTime`: 선택값. 내부 선택 상태를 만들지 않는 controlled 컴포넌트입니다.
- `onTimeSelect`: 활성 버튼을 누르면 해당 문자열을 전달하는 선택적 callback입니다. 같은 버튼을 다시 눌러도 선택 해제를 자체 처리하지 않습니다.
- `disabled`: 기본 false. 모든 시간 버튼을 native disabled로 처리합니다.
- `className`: root에 병합합니다.
- `children` 외 native div props를 지원하며 root role은 group입니다. 기본 accessible name은 `시간`이고 `aria-label` 또는 `aria-labelledby`로 지정할 수 있습니다.

## States And Behavior

- 기본 / 선택 / 전체 비활성 상태를 지원합니다. 개별 시간 비활성화와 다중 선택은 현재 범위에 포함하지 않습니다.
- selectedTime과 같은 문자열의 버튼에 `aria-pressed=true`를 적용합니다. 목록 밖의 값이면 선택된 버튼이 없습니다.
- disabled가 되어도 호출부의 선택값을 바꾸지 않습니다. 선택값이 있는 비활성 버튼도 회색 배경·흰 글씨로 표시합니다.
- 버튼은 type=button이므로 폼을 제출하지 않습니다.
- Tab으로 버튼 간 이동, Enter/Space로 선택하는 native button 동작과 focus-visible outline을 제공합니다. radio group의 방향키 동작은 도입하지 않습니다.
- 빈 목록은 버튼과 안내 문구 없이 빈 group으로 표시합니다. empty 안내는 사용하는 화면에서 제공합니다.
- 목록·선택값 변경은 그대로 렌더링하며 초기화 정책이나 callback을 자동 실행하지 않습니다.

## Styling And Responsive Layout

- 부모 너비를 채우는 4열 grid, 가로·세로 간격 7px.
- 버튼 높이 36px, radius 5px, Body 5 (15px), 중앙 정렬.
- 기본: Secondary_200 배경, Primary_200 글자.
- 선택: Black 배경, White 글자.
- 비활성: Warm_Gray_100 배경, White 글자. 기존 앱의 Secondary_200 배경·Warm_Gray_300 글자에서 변경합니다.
- 포커스: Cool_Gray_900 2px outline, offset 2px. 기존 키보드 표시를 유지합니다.
- Figma 예시 전체 너비 346px, 버튼 81px를 고정하지 않고 균등한 4열로 분배합니다. 346px에서는 (346 - 7×3) / 4 = 81.25px입니다.
- Figma의 버튼 좌우 padding 18px는 좁은 화면에서 시간 문자열을 자를 수 있어 기존 8px 최소 여백과 중앙 정렬을 유지합니다. 일반 시간 문자열의 중심 위치는 같습니다.
- 긴 문자열은 한 줄 말줄임 처리하며 접근성 이름은 전체 문자열을 유지합니다. 부분 행도 앞선 행과 같은 열 너비를 사용합니다.
- 320px 화면 / 256px 콘텐츠 너비에서도 4열을 유지합니다. 최소 폭 이하에서 열 개수를 자동 변경하지 않습니다.

## Storybook

Default, Selected, Disabled, DisabledWithSelection, Interactive, NarrowContainer, LongText, PartialRow, Empty.

Interactive와 NarrowContainer는 Storybook args를 선택 상태로 사용합니다. Controls의 selectedTime 변경·초기화와 미리보기의 시간 선택이 양방향으로 동기화됩니다.

## Verification

- 단위 테스트: 전달 순서·라벨, controlled 선택 및 목록 교체, 비활성 callback 차단, 폼 제출 방지, 외부 accessible name 및 빈 목록.
- 앱 회귀 테스트: 식당 예약·어디든 예약 페이지의 날짜 선택 전 disabled, 날짜 변경 후 시간 초기화 및 시간 선택 흐름.
- 브라우저 확인: 기본·선택·비활성 색상, 클릭과 키보드, 좁은 너비, 긴 문자열, 부분 행.
- `pnpm --filter @hashi/hds-ui test`, `lint`, `typecheck`, `build`.
- `pnpm --filter @hashi/client typecheck`, 관련 페이지 테스트.
- `pnpm build-storybook`, `pnpm format:check`, `git diff --check`.

2026-09-08 검증 결과: HDS 20개 파일/184개 테스트, 앱 예약 페이지·폼 hook 3개 파일/24개 테스트 통과. HDS 및 client lint, HDS/client/admin typecheck, HDS build, Storybook build, format check, harness check를 통과했습니다. 브라우저에서 320/393/768px 너비, 실제 클릭·Enter·Space 선택, disabled, 긴 문자열, 부분 행, 빈 목록을 확인했습니다. 실제 예약 API 및 예약 제출은 검증 범위에 포함하지 않습니다.
