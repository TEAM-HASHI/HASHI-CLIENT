# Page Spec: `Magazines`

Jira: HASHI-77

## Purpose

- 사용자가 HASHI 서비스 안에서 대표 매거진 배너와 추천 매거진 목록을 탐색하고 열람할 수 있게 한다.
- 이번 MVP 범위에서는 카테고리 필터를 구현하지 않으며, UI에서도 인기순/지역별/시리즈별/장르별 필터 영역을 렌더링하지 않는다.
- API 연동 전까지는 page-local mock 데이터를 사용하되, 이후 query로 교체하기 쉽도록 데이터/이동 로직과 UI 조합을 분리한다.

## Route

- path: `/magazines`
- path constant:
  - `ROUTES.magazines`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type:
  - `public`
- guard:
  - none
- lazy loading:
  - `lazyPages.magazines`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/magazines/MagazinesPage.tsx`
- spec path:
  - `apps/client/src/pages/magazines/MagazinesPage.spec.md`
- route registration:
  - existing `apps/client/src/app/router/path.ts`
  - existing `apps/client/src/app/router/lazy.ts`
  - existing `apps/client/src/app/router/routes.ts`

## Requirements

- [x] 상단에 `매거진` 제목과 뒤로가기 버튼을 보여준다.
- [x] 뒤로가기 버튼 클릭 시 `ROUTES.home`으로 이동한다.
- [x] 상단 대표 매거진 배너 영역을 보여준다.
- [x] 대표 매거진 배너는 이미지와 페이지 인디케이터를 포함한다.
- [x] 대표 매거진 배너 데이터는 이미지, 인스타 게시글 URL, `displayOrder`를 포함한다.
- [x] 대표 매거진 배너를 탭하면 해당 매거진의 외부 인스타 게시글로 이동한다.
- [x] 추천 매거진 섹션 제목을 보여준다.
- [x] 카테고리 필터는 MVP 범위에서 제외하므로 화면에 렌더링하지 않는다.
- [x] 추천 매거진 목록은 제목, 이미지, 발행일을 포함한다.
- [x] 추천 매거진 카드를 탭하면 해당 매거진의 외부 인스타 게시글로 이동한다.
- [x] 목록 아이템 사이에는 구분선을 보여주되 마지막 아이템에는 불필요한 구분선을 넣지 않는다.
- [x] 긴 제목은 모바일 폭에서 레이아웃을 깨지 않도록 줄 수를 제한한다.
- [x] 배너 링크의 접근성 이름은 호출부 데이터에서 제공한다.
- [x] 추천 매거진 썸네일은 링크 텍스트와 중복되지 않도록 장식 이미지로 처리한다.

## Data Dependencies

### Query

- query: none in MVP
- enabled condition: none
- request params: none
- loading state: none in MVP because mock data is synchronous
- error state: none in MVP because mock data is synchronous
- empty state:
  - mock 데이터가 비어 있으면 배너 영역은 렌더링하지 않는다.
  - 추천 매거진 목록이 비어 있으면 추천 섹션 아래에 빈 상태 문구를 page-local UI로 보여준다.
- refetch condition: none

API 연동 시 `useMagazinesPage` 내부에서 mock 반환을 TanStack Query 기반 query로 교체한다. 페이지 컴포넌트와 섹션 컴포넌트는 query 호출 세부사항을 알지 않는다.

### Mutation

- mutation: none
- request data: none
- submit enabled condition: none
- success handling: none
- failure handling: none

## Mock And Future API Boundary

- mock data:
  - `apps/client/src/pages/magazines/mocks/magazines.mock.ts`
  - 대표 배너 데이터와 추천 매거진 목록 데이터를 분리해 export한다.
- page hook:
  - `apps/client/src/pages/magazines/hooks/useMagazinesPage.ts`
  - mock 데이터를 반환한다.
  - 뒤로가기 이동 로직을 소유한다.
  - 외부 인스타 URL 정규화와 검증 로직을 소유한다.
- page:
  - `MagazinesPage.tsx`는 hook 호출, Header 배치, 섹션 조합만 담당한다.
  - mock 배열이나 외부 URL 이동 로직을 직접 들지 않는다.
- future API:
  - API가 붙으면 hook 안에서 query로 교체하고, 섹션 props shape는 가능한 유지한다.
  - query key factory와 API helper가 필요해지면 data-layer 문서 기준으로 page-local에서 시작한다.

## State

- local state:
  - none in page component
  - carousel index는 HDS `Carousel`의 uncontrolled state를 우선 사용한다.
- form state:
  - none
- URL state:
  - none
- server state:
  - none in MVP
  - future owner: `useMagazinesPage`
- derived state:
  - `hasHeroBanners`
  - `hasRecommendedMagazines`
  - owner: `useMagazinesPage`

## UI Structure

```text
MagazinesPage
  useMagazinesPage
  Header
  MagazineHeroBannerSection
    Carousel.Root
      Carousel.Viewport
        Carousel.Track
          MagazineHeroBannerSlide x n
      Carousel.Indicator
  RecommendedMagazineSection
    MagazineListItem x n
    MagazineEmptyState?
