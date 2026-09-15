# Component Spec: `Chip`

## Purpose

`Chip`은 짧은 필터 값을 알약 형태로 표시하고, 선택 여부를 동일한 시각 규칙으로 표현하는 HDS UI primitive입니다.

HASHI-187 범위에서는 Figma `Chip / Basic`, `Chip / Icon` 리디자인을 반영합니다. HDS는 칩의 시각 구조, 선택 상태, count/icon slot, button 기반 접근성 계약만 담당하고, 필터 값과 단일/다중 선택 정책은 호출부가 소유합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Spec Location

- spec path: `packages/hds-ui/src/components/chip/Chip.spec.md`
- implementation path: `packages/hds-ui/src/components/chip/Chip.tsx`

## Usage Location

- route: 앱 호출부에서 결정합니다.
- page: 앱 호출부에서 결정합니다.
- feature: 정렬, 필터 등 도메인별 매핑은 앱 호출부가 소유합니다.
- expected path: `packages/hds-ui/src/components/chip/Chip.tsx`

## Scaffold

새 public HDS component이므로 구현 시 generator 사용을 우선합니다.

```bash
pnpm gen:ds-component
```

## Public API

```tsx
<Chip selected>인기순</Chip>

<Chip count={12}>지역별</Chip>

<Chip icon={<SmileIcon />} variant="icon">
  친절해요
</Chip>

<Chip
  disabled
  disabledIcon={<DisabledSmileIcon />}
  icon={<SmileIcon />}
  variant="icon"
>
  친절해요
</Chip>

<Chip
  selected={sort === 'popular'}
  onSelectedChange={(selected) => {
    if (selected) {
      setSort('popular')
    }
  }}
>
  인기순
</Chip>
```

- public export 여부: `@hashi/hds-ui`에서 `Chip` named export
- public props type export 여부: `ChipProps` export
- 호출부가 소유하는 책임:
  - 필터 값, 정렬 값 같은 도메인 enum 정의
  - 현재 필터 상태를 `selected`로 매핑
  - count에 표시할 숫자 또는 짧은 보조 라벨 계산
  - icon chip에 표시할 enabled/disabled icon 주입
  - 단일 선택, 다중 선택, 토글 해제 가능 여부 같은 그룹 정책
  - 클릭 이후 query, mutation, route update, analytics 실행
- 컴포넌트가 소유하지 않는 책임:
  - 서버 상태 조회 또는 변경
  - 도메인 copy 고정
  - 칩 그룹 내 배타 선택 로직
  - 상태별 business rule

Exported value:

- `Chip`

Exported types:

- `ChipProps`

## Requirements

- [x] 선택됨/선택 안 됨 상태를 동일한 shape 안에서 표현합니다.
- [x] 칩은 button 기반 filter chip으로 동작합니다.
- [x] 선택 상태는 controlled prop인 `selected`로 받습니다.
- [x] Basic 칩은 Figma 기준 36px height를 유지하고, width는 라벨과 padding으로 정합니다.
- [x] 선택적 count slot을 label 뒤에 표시할 수 있습니다.
- [x] Icon 칩은 Figma 기준 36px height, icon 24px slot, label, selected, disabled 상태를 표현합니다.
- [x] Icon 칩의 disabled icon은 `disabledIcon`으로 별도 주입받습니다.
- [x] 예외적으로 긴 라벨이 들어와도 부모 layout을 밀어내지 않도록 max-width와 overflow 정책을 정합니다.

## UI Structure

```text
Chip
  ChipRoot
    BasicChip
      Label
      Count(optional)
    IconChip
      Icon
      Label
```

## Props

### `children`

- type: `string`
- required: `true`
- description: 칩 안에 표시할 짧은 텍스트 라벨입니다.

### `variant`

- type: `'basic' | 'icon'`
- required: `false`
- default: `'basic'`
- description: Figma의 `Chip / Basic`, `Chip / Icon` 형태를 선택합니다.

### `selected`

- type: `boolean`
- required: `false`
- default: `false`
- description: 선택된 시각 상태를 제어합니다.

### `count`

- type: `ReactNode`
- required: `false`
- description: 라벨 뒤에 표시할 짧은 보조 값입니다. 숫자 카운트를 주 용도로 하지만 HDS는 값의 도메인 의미를 해석하지 않습니다.
- supported variant: `basic`

