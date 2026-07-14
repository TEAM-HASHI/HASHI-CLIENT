# Page Spec: `TodayRestaurantPage`

## Purpose

- 사용자가 오늘 추천된 식당의 매장 정보, 메뉴, 리뷰를 확인하고 예약하거나 다시 추천을 요청할 수 있는 모바일 웹 페이지입니다.

## Route

- path: `/restaurants/today`
- path constant:
  - `ROUTES.todayRestaurant`
- route owner:
  - `apps/client/src/pages/todayRestaurant`
- layout:
  - `RootLayout`
- access type:
  - public
- guard:
  - none
- lazy loading:
  - `lazyPages.todayRestaurant`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: yes, action-level auth gate only

## Requirements

- [ ] Header title은 `오늘의 식당`으로 표시합니다.
- [ ] 오늘의 식당으로 노출할 `restaurantId`를 확보한 뒤 식당 요약, 매장 정보, 메뉴 목록, 리뷰 목록 API를 조회합니다.
- [ ] 매장 정보, 메뉴, 리뷰 탭을 같은 페이지 상태로 전환합니다.
- [ ] 탭바는 Header 아래에 sticky로 고정됩니다.
- [ ] 메뉴/리뷰 탭 선택 시 탭바가 Header 바로 아래에 붙은 위치로 부드럽게 스크롤되어 해당 탭 콘텐츠를 초기 화면처럼 보여줍니다.
- [ ] 매장 정보 탭 선택 시 페이지 최상단으로 부드럽게 스크롤됩니다.
- [ ] 탭 선택 시 active underline은 선택된 탭으로 부드럽게 이동합니다.
- [ ] 하단 fixed bar에는 좋아요 영역, `다시 추천 받기`, `예약하기`가 표시됩니다.
- [ ] 찜 기능은 MVP 범위에서 제외되므로 하트 수는 `0`으로 표시하고, 로그인 사용자가 좋아요를 누르면 준비중 모달을 표시합니다.
- [ ] 메뉴 카드 클릭 시 `ROUTES.restaurantMenuDetail`로 이동합니다.
- [ ] 공유 클릭 시 오늘의 식당 대표 링크 `/restaurants/today`를 현재 origin 기준 absolute URL로 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 식당명 복사 클릭 시 현재 표시 중인 한국어 식당명을 클립보드에 복사하고, 복사 아이콘과 `식당명이 복사되었어요` Toast를 표시합니다.
- [ ] 비로그인 사용자가 예약하기 또는 좋아요를 누르면 로그인 유도 바텀시트를 표시합니다.
- [ ] 로그인 사용자가 예약하기를 누르면 현재 오늘의 식당 `restaurantId`를 사용해 `ROUTES.restaurantReservationNew`로 이동합니다.
- [ ] `다시 추천 받기`는 추후 API 연결 전까지 no-op handler로 둡니다.
- [ ] 리뷰 작성 CTA 클릭 시 비방문자 안내 모달을 열 수 있습니다.
- [ ] 리뷰 이미지 클릭 시 선택한 리뷰 이미지 목록과 선택 index를 이미지 뷰어에 전달합니다.
- [ ] route state `activeTab`이 있으면 해당 탭을 초기 선택 상태로 표시합니다.
- [ ] 직접 진입 상태에서 뒤로가기를 누르면 `ROUTES.home`으로 replace 이동합니다.
- [ ] 메뉴 목록과 리뷰 목록은 커서 기반 무한스크롤로 조회하고, 리스트 하단 sentinel 감지는 공통 `useInfiniteScrollTrigger` 훅을 사용합니다.
- [ ] 모바일 폭에서 horizontal overflow가 없어야 합니다.

## Data Dependencies

### Query

- query: random restaurant recommendation
- endpoint: `GET /api/v1/restaurants/recommendations/random`
- enabled condition: page mounted
- request params:
  - query: optional `excludeRestaurantId`
- loading state: summary skeleton 또는 page loading
- error state: ErrorBoundary 또는 page error fallback
- empty state: 오늘의 식당 대상이 없으면 empty state
- refetch condition: page remount 또는 다시 추천 받기

