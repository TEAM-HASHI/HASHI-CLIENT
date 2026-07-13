# Page Spec: `PopularRestaurantsPage`

## Purpose

- 사용자가 인기 맛집 리스트를 확인하고, 정렬/음식 장르 필터를 적용한 뒤 식당 상세로 이동할 수 있습니다.

## Route

- path: `/restaurants/popular`
- path constant:
  - `ROUTES.popularRestaurants`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type: public
- guard: none
- lazy loading: `lazyPages.popularRestaurants`
- bottom navigation: no
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/popularRestaurants/PopularRestaurantsPage.tsx`
- spec path:
  - `apps/client/src/pages/popularRestaurants/PopularRestaurants.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [x] `인기 맛집` title을 Header에 표시합니다.
- [x] Header는 `app-mobile-fixed-top` 고정 영역으로 동작합니다.
- [x] FilterBar는 Header 아래의 일반 스크롤 콘텐츠로 동작합니다.
- [x] 정렬 옵션은 `기본순`, `별점순`입니다.
- [x] 음식 장르 기본 적용값은 `전체`이고, 필터바 기본 label은 `음식 장르 선택`입니다.
- [x] 정렬/음식 장르 BottomSheet는 `draft`와 `selected` 상태를 분리합니다.
- [x] 옵션 선택만으로 실제 필터 label을 바꾸지 않고 `적용` 버튼에서 반영합니다.
- [x] `초기화`는 현재 열린 sheet의 draft 값만 기본값으로 되돌립니다.
- [x] 필터 BottomSheet는 X 버튼으로만 닫힙니다.
- [x] RestaurantCard는 반복 렌더링되고 카드 클릭 시 식당 상세 route로 이동합니다.
- [x] 식당 이미지는 가로 스크롤 리스트로 표시하고 이미지가 없으면 공통 `DefaultImage` fallback을 사용합니다.
- [ ] 식당 리스트는 `GET /api/v1/restaurants` 응답을 커서 기반 무한스크롤로 렌더링합니다.
- [ ] mock data는 API loading/error/empty 테스트용 fixture로만 남기고 production render path에서 제거합니다.
- [x] fixed header는 `z-fixed` 토큰을 사용하고, 스크롤 콘텐츠는 fixed header 높이만큼 top padding을 둡니다.

## Data Dependencies

### Source

- OpenAPI generated type:
  - `apps/client/src/shared/api/generated/openapi.ts`
- HTTP client:
  - `apps/client/src/shared/api/request.ts`
  - `apps/client/src/shared/api/apiClient.ts`
- Query defaults:
  - `apps/client/src/shared/lib/queryClient.ts`
- Route error boundary:
  - `apps/client/src/app/providers/AsyncBoundary.tsx`
  - `apps/client/src/app/layout/RootLayout.tsx`
- Shared restaurant list API:
  - `apps/client/src/features/restaurantList/api/getRestaurants.ts`
  - `apps/client/src/features/restaurantList/queries/restaurantListQueryKeys.ts`
  - `apps/client/src/features/restaurantList/queries/useRestaurantsInfiniteQuery.ts`

### API Integration Map

| UI area             | Endpoint                  | Params                                                                             | Response data                                             | Query key                                      | Mode       | Enabled | States                                                     |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------- | ---------- | ------- | ---------------------------------------------------------- |
| 인기 맛집 식당 목록 | `GET /api/v1/restaurants` | `type`, `genre`, `foodCategory`, `sort`, `cursor`, `size`; `keyword`는 보내지 않음 | `RestaurantListResponse.content`, `nextCursor`, `hasNext` | `restaurantListQueryKeys.infiniteList(params)` | `infinite` | always  | initial loading, next-page fetching, error, empty, success |

### Endpoint Type Mapping

| Endpoint                  | Generated operation            | Request type source                                   | Response type source                              |
| ------------------------- | ------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| `GET /api/v1/restaurants` | `operations['getRestaurants']` | `operations['getRestaurants']['parameters']['query']` | `components['schemas']['RestaurantListResponse']` |

### Request Params

- `type`:
  - 인기 맛집 목록을 서버에서 구분하는 식당 목록 유형입니다.
  - 현재 OpenAPI는 `type?: string`만 제공하고 허용 value enum을 제공하지 않습니다.
  - 구현 전 서버에 인기 맛집용 value가 `popular`인지 확인해야 합니다.
  - 만약 서버가 인기 맛집을 `type`이 아니라 `sort=popular`만으로 표현한다면, 이 화면의 `기본순`은 `sort=popular`로 보내고 `type`은 생략해야 합니다.
