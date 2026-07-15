# HASHI-136 공개 페이지 SEO 프리렌더링 설계

## 1. 배경과 목적

현재 `apps/client`는 Vite와 `createBrowserRouter`로 구성된 CSR 애플리케이션이다. 모든 경로가 같은 `index.html`을 받고 실제 페이지 콘텐츠는 JavaScript 실행과 API 요청 이후에 렌더링된다. 공통 title과 description은 있지만 페이지별 metadata, canonical, 실제 `robots.txt`, `sitemap.xml`, 구조화 데이터는 없다.

이번 작업의 목적은 검색 유입 가치가 높은 공개 페이지의 실제 콘텐츠를 빌드 시 HTML로 생성하고, 검색엔진이 페이지를 안정적으로 발견하고 이해할 수 있는 색인 기반을 구축하는 것이다. 검색 순위 자체를 보장하거나 전체 애플리케이션을 SSR로 전환하는 것은 목적이 아니다.

## 2. 결정 사항

React Router 7 Framework Mode의 공식 pre-rendering을 사용한다.

- `ssr: false`로 요청 시점 SSR을 사용하지 않는다.
- 핵심 공개 페이지만 빌드 시 프리렌더링한다.
- 나머지 경로는 React Router SPA fallback으로 기존 CSR 동작을 유지한다.
- 프리렌더링 데이터는 배포 빌드 시점의 공개 API snapshot이다.
- 브라우저 hydration 이후에는 기존 TanStack Query 정책에 따라 최신 데이터를 다시 조회할 수 있다.
- 콘텐츠 수정 시 자동 재배포, 요청 시 SSR, ISR은 후속 범위로 둔다.

`ssr: false`는 빌드 시 HTML 생성을 끄는 설정이 아니라 런타임 SSR 서버를 끄는 설정이다. 이를 명시하지 않으면 Framework Mode의 기본값인 `ssr: true`가 적용되어 프리렌더링되지 않은 경로가 Vercel Function의 SSR 대상이 된다.

## 3. 범위

### 3.1 프리렌더링 및 색인 대상

| 경로                         | 콘텐츠           | 경로 생성 방식                 |
| ---------------------------- | ---------------- | ------------------------------ |
| `/`                          | 홈               | 정적 경로                      |
| `/restaurants/hashi-pick`    | 하시픽 식당 목록 | 정적 경로                      |
| `/restaurants/popular`       | 인기 식당 목록   | 정적 경로                      |
| `/magazines`                 | 매거진 목록      | 정적 경로                      |
| `/restaurants/:restaurantId` | 공개 식당 상세   | 공개 식당 목록 API에서 ID 수집 |

### 3.2 CSR 유지 및 비색인 대상

- `/search`
- `/restaurants/today`
- `/restaurants/:restaurantId/menus/:menuId`
- `/magazines/:magazineId`
- `/map`, `/coming-soon`
- 로그인 유도와 OAuth callback
- 예약 생성·요청·상세·내 예약
- 리뷰 작성·상세·수정·내 리뷰
- 마이페이지, 프로필, 탈퇴, 저장
- Not Found 화면

검색 결과와 filter 조합은 URL 수가 과도하게 늘어날 수 있어 1차 범위에서 색인하지 않는다. 메뉴 상세는 독립 검색 페이지로서 충분한 고유 콘텐츠가 검증되지 않았고, 매거진 상세는 현재 placeholder이므로 제외한다.

### 3.3 제외 범위

- 런타임 SSR과 Vercel Function
- 실제 HTTP 404 응답 보장
- 관리자 콘텐츠 수정 후 자동 재배포
- Search Console과 Naver Search Advisor 계정 설정
- 별도의 기본 Open Graph 이미지 제작
- 메뉴 상세와 매거진 상세 SEO
- 검색 순위 또는 트래픽 상승 보장

## 4. 애플리케이션 아키텍처

### 4.1 React Router Framework Mode

`@react-router/dev` Vite plugin과 `react-router.config.ts`를 도입한다. 설정은 `ssr: false`와 선택적 `prerender` 경로를 사용한다.

```text
React Router Framework Mode
├── build-time prerender
│   ├── /
│   ├── /restaurants/hashi-pick
│   ├── /restaurants/popular
│   ├── /magazines
│   └── /restaurants/{publicRestaurantId}
└── runtime SPA fallback
    └── 나머지 route
```

