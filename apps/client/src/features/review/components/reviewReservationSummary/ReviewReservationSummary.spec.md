# Component Spec: `ReviewReservationSummary`

## Purpose

`ReviewReservationSummary`는 리뷰 작성/수정 흐름에서 사용자가 어떤 예약 방문에 대해 리뷰를 작성하는지 확인할 수 있도록 식당 이미지, 식당명, 방문 일시, 방문 인원 요약을 보여주는 review feature 전용 컴포넌트입니다.

이 컴포넌트는 표시 UI만 담당합니다. 예약 상세 조회, 날짜 포맷 변환, route param 해석, 리뷰 작성 가능 여부 판단은 호출부가 소유합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

## Spec Location

- spec path: `apps/client/src/features/review/components/reviewReservationSummary/ReviewReservationSummary.spec.md`
- implementation path: `apps/client/src/features/review/components/reviewReservationSummary/ReviewReservationSummary.tsx`

## Usage Location

- route: `/restaurants/:restaurantId/reviews/new`, `/reviews/:reviewId/edit`
- page: `reviewNew`, `reviewEdit`
- feature: `review`
- expected path: `apps/client/src/features/review/components/reviewReservationSummary/ReviewReservationSummary.tsx`

## Public API

```tsx
<ReviewReservationSummary
  restaurantName="야키토리 무사시"
  visitedAt="2026. 6. 22 17:00 방문"
  guestSummary="어른 2명"
  thumbnailSrc={restaurantImageUrl}
/>
```

- public export 여부: `apps/client/src/features/review/components/index.ts`에서 named export합니다.
- public props type export 여부: `ReviewReservationSummaryProps`를 함께 export합니다.
- 호출부가 소유하는 책임: 서버 데이터 조회, 날짜/인원 포맷팅, 이미지 URL 결정, 리뷰 대상 예약 선택.
- 컴포넌트가 소유하지 않는 책임: API/query/mutation, route navigation, 예약 상태 검증, 리뷰 저장/수정.

## Requirements

- [x] root는 부모 너비를 따르고 좌우 `20px` padding을 가집니다.
- [x] 본문 row는 높이 `120px`, 하단 `Warm_Gray_50` border를 가집니다.
- [x] 썸네일은 `92px` 정사각형, `5px` radius, cover fit으로 표시합니다.
- [x] `thumbnailSrc`가 없으면 같은 크기의 placeholder를 표시합니다.
- [x] 식당명은 `Sub Header 2`, `Cool_Gray_900` 스타일로 최대 2줄까지 표시합니다.
- [x] 방문 일시와 인원 요약은 `Body 7`, `Cool_Gray_600` 스타일로 표시합니다.
- [x] 긴 식당명은 텍스트 영역 안에서 줄바꿈되고 레이아웃을 깨지 않습니다.
- [x] `className`은 root section class와 병합할 수 있습니다.

## UI Structure

```text
ReviewReservationSummary
  section
    row
      thumbnail image or placeholder
      info
        restaurant name
        visited at
        guest summary
```

## Props

### `restaurantName`

- type: `string`
- required: `true`
- description: 리뷰 대상 식당명입니다.

### `visitedAt`

- type: `string`
- required: `true`
- description: 호출부에서 포맷한 방문 일시 문구입니다.

### `guestSummary`

- type: `string`
- required: `true`
- description: 호출부에서 포맷한 방문 인원 요약 문구입니다.

### `thumbnailSrc`

- type: `string`
- required: `false`
- description: 식당 대표 이미지 URL입니다. 없으면 placeholder를 표시합니다.

### Native section props

- type: `Omit<ComponentPropsWithoutRef<'section'>, 'children'>`
- required: `false`
- description: `className`, `aria-*`, `data-*` 등 section props를 전달할 수 있습니다. `children`은 컴포넌트 내부 구조를 보호하기 위해 제외합니다.

## State

- local state: 없음
- controlled state: 없음
- uncontrolled state: 없음
- loading state: 없음
- error state: 없음
- disabled state: 없음

## Behavior

1. 컴포넌트가 렌더링되면 썸네일 영역과 예약 정보 텍스트를 표시합니다.
2. `thumbnailSrc`가 있으면 `img`를 렌더링합니다.
3. `thumbnailSrc`가 없으면 접근 가능한 placeholder 영역을 렌더링합니다.
4. 컴포넌트는 클릭, navigation, mutation을 실행하지 않습니다.

## Validation

- 필드별 검증 규칙: 없음
- 버튼 활성/비활성 조건: 없음
- invalid 상태 표시 방식: 없음

## Error Handling

- 자체 에러 표시 없음.
- 이미지 URL 누락은 placeholder로 처리합니다.
- 데이터 조회 실패나 예약 없음 상태는 호출부가 처리합니다.

## Styling

- styling 기준: Tailwind CSS utility class와 HDS token class를 사용합니다.
- layout: root `section`은 full width, row는 flex layout입니다.
- spacing: root `px-5`, row `gap-3`, info `gap-2`를 사용합니다.
- responsive: 부모 너비를 따르고 내부 텍스트는 `min-w-0`으로 overflow를 방지합니다.
- hover/focus/active/disabled: 상호작용이 없으므로 별도 상태 없음.
- layout shift 방지 조건: 썸네일은 `size-[92px]` 고정 크기를 유지합니다.

## Accessibility

- label 연결: root는 `aria-label="리뷰 대상 예약 정보"` 기본값을 가집니다.
- `aria-*` 속성: `aria-label`은 호출부에서 override할 수 있습니다.
- keyboard interaction: 상호작용 없음.
- focus-visible 처리: focus 가능한 요소 없음.
- semantic element 사용 여부: root는 `section`, 이미지는 의미 있는 alt를 사용합니다.

## Dependencies

- components: 없음
- icons: 없음
- hooks: 없음
- APIs: 없음
- external libraries: `cn` from `@/shared/utils`

## Storybook

HDS component가 아니므로 Storybook story를 작성하지 않습니다.

## Non-Goals

- 날짜나 인원 포맷팅을 내부에서 하지 않습니다.
- 예약 상태, 방문 완료 여부, 리뷰 작성 가능 여부를 판단하지 않습니다.
- 컴포넌트 자체 클릭이나 상세 이동을 제공하지 않습니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- src/pages/reviewNew/ReviewNewPage.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
