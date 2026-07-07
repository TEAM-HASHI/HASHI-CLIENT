# Component Spec: `ReviewSubmitBar`

## Purpose

`ReviewSubmitBar`는 리뷰 작성/수정 흐름 하단에서 `저장하기` 액션을 제공하는 review feature 전용 bottom action bar입니다.

이 컴포넌트는 하단 버튼 배치, disabled/loading 상태 표시, submit callback 호출만 담당합니다. 저장 가능 조건 계산, form validation, API mutation, 성공/실패 처리, route 이동은 호출부가 소유합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

## Spec Location

- spec path: `apps/client/src/features/review/components/reviewSubmitBar/ReviewSubmitBar.spec.md`
- implementation path: `apps/client/src/features/review/components/reviewSubmitBar/ReviewSubmitBar.tsx`

## Usage Location

- route: `/restaurants/:restaurantId/reviews/new`, `/reviews/:reviewId/edit`
- page: `reviewNew`, `reviewEdit`
- feature: `review`
- expected path: `apps/client/src/features/review/components/reviewSubmitBar/ReviewSubmitBar.tsx`

## Public API

```tsx
<ReviewSubmitBar
  disabled={!isReviewFormValid}
  loading={isSubmitting}
  onSubmit={handleSubmit}
/>
```

- public export 여부: `apps/client/src/features/review/components/index.ts`에서 named export합니다.
- public props type export 여부: `ReviewSubmitBarProps`를 함께 export합니다.
- 호출부가 소유하는 책임: 저장 가능 여부 계산, form validation, API mutation, loading state, 성공/실패 처리, navigation.
- 컴포넌트가 소유하지 않는 책임: 별점/키워드/본문/사진 상태, 서버 데이터 shape, 저장 API 호출, analytics.

## Requirements

- [x] `저장하기` 텍스트를 가진 버튼을 표시합니다.
- [x] 버튼은 HDS `Button`을 사용합니다.
- [x] 버튼 width는 부모 기준 full이며, 호출부의 layout padding 안에서 사용 가능한 너비를 채웁니다.
- [x] 버튼 height는 Figma 기준 `46px`입니다.
- [x] disabled 상태를 지원하며 native `disabled`를 버튼에 전달합니다.
- [x] loading 상태를 지원하며 중복 클릭을 차단합니다.
- [x] 버튼 클릭 시 `onSubmit` callback을 호출합니다.
- [x] `type` prop을 전달할 수 있고 기본값은 `button`입니다.
- [x] `className`은 root footer class와 병합할 수 있습니다.

## UI Structure

```text
ReviewSubmitBar
  footer
    Button "저장하기"
```

## Props

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: 저장 버튼을 비활성화합니다. 실제 비활성 조건은 호출부가 계산합니다.

### `loading`

- type: `boolean`
- required: `false`
- default: `false`
- description: 저장 중임을 표시하고 중복 클릭을 막습니다.

### `onSubmit`

- type: `() => void`
- required: `false`
- description: 저장 버튼 클릭 시 호출할 callback입니다.

### `type`

- type: `button | submit | reset`
- required: `false`
- default: `button`
- description: form 내부에서 사용할 버튼 type입니다.

### Native footer props

- type: `Omit<ComponentPropsWithoutRef<'footer'>, 'children' | 'onSubmit'>`
- required: `false`
- description: `className`, `aria-*`, `data-*` 등 footer props를 전달할 수 있습니다. `children`은 컴포넌트 UI 책임을 보호하기 위해 제외합니다.

## State

- local state: 없음
- controlled state: `disabled`, `loading`
- uncontrolled state: 없음
- loading state: HDS `Button`에 위임
- disabled state: HDS `Button`에 위임

## Behavior

1. 컴포넌트가 렌더링되면 하단 영역에 `저장하기` 버튼을 표시합니다.
2. 버튼을 누르면 `onSubmit?.()`을 호출합니다.
3. `disabled=true`이면 native disabled 상태가 되고 click callback이 실행되지 않습니다.
4. `loading=true`이면 HDS `Button` loading 상태가 되고 click callback이 실행되지 않습니다.
5. 저장 가능 조건, 에러 표시, 실제 저장 요청은 호출부가 처리합니다.

## Validation

- 필드별 validation 없음.
- 버튼 활성/비활성 조건은 호출부가 `disabled`로 전달합니다.
- invalid 상태 문구는 입력 컴포넌트 또는 page form이 처리합니다.

## Error Handling

- 자체 에러 표시 없음.
- 저장 실패, 네트워크 에러, retry, toast, route 이동은 호출부 또는 mutation 계층이 처리합니다.

## Styling

- styling 기준: Tailwind CSS utility class, HDS token class, HDS `Button`을 사용합니다.
- layout: root `footer`는 full width bottom bar 영역입니다.
- spacing: Figma 기준 root `px-5 pt-[17px]`, button height `46px`를 사용합니다.
- disabled visual: HDS `Button`의 `secondary-200` background와 `warm-gray-300` text를 사용합니다.
- responsive: root와 버튼은 부모 너비를 따르고 고정 max width를 두지 않습니다.
- layout shift 방지 조건: loading/disabled 상태에서도 버튼 높이 `46px`를 유지합니다.

## Accessibility

- 버튼은 native `button`입니다.
- visible label `저장하기`를 accessible name으로 사용합니다.
- disabled state는 native disabled 속성을 사용합니다.
- loading state는 HDS `Button`의 `aria-busy`를 사용합니다.
- keyboard interaction은 native button interaction을 사용합니다.

## Dependencies

- components: `Button` from `@hashi/hds-ui`
- icons: 없음
- hooks: 없음
- APIs: 없음
- external libraries: `cn` from `@/shared/utils`

## Storybook

HDS component가 아니므로 Storybook story를 작성하지 않습니다.

## Non-Goals

- `ReviewSubmitBar`는 리뷰 저장 API를 실행하지 않습니다.
- `ReviewSubmitBar`는 form validation을 계산하지 않습니다.
- `ReviewSubmitBar`는 confirm dialog, toast, route navigation을 실행하지 않습니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- src/pages/reviewNew/ReviewNewPage.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