현재 `createBrowserRouter` route tree는 Framework Mode route config와 route module로 옮긴다. 기존 page, feature, shared UI 컴포넌트와 query option은 재사용하고 제품 UI를 다시 구현하지 않는다.

root route는 다음 책임을 가진다.

- HTML document 구조와 공통 link/meta
- QueryClientProvider
- Sentry ErrorBoundary
- AuthSessionRestoreGate
- 공통 stylesheet와 script 조립
- route outlet

client entry는 Sentry 초기화와 hydration을 담당한다. 프리렌더링 HTML이 있는 경로는 hydrate하고 SPA fallback 경로도 같은 entry를 사용한다.

현재 `AuthSessionRestoreGate`는 일부 경로를 제외하면 인증 복구가 끝날 때까지 `LoadingScreen`을 렌더링한다. build-time render에서는 browser cookie나 storage 복구가 SEO 콘텐츠 생성을 막으면 안 된다. 프리렌더링 대상 공개 경로는 인증 복구와 무관하게 즉시 렌더링하고, browser-only session 복구는 hydration 이후에 수행하도록 route-aware 정책을 명시한다.

### 4.2 QueryClient 격리

현재 module singleton QueryClient는 build-time render 사이에서 cache가 섞일 수 있다. QueryClient factory를 만들고 각 프리렌더링 요청마다 독립 instance를 생성한다. 브라우저에서는 앱 생명주기 동안 한 instance를 유지한다.

route loader는 필요한 query option을 prefetch한 뒤 dehydrated state를 반환한다. route module은 `HydrationBoundary`로 기존 page를 감싸 기존 query hook이 같은 key의 데이터를 즉시 사용하게 한다.

### 4.3 SPA fallback

프리렌더링되지 않은 경로는 Framework Mode가 생성하는 SPA fallback으로 제공한다. 새 식당이 배포 후 추가된 경우에도 URL 직접 접근과 client-side API 조회는 가능하지만, 해당 식당은 다음 배포 전까지 프리렌더링 HTML과 sitemap에 포함되지 않는다.

## 5. 빌드 데이터 흐름

### 5.1 경로 발견

빌드 단계에서 공개 식당 목록 API의 cursor pagination을 끝까지 순회한다.

```text
공개 식당 목록 조회
→ restaurantId 검증
→ 중복 제거
→ detail 프리렌더링 경로 구성
→ prerender config와 sitemap이 같은 경로 집합 사용
```

경로 발견은 cursor 반복, page 상한, 중복 ID를 검사해 무한 순회를 막는다. 공개 목록에 없는 ID는 생성하지 않는다.

목록에서 얻은 식당이 상세 조회 시 404이면 경로 집합과 sitemap에서 제외하고 빌드 로그에 경고한다. network, timeout, 5xx, malformed response는 운영 빌드를 실패시킨다. 경로 발견과 sitemap 생성은 동일한 검증 결과를 사용해 두 산출물의 URL이 달라지지 않게 한다.

### 5.2 페이지별 prefetch

| 페이지    | 필수 데이터                     | 선택 데이터    |
| --------- | ------------------------------- | -------------- |
| 홈        | SNS 인기 식당 첫 페이지         | 매거진 배너    |
| 하시픽    | 하시픽 식당 첫 페이지           | 없음           |
| 인기 맛집 | 인기 식당 첫 페이지             | 없음           |
| 매거진    | 매거진 첫 페이지                | 매거진 배너    |
| 식당 상세 | 요약, 매장 정보, 메뉴 첫 페이지 | 리뷰 첫 페이지 |

필수 데이터가 없으면 실제 콘텐츠 대신 loading 또는 error UI가 정적 HTML로 배포될 수 있으므로 빌드를 실패시킨다. 선택 데이터 실패는 query별 정상 empty 값을 cache에 넣어 해당 섹션의 기존 empty·숨김 UI를 렌더링하고 나머지 콘텐츠를 생성한다. hydration 이후에는 기존 query 정책에 따라 선택 데이터를 다시 조회할 수 있다.

식당 상세의 summary와 store information은 SEO metadata와 Restaurant JSON-LD의 source of truth이다. 메뉴 첫 페이지는 현재 상세 page가 loading 상태를 벗어나 실제 view model을 만드는 데 필요하다. 리뷰는 페이지 전체 렌더링의 필수 조건이 아니므로 선택 데이터로 취급한다.

