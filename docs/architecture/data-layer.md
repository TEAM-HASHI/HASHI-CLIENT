# Data Layer

HASHI Client의 데이터 레이어는 앱 내부에서 먼저 조립하고, 실제 재사용 근거가 생긴 뒤 공통 패키지로 승격합니다.

## Current State

현재 `apps/client`에는 다음 데이터 레이어가 설정되어 있습니다.

- HTTP client: `ky`
- 서버 상태: `TanStack Query`
- API base URL: `VITE_API_BASE_URL`
- OpenAPI type generation: `openapi-typescript`
- 공통 request helper: `apps/client/src/shared/api`
- API error model: `ApiError`와 `HttpStatusError`가 HTTP status를 보존
- generated API type output: `apps/client/src/shared/api/generated/openapi.ts`
- Query provider/client: `apps/client/src/app/providers/QueryProvider.tsx`, `apps/client/src/shared/lib/queryClient.ts`

새 dependency를 추가하거나 버전을 바꾸는 경우 `docs/conventions/package-management.md`를 따릅니다.

## Provider Boundary

서버 상태 Provider는 앱 실행 조립 코드에 둡니다.

```text
apps/client/src/app/providers/
apps/client/src/shared/lib/queryClient.ts
```

- `QueryClient`는 앱 단위로 생성합니다.
- 전역 기본 옵션은 앱 전체 UX로 확정된 값만 둡니다.
- page/feature별 stale time, retry, enabled, suspense 여부는 호출부 가까이에서 판단합니다.
- error boundary와 suspense fallback은 route/page UX와 충돌하지 않는지 확인합니다.

## HTTP Client Boundary

HTTP client와 response envelope 처리는 앱 내부 shared 영역에서 관리합니다.

```text
apps/client/src/shared/api/
```

- base URL, timeout, retry, header, 인증 토큰 주입 지점은 한 곳에서 조립합니다.
- endpoint 함수는 `request` 같은 low-level helper를 사용합니다.
- endpoint 함수는 React, TanStack Query, route, UI state를 알면 안 됩니다.
- 인증, refresh, retry 정책은 실제 요구사항 없이 미리 복잡하게 만들지 않습니다.

## Error Handling Rules

`apps/client/src/shared/api`는 서버 response envelope를 파싱하고 `success: false` 응답을 `ApiError`로 변환합니다.

- `ApiError`는 서버 `code`, `message`, `errors`와 HTTP status를 함께 보존합니다.
- `HttpStatusError`는 proxy HTML 응답, 빈 503 응답처럼 서버 envelope가 없는 HTTP 실패의 status를 보존합니다.
- HTTP status는 retry, 로그인 유도, not found, Sentry 기록 여부를 판단할 때 사용합니다.
- field-level error는 `ApiError.fieldErrors`와 문서화된 error code를 기준으로 page/form 가까이에서 매핑합니다.
- 서버 `message`는 임시 사용자 문구 후보일 수 있지만, 제품 문구는 page spec에서 확정합니다.
- non-JSON error response는 `HttpStatusError`로 정규화해 JSON 파싱 오류가 사용자 UI 정책을 깨지 않도록 합니다.

TanStack Query retry는 `shared/lib/queryClient.ts`의 기본 정책에서 한 번만 판단합니다.

- network error, timeout, `ApiError`/`HttpStatusError`의 `status >= 500`만 최대 1회 재시도합니다.
- `400`, `401`, `403`, `404`, `405`, `409`, `415` 같은 사용자 입력, 인증, 권한, not found, 비즈니스 충돌, 업로드 validation 오류는 자동 재시도하지 않습니다.
- mutation은 중복 실행 위험이 있으므로 기본 retry를 비활성화합니다.
- 전역 `throwOnError: true`는 사용하지 않습니다. page-entry required data는 route/page boundary 또는 `useSuspenseQuery`로, 검색/필터/form처럼 부분 실패가 자연스러운 화면은 local error UI로 처리합니다.
- ErrorBoundary에서 잡힌 에러는 Sentry 필터를 거쳐 unknown error, render error, 5xx status error, 405 integration error만 기록합니다.

## API Integration Workflow

Swagger/OpenAPI 또는 API 스펙을 받아 퍼블리싱된 화면에 연결할 때는 다음 순서를 따릅니다.

OpenAPI 스키마에서 타입을 갱신할 때는 다음 script를 사용합니다.

```bash
pnpm gen:api-types
```

schema URL은 공개 문서에 직접 적지 않습니다. 로컬에서는 `apps/client/.env.openapi.local` 또는 shell의 `OPENAPI_SCHEMA_URL`에 raw OpenAPI JSON/YAML URL을 설정합니다. Swagger UI HTML URL은 입력으로 사용할 수 없습니다.

