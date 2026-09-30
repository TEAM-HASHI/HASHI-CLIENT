# Page Spec: `RestaurantDetailPage`

## Purpose

- 사용자가 특정 식당의 매장 정보, 메뉴, 사진, 리뷰를 확인하고 예약할 수 있는 모바일 웹 식당 상세 페이지입니다.

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
- [ ] 매장 정보, 메뉴, 사진, 리뷰 탭을 같은 페이지 상태로 전환합니다.
- [ ] 사진 탭은 같은 상세 템플릿 안에서 전환하며, 일반 식당과 오늘의 식당 모두 아래 Photo Policy의 공통 기준을 따릅니다.
- [ ] 사진 UI와 count는 개발·테스트 환경에서 목데이터로 구현하며, 데이터 공급 부분을 분리해 실제 API 연결은 후속 작업으로 둡니다. 운영 빌드에는 목데이터를 연결하지 않고 기존 빈 상태를 유지하며 확인되지 않은 count를 표시하지 않습니다.
- [ ] 사진 필터 칩에는 각 분류의 공개 사진 수를 표시하고, 상단 `사진 N`은 선택한 필터와 무관한 해당 식당의 전체 공개 사진 수를 표시합니다.
- [ ] 매장 정보 탭의 `오시는 길` 지도 영역은 지도 연동 전까지 HDS `ImageFallback`으로 규격만 확보하고, 화면 내 별도 안내 문구 없이 접근성 라벨로 placeholder임을 식별합니다.
- [ ] 탭바는 Header 아래에 sticky로 고정됩니다.
- [ ] 메뉴/사진/리뷰 탭 선택 시 탭바가 Header 바로 아래에 붙은 위치로 부드럽게 스크롤되어 해당 탭 콘텐츠를 초기 화면처럼 보여줍니다.
- [ ] 매장 정보 탭 선택 시 페이지 최상단으로 부드럽게 스크롤됩니다.
- [ ] 탭 선택 시 active underline은 선택된 탭으로 부드럽게 이동합니다.
- [ ] 하단 fixed bar에는 36px `SaveBlankIcon` 북마크와 저장 수, `예약하기`가 표시됩니다. 북마크 버튼의 접근성 이름은 `저장하기`입니다.
- [ ] 저장 API 연동은 후속 작업입니다. 기존 임시 건수 `0`을 유지하며, 로그인 사용자가 저장하기를 누르면 준비중 모달을 표시합니다.
- [ ] 식당 상세 페이지에는 `다시 추천 받기` 버튼이 없습니다.
- [ ] 메뉴 카드 클릭 시 `ROUTES.restaurantMenuDetail`로 이동합니다.
- [ ] 공유 클릭 시 `ROUTES.restaurantDetail` 기준 식당 상세 링크를 현재 origin 기준 absolute URL로 클립보드에 복사하고 복사 성공 Toast를 표시합니다.
- [ ] 식당명 복사 클릭 시 현재 표시 중인 한국어 식당명을 클립보드에 복사하고, 복사 아이콘과 `식당명이 복사되었어요` Toast를 표시합니다.
- [ ] 비로그인 사용자가 예약하기 또는 저장하기를 누르면 로그인 유도 바텀시트를 표시합니다.
- [ ] 로그인 사용자가 예약하기를 누르면 `ROUTES.restaurantReservationNew`로 이동합니다.
- [ ] 리뷰 작성 CTA 클릭 시 비방문자 안내 모달을 열 수 있습니다.
- [ ] 리뷰 이미지 클릭 시 선택한 리뷰 이미지 목록과 선택 index를 이미지 뷰어에 전달합니다.
- [ ] route state `activeTab`이 있으면 해당 탭을 초기 선택 상태로 표시합니다.
- [ ] 직접 진입 상태에서 뒤로가기를 누르면 `ROUTES.home`으로 replace 이동합니다.
- [ ] 메뉴 목록과 리뷰 목록은 커서 기반 무한스크롤로 조회하고, 리스트 하단 sentinel 감지는 공통 `useInfiniteScrollTrigger` 훅을 사용합니다.
- [ ] 모바일 폭에서 horizontal overflow가 없어야 합니다.

## Photo Policy

