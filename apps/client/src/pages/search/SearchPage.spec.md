# Page Spec: `SearchPage`

## Purpose

- 사용자가 홈 화면의 상단 검색 CTA에서 진입해 식당명 또는 메뉴명으로 식당을 검색하고, 정렬 순서와 음식 장르 필터를 적용해 결과를 탐색합니다.
- 검색 전에는 최근 검색어와 추천 검색어를 빠르게 선택할 수 있습니다.
- 검색 결과가 없을 때는 선택한 검색어와 필터 상태를 유지한 채 빈 결과 안내를 보여줍니다.

## Source Design

- 첨부 화면 설계서 기준:
  - 검색 전 `0`: 홈 화면 상단 검색 CTA 클릭 시 진입되는 검색 페이지 / 검색 전 상태
  - 검색 전 `1`: 상단 검색창
  - 검색 전 `2`: 최근 검색어
  - 검색 전 `3`: 추천 검색어
  - 검색 결과 `0`: 검색 결과 화면
  - 검색 결과 `1`: 상단 검색창
  - `2-1`: 정렬 필터 trigger
  - `2-2`: 음식 장르 필터 trigger
  - `2-a`: 정렬 필터 바텀시트
  - `2-a-1`: 정렬 필터 초기화 버튼
  - `2-a-2`: 정렬 필터 적용 버튼
  - `2-b`: 음식 장르 필터 바텀시트
  - 검색 결과 `3`: 식당 리스트
  - 검색 결과 `4`: 검색 결과 없음

## Route

- path: `/search`
- path constant:
  - `ROUTES.search`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - `BottomNavigationLayout` 없음
- access type:
  - public
- guard:
  - none
- lazy loading:
  - `lazyPages.search`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: 없음
  - authenticated guest: 없음
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/search/SearchPage.tsx`
- spec path:
  - `apps/client/src/pages/search/SearchPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [x] 상단 영역은 페이지 내 스크롤과 무관하게 고정합니다.
- [x] 상단 영역은 뒤로가기 버튼과 검색창을 같은 행에 배치합니다.
- [x] 검색 결과 상태에서는 정렬/음식 장르 필터 바까지 상단 고정 영역에 포함합니다.
- [x] 뒤로가기 버튼은 24px 아이콘을 유지하고 44px 터치 영역을 제공합니다.
- [x] 뒤로가기 버튼을 누르면 이전 화면으로 돌아갑니다.
- [x] 검색창 placeholder는 `식당 혹은 메뉴를 검색해보세요`를 사용합니다.
- [x] 홈 검색 CTA에서 진입하면 검색창에 자동 focus를 주어 키보드가 노출됩니다.
- [x] `/search` 직접 진입 시에도 검색창에 focus를 줄 수 있지만, 브라우저/OS 정책으로 자동 키보드 노출이 제한될 수 있음을 허용합니다.
- [x] 검색 전에는 식당 리스트와 필터 바 대신 최근 검색어와 추천 검색어 영역을 보여줍니다.
- [x] 최근 검색어가 있으면 최근 검색어 영역은 사용자가 최근에 검색한 키워드를 보여줍니다.
- [x] 최근 검색어를 탭하면 해당 키워드를 검색어로 채우고 검색 결과 상태로 전환합니다.
- [x] 추천 검색어 영역은 운영팀이 지정한 키워드 또는 제품이 제공하는 추천 키워드를 보여줍니다.
- [x] 추천 검색어를 탭하면 해당 키워드를 검색어로 채우고 검색 결과 상태로 전환합니다.
- [x] 검색창 Enter 또는 검색 제출 시 현재 검색어, 정렬값, 음식 장르값 기준으로 결과를 조회합니다.
- [x] 검색 제출에 성공하면 trim 처리한 검색어를 최근 검색어 목록에 저장합니다.
- [x] 정렬 필터 trigger는 현재 적용된 정렬 label을 보여줍니다.
- [x] 정렬 필터 기본값은 `기본순`입니다.
- [x] 음식 장르 필터 trigger는 현재 적용된 음식 장르 label을 보여줍니다.
- [x] 음식 장르 필터 기본값은 `전체`이며, 기본 상태에서는 trigger label을 `음식 장르 선택`으로 보여줍니다.
- [x] 필터 trigger 클릭 시 해당 바텀시트를 엽니다.
- [x] 바텀시트에서 옵션을 선택해도 즉시 결과에 반영하지 않고, `적용` 버튼 클릭 시에만 적용합니다.
- [x] 바텀시트의 `초기화` 버튼은 해당 필터를 기본값으로 적용하고 바텀시트를 닫습니다.
- [x] 화면에 노출되는 닫기 컨트롤은 바텀시트의 `X` 버튼입니다.
- [x] HDS `BottomSheet`의 기본 접근성 계약에 따라 overlay click과 Escape key 닫기는 허용합니다.
- [x] 식당 리스트에는 식당 사진, 식당명, 별점, 음식 종류 태그, 영업시간 영역을 보여줍니다.
- [x] 현재 식당 목록 API의 `summary`는 식당 소개 문구이므로 영업시간으로 매핑하지 않습니다.
- [x] 식당 목록 API의 `todayBusinessHour`를 시간 영역에 표시합니다.
- [x] `todayBusinessHour`가 없거나 영업시간 정보가 불완전하면 시간 영역에는 `영업시간 확인 필요`를 표시합니다.
- [x] 식당 이미지가 없거나 이미지 로드에 실패하면 임시 placeholder 대신 공통 `DefaultImage` fallback을 사용합니다.
- [x] 검색 결과가 없으면 결과 리스트 대신 empty state를 보여줍니다.
- [x] empty state에서도 검색어와 적용된 필터값은 유지합니다.
- [x] 좁은 viewport에서 긴 식당명은 최대 2줄까지 보여주고 카드 레이아웃을 깨지 않습니다.
- [x] 모든 버튼성 요소는 `button` 또는 접근 가능한 interactive element로 구현합니다.
- [x] 텍스트 없는 아이콘 버튼에는 `aria-label`을 제공합니다.

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
- Type generation note:
  - 현재 저장소 문서와 generated file header 기준 client API type generator는 `openapi-typescript`입니다.
  - `swagger-typescript-api`로 생성된 별도 산출물은 현재 저장소에서 확인되지 않습니다.

