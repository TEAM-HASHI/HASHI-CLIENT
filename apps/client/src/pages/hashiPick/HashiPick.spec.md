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
- [x] Header는 `app-mobile-fixed-top` 고정 영역으로 동작합니다.
- [x] FilterBar는 Header 아래의 일반 스크롤 콘텐츠로 동작합니다.
- [x] 정렬 옵션은 `기본순`, `인기순`, `별점순`입니다.
- [x] 음식 장르 기본 적용값은 `전체`이고, 필터바 기본 label은 `음식 장르 선택`입니다.
- [x] 정렬/음식 장르 BottomSheet는 `draft`와 `selected` 상태를 분리합니다.
- [x] 옵션 선택만으로 실제 필터 label을 바꾸지 않고 `적용` 버튼에서 반영합니다.
- [x] `초기화`는 현재 열린 sheet 값을 기본값으로 적용하고 BottomSheet를 닫습니다.
- [x] 필터 BottomSheet는 X 버튼으로만 닫힙니다.
- [x] RestaurantCard는 반복 렌더링되고 카드 클릭 시 식당 상세 route로 이동합니다.
- [x] 식당 이미지는 서버가 내려준 이미지만 가로 스크롤 리스트로 표시하고 부족한 슬롯을 `DefaultImage`로 채우지 않습니다.
- [x] 서버 이미지(`imageUrls`, fallback `thumbnailUrl`)가 하나도 없으면 공통 `DefaultImage`를 1개만 표시합니다.
- [x] 기존 shared 식당 목록 조회 API(`getRestaurants`, `restaurantsInfiniteQueryOptions`)를 사용해 `GET /api/v1/restaurants` 응답을 커서 기반 무한스크롤로 렌더링합니다.
- [x] 현재 page의 정적 restaurant fixture prop 주입은 production render path에서 제거했습니다.
- [x] fixed header는 `z-fixed` 토큰을 사용하고, 스크롤 콘텐츠는 fixed header 높이만큼 top padding을 둡니다.

## Data Dependencies

### Source

- Server API spec:
  - user-provided `식당 목록 조회 (검색/장르 필터/정렬/큐레이션 유형 포함)` text spec
- OpenAPI generated type:
  - `apps/client/src/shared/api/generated/openapi.ts`
  - 구현 직전 backend schema가 바뀌었으면 `pnpm gen:api-types`로 최신화한 뒤 이 spec의 Response Mapping과 다시 비교합니다.
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

### Current Implementation

- 식당 목록 조회 endpoint 함수, query key factory, infinite query options는 `features/restaurantList`에 이미 구현되어 있습니다.
- `HashiPickPage`는 `restaurantType="hashi-pick"`을 `RestaurantListPage`에 넘기고, 정적 restaurant fixture를 production render path에서 사용하지 않습니다.
- `RestaurantListPage`와 `useRestaurantListPage`는 `restaurants` prop과 local slice가 아니라 TanStack Query server state와 `useInfiniteScrollTrigger`를 사용합니다.
- 이 API 연동은 기존 shared 식당 목록 API를 새로 만들지 않고, 하시 Pick route UI가 기존 query options를 소비하도록 연결합니다.
- 검색 화면과 같은 `restaurantsInfiniteQueryOptions` 패턴을 사용하되, 검색어 `keyword` 대신 하시 Pick 목록 유형 `type`을 고정해서 보냅니다.
- 서버 기반 무한스크롤은 검색/매거진 화면 관례처럼 `useInfiniteScrollTrigger`로 sentinel intersect 시 `fetchNextPage`를 호출합니다. 기존 local slicing mock 경로는 제거합니다.

### API Integration Map

| UI area             | Endpoint                  | Params                                                                             | Response data                                             | Query key                                      | Mode       | Enabled | States                                                     |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------- | ---------- | ------- | ---------------------------------------------------------- |
| 하시 Pick 식당 목록 | `GET /api/v1/restaurants` | `type`, `genre`, `sort`, `cursor`, `size`; `keyword`, `foodCategory`는 보내지 않음 | `RestaurantListResponse.content`, `nextCursor`, `hasNext` | `restaurantListQueryKeys.infiniteList(params)` | `infinite` | always  | initial loading, next-page fetching, error, empty, success |

### Endpoint Type Mapping

| Endpoint                  | Generated operation            | Request type source                                   | Response type source                              |
| ------------------------- | ------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| `GET /api/v1/restaurants` | `operations['getRestaurants']` | `operations['getRestaurants']['parameters']['query']` | `components['schemas']['RestaurantListResponse']` |

### Request Params

- `type`:
  - 검색 화면의 `keyword` 자리에 해당하는 페이지 고정 필터입니다. 하시 Pick 목록 유형을 API `type`으로 보냅니다.
  - 음식 장르 필터는 `type`이 아니라 아래 `genre`로 보냅니다.
  - 서버 명세 기준 하시 Pick value는 `hashi-pick`입니다.
