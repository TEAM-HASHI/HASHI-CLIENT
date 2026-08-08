# HASHI SEO Static Prerendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not dispatch subagents for this plan.

**Goal:** Vite SPA를 유지하면서 홈, 하시 PICK, 인기 맛집, 식당·메뉴 상세, 매거진 목록에 검색로봇이 JavaScript 없이 읽을 수 있는 정적 HTML과 정확한 SEO metadata, robots, sitemap, HTTP 404를 제공한다.

**Architecture:** 브라우저와 build가 공유하는 순수 `SeoPage` model과 page builder를 `src/shared/seo`에 둔다. Vite build 후처리 plugin은 public API를 cursor 끝까지 수집해 model별 HTML과 sitemap을 만들고, runtime `SeoProvider`는 SPA 이동 시 같은 model을 document head에 반영한다. Vercel은 생성된 정적 파일을 우선 제공하고 알려진 비색인 SPA route만 전용 noindex shell로 rewrite한다.

**Tech Stack:** React 19, React Router, TypeScript, Vite 7, native `fetch`, Vitest, Testing Library, Vercel static routing, pnpm

## Global Constraints

- package manager는 `pnpm`만 사용한다.
- 대표 origin은 `https://www.hashi.kr`다.
- 색인 대상은 `/`, `/restaurants/hashi-pick`, `/restaurants/popular`, 실제 `/restaurants/{restaurantId}`, 실제 `/restaurants/{restaurantId}/menus/{menuId}`, `/magazines`다.
- `/magazines/:magazineId`, 검색·오늘의 식당·지도·임시 화면, 인증·예약·리뷰·OAuth 화면은 사이트맵에서 제외한다.
- source HTML의 기존 네이버 사이트 소유 확인 meta를 보존한다.
- API 데이터와 사용자를 대상으로 같은 HTML을 제공하며 user-agent 분기를 만들지 않는다.
- 새 runtime dependency나 SSR framework를 추가하지 않는다.
- production code는 관련 test가 먼저 실패하는 것을 확인한 뒤 작성한다.
- 사용자가 명시적으로 요청하기 전에는 commit, push, PR을 만들지 않는다. 각 task는 diff checkpoint로 끝낸다.
- 기존 사용자 변경인 `apps/client/index.html`의 네이버 인증 meta를 삭제하거나 되돌리지 않는다.

---

## File Structure

### Shared runtime/build model

- Create: `apps/client/src/shared/seo/types.ts`
  - `SeoPage`, `SeoLink`, `SeoSnapshot`, `SeoRestaurant`, `SeoMenu`, `SeoMagazine` 계약을 정의한다.
- Create: `apps/client/src/shared/seo/pageBuilders.ts`
  - page 유형별 title, description, canonical, robots, Open Graph, JSON-LD를 생성한다.
- Create: `apps/client/src/shared/seo/routePolicy.ts`
  - pathname을 indexable candidate, public noindex, private noindex, not-found 정책으로 분류한다.
- Create: `apps/client/src/shared/seo/serializeSeo.ts`
  - 안전한 JSON-LD, HTML text/attribute, XML escape를 제공한다.
- Create: `apps/client/src/shared/seo/SeoProvider.tsx`
  - route fallback model과 page registration을 한 곳에서 document head에 반영한다.
- Create: `apps/client/src/shared/seo/PageSeo.tsx`
  - page가 현재 `SeoPage`를 provider에 등록하는 declarative boundary다.
- Create: `apps/client/src/shared/seo/index.ts`
  - browser page가 사용하는 public export만 노출한다.
- Test: `apps/client/src/shared/seo/pageBuilders.test.ts`
- Test: `apps/client/src/shared/seo/routePolicy.test.ts`
- Test: `apps/client/src/shared/seo/SeoProvider.test.tsx`

### Build-only SEO pipeline

- Create: `apps/client/seo/types.ts`
  - build API envelope와 완성된 inventory 계약을 정의한다.
- Create: `apps/client/seo/seoApiClient.ts`
  - public endpoint용 native fetch client, retry, timeout을 구현한다.
- Create: `apps/client/seo/collectSeoInventory.ts`
  - restaurant, menu, magazine cursor를 끝까지 수집하고 중복·cursor loop를 검증한다.
- Create: `apps/client/seo/renderSeoDocument.ts`
  - Vite HTML template에 head와 visible semantic snapshot을 삽입한다.
