# Component Spec: `GuestCounter`

## Purpose

`GuestCounter`는 예약 흐름에서 인원 유형별 수량을 증감하는 feature 전용 row 컴포넌트입니다.
예약 페이지와 어디든 예약 페이지가 같은 카운터 UI를 사용하도록 label, 현재 값, 증감 액션, 하단 구분선을 한 단위로 묶습니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

이 컴포넌트는 예약 도메인의 인원 선택 UI에 묶여 있으므로 `packages/hds-ui`나 `apps/client/src/shared/components`로 승격하지 않습니다.
예약 관련 여러 페이지에서 반복 사용될 수 있으므로 page-local이 아니라 reservation feature 내부에 둡니다.

## Spec Location

- spec path: `apps/client/src/features/reservation/components/guestCounter/GuestCounter.spec.md`
- implementation path: `apps/client/src/features/reservation/components/guestCounter/GuestCounter.tsx`

## Usage Location

- route:
  - `/restaurants/:restaurantId/reservations/new`
  - `/reservations/anywhere`
- page:
  - 예약 페이지
  - 어디든 예약 페이지
- feature: `reservation`
- expected path:
  - `apps/client/src/features/reservation/components/guestCounter/GuestCounter.tsx`

## Scaffold

Feature 전용 컴포넌트이므로 `pnpm gen:component`를 사용하지 않습니다.
필요한 파일은 reservation feature 폴더 안에 직접 둡니다.

```text
apps/client/src/features/reservation/components/guestCounter/
  GuestCounter.tsx
  GuestCounter.spec.md
  GuestCounter.test.tsx
  index.ts
```

## Public API

```tsx
<GuestCounter
  label="어른"
  value={2}
  onDecrease={() => updateGuestCount('adult', -1)}
  onIncrease={() => updateGuestCount('adult', 1)}
/>
```

- public export 여부: `apps/client/src/features/reservation/components/guestCounter/index.ts`에서 feature 내부 사용을 위해 named export합니다.
- public props type export 여부: `GuestCounterProps`를 export할 수 있습니다. 외부 패키지 public API는 아닙니다.
- 호출부가 소유하는 책임:
  - 성인, 청소년, 어린이 같은 인원 유형 목록을 정합니다.
  - 현재 값을 관리합니다.
  - 증감 시 예약 form 또는 page state를 갱신합니다.
  - 총 인원 제한, 연령 정책, 예약 가능 여부 같은 도메인 검증을 처리합니다.
- 컴포넌트가 소유하지 않는 책임:
  - route params, API query/mutation, analytics, 예약 제출 로직
  - 인원 유형별 비즈니스 규칙
  - 여러 카운터의 합계 계산

## Requirements

- [x] label, minus button, value text, plus button, underline을 한 row로 렌더링합니다.
- [x] label은 왼쪽에 배치하고, minus/value/plus 영역은 오른쪽에 배치합니다.
- [x] row content는 vertical padding `10px`을 가집니다.
- [x] label과 value는 `typo-body-4 text-primary-200`를 사용합니다.
- [x] minus/value/plus 영역은 horizontal gap `10px`을 사용합니다. 디자인 스펙의 `2.5` spacing은 Tailwind 기준 `gap-2.5`로 구현합니다.
- [x] `MinusIcon`, `PlusIcon`은 `@hashi/hds-icons`를 사용하고 visual size는 `24px`로 고정합니다.
- [x] `@hashi/hds-icons`에는 원형 테두리 포함 plus/minus 아이콘이 없으므로, 원형 테두리는 button style로 구현합니다.
- [x] 아이콘 기본 색상은 black입니다.
- [x] 아이콘과 원형 테두리는 누르고 있는 동안만 `primary-400` 색상으로 표시합니다.
- [x] row 하단에는 `warm-gray-100`, weight `1px` underline을 표시합니다.
- [x] value는 숫자로 표시하고 layout shift가 크지 않도록 최소 너비를 둡니다.

## UI Structure

```text
GuestCounter
  Row
    LabelText
    Controls
      DecreaseButton
        MinusIcon
      ValueText
      IncreaseButton
        PlusIcon
  Underline
```

## Props

### `label`

- type: `string`
- required: `true`
- description: 카운터의 인원 유형 이름입니다. 예: `어른`, `청소년`, `어린이`.

### `value`

- type: `number`
- required: `true`
- description: 호출부가 관리하는 현재 수량입니다.

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: 전체 카운터 입력을 비활성화합니다.

### `onDecrease`

- type: `() => void`
- required: `true`
- description: minus button 클릭 또는 키보드 활성화 시 호출합니다.

### `onIncrease`

- type: `() => void`
- required: `true`
- description: plus button 클릭 또는 키보드 활성화 시 호출합니다.

## State

- local state: 없음. pressed color는 CSS `active:` 상태로 처리합니다.
- controlled state: `value`
- uncontrolled state: 없음
- loading state: 없음
- error state: 없음
- disabled state:
  - `disabled`가 true이면 두 button을 모두 비활성화합니다.
  - `value <= 0`이면 decrease button을 비활성화합니다.
  - increase button은 상한 없이 활성화합니다.