### API Integration Map

| UI area          | Endpoint                                                 | Params                                                               | Response data                                              | Query key                                                    | Mode       | Enabled                                 | States                                                 |
| ---------------- | -------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ---------- | --------------------------------------- | ------------------------------------------------------ |
| 검색 결과 리스트 | `GET /api/v1/restaurants`                                | `keyword`, `genre`, `foodCategory`, `sort`, `type`, `cursor`, `size` | `RestaurantListResponse.content`, `nextCursor`, `hasNext`  | `restaurantListQueryKeys.infiniteList(params)`               | `infinite` | trim 처리한 submitted keyword가 있을 때 | loading, next-page fetching, error, empty, success     |
| 추천 검색어      | `GET /api/v1/restaurants/search-keyword-recommendations` | optional `size`                                                      | `RestaurantSearchKeywordRecommendationResponse.keywords[]` | `searchRestaurantQueryKeys.keywordRecommendations({ size })` | `query`    | 검색 전 idle panel 렌더링 시            | loading, empty fallback, error local fallback, success |

### Endpoint Type Mapping

| Endpoint                                                 | Generated operation                             | Request type source                                                    | Response type source                                                     |
| -------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/v1/restaurants`                                | `operations['getRestaurants']`                  | `operations['getRestaurants']['parameters']['query']`                  | `components['schemas']['RestaurantListResponse']`                        |
| `GET /api/v1/restaurants/search-keyword-recommendations` | `operations['getSearchKeywordRecommendations']` | `operations['getSearchKeywordRecommendations']['parameters']['query']` | `components['schemas']['RestaurantSearchKeywordRecommendationResponse']` |

### Query Key Factory

- 식당 목록 query는 `features/restaurantList`의 공통 query key factory를 사용합니다.
- 추천 검색어 query는 page-local query key factory를 사용합니다.
- 위치:
  - `apps/client/src/features/restaurantList/queries/restaurantListQueryKeys.ts`
  - `apps/client/src/pages/search/queries/searchRestaurantQueryKeys.ts`
- key는 응답을 바꾸는 모든 params를 포함합니다.
- finite list와 infinite list는 key prefix를 분리합니다. 현재 검색 결과 화면은 infinite list key를 사용합니다.
- 추천 키워드는 검색 page-local query key factory 안에서 별도 prefix를 둡니다.

```ts
export const searchRestaurantQueryKeys = {
  all: ['searchRestaurants'] as const,
  keywordRecommendations: (params: SearchKeywordRecommendationsRequestParams) =>
    [
      ...searchRestaurantQueryKeys.all,
      'keywordRecommendations',
      params,
    ] as const,
}
```

### Endpoint Functions

- 위치:
  - `apps/client/src/features/restaurantList/api/getRestaurants.ts`
  - `apps/client/src/pages/search/api/getSearchKeywordRecommendations.ts`
- endpoint 함수는 `request`만 사용하고 React, TanStack Query, route, UI state를 import하지 않습니다.
- base URL, timeout, retry, HTTP error normalization은 `apps/client/src/shared/api`의 기존 설정을 사용합니다.
- response envelope는 `request<TData>()`가 벗겨낸 `data`를 반환합니다.
- `data`가 `null`이거나 optional response field가 누락될 수 있으므로 endpoint 또는 mapper에서 화면이 소비할 기본값을 정합니다.
- 검색 결과용 `RestaurantSummaryResponse` -> `SearchRestaurant` 변환은 page-local `apps/client/src/pages/search/utils/mapSearchRestaurant.ts`가 담당합니다.
- 검색 결과의 영업시간 영역은 `RestaurantSummaryResponse.todayBusinessHour`를 사용합니다.

### Query Hooks

- 검색 결과:
  - 현재 구현은 `useSearchRestaurantsInfiniteQuery`에서 `features/restaurantList`의 `restaurantsInfiniteQueryOptions`를 감싸 `GET /api/v1/restaurants`를 `useInfiniteQuery`로 호출합니다.
  - 첫 페이지는 `cursor` 없이 호출하고, 하단 sentinel이 노출되면 `nextCursor`를 API `cursor`로 보내 다음 페이지를 조회합니다.
  - `useSuspenseQuery`는 사용하지 않습니다. 검색어/필터 local state가 fetch 여부를 결정하고, 결과 영역만 local loading/error UI를 가져야 하기 때문입니다.
- 추천 검색어:
  - 현재 구현은 `useSearchKeywordRecommendationsQuery`에서 `GET /api/v1/restaurants/search-keyword-recommendations`를 `useQuery`로 호출합니다.
  - 검색 전 idle panel에서만 필요한 데이터이므로 검색 결과 화면에서는 query를 비활성화합니다.
  - 실패 시 page 전체를 ErrorBoundary로 올리지 않고 검색 전 추천 키워드 영역만 빈 상태로 유지합니다.

### Query

- query:
  - search restaurants query
- enabled condition:
  - 검색 전 상태에서는 식당 검색 query를 실행하지 않습니다.
  - 검색 제출 또는 최근/추천 검색어 탭 이후 조회합니다.
  - trim 처리한 검색어가 비어 있으면 조회하지 않고 검색 전 상태를 유지합니다.
  - 추천 검색어 query는 검색 전 idle panel에서만 실행합니다.
- request params:
  - UI `keyword` -> API `keyword`
  - UI 필터명은 음식 장르/foodCategory 계열 값이지만 현재 백엔드 스펙의 장르 필터는 `genre` 파라미터이므로 UI `category`를 API `genre`로 매핑합니다.
    - `all` -> `all`
    - `sushiSashimi` -> `sushi`
    - `noodle` -> `noodle`
    - `riceBowl` -> `rice-bowl`
    - `nabe` -> `nabe`
    - `fried` -> `fried`
    - `teppanGrill` -> `grill`
    - `etc` -> `etc`
  - UI `sort` -> API `sort`
  - `default` 정렬은 dev API에서 `RESTAURANT-002`를 반환하므로 API `sort`를 생략합니다.
  - `popular`, `rating` 정렬은 API `sort`에 그대로 보냅니다.
  - 검색 페이지는 API `type`을 보내지 않습니다.
  - API `size`는 프로젝트 목록 관습에 맞춰 `10`을 보냅니다.
  - API `cursor`는 첫 페이지에는 보내지 않고, 다음 페이지 조회 시 이전 응답의 `nextCursor`를 보냅니다.
- loading state:
  - 상단 검색/필터 영역은 유지합니다.
  - 결과 영역은 리스트 item 크기에 맞춘 skeleton을 보여줍니다.
  - infinite query 사용 시 다음 페이지 fetch loading은 기존 리스트를 유지하고 리스트 하단 pending 상태로 표시합니다.
- error state:
  - 상단 검색/필터 영역과 입력 상태는 유지합니다.
  - 결과 영역에 재시도 가능한 에러 안내를 표시합니다.
  - 예상 가능한 400/401 API error는 local error state에서 처리합니다.
  - 5xx, network, timeout, unexpected non-API error는 기본 query policy에 따라 retry 또는 ErrorBoundary throw 후보가 될 수 있지만, 검색 결과 영역 local error UI를 유지해야 하면 query option에서 `throwOnError: false`를 명시합니다.
- empty state:
  - empty icon과 `검색된 식당이 없습니다.` 문구를 중앙에 표시합니다.
- query update condition:
  - 검색 제출
  - 최근 검색어 탭
  - 추천 검색어 탭
  - 정렬 필터 적용
  - 음식 장르 필터 적용
  - 동일한 검색 파라미터를 다시 제출하면 TanStack Query cache 정책에 따라 새 요청을 강제하지 않을 수 있습니다.

### Mutation

- mutation:
  - 없음

### Local Persistence

- recent search keywords:
  - 저장 위치는 app-local storage helper 또는 page-local localStorage adapter로 시작합니다.
  - 서버 동기화, 계정별 최근 검색어, 삭제/전체 삭제 기능은 이번 설계 범위에 포함하지 않습니다.
  - 중복 키워드는 최신 검색 시점으로 이동합니다.
  - 최대 저장 개수는 화면에 노출할 수 있는 수보다 넉넉한 10개로 제한합니다.
  - `localStorage.getItem` 또는 `localStorage.setItem` 실패 시 검색 페이지 전체가 깨지지 않도록 메모리 상태만 유지합니다.

### Static Data

- recommended search keywords:
  - `GET /api/v1/restaurants/search-keyword-recommendations`로 조회합니다.
- search restaurant fixtures:
  - production query는 page-local mock data에 의존하지 않습니다.
  - 테스트에서는 endpoint 함수를 mock하고 필요한 fixture는 테스트 파일 내부에 둡니다.

### Missing API Questions

- `GET /api/v1/restaurants`
  - 현재 화면은 무한 스크롤로 `cursor`, `size`, `hasNext`, `nextCursor`를 사용합니다.
- `GET /api/v1/restaurants/search-keyword-recommendations`
  - 추천 키워드 `size` 기본값은 현재 client에서 `8`로 보냅니다. 서버/제품 기준이 다르면 조정합니다.

## User Flow

1. 사용자가 홈 화면 상단 검색 CTA를 클릭해 `/search`로 진입합니다.
2. 검색 페이지는 검색창에 focus를 주고 최근 검색어와 추천 검색어를 보여줍니다.
3. 사용자가 검색어를 입력해 제출하거나 최근/추천 검색어를 탭합니다.
4. 페이지는 검색 결과 상태로 전환하고 필터 바와 식당 결과 영역을 보여줍니다.
5. 사용자가 정렬 필터 또는 음식 장르 필터를 열어 옵션을 선택합니다.
6. 사용자가 `적용`을 누르면 선택한 필터값으로 결과를 다시 조회합니다.
7. 결과가 있으면 식당 리스트를 보여주고, 결과가 없으면 empty state를 보여줍니다.
8. 사용자가 뒤로가기 버튼을 누르면 이전 화면으로 돌아갑니다.

## State

- owner:
  - `SearchPage`는 UI composition만 담당합니다.
  - `useSearchPage`는 검색어 제출, 최근 검색어 저장, 필터 pending/apply/reset, 바텀시트 open state, navigation, query orchestration을 담당합니다.
- local state:
  - search input value
  - sort bottom sheet open state
  - food category bottom sheet open state
  - pending sort value
  - pending food category value
  - has submitted search state
  - recent search keywords
- form state:
  - 검색창 단일 입력값
- URL state:
  - 기본 구현에서는 URL query string 동기화를 하지 않습니다.
  - 공유 가능한 검색 URL이 필요해지면 `keyword`, `sort`, `category`를 search params로 승격합니다.
- server state:
  - 검색 결과 식당 목록
  - loading / error / empty state
- derived state:
  - search idle state 여부
  - applied sort label
  - applied food category label
  - empty state 여부

## Filter Options

### Sort

| value     | label    | default |
| --------- | -------- | ------- |
| `default` | `기본순` | yes     |
| `popular` | `인기순` | no      |
| `rating`  | `별점순` | no      |

### Food Category

| value          | label           | default |
| -------------- | --------------- | ------- |
| `all`          | `전체`          | yes     |
| `sushiSashimi` | `스시/사시미류` | no      |
| `noodle`       | `면류`          | no      |
| `riceBowl`     | `덮밥류`        | no      |
| `nabe`         | `나베/냄비류`   | no      |
| `fried`        | `튀김류`        | no      |
| `teppanGrill`  | `철판/구이류`   | no      |
| `etc`          | `기타`          | no      |

## Validation

- field: search keyword
  - rule:
    - 검색 제출 시 앞뒤 공백을 제거합니다.
    - 최소 글자 수 제한은 이번 설계 범위에서 두지 않습니다.
  - error message:
    - 없음
- submit enabled condition:
  - 검색창이 활성화되어 있으면 제출할 수 있습니다.

## UI Structure

```text
SearchPage
  useSearchPage
  SearchHeader
    BackButton
    SearchField
  SearchIdlePanel
    RecentSearchKeywordSection
      KeywordChipList
    RecommendedSearchKeywordSection
      KeywordChipList
  SearchFilterBar
    SortFilterTrigger
    FoodCategoryFilterTrigger
  SearchResultArea
    RestaurantResultList
      RestaurantResultItem
    SearchEmptyState
    SearchErrorState
  FilterBottomSheet(sort)
  FilterBottomSheet(foodCategory)
