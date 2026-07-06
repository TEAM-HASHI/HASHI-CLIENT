# Page Spec: `MyReservationsPage`

Jira: HASHI-73

## Purpose

- 로그인한 사용자가 본인의 예약 정보를 상태별로 확인할 수 있는 예약 정보 페이지를 구현합니다.
- 예약 상태는 `진행 중`, `방문 예정`, `방문 완료`, `예약 취소` 네 가지 chip filter로 구분합니다.
- 각 예약 상태마다 카드 UI와 노출 정보가 다르므로 상태별 카드 컴포넌트를 분리합니다.
- 예약 리스트는 무한스크롤로 조회합니다.
- 상단 사용자명/제목과 상태 chip filter는 스크롤해도 고정되어야 합니다.
- status chip을 선택하면 해당 상태의 목록으로 바뀌고 리스트 스크롤 위치는 맨 위로 이동해야 합니다.

## Route

- path: `/my-reservations`
- path constant:
  - `ROUTES.myReservations`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - `BottomNavigationLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.myReservations`
- bottom navigation:
  - yes
  - 하단 네비게이션은 페이지 내부에서 직접 구현하지 않고 `BottomNavigationLayout`에서 제공합니다.
- redirect:
  - unauthenticated: `ROUTES.loginRequired`

## Location

```txt
apps/client/src/pages/myReservations/
├── MyReservationsPage.tsx
├── MyReservationsPage.spec.md
├── components/
│   ├── MyReservationsHeader.tsx
│   ├── ReservationStatusFilter.tsx
│   ├── ReservationListSummary.tsx
│   ├── ReservationListSection.tsx
│   ├── ReservationCardsByStatus.tsx
│   ├── ReservationCardImage.tsx
│   ├── InProgressReservationCard.tsx
│   ├── UpcomingReservationCard.tsx
│   ├── VisitedReservationCard.tsx
│   ├── CanceledReservationCard.tsx
│   └── ReservationCancelDialog.tsx
├── hooks/
│   └── useMyReservationsPage.ts
├── constants/
│   └── reservationStatus.ts
├── mocks/
│   └── myReservations.mock.ts
├── types.ts
└── index.ts
```

## Requirements

- [ ] 페이지 상단에 `{userName}님의 예약 정보` 제목을 보여줍니다.
- [ ] 상태 필터 chip 4개를 보여줍니다.
  - 진행 중
  - 방문 예정
  - 방문 완료
  - 예약 취소
- [ ] 상태 필터는 HDS 공통 `Chip` 컴포넌트를 사용합니다.
- [ ] 선택된 chip은 active 스타일로 표시합니다.
- [ ] chip 변경 시 해당 상태의 예약 목록을 조회합니다.
- [ ] chip 변경 시 리스트 스크롤 위치를 맨 위로 이동합니다.
- [ ] 상단 고정 영역은 스크롤해도 고정됩니다.
  - 제목
  - 상태 chip filter
- [ ] 총 N건 / 최신순 영역은 고정하지 않고 리스트 영역과 함께 스크롤됩니다.
- [ ] 리스트는 무한스크롤로 구현합니다.
- [ ] 무한스크롤 페이지 사이즈는 10개입니다.
- [ ] 조회된 리스트가 비어 있으면 shared `Empty` 컴포넌트를 사용합니다.
- [ ] 하단 네비게이션은 고정으로 유지됩니다.
- [ ] 카드 이미지는 식당/음식 이미지가 없을 경우 fallback 이미지를 보여줍니다.
  - 현재 구현은 page-local `ReservationCardImage`의 임시 fallback을 사용합니다.
  - `DefaultImage`가 머지되면 `ReservationCardImage` 내부 fallback을 `DefaultImage`로 교체합니다.
- [ ] 각 상태별 카드 UI를 분리합니다.

## Status Filter

예약 상태 값은 서버에서 아래 네 가지 값으로 내려줍니다.

```ts
type ReservationStatusFilter =
  | 'IN_PROGRESS'
  | 'UPCOMING'
  | 'VISITED'
  | 'CANCELED'
```

화면 표시명:

```ts
const reservationStatusLabels = {
  IN_PROGRESS: '진행 중',
  UPCOMING: '방문 예정',
  VISITED: '방문 완료',
  CANCELED: '예약 취소',
}
```

필터 chip 목록과 label은 클라이언트에서 UI 상수로 관리하되, 예약 카드의 상태와 카드 타입 분기는 서버 응답의 `status` 값을 기준으로 처리합니다.

## UI By Status

### 1. 진행 중

진행 중 예약은 예약 확정 전 상태입니다.

카드에 표시할 정보:

