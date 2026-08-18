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

OpenAPI 타입은 backend schema URL 또는 local schema file을 기준으로 owning app마다 생성합니다.

```bash
pnpm gen:api-types
pnpm gen:admin-api-types
pnpm gen:admin-user-api-types
pnpm gen:admin-all-api-types
```

schema URL은 공개 문서에 직접 적지 않습니다. client는 `OPENAPI_SCHEMA_URL`, admin은 `ADMIN_OPENAPI_SCHEMA_URL`과 `USER_OPENAPI_SCHEMA_URL`을 `apps/*/.env.openapi.local` 또는 shell에 설정합니다.

```bash
OPENAPI_SCHEMA_URL=http://localhost:8080/v3/api-docs pnpm gen:api-types
```

생성 결과는 owning app에 분리합니다.

| App                 | Command                         | Output                                                |
| ------------------- | ------------------------------- | ----------------------------------------------------- |
| Client              | `pnpm gen:api-types`            | `apps/client/src/shared/api/generated/openapi.ts`     |
| Admin write         | `pnpm gen:admin-api-types`      | `apps/admin/src/shared/api/generated/openapi.ts`      |
| Admin public/upload | `pnpm gen:admin-user-api-types` | `apps/admin/src/shared/api/generated/user-openapi.ts` |

한 앱의 schema로 다른 앱의 generated output을 덮어쓰거나 cross-import하지 않습니다.

## Pipeline

1. `api-spec-intake`
   - endpoint, method, params, request body, response shape를 추출합니다.
   - query, infinite query, mutation을 분류합니다.
   - UI loading, error, empty, disabled, success 상태를 매핑합니다.
   - query key, enabled 조건, mutation cache synchronization 후보를 정리합니다.
   - 누락 정보가 있으면 구현 전에 질문합니다.

2. `api-integrator`
   - page-local 또는 feature-local 위치를 결정합니다.
   - owning app의 `src/shared/api/generated/openapi.ts` OpenAPI type을 확인합니다.
   - endpoint 함수와 request/response type을 작성합니다.
   - query key factory를 작성합니다.
   - `queryOptions`, `mutationOptions`, query/mutation hook을 작성합니다.
   - mutation 응답과 이동 흐름에 따라 `setQueryData`, invalidation, 또는 혼합 방식을 선택합니다.
   - 기존 퍼블리싱 UI 상태에 server state와 API error state를 연결합니다.
   - page spec의 `Data Dependencies`와 `Verification`을 갱신합니다.

3. `verify-api-integration`
   - endpoint boundary, query key, query mode, cache synchronization, UI state, docs sync를 확인합니다.
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

여러 페이지가 page 전용 의존성 없이 같은 기능 흐름을 공유하면 feature로 승격합니다.

```text
apps/client/src/features/{feature}/
  api/
  queries/
  mutations/
  hooks/
  types.ts
```

위치 판단은 다음 기준을 따릅니다.

- 특정 page의 화면 진입, 제출, page draft/view model에 묶인 API는 page-local로 둡니다.
- page 전용 의존성을 제거해도 API 계약이 유지되고, 여러 page가 같은 endpoint, 같은 query key, 같은 cache synchronization 기준을 공유하면 feature로 둡니다.
- `shared/api`에는 endpoint 함수를 두지 않고 request wrapper, error model, generated OpenAPI type 같은 공통 인프라만 둡니다.
- 재사용 가능성이 있어 보인다는 이유만으로 feature로 미리 올리지 않습니다.
- 실제로 두 번째 사용처가 생기거나 cache/invalidation 기준을 공유해야 할 때 feature로 승격합니다.
- 애매한 경우에는 page-local에서 시작하고, page spec 또는 PR에 feature 승격 조건을 남깁니다.

예시:

- Home 전용 SNS 인기 식당 adapter는 `pages/home/api`에 둡니다.
- 검색, 하시픽, 인기 식당이 공유하는 식당 목록 조회는 `features/restaurantList/api`에 둡니다.
- Home과 Magazines가 공유하는 매거진 배너 조회는 `features/magazine/api`에 둡니다.
- 프로필 생성 온보딩처럼 특정 route의 제출 흐름에 묶인 API는 `pages/profileNew/api`에 둡니다.
- 내 리뷰 목록/상세 조회처럼 삭제/수정/작성 후 같은 query key와 cache synchronization 기준을 공유하는 리뷰 API는 `features/review`에 둡니다.
- 리뷰 작성 context, 이미지 업로드, 제출 adapter처럼 `reviewNew` page 전용 흐름에 묶인 API는 다른 리뷰 page와 공유되기 전까지 page-local에 둡니다.

`apps/client/src/shared/api`는 low-level HTTP client와 response/error 처리만 담당합니다.
Admin console API boundary는 `apps/admin/src/shared/api`에서 같은 원칙을 따릅니다.

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
- 완전한 최신 객체를 같은 상세 화면에 즉시 반영할 때는 `setQueryData`를 사용합니다.
- 이동 후 조회, 일부 응답, 목록 순서·개수·집계 변경은 관련 query prefix를 invalidation합니다.
- 상세 cache와 목록 cache가 함께 바뀌면 `setQueryData`와 invalidation을 혼합합니다.
- detail만 invalidation하고 하위 key는 유지해야 하면 `exact: true`를 사용합니다.
- loading, error, empty, disabled, success 상태가 UI에 연결됩니다.
- API error는 `ApiError`/`HttpStatusError`의 `status`, 서버 `code`, `fieldErrors` 중 필요한 기준으로 분류됩니다.
- validation, auth, not found, conflict, upload error는 자동 retry나 전역 boundary로 올리지 않고 page/form/local UI에서 처리합니다.
- 5xx, timeout, network error만 query retry 후보로 둡니다.
- endpoint 함수가 React Query, route, UI state를 알지 않습니다.
- 필요한 page spec과 data-layer 문서가 최신 상태입니다.
