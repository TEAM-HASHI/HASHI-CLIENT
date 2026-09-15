# Component Spec: `Button`

Jira: HASHI-188

## Purpose

`Button`은 사용자가 명시적인 액션을 실행할 수 있도록 하는 HDS의 텍스트 버튼 primitive입니다.

HDS는 native button 렌더링, 액션 우선도별 variant, 크기와 typography, icon slot, disabled/loading 상태, focus-visible, 기본 접근성 계약을 담당합니다. route, API, analytics, 제품 copy, Bottom bar layout과 브랜드 스타일은 앱이 소유합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Reference

- `Primary Button`: node `6974:60963`
- `Ghost`: node `6547:9257`
- `Left Icon`: node `6547:9262`
- `Bottom bar`: node `7847:100035`의 중첩된 `Button LG`만 사용 예시로 참고

## Usage Location

- implementation: `packages/hds-ui/src/components/button/Button.tsx`
- story: `packages/hds-ui/src/components/button/Button.stories.tsx`
- test: `packages/hds-ui/src/components/button/Button.test.tsx`

## Requirements

- [x] native `button`과 기본 `type="button"`을 제공합니다.
- [x] `primary`, `neutral`, `destructive`, `ghost` variant를 제공합니다.
- [x] `sm`, `md`, `lg`, `xl` size가 높이와 typography를 함께 결정합니다.
- [x] `width="fit" | "full"`을 지원합니다.
- [x] leftIcon/rightIcon slot을 지원합니다.
- [x] disabled/loading 상태에서 interaction을 차단합니다.
- [x] loading 중 `aria-busy="true"`와 spinner를 제공합니다.
- [x] loading 중 leftIcon/rightIcon을 숨깁니다.
- [x] 긴 label을 한 줄로 유지하고 overflow 시 truncate합니다.
- [x] `cva`와 `cn`으로 내부 variant와 호출부 `className`을 병합합니다.
- [x] icon-only 액션은 `IconButton`으로 분리합니다.

## UI Structure

```text
Button
  spinner | leftIcon?
  label
  rightIcon?
```

## Public API

```tsx
type ButtonVariant = 'primary' | 'neutral' | 'destructive' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'
type ButtonWidth = 'fit' | 'full'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  width?: ButtonWidth
  loading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  children: React.ReactNode
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled'
>
```

- default variant: `primary`
- default size: `lg`
- default width: `fit`
- public exports: `Button`, `ButtonProps`, `ButtonVariant`, `ButtonSize`, `ButtonWidth`

## Variants

| variant       | 목적                         | 기본 시각 표현                 |
| ------------- | ---------------------------- | ------------------------------ |
| `primary`     | 주요 완료·확인 액션          | dark filled                    |
| `neutral`     | 중립·보조 액션               | light filled                   |
| `destructive` | 낮은 강조도의 위험 액션      | light surface + red text       |
| `ghost`       | 배경이 없는 낮은 강조도 액션 | transparent + text color state |

Figma의 `tone="dark"`는 `primary`, `tone="light"`는 `neutral`, `status="delete"`는 `destructive`로 매핑합니다. `rest`, `hover`, `pressed`는 public prop이 아니라 CSS interaction state로 표현합니다.

## Sizes

| size | height | utility  | typography          |
| ---- | -----: | -------- | ------------------- |
| `sm` |   28px | `h-7`    | `typo-body-6`       |
| `md` |   36px | `h-9`    | `typo-body-6`       |
| `lg` |   42px | `h-10.5` | `typo-sub-header-2` |
| `xl` |   52px | `h-13`   | `typo-sub-header-2` |

size는 width를 결정하지 않습니다. 고정 폭과 버튼 그룹 배치는 부모 layout이 소유합니다.

## States

| variant       | rest                            | hover                          | pressed                         | disabled                          |
| ------------- | ------------------------------- | ------------------------------ | ------------------------------- | --------------------------------- |
| `primary`     | `cool-gray-800` / white         | `cool-gray-700` / white        | `cool-gray-900` / white         | `warm-gray-100` / white           |
| `neutral`     | `secondary-200` / black         | `warm-gray-50` / black         | `warm-gray-100` / black         | `secondary-200` / `warm-gray-300` |
| `destructive` | `secondary-200` / `primary-400` | `warm-gray-50` / `primary-400` | `warm-gray-100` / `primary-400` | `secondary-200` / `warm-gray-300` |
| `ghost`       | transparent / `primary-200`     | transparent / `cool-gray-400`  | transparent / `cool-gray-900`   | transparent / `warm-gray-300`     |

`destructive`의 interaction surface는 Figma의 neutral 상태 진행을 재사용하고 text intent만 `primary-400`으로 유지합니다. Figma에 없는 neutral/destructive disabled는 기존 HDS의 light disabled 조합을 유지합니다.

## Styling

- layout: `inline-flex`, center alignment
- icon/label gap: `gap-1` (4px)
- filled horizontal padding: `px-4` (16px)
- ghost horizontal padding: `px-2.5` (10px)
- radius: `rounded-[5px]`
- width: `fit`은 `w-fit`, `full`은 `w-full`
- icon color: slot의 icon이 `currentColor`를 사용할 때 Button state color를 상속합니다.
- focus-visible: native outline을 보존합니다.
- fixed/sticky/safe-area: Button에서 적용하지 않습니다.

## Behavior And Accessibility

1. `type`이 없으면 `type="button"`으로 렌더링합니다.
2. `disabled || loading`이면 native `disabled`를 설정합니다.
3. loading이면 `aria-busy="true"`를 설정합니다.
4. loading이면 slot icon 대신 장식용 spinner를 렌더링합니다.
5. visible `children`이 accessible name을 제공합니다.
6. keyboard interaction은 native button 동작을 따릅니다.
7. icon-only 액션은 필수 `aria-label` 계약을 가진 `IconButton`을 사용합니다.

## Storybook

- [x] Default
- [x] Variants
- [x] Sizes
- [x] FullWidth
- [x] DisabledVariants
- [x] LoadingVariants
- [x] WithLeftIcon
- [x] WithRightIcon
- [x] WithBothIcons
- [x] LongLabel

## Non-Goals

- Kakao/social/brand variant
- Bottom bar, dialog footer 같은 버튼 그룹 layout
- route/link/href/asChild API
- confirm/delete API나 제품 copy
- API mutation, form validation, analytics
- count와 chevron을 양끝 정렬하는 navigation row

## Verification

- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
- [x] `corepack pnpm --filter @hashi/hds-ui build-storybook`
- [x] `git diff --check`
