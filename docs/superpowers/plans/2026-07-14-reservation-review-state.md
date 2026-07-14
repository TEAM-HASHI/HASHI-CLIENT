# Reservation Review State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방문 완료 예약의 리뷰 상태를 서버 계약에 맞게 정규화하여 어디든 예약의 리뷰 영역을 숨기고 삭제된 리뷰의 재작성을 차단한다.

**Architecture:** `createMyVisitedReservationViewModel`이 방문 완료 API의 `reviewStatus`, `reviewable`, `reviewUnavailableReason`과 식별자를 `reviewActionState`로 정규화한다. 카드와 페이지 이동 핸들러는 이 화면 전용 상태만 사용하며, 리뷰 삭제 후 상태 동기화는 기존 방문 완료 query invalidation을 유지한다.

**Tech Stack:** TypeScript, React, React Router, TanStack Query, Vitest, Testing Library, pnpm

## Global Constraints

- 패키지 명령은 `pnpm`만 사용한다.
- 상태 판정 우선순위는 `HIDDEN -> DELETED -> WRITTEN -> WRITABLE -> UNAVAILABLE`이다.
- `DELETED`는 `리뷰가 삭제된 예약입니다` 문구만 비활성 상태로 표시하고 클릭 및 재작성을 허용하지 않는다.
- `UNSUPPORTED_RESERVATION_TYPE`은 예약 카드 자체가 아니라 하단 리뷰 영역만 숨긴다.
- 삭제 후 별도 낙관적 캐시 수정은 추가하지 않고 기존 방문 완료 query invalidation으로 서버 상태를 다시 조회한다.
- 기존 작성 가능 CTA와 작성 완료 상세 이동을 유지한다.

---

## File Structure

- Modify: `apps/client/src/pages/myReservations/types.ts`
  - 방문 완료 카드가 소비할 `VisitedReservationReviewActionState`와 `reviewActionState`를 정의한다.
- Modify: `apps/client/src/pages/myReservations/utils/createMyReservationViewModel.ts`
  - 서버 리뷰 필드를 화면 상태로 정규화한다.
- Modify: `apps/client/src/pages/myReservations/utils/createMyReservationViewModel.test.ts`
  - 다섯 화면 상태와 식별자 누락 fallback을 검증한다.
- Modify: `apps/client/src/pages/myReservations/components/VisitedReservationCard.tsx`
  - 화면 상태별 하단 리뷰 영역을 렌더링한다.
- Modify: `apps/client/src/pages/myReservations/hooks/useMyReservationsPage.ts`
  - `WRITTEN`, `WRITABLE`만 이동하도록 방어한다.
- Modify: `apps/client/src/pages/myReservations/MyReservationsPage.test.tsx`
  - 어디든 예약 숨김, 삭제 상태 비활성 처리와 기존 이동 동작을 검증한다.
- Modify: `apps/client/src/pages/myReservations/MyReservationsPage.spec.md`
  - 방문 완료 리뷰 상태 계약과 삭제 후 재조회 정책을 문서화한다.
- Verify only: `apps/client/src/features/review/mutations/useDeleteReviewMutation.ts`
  - 기존 `visitedReservationQueryKeys.all` invalidation을 유지한다.
- Verify only: `apps/client/src/features/review/mutations/useDeleteReviewMutation.test.tsx`
  - 방문 완료 목록 invalidation 회귀가 없는지 확인한다.

---

### Task 1: Normalize API review fields into a view state

**Files:**

- Modify: `apps/client/src/pages/myReservations/types.ts:24-36`
- Modify: `apps/client/src/pages/myReservations/utils/createMyReservationViewModel.ts:132-164`
- Test: `apps/client/src/pages/myReservations/utils/createMyReservationViewModel.test.ts:67-123`

**Interfaces:**

- Consumes: `VisitedReservationResponse`의 `reviewStatus`, `reviewable`, `reviewUnavailableReason`, `reviewId`, `restaurantId`
- Produces: `VisitedReservationReviewActionState = 'HIDDEN' | 'DELETED' | 'WRITTEN' | 'WRITABLE' | 'UNAVAILABLE'`
- Produces: `VisitedReservation.reviewActionState`

- [ ] **Step 1: Write failing mapper tests for all five states**