- `genre`:
  - 음식 장르 BottomSheet의 선택값을 API 값으로 변환해 보냅니다.
  - `전체`는 `all`로 보냅니다.
  - `스시/사시미류`는 `sushi`, `면류`는 `noodle`, `덮밥류`는 `rice-bowl`, `나베/냄비류`는 `nabe`, `튀김류`는 `fried`, `철판/구이류`는 `grill`, `기타`는 `etc`로 보냅니다.
  - 현재 `features/restaurantList/constants/category.ts`의 value 중 `riceBowl`, `grill`은 API value와 다르므로 request param 생성 helper에서 정규화합니다.
- `foodCategory`:
  - 현재 화면의 장르 필터가 API `genre`에 매핑된다는 검색 page spec과 맞춥니다.
  - 서버가 이 화면에서 `foodCategory`를 요구하면 `genre` 대신 또는 함께 보내야 하므로 서버 확인이 필요합니다.
- `sort`:
  - `기본순`은 인기 맛집 목록의 기본 서버 정렬을 유지합니다.
  - 서버가 인기 맛집을 `type=popular`로 구분한다면 `기본순`에서는 `sort`를 생략합니다.
  - 서버가 인기 맛집을 `sort=popular`로 구분한다면 `기본순`에서 `sort=popular`를 보내야 합니다.
  - `별점순`은 `rating`을 보냅니다.
- `size`:
  - 첫 연동은 검색 page와 같은 `20`을 사용합니다.
- `cursor`:
  - 첫 페이지는 보내지 않고, 다음 페이지부터 이전 응답의 `nextCursor`를 그대로 보냅니다.
- `keyword`:
  - 인기 맛집 화면에는 검색어 UI가 없으므로 보내지 않습니다.

### Query

- query: popular restaurants infinite query
- enabled condition: always; route 진입 시 첫 페이지를 조회합니다.
- request params:
  - `{ type, genre, sort, size }`
  - `cursor`는 다음 페이지 fetch 시 `getNextPageParam`에서만 추가합니다.
- loading state:
  - Header와 FilterBar는 유지합니다.
  - 첫 페이지 loading은 리스트 영역에 card skeleton 또는 `LoadingScreen` 계열 fallback을 표시합니다.
  - 다음 페이지 fetching은 기존 리스트를 유지하고 하단 sentinel 영역에 pending indicator를 둡니다.
- error state:
  - 예상 가능한 400 계열 API error는 리스트 영역 local error UI로 표시하고 재시도 버튼을 제공합니다.
  - 5xx, network, timeout, unexpected non-API error는 `queryClient` 기본 정책에 따라 최대 1회 retry 후 ErrorBoundary throw 후보입니다.
  - 화면 전체 대신 리스트 영역에 error UI를 유지해야 하면 query option에서 `throwOnError: false`를 명시합니다.
- empty state:
  - API content가 비어 있고 다음 페이지가 없으면 빈 목록 안내를 표시합니다.
- refetch condition:
  - 정렬 `적용`
  - 음식 장르 `적용`
  - Error UI의 재시도
  - 같은 params 재적용 시 TanStack Query cache/stale 정책을 따릅니다.

### Mutation

- mutation: none

### Response Mapping

| API field                           | UI use                        | Nullable | Transform / 판단                                                                                           |
| ----------------------------------- | ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `RestaurantListResponse.content`    | 카드 리스트                   | yes      | 없으면 빈 배열로 정규화합니다.                                                                             |
| `RestaurantListResponse.nextCursor` | 다음 페이지 cursor            | yes      | `hasNext`가 true일 때만 다음 요청 `cursor`로 전달합니다.                                                   |
| `RestaurantListResponse.hasNext`    | 하단 sentinel 노출            | yes      | 없으면 `false`로 정규화합니다.                                                                             |
| `restaurantId`                      | card key, 상세 route param    | yes      | 문자열로 변환합니다. 누락 시 상세 이동이 불가능하므로 해당 item 제외 또는 서버 required 요청이 필요합니다. |
| `name`                              | 식당명                        | yes      | 누락 시 `이름 없는 식당` fallback을 쓰되 서버 required 요청 대상입니다.                                    |
| `rating`                            | 별점                          | yes      | 누락 시 `0`으로 표시합니다.                                                                                |
| `area`                              | 지역 label                    | yes      | 카드의 `{region} · {category}` 중 region으로 사용합니다.                                                   |
| `foodCategory`                      | 음식 카테고리 label           | yes      | category 우선값입니다. 없으면 `genre`를 fallback으로 사용합니다.                                           |
| `genre`                             | 음식 카테고리 fallback/filter | yes      | 서버가 한글 label 또는 API code를 줄 수 있으므로 mapper에서 label 변환을 흡수합니다.                       |
| `imageUrls`                         | 가로 스크롤 이미지 리스트     | yes      | 비어 있으면 `thumbnailUrl` 단일 이미지로 fallback합니다.                                                   |
| `thumbnailUrl`                      | 이미지 fallback               | yes      | `imageUrls`가 없을 때만 리스트 이미지로 사용합니다.                                                        |
| `summary`                           | 식당 소개                     | yes      | 카드 설명 문구로 사용합니다. 영업시간으로 매핑하지 않습니다.                                               |
| `hashtags`                          | 관련 해시태그                 | yes      | `#` prefix가 없으면 UI mapper에서 붙여 표시합니다.                                                         |

