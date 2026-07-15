# HASHI-136 Public Page SEO Prerender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React Router Framework Mode의 `ssr: false` 프리렌더링으로 핵심 공개 페이지의 실제 콘텐츠, SEO metadata, 구조화 데이터, robots와 sitemap을 빌드 산출물에 생성한다.

**Architecture:** 기존 page와 feature UI는 유지하고 route object만 Framework Mode route module로 이전한다. 빌드 전 공개 식당 ID를 검증한 manifest를 만들고, React Router prerender 설정과 sitemap resource route가 이 manifest를 함께 사용한다. 공개 route loader/clientLoader는 독립 QueryClient에 데이터를 채워 dehydrated state를 반환하고 기존 query hook을 `HydrationBoundary`로 재사용한다.

**Tech Stack:** React 19, React Router 7 Framework Mode, Vite 8, TanStack Query 5, Vitest, TypeScript, Vercel, vite-plugin-pwa, Sentry

## Global Constraints

- 런타임 SSR과 Vercel Function을 만들지 않고 `ssr: false`를 유지한다.
- `/`, `/restaurants/hashi-pick`, `/restaurants/popular`, `/magazines`, 검증된 `/restaurants/:restaurantId`만 색인·프리렌더링한다.
- 기존 page UI와 API query option을 재사용하며 관리자 앱과 `vercel.admin.json`은 변경하지 않는다.
- 운영 canonical origin은 `https://www.hashi.kr`로 고정한다.
- 필수 데이터 실패는 빌드 실패, banner/review 선택 데이터 실패는 empty cache로 대체한다.
- 각 기능 변경은 실패 테스트를 먼저 확인한 뒤 최소 구현으로 통과시킨다.

---

### Task 1: Framework Mode 기반과 route matrix 이전

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `apps/client/package.json`
- Modify: `apps/client/vite.config.ts`
- Create: `apps/client/react-router.config.ts`
- Create: `apps/client/src/root.tsx`
- Create: `apps/client/src/routes.ts`
- Create: `apps/client/src/entry.client.tsx`
- Create: `apps/client/src/app/routes/*.tsx`
- Modify: `apps/client/src/app/providers/QueryProvider.tsx`
- Modify: `apps/client/src/app/providers/AuthSessionRestoreGate.tsx`
- Modify: `apps/client/src/app/providers/AuthSessionRestoreGate.test.tsx`
- Replace: `apps/client/src/app/router/routes.test.tsx`
- Remove after migration: `apps/client/index.html`, `apps/client/src/app/main.tsx`, `apps/client/src/app/App.tsx`, `apps/client/src/app/router/router.tsx`, `apps/client/src/app/router/routes.ts`, `apps/client/src/app/router/lazy.ts` and obsolete tests/exports

- [ ] Add catalog entries and client dependencies for `@react-router/dev` and direct `react-router`; change scripts to `react-router dev`, `react-router build`, `react-router typegen && tsc -b`, and `react-router-serve build/server/index.js` only if preview needs the official static/SPA server.
- [ ] Write a route matrix test that asserts every existing `ROUTES` path is represented in Framework route config and public/guard/layout relationships are preserved; run `pnpm --filter @hashi/client test -- routes.test.tsx` and confirm it fails before the route config exists.
- [ ] Add the React Router Vite plugin before PWA/Sentry plugins and create `react-router.config.ts` with `ssr: false`, `buildDirectory: 'dist'`, and manifest-backed `prerender` paths.
- [ ] Create the HTML document root with global styles, favicon/apple metadata, `Links`, `Meta`, `Scripts`, `ScrollRestoration`, Sentry boundary, isolated `QueryProvider`, `AuthSessionRestoreGate`, and `Outlet`.
- [ ] Move Sentry browser initialization to `entry.client.tsx` and hydrate with `HydratedRouter`.
- [ ] Express the current route tree with `@react-router/dev/routes`; create small route modules that re-export existing pages/layouts and retain `AuthOnlyRoute`, `GuestOnlyRoute`, bottom navigation, and not-found behavior.
- [ ] Change `QueryProvider` from the module singleton to one `createQueryClient()` instance per root render, while retaining one instance for the browser app lifetime.
- [ ] Make server rendering non-blocking and recognize all approved public paths in `AuthSessionRestoreGate`; keep private SPA routes blocked during browser auth restoration.
- [ ] Run focused auth/route tests, type generation, and typecheck; remove legacy router bootstrap files only after the Framework route matrix passes.
- [ ] Commit: `Feat(seo): React Router Framework Mode로 라우팅 이전`