```bash
OPENAPI_SCHEMA_URL=http://localhost:8080/v3/api-docs pnpm gen:api-types
```

1. `api-spec-intake`로 endpoint와 UI 상태를 API Integration Map으로 정리합니다.
2. `api-integrator`로 endpoint, type, query key, query/mutation hook, invalidation을 구현합니다.
3. `verify-api-integration`으로 query key, query mode, invalidation, UI state, docs sync를 점검합니다.

상세 절차는 `docs/workflows/api-integration.md`와 `.agents/recipes/api-integration.md`를 따릅니다.

## Placement

페이지나 기능에 묶인 API 코드는 먼저 owning page 또는 feature 가까이에 둡니다.

```text
apps/client/src/pages/{pageName}/
  api/
  queries/
  mutations/
  hooks/
  types.ts

apps/client/src/features/{featureName}/
  api/
  queries/
  mutations/
  hooks/
  types.ts
```

여러 페이지에서 같은 서버 상태와 같은 public API가 실제로 공유될 때만 feature 또는 shared로 승격합니다.

```text
apps/client/src/features/{featureName}/
apps/client/src/shared/hooks/
```

`apps/client/src/shared/api`에는 low-level client, request, error 처리만 둡니다.

## Query Key Rules

- query key factory는 같은 도메인 안에서 named export로 관리합니다.
- 호출부에서 문자열 key나 inline array key를 직접 만들지 않습니다.
- query key에는 API 응답을 바꾸는 인자를 모두 포함합니다.
- list, detail, infinite list key prefix를 분리합니다.
- `useQuery`와 `useInfiniteQuery`는 같은 key를 공유하지 않습니다.
- key 구조를 바꿀 때는 영향을 받는 invalidate, prefetch, cache access 호출부를 함께 확인합니다.

예시:

```ts
export const restaurantQueryKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantQueryKeys.all, 'list'] as const,
  list: (params: RestaurantListParams) =>
    [...restaurantQueryKeys.lists(), params] as const,
  infiniteLists: () => [...restaurantQueryKeys.all, 'infiniteList'] as const,
  infiniteList: (params: RestaurantListParams) =>
    [...restaurantQueryKeys.infiniteLists(), params] as const,
  details: () => [...restaurantQueryKeys.all, 'detail'] as const,
  detail: (restaurantId: string) =>
    [...restaurantQueryKeys.details(), restaurantId] as const,
}
```

## Query Mode Rules

페이지 진입에 필수인 데이터는 `useSuspenseQuery`를 우선 검토합니다.

다음 경우에는 `useQuery`를 사용합니다.

- `enabled` 조건이 필요합니다.
- 검색어, 필터, 탭, form state가 fetch 여부를 결정합니다.
- 이전 데이터나 placeholder data를 유지해야 합니다.
- 화면 일부만 loading/error 상태를 가져야 합니다.
- 수동 refetch가 interaction의 일부입니다.
- 한 컴포넌트에 독립 query가 여러 개 있어 suspense waterfall 위험이 있습니다.

무한 리스트는 `useInfiniteQuery`를 기본으로 사용합니다.
첫 페이지가 page-entry required data이고 route-level fallback이 맞는 경우에만 `useSuspenseInfiniteQuery`를 검토합니다.

## Mutation Rules

- mutation endpoint 함수는 서버 write만 수행합니다.
- mutation hook은 `useQueryClient`로 성공 후 invalidation을 명시합니다.
- invalidation은 query key factory로만 수행합니다.
- optimistic update는 API 스펙이나 제품 요구사항이 명시할 때만 추가합니다.
- field-level error는 문서화된 error code나 response field를 기준으로 매핑합니다.

## UI State Rules

API 연동은 기존 퍼블리싱 UI의 상태를 빠뜨리지 않고 연결해야 합니다.

- initial loading
- background fetching
- empty
- error and retry
- disabled while pending
- success close, navigate, or refresh

page spec이 있는 경우 `Data Dependencies`와 `Verification` 섹션을 실제 구현과 맞춥니다.

## Promotion Rule

데이터 레이어 코드를 `packages/*`로 옮기는 것은 마지막 선택입니다.

- `apps/client`에서만 쓰면 앱 내부에 둡니다.
- `packages/hds-ui`는 API, query, mutation, route, tracking, product copy, domain data를 알면 안 됩니다.
- `packages/hds-icons`는 데이터 레이어와 무관해야 합니다.
- 여러 앱이나 패키지가 같은 API helper를 요구하게 되면 별도 shared package 도입을 검토합니다.
