# Routing And Access Policy

이 문서는 `apps/client`의 페이지 URL, 접근 권한, 라우터 배치 기준을 정리합니다.

## Router Structure

- React Router Framework Mode route config는 `apps/client/src/routes.ts`에서 관리합니다.
- route path는 `apps/client/src/app/router/path.ts`의 `ROUTES` 상수로 관리합니다.
- route module은 `apps/client/src/app/routes`에서 page 조립, loader, metadata를 관리합니다.
- document shell과 browser hydration entry는 각각 `apps/client/src/root.tsx`, `apps/client/src/entry.client.tsx`입니다.
- layout component는 `apps/client/src/app/layout`에서 관리합니다.
- 하단 네비게이션이 필요한 페이지는 `BottomNavigationLayout` 아래에 배치합니다.

## Access Types

| Access      | Description                            | Guard            |
| ----------- | -------------------------------------- | ---------------- |
| `public`    | 회원과 비회원 모두 접근할 수 있습니다. | 없음             |
| `authOnly`  | 로그인한 회원만 접근할 수 있습니다.    | `AuthOnlyRoute`  |
| `guestOnly` | 비회원만 접근할 수 있습니다.           | `GuestOnlyRoute` |

## Redirect Policy

- 비회원이 `authOnly` 페이지에 접근하면 `/login-required`로 이동합니다.
- 신규 회원 onboarding session은 `/profile/new`에 한해 `AuthOnlyRoute`를 통과할 수 있습니다.
- 인증 완료 회원이 onboarding 전용 `/profile/new`에 접근하면 `/`로 이동합니다.
- 회원이 `guestOnly` 페이지인 `/login-required`에 접근하면 `/`로 이동합니다.
- 존재하지 않는 URL은 `*` route에서 404 페이지를 렌더링합니다.
- 로그인 유도 바텀시트는 route page가 아니며, `public` 페이지 안에서 로그인 필요한 기능을 비회원이 실행할 때 렌더링합니다.

## Auth Status

- 현재 `useAuthStatus`는 OAuth callback에서 설정한 in-memory auth session을 기준으로 합니다.
- `authenticated`는 accessToken이 메모리에 있는 상태입니다.
- `onboarding`은 신규 회원 callback 이후 onboardingToken HttpOnly Cookie가 설정되었다고 보고 `/profile/new` 진입만 허용하는 상태입니다.
- accessToken, refreshToken, onboardingToken을 localStorage에 저장하지 않습니다.

## Public Routes

| Page                  | Path                                       | Rendering / index policy                      | Notes                                                              |
| --------------------- | ------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------ |
| 홈 페이지             | `/`                                        | build-time prerender / index                  | 첫 진입 페이지입니다.                                              |
| 검색 페이지           | `/search`                                  | SPA / noindex                                 |                                                                    |
| 오늘의 식당 페이지    | `/restaurants/today`                       | SPA / noindex                                 | 매장 정보, 메뉴, 리뷰 탭을 가집니다.                               |
| 식당 상세 페이지      | `/restaurants/:restaurantId`               | 검증된 공개 ID만 build-time prerender / index | 매장 정보, 메뉴, 리뷰 탭을 가집니다.                               |
| 메뉴 상세 페이지      | `/restaurants/:restaurantId/menus/:menuId` | SPA / noindex                                 | 식당 메뉴 카드에서 진입하는 메뉴 상세 화면입니다.                  |
| hashi 픽 페이지       | `/restaurants/hashi-pick`                  | build-time prerender / index                  |                                                                    |
| 인기 맛집 페이지      | `/restaurants/popular`                     | build-time prerender / index                  |                                                                    |
| 지도 페이지           | `/map`                                     | SPA / noindex                                 | 준비중 페이지를 렌더링합니다.                                      |
| 매거진 리스트 페이지  | `/magazines`                               | build-time prerender / index                  | 유지 여부 논의 중입니다.                                           |
| 매거진 상세 페이지    | `/magazines/:magazineId`                   | SPA / noindex                                 | 유지 여부 논의 중입니다.                                           |
| 카카오 OAuth callback | `/oauth/callback/kakao`                    | SPA / noindex                                 | 카카오 인가 code/state 처리 후 기존/신규 회원 흐름으로 분기합니다. |

## Rendering And Index Policy

- `apps/client/react-router.config.ts`는 `ssr: false`를 명시합니다. 런타임 SSR은 사용하지 않고, 선택된 공개 route만 배포 빌드에서 HTML로 생성합니다.
- 빌드 전에 공개 식당 목록과 상세 응답을 검증해 `.seo/public-route-manifest.json`을 생성합니다. 프리렌더 경로와 sitemap은 같은 manifest를 사용합니다.
- 프리렌더 데이터는 배포 빌드 시점의 snapshot이며, hydration 이후 TanStack Query 정책에 따라 최신 데이터로 갱신될 수 있습니다.
- build-time `loader`는 필수 공개 데이터 실패 시 빌드를 중단합니다. 브라우저 `clientLoader`는 404만 route boundary로 전달하고 일반 API 실패는 기존 page/query의 local error UI가 처리하도록 빈 hydration state로 복구합니다.
- 공개 식당 추가·삭제나 SEO metadata 변경을 검색 엔진 산출물에 반영하려면 client를 다시 배포합니다.
- 인증 route와 사용자별 데이터 route는 SPA로 제공하고 `X-Robots-Tag: noindex` 대상에 포함합니다.
- Workbox precache에는 식당별 HTML을 넣지 않습니다. `__spa-fallback.html`에는 배포 release revision을 붙여 이전 앱 shell이 남지 않게 합니다.
- 결정적 산출물 검증은 `SEO_API_FIXTURE_PATH=scripts/seo/fixtures/public-api.json pnpm --filter @hashi/client build:seo-fixture` 후 `pnpm --filter @hashi/client verify:seo-build`로 실행합니다. 운영 빌드에서는 fixture 사용을 거부합니다.

