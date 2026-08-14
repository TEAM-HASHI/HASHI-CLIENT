# Routing And Access Policy

이 문서는 `apps/client`의 페이지 URL, 접근 권한, 라우터 배치 기준을 정리합니다.

## Router Structure

- 라우터 설정은 `apps/client/src/app/router`에서 관리합니다.
- route path는 `apps/client/src/app/router/path.ts`의 `ROUTES` 상수로 관리합니다.
- route config는 `apps/client/src/app/router/routes.ts`에서 관리합니다.
- browser router instance는 `apps/client/src/app/router/router.tsx`에서 생성합니다.
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

| Page                  | Path                                       | Notes                                                              |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| 홈 페이지             | `/`                                        | 첫 진입 페이지입니다.                                              |
| 검색 페이지           | `/search`                                  |                                                                    |
| 오늘의 식당 페이지    | `/restaurants/today`                       | 매장 정보, 메뉴, 리뷰 탭을 가집니다.                               |
| 식당 상세 페이지      | `/restaurants/:restaurantId`               | 매장 정보, 메뉴, 리뷰 탭을 가집니다.                               |
| 메뉴 상세 페이지      | `/restaurants/:restaurantId/menus/:menuId` | 식당 메뉴 카드에서 진입하는 메뉴 상세 화면입니다.                  |
| hashi 픽 페이지       | `/restaurants/hashi-pick`                  |                                                                    |
| 인기 맛집 페이지      | `/restaurants/popular`                     |                                                                    |
| 지도 페이지           | `/map`                                     | 준비중 페이지를 렌더링합니다.                                      |
| 매거진 리스트 페이지  | `/magazines`                               | 유지 여부 논의 중입니다.                                           |
| 매거진 상세 페이지    | `/magazines/:magazineId`                   | 유지 여부 논의 중입니다.                                           |
| 카카오 OAuth callback | `/oauth/callback/kakao`                    | 카카오 인가 code/state 처리 후 기존/신규 회원 흐름으로 분기합니다. |

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

## SEO And HTTP Delivery

production build는 공개 API를 기준으로 다음 URL을 정적 HTML로 생성하고 `index, follow`로 제공합니다.

- `/`
- `/restaurants/hashi-pick`
- `/restaurants/popular`
- 실제로 존재하는 `/restaurants/{restaurantId}`
- 실제로 존재하는 `/restaurants/{restaurantId}/menus/{menuId}`
- `/magazines`

Vercel은 canonical URL을 생성된 디렉터리형 `index.html`로 명시적으로 rewrite합니다. 식당과 메뉴의 동적 rewrite도 해당 ID의 실제 `index.html`만 가리키므로, 현재 build에 생성되지 않은 ID는 목적 파일을 찾지 못해 `404.html`과 HTTP 404로 응답합니다. 모든 경로를 SPA 홈으로 보내는 포괄 rewrite는 두지 않습니다. `cleanUrls: false`, `trailingSlash: false`를 사용해 디렉터리형 산출물을 정확히 제공하면서 canonical URL과 동일한 slash 없는 URL을 유지합니다.

browser runtime에서 최초 pathname과 정적 canonical이 일치하는 `index, follow` 문서는 API loading과 일시적인 5xx 동안 기존 head를 유지합니다. API 성공 후 page model이 head를 갱신하고, 유효하지 않은 param 또는 확인된 404는 `NotFoundPage`의 `noindex, nofollow`가 우선합니다. SPA 내부 이동에는 대응 정적 문서가 없으므로 route별 안전한 fallback을 즉시 적용합니다.

검색, 오늘의 식당, 지도, 준비중 화면과 미완성 매거진 상세는 정적 `public-noindex-shell.html`로 rewrite하고 `noindex, follow`를 사용합니다. 인증·사용자 전용·OAuth callback route는 `private-noindex-shell.html`로 rewrite하고 `noindex, nofollow`를 사용합니다. 이 robots 정책은 접근 제어가 아니며 기존 route guard와 API 인증을 대체하지 않습니다.

정적 inventory는 배포 시점의 공개 API 상태입니다. 새 식당이나 메뉴는 클라이언트 SEO build와 Vercel 배포가 완료된 뒤 사용자에게 공개해야 하며, 다음 배포 전에는 새 URL 직접 접근이 404가 될 수 있습니다. 전체 SEO 설계와 실패 기준은 `docs/architecture/seo.md`를 따릅니다.

## Lazy Loading Policy

- 가장 먼저 접근하는 홈 페이지(`/`)는 eager loading합니다.
- 홈을 제외한 페이지 route는 lazy loading합니다.
- 각 route는 `apps/client/src/pages/{pageName}`의 페이지 컴포넌트를 렌더링합니다.

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