```

## Component Mapping

- HDS component:
  - `SearchField`: 검색 input primitive
  - `IconButton`: 뒤로가기 icon-only button
  - `Chip`: 최근 검색어와 추천 검색어 keyword pill
  - `Button`: 바텀시트 footer의 `초기화`, `적용`
  - `BottomSheet`: 필터 바텀시트 shell
- app shared component:
  - `FilterBottomSheet`: 정렬/음식 장르 단일 선택 바텀시트 조합
- page-local component:
  - `SearchHeader`
  - `SearchIdlePanel`
  - `KeywordChipList`
  - `SearchFilterBar`
  - `RestaurantResultList`
  - `RestaurantResultItem`
  - `SearchEmptyState`
  - `SearchErrorState`
- page-local hook:
  - `useSearchPage`
  - `useRecentSearchKeywords`
- icon:
  - `BackIcon`
  - `TapDownIcon`: 설계서의 `ic_chevron_down`에 해당하는 기존 HDS 아이콘
  - `CheckIcon`
  - `SearchIcon`은 `SearchField` 내부에서 사용
  - `StarFillIcon`: 결과 리스트의 단일 별점 아이콘
  - `ClockSmallIcon`
  - empty state 이미지는 `apps/client/src/pages/search/assets/search-empty.svg` page-local asset을 사용합니다. 기존 `apps/client/src/shared/assets/images/empty.webp`는 bowl 이미지라 첨부 설계의 행거 아이콘과 맞지 않습니다.

## Reuse Audit

- `SearchField`를 사용합니다. 검색 실행, 최근 검색어, 추천 검색어, query 동기화는 HDS 범위가 아니므로 page가 소유합니다.
- `IconButton size="xs"`와 `BackIcon`을 조합해 뒤로가기 버튼을 구현합니다. 호출부에서 `44px` 터치 영역을 확보하고 아이콘은 `24px`로 유지합니다.
- `Chip`을 최근 검색어와 추천 검색어 pill에 사용합니다. 칩 목록의 horizontal scroll과 키워드 선택 동작은 page-local `KeywordChipList`가 소유합니다.
- `FilterBottomSheet`를 정렬/음식 장르 필터에 사용합니다. 옵션 목록, pending 값, 초기화/적용 동작은 `useSearchPage`가 주입합니다.
- 검색/필터/바텀시트 상태와 이동 로직은 `SearchPage`에 직접 두지 않고 `useSearchPage`가 주입합니다.
- API 연동된 검색 식당 데이터와 추천 검색어는 page-local mock data에 의존하지 않습니다.
- `BottomSheet`를 직접 새로 만들지 않습니다. overlay click과 Escape close는 기존 `BottomSheet`의 접근성 계약을 따릅니다.
- `Button`을 바텀시트 footer 액션에 사용합니다.
- `Header`는 사용하지 않습니다. HDS `Header` spec에서 `bar_search_back_button`은 `IconButton` + `SearchField` 조합으로 분류되어 `Header` v1 범위에서 제외되어 있습니다.
- `StarRating`은 사용하지 않습니다. 검색 결과 리스트 디자인은 5개 별 묶음이 아니라 단일 별 아이콘 + 숫자 텍스트이므로 `StarFillIcon`과 텍스트 조합이 더 정확합니다.
- `Badge`는 사용하지 않습니다. 음식 종류는 pill/badge가 아니라 `# 아끼소바` 형태의 텍스트 태그로 보이므로 page-local 텍스트로 구현합니다.
- 기존 `empty.webp`는 사용하지 않습니다. 검색 결과 없음 화면의 행거 아이콘과 시각 의미가 달라 page-local `search-empty.svg` asset을 사용합니다.
- `BottomNavigation`은 사용하지 않습니다. `/search`는 하단 네비게이션 대상 route가 아닙니다.

