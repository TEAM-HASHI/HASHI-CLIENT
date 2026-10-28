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

| Page                  | Path                                       | Notes                                                                                |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| 홈 페이지             | `/`                                        | 첫 진입 페이지입니다.                                                                |
| 검색 페이지           | `/search`                                  |                                                                                      |
| 오늘의 식당 페이지    | `/restaurants/today`                       | 매장 정보, 메뉴, 사진, 리뷰 탭을 가집니다.                                           |
| 식당 상세 페이지      | `/restaurants/:restaurantId`               | 매장 정보, 메뉴, 사진, 리뷰 탭을 가집니다.                                           |
| 메뉴 상세 페이지      | `/restaurants/:restaurantId/menus/:menuId` | 식당 메뉴 카드에서 진입하는 메뉴 상세 화면입니다.                                    |
| hashi 픽 페이지       | `/restaurants/hashi-pick`                  |                                                                                      |
| 인기 맛집 페이지      | `/restaurants/popular`                     |                                                                                      |
| 지도 페이지           | `/map`                                     | Google Maps SDK 및 공개 지역·식당 API 연동. 지역 설정 오류는 재시도 UI로 처리합니다. |
| 매거진 리스트 페이지  | `/magazines`                               | 유지 여부 논의 중입니다.                                                             |
| 매거진 상세 페이지    | `/magazines/:magazineId`                   | 유지 여부 논의 중입니다.                                                             |
| 카카오 OAuth callback | `/oauth/callback/kakao`                    | 카카오 인가 code/state 처리 후 기존/신규 회원 흐름으로 분기합니다.                   |
| 공지사항 페이지       | `/notices`                                 | 마이페이지에서 진입하며 최신순 무한 스크롤, 상세 복귀 시 스크롤 위치를 복원합니다.   |
| 공지사항 상세 페이지  | `/notices/:noticeId`                       | 존재하지 않거나 삭제된 공지는 404 페이지를 렌더링합니다.                             |
| 이용약관 페이지       | `/terms`                                   | 마이페이지에서 진입하며 하단 네비게이션(`마이`)을 포함합니다.                        |
| 이용약관 상세 페이지  | `/terms/:policyId`                         | 정적 약관 콘텐츠의 조항을 Accordion으로 보여줍니다.                                  |

컬렉션 상세 `/saved/collections/:collectionId`는 공개 route다. 서버가 공개 범위를 판정하며,
공개 컬렉션은 비로그인도 조회하고 비공개·삭제·미존재 컬렉션은 404 안내를 표시한다.
비로그인 조회는 회원 조회 캐시와 분리하고, 내 목록·생성·수정·편집은 계속 인증으로 보호한다.
상세의 관리 동작은 인증된 소유자에게만 표시한다. 이 경로를 공유 URL로 확정한 것은 아니다.

## Auth Only Routes

| Page                  | Path                                                | Notes                                                                                                                                                     |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 리뷰 작성 페이지      | `/restaurants/:restaurantId/reviews/new`            |                                                                                                                                                           |
| 마이 리뷰 페이지      | `/my-reviews`                                       | 리뷰 쓰기, 작성한 리뷰보기 탭을 가집니다.                                                                                                                 |
| 리뷰 상세 페이지      | `/reviews/:reviewId`                                |                                                                                                                                                           |
| 리뷰 수정 페이지      | `/reviews/:reviewId/edit`                           |                                                                                                                                                           |
| 저장 페이지           | `/saved`                                            | API 기반 컬렉션 목록과 추가 조회를 제공합니다.                                                                                                            |
| 컬렉션 생성           | `/saved/collections/new`                            | 독립 폼 페이지이며 하단 내비게이션을 표시하지 않습니다.                                                                                                   |
| 컬렉션 수정           | `/saved/collections/:collectionId/edit`             | 독립 폼 페이지이며 변경이 있는 뒤로가기에 폐기 확인을 표시합니다.                                                                                         |
| 컬렉션 식당 편집      | `/saved/collections/:collectionId/restaurants/edit` | 소유자만 사용하는 독립 API 편집 페이지이며 하단 내비게이션 없이 개별 선택·이동·삭제를 제공합니다. 잘못된 형식의 ID는 `/saved`로 복귀합니다.               |
| 마이 페이지           | `/mypage`                                           |                                                                                                                                                           |
| 프로필 생성 페이지    | `/profile/new`                                      | 신규 회원 onboarding session만 접근하며, 인증 완료 회원은 홈으로 이동합니다.                                                                              |
| 탈퇴 페이지           | `/withdrawal`                                       | 유지 여부 논의 중입니다.                                                                                                                                  |
| 예약 페이지           | `/restaurants/:restaurantId/reservations/new`       |                                                                                                                                                           |
| 어디든 예약 페이지    | `/reservations/anywhere`                            |                                                                                                                                                           |
| 예약 요청 페이지      | `/reservations/request`                             |                                                                                                                                                           |
| 예약 정보 페이지      | `/my-reservations`                                  | 진행 중, 방문 예정, 방문 완료, 예약 취소 chip 상태에 따라 카드 디자인과 데이터가 달라지는 단일 페이지입니다.                                              |
| 예약 상세 페이지      | `/reservations/:reservationId`                      |                                                                                                                                                           |
| 예약 요청 완료 페이지 | `/reservations/:reservationId/complete`             | 예약 생성 성공 직후 replace 진입하며, `확인 완료`·브라우저 뒤로가기는 홈으로 replace 이동합니다. 생성 응답이 없는 직접 진입·새로고침도 홈으로 이동합니다. |

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

