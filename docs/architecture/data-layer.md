# Data Layer

HASHI 앱의 데이터 레이어는 앱 내부에서 먼저 조립하고, 실제 재사용 근거가 생긴 뒤 공통 패키지로 승격합니다.

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

`apps/admin`은 client app과 분리된 admin/user OpenAPI 타입을 사용합니다.

- HTTP client: `ky`
- 서버 상태: `TanStack Query`
- API base URL: `VITE_ADMIN_API_BASE_URL`, fallback `VITE_API_BASE_URL`
- 공통 request helper: `apps/admin/src/shared/api`
- admin write generated output: `apps/admin/src/shared/api/generated/openapi.ts`
- public read/upload generated output: `apps/admin/src/shared/api/generated/user-openapi.ts`
- Query provider/client: `apps/admin/src/app/providers/QueryProvider.tsx`, `apps/admin/src/shared/lib/queryClient.ts`
- admin 인증은 response `Authorization` header의 bearer token과 credential cookie를 함께 사용합니다.
- 보호 API가 `401`을 반환하면 user OpenAPI의 `POST /api/v1/auth/reissue`로 access token을 한 번 재발급하고 원 요청을 한 번 재시도합니다. 동시 `401`은 하나의 재발급 요청을 공유하며, 실패하면 재발급을 시작한 동일 session만 지우고 admin query cache도 함께 비웁니다.
- 예약 query와 모든 admin mutation은 실제 endpoint를 사용합니다. 식당·매거진 공개 목록과 수정 prefill은 user API를 사용하며 전체 관리자 재고로 표현하지 않습니다.

새 dependency를 추가하거나 버전을 바꾸는 경우 `docs/conventions/package-management.md`를 따릅니다.

## Lighthouse CI Runtime

Lighthouse는 별도 로컬 build가 아니라 PR의 Vercel Preview 배포 URL을 측정합니다. Client runtime API 주소는 GitHub Actions Variable이 아니라 Vercel Preview Environment의 `VITE_API_BASE_URL`에서 build 시 주입됩니다.

- Preview에는 production이 아닌 개발 또는 staging API의 HTTP(S) 절대 URL을 등록합니다.
- API 서버 CORS allowlist는 HASHI Client의 Vercel Preview origin을 허용해야 합니다.
- Lighthouse가 기록한 모든 LHR에서 `GET /api/v1/magazines/banners`와 `GET /api/v1/restaurants?type=sns-hot&size=5`의 HTTP 2xx를 확인합니다.
- Preview URL 불일치, runtime error, 브라우저 CORS 오류, 필수 API 누락·non-2xx는 측정 신뢰성 오류로 workflow를 실패시킵니다.
- Lighthouse category 점수 미달은 API 연결 실패와 구분해 warning으로만 기록합니다.
- Vercel Preview의 자동 `X-Robots-Tag: noindex`가 SEO 점수에 포함되므로 이 결과를 production SEO 색인 가능 여부의 최종 검증으로 사용하지 않습니다.

## Provider Boundary

서버 상태 Provider는 앱 실행 조립 코드에 둡니다.

```text
apps/client/src/app/providers/
apps/client/src/shared/lib/queryClient.ts
apps/admin/src/app/providers/
apps/admin/src/shared/lib/queryClient.ts
```

- `QueryClient`는 앱 단위로 생성합니다.
- 전역 기본 옵션은 앱 전체 UX로 확정된 값만 둡니다.
- page/feature별 stale time, retry, enabled, suspense 여부는 호출부 가까이에서 판단합니다.
- error boundary와 suspense fallback은 route/page UX와 충돌하지 않는지 확인합니다.

## HTTP Client Boundary

HTTP client와 response envelope 처리는 앱 내부 shared 영역에서 관리합니다.

```text
apps/client/src/shared/api/
apps/admin/src/shared/api/
```

- base URL, timeout, retry, header, 인증 토큰 주입 지점은 한 곳에서 조립합니다.
- client 액세스 토큰은 `localStorage`의 `accessToken`을 우선 사용하고, 로컬 개발에서만 `VITE_DEV_USER_ACCESS_TOKEN`을 fallback으로 사용할 수 있습니다.
- endpoint 함수는 `request` 같은 low-level helper를 사용합니다.
- endpoint 함수는 React, TanStack Query, route, UI state를 알면 안 됩니다.
- 인증, refresh, retry 정책은 실제 요구사항 없이 미리 복잡하게 만들지 않습니다.

## Error Handling Policy

`apps/client/src/shared/api`는 서버 response envelope와 HTTP 실패를 구분해
정규화합니다.

