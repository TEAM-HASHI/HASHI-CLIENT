# Page Spec: `Magazines`

Jira: HASHI-77

## Purpose

- 사용자가 HASHI 서비스 안에서 대표 매거진 배너와 추천 매거진 목록을 탐색하고 열람할 수 있게 한다.
- 이번 MVP 범위에서는 카테고리 필터를 구현하지 않으며, UI에서도 인기순/지역별/시리즈별/장르별 필터 영역을 렌더링하지 않는다.
- API 데이터와 이동 로직은 page hook에서 조합하고, UI 컴포넌트는 view-ready props만 렌더링한다.

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
- [x] 대표 매거진 배너 데이터는 이미지와 인스타 게시글 URL을 포함한다.
- [x] 대표 매거진 배너와 추천 매거진 썸네일은 홈 메인 배너와 같은 `353:160` 이미지 비율을 사용한다.
- [x] 대표 매거진 배너를 탭하면 해당 매거진의 외부 인스타 게시글로 이동한다.
- [x] 카테고리 필터는 MVP 범위에서 제외하므로 화면에 렌더링하지 않는다.
- [x] 추천 매거진 목록은 제목, 이미지, 발행일을 포함한다.
- [x] 추천 매거진 카드를 탭하면 해당 매거진의 외부 인스타 게시글로 이동한다.
- [x] 목록 아이템 사이에는 구분선을 보여주되 마지막 아이템에는 불필요한 구분선을 넣지 않는다.
- [x] 긴 제목은 모바일 폭에서 레이아웃을 깨지 않도록 줄 수를 제한한다.
- [x] 배너 링크의 접근성 이름은 호출부 데이터에서 제공한다.
- [x] 추천 매거진 썸네일은 링크 텍스트와 중복되지 않도록 장식 이미지로 처리한다.

## Data Dependencies

### API Integration Map

#### Target

- page or feature: `MagazinesPage`
- existing mock/source file: none
- route params: none
- search params: none
- required auth: no
  - Home and Magazines are public screens.

#### Source Docs

- generated API type:
  - `apps/client/src/shared/api/generated/openapi.ts`
- endpoints:
  - `GET /api/v1/magazines`
  - `GET /api/v1/magazines/banners`
- notes:
  - `/api/v1/magazines` is latest-first cursor pagination.
  - `/api/v1/magazines/banners` returns the latest 5 magazine banners.
  - banner/card click opens `instagramRedirectUrl`.

#### Queries

| UI area          | Endpoint                        | Params                             | Response data                                       | Query key                                      | Mode       | Enabled | States                                          |
| ---------------- | ------------------------------- | ---------------------------------- | --------------------------------------------------- | ---------------------------------------------- | ---------- | ------- | ----------------------------------------------- |
| 대표 매거진 배너 | `GET /api/v1/magazines/banners` | none                               | `data.banners`                                      | `magazineQueryKeys.banners()`                  | `query`    | always  | loading/error/empty/success                     |
| 추천 매거진 목록 | `GET /api/v1/magazines`         | `cursor?: number`, `size?: number` | `data.magazines`, `data.nextCursor`, `data.hasNext` | `magazineListQueryKeys.infiniteList({ size })` | `infinite` | always  | loading/error/empty/success/background fetching |

#### Query Placement

- magazine banner endpoint/query starts feature-local because Home also uses `GET /api/v1/magazines/banners`:
  - `apps/client/src/features/magazine/api/getMagazineBanners.ts`
  - `apps/client/src/features/magazine/queries/magazineQueryKeys.ts`
  - `apps/client/src/features/magazine/queries/magazineBannerQueryOptions.ts`
  - `apps/client/src/features/magazine/hooks/useMagazineBannersQuery.ts`
  - `apps/client/src/features/magazine/types.ts` if OpenAPI aliases or shared banner view model types are reused across Home and Magazines
- magazine list endpoint/query stays page-local until another screen uses the same cursor list contract:
  - `apps/client/src/pages/magazines/api/getMagazines.ts`
  - `apps/client/src/pages/magazines/queries/magazineListQueryKeys.ts`
  - `apps/client/src/pages/magazines/queries/magazineListQueryOptions.ts`
  - `apps/client/src/pages/magazines/hooks/useMagazinesInfiniteQuery.ts`
  - `apps/client/src/pages/magazines/types.ts` if OpenAPI aliases or page-local list view model types are shared by multiple page files
- `useMagazinesPage` remains the page orchestration boundary.
- `MagazinesPage`, section components, and list item components do not import `request`, query keys, or generated API types directly.

#### Query Mode Decision

- `GET /api/v1/magazines/banners`
  - Use `useQuery`, not `useSuspenseQuery`, unless the final UX intentionally makes route-level fallback cover the entire page.
  - Reason: the page has two independent queries and the banner can have an empty/local failure state without blocking the whole list.