| Page          | Path           | Access   | Render           | Notes                                      |
| ------------- | -------------- | -------- | ---------------- | ------------------------------------------ |
| 준비중 페이지 | `/coming-soon` | `public` | 준비중 안내 화면 | 직접 접근 가능한 공통 준비중 페이지입니다. |
| 지도 페이지   | `/map`         | `public` | 준비중 안내 화면 | 실제 지도 화면 구현 전 임시 route입니다.   |

## Not Found Route

| Page       | Path | Notes                                            |
| ---------- | ---- | ------------------------------------------------ |
| 404 페이지 | `*`  | 서비스에 없는 URL을 직접 입력했을 때 보여줍니다. |

## Lazy Loading Policy

- 가장 먼저 접근하는 홈 페이지(`/`)는 eager loading합니다.
- 홈을 제외한 페이지 route는 lazy loading합니다.
- 각 route는 `apps/client/src/pages/{pageName}`의 페이지 컴포넌트를 렌더링합니다.
- lazy route의 chunk import 실패는 `RouteChunkLoadError`로 구분합니다.
- 오류 화면의 `다시 시도` 버튼은 API 오류에서는 기존 ErrorBoundary reset을 실행하고, route chunk 오류에서는 페이지를 새로고침합니다.

## Bottom Navigation Policy

하단 네비게이션바는 모든 페이지에 고정으로 들어가지 않습니다.

현재 하단 네비게이션바가 고정적으로 들어가는 페이지는 아래와 같습니다.

| Page             | Path                               |
| ---------------- | ---------------------------------- |
| 홈 페이지        | `/`                                |
| 저장 페이지      | `/saved`                           |
| 컬렉션 상세      | `/saved/collections/:collectionId` |
| 지도 페이지      | `/map`                             |
| 예약 정보 페이지 | `/my-reservations`                 |
| 마이 페이지      | `/mypage`                          |

하단 네비게이션바가 필요한 page는 `BottomNavigationLayout`에서 렌더링합니다.

저장 목록·컬렉션 상세는 API 기반 화면이며 BottomNavigationLayout을 사용합니다.
제품 라우트는 `SavedApiPage`·`CollectionFormQueryPage`·`CollectionEditorQueryPage`로 lazy load합니다.
목 데이터 Provider는 제품 RootLayout에서 사용하지 않으며 지도/퍼블리싱 fixture에서만 명시적으로 제공합니다.
컬렉션 생성·수정·식당 편집은 하단 내비게이션 없는 독립 페이지입니다.
지도(`/map`)는 공개 지역·식당 조회를 사용하는 지도·검색·필터·목록·상세 화면을 제공합니다.
지도 SDK는 Google Maps를 사용합니다. 지역 설정 실패 시 샘플 데이터로 대체하지 않습니다. 요약·매장 정보·메뉴·사진·리뷰 및 저장 수/로그인 사용자 저장 여부는 조회 API로 연결하며, 저장/예약 mutation은 연결하지 않습니다. 사진 탭은 공통 상세 feature의 공개 사진 API, 필터와 커서 페이지네이션을 재사용하며 요약 이미지를 전체 사진 목록으로 간주하지 않습니다.
지도 검색은 `/search`에 검증된 map context를 전달하고 replace navigation으로 복귀합니다. 지도 상태는 메모리에서 이탈 후 5분 미만 복원하며, 활성 지도 탭 재선택은 reset route state를 전달해 즉시 초기화합니다. 일반 검색 URL과 접근 정책은 변경하지 않습니다.

### 이용약관 API route parameter (2026-10-17)

`/terms/:policyId`의 parameter는 공개 목록 API가 제공하는 양의 정수 `termsId`를 사용한다. 정적 약관 slug가 아니라 서버 ID로 상세를 조회하며 잘못된 ID와 미게시/없는 약관의 404는 NotFound로 처리한다.
