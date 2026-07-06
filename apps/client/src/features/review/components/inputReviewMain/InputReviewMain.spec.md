# Component Spec: `InputReviewMain`

## Purpose

`InputReviewMain`은 리뷰 작성/수정 흐름에서 사진 첨부 입력과 리뷰 본문 textarea를 묶어 보여주는 review feature 전용 입력 컴포넌트입니다.

이 컴포넌트는 사진 선택 트리거, 사진 장당 5MB 초과 파일 거절, 사진 최대 10장 초과 파일 거절, 사진 오류 메시지, 리뷰 본문 입력, 글자 수 표시, 리뷰 본문 helper text 표시, 입력 callback 호출을 담당합니다. 사진 업로드, form submit, API mutation, 저장 버튼 활성화 판단은 호출부가 소유합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [x] Page or feature component

## Spec Location

- spec path: `apps/client/src/features/review/components/inputReviewMain/InputReviewMain.spec.md`
- implementation path: `apps/client/src/features/review/components/inputReviewMain/InputReviewMain.tsx`

## Usage Location

- route: `/restaurants/:restaurantId/reviews/new`, `/reviews/:reviewId/edit`
- page: `reviewNew`, `reviewEdit`
- feature: `review`
- expected path: `apps/client/src/features/review/components/inputReviewMain/InputReviewMain.tsx`

## Public API

```tsx
<InputReviewMain
  value={reviewText}
  photoFiles={photoFiles}
  onValueChange={setReviewText}
  onPhotoFilesChange={setPhotoFiles}
/>
```

- public export 여부: `apps/client/src/features/review/components/index.ts`에서 named export합니다.
- public props type export 여부: `InputReviewMainProps`를 함께 export합니다.
- 호출부가 소유하는 책임: 리뷰 본문 state, 사진 파일 state, 저장 가능 여부, API mutation.
- 컴포넌트가 소유하지 않는 책임: 파일 업로드, 서버 데이터 shape, route params, 리뷰 저장/수정 요청.
- 리뷰 입력 제한값과 에러 문구는 `apps/client/src/features/review/constants/reviewInputRules.ts`를 기준으로 사용합니다.

## Requirements

- [x] 제목 `리뷰를 작성해주세요.`를 표시합니다.
- [x] 안내 문구 `(첨부 사진 장당 5MB, 최대 10장)`를 표시합니다.
- [x] 사진 첨부 트리거는 `CameraIcon`과 `사진을 첨부해 주세요. (선택)` 문구를 표시합니다.
- [x] 사진 첨부 트리거를 누르면 숨겨진 file input을 엽니다.
- [x] file input은 `accept="image/*"`와 `multiple`을 가집니다.
- [x] file input이 변경되면 장당 5MB 이하 파일만 기존 `photoFiles` 뒤에 이어 `onPhotoFilesChange`에 전달합니다.
- [x] 장당 5MB를 초과한 파일은 `photoFiles`에 추가하지 않고 `사진은 장당 5MB 이하로 첨부해주세요.`를 표시합니다.
- [x] 선택된 사진이 10장이 되면 사진 추가 버튼과 숨겨진 file input을 비활성화합니다.
- [x] 남은 사진 슬롯보다 많은 파일을 선택하면 최대 10장까지만 `photoFiles`에 추가하고 `사진은 최대 10장까지 첨부할 수 있어요.`를 표시합니다.
- [x] 선택된 `photoFiles`가 있으면 사진 추가 버튼과 선택된 이미지 미리보기를 가로 스크롤 목록으로 표시합니다.
- [x] 선택된 이미지 미리보기 우상단에는 18px 삭제 아이콘 버튼을 표시합니다.
- [x] 이미지 삭제 버튼을 누르면 해당 이미지를 제외한 `photoFiles`를 `onPhotoFilesChange`에 전달합니다.
- [x] 이미지 삭제 버튼을 누르면 기존 사진 오류 메시지를 초기화합니다.
- [x] 리뷰 본문 textarea는 HDS `Textarea`를 사용합니다.
- [x] textarea placeholder는 `리뷰를 작성해 주세요.`입니다.
- [x] textarea에는 `maxLength`를 전달해 HDS `Textarea`의 입력 제한 로직을 사용합니다.
- [x] textarea 본문은 Figma `Long Body 1` 기준인 `typo-long-body-1`을 사용합니다.
- [x] 입력하지 않은 빈 상태의 helper text는 `10자 이상`입니다.
- [x] textarea가 focus되었거나 본문이 입력된 뒤 10자 미만이면 helper text를 `10자 이상 작성해주세요.`로 표시합니다.
- [x] 호출부에서 전달한 본문 값이 최대 글자 수를 초과한 상태면 helper text를 `글자 수 제한을 초과했어요.`로 표시합니다.
- [x] 글자 수 counter는 기본 `0/1000`을 표시합니다.
- [x] textarea가 변경되면 `onValueChange`에 다음 문자열을 전달합니다.
- [x] `disabled`이면 사진 트리거와 textarea가 비활성화됩니다.
- [x] `className`은 root section class와 병합할 수 있습니다.

