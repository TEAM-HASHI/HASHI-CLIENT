# API Integration Workflow

Swagger/OpenAPI 문서와 API 스펙 문서를 받아 이미 퍼블리싱된 HASHI Client 화면에 API를 연결하는 기준입니다.

## Inputs

가능한 입력은 다음 순서로 신뢰합니다.

1. OpenAPI JSON/YAML
2. Swagger UI 또는 raw OpenAPI URL
3. 백엔드 API 스펙 문서
4. Jira/Figma/page spec의 화면 상태 설명
5. 기존 mock data와 퍼블리싱 코드

OpenAPI JSON/YAML이 있으면 다음 보조 스크립트로 endpoint 요약을 만들 수 있습니다.

```bash
node .agents/scripts/summarize-openapi.mjs <path-or-url>
```

OpenAPI 타입은 backend schema URL 또는 local schema file을 기준으로 생성합니다.

```bash
pnpm gen:api-types
```

로컬 backend schema를 사용해야 하면 `OPENAPI_SCHEMA_URL`로 덮어씁니다.

```bash
OPENAPI_SCHEMA_URL=http://localhost:8080/v3/api-docs pnpm gen:api-types
```

생성 결과는 `apps/client/src/shared/api/generated/openapi.ts`에 둡니다.

## Pipeline

1. `api-spec-intake`
   - endpoint, method, params, request body, response shape를 추출합니다.
   - query, infinite query, mutation을 분류합니다.
   - UI loading, error, empty, disabled, success 상태를 매핑합니다.
   - query key, enabled 조건, invalidation 후보를 정리합니다.
   - 누락 정보가 있으면 구현 전에 질문합니다.

2. `api-integrator`
   - page-local 또는 feature-local 위치를 결정합니다.
   - `apps/client/src/shared/api/generated/openapi.ts`의 OpenAPI type을 확인합니다.
   - endpoint 함수와 request/response type을 작성합니다.
   - query key factory를 작성합니다.
   - `queryOptions`, `mutationOptions`, query/mutation hook을 작성합니다.
   - 기존 퍼블리싱 UI 상태에 server state를 연결합니다.
   - page spec의 `Data Dependencies`와 `Verification`을 갱신합니다.

3. `verify-api-integration`
   - endpoint boundary, query key, query mode, invalidation, UI state, docs sync를 확인합니다.
   - 필요한 client lint, typecheck, test, build를 실행합니다.

## Placement

한 페이지에서만 쓰는 API 코드는 해당 page 아래에 둡니다.

```text
apps/client/src/pages/{page}/
  api/
  queries/
  mutations/
  hooks/
  types.ts
```

여러 페이지에서 같은 기능 흐름을 공유하면 feature로 승격합니다.

```text
apps/client/src/features/{feature}/
  api/
  queries/
  mutations/
  hooks/
  types.ts
```

`apps/client/src/shared/api`는 low-level HTTP client와 response/error 처리만 담당합니다.

## Query Mode Defaults

`useSuspenseQuery`를 우선 검토합니다.

사용 조건:

- 페이지 진입에 필수 데이터입니다.
- route/page Suspense fallback으로 충분합니다.
- `enabled`나 `placeholderData`가 필요 없습니다.
- 여러 독립 query로 인한 waterfall 위험이 없습니다.

`useQuery`를 선택하는 조건:

- 조건부 실행이 필요합니다.
- 검색, 필터, 탭, form state가 fetch를 제어합니다.
- 이전 데이터 유지, placeholder, local loading/error UI가 필요합니다.
- 수동 refetch가 interaction의 일부입니다.

무한 리스트는 `useInfiniteQuery`를 기본으로 사용합니다.
초기 첫 페이지가 Suspense fallback으로 처리되어야 할 때만 `useSuspenseInfiniteQuery`를 검토합니다.

## Done Criteria

- Swagger/API spec과 TypeScript 타입이 설명 가능한 수준으로 일치합니다.
- query key factory가 있고 inline query key가 없습니다.
- response를 바꾸는 params가 query key에 포함됩니다.
- mutation 성공 후 stale한 list/detail/infinite query가 invalidated 됩니다.
- loading, error, empty, disabled, success 상태가 UI에 연결됩니다.
- endpoint 함수가 React Query, route, UI state를 알지 않습니다.
- 필요한 page spec과 data-layer 문서가 최신 상태입니다.
