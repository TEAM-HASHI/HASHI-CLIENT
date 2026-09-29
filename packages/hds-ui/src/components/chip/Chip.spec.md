# Component Spec: `Chip`

## Purpose

`Chip`은 짧은 필터 값과 선택적 보조 값을 알약 형태로 표시하고, 선택 여부를 동일한 시각 규칙으로 표현하는 HDS UI primitive입니다.

HDS `Chip`은 칩의 시각 구조, 선택 상태, count slot, button 기반 접근성 계약만 담당합니다. 필터 값, 단일/다중 선택 정책, route, query, mutation, analytics는 호출부가 소유합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Spec Location

- spec path: `packages/hds-ui/src/components/chip/Chip.spec.md`
- implementation path: `packages/hds-ui/src/components/chip/Chip.tsx`
- story path: `packages/hds-ui/src/components/chip/Chip.stories.tsx`
- test path: `packages/hds-ui/src/components/chip/Chip.test.tsx`

## Usage Location

- route: 앱 호출부에서 결정합니다.
- page: 앱 호출부에서 결정합니다.
- feature: 정렬, 필터, 카테고리 등 도메인별 매핑은 앱 호출부가 소유합니다.

## Public API

```tsx
<Chip selected>인기순</Chip>

<Chip count={12}>지역별</Chip>

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

Exported value:

- `Chip`

Exported types:

- `ChipProps`

호출부가 소유하는 책임:

- 필터 값, 정렬 값 같은 도메인 enum 정의
- 현재 필터 상태를 `selected`로 매핑
- count에 표시할 숫자 또는 짧은 보조 라벨 계산
- 단일 선택, 다중 선택, 토글 해제 가능 여부 같은 그룹 정책
- 클릭 이후 query, mutation, route update, analytics 실행

컴포넌트가 소유하지 않는 책임:

- 서버 상태 조회 또는 변경
- 도메인 copy 고정
- 칩 그룹 내 배타 선택 로직
- 상태별 business rule
- 아이콘 또는 도메인별 시각 의미 매핑

## Requirements

- [x] 선택됨/선택 안 됨 상태를 동일한 shape 안에서 표현합니다.
- [x] 칩은 native button 기반 filter chip으로 동작합니다.
- [x] 선택 상태는 controlled prop인 `selected`로 받습니다.
- [x] `aria-pressed`로 선택 상태를 노출합니다.
- [x] 선택적 `count`를 label 뒤에 표시할 수 있습니다.
- [x] `count={0}`도 유효한 값으로 렌더링합니다.
- [x] 긴 라벨이 들어와도 부모 layout을 깨지 않도록 overflow를 제어합니다.
- [x] token 또는 Tailwind theme 기준을 우선 사용합니다.

## UI Structure

```text
Chip
  Label
  Count(optional)