## Implementation File Plan

### Existing Files To Reuse

- `apps/client/src/pages/search/SearchPage.tsx`
  - page composition을 담당합니다.
- `apps/client/src/pages/search/index.ts`
  - 기존 page export를 유지합니다.
- `apps/client/src/shared/components/filterBottomSheet/FilterBottomSheet.tsx`
  - 정렬/음식 장르 바텀시트에 재사용합니다.
- `apps/client/src/shared/api/request.ts`
  - 실제 검색 API endpoint 함수는 이 request helper를 통해 호출합니다.
- `apps/client/src/shared/lib/queryClient.ts`
  - 검색 query는 기존 TanStack Query provider/client 정책을 따릅니다.

### Page-Local Files To Keep

- `apps/client/src/pages/search/components/SearchHeader.tsx`
  - 뒤로가기 `IconButton`과 `SearchField`를 조합합니다.
- `apps/client/src/pages/search/components/SearchIdlePanel.tsx`
  - 검색 전 최근 검색어와 추천 검색어 영역을 조립합니다.
- `apps/client/src/pages/search/components/KeywordChipList.tsx`
  - `Chip` 목록의 horizontal scroll과 keyword 선택 이벤트만 담당합니다.
- `apps/client/src/pages/search/components/SearchFilterBar.tsx`
  - 정렬/음식 장르 filter trigger 버튼을 렌더링합니다.
