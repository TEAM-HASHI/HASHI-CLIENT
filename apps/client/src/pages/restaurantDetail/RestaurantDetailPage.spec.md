# Page Spec: `RestaurantDetailPage`

## Purpose

- 사용자가 특정 식당의 매장 정보, 메뉴, 리뷰를 확인하고 예약할 수 있는 모바일 웹 식당 상세 페이지입니다.

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
  - uses `useAuthStatus`: no

## Requirements

- [ ] Header title은 Figma 기준 `식당 상세 정보`로 표시합니다.
- [ ] route param `restaurantId`를 page에서 읽고, 서버 연동 전에는 최소 mock data를 주입합니다.
- [ ] 매장 정보, 메뉴, 리뷰 탭을 같은 페이지 상태로 전환합니다.
- [ ] 탭바는 Header 아래에 sticky로 고정됩니다.
- [ ] 메뉴/리뷰 탭 선택 시 탭바가 Header 바로 아래에 붙은 위치로 스크롤되어 해당 탭 콘텐츠를 초기 화면처럼 보여줍니다.
- [ ] 하단 fixed bar에는 좋아요 영역과 `예약하기`가 표시됩니다.
- [ ] 식당 상세 페이지에는 `다시 추천 받기` 버튼이 없습니다.
- [ ] 메뉴 카드 클릭 시 `ROUTES.restaurantMenuDetail`로 이동합니다.
- [ ] 공유 클릭 시 현재 페이지 링크를 클립보드에 복사하고, 성공 토스트는 TODO로 둡니다.
- [ ] 예약하기, 리뷰 작성 이동은 실제 API/route 연결 없이 page TODO handler로 둡니다.
- [ ] 좋아요는 에러 컴포넌트 머지 후 에러페이지로 이동하도록 page TODO handler로 둡니다.
- [ ] 리뷰 작성 CTA 클릭 시 비방문자 안내 모달을 열 수 있습니다.
- [ ] 리뷰 이미지 클릭 시 현재 페이지 안에서 이미지 뷰어 상태를 열 수 있습니다.
- [ ] 모바일 폭에서 horizontal overflow가 없어야 합니다.

## Data Dependencies

### Query

- query: none
- enabled condition: none
- request params: future `restaurantId`
- loading state: out of scope
- error state: out of scope
- empty state: out of scope
- refetch condition: out of scope

### Mutation

- mutation: none
- request data: none
- submit enabled condition: none
- success handling: TODO handler
- failure handling: out of scope

## State

- local state:
  - active tab
  - review image viewer open/closed
  - review unavailable modal open/closed
- form state: none
- URL state:
  - `restaurantId`
- server state: none
- derived state:
  - bottom bar variant from page variant

## UI Structure

```text
RestaurantDetailPage
  RestaurantDetailTemplate variant="detail"
    Header
    Hero
    Restaurant summary
    Sticky Tabs
    Active Tab Section
    ReviewImageViewer
    ReviewUnavailableModal
    RestaurantBottomBar
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Tabs`
  - `Button`
  - `Dialog`
  - `StarRating`
  - `Carousel`
  - `CollapsibleText`
  - `Chip`
  - `Badge`
- app shared component:
  - `ShareIconButton`
- feature component:
  - `RestaurantDetailTemplate`
  - `RestaurantDetailHero`
  - `RestaurantDetailTabs`
  - `RestaurantInfoSection`
  - `RestaurantMenuSection`
  - `RestaurantReviewSection`
  - `RestaurantBottomBar`
  - `ReviewImageViewer`
  - `ReviewUnavailableModal`
- icon:
  - `BackIcon`, `HeartBlankIcon`, `LocationIcon`, `ClockIcon`, `MoneyIcon`, `PencilIcon`, `CloseSmallIcon`

## Navigation

- entry:
  - `/restaurants/:restaurantId`
- links:
  - no confirmed outgoing route in this PR
- route params:
  - `restaurantId`
- search params:
  - none
- back behavior:
  - TODO handler in page
- auth redirect:
  - none

## Styling

- Tailwind layout:
  - mobile width, white background
  - sticky Header/TabBar
  - fixed bottom bar with safe-area bottom padding
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
