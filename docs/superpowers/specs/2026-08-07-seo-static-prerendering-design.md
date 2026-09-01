# HASHI SEO Static Prerendering Design

## Context

HASHI Client는 React Router와 Vite로 구성된 SPA다. 현재 운영 HTML의 본문은 `<div id="root"></div>`뿐이고, 식당·메뉴·매거진 콘텐츠와 페이지별 head 정보는 JavaScript 실행 후에만 나타난다. 또한 `robots.txt`와 `sitemap.xml` 요청이 실제 파일이 아니라 SPA HTML을 반환하고, Vercel의 전체 경로 rewrite 때문에 존재하지 않는 URL도 HTTP 200으로 응답한다.

Google은 JavaScript를 렌더링할 수 있지만 크롤링 후 렌더링 대기열을 거친다. 네이버도 SPA의 주요 콘텐츠를 서버에서 렌더링하도록 권장한다. 신생 서비스인 HASHI가 공개 콘텐츠의 발견과 해석 가능성을 높이려면 검색로봇이 JavaScript 없이도 핵심 내용을 읽을 수 있는 HTML과 유효한 검색엔진 피드를 제공해야 한다.

대표 도메인은 현재 운영 리다이렉트와 일치하는 `https://www.hashi.kr`로 고정한다.

## Goals

- 홈, 하시 PICK, 인기 맛집, 식당 상세, 메뉴 상세, 매거진 목록을 공개 색인 대상으로 만든다.
- 색인 대상 URL별로 검색로봇이 JavaScript 없이 읽을 수 있는 정적 HTML을 생성한다.
- 페이지별 title, description, canonical, robots, Open Graph와 구조화 데이터를 제공한다.
- 백엔드에 존재하는 모든 공개 식당과 메뉴 URL을 사이트맵에 포함한다.
- 비공개·미완성·검색 결과 페이지가 검색 결과에 노출되지 않도록 기본 정책을 `noindex`로 둔다.
- 잘못된 직접 접근은 SPA HTML 200이 아니라 실제 HTTP 404로 응답한다.
- 기존 React/Vite SPA의 사용자 기능과 클라이언트 라우팅을 유지한다.

## Non-goals

- Next.js 또는 별도 SSR 프레임워크로 마이그레이션하지 않는다.
- 사용자 에이전트에 따라 다른 문서를 반환하는 동적 렌더링을 도입하지 않는다.
- 콘텐츠 관리 시스템의 게시 이벤트와 Vercel 재배포를 자동 연결하지 않는다.
- 매거진 상세 콘텐츠나 상세 API를 새로 구현하지 않는다.
- 검색 순위 또는 색인 시점을 보장하지 않는다.
- Google Search Console과 네이버 서치어드바이저 제출을 API로 자동화하지 않는다.
- 검색, 오늘의 식당, 지도, 인증·예약·리뷰 화면을 색인 대상으로 확장하지 않는다.

## Index Policy

### Indexable pages

| Page        | Route                                      | Canonical source                                  |
| ----------- | ------------------------------------------ | ------------------------------------------------- |
| 홈          | `/`                                        | 고정 URL                                          |
| 하시 PICK   | `/restaurants/hashi-pick`                  | 고정 URL                                          |
| 인기 맛집   | `/restaurants/popular`                     | 고정 URL                                          |
| 식당 상세   | `/restaurants/:restaurantId`               | 식당 목록 API에서 수집한 양의 정수 ID             |
| 메뉴 상세   | `/restaurants/:restaurantId/menus/:menuId` | 식당별 메뉴 목록 API에서 수집한 양의 정수 ID 조합 |
| 매거진 목록 | `/magazines`                               | 고정 URL                                          |

사이트맵은 route pattern을 기록하지 않는다. 예를 들어 식당 ID가 `123`, `456`이면 `/restaurants/123`, `/restaurants/456`을 각각 기록한다. 메뉴도 실제 식당·메뉴 ID 조합을 각각 기록한다.

### Non-indexable pages

