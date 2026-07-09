# Page Spec: `MyReviews`

Jira: HASHI-83

## Purpose

- 로그인한 사용자가 마이 페이지에서 리뷰 작성 대상 예약과 이미 작성한 리뷰를 확인할 수 있게 한다.
- 이번 범위는 API 연동 없이 화면 UI, 탭 상태, 리스트/empty 상태, 리뷰 작성/수정 이동, 삭제 확인 모달까지 포함한다.

## Route

- path: `/my-reviews`
- path constant:
  - `ROUTES.myReviews`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.myReviews`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `ROUTES.loginRequired`

## Requirements

- [x] 상단에 `마이 리뷰` 제목과 뒤로가기 버튼을 보여준다.
- [x] 뒤로가기 버튼은 `navigate(-1)`을 실행한다.
- [x] `리뷰 쓰기`, `작성한 리뷰` 탭을 보여준다.
- [x] 탭에 각 목록의 개수를 표시한다.
- [x] `리뷰 쓰기` 탭은 최근 방문했지만 아직 리뷰를 쓰지 않은 예약 목록을 보여준다.
- [x] `리뷰 쓰기` 카드의 CTA를 누르면 해당 식당의 리뷰 작성 페이지로 이동한다.
- [x] `작성한 리뷰` 탭은 사용자가 작성한 리뷰 목록을 보여준다.
- [x] 작성한 리뷰 카드에는 별점과 더보기 메뉴를 보여준다.
- [x] 더보기 메뉴는 `수정하기`, `삭제하기` 액션을 보여준다.
- [x] 더보기 메뉴는 한 번에 하나만 열리며, 메뉴 바깥 영역을 누르면 닫힌다.
- [x] 더보기 메뉴는 탭 전환 또는 `Escape` 입력 시 닫힌다.
- [x] `수정하기`를 누르면 리뷰 수정 페이지로 이동한다.
- [x] `삭제하기`를 누르면 삭제 확인 모달을 보여준다.
- [x] 삭제 확인 모달에서 `삭제하기`를 누르면 해당 리뷰를 목록에서 제거한다.
- [x] 목록이 비어 있으면 empty graphic slot, 안내 문구, `일본 맛집 추천받기` 버튼을 보여준다.
- [x] empty graphic은 추후 shared graphic component가 준비되면 `MyReviewEmptyState.graphic`으로 주입한다.
- [x] empty CTA를 누르면 오늘의 식당 페이지로 이동한다.

## Data Dependencies

### Query

- query: none
- enabled condition: none
- request params: none
- loading state: none
- error state: none
- empty state:
  - `writableReviews.length === 0`
  - `writtenReviews.length === 0`

### Mutation

- mutation: none
- current delete behavior:
  - page-local mock state에서 삭제된 리뷰를 제거한다.
- future behavior:
  - API 연동 시 삭제 mutation 성공 후 query cache를 갱신한다.

## State

- local state:
  - `activeTab`
  - `writtenReviews`
  - `openedMenuReviewId`
    - owner: `useMyReviewsPage`
  - `isDeleteDialogOpen`
    - owner: `WrittenReviewCard`
- URL state:
  - none
- server state:
  - none
- derived state:
  - `tabItems`
  - current tab count
  - current tab empty state

## UI Structure

```text
MyReviewsPage
  useMyReviewsPage
  Header
  MyReviewTabs
  MyReviewEmptyState
  MyReviewTotalCount
  ReviewWritableCard
  WrittenReviewCard
    ReviewMoreMenu
    ReviewDeleteConfirmDialog
      Dialog
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Button`
  - `Dialog`
  - `StarRating`
- feature component:
  - `ReviewDeleteConfirmDialog`
- app shared component:
  - none
- page-local component:
  - `MyReviewEmptyState`
  - `MyReviewTabs`
  - `MyReviewTotalCount`
  - `ReviewImagePlaceholder`
  - `ReviewWritableCard`
  - `WrittenReviewCard`
- icon:
  - `BackIcon`
  - `MenuIcon`

## Navigation

- entry:
  - 마이 페이지의 마이 리뷰 진입점
- route params:
  - none
- search params:
  - none
- links:
  - 리뷰 작성 CTA: `generatePath(ROUTES.reviewNew, { restaurantId })`
  - 리뷰 수정 CTA: `generatePath(ROUTES.reviewEdit, { reviewId })`
  - empty CTA: `ROUTES.todayRestaurant`
- back behavior:
  - `navigate(-1)`
- auth redirect:
  - unauthenticated users redirect to `ROUTES.loginRequired` through `AuthOnlyRoute`

## Styling

- Tailwind layout:
  - mobile-first, `RootLayout` mobile frame 기준
  - 리스트 본문 좌우 20px padding
- responsive:
  - app mobile frame width를 따른다.
- fixed area:
  - none
- empty layout:
  - 상단 Header/Tabs 아래 영역 중앙에 일러스트와 CTA를 표시한다.

## Verification

- [ ] `corepack pnpm --filter @hashi/client lint`
- [ ] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] `corepack pnpm --filter @hashi/client test`
- [ ] `/my-reviews` 직접 진입 확인
- [ ] 탭 전환, 메뉴, 삭제 모달, empty CTA 수동 확인
