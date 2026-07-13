# Page Spec: `RestaurantDetailPage`

## Purpose

- 사용자가 특정 식당의 매장 정보, 메뉴, 리뷰를 확인하고 예약할 수 있는 모바일 웹 식당 상세 페이지입니다.

## Route

- path: `/restaurants/:restaurantId`
- path constant:
  - `ROUTES.restaurantDetail`
- route owner:
  - `apps/client/src/pages/restaurantDetail`
- layout:
  - `RootLayout`
- access type:
  - public
- guard:
  - none
- lazy loading:
  - `lazyPages.restaurantDetail`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: yes, action-level auth gate only

## Requirements

- [ ] Header title은 Figma 기준 `식당 상세 정보`로 표시합니다.
- [ ] route param `restaurantId`를 page에서 읽고 식당 요약, 매장 정보, 메뉴 목록, 리뷰 목록 API를 조회합니다.
- [ ] 매장 정보, 메뉴, 리뷰 탭을 같은 페이지 상태로 전환합니다.
- [ ] 탭바는 Header 아래에 sticky로 고정됩니다.
- [ ] 메뉴/리뷰 탭 선택 시 탭바가 Header 바로 아래에 붙은 위치로 부드럽게 스크롤되어 해당 탭 콘텐츠를 초기 화면처럼 보여줍니다.
- [ ] 매장 정보 탭 선택 시 페이지 최상단으로 부드럽게 스크롤됩니다.
- [ ] 탭 선택 시 active underline은 선택된 탭으로 부드럽게 이동합니다.
- [ ] 하단 fixed bar에는 좋아요 영역과 `예약하기`가 표시됩니다.
- [ ] 찜 기능은 MVP 범위에서 제외되므로 하트 수는 `0`으로 표시하고, 로그인 사용자가 좋아요를 누르면 준비중 모달을 표시합니다.
- [ ] 식당 상세 페이지에는 `다시 추천 받기` 버튼이 없습니다.
- [ ] 메뉴 카드 클릭 시 `ROUTES.restaurantMenuDetail`로 이동합니다.
- [ ] 공유 클릭 시 `ROUTES.restaurantDetail` 기준 식당 상세 링크를 현재 origin 기준 absolute URL로 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 식당명 복사 클릭 시 현재 표시 중인 식당명을 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 비로그인 사용자가 예약하기 또는 좋아요를 누르면 로그인 유도 바텀시트를 표시합니다.
- [ ] 로그인 사용자가 예약하기를 누르면 `ROUTES.restaurantReservationNew`로 이동합니다.
- [ ] 리뷰 작성 CTA 클릭 시 비방문자 안내 모달을 열 수 있습니다.
- [ ] 리뷰 이미지 클릭 시 선택한 리뷰 이미지 목록과 선택 index를 이미지 뷰어에 전달합니다.
- [ ] route state `activeTab`이 있으면 해당 탭을 초기 선택 상태로 표시합니다.
- [ ] 직접 진입 상태에서 뒤로가기를 누르면 `ROUTES.home`으로 replace 이동합니다.
- [ ] 메뉴 목록과 리뷰 목록은 커서 기반 무한스크롤로 조회하고, 리스트 하단 sentinel 감지는 공통 `useInfiniteScrollTrigger` 훅을 사용합니다.
- [ ] 모바일 폭에서 horizontal overflow가 없어야 합니다.

## Data Dependencies

### Query

- query: restaurant summary
- endpoint: `GET /api/v1/restaurants/{restaurantId}/summary`
- enabled condition: route param `restaurantId` is valid number
- request params:
  - path: `restaurantId`
- response data:
  - `restaurantId`, `name`, `localName`, `rating`, `reviewCount`, `description`, `address`, `thumbnailUrl`, `imageUrls`, `reservationFee`, `availableDate`, `availableStartTime`, `availableEndTime`
