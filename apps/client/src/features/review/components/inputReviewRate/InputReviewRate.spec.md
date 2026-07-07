# Component Spec: `InputReviewRate`

## Purpose

`InputReviewRate`는 리뷰 작성/수정 흐름에서 사용자가 맛집 별점을 1점부터 5점까지 선택하는 review feature 전용 입력 컴포넌트입니다.

이 컴포넌트는 별점 UI, 선택 상태 표시, 선택 callback 호출만 담당합니다. form 제출, validation message, API mutation, 저장 버튼 활성화 판단은 호출부가 소유합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

## Spec Location

- spec path: `apps/client/src/features/review/components/inputReviewRate/InputReviewRate.spec.md`
- implementation path: `apps/client/src/features/review/components/inputReviewRate/InputReviewRate.tsx`

## Usage Location

- route: `/restaurants/:restaurantId/reviews/new`, `/reviews/:reviewId/edit`
- page: `reviewNew`, `reviewEdit`
- feature: `review`
- expected path: `apps/client/src/features/review/components/inputReviewRate/InputReviewRate.tsx`

## Public API

```tsx
<InputReviewRate value={rating} onValueChange={setRating} />
```

- public export 여부: `apps/client/src/features/review/components/index.ts`에서 named export합니다.
- public props type export 여부: `InputReviewRateProps`를 함께 export합니다.
- 호출부가 소유하는 책임: 별점 state 보관, form validation, 저장 가능 여부, API mutation.
- 컴포넌트가 소유하지 않는 책임: 서버 데이터 shape, route params, 리뷰 저장/수정 요청, validation 문구 표시.

## Requirements

- [x] 안내 문구 `이 맛집 어떠셨나요?`를 표시합니다.
- [x] 별점 선택 영역은 `role="radiogroup"`과 `aria-label="맛집 별점 선택"`을 가집니다.
- [x] 1점부터 5점까지 총 5개의 별점 버튼을 렌더링합니다.
- [x] 각 별점 버튼은 `role="radio"`, `aria-label="{n}점"`, `aria-checked`를 가집니다.
- [x] `value` 이하의 별은 filled 상태로 표시합니다.
- [x] radio 접근성 상태는 현재 선택된 별점 1개만 `aria-checked="true"`로 표시합니다.
- [x] 별점 버튼을 클릭하면 `onValueChange`에 선택한 점수를 전달합니다.
- [x] `className`은 root section class와 병합할 수 있습니다.

## UI Structure

```text
InputReviewRate
  section
    prompt text
    radiogroup
      radio button 1
      radio button 2
      radio button 3
      radio button 4
      radio button 5
```

## Props

### `value`

- type: `number`
- required: `false`
- default: `0`
- description: 현재 선택된 별점입니다. `value >= rating`인 별은 filled 상태로 표시하고, `value === rating`인 radio만 checked 상태로 표시합니다.

### `onValueChange`

- type: `(value: number) => void`
- required: `false`
- description: 별점 버튼 클릭 시 선택된 점수를 호출부에 전달합니다.

### Native section props

- type: `Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'onChange'>`
- required: `false`
- description: `className`, `aria-*`, `data-*` 등 section props를 전달할 수 있습니다. `children`과 native `onChange`는 컴포넌트 UI와 이벤트 책임을 보호하기 위해 제외합니다.

## State

- local state: 없음
- controlled state: `value`
- uncontrolled state: 없음
- loading state: 없음
- error state: 없음
- disabled state: 없음

## Behavior

1. 컴포넌트가 렌더링되면 5개의 별점 버튼을 표시합니다.
2. `value`가 0이면 모든 별점 버튼은 empty 상태입니다.
3. `value`가 3이면 1, 2, 3점 별은 filled 상태이고 4, 5점 별은 empty 상태입니다.
4. `value`가 3이면 `3점` radio만 `aria-checked="true"`이고 나머지 radio는 `aria-checked="false"`입니다.
5. 사용자가 `4점` 버튼을 누르면 `onValueChange?.(4)`를 호출합니다.
6. 컴포넌트는 내부에서 선택 state를 저장하지 않고 호출부 controlled state를 따릅니다.

## Validation

- 필드별 검증 규칙: 컴포넌트 내부 검증 없음.
- 버튼 활성/비활성 조건: 컴포넌트 내부 disabled 상태 없음.
- invalid 상태 표시 방식: 호출부가 validation message와 제출 가능 여부를 처리합니다.

## Error Handling

- 자체 에러 표시 없음.
- 별점 저장 실패, 네트워크 에러, retry는 호출부 또는 mutation 계층이 처리합니다.

## Styling

- styling 기준: Tailwind CSS utility class와 HDS token class를 사용합니다.
- layout: root `section`은 full width column layout입니다.
- spacing: Figma 기준 `pt-11`, `pb-7`, 별 간격 `gap-[10px]`를 사용합니다.
- selected star fill: Figma `Primary_400` 값인 `#FF5D5D`에 매핑되는 `text-primary-400`을 사용합니다.
- responsive: 부모 너비를 따르고 별점 row는 콘텐츠 너비만 차지합니다.
- hover/focus/active/disabled: focus-visible outline을 제공합니다. hover/active/disabled 별도 시각 상태는 현재 scope가 아닙니다.
- layout shift 방지 조건: 별 버튼은 `size-[29px]` 고정 크기를 유지합니다.

## Accessibility

- label 연결: 별점 그룹은 `aria-label="맛집 별점 선택"`을 가집니다.
- `aria-*` 속성: 각 버튼은 `aria-checked`를 가지며, 현재 선택된 별점 radio 1개만 checked 상태로 표시합니다.
- keyboard interaction: `button` 요소의 native keyboard interaction을 사용합니다.
- focus-visible 처리: 각 별점 버튼에 focus-visible outline을 제공합니다.
- semantic element 사용 여부: root는 `section`, 별점 그룹은 radio group 역할을 사용합니다.

## Dependencies

- components: 없음
- icons: `StarBlankIcon`, `StarFillIcon` from `@hashi/hds-icons`
- hooks: 없음
- constants: `REVIEW_RATING_VALUES` from `@/features/review/constants`
- APIs: 없음
- external libraries: `cn` from `@/shared/utils`

## Storybook

HDS component가 아니므로 Storybook story를 작성하지 않습니다.

## Non-Goals

- `InputReviewRate`는 form submit이나 리뷰 저장 API를 실행하지 않습니다.
- `InputReviewRate`는 validation 문구를 표시하지 않습니다.
- `InputReviewRate`는 반쪽 별점이나 0.5점 단위를 지원하지 않습니다.
- 추후 키보드 화살표 이동이 필요하면 radio group keyboard behavior를 별도 개선합니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- ReviewHeader.test.tsx InputReviewRate.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
