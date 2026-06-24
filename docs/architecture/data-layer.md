# Data Layer

HASHI Client의 데이터 레이어는 앱 내부에서 먼저 조립하고, 실제 재사용 근거가 생긴 뒤 공통 패키지로 승격합니다.

## Current State

현재 저장소에는 아직 HTTP client나 서버 상태 라이브러리가 기본 dependency로 들어와 있지 않습니다.

목표 스택은 다음과 같습니다.

- HTTP client: `ky`
- 서버 상태: `TanStack Query`

데이터 레이어를 추가하는 티켓에서는 다음 기준을 따릅니다.

- 서버 상태: TanStack Query 도입을 우선 검토합니다.
- HTTP client: Ky 도입을 우선 검토합니다.
- API base URL: Vite 환경변수로 관리합니다.
- dependency 추가는 `docs/conventions/package-management.md`를 따릅니다.

## Provider Boundary

서버 상태 Provider는 앱 실행 조립 코드에 둡니다.

```text
apps/client/src/app/providers/
```

- `QueryClient`는 앱 단위로 생성합니다.
- 기본 옵션은 UX 요구사항을 확인한 뒤 명시합니다.
- retry, stale time, error boundary 연결을 임의로 전역화하지 않습니다.

## HTTP Client Boundary

HTTP client와 API helper는 앱 내부 shared 영역에서 시작합니다.

```text
apps/client/src/shared/api/
```

- base URL, header, 인증 토큰 주입 지점은 한 곳에서 조립합니다.
- endpoint 함수는 호출부가 필요한 타입과 에러 정책을 알 수 있게 작성합니다.
- 인증, refresh, retry 정책은 실제 요구사항 없이 미리 복잡하게 만들지 않습니다.

## Query And Mutation Placement

페이지나 기능에 묶인 query/mutation은 먼저 owning page 또는 feature 가까이에 둡니다.

```text
apps/client/src/pages/{pageName}/hooks/
apps/client/src/features/{featureName}/hooks/
```

여러 페이지에서 같은 서버 상태를 공유하면 feature 또는 shared로 승격합니다.

```text
apps/client/src/features/{featureName}/
apps/client/src/shared/hooks/
```

## Query Key Rules

- query key에는 API 응답을 바꾸는 인자를 포함합니다.
- query key factory는 같은 도메인 안에서 named export로 관리합니다.
- 문자열 key를 호출부마다 직접 만들지 않습니다.
- key 구조를 바꿀 때는 영향을 받는 invalidate/refetch 호출부를 함께 확인합니다.

## Promotion Rule

데이터 레이어 코드를 `packages/*`로 옮기는 것은 마지막 선택입니다.

- `apps/client`에서만 쓰면 앱 내부에 둡니다.
- UI 패키지인 `packages/sds-ui`는 API, query, mutation을 알면 안 됩니다.
- icon 패키지인 `packages/sds-icons`는 데이터 레이어와 무관해야 합니다.
- 여러 앱이나 패키지가 실제로 같은 API helper를 요구하게 되면 별도 shared package 도입을 검토합니다.
