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

- [ ] Header는 77px 높이로 식당명을 한 줄 말줄임 처리하고 뒤로가기, 공유 액션을 제공합니다.
- [ ] 공유 클릭 시 `ROUTES.restaurantMenuDetail` 기준 메뉴 상세 링크를 현재 origin 기준 absolute URL로 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 매장 정보, 메뉴, 사진, 리뷰 탭을 표시하고 `메뉴` 탭을 선택 상태로 둡니다.
- [ ] 사진 탭은 식당 상세와 동일한 사진 source/cache의 전체 공개 사진 수를 표시합니다. source 미연결 또는 개수 조회 실패 시 임의의 숫자를 표시하지 않습니다. 목데이터는 개발 환경에만 적용합니다.
- [ ] 메뉴 상세 route 진입 또는 `menuId` 변경 시 페이지 스크롤을 최상단으로 초기화합니다.
- [ ] 선택 메뉴 `detailImage`와 다른 메뉴 `listImage`는 MediaImage READY의 `defaultSource.url`을 사용합니다. asset이 없을 때만 기존 `imageUrl`을 사용하고 PROCESSING/FAILED 또는 로드 실패는 HDS `ImageFallback`으로 표시합니다.
- [ ] route param `restaurantId`, `menuId`가 유효한 양의 정수가 아니면 `NotFoundPage`를 표시합니다.
- [ ] 메뉴 상세 API가 404를 반환하거나 성공 응답에 메뉴 데이터가 없으면 `NotFoundPage`를 표시합니다.
- [ ] 선택한 메뉴 이름, 가격, 설명을 표시합니다.
- [ ] 선택 메뉴 제목은 20px/600, 줄 높이 30px이며 가격의 통화는 18px/400, 금액은 18px/600입니다.
- [ ] 다른 메뉴 제목과 개수는 동일한 `primary-200` 색상, 18px/600과 2px 간격을 사용합니다. 대표 배지는 10px, 줄 높이 1.38, 상하 패딩 2px이며 공통 Badge의 고정 높이를 적용하지 않습니다.
- [ ] 다른 메뉴 목록은 현재 선택 메뉴를 제외하고 커서 기반 무한스크롤로 표시합니다. 추가 조회 실패 시 기존 목록을 유지하고 실패한 cursor를 재시도합니다.
- [ ] 다른 메뉴 목록은 식당 메뉴 목록 API에 `excludeMenuId`를 전달해 조회하고, 서버 `main` 값이 true인 메뉴에만 대표 배지를 표시합니다.
- [ ] 다른 메뉴 총 개수는 메뉴 상세 API의 `otherMenuCount`를 기준으로 표시합니다.
- [ ] 다른 메뉴 카드를 누르면 같은 route의 다른 `menuId`로 이동합니다.
- [ ] 하단 fixed bar에는 36px 북마크와 공개 저장 수, `예약하기`가 표시됩니다. 로그인 사용자의 `saved`에 따라 아이콘과 `aria-pressed`를 반영하며 접근성 이름은 `저장하기`입니다.
- [ ] 비로그인 사용자가 예약하기 또는 저장하기를 누르면 로그인 유도 바텀시트를 표시합니다.
- [ ] 로그인 사용자가 예약하기를 누르면 `ROUTES.restaurantReservationNew`로 이동합니다.
- [ ] 로그인 사용자가 저장하기를 누르면 기존 컬렉션 저장 모달을 표시합니다. 메뉴 진입 source를 유지합니다.
- [ ] `location.state.source`가 `today`이면 탭/뒤로가기 fallback은 `/restaurants/today`로 이동합니다.
- [ ] `location.state.source`가 없거나 `detail`이면 탭/뒤로가기 fallback은 `/restaurants/:restaurantId`로 이동합니다.
- [x] `location.state.source`가 `map`이면 뒤로가기는 지도 상세의 메뉴 탭, 매장 정보/사진/리뷰 탭 클릭은 지도 상세의 해당 탭으로 복귀합니다. `mapRestaurantId`와 `activeTab`을 한 번 사용하는 route state로 전달하며, 지도 쪽 세션에 해당 선택 식당이 있을 때 적용합니다. 다른 메뉴 카드는 replace 이동하여 메뉴 history가 누적되지 않습니다.
- [ ] 매장 정보/사진/리뷰 탭 이동 시 destination route state에 `activeTab`을 넘깁니다.
- [ ] 서버/API 연동 기준으로 식당 요약, 메뉴 상세, 메뉴 목록 데이터를 조회합니다.

## Data Dependencies

- 사진 개수는 기존 `useRestaurantPhotos(restaurantId, false)`의 counts query를 재사용합니다. 메뉴 상세에서는 사진 목록 infinite query를 실행하지 않습니다.
- 공개 `GET /api/v1/restaurants/{restaurantId}/photos`의 counts를 공유 사진 query로 사용합니다. 오류·미확인 개수를 목데이터 또는 0으로 대체하지 않습니다.

- query: restaurant summary
- endpoint: `GET /api/v1/restaurants/{restaurantId}/summary`
- enabled condition: route param `restaurantId`, `menuId` is valid positive integer
- request params:
  - path: `restaurantId`
- response usage:
  - Header 식당명
  - 리뷰 탭 count
- loading state: page loading
- error state: 404는 `NotFoundPage`, 나머지는 ErrorBoundary
- retry: summary query는 자동 재시도 없음

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
- enabled condition: 유효한 route params; 메뉴 상세의 메뉴 탭에서 진입 즉시 조회 (다른 탭은 부모 상세 페이지로 이동)
- request params:
  - path: `restaurantId`
  - query: `excludeMenuId=menuId`
  - query: `size=10`
  - query: 다음 페이지 `cursor`
- response usage:
  - 다른 메뉴 목록
- loading state: 최초 조회와 최초 실패 후 재시도는 다른 메뉴 영역에만 스켈레톤을 표시하며, 선택 메뉴와 페이지 액션은 유지합니다.
- error state: 최초 실패는 다른 메뉴 영역 재시도; 추가 조회 실패는 기존 목록 유지 및 실패한 cursor 재시도. 이 목록 오류는 page critical error에 포함하지 않음

- query: restaurant save summary (`useRestaurantSaveSummary`)
- endpoints: 공개 `GET /api/v1/restaurants/save-counts`, 로그인 전용 `GET /api/v1/users/me/restaurant-saves`; query `restaurantIds`
- enabled condition: 유효한 식당 ID; saved-state query는 로그인 시에만 실행
- cache: count는 식당 ID, saved는 식당 ID + `sessionVersion`으로 분리하며 로그아웃/세션 전환 시 이전 saved 응답을 재사용하지 않음
- fallback: count 미확인/실패 시 숫자를 숨기고 saved는 false; 임의의 `0`을 만들지 않음

## State

- local state: none
  - auth gate bottom sheet open/closed
- URL state:
  - `restaurantId`
  - `menuId`
  - `location.state.source`
- server state:
  - restaurant summary
  - restaurant menu detail
  - restaurant menus infinite pages
  - public save count and session-scoped authenticated saved state
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
  - `ImageFallback`
- app shared component:
  - `BottomActionBar`
  - `ShareIconButton`
  - `LoadingScreen`
- feature component:
  - `RestaurantDetailTabs`
  - `RestaurantMenuListSection`
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