- `GET /api/v1/magazines`
  - Use `useInfiniteQuery`.
  - Send `size: 10` to match the existing infinite-list page size convention.
  - `initialPageParam` is `null`; the endpoint helper omits `cursor` for the first page.
  - `getNextPageParam` returns `nextCursor` only when `hasNext === true`; otherwise it returns `undefined`.
  - Fetch the next page through a bottom sentinel when `hasNextPage` is true and no next-page request is already pending.
  - Use the shared infinite-scroll trigger hook so repeated observer callbacks in the same render cycle do not request the same next page twice.
  - If fetched pages have no usable normalized items but `hasNextPage` is still true, request the next page until a usable item appears or the last page is reached.

#### Type Mapping

| API field                                      | UI use                           | Nullable/optional          | Transform                                                                                     |
| ---------------------------------------------- | -------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `MagazineBannerResponse.magazineId`            | banner `id`, React key           | optional in generated type | convert to string; item is unusable if missing                                                |
| `MagazineBannerResponse.title`                 | banner accessible label fallback | optional                   | fallback to `매거진 배너`                                                                     |
| `MagazineBannerResponse.bannerImageUrl`        | banner image `src`               | optional                   | item is unusable if missing                                                                   |
| `MagazineBannerResponse.instagramRedirectUrl`  | banner external link             | optional                   | validate through `normalizeInstagramUrl`; invalid value becomes `null`                        |
| `MagazineSummaryResponse.magazineId`           | list item `id`, React key        | optional in generated type | convert to string; item is unusable if missing                                                |
| `MagazineSummaryResponse.title`                | list item title/link name        | optional                   | item is unusable if missing                                                                   |
| `MagazineSummaryResponse.thumbnailImageUrl`    | list item thumbnail `src`        | optional                   | item is unusable if missing                                                                   |
| `MagazineSummaryResponse.instagramRedirectUrl` | list item external link          | optional                   | validate through `normalizeInstagramUrl`; invalid value becomes `null`                        |
| `MagazineSummaryResponse.createdAt`            | published date                   | optional, `date-time`      | use the server date part and format as `YYYY. MM.DD.`; item is unusable if missing or invalid |
| `MagazineListResponse.nextCursor`              | next page cursor                 | optional                   | pass as next page param only when `hasNext` is true                                           |
| `MagazineListResponse.hasNext`                 | load-more availability           | optional                   | omitted value means no next page in the first implementation                                  |

#### UI States

- initial loading:
  - keep the fixed `Header` visible.
  - render page-local skeletons or placeholders for banner and list areas.
- background fetching:
  - keep current content visible.
  - next-page fetching must not shift existing list items.
- empty:
  - if `banners` is empty or all banner items are unusable, do not render the hero banner section.
  - if all magazine pages are empty, show `MagazineEmptyState` with `아직 추천 매거진이 없어요.`
  - if no usable list item is rendered yet but `hasNextPage` is true, do not show the empty state until the next page fetch resolves.
- error:
  - expected `4xx` stays local to the page/query state.
  - `5xx`, network, and timeout errors follow the global QueryClient `throwOnError` policy and may be caught by `AsyncBoundary`.
  - retry UI should call the query refetch/reset path rather than bypass TanStack Query.
- success:
  - normalize API data to existing `MagazineHeroBanner` and `RecommendedMagazine` UI types before rendering sections.

#### Mutations

- none

#### Implementation Decisions

- Use `size: 10` for `/api/v1/magazines`.
- Auto-fetch additional pages with an IntersectionObserver bottom sentinel.
- Drop list items that miss `magazineId`, `title`, `thumbnailImageUrl`, or valid `createdAt`.
- Drop banner items that miss `magazineId` or `bannerImageUrl`; use `매거진 배너` when `title` is missing.
- Treat non-Instagram or malformed `instagramRedirectUrl` as `null`; render the item without native link navigation instead of crashing.
- Keep banner/list failures local to the section for expected `4xx`; shared QueryClient/AsyncBoundary handles `5xx`, network, timeout, and unexpected errors.

### Mutation

- mutation: none
- request data: none
- submit enabled condition: none
- success handling: none
- failure handling: none

## Mock And API Boundary

- legacy mock data:
  - removed after API integration.
- page hook:
  - `apps/client/src/pages/magazines/hooks/useMagazinesPage.ts`
  - shared banner query와 page-local infinite list query를 조합한다.
  - 뒤로가기 이동 로직을 소유한다.
  - 외부 인스타 URL 정규화와 검증 로직을 소유한다.
- page:
  - `MagazinesPage.tsx`는 hook 호출, Header 배치, 섹션 조합만 담당한다.
  - mock 배열이나 외부 URL 이동 로직을 직접 들지 않는다.
