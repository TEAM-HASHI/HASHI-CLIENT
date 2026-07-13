# Component Spec: `InputReviewKeyword`

## Purpose

`InputReviewKeyword`는 리뷰 작성/수정 흐름에서 사용자가 좋았던 점을 1개부터 3개까지 선택하는 review feature 전용 입력 컴포넌트입니다.

이 컴포넌트는 키워드 목록 표시, 선택 상태 표시, 최대 3개 선택 제한, 선택 callback 호출만 담당합니다. form 제출, 필수 선택 validation message, API mutation, 저장 버튼 활성화 판단은 호출부가 소유합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

## Spec Location

- spec path: `apps/client/src/features/review/components/inputReviewKeyword/InputReviewKeyword.spec.md`
- implementation path: `apps/client/src/features/review/components/inputReviewKeyword/InputReviewKeyword.tsx`

## Usage Location

- route: `/restaurants/:restaurantId/reviews/new`, `/reviews/:reviewId/edit`
- page: `reviewNew`, `reviewEdit`
- feature: `review`
- expected path: `apps/client/src/features/review/components/inputReviewKeyword/InputReviewKeyword.tsx`

## Public API

```tsx
<InputReviewKeyword
  keywordOptions={reviewKeywordOptions}
  selectedKeywordIds={selectedKeywordIds}
  onSelectedKeywordIdsChange={setSelectedKeywordIds}
/>
```

- public export 여부: `apps/client/src/features/review/components/index.ts`에서 named export합니다.
- public props type export 여부: `InputReviewKeywordProps`를 함께 export합니다.
- 키워드 id와 option type은 `apps/client/src/features/review/constants/reviewKeywords.ts`에서 export합니다.
- `keywordOptions`가 없으면 기존 `REVIEW_KEYWORDS`를 기본값으로 사용합니다.
- context API의 키워드 선택지를 주입하면 API `code`를 id로, `label`을 화면 문구로 사용합니다.
- API 선택지는 icon 없이 렌더링할 수 있습니다.
- 호출부가 소유하는 책임: 선택 state 보관, form validation, 저장 가능 여부, API mutation.
- 컴포넌트가 소유하지 않는 책임: 서버 데이터 shape, route params, 리뷰 저장/수정 요청, validation 문구 표시.

## Requirements

- [x] 제목 `어떤 점이 좋으셨나요?`를 표시합니다.
- [x] 안내 문구 `( 키워드를 1개~3개 선택해주세요.)`를 표시합니다.
- [x] 키워드 선택 영역은 `role="group"`과 `aria-label="리뷰 키워드 선택"`을 가집니다.
- [x] Figma 기준 10개의 리뷰 키워드를 렌더링합니다.
- [x] `keywordOptions`가 전달되면 해당 선택지만 렌더링합니다.
- [x] 각 키워드는 HDS `Badge`와 HDS icon을 사용해 `button`으로 렌더링합니다.
- [x] 선택된 키워드는 `aria-pressed="true"` 상태를 가집니다.
- [x] 선택되지 않은 키워드를 누르면 `onSelectedKeywordIdsChange`에 기존 선택값 뒤로 해당 id를 추가해 전달합니다.
- [x] 선택된 키워드를 다시 누르면 `onSelectedKeywordIdsChange`에 해당 id를 제거한 배열을 전달합니다.
- [x] 이미 3개가 선택된 상태에서는 선택되지 않은 키워드를 추가할 수 없습니다.
- [x] 이미 3개가 선택된 상태에서는 선택되지 않은 키워드를 비활성 시각 상태로 표시합니다.
- [x] 3개가 선택된 상태에서도 선택된 키워드는 다시 눌러 해제할 수 있습니다.
- [x] `className`은 root section class와 병합할 수 있습니다.

## UI Structure

```text
InputReviewKeyword
  section
    text
      title
      description
    keyword group
      Badge keyword 1
      Badge keyword 2
      ...
```

## Props

### `keywordOptions`

- type: `{ id: string; label: string; Icon?: ComponentType<SVGProps<SVGSVGElement>> }[]`
- required: `false`
- default: `REVIEW_KEYWORDS`
- description: 화면에 표시할 키워드 목록입니다. API context의 keyword code와 label을 주입할 수 있습니다.

### `selectedKeywordIds`

- type: `ReviewKeywordId[]`
- required: `false`
- default: `[]`
- description: 현재 선택된 키워드 id 목록입니다. 컴포넌트는 controlled state를 따릅니다.

### `onSelectedKeywordIdsChange`

- type: `(selectedKeywordIds: ReviewKeywordId[]) => void`
- required: `false`
- description: 키워드 선택이 바뀔 때 다음 선택 id 목록을 호출부에 전달합니다.