### 5.3 데이터 갱신

프리렌더링 HTML은 배포 시점 snapshot이다. hydration 이후 기존 query가 stale 정책에 따라 refetch할 수 있으므로 실제 사용자 화면은 최신 데이터로 갱신된다. SEO metadata와 sitemap은 다음 배포에서 갱신된다.

## 6. SEO metadata와 색인 정책

### 6.1 Canonical origin

canonical과 sitemap origin은 preview deployment origin이나 `window.location.origin`을 사용하지 않고 운영 origin `https://www.hashi.kr`로 고정한다. 테스트에서는 build-only override를 허용한다.

### 6.2 페이지별 metadata

| 페이지    | title                                  | description source                |
| --------- | -------------------------------------- | --------------------------------- |
| 홈        | `HASHI - 발견부터 예약까지`            | 서비스 공통 설명                  |
| 하시픽    | `일본 하시픽 맛집 추천 \| HASHI`       | 하시픽 큐레이션 설명              |
| 인기 맛집 | `일본 인기 맛집 추천 \| HASHI`         | 인기 맛집 목록 설명               |
| 매거진    | `일본 맛집 매거진 \| HASHI`            | 매거진 목록 설명                  |
| 식당 상세 | `{식당명} - 메뉴와 예약 정보 \| HASHI` | 식당 summary 또는 안전한 fallback |

각 색인 대상 route는 title, description, canonical, Open Graph type/title/description/url을 제공한다. 식당 상세는 실제 대표 이미지가 있을 때만 이를 `og:image`로 사용한다. 정적 페이지의 전용 브랜드 OG 이미지가 없으면 잘못된 비율의 PWA icon을 대신 사용하지 않고 `og:image`를 생략한다.

### 6.3 구조화 데이터

- 홈: `WebSite`, `Organization`
- 식당 상세: `Restaurant`

JSON-LD에는 실제 화면 및 API와 일치하는 이름, 설명, 주소, URL, 대표 이미지만 넣는다. 변경이 잦거나 검증되지 않은 별점, 리뷰 수, 가격 범위는 1차 범위에서 제외한다.

### 6.4 robots와 sitemap

`robots.txt`는 crawler가 public HTML과 `noindex` 지시를 읽을 수 있도록 기본 crawling을 허용하고 운영 sitemap 위치를 명시한다.

`sitemap.xml`에는 다음만 포함한다.

- 성공적으로 프리렌더링된 정적 공개 경로
- 성공적으로 검증된 공개 식당 상세 경로

`lastmod`를 뒷받침하는 신뢰 가능한 API field가 없으면 현재 시각을 임의로 넣지 않는다.

### 6.5 비색인 경로

비색인 route는 route metadata로 `noindex`를 선언한다. SPA fallback의 client metadata만으로 부족할 수 있는 알려진 인증·개인·검색 경로는 Vercel `X-Robots-Tag` header 규칙도 함께 사용한다. `robots.txt`로 먼저 차단해 crawler가 `noindex`를 읽지 못하게 만들지 않는다.

`ssr: false` 정적 배포에서는 존재하지 않는 동적 URL이 SPA fallback의 HTTP 200을 받을 수 있다. Not Found UI와 `noindex`는 제공하지만 실제 HTTP 404 보장은 후속 SSR 또는 routing infrastructure 범위다.

## 7. 빌드와 배포 통합

### 7.1 환경 검증

운영 빌드는 공개 API base URL이 없거나 localhost 또는 개발 API origin을 가리키면 실패한다. preview와 local build는 명시된 비운영 환경을 사용할 수 있지만 canonical은 운영 origin을 유지한다.

### 7.2 Vercel

- client build command는 `pnpm build:client` 진입점을 유지한다.
- output directory를 React Router client build 산출물에 맞춘다.
- 기존 모든 경로의 `/` rewrite를 제거한다.
- Framework Mode의 prerender output과 SPA fallback routing을 사용한다.
- Admin project와 `vercel.admin.json`은 변경하지 않는다.

### 7.3 PWA

현재 Workbox glob은 모든 HTML을 precache할 수 있으므로 식당별 프리렌더링 HTML은 precache에서 제외한다. 앱 shell, JavaScript, CSS, icon, 공통 asset만 precache한다. navigation fallback은 React Router가 생성한 SPA fallback과 일치시킨다.