- `/magazines/:magazineId`: 내부 상세 API와 실제 콘텐츠가 없는 임시 화면
- `/search`, `/restaurants/today`, `/map`, `/coming-soon`: 검색·임시·유틸리티 화면
- `/saved`, `/mypage`, `/profile/new`, `/withdrawal`, `/my-reviews`: 사용자 전용 화면
- 예약, 리뷰 작성·수정·상세, 로그인 필요, OAuth callback 경로
- 존재하지 않는 모든 경로와 유효하지 않은 식당·메뉴 ID

검색·유틸리티 화면은 `noindex, follow`, 인증·사용자 전용·콜백·오류 화면은 `noindex, nofollow`를 사용한다. robots 규칙은 접근 제어 수단으로 사용하지 않으며 기존 인증 guard를 유지한다.

## Metadata Policy

모든 canonical은 절대 URL이며 `https://www.hashi.kr`를 origin으로 사용한다. 추적용 query string과 hash는 canonical에서 제거한다. 홈을 제외한 canonical path에는 후행 slash를 사용하지 않는다.

| Page        | Title template                                  | Structured data              |
| ----------- | ----------------------------------------------- | ---------------------------- |
| 홈          | `HASHI \| 일본 맛집 발견부터 예약까지`          | `Organization`, `WebSite`    |
| 하시 PICK   | `하시 PICK \| 일본 현지 맛집 큐레이션 \| HASHI` | `ItemList`                   |
| 인기 맛집   | `인기 맛집 \| 일본 인기 식당 추천 \| HASHI`     | `ItemList`                   |
| 식당 상세   | `{식당명} \| 일본 맛집 정보·메뉴·예약 \| HASHI` | `Restaurant`                 |
| 메뉴 상세   | `{메뉴명} - {식당명} \| HASHI`                  | `MenuItem`, `BreadcrumbList` |
| 매거진 목록 | `HASHI 매거진 \| 일본 미식·여행 콘텐츠`         | `CollectionPage`, `ItemList` |

페이지 description은 API의 이름, 지역, 장르, 요약, 메뉴 설명과 가격처럼 화면에도 표시되는 데이터로 작성한다. 동적 설명이 없을 때는 다음 문구를 사용한다.

| Page        | Fallback description                                                  |
| ----------- | --------------------------------------------------------------------- |
| 홈          | `한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스 HASHI입니다.` |
| 하시 PICK   | `HASHI가 직접 고른 일본 현지 맛집을 지역과 장르별로 만나보세요.`      |
| 인기 맛집   | `여행자에게 인기 있는 일본 맛집의 정보와 메뉴를 확인하세요.`          |
| 식당 상세   | `{식당명}의 위치, 메뉴, 가격, 영업시간과 예약 정보를 확인하세요.`     |
| 메뉴 상세   | `{식당명}의 {메뉴명} 메뉴 정보와 가격을 확인하세요.`                  |
| 매거진 목록 | `HASHI가 소개하는 일본 미식과 여행 콘텐츠를 만나보세요.`              |

Open Graph와 Twitter 이미지는 API 대표 이미지를 우선하고, 없으면 `https://www.hashi.kr/icons/pwa-512x512.png`를 사용한다. 전용 1200×630 공유 이미지 제작은 별도 디자인 작업으로 남긴다. Twitter card는 `summary_large_image`, Open Graph site name은 `HASHI`, locale은 `ko_KR`로 통일한다.

평점, 리뷰 수, 주소, 영업시간, 가격처럼 API에 존재하고 화면에 표시되는 값만 구조화 데이터에 포함한다. 평점이나 리뷰 수가 유효하지 않으면 `aggregateRating`을 생략한다. API 문자열은 HTML과 JSON-LD 문맥에 맞게 escape하며 임의의 키워드나 사실을 추가하지 않는다.

색인 대상의 query variant는 깨끗한 기본 path를 canonical로 가리킨다. 사이트맵과 내부 SEO 링크도 동일한 canonical URL만 사용한다.

## Architecture