## Behavior

1. 사용자가 minus button을 누릅니다.
2. `disabled`가 아니고 `value > 0`이면 `onDecrease`를 한 번 호출합니다.
3. 사용자가 plus button을 누릅니다.
4. `disabled`가 아니면 `onIncrease`를 한 번 호출합니다.
5. button을 마우스, 터치, 키보드로 누르고 있는 동안 해당 아이콘 색상만 `primary-400`으로 바뀝니다.
6. pointer up, pointer cancel, key up 이후 아이콘 색상은 black으로 돌아옵니다.

## Validation

- `value`가 `0`보다 작은 경우의 보정은 호출부가 처리합니다.
- 컴포넌트는 현재 props를 기준으로 button disabled 여부만 계산합니다.
- v1은 최대 수량 제한을 제공하지 않습니다.

## Error Handling

- 서버 에러나 예약 불가 에러는 표시하지 않습니다.
- 카운터 row 내부에는 error text를 렌더링하지 않습니다.
- 도메인 검증 실패 메시지는 예약 form 또는 page section에서 처리합니다.

## Styling

- styling 기준:
  - Tailwind CSS utility class
  - `@hashi/hds-tokens`에서 제공하는 typography와 color token class
- layout:
  - root는 full width row입니다.
  - content 영역은 `flex items-center justify-between py-2.5`를 사용합니다.
  - controls 영역은 `flex items-center gap-2.5`를 사용합니다.
- typography:
  - label: `typo-body-4 text-primary-200`
  - value: `typo-body-4 text-primary-200`
- icon:
  - button과 icon visual size는 `size-6`입니다.
  - button은 native user-agent appearance가 24px 원형 크기에 영향을 주지 않도록 `appearance-none`을 사용합니다.
  - button은 `rounded-full border-[1.4px] border-black`으로 원형 테두리를 만듭니다.
  - `PlusIcon`, `MinusIcon`은 SVG viewBox 내부 path 여백 때문에 기본 렌더링이 작게 보이므로 `scale-[1.4]`로 확대해 Figma와 맞춥니다.
  - 기본 색상은 `text-black`과 `border-black`입니다.
  - pressed 상태는 `active:text-primary-400 active:border-primary-400`입니다.
- underline:
  - `border-b border-warm-gray-100`
  - border weight는 `1px`입니다.
- responsive:
  - row는 부모 width에 맞춰 늘어납니다.
  - label이 길어지면 controls를 밀어내지 않도록 label 영역에 `min-w-0 truncate`를 적용합니다.
- layout shift 방지 조건:
  - value 영역은 최소 너비를 가져 한 자리와 두 자리 숫자 전환 시 controls 위치가 과하게 흔들리지 않게 합니다.
  - icon button은 고정 `24px` box를 유지합니다.

## Accessibility

- minus와 plus는 `button type="button"` 요소를 사용합니다.
- 아이콘만 있는 button에는 각각 `aria-label`을 제공합니다.
  - decrease: `${label} 인원 줄이기`
  - increase: `${label} 인원 늘리기`
- button disabled 상태는 native `disabled` 속성으로 표현합니다.
- 키보드 사용자는 Tab으로 button에 접근하고 Enter 또는 Space로 값을 변경할 수 있어야 합니다.
- focus-visible 스타일은 기존 앱/HDS focus 기준을 따릅니다. 기준이 없으면 `focus-visible:outline` 또는 `focus-visible:ring`을 적용합니다.
- value 변화는 호출부 화면 구조 안에서 즉시 읽히는 텍스트로 제공하며, v1에서는 별도 live region을 두지 않습니다.

## Dependencies

- components: 없음
- icons:
  - `MinusIcon` from `@hashi/hds-icons`
  - `PlusIcon` from `@hashi/hds-icons`
- hooks: 없음
- APIs: 없음
- external libraries:
  - `react`
  - `cn` from `apps/client/src/shared/utils`

## Storybook

HDS component가 아니므로 Storybook 필수 작성 대상이 아닙니다.
구현 확인은 테스트와 예약 화면 수동 확인으로 처리합니다.

## Non-Goals

- `packages/hds-ui` 공통 Counter primitive를 만들지 않습니다.
- 성인, 청소년, 어린이 목록을 컴포넌트 내부에 고정하지 않습니다.
- 예약 API 호출, 예약 form submit, 총 인원 validation을 포함하지 않습니다.
- 길게 누르면 연속 증가/감소하는 repeat interaction은 v1 범위에 포함하지 않습니다.
- 아이콘 pressed 색상 외 hover, selected, error variant를 추가하지 않습니다.

## Verification

- [ ] `pnpm --filter @hashi/client lint`
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client test`
- [ ] 예약 페이지와 어디든 예약 페이지에서 adult/youth/child row 수동 확인
- [ ] mouse, touch, keyboard active 상태에서 아이콘 색상 전환 확인
