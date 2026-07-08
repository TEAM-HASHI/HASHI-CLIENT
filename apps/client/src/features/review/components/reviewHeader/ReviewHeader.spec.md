# Component Spec: `ReviewHeader`

## Purpose

`ReviewHeader`는 리뷰 작성/상세/수정 흐름 상단에서 페이지 제목과 뒤로가기 액션을 보여주는 review feature 전용 topbar입니다.

이 컴포넌트는 HDS `Header`, `IconButton`, `BackIcon` 조합만 담당합니다. 실제 라우팅, 이전 화면 결정, 페이지 본문 구성은 호출부가 소유합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

## Spec Location

- spec path: `apps/client/src/features/review/components/reviewHeader/ReviewHeader.spec.md`
- implementation path: `apps/client/src/features/review/components/reviewHeader/ReviewHeader.tsx`

## Usage Location

- route: `/restaurants/:restaurantId/reviews/new`, `/reviews/:reviewId`, `/reviews/:reviewId/edit`
- page: `reviewNew`, `reviewDetail`, `reviewEdit`
- feature: `review`
- expected path: `apps/client/src/features/review/components/reviewHeader/ReviewHeader.tsx`

## Public API

```tsx
<ReviewHeader onBackClick={handleBackClick} />
<ReviewHeader title="리뷰 상세" onBackClick={handleBackClick} />
```

- public export 여부: `apps/client/src/features/review/components/index.ts`에서 named export합니다.
- public props type export 여부: `ReviewHeaderProps`를 함께 export합니다.
- 호출부가 소유하는 책임: 뒤로가기 동작, route navigation, 화면 진입 경로 판단.
- 컴포넌트가 소유하지 않는 책임: 예약 요약, 리뷰 입력 form, 저장 버튼, API/query/mutation, tracking.

## Requirements

- [x] 높이 `75px`의 HDS center header를 렌더링합니다.
- [x] `title`을 전달하지 않으면 중앙 제목은 `리뷰 작성`으로 표시합니다.
- [x] `title`을 전달하면 중앙 제목은 전달한 값으로 표시합니다.
- [x] 왼쪽 액션에는 `aria-label="뒤로가기"`가 있는 아이콘 버튼을 표시합니다.
- [x] 뒤로가기 버튼을 누르면 `onBackClick` callback을 호출합니다.
- [x] 예약 요약, 식당명, 방문 정보, 썸네일은 렌더링하지 않습니다.

## UI Structure

```text
ReviewHeader
  Header
    leftAction: IconButton + BackIcon
    title: title
```

## Props

### `title`

- type: `string`
- required: `false`
- default: `'리뷰 작성'`
- description: Header 중앙에 표시할 제목입니다. 리뷰 작성 화면은 기본값을 사용하고, 상세/수정처럼 화면명이 다른 경우 호출부가 주입합니다.

### `onBackClick`

- type: `() => void`
- required: `false`
- description: 뒤로가기 버튼 클릭 시 호출할 callback입니다. 실제 navigation은 호출부가 처리합니다.

## State

- local state: 없음
- controlled state: 없음
- uncontrolled state: 없음
- loading state: 없음
- error state: 없음
- disabled state: 없음

## Behavior

1. 컴포넌트가 렌더링되면 HDS `Header`의 center variant 기본 구조를 사용합니다.
2. 사용자가 뒤로가기 버튼을 클릭하면 `onBackClick`을 호출합니다.
3. `onBackClick`이 없어도 버튼은 렌더링되며 추가 side effect는 없습니다.

## Validation

- 필드별 검증 규칙: 없음
- 버튼 활성/비활성 조건: 없음
- invalid 상태 표시 방식: 없음

## Error Handling

- 자체 에러 표시 없음.
- navigation 실패, route fallback, confirm dialog는 호출부가 처리합니다.

## Styling

- styling 기준: HDS `Header`, HDS `IconButton`, `@hashi/hds-icons`의 `BackIcon`을 재사용합니다.
- layout: 부모 너비를 따르는 `w-full` topbar입니다.
- position: fixed/sticky 배치는 소유하지 않으며 페이지 layout wrapper가 결정합니다.
- spacing: HDS `Header`의 `top-[33px]`, `left-[13px]`, title center 배치를 따릅니다.
- responsive: 고정 width를 소유하지 않고 부모 너비를 따릅니다.
- hover/focus/active/disabled: `IconButton`이 focus-visible 상태를 소유합니다.
- layout shift 방지 조건: 제목과 아이콘만 렌더링하므로 입력 상태 변화에 따른 layout shift가 없습니다.

## Accessibility

- label 연결: 뒤로가기 버튼은 `aria-label="뒤로가기"`를 가집니다.
- `aria-*` 속성: HDS `Header`는 semantic `header`로 렌더링됩니다.
- keyboard interaction: `IconButton`의 native button interaction을 사용합니다.
- focus-visible 처리: `IconButton`의 focus-visible outline을 사용합니다.
- semantic element 사용 여부: HDS `Header`의 `header` 요소를 사용합니다.

## Dependencies

- components: `Header`, `IconButton` from `@hashi/hds-ui`
- icons: `BackIcon` from `@hashi/hds-icons`
- hooks: 없음
- APIs: 없음
- external libraries: 없음

## Storybook

HDS component가 아니므로 Storybook story를 작성하지 않습니다.

## Non-Goals

- `ReviewHeader`는 route navigation을 직접 실행하지 않습니다.
- `ReviewHeader`는 페이지 본문, 예약 요약, 저장 버튼을 포함하지 않습니다.
- `ReviewHeader`는 fixed/sticky wrapper를 포함하지 않습니다. 상단 고정 여부는 각 페이지가 결정합니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- src/pages/reviewNew/ReviewNewPage.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