- query: restaurant summary
- endpoint: `GET /api/v1/restaurants/{restaurantId}/summary`
- enabled condition: today restaurant id exists
- request params:
  - path: `restaurantId`
- response data:
  - `restaurantId`, `name`, `localName`, `rating`, `reviewCount`, `description`, `address`, `thumbnailUrl`, `imageUrls`, `reservationFee`, `availableDate`, `availableStartTime`, `availableEndTime`
- loading state: summary/hero skeleton
- error state: critical query 실패이므로 ErrorBoundary 또는 page error fallback
- empty state: summary `data`가 없으면 page error fallback
- refetch condition: restaurantId 변경, 다시 추천 API 연결 후 추천 식당 변경

- query: restaurant store information
- endpoint: `GET /api/v1/restaurants/{restaurantId}/store-information`
- enabled condition: today restaurant id exists
- request params:
  - path: `restaurantId`
- response data:
  - `description`, `businessHours`, `priceRange`
- loading state: 매장 정보 탭 skeleton
- error state: 매장 정보 영역 error fallback
- empty state: 매장 설명/영업시간/가격대가 없으면 비어 있는 항목은 숨김
- refetch condition: restaurantId 변경

- query: restaurant menus infinite
- endpoint: `GET /api/v1/restaurants/{restaurantId}/menus`
- enabled condition: today restaurant id exists and menu tab has been requested
- request params:
  - path: `restaurantId`
  - query: `cursor`, `size`
- response data:
  - `content`, `nextCursor`, `hasNext`
- loading state: 첫 메뉴 페이지가 준비되기 전에는 page `LoadingScreen`을 표시하고, 메뉴 영역 skeleton은 사용하지 않음
- error state: 메뉴 영역 error fallback
- empty state: 메뉴가 없으면 shared `ListEmptyState`로 `메뉴 리스트를 준비중이에요.` 문구 표시
- refetch condition: restaurantId 변경
- pagination:
  - `getNextPageParam`: `hasNext`가 true이면 `nextCursor`
  - next page trigger: 공통 `useInfiniteScrollTrigger` sentinel intersect

- query: restaurant reviews infinite
- requested endpoint: `GET /api/v1/restaurants/{restaurantId}/reviews`
- response data:
  - `averageRating`, `reviewCount`, `ratingDistribution`, `content`, `nextCursor`, `hasNext`
- enabled condition: today restaurant id exists
- request params:
  - path `restaurantId`, query `sort`, `cursor`, `size`
- loading state: 리뷰 목록 조회 또는 정렬 변경 중에는 리뷰 목록 영역에만 `RestaurantReviewListSkeleton` 표시
- error state: 리뷰 영역 error fallback
- empty state: 리뷰가 없으면 shared `ListEmptyState`로 `작성된 리뷰가 없습니다.` 문구 표시
- rating distribution: API `ratingDistribution`의 `five`, `four`, `three`, `two`, `one` count를 `reviewCount` 기준 비율로 변환해 별점 막대 너비에 반영
- refetch condition: restaurantId 또는 sort 변경
- pagination:
  - `getNextPageParam`: `hasNext`가 true이면 `nextCursor`
  - next page trigger: 공통 `useInfiniteScrollTrigger` sentinel intersect

### Mutation

- mutation: none
- request data: none
- submit enabled condition: none
- success handling: TODO handler
- failure handling: out of scope

## State

- local state:
  - active tab
  - auth gate bottom sheet open/closed
  - coming soon dialog open/closed
  - review image viewer open/closed
  - review image viewer image urls and initial index
  - review unavailable modal open/closed
- form state: none
- URL state: none
- server state:
  - today restaurant id
  - restaurant summary
  - restaurant store information
  - restaurant menus infinite pages
  - restaurant reviews infinite pages
- derived state:
  - bottom bar variant from page variant
  - `RestaurantMainResponse` + `RestaurantStoreInformationResponse` + menu/review pages to `RestaurantDetail`
  - like count fixed to `0` during MVP

## UI Structure