## UI Structure

```text
InputReviewMain
  section
    text
      title
      description
    photo area
      empty state: photo input button
      selected state: horizontal preview list
        photo add button
        selected photo preview
          delete button
      hidden file input
    Textarea
```

## Props

### `value`

- type: `string`
- required: `false`
- default: `''`
- description: 현재 리뷰 본문입니다. 컴포넌트는 controlled textarea 값을 따릅니다.

### `onValueChange`

- type: `(value: string) => void`
- required: `false`
- description: textarea 변경 시 HDS `Textarea`의 `maxLength` 제한을 거친 다음 문자열을 호출부에 전달합니다.

### `photoFiles`

- type: `File[]`
- required: `false`
- default: `[]`
- description: 호출부가 보관 중인 선택 사진 파일 목록입니다. 컴포넌트는 이 값을 기반으로 object URL 미리보기를 렌더링합니다.

### `onPhotoFilesChange`

- type: `(files: File[]) => void`
- required: `false`
- description: file input 변경 시 선택된 file 배열을 호출부에 전달합니다.

### `maxLength`

- type: `number`
- required: `false`
- default: `1000`
- description: 리뷰 본문 최대 글자 수 기준입니다. HDS `Textarea`에 전달해 입력 값을 제한하고 helper text와 counter 상태 판단에 사용합니다.

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: 사진 첨부와 textarea 입력을 모두 비활성화합니다.

### Native section props

- type: `Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'onChange'>`
- required: `false`
- description: `className`, `aria-*`, `data-*` 등 section props를 전달할 수 있습니다. `children`과 native `onChange`는 컴포넌트 UI와 이벤트 책임을 보호하기 위해 제외합니다.

## State

- local state: file input ref, generated id, textarea focus 여부, photo object URL 목록, 사진 용량 오류 메시지를 사용합니다.
- derived state: `isReviewTextFocused || value.length > 0`, `value.length < 10`, `value.length > maxLength`
- controlled state: `value`
- uncontrolled state: 없음
- loading state: 없음
- error state: 사진 장당 5MB 초과 오류 메시지, 사진 최대 10장 초과 오류 메시지
- disabled state: `disabled`

## Behavior

1. 컴포넌트가 렌더링되면 사진 첨부 트리거와 textarea를 표시합니다.
2. 사용자가 사진 첨부 트리거를 누르면 숨겨진 file input click을 실행합니다.
3. 사용자가 파일을 선택하면 5MB 이하 파일 중 남은 사진 슬롯 수만큼만 `onPhotoFilesChange?.([...photoFiles, ...nextFiles])`로 전달합니다.
4. 5MB를 초과한 파일이 있으면 해당 파일은 거절하고 `사진은 장당 5MB 이하로 첨부해주세요.`를 표시합니다.
5. 남은 사진 슬롯보다 많은 파일을 선택하면 초과 파일은 거절하고 `사진은 최대 10장까지 첨부할 수 있어요.`를 표시합니다.
6. 선택된 사진이 10장이면 사진 추가 버튼과 file input은 비활성화됩니다.
7. 선택된 `photoFiles`가 있으면 사진 추가 버튼과 이미지 미리보기를 `overflow-x-auto` 가로 스크롤 목록으로 표시합니다.
8. 이미지 미리보기의 삭제 버튼을 누르면 사진 오류 메시지를 초기화하고, 해당 file index를 제외한 다음 `photoFiles` 배열을 `onPhotoFilesChange`에 전달합니다.
9. 사용자가 textarea를 변경하면 HDS `Textarea`가 `maxLength` 기준으로 제한한 다음 `onValueChange?.(nextValue)`를 호출합니다.
10. 입력하지 않은 빈 상태에서는 helper text를 `10자 이상`으로 표시합니다.
11. textarea가 focus되었거나 본문이 입력된 뒤 `value.length < 10`이면 helper text는 `10자 이상 작성해주세요.`입니다.
12. 호출부에서 전달한 `value.length > maxLength`이면 helper text는 `글자 수 제한을 초과했어요.`입니다.
13. `disabled=true`이면 사진 첨부 트리거, 이미지 삭제 버튼, textarea는 입력을 받지 않습니다.

