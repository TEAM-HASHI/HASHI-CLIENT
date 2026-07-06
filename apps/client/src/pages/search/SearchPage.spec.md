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

- [ ] 상단 영역은 페이지 내 스크롤과 무관하게 고정합니다.
- [ ] 상단 영역은 뒤로가기 버튼과 검색창을 같은 행에 배치합니다.
- [ ] 뒤로가기 버튼을 누르면 이전 화면으로 돌아갑니다.
- [ ] 검색창 placeholder는 `식당 혹은 메뉴를 검색해보세요`를 사용합니다.
- [ ] 홈 검색 CTA에서 진입하면 검색창에 자동 focus를 주어 키보드가 노출됩니다.
- [ ] `/search` 직접 진입 시에도 검색창에 focus를 줄 수 있지만, 브라우저/OS 정책으로 자동 키보드 노출이 제한될 수 있음을 허용합니다.
- [ ] 검색 전에는 식당 리스트와 필터 바 대신 최근 검색어와 추천 검색어 영역을 보여줍니다.
- [ ] 최근 검색어가 있으면 최근 검색어 영역은 사용자가 최근에 검색한 키워드를 보여줍니다.
- [ ] 최근 검색어를 탭하면 해당 키워드를 검색어로 채우고 검색 결과 상태로 전환합니다.
- [ ] 추천 검색어 영역은 운영팀이 지정한 키워드 또는 제품이 제공하는 추천 키워드를 보여줍니다.
- [ ] 추천 검색어를 탭하면 해당 키워드를 검색어로 채우고 검색 결과 상태로 전환합니다.
- [ ] 검색창 Enter 또는 검색 제출 시 현재 검색어, 정렬값, 음식 장르값 기준으로 결과를 조회합니다.
- [ ] 검색 제출에 성공하면 trim 처리한 검색어를 최근 검색어 목록에 저장합니다.
- [ ] 정렬 필터 trigger는 현재 적용된 정렬 label을 보여줍니다.
- [ ] 정렬 필터 기본값은 `기본순`입니다.
- [ ] 음식 장르 필터 trigger는 현재 적용된 음식 장르 label을 보여줍니다.
- [ ] 음식 장르 필터 기본값은 `전체`이며, 기본 상태에서는 trigger label을 `음식 장르 선택`으로 보여줍니다.
- [ ] 필터 trigger 클릭 시 해당 바텀시트를 엽니다.
- [ ] 바텀시트에서 옵션을 선택해도 즉시 결과에 반영하지 않고, `적용` 버튼 클릭 시에만 적용합니다.
- [ ] 바텀시트의 `초기화` 버튼은 해당 필터를 기본값으로 적용하고 바텀시트를 닫습니다.
- [ ] 화면에 노출되는 닫기 컨트롤은 바텀시트의 `X` 버튼입니다.
- [ ] HDS `BottomSheet`의 기본 접근성 계약에 따라 overlay click과 Escape key 닫기는 허용합니다.
- [ ] 식당 리스트에는 식당 사진, 식당명, 별점, 음식 종류 태그, 당일 영업시간을 보여줍니다.
- [ ] 검색 결과가 없으면 결과 리스트 대신 empty state를 보여줍니다.
- [ ] empty state에서도 검색어와 적용된 필터값은 유지합니다.
- [ ] 좁은 viewport에서 긴 식당명은 최대 2줄까지 보여주고 카드 레이아웃을 깨지 않습니다.
- [ ] 모든 버튼성 요소는 `button` 또는 접근 가능한 interactive element로 구현합니다.
- [ ] 텍스트 없는 아이콘 버튼에는 `aria-label`을 제공합니다.

## Data Dependencies

### Query

- query:
  - search restaurants query
- enabled condition:
  - 검색 전 상태에서는 식당 검색 query를 실행하지 않습니다.
  - 검색 제출 또는 최근/추천 검색어 탭 이후 조회합니다.
  - trim 처리한 검색어가 비어 있으면 조회하지 않고 검색 전 상태를 유지합니다.
- request params:
  - `keyword`: trim 처리한 검색어
  - `sort`: `default` | `popular` | `rating`
  - `category`: `all` | `sushiSashimi` | `noodle` | `riceBowl` | `nabe` | `fried` | `teppanGrill` | `etc`