- `apps/client/src/pages/search/components/RestaurantResultList.tsx`
  - 검색 결과 목록 layout을 담당합니다.
- `apps/client/src/pages/search/components/RestaurantResultItem.tsx`
  - 식당 사진, 식당명, 단일 별점 아이콘, 음식 종류 태그, 영업시간 표시를 담당합니다.
- `apps/client/src/pages/search/components/SearchEmptyState.tsx`
  - 검색 결과 없음 icon과 문구를 렌더링합니다.
- `apps/client/src/pages/search/components/SearchErrorState.tsx`
  - 검색 결과 API error 문구와 재시도 액션을 렌더링합니다.
- `apps/client/src/pages/search/components/SearchResultSkeleton.tsx`
  - 식당 결과 item 크기에 맞춘 loading skeleton을 렌더링합니다.
- `apps/client/src/pages/search/assets/search-empty.svg`
  - 첨부 설계의 행거 형태 empty image asset입니다.
- `apps/client/src/pages/search/hooks/useRecentSearchKeywords.ts`
  - localStorage 기반 최근 검색어 읽기/저장/중복 이동/최대 10개 제한을 담당합니다.
- `apps/client/src/pages/search/hooks/useSearchPage.ts`
  - 검색 page의 route-level orchestration, navigation, filter state, query params, 추천 키워드 query 주입을 담당합니다.
