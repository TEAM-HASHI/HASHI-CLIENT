# Page Spec: `ReservationRescuePage`

## Purpose

- 사용자가 예약을 취소한 직후 식사 계획까지 포기하지 않도록, 기존 HASHI 추천 식당을 이어서 탐색할 수 있는 화면을 제공합니다.
- 신규 추천 API를 만들지 않고 기존 예약 상세 데이터와 식당 목록 API를 조합합니다.
- 추천 근거는 API가 보장하는 `HASHI PICK`과 평점순 정렬까지만 표현합니다. 유사도, 실시간 예약 가능 여부, 거리처럼 API가 제공하지 않는 정보는 표시하지 않습니다.

## Route

- path: `/reservations/:reservationId/rescue`
- path constant:
  - `ROUTES.reservationRescue`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - 하단 네비게이션 없음
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.reservationRescue`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `/login-required`
  - 취소된 예약이 아니거나 식당 ID가 없는 예약: `/my-reservations?status=CANCELED`
- auth status:
  - uses `useAuthStatus`: no
  - route guard가 인증 상태를 소유합니다.

## Location

- page path:
  - `apps/client/src/pages/reservationRescue/ReservationRescuePage.tsx`
- spec path:
  - `apps/client/src/pages/reservationRescue/ReservationRescuePage.spec.md`
- page-local components:
  - `apps/client/src/pages/reservationRescue/components/ReservationRescueIntro.tsx`
  - `apps/client/src/pages/reservationRescue/components/ReservationRescueRestaurantList.tsx`
- page-local hook:
  - `apps/client/src/pages/reservationRescue/hooks/useReservationRescuePage.ts`
- page-local query:
  - `apps/client/src/pages/reservationRescue/queries/reservationRescueQueryOptions.ts`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Scope

### Included

- 예약 취소 성공 후 추천 화면으로 이동합니다.
- 기존 예약 상세 query cache를 재사용하고 직접 진입 또는 새로고침 시 같은 상세 API로 취소된 예약 정보를 조회합니다.
- 기존 식당 목록 API에서 HASHI PICK 평점순 식당을 조회합니다.
- 취소한 식당을 프론트엔드에서 제외하고 최대 3개를 표시합니다.
- 추천 카드에서 기존 식당 상세와 예약 흐름으로 이동합니다.
- loading, error, empty 상태를 제공합니다.

### Excluded

- 신규 추천 API 또는 추천 알고리즘
- 장르·지역·가격대 기반 유사 식당 계산
- 실시간 예약 가능 여부
- 유사도 퍼센트, 거리, 예상 이동 시간
- HDS 신규 컴포넌트 또는 디자인 토큰 추가
- 취소 정책과 취소 API 계약 변경

## Requirements

- [ ] 예약 상세의 기존 취소 확인 `Dialog`를 유지합니다.
- [ ] 취소 확인 문구에 취소 후 다른 식당을 탐색할 수 있다는 안내를 추가합니다.
- [ ] 취소 mutation 성공 시 기존 성공 toast와 취소 목록 이동 대신 추천 화면으로 이동합니다.
- [ ] 취소 mutation 실패 시 현재 예약 상세와 취소 확인 UI를 유지하고 기존 공통 mutation error 정책을 따릅니다.
- [ ] 추천 화면 상단에 `예약은 취소됐지만, 맛있는 일정은 계속돼요`를 표시합니다.
- [ ] 보조 문구로 `하시가 엄선한 평점 높은 식당을 다시 골라봤어요`를 표시합니다.
- [ ] 추천 식당은 취소한 식당을 제외하고 최대 3개를 표시합니다.
- [ ] 추천 식당 카드는 기존 `RestaurantCard`를 재사용합니다.
- [ ] 식당 카드를 누르면 기존 식당 상세 화면으로 이동합니다.
- [ ] `취소된 예약 보기` 액션은 `/my-reservations?status=CANCELED`로 이동합니다.
- [ ] API가 제공하지 않는 유사도, 실시간 예약 가능 여부, 거리 문구를 표시하지 않습니다.
- [ ] 360px 이상의 모바일 viewport에서 가로 overflow 없이 렌더링합니다.
- [ ] 제목, 목록, 로딩, 오류 상태에 접근 가능한 이름을 제공합니다.

## Data Dependencies

### Canceled Reservation Query

- owner:
  - 기존 `useReservationDetailQuery`
  - 기존 `reservationDetailQueryKey`
- endpoint:
  - `GET /api/v1/reservations/:reservationId`
- enabled condition:
  - route의 `reservationId`가 유효한 양의 정수일 때
- cache behavior:
  - 취소 mutation 성공 시 기존 상세 cache에 저장한 `CANCELED` 예약 응답을 즉시 사용합니다.
  - 추천 route 직접 진입 또는 새로고침에서는 기존 상세 query가 서버 데이터를 조회합니다.
- required fields:
  - `reservationStatus === 'CANCELED'`
  - `restaurantId`
- loading state:
  - 페이지 전체 콘텐츠 영역에서 기존 `secondary-200` token 기반 skeleton을 표시합니다.
- error state:
  - 404는 기존 `NotFoundPage`를 사용합니다.
  - 그 외 critical error는 route `AsyncBoundary`로 전달합니다.
- invalid state:
  - 취소 상태가 아니거나 `restaurantId`가 없으면 취소 목록으로 replace 이동합니다.

### Rescue Restaurant Query

- owner:
  - endpoint 함수는 기존 `getRestaurants`를 재사용합니다.
  - query options와 query key는 `reservationRescue` page가 소유합니다.
- endpoint:
  - `GET /api/v1/restaurants`
- request params:
  - `genre: 'all'`
  - `sort: 'rating'`
  - `type: 'hashi-pick'`
  - `size: 5`
- enabled condition:
  - 취소된 예약의 `restaurantId`가 확인된 뒤
- response mapping:
  - 기존 `mapRestaurantSummaryToRestaurant`를 재사용합니다.
  - 매핑 실패한 항목과 취소한 `restaurantId`를 제외합니다.
  - 남은 결과에서 앞의 3개만 표시합니다.
- loading state:
  - 기존 `RestaurantListPage`의 식당 카드 skeleton 구조와 token을 동일하게 사용합니다.
- error state:
  - 추천 영역 안에 `식당 목록을 불러오지 못했어요`와 HDS `Button`의 `다시 시도`를 표시합니다.
  - 취소 성공 상태는 되돌리지 않으며 ErrorBoundary로 전파하지 않습니다.
- empty state:
  - 기존 `ListEmptyState`를 재사용합니다.
  - `지금 추천할 식당을 찾지 못했어요`와 HDS `Button`의 `하시 PICK 둘러보기`를 표시합니다.
- refetch condition:
  - 사용자가 `다시 시도`를 누르면 해당 query를 refetch합니다.

### Cancel Reservation Mutation

- owner:
  - 기존 `useCancelReservationMutation`
- request data:
  - route의 `reservationId`
- submit enabled condition:
  - 기존 취소 dialog가 열려 있고 mutation이 pending이 아닐 때
- success handling:
  - 기존 reservation detail cache update와 canceled reservation list cache synchronization을 유지합니다.
  - dialog를 닫고 `ROUTES.reservationRescue`로 이동합니다.
  - 추천 화면 자체가 성공 피드백을 제공하므로 기존 취소 성공 toast는 표시하지 않습니다.
- failure handling:
  - 기존 공통 mutation error toast를 유지합니다.
  - 추천 화면으로 이동하지 않습니다.

## User Flow

1. 사용자가 예약 상세에서 `예약 취소`를 누릅니다.
2. 기존 취소 확인 dialog가 열립니다.
3. 사용자가 `취소하기`를 누르면 취소 mutation을 호출합니다.
4. mutation 성공 시 예약 cache를 동기화하고 `/reservations/:reservationId/rescue`로 이동합니다.
5. 추천 화면은 취소된 예약의 `restaurantId`를 확인합니다.
6. HASHI PICK 평점순 식당 5개를 조회하고 취소한 식당을 제외한 최대 3개를 표시합니다.
7. 사용자가 식당 카드를 누르면 기존 식당 상세로 이동합니다.
8. 사용자가 `취소된 예약 보기`를 누르면 취소 목록으로 이동합니다.

## State

- local state:
  - 없음
- form state:
  - 없음
- URL state:
  - `reservationId` path param
- server state:
  - 취소된 예약 상세 query
  - rescue restaurant query
- derived state:
  - 유효한 취소 예약 여부
  - 원래 식당을 제외한 추천 식당 최대 3개
  - loading, error, empty, success UI state

## Validation

- `reservationId`:
  - 기존 `parseReservationId`를 재사용해 양의 정수인지 검증합니다.
- canceled reservation:
  - `reservationStatus`가 `CANCELED`이고 `restaurantId`가 있어야 합니다.
- restaurant result:
  - 기존 mapper가 필수 식당 필드를 검증합니다.

## UI Structure

```text
ReservationRescuePage
  Header
    IconButton(뒤로가기)
    Title(식당 다시 찾기)
  ReservationRescueIntro
    Eyebrow(HASHI PICK)
    Heading
    Description
  ReservationRescueRestaurantList
    RestaurantCard x 0..3
    LoadingSkeleton / LocalError / ListEmptyState
  Button(취소된 예약 보기)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Button`
- HDS icon:
  - `BackIcon`
- app shared component:
  - `ListEmptyState`
  - `DefaultImage`는 `RestaurantCard`의 기존 `RestaurantImageList`를 통해 사용합니다.
- existing feature component:
  - `RestaurantCard`
  - `RestaurantImageList`
- existing utility:
  - `mapRestaurantSummaryToRestaurant`
  - `parseReservationId`
- page-local component:
  - `ReservationRescueIntro`
  - `ReservationRescueRestaurantList`
- design-system boundary:
  - 도메인 문구, query, route, 식당 필터링은 page layer가 소유합니다.
  - 이 기능을 위해 `packages/hds-ui`, `packages/hds-icons`, `packages/hds-tokens`를 변경하지 않습니다.

## Design Direction

- 기존 홈과 식당 목록 화면처럼 흰색 배경과 모바일 단일 컬럼을 유지합니다.
- 헤더와 식당 카드는 기존 화면과 동일한 높이, 타이포 위계, 이미지 비율을 사용합니다.
- 상단 메시지는 `typo-header-*`, `typo-body-*`, `text-primary-*`, `text-cool-gray-*` token만 사용합니다.
- 강조색은 기존 브랜드 token 범위에서만 사용하고 새 hex color를 추가하지 않습니다.
- spacing은 Tailwind scale을 우선 사용하고, 기존 컴포넌트와 시각적으로 일치해야 하는 경우에만 현재 코드의 값을 따릅니다.
- 추천 목록은 과도한 장식, 신규 그래픽, 가짜 배지보다 실제 식당 이미지와 기존 카드 정보 위계를 중심으로 구성합니다.
- 페이지 전용 UI는 `apps/client/src/pages/reservationRescue` 안에 두며 단일 사용 컴포넌트를 HDS로 승격하지 않습니다.

## Error Handling

- 취소 mutation 실패:
  - 기존 예약 상세에 남고 공통 mutation error toast를 표시합니다.
- 예약 상세 404:
  - `NotFoundPage`를 표시합니다.
- 예약 상세 critical error:
  - `AsyncBoundary`로 전달합니다.
- 취소 상태 또는 식당 ID 불일치:
  - `/my-reservations?status=CANCELED`로 replace 이동합니다.
- 추천 query 실패:
  - 페이지 로컬 오류와 `다시 시도`를 표시합니다.
- 추천 query empty:
  - `ListEmptyState`와 `하시 PICK 둘러보기`를 표시합니다.

## Navigation

- entry:
  - 예약 상세의 취소 mutation 성공
- links:
  - 추천 식당 카드 → `/restaurants/:restaurantId`
  - `취소된 예약 보기` → `/my-reservations?status=CANCELED`
  - empty fallback → `/restaurants/hashi-pick`
- route params:
  - `reservationId`
- search params:
  - 없음
- back behavior:
  - 브라우저 history의 취소 전 상세로 돌아가면 이미 blocked 상태가 되므로 `navigate(-1)`을 사용하지 않습니다.
  - 헤더의 뒤로가기는 `/my-reservations?status=CANCELED`로 replace 이동합니다.
- auth redirect:
  - 비회원은 `AuthOnlyRoute` 정책을 따릅니다.

## Styling

- Tailwind layout:
  - 모바일 단일 컬럼, `app-mobile-fixed-top` 헤더, 본문 수직 스크롤
- responsive:
  - `RootLayout`의 mobile frame과 max width를 따릅니다.
  - 최소 360px viewport에서 가로 overflow가 없어야 합니다.
- fixed area:
  - 상단 HDS `Header`
  - 하단 CTA는 콘텐츠를 가리지 않도록 fixed로 만들지 않고 목록 다음에 배치합니다.
- scroll area:
  - intro, 추천 목록, CTA를 포함한 page body
- empty/loading/error layout:
  - 성공 목록과 같은 좌우 padding을 유지해 layout shift를 줄입니다.

## Testing

- route:
  - authOnly route와 lazy page 등록을 확인합니다.
  - 유효하지 않은 `reservationId`를 처리합니다.
- cancel integration:
  - 취소 성공 시 cache synchronization 후 rescue route로 이동합니다.
  - 취소 실패 시 이동하지 않습니다.
- recommendation:
  - 기존 식당 목록 API에 고정 params를 전달합니다.
  - 취소한 식당을 제외합니다.
  - mapper 실패 항목을 제외합니다.
  - 결과를 최대 3개로 제한합니다.
- UI states:
  - loading skeleton
  - local query error와 retry
  - empty state와 HASHI PICK fallback
  - success list
- navigation:
  - 추천 카드에서 식당 상세 이동
  - 뒤로가기와 `취소된 예약 보기`에서 취소 목록 이동

## Verification

- [ ] `corepack pnpm --filter @hashi/client test`
- [ ] `corepack pnpm --filter @hashi/client lint`
- [ ] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] `corepack pnpm format:check`
- [ ] 360px, 393px 모바일 viewport 수동 확인
- [ ] 취소 확인 → 취소 성공 → 추천 화면 → 식당 상세 흐름 확인
- [ ] route path / params 확인
- [ ] auth guard 확인
- [ ] loading / empty / error / success 상태 확인
- [ ] 신규 HDS component, token, 임의 hex color가 추가되지 않았는지 확인