- Create: `apps/client/seo/renderSitemap.ts`
  - concrete canonical URL로 XML과 robots text를 만든다.
- Create: `apps/client/seo/generateSeoArtifacts.ts`
  - page model 생성, 파일 쓰기, artifact 상호 검증을 조립한다.
- Create: `apps/client/seo/seoPrerenderPlugin.ts`
  - Vite `closeBundle`에서 generator를 실행한다.
- Test: `apps/client/seo/seoApiClient.test.ts`
- Test: `apps/client/seo/collectSeoInventory.test.ts`
- Test: `apps/client/seo/renderSeoDocument.test.ts`
- Test: `apps/client/seo/renderSitemap.test.ts`
- Test: `apps/client/seo/generateSeoArtifacts.test.ts`
- Test: `apps/client/seo/vercelRouting.test.ts`

### Existing integration files

- Modify: `apps/client/src/app/layout/RootLayout.tsx`
  - route subtree를 `SeoProvider`로 감싼다.
- Modify: `apps/client/src/pages/home/HomePage.tsx`
- Modify: `apps/client/src/features/restaurantList/RestaurantListPage.tsx`
- Modify: `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.tsx`
- Modify: `apps/client/src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.tsx`
- Modify: `apps/client/src/pages/magazines/MagazinesPage.tsx`
- Modify: `apps/client/src/pages/notFound/NotFoundPage.tsx`
  - 각 page가 view-ready data로 `SeoPage`를 등록한다.
- Modify: relevant page tests
  - runtime title, canonical, robots와 JSON-LD를 검증한다.
- Modify: relevant page `*.spec.md`
  - SEO metadata와 색인 정책을 page contract에 추가한다.
- Modify: `apps/client/index.html`
  - 전역 ownership meta를 보존하고 generic shell을 `noindex, nofollow`로 만든다.
- Modify: `apps/client/vite.config.ts`
  - production build plugin과 Workbox exclude를 조립한다.
- Modify: `apps/client/vitest.config.ts`
  - `seo/**/*.test.ts`를 Node test 대상으로 포함한다.
- Modify: `apps/client/tsconfig.node.json`
  - build-only SEO TypeScript를 typecheck 범위에 포함한다.
- Modify: `vercel.json`
  - catch-all rewrite를 제거하고 public/private noindex shell rewrite와 실제 404를 설정한다.
- Modify: `docs/architecture/routing-and-access-policy.md`
- Modify: `docs/architecture/data-layer.md`
  - 색인 route와 build-time public API boundary를 source of truth에 반영한다.

---

### Task 1: Build the shared SEO page model

**Files:**

- Create: `apps/client/src/shared/seo/types.ts`
- Create: `apps/client/src/shared/seo/pageBuilders.ts`
- Create: `apps/client/src/shared/seo/routePolicy.ts`
- Create: `apps/client/src/shared/seo/serializeSeo.ts`
- Create: `apps/client/src/shared/seo/index.ts`
- Test: `apps/client/src/shared/seo/pageBuilders.test.ts`
- Test: `apps/client/src/shared/seo/routePolicy.test.ts`

**Interfaces:**

- Produces: `SeoPage`
- Produces: `createHomeSeoPage`, `createRestaurantListSeoPage`, `createRestaurantDetailSeoPage`, `createMenuDetailSeoPage`, `createMagazineListSeoPage`, `createNotFoundSeoPage`
- Produces: `getRouteSeoFallback(pathname: string): SeoPage`
- Produces: `serializeJsonLd(value: unknown): string`, `escapeHtmlText`, `escapeHtmlAttribute`, `escapeXml`
- Consumes later: runtime provider and build artifact generator

- [x] **Step 1: Write failing page-builder tests**

Create tests that express the public API before implementation:

```ts
const page = createRestaurantDetailSeoPage({
  id: '123',
  name: '스시 하시',
  summary: '시부야 오마카세',
  address: '도쿄도 시부야구',
  images: ['https://cdn.hashi.kr/123.webp'],
  rating: 4.8,
  reviewCount: 24,
  cuisine: 'sushi',
  menus: [],
})

expect(page.canonical).toBe('https://www.hashi.kr/restaurants/123')
expect(page.title).toBe('스시 하시 | 일본 맛집 정보·메뉴·예약 | HASHI')
expect(page.robots).toBe('index, follow')
expect(page.structuredData).toContainEqual(
  expect.objectContaining({ '@type': 'Restaurant', name: '스시 하시' }),
)
```

