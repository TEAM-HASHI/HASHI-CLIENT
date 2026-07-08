# Page Spec: `RestaurantMenuDetailPage`

## Purpose

- 사용자가 식당 메뉴 카드에서 진입해 선택한 메뉴의 이미지, 이름, 가격, 설명과 다른 메뉴 목록을 확인할 수 있는 모바일 웹 페이지입니다.

## Route

- path: `/restaurants/:restaurantId/menus/:menuId`
- path constant:
  - `ROUTES.restaurantMenuDetail`
- route owner:
  - `apps/client/src/pages/restaurantMenuDetail`
- layout:
  - `RootLayout`
- access type:
  - public
- guard:
  - none
- lazy loading:
  - `lazyPages.restaurantMenuDetail`
- bottom navigation:
  - no

## Requirements

- [ ] Header는 식당명을 표시하고 뒤로가기, 공유 액션을 제공합니다.
- [ ] 공유 클릭 시 현재 페이지 링크를 클립보드에 복사하고, 성공 토스트는 TODO로 둡니다.
- [ ] 매장 정보, 메뉴, 리뷰 탭을 표시하고 `메뉴` 탭을 선택 상태로 둡니다.
- [ ] 메뉴 상세 route 진입 또는 `menuId` 변경 시 페이지 스크롤을 최상단으로 초기화합니다.
- [ ] 메뉴 이미지는 서버 연동 전 placeholder 영역으로 표시합니다.
- [ ] 선택한 메뉴 이름, 가격, 설명을 표시합니다.
- [ ] 다른 메뉴 목록은 현재 선택 메뉴를 제외하고 반복 렌더링합니다.
- [ ] 서버/API 연동 전 화면 확인용 데이터에서는 Figma 기준으로 다른 메뉴 목록의 첫 두 항목에 대표 배지를 표시합니다.
- [ ] 다른 메뉴 카드를 누르면 같은 route의 다른 `menuId`로 이동합니다.
- [ ] 하단 fixed bar에는 좋아요 영역과 `예약하기`가 표시됩니다.
- [ ] 좋아요는 에러 컴포넌트 머지 후 에러페이지로 이동하도록 page TODO handler로 둡니다.
- [ ] 서버/API 연동 전에는 mock data를 사용하되, 서버 배열 교체가 쉽도록 타입 기반으로 구성합니다.

## Data Dependencies

- query: none
- future query params:
  - `restaurantId`
  - `menuId`
- loading/error/empty state: out of scope

## State

- local state: none
- URL state:
  - `restaurantId`
  - `menuId`
- server state: none
- derived state:
  - selected menu from `menuId`
  - other menus excluding selected menu

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Tabs`
  - `Button`
  - `Badge`
- app shared component:
  - `ShareIconButton`
- feature component:
  - `RestaurantDetailTabs`
  - `RestaurantMenuSection`
  - `RestaurantBottomBar`
- icon:
  - `BackIcon`

## Verification

- [ ] 직접 URL `/restaurants/default/menus/shio-ramen-1`에서 메뉴 상세 화면이 렌더링됩니다.
- [ ] 다른 메뉴 카드 클릭 시 `/restaurants/default/menus/{menuId}`로 이동합니다.
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client exec vitest run src/pages/todayRestaurant/TodayRestaurantPage.test.tsx src/pages/restaurantDetail/RestaurantDetailPage.test.tsx src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.test.tsx`
- [ ] `pnpm --filter @hashi/client build`
