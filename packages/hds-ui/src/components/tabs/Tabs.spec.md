# Component Spec: `Tabs`

Jira: HASHI-170

## Purpose

`Tabs`는 같은 화면 안에서 관련 콘텐츠를 전환하는 HDS navigation primitive입니다.

HDS는 tab list의 시각 구조, selected/default 상태, count 표시, 접근성 속성을 담당합니다. 어떤 탭을 보여줄지와 선택된 탭에 따라 어떤 콘텐츠를 렌더링할지는 App 또는 page/feature가 담당합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Public API

```tsx
import { Tabs } from '@hashi/hds-ui'

const Example = () => {
  return (
    <Tabs
      items={[
        { value: 'info', label: '라벨', count: 12 },
        { value: 'review', label: '라벨', count: 34 },
      ]}
      value="info"
      onChange={(nextValue) => {
        console.log(nextValue)
      }}
    />
  )
}
```

Exported values:

- `Tabs`

Exported types:

- `TabsItem`
- `TabsProps`

## Props

### `items`

- type: `TabsItem[]`
- required: `true`
- description: 렌더링할 tab 목록입니다.

### `TabsItem.value`

- type: `string`
- required: `true`
- description: tab을 식별하는 값입니다. `value` prop과 비교해 selected 상태를 결정합니다.

### `TabsItem.label`

- type: `ReactNode`
- required: `true`
- description: tab에 표시할 label입니다.

### `TabsItem.count`

- type: `number`
- required: `false`
- description: label 옆에 표시할 count입니다.

### `value`

- type: `string`
- required: `true`
- description: 현재 선택된 tab value입니다.

### `onChange`

- type: `(value: string) => void`
- required: `true`
- description: 선택되지 않은 tab을 클릭했을 때 호출됩니다.

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] `role="tablist"`와 `role="tab"`을 사용합니다.
- [x] 선택된 tab에는 `aria-selected="true"`를 제공합니다.
- [x] 선택된 tab을 다시 클릭하면 `onChange`를 호출하지 않습니다.
- [x] count는 optional입니다.
- [x] tab item은 주어진 개수에 따라 동일 너비로 배치합니다.
- [x] selected indicator는 선택된 tab 위치로 slide transition 됩니다.

## Styling

Tabs:

- width: `100%`
- height: `50px`
- horizontal padding: none; App 또는 page layout이 담당합니다.
- alignment: bottom
- background: `white`

Tab item:

- layout: equal width
- padding: vertical `10px`
- gap: `4px`
- default border: bottom `1px`, `warm-gray-100`

Selected indicator:

- position: bottom
- height: `2px`
- color: `primary-200`
- width: selected tab width
- animation: `transform 200ms ease-out`
- reduced motion: `prefers-reduced-motion: reduce`에서는 transition을 제거합니다.

Label:

- default typography: `typo-body-4`
- default color: `warm-gray-300`
- selected typography: `typo-sub-header-2`
- selected color: `primary-200`
- overflow: `truncate`

Count:

- typography: `typo-caption-2`
- default color: `warm-gray-300`
- selected color: `primary-200`
- shrink: `0`

## Storybook

필수 story:

- Default
- TwoItems
- FourItems
- LongText

## Verification

```bash
corepack pnpm --filter @hashi/hds-ui lint
corepack pnpm --filter @hashi/hds-ui typecheck
corepack pnpm --filter @hashi/hds-ui test
```