```

## Component Mapping

- HDS component:
  - `Header`: 상단 제목과 left action slot
  - `IconButton`: 뒤로가기 아이콘 버튼
  - `Carousel`: 대표 매거진 배너 swipe/indicator
- app shared component:
  - none
- page-local component:
  - `MagazineHeroBannerSection`
  - `MagazineHeroBannerSlide`
  - `RecommendedMagazineSection`
  - `MagazineListItem`
  - `MagazineEmptyState`
- page-local hook:
  - `useMagazinesPage`
- page-local mock:
  - `magazines.mock.ts`
- page-local util:
  - `formatMagazinePublishedDate` if API/mock stores dates as ISO strings and UI needs `YYYY. MM. DD.` format
- icon:
  - `BackIcon`

### Deliberately Not Used In MVP

- `Chip`: category filters are removed from scope.
- `Tabs`: category filters are removed from scope and the UI does not require tab semantics.
- `FilterBottomSheet`: category filters are removed from scope.
- new HDS component: magazine card/banner content is product-specific and should remain page-local.

## Public API

Route-local components are not exported outside `apps/client/src/pages/magazines`.

Recommended page hook return shape:

```ts
type MagazineHeroBanner = {
  id: string
  imageUrl: string
  instagramUrl: string | null
  displayOrder: number
  accessibilityLabel: string
}

type RecommendedMagazine = {
  id: string
  title: string
  imageUrl: string
  publishedDate: string
  instagramUrl: string | null
}

type UseMagazinesPageReturn = {
  heroBanners: MagazineHeroBanner[]
  recommendedMagazines: RecommendedMagazine[]
  hasHeroBanners: boolean
  hasRecommendedMagazines: boolean
  handleBackClick: () => void
}
```

Hero banners and magazine cards render semantic `<a>` elements only when the hook returns a valid `instagramUrl`. The hook owns the data boundary, Instagram URL normalization, and back navigation, while valid link activation stays native.

## Error Handling

- API error: none in MVP
- validation error: none
- exceptional case:
  - missing or invalid external URL: normalize to `null` in `useMagazinesPage`, then render the item as disabled-looking text content; do not crash the page.
  - broken image URL: rely on browser image behavior in MVP; future API work may add page-local fallback.
- user-facing message:
  - empty recommended list: `아직 추천 매거진이 없어요.`
- retry or fallback: none in MVP

## Navigation

- entry:
  - home page or any link to `ROUTES.magazines`
- links:
  - hero banner external Instagram post URL
  - magazine card external Instagram post URL
- route params:
  - none
- search params:
  - none
- success redirect:
  - none
- failure redirect:
  - none
- back behavior:
  - `navigate(ROUTES.home)`
- auth redirect:
  - none
- external navigation:
  - use semantic `<a href={instagramUrl}>` when possible.
  - use disabled-looking non-anchor content when `instagramUrl` is missing or invalid.
  - if app/WebView policy later requires bridge handling, keep that behavior inside `useMagazinesPage` or a page-local helper, not inside HDS.

## Styling

- Tailwind layout:
  - mobile-first, `RootLayout` mobile frame 기준
  - root background `bg-white`
  - header는 모바일 프레임 상단에 `fixed top-0 right-0 left-0 z-20 mx-auto w-full max-w-[var(--app-mobile-max-width)] bg-white`로 고정한다.
  - header는 캐러셀 인디케이터보다 높은 layer에 있어야 하므로 콘텐츠 layer보다 높은 z-index를 사용한다.
  - fixed header가 콘텐츠를 덮지 않도록 본문에 header height만큼 top padding을 둔다.
- representative banner:
  - full-width visual area below header
  - viewport height is `260px`.
  - image uses `object-cover`.
  - title/description overlay is not rendered because those are included in the banner image.
  - indicator uses `Carousel.Indicator align="end"` to avoid overlay text collision.
- recommendation section:
  - horizontal padding uses `px-5` except the full-width banner.
  - title has `28px` top spacing from the hero banner.
  - list has `12px` top spacing from the title.
  - list item uses text column and fixed image area.
  - list item vertical padding is `14px`.
  - list item title uses `typo-body-6 text-black`.
  - list item image is `164px x 108px`, radius `5px`.
  - list item date uses `typo-caption-1 font-medium text-warm-gray-300`.
  - list item divider uses `border-b border-warm-gray-50`.
  - image keeps a stable width/height so text loading and long copy do not shift layout.
  - title uses line clamp.
  - published date uses muted typography.
- responsive:
  - app mobile frame width를 따른다.
  - narrow mobile viewport에서 image와 text가 겹치지 않아야 한다.
- fixed area:
  - none
- scroll area:
  - whole page scrolls vertically.
- empty/loading/error layout:
  - MVP: empty only for list.
  - future API: hook returns loading/error states and page-local sections render skeleton/error UI.

## Accessibility

- `Header` left action uses `IconButton aria-label="홈으로 돌아가기"`.
- `Carousel.Root` receives an accessible label such as `aria-label="대표 매거진 배너"`.
- carousel slide links have meaningful accessible names through `accessibilityLabel`.
- magazine list is rendered as a semantic list.
- each magazine item is a single interactive target.
- magazine thumbnail images use empty `alt` because the surrounding link is already named by title and date text.
- external links should preserve native link behavior.
- text-only icon buttons are not introduced.
- filter controls are not rendered, so there are no hidden or disabled category filter controls.

## Verification

- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [x] `corepack pnpm --filter @hashi/client build`
- [x] `corepack pnpm --filter @hashi/client test`
- [ ] route path `/magazines` 직접 진입 확인
- [ ] public route라서 비로그인 접근이 막히지 않는지 확인
- [ ] bottom navigation layout 미포함 확인
- [x] 뒤로가기 버튼이 홈으로 이동하는지 확인
- [ ] 대표 배너 swipe와 indicator 확인
- [x] 대표 배너/매거진 카드 외부 링크 이동 확인
- [x] 카테고리 필터 UI가 렌더링되지 않는지 확인
- [ ] 긴 제목과 좁은 viewport에서 텍스트와 이미지가 겹치지 않는지 확인