Add cases for menu canonical, fallback descriptions, missing rating omission, default image, list `ItemList`, magazine `CollectionPage`, query/hash removal and JSON-LD `<` escaping.

- [x] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo/pageBuilders.test.ts src/shared/seo/routePolicy.test.ts
```

Expected: FAIL because the SEO modules do not exist.

- [x] **Step 3: Implement the minimal model and builders**

Use this central shape:

```ts
export interface SeoPage {
  canonical: string
  description: string
  image: string
  robots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow'
  snapshot: SeoSnapshot
  structuredData: Record<string, unknown>[]
  title: string
  type: 'website'
}
```

Make every canonical start with `https://www.hashi.kr`. Use `https://www.hashi.kr/icons/pwa-512x512.png` as the image fallback. Build `Restaurant`, `MenuItem`, `BreadcrumbList`, `Organization`, `WebSite`, `CollectionPage` and `ItemList` only from passed visible data.

- [x] **Step 4: Implement route fallback classification**

Classify exact static routes first, then numeric dynamic patterns:

```ts
const INDEXABLE_RESTAURANT_PATTERN = /^\/restaurants\/[1-9]\d*$/
const INDEXABLE_MENU_PATTERN = /^\/restaurants\/[1-9]\d*\/menus\/[1-9]\d*$/
```

Known search/utility routes return `noindex, follow`; auth, reservation, review, callback and unknown routes return `noindex, nofollow`. Indexable candidates receive a safe route-specific fallback until page data registers.

- [x] **Step 5: Run tests and verify GREEN**

Run the focused command from Step 2. Expected: all SEO builder and route policy tests PASS without console warnings.

- [x] **Step 6: Review the task diff without committing**

Run:

```bash
git diff --check
git status --short --untracked-files=all
```

Confirm only Task 1 files and the pre-existing `apps/client/index.html` user change are present. Do not commit.

---

### Task 2: Add one runtime head lifecycle for SPA navigation

**Files:**

- Create: `apps/client/src/shared/seo/SeoProvider.tsx`
- Create: `apps/client/src/shared/seo/PageSeo.tsx`
- Test: `apps/client/src/shared/seo/SeoProvider.test.tsx`
- Modify: `apps/client/src/shared/seo/index.ts`
- Modify: `apps/client/src/app/layout/RootLayout.tsx`
- Modify: `apps/client/src/pages/notFound/NotFoundPage.tsx`

**Interfaces:**

- Produces: `SeoProvider({ children })`
- Produces: `PageSeo({ page })`
- Consumes: `SeoPage`, `getRouteSeoFallback`
- Side effect: owns only tags carrying `data-hashi-seo`, plus `document.title`

- [x] **Step 1: Write failing lifecycle tests**

Render a memory router with `SeoProvider` and assert:

```tsx
expect(document.title).toBe('스시 하시 | 일본 맛집 정보·메뉴·예약 | HASHI')
expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
  'href',
  'https://www.hashi.kr/restaurants/123',
)
expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
  'content',
  'index, follow',
)
expect(
  document.querySelectorAll('script[type="application/ld+json"]'),
).toHaveLength(1)
```

Navigate to `/mypage` and verify the previous canonical and JSON-LD are removed and robots becomes `noindex, nofollow`. Registering `createNotFoundSeoPage` must also override an indexable dynamic fallback with `noindex, nofollow`.

- [x] **Step 2: Run the focused test and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo/SeoProvider.test.tsx
```

Expected: FAIL because provider and page registration do not exist.

- [x] **Step 3: Implement the provider registry**

The provider stores `{ pathname, page, registrationId }`. It renders the registered page only when its pathname matches the current location; otherwise it uses `getRouteSeoFallback(pathname)`. This prevents the previous page metadata from leaking during navigation.

`PageSeo` registers in a layout effect and removes only its own registration during cleanup. The provider applies one title, description, robots, canonical, Open Graph set, Twitter set and JSON-LD set. Preserve favicon, theme, PWA and Naver verification tags.

- [x] **Step 4: Wire the provider and Not Found override**

Wrap the current `RootLayout` route contents with `SeoProvider`. Add `PageSeo` to `NotFoundPage` using the current pathname and `createNotFoundSeoPage` so client-side invalid dynamic URLs do not retain indexable fallback metadata.

- [x] **Step 5: Run focused and router regression tests**

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo/SeoProvider.test.tsx src/app/router/routes.test.tsx
```

Expected: PASS.

