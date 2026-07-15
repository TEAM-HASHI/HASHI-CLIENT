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
- route module:
  - `apps/client/src/app/routes/restaurant-menu-detail.tsx`
- bottom navigation:
  - no

## Requirements

- [ ] Header는 75px 높이로 식당명을 한 줄 말줄임 처리하고 뒤로가기, 공유 액션을 제공합니다.
- [ ] 공유 클릭 시 `ROUTES.restaurantMenuDetail` 기준 메뉴 상세 링크를 현재 origin 기준 absolute URL로 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 매장 정보, 메뉴, 리뷰 탭을 표시하고 `메뉴` 탭을 선택 상태로 둡니다.
- [ ] 메뉴 상세 route 진입 또는 `menuId` 변경 시 페이지 스크롤을 최상단으로 초기화합니다.
- [ ] 메뉴 이미지는 실제 이미지가 있으면 `img`, 없거나 로딩 실패하면 공통 `DefaultImage`로 표시합니다.
- [ ] route param `restaurantId`, `menuId`가 유효한 양의 정수가 아니면 `NotFoundPage`를 표시합니다.
- [ ] 메뉴 상세 API가 404를 반환하거나 성공 응답에 메뉴 데이터가 없으면 `NotFoundPage`를 표시합니다.
- [ ] 선택한 메뉴 이름, 가격, 설명을 표시합니다.
- [ ] 다른 메뉴 목록은 현재 선택 메뉴를 제외하고 반복 렌더링합니다.
- [ ] 다른 메뉴 목록은 식당 메뉴 목록 API에 `excludeMenuId`를 전달해 조회하고, 서버 `main` 값이 true인 메뉴에만 대표 배지를 표시합니다.
- [ ] 다른 메뉴 총 개수는 메뉴 상세 API의 `otherMenuCount`를 기준으로 표시합니다.
- [ ] 다른 메뉴 카드를 누르면 같은 route의 다른 `menuId`로 이동합니다.
- [ ] 하단 fixed bar에는 좋아요 영역과 `예약하기`가 표시됩니다.
- [ ] 비로그인 사용자가 예약하기 또는 좋아요를 누르면 로그인 유도 바텀시트를 표시합니다.
- [ ] 로그인 사용자가 예약하기를 누르면 `ROUTES.restaurantReservationNew`로 이동합니다.
- [ ] 로그인 사용자가 좋아요를 누르면 준비중 모달을 표시합니다.
- [ ] `location.state.source`가 `today`이면 탭/뒤로가기 fallback은 `/restaurants/today`로 이동합니다.
- [ ] `location.state.source`가 없거나 `detail`이면 탭/뒤로가기 fallback은 `/restaurants/:restaurantId`로 이동합니다.
- [ ] 매장 정보/리뷰 탭 이동 시 destination route state에 `activeTab`을 넘깁니다.
- [ ] 서버/API 연동 기준으로 식당 요약, 메뉴 상세, 메뉴 목록 데이터를 조회합니다.

## Data Dependencies

- query: restaurant summary
- endpoint: `GET /api/v1/restaurants/{restaurantId}/summary`
- enabled condition: route param `restaurantId`, `menuId` is valid positive integer
- request params:
  - path: `restaurantId`
- response usage:
  - Header 식당명
  - 리뷰 탭 count
  - 하단 좋아요 count는 MVP 범위에서 `0` 고정
- loading state: page loading
- error state: 404는 `NotFoundPage`, 나머지는 ErrorBoundary

- query: restaurant menu detail
- endpoint: `GET /api/v1/restaurants/{restaurantId}/menus/{menuId}`
- enabled condition: route param `restaurantId`, `menuId` is valid positive integer
- request params:
  - path: `restaurantId`
  - path: `menuId`
- response usage:
  - 선택 메뉴 이미지, 이름, 가격, 설명
  - 다른 메뉴 총 개수 `otherMenuCount`
- loading state: page loading
- error state: 404는 `NotFoundPage`, 나머지는 ErrorBoundary
- empty state: 응답 `data`가 null이거나 `menuId/name`이 없으면 `NotFoundPage`

- query: restaurant menus
- endpoint: `GET /api/v1/restaurants/{restaurantId}/menus`
- enabled condition: route param `restaurantId`, `menuId` is valid positive integer
- request params:
  - path: `restaurantId`
  - query: `excludeMenuId=menuId`
  - query: `size=10`
- response usage:
  - 다른 메뉴 목록
- loading state: page loading
- error state: 404는 `NotFoundPage`, 나머지는 ErrorBoundary

## State

- local state: none
  - auth gate bottom sheet open/closed
  - coming soon dialog open/closed
- URL state:
  - `restaurantId`
  - `menuId`
  - `location.state.source`
- server state:
  - restaurant summary
  - restaurant menu detail
  - restaurant menus first page
- derived state:
  - selected menu from menu detail response
  - other menus from menu list excluding selected `menuId`

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Tabs`
  - `Button`
  - `Badge`
  - `Dialog`
- app shared component:
  - `ShareIconButton`
  - `DefaultImage`
  - `ComingSoonDialog`
  - `LoadingScreen`
- feature component:
  - `RestaurantDetailTabs`
  - `RestaurantMenuSection`
  - `RestaurantBottomBar`
  - `RestaurantImage`
- page-local component:
  - `RestaurantSelectedMenuSection`
  - `RestaurantOtherMenuSection`
- icon:
  - `BackIcon`

## Verification

- [ ] 직접 URL `/restaurants/10/menus/100`에서 메뉴 상세 API 응답 기반 화면이 렌더링됩니다.
- [ ] 다른 메뉴 카드 클릭 시 `/restaurants/{restaurantId}/menus/{menuId}`로 이동합니다.
- [ ] `pnpm --filter @hashi/client typecheck`
- [ ] `pnpm --filter @hashi/client exec vitest run src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.test.tsx src/features/restaurantDetail/api/restaurantDetailApi.test.ts`
- [ ] `pnpm --filter @hashi/client build`