- `genre`:
  - 음식 장르 BottomSheet의 선택값을 API 값으로 변환해 보냅니다.
  - `전체`는 `all`로 보냅니다.
  - `스시/사시미류`는 `sushi`, `면류`는 `noodle`, `덮밥류`는 `rice-bowl`, `나베/냄비류`는 `nabe`, `튀김류`는 `fried`, `철판/구이류`는 `grill`, `기타`는 `etc`로 보냅니다.
  - 현재 `features/restaurantList/constants/category.ts`의 value 중 `riceBowl`은 API value와 다르므로 request param 생성 helper에서 `rice-bowl`로 정규화합니다.
- `foodCategory`:
  - 서버 명세에는 별도 카테고리 필터로 존재하지만, 현재 하시 Pick UI에는 음식 장르 BottomSheet만 있으므로 보내지 않습니다.
  - 추후 UI가 음식 카테고리와 음식 장르를 분리하면 `foodCategory` request param을 별도로 추가합니다.
- `sort`:
  - `기본순`은 API `sort=basic`으로 보냅니다.
  - `인기순`은 `popular`, `별점순`은 `rating`을 보냅니다.
- `size`:
  - 첫 연동은 검색 page와 식당 목록 상수 관습에 맞춰 `10`을 사용합니다.
  - 구현에서는 기존 `RESTAURANT_LIST_PAGE_SIZE = 10` 상수를 재사용하거나, page query wrapper 가까이에 같은 의미의 page size 상수를 두되 중복 의미가 생기지 않게 합니다.
- `cursor`:
  - 첫 페이지는 보내지 않고, 다음 페이지부터 이전 응답의 `nextCursor`를 그대로 보냅니다.
- `keyword`:
  - 하시 Pick 화면에는 검색어 UI가 없으므로 보내지 않습니다.

### Query

- query: hashi pick restaurants infinite query
- enabled condition: always; route 진입 시 첫 페이지를 조회합니다.
- request params:
  - `{ type, genre, sort, size }`
  - `cursor`는 다음 페이지 fetch 시 `getNextPageParam`에서만 추가합니다.
  - 검색 화면의 `createSearchRestaurantsRequestParams`와 같은 방식으로 하시 Pick 전용 request param helper를 둡니다.
  - 커서로 다음 페이지를 요청할 때는 서버 명세에 따라 첫 페이지와 동일한 `sort`를 유지합니다.
- data derivation:
  - `query.data?.pages.flatMap((page) => page.restaurants)`로 page data를 평탄화합니다.
  - 평탄화한 `RestaurantSummaryResponse[]`를 mapper로 `Restaurant[]` view model로 변환합니다.
- infinite scroll trigger:
  - `useInfiniteScrollTrigger<HTMLLIElement>`를 사용합니다.
  - `enabled`는 `Boolean(query.hasNextPage)`, `isLoading`은 `query.isFetchingNextPage`, `onIntersect`는 `query.fetchNextPage`로 연결합니다.
  - 다음 페이지 fetching 중에는 기존 리스트를 유지하고 중복 호출은 shared hook lock과 `isFetchingNextPage`로 막습니다.
- loading state:
  - Header와 FilterBar는 유지합니다.
  - 첫 페이지 loading은 화면 전체 `LoadingScreen`이 아니라 리스트 영역 card skeleton만 표시합니다.
  - 다음 페이지 fetching은 기존 리스트를 유지하고 하단 sentinel 영역에 pending indicator를 둡니다.
- error state:
  - 예상 가능한 400 계열 API error는 리스트 영역 local error UI로 표시하고 재시도 버튼을 제공합니다.
  - Header와 FilterBar를 유지해야 하므로 하시 Pick page query wrapper는 `throwOnError: false`를 명시하고 리스트 영역 local error UI를 유지합니다.
  - 5xx, network, timeout, unexpected non-API error도 queryClient 기본 retry 정책으로 최대 1회 retry하되 ErrorBoundary로 throw하지 않습니다.
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