### `icon`

- type: `ReactNode`
- required: `true` when `variant="icon"`
- description: icon chip의 라벨 앞에 표시할 아이콘입니다. 아이콘 자체의 의미와 SVG 색상은 호출부가 소유합니다.

### `disabledIcon`

- type: `ReactNode`
- required: `false`
- description: icon chip이 disabled 상태일 때 표시할 별도 아이콘입니다. 기존 `SmileIcon`처럼 내부 색상이 고정된 icon은 CSS color로 disabled 색상을 바꿀 수 없으므로, Figma disabled icon과 일치하는 별도 icon을 호출부가 주입합니다.
- supported variant: `icon`

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: icon chip에서 native button disabled 상태를 제공합니다. Basic chip은 disabled 상태를 제공하지 않습니다.
- supported variant: `icon`

### `onSelectedChange`

- type: `(selected: boolean) => void`
- required: `false`
- description: 칩이 눌렸을 때 다음 선택 상태를 호출부에 전달합니다.

### `className`

- type: `string`
- required: `false`
- description: 내부 Tailwind class와 안전하게 병합되는 선택적 class입니다.

## State

- local state: 없음
- controlled state: `selected`
- uncontrolled state: 제공하지 않음
- loading state: 제공하지 않음
- error state: 제공하지 않음
- disabled state: `variant="icon"`에서만 제공합니다. Basic chip은 disabled 상태를 제공하지 않으며, `ChipProps`에서도 Basic의 `disabled`와 `aria-disabled`를 제외합니다.

## Behavior

1. 칩은 항상 native `button`으로 렌더링합니다.
2. 클릭 시 `onSelectedChange?.(!selected)`를 호출합니다.
3. 단일 선택 그룹에서 이미 선택된 칩을 다시 눌렀을 때 해제할지 유지할지는 호출부가 결정합니다.
4. `onSelectedChange`가 없으면 native button 의미와 `aria-pressed`만 제공하고 상태 변경 side effect는 발생하지 않습니다.
5. icon chip이 `disabled=true`이면 native disabled button으로 렌더링하고 click callback을 호출하지 않습니다.

## Validation

- 필드별 검증 규칙: 없음
- 버튼 활성/비활성 조건: 없음
- invalid 상태 표시 방식: 제공하지 않음

## Error Handling

- 서버 에러나 fallback copy는 호출부에서 처리합니다.
- 서버 에러나 API 상태는 호출부에서 처리합니다.

## Styling

- styling 기준:
  - Tailwind CSS utility class
  - `@hashi/hds-tokens` color, typography, radius 기준
- Basic layout:
  - inline-flex
  - center aligned label
  - pill radius
- Basic sizing:
  - Basic height는 `36px`입니다.
  - width는 label, optional count, padding으로 크기를 정합니다.
  - 기본 라벨은 한 줄 pill 형태를 유지합니다.
  - 부모가 좁거나 라벨이 비정상적으로 길면 max-width 안에서 ellipsis 처리합니다.
- Basic spacing:
  - horizontal padding은 `12px`입니다.
  - vertical padding은 `8px`입니다.
  - label과 count 사이 gap은 `2px`입니다.
  - border radius는 pill 형태를 유지하는 `rounded-full`입니다.
- Basic typography:
  - label은 `typo-body-6`, line-height `1.36`을 사용합니다.
  - count는 `typo-caption-1`, line-height `1.5`를 사용합니다.
- Basic unselected rest:
  - fill: `warm-gray-50`
  - text: `primary-200`
- Basic unselected hover:
  - fill: `warm-gray-100`
  - text: `primary-200`
- Basic unselected pressed:
  - fill: `warm-gray-300`
  - text: `primary-200`
- Basic selected rest:
  - fill: `cool-gray-800`
  - text: `white`
- Basic selected hover:
  - fill: `cool-gray-700`
  - text: `white`
- Basic selected pressed:
  - fill: `cool-gray-900`
  - text: `white`
- Icon layout:
  - inline-flex
  - icon 24px slot + label
  - height: `36px`
  - horizontal padding: `10px`
  - vertical padding: `4px`
  - gap: `4px`
  - radius: `5px`
  - default border: `1px warm-gray-100`
  - selected border: `1.4px primary-400`