```

## Props

### `children`

- type: `ReactNode`
- required: `true`
- description: 칩 안에 표시할 짧은 라벨입니다. 일반 사용은 문자열을 권장합니다.

### `selected`

- type: `boolean`
- required: `false`
- default: `false`
- description: 선택된 시각 상태와 `aria-pressed` 값을 제어합니다.

### `count`

- type: `ReactNode`
- required: `false`
- description: 라벨 뒤에 표시할 짧은 보조 값입니다. 숫자 카운트를 주 용도로 하지만 HDS는 값의 도메인 의미를 해석하지 않습니다.

### `onSelectedChange`

- type: `(selected: boolean) => void`
- required: `false`
- description: 칩이 눌렸을 때 다음 선택 상태를 호출부에 전달합니다.

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

## State

- local state: 없음
- controlled state: `selected`
- uncontrolled state: 제공하지 않음
- loading state: 제공하지 않음
- error state: 제공하지 않음
- disabled state: 제공하지 않습니다. `ChipProps`에서도 `disabled`와 `aria-disabled`를 제외합니다.

## Behavior

1. 칩은 항상 native `button type="button"`으로 렌더링합니다.
2. 클릭 시 `onSelectedChange?.(!selected)`를 호출합니다.
3. 단일 선택 그룹에서 이미 선택된 칩을 다시 눌렀을 때 해제할지 유지할지는 호출부가 결정합니다.
4. `onSelectedChange`가 없으면 native button 의미와 `aria-pressed`만 제공하고 상태 변경 side effect는 발생하지 않습니다.
5. `count`가 `undefined` 또는 `null`이면 count 영역을 렌더링하지 않습니다.
6. `count={0}`은 유효한 값으로 렌더링합니다.

## Validation

HDS는 validation을 수행하지 않습니다.

- 필터 선택 필수 여부는 호출부가 결정합니다.
- 선택 개수 제한은 호출부가 결정합니다.
- invalid 상태와 validation message는 제공하지 않습니다.

## Error Handling

- 서버 에러나 fallback copy는 호출부에서 처리합니다.
- 서버 에러나 API 상태는 호출부에서 처리합니다.

## Styling

- styling 기준:
  - Tailwind CSS utility class
  - `@hashi/hds-tokens` color, typography, radius 기준
- Layout:
  - `inline-flex`
  - center aligned label
  - pill shape
- Sizing:
  - height: `36px`
  - width는 label, optional count, padding으로 정합니다.
  - 기본 라벨은 한 줄 pill 형태를 유지합니다.
  - 부모가 좁거나 라벨이 비정상적으로 길면 max-width 안에서 ellipsis 처리합니다.
- Spacing:
  - horizontal padding: `12px`
  - vertical padding: `8px`
  - label과 count 사이 gap: `2px`
  - border radius: pill 형태
- Typography:
  - label: `typo-body-6`
  - count: `typo-caption-1`
- Unselected:
  - rest fill: `warm-gray-50`
  - hover fill: `warm-gray-100`
  - pressed fill: `warm-gray-300`
  - text: `primary-200`
- Selected:
  - rest fill: `cool-gray-800`
  - hover fill: `cool-gray-700`
  - pressed fill: `cool-gray-900`
  - text: `white`
- Focus:
  - keyboard 사용자가 현재 focus 위치를 알 수 있도록 focus-visible outline을 제공합니다.
- Layout shift 방지:
  - `selected` 전환 시 border width, font weight, padding 변화로 크기가 흔들리지 않아야 합니다.
  - 긴 라벨 방어는 고정 width가 아니라 `max-width`, `min-w-0`, `truncate` 같은 overflow 제어로 처리합니다.

## Accessibility

- semantic element: `button`
- `type="button"`을 사용합니다.
- `aria-pressed={selected}`를 제공합니다.
- Enter, Space는 native button keyboard interaction에 맡깁니다.
- focus-visible outline을 제공합니다.
- accessible name은 visible label과 count를 기준으로 구성됩니다.

## Dependencies

- components: 없음
- icons: 없음
- hooks: 없음
- APIs: 없음
- utils: `cn`
- external libraries: `class-variance-authority`

## Storybook

- [x] Default
- [x] Selected
- [x] With count
- [x] Selected with count
- [x] Toggle interaction example
- [x] Filter category cases
- [x] Long text overflow
- [ ] loading
- [ ] error 또는 invalid

`Chip`은 현재 loading, error, invalid 상태를 지원하지 않습니다. 해당 상태가 필요하면 별도 prop과 story를 추가합니다.

## Testing Strategy

`Chip` 테스트는 내부 Tailwind class를 세세하게 고정하기보다, public contract와 사용자 관점의 동작을 검증합니다.

검증 대상:

- button으로 렌더링됩니다.
- `selected=true`일 때 선택 상태를 `aria-pressed=true`로 노출합니다.
- 선택되지 않은 Chip을 누르면 `onSelectedChange(true)`를 호출합니다.
- 선택된 Chip을 누르면 `onSelectedChange(false)`를 호출합니다.
- `count`가 전달되면 label 뒤에 함께 렌더링됩니다.
- `count={0}`도 유효한 값으로 렌더링됩니다.

세부 레이아웃, 색상, hover/pressed class, typography class는 테스트에서 직접 고정하지 않습니다. 해당 시각값은 구현, Storybook, Chromatic 기준으로 확인합니다.

## Non-Goals

- `FilterChip`을 별도 HDS public component로 분리하지 않습니다.
- `ChipGroup`은 이번 범위에 포함하지 않습니다.
- disabled, loading, invalid 상태는 이번 범위에 포함하지 않습니다.
- 서버 API 응답 상태나 필터 enum을 HDS props로 정의하지 않습니다.
- 도메인별 색상 의미를 `tone="reservationCanceled"`처럼 넣지 않습니다.
- 아이콘과 라벨을 함께 표시하는 키워드/상태 UI는 `Chip`의 책임으로 추가하지 않습니다.

## Architecture Decision

`Chip`은 product-agnostic filter chip primitive로 유지합니다.

현재 API는 label, optional count, selected state, toggle callback에 집중합니다. 그룹 선택 정책과 도메인 의미는 호출부가 소유합니다. 아이콘, 키워드, 도메인별 상태 표현까지 `Chip`에 포함하면 API 책임이 넓어지므로 이번 범위에서는 추가하지 않습니다.

## Verification

- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] Storybook에서 default, selected, count, overflow 상태 수동 확인