### SEO page model

빌드와 브라우저가 함께 사용하는 순수 SEO page model을 둔다. page model은 다음 정보를 표현한다.

- canonical path와 절대 URL
- title과 description
- robots 정책
- Open Graph와 Twitter 정보
- JSON-LD 객체 목록
- 검색로봇이 읽을 semantic snapshot에 필요한 heading, summary, image, link 데이터

페이지 유형별 builder가 API 응답을 page model로 변환한다. HTML 생성, 사이트맵 생성, SPA head 동기화는 이 model만 소비해 title이나 canonical 규칙이 서로 달라지지 않게 한다.

### Build-time inventory collector

Vite production build의 후처리 plugin이 공개 API를 호출한다. 식당 목록은 cursor의 `hasNext`가 false가 될 때까지 순회하고, 수집한 각 식당의 메뉴 목록도 같은 방식으로 끝까지 순회한다. 하시 PICK과 인기 맛집은 화면이 사용하는 `type`, 기본 sort, 전체 genre 조건으로 별도 목록을 수집한다. 매거진 목록도 cursor를 끝까지 순회하지만 외부 Instagram URL을 사용하는 매거진 상세 경로는 만들지 않는다.

수집 결과는 다음 용도로 공동 사용한다.

1. 모든 공개 canonical URL 목록 생성
2. URL별 SEO page model 생성
3. URL별 정적 HTML 생성
4. `sitemap.xml` 생성
5. 생성 파일과 사이트맵의 일치 여부 검증

중복 ID와 URL은 제거한다. cursor가 반복되거나 `hasNext: true`인데 다음 cursor가 없으면 데이터 계약 오류로 처리한다.

### Static document generator

프리렌더링은 headless browser나 전체 React SSR 대신 API 기반의 정적 SEO 문서 생성기로 구현한다. 생성기는 Vite가 만든 HTML과 asset 참조를 template으로 사용해 page model별 문서를 출력한다.

각 문서는 다음을 포함한다.

- 완전한 head metadata와 JSON-LD
- 하나의 `h1`
- 화면에도 표시되는 핵심 설명과 이미지
- 하시 PICK·인기 맛집·매거진 항목 링크
- 식당 상세의 메뉴 링크
- 메뉴 상세의 식당 상위 링크
- 기존 Vite JavaScript와 CSS asset

semantic snapshot은 숨기지 않고 React가 mount되기 전까지 표시한다. snapshot과 빈 React root를 하나의 grid transition shell에 겹치고, SPA가 root에 처음 commit한 직후 layout effect에서 snapshot만 제거한다. 이로써 인증 복원 중에 snapshot이 사라진 빈 root가 노출되는 구간을 만들지 않는다. JavaScript가 실행되면 기존 SPA가 같은 URL과 API 데이터로 화면을 이어받는다. 검색로봇과 사용자에게 같은 HTML을 제공하고 bot user-agent 분기를 만들지 않는다.

snapshot은 현재 화면의 최초 조회 범위와 맞춘다. 홈은 현재 배너와 인기 식당 범위, 하시 PICK·인기 맛집·매거진은 첫 페이지 10개, 식당 상세는 요약·매장 정보와 메뉴 첫 페이지 10개, 메뉴 상세는 선택 메뉴와 현재 화면이 조회하는 다른 메뉴 첫 페이지를 담는다. 전체 URL 발견은 snapshot에 모든 항목을 밀어 넣지 않고 사이트맵으로 담당한다. `ItemList`도 해당 snapshot에 실제로 표시한 항목만 기술한다.

생성 파일 구조는 다음과 같다.

```text
apps/client/dist/
├── index.html
├── public-noindex-shell.html
├── private-noindex-shell.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── magazines/index.html
└── restaurants/
    ├── hashi-pick/index.html
    ├── popular/index.html
    └── {restaurantId}/
        ├── index.html
        └── menus/{menuId}/index.html
```

