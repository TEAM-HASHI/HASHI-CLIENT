# Page Spec: `LoginRequiredPage`

Jira: HASHI-112

## Purpose

- 비로그인 사용자가 회원 전용 route에 접근했을 때 로그인 필요 안내와 Kakao OAuth 시작 버튼을 제공한다.

## Route

- path: `/login-required`
- path constant:
  - `ROUTES.loginRequired`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - `BottomNavigationLayout`
- access type:
  - guestOnly
- guard:
  - `GuestOnlyRoute`
- lazy loading:
  - `lazyPages.loginRequired`
- bottom navigation:
  - yes
- redirect:
  - authenticated: `ROUTES.home`
  - unauthenticated: none

## Requirements

- [x] 로그인 필요 안내 이미지와 문구를 표시한다.
- [x] 기존 `KakaoStartButton` UI를 재사용한다.
- [x] 버튼 클릭 시 Kakao OAuth authorize URL로 이동한다.
- [x] Kakao OAuth URL의 `client_id`와 `redirect_uri`는 Vite env에서 읽는다.
- [x] `client_id` 또는 `redirect_uri`가 비어 있으면 `undefined` URL로 이동하지 않는다.
- [x] `AuthOnlyRoute`가 전달한 `location.state.from`이 있으면 OAuth state의 `redirectTo`로 저장한다.
- [x] 임의 `/signup` route를 만들지 않는다.

## Environment

- required local env:
  - `VITE_KAKAO_CLIENT_ID`: Kakao REST API key
  - `VITE_KAKAO_REDIRECT_URI`: current dev/prod origin + `/oauth/callback/kakao`
- local setup:
  - 실제 값은 `apps/client/.env.local`에 둔다.
  - Vite는 dev server 시작 시 env를 읽으므로 env 수정 후 dev server를 재시작한다.
  - `VITE_KAKAO_REDIRECT_URI`는 현재 실행 포트와 Kakao developers console에 등록된 redirect URI와 정확히 일치해야 한다.
- secret policy:
  - client secret은 프론트 env에 두지 않는다.
  - `VITE_KAKAO_CLIENT_SECRET`은 만들지 않는다.

## Data Dependencies

### Mutation

- mutation: none in this page
- side effect:
  - `useKakaoOAuthStart`가 OAuth state를 `sessionStorage`에 저장하고 Kakao authorize URL로 이동한다.

## State

- route state:
  - optional `location.state.from`
- storage state:
  - `sessionStorage['hashi:oauth:kakao-state']`

## Navigation

- entry:
  - unauthenticated access to an authOnly route
- OAuth authorize URL:
  - `https://kauth.kakao.com/oauth/authorize`
  - query params: `client_id`, `redirect_uri`, `response_type=code`, `state`
- success redirect:
  - handled by `KakaoOAuthCallbackPage`
- auth redirect:
  - authenticated users are redirected home by `GuestOnlyRoute`

## Error Handling

- `VITE_KAKAO_CLIENT_ID` 없음: Kakao authorize URL로 이동하지 않고 개발자가 확인할 수 있게 `console.error`를 남긴다.
- `VITE_KAKAO_REDIRECT_URI` 없음: Kakao authorize URL로 이동하지 않고 개발자가 확인할 수 있게 `console.error`를 남긴다.
- OAuth state 저장 실패: Kakao authorize URL로 이동하지 않는다.

## Verification

- [ ] Kakao button click opens `https://kauth.kakao.com/oauth/authorize`
- [ ] authorize URL의 `client_id`가 `undefined`가 아닌지 확인
- [ ] authorize URL의 `redirect_uri`가 `undefined`가 아닌지 확인
- [ ] `redirect_uri`가 실제 dev server 포트와 일치하는지 확인
- [ ] Kakao developers console에 등록된 redirect URI와 env 값이 일치하는지 확인
- [ ] authOnly route에서 넘어온 `state.from`이 OAuth 후 redirect target으로 보존되는지 확인
- [ ] `corepack pnpm --filter @hashi/client test -- src/features/auth/utils/kakaoOAuth.test.ts src/features/auth/hooks/useKakaoOAuthStart.test.tsx`
- [ ] `corepack pnpm --filter @hashi/client test`
