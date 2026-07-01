# Component Spec: `Chip`

## Purpose

`Chip`은 짧은 필터 값을 알약 형태로 표시하고, 선택 여부를 동일한 시각 규칙으로 표현하는 HDS UI primitive입니다.

첨부 디자인의 칩은 모두 사용자가 선택 상태를 바꿀 수 있는 필터 칩입니다. HDS는 칩의 시각 구조, 선택 상태, button 기반 접근성 계약만 담당하고, 필터 값과 단일/다중 선택 정책은 호출부가 소유합니다.

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
- [x] 칩은 고정 width/height가 아니라 라벨 길이와 padding으로 크기를 정합니다.
- [x] 예외적으로 긴 라벨이 들어와도 부모 layout을 밀어내지 않도록 max-width와 overflow 정책을 정합니다.

## UI Structure

```text
Chip
  Root
    Label
```

## Props

### `children`

- type: `ReactNode`
- required: `true`
- description: 칩 안에 표시할 라벨입니다. 일반 사용은 짧은 텍스트를 권장합니다.

### `selected`

- type: `boolean`
- required: `false`
- default: `false`
- description: 선택된 시각 상태를 제어합니다.

### `onSelectedChange`

- type: `(selected: boolean) => void`
- required: `false`
- description: 칩이 눌렸을 때 다음 선택 상태를 호출부에 전달합니다.

### `size`

- type: `'md'`
- required: `false`
- default: `'md'`
- description: 현재 디자인 기준 크기입니다. 후속 Figma variant가 생기면 `'sm'`, `'lg'`를 추가할 수 있습니다.

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
- disabled state: 제공하지 않음

## Behavior

1. 칩은 항상 native `button`으로 렌더링합니다.
2. 클릭 시 `onSelectedChange?.(!selected)`를 호출합니다.
3. 단일 선택 그룹에서 이미 선택된 칩을 다시 눌렀을 때 해제할지 유지할지는 호출부가 결정합니다.
4. `onSelectedChange`가 없으면 native button 의미와 `aria-pressed`만 제공하고 상태 변경 side effect는 발생하지 않습니다.

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
- layout:
  - inline-flex
  - center aligned label
  - pill radius
- sizing:
  - width와 height를 고정하지 않고 label content, padding, line-height로 크기를 정합니다.
  - 기본 라벨은 한 줄 pill 형태를 유지합니다.
  - 부모가 좁거나 라벨이 비정상적으로 길면 max-width 안에서 ellipsis 처리합니다.
- spacing:
  - horizontal padding은 `12px`입니다.
  - vertical padding은 `8px`입니다.
  - border radius는 `10rem`입니다.
- typography:
  - label은 `typo-body-7`을 사용합니다.
- selected:
  - fill: `cool-gray-800`
  - text: `white`
- unselected:
  - fill: `warm-gray-50`
  - text: `primary-200`
- hover/focus/active:
  - hover/active cursor와 focus-visible ring을 제공합니다.
- layout shift 방지 조건:
  - `selected` 전환 시 border width, font weight, padding 변화로 크기가 흔들리지 않아야 합니다.
  - 긴 라벨 방어는 고정 width가 아니라 `max-width`, `min-w-0`, `truncate` 같은 overflow 제어로 처리합니다.

## Accessibility

- semantic element: `button`
- `type="button"`을 사용합니다.
- `aria-pressed={selected}`를 제공합니다.
- Enter, Space는 native button keyboard interaction에 맡깁니다.
- focus-visible:
  - keyboard 사용자가 현재 focus 위치를 알 수 있는 ring을 제공합니다.

## Dependencies

- components: 없음
- icons: 없음
- hooks: 없음
- APIs: 없음
- external libraries: `cn` utility

## Storybook

- [x] Default
- [x] selected / unselected
- [x] filter category / reservation / rating / sort cases
- [ ] loading
- [ ] error 또는 invalid
- [x] 긴 텍스트 또는 overflow
- [ ] icon 포함 케이스

`Chip`은 현재 loading, error, invalid, icon을 지원하지 않습니다. 해당 story는 prop 추가가 확정될 때 작성합니다.

## Non-Goals

- `FilterChip`을 별도 HDS public component로 분리하지 않습니다.
- `ChipGroup`은 이번 범위에 포함하지 않습니다. 단일 선택, 다중 선택, wrapping, spacing 정책이 여러 화면에서 반복되면 별도 compound primitive로 검토합니다.
- disabled 상태는 이번 범위에 포함하지 않습니다. Figma variant가 확정되면 별도 prop과 story로 추가합니다.
- 서버 API 응답 상태나 필터 enum을 HDS props로 정의하지 않습니다.
- 도메인별 색상 의미를 `tone="reservationCanceled"`처럼 넣지 않습니다.

## Architecture Decision

하나의 `Chip` 컴포넌트를 button 기반 필터 칩으로 구현합니다.

별도 `FilterChip`을 만들지 않는 이유:

- 현재 HDS에 노출할 칩 유형이 필터 칩 하나입니다.
- `Chip`이라는 이름만으로도 제품 의미 없이 shape, selected state, accessibility contract를 표현할 수 있습니다.
- 정렬, 예약, 평점 같은 필터 도메인은 호출부가 label과 state로 주입합니다.

## Verification

- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] Storybook에서 selected, unselected, filter cases, overflow 상태 수동 확인