### Task 2: SEO policy, metadata, and structured data

**Files:**

- Create: `apps/client/src/shared/seo/seoConfig.ts`
- Create: `apps/client/src/shared/seo/metadata.ts`
- Create: `apps/client/src/shared/seo/metadata.test.ts`
- Create: `apps/client/src/shared/seo/structuredData.ts`
- Create: `apps/client/src/shared/seo/structuredData.test.ts`
- Create: `apps/client/src/app/routes/noindex.ts`
- Modify: public and non-index route modules under `apps/client/src/app/routes/`

- [ ] Write failing tests for canonical normalization, page title/description/Open Graph descriptors, optional restaurant `og:image`, `WebSite`/`Organization` JSON-LD, `Restaurant` JSON-LD, and `noindex,nofollow` metadata.
- [ ] Implement `SEO_ORIGIN = 'https://www.hashi.kr'`, safe absolute URL creation, descriptor helpers, and JSON-LD builders without rating/review/price fields.
- [ ] Add static metadata to home, Hashi Pick, popular, and magazine route modules.
- [ ] Add `noindex,nofollow` metadata to search, today, menu detail, magazine detail, auth/private/utility, and wildcard route modules.
- [ ] Run `pnpm --filter @hashi/client test -- metadata.test.ts structuredData.test.ts` and confirm all cases pass.
- [ ] Commit: `Feat(seo): 공개 페이지 메타데이터와 구조화 데이터 추가`

### Task 3: Build-time public restaurant manifest

**Files:**

- Create: `apps/client/scripts/seo/public-route-manifest.mjs`
- Create: `apps/client/scripts/seo/public-route-manifest.test.ts`
- Create: `apps/client/scripts/seo/generate-public-route-manifest.mjs`
- Create: `apps/client/scripts/seo/fixtures/public-api.json`
- Modify: `apps/client/package.json`
- Modify: `.gitignore`

- [ ] Write failing tests for cursor traversal, duplicate ID removal, repeated cursor rejection, page limit, malformed envelope rejection, detail 404 skip/warning, network/5xx failure, and production API URL validation.
- [ ] Implement dependency-injected discovery using `fetch`, a 100-page safety limit, positive-safe-integer ID validation, and bounded detail-summary validation.
- [ ] Write `.seo/public-route-manifest.json` atomically with the four static public paths plus successful restaurant detail paths; support `SEO_API_FIXTURE_PATH` only outside production for deterministic tests/build verification.
- [ ] Reject missing/localhost/dev API origins when `VERCEL_ENV=production`; allow explicit non-production fixture or configured API URL for local/preview.
- [ ] Prefix `build` with manifest generation and ignore `apps/client/.seo/`.
- [ ] Run `pnpm --filter @hashi/client test -- public-route-manifest.test.ts`.
- [ ] Commit: `Feat(seo): 공개 식당 프리렌더 경로 manifest 생성`

### Task 4: Public loader hydration and restaurant metadata

**Files:**

- Create: `apps/client/src/shared/seo/publicRouteData.ts`
- Create: `apps/client/src/shared/seo/publicRouteData.test.ts`
- Modify: `apps/client/src/app/routes/home.tsx`
- Modify: `apps/client/src/app/routes/hashi-pick.tsx`
- Modify: `apps/client/src/app/routes/popular.tsx`
- Modify: `apps/client/src/app/routes/magazines.tsx`
- Modify: `apps/client/src/app/routes/restaurant-detail.tsx`

- [ ] Write failing tests for required-query failure, optional-query empty fallback, dehydration contents, invalid restaurant ID, and restaurant metadata fallback.
- [ ] Implement shared `loader`/`clientLoader` helpers that create an isolated QueryClient, prefetch required query options, tolerate only the designated optional queries, and return serializable dehydrated state.
- [ ] Home prefetch: hot SNS required, magazine banner optional.
- [ ] Hashi Pick/popular prefetch: use the exact default `createRestaurantListRequestParams` produced by their current first sort/category selections.
- [ ] Magazines prefetch: first 10 magazines required, banners optional.
- [ ] Restaurant detail prefetch: summary/store/menu(10) required, review first page optional; expose summary/store data for dynamic title, description, canonical, Open Graph, and `Restaurant` JSON-LD.
- [ ] Wrap each page with `HydrationBoundary`; preserve browser refetch behavior and ensure non-prerendered restaurant IDs still resolve through `clientLoader` in SPA fallback.
- [ ] Run focused loader tests and existing home/list/magazine/detail page tests.
- [ ] Commit: `Feat(seo): 공개 페이지 데이터를 프리렌더링에 연결`