- API:
  - `GET /api/v1/magazines/banners`는 홈에서도 사용하므로 `features/magazine`의 shared feature query로 시작한다.
  - `GET /api/v1/magazines` 목록 query는 매거진 리스트 페이지 전용이므로 page-local에서 시작한다.
  - generated API type은 endpoint helper에서만 참조하고 UI component로 흘리지 않는다.

## State

- local state:
  - none in page component
  - carousel index는 HDS `Carousel`의 uncontrolled state를 우선 사용한다.
- form state:
  - none
- URL state:
  - none
- server state:
  - `GET /api/v1/magazines/banners`
  - `GET /api/v1/magazines`
  - owner:
    - banner endpoint/query: `features/magazine`
    - list endpoint/query: page-local `api/`, `queries/`, `hooks/`, composed by `useMagazinesPage`
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
- shared hook:
  - `useInfiniteScrollTrigger`
- page-local mock:
  - none
- page-local util:
  - `formatMagazinePublishedDate` formats API `createdAt` date strings as `YYYY. MM.DD.`
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

- API error:
  - `ApiError` and `HttpStatusError` keep HTTP status through the shared `request` helper.
  - expected `4xx` errors should be handled locally if the endpoint remains public.
  - `5xx`, timeout, network, and unexpected errors may go to `AsyncBoundary` according to shared QueryClient policy.
- validation error: none
- exceptional case:
  - missing or invalid external URL: normalize to `null` in `useMagazinesPage`, then render the item as disabled-looking text content; do not crash the page.
  - broken image URL: rely on browser image behavior unless product approves a page-local or shared fallback.
- user-facing message:
  - empty recommended list: `아직 추천 매거진이 없어요.`
- retry or fallback:
  - use TanStack Query refetch/reset; do not call endpoint helpers directly from UI events.

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
  - visual area below header uses horizontal page padding `px-5`.
  - visual area starts `4px` below the fixed header content offset.
  - viewport keeps the shared magazine image ratio `353:160`.
  - image uses `object-cover`.
  - title/description overlay is not rendered because those are included in the banner image.
  - indicator uses `Carousel.Indicator align="end"` to avoid overlay text collision.
  - indicator keeps `13px` horizontal inset from the image edge, which is `33px` from the padded carousel root edge.
- recommendation section:
  - horizontal padding uses `px-5`.
  - large section heading such as `최근 _한 추천 매거진` is not rendered.
  - list starts `20px` below the hero banner.
  - list uses `20px` gap between items.
  - list item uses text column and fixed image area.
  - list item text/image column gap is `21px`.
  - list item top padding is `20px` and bottom padding is `8px`.
  - list item title uses `typo-body-6 text-black`.
  - list item image width is `164px`, keeps the shared magazine image ratio `353:160`, and uses radius `5px`.
  - list item date uses `typo-caption-1 font-medium text-warm-gray-300`.
  - list item divider uses `border-b border-warm-gray-50`.
  - image keeps a stable width/aspect ratio so text loading and long copy do not shift layout.
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
  - list empty state is rendered by `RecommendedMagazineSection`.
  - loading/error states come from TanStack Query and page-local sections render section-level states.

## Accessibility

- `Header` left action uses `IconButton aria-label="홈으로 돌아가기"`.
- `Carousel.Root` receives an accessible label such as `aria-label="대표 매거진 배너"`.
- carousel slide links have meaningful accessible names through `accessibilityLabel`.
- recommended magazine section does not use a visible heading; if the section needs an accessible name, use `aria-label="추천 매거진 목록"` instead of an off-design visible title.
- magazine list is rendered as a semantic list.
- each magazine item is a single interactive target.
- magazine thumbnail images use empty `alt` because the surrounding link is already named by title and date text.
- external links should preserve native link behavior.
- text-only icon buttons are not introduced.
- filter controls are not rendered, so there are no hidden or disabled category filter controls.

## Verification

- API integration spec update:
  - [x] implementation decisions are reflected in the spec
  - [ ] `corepack pnpm --filter @hashi/client lint`
  - [ ] `corepack pnpm --filter @hashi/client typecheck`
  - [ ] `corepack pnpm --filter @hashi/client test`
  - [ ] `corepack pnpm --filter @hashi/client build`
  - [ ] API success: banners render latest 5 items
  - [ ] API success: magazines render first page and next page according to chosen pagination UI
  - [ ] API empty: banner section hides when no usable banners exist
  - [ ] API empty: recommended empty state appears when no usable magazines exist
  - [ ] API error: local or boundary retry works according to final query mode
  - [ ] latest design: `최근 _한 추천 매거진` heading is not rendered above the list
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