`index.html`은 프리렌더된 홈 문서다. `public-noindex-shell.html`은 검색·오늘의 식당·지도·임시 화면을 위한 `noindex, follow` 문서다. `private-noindex-shell.html`은 인증·사용자 전용·OAuth callback 화면을 위한 `noindex, nofollow` 문서다. `404.html`도 `noindex, nofollow`를 사용한다.

동적으로 늘어나는 SEO HTML 전체를 PWA precache에 넣지 않는다. Workbox는 JavaScript, CSS, 아이콘과 앱 실행에 필요한 shell만 precache하고, 식당·메뉴별 HTML과 `robots.txt`, `sitemap.xml`, `404.html`은 network에서 받는다. 이는 콘텐츠 증가에 따라 service worker cache가 무제한 커지는 것을 막기 위한 정책이다.

### Runtime head synchronization

정적 문서는 직접 접근과 최초 응답을 담당한다. SPA 내부 이동 후에도 head가 이전 페이지 값으로 남지 않도록 클라이언트 SEO component가 같은 page model을 사용해 title, meta, canonical과 JSON-LD를 교체한다.

경로가 바뀌면 먼저 안전한 기본 `noindex` 상태로 초기화한다. 공개 동적 페이지는 API 필수 데이터가 확인된 후 `index, follow`로 전환한다. API가 404를 반환하거나 필수 ID가 유효하지 않으면 `noindex`를 유지하고 기존 Not Found UX로 연결한다.

SEO component가 소유한 head element에는 식별 가능한 attribute를 사용한다. 페이지 이동 시 이전 Open Graph, canonical과 JSON-LD를 모두 제거한 뒤 현재 page model 값 하나만 남긴다. 기존 네이버 사이트 소유 확인 meta는 page lifecycle과 무관한 전역 태그로 유지한다.

## Crawling Files

### robots.txt

`robots.txt`는 실제 text file로 제공한다.

```text
User-agent: *
Allow: /

Sitemap: https://www.hashi.kr/sitemap.xml
```

비색인 문서를 `Disallow`하지 않는다. 검색로봇이 해당 문서를 읽어 `noindex`를 확인할 수 있어야 하기 때문이다. robots 설정은 비공개 데이터 보호 수단이 아니다.

### sitemap.xml

사이트맵은 UTF-8 XML과 절대 canonical URL만 포함한다. 정적 4개 URL과 수집된 모든 식당·메뉴 URL을 포함한다. 신뢰할 수 있는 수정 시각이 API에 없으므로 `lastmod`, `changefreq`, `priority`를 임의로 만들지 않는다.

사이트맵은 URL 중복, XML escape, origin과 대응 정적 파일 존재 여부를 빌드 중 검증한다. 생성 결과가 단일 사이트맵 한도인 URL 50,000개 또는 비압축 50MB에 도달하면 build를 실패시키고 사이트맵 분할을 별도 작업으로 도입한다.

## Routing and HTTP Status

Vercel은 canonical URL을 생성된 실제 HTML 파일로 명시적으로 연결한다. 현재의 전체 경로 SPA rewrite는 제거한다. 홈·목록·식당·메뉴 canonical URL은 대응하는 디렉터리의 `index.html`로 rewrite한다. 알려진 검색·유틸리티 route는 `public-noindex-shell.html`로, 인증·사용자 전용 route는 `private-noindex-shell.html`로 명시적으로 rewrite한다. 디렉터리형 `index.html`은 `cleanUrls`가 자동 해석하지 않으므로 `cleanUrls: false`를 사용하고 후행 slash는 비활성화한다.

정적 파일도 아니고 알려진 SPA route도 아닌 요청은 `404.html`과 HTTP 404를 반환한다. 따라서 존재하지 않는 식당·메뉴 ID와 임의 경로가 더 이상 soft 404 HTML 200을 반환하지 않는다. 후행 slash는 Vercel 설정으로 canonical의 slash 없는 형태로 정규화한다.