```text
TodayRestaurantPage
  RestaurantDetailTemplate variant="today"
    Header
    Hero
    Restaurant summary
    Sticky Tabs
    Active Tab Section
    ReviewImageViewer
    ReviewUnavailableModal
    RestaurantBottomBar
    AuthGateBottomSheet
    ComingSoonDialog
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Tabs`
  - `Button`
  - `Toast`
  - `Dialog`
  - `StarRating`
  - `Carousel`
  - `CollapsibleText`
  - `Chip`
  - `Badge`
- app shared component:
  - `ShareIconButton`
  - `ComingSoonDialog`
  - `ListEmptyState`
- feature component:
  - `RestaurantDetailTemplate`
  - `RestaurantDetailHero`
  - `RestaurantDetailTabs`
  - `RestaurantInfoSection`
  - `RestaurantMenuSection`
  - `RestaurantReviewSection`
  - `RestaurantBottomBar`
  - `ReviewImageViewer`
  - `ReviewUnavailableModal`
- feature api/query:
  - `getRestaurantSummary`
  - `getStoreInformation`
  - `getRestaurantMenus`
  - restaurant reviews list query, endpoint confirmation required
  - restaurant detail view model mapper
- shared hook:
  - `useInfiniteScrollTrigger`
- icon:
  - `BackIcon`, `HeartBlankIcon`, `LocationIcon`, `ClockIcon`, `MoneyIcon`, `PencilIcon`, `CloseSmallIcon`

## Navigation

- entry:
  - `/restaurants/today`
- links:
  - `/restaurants/:restaurantId/menus/:menuId`
  - `/restaurants/:restaurantId/reservations/new`
- route params:
  - none
- search params:
  - none
- back behavior:
  - uses history when available, otherwise replaces to `ROUTES.home`
- auth redirect:
  - none

## Implementation Notes

- `TodayRestaurantPage`와 `RestaurantDetailPage`는 같은 상세 템플릿을 사용하므로 API 함수, query hook, 응답-to-UI mapper는 `features/restaurantDetail`에 둡니다.
- 오늘의 식당 페이지는 URL에 `restaurantId`가 없으므로 예약하기/메뉴 상세 이동에는 조회된 오늘의 식당 `restaurantId`를 사용합니다.
- 오늘의 식당 진입 시 `excludeRestaurantId` 없이 랜덤 추천 API를 호출하고, 다시 추천 받기 시 현재 식당 `restaurantId`를 `excludeRestaurantId`로 전달합니다.
- 찜 기능은 MVP 제외입니다. 저장 API/저장 상태 query는 만들지 않고 UI count만 `0`으로 고정합니다.

## Styling

- Tailwind layout:
  - mobile width, white background
  - sticky Header/TabBar
  - fixed bottom bar with safe-area bottom padding
- list empty state:
  - menu/review list empty UI는 shared `ListEmptyState`를 사용합니다.
  - empty graphic은 `shared/assets/images/empty-menu.webp`를 사용하고 너비는 `48px`, 높이는 원본 비율로 자동 계산합니다.
  - description은 prop으로 전달하며 `typo-body-5 text-warm-gray-300` 스타일을 사용합니다.
  - wrapper는 탭 콘텐츠 영역 안에서 `min-h-[220px]`, `items-center`, `justify-center`, `text-center`로 가로/세로 중앙 정렬합니다.
- skeleton:
  - 메뉴 목록은 별도 skeleton을 사용하지 않습니다.
  - 리뷰 목록 skeleton은 `RestaurantReviewListSkeleton`을 사용하고 placeholder 색상은 `bg-secondary-200`을 기준으로 합니다.
- responsive:
  - mobile web only
- fixed area:
  - Header, sticky tabs, bottom bar
- scroll area:
  - page document scroll
  - review image/keyword row horizontal scroll

## Verification

- [ ] `pnpm --filter @hashi/client lint`
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client build`
- [ ] `pnpm --filter @hashi/client test`
- [ ] `/restaurants/today` 직접 접근 확인
- [ ] 탭 전환, 리뷰 더보기, 리뷰 이미지 뷰어, 안내 모달, fixed bottom bar 확인