### 7.4 Sentry

Framework Mode build output에 맞게 source map upload와 삭제 경로를 조정한다. client 초기화는 client entry에서 한 번만 실행하고 build-time prerender 중 browser-only initialization을 실행하지 않는다.

## 8. 오류 처리

| 상황                                  | 처리                      |
| ------------------------------------- | ------------------------- |
| 공개 목록 network/timeout/5xx         | build fail                |
| cursor 반복 또는 malformed pagination | build fail                |
| 공개 목록의 detail 404                | 해당 경로 제외 및 warning |
| 식당 summary/store/menu 실패          | build fail                |
| 리뷰 또는 배너 실패                   | 섹션 생략 후 계속         |
| 공개 식당이 0개                       | 정적 공개 route만 생성    |
| hydration mismatch                    | verification failure      |
| 운영 API env 오설정                   | build fail                |

부분적으로 실패한 핵심 콘텐츠나 loading screen을 정상 SEO HTML로 배포하지 않는다.

## 9. 검증 전략

### 9.1 자동 테스트

- cursor 전체 순회, 중복 ID 제거, 반복 cursor 중단
- canonical URL과 metadata fallback
- sitemap XML escaping과 공개 경로 포함 여부
- robots content
- WebSite, Organization, Restaurant JSON-LD 생성
- 비색인 route metadata
- Query dehydration/hydration
- 기존 route guard와 client navigation 회귀 테스트

### 9.2 빌드 산출물 검증

mock 또는 test API fixture를 사용한 production build에서 다음을 검사한다.

- 정적 공개 route HTML 생성
- 동적 식당 상세 HTML 생성
- 식당명, 설명, canonical, Open Graph, JSON-LD 포함
- 식당 상세가 loading screen만 포함하지 않음
- `sitemap.xml`에 성공한 공개 route만 포함
- 인증·개인·검색 route가 sitemap에 없음
- SPA fallback 생성
- generated restaurant HTML이 Workbox precache manifest에 없음
- 배포 가능한 runtime SSR handler 또는 Vercel Function이 생성되지 않음

### 9.3 실행 명령

```bash
pnpm --filter @hashi/client test
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm build:client
```

### 9.4 Preview 수동 검증

- JavaScript를 끈 상태로 공개 URL 직접 접속
- page source에서 title, description, canonical, 실제 본문 확인
- hydration warning과 화면 flicker 확인
- 비색인 route의 robots directive 확인
- Lighthouse SEO 실행
- Google Rich Results Test로 JSON-LD 확인
- preview build에서 client route와 인증 흐름 smoke test

## 10. 완료 기준

- 핵심 공개 route가 빌드 시 실제 콘텐츠를 포함한 HTML로 생성된다.
- 나머지 route는 기존 SPA 기능을 유지한다.
- 공개 식당 경로와 sitemap이 같은 validated route 집합을 사용한다.
- route별 metadata, canonical, robots policy가 적용된다.
- 홈과 식당 상세의 JSON-LD가 실제 데이터와 일치한다.
- 운영 빌드가 개발 API를 사용하지 않는다.
- 프리렌더링 데이터 실패가 loading/error HTML 배포로 이어지지 않는다.
- PWA, Sentry, 인증, client navigation에 회귀가 없다.
- 지정한 자동 검증과 preview 수동 검증이 통과한다.

## 11. 문서 영향

구현 시 다음 문서를 함께 갱신한다.

- `docs/architecture/tech-stack.md`: React Router Framework Mode와 rendering strategy
- `docs/architecture/app-structure.md`: root, route module, loader 책임
- `apps/client/src/pages/home/HomePage.spec.md`: prefetch와 metadata
- `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.spec.md`: prerender, critical data, metadata, JSON-LD
- `apps/client/src/pages/magazines/MagazinesPage.spec.md`: prefetch와 metadata
- 하시픽·인기 식당의 기존 page/feature spec 중 route metadata 책임에 영향을 받는 문서

## 12. 참고 문서

- [React Router Pre-Rendering](https://reactrouter.com/how-to/pre-rendering)
- [React Router Rendering Strategies](https://reactrouter.com/start/framework/rendering)
- [Google JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Sitemap Guide](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google Canonical Guide](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
