# HASHI-197 Review Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존에 작성한 리뷰를 수정 화면에서 불러와 Figma에 맞는 입력 상태로 확인·편집할 수 있게 하고, 상세/목록의 수정 동선을 실제 화면으로 연결한다.

**Architecture:** `/reviews/:reviewId/edit`는 이미 등록된 auth-only lazy route를 사용한다. 페이지는 기존 `useMyReviewDetailQuery`를 읽기 전용으로 재사용하고, 페이지 전용 hook에서 최초 응답만 form 상태로 초기화한다. 수정 API는 Swagger에 없으므로 mutation, cache 갱신, 성공 이동을 추가하지 않고 저장 버튼은 Figma의 활성/비활성 표현만 담당한다.

**Tech Stack:** React, TypeScript, React Router, TanStack Query, Tailwind CSS, Vitest, Testing Library, HASHI HDS.

**Spec:** `apps/client/src/pages/reviewEdit/ReviewEditPage.spec.md`

## Global Constraints

- Jira: `HASHI-197`; branch: `feat/HASHI-197-review-edit`.
- 새 route 문자열을 만들지 않고 `ROUTES.reviewEdit`와 `generatePath`를 사용한다.
- 수정 API와 이미지 업로드 API는 Swagger에 없으므로 호출, mock, mutation을 만들지 않는다.
- page-local orchestration은 `apps/client/src/pages/reviewEdit/`에 둔다. 리뷰 작성/수정 양쪽이 쓰는 입력 UI만 `features/review`에 둔다.
- HDS 내부 class/token을 앱 페이지 테스트에서 직접 단언하지 않는다. 사용자에게 보이는 이름·상태·동작을 검증한다.
- Figma node `8317:35917`의 92px 예약 썸네일, 36px 별점, 130px 사진 tile, 본문 최소 230px, keyword 최대 3개 규칙을 기존 HDS/review feature 컴포넌트에 맞춰 반영한다.

## Review Focus

- 유효하지 않은 `reviewId`가 detail API 호출 없이 목록 복귀 UI를 보여주는지.
- 수정 화면을 연 뒤 background refetch가 발생해도 사용자가 바꾼 입력값을 초기 응답으로 다시 덮어쓰지 않는지.
- 기존 서버 이미지와 새 로컬 파일이 합산 10장을 넘지 않고, 각각의 삭제가 올바른 local state만 바꾸는지.
- 키워드가 이미 3개 선택된 리뷰에서는 나머지 선택지가 추가 선택되지 않는지.
- 유효한 저장 버튼 클릭이 수정 API 호출·캐시 갱신·페이지 이동을 하지 않는지.

---

### Task 1: Enable the existing edit entry points

**Files:**

- Modify: `apps/client/src/pages/reviewDetail/hooks/useReviewDetailPage.ts`
- Modify: `apps/client/src/pages/reviewDetail/ReviewDetailPage.tsx`
- Modify: `apps/client/src/pages/reviewDetail/ReviewDetailPage.test.tsx`
- Modify: `apps/client/src/pages/reviewDetail/ReviewDetailPage.spec.md`
- Modify: `apps/client/src/pages/myReviews/hooks/useMyReviewsPage.ts`
- Modify: `apps/client/src/pages/myReviews/MyReviewsPage.tsx`
- Modify: `apps/client/src/pages/myReviews/MyReviewsPage.test.tsx`
- Modify: `apps/client/src/pages/myReviews/MyReviewsPage.spec.md`

**Interfaces:**

- Consumes: `ROUTES.reviewEdit`, React Router `generatePath`, existing `ReviewDetailActionBar` and `WrittenReviewCard` edit callbacks.
- Produces: `handleNavigateToReviewEdit(reviewId: string)` from `useMyReviewsPage` and a detail-page edit action that navigates to `generatePath(ROUTES.reviewEdit, { reviewId })`.

- [ ] **Step 1: Write failing navigation tests**