정적 생성을 마친 뒤 새로 등록된 식당·메뉴는 다음 배포 전까지 직접 접근 시 404가 된다. 콘텐츠를 사용자에게 공개하는 절차에는 SEO build와 Vercel 배포 완료가 포함되어야 한다. 게시 이벤트 기반 자동 재배포는 이번 범위 밖이다.

## Failure Handling

- API 요청은 최초 요청을 포함해 최대 3회 시도하며, 재시도 전에는 각각 500ms와 1,000ms를 기다린다.
- 식당별 메뉴 조회는 최대 4개만 동시에 실행한다.
- 목록 API 실패, cursor loop, 필수 양의 정수 ID 누락, 빈 식당 inventory, 중복 canonical 충돌은 build failure다.
- 식당·메뉴 이름처럼 상세 문서 식별에 필요한 필드가 없으면 build를 실패시켜 데이터 품질 문제를 드러낸다.
- 선택 설명이 없으면 유형별 기본 설명을 사용하고, 이미지가 없으면 기본 공유 이미지를 사용한다.
- 한 URL의 실패를 무시하고 불완전한 사이트맵을 배포하지 않는다.
- build failure 시 Vercel은 새 결과물을 배포하지 않으며 기존 성공 배포본을 유지한다.
- 로그에는 수집한 식당·메뉴·매거진 수, 생성 URL 수와 실패 URL을 표시하되 응답 전체나 민감정보는 기록하지 않는다.

## Security and Content Integrity

- build는 인증이 필요 없는 공개 조회 API만 호출한다.
- API base URL 외의 secret을 HTML이나 생성 로그에 넣지 않는다.
- 모든 API 문자열을 HTML attribute, text, XML, JSON-LD 문맥별로 escape한다.
- 매거진 외부 링크는 browser runtime과 build가 같은 Instagram URL 정규화 함수를 사용한다. HTTP(S) Instagram URL이 아니면 링크와 JSON-LD URL에서 제외한다.
- JSON-LD의 `<` 문자를 안전하게 직렬화해 script 종료 문자열 주입을 방지한다.
- semantic snapshot은 실제 화면에서 제공하는 정보만 포함하며 숨겨진 SEO 전용 키워드를 추가하지 않는다.
- `noindex`와 robots는 권한 통제가 아니므로 기존 route guard와 API 인증을 그대로 유지한다.

## Runtime Preservation and Data Integrity

- 공개 route는 인증 세션 복원과 병렬로 SPA를 렌더한다. `authOnly`·`guestOnly` guard는 복원이 완료된 뒤 redirect를 결정하며, 공개 route의 로그인 유도 UI는 복원 중 상태를 비로그인으로 확정하지 않는다.
- 정적 HTML의 canonical이 최초 browser pathname과 일치하고 `index, follow`인 경우, `SeoProvider`는 API loading 또는 일시적인 5xx 동안 해당 정적 head를 보존한다.
- SPA 내부 이동은 대응 정적 문서가 없으므로 기존처럼 route별 안전한 `noindex` fallback을 즉시 적용한다.
- 유효하지 않은 route param 또는 API 404가 확인되면 `NotFoundPage`가 정적 head보다 우선하는 `noindex, nofollow`를 등록한다.
- 홈·식당 목록·매거진 목록 runtime SEO는 최초 query가 성공한 뒤 등록하며, API error 중에는 검증된 정적 head를 빈 model로 덮어쓰지 않는다.
- 무한 목록의 runtime SEO snapshot과 `ItemList`는 최초 페이지 최대 10개에 고정한다. 추가 페이지 로드는 화면만 갱신하며 head를 다시 만들지 않는다.
- build API는 응답 봉투뿐 아니라 endpoint별 `content`, `magazines`, `banners`, `hasNext`, `nextCursor` 구조를 runtime에서 검증한다. malformed success payload를 빈 페이지로 간주하지 않고 build를 실패시킨다.
- 가격이 없는 메뉴는 `Offer`를 만들지 않는다. 표시용 빈 문자열을 숫자 `0`으로 변환하지 않는다.
- 식당 snapshot은 주소, 평점, 가격대와 영업시간을, 메뉴 snapshot은 실제 가격을 선택적으로 제공한다. 홈 snapshot은 현재 노출하는 유효한 매거진 배너 링크와 인기 식당 링크를 함께 제공한다.
- snapshot의 의미 있는 이미지는 콘텐츠 이름을 alt로 사용한다. 대표 이미지는 eager로 두되 목록 이미지는 lazy loading과 async decoding을 사용하고 width/height를 제공해 초기 layout 변동을 줄인다.