- loading state: summary/hero skeleton
- error state: critical query 실패이므로 ErrorBoundary 또는 page error fallback
- empty state: summary `data`가 없으면 page error fallback
- refetch condition: route param `restaurantId` 변경

- query: restaurant store information
- endpoint: `GET /api/v1/restaurants/{restaurantId}/store-information`
- enabled condition: route param `restaurantId` is valid number
- request params:
  - path: `restaurantId`
- response data:
  - `description`, `businessHours`, `priceRange`
- loading state: 매장 정보 탭 skeleton
- error state: 매장 정보 영역 error fallback
- empty state: 매장 설명/영업시간/가격대가 없으면 비어 있는 항목은 숨김
- refetch condition: route param `restaurantId` 변경

- query: restaurant menus infinite
- endpoint: `GET /api/v1/restaurants/{restaurantId}/menus`
- enabled condition: route param `restaurantId` is valid number and menu tab has been requested
- request params:
  - path: `restaurantId`
  - query: `cursor`, `size`
- response data:
  - `content`, `nextCursor`, `hasNext`
- loading state: 첫 메뉴 페이지가 준비되기 전에는 page `LoadingScreen`을 표시하고, 메뉴 영역 skeleton은 사용하지 않음
- error state: 메뉴 영역 error fallback
- empty state: 메뉴가 없으면 shared `ListEmptyState`로 `메뉴 리스트를 준비중이에요.` 문구 표시
- refetch condition: route param `restaurantId` 변경
- pagination:
  - `getNextPageParam`: `hasNext`가 true이면 `nextCursor`
  - next page trigger: 공통 `useInfiniteScrollTrigger` sentinel intersect

- query: restaurant reviews infinite
- requested endpoint: `GET /api/v1/restaurants/{restaurantId}/reviews`
- response data:
  - `averageRating`, `reviewCount`, `content`, `nextCursor`, `hasNext`
- enabled condition: route param `restaurantId` is valid number
- request params:
  - path `restaurantId`, query `sort`, `cursor`, `size`
- loading state: 리뷰 목록 조회 또는 정렬 변경 중에는 리뷰 목록 영역에만 `RestaurantReviewListSkeleton` 표시
- error state: 리뷰 영역 error fallback
- empty state: 리뷰가 없으면 shared `ListEmptyState`로 `리뷰 리스트를 준비중이에요.` 문구 표시
- refetch condition: route param `restaurantId` 또는 sort 변경
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
- URL state:
  - `restaurantId`
- server state:
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
RestaurantDetailPage
  RestaurantDetailTemplate variant="detail"
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
  - `/restaurants/:restaurantId`
- links:
  - `/restaurants/:restaurantId/menus/:menuId`
  - `/restaurants/:restaurantId/reservations/new`
- route params:
  - `restaurantId`
- search params:
  - none
- back behavior:
  - uses history when available, otherwise replaces to `ROUTES.home`
- auth redirect:
  - none

## Implementation Notes

- `TodayRestaurantPage`와 `RestaurantDetailPage`는 같은 상세 템플릿을 사용하므로 API 함수, query hook, 응답-to-UI mapper는 `features/restaurantDetail`에 둡니다.
- route param `restaurantId`는 숫자로 변환/검증한 뒤 query key와 request path에 사용합니다. 유효하지 않은 값이면 서버 요청 전에 page error fallback으로 보냅니다.
- 찜 기능은 MVP 제외입니다. 저장 API/저장 상태 query는 만들지 않고 UI count만 `0`으로 고정합니다.
- 메뉴/리뷰 무한스크롤은 직접 `IntersectionObserver`를 page에 구현하지 않고, 공통 `useInfiniteScrollTrigger` 훅으로 sentinel ref와 intersect 상태를 받아 다음 페이지 요청을 트리거합니다.

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
- [ ] `/restaurants/:restaurantId` 직접 접근 확인
- [ ] 탭 전환, 리뷰 더보기, 리뷰 이미지 뷰어, 안내 모달, fixed bottom bar 확인