테스트 fixture에 서버 상태를 명시하고 다음 결과를 검증한다.

```ts
expect(
  createMyVisitedReservationViewModel({
    reservationId: 31,
    restaurantId: 41,
    restaurantName: '방문한 스시',
    reviewStatus: 'REVIEWED',
    reviewId: 51,
  }),
).toMatchObject({ reviewActionState: 'WRITTEN', hasReview: true })

expect(
  createMyVisitedReservationViewModel({
    reservationId: 32,
    restaurantName: '어디든 예약',
    reviewStatus: 'UNREVIEWED',
    reviewable: false,
    reviewUnavailableReason: 'UNSUPPORTED_RESERVATION_TYPE',
  }),
).toMatchObject({ reviewActionState: 'HIDDEN', hasReview: false })

expect(
  createMyVisitedReservationViewModel({
    reservationId: 33,
    restaurantId: 43,
    restaurantName: '삭제된 리뷰 식당',
    reviewStatus: 'DELETED',
    reviewable: false,
  }),
).toMatchObject({ reviewActionState: 'DELETED', hasReview: false })
```

`UNREVIEWED + reviewable + restaurantId`는 `WRITABLE`, 식별자가 빠진 나머지 조합은 `UNAVAILABLE`인지 추가로 검증한다.

- [ ] **Step 2: Run mapper tests and confirm the new assertions fail**

Run:

```bash
pnpm --filter @hashi/client test -- src/pages/myReservations/utils/createMyReservationViewModel.test.ts
```

Expected: `reviewActionState`가 아직 없어 FAIL.

- [ ] **Step 3: Add the view-state type and deterministic mapper**

`types.ts`에 다음 타입과 필드를 추가한다.

```ts
export type VisitedReservationReviewActionState =
  | 'HIDDEN'
  | 'DELETED'
  | 'WRITTEN'
  | 'WRITABLE'
  | 'UNAVAILABLE'

export type VisitedReservation = MyReservationBase & {
  status: 'VISITED'
  reviewActionState: VisitedReservationReviewActionState
  // existing fields
}
```

`createMyReservationViewModel.ts`에 화면 상태 계산 함수를 추가한다.

```ts
const getVisitedReservationReviewActionState = (
  reservation: VisitedReservationResponse,
): VisitedReservationReviewActionState => {
  if (reservation.reviewUnavailableReason === 'UNSUPPORTED_RESERVATION_TYPE') {
    return 'HIDDEN'
  }

  if (reservation.reviewStatus === 'DELETED') {
    return 'DELETED'
  }

  const normalizedReviewStatus =
    reservation.reviewStatus ??
    (reservation.reviewId !== undefined && reservation.reviewId !== null
      ? 'REVIEWED'
      : 'UNREVIEWED')

  if (
    normalizedReviewStatus === 'REVIEWED' &&
    reservation.reviewId !== undefined &&
    reservation.reviewId !== null
  ) {
    return 'WRITTEN'
  }

  if (
    normalizedReviewStatus === 'UNREVIEWED' &&
    reservation.reviewable !== false &&
    reservation.restaurantId !== undefined &&
    reservation.restaurantId !== null
  ) {
    return 'WRITABLE'
  }

  return 'UNAVAILABLE'
}
```

반환 모델의 `hasReview`는 `reviewActionState === 'WRITTEN'`, `isReviewable`은 `reviewActionState === 'WRITABLE'`로 계산해 기존 boolean과 새 상태가 충돌하지 않게 한다.

- [ ] **Step 4: Run mapper tests and confirm they pass**

Run:

```bash
pnpm --filter @hashi/client test -- src/pages/myReservations/utils/createMyReservationViewModel.test.ts
```

Expected: mapper test file PASS.

- [ ] **Step 5: Commit the normalized view model**

```bash
git add apps/client/src/pages/myReservations/types.ts apps/client/src/pages/myReservations/utils/createMyReservationViewModel.ts apps/client/src/pages/myReservations/utils/createMyReservationViewModel.test.ts
git commit -m "feat(apps/client): HASHI-125 방문 완료 리뷰 상태 정규화"
```

---

### Task 2: Render hidden and deleted review states safely

**Files:**