- loading state:
  - 상단 검색/필터 영역은 유지합니다.
  - 결과 영역은 리스트 item 크기에 맞춘 skeleton을 보여줍니다.
- error state:
  - 상단 검색/필터 영역과 입력 상태는 유지합니다.
  - 결과 영역에 재시도 가능한 에러 안내를 표시합니다.
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

### Static Data

- recommended search keywords:
  - 초기 구현은 `mocks/searchContent.mock.ts`의 page-local mock content로 시작합니다.
  - 운영 도구나 API가 생기면 `useSearchPage` 내부에서 query로 교체합니다.
- search restaurant fixtures:
  - 초기 구현은 `mocks/searchRestaurants.mock.ts`의 page-local mock data로 시작합니다.
  - API endpoint가 확정되면 `api/searchRestaurants.ts`에서 실제 request로 교체합니다.

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
  - `useSearchRestaurantsQuery`
- page-local mock:
  - `mocks/searchContent.mock.ts`
  - `mocks/searchRestaurants.mock.ts`
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
- `IconButton size="xs"`와 `BackIcon`을 조합해 뒤로가기 버튼을 구현합니다.
- `Chip`을 최근 검색어와 추천 검색어 pill에 사용합니다. 칩 목록의 horizontal scroll과 키워드 선택 동작은 page-local `KeywordChipList`가 소유합니다.
- `FilterBottomSheet`를 정렬/음식 장르 필터에 사용합니다. 옵션 목록, pending 값, 초기화/적용 동작은 `useSearchPage`가 주입합니다.
- 검색/필터/바텀시트 상태와 이동 로직은 `SearchPage`에 직접 두지 않고 `useSearchPage`가 주입합니다.
- API 연동 전 임시 식당 데이터와 추천 검색어는 `mocks/`에 둡니다. 필터 option constant와 mock data를 섞지 않습니다.
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
  - 실제 검색 API endpoint 함수가 필요해지면 이 request helper를 통해 호출합니다.
- `apps/client/src/shared/lib/queryClient.ts`
  - 검색 query는 기존 TanStack Query provider/client 정책을 따릅니다.

### Page-Local Files To Add

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
  - 검색 page의 route-level orchestration, navigation, filter state, query params, mock content 주입을 담당합니다.
- `apps/client/src/pages/search/hooks/useSearchRestaurantsQuery.ts`
  - 검색 결과 query key, enabled 조건, request params mapping을 담당합니다.
- `apps/client/src/pages/search/api/searchRestaurants.ts`
  - 검색 API endpoint 함수와 response mapping을 담당합니다.
- `apps/client/src/pages/search/constants/searchFilters.ts`
  - 정렬 옵션, 음식 장르 옵션을 둡니다.
- `apps/client/src/pages/search/mocks/searchContent.mock.ts`
  - API 연동 전 추천 검색어 mock content를 둡니다.
- `apps/client/src/pages/search/mocks/searchRestaurants.mock.ts`
  - API 연동 전 검색 결과 mock data를 둡니다.
- `apps/client/src/pages/search/types.ts`
  - page-local search option value, restaurant result item type을 둡니다.

### Optional Page-Local Files

- `apps/client/src/pages/search/components/RestaurantImageFallback.tsx`
  - API 결과에 이미지가 없을 때 빈 이미지 영역이 필요하면 추가합니다.
  - 단순 회색 placeholder로 충분하면 별도 파일 없이 `RestaurantResultItem` 내부 Tailwind로 처리합니다.

### Files Not To Add

- 새 HDS component는 추가하지 않습니다.
- 새 HDS icon은 추가하지 않습니다.
- 새 app shared component는 추가하지 않습니다.
- 검색 결과 식당 카드가 다른 페이지에서도 반복된다는 근거가 생기기 전까지 `shared/components`로 승격하지 않습니다.
- `Header`, `StarRating`, `Badge`, `BottomNavigation`을 검색 페이지 요구사항에 맞추기 위해 수정하지 않습니다.

## Error Handling

- API error:
  - 검색/필터 상태는 유지하고 결과 영역에 에러 안내와 재시도 액션을 표시합니다.
- validation error:
  - 이번 범위에서는 검색어 validation error를 노출하지 않습니다.