- 예약 확정 예정 안내 문구
  - 예: `3일 안에 예약이 확정될 예정이에요!`
- 식당 이미지
- 식당명
- 예약 신청일
- 예약 진행 단계
  - 예약 접수
  - 예약 진행 중
  - 예약 확정
- 문의하기 버튼
- 상세보기 버튼

진행 단계는 디자인 기준으로 progress 형태를 보여줍니다.

### 2. 방문 예정

방문 예정 예약은 예약이 확정되었고 아직 방문 전인 상태입니다.

카드에 표시할 정보:

- 식당 이미지
- 식당명
- 방문 예정 일시
- 인원
- 취소하기 버튼
- 문의하기 버튼

취소하기 버튼 클릭 시 확인 모달을 띄웁니다.

취소 확인 모달:

- title: `정말 예약을 취소하시겠습니까?`
- description:
  - `예약을 취소하면 방문 예정 내역에서 삭제되며`
  - `동일한 예약은 다시 접수해야 합니다.`
- cancel button: `취소하기`
- close button: `닫기`

취소 성공/실패 안내:

- 취소 성공 시 toast를 사용합니다.
- 취소 실패 시 toast를 사용합니다.
- 현재 toast 컴포넌트 디자인이 확정되지 않았으므로, toast 컴포넌트가 준비된 뒤 적용합니다.
- 취소 성공 모달은 사용하지 않습니다.

### 3. 방문 완료

방문 완료 예약은 리뷰 작성 여부에 따라 UI가 달라집니다.

카드에 표시할 공통 정보:

- 식당 이미지
- 식당명
- 방문 일시
- 인원

리뷰 작성 전:

- 별점 선택 UI
- `이 맛집 어떠셨나요?` 문구
- 별점 클릭 시 바로 리뷰 작성 페이지로 이동합니다.
- 리뷰 작성 페이지 진입 시 해당 예약의 `restaurantId`를 사용해 `/restaurants/:restaurantId/reviews/new`로 이동합니다.

리뷰 작성 후:

- 작성한 별점
- `리뷰 작성 완료! +500P` 버튼 또는 안내 영역
- `리뷰 작성 완료! +500P` 버튼 클릭 시 해당 리뷰 상세 페이지로 이동합니다.

리뷰 작성 여부는 예약 목록 API에서 함께 내려주는 리뷰 상태 데이터로 판단합니다.

### 4. 예약 취소

예약 취소 상태는 취소된 예약 목록을 보여줍니다.

카드에 표시할 정보:

- 식당 이미지
- 식당명
- 방문 예정이었던 일시
- 인원

시각 스타일:

- 전체적으로 disabled/gray tone
- 텍스트와 이미지가 비활성 상태처럼 보이도록 처리
- 별도 액션 버튼은 없음

## Data Dependencies

### Query

예약 목록 조회 API는 상태별로 호출합니다.

예상 API:

```txt
GET /api/v1/reservations/me?status={status}&sort=LATEST&size=10&cursor={cursor}
```

요청 params:

```ts
{
  status: 'IN_PROGRESS' | 'UPCOMING' | 'VISITED' | 'CANCELED'
  sort: 'LATEST'
  size: 10
  cursor?: string
}
```

응답 예상 shape:

```ts
type MyReservation = {
  reservationId: string
  restaurantId: string
  restaurantName: string
  restaurantImageUrl?: string | null
  visitDateTime: string
  guestSummary: string
  // 서버에서 내려주는 예약 상태입니다.
  status: ReservationStatusFilter
}
```

진행 중 상태 추가 필드:

```ts
type InProgressReservation = MyReservation & {
  requestedAt: string
  expectedConfirmedDate: string
  progressStep: 'RECEIVED' | 'CONTACTING' | 'CONFIRMED'
  remainingDays: number
}
```

방문 완료 상태 추가 필드:

```ts
type VisitedReservation = MyReservation & {
  hasReview: boolean
  reviewId?: string | null
  rating?: number | null
  earnedPoint?: number | null
}
```

방문 완료 상태에서는 예약 목록 응답에 리뷰 상태를 함께 포함합니다.

- `hasReview: false`: 리뷰 작성 전 UI를 보여줍니다.
- `hasReview: true`: 리뷰 작성 완료 UI를 보여줍니다.
- 작성된 리뷰가 있으면 `reviewId`, `rating`, `earnedPoint`를 함께 내려줍니다.
- 리뷰 작성 전에는 `restaurantId`로 리뷰 작성 페이지에 이동합니다.
- 리뷰 작성 후에는 `reviewId`로 리뷰 상세 페이지에 이동합니다.