```tsx
it('navigates to the review edit page from review detail', async () => {
  renderPage()
  await screen.findByText('아키토리 라멘')

  fireEvent.click(screen.getByRole('button', { name: '수정하기' }))

  expect(navigateMock).toHaveBeenCalledWith('/reviews/5/edit')
})

it('navigates to the review edit page from the written-review menu', async () => {
  renderPage(`${ROUTES.myReviews}?tab=written`)
  fireEvent.click((await screen.findAllByLabelText(/리뷰 메뉴 열기/))[0])
  fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }))

  expect(mockNavigate).toHaveBeenCalledWith('/reviews/31/edit')
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `corepack pnpm --filter @hashi/client exec vitest run src/pages/reviewDetail/ReviewDetailPage.test.tsx src/pages/myReviews/MyReviewsPage.test.tsx`

Expected: the new assertions fail because both edit actions still open `ComingSoonDialog`.

- [ ] **Step 3: Replace only the coming-soon edit flow**

```ts
const handleEditClick = () => {
  if (validReviewId !== null) {
    navigate(
      generatePath(ROUTES.reviewEdit, { reviewId: String(validReviewId) }),
    )
  }
}

const handleNavigateToReviewEdit = (reviewId: string) => {
  navigate(generatePath(ROUTES.reviewEdit, { reviewId }))
}
```

Remove only the edit-specific `ComingSoonDialog` state, JSX, imports, and callbacks. Keep delete-dialog behavior unchanged. Update both page specs so `수정하기` describes the real route rather than a prepared dialog.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `corepack pnpm --filter @hashi/client exec vitest run src/pages/reviewDetail/ReviewDetailPage.test.tsx src/pages/myReviews/MyReviewsPage.test.tsx`

Expected: PASS; delete, retry, menu-dismiss, and written-list behavior remain covered.

- [ ] **Step 5: Commit the independently reviewable navigation change**

```bash
git add apps/client/src/pages/reviewDetail apps/client/src/pages/myReviews
git commit -m "feat(client): HASHI-197 리뷰 수정 진입 연결"
```

### Task 2: Support existing review photos in the shared review input

**Files:**

- Modify: `apps/client/src/features/review/components/inputReviewMain/InputReviewMain.tsx`
- Modify: `apps/client/src/features/review/components/inputReviewMain/useReviewPhotoUploader.ts`
- Modify: `apps/client/src/features/review/components/inputReviewMain/ReviewPhotoUploader.tsx`
- Modify: `apps/client/src/features/review/components/inputReviewMain/InputReviewMain.test.tsx`
- Modify: `apps/client/src/features/review/components/inputReviewMain/InputReviewMain.spec.md`

**Interfaces:**

- Consumes: controlled `photoFiles: File[]`, `onPhotoFilesChange`, review image limits and existing `ReviewPhotoUploader` accessibility labels.
- Produces: optional controlled `photoUrls: string[]` and `onPhotoUrlsChange(urls: string[])` props; uploader preview items distinguish an existing URL from a local `File` while enforcing `photoUrls.length + photoFiles.length <= REVIEW_PHOTO_MAX_COUNT`.

- [ ] **Step 1: Write failing input-component tests**

```tsx
it('renders API photo URLs and removes only the selected existing image', () => {
  const onPhotoUrlsChange = vi.fn()
  render(
    <InputReviewMain
      photoUrls={['https://cdn.hashi.kr/review-1.jpg']}
      onPhotoUrlsChange={onPhotoUrlsChange}
    />,
  )

  fireEvent.click(
    screen.getByRole('button', { name: '기존 리뷰 사진 1 사진 삭제' }),
  )

  expect(onPhotoUrlsChange).toHaveBeenCalledWith([])
})

