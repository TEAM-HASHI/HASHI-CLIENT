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
- [ ] 매장 정보, 메뉴, 리뷰 탭을 같은 페이지 상태로 전환합니다.
- [ ] 탭바는 Header 아래에 sticky로 고정됩니다.
- [ ] 하단 fixed bar에는 좋아요 영역, `다시 추천 받기`, `예약하기`가 표시됩니다.
- [ ] 메뉴 카드 클릭 시 `ROUTES.restaurantMenuDetail`로 이동합니다.
- [ ] 공유 클릭 시 오늘의 식당 대표 링크 `/restaurants/today`를 현재 origin 기준 absolute URL로 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 식당명 복사 클릭 시 현재 표시 중인 식당명을 클립보드에 복사하고 Toast는 표시하지 않습니다.
- [ ] 비로그인 사용자가 예약하기 또는 좋아요를 누르면 로그인 유도 바텀시트를 표시합니다.
- [ ] 로그인 사용자가 예약하기를 누르면 `ROUTES.restaurantReservationNew`로 이동합니다.
- [ ] 로그인 사용자가 좋아요를 누르면 준비중 모달을 표시합니다.
- [ ] `다시 추천 받기`는 추후 API 연결 전까지 no-op handler로 둡니다.
- [ ] 리뷰 작성 CTA 클릭 시 비방문자 안내 모달을 열 수 있습니다.
- [ ] 리뷰 이미지 클릭 시 선택한 리뷰 이미지 목록과 선택 index를 이미지 뷰어에 전달합니다.
- [ ] route state `activeTab`이 있으면 해당 탭을 초기 선택 상태로 표시합니다.
- [ ] 직접 진입 상태에서 뒤로가기를 누르면 `ROUTES.home`으로 replace 이동합니다.
- [ ] 서버/API 연동 전이므로 Figma 확인용 최소 mock data 1개만 사용합니다.
- [ ] 모바일 폭에서 horizontal overflow가 없어야 합니다.

## Data Dependencies

### Query

- query: none
- enabled condition: none
- request params: none
- loading state: out of scope
- error state: out of scope
- empty state: out of scope
- refetch condition: out of scope

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
- server state: none
- derived state:
  - bottom bar variant from page variant

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
- icon:
  - `BackIcon`, `HeartBlankIcon`, `LocationIcon`, `ClockIcon`, `MoneyIcon`, `PencilIcon`, `CloseSmallIcon`

## Navigation

- entry:
  - `/restaurants/today`
- links:
  - `/restaurants/:restaurantId/menus/:menuId`
- route params:
  - none
- search params:
  - none
- back behavior:
  - uses history when available, otherwise replaces to `ROUTES.home`
- auth redirect:
  - none

## Styling

- Tailwind layout:
  - mobile width, white background
  - sticky Header/TabBar
  - fixed bottom bar with safe-area bottom padding
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