- Modify: `apps/client/src/pages/myReservations/components/VisitedReservationCard.tsx:45-117`
- Modify: `apps/client/src/pages/myReservations/hooks/useMyReservationsPage.ts:221-240`
- Test: `apps/client/src/pages/myReservations/MyReservationsPage.test.tsx:331-424`

**Interfaces:**

- Consumes: Task 1의 `VisitedReservation.reviewActionState`
- Produces: 상태별 하단 리뷰 UI와 `WRITTEN`/`WRITABLE` 전용 navigation

- [ ] **Step 1: Replace the existing unsupported-reservation assertion with a hidden-state test**

어디든 예약 fixture에 `reviewStatus: 'UNREVIEWED'`를 추가하고 다음을 검증한다.

```ts
expect(await screen.findByText('어디든 예약')).toBeInTheDocument()
expect(
  screen.queryByText('리뷰 작성이 어려운 예약이에요'),
).not.toBeInTheDocument()
expect(screen.queryByText('이 맛집 어떠셨나요?')).not.toBeInTheDocument()
expect(screen.queryByText('리뷰 작성 완료!')).not.toBeInTheDocument()
```

- [ ] **Step 2: Add a deleted-state non-interaction test**

`reviewStatus: 'DELETED'` fixture를 렌더링하고 다음을 검증한다.

```ts
expect(await screen.findByText('리뷰가 삭제된 예약입니다')).toBeInTheDocument()
expect(
  screen.queryByRole('button', { name: '리뷰가 삭제된 예약입니다' }),
).not.toBeInTheDocument()
expect(screen.getByTestId('location-path')).toHaveTextContent(
  '/my-reservations',
)
```

작성 완료와 미작성 fixture에는 각각 `reviewStatus: 'REVIEWED'`, `reviewStatus: 'UNREVIEWED'`, `reviewable: true`를 명시해 현재 API 계약을 테스트한다.

- [ ] **Step 3: Run page tests and confirm the new assertions fail**

Run:

```bash
pnpm --filter @hashi/client test -- src/pages/myReservations/MyReservationsPage.test.tsx
```

Expected: 어디든 예약의 기존 비활성 버튼이 남아 있고 삭제 문구가 없어 FAIL.

- [ ] **Step 4: Render the review area with an explicit state switch**

`VisitedReservationCard`에서 리뷰 하단 영역을 상태별로 렌더링한다.

```tsx
const renderReviewAction = () => {
  switch (reservation.reviewActionState) {
    case 'HIDDEN':
      return null
    case 'DELETED':
      return (
        <p className="typo-body-7 text-warm-gray-300 mt-4 py-3.5 text-center">
          리뷰가 삭제된 예약입니다
        </p>
      )
    case 'WRITTEN':
      return (
        <button
          className="typo-body-3 border-warm-gray-100 text-cool-gray-600 mt-4 w-full rounded-[5px] border bg-white py-3.25"
          onClick={() => onReviewPress(reservation)}
          type="button"
        >
          리뷰 작성 완료!{' '}
          <span className="text-primary-400">+{reservation.earnedPoint}P</span>
        </button>
      )
    case 'WRITABLE':
      return (
        <button
          className="border-secondary-200 mt-4 flex w-full flex-col items-center border-t pt-1.5"
          onClick={() => onReviewPress(reservation)}
          type="button"
        >
          <RatingStars gapClassName="gap-2.5" sizeClassName="size-7.25" />
          <span className="typo-body-7 text-cool-gray-700 mt-0.5">
            이 맛집 어떠셨나요?
          </span>
        </button>
      )
    case 'UNAVAILABLE':
      return (
        <button
          className="border-secondary-200 mt-4 flex w-full flex-col items-center border-t pt-1.5"
          disabled
          type="button"
        >
          <span className="typo-body-7 text-warm-gray-300 py-3.5">
            리뷰 작성이 어려운 예약이에요
          </span>
        </button>
      )
  }
}
```

상단 별점은 `reviewActionState === 'WRITTEN'`일 때만 노출한다. `DELETED` 문구는 `button`이나 `link`를 사용하지 않는다.

- [ ] **Step 5: Guard navigation by the explicit state**

`handleReviewPress`는 다음 두 상태만 이동한다.