## Testing and Verification

### Automated tests

- canonical 생성과 query/hash 제거
- 페이지 유형별 title, description, robots와 기본 이미지 fallback
- 구조화 데이터의 조건부 필드와 안전한 JSON 직렬화
- 식당·메뉴·매거진 cursor 전체 순회, 중복 제거와 cursor loop 실패
- API retry와 동시 실행 제한
- endpoint별 malformed success payload build failure
- build/runtime 매거진 외부 URL 정규화 일치
- 가격이 없는 메뉴의 `Offer` 생략
- HTML·XML escape
- 사이트맵에 실제 concrete URL만 포함되고 비색인 URL이 제외되는지
- 생성된 모든 사이트맵 URL에 대응 HTML 파일이 있는지
- 각 공개 HTML에 title, description, canonical, robots가 정확히 하나씩 있는지
- public·private noindex shell과 `404.html`이 각각 지정된 robots 정책을 갖는지
- SPA 이동 시 기존 SEO head element와 JSON-LD가 교체되는지
- 최초 정적 indexable head가 API loading 동안 보존되고 404에서 교체되는지
- 무한 목록 추가 페이지가 SEO `ItemList`와 head를 변경하지 않는지
- 기존 page, router, API 테스트 회귀가 없는지

API와 filesystem은 test double을 주입해 실제 운영 API나 저장소 `dist`에 의존하지 않고 generator를 검증한다.

### Build verification

다음을 통과해야 구현이 완료된 것으로 본다.

```text
pnpm --filter @hashi/client test
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client lint
pnpm build:client
```

build 후 생성 파일을 검사해 사이트맵 URL 수와 HTML 수가 일치하고, private route가 사이트맵에 없으며 JSON-LD가 모두 parse되는지 확인한다.

### Post-deployment verification

- `https://hashi.kr`가 `https://www.hashi.kr`로 redirect되는지 확인한다.
- `/robots.txt`가 HTML이 아닌 text file을 반환하는지 확인한다.
- `/sitemap.xml`이 유효한 XML을 반환하는지 확인한다.
- 실제 식당·메뉴 URL의 최초 source에 metadata와 핵심 콘텐츠가 있는지 확인한다.
- 임의 경로와 존재하지 않는 식당·메뉴 ID가 HTTP 404인지 확인한다.
- Google Search Console과 네이버 서치어드바이저에 `https://www.hashi.kr/sitemap.xml`을 한 번 제출한다.
- 대표 URL을 URL 검사 도구로 요청하고 수집·색인 상태는 처리 시간을 두고 확인한다.

사이트맵 제출은 URL 발견을 돕는 힌트이며 색인과 순위를 보장하지 않는다.

## Operational Contract

1. 백엔드가 식당·메뉴·매거진 데이터를 공개한다.
2. 클라이언트 production build가 공개 URL inventory를 다시 수집한다.
3. build가 정적 HTML, robots와 sitemap을 생성·검증한다.
4. Vercel 배포가 성공한 뒤 새 공개 URL을 사용자에게 노출한다.
5. 배포 후 검색엔진 콘솔은 동일한 sitemap URL을 다시 읽으며, sitemap 주소를 항목별로 재등록하지 않는다.

## References

- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [네이버 JavaScript SEO](https://searchadvisor.naver.com/guide/seo-advanced-javascript)
- [네이버 사이트맵 제출](https://searchadvisor.naver.com/guide/request-feed)
- [네이버 robots.txt 가이드](https://searchadvisor.naver.com/guide/seo-basic-robots)