- `ApiError`는 유효한 서버 error envelope의 `code`, `message`, `errors`와 실제 HTTP status를 보존합니다.
- `HttpStatusError`는 proxy HTML 응답, 빈 응답, malformed body처럼 서버 error envelope가 없는 HTTP 실패의 status와 cause를 보존합니다.
- 외부 error code의 사용자 문구와 예상 status는 공통 error catalog에서 관리합니다.
- 실제 response status는 retry와 boundary 판단에 사용하며 catalog status로 덮어쓰지 않습니다.
- 미등록 code와 비JSON/malformed error body는 진단 정보를 보존하되, 사용자에게 임의의 서버 message를 직접 노출하지 않습니다.
- field-level error는 `ApiError.fieldErrors`와 문서화된 error code를 기준으로 page/form 가까이에서 매핑합니다.
- query는 5xx status error, network error, timeout만 최대 1회 retry합니다.
- blanket `throwOnError: true` 대신 status 기반 predicate를 사용해 5xx, network, timeout, 예상하지 못한 비-API 오류만 ErrorBoundary로 전달합니다.
- 예상 가능한 4xx query는 기본적으로 호출부의 local error state에 남깁니다.
- mutation은 retry하거나 render boundary로 throw하지 않고, 개별 `onError`가 없을 때 공통 toast를 fallback으로 사용합니다.
- mutation 오류는 공통 Sentry 필터를 거쳐 5xx status error, 405 integration error, 예상하지 못한 오류만 기록합니다.
- page/form이 field error, NotFound, Forbidden, conflict UX를 소유하면 query/mutation option에서 전역 기본값을 명시적으로 override합니다.
- ErrorBoundary가 소비한 오류는 공통 Sentry 필터를 거쳐 unknown/render error, 5xx status error, 405 integration error만 기록합니다.
- 인증 token refresh, request replay, logout은 error boundary가 아니라 별도 auth flow가 소유합니다.

route content용 `AsyncBoundary`는 `RootLayout` 내부에서 `Outlet`을 감싸며,
retry 시 React error state와 TanStack Query error state를 함께 reset합니다. 또한
pathname이 변경되면 이전 route에서 잡힌 error state를 reset합니다.

## API Integration Workflow

Swagger/OpenAPI 또는 API 스펙을 받아 퍼블리싱된 화면에 연결할 때는 다음 순서를 따릅니다.

OpenAPI 스키마에서 타입을 갱신할 때는 owning app별 script를 사용합니다.

```bash
pnpm gen:api-types
pnpm gen:admin-api-types
pnpm gen:admin-user-api-types
pnpm gen:admin-all-api-types
```

schema URL은 공개 문서에 직접 적지 않습니다. client는 `OPENAPI_SCHEMA_URL`, admin은 `ADMIN_OPENAPI_SCHEMA_URL`과 `USER_OPENAPI_SCHEMA_URL`을 owning app의 `.env.openapi.local` 또는 shell에 설정합니다. Swagger UI HTML URL은 입력으로 사용할 수 없습니다.

```bash
OPENAPI_SCHEMA_URL=http://localhost:8080/v3/api-docs pnpm gen:api-types
```

1. `api-spec-intake`로 endpoint와 UI 상태를 API Integration Map으로 정리합니다.
2. `api-integrator`로 endpoint, type, query key, query/mutation hook, cache synchronization을 구현합니다.
3. `verify-api-integration`으로 query key, query mode, cache synchronization, UI state, docs sync를 점검합니다.

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
Admin console endpoint boundary는 `apps/admin/src/shared/api`에 두고 client generated type을 import하지 않습니다.

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
- mutation hook은 `useQueryClient`로 성공 후 cache synchronization을 명시합니다.
- mutation이 완전한 최신 객체를 반환하고 같은 상세 화면에 즉시 반영해야 하면 `setQueryData`를 사용합니다.
- 저장 후 다른 화면으로 이동하거나, 응답이 일부 필드만 반환하거나, 목록 순서·개수·집계처럼 서버 계산 결과가 바뀌면 `invalidateQueries`를 사용합니다.
- 상세 즉시 반영과 목록 갱신이 모두 필요하면 상세 `setQueryData`와 목록 prefix invalidation을 함께 사용합니다.
- route가 바뀌어도 cache는 유지됩니다. 이동 후 최신 조회는 remount 자체가 아니라 invalidation으로 query가 stale해졌기 때문에 발생합니다.
- detail key가 하위 resource key의 prefix일 때 상세만 invalidation하려면 `exact: true`를 사용합니다.
- cache 접근은 query key factory로만 수행하며, 일반적인 mutation 성공 처리에 `resetQueries`나 `removeQueries`를 사용하지 않습니다.
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

- 한 앱에서만 쓰면 해당 앱 내부에 둡니다.
- `packages/hds-ui`는 API, query, mutation, route, tracking, product copy, domain data를 알면 안 됩니다.
- `packages/hds-icons`는 데이터 레이어와 무관해야 합니다.
- 여러 앱이나 패키지가 같은 API helper를 요구하게 되면 별도 shared package 도입을 검토합니다.
