# Route Path Generation Design

## Context

HASHI Client는 동적 route pathname을 만들 때 React Router의
`generatePath`와 `String.prototype.replace`를 혼용하고 있다. 수동 치환은
호출부마다 인코딩 여부가 달라지고, 다중 parameter 누락이나 placeholder 오타를
정적으로 확인하기 어렵다.

## Goal

- 모든 동적 route pathname을 React Router의 `generatePath`로 생성한다.
- path parameter에는 인코딩하지 않은 원본 값을 전달하고 React Router의 인코딩
  규칙을 일관되게 적용한다.
- query string은 `URLSearchParams`, navigation state는 `navigate` 옵션으로 기존
  책임을 유지한다.
- 기존 URL 구조와 사용자 navigation 동작은 변경하지 않는다.

## Scope

- `features/restaurantDetail/utils/restaurantDetailRoutes.ts`의 path helper를 `app/router/routePaths.ts`로 이동
- 홈, 검색 결과, 큐레이션 목록의 식당 상세 링크
- 내 예약의 예약 상세, 리뷰 상세, 리뷰 작성 navigation
- 관련 route helper 및 페이지 navigation 테스트
- `docs/architecture/app-structure.md`의 routing rule
- `apps/client/src/features/point/types` 빈 디렉터리 잔존 여부 확인

## Non-goals

- route pattern 또는 URL 구조 변경
- React Router route tree 변경
- lazy route/loading fallback 분리
- AsyncBoundary/ErrorBoundary 정책 변경
- API, query key, 화면 UI 변경

## Design

동적 pathname은 React Router의 `generatePath(ROUTES.someRoute, params)`로 생성한다.
한 호출부에서만 사용하는 URL은 호출 위치에서 직접 생성할 수 있지만, 여러 페이지와
feature가 재사용하는 route-specific helper는 `app/router/routePaths.ts`가 소유한다.
식당 상세·메뉴 상세·예약·리뷰 작성 URL 생성 helper는 이 파일로 이동하고,
`restaurantDetailRoutes.ts`에는 상세 화면의 state 해석과 navigation 동작만 남긴다.

특수문자 인코딩은 `generatePath`에 맡긴다. 호출부에서
`encodeURIComponent`를 먼저 적용하지 않아 이중 인코딩을 방지한다. query string은
pathname 생성 후 `URLSearchParams`로 연결하고, `returnTo` 같은 navigation state는
기존 값을 그대로 유지한다.

## Testing

- 단일 및 다중 path parameter 생성
- `/`, `?`, 공백, 한글을 포함한 raw parameter 인코딩
- query parameter 조합
- 홈·검색·큐레이션 목록·내 예약 navigation 회귀
- source audit로 동적 `ROUTES.*.replace` 제거 확인

## Documentation and Folder Impact

`docs/architecture/app-structure.md`에 동적 route URL은 수동 문자열 치환 대신
`generatePath`를 사용하고, 재사용 URL helper는 `app/router/routePaths.ts`에서
관리한다는 규칙을 추가한다. `point/types`는 현재 Git tree에 없고 Git은 완전히 빈
디렉터리를 추적하지 않으므로, 잔존하지 않음을 확인하는 것으로 완료한다.