- [x] **Step 6: Review the task diff without committing**

Run `git diff --check` and inspect the touched files. Do not commit.

---

### Task 3: Register SEO data on the six indexable page families

**Files:**

- Modify: `apps/client/src/pages/home/HomePage.tsx`
- Modify: `apps/client/src/pages/home/HomePage.test.tsx`
- Modify: `apps/client/src/pages/home/HomePage.spec.md`
- Modify: `apps/client/src/features/restaurantList/RestaurantListPage.tsx`
- Modify: `apps/client/src/pages/hashiPick/HashiPickPage.test.tsx`
- Modify: `apps/client/src/pages/hashiPick/HashiPick.spec.md`
- Modify: `apps/client/src/pages/popularRestaurants/PopularRestaurantsPage.test.tsx`
- Modify: `apps/client/src/pages/popularRestaurants/PopularRestaurants.spec.md`
- Modify: `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.tsx`
- Modify: `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.test.tsx`
- Modify: `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.spec.md`
- Modify: `apps/client/src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.tsx`
- Modify: `apps/client/src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.test.tsx`
- Modify: `apps/client/src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.spec.md`
- Modify: `apps/client/src/pages/magazines/MagazinesPage.tsx`
- Modify: `apps/client/src/pages/magazines/MagazinesPage.test.tsx`
- Modify: `apps/client/src/pages/magazines/MagazinesPage.spec.md`

**Interfaces:**

- Consumes: existing page view models; no new runtime API query or mutation
- Produces: one `PageSeo` registration per successful page render
- Keeps: loading route fallback and Not Found noindex behavior

- [x] **Step 1: Add failing metadata assertions to existing page tests**

For each page family, render its existing successful API fixture and assert the expected title, canonical and robots. Dynamic detail examples:

```ts
expect(document.title).toContain('히마와리 스시')
expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
  'href',
  'https://www.hashi.kr/restaurants/10',
)
```

Menu detail must include both restaurant and menu names. List pages and magazines must emit one `ItemList`. Not Found fixtures must remain `noindex, nofollow`.

- [x] **Step 2: Run all six page test files and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run \
  src/pages/home/HomePage.test.tsx \
  src/pages/hashiPick/HashiPickPage.test.tsx \
  src/pages/popularRestaurants/PopularRestaurantsPage.test.tsx \
  src/pages/restaurantDetail/RestaurantDetailPage.test.tsx \
  src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.test.tsx \
  src/pages/magazines/MagazinesPage.test.tsx
```

Expected: new SEO assertions FAIL because pages have not registered models.

- [x] **Step 3: Add `PageSeo` using view-ready page data**

- Home: use current banners and SNS hot restaurants.
- Restaurant list: use `restaurantType`, `title` and `visibleRestaurants`; query/filter variants retain the base canonical.
- Restaurant detail: use the completed `RestaurantDetail` view model only after loading succeeds.
- Menu detail: use the selected menu, restaurant summary and first page of other menus.
- Magazines: use hero and recommended magazine view models.

Memoize each page model from stable primitive/data dependencies. Do not import OpenAPI types into page components.

- [x] **Step 4: Update the six page specs**

Add an `SEO` section with index state, title/canonical template, description/image fallback, structured data type and loading/404 behavior. Do not duplicate the complete central design; link to `docs/superpowers/specs/2026-08-07-seo-static-prerendering-design.md`.

- [x] **Step 5: Run focused tests and verify GREEN**

Run the six-page command from Step 2. Expected: PASS.

- [x] **Step 6: Review the task diff without committing**

Run `git diff --check` and confirm no unrelated page behavior changed. Do not commit.

---

### Task 4: Collect a complete build-time SEO inventory

**Files:**

- Create: `apps/client/seo/types.ts`
- Create: `apps/client/seo/seoApiClient.ts`
- Create: `apps/client/seo/collectSeoInventory.ts`
- Test: `apps/client/seo/seoApiClient.test.ts`
- Test: `apps/client/seo/collectSeoInventory.test.ts`
- Modify: `apps/client/vitest.config.ts`
- Modify: `apps/client/tsconfig.node.json`

**Interfaces:**

- Produces: `createSeoApiClient({ baseUrl, fetchImpl, wait })`
- Produces: `collectSeoInventory(api): Promise<SeoInventory>`
- Consumes: generated OpenAPI component types only at the build API boundary
- No TanStack Query cache or browser authentication dependency

**API Integration Map:**

| Purpose            | Endpoint                                                   | Params                                                  | Pagination/auth    |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------- | ------------------ |
| 전체 식당 URL      | `GET /api/v1/restaurants`                                  | `genre=all`, `sort=basic`, `size=10`, `cursor?`         | cursor, public     |
| 하시 PICK snapshot | `GET /api/v1/restaurants`                                  | `type=hashi-pick`, `genre=all`, `sort=basic`, `size=10` | first page, public |
| 인기 맛집 snapshot | `GET /api/v1/restaurants`                                  | `type=popular`, `genre=all`, `sort=basic`, `size=10`    | first page, public |
| 홈 인기 식당       | `GET /api/v1/restaurants`                                  | `type=sns-hot`, `size=5`                                | first page, public |
| 식당 SEO 상세      | `GET /api/v1/restaurants/{restaurantId}/summary`           | path ID                                                 | public             |
| 식당 매장 정보     | `GET /api/v1/restaurants/{restaurantId}/store-information` | path ID                                                 | public             |
| 전체 메뉴 URL      | `GET /api/v1/restaurants/{restaurantId}/menus`             | `size=10`, `cursor?`                                    | cursor, public     |
| 매거진 목록        | `GET /api/v1/magazines`                                    | `size=10`, `cursor?`                                    | cursor, public     |
| 홈/매거진 배너     | `GET /api/v1/magazines/banners`                            | none                                                    | public             |

No mutation, query key or cache synchronization is introduced. Runtime queries remain unchanged; this client exists only during production build.

- [x] **Step 1: Extend test/typecheck discovery**

Add `seo/**/*.{test,spec}.ts` to Vitest include and `seo/**/*.ts` to `tsconfig.node.json`. Mark build tests with `// @vitest-environment node`.