## Auth Only Routes

| Page               | Path                                          | Notes                                                                                                        |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 리뷰 작성 페이지   | `/restaurants/:restaurantId/reviews/new`      |                                                                                                              |
| 마이 리뷰 페이지   | `/my-reviews`                                 | 리뷰 쓰기, 작성한 리뷰보기 탭을 가집니다.                                                                    |
| 리뷰 상세 페이지   | `/reviews/:reviewId`                          |                                                                                                              |
| 리뷰 수정 페이지   | `/reviews/:reviewId/edit`                     |                                                                                                              |
| 저장 페이지        | `/saved`                                      | 준비중 페이지를 렌더링합니다.                                                                                |
| 마이 페이지        | `/mypage`                                     |                                                                                                              |
| 프로필 생성 페이지 | `/profile/new`                                | 신규 회원 onboarding session만 접근하며, 인증 완료 회원은 홈으로 이동합니다.                                 |
| 탈퇴 페이지        | `/withdrawal`                                 | 유지 여부 논의 중입니다.                                                                                     |
| 예약 페이지        | `/restaurants/:restaurantId/reservations/new` |                                                                                                              |
| 어디든 예약 페이지 | `/reservations/anywhere`                      |                                                                                                              |
| 예약 요청 페이지   | `/reservations/request`                       |                                                                                                              |
| 예약 정보 페이지   | `/my-reservations`                            | 진행 중, 방문 예정, 방문 완료, 예약 취소 chip 상태에 따라 카드 디자인과 데이터가 달라지는 단일 페이지입니다. |
| 예약 상세 페이지   | `/reservations/:reservationId`                |                                                                                                              |

## Auth Gate Policy

로그인 유도 바텀시트는 route page가 아니라 `AuthGateBottomSheet`로 처리합니다.
페이지 접근 자체는 허용하지만 내부 기능에 로그인이 필요한 경우에 사용합니다.

| UI                   | Route | Notes                                                                                                                                    |
| -------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인 유도 바텀시트 | 없음  | 비로그인 사용자가 `public` 페이지 안에서 예약하기, 저장하기 같은 로그인 필요 기능을 누를 때 표시하고 Kakao OAuth 시작 액션을 연결합니다. |

## Guest Only Routes

| Page       | Path              | Notes                                               |
| ---------- | ----------------- | --------------------------------------------------- |
| 401 페이지 | `/login-required` | 비회원이 회원 전용 페이지에 접근했을 때 보여줍니다. |

## Temporary Routes

아직 실제 화면이 구현되지 않았지만, 하단 네비게이션 진입점으로 URL이 필요한 페이지는 임시로 준비중 페이지를 렌더링합니다.

| Page          | Path           | Access     | Render           | Notes                                         |
| ------------- | -------------- | ---------- | ---------------- | --------------------------------------------- |
| 준비중 페이지 | `/coming-soon` | `public`   | 준비중 안내 화면 | 직접 접근 가능한 공통 준비중 페이지입니다.    |
| 저장 페이지   | `/saved`       | `authOnly` | 준비중 안내 화면 | 실제 저장 목록 화면 구현 전 임시 route입니다. |
| 지도 페이지   | `/map`         | `public`   | 준비중 안내 화면 | 실제 지도 화면 구현 전 임시 route입니다.      |

## Not Found Route

| Page       | Path | Notes                                            |
| ---------- | ---- | ------------------------------------------------ |
| 404 페이지 | `*`  | 서비스에 없는 URL을 직접 입력했을 때 보여줍니다. |

## Route Module Policy

- 각 URL boundary는 `apps/client/src/app/routes`의 route module이 담당합니다.
- route module은 기존 `apps/client/src/pages/{pageName}` page component를 조립하고, 필요한 경우 loader와 metadata를 함께 내보냅니다.
- 핵심 공개 route loader는 독립 QueryClient에 필수 데이터를 채운 뒤 dehydrated state를 전달하여, 기존 TanStack Query page hook을 그대로 재사용합니다.

## Bottom Navigation Policy

하단 네비게이션바는 모든 페이지에 고정으로 들어가지 않습니다.

현재 하단 네비게이션바가 고정적으로 들어가는 페이지는 아래와 같습니다.

| Page             | Path               |
| ---------------- | ------------------ |
| 홈 페이지        | `/`                |
| 저장 페이지      | `/saved`           |
| 지도 페이지      | `/map`             |
| 예약 정보 페이지 | `/my-reservations` |
| 마이 페이지      | `/mypage`          |

하단 네비게이션바가 필요한 page는 `BottomNavigationLayout`에서 렌더링합니다.

저장(`/saved`)과 지도(`/map`)는 하단 네비게이션 URL을 먼저 고정하기 위한 임시 route입니다.
실제 화면이 구현되기 전까지는 준비중 페이지를 렌더링합니다.