- 상단 대표 이미지는 전달 순서대로 최대 10장만 표시합니다. 1~5장은 실제 개수, 6~10장은 점 6개를 표시하며, 이미지가 없으면 대체 이미지 1개만 표시하고 점은 숨깁니다.
- 대표 이미지의 활성 점은 사용자 합의로 1~6번째 사진은 같은 순번의 점을 활성화하고, 7~10번째 사진은 6번째 점을 유지합니다. 이는 대표 이미지 원문에 명시된 정책이 아닌 구현 결정으로 기획 확인 대상입니다. 사진 탭의 전체 사진 6구간 분할 정책과 공통 Carousel 기본 정책은 변경하지 않습니다.

- 기준: 기획팀 확인 및 HASHI-PLAN `db27b1e4595b1d1976cedb17f840a7a0e207e5f6`.
- 공통 원문: [RESTAURANT_PHOTO](https://github.com/TEAM-HASHI/HASHI-PLAN/blob/db27b1e4595b1d1976cedb17f840a7a0e207e5f6/02_PRODUCT_SPEC/RESTAURANT/RESTAURANT_PHOTO/RESTAURANT_PHOTO.md).
- 오늘의 식당 원문: [RES_TODAY_RESTAURANT_PHOTOS](https://github.com/TEAM-HASHI/HASHI-PLAN/blob/db27b1e4595b1d1976cedb17f840a7a0e207e5f6/02_PRODUCT_SPEC/RESTAURANT/RES_TODAY_RESTAURANT_PHOTOS/RES_TODAY_RESTAURANT_PHOTOS.md).
- 현재 구현: 개발 환경에서는 `RestaurantPhotoSection`에 필터, 2열 목록, 추가 조회, 상태 처리와 사진 전용 뷰어를 연결합니다. 실제 API 연동과 실데이터 검증은 완료 범위에 포함하지 않습니다.
- 디자인 기준: [사진 목록 및 뷰어](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7573-79532). 사진 목록은 좌우 20px, 열 사이 21px, 세로 간격 20px, 모서리 5px을 적용합니다. Figma의 구 필터명 대신 확정된 기획 필터와 개수 정책을 적용합니다.
- 목데이터는 Figma 체크무늬 자산을 사용하는 개발 전용 예시 45건이며 실제 식당 사진이나 건수가 아닙니다. `import.meta.env.DEV` 분기에서만 동적으로 불러옵니다.
- 이미지 메타데이터는 PNG 실제 크기인 256x256과 일치시킵니다. 다양한 가로/세로 원본 샘플 검증은 별도로 남아 있으며, Figma의 예시 높이를 이미지 원본 크기로 사용하지 않습니다.
- 필터 영역은 75px, 상단 여백 20px, 칩 높이 36px입니다. 데이터 공급 선택은 `api/restaurantPhotoSource.ts`에서 담당하고 화면 훅은 공급자의 활성 여부와 조회 인터페이스만 사용합니다.
- 미확정: 현재 확대 2배/최대 4배, 로딩 스켈레톤, 오류 문구/배치, 뷰어 추가 조회 실패의 재시도 버튼은 기획/디자인 확인 전 임시 구현입니다. 확정 규격으로 간주하지 않습니다.
- 기본 필터는 `전체`이며, `전체 / 대표사진 / 메뉴사진 / 리뷰사진` 칩과 각 분류의 공개 사진 수를 한 줄 가로 스크롤로 표시합니다. 동영상은 이번 스프린트에서 제외합니다.
- 대표사진과 메뉴사진은 식당 등록 순서, 공개 리뷰의 첨부 사진은 최신 리뷰 순서로 표시합니다.
- 전체 목록은 같은 원본을 중복 표시하지 않고 대표사진 1장과 리뷰사진 3장을 반복해 섞습니다. 대표사진과 리뷰사진이 모두 끝나면 메뉴사진을 표시하며, 한 출처가 없으면 남은 출처를 사용합니다.
- 사진은 원본 비율을 유지하는 2열 masonry로 표시하고 최초 및 추가 조회는 각각 20장씩 수행합니다.
- 필터 변경 시 이전 목록과 스크롤을 초기화하고 첫 20장을 조회합니다. 리뷰 작성 후 돌아오면 목록을 갱신합니다.
- 사진 선택 시 해당 사진부터 전체 화면으로 열고 현재 필터의 사진을 좌우 스와이프로 탐색합니다. 두 번 탭 또는 핀치로 확대하며 원래 크기로 돌아오면 사진 전환을 재개합니다.
- 뷰어에는 사진, 닫기 아이콘, 인디케이터만 표시합니다. 1~5장은 실제 개수의 점, 6장 이상은 전체 사진을 6구간으로 나눈 점 6개를 표시합니다. 닫으면 선택 전 목록 위치를 복원합니다.
- 로딩, 빈 결과, 최초 조회 실패, 추가 조회 실패를 구분합니다. 빈 결과와 오류에서도 필터를 유지하고, 빈 상태의 시각 디자인은 디자인 기준을 확인해 적용합니다.
- 최초 및 추가 조회 실패 시 자동으로 한 번 재시도합니다. 이후 최초 조회 실패는 사진 영역에 오류와 재시도 버튼을, 추가 조회 실패는 기존 목록을 유지한 채 하단에 오류와 재시도 버튼을 표시합니다.
- 개별 이미지 로드 실패는 공통 기본 이미지로 대체합니다. 삭제되거나 숨겨진 리뷰 사진은 제외하고 대표사진 및 메뉴사진 변경은 다음 조회에 반영합니다.
- 일반 식당 사진 화면에는 `다시 추천 받기`가 없으며, 공통 사진 정책 자체는 오늘의 식당과 동일합니다.

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
- enabled condition: route param `restaurantId` is valid number
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
  - next page trigger: 메뉴 탭이 active일 때 공통 `useInfiniteScrollTrigger` sentinel intersect

- query: restaurant reviews infinite
- requested endpoint: `GET /api/v1/restaurants/{restaurantId}/reviews`
- response data:
  - `averageRating`, `reviewCount`, `ratingDistribution`, `content`, `nextCursor`, `hasNext`
- enabled condition: route param `restaurantId` is valid number
- request params:
  - path `restaurantId`, query `sort`, `cursor`, `size`
- loading state: 리뷰 목록 조회 또는 정렬 변경 중에는 리뷰 목록 영역에만 `RestaurantReviewListSkeleton` 표시
- error state: 리뷰 영역 error fallback
- empty state: 리뷰가 없으면 shared `ListEmptyState`로 `작성된 리뷰가 없습니다.` 문구 표시
- rating distribution: API `ratingDistribution`의 `five`, `four`, `three`, `two`, `one` count를 `reviewCount` 기준 비율로 변환해 별점 막대 너비에 반영
- refetch condition: route param `restaurantId` 또는 sort 변경
- pagination:
  - `getNextPageParam`: `hasNext`가 true이면 `nextCursor`
  - next page trigger: 공통 `useInfiniteScrollTrigger` sentinel intersect

- query: restaurant photos
- endpoint: TBD (서버 계약 확인 전 임의 확정하지 않음)
- status: 개발·테스트 전용 목데이터 기반 UI 구현, 실제 API 연동은 후속
- data source: `RestaurantPhotoSource`는 클라이언트 내부 인터페이스이며 서버 계약이 아닙니다. `createRestaurantPhotoSource`에서 목데이터를 제공하고 실제 API는 계약 확인 후 adapter로 연결합니다.
- pagination: 최초 및 추가 조회 각각 20장, 필터 변경 시 목록과 스크롤 초기화
- loading/empty/error: 개발 UI에서 Photo Policy 기준으로 구분합니다. 공통 빈 상태·버튼·이미지 fallback을 사용하며 상태별 최종 시각 디자인 확인은 별도입니다.
- count: 칩별 공개 사진 수 및 필터와 무관한 전체 공개 사진 수. 실제 응답 필드명은 서버 확인 대기

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
  - restaurant photos: 개발 전용 목록 페이지 및 count query, 실제 API 연동은 후속
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
      RestaurantInfoSection
        Map ImageFallback
      RestaurantMenuListSection
      RestaurantPhotoSection
        RestaurantPhotoViewer
          RestaurantPhotoZoomImage
      RestaurantReviewSection
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
  - `ExpandableText`
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
  - `RestaurantMenuListSection`
  - `RestaurantPhotoSection`
  - `RestaurantPhotoViewer`
  - `RestaurantPhotoZoomImage`
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
  - `BackIcon`, `SaveBlankIcon`, `LocationIcon`, `ClockIcon`, `MoneyIcon`, `PencilIcon`, `CloseSmallIcon`

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
- [ ] 사진 필터별 개수 및 필터와 무관한 상단 전체 개수 확인
- [ ] 사진 2열 원본 비율, 20장 추가 조회, 필터 변경 시 목록 및 스크롤 초기화 확인
- [ ] 사진 뷰어 선택 위치, 확대, 스와이프, 인디케이터 및 닫기 후 위치 복원 확인
- [ ] 사진 로딩, 빈 결과, 최초 및 추가 조회 재시도, 개별 이미지 실패 상태 확인
- [ ] 운영 빌드에는 목데이터와 가짜 사진 count가 연결되지 않는지 확인