it('disables adding a photo when existing URLs and local files total ten', () => {
  render(
    <InputReviewMain
      photoUrls={createUrls(9)}
      photoFiles={createImageFiles(1)}
    />,
  )

  expect(
    screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
  ).toBeDisabled()
})
```

- [ ] **Step 2: Run the component tests and verify RED**

Run: `corepack pnpm --filter @hashi/client exec vitest run src/features/review/components/inputReviewMain/InputReviewMain.test.tsx`

Expected: the new prop types and existing-photo delete button do not exist.

- [ ] **Step 3: Extend the controlled input without changing write-page semantics**

```ts
export interface InputReviewMainProps {
  photoFiles?: File[]
  photoUrls?: string[]
  onPhotoFilesChange?: (files: File[]) => void
  onPhotoUrlsChange?: (urls: string[]) => void
  // existing text props unchanged
}
```

Create stable preview IDs from `url` plus index, expose existing photos as `기존 리뷰 사진 {n}`, and route their delete controls to `onPhotoUrlsChange`. Continue to validate MIME type/size only for newly chosen `File`s. Use the combined count solely for the maximum-slot state. Do not download URLs into `File`s and do not add upload behavior.

- [ ] **Step 4: Run the component tests and verify GREEN**

Run: `corepack pnpm --filter @hashi/client exec vitest run src/features/review/components/inputReviewMain/InputReviewMain.test.tsx`

Expected: PASS; existing local-file selection, file validation, text counter, and disabled behavior still pass.

- [ ] **Step 5: Commit the reusable input capability**

```bash
git add apps/client/src/features/review/components/inputReviewMain
git commit -m "feat(client): HASHI-197 기존 리뷰 사진 입력 지원"
```

### Task 3: Compose and document the API-free review edit page

**Files:**

- Create: `apps/client/src/pages/reviewEdit/hooks/useReviewEditPage.ts`
- Create: `apps/client/src/pages/reviewEdit/utils/reviewEditViewModel.ts`
- Create: `apps/client/src/pages/reviewEdit/ReviewEditPage.test.tsx`
- Create: `apps/client/src/pages/reviewEdit/ReviewEditPage.spec.md`
- Modify: `apps/client/src/pages/reviewEdit/ReviewEditPage.tsx`

**Interfaces:**

- Consumes: `useMyReviewDetailQuery(reviewId)`, `useReviewForm`, `ReviewHeader`, `ReviewReservationSummary`, `InputReviewRate`, `InputReviewKeyword`, `InputReviewMain`, `ReviewSubmitBar`, and `getReviewKeywordByValue`.
- Produces: `useReviewEditPage()` with validated route ID, loading/error/retry state, stable initialized form state, local existing-image state, and `isSaveDisabled`; it performs no mutation.

- [ ] **Step 1: Write failing page tests**

```tsx
it('prefills the edit form from the review-detail response', async () => {
  renderPage()

  expect(
    await screen.findByDisplayValue(
      '정말 맛있습니다. 다음에도 방문하고 싶어요.',
    ),
  ).toBeVisible()
  expect(screen.getByRole('radio', { name: '4점' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  expect(screen.getByText('음식이 맛있어요')).toBeVisible()
  expect(
    screen.getByRole('img', { name: '기존 리뷰 사진 1 미리보기' }),
  ).toBeVisible()
})

it('enables save for a valid edited form without issuing an update request', async () => {
  renderPage()
  await screen.findByDisplayValue(/정말 맛있습니다/)

  expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
  fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
  expect(navigateMock).not.toHaveBeenCalled()
})
```

Add focused cases for invalid IDs (no detail request), query failure/retry, back navigation, keyword maximum, and a later query refetch not replacing an edited textarea value.

- [ ] **Step 2: Run the page test and verify RED**

Run: `corepack pnpm --filter @hashi/client exec vitest run src/pages/reviewEdit/ReviewEditPage.test.tsx`

Expected: FAIL because `ReviewEditPage` is a heading-only stub.

- [ ] **Step 3: Implement the page-local query/form orchestration and Figma composition**

```tsx
<form
  aria-label="리뷰 수정 폼"
  className="flex min-h-0 min-w-0 flex-1 flex-col pt-18.75"
>
  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
    <ReviewReservationSummary {...reservationSummary} />
    <InputReviewRate value={rating} onValueChange={handleRatingChange} />
    <InputReviewKeyword
      selectedKeywordIds={selectedKeywordIds}
      onSelectedKeywordIdsChange={handleSelectedKeywordIdsChange}
    />
    <InputReviewMain
      photoFiles={photoFiles}
      photoUrls={photoUrls}
      value={reviewText}
      onPhotoFilesChange={handlePhotoFilesChange}
      onPhotoUrlsChange={setPhotoUrls}
      onValueChange={handleReviewTextChange}
    />
  </div>
  <ReviewSubmitBar
    className="shrink-0 bg-white pb-12"
    disabled={isSaveDisabled}
    type="button"
  />
</form>
```

The hook parses only positive safe-integer `reviewId` values, fetches only for valid IDs, and initializes once per `reviewId`. Map labels/codes/IDs through `getReviewKeywordByValue`, ignore unknown backend labels, and format visit/guest fallback copy in the page-local mapper. Match the existing review-write fixed header and scrollable form. The button intentionally has no submit handler or mutation while the API does not exist.

Write the page spec before finalizing implementation. It must identify its existing `ROUTES.reviewEdit` registration, `AuthOnlyRoute`, lazy loader, no bottom navigation, detail query states, API-free non-goal, and navigation entry points.

- [ ] **Step 4: Run the page and related focused tests and verify GREEN**

Run: `corepack pnpm --filter @hashi/client exec vitest run src/pages/reviewEdit/ReviewEditPage.test.tsx src/pages/reviewDetail/ReviewDetailPage.test.tsx src/pages/myReviews/MyReviewsPage.test.tsx src/features/review/components/inputReviewMain/InputReviewMain.test.tsx`

Expected: PASS; the tests prove visual form state and navigation without a new API mock or update request.

- [ ] **Step 5: Commit the review-edit page**

```bash
git add apps/client/src/pages/reviewEdit
git commit -m "feat(client): HASHI-197 리뷰 수정 화면 퍼블리싱"
```

### Task 4: Validate the complete UI-only change

**Files:**

- Modify as needed only for verification fixes from Tasks 1–3.

**Interfaces:**

- Consumes: all HASHI-197 changes.
- Produces: a verified branch with no untracked/generated artifacts.

- [ ] **Step 1: Run formatting and diff safety checks**

Run: `corepack pnpm format:check && git diff --check`

Expected: PASS.

- [ ] **Step 2: Run client static checks**

Run: `corepack pnpm --filter @hashi/client lint && corepack pnpm --filter @hashi/client typecheck && corepack pnpm --filter @hashi/client build`

Expected: PASS.

- [ ] **Step 3: Run the full client suite**

Run: `corepack pnpm --filter @hashi/client test`

Expected: PASS; report the exact test-file and test count output.

- [ ] **Step 4: Manually inspect route behavior**

Open `/reviews/5/edit` in an authenticated development session and verify: prefilled 36px stars, 130px image tiles, keyword three-item cap, local photo delete/add state, 10–1000-character counter/error, save enabled/disabled state, no request on save, and both edit entry points.

- [ ] **Step 5: Request an independent review before handoff**

Use `superpowers:requesting-code-review` after the implementation and verification evidence is complete. Address any real findings, rerun affected checks, then summarize the API-free limitation and documentation impact.

## Self-Review

- **Spec coverage:** Task 1 implements both entry points; Task 2 supplies the existing-photo UI required by the Figma screen; Task 3 owns validated route/query/form states and the page spec; Task 4 covers static, automated, and manual verification.
- **No placeholders:** all tasks name concrete files, interfaces, test assertions, commands, and expected outcomes.
- **Type consistency:** `photoUrls` and `onPhotoUrlsChange` are controlled `string[]` props throughout; route IDs are strings only when passed to `generatePath`, and numbers only when passed to `useMyReviewDetailQuery`.
- **Review focus coverage:** invalid IDs/refetch in Task 3; combined image cap and deletion in Task 2; three-keyword cap and save-no-request behavior in Task 3.