- [x] **Step 2: Write failing retry and pagination tests**

Cover:

```ts
expect(fetchImpl).toHaveBeenCalledTimes(3)
expect(wait).toHaveBeenNthCalledWith(1, 500)
expect(wait).toHaveBeenNthCalledWith(2, 1000)
```

For inventory, provide two restaurant pages and two menu pages, then assert all concrete IDs are present once. Add failures for repeated cursor, `hasNext` without cursor, empty restaurants, non-positive IDs, missing names and non-success envelopes.

- [x] **Step 3: Run Node SEO tests and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run seo/seoApiClient.test.ts seo/collectSeoInventory.test.ts
```

Expected: FAIL because build API modules do not exist.

- [x] **Step 4: Implement the native build API client**

Normalize `baseUrl`, apply a 10-second `AbortSignal.timeout`, parse the existing `{ success, data, code, message }` envelope and retry network, timeout and HTTP 5xx failures only. Do not retry 4xx or malformed successful responses. Retry at 500ms and 1,000ms.

- [x] **Step 5: Implement inventory collection**

Traverse cursors sequentially and use at most four concurrent restaurant jobs. Each job fetches summary, store information and all menu pages, validates required fields, then maps to shared `SeoRestaurant`/`SeoMenu` data. Dedupe IDs with `Map` and reject collisions with different content.

- [x] **Step 6: Run Node SEO tests and verify GREEN**

Run the command from Step 3. Expected: PASS.

- [x] **Step 7: Review the task diff without committing**

Run `git diff --check` and inspect `git status`. Do not commit.

---

### Task 5: Generate static HTML, robots and sitemap during Vite build

**Files:**

- Create: `apps/client/seo/renderSeoDocument.ts`
- Create: `apps/client/seo/renderSitemap.ts`
- Create: `apps/client/seo/generateSeoArtifacts.ts`
- Create: `apps/client/seo/seoPrerenderPlugin.ts`
- Test: `apps/client/seo/renderSeoDocument.test.ts`
- Test: `apps/client/seo/renderSitemap.test.ts`
- Test: `apps/client/seo/generateSeoArtifacts.test.ts`
- Modify: `apps/client/index.html`
- Modify: `apps/client/vite.config.ts`

**Interfaces:**

- Produces: `renderSeoDocument(template, page): string`
- Produces: `renderSitemap(pages): string`
- Produces: `generateSeoArtifacts({ apiBaseUrl, outputDir, fetchImpl })`
- Produces: `seoPrerenderPlugin({ apiBaseUrl })`

- [x] **Step 1: Write failing renderer and sitemap tests**

Verify rendered documents contain exactly one title, description, robots and canonical; JSON-LD parses; API strings such as `</script><script>` stay escaped; snapshot has one visible `h1` and real links. Verify sitemap includes every indexable concrete URL once and excludes app shells, magazine detail and private routes.

Add artifact integration fixtures that expect:

```text
dist/index.html
dist/public-noindex-shell.html
dist/private-noindex-shell.html
dist/404.html
dist/robots.txt
dist/sitemap.xml
dist/restaurants/123/index.html
dist/restaurants/123/menus/10/index.html
```

- [x] **Step 2: Run generator tests and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run \
  seo/renderSeoDocument.test.ts \
  seo/renderSitemap.test.ts \
  seo/generateSeoArtifacts.test.ts
```