| API field                           | UI use                        | Nullable           | Transform / 판단                                                                                                                                               |
| ----------------------------------- | ----------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RestaurantListResponse.content`    | 카드 리스트                   | yes                | 없으면 빈 배열로 정규화합니다.                                                                                                                                 |
| `RestaurantListResponse.nextCursor` | 다음 페이지 cursor            | yes                | `hasNext`가 true일 때만 다음 요청 `cursor`로 전달합니다.                                                                                                       |
| `RestaurantListResponse.hasNext`    | 하단 sentinel 노출            | yes                | 없으면 `false`로 정규화합니다.                                                                                                                                 |
| `restaurantId`                      | card key, 상세 route param    | generated optional | 서버 명세상 필수입니다. 문자열로 변환합니다. 실제 응답에서 누락되면 해당 item은 상세 이동이 불가능하므로 제외합니다.                                           |
| `name`                              | 식당명                        | generated optional | 서버 명세상 필수입니다. 누락 시 `이름 없는 식당` fallback을 사용합니다.                                                                                        |
| `rating`                            | 별점                          | generated optional | 서버 명세상 필수입니다. 누락 시 `0`으로 표시하고, UI에서는 `4.0`, `3.0`처럼 소수점 1자리로 표시합니다.                                                         |
| `area`                              | 지역 label                    | generated optional | 서버 명세상 필수입니다. 카드의 `{region} · {category}` 중 region으로 사용합니다.                                                                               |
| `foodCategory`                      | 음식 카테고리 label           | generated optional | 서버 명세상 필수입니다. category 우선값입니다. 없으면 `genre`를 fallback으로 사용합니다.                                                                       |
| `genre`                             | 음식 카테고리 fallback/filter | generated optional | 서버가 한글 label 또는 API code를 줄 수 있으므로 mapper에서 label 변환을 흡수합니다.                                                                           |
| `imageUrls`                         | 가로 스크롤 이미지 리스트     | generated optional | 서버 명세상 최대 3개입니다. 서버가 내려준 이미지만 표시하고 부족한 슬롯을 `DefaultImage`로 채우지 않습니다. 없으면 `thumbnailUrl`을 fallback으로 봅니다.       |
| `thumbnailUrl`                      | 이미지 fallback               | generated optional | 서버 명세상 필수입니다. `imageUrls`가 없을 때만 리스트 이미지로 사용합니다. `imageUrls`와 `thumbnailUrl`이 모두 없으면 UI에서 `DefaultImage` 1개를 표시합니다. |
| `summary`                           | 식당 소개                     | generated optional | 서버 명세상 필수입니다. 카드 설명 문구로 사용합니다. 영업시간으로 매핑하지 않습니다.                                                                           |
| `hashtags`                          | 관련 해시태그                 | generated optional | 서버 명세상 필수입니다. `#` prefix가 없으면 UI mapper에서 붙여 표시합니다.                                                                                     |
| `todayBusinessHour`                 | 사용 안 함                    | yes                | 하시 Pick 카드 UI에는 영업시간 영역이 없으므로 매핑하지 않습니다.                                                                                              |

### Missing Server Questions

- None.
- 서버 명세로 `type=hashi-pick`, `sort=basic | popular | rating`, `genre` 필터 사용이 확인되었습니다.
- 단, `openapi.ts` generated type은 response 필드를 optional로 생성하므로 구현은 defensive fallback을 유지합니다.

## State

- local state:
  - active bottom sheet: `sort | category | null`
  - selected/draft sort option
  - selected/draft category option
  - local retry trigger only when query option override가 필요한 경우
- form state: none
- URL state: none
- server state:
  - `useInfiniteQuery(restaurantsInfiniteQueryOptions(requestParams))` result pages
- derived state:
  - category filter label: `전체`일 때 `음식 장르 선택`, 그 외 selected label
  - selected sort/category -> API request params
  - `RestaurantSummaryResponse` -> `Restaurant`
- owner:
  - list state and handlers are owned by `useRestaurantListPage`
  - API response normalization is owned by `features/restaurantList` mapper/hook

## UI Structure

```text
HashiPickPage
  RestaurantListPage
    Header
    RestaurantFilterBar
    RestaurantCard list
      RestaurantImageList
        server images or single DefaultImage fallback
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
- feature query composition:
  - `createRestaurantListRequestParams`
  - `restaurantsInfiniteQueryOptions`
  - `useRestaurantListPage`에서 `restaurantsInfiniteQueryOptions`를 감싸고 `throwOnError: false`를 명시합니다.
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

- entry: `/restaurants/hashi-pick`
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
- `COMMON-400` cursor/size validation, `RESTAURANT-001` unsupported genre, `RESTAURANT-002` unsupported sort, `RESTAURANT-003` unsupported type은 구현 중 param mapping 오류로 보고 local error UI와 테스트로 잡습니다.
- 이 화면은 `foodCategory`를 보내지 않지만, 추후 추가 시 `RESTAURANT-007` unsupported foodCategory도 local error UI 대상입니다.
- ErrorBoundary가 화면 전체 fallback을 렌더링하면 Header/FilterBar까지 사라지므로 `throwOnError: false`를 이 query wrapper에서 명시합니다.

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- src/app/router/routes.test.tsx src/features/restaurantList/utils/createRestaurantListRequestParams.test.ts src/features/restaurantList/utils/mapRestaurantSummaryToRestaurant.test.ts src/features/restaurantList/api/getRestaurants.test.ts src/pages/search/queries/useSearchRestaurantsInfiniteQuery.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
- [ ] 수동 확인: `/restaurants/hashi-pick` 진입, 정렬 적용, 장르 적용, 다음 페이지 fetch, empty, 400 local error, 5xx/ErrorBoundary 정책