- `apps/client/src/pages/search/constants/searchFilters.ts`
  - 정렬 옵션, 음식 장르 옵션을 둡니다.
- `apps/client/src/pages/search/types.ts`
  - page-local search option value, restaurant result item type을 둡니다.

### Shared Feature API Files To Reuse

- `apps/client/src/features/restaurantList/api/getRestaurants.ts`
  - `GET /api/v1/restaurants` endpoint 함수와 nullable list response 기본값 mapping을 담당합니다.
- `apps/client/src/features/restaurantList/queries/restaurantListQueryKeys.ts`
  - 식당 목록 list/infinite list query key factory를 담당합니다.
- `apps/client/src/features/restaurantList/queries/useRestaurantsInfiniteQuery.ts`
  - 식당 목록 infinite query option/hook, cursor pagination 처리를 담당합니다.

### Page-Local API Files To Add Or Rename

- `apps/client/src/pages/search/api/getSearchKeywordRecommendations.ts`
  - `GET /api/v1/restaurants/search-keyword-recommendations` endpoint 함수와 keywords 기본값 mapping을 담당합니다.
- `apps/client/src/pages/search/queries/searchRestaurantQueryKeys.ts`
  - 추천 키워드 query key factory를 담당합니다.
- `apps/client/src/pages/search/queries/useSearchRestaurantsInfiniteQuery.ts`
  - 검색 화면의 필터 값을 공통 식당 목록 API params로 변환하고, local error policy를 적용합니다.
- `apps/client/src/pages/search/queries/useSearchKeywordRecommendationsQuery.ts`
  - 추천 검색어 query option/hook을 담당합니다.
- `apps/client/src/pages/search/utils/mapSearchRestaurant.ts`
  - 공통 식당 목록 응답의 `RestaurantSummaryResponse`를 검색 결과 item view model로 변환합니다.
  - 상세 이동에 필요한 `restaurantId`가 없으면 잘못된 `/restaurants/:restaurantId` 경로를 만들지 않도록 해당 항목을 검색 결과에서 제외합니다.

### Optional Page-Local Files

- `apps/client/src/pages/search/utils/searchRestaurantParams.ts`
  - sort/genre/type mapping이 길어지면 pure helper로 분리합니다.

### Files Not To Add

- 새 HDS component는 추가하지 않습니다.
- 새 HDS icon은 추가하지 않습니다.
- 검색 전용 app shared component는 추가하지 않습니다. 이미지 로드 실패 fallback은 기존 shared `DefaultImage` 계열의 `ImageWithDefaultFallback`을 사용합니다.
- 검색 결과 식당 카드가 다른 페이지에서도 반복된다는 근거가 생기기 전까지 `shared/components`로 승격하지 않습니다.
- `Header`, `StarRating`, `Badge`, `BottomNavigation`을 검색 페이지 요구사항에 맞추기 위해 수정하지 않습니다.

## Error Handling