### Native section props

- type: `Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'onChange'>`
- required: `false`
- description: `className`, `aria-*`, `data-*` 등 section props를 전달할 수 있습니다. `children`과 native `onChange`는 컴포넌트 UI와 이벤트 책임을 보호하기 위해 제외합니다.

## State

- local state: 없음
- controlled state: `selectedKeywordIds`
- uncontrolled state: 없음
- loading state: 없음
- error state: 없음
- disabled state: 최대 선택 개수에 도달하면 선택되지 않은 badge는 `aria-disabled="true"`와 HDS `Badge`의 비활성 시각 상태로 추가 선택 불가 상태를 표시합니다.

## Behavior

1. 컴포넌트가 렌더링되면 10개의 키워드 badge를 표시합니다.
2. `selectedKeywordIds`에 포함된 키워드는 selected 상태로 표시합니다.
3. 사용자가 미선택 키워드를 누르고 현재 선택 수가 최대 선택 개수 미만이면 해당 id를 추가한 배열을 전달합니다.
4. 사용자가 선택 키워드를 누르면 해당 id를 제거한 배열을 전달합니다.
5. 현재 선택 수가 최대 선택 개수이면 미선택 키워드는 비활성처럼 표시됩니다.
6. 현재 선택 수가 최대 선택 개수이고 사용자가 미선택 키워드를 누르면 callback을 호출하지 않습니다.
7. 컴포넌트는 내부에서 선택 state를 저장하지 않고 호출부 controlled state를 따릅니다.

## Validation

- 필수 선택 조건: 호출부가 `REVIEW_KEYWORD_MIN_SELECTED_COUNT` 기준으로 판단합니다.
- 최대 선택 조건: 컴포넌트는 `REVIEW_KEYWORD_MAX_SELECTED_COUNT` 초과 선택을 막습니다.
- invalid 상태 표시 방식: 호출부가 validation message와 제출 가능 여부를 처리합니다.

## Error Handling

- 자체 에러 표시 없음.
- 리뷰 저장 실패, 네트워크 에러, retry는 호출부 또는 mutation 계층이 처리합니다.

## Styling

- styling 기준: Tailwind CSS utility class, HDS token class, HDS `Badge`를 사용합니다.
- layout: root `section`은 full width column layout입니다.
- spacing: Figma 기준 root `px-5 py-7`, title 영역 `gap-1`, content 영역 `gap-5`, keyword group `gap-x-2 gap-y-3`를 사용합니다.
- badge: HDS `Badge`의 리뷰 키워드 구조를 사용하고 Figma의 radius와 border에 맞게 class를 병합합니다.
- responsive: 부모 너비를 따르고 keyword group은 줄바꿈됩니다.
- hover/focus/active/disabled: focus-visible outline과 `aria-disabled` 비활성 시각 상태는 HDS `Badge`가 제공합니다.
- layout shift 방지 조건: icon slot은 `24px` 고정 크기를 유지합니다.

## Accessibility

- label 연결: 키워드 그룹은 `aria-label="리뷰 키워드 선택"`을 가집니다.
- `aria-*` 속성: 각 badge button은 HDS `Badge`의 `aria-pressed`를 사용합니다.
- 추가 선택 불가 상태: 3개 선택 시 미선택 badge는 `aria-disabled="true"`를 가지고 비활성처럼 표시됩니다.
- keyboard interaction: HDS `Badge`의 native button interaction을 사용합니다.
- focus-visible 처리: HDS `Badge`의 focus-visible outline을 사용합니다.
- semantic element 사용 여부: root는 `section`, 키워드 묶음은 `role="group"`을 사용합니다.

## Dependencies

- components: `Badge` from `@hashi/hds-ui`
- constants: `REVIEW_KEYWORDS`, `REVIEW_KEYWORD_MAX_SELECTED_COUNT` from `@/features/review/constants`
- utils: `getNextSelectedReviewKeywordIds` from `@/features/review/utils`
- icons: `REVIEW_KEYWORDS`가 참조하는 HDS icons
- hooks: 없음
- APIs: 없음
- external libraries: `cn` from `@/shared/utils`

## Storybook

HDS component가 아니므로 Storybook story를 작성하지 않습니다.

## Non-Goals

- `InputReviewKeyword`는 form submit이나 리뷰 저장 API를 실행하지 않습니다.
- `InputReviewKeyword`는 validation 문구를 표시하지 않습니다.
- `InputReviewKeyword`는 서버 enum 값을 변환하지 않습니다.
- `InputReviewKeyword`는 사용자가 0개를 선택한 상태 자체를 invalid로 표시하지 않습니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- InputReviewKeyword.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