Expected: FAIL because renderers and generator do not exist.

- [x] **Step 3: Implement safe static document rendering**

Start from built `dist/index.html`, replace its owned title/description/robots/canonical/OG/Twitter/JSON-LD, and replace the empty root with `page.snapshot` semantic HTML. Fail if the expected root or `</head>` marker is missing. Keep Vite asset URLs and the Naver verification meta untouched.

- [x] **Step 4: Implement sitemap, robots and artifact validation**

Write UTF-8 XML with absolute canonical URLs only. Omit `lastmod`, `changefreq` and `priority`. Fail at 50,000 URLs or 50MB uncompressed. Validate that every sitemap path has its expected `index.html` and every generated indexable document has exactly one owned metadata set.

- [x] **Step 5: Integrate with Vite and PWA**

Convert `vite.config.ts` to receive `mode`, load `VITE_API_BASE_URL` with Vite `loadEnv`, and append `seoPrerenderPlugin` only for build. The plugin throws when the API base URL is missing or generation fails.

Adjust Workbox globs so restaurant/menu SEO HTML, `robots.txt`, `sitemap.xml` and `404.html` are not precached. Keep application assets and the runtime shell cache behavior.

Add a default `noindex, nofollow` robots meta to `apps/client/index.html` while preserving the existing Naver verification meta.

- [x] **Step 6: Run generator tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [x] **Step 7: Run client typecheck**

```bash
pnpm --filter @hashi/client typecheck
```

Expected: PASS for both app and Node config references.

- [x] **Step 8: Review the task diff without committing**

Run `git diff --check`. Confirm no secret or API response body was written to tracked files. Do not commit.

---

### Task 6: Replace the catch-all rewrite with explicit SEO-aware routing

**Files:**

- Modify: `vercel.json`
- Create: `apps/client/seo/vercelRouting.test.ts`
- Modify: `docs/architecture/routing-and-access-policy.md`
- Modify: `docs/architecture/data-layer.md`

**Interfaces:**

- Static indexable paths: served from generated filesystem files
- Public noindex paths: rewrite to the clean URL `/public-noindex-shell`
- Private noindex paths: rewrite to the clean URL `/private-noindex-shell`
- Unknown/static-missing paths: Vercel `404.html` with HTTP 404

- [x] **Step 1: Write a failing Vercel routing contract test**

Read root `vercel.json` and assert there is no `/(.*)` rewrite. Assert exact public rewrites for `/search`, `/restaurants/today`, `/map`, `/coming-soon`, `/magazines/:magazineId`; assert private rewrites for saved, mypage, profile, withdrawal, reviews, reservations, login-required and OAuth paths. Assert neither `/restaurants/:restaurantId` nor menu detail has a dynamic SPA rewrite.

- [x] **Step 2: Run the routing test and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run seo/vercelRouting.test.ts
```

Expected: FAIL because `vercel.json` still contains the catch-all rewrite.

- [x] **Step 3: Implement explicit rewrites**

Set `cleanUrls: true` and `trailingSlash: false`. Order specific reservation/review paths before generic parameter paths. Route known public noindex pages to `/public-noindex-shell` and known private pages to `/private-noindex-shell`; Vercel resolves those extensionless destinations to the corresponding `.html` artifacts. Leave indexable dynamic detail patterns without rewrites so only generated files resolve.

- [x] **Step 4: Update architecture docs**

Add an `SEO and HTTP delivery` section to routing policy containing the six indexable families, noindex categories, filesystem-first delivery and the publish-before-expose redeploy contract. Add a `Build-time SEO API boundary` section to data-layer docs explaining native public fetch, generated OpenAPI types, retry/concurrency and no runtime cache ownership.

- [x] **Step 5: Run the routing test and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [x] **Step 6: Review the task diff without committing**

Run `git diff --check`. Do not commit.

---

### Task 7: Verify the complete implementation and generated output

**Files:**

- Verify all changed files
- Update plan checkboxes with actual completion state
- Do not create a commit

- [x] **Step 1: Run focused SEO tests**

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo seo
```