pagination:

```ts
type MyReservationsResponse = {
  items: MyReservation[]
  totalCount: number
  nextCursor?: string | null
}
```

### Infinite Scroll

- 최초 진입 시 selected status 기준 첫 페이지를 조회합니다.
- 한 페이지당 10개씩 조회합니다.
- 리스트 하단 sentinel이 보이면 다음 페이지를 조회합니다.
- `nextCursor`가 없으면 더 이상 요청하지 않습니다.
- status chip이 변경되면 기존 리스트를 초기화하고 첫 페이지부터 다시 조회합니다.
- status chip이 변경되면 리스트 스크롤 위치를 맨 위로 이동합니다.
- 중복 요청을 막기 위해 loading 중에는 다음 페이지 요청을 막습니다.

### Mutation

방문 예정 카드에서 취소하기를 누르면 취소 확인 모달을 띄웁니다.

예상 API:

```txt
POST /api/v1/reservations/{reservationId}/cancel
```

성공 시:

- 현재 `방문 예정` 리스트에서 해당 예약을 제거하거나 refetch합니다.
- `예약 취소` chip으로 이동하지는 않습니다.
- 취소 성공 toast를 보여줍니다.
- toast 컴포넌트 디자인이 확정되지 않았으므로, toast 컴포넌트가 준비된 뒤 적용합니다.

실패 시:

- 취소 실패 toast를 보여줍니다.
- toast 컴포넌트 디자인이 확정되지 않았으므로, toast 컴포넌트가 준비된 뒤 적용합니다.

## State

`useMyReservationsPage`에서 관리합니다.

local state:

- `selectedStatus`
- `cancelReservationId`

server state:

- selected status별 예약 목록
- total count
- next cursor
- loading
- error
- fetching next page

derived state:

- 현재 리스트 items
- 현재 선택된 status의 total count
- 취소 확인 모달 open 여부: `cancelReservationId !== null`
- 다음 페이지 조회 가능 여부
- 카드 타입 분기

## UI Structure

```txt
MyReservationsPage
  useMyReservationsPage
  FixedHeaderArea
    MyReservationsHeader
    ReservationStatusFilter
  ReservationList
    ReservationListSummary
    ReservationCardsByStatus
    InProgressReservationCard[]
    UpcomingReservationCard[]
    VisitedReservationCard[]
    CanceledReservationCard[]
    InfiniteScrollSentinel
  ReservationCancelDialog
```

## Component Mapping

HDS component:

- `Chip`
- `Button`
- `Dialog`
- `BottomNavigation`

HDS icon:

- `ReservationIcon`
- `CheckIcon`
- `StarFillIcon`
- `StarBlankIcon`
- `OrderCancelIcon`

shared component:

- `Empty`

page-local components:

- `MyReservationsHeader`
- `ReservationStatusFilter`
- `ReservationListSummary`
- `ReservationListSection`
- `ReservationCardsByStatus`
- `ReservationCardImage`
- `InProgressReservationCard`
- `UpcomingReservationCard`
- `VisitedReservationCard`
- `CanceledReservationCard`
- `ReservationCancelDialog`

hooks:

- `useMyReservationsPage`

constants:

- `reservationStatus`

mocks:

- `myReservations.mock`

types:

- `MyReservation`
- `InProgressReservation`
- `UpcomingReservation`
- `VisitedReservation`
- `CanceledReservation`

## Fixed Layout Policy

상단 고정 영역:

- 페이지 제목
- status chip filter

위 영역만 스크롤해도 고정되어야 합니다.

리스트와 함께 스크롤되는 영역:

- 총 N건 / 최신순
- 예약 카드 리스트

구현 기준:

- `app-mobile-fixed-top` 유틸을 사용합니다.
- fixed 영역의 높이만큼 본문 상단 padding을 확보합니다.
- fixed 영역은 배경색을 지정해 리스트가 아래로 스크롤될 때 겹쳐 보이지 않도록 합니다.
- fixed 영역은 모바일 프레임 너비를 벗어나지 않아야 합니다.
- z-index는 하드코딩하지 않고 `z-fixed` 토큰을 사용합니다.
- status chip 변경 시 리스트 컨테이너 또는 window 스크롤을 맨 위로 이동합니다.

하단 네비게이션:

- `BottomNavigationLayout`이 담당합니다.
- 페이지 내부에서 하단 네비게이션을 직접 렌더링하지 않습니다.
- 본문 리스트는 하단 네비게이션에 가려지지 않도록 bottom padding을 확보합니다.

## Empty State

상태별 예약 목록이 없을 경우 shared `Empty` 컴포넌트를 사용합니다.