- API error:
  - 검색/필터 상태는 유지하고 결과 영역에 에러 안내와 재시도 액션을 표시합니다.
  - 검색 결과 query는 local error UI가 필요하므로 `throwOnError: false`를 명시합니다.
  - 추천 검색어 query도 route-level ErrorBoundary보다 local fallback을 우선합니다.
  - retry는 `queryClient` 기본 정책을 따릅니다. 5xx, network, timeout만 최대 1회 retry합니다.
  - `ApiError`의 `status`, `code`, `fieldErrors`를 사용할 수 있지만, 검색 페이지는 현재 field-level error를 표시하지 않습니다.
  - malformed body, proxy HTML, empty non-OK response는 `HttpStatusError`로 보존됩니다.
- validation error:
  - 이번 범위에서는 검색어 validation error를 노출하지 않습니다.
- exceptional case:
  - 식당 이미지가 없거나 이미지 로드에 실패하면 공통 `DefaultImage` fallback을 사용합니다.
  - API `summary`는 식당 소개 문구이므로 영업시간으로 사용하지 않습니다.
  - `todayBusinessHour`가 없거나 영업시간 정보가 불완전하면 `영업시간 확인 필요`를 표시합니다.
  - 별점, 태그가 없을 때 숨김 또는 대체 문구는 추가 확인 후 구현합니다.
- user-facing message:
  - empty: `검색된 식당이 없습니다.`
  - API error: `검색 결과를 불러오지 못했습니다.`
- retry or fallback:
  - API error state에서 재시도 버튼 또는 검색 재제출로 refetch합니다.
  - 추천 검색어 API error는 검색 전 영역에서 빈 목록 fallback으로 처리합니다.

## Navigation

- entry:
  - 홈 화면 상단 검색 CTA
  - `/search` 직접 진입
- links:
  - 식당 리스트 item 클릭 시 `ROUTES.restaurantDetail`에 해당하는 `/restaurants/:restaurantId`로 이동합니다.
  - `restaurantId`는 URL path segment로 들어가므로 `encodeURIComponent`로 인코딩합니다.
- route params:
  - 없음
- search params:
  - 없음
- success redirect:
  - 없음
- failure redirect:
  - 없음
- back behavior:
  - 앱 내부 route 전환으로 진입한 검색 페이지에서는 이전 화면으로 이동합니다.
  - 주소창 직접 입력, 외부 링크, 세션 복원처럼 앱 내부 route 전환이 아닌 직접 진입에서는 `ROUTES.home`으로 이동합니다.
- auth redirect:
  - 없음

## Styling

- Tailwind layout:
  - 모바일 우선 단일 컬럼 layout
  - page max width는 기존 앱 layout 기준을 따릅니다.
- page horizontal padding:
  - 기본 좌우 여백은 `20px`입니다.
- responsive:
  - 첨부 설계는 모바일 viewport 기준입니다.
  - 넓은 viewport에서는 콘텐츠 폭을 모바일 기준으로 제한하거나 기존 RootLayout 정책을 따릅니다.
- fixed area:
  - 검색창을 포함한 상단 검색 영역은 항상 고정합니다.
  - 검색 결과 상태에서는 filter bar도 같은 `app-mobile-fixed-top z-fixed bg-white` 영역에 포함해 스크롤 중 결과 리스트보다 위에 표시합니다.
  - 검색 전 본문은 `pt-[83px]`, 검색 결과 본문은 filter bar 높이까지 반영해 `pt-[122px]`로 보정합니다.
- search header:
  - top padding은 `30px`입니다.
  - bottom padding은 `9px`입니다.
  - 뒤로가기 아이콘은 `24px`입니다.
  - 뒤로가기 버튼 터치 영역은 `44px * 44px`입니다.
  - 뒤로가기 버튼과 `SearchField` 사이 간격은 `10px`입니다.
- filter bar:
  - filter trigger는 page-local component로 조합합니다.
  - `SearchField`와 filter section 사이 간격은 fixed search header의 bottom padding `9px`로 확보합니다.
  - 검색 결과 상태에서 fixed search header 아래에 렌더링합니다.
  - filter section 내부 vertical padding은 `9px`입니다.
  - trigger text는 `typo-sub-header-3 text-primary-200`입니다.
  - text와 chevron icon 사이 간격은 `12px`입니다.
  - chevron icon은 `TapDownIcon text-black`을 사용합니다.
  - filter trigger 사이 간격은 `12px`입니다.
