# Page Spec: `KakaoOAuthCallbackPage`

Jira: HASHI-112

## Purpose

- 카카오 OAuth authorize 완료 후 프론트 callback URL로 돌아온 `code`와 `state`를 검증하고, HASHI 서버 로그인 API로 기존 회원/신규 회원 흐름을 분기한다.

## Route

- path: `/oauth/callback/kakao`
- path constant:
  - `ROUTES.kakaoOAuthCallback`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
- access type:
  - public
- guard:
  - none
- lazy loading:
  - `lazyPages.kakaoOAuthCallback`
- bottom navigation:
  - no
- redirect:
  - missing code/state mismatch/API failure: `ROUTES.loginRequired`
  - existing user success: stored `redirectTo` or `ROUTES.home`
  - new user success: `ROUTES.profileNew` with optional `redirectTo`

## Location

- page path:
  - `apps/client/src/pages/kakaoOAuthCallback/KakaoOAuthCallbackPage.tsx`
- spec path:
  - `apps/client/src/pages/kakaoOAuthCallback/KakaoOAuthCallbackPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [x] URL search params에서 `code`와 `state`를 읽는다.
- [x] 저장된 OAuth state와 callback state가 일치하는지 검증한다.
- [x] React StrictMode에서 callback API가 중복 호출되지 않도록 `useRef`로 방어한다.
- [x] `POST /api/v1/auth/kakao/login` body는 `{ code }`만 보낸다.
- [x] 기존 회원이면 response `Authorization` header에서 accessToken을 추출해 메모리 세션에 저장한다.
- [x] 기존 회원이면 `/api/v1/auth/me`를 accessToken 기반으로 호출한다.
- [x] 저장된 accessToken은 공통 `request`에서 이후 API 요청의 `Authorization: Bearer {accessToken}` header로 주입한다.
- [x] 신규 회원이면 onboarding 세션을 메모리에 표시하고 `ROUTES.profileNew`로 이동한다.
- [x] callback 처리 중에는 전체 화면 loading UI를 표시한다.

## HASHI-SERVER Contract Check

- source:
  - `HASHI-SERVER/src/main/java/org/sopt/hashi/auth/internal/web/AuthController.java`
  - `HASHI-SERVER/src/main/java/org/sopt/hashi/auth/internal/kakao/KakaoLoginRequest.java`
  - `HASHI-SERVER/src/main/java/org/sopt/hashi/auth/internal/kakao/KakaoLoginResponse.java`
  - `HASHI-SERVER/src/main/java/org/sopt/hashi/shared/response/SuccessResponse.java`
  - `HASHI-SERVER/src/main/java/org/sopt/hashi/auth/internal/security/SecurityConfig.java`
  - `HASHI-SERVER/src/main/java/org/sopt/hashi/auth/internal/security/CookieUtil.java`
- Swagger/generated OpenAPI and server controller match for the client-facing request body:
  - `POST /api/v1/auth/kakao/login`
  - request body: `{ code: string }`
  - no client `redirectUri`, `state`, `clientId`, or `clientSecret` is sent to HASHI-SERVER login API.
- The server exchanges the Kakao code with Kakao using server-side `KAKAO_REDIRECT_URI`; deployed `VITE_KAKAO_REDIRECT_URI` and server `KAKAO_REDIRECT_URI` must therefore match the same Kakao redirect URI.
- success response envelope:
  - existing member: `{ success: true, code: "AUTH-200", message, data: { registered: true } }`
  - new member: `{ success: true, code: "AUTH-201", message, data: { registered: false } }`
- existing member token delivery:
  - accessToken: response header `Authorization: Bearer {accessToken}`
  - refreshToken: `Set-Cookie` HttpOnly `refresh_token`
- new member token delivery:
  - onboardingToken: `Set-Cookie` HttpOnly `signup_token`
- HASHI-112 client responsibility for new members ends after setting the onboarding session marker and navigating to `ROUTES.profileNew`.
- The OAuth callback does not read `signup_token` in JavaScript and does not call the onboarding completion endpoint.
- CORS exposes `Authorization` via `Access-Control-Expose-Headers`.
- failure codes checked in server code:
  - Kakao auth failure: `AUTH-005`
  - Kakao upstream/server failure: `AUTH-007`
  - invalid input: common validation error

## Data Dependencies

### Mutation

- mutation:
  - `requestKakaoLogin`
- endpoint:
  - `POST /api/v1/auth/kakao/login`
- request data:
  - `{ code: string }`
- success handling:
  - `registered: true`: accessToken 저장, `/auth/me` 호출, 기존 redirect 정책으로 이동
  - `registered: false`: onboarding session 표시, profile 생성 화면으로 이동
  - `registered: false` 이후의 `POST /api/v1/users/onboarding` 호출은 별도 온보딩 API 연동 범위로 남긴다.
- failure handling:
  - `ROUTES.loginRequired`로 replace 이동

### Query

- query:
  - `getAuthMe`
- endpoint:
  - `GET /api/v1/auth/me`
- enabled condition:
  - Kakao login 응답이 기존 회원이고 accessToken이 있을 때
- request header:
  - `Authorization: Bearer {accessToken}`
- follow-up API authorization:
  - after `setAccessToken`, shared `request` injects the same bearer header unless a caller provides an explicit Authorization header.
- failure handling:
  - `ROUTES.loginRequired`로 replace 이동

## State

- local state:
  - `hasHandledCallbackRef`: StrictMode 중복 실행 방어
- URL state:
  - `code`
  - `state`
- storage state:
  - `sessionStorage['hashi:oauth:kakao-state']`
- auth session:
  - existing user: memory access token
  - new user: memory onboarding session marker

## Error Handling

- code 없음: loginRequired로 replace 이동
- state 없음/불일치/저장값 파싱 실패: loginRequired로 replace 이동
- login API 실패: loginRequired로 replace 이동
- 기존 회원인데 Authorization header 없음: loginRequired로 replace 이동
- `/auth/me` 실패: loginRequired로 replace 이동

## Verification

- [x] `corepack pnpm --filter @hashi/client test -- src/pages/kakaoOAuthCallback/KakaoOAuthCallbackPage.test.tsx`
- [x] `corepack pnpm --filter @hashi/client test -- src/shared/api/request.test.ts src/features/auth/api/getAuthMe.test.ts src/features/auth/api/kakaoLogin.test.ts src/pages/kakaoOAuthCallback/KakaoOAuthCallbackPage.test.tsx`
- [x] `corepack pnpm --filter @hashi/client lint`
- [x] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] Chrome DevTools Network에서 `POST /api/v1/auth/kakao/login` payload가 `{ code }`인지 확인
- [ ] 기존 회원 응답 header에 `Authorization`, `Access-Control-Expose-Headers: Authorization`, `Set-Cookie`가 보이는지 확인
