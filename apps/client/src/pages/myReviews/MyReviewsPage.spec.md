# Page Spec: `MyReviews`

Jira: HASHI-83, HASHI-114

## Purpose

- 로그인한 사용자가 마이 페이지에서 리뷰 작성 대상 예약과 이미 작성한 리뷰를 확인할 수 있게 한다.
- HASHI-114 범위에서 작성 가능 예약, 작성한 리뷰, 탭별 개수, 리뷰 삭제 API를 연결한다.

## Route

- path: `/my-reviews`
- path constant:
  - `ROUTES.myReviews`
- route owner: `apps/client/src/routes.ts`
- layout: `RootLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- route module:
  - `apps/client/src/app/routes/my-reviews.tsx`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `ROUTES.loginRequired`
- search params:
  - `tab=written`: `작성한 리뷰` 탭을 초기 활성 탭으로 연다.
  - 생략하거나 알 수 없는 값은 `리뷰 쓰기` 탭으로 정규화한다.

## Requirements

- [x] 상단에 `마이 리뷰` 제목과 뒤로가기 버튼을 보여준다.
- [x] 뒤로가기 버튼은 마이페이지 `ROUTES.mypage`로 이동한다.
- [x] `리뷰 쓰기`, `작성한 리뷰` 탭을 보여준다.
- [x] API에서 전체 개수를 제공하는 탭에 목록 개수를 표시한다.
- [x] 작성 가능 예약 개수는 예약 목록 응답의 `totalCount`를 표시한다.
- [x] 작성한 리뷰 개수는 리뷰 count API 응답을 표시한다.
- [x] `리뷰 쓰기` 탭은 최근 방문했지만 아직 리뷰를 쓰지 않은 예약 목록을 보여준다.
- [x] `리뷰 쓰기` 카드 이미지는 서버 썸네일을 사용하고, 값이 없거나 로딩에 실패하면 공통 `DefaultImage` fallback을 표시한다.
- [x] `리뷰 쓰기` 카드의 CTA를 누르면 해당 식당의 리뷰 작성 페이지로 이동한다.
- [x] `작성한 리뷰` 탭은 사용자가 작성한 리뷰 목록을 보여준다.
- [x] `작성한 리뷰` 카드 이미지는 서버 썸네일을 사용하고, 값이 없거나 로딩에 실패하면 공통 `DefaultImage` fallback을 표시한다.
- [x] `작성한 리뷰` 카드 본문을 누르면 해당 리뷰 상세 페이지로 이동한다.
- [x] 작성한 리뷰 카드에는 별점과 더보기 메뉴를 보여준다.
- [x] 더보기 메뉴는 `수정하기`, `삭제하기` 액션을 보여준다.
- [x] 더보기 메뉴는 한 번에 하나만 열리며, 메뉴 바깥 영역을 누르면 닫힌다.
- [x] 더보기 메뉴는 탭 전환 또는 `Escape` 입력 시 닫힌다.
- [x] `수정하기`를 누르면 준비중 모달을 보여준다.
- [x] `삭제하기`를 누르면 삭제 확인 모달을 보여준다.
- [x] 삭제 확인 모달에서 `삭제하기`를 누르면 삭제 API를 호출한다.
- [x] 삭제 성공 후 작성 가능 예약 목록과 작성한 리뷰 목록을 갱신한다.
- [x] 목록은 서버의 `nextCursor`, `hasNext`를 사용해 하단 진입 시 다음 페이지를 불러온다.
- [x] 활성 탭의 초기 로딩, 오류와 재시도, empty 상태를 표시한다.
- [x] 목록이 비어 있으면 shared `Empty`의 공통 이미지, 안내 문구, `일본 맛집 추천받기` 버튼을 보여준다.
- [x] empty CTA를 누르면 오늘의 식당 페이지로 이동한다.

## Data Dependencies

### Query

- query: `GET /api/v1/reviews/visited-reservations`
  - owner: `features/review`
  - mode: infinite query
  - enabled condition: `activeTab === writable`
  - request params:
    - `reviewStatus=unreviewed`
    - `cursor`
    - `size=20`
  - count: 첫 페이지 `totalCount`
- query: `GET /api/v1/reviews/me`
  - mode: infinite query
  - enabled condition: `activeTab === written`
  - request params:
    - `cursor`
    - `size=20`
- query: `GET /api/v1/reviews/me/count`
  - owner: `features/review`
  - mode: query
  - response: `reviewCount`
  - usage:
    - 작성한 리뷰 탭 숫자
    - 작성한 리뷰 탭의 `총 N건`
    - 마이페이지 리뷰 개수와 같은 query cache 공유
- loading state:
  - 활성 탭의 첫 페이지 요청 중 로딩 문구를 표시한다.
- error state:
  - 활성 탭의 목록 요청 실패 시 로컬 오류와 `다시 시도` 버튼을 표시한다.
- empty state:
  - `writableReviews.length === 0`
  - `writtenReviews.length === 0`

### Mutation

- mutation: `DELETE /api/v1/reviews/{reviewId}`
- owner: `features/review`
- variables:
  - `reviewId`
- pending state:
  - 삭제 요청 중 같은 리뷰의 삭제 버튼을 비활성화하고 `삭제 중`을 표시한다.
- success:
  - 삭제한 review detail cache를 제거한다.
  - 마이리뷰 count, list query prefix와 review feature의 방문 완료 예약 query를 invalidate한다.
- error:
  - 공통 mutation error toast 정책을 사용하고 기존 목록을 유지한다.

## State

- local state:
  - `openedMenuReviewId`
    - owner: `useMyReviewsPage`
  - `isEditComingSoonDialogOpen`
    - owner: `useMyReviewsPage`
  - `isDeleteDialogOpen`
    - owner: `WrittenReviewCard`
- URL state:
  - `tab`: `activeTab`을 파생하며 탭 전환 시 URL을 갱신한다.
    - `written`: `작성한 리뷰`
    - 생략 또는 알 수 없는 값: `리뷰 쓰기`
- server state:
  - 작성 가능 예약 infinite query
  - 작성한 리뷰 infinite query
  - 작성한 리뷰 count query
  - 리뷰 삭제 mutation
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
  MyReviewsErrorState
  Empty
  MyReviewTotalCount
  ReviewWritableCard
  WrittenReviewCard
    ReviewMoreMenu
    ReviewDeleteConfirmDialog
      Dialog
  ComingSoonDialog
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
  - `ComingSoonDialog`
  - `DefaultImage`
  - `Empty`
- page-local component:
  - `MyReviewTabs`
  - `MyReviewTotalCount`
  - `ReviewImagePlaceholder`
  - `ReviewWritableCard`
  - `WrittenReviewCard`
- icon:
  - `BackIcon`
  - `MenuIcon`
  - `SmileIcon`

## Navigation

- entry:
  - 마이 페이지의 마이 리뷰 진입점
- route params:
  - none
- search params:
  - 마이 리뷰 탭: `tab=written`
  - 리뷰 작성 페이지 이동 시 `reservationId`
- links:
  - 리뷰 작성 CTA: `generatePath(ROUTES.reviewNew, { restaurantId })?reservationId={reservationId}`
  - 작성한 리뷰 카드: `generatePath(ROUTES.reviewDetail, { reviewId })`
  - empty CTA: `ROUTES.todayRestaurant`
- back behavior:
  - `ROUTES.mypage`
- auth redirect:
  - unauthenticated users redirect to `ROUTES.loginRequired` through `AuthOnlyRoute`

## Styling

- Tailwind layout:
  - mobile-first, `RootLayout` mobile frame 기준
  - 리스트 본문 좌우 20px padding
  - `리뷰 쓰기` 카드 리스트 간격은 카드 내부 상하 여백이 더해지지 않는 12px(`gap-3`)로 표시한다.
  - `리뷰 쓰기` 카드의 `리뷰 작성` CTA 배경은 `bg-cool-gray-800` 토큰을 사용한다.
  - empty state의 `일본 맛집 추천받기` CTA 배경은 `bg-cool-gray-800` 토큰을 사용한다.
  - Header 바로 아래에 tab underline이 붙어 있어 Header shadow는 `shadow-none`으로 예외 처리한다.
- responsive:
  - app mobile frame width를 따른다.
- fixed area:
  - none
- empty layout:
  - 상단 Header/Tabs 아래 영역 중앙에 일러스트와 CTA를 표시한다.

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] `/my-reviews` 직접 진입 확인
- [ ] 탭 전환, 커서 페이지네이션, 메뉴, 삭제, 오류 재시도, empty CTA 수동 확인
