# OptionItem

## Purpose

`OptionItem`은 선택 가능한 option row를 렌더링하는 HDS UI primitive입니다.
Figma `Option Item` 컴포넌트와 대응하며, 기존 app 내부 `FilterBottomSheet`
option row에서 반복되던 label, selected check, disabled 상태 표현을 공통화합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Spec Location

- spec path: `packages/hds-ui/src/components/optionItem/OptionItem.spec.md`
- implementation path: `packages/hds-ui/src/components/optionItem/OptionItem.tsx`

## Public API

```tsx
<OptionItem selected onClick={handleSelect}>
  버튼
</OptionItem>
```

- public export: `OptionItem`
- public props type export: `OptionItemProps`
- 호출부가 소유하는 책임: option 값, 선택 상태, click side effect, 리스트 구조
- 컴포넌트가 소유하지 않는 책임: bottom sheet, filtering, routing, API, analytics

## Requirements

- `button` semantic을 사용합니다.
- `type="button"`을 기본으로 제공합니다.
- 선택 상태는 `aria-pressed`로 노출합니다.
- `selected=true`일 때 `CheckIcon`을 표시합니다.
- `disabled=true`일 때 native disabled를 적용하고 클릭을 차단합니다.
- 긴 label은 한 줄에서 truncate합니다.

## UI Structure

```text
OptionItem
  Label
  CheckIcon(selected only)
```

## Props

### `children`

- type: `ReactNode`
- required: `true`
- description: option label content

### `selected`

- type: `boolean`
- default: `false`
- description: selected visual state and `aria-pressed`

### native button props

- `ButtonHTMLAttributes<HTMLButtonElement>` 중 `children`, `type`을 제외한 props를 전달합니다.

## State

- local state: 없음
- controlled state: `selected`, `disabled`
- disabled state: native `disabled`

## Styling

- Figma node: `7869:35710`
- height: `36px` (`h-9`)
- vertical padding: `10px` (`py-2.5`)
- label typography: `typo-body-3`
- default text color: `cool-gray-900`
- disabled text/icon color: `warm-gray-300`
- selected icon size: `20px` (`size-5`)

Figma context에서 hover background나 pressed background 값은 제공되지 않았으므로 별도 hover/active 색상은 추가하지 않습니다.

## Accessibility

- `button` role과 accessible name은 visible label에서 제공됩니다.
- `selected`는 `aria-pressed`로 전달합니다.
- `CheckIcon`은 장식 요소이므로 `aria-hidden="true"`를 적용합니다.
- keyboard interaction은 native button 동작을 따릅니다.
- focus-visible outline은 기존 HDS interactive component 기준 `cool-gray-900`을 사용합니다.

## Dependencies

- `CheckIcon` from `@hashi/hds-icons`
- `cn` from `packages/hds-ui/src/utils`

## Storybook

- [x] Default
- [x] Selected
- [x] Disabled
- [x] LongText

## Non-Goals

- 리스트/라디오 그룹 선택 로직을 소유하지 않습니다.
- bottom sheet layout이나 footer action을 소유하지 않습니다.
- Figma에서 확인되지 않은 hover/active 배경색을 임의로 추가하지 않습니다.

## Verification

- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] `git diff --check`
