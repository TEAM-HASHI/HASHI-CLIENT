# Component Spec: `ReviewDeleteConfirmDialog`

## Purpose

`ReviewDeleteConfirmDialog`는 리뷰 삭제 전 사용자에게 삭제 확인을 요청하는 리뷰 도메인 feature component입니다.

마이 리뷰 페이지와 리뷰 상세 페이지에서 동일한 삭제 확인 UI를 재사용할 수 있도록 `features/review/components`에 둡니다.

## Public API

```tsx
<Dialog.Root open={isOpen} onOpenChange={setIsOpen} type="alertdialog">
  <ReviewDeleteConfirmDialog onDelete={handleDeleteReview} />
</Dialog.Root>
```

- exported from: `apps/client/src/features/review/components/index.ts`
- props:
  - `onDelete`: 삭제 확인 버튼을 눌렀을 때 호출되는 callback

## Responsibilities

- 삭제 확인 모달의 icon, title, description, footer button UI를 렌더링합니다.
- 취소 버튼은 dialog를 닫습니다.
- 삭제 버튼은 `onDelete` callback을 호출합니다.

## Non Responsibilities

- 삭제 API mutation을 직접 호출하지 않습니다.
- query cache 갱신을 직접 처리하지 않습니다.
- 삭제 이후 navigation, toast, page-local state 변경을 직접 처리하지 않습니다.
- dialog open state를 직접 소유하지 않습니다.

실제 삭제 실행과 삭제 이후 플로우는 각 page 또는 page hook이 소유합니다.

## Usage

- `pages/myReviews`: page-local mock state에서 작성한 리뷰를 제거하고 count/empty state를 갱신합니다.
- `pages/reviewDetail`: 추후 상세 페이지 삭제 플로우에서 삭제 후 navigation 또는 query 갱신을 담당합니다.

## Accessibility

- 상위 호출부는 `Dialog.Root`에 `type="alertdialog"`를 전달합니다.
- title과 description은 HDS `Dialog` subcomponent를 통해 연결됩니다.

## Verification

- `corepack pnpm --filter @hashi/client lint`
- `corepack pnpm --filter @hashi/client typecheck`
- `corepack pnpm --filter @hashi/client test`