- exceptional case:
  - 식당 이미지가 없으면 fallback image 또는 placeholder 영역을 사용합니다.
  - 별점 또는 영업시간이 없으면 API/제품 정책에 따라 숨김 또는 대체 문구를 선택합니다.
- user-facing message:
  - empty: `검색된 식당이 없습니다.`
  - API error: `검색 결과를 불러오지 못했습니다.`
- retry or fallback:
  - API error state에서 재시도 버튼 또는 검색 재제출로 refetch합니다.

## Navigation

- entry:
  - 홈 화면 상단 검색 CTA
  - `/search` 직접 진입
- links:
  - 식당 리스트 item 클릭 시 `ROUTES.restaurantDetail`에 해당하는 `/restaurants/:restaurantId`로 이동합니다.
- route params:
  - 없음
- search params:
  - 없음
- success redirect:
  - 없음
- failure redirect:
  - 없음
- back behavior:
  - history stack이 있으면 이전 화면으로 이동합니다.
  - 직접 진입 등 이전 화면이 없으면 `ROUTES.home`으로 이동합니다.
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
  - 검색창과 필터 영역을 포함한 상단 영역은 고정합니다.
- search header:
  - top padding은 `30px`입니다.
  - 뒤로가기 아이콘은 `24px`입니다.
  - 뒤로가기 버튼과 `SearchField` 사이 간격은 `10px`입니다.
- filter bar:
  - filter trigger는 page-local component로 조합합니다.
  - `SearchField`와 filter section 사이 간격은 `9px`입니다.
  - filter section 내부 vertical padding은 `9px`입니다.
  - trigger text는 `typo-sub-header-3 text-primary-200`입니다.
  - text와 chevron icon 사이 간격은 `12px`입니다.
  - chevron icon은 `TapDownIcon text-black`을 사용합니다.
  - filter trigger 사이 간격은 `12px`입니다.
- search result item:
  - list item 사이 간격은 `30px`입니다.
  - 식당 이미지는 `92px * 92px`, radius `5px`입니다.
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
  - `SearchField`와 검색어 section title 사이 간격은 `30px`입니다.
  - 최근 검색어/추천 검색어 title은 `typo-sub-header-3 text-primary-200`입니다.
  - title과 chip 사이 간격은 `16px`입니다.
  - chip은 HDS `Chip`을 사용하고, 배경은 `warm-gray-50` (`#EFEFEF`), radius는 `100px`, text는 `typo-body-7 text-black`, padding은 vertical `8px` / horizontal `12px`입니다.
  - chip 목록은 길어질 경우 horizontal scroll을 허용하며 시작 padding은 `20px`입니다.
  - 최근 검색어 section과 추천 검색어 section 사이 간격은 `38px`입니다.
- scroll area:
  - 검색 전 최근/추천 검색어 영역과 검색 후 식당 리스트/상태 영역은 상단 고정 영역 아래에서 스크롤됩니다.
- keyboard:
  - 검색창 focus로 키보드가 올라오면 검색 전 영역은 남은 viewport 안에서 자연스럽게 보이고, keyboard height를 코드에서 직접 계산하지 않습니다.
- empty/loading/error layout:
  - 상단 고정 영역은 유지합니다.
  - empty state는 결과 영역 중앙에 배치합니다.
  - 바텀시트 open 시 배경 overlay로 본문을 dim 처리합니다.

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `corepack pnpm --filter @hashi/client lint`
- [ ] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] `corepack pnpm --filter @hashi/client test`
- [ ] `/search` 직접 진입 확인
- [ ] 홈 검색 CTA에서 `/search` 진입 확인
- [ ] 뒤로가기 동작 확인
- [ ] 검색창 focus 시 키보드 노출 확인
- [ ] 검색 전 최근 검색어 / 추천 검색어 노출 확인
- [ ] 최근 검색어 탭 시 해당 키워드로 검색 결과 상태 전환 확인
- [ ] 추천 검색어 탭 시 해당 키워드로 검색 결과 상태 전환 확인
- [ ] 검색 제출 시 request params 확인
- [ ] 정렬 필터 open / 선택 / 초기화 / 적용 / close 확인
- [ ] 음식 장르 필터 open / 선택 / 초기화 / 적용 / close 확인
- [ ] loading / empty / error / success 상태 확인
- [ ] bottom navigation이 표시되지 않는지 확인