- search result item:
  - list item 사이 간격은 `30px`입니다.
  - 결과 리스트 하단 padding은 `30px`입니다.
  - 식당 이미지는 `92px * 92px`, radius `5px`입니다.
  - 식당 이미지가 없거나 이미지 로드에 실패하면 `DefaultImage`를 같은 크기와 radius로 렌더링합니다.
  - 이미지와 내용 사이 간격은 `12px`입니다.
  - 오른쪽 내용 영역은 이미지 높이 기준 vertical center로 정렬합니다.
  - title은 `typo-sub-header-2 text-cool-gray-900`이며 최대 2줄입니다.
  - title과 별점 row 사이 간격은 `8px`입니다.
  - 별점 icon은 `StarFillIcon text-primary-400`, 별점 text는 `typo-body-4 text-black`입니다.
  - 별점 text와 태그 사이 간격은 `4px`입니다.
  - 태그는 `typo-body-6 text-point-300`이며 `# 아끼소바`처럼 `#` 뒤에 공백을 둡니다.
  - 별점 row와 시간 row 사이 간격은 `2px`입니다.
  - 시간 icon은 `ClockSmallIcon 16px`, icon과 text 사이 간격은 `6px`입니다.
  - 시간 text는 `typo-body-7 text-primary-200`입니다.
- empty state:
  - 고정 `min-height`를 사용하지 않고 결과 영역의 남은 높이 안에서 중앙 정렬합니다.
  - empty icon은 `48px * 28px`, `text-warm-gray-300`입니다.
  - empty text는 `typo-body-2 text-warm-gray-300`입니다.
- bottom sheet:
  - title은 `typo-sub-header-2 text-black`입니다.
  - close icon은 HDS `BottomSheet` 기본 `CancelIcon`, `24px`를 사용합니다.
  - option item 내부 vertical padding은 `10px`입니다.
  - option item 사이 간격은 `5px`입니다.
  - 마지막 option item과 footer button 사이 간격은 `20px`입니다.
  - selected option text는 `typo-body-3 text-black`입니다.
  - unselected option text는 `typo-body-4 text-black`입니다.
  - selected option check icon은 `CheckIcon text-cool-gray-700`, `20px`입니다.
- search idle state:
  - `SearchField`와 검색어 section title 사이 총 간격은 `30px`입니다.
  - fixed search header의 bottom padding `9px`를 제외한 idle panel top padding은 `21px`입니다.
  - 최근 검색어/추천 검색어 title은 `typo-sub-header-3 text-primary-200`입니다.
  - title과 chip 사이 간격은 `16px`입니다.
  - chip은 HDS `Chip`을 사용하고, 배경은 `warm-gray-50` (`#EFEFEF`), radius는 `100px`, text는 `typo-body-7 text-black`, padding은 vertical `8px` / horizontal `12px`입니다.
  - chip 목록은 길어질 경우 horizontal scroll을 허용하며 시작 padding은 `20px`, chip 사이 간격은 `8px`입니다.
  - chip 목록의 scrollbar는 노출하지 않습니다.
  - 최근 검색어 section과 추천 검색어 section 사이 간격은 `38px`입니다.
- scroll area:
  - 검색 전 최근/추천 검색어 영역과 검색 후 식당 리스트/상태 영역은 상단 고정 영역 아래에서 스크롤됩니다.
- keyboard:
  - 검색창 focus로 키보드가 올라오면 검색 전 영역은 남은 viewport 안에서 자연스럽게 보이고, keyboard height를 코드에서 직접 계산하지 않습니다.
- empty/loading/error layout:
  - 상단 고정 영역은 유지합니다.
  - empty state는 결과 영역 중앙에 배치합니다.
  - 바텀시트 open 시 배경 overlay로 본문을 dim 처리하고 `html`/`body` 배경 스크롤을 lock합니다.

## Verification

- [x] `corepack pnpm format:check`
- [x] `git diff --check`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client test`
- [x] `corepack pnpm --filter @hashi/client build`
- [ ] `/search` 직접 진입 확인
- [ ] 홈 검색 CTA에서 `/search` 진입 확인
- [ ] 뒤로가기 동작 확인
- [ ] 검색창 focus 시 키보드 노출 확인
- [ ] 검색 전 최근 검색어 / 추천 검색어 노출 확인
- [ ] 최근 검색어 탭 시 해당 키워드로 검색 결과 상태 전환 확인
- [ ] 추천 검색어 탭 시 해당 키워드로 검색 결과 상태 전환 확인
- [ ] 검색 제출 시 `GET /api/v1/restaurants` request params 확인
- [ ] 검색 전 idle panel에서 `GET /api/v1/restaurants/search-keyword-recommendations` request params 확인
- [ ] 정렬 필터 open / 선택 / 초기화 / 적용 / close 확인
- [ ] 음식 장르 필터 open / 선택 / 초기화 / 적용 / close 확인
- [ ] loading / background fetching / empty / local error / success 상태 확인
- [ ] 400 API error가 route ErrorBoundary로 올라가지 않고 결과 영역 error UI에 남는지 확인
- [ ] 5xx, network, timeout retry 정책이 `queryClient` 기본값 또는 query override와 일치하는지 확인
- [ ] API `data: null`, `content` 누락, `keywords` 누락 시 화면이 깨지지 않는지 확인
- [ ] bottom navigation이 표시되지 않는지 확인
