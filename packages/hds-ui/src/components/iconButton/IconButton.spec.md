# Component Spec: `IconButton`

Jira: HASHI-188

## Purpose

`IconButton`은 visible text 없이 아이콘 하나로 액션을 실행하는 HDS interactive primitive입니다.

HDS는 native button, 정사각형 touch target, 아이콘 중앙 정렬, surface variant, disabled/loading 상태와 필수 accessible name을 담당합니다. 실제 route, API, 선택 상태, count, 제품 copy는 앱이 소유합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Reference

- `Only Icon`: node `6753:55156`
- `Button_Components / button_edit`: 40px icon-only action
- `Common_Components / topbar_*`: 24px plain icon-only action

## Usage Location

- implementation: `packages/hds-ui/src/components/iconButton/IconButton.tsx`
- story: `packages/hds-ui/src/components/iconButton/IconButton.stories.tsx`
- test: `packages/hds-ui/src/components/iconButton/IconButton.test.tsx`

## Requirements

- [x] native `button`과 기본 `type="button"`을 제공합니다.
- [x] visible text가 없으므로 `aria-label`을 필수로 요구합니다.
- [x] `plain`, `soft` variant를 제공합니다.
- [x] `xs`, `sm`, `md` touch target을 제공합니다.
- [x] disabled/loading 상태에서 interaction을 차단합니다.
- [x] loading 중 `aria-busy="true"`와 spinner를 제공합니다.
- [x] focus-visible outline을 제공합니다.
- [x] 아이콘 자체의 visual size와 color는 전달된 icon이 소유합니다.

## UI Structure

```text
IconButton
  spinner | icon
```

## Public API

```tsx
type IconButtonVariant = 'plain' | 'soft'
type IconButtonSize = 'xs' | 'sm' | 'md'

type IconButtonProps = {
  variant?: IconButtonVariant
  size?: IconButtonSize
  loading?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
  'aria-label': string
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled' | 'children' | 'aria-label'
>
```

- default variant: `plain`
- default size: `md`
- public exports: `IconButton`, `IconButtonProps`, `IconButtonVariant`, `IconButtonSize`

## Variants

### `plain`

- background: transparent
- radius: 없음
- color: `currentColor` 상속
- topbar의 뒤로가기·공유 같은 기본 icon action에 사용합니다.

### `soft`

- shape: `rounded-full`
- rest background: white
- hover background: `primary-100`
- pressed background: `warm-gray-100`
- Figma `Only Icon`의 surface 상태에 사용합니다.

Figma에는 soft disabled가 없으므로 기존 IconButton의 `disabled:opacity-40`을 유지합니다.

## Sizes

| size | button box | utility   | 주요 용도        |
| ---- | ---------: | --------- | ---------------- |
| `xs` |       24px | `size-6`  | topbar action    |
| `sm` |       36px | `size-9`  | Figma Only Icon  |
| `md` |       40px | `size-10` | 기존 edit action |

size는 icon glyph 크기를 바꾸지 않습니다. 호출부가 전달하는 icon component가 glyph 크기를 결정합니다.

## Behavior And Accessibility

1. `type`이 없으면 `type="button"`으로 렌더링합니다.
2. `disabled || loading`이면 native `disabled`를 설정합니다.
3. loading이면 `aria-busy="true"`를 설정하고 icon 대신 spinner를 렌더링합니다.
4. 전달된 icon은 장식 요소로 감싸고 `aria-label`을 accessible name으로 사용합니다.
5. keyboard interaction은 native button 동작을 따릅니다.
6. selected/pressed 도메인 상태와 count는 IconButton이 소유하지 않습니다.

## Storybook

- [x] Default
- [x] Variants
- [x] Sizes
- [x] TopbarAction
- [x] ShareAction
- [x] EditAction
- [x] Disabled
- [x] Loading
- [x] WiderTopbarHitArea

## Non-Goals

- 좋아요 count와 selected 상태
- agreement/checkbox 상태
- 제품별 icon glyph와 copy
- route, API, analytics
- safe-area와 topbar layout
- Kakao/social/brand button

## Verification

- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
- [x] `corepack pnpm --filter @hashi/hds-ui build-storybook`
- [x] `git diff --check`
