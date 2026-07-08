# Page Spec: `HashiPickPage`

## Purpose

- 사용자가 하시가 추천하는 식당 리스트를 확인하고, 정렬/음식 장르 필터를 적용한 뒤 식당 상세로 이동할 수 있습니다.

## Route

- path: `/restaurants/hashi-pick`
- path constant:
  - `ROUTES.hashiPickRestaurants`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type: public
- guard: none
- lazy loading: `lazyPages.hashiPick`
- bottom navigation: no
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/hashiPick/HashiPickPage.tsx`
- spec path:
  - `apps/client/src/pages/hashiPick/HashiPick.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [x] `하시 Pick` title을 Header에 표시합니다.
- [x] Header와 FilterBar는 함께 sticky 영역으로 동작합니다.
- [x] 정렬 옵션은 `기본순`, `인기순`, `별점순`입니다.
- [x] 음식 장르 기본 적용값은 `전체`이고, 필터바 기본 label은 `음식 장르 선택`입니다.
- [x] 정렬/음식 장르 BottomSheet는 `draft`와 `selected` 상태를 분리합니다.
- [x] 옵션 선택만으로 실제 필터 label을 바꾸지 않고 `적용` 버튼에서 반영합니다.
- [x] `초기화`는 현재 열린 sheet의 draft 값만 기본값으로 되돌립니다.
- [x] 필터 BottomSheet는 X 버튼으로만 닫힙니다.
- [x] RestaurantCard는 반복 렌더링되고 카드 클릭 시 식당 상세 route로 이동합니다.
- [x] 식당 이미지는 가로 스크롤 리스트로 표시하고 이미지가 없으면 공통 `DefaultImage` fallback을 사용합니다.
- [x] 식당 리스트는 mock data 25개를 10개 단위로 무한스크롤 렌더링합니다.
- [x] sticky header는 `z-fixed` 토큰을 사용합니다.

## Data Dependencies

### Query

- query: none
- enabled condition: none
- request params: none
- loading state: not implemented in this publishing scope
- error state: not implemented in this publishing scope
- empty state: not implemented in this publishing scope
- refetch condition: none

### Mutation

- mutation: none

## State

- local state:
  - active bottom sheet: `sort | category | null`
  - selected/draft sort option
  - selected/draft category option
  - visible restaurant count for infinite scroll
- form state: none
- URL state: none
- server state: none
- derived state:
  - category filter label: `전체`일 때 `음식 장르 선택`, 그 외 selected label
- owner:
  - list state and handlers are owned by `useRestaurantListPage`

## UI Structure

```text
HashiPickPage
  RestaurantListPage
    Header
    RestaurantFilterBar
    RestaurantCard list
      RestaurantImageList
        DefaultImage fallback
    FilterBottomSheet(sort)
    FilterBottomSheet(category)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `BottomSheet`
  - `Button`
- app shared component:
  - `FilterBottomSheet`
- feature component:
  - `RestaurantListPage`
  - `RestaurantFilterBar`
  - `RestaurantCard`
  - `RestaurantImageList`
- feature hook:
  - `useRestaurantListPage`
  - `useInfiniteRestaurantList`
- feature mock:
  - `mocks/restaurantList.mock.ts`
- page-local component: none
- icon:
- `BackIcon`
  - `TapDownIcon`
  - `CheckIcon`
  - `StarFillIcon`

## Navigation

- entry: `/restaurants/hashi-pick`
- links:
  - 식당 카드: `ROUTES.restaurantDetail`
- route params:
  - `restaurantId`
- search params: none
- back behavior:
  - Header back button calls `navigate(-1)`

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- HashiPickPage.test.tsx PopularRestaurantsPage.test.tsx FilterBottomSheet.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
- [x] `corepack pnpm --filter @hashi/client test`