Expected: all SEO unit and integration tests PASS.

- [x] **Step 2: Run all client tests**

```bash
pnpm --filter @hashi/client test
```

Expected: existing and new test suites PASS.

- [x] **Step 3: Run static verification**

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm exec prettier \
  apps/client/src/shared/seo \
  apps/client/seo \
  apps/client/index.html \
  apps/client/vite.config.ts \
  apps/client/vitest.config.ts \
  apps/client/tsconfig.node.json \
  vercel.json \
  docs/architecture/routing-and-access-policy.md \
  docs/architecture/data-layer.md \
  docs/superpowers/plans/2026-08-07-seo-static-prerendering.md \
  --check
git diff --check
```

Expected: all commands PASS.

- [x] **Step 4: Run the production client build**

```bash
pnpm build:client
```

Expected: Vite build and SEO generation PASS using configured `VITE_API_BASE_URL`, with non-zero restaurant/menu counts in the generator summary. If the environment has no reachable API base URL, report the build as externally blocked rather than disabling SEO generation.

- [x] **Step 5: Inspect generated artifacts**

Confirm:

- `robots.txt` is plain text and points to `https://www.hashi.kr/sitemap.xml`.
- `sitemap.xml` parses and contains only canonical indexable URLs.
- a real restaurant and menu document contains visible names before JavaScript.
- public/private shells and 404 are `noindex`.
- no generated HTML contains credentials or serialized response envelopes.

- [x] **Step 6: Run project verification skills**

Use `verify-api-integration` for the build API boundary and `verify-implementation` for final repository-rule coverage. Fix actionable findings and rerun affected checks.

- [x] **Step 7: Report without committing**

Report changed files, generated counts, verification output, docs impact and remaining deployment-only checks. Explicitly state that no commit, push or PR was created. Leave the working tree ready for user review.

---

### Task 8: Preserve initial static SEO until runtime data is authoritative

**Files:**

- Modify: `apps/client/src/shared/seo/SeoProvider.tsx`
- Modify: `apps/client/src/shared/seo/SeoProvider.test.tsx`
- Modify: `apps/client/src/pages/home/HomePage.tsx`
- Modify: `apps/client/src/features/restaurantList/RestaurantListPage.tsx`
- Modify: `apps/client/src/pages/magazines/MagazinesPage.tsx`

**Interfaces:**

- `SeoProvider` preserves one matching initial static `index, follow` metadata set until an authoritative `PageSeo` registration or pathname change.
- List/home/magazine pages register SEO only after the required initial queries settle successfully.
- Confirmed Not Found registrations always override preserved metadata.

- [x] **Step 1: Add failing provider and page tests**

Seed `document.head` with a generated restaurant canonical and `index, follow`, render an indexable route without `PageSeo`, and assert the static metadata remains. Add page assertions that loading/error states do not replace static metadata with empty SEO models.

- [x] **Step 2: Run tests and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo/SeoProvider.test.tsx src/pages/home/HomePage.test.tsx src/pages/magazines/MagazinesPage.test.tsx src/pages/hashiPick/HashiPickPage.test.tsx src/pages/popularRestaurants/PopularRestaurantsPage.test.tsx
```

Expected: provider loading preservation and page readiness assertions FAIL.

- [x] **Step 3: Implement preservation and readiness gating**

Detect the initial owned canonical/robots pair once in `SeoProvider`. Skip fallback application only while it still represents the initial pathname and no authoritative page has registered. Turn preservation off permanently after registration or navigation. Gate list/home/magazine `PageSeo` on successful initial query completion.

- [x] **Step 4: Run tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

---

### Task 9: Fail closed on malformed SEO API data and unsafe external URLs

**Files:**

- Create: `apps/client/src/shared/utils/normalizeInstagramUrl.ts`
- Modify: `apps/client/src/features/magazine/utils/normalizeInstagramUrl.ts`
- Create: `apps/client/seo/validateSeoApiResponse.ts`
- Modify: `apps/client/seo/seoApiClient.ts`
- Modify: `apps/client/seo/seoApiClient.test.ts`
- Modify: `apps/client/seo/collectSeoInventory.ts`
- Modify: `apps/client/seo/collectSeoInventory.test.ts`

**Interfaces:**

- `normalizeInstagramUrl(url: string): string | null` is the only build/runtime external Instagram URL policy.
- Each `SeoApi` method validates its endpoint data shape before returning typed data.
- Malformed success responses and invalid external URLs never produce partial sitemap URLs or live unsafe anchors.

- [x] **Step 1: Add malformed response and unsafe URL tests**

Add table-driven tests for missing arrays, missing/invalid `hasNext`, invalid required cursors, and `javascript:`/non-Instagram redirect URLs.

- [x] **Step 2: Run tests and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run seo/seoApiClient.test.ts seo/collectSeoInventory.test.ts src/pages/magazines/MagazinesPage.test.tsx
```