`Empty`는 다른 페이지에서도 동일한 그래픽을 사용하고 가운데 설명 텍스트만 달라질 수 있으므로 `shared/components`에 두는 것을 기준으로 합니다.

예약 정보 페이지에서는 아래 내용을 주입합니다.

- empty graphic
- 상태별 description text
- CTA button text: `일본 맛집 추천받기`
- CTA action: 인기 맛집 또는 추천 리스트 진입 경로로 이동

예상 문구:

- 진행 중: `진행 중인 예약이 없어요.`
- 방문 예정: `방문 예정인 예약이 없어요.`
- 방문 완료: `방문 완료된 예약이 없어요.`
- 예약 취소: `취소된 예약이 없어요.`

## Loading State

초기 loading:

- 상단 고정 영역은 유지합니다.
- 총 N건 / 최신순 영역과 리스트 영역에 skeleton 또는 loading placeholder를 표시합니다.

다음 페이지 loading:

- 기존 리스트는 유지합니다.
- 리스트 하단에 loading indicator를 표시합니다.

## Error State

초기 조회 실패:

- 리스트 영역에 error fallback을 표시합니다.
- 재시도 버튼을 제공합니다.

다음 페이지 조회 실패:

- 기존 리스트는 유지합니다.
- 하단에 재시도 버튼 또는 toast를 표시합니다.

## Navigation

카드 액션:

진행 중:

- 문의하기: Hashi 카카오톡 문의하기로 연결
- 상세보기: `/reservations/:reservationId`

방문 예정:

- 취소하기: 취소 확인 모달 open
- 문의하기: Hashi 카카오톡 문의하기로 연결

방문 완료:

- 리뷰 작성 전 별점 클릭: 리뷰 작성 페이지 이동
- 리뷰 작성 후 `리뷰 작성 완료! +500P` 클릭: 해당 리뷰 상세 페이지 이동

예약 취소:

- 별도 액션 없음

## Validation

- 필터 chip은 항상 하나만 선택됩니다.
- 서버에서 내려준 `status` 값으로 카드 타입을 분기합니다.
- 서버에서 정의되지 않은 status 값이 내려오면 해당 item은 렌더링하지 않거나 error reporting 대상에 포함합니다.
- 무한스크롤 요청 중복을 막습니다.
- `reservationId`가 없는 카드 액션은 실행하지 않습니다.
- 리뷰 작성 전 이동에는 `restaurantId`가 필요합니다.
- 리뷰 작성 후 리뷰 상세 이동에는 `reviewId`가 필요합니다.

## Accessibility

- 상태 필터 chip group에는 접근 가능한 label을 제공합니다.
- 선택된 chip은 시각적 active 상태뿐 아니라 선택 상태도 전달합니다.
- 카드 내부 버튼은 명확한 label을 가집니다.
  - `예약 취소하기`
  - `문의하기`
  - `예약 상세보기`
- 모달은 `Dialog` 공통 컴포넌트를 사용해 focus trap, aria label, overlay close 정책을 따릅니다.
- 이미지가 장식 목적이면 `alt=""`, 식당 식별에 필요한 이미지라면 식당명 기반 alt를 제공합니다.

## Test Plan

- `pnpm --filter @hashi/client typecheck`
- `pnpm --filter @hashi/client lint`
- chip 변경 시 status별 리스트가 바뀌는지 확인
- chip 변경 시 리스트 스크롤 위치가 맨 위로 이동하는지 확인
- 무한스크롤 sentinel 노출 시 다음 페이지 요청이 발생하는지 확인
- nextCursor가 없을 때 추가 요청이 발생하지 않는지 확인
- 방문 예정 카드에서 취소 확인 모달이 열리는지 확인
- 취소 성공 후 toast가 호출되는지 확인
- 취소 실패 후 toast가 호출되는지 확인
- 방문 완료 카드에서 리뷰 작성 전/후 UI가 다르게 보이는지 확인
- 방문 완료 카드에서 리뷰 작성 전 별점 클릭 시 리뷰 작성 페이지로 이동하는지 확인
- 방문 완료 카드에서 리뷰 작성 완료 버튼 클릭 시 리뷰 상세 페이지로 이동하는지 확인
- 예약 취소 상태 카드가 disabled style로 보이는지 확인
- fixed header/filter 영역과 bottom navigation이 모바일 프레임 안에 유지되는지 확인

## Open Questions

- toast 컴포넌트 디자인과 공통 사용 API가 확정되면 취소 성공/실패 안내에 적용해야 합니다.
- `DefaultImage`가 머지되면 `ReservationCardImage`의 임시 fallback을 교체해야 합니다.
