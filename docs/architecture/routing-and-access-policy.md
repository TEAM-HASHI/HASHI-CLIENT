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
- 회원이 `guestOnly` 페이지인 `/login-required`에 접근하면 `/`로 이동합니다.
- 존재하지 않는 URL은 `*` route에서 404 페이지를 렌더링합니다.
- 로그인 유도 바텀시트는 route page가 아니며, `public` 페이지 안에서 로그인 필요한 기능을 비회원이 실행할 때 렌더링합니다.

## Auth Status

- 현재 `useAuthStatus`는 실제 인증 연동 전 임시 hook입니다.
- 페이지 개발 중 회원 전용 화면을 바로 확인할 수 있도록 기본값은 `authenticated`입니다.
- 추후 OAuth/API 인증 흐름이 연결되면 `useAuthStatus` 내부 구현을 실제 로그인 상태 기준으로 교체합니다.

## Public Routes

| Page                 | Path                         | Notes                                |
| -------------------- | ---------------------------- | ------------------------------------ |
| 홈 페이지            | `/`                          | 첫 진입 페이지입니다.                |
| 검색 페이지          | `/search`                    |                                      |
| 오늘의 식당 페이지   | `/restaurants/today`         | 매장 정보, 메뉴, 리뷰 탭을 가집니다. |
| 식당 상세 페이지     | `/restaurants/:restaurantId` | 매장 정보, 메뉴, 리뷰 탭을 가집니다. |
| hashi 픽 페이지      | `/restaurants/hashi-pick`    |                                      |
| 인기 맛집 페이지     | `/restaurants/popular`       |                                      |
| 지도 페이지          | `/map`                       | 준비중 페이지를 렌더링합니다.        |
| 매거진 리스트 페이지 | `/magazines`                 | 유지 여부 논의 중입니다.             |
| 매거진 상세 페이지   | `/magazines/:magazineId`     | 유지 여부 논의 중입니다.             |

## Auth Only Routes

| Page               | Path                                          | Notes                                                                                                        |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 리뷰 작성 페이지   | `/restaurants/:restaurantId/reviews/new`      |                                                                                                              |
| 마이 리뷰 페이지   | `/my-reviews`                                 | 리뷰 쓰기, 작성한 리뷰보기 탭을 가집니다.                                                                    |
| 리뷰 상세 페이지   | `/reviews/:reviewId`                          |                                                                                                              |
| 리뷰 수정 페이지   | `/reviews/:reviewId/edit`                     |                                                                                                              |
| 저장 페이지        | `/saved`                                      | 준비중 페이지를 렌더링합니다.                                                                                |
| 마이 페이지        | `/mypage`                                     |                                                                                                              |
| 프로필 생성 페이지 | `/profile/new`                                |                                                                                                              |
| 탈퇴 페이지        | `/withdrawal`                                 | 유지 여부 논의 중입니다.                                                                                     |
| 예약 페이지        | `/restaurants/:restaurantId/reservations/new` |                                                                                                              |
| 어디든 예약 페이지 | `/reservations/anywhere`                      |                                                                                                              |
| 예약 요청 페이지   | `/reservations/request`                       |                                                                                                              |
| 예약 정보 페이지   | `/my-reservations`                            | 진행 중, 방문 예정, 방문 완료, 예약 취소 chip 상태에 따라 카드 디자인과 데이터가 달라지는 단일 페이지입니다. |
| 예약 상세 페이지   | `/reservations/:reservationId`                |                                                                                                              |

## Auth Gate Policy

로그인 유도 바텀시트는 route page가 아니라 `AuthGateBottomSheet`로 처리합니다.
페이지 접근 자체는 허용하지만 내부 기능에 로그인이 필요한 경우에 사용합니다.

| UI                   | Route | Notes                                                                                                   |
| -------------------- | ----- | ------------------------------------------------------------------------------------------------------- |
| 로그인 유도 바텀시트 | 없음  | 비로그인 사용자가 `public` 페이지 안에서 예약하기, 저장하기 같은 로그인 필요 기능을 누를 때 표시합니다. |

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