Expected: malformed endpoint data resolves instead of rejecting and build inventory retains unsafe URLs.

- [x] **Step 3: Implement endpoint guards and shared URL normalization**

Validate endpoint objects, array fields, boolean pagination flags, and cursor types without adding a dependency. Re-export the shared normalizer from the previous feature path for compatibility and normalize build magazine/banner URLs to `null` when invalid.

- [x] **Step 4: Run tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

---

### Task 10: Stabilize runtime SEO inputs and enrich semantic snapshots

**Files:**

- Modify: `apps/client/src/shared/seo/types.ts`
- Modify: `apps/client/src/shared/seo/pageBuilders.ts`
- Modify: `apps/client/src/shared/seo/pageBuilders.test.ts`
- Modify: `apps/client/seo/renderSeoDocument.ts`
- Modify: `apps/client/seo/renderSeoDocument.test.ts`
- Modify: `apps/client/seo/collectSeoInventory.ts`
- Modify: `apps/client/seo/generateSeoArtifacts.ts`
- Modify: relevant home/list/restaurant/menu/magazine page components and tests

**Interfaces:**

- `SeoSnapshot` supports optional label/value facts and meaningful image alt text.
- Restaurant SEO can carry optional formatted business hours and price range.
- Menu SEO emits an `Offer` only from a real non-negative numeric price plus currency.
- Runtime list SEO consumes only the first successful page, capped at 10 items.
- Build and runtime magazine SEO use one merge/deduplication helper.

- [x] **Step 1: Add failing price, fact, image, and first-page tests**

Cover missing menu price, restaurant address/rating/hours/price facts, selected menu price, home banner links, descriptive image alt, lazy list images, and unchanged list `ItemList` after a second infinite page.

- [x] **Step 2: Run tests and verify RED**

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo/pageBuilders.test.ts seo/renderSeoDocument.test.ts src/pages/restaurantMenuDetail/RestaurantMenuDetailPage.test.tsx src/pages/restaurantDetail/RestaurantDetailPage.test.tsx src/pages/home/HomePage.test.tsx src/pages/magazines/MagazinesPage.test.tsx src/pages/hashiPick/HashiPickPage.test.tsx src/pages/popularRestaurants/PopularRestaurantsPage.test.tsx
```

Expected: the new semantic content and stability assertions FAIL.

- [x] **Step 3: Implement the minimal shared model and page mappings**

Extend pure SEO models and builders, retain numeric price semantics, cap or select first-page collections, merge magazine data consistently, and render facts plus optimized images without hidden SEO-only content.

- [x] **Step 4: Run tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

---

### Task 11: Synchronize specs and verify the remediation

**Files:**

- Modify: affected page `*.spec.md`
- Modify: `docs/architecture/data-layer.md`
- Modify: `docs/superpowers/specs/2026-08-07-seo-static-prerendering-design.md`
- Modify: this plan
- Do not create a commit

- [x] **Step 1: Update page and architecture contracts**

Document initial static metadata preservation, first-page SEO ownership, malformed build response failure, shared external URL normalization, and optional snapshot facts.

- [x] **Step 2: Run focused and full verification**

```bash
pnpm --filter @hashi/client exec vitest run src/shared/seo seo
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client test
pnpm --filter @hashi/client build
git diff --check
```

- [x] **Step 3: Inspect generated artifacts**

Parse every generated JSON-LD block, verify unique sitemap URLs and files, confirm unsafe schemes and response envelopes are absent, and confirm indexable static documents retain exactly one metadata set.

- [x] **Step 4: Report without committing**

Summarize changed behavior, tests, generated counts, docs impact and remaining deployment-only URL Inspection checks. Do not commit, push, or open a PR.