## Validation

- 리뷰 본문 최소 10자 helper text는 컴포넌트가 표시합니다.
- 리뷰 본문 최대 글자 수 초과 입력은 HDS `Textarea`의 `maxLength` 입력 제한으로 먼저 막습니다.
- 이미 초과된 controlled value가 전달된 경우의 최대 글자 수 초과 helper text는 컴포넌트가 표시합니다.
- submit 가능 여부는 호출부가 처리합니다.
- 사진 장당 5MB 검증은 컴포넌트가 처리하고, 초과 파일은 호출부 상태로 전달하지 않습니다.
- 사진 최대 10장 추가 제한은 컴포넌트가 처리하고, 초과 파일은 호출부 상태로 전달하지 않습니다.
- 사진 최대 10장 저장 가능 여부 검증은 호출부가 처리합니다.
- invalid 상태에 따른 저장 가능 여부는 호출부가 처리합니다.

## Error Handling

- 장당 5MB를 초과한 사진 파일은 추가하지 않고 사진 영역에 오류 메시지를 표시합니다.
- 최대 10장을 초과한 사진 파일은 추가하지 않고 사진 영역에 오류 메시지를 표시합니다.
- 선택된 사진을 삭제하면 조건이 해소된 뒤 stale error가 남지 않도록 사진 오류 메시지를 초기화합니다.
- 업로드 실패, 리뷰 저장 실패, 네트워크 에러, retry는 호출부 또는 mutation 계층이 처리합니다.

## Styling

- styling 기준: Tailwind CSS utility class, HDS token class, HDS `Textarea`를 사용합니다.
- layout: root `section`은 full width column layout입니다.
- spacing: Figma 기준 root `px-5 py-7`, title 영역 `gap-1`, content 영역 `gap-5`를 사용합니다.
- photo input: width `353px`, height `130px`, border `warm-gray-100`, radius `10px`, icon/text center alignment를 사용합니다.
- selected photo list: width `353px`, height `130px` tile, hidden scrollbar horizontal scroll, selected image `object-cover`를 사용합니다.
- textarea: HDS `Textarea`를 사용하고, 본문 text style은 `textareaClassName="typo-long-body-1"`로 주입합니다.
- responsive: 부모 너비를 따르고 내부 control은 `max-w-[353px]`를 유지합니다.
- layout shift 방지 조건: 사진 첨부 영역은 `h-[130px]`, textarea는 HDS min-height `230px`를 유지합니다.

## Accessibility

- 사진 첨부 트리거는 native `button type="button"`이며 visible text를 accessible name으로 사용합니다.
- 이미지 삭제 버튼은 native `button type="button"`이며 `${fileName} 사진 삭제` accessible name을 사용합니다.
- file input은 `aria-label="리뷰 사진 첨부"`를 가집니다.
- textarea는 `aria-label="리뷰 내용"`을 가집니다.
- keyboard interaction: 사진 첨부는 button, textarea는 native textarea interaction을 사용합니다.
- counter는 HDS `Textarea`의 `aria-live="polite"`를 사용합니다.
- disabled state는 native disabled 속성을 사용합니다.

## Dependencies

- components: `Textarea` from `@hashi/hds-ui`
- icons: `CameraIcon`, `CloseSmallIcon` from `@hashi/hds-icons`
- hooks: `useId`, `useRef`
- constants: `reviewInputRules` from `@/features/review/constants`
- utils: `getReviewTextHelperText` from `@/features/review/utils`
- APIs: 없음
- external libraries: `cn` from `@/shared/utils`

## Storybook

HDS component가 아니므로 Storybook story를 작성하지 않습니다.

## Non-Goals

- `InputReviewMain`는 form submit이나 리뷰 저장 API를 실행하지 않습니다.
- `InputReviewMain`는 저장 가능 여부를 판단하지 않습니다.
- `InputReviewMain`는 업로드 progress를 표시하지 않습니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- InputReviewMain.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