### Task 5: robots and sitemap from the validated manifest

**Files:**

- Create: `apps/client/src/shared/seo/searchResources.ts`
- Create: `apps/client/src/shared/seo/searchResources.test.ts`
- Create: `apps/client/src/app/routes/robots[.]txt.ts`
- Create: `apps/client/src/app/routes/sitemap[.]xml.ts`
- Modify: `apps/client/src/routes.ts`
- Modify: `apps/client/react-router.config.ts`

- [ ] Write failing tests for robots content, sitemap XML escaping, stable canonical URLs, absence of fake `lastmod`, and exclusion of private/search paths.
- [ ] Implement resource loaders returning correct `Content-Type`; sitemap reads only validated manifest paths.
- [ ] Include `/robots.txt` and `/sitemap.xml` in prerender paths so static hosting serves generated resources without runtime SSR.
- [ ] Run focused resource tests and a fixture build; inspect generated files under `apps/client/dist/client`.
- [ ] Commit: `Feat(seo): robots와 sitemap 생성`

### Task 6: Static hosting, PWA, and Sentry integration

**Files:**

- Modify: `apps/client/vite.config.ts`
- Modify: `vercel.json`
- Test: `apps/client/scripts/seo/verify-prerender-build.mjs`
- Test fixture: `apps/client/scripts/seo/fixtures/public-api.json`

- [ ] Write a build verification script that fails unless public HTML, dynamic restaurant HTML, real content, canonical/Open Graph/JSON-LD, `__spa-fallback.html`, robots/sitemap, and absence of a runtime SSR handler are confirmed.
- [ ] Exclude generated route HTML/data from Workbox precache and set navigation fallback to `/__spa-fallback.html` while retaining JS/CSS/icon asset caching.
- [ ] Update Sentry source-map deletion paths to `apps/client/dist/client/**/*.map` relative to app build execution.
- [ ] Change Vercel output to `apps/client/dist/client`, remove the catch-all rewrite, add SPA fallback handling compatible with generated static assets, and add `X-Robots-Tag: noindex, nofollow` headers for known non-index patterns.
- [ ] Run fixture production build with `SEO_API_FIXTURE_PATH=...` and the verifier; inspect service-worker precache for absence of restaurant HTML.
- [ ] Commit: `Chore(seo): 프리렌더 정적 배포 설정 정리`

### Task 7: Documentation synchronization

**Files:**

- Modify: `README.md` or `docs/architecture/tech-stack.md` (whichever currently owns the runtime stack)
- Modify: `docs/architecture/app-structure.md`
- Modify: `apps/client/src/pages/home/HomePage.spec.md`
- Modify: `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.spec.md`
- Modify: `apps/client/src/pages/magazines/MagazinesPage.spec.md`
- Modify: `apps/client/src/pages/hashiPick/HashiPick.spec.md`
- Modify: `apps/client/src/pages/popularRestaurants/PopularRestaurants.spec.md`

- [ ] Record Framework Mode as current, distinguish build-time prerender from runtime SSR, document the route scope, data snapshot policy, manifest/sitemap coupling, and deployment rebuild requirement.
- [ ] Update page specs with loader/clientLoader ownership, prefetched query keys, metadata, and failure behavior.
- [ ] Confirm no admin docs/config require changes.
- [ ] Commit: `Docs(seo): 공개 페이지 프리렌더링 운영 기준 문서화`

### Task 8: Full verification and PR update

**Files:**

- Verify all changed files
- Update existing PR `#120`

- [ ] Run `pnpm --filter @hashi/client test`.
- [ ] Run `pnpm --filter @hashi/client lint`.
- [ ] Run `pnpm --filter @hashi/client typecheck`.
- [ ] Run deterministic fixture `pnpm build:client` and `verify-prerender-build.mjs`.
- [ ] Run `pnpm --filter @hashi/client preview`, probe representative public/private/unknown URLs, and stop the server.
- [ ] Run repository implementation verification skills and review `git diff --check`, `git status`, and final diff for unrelated changes/secrets.
- [ ] Commit any verification fixes, push `feat/HASHI-136-seo-optimization`, update PR title/body/checklist with actual files and commands, and mark ready only when all required checks pass.