### Missing Server Questions

- 인기 맛집 목록용 `type` 허용값이 무엇인지 확인해야 합니다. 현재 generated OpenAPI에는 `type?: string`만 있고 enum 또는 예시가 없습니다.
- 인기 맛집의 `기본순`이 `type=popular`의 서버 기본 정렬인지, 아니면 `sort=popular`를 보내야 하는지 확인해야 합니다.
- 화면의 음식 장르 필터는 API `genre`와 `foodCategory` 중 어느 파라미터가 정식 계약인지 확인해야 합니다. 검색 page spec은 UI 장르를 `genre`로 보내고 있습니다.
- `restaurantId`, `name`, `rating`, `area`, `foodCategory` 또는 `genre`, `summary`가 목록 카드에서 사실상 필수인데 generated type은 모두 optional입니다. 서버가 required로 내려주는지, 아니면 프론트 fallback/필터링을 공식 처리로 둘지 확인해야 합니다.

## State

- local state:
  - active bottom sheet: `sort | category | null`
  - selected/draft sort option
  - selected/draft category option
  - local retry trigger only when query option override가 필요한 경우
- form state: none
- URL state: none
- server state:
  - `useRestaurantsInfiniteQuery` result pages
- derived state:
  - category filter label: `전체`일 때 `음식 장르 선택`, 그 외 selected label
  - selected sort/category -> API request params
  - `RestaurantSummaryResponse` -> `Restaurant`
- owner:
  - list state and handlers are owned by `useRestaurantListPage`
  - API response normalization is owned by `features/restaurantList` mapper/hook

## UI Structure

```text
PopularRestaurantsPage
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
  - `useRestaurantsInfiniteQuery`
  - `restaurantsInfiniteQueryOptions`
- feature mapper:
  - `RestaurantSummaryResponse` -> `Restaurant`
- feature mock:
  - test fixture only
- page-local component: none
- icon:
  - `BackIcon`
  - `TapDownIcon`
  - `CheckIcon`
  - `StarFillIcon`

## Navigation

- entry: `/restaurants/popular`
- links:
  - 식당 카드: `ROUTES.restaurantDetail`
- route params:
  - `restaurantId`
- search params: none
- back behavior:
  - Header back button navigates to `ROUTES.home`

## Error Handling

- API transport와 envelope parsing은 `request<TData>()`를 사용해 기존 `ky`, `ApiError`, `HttpStatusError` 설정을 그대로 활용합니다.
- query retry/throw 기본값은 `createQueryClient`의 `checkShouldRetryQuery`, `checkShouldThrowQueryError`를 따릅니다.
- `RESTAURANT-001` unsupported genre, `RESTAURANT-002` unsupported sort, `RESTAURANT-003` unsupported list type은 구현 중 param mapping 오류로 보고 local error UI와 테스트로 잡습니다.
- ErrorBoundary가 화면 전체 fallback을 렌더링하면 Header/FilterBar까지 사라지므로, 제품 요구가 리스트 영역 error라면 `throwOnError: false`를 이 query에서 명시합니다.

## Verification

- [ ] `corepack pnpm --filter @hashi/client test -- HashiPickPage.test.tsx PopularRestaurantsPage.test.tsx getRestaurants.test.ts useRestaurantsInfiniteQuery.test.tsx`
- [ ] `corepack pnpm --filter @hashi/client lint`
- [ ] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] 수동 확인: `/restaurants/popular` 진입, 정렬 적용, 장르 적용, 다음 페이지 fetch, empty, 400 local error, 5xx/ErrorBoundary 정책