```ts
if (reservation.reviewActionState === 'WRITTEN' && reservation.reviewId) {
  navigate(ROUTES.reviewDetail.replace(':reviewId', reservation.reviewId))
  return
}

if (reservation.reviewActionState !== 'WRITABLE' || !reservation.restaurantId) {
  return
}
```

따라서 카드 외부에서 핸들러가 직접 호출되어도 `DELETED`, `HIDDEN`, `UNAVAILABLE`은 이동하지 않는다.

- [ ] **Step 6: Run page tests and confirm they pass**

Run:

```bash
pnpm --filter @hashi/client test -- src/pages/myReservations/MyReservationsPage.test.tsx
```

Expected: My Reservations page test file PASS.

- [ ] **Step 7: Commit the card and navigation behavior**

```bash
git add apps/client/src/pages/myReservations/components/VisitedReservationCard.tsx apps/client/src/pages/myReservations/hooks/useMyReservationsPage.ts apps/client/src/pages/myReservations/MyReservationsPage.test.tsx
git commit -m "feat(apps/client): HASHI-125 방문 완료 리뷰 액션 분기"
```

---

### Task 3: Align the page specification and verify cache synchronization

**Files:**

- Modify: `apps/client/src/pages/myReservations/MyReservationsPage.spec.md`
- Verify: `apps/client/src/features/review/mutations/useDeleteReviewMutation.ts`
- Verify: `apps/client/src/features/review/mutations/useDeleteReviewMutation.test.tsx`

**Interfaces:**

- Consumes: Task 1과 Task 2의 최종 화면 상태 계약
- Produces: 코드와 일치하는 페이지 spec 및 검증 결과

- [ ] **Step 1: Update the co-located page spec**

`MyReservationsPage.spec.md`의 방문 완료 카드 계약을 다음 내용으로 갱신한다.

```md
- 방문 완료 응답은 `reviewStatus`, `reviewable`, `reviewUnavailableReason`을 화면 리뷰 상태로 변환한다.
- `UNSUPPORTED_RESERVATION_TYPE`인 어디든 예약은 카드의 하단 리뷰 영역을 렌더링하지 않는다.
- `reviewStatus: DELETED`는 `리뷰가 삭제된 예약입니다`를 비활성 문구로 표시하며 상세 이동과 재작성을 허용하지 않는다.
- 리뷰 삭제 성공 후 방문 완료 query를 무효화하고 서버의 최신 상태를 다시 조회한다.
```

기존 `hasReview`만으로 설명된 분기는 새 다섯 상태 계약으로 교체한다.

- [ ] **Step 2: Run deletion mutation regression test**

Run:

```bash
pnpm --filter @hashi/client test -- src/features/review/mutations/useDeleteReviewMutation.test.tsx
```

Expected: 기존 `visitedReservationQueryKeys.all` invalidation assertion PASS.

- [ ] **Step 3: Run the focused feature tests together**

Run:

```bash
pnpm --filter @hashi/client test -- src/pages/myReservations/utils/createMyReservationViewModel.test.ts src/pages/myReservations/MyReservationsPage.test.tsx src/features/review/mutations/useDeleteReviewMutation.test.tsx
```

Expected: all focused tests PASS.

- [ ] **Step 4: Run the repo-scoped API integration audit**

Use `.agents/skills/verify-api-integration/SKILL.md` to inspect endpoint
boundaries, query keys, cache invalidation, UI states, test isolation, and docs
sync. This repository does not expose a `verify:api-integration` package script.

Expected: no HASHI-125 API contract or cache invalidation findings.

- [ ] **Step 5: Run client static and full test verification**

Run:

```bash
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client test
```

Expected: typecheck, lint, and full client test suite PASS.

- [ ] **Step 6: Verify formatting and changed-file scope**

Run:

```bash
git diff --check
git status --short --branch --untracked-files=all
git diff --stat origin/develop...HEAD
```

Expected: whitespace errors 없음. HASHI-125 설계·계획·방문 완료 리뷰 상태 관련 파일만 변경됨.

- [ ] **Step 7: Commit documentation and verification-aligned changes**

```bash
git add apps/client/src/pages/myReservations/MyReservationsPage.spec.md
git commit -m "docs(apps/client): HASHI-125 방문 완료 리뷰 상태 명세 갱신"
```