- Icon typography:
  - label은 `typo-body-8`을 사용합니다.
- Icon unselected rest:
  - fill: `white`
  - border: `warm-gray-100`
  - text: `black`
- Icon unselected hover:
  - fill: `primary-100`
  - border: `warm-gray-100`
  - text: `black`
- Icon unselected pressed:
  - fill: `primary-400 / 20%`
  - border: `warm-gray-100`
  - text: `black`
- Icon selected rest:
  - fill: `primary-400 / 20%`
  - border: `primary-400`, `1.4px`
  - text: `black`
- Icon selected hover:
  - fill: `primary-400 / 30%`
  - border: `primary-400`, `1.4px`
  - text: `black`
- Icon selected pressed:
  - fill: `primary-400 / 50%`
  - border: `primary-400`, `1.4px`
  - text: `black`
- Icon disabled:
  - fill: `primary-100`
  - border: `warm-gray-100`
  - text: `warm-gray-300`
  - icon: 호출부가 `disabledIcon`으로 주입
  - disabled는 selected 여부와 관계없이 native `disabled:*` style로 최종 비활성 스타일을 우선 적용합니다.
- hover/focus/active:
  - hover/active cursor와 focus-visible ring을 제공합니다.
  - icon chip의 hover/active는 disabled 상태에서 적용되지 않도록 `enabled:*` 상태로 제한합니다.
- layout shift 방지 조건:
  - `selected` 전환 시 border width, font weight, padding 변화로 크기가 흔들리지 않아야 합니다.
  - 긴 라벨 방어는 고정 width가 아니라 `max-width`, `min-w-0`, `truncate` 같은 overflow 제어로 처리합니다.

## Accessibility

- semantic element: `button`
- `type="button"`을 사용합니다.
- `aria-pressed={selected}`를 제공합니다.
- icon chip disabled 상태는 native `disabled` 속성을 사용합니다.
- Enter, Space는 native button keyboard interaction에 맡깁니다.
- focus-visible:
  - keyboard 사용자가 현재 focus 위치를 알 수 있는 ring을 제공합니다.

## Dependencies

- components: 없음
- icons: 호출부가 주입합니다.
- hooks: 없음
- APIs: 없음
- utils: `cn`
- external libraries: `class-variance-authority`

## Storybook

- [x] Default
- [x] selected / unselected
- [x] count
- [x] icon
- [x] disabled icon
- [x] filter category / reservation / rating / sort cases
- [ ] loading
- [ ] error 또는 invalid
- [x] 긴 텍스트 또는 overflow

`Chip`은 현재 loading, error, invalid를 지원하지 않습니다.

## Non-Goals

- `FilterChip`을 별도 HDS public component로 분리하지 않습니다.
- `ChipGroup`은 이번 범위에 포함하지 않습니다. 단일 선택, 다중 선택, wrapping, spacing 정책이 여러 화면에서 반복되면 별도 compound primitive로 검토합니다.
- 기존 `Badge` public export는 이번 범위에서 제거하지 않습니다.
- 기존 `@hashi/hds-icons` 아이콘 색상 구조는 이번 범위에서 변경하지 않습니다.
- 서버 API 응답 상태나 필터 enum을 HDS props로 정의하지 않습니다.
- 도메인별 색상 의미를 `tone="reservationCanceled"`처럼 넣지 않습니다.

## Architecture Decision

하나의 `Chip` 컴포넌트 안에서 `basic`, `icon` variant를 제공합니다.

별도 `FilterChip`, `IconChip`을 만들지 않는 이유:

- Figma 리디자인이 `Chip / Basic`, `Chip / Icon`으로 같은 component family를 표현합니다.
- `Chip`이라는 이름만으로도 제품 의미 없이 shape, selected state, accessibility contract를 표현할 수 있습니다.
- 정렬, 예약, 평점 같은 필터 도메인은 호출부가 label과 state로 주입합니다.
- 기존 `Badge`는 유지하되, 신규 리디자인 대응은 `Chip` 중심으로 진행합니다.
- public export는 `Chip` 하나로 유지하되 내부 구현은 `ChipRoot`, `BasicChip`, `IconChip`으로 나눠 공통 button 접근성 계약과 variant별 slot/style 책임을 분리합니다.

## Verification

- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] Storybook에서 selected, unselected, filter cases, overflow 상태 수동 확인
